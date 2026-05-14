import { error } from '@sveltejs/kit';
import { ROUTE_MAP } from '$lib/i18n/route-map.js';
import type { Lang, PageKey } from '$lib/i18n/route-map.js';

/**
 * Throws 404 if `lang` does not match the expected slug for `pageKey`.
 *
 * SvelteKit cannot disambiguate two sibling `[lang=lang]/<slug>/` folders by
 * lang value at the routing level, so both the `load` function (via
 * `makeFormLoad`) and the form action handlers (`contactAction`,
 * `orderAction`) call this to reject requests where the slug doesn't belong
 * to the given lang. Without the action-side check, a crafted POST to a
 * wrong-language slug would arrive in analytics under the wrong language.
 *
 * @param lang - Language from route params
 * @param pageKey - Page key to look up in ROUTE_MAP
 * @param slug - Slug segment as it appears in the URL (last path segment)
 */
export function assertLangForSlug(lang: string, pageKey: PageKey, slug: string): void {
  const expectedPath = ROUTE_MAP[pageKey][lang as Lang];
  if (!expectedPath) {
    error(404, { message: 'Not found', code: 'LANG_NOT_FOUND' });
  }
  const expectedSlug = expectedPath.split('/').pop();
  if (expectedSlug !== slug) {
    error(404, { message: 'Not found', code: 'SLUG_LANG_MISMATCH' });
  }
}
