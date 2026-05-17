import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types.js';
import { langFromParams, routeFor } from '$lib/i18n/route-map.js';
import { getPostsByLang } from '$lib/blog/loader.js';
import { buildMeta } from '$lib/server/seo/meta.js';
import { buildAlternates } from '$lib/server/seo/alternates.js';

const POSTS_PER_PAGE = 6;

export const load: PageServerLoad = ({ params, url }) => {
  const lang = langFromParams(params);
  const posts = getPostsByLang(lang);

  const pageParam = url.searchParams.get('page');
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  if (pageParam && currentPage !== safePage) {
    const blogBase = routeFor('blog', lang);
    const target = safePage > 1 ? `${blogBase}?page=${safePage}` : blogBase;
    throw redirect(308, target);
  }

  const start = (safePage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  const blogBase = routeFor('blog', lang);
  const siteUrl = env.SITE_URL ?? 'https://voorvoet.nl';
  const canonical = `${siteUrl}${blogBase}${safePage > 1 ? `?page=${safePage}` : ''}`;

  // Use buildMeta to inherit og:image (blog preview), og:locale, twitter
  // tags etc., then override canonical to keep the pagination query string.
  const baseMeta = buildMeta({ pageKey: 'blog', lang, url: canonical });
  const meta = { ...baseMeta, canonical };
  const alternates = buildAlternates('blog');

  return {
    posts: pagePosts,
    currentPage: safePage,
    totalPages,
    blogBase,
    meta,
    alternates,
  };
};
