/**
 * Contact form spec.
 *
 * Fills and submits the NL contact form with TURNSTILE_ENABLED=false (auto-pass).
 * Asserts:
 *   - Success toast appears with the correct Dutch message.
 *   - The SMTP catcher received an email with the expected subject line.
 */

import { test, expect } from '@playwright/test';
import { clearInbox, waitForInbox } from './helpers.ts';

// Form submissions hit the per-IP rate limiter (5 per 10m); run serially so a
// parallel run inside this spec doesn't trip the limiter and flake.
test.describe.configure({ mode: 'serial' });

test.describe('Contact form', () => {
  test.beforeEach(() => clearInbox());

  test('fill and submit nl/contact → success toast + email delivered', async ({ page }) => {
    await page.goto('/nl/contact');
    await page.waitForSelector('form.contact-form');

    // Select request type "Contact per email"
    await page.selectOption('#request_type', 'Contact per email');

    await page.fill('#name', 'Test Gebruiker');
    await page.fill('#email', 'test@voorbeeld.nl');
    await page.fill('#phone', '0612345678');
    await page.fill('#description', 'Dit is een testbericht van de E2E suite.');

    await page.click('button[type="submit"]');

    // Expect the success toast
    const toast = page.locator('.toast', { hasText: 'Bedankt voor je bericht' });
    await expect(toast).toBeVisible({ timeout: 10_000 });

    const inbox = await waitForInbox(1);
    expect(inbox.length).toBeGreaterThanOrEqual(1);

    const mail = inbox.find((m) => m.subject.includes('Contact per email'));
    expect(mail).toBeTruthy();
    expect(mail!.subject).toContain('Nieuw contactformulier');
  });

  test('fill and submit nl/contact with "Bel mij terug" request type', async ({ page }) => {
    await page.goto('/nl/contact');
    await page.waitForSelector('form.contact-form');

    await page.selectOption('#request_type', 'Bel mij terug');
    await page.fill('#name', 'Bel Mij');
    await page.fill('#email', 'bel@test.nl');
    await page.fill('#phone', '0612345678');
    await page.fill('#description', 'Graag terugbellen.');

    await page.click('button[type="submit"]');

    const toast = page.locator('.toast', { hasText: 'Bedankt voor je bericht' });
    await expect(toast).toBeVisible({ timeout: 10_000 });

    const inbox = await waitForInbox(1);
    const mail = inbox.find((m) => m.subject.includes('Bel mij terug'));
    expect(mail).toBeTruthy();
  });

  test('de/kontakt form submits and shows German success toast', async ({ page }) => {
    await page.goto('/de/kontakt');
    await page.waitForSelector('form.contact-form');

    await page.selectOption('#request_type', 'Contact per email');
    await page.fill('#name', 'Test Nutzer');
    await page.fill('#email', 'test@beispiel.de');
    await page.fill('#phone', '0612345678');
    await page.fill('#description', 'Das ist eine Testnachricht.');

    await page.click('button[type="submit"]');

    const toast = page.locator('.toast', { hasText: 'Vielen Dank' });
    await expect(toast).toBeVisible({ timeout: 10_000 });
  });
});
