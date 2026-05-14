// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

describe('/dev/components +page.server.ts', () => {
  it('returns empty object in dev mode', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ dev: true, building: false }));
    const { load } = await import('../+page.server.js');
    const result = await load({} as Parameters<typeof load>[0]);
    expect(result).toEqual({});
  });

  it('throws 404 in production mode', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ dev: false, building: false }));
    const { load } = await import('../+page.server.js');
    expect(() => load({} as Parameters<typeof load>[0])).toThrow(
      expect.objectContaining({ status: 404 }),
    );
  });
});
