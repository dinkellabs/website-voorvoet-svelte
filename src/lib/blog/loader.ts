import { render } from 'svelte/server';
import type { Component } from 'svelte';
import type { Lang } from '$lib/i18n/route-map.js';
import type { BlogPost } from './types.js';

type GlobModule = {
  metadata?: Record<string, unknown>;
  default?: Component;
};

// Eager-load is fine at current post count (~9 across 3 languages). Migrate
// to a dynamic import at ≥50 posts per language to avoid cold-start memory
// pressure.
const modules = import.meta.glob<GlobModule>('/src/content/blog/**/*.md', { eager: true });

function storyNumberFromFilename(filename: string): string {
  return filename.slice(0, 3);
}

function slugFromFilename(filename: string): string {
  const withoutStory = filename.slice(4);
  const withoutExt = withoutStory.replace(/\.md$/, '');
  return withoutExt;
}

function langFromPath(filePath: string): Lang {
  const match = filePath.match(/\/src\/content\/blog\/(nl|de|en)\//);
  if (!match) {
    throw new Error(
      `blog/loader: file ${filePath} is not under src/content/blog/{nl,de,en}/ — ` +
        `silently bucketing into nl would mis-list it in the sitemap and blog index.`,
    );
  }
  return match[1] as Lang;
}

function filenameFromPath(filePath: string): string {
  return filePath.split('/').at(-1) ?? '';
}

function parsePost(filePath: string, mod: GlobModule): BlogPost | null {
  const meta = mod.metadata;
  if (!meta) return null;

  const lang = langFromPath(filePath);
  const filename = filenameFromPath(filePath);
  const storyNumber = storyNumberFromFilename(filename);
  const slug = (meta['slug'] as string | undefined) ?? slugFromFilename(filename);

  const content = mod.default ? render(mod.default).body : '';

  return {
    slug,
    lang,
    storyNumber,
    filePath,
    title: (meta['title'] as string) ?? '',
    summary: (meta['summary'] as string) ?? '',
    author: (meta['author'] as string) ?? '',
    date: (meta['date'] as string) ?? '',
    thumbnail: (meta['thumbnail'] as string) ?? '',
    thumbnail_alt: (meta['thumbnail_alt'] as string) ?? '',
    tags: (meta['tags'] as string[]) ?? [],
    category: (meta['category'] as string) ?? '',
    content,
  };
}

const allPosts: BlogPost[] = Object.entries(modules)
  .map(([path, mod]) => parsePost(path, mod))
  .filter((p): p is BlogPost => p !== null)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPostsByLang(lang: Lang): BlogPost[] {
  return allPosts.filter((p) => p.lang === lang);
}

export function getPostBySlug(lang: Lang, slug: string): BlogPost | null {
  return allPosts.find((p) => p.lang === lang && p.slug === slug) ?? null;
}

export function getTranslations(post: BlogPost): Partial<Record<Lang, BlogPost>> {
  const result: Partial<Record<Lang, BlogPost>> = {};
  for (const p of allPosts) {
    if (p.storyNumber === post.storyNumber) {
      result[p.lang] = p;
    }
  }
  return result;
}
