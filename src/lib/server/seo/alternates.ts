import type { PageKey } from '$lib/i18n/route-map.js';
import { LANGS, routeFor } from '$lib/i18n/route-map.js';
import { env } from '$env/dynamic/private';

/**
 * Builds the hreflang alternate links for a page.
 *
 * Includes all 3 language variants plus `x-default` pointing to nl.
 */
export function buildAlternates(pageKey: PageKey): Array<{ lang: string; href: string }> {
  const siteUrl = env.SITE_URL ?? 'https://voorvoet.nl';

  const alternates: Array<{ lang: string; href: string }> = LANGS.map((l) => ({
    lang: l,
    href: `${siteUrl}${routeFor(pageKey, l)}`,
  }));

  alternates.push({
    lang: 'x-default',
    href: `${siteUrl}${routeFor(pageKey, 'nl')}`,
  });

  return alternates;
}
