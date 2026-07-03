import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: {},
}));

vi.mock('$env/dynamic/public', () => ({
  env: {},
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

vi.mock('$lib/server/umami.js', () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
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

function makeEvent(pathname: string) {
  const url = new URL(`https://voorvoet.nl${pathname}`);
  return {
    url,
    request: new Request(`https://voorvoet.nl${pathname}`, { method: 'GET' }),
    params: {},
    locals: {} as Record<string, unknown>,
    getClientAddress: () => '1.2.3.4',
  } as unknown as Parameters<typeof handle>[0]['event'];
}

const noopResolve = vi.fn().mockResolvedValue(
  new Response('OK', {
    status: 200,
    headers: { 'content-type': 'text/html' },
  }),
);

describe('Legacy redirects', () => {
  const legacyRedirects: Record<string, string> = {
    '/': '/nl',
    '/informatie': '/nl/informatie',
    '/vergoedingen': '/nl/vergoedingen',
    '/contact': '/nl/contact',
    '/zolen-bestellen': '/nl/zolen-bestellen',
    '/credits': '/nl/credits',
    '/blog': '/nl/blog',
    '/en/information-english': '/en/information',
    '/en/contact-english': '/en/contact',
    '/en/extra-zolen-english': '/en/order-insoles',
    '/podotherapie/podotherapeut-of-podoloog-enschede': '/nl/blog/podotherapeut-of-podoloog',
  };

  for (const [from, to] of Object.entries(legacyRedirects)) {
    it(`redirects ${from} to ${to} with 308`, async () => {
      let redirectError: { status: number; location: string } | null = null;

      try {
        await handle({ event: makeEvent(from), resolve: noopResolve });
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
          redirectError = err as { status: number; location: string };
        }
      }

      expect(redirectError, `expected a redirect for ${from}`).not.toBeNull();
      expect(redirectError!.status).toBe(308);
      expect(redirectError!.location).toBe(to);
    });
  }
});

describe('Trailing slash stripping', () => {
  it('strips trailing slash and redirects with 308', async () => {
    let redirectError: { status: number; location: string } | null = null;

    try {
      await handle({ event: makeEvent('/nl/'), resolve: noopResolve });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
        redirectError = err as { status: number; location: string };
      }
    }

    expect(redirectError).not.toBeNull();
    expect(redirectError!.status).toBe(308);
    expect(redirectError!.location).toBe('/nl');
  });

  it('preserves query string when stripping trailing slash', async () => {
    let redirectError: { status: number; location: string } | null = null;

    try {
      await handle({ event: makeEvent('/nl/contact/?foo=bar'), resolve: noopResolve });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
        redirectError = err as { status: number; location: string };
      }
    }

    expect(redirectError).not.toBeNull();
    expect(redirectError!.status).toBe(308);
    expect(redirectError!.location).toBe('/nl/contact?foo=bar');
  });
});

describe('Normal request pass-through', () => {
  it('passes through /nl/contact without redirect', async () => {
    let didRedirect = false;

    try {
      await handle({ event: makeEvent('/nl/contact'), resolve: noopResolve });
    } catch {
      didRedirect = true;
    }

    expect(didRedirect).toBe(false);
  });
});
