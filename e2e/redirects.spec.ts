/**
 * REQUIREMENTS §3.10 — Default redirects.
 *
 * Each bare path without a language prefix must redirect (3xx) to its Dutch
 * equivalent.  We follow redirects and assert the final URL.
 */

import { test, expect } from '@playwright/test';

const REDIRECTS: Array<{ from: string; to: string }> = [
  { from: '/', to: '/nl' },
  { from: '/contact', to: '/nl/contact' },
  { from: '/blog', to: '/nl/blog' },
  { from: '/informatie', to: '/nl/informatie' },
  { from: '/vergoedingen', to: '/nl/vergoedingen' },
  { from: '/zolen-bestellen', to: '/nl/zolen-bestellen' },
  { from: '/credits', to: '/nl/credits' },
];

for (const { from, to } of REDIRECTS) {
  test(`GET ${from} → ${to}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(to.replace(/\//g, '\\/') + '($|\\?)'));
  });
}
