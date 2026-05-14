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
  },
};

export default config;
