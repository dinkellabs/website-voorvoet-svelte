import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: { SITE_URL: 'https://voorvoet.nl' },
}));

vi.mock('$env/dynamic/public', () => ({
  env: { PUBLIC_SITE_URL: 'https://dev.voorvoeten.nl' },
}));

vi.mock('$app/environment', () => ({
  dev: true,
  building: false,
}));

import { load } from '../+page.server.js';

function makeLoadArgs(lang: string) {
  const fullUrl = `https://voorvoet.nl/${lang}/einlagen-bestellen`;
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
    route: { id: '/[lang=lang]/einlagen-bestellen' },
    depends: vi.fn(),
    parent: vi.fn().mockResolvedValue({}),
    untrack: vi.fn((fn: () => unknown) => fn()),
  } as unknown as Parameters<typeof load>[0];
}

describe('[lang=lang]/einlagen-bestellen/+page.server.ts', () => {
  it('returns form, meta, and alternates for de/einlagen-bestellen', async () => {
    const result = await load(makeLoadArgs('de'));

    expect(result).toHaveProperty('form');
    expect(result).toHaveProperty('meta');
    expect(result).toHaveProperty('alternates');
  });

  it('throws 404 when nl tries to use einlagen-bestellen slug', async () => {
    let errorThrown: { status: number } | null = null;
    try {
      await load(makeLoadArgs('nl'));
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });
});
