import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('$app/environment', () => ({
  dev: true,
  building: false,
}));

vi.mock('$lib/server/umami.js', () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('$lib/server/logger.js', () => ({
  default: { warn: vi.fn(), info: vi.fn(), debug: vi.fn(), error: vi.fn() },
  withRequestId: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  })),
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

async function invokeHandle(pathname: string, contentType: string) {
  vi.doMock('$env/dynamic/private', () => ({ env: {} }));
  vi.doMock('$env/dynamic/public', () => ({ env: {} }));
  const { handle } = await import('../hooks.server.js');
  const event = makeEvent(pathname);
  const resolve = vi.fn().mockResolvedValue(
    new Response('<html></html>', {
      status: 200,
      headers: { 'content-type': contentType },
    }),
  );
  return handle({ event, resolve } as Parameters<typeof handle>[0]);
}

describe('CSP and security headers', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('sets Content-Security-Policy on HTML responses', async () => {
    const response = await invokeHandle('/nl', 'text/html; charset=utf-8');
    expect(response.headers.get('Content-Security-Policy')).not.toBeNull();
  });

  it('CSP contains the load-bearing directives', async () => {
    const response = await invokeHandle('/nl', 'text/html; charset=utf-8');
    const csp = response.headers.get('Content-Security-Policy') ?? '';

    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).toMatch(/script-src .*'self'/);
    expect(csp).toMatch(/script-src .*https:\/\/challenges\.cloudflare\.com/);
    expect(csp).toMatch(/frame-src .*https:\/\/challenges\.cloudflare\.com/);
    expect(csp).toMatch(/frame-src .*https:\/\/www\.google\.com/);
    expect(csp).toMatch(/frame-ancestors 'none'/);
    expect(csp).toMatch(/object-src 'none'/);
    expect(csp).toMatch(/base-uri 'self'/);
    expect(csp).toMatch(/form-action 'self'/);
    expect(csp).toMatch(/report-uri \/csp-report/);
  });

  it('sets X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy on HTML', async () => {
    const response = await invokeHandle('/nl', 'text/html; charset=utf-8');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()');
  });

  it('does not set CSP on JSON responses', async () => {
    const response = await invokeHandle('/sitemap.xml', 'application/json');
    expect(response.headers.get('Content-Security-Policy')).toBeNull();
    expect(response.headers.get('X-Frame-Options')).toBeNull();
  });

  it('CSP includes the Umami script origin when PUBLIC_UMAMI_SCRIPT_URL is set', async () => {
    vi.resetModules();
    vi.doMock('$env/dynamic/private', () => ({ env: {} }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_UMAMI_SCRIPT_URL: 'https://stats.example.com/script.js' },
    }));
    const { handle } = await import('../hooks.server.js');
    const event = makeEvent('/nl');
    const resolve = vi.fn().mockResolvedValue(
      new Response('<html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    );
    const response = await handle({ event, resolve } as Parameters<typeof handle>[0]);
    const csp = response.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/script-src [^;]*https:\/\/stats\.example\.com/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/stats\.example\.com/);
  });

  it('CSP omits the Umami script origin when PUBLIC_UMAMI_SCRIPT_URL is unset', async () => {
    const response = await invokeHandle('/nl', 'text/html; charset=utf-8');
    const csp = response.headers.get('Content-Security-Policy') ?? '';
    expect(csp).not.toMatch(/stats\.example\.com/);
  });

  it('sets X-Request-ID on every response', async () => {
    const response = await invokeHandle('/nl', 'text/html; charset=utf-8');
    expect(response.headers.get('X-Request-ID')).toMatch(/^[0-9a-f-]{36}$/);
  });
});
