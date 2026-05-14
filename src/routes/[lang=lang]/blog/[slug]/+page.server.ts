import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';
import type { PageServerLoad } from './$types.js';
import type { Lang } from '$lib/i18n/route-map.js';
import { getPostBySlug, getTranslations } from '$lib/blog/loader.js';
import { langFromParams, routeFor } from '$lib/i18n/route-map.js';
import { blogPostingLD, breadcrumbListLD } from '$lib/seo/structured-data.js';
import type { Component } from 'svelte';

type MdModule = {
  metadata?: Record<string, unknown>;
  default?: Component;
};

const mdModules = import.meta.glob<MdModule>('/src/content/blog/**/*.md', { eager: true });

const siteUrl = 'https://voorvoet.nl';

function storyDirFromFilePath(filePath: string): string {
  const filename = filePath.split('/').at(-1) ?? '';
  return filename.replace(/\.md$/, '');
}

function fixImagePaths(html: string, filePath: string): string {
  const storyDir = storyDirFromFilePath(filePath);
  return html.replace(
    /(<img\s[^>]*src=")(?!https?:\/\/|\/)(([^"]*\.(?:jpg|jpeg|png|gif|avif|webp|svg)))/gi,
    `$1/images/page_blog/${storyDir}/$3`,
  );
}

function stripFirstH1(html: string): string {
  return html.replace(/<h1>[^<]*<\/h1>\s*/i, '');
}

function addImageCaptions(html: string): string {
  return html.replace(/<p>(<img\s[^>]*alt="([^"]*)"[^>]*\/>)<\/p>/gi, (_match, imgTag, altText) => {
    if (!altText) return `<p>${imgTag}</p>`;
    return `<figure>${imgTag}<figcaption>${altText}</figcaption></figure>`;
  });
}

function fixBrokenButtons(html: string): string {
  return html.replace(
    /<p>!button<a\s+href="([^"]*)"(?:[^>]*)>([^<]*)<\/a><\/p>/g,
    (_match, href, label) => {
      const isExternal =
        (href.startsWith('http://') || href.startsWith('https://')) &&
        !href.startsWith('https://voorvoet.nl');
      const attrs = isExternal ? ` target="_blank" rel="noopener noreferrer"` : '';
      return `<p class="blog-button-wrap"><a href="${href}"${attrs} class="blog-inline-button">${label}</a></p>`;
    },
  );
}

export const load: PageServerLoad = ({ params }) => {
  const lang = langFromParams(params);
  const slug = params.slug;

  const post = getPostBySlug(lang, slug);
  if (!post) {
    error(404, `Blog post not found: ${slug}`);
  }

  const translations = getTranslations(post);
  const blogBase = routeFor('blog', lang);

  const mdEntry = Object.entries(mdModules).find(([path]) =>
    path.includes(post.filePath.split('/src/content/blog/')[1] ?? ''),
  );
  let content = post.content;
  if (mdEntry && mdEntry[1].default) {
    try {
      const rendered = render(mdEntry[1].default, { props: {} });
      content = rendered.body;
    } catch {
      content = post.content;
    }
  }

  content = fixImagePaths(content, post.filePath);
  content = stripFirstH1(content);
  content = addImageCaptions(content);
  content = fixBrokenButtons(content);

  const alternates: Array<{ lang: string; href: string }> = Object.entries(translations).map(
    ([l, p]) => ({
      lang: l,
      // Object.entries on `Record<Lang, ...>` returns string keys; the matcher
      // upstream ensures only nl|de|en files exist.
      href: `${siteUrl}${routeFor('blog', l as Lang)}/${p.slug}`,
    }),
  );

  const nlTranslation = translations['nl'];
  const xDefault = nlTranslation
    ? `${siteUrl}${routeFor('blog', 'nl')}/${nlTranslation.slug}`
    : `${siteUrl}${blogBase}/${slug}`;

  alternates.push({ lang: 'x-default', href: xDefault });

  const canonical = `${siteUrl}${blogBase}/${slug}`;

  const image = post.thumbnail
    ? `${siteUrl}/images/page_blog/${storyDirFromFilePath(post.filePath)}/${post.thumbnail}`
    : undefined;

  const structuredData = [
    blogPostingLD(
      { title: post.title, summary: post.summary, author: post.author, date: post.date, image },
      lang,
      canonical,
    ),
    breadcrumbListLD([
      { name: 'Blog', url: `${siteUrl}${routeFor('blog', lang)}` },
      { name: post.title, url: canonical },
    ]),
  ];

  return {
    post: { ...post, content },
    blogBase,
    meta: {
      title: `${post.title} — VoorVoet`,
      description: post.summary,
      canonical,
    },
    alternates,
    structuredData,
  };
};
