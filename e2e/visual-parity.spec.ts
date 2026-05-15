/**
 * Visual parity spec: captures screenshots from the OLD Reflex site and the NEW
 * SvelteKit site for every (page × lang × viewport) tuple, computes pixel diffs
 * using pixelmatch, and writes a report + acceptance doc.
 *
 * MANUAL ONE-SHOT — do not schedule in CI. The single test reports tuples
 * above 2% pixel diff but does NOT fail on them; it's a migration aid, not a
 * regression gate. Skips automatically when the OLD site directory isn't
 * present (i.e. on any machine but the developer's during migration).
 *
 * Ports used by this spec (independent of playwright.config.ts webServer):
 *   NEW SvelteKit  → http://localhost:3001
 *   OLD Reflex     → http://localhost:3002  (forced via --frontend-port 3002)
 *
 * Override the OLD checkout location with $OLD_SITE_DIR; defaults to a
 * sibling `../voorvoet-website` directory.
 */

import { test, expect } from '@playwright/test';
import { chromium, type Browser, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  buildUrl,
  captureScreenshot,
  computeDiff,
  ensureDir,
  writePng,
  VIEWPORTS,
  LANGS,
  PAGE_KEYS,
  type Lang,
  type PageKey,
  type ViewportName,
} from './visual-parity-helpers.js';

const NEW_BASE = 'http://localhost:3001';
const OLD_BASE = 'http://localhost:3002';

const DIFF_DIR = path.resolve('e2e/visual-parity/diffs');
const REPORT_PATH = path.resolve('e2e/visual-parity/visual_report.md');
const ACCEPTANCE_PATH = path.resolve('e2e/visual-parity/visual_acceptance.md');

interface TupleResult {
  page: PageKey;
  lang: Lang;
  viewport: ViewportName;
  percentDiff: number;
  oldPngPath: string;
  newPngPath: string;
  diffPngPath: string;
  error?: string;
}

let oldServer: ChildProcess | null = null;
let newServer: ChildProcess | null = null;
let browser: Browser;
const results: TupleResult[] = [];

async function waitForServer(
  url: string,
  timeoutMs: number = 120000,
  intervalMs: number = 1500,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok || res.status < 500) {
        return;
      }
    } catch {
      // server not yet ready — keep polling
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

function spawnServer(
  command: string,
  args: string[],
  cwd: string,
  env: Record<string, string> = {},
): ChildProcess {
  const proc = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  const label = path.basename(cwd);
  proc.stdout?.on('data', (d: Buffer) => process.stdout.write(`[${label}] ${d}`));
  proc.stderr?.on('data', (d: Buffer) => process.stderr.write(`[${label}] ${d}`));

  return proc;
}

test.describe.configure({ mode: 'serial' });

const OLD_SITE_DIR = process.env['OLD_SITE_DIR'] ?? path.resolve('..', 'voorvoet-website');

test.beforeAll(async () => {
  test.skip(
    !fs.existsSync(OLD_SITE_DIR),
    `visual-parity: OLD site dir not found at ${OLD_SITE_DIR}. ` +
      `Set OLD_SITE_DIR=<path> or run from a checkout that has the sibling repo.`,
  );

  const newSiteDir = path.resolve('.');
  const oldSiteDir = OLD_SITE_DIR;

  newServer = spawnServer('node', ['build/index.js'], newSiteDir, {
    PORT: '3001',
    HOST: '0.0.0.0',
    CAP_ENABLED: 'false',
    CAP_DUMMY_MODE: 'always_pass',
    CAP_SECRET: '0000000000000000000000000000000000000000000000000000000000000000',
    PUBLIC_CAP_API_ENDPOINT: '',
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: '2525',
    SMTP_USERNAME: 'test',
    SMTP_PASSWORD: 'test',
    SMTP_FROM_EMAIL: 'noreply@test.local',
    SMTP_TO_EMAIL: 'inbox@test.local',
    SITE_URL: 'http://localhost:3001',
    PUBLIC_SITE_URL: 'http://localhost:3001',
    NODE_TLS_REJECT_UNAUTHORIZED: '0',
  });

  oldServer = spawnServer(
    'uv',
    ['run', 'reflex', 'run', '--env', 'dev', '--frontend-only', '--frontend-port', '3002'],
    oldSiteDir,
  );

  await Promise.all([waitForServer(NEW_BASE, 30000), waitForServer(OLD_BASE, 120000)]);

  browser = await chromium.launch();
  console.log('[visual-parity] Both servers ready. Starting captures.');
});

test.afterAll(async () => {
  await browser?.close();

  if (newServer) {
    newServer.kill('SIGTERM');
    newServer = null;
  }
  if (oldServer) {
    oldServer.kill('SIGTERM');
    oldServer = null;
  }

  writeReport(results);
  writeAcceptanceDoc(results);
});

test('visual parity across all page × lang × viewport tuples', async () => {
  for (const viewport of VIEWPORTS) {
    for (const lang of LANGS) {
      for (const pageKey of PAGE_KEYS) {
        const oldUrl = buildUrl(OLD_BASE, pageKey, lang);
        const newUrl = buildUrl(NEW_BASE, pageKey, lang);
        const label = `${pageKey}/${lang}/${viewport.name}`;

        const langDir = path.join(DIFF_DIR, lang);
        ensureDir(langDir);

        const baseName = `${pageKey}_${viewport.name}`;
        const oldPngPath = path.join(langDir, `${baseName}.old.png`);
        const newPngPath = path.join(langDir, `${baseName}.new.png`);
        const diffPngPath = path.join(langDir, `${baseName}.diff.png`);

        let percentDiff = 0;
        let errorMsg: string | undefined;

        try {
          const oldPage: Page = await browser.newPage();
          const newPage: Page = await browser.newPage();

          let oldImg: Buffer;
          let newImg: Buffer;

          try {
            [oldImg, newImg] = await Promise.all([
              captureScreenshot(oldPage, oldUrl, viewport),
              captureScreenshot(newPage, newUrl, viewport),
            ]);
          } finally {
            await oldPage.close();
            await newPage.close();
          }

          writePng(oldPngPath, oldImg);
          writePng(newPngPath, newImg);

          const diffResult = computeDiff(oldImg, newImg);
          percentDiff = diffResult.percentDiff;
          writePng(diffPngPath, diffResult.diffPng);

          const flag = percentDiff > 2 ? ' *** ABOVE 2%' : '';
          console.log(`[${label}] diff=${percentDiff.toFixed(2)}%${flag}`);
        } catch (err) {
          errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`[${label}] ERROR: ${errorMsg}`);
        }

        results.push({
          page: pageKey,
          lang,
          viewport: viewport.name,
          percentDiff,
          oldPngPath,
          newPngPath,
          diffPngPath,
          error: errorMsg,
        });
      }
    }
  }

  const crashed = results.filter((r) => r.error);
  if (crashed.length > 0) {
    const summary = crashed
      .map((r) => `${r.page}/${r.lang}/${r.viewport}: ${r.error}`)
      .join('\n  ');
    expect.soft(false, `${crashed.length} tuple(s) errored:\n  ${summary}`).toBe(true);
  }
});

