import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$app/environment', () => ({
  dev: true,
  building: false,
}));

vi.mock('$lib/server/umami.js', () => ({
  trackEvent: vi.fn(),
}));

const mockLog = { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() };
vi.mock('$lib/server/logger.js', () => ({
  default: mockLog,
  withRequestId: vi.fn(() => mockLog),
}));

import type { Handle } from '@sveltejs/kit';

function makeEvent(pathname: string) {
  return {
    url: new URL(`https://voorvoet.nl${pathname}`),
    request: new Request(`https://voorvoet.nl${pathname}`),
    locals: {} as App.Locals,
    getClientAddress: () => '1.2.3.4',
  } as unknown as Parameters<Handle>[0]['event'];
}

/**
 * /health runs inside `handle` before logging / CSP / Umami tracking. A
 * refactor that moved CSP-set above the /health short-circuit would gain
 * HTML headers on the JSON healthcheck response — costly only at scale
 * (docker HEALTHCHECK fires every 30s) but worth nailing down.
 */
describe('/health fastpath', () => {
  beforeEach(() => {
    vi.resetModules();
    mockLog.info.mockClear();
    mockLog.warn.mockClear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  async function getResponse() {
    vi.doMock('$env/dynamic/private', () => ({ env: {} }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));
    const { handle } = await import('../hooks.server.js');
    const event = makeEvent('/health');
    const resolve = vi.fn().mockResolvedValue(
      new Response('{"status":"ok"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const response = await handle({ event, resolve } as Parameters<typeof handle>[0]);
    return { response, resolve };
  }

  it('does not set Content-Security-Policy on /health', async () => {
    const { response } = await getResponse();
    expect(response.headers.get('Content-Security-Policy')).toBeNull();
  });

  it('does not set X-Frame-Options on /health', async () => {
    const { response } = await getResponse();
    expect(response.headers.get('X-Frame-Options')).toBeNull();
  });

  it('does not log a request line for /health', async () => {
    await getResponse();
    expect(mockLog.info).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: '/health' }),
      'incoming request',
    );
  });

  it('calls resolve exactly once with the raw event', async () => {
    const { resolve } = await getResponse();
    expect(resolve).toHaveBeenCalledTimes(1);
  });
});
