import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import logger, { withRequestId } from '$lib/server/logger.js';
import { trackEvent } from '$lib/server/umami.js';

// ─── Legacy redirects ────────────────────────────────────────────────────────

const LEGACY_REDIRECTS: Record<string, string> = {
  '/': '/nl',
  '/informatie': '/nl/informatie',
  '/vergoedingen': '/nl/vergoedingen',
  '/contact': '/nl/contact',
  '/zolen-bestellen': '/nl/zolen-bestellen',
  '/credits': '/nl/credits',
  '/blog': '/nl/blog',
};

const SKIP_TRACKING_PREFIXES = ['/health', '/sitemap.xml', '/robots.txt', '/csp-report'];

// ─── Boot-time guards ────────────────────────────────────────────────────────

if (!dev) {
  const turnstileEnabled = (env.TURNSTILE_ENABLED ?? 'false').toLowerCase() === 'true';
  if (!turnstileEnabled) {
    logger.warn(
      'TURNSTILE_ENABLED is not "true" in production — forms are unprotected against bots.',
    );
  }
}

// ─── CSP ─────────────────────────────────────────────────────────────────────

function buildCsp(): string {
  const umamiScriptOrigin = pubEnv.PUBLIC_UMAMI_SCRIPT_URL
    ? new URL(pubEnv.PUBLIC_UMAMI_SCRIPT_URL).origin
    : null;

  const umamiApiOrigin = env.UMAMI_API_URL ? new URL(env.UMAMI_API_URL).origin : null;

  const turnstileOrigin = 'https://challenges.cloudflare.com';
  const googleMapsOrigin = 'https://www.google.com';

  const scriptSrc = [
    "'self'",
    turnstileOrigin,
    ...(umamiScriptOrigin ? [umamiScriptOrigin] : []),
  ].join(' ');

  const connectSrc = [
    "'self'",
    turnstileOrigin,
    ...(umamiApiOrigin ? [umamiApiOrigin] : []),
    ...(umamiScriptOrigin ? [umamiScriptOrigin] : []),
  ].join(' ');

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    `connect-src ${connectSrc}`,
    `frame-src ${turnstileOrigin} ${googleMapsOrigin}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'report-uri /csp-report',
  ];

  return directives.join('; ');
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
    throw redirect(308, legacyTarget);
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    const stripped = pathname.slice(0, -1);
    const qs = event.url.search;
    throw redirect(308, stripped + qs);
  }

  const langSegment = pathname.split('/')[1];
  const lang = langSegment === 'de' || langSegment === 'en' ? langSegment : 'nl';

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replaceAll('%lang%', lang),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isHtml = contentType.includes('text/html');

  if (isHtml) {
    response.headers.set('Content-Security-Policy', buildCsp());
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
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
        name: 'pageview',
        url: pathname,
        hostname: event.url.hostname,
        language: lang,
        referrer,
        userAgent,
        ip,
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
