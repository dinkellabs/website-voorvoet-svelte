import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import type { PageKey, Lang } from '$lib/i18n/route-map.js';
import { pageKeyForPath } from '$lib/i18n/route-map.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = ({ url, params }) => {
  // Root layout runs for paths without a [lang=lang] match (e.g. /sitemap.xml,
  // /health). Fall back to 'nl' rather than throw via langFromParams.
  const langParam = params.lang;
  const lang: Lang =
    langParam === 'nl' || langParam === 'de' || langParam === 'en' ? langParam : 'nl';
  const currentPath = url.pathname;

  const resolved = pageKeyForPath(currentPath);
  const pageKey: PageKey | null = resolved?.page ?? null;

  const result: {
    lang: Lang;
    pageKey: PageKey | null;
    currentPath: string;
    umamiScriptUrl?: string;
    umamiWebsiteId?: string;
    planPortalUrl?: string;
  } = {
    lang,
    pageKey,
    currentPath,
  };

  if (env.PUBLIC_UMAMI_SCRIPT_URL) {
    result.umamiScriptUrl = env.PUBLIC_UMAMI_SCRIPT_URL;
    if (env.PUBLIC_UMAMI_WEBSITE_ID) {
      result.umamiWebsiteId = env.PUBLIC_UMAMI_WEBSITE_ID;
    }
  }

  if (privateEnv.LINK_PLAN_PORTAL) {
    result.planPortalUrl = privateEnv.LINK_PLAN_PORTAL;
  }

  return result;
};
