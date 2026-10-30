import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: {
    ALIAS_HOSTNAMES: 'voorvoeten.nl, www.voorvoeten.nl,podotherapie-enschede.nl',
    UMAMI_API_URL: 'https://umami.example.com/api/send',
  },
}));

vi.mock('$env/dynamic/public', () => ({
  env: { PUBLIC_SITE_URL: 'https://voorvoet.nl' },
}));

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

vi.mock('pino', () => {
  const child = vi.fn(() => ({ info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() }));
  const logger = { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn(), child };
  return { default: vi.fn(() => logger) };
});

const { mockTrackEvent } = vi.hoisted(() => ({
  mockTrackEvent: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('$lib/server/umami.js', () => ({
  trackEvent: mockTrackEvent,
}));

vi.mock('$lib/server/logger.js', () => ({
  withRequestId: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
  default: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { handle } from '../hooks.server.js';

function makeEvent(host: string, pathAndQuery: string, headers: Record<string, string> = {}) {
  const url = new URL(`https://${host}${pathAndQuery}`);
  return {
    url,
    request: new Request(url, { method: 'GET', headers }),
    params: {},
    locals: {} as Record<string, unknown>,
    getClientAddress: () => '203.0.113.9',
  } as unknown as Parameters<typeof handle>[0]['event'];
}

const noopResolve = vi
  .fn()
  .mockResolvedValue(new Response('OK', { status: 200, headers: { 'content-type': 'text/html' } }));

async function redirectOf(event: Parameters<typeof handle>[0]['event']) {
  try {
    await handle({ event, resolve: noopResolve });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
      return err as { status: number; location: string };
    }
    throw err;
  }
  return null;
}

describe('Alias hostname redirects', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
    noopResolve.mockClear();
  });

  it('answers an alias host with a 301 to the same path on the canonical origin', async () => {
    const result = await redirectOf(makeEvent('voorvoeten.nl', '/nl/contact'));
    expect(result).toEqual({ status: 301, location: 'https://voorvoet.nl/nl/contact' });
    expect(noopResolve).not.toHaveBeenCalled();
  });

  it('keeps the query string and matches hosts case-insensitively', async () => {
    const result = await redirectOf(makeEvent('WWW.Voorvoeten.nl', '/nl/blog?page=2'));
    expect(result).toEqual({ status: 301, location: 'https://voorvoet.nl/nl/blog?page=2' });
  });

  it('tracks an alias_redirect event under the canonical hostname', async () => {
    await redirectOf(
      makeEvent('podotherapie-enschede.nl', '/de/kontakt', {
        'user-agent': 'Mozilla/5.0',
        referer: 'https://www.google.com/',
      }),
    );
    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: 'alias_redirect',
      url: '/de/kontakt',
      hostname: 'voorvoet.nl',
      language: 'de',
      referrer: 'https://www.google.com/',
      userAgent: 'Mozilla/5.0',
      ip: '203.0.113.9',
      data: {
        alias_host: 'podotherapie-enschede.nl',
        path: '/de/kontakt',
        referrer_host: 'www.google.com',
      },
    });
  });

  it('serves the canonical host without redirecting or tracking a redirect', async () => {
    const result = await redirectOf(makeEvent('voorvoet.nl', '/nl/contact'));
    expect(result).toBeNull();
    expect(noopResolve).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent.mock.calls.some(([e]) => e.name === 'alias_redirect')).toBe(false);
  });

  it('serves hosts that are not listed, such as dev, normally', async () => {
    const result = await redirectOf(makeEvent('dev.voorvoet.nl', '/nl'));
    expect(result).toBeNull();
    expect(noopResolve).toHaveBeenCalledTimes(1);
  });

  it('redirects the alias before the legacy path redirect runs', async () => {
    const result = await redirectOf(makeEvent('voorvoeten.nl', '/contact'));
    expect(result).toEqual({ status: 301, location: 'https://voorvoet.nl/contact' });
  });
});
