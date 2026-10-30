import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
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

describe('Alias hostname redirects without ALIAS_HOSTNAMES', () => {
  it('serves every host normally when no alias list is configured', async () => {
    const url = new URL('https://voorvoeten.nl/nl/contact');
    const resolve = vi
      .fn()
      .mockResolvedValue(
        new Response('OK', { status: 200, headers: { 'content-type': 'text/html' } }),
      );
    const event = {
      url,
      request: new Request(url, { method: 'GET' }),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '203.0.113.9',
    } as unknown as Parameters<typeof handle>[0]['event'];

    const response = await handle({ event, resolve });
    expect(response.status).toBe(200);
    expect(resolve).toHaveBeenCalledTimes(1);
  });
});
