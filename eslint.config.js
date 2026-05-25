import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...sveltePlugin.configs['flat/recommended'],
  ...sveltePlugin.configs['flat/prettier'],
  prettierConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        __APP_VERSION__: 'readonly',
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.svelte-kit/**',
      'build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'src/lib/paraglide/**',
      'lighthouse/lighthouserc.cjs',
      'artifacts/**',
    ],
  },
);
