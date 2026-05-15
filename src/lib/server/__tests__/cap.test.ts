import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHash } from 'node:crypto';

vi.mock('$env/dynamic/private', () => ({
  env: {} as Record<string, string | undefined>,
}));

vi.mock('$env/dynamic/public', () => ({
  env: {} as Record<string, string | undefined>,
}));

vi.mock('$app/environment', () => ({
  dev: true,
  building: false,
}));

function makeToken(): { token: string; tokenKey: string } {
  const id = 'abcdef0123456789';
  const verToken = 'deadbeefcafebabe';
  const tokenKey = `${id}:${createHash('sha256').update(verToken).digest('hex')}`;
  return { token: `${id}:${verToken}`, tokenKey };
}

describe('verifyCapToken', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('auto-passes when CAP_ENABLED is false', async () => {
    vi.doMock('$env/dynamic/private', () => ({ env: { CAP_ENABLED: 'false' } }));

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken('any-token')).toBe(true);
  });

  it('auto-passes when CAP_ENABLED is unset', async () => {
    vi.doMock('$env/dynamic/private', () => ({ env: {} }));

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken('any-token')).toBe(true);
  });

  it('auto-passes in dummy mode even when enabled', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        CAP_ENABLED: 'true',
        CAP_DUMMY_MODE: 'always_pass',
        CAP_SECRET: 'x'.repeat(32),
      },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken('whatever')).toBe(true);
  });

  it('returns false when token is empty', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'true', CAP_SECRET: 'x'.repeat(32) },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken('')).toBe(false);
  });

  it('returns false when token is malformed (no colon)', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'true', CAP_SECRET: 'x'.repeat(32) },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken('no-colon-here')).toBe(false);
  });

  it('returns false when token is unknown to the store', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'true', CAP_SECRET: 'x'.repeat(32) },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken('aaaa:bbbb')).toBe(false);
  });

  it('returns true when a previously stored tokenKey matches the submitted token', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'true', CAP_SECRET: 'x'.repeat(32) },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    const { token, tokenKey } = makeToken();
    const { storeToken, _resetForTests } = await import('../cap-store.js');
    _resetForTests();
    storeToken(tokenKey, Date.now() + 60_000);

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken(token)).toBe(true);
  });

  it('consumes the token so a second submission fails', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'true', CAP_SECRET: 'x'.repeat(32) },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    const { token, tokenKey } = makeToken();
    const { storeToken, _resetForTests } = await import('../cap-store.js');
    _resetForTests();
    storeToken(tokenKey, Date.now() + 60_000);

    const { verifyCapToken } = await import('../cap.js');
    expect(await verifyCapToken(token)).toBe(true);
    expect(await verifyCapToken(token)).toBe(false);
  });

  it('boot-time: refuses to start in production when CAP_ENABLED is not "true"', async () => {
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'false', CAP_SECRET: 'x'.repeat(32) },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    await expect(import('../cap.js')).rejects.toThrow(/CAP_ENABLED must be exactly/);
  });

  it('boot-time: refuses to start in production when CAP_SECRET is shorter than 16 bytes', async () => {
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'true', CAP_SECRET: 'short' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: { PUBLIC_CAP_API_ENDPOINT: '/api/cap/' } }));

    await expect(import('../cap.js')).rejects.toThrow(/CAP_SECRET must be set/);
  });

  it('boot-time: refuses to start in production without PUBLIC_CAP_API_ENDPOINT', async () => {
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'true', CAP_SECRET: 'x'.repeat(32) },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));

    await expect(import('../cap.js')).rejects.toThrow(/PUBLIC_CAP_API_ENDPOINT must be set/);
  });

  it('boot-time: dummy mode skips all production guards', async () => {
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { CAP_ENABLED: 'false', CAP_DUMMY_MODE: 'always_pass' },
    }));
    vi.doMock('$env/dynamic/public', () => ({ env: {} }));

    const mod = await import('../cap.js');
    expect(await mod.verifyCapToken('any')).toBe(true);
  });
});
