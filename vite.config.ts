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
        // Branch threshold for +page.server.ts is calibrated to 78 because one
        // pagination redirect branch in blog/+page.server.ts (when safePage > 1
        // is forced by a query string and there are >POSTS_PER_PAGE posts) is
        // unreachable until we have 7+ blog posts per lang. Raise to 80 when
        // the content reaches that bar.
        'src/lib/server/**': {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
        'src/routes/**/+page.server.ts': {
          lines: 80,
          functions: 80,
          branches: 78,
          statements: 80,
        },
        'src/hooks.server.ts': {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
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
