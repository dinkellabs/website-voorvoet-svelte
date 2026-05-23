import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { routeFor } from '$lib/i18n/route-map.js';
import { trackEvent } from '$lib/server/umami.js';
import type { RequestHandler } from './$types.js';

/**
 * Server-proxied click tracker for the appointment-portal CTA.
 *
 * Hitting /go/plan emits a `plan_portal_click` Umami event (server-side, so
 * no client JS is needed for the metric), then 302-redirects to
 * LINK_PLAN_PORTAL. Falls back to the localized contact page when the env
 * var is missing.
 */
export const GET: RequestHandler = (event) => {
  const planPortalUrl = env.LINK_PLAN_PORTAL;
  const langParam = event.url.searchParams.get('lang');
  const lang: 'nl' | 'de' | 'en' =
    langParam === 'de' || langParam === 'en' ? langParam : 'nl';

  const target = planPortalUrl || `${event.url.origin}${routeFor('contact', lang)}`;

  if (env.UMAMI_API_URL) {
    const referrer = event.request.headers.get('referer') ?? undefined;
    let referrerHost = '';
    if (referrer) {
      try {
        referrerHost = new URL(referrer).hostname;
      } catch {
        referrerHost = '';
      }
    }

    void trackEvent({
      name: 'plan_portal_click',
      url: '/go/plan',
      hostname: event.url.hostname,
      language: lang,
      referrer,
      userAgent: event.request.headers.get('user-agent') ?? '',
      ip: event.getClientAddress(),
      data: { lang, referrer_host: referrerHost, has_portal: planPortalUrl ? 'true' : 'false' },
    }).catch(() => {});
  }

  redirect(302, target);
};
