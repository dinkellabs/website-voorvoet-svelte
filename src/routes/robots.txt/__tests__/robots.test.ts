import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/public', () => ({ env: {} }));
vi.mock('$env/dynamic/private', () => ({
  env: { SITE_URL: 'https://voorvoet.nl' },
}));

import { GET } from '../+server.js';

function makeRequest() {
  return new Request('https://voorvoet.nl/robots.txt', { method: 'GET' });
}

describe('GET /robots.txt — indexing allowed (default)', () => {
  it('returns 200', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    expect(response.status).toBe(200);
  });

  it('returns text/plain content type', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    expect(response.headers.get('content-type')).toContain('text/plain');
  });

  it('sets Cache-Control header', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    expect(response.headers.get('cache-control')).toBeTruthy();
  });

  it('contains sitemap URL', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('Sitemap: https://voorvoet.nl/sitemap.xml');
  });

  it('allows all user agents', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
  });

  it('disallows /dev/', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('Disallow: /dev/');
  });
});

describe('GET /robots.txt — indexing disallowed', () => {
  it('sets Disallow: / when PUBLIC_DISALLOW_INDEXING=true', async () => {
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_DISALLOW_INDEXING: 'true' },
    }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { SITE_URL: 'https://voorvoet.nl' },
    }));

    const { GET: DisallowGET } = await import('../+server.js');
    const response = await DisallowGET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('Disallow: /');
  });
});
