/**
 * Order insoles form spec.
 *
 * Fills and submits the order form for all 3 insole types and quantities 1–3.
 * CAP_ENABLED=false so the Cap widget is replaced by a hidden capToken="disabled" field.
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

  test('accepts loosened birth_date separators (single-digit + slash)', async ({ page }) => {
    await page.goto('/nl/zolen-bestellen');
    await page.waitForSelector('form.order-form');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.fill('#first_name', 'Eva');
    await page.fill('#last_name', 'Visser');
    await page.fill('#email', 'eva@visser.nl');
    // Loosened format: single-digit day/month with slashes.
    await page.fill('#birth_date', '1/1/1985');
    await page.selectOption('#quantity', '1');
    // insole_type defaults to "Dagelijkse zolen" — no need to click.

    await page.click('button[type="submit"]');

    const toast = page.locator('.toast', { hasText: 'Bedankt voor je bestelling' });
    await expect(toast).toBeVisible({ timeout: 10_000 });

    const inbox = await waitForInbox(1);
    const mail = inbox.find((m) => m.subject.includes('Eva Visser'));
    expect(mail).toBeTruthy();
    // Normalised in the order email regardless of separator chosen by the user.
    expect(mail!.text).toContain('01-01-1985');
  });

  test('empty submit shows the form-errors summary and stays on the page', async ({ page }) => {
    await page.goto('/nl/zolen-bestellen');
    await page.waitForSelector('form.order-form');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Strip HTML5 `required` attrs so the click reaches the JS submit
    // handler — we want to verify the JS-level error feedback, not the
    // browser-native one (which we already get for free).
    await page.evaluate(() => {
      document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
    });

    await page.click('button[type="submit"]');

    const summary = page.locator('.form-summary--error');
    await expect(summary).toBeVisible({ timeout: 5_000 });

    // Should not have navigated or shown the success toast.
    expect(page.url()).toContain('/nl/zolen-bestellen');
    await expect(page.locator('.toast', { hasText: 'Bedankt voor je bestelling' })).toHaveCount(0);
  });

  test('browser-native required popup uses the localized NL message', async ({ page }) => {
    await page.goto('/nl/zolen-bestellen');
    await page.waitForSelector('form.order-form');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Trigger HTML5 validation on the empty first_name input — the
    // localizedValidity action runs inside the `invalid` event handler
    // and replaces the browser's English default with the NL string.
    const message = await page.evaluate(() => {
      const input = document.getElementById('first_name') as HTMLInputElement;
      input.value = '';
      input.checkValidity();
      return input.validationMessage;
    });
    expect(message).toBe('Dit veld is verplicht');
  });

  test('impossible date (45-05-1982) is rejected with the unreal-date message', async ({
    page,
  }) => {
    await page.goto('/nl/zolen-bestellen');
    await page.waitForSelector('form.order-form');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.fill('#first_name', 'Test');
    await page.fill('#last_name', 'Person');
    await page.fill('#email', 'test@example.nl');
    await page.fill('#birth_date', '45-05-1982');
    await page.selectOption('#quantity', '1');

    await page.click('button[type="submit"]');

    // Inline error for birth_date must appear with the new "this date
    // doesn't exist" copy — NOT the generic format hint.
    const birthDateGroup = page.locator('label[for="birth_date"]').locator('..');
    await expect(birthDateGroup.locator('.form-error')).toContainText(
      'Deze datum bestaat niet',
      { timeout: 5_000 },
    );
    // No success toast — submission must have been blocked.
    await expect(page.locator('.toast', { hasText: 'Bedankt voor je bestelling' })).toHaveCount(0);
  });
});
