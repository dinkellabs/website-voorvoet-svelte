import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { LANGS, langFromParams, routeFor } from '$lib/i18n/route-map.js';
import { getPostsByLang } from '$lib/blog/loader.js';
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '$lib/i18n/page-meta.js';

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
  const siteUrl = 'https://voorvoet.nl';
  const canonical = `${siteUrl}${blogBase}${safePage > 1 ? `?page=${safePage}` : ''}`;

  const alternates: Array<{ lang: string; href: string }> = LANGS.map((l) => ({
    lang: l,
    href: `${siteUrl}${routeFor('blog', l)}`,
  }));
  alternates.push({ lang: 'x-default', href: `${siteUrl}${routeFor('blog', 'nl')}` });

  return {
    posts: pagePosts,
    currentPage: safePage,
    totalPages,
    blogBase,
    meta: {
      title: PAGE_TITLES[lang]['blog'],
      description: PAGE_DESCRIPTIONS[lang]['blog'],
      canonical,
    },
    alternates,
  };
};
