import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

import { GET } from '../+server.js';

describe('GET /health', () => {
  it('returns 200', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns application/json content type', async () => {
    const response = await GET();
    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('returns status ok in body', async () => {
    const response = await GET();
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.status).toBe('ok');
  });

  it('does not leak the app version (CVE fingerprinting surface)', async () => {
    const response = await GET();
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).not.toHaveProperty('version');
  });
});
