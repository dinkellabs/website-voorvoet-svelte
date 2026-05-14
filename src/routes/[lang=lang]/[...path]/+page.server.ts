import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import type { PageKey } from '$lib/i18n/route-map.js';
import { langFromParams, pageKeyForPath } from '$lib/i18n/route-map.js';
import { buildMeta } from '$lib/server/seo/meta.js';
import { buildAlternates } from '$lib/server/seo/alternates.js';
import { loadLegal } from '$lib/legal/loader.js';
import { getPricing } from '$lib/data/reimbursements.js';

const FORM_KEYS: PageKey[] = ['contact', 'order_insoles'];
const SKIP_KEYS: PageKey[] = [...FORM_KEYS, 'blog', 'home'];

export const load: PageServerLoad = async ({ params, url }) => {
  const lang = langFromParams(params);
  const fullPath = `/${lang}/${params.path}`.replace(/\/$/, '') || `/${lang}`;

  const resolved = pageKeyForPath(fullPath);
  if (!resolved) {
    error(404, `Page not found: ${fullPath}`);
  }

  const { page: pageKey } = resolved;

  if (SKIP_KEYS.includes(pageKey)) {
    error(404, `Route handled elsewhere: ${pageKey}`);
  }

  const meta = buildMeta({ pageKey, lang, url: url.href });
  const alternates = buildAlternates(pageKey);

  const base = { pageKey, lang, meta, alternates };

  if (pageKey === 'reimbursements') {
    const pricing = getPricing();
    return { ...base, pricing };
  }

  if (pageKey === 'privacy_policy') {
    const legalDoc = loadLegal(lang, 'privacy_policy');
    return { ...base, legalDoc };
  }

  if (pageKey === 'terms_conditions') {
    const legalDoc = loadLegal(lang, 'terms_conditions');
    return { ...base, legalDoc };
  }

  return base;
};
