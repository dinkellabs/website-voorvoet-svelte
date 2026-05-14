import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
  withRequestId: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  })),
}));

import { POST } from '../+server.js';

function makeEvent(body: unknown, ua = 'test-agent') {
  const init: RequestInit = {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': ua },
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  return {
    request: new Request('https://voorvoet.nl/csp-report', init),
    locals: { requestId: 'test-req-id' },
  } as unknown as Parameters<typeof POST>[0];
}

describe('POST /csp-report', () => {
  it('returns 204 on a well-formed report', async () => {
    const response = await POST(
      makeEvent({
        'csp-report': {
          'document-uri': 'https://voorvoet.nl/nl',
          'violated-directive': 'script-src',
          'blocked-uri': 'https://evil.example.com/x.js',
        },
      }),
    );
    expect(response.status).toBe(204);
  });

  it('returns 204 even when the body is not JSON (browser may send a beacon)', async () => {
    const broken = {
      request: new Request('https://voorvoet.nl/csp-report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not json',
      }),
      locals: { requestId: 'test-req-id' },
    } as unknown as Parameters<typeof POST>[0];
    const response = await POST(broken);
    expect(response.status).toBe(204);
  });
});
