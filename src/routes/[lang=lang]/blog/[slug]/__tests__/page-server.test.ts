// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: { SITE_URL: 'https://voorvoet.nl' },
}));

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

import { load } from '../+page.server.js';
import { getPostsByLang } from '$lib/blog/loader.js';

type SlugResult = {
  post: { slug: string; title: string; summary: string };
  blogBase: string;
  meta: Record<string, unknown>;
  alternates: Array<{ lang: string; href: string }>;
  structuredData: Array<{ '@type': string }>;
};

function makeLoadArgs(lang: string, slug: string) {
  const fullUrl = `https://voorvoet.nl/${lang}/blog/${slug}`;
  const url = new URL(fullUrl);
  return {
    params: { lang, slug },
    url,
    request: new Request(fullUrl),
    locals: {} as App.Locals,
    cookies: {} as never,
    fetch: fetch,
    isDataRequest: false,
    isSubRequest: false,
    setHeaders: vi.fn(),
    platform: undefined,
    route: { id: '/[lang=lang]/blog/[slug]' },
    depends: vi.fn(),
    parent: vi.fn().mockResolvedValue({}),
    untrack: vi.fn((fn: () => unknown) => fn()),
  } as unknown as Parameters<typeof load>[0];
}

describe('[lang=lang]/blog/[slug]/+page.server.ts', () => {
  it('has at least one NL blog post to test against', () => {
    // Guard: every test below `if (nlPosts.length === 0) return;` — without
    // this assertion, an empty content directory would silently pass them all.
    expect(getPostsByLang('nl').length).toBeGreaterThan(0);
  });

  it('returns post data for a real blog post', async () => {
    const nlPosts = getPostsByLang('nl');

    if (nlPosts.length === 0) {
      return;
    }

    const firstPost = nlPosts[0]!;
    const result = (await load(makeLoadArgs('nl', firstPost.slug))) as unknown as SlugResult;

    expect(result).toHaveProperty('post');
    expect(result.post.slug).toBe(firstPost.slug);
    expect(result).toHaveProperty('meta');
    expect(result).toHaveProperty('alternates');
    expect(result).toHaveProperty('structuredData');
  });

  it('throws 404 for non-existent slug', async () => {
    let errorThrown: { status: number } | null = null;
    try {
      await load(makeLoadArgs('nl', 'this-slug-does-not-exist'));
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });

  it('includes x-default in alternates', async () => {
    const nlPosts = getPostsByLang('nl');
    if (nlPosts.length === 0) return;

    const firstPost = nlPosts[0]!;
    const result = (await load(makeLoadArgs('nl', firstPost.slug))) as unknown as SlugResult;

    const langs = result.alternates.map((a) => a.lang);
    expect(langs).toContain('x-default');
  });

  it('returns structured data with BlogPosting type', async () => {
    const nlPosts = getPostsByLang('nl');
    if (nlPosts.length === 0) return;

    const firstPost = nlPosts[0]!;
    const result = (await load(makeLoadArgs('nl', firstPost.slug))) as unknown as SlugResult;

    const blogPosting = result.structuredData.find((sd) => sd['@type'] === 'BlogPosting');
    expect(blogPosting).toBeDefined();
  });

  it('falls back to nl path for x-default', async () => {
    const dePosts = getPostsByLang('de');
    if (dePosts.length === 0) return;

    const dePost = dePosts[0]!;
    const result = (await load(makeLoadArgs('de', dePost.slug))) as unknown as SlugResult;

    const xDefault = result.alternates.find((a) => a.lang === 'x-default');
    expect(xDefault).toBeDefined();
    expect(xDefault!.href).toContain('/nl/blog/');
  });
});
