import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: { SITE_URL: 'https://voorvoet.nl' },
}));

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

import { load } from '../+page.server.js';

type HomeResult = {
  meta: Record<string, unknown>;
  alternates: unknown[];
  structuredData: Array<{ '@type': string }>;
};

describe('[lang=lang]/+page.server.ts (home)', () => {
  it('returns meta, alternates and structuredData for nl home', async () => {
    const url = new URL('https://voorvoet.nl/nl');
    const result = (await load({
      params: { lang: 'nl' },
      url,
      request: new Request('https://voorvoet.nl/nl'),
      locals: {} as App.Locals,
      cookies: {} as never,
      fetch: fetch,
      isDataRequest: false,
      isSubRequest: false,
      setHeaders: vi.fn(),
      platform: undefined,
      route: { id: '/[lang=lang]' },
      depends: vi.fn(),
      parent: vi.fn().mockResolvedValue({}),
      untrack: vi.fn((fn: () => unknown) => fn()),
    } as unknown as Parameters<typeof load>[0])) as unknown as HomeResult;

    expect(result).toHaveProperty('meta');
    expect(result).toHaveProperty('alternates');
    expect(result).toHaveProperty('structuredData');
    expect(Array.isArray(result.structuredData)).toBe(true);
    expect(result.structuredData.length).toBeGreaterThan(0);
  });

  it('works for de home', async () => {
    const url = new URL('https://voorvoet.nl/de');
    const result = (await load({
      params: { lang: 'de' },
      url,
      request: new Request('https://voorvoet.nl/de'),
      locals: {} as App.Locals,
      cookies: {} as never,
      fetch: fetch,
      isDataRequest: false,
      isSubRequest: false,
      setHeaders: vi.fn(),
      platform: undefined,
      route: { id: '/[lang=lang]' },
      depends: vi.fn(),
      parent: vi.fn().mockResolvedValue({}),
      untrack: vi.fn((fn: () => unknown) => fn()),
    } as unknown as Parameters<typeof load>[0])) as unknown as HomeResult;

    expect(result.meta).toBeDefined();
  });
});
