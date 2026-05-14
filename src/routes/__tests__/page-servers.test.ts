import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: { SITE_URL: 'https://voorvoet.nl' },
}));

vi.mock('$env/dynamic/public', () => ({ env: {} }));

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

describe('root +page.server.ts redirect', () => {
  it('throws a 308 redirect to /nl', async () => {
    const { load } = await import('../+page.server.js');

    let redirectError: { status: number; location: string } | null = null;
    try {
      load();
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
        redirectError = err as { status: number; location: string };
      }
    }

    expect(redirectError).not.toBeNull();
    expect(redirectError!.status).toBe(308);
    expect(redirectError!.location).toBe('/nl');
  });
});

describe('+layout.server.ts load', () => {
  it('returns lang and pageKey for known path', async () => {
    const { load } = await import('../+layout.server.js');

    const url = new URL('https://voorvoet.nl/nl/contact');
    const result = (await load({
      url,
      params: { lang: 'nl' },
      request: new Request('https://voorvoet.nl/nl/contact'),
      locals: {} as App.Locals,
      cookies: {} as never,
      fetch: fetch,
      isDataRequest: false,
      isSubRequest: false,
      setHeaders: vi.fn(),
      platform: undefined,
      route: { id: '/[lang=lang]/contact' },
      depends: vi.fn(),
      parent: vi.fn().mockResolvedValue({}),
      untrack: vi.fn((fn: () => unknown) => fn()),
    } as unknown as Parameters<typeof load>[0])) as unknown as Record<string, unknown>;

    expect(result['lang']).toBe('nl');
    expect(result['currentPath']).toBe('/nl/contact');
    expect(result['pageKey']).toBe('contact');
  });

  it('defaults lang to nl when params.lang is missing', async () => {
    const { load } = await import('../+layout.server.js');

    const url = new URL('https://voorvoet.nl/');
    const result = (await load({
      url,
      params: {},
      request: new Request('https://voorvoet.nl/'),
      locals: {} as App.Locals,
      cookies: {} as never,
      fetch: fetch,
      isDataRequest: false,
      isSubRequest: false,
      setHeaders: vi.fn(),
      platform: undefined,
      route: { id: '/' },
      depends: vi.fn(),
      parent: vi.fn().mockResolvedValue({}),
      untrack: vi.fn((fn: () => unknown) => fn()),
    } as unknown as Parameters<typeof load>[0])) as unknown as Record<string, unknown>;

    expect(result['lang']).toBe('nl');
  });

  it('returns pageKey null for unknown path', async () => {
    const { load } = await import('../+layout.server.js');

    const url = new URL('https://voorvoet.nl/nl/unknown-path');
    const result = (await load({
      url,
      params: { lang: 'nl' },
      request: new Request('https://voorvoet.nl/nl/unknown-path'),
      locals: {} as App.Locals,
      cookies: {} as never,
      fetch: fetch,
      isDataRequest: false,
      isSubRequest: false,
      setHeaders: vi.fn(),
      platform: undefined,
      route: { id: '/[lang=lang]/unknown-path' },
      depends: vi.fn(),
      parent: vi.fn().mockResolvedValue({}),
      untrack: vi.fn((fn: () => unknown) => fn()),
    } as unknown as Parameters<typeof load>[0])) as unknown as Record<string, unknown>;

    expect(result['pageKey']).toBeNull();
  });

  it('includes umamiScriptUrl when PUBLIC_UMAMI_SCRIPT_URL is set', async () => {
    vi.resetModules();
    vi.doMock('$env/dynamic/public', () => ({
      env: {
        PUBLIC_UMAMI_SCRIPT_URL: 'https://umami.example.com/script.js',
        PUBLIC_UMAMI_WEBSITE_ID: 'abc-123',
      },
    }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { SITE_URL: 'https://voorvoet.nl' },
    }));

    const { load: loadWithUmami } = await import('../+layout.server.js');

    const url = new URL('https://voorvoet.nl/nl');
    const result = (await loadWithUmami({
      url,
      params: { lang: 'nl' },
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
    } as unknown as Parameters<typeof loadWithUmami>[0])) as unknown as Record<string, unknown>;

    expect(result['umamiScriptUrl']).toBe('https://umami.example.com/script.js');
    expect(result['umamiWebsiteId']).toBe('abc-123');
  });
});
