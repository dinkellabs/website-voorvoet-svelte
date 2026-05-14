import { type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export type Lang = 'nl' | 'de' | 'en';
export type PageKey =
  | 'home'
  | 'information'
  | 'reimbursements'
  | 'contact'
  | 'order_insoles'
  | 'blog'
  | 'credits';

export type ViewportName = 'mobile' | 'tablet' | 'desktop';

export interface ViewportDef {
  name: ViewportName;
  width: number;
  height: number;
}

export const VIEWPORTS: ViewportDef[] = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

export const LANGS: Lang[] = ['nl', 'de', 'en'];

export const PAGE_KEYS: PageKey[] = [
  'home',
  'information',
  'reimbursements',
  'contact',
  'order_insoles',
  'blog',
  'credits',
];

const ROUTE_MAP: Record<PageKey, Record<Lang, string>> = {
  home: { nl: '/nl', de: '/de', en: '/en' },
  information: {
    nl: '/nl/informatie',
    de: '/de/informationen',
    en: '/en/information',
  },
  reimbursements: {
    nl: '/nl/vergoedingen',
    de: '/de/erstattungen',
    en: '/en/reimbursements',
  },
  contact: { nl: '/nl/contact', de: '/de/kontakt', en: '/en/contact' },
  order_insoles: {
    nl: '/nl/zolen-bestellen',
    de: '/de/einlagen-bestellen',
    en: '/en/order-insoles',
  },
  blog: { nl: '/nl/blog', de: '/de/blog', en: '/en/blog' },
  credits: { nl: '/nl/credits', de: '/de/credits', en: '/en/credits' },
};

export function buildUrl(baseUrl: string, page: PageKey, lang: Lang): string {
  return `${baseUrl}${ROUTE_MAP[page][lang]}`;
}

export async function captureScreenshot(
  browserPage: Page,
  url: string,
  viewport: ViewportDef,
): Promise<Buffer> {
  await browserPage.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });

  // Use 'load' as primary wait strategy to avoid hanging on pages with iframes
  // (Turnstile captcha, Google Maps) that never reach 'networkidle'.
  // After load, give a generous settle window for fonts and lazy images.
  await browserPage.goto(url, { waitUntil: 'load', timeout: 60000 });
  await browserPage.evaluate(() => document.fonts.ready);

  // Extra 1500ms settle: lets lazy-loaded images and CSS transitions finish.
  await browserPage.waitForTimeout(1500);

  return await browserPage.screenshot({ fullPage: true });
}

export interface DiffResult {
  numDiffPixels: number;
  totalPixels: number;
  percentDiff: number;
  diffPng: Buffer;
}

export function computeDiff(imgA: Buffer, imgB: Buffer): DiffResult {
  const pngA = PNG.sync.read(imgA);
  const pngB = PNG.sync.read(imgB);

  const width = Math.max(pngA.width, pngB.width);
  const height = Math.max(pngA.height, pngB.height);

  const normA = normalizePng(pngA, width, height);
  const normB = normalizePng(pngB, width, height);

  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(normA.data, normB.data, diff.data, width, height, {
    threshold: 0.1,
  });

  const totalPixels = width * height;
  const percentDiff = (numDiffPixels / totalPixels) * 100;
  const diffPng = PNG.sync.write(diff);

  return { numDiffPixels, totalPixels, percentDiff, diffPng };
}

function normalizePng(png: PNG, targetWidth: number, targetHeight: number): PNG {
  if (png.width === targetWidth && png.height === targetHeight) {
    return png;
  }
  const normalized = new PNG({ width: targetWidth, height: targetHeight });
  normalized.data.fill(255);
  PNG.bitblt(png, normalized, 0, 0, png.width, png.height, 0, 0);
  return normalized;
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writePng(filePath: string, data: Buffer): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
}
