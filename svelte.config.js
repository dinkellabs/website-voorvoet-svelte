import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import remarkButton from './src/lib/blog/remark-button.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const APP_VERSION = readFileSync(join(__dirname, 'VERSION'), 'utf8').trim();

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: ['.md', '.svx'],
  layout: {
    blog: join(__dirname, 'src/lib/blog/layouts/BlogPostLayout.svelte'),
  },
  remarkPlugins: [remarkButton],
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md', '.svx'],
  preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
  kit: {
    adapter: adapter(),
    version: { name: APP_VERSION },
    // CSP. `mode: 'auto'` adds nonces in dev and SHA-256 hashes in
    // production builds for SvelteKit's own inline scripts (the hydration
    // bootstrapper, `__sveltekit_...` init blocks, JSON-LD, etc.). Without
    // this, the page renders SSR-only — no client hydration, no enhanced
    // forms, no toasts. Dynamic origins (Umami) are appended in
    // `hooks.server.ts` after SvelteKit sets the header.
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        // 'wasm-unsafe-eval' lets the cap-widget compile its proof-of-work
        // module via WebAssembly.compile(); without it, the widget falls
        // back to a much slower pure-JS solver.
        'script-src': ['self', "'wasm-unsafe-eval'"],
        // cap-widget spawns blob: Web Workers for parallel PoW solving.
        // Falls back to script-src when worker-src is unset, which is too
        // restrictive — declare it explicitly.
        'worker-src': ['self', 'blob:'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:'],
        'connect-src': ['self'],
        'frame-src': ['https://www.google.com'],
        'font-src': ['self'],
        'object-src': ['none'],
        'base-uri': ['self'],
        'form-action': ['self'],
        'frame-ancestors': ['none'],
        'report-uri': ['/csp-report'],
      },
    },
  },
};

export default config;
