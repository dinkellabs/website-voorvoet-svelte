/**
 * SEO spec.
 *
 * For every page in every language, asserts:
 *   - <title> matches the expected string from PAGE_TITLES
 *   - <meta name="description"> is present and non-empty
 *   - <link rel="canonical"> is present
 *   - <meta property="og:title"> is present
 *   - Full hreflang set (nl, de, en, x-default)
 *
 * For the home page, additionally asserts that JSON-LD contains Organization
 * and MedicalBusiness structured data.
 *
 * For a blog post, additionally asserts BlogPosting + BreadcrumbList JSON-LD.
 */

import { test, expect } from '@playwright/test';
import { PAGE_TITLES } from '../src/lib/i18n/page-meta.js';
import { ROUTE_MAP } from '../src/lib/i18n/route-map.js';
import { BLOG_SLUGS } from './helpers.ts';

type Lang = 'nl' | 'de' | 'en';

const PAGE_KEYS = [
  'home',
  'information',
  'reimbursements',
  'contact',
  'order_insoles',
  'blog',
  'credits',
] as const;

const LANGS: Lang[] = ['nl', 'de', 'en'];

async function getJsonLdTypes(page: import('@playwright/test').Page): Promise<string[]> {
  const scripts = await page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((el) => el.textContent ?? ''),
  );
  const types: string[] = [];
  for (const raw of scripts) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        for (const item of parsed as Record<string, unknown>[]) {
          if (item['@type']) types.push(item['@type'] as string);
        }
      } else {
        const item = parsed as Record<string, unknown>;
        if (item['@type']) types.push(item['@type'] as string);
      }
    } catch {
      // malformed JSON-LD
    }
  }
  return types;
}

for (const pageKey of PAGE_KEYS) {
  for (const lang of LANGS) {
    const url = ROUTE_MAP[pageKey][lang];
    test(`SEO: ${url}`, async ({ page }) => {
      await page.goto(url);

      // Title
      const expectedTitle = PAGE_TITLES[lang][pageKey];
      await expect(page).toHaveTitle(
        new RegExp(expectedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );

      // Meta description
      const desc = page.locator('meta[name="description"]');
      await expect(desc).toHaveCount(1);
      const descContent = await desc.getAttribute('content');
      expect(descContent?.length).toBeGreaterThan(10);

      // Canonical
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);

      // OG title
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveCount(1);

      // Hreflang set
      for (const hLang of ['nl', 'de', 'en', 'x-default']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${hLang}"]`)).toHaveCount(1);
      }

      // html[lang]
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    });
  }
}

test('Home page has Organization + MedicalBusiness JSON-LD', async ({ page }) => {
  await page.goto('/nl');
  const types = await getJsonLdTypes(page);
  expect(types).toContain('Organization');
  expect(types).toContain('MedicalBusiness');
});

test('Blog post has BlogPosting + BreadcrumbList JSON-LD', async ({ page }) => {
  await page.goto(`/nl/blog/${BLOG_SLUGS.nl[0]}`);
  const types = await getJsonLdTypes(page);
  expect(types).toContain('BlogPosting');
  expect(types).toContain('BreadcrumbList');
});

test('OG type is "website" on info page', async ({ page }) => {
  await page.goto('/nl/informatie');
  const ogType = page.locator('meta[property="og:type"]');
  await expect(ogType).toHaveAttribute('content', 'website');
});

test('Twitter card is summary_large_image', async ({ page }) => {
  await page.goto('/nl');
  const twitterCard = page.locator('meta[name="twitter:card"]');
  await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
});
