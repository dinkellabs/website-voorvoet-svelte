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

type BlogLoadResult = {
  posts: unknown[];
  currentPage: number;
  totalPages: number;
  blogBase: string;
  meta: { title: string; description: string; canonical: string };
  alternates: Array<{ lang: string; href: string }>;
};

function makeLoadArgs(lang: string, pageQuery = '') {
  const fullUrl = `https://voorvoet.nl/${lang}/blog${pageQuery ? `?page=${pageQuery}` : ''}`;
  const url = new URL(fullUrl);
  return {
    params: { lang },
    url,
    request: new Request(fullUrl),
    locals: {} as App.Locals,
    cookies: {} as never,
    fetch: fetch,
    isDataRequest: false,
    isSubRequest: false,
    setHeaders: vi.fn(),
    platform: undefined,
    route: { id: '/[lang=lang]/blog' },
    depends: vi.fn(),
    parent: vi.fn().mockResolvedValue({}),
    untrack: vi.fn((fn: () => unknown) => fn()),
  } as unknown as Parameters<typeof load>[0];
}

describe('[lang=lang]/blog/+page.server.ts', () => {
  it('returns posts array and pagination for nl', async () => {
    const result = (await load(makeLoadArgs('nl'))) as unknown as BlogLoadResult;

    expect(Array.isArray(result.posts)).toBe(true);
    expect(typeof result.currentPage).toBe('number');
    expect(typeof result.totalPages).toBe('number');
    expect(result.currentPage).toBe(1);
  });

  it('returns posts for de', async () => {
    const result = (await load(makeLoadArgs('de'))) as unknown as BlogLoadResult;
    expect(Array.isArray(result.posts)).toBe(true);
  });

  it('returns posts for en', async () => {
    const result = (await load(makeLoadArgs('en'))) as unknown as BlogLoadResult;
    expect(Array.isArray(result.posts)).toBe(true);
  });

  it('returns meta with canonical URL', async () => {
    const result = (await load(makeLoadArgs('nl'))) as unknown as BlogLoadResult;
    expect(result.meta).toHaveProperty('canonical');
    expect(result.meta).toHaveProperty('title');
    expect(result.meta).toHaveProperty('description');
  });

  it('returns alternates with all three langs', async () => {
    const result = (await load(makeLoadArgs('nl'))) as unknown as BlogLoadResult;
    const langs = result.alternates.map((a) => a.lang);
    expect(langs).toContain('nl');
    expect(langs).toContain('de');
    expect(langs).toContain('en');
    expect(langs).toContain('x-default');
  });

  it('clamps page to 1 for invalid page param', async () => {
    const result = (await load(makeLoadArgs('nl', 'abc'))) as unknown as BlogLoadResult;
    expect(result.currentPage).toBe(1);
  });

  it('redirects (308) to canonical page when page exceeds total', () => {
    expect(() => load(makeLoadArgs('nl', '999'))).toThrow(
      expect.objectContaining({
        status: 308,
        location: expect.stringMatching(/^\/nl\/blog($|\?page=\d+$)/),
      }),
    );
  });

  it('does not include page param in canonical when page equals 1', async () => {
    const result = (await load(makeLoadArgs('nl', '1'))) as unknown as BlogLoadResult;
    expect(result.meta.canonical).not.toContain('?page=');
  });
});
