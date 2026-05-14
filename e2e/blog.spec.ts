/**
 * Blog spec.
 *
 * - Blog index → click post card → assert hreflang translations → back to index.
 * - 3 posts exist, no pagination (POSTS_PER_PAGE=6 and only 3 posts exist).
 * - For each language variant of the first blog post, assert hreflang links
 *   point to the correct translated slugs.
 */

import { test, expect } from '@playwright/test';
import { BLOG_SLUGS } from './helpers.ts';

const LANGUAGES = ['nl', 'de', 'en'] as const;

const BLOG_ROUTES: Record<string, string> = {
  nl: '/nl/blog',
  de: '/de/blog',
  en: '/en/blog',
};

const FIRST_POST_SLUG: Record<string, string> = {
  nl: BLOG_SLUGS.nl[0],
  de: BLOG_SLUGS.de[0],
  en: BLOG_SLUGS.en[0],
};

test.describe('Blog index', () => {
  for (const lang of LANGUAGES) {
    test(`${lang} blog index shows 3 posts`, async ({ page }) => {
      await page.goto(BLOG_ROUTES[lang]!);
      // Blog index uses the horizontal BlogCard variant (`.blog-card-h`).
      const cards = page.locator('.blog-card-h');
      await expect(cards).toHaveCount(3);
    });

    test(`${lang} blog index has no pagination (3 posts < 6 per page)`, async ({ page }) => {
      await page.goto(BLOG_ROUTES[lang]!);
      await expect(page.locator('.blog-pagination')).toHaveCount(0);
    });
  }
});

test.describe('Blog post navigation', () => {
  for (const lang of LANGUAGES) {
    test(`${lang}: index → first post → back to index`, async ({ page }) => {
      await page.goto(BLOG_ROUTES[lang]!);

      // Click the first blog card's read-more link
      const firstCard = page.locator('.blog-card-h').first();
      const readMoreLink = firstCard.locator('a').first();
      const postHref = await readMoreLink.getAttribute('href');
      expect(postHref).toMatch(new RegExp(`/${lang}/blog/`));

      await readMoreLink.click();
      await page.waitForURL(new RegExp(`/${lang}/blog/`));

      // Assert hreflang links: nl, de, en, x-default
      for (const hLang of ['nl', 'de', 'en', 'x-default']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${hLang}"]`)).toHaveCount(1);
      }

      // Go back to blog index
      const backLink = page.locator('a[href*="/blog"]:not([href*="/blog/"])').first();
      await backLink.click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/blog`));
    });

    test(`${lang}: blog post hreflang points to correct translated slugs`, async ({ page }) => {
      await page.goto(`${BLOG_ROUTES[lang]!}/${FIRST_POST_SLUG[lang]}`);

      // NL translation must point at /nl/blog/podotherapeut-of-podoloog
      const nlLink = page.locator('link[rel="alternate"][hreflang="nl"]');
      await expect(nlLink).toHaveAttribute('href', /\/nl\/blog\/podotherapeut-of-podoloog/);

      // DE translation
      const deLink = page.locator('link[rel="alternate"][hreflang="de"]');
      await expect(deLink).toHaveAttribute('href', /\/de\/blog\/podotherapeut-oder-podologe/);

      // EN translation
      const enLink = page.locator('link[rel="alternate"][hreflang="en"]');
      await expect(enLink).toHaveAttribute('href', /\/en\/blog\/podiatrist-or-podologist/);
    });
  }
});
