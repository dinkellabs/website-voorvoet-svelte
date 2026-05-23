import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types.js';
import type { PageKey } from '$lib/i18n/route-map.js';
import { langFromParams, pageKeyForPath, routeFor } from '$lib/i18n/route-map.js';
import { PAGE_TITLES } from '$lib/i18n/page-meta.js';
import { buildMeta } from '$lib/server/seo/meta.js';
import { buildAlternates } from '$lib/server/seo/alternates.js';
import { loadLegal } from '$lib/legal/loader.js';
import { getPricing, getReimbursements } from '$lib/data/reimbursements.server.js';
import { podiatristLD, breadcrumbListLD, faqPageLD } from '$lib/seo/structured-data.js';
import * as m from '$lib/paraglide/messages.js';

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

  const siteUrl = (env.SITE_URL ?? 'https://voorvoet.nl').replace(/\/$/, '');
  const homeTitle = PAGE_TITLES[lang].home;
  const pageTitle = PAGE_TITLES[lang][pageKey];

  const structuredData: Array<Record<string, unknown>> = [
    podiatristLD(),
    breadcrumbListLD([
      { name: homeTitle, url: `${siteUrl}${routeFor('home', lang)}` },
      { name: pageTitle, url: `${siteUrl}${routeFor(pageKey, lang)}` },
    ]),
  ];

  if (pageKey === 'information') {
    structuredData.push(
      faqPageLD([
        { question: m.info_what_title({}, { locale: lang }), answer: m.info_what_p1({}, { locale: lang }) },
        {
          question: m.info_everyone_title({}, { locale: lang }),
          answer: m.info_everyone_intro({}, { locale: lang }),
        },
        {
          question: m.info_children_title({}, { locale: lang }),
          answer: m.info_children_intro({}, { locale: lang }),
        },
        {
          question: m.info_athletes_title({}, { locale: lang }),
          answer: m.info_athletes_intro({}, { locale: lang }),
        },
      ]),
    );
  }

  const base = { pageKey, lang, meta, alternates, structuredData };

  if (pageKey === 'reimbursements') {
    const reimbursements = getReimbursements();
    const pricing = getPricing();
    return { ...base, reimbursements, pricing };
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
