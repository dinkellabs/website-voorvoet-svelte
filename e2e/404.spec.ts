/**
 * 404 page spec.
 *
 * Non-existent routes must render the custom error page (status 404) with a
 * hero section and a link back to home.
 */

import { test, expect } from '@playwright/test';

const NON_EXISTENT_ROUTES = [
  '/this-route-does-not-exist',
  '/nl/nonexistent-page',
  '/de/diese-seite-gibt-es-nicht',
];

for (const route of NON_EXISTENT_ROUTES) {
  test(`404 page renders for ${route}`, async ({ page }) => {
    const response = await page.goto(route);

    // HTTP status must be 404
    expect(response?.status()).toBe(404);

    // The error page renders the 404 code
    await expect(page.locator('.error-page__code')).toContainText('404');

    // A back link to home must be present
    const backLink = page.locator('.error-page__back');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });
}
