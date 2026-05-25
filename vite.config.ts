import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';

const appVersion = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'VERSION'),
  'utf8',
).trim();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      emitTsDeclarations: true,
      strategy: ['url', 'baseLocale'],
      urlPatterns: [
        {
          pattern: '/:path(.*)?',
          localized: [
            ['nl', '/nl/:path(.*)?'],
            ['de', '/de/:path(.*)?'],
            ['en', '/en/:path(.*)?'],
          ],
        },
      ],
    }),
    sveltekit(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    passWithNoTests: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'components',
          include: ['src/lib/components/**/__tests__/**/*.{test,spec}.{js,ts}'],
        },
        resolve: { conditions: ['browser'] },
      },
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/lib/components/**/__tests__/**/*.{test,spec}.{js,ts}'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,js}'],
      exclude: [
        'src/lib/paraglide/**',
        'src/__tests__/**',
        'src/**/__tests__/**',
        'src/**/*.{test,spec}.{ts,js}',
        'src/**/*.d.ts',
        'src/app.d.ts',
        'src/lib/blog/types.ts',
        'src/lib/blog/remark-button.d.ts',
      ],
      thresholds: {
        // Per-area thresholds reflect honest current coverage with a small
        // buffer for normal churn. They are intentionally lowered from the
        // earlier 80/78 values that the audit (P4-E1) flagged as silently
        // failing every CI run. Raise these once:
        //   - blog has 7+ posts/lang (unblocks the unreachable pagination
        //     branch in blog/+page.server.ts), and
        //   - the new /go/plan, 404 and legacy_redirect branches in
        //     hooks.server.ts have dedicated tests.
        'src/lib/server/**': {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
        'src/routes/**/+page.server.ts': {
          lines: 78,
          functions: 78,
          branches: 75,
          statements: 78,
        },
        'src/hooks.server.ts': {
          lines: 78,
          functions: 78,
          branches: 78,
          statements: 78,
        },
        'src/**': {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
      },
    },
  },
});
