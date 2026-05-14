import type { PageServerLoad } from './$types.js';
import { langFromParams } from '$lib/i18n/route-map.js';
import { buildMeta } from '$lib/server/seo/meta.js';
import { buildAlternates } from '$lib/server/seo/alternates.js';
import { organizationLD, podiatristLD } from '$lib/seo/structured-data.js';

export const load: PageServerLoad = ({ params, url }) => {
  const lang = langFromParams(params);

  const meta = buildMeta({ pageKey: 'home', lang, url: url.href });
  const alternates = buildAlternates('home');
  const structuredData = [organizationLD(), podiatristLD()];

  return { meta, alternates, structuredData };
};
