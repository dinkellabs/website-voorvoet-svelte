import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

vi.mock('pino', () => {
  const child = vi.fn(() => ({ info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() }));
  const logger = { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn(), child };
  return { default: vi.fn(() => logger) };
});

vi.mock('$lib/server/logger.js', () => ({
  withRequestId: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
  default: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const mockTrackEvent = vi.fn().mockResolvedValue(undefined);

describe('hooks.server — lang transform and tracking', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('does not call trackEvent when UMAMI_API_URL is not set', async () => {
    vi.doMock('$env/dynamic/private', () => ({ env: {} }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/nl/contact');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html lang="%lang%">', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/nl/contact'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('calls trackEvent for HTML responses when UMAMI_API_URL is set', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/nl/contact');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/nl/contact'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    const call = mockTrackEvent.mock.calls[0]?.[0] as { name?: string; language: string };
    expect(call.name).toBeUndefined();
    expect(call.language).toBe('nl');
  });

  it('does not call trackEvent for non-HTML responses', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/nl/contact');
    const resolve = vi.fn().mockResolvedValue(
      new Response('{"data":"json"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/nl/contact'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('does not call trackEvent for skip-tracking prefixes', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/health');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/health'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('detects de lang segment and tracks with de language', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/de/kontakt');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/de/kontakt'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    const call = mockTrackEvent.mock.calls[0]?.[0] as { language: string };
    expect(call.language).toBe('de');
  });

  it('detects en lang segment and tracks with en language', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/en/contact');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/en/contact'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    const call = mockTrackEvent.mock.calls[0]?.[0] as { language: string };
    expect(call.language).toBe('en');
  });

  it('emits a 404 event (not a pageview) for 404 HTML responses', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/nl/not-found');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html>Not Found</html>', {
        status: 404,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/nl/not-found'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    const call = mockTrackEvent.mock.calls[0]?.[0] as { name: string };
    expect(call.name).toBe('404');
  });

  it('emits a legacy_redirect event before throwing 308', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/contact');
    const resolve = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));

    const event = {
      url,
      request: new Request('https://voorvoet.nl/contact'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await expect(handle({ event, resolve })).rejects.toMatchObject({ status: 308 });
    await new Promise((r) => setTimeout(r, 20));
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    const call = mockTrackEvent.mock.calls[0]?.[0] as { name: string };
    expect(call.name).toBe('legacy_redirect');
  });

  it('applies lang transform in resolve call', async () => {
    vi.doMock('$env/dynamic/private', () => ({ env: {} }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: mockTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/de/kontakt');
    let capturedTransform: ((opts: { html: string }) => string) | undefined;

    const resolve = vi
      .fn()
      .mockImplementation(
        (_event: unknown, opts: { transformPageChunk?: (opts: { html: string }) => string }) => {
          capturedTransform = opts?.transformPageChunk;
          return Promise.resolve(new Response('ok', { status: 200 }));
        },
      );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/de/kontakt'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await handle({ event, resolve });

    expect(capturedTransform).toBeDefined();
    const result = capturedTransform!({ html: '<html lang="%lang%">' });
    expect(result).toBe('<html lang="de">');
  });

  it('swallows trackEvent errors via .catch()', async () => {
    const rejectingTrackEvent = vi.fn().mockRejectedValue(new Error('umami down'));
    vi.doMock('$env/dynamic/private', () => ({
      env: { UMAMI_API_URL: 'https://umami.example.com/api/send' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    vi.doMock('$lib/server/umami.js', () => ({ trackEvent: rejectingTrackEvent }));

    const { handle } = await import('../hooks.server.js');

    const url = new URL('https://voorvoet.nl/nl/contact');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const event = {
      url,
      request: new Request('https://voorvoet.nl/nl/contact'),
      params: {},
      locals: {} as Record<string, unknown>,
      getClientAddress: () => '1.2.3.4',
    } as unknown as Parameters<typeof handle>[0]['event'];

    await expect(handle({ event, resolve })).resolves.toBeDefined();
    await new Promise((r) => setTimeout(r, 50));
  });
});
