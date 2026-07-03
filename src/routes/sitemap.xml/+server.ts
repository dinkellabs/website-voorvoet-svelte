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
  lastmod?: string,
): string {
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>
    <loc>${siteUrl}${loc}</loc>
${alternates}${lastmodLine}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function isoDate(input: string | Date): string {
  if (typeof input === 'string') {
    return input.length >= 10 ? input.slice(0, 10) : new Date(input).toISOString().slice(0, 10);
  }
  return input.toISOString().slice(0, 10);
}

export const GET: RequestHandler = async () => {
  const siteUrl = (env.SITE_URL ?? 'https://voorvoet.nl').replace(/\/$/, '');

  // Static pages get no <lastmod>: stamping them with "today" on every crawl
  // tells Google everything changed constantly, so it ignores lastmod entirely
  // — including the accurate blog-post dates below.
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
        const lastmod = translatedPost.date ? isoDate(translatedPost.date) : undefined;

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

        return [buildUrl(siteUrl, postPath, altLinks, '0.7', 'monthly', lastmod)];
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
