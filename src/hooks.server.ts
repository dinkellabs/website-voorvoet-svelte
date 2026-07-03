import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import logger, { withRequestId } from '$lib/server/logger.js';
import { trackEvent } from '$lib/server/umami.js';
import { overwriteServerAsyncLocalStorage } from '$lib/paraglide/runtime.js';
import { PRODUCTION_HOSTNAMES } from '$lib/server/config.js';

// ─── Paraglide SSR locale ─────────────────────────────────────────────────────
//
// Paraglide reads the locale from this AsyncLocalStorage when rendering
// messages on the server. Without it, message functions fall back to the base
// locale (nl), causing /de and /en routes to serve Dutch HTML to crawlers.

const paraglideAls = new AsyncLocalStorage<{
  locale?: 'nl' | 'de' | 'en';
  origin?: string;
  messageCalls?: Set<string>;
}>();
overwriteServerAsyncLocalStorage(paraglideAls);

// ─── Legacy redirects ────────────────────────────────────────────────────────

const LEGACY_REDIRECTS: Record<string, string> = {
  '/': '/nl',
  '/informatie': '/nl/informatie',
  '/vergoedingen': '/nl/vergoedingen',
  '/contact': '/nl/contact',
  '/zolen-bestellen': '/nl/zolen-bestellen',
  '/credits': '/nl/credits',
  '/blog': '/nl/blog',
  // Pre-migration URLs still in Google's index (Search Console, July 2026).
  // Old English pages carried an "-english" suffix; old blog posts lived
  // under /podotherapie/. Retired content without an equivalent page is
  // deliberately absent — a 404 is the correct signal for it.
  '/en/information-english': '/en/information',
  '/en/contact-english': '/en/contact',
  '/en/extra-zolen-english': '/en/order-insoles',
  '/podotherapie/podotherapeut-of-podoloog-enschede': '/nl/blog/podotherapeut-of-podoloog',
};

const SKIP_TRACKING_PREFIXES = ['/health', '/sitemap.xml', '/robots.txt', '/csp-report'];

function safeReferrerHost(referrer: string | undefined): string {
  if (!referrer) return '';
  try {
    return new URL(referrer).hostname;
  } catch {
    return '';
  }
}

// ─── Boot-time guards ────────────────────────────────────────────────────────

// Same hostname-based gate as cap.ts (see comment there). Duplicated rather
// than shared because the two call sites diverge: this one warns, cap.ts
// throws.
function isRealProductionHost(): boolean {
  if (building) return false;
  const siteUrl = pubEnv.PUBLIC_SITE_URL;
  if (!siteUrl) return true;
  try {
    return (PRODUCTION_HOSTNAMES as readonly string[]).includes(new URL(siteUrl).hostname);
  } catch {
    return true;
  }
}

if (isRealProductionHost()) {
  const capEnabled = (env.CAP_ENABLED ?? 'false').toLowerCase() === 'true';
  if (!capEnabled) {
    logger.warn('CAP_ENABLED is not "true" in production — forms are unprotected against bots.');
  }
}

// ─── CSP ─────────────────────────────────────────────────────────────────────

// The base CSP (with auto-computed hashes for SvelteKit's inline scripts) is
// set by SvelteKit itself via `kit.csp.directives` in svelte.config.js. We only
// append origins that depend on runtime env vars (Umami's URLs) by editing the
// header SvelteKit already wrote.
function appendUmamiToCsp(existing: string): string {
  const umamiScriptOrigin = pubEnv.PUBLIC_UMAMI_SCRIPT_URL
    ? new URL(pubEnv.PUBLIC_UMAMI_SCRIPT_URL).origin
    : null;
  const umamiApiOrigin = env.UMAMI_API_URL ? new URL(env.UMAMI_API_URL).origin : null;

  if (!umamiScriptOrigin && !umamiApiOrigin) return existing;

  const scriptAdditions = umamiScriptOrigin ? ` ${umamiScriptOrigin}` : '';
  const connectAdditions = [...new Set([umamiScriptOrigin, umamiApiOrigin].filter(Boolean))].join(
    ' ',
  );

  let updated = existing;
  if (scriptAdditions) {
    updated = updated.replace(
      /script-src ([^;]+)/,
      (_, srcs) => `script-src ${srcs}${scriptAdditions}`,
    );
  }
  if (connectAdditions) {
    updated = updated.replace(
      /connect-src ([^;]+)/,
      (_, srcs) => `connect-src ${srcs} ${connectAdditions}`,
    );
  }
  return updated;
}

// ─── Handle ───────────────────────────────────────────────────────────────────

