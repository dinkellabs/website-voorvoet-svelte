// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: { SITE_URL: 'https://voorvoet.nl' },
}));

vi.mock('$env/dynamic/public', () => ({
  env: { PUBLIC_SITE_URL: 'https://dev.voorvoeten.nl' },
}));

vi.mock('$app/environment', () => ({
  dev: true,
  building: false,
}));

/**
 * Smoke test: every `+page.server.ts` and `+layout.server.ts` MUST import
 * cleanly under the production environment (node). Catches mistakes like
 * importing a browser-only module from a server route — those break only at
 * build time today, after a full `pnpm build`.
 */

const SERVER_ENTRIES = [
  '../+layout.server.ts',
  '../+page.server.ts',
  '../[lang=lang]/+page.server.ts',
  '../[lang=lang]/[...path]/+page.server.ts',
  '../[lang=lang]/blog/+page.server.ts',
  '../[lang=lang]/blog/[slug]/+page.server.ts',
  '../[lang=lang]/contact/+page.server.ts',
  '../[lang=lang]/kontakt/+page.server.ts',
  '../[lang=lang]/zolen-bestellen/+page.server.ts',
  '../[lang=lang]/einlagen-bestellen/+page.server.ts',
  '../[lang=lang]/order-insoles/+page.server.ts',
  '../dev/components/+page.server.ts',
  '../health/+server.ts',
] as const;

describe('server entry imports — smoke', () => {
  for (const entry of SERVER_ENTRIES) {
    it(`imports ${entry} without throwing`, async () => {
      const mod = (await import(/* @vite-ignore */ entry)) as Record<string, unknown>;
      expect(mod).toBeDefined();
      // Each route entry must export at least one of: load, actions, GET, POST.
      const hasExpected = ['load', 'actions', 'GET', 'POST', 'handle', 'handleError'].some(
        (name) => name in mod,
      );
      expect(hasExpected, `${entry} must export load/actions/GET/POST/etc.`).toBe(true);
    });
  }
});
