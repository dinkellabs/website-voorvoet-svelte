import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: { SITE_URL: 'https://voorvoet.nl' },
}));

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

import { load } from '../+page.server.js';

type PathResult = Record<string, unknown>;

function makeLoadArgs(lang: string, path: string, fullUrl: string) {
  const url = new URL(fullUrl);
  return {
    params: { lang, path },
    url,
    request: new Request(fullUrl),
    locals: {} as App.Locals,
    cookies: {} as never,
    fetch: fetch,
    isDataRequest: false,
    isSubRequest: false,
    setHeaders: vi.fn(),
    platform: undefined,
    route: { id: `/[lang=lang]/${path}` },
    depends: vi.fn(),
    parent: vi.fn().mockResolvedValue({}),
    untrack: vi.fn((fn: () => unknown) => fn()),
  } as unknown as Parameters<typeof load>[0];
}

describe('[lang=lang]/[...path]/+page.server.ts', () => {
  it('returns meta and alternates for nl/informatie', async () => {
    const result = (await load(
      makeLoadArgs('nl', 'informatie', 'https://voorvoet.nl/nl/informatie'),
    )) as unknown as PathResult;

    expect(result).toHaveProperty('meta');
    expect(result).toHaveProperty('alternates');
    expect(result['pageKey']).toBe('information');
    expect(result['lang']).toBe('nl');
  });

  it('returns meta for de/erstattungen (reimbursements)', async () => {
    const result = (await load(
      makeLoadArgs('de', 'erstattungen', 'https://voorvoet.nl/de/erstattungen'),
    )) as unknown as PathResult;

    expect(result['pageKey']).toBe('reimbursements');
    expect(result).toHaveProperty('pricing');
  });

  it('returns legalDoc for nl/privacy-beleid', async () => {
    const result = (await load(
      makeLoadArgs('nl', 'privacy-beleid', 'https://voorvoet.nl/nl/privacy-beleid'),
    )) as unknown as PathResult;

    expect(result['pageKey']).toBe('privacy_policy');
    expect(result).toHaveProperty('legalDoc');
  });

  it('returns legalDoc for nl/algemene-voorwaarden', async () => {
    const result = (await load(
      makeLoadArgs('nl', 'algemene-voorwaarden', 'https://voorvoet.nl/nl/algemene-voorwaarden'),
    )) as unknown as PathResult;

    expect(result['pageKey']).toBe('terms_conditions');
    expect(result).toHaveProperty('legalDoc');
  });

  it('returns base result for nl/credits', async () => {
    const result = (await load(
      makeLoadArgs('nl', 'credits', 'https://voorvoet.nl/nl/credits'),
    )) as unknown as PathResult;

    expect(result['pageKey']).toBe('credits');
    expect(result).not.toHaveProperty('legalDoc');
    expect(result).not.toHaveProperty('pricing');
  });

  it('throws 404 for unknown path', async () => {
    let errorThrown: { status: number } | null = null;
    try {
      await load(makeLoadArgs('nl', 'does-not-exist', 'https://voorvoet.nl/nl/does-not-exist'));
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });

  it('throws 404 for SKIP_KEYS (contact)', async () => {
    let errorThrown: { status: number } | null = null;
    try {
      await load(makeLoadArgs('nl', 'contact', 'https://voorvoet.nl/nl/contact'));
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });

  it('throws 404 for SKIP_KEYS (blog)', async () => {
    let errorThrown: { status: number } | null = null;
    try {
      await load(makeLoadArgs('nl', 'blog', 'https://voorvoet.nl/nl/blog'));
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });
});