export const handle: Handle = async ({ event, resolve }) => {
  // If the upstream reverse proxy stamps X-Request-Id, reuse it so its access
  // log and our pino logs share a correlation ID. Otherwise mint a UUID here.
  const inboundRequestId = event.request.headers.get('x-request-id');
  const requestId =
    inboundRequestId && /^[\w-]{1,128}$/.test(inboundRequestId) ? inboundRequestId : randomUUID();
  event.locals.requestId = requestId;

  const { pathname } = event.url;

  // Skip logging + tracking overhead for the docker healthcheck loop.
  if (pathname === '/health') {
    return resolve(event);
  }

  const log = withRequestId(requestId);

  log.info({ method: event.request.method, path: pathname }, 'incoming request');

  const legacyTarget = LEGACY_REDIRECTS[pathname];
  if (legacyTarget) {
    if (env.UMAMI_API_URL && !pubEnv.PUBLIC_UMAMI_SCRIPT_URL) {
      const userAgent = event.request.headers.get('user-agent') ?? '';
      const referrer = event.request.headers.get('referer') ?? undefined;
      const referrerHost = safeReferrerHost(referrer);
      void trackEvent({
        name: 'legacy_redirect',
        url: pathname,
        hostname: event.url.hostname,
        language: 'nl',
        referrer,
        userAgent,
        ip: event.getClientAddress(),
        data: { from_path: pathname, to_path: legacyTarget, referrer_host: referrerHost },
      }).catch(() => {});
    }
    throw redirect(308, legacyTarget);
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    const stripped = pathname.slice(0, -1);
    const qs = event.url.search;
    throw redirect(308, stripped + qs);
  }

  const langSegment = pathname.split('/')[1];
  const lang = langSegment === 'de' || langSegment === 'en' ? langSegment : 'nl';

  const response = await paraglideAls.run({ locale: lang, origin: event.url.origin }, () =>
    resolve(event, {
      transformPageChunk: ({ html }) => html.replaceAll('%lang%', lang),
    }),
  );

  const contentType = response.headers.get('content-type') ?? '';
  const isHtml = contentType.includes('text/html');

  if (isHtml) {
    // SvelteKit set a CSP via `kit.csp.directives` (svelte.config.js) which
    // already includes SHA-256 hashes for its inline hydration scripts.
    // Append runtime-only origins (Umami) here.
    const existingCsp = response.headers.get('Content-Security-Policy');
    if (existingCsp) {
      response.headers.set('Content-Security-Policy', appendUmamiToCsp(existingCsp));
    }
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    );
  }

  // ─── Server-side Umami tracking ─────────────────────────────────────────
  //
  // Only fire when no client-side Umami script is configured — otherwise we
  // double-count pageviews. If both are set we prefer the client-side script
  // because it captures SPA navigations the server can't see.

  const clientSideUmamiActive = !!pubEnv.PUBLIC_UMAMI_SCRIPT_URL;

  const shouldTrack =
    !clientSideUmamiActive &&
    response.status >= 200 &&
    response.status < 300 &&
    response.status !== 204 &&
    !SKIP_TRACKING_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (shouldTrack && isHtml) {
    const umamiApiUrl = env.UMAMI_API_URL;
    if (umamiApiUrl) {
      const userAgent = event.request.headers.get('user-agent') ?? '';
      const referrer = event.request.headers.get('referer') ?? undefined;
      const ip = event.getClientAddress();

      void trackEvent({
        url: pathname,
        hostname: event.url.hostname,
        language: lang,
        referrer,
        userAgent,
        ip,
      }).catch(() => {});
    }
  }

  // 404 tracking: capture broken links and crawl errors. Skipped when the
  // client-side script is active (it tracks 404s separately) and for the
  // skip-prefix routes.
  if (
    !clientSideUmamiActive &&
    response.status === 404 &&
    isHtml &&
    !SKIP_TRACKING_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const umamiApiUrl = env.UMAMI_API_URL;
    if (umamiApiUrl) {
      const userAgent = event.request.headers.get('user-agent') ?? '';
      const referrer = event.request.headers.get('referer') ?? undefined;
      void trackEvent({
        name: '404',
        url: pathname,
        hostname: event.url.hostname,
        language: lang,
        referrer,
        userAgent,
        ip: event.getClientAddress(),
        data: { referrer_host: safeReferrerHost(referrer) },
      }).catch(() => {});
    }
  }

  response.headers.set('X-Request-ID', requestId);

  log.info({ status: response.status, path: pathname }, 'response sent');

  return response;
};

export const handleError: HandleServerError = ({ error, event, status, message }) => {
  const requestId = event.locals.requestId ?? 'no-request-id';
  const log = withRequestId(requestId);
  log.error({ err: error, status, path: event.url.pathname }, 'unhandled server error');
  return { message: message ?? 'Internal Server Error' };
};
