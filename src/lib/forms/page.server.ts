import type { Action, ServerLoadEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { langFromParams, routeFor, type PageKey } from '$lib/i18n/route-map.js';
import { PAGE_TITLES } from '$lib/i18n/page-meta.js';
import { assertLangForSlug } from '$lib/forms/assert-lang.js';
import { buildMeta } from '$lib/server/seo/meta.js';
import { buildAlternates } from '$lib/server/seo/alternates.js';
import { getOrderPairPricing } from '$lib/data/reimbursements.server.js';
import { podiatristLD, breadcrumbListLD } from '$lib/seo/structured-data.js';

interface FormPageOptions {
  pageKey: PageKey;
  slug: string;
  // superforms accepts any zod-shaped schema; the route stays the source of
  // truth for the concrete schema type via the +page.svelte cast.
  schema: Parameters<typeof zod>[0];
}

export function makeFormLoad({ pageKey, slug, schema }: FormPageOptions) {
  return async (event: ServerLoadEvent) => {
    const { params, url } = event;
    assertLangForSlug(params.lang ?? '', pageKey, slug);

    const lang = langFromParams(params);
    const form = await superValidate(zod(schema));

    const siteUrl = (env.SITE_URL ?? 'https://voorvoet.nl').replace(/\/$/, '');

    const base = {
      form,
      meta: buildMeta({ pageKey, lang, url: url.href }),
      alternates: buildAlternates(pageKey),
      structuredData: [
        podiatristLD(),
        breadcrumbListLD([
          { name: PAGE_TITLES[lang].home, url: `${siteUrl}${routeFor('home', lang)}` },
          { name: PAGE_TITLES[lang][pageKey], url: `${siteUrl}${routeFor(pageKey, lang)}` },
        ]),
      ],
    };

    if (pageKey === 'order_insoles') {
      return { ...base, orderPricing: getOrderPairPricing() };
    }

    return base;
  };
}

export function makeFormActions(action: Action) {
  return { default: action };
}