function writeReport(results: TupleResult[]): void {
  ensureDir(path.dirname(REPORT_PATH));

  const aboveThreshold = results.filter((r) => !r.error && r.percentDiff > 2);
  const errors = results.filter((r) => r.error);

  const lines: string[] = [
    '# Visual Parity Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `**Total tuples**: ${results.length}`,
    `**Above 2% diff**: ${aboveThreshold.length}`,
    `**Errors / skipped**: ${errors.length}`,
    '',
    '## All Tuples',
    '',
    '| Page | Lang | Viewport | % Diff | Status |',
    '| ---- | ---- | -------- | ------: | ------ |',
  ];

  for (const r of results) {
    let status: string;
    if (r.error) {
      status = `ERROR: ${r.error.slice(0, 80)}`;
    } else if (r.percentDiff > 2) {
      status = `REVIEW`;
    } else {
      status = `OK`;
    }
    lines.push(
      `| ${r.page} | ${r.lang} | ${r.viewport} | ${r.percentDiff.toFixed(2)} | ${status} |`,
    );
  }

  if (aboveThreshold.length > 0) {
    lines.push('', '## Tuples Above 2% Threshold', '');
    for (const r of aboveThreshold) {
      lines.push(
        `### ${r.page} / ${r.lang} / ${r.viewport}`,
        '',
        `- **% diff**: ${r.percentDiff.toFixed(2)}%`,
        `- OLD: \`${r.oldPngPath}\``,
        `- NEW: \`${r.newPngPath}\``,
        `- Diff: \`${r.diffPngPath}\``,
        '',
      );
    }
  }

  if (errors.length > 0) {
    lines.push('', '## Errors', '');
    for (const r of errors) {
      lines.push(`- **${r.page}/${r.lang}/${r.viewport}**: ${r.error}`);
    }
    lines.push('');
  }

  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf-8');
  console.log(`[visual-parity] Report written to ${REPORT_PATH}`);
}

function writeAcceptanceDoc(results: TupleResult[]): void {
  ensureDir(path.dirname(ACCEPTANCE_PATH));

  const aboveThreshold = results.filter((r) => !r.error && r.percentDiff > 2);
  const errors = results.filter((r) => r.error);

  const lines: string[] = [
    '# Visual Acceptance Notes',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'This document lists every (page × lang × viewport) tuple where pixel diff exceeded 2%.',
    'Each entry requires either a SvelteKit source fix or an explicit acceptance note.',
    '',
    '> **For the orchestrator**: items marked `NEEDS_REVIEW` require a decision.',
    '> Items marked `ACCEPTED` have an agreed rationale and can be closed.',
    '',
  ];

  if (aboveThreshold.length === 0 && errors.length === 0) {
    lines.push('All tuples are within the 2% threshold. No acceptance notes required.', '');
  }

  if (aboveThreshold.length > 0) {
    lines.push('## Tuples Above 2% — Pending Review', '');
    for (const r of aboveThreshold) {
      lines.push(
        `### ${r.page} / ${r.lang} / ${r.viewport}`,
        '',
        `**% diff**: ${r.percentDiff.toFixed(2)}%`,
        '',
        `**Status**: NEEDS_REVIEW`,
        '',
        `**Diff image**: \`${r.diffPngPath}\``,
        '',
        `**Rationale**: _Inspect diff image. Common causes: font rendering timing,`,
        `dynamic content (maps/iframes), scroll animations, date/time fields._`,
        '',
      );
    }
  }

  if (errors.length > 0) {
    lines.push('## Errored Tuples', '');
    for (const r of errors) {
      lines.push(
        `### ${r.page} / ${r.lang} / ${r.viewport}`,
        '',
        `**Error**: ${r.error}`,
        '',
        `**Status**: NEEDS_INVESTIGATION`,
        '',
      );
    }
  }

  fs.writeFileSync(ACCEPTANCE_PATH, lines.join('\n'), 'utf-8');
  console.log(`[visual-parity] Acceptance doc written to ${ACCEPTANCE_PATH}`);
}
