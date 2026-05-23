import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ROUTE_MAP } from '$lib/i18n/route-map.js';
import type { PageKey, Lang } from '$lib/i18n/route-map.js';

const LANGS: Lang[] = ['nl', 'de', 'en'];

const PAGE_PRIORITIES: Record<PageKey, string> = {
  home: '1.0',
  blog: '0.8',
  information: '0.6',
  reimbursements: '0.6',
  contact: '0.6',
  order_insoles: '0.6',
  credits: '0.6',
  privacy_policy: '0.6',
  terms_conditions: '0.6',
};

const PAGE_CHANGEFREQS: Record<PageKey, string> = {
  home: 'weekly',
  blog: 'weekly',
  information: 'monthly',
  reimbursements: 'monthly',
  contact: 'monthly',
  order_insoles: 'monthly',
  credits: 'monthly',
  privacy_policy: 'monthly',
  terms_conditions: 'monthly',
};

function buildAlternateLinks(siteUrl: string, paths: Record<Lang, string>): string {
  return LANGS.map(
    (l) => `      <xhtml:link rel="alternate" hreflang="${l}" href="${siteUrl}${paths[l]}"/>`,
  )
    .concat(
      `      <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${paths['nl']}"/>`,
    )
    .join('\n');
}

function buildUrl(
  siteUrl: string,
  loc: string,
  alternates: string,
  priority: string,
  changefreq: string,
): string {
  return `  <url>
    <loc>${siteUrl}${loc}</loc>
${alternates}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: RequestHandler = async () => {
  const siteUrl = (env.SITE_URL ?? 'https://voorvoet.nl').replace(/\/$/, '');

  const staticPages = (Object.keys(ROUTE_MAP) as PageKey[]).flatMap((pageKey) => {
    const paths = ROUTE_MAP[pageKey];
    const alternatesStr = buildAlternateLinks(siteUrl, paths);

    return LANGS.map((lang) =>
      buildUrl(
        siteUrl,
        paths[lang],
        alternatesStr,
        PAGE_PRIORITIES[pageKey],
        PAGE_CHANGEFREQS[pageKey],
      ),
    );
  });

  let blogUrls: string[] = [];

  try {
    const blogLoader = await import('$lib/blog/loader');
    const { getPostsByLang, getTranslations } = blogLoader;

    const nlPosts = getPostsByLang('nl');

    blogUrls = nlPosts.flatMap((post) => {
      const translations = getTranslations(post);

      return LANGS.flatMap((lang) => {
        const translatedPost = translations[lang];
        if (!translatedPost) return [];

        const postPath = `/${lang}/blog/${translatedPost.slug}`;

        const altLinks = LANGS.flatMap((altLang) => {
          const altPost = translations[altLang];
          if (!altPost) return [];
          return [
            `      <xhtml:link rel="alternate" hreflang="${altLang}" href="${siteUrl}/${altLang}/blog/${altPost.slug}"/>`,
          ];
        })
          .concat([
            `      <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/nl/blog/${post.slug}"/>`,
          ])
          .join('\n');

        return [buildUrl(siteUrl, postPath, altLinks, '0.7', 'monthly')];
      });
    });
  } catch {
    // Blog loader not available — blog posts omitted from sitemap
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticPages, ...blogUrls].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
