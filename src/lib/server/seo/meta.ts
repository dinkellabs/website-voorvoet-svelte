import type { Lang, PageKey } from '$lib/i18n/route-map.js';
import { PAGE_TITLES, PAGE_DESCRIPTIONS, PAGE_IMAGES } from '$lib/i18n/page-meta.js';
import { LOCALE_MAP } from '$lib/i18n/locale-map.js';
import { env } from '$env/dynamic/private';

export type Meta = {
  title: string;
  description: string;
  canonical: string;
  og: {
    title: string;
    description: string;
    image: string;
    locale: string;
    type: string;
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
};

/**
 * Builds the full meta payload consumed by the 2A layout.
 *
 * @param params.pageKey - Page key to look up titles/descriptions
 * @param params.lang - Language for locale-specific values
 * @param params.url - Canonical URL for this page
 */
export function buildMeta({
  pageKey,
  lang,
  url,
}: {
  pageKey: PageKey;
  lang: Lang;
  url: string;
}): Meta {
  const siteUrl = env.SITE_URL ?? 'https://voorvoet.nl';

  const title = PAGE_TITLES[lang][pageKey];
  const description = PAGE_DESCRIPTIONS[lang][pageKey];
  const imagePath = PAGE_IMAGES[pageKey];
  const image = imagePath.startsWith('http') ? imagePath : `${siteUrl}${imagePath}`;
  const locale = LOCALE_MAP[lang];

  return {
    title,
    description,
    canonical: url,
    og: {
      title,
      description,
      image,
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image,
    },
  };
}
