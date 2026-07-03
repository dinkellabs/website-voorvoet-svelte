import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

vi.mock('$env/dynamic/private', () => ({
  env: {} as Record<string, string | undefined>,
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

import type { UmamiEvent } from '../umami.js';

const BOT_UA = 'Googlebot/2.1 (+http://www.google.com/bot.html)';
const HUMAN_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const baseEvent: UmamiEvent = {
  url: '/nl',
  hostname: 'voorvoet.nl',
  language: 'nl',
  userAgent: HUMAN_UA,
  ip: '1.2.3.4',
};

describe('trackEvent', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
    vi.resetModules();
  });

  it('is a no-op when UMAMI_API_URL is unset', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {},
    }));

    const { trackEvent } = await import('../umami.js');
    await trackEvent(baseEvent);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs expected JSON shape when UMAMI_API_URL is set', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        UMAMI_API_URL: 'https://umami.example.com/api/send',
        UMAMI_WEBSITE_ID: 'test-website-id',
        UMAMI_TIMEOUT_MS: '1500',
      },
    }));

    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }), { status: 200 });

    const { trackEvent } = await import('../umami.js');
    await trackEvent(baseEvent);

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://umami.example.com/api/send');
    expect(options?.method).toBe('POST');

    const body = JSON.parse(options?.body as string) as {
      type: string;
      payload: {
        website: string;
        name?: string;
        url: string;
        hostname: string;
        language: string;
        ip?: string;
      };
    };
    expect(body.type).toBe('event');
    expect(body.payload.website).toBe('test-website-id');
    expect(body.payload.name).toBeUndefined();
    expect(body.payload.url).toBe('/nl');
    expect(body.payload.hostname).toBe('voorvoet.nl');
    expect(body.payload.language).toBe('nl');
    expect(body.payload.ip).toBe('1.2.3.4');
  });

  it('omits payload.ip and X-Forwarded-For when ip is unknown', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        UMAMI_API_URL: 'https://umami.example.com/api/send',
        UMAMI_WEBSITE_ID: 'test-website-id',
      },
    }));

    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }), { status: 200 });

    const { trackEvent } = await import('../umami.js');
    await trackEvent({ ...baseEvent, ip: undefined });

    const [, options] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(options?.body as string) as { payload: { ip?: string } };
    expect(body.payload.ip).toBeUndefined();
    expect((options?.headers as Record<string, string>)['X-Forwarded-For']).toBeUndefined();
  });

  it('includes name when set (custom event)', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        UMAMI_API_URL: 'https://umami.example.com/api/send',
        UMAMI_WEBSITE_ID: 'test-website-id',
      },
    }));

    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }), { status: 200 });

    const { trackEvent } = await import('../umami.js');
    await trackEvent({ ...baseEvent, name: 'legacy_redirect' });

    const [, options] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(options?.body as string) as {
      payload: { name?: string };
    };
    expect(body.payload.name).toBe('legacy_redirect');
  });

  it('swallows AbortError on timeout', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        UMAMI_API_URL: 'https://umami.example.com/api/send',
        UMAMI_TIMEOUT_MS: '10',
      },
    }));

    fetchMock.mockResponse(
      () => new Promise((resolve) => setTimeout(() => resolve({ body: '{}', status: 200 }), 200)),
    );

    const { trackEvent } = await import('../umami.js');
    await expect(trackEvent(baseEvent)).resolves.toBeUndefined();
  });

  it('filters bot user agents', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        UMAMI_API_URL: 'https://umami.example.com/api/send',
      },
    }));

    const { trackEvent } = await import('../umami.js');
    await trackEvent({ ...baseEvent, userAgent: BOT_UA });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not throw to caller when fetch rejects', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        UMAMI_API_URL: 'https://umami.example.com/api/send',
      },
    }));

    fetchMock.mockRejectOnce(new Error('network failure'));

    const { trackEvent } = await import('../umami.js');
    await expect(trackEvent(baseEvent)).resolves.toBeUndefined();
  });
});
