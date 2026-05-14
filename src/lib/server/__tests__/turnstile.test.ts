import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

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

describe('verifyTurnstileToken', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
    vi.resetModules();
  });

  it('auto-passes when TURNSTILE_ENABLED is false', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { TURNSTILE_ENABLED: 'false' },
    }));

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('any-token', '1.2.3.4');
    expect(result).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('auto-passes when TURNSTILE_ENABLED is unset', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {},
    }));

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('any-token', '1.2.3.4');
    expect(result).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('auto-passes with dummy always-pass site key', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        TURNSTILE_ENABLED: 'true',
        TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA' },
    }));

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('dummy-token', '1.2.3.4');
    expect(result).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns true when Cloudflare responds success: true', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        TURNSTILE_ENABLED: 'true',
        TURNSTILE_SECRET_KEY: 'real-secret-key',
      },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    fetchMock.mockResponseOnce(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('valid-token', '1.2.3.4');
    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('returns false when Cloudflare responds success: false', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        TURNSTILE_ENABLED: 'true',
        TURNSTILE_SECRET_KEY: 'real-secret-key',
      },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    fetchMock.mockResponseOnce(
      JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('bad-token', '1.2.3.4');
    expect(result).toBe(false);
  });

  it('returns false when Cloudflare returns non-200 status', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        TURNSTILE_ENABLED: 'true',
        TURNSTILE_SECRET_KEY: 'real-secret-key',
      },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    fetchMock.mockResponseOnce('Service Unavailable', { status: 503 });

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('any-token', '1.2.3.4');
    expect(result).toBe(false);
  });

  it('returns false when secret key is missing', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: { TURNSTILE_ENABLED: 'true' },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('token', '1.2.3.4');
    expect(result).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns false when token is empty', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        TURNSTILE_ENABLED: 'true',
        TURNSTILE_SECRET_KEY: 'real-secret-key',
      },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    const { verifyTurnstileToken } = await import('../turnstile.js');
    const result = await verifyTurnstileToken('', '1.2.3.4');
    expect(result).toBe(false);
  });

  it('boot-time: refuses to start in production when TURNSTILE_ENABLED is not "true"', async () => {
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { TURNSTILE_ENABLED: 'false', TURNSTILE_SECRET_KEY: 'real-secret' },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    await expect(import('../turnstile.js')).rejects.toThrow(/TURNSTILE_ENABLED must be exactly/);
  });

  it('boot-time: refuses to start in production with the always-pass dummy key', async () => {
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    vi.doMock('$env/dynamic/private', () => ({
      env: { TURNSTILE_ENABLED: 'true', TURNSTILE_SECRET_KEY: 'real-secret' },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA' },
    }));

    await expect(import('../turnstile.js')).rejects.toThrow(
      /PUBLIC_TURNSTILE_SITE_KEY is the Cloudflare always-pass dummy key/,
    );
  });

  it('boot-time: refuses to start in production without TURNSTILE_SECRET_KEY', async () => {
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    vi.doMock('$env/dynamic/private', () => ({ env: { TURNSTILE_ENABLED: 'true' } }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    await expect(import('../turnstile.js')).rejects.toThrow(/TURNSTILE_SECRET_KEY must be set/);
  });

  it('POSTs to the correct Cloudflare URL', async () => {
    vi.doMock('$env/dynamic/private', () => ({
      env: {
        TURNSTILE_ENABLED: 'true',
        TURNSTILE_SECRET_KEY: 'my-secret',
      },
    }));
    vi.doMock('$env/dynamic/public', () => ({
      env: { PUBLIC_TURNSTILE_SITE_KEY: 'real-site-key' },
    }));

    fetchMock.mockResponseOnce(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const { verifyTurnstileToken } = await import('../turnstile.js');
    await verifyTurnstileToken('token123', '5.6.7.8');

    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  });
});
