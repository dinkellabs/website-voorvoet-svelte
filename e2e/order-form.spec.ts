/**
 * Order insoles form spec.
 *
 * Fills and submits the order form for all 3 insole types and quantities 1–3.
 * TURNSTILE_ENABLED=false so Turnstile is a hidden field with value "disabled".
 */

import { test, expect } from '@playwright/test';
import { clearInbox, waitForInbox } from './helpers.ts';

const INSOLE_TYPES = ['Dagelijkse zolen', 'Sportzolen', 'Zolen voor werkschoenen'] as const;

async function fillAndSubmitOrder(
  page: import('@playwright/test').Page,
  options: { insoleType: string; quantity: number; url?: string },
) {
  const url = options.url ?? '/nl/zolen-bestellen';
  await page.goto(url);
  await page.waitForSelector('form.order-form');
  await page.waitForLoadState('networkidle');
  // Hydration race: wait until use:enhance has attached. We detect this by
  // dispatching a synthetic, non-submit-triggering click on a sentinel and
  // checking that the form has at least one submit-event listener installed
  // by polling for a known side effect. The pragmatic substitute is a longer
  // explicit wait; enhance attaches on mount which is well within 3 s.
  await page.waitForTimeout(3000);

  await page.fill('#first_name', 'Jan');
  await page.fill('#last_name', 'Jansen');
  await page.fill('#email', 'jan@jansen.nl');
  await page.fill('#birth_date', '01-01-1985');
  await page.selectOption('#quantity', String(options.quantity));
  await page.check(`input[name="insole_type"][value="${options.insoleType}"]`);

  await page.click('button[type="submit"]');
}

// Form submissions hit the per-IP rate limiter (5 per 10m); run serially so a
// parallel run inside this spec doesn't trip the limiter and flake.
test.describe.configure({ mode: 'serial' });

test.describe('Order insoles form', () => {
  test.beforeEach(() => clearInbox());

  for (const insoleType of INSOLE_TYPES) {
    test(`nl/zolen-bestellen: insole type "${insoleType}" with quantity 1`, async ({ page }) => {
      await fillAndSubmitOrder(page, { insoleType, quantity: 1 });

      const toast = page.locator('.toast', { hasText: 'Bedankt voor je bestelling' });
      await expect(toast).toBeVisible({ timeout: 10_000 });

      const inbox = await waitForInbox(1);
      const mail = inbox.find((m) => m.subject.includes('Jan Jansen'));
      expect(mail).toBeTruthy();
      expect(mail!.subject).toContain('Nieuw bestelling extra paar zolen');
    });
  }

  test('quantity 2 works', async ({ page }) => {
    await fillAndSubmitOrder(page, { insoleType: 'Sportzolen', quantity: 2 });
    const toast = page.locator('.toast', { hasText: 'Bedankt voor je bestelling' });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  });

  test('quantity 3 works', async ({ page }) => {
    await fillAndSubmitOrder(page, { insoleType: 'Dagelijkse zolen', quantity: 3 });
    const toast = page.locator('.toast', { hasText: 'Bedankt voor je bestelling' });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  });

  test('de/einlagen-bestellen shows German success toast', async ({ page }) => {
    await fillAndSubmitOrder(page, {
      insoleType: 'Sportzolen',
      quantity: 1,
      url: '/de/einlagen-bestellen',
    });
    const toast = page.locator('.toast', { hasText: 'Vielen Dank für Ihre Bestellung' });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  });

  test('en/order-insoles shows English success toast', async ({ page }) => {
    await fillAndSubmitOrder(page, {
      insoleType: 'Dagelijkse zolen',
      quantity: 1,
      url: '/en/order-insoles',
    });
    const toast = page.locator('.toast', { hasText: 'Thank you for your order' });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  });
});
