/**
 * Shared helpers for E2E specs.
 */

import * as fs from 'fs';
import { INBOX_FILE } from './global-setup.ts';
import type { SmtpMessage } from './global-setup.ts';

export const BASE = 'http://localhost:3000';

/** All top-level page routes per language. */
export const TOP_LEVEL_ROUTES = {
  nl: [
    '/nl',
    '/nl/informatie',
    '/nl/vergoedingen',
    '/nl/contact',
    '/nl/zolen-bestellen',
    '/nl/blog',
    '/nl/credits',
  ],
  de: [
    '/de',
    '/de/informationen',
    '/de/erstattungen',
    '/de/kontakt',
    '/de/einlagen-bestellen',
    '/de/blog',
    '/de/credits',
  ],
  en: [
    '/en',
    '/en/information',
    '/en/reimbursements',
    '/en/contact',
    '/en/order-insoles',
    '/en/blog',
    '/en/credits',
  ],
} as const;

/** All pages across all languages (flat). */
export const ALL_PAGES: string[] = [
  ...TOP_LEVEL_ROUTES.nl,
  ...TOP_LEVEL_ROUTES.de,
  ...TOP_LEVEL_ROUTES.en,
];

/** Blog post slugs per language. */
export const BLOG_SLUGS = {
  nl: [
    'podotherapeut-of-podoloog',
    'steunzolen-of-podotherapeutische-zolen',
    'zonder-voetklachten',
  ],
  de: [
    'podotherapeut-oder-podologe',
    'stuetzeinlagen-oder-podotherapeutische-einlagen',
    'ohne-fussbeschwerden',
  ],
  en: [
    'podiatrist-or-podologist',
    'orthotic-insoles-or-podiatric-insoles',
    'without-foot-complaints',
  ],
} as const;

export function clearInbox() {
  fs.writeFileSync(INBOX_FILE, '[]');
}

export function readInbox(): SmtpMessage[] {
  if (!fs.existsSync(INBOX_FILE)) return [];
  return JSON.parse(fs.readFileSync(INBOX_FILE, 'utf-8')) as SmtpMessage[];
}

/**
 * Polls the inbox JSON file until at least `expectedCount` messages have been
 * written (the success toast appears before nodemailer flushes to disk).
 * Replaces the previous fixed `page.waitForTimeout(500)` race.
 */
export async function waitForInbox(expectedCount = 1, timeoutMs = 5000): Promise<SmtpMessage[]> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const inbox = readInbox();
    if (inbox.length >= expectedCount) return inbox;
    await new Promise((r) => setTimeout(r, 50));
  }
  return readInbox();
}
