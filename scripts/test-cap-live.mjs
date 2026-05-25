// Standalone end-to-end check for the live Cap (capjs-core) pipeline.
//
// Boots its own SMTP catcher + node build/index.js server with
// CAP_ENABLED=true, drives /nl/contact in a real Chromium via Playwright,
// triggers the widget's solve() method (real proof-of-work), submits the
// form, and asserts on the success toast + delivered email.

import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs';
import * as net from 'node:net';
import * as tls from 'node:tls';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import selfsigned from 'selfsigned';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const APP_PORT = 3097;
const SMTP_PORT = 2598;
const INBOX_PATH = path.join(ROOT, 'e2e', 'smtp-inbox.cap-live.json');
const CAP_SECRET = randomBytes(32).toString('hex');

let smtpServer;
let appServer;
let browser;
let failed = false;

function log(...args) {
  console.log('[cap-live]', ...args);
}

function fail(msg) {
  failed = true;
  console.error('[cap-live] FAIL:', msg);
}

function writeInbox(messages) {
  fs.writeFileSync(INBOX_PATH, JSON.stringify(messages, null, 2));
}

function readInbox() {
  if (!fs.existsSync(INBOX_PATH)) return [];
  return JSON.parse(fs.readFileSync(INBOX_PATH, 'utf-8'));
}

function extractSubject(raw) {
  const match = raw.match(/^Subject:\s*(.+)$/im);
  return match ? match[1].trim() : '';
}

function createSmtpHandler(socket) {
  let buffer = '';
  let from = '';
  const to = [];
  let inData = false;
  const dataLines = [];

  const send = (line) => {
    if (!socket.destroyed) socket.write(line + '\r\n');
  };

  socket.on('data', (chunk) => {
    buffer += chunk.toString();
    const parts = buffer.split('\r\n');
    buffer = parts.pop() ?? '';

    for (const line of parts) {
      if (inData) {
        if (line === '.') {
          inData = false;
          const raw = dataLines.join('\n');
          const subject = extractSubject(raw);
          const inbox = readInbox();
          inbox.push({ from, to: [...to], subject, data: raw });
          writeInbox(inbox);
          from = '';
          to.length = 0;
          dataLines.length = 0;
          send('250 OK: message accepted');
        } else {
          dataLines.push(line.startsWith('..') ? line.slice(1) : line);
        }
        continue;
      }

      const upper = line.toUpperCase().trimEnd();
      if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
        send('250-localhost');
        send('250 OK');
      } else if (upper.startsWith('AUTH')) {
        send('235 Authentication successful');
      } else if (upper.startsWith('MAIL FROM')) {
        const m = line.match(/MAIL FROM:\s*<([^>]*)>/i);
        from = m ? m[1] : '';
        send('250 OK');
      } else if (upper.startsWith('RCPT TO')) {
        const m = line.match(/RCPT TO:\s*<([^>]*)>/i);
        to.push(m ? m[1] : '');
        send('250 OK');
      } else if (upper === 'DATA') {
        inData = true;
        send('354 End data with <CR><LF>.<CR><LF>');
      } else if (upper === 'QUIT') {
        send('221 Bye');
        socket.end();
      } else if (upper === 'RSET') {
        from = '';
        to.length = 0;
        send('250 OK');
      } else if (upper.startsWith('NOOP')) {
        send('250 OK');
      } else {
        send('502 Command not implemented');
      }
    }
  });

  socket.on('error', () => {});
}

async function startSmtpCatcher() {
  writeInbox([]);
  const notAfter = new Date();
  notAfter.setFullYear(notAfter.getFullYear() + 1);
  const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    keySize: 2048,
    notAfterDate: notAfter,
  });
  const secureContext = tls.createSecureContext({ cert: pems.cert, key: pems.private });

  smtpServer = net.createServer((plain) => {
    let buf = '';
    let upgraded = false;
    const sendPlain = (line) => !plain.destroyed && plain.write(line + '\r\n');
    sendPlain('220 localhost SMTP catcher ready');
    plain.on('data', (chunk) => {
      if (upgraded) return;
      buf += chunk.toString();
      const parts = buf.split('\r\n');
      buf = parts.pop() ?? '';
      for (const line of parts) {
        const upper = line.toUpperCase().trimEnd();
        if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
          sendPlain('250-localhost');
          sendPlain('250 STARTTLS');
        } else if (upper === 'STARTTLS') {
          sendPlain('220 Ready to start TLS');
          upgraded = true;
          plain.removeAllListeners('data');
          const tlsSock = new tls.TLSSocket(plain, { isServer: true, secureContext });
          tlsSock.once('secure', () => createSmtpHandler(tlsSock));
          tlsSock.on('error', () => {});
        } else {
          sendPlain('502 Command not implemented before STARTTLS');
        }
      }
    });
    plain.on('error', () => {});
  });

  await new Promise((resolve, reject) => {
    smtpServer.listen(SMTP_PORT, '127.0.0.1', () => resolve());
    smtpServer.once('error', reject);
  });
  log(`SMTP catcher listening on ${SMTP_PORT}`);
}

function spawnAppServer() {
  appServer = spawn('node', ['build/index.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(APP_PORT),
      HOST: '127.0.0.1',
      ORIGIN: `http://localhost:${APP_PORT}`,
      E2E_DISABLE_RATE_LIMITER: 'true',
      CAP_ENABLED: 'true',
      CAP_SECRET,
      PUBLIC_CAP_API_ENDPOINT: '/api/cap/',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String(SMTP_PORT),
      SMTP_USERNAME: 'test',
      SMTP_PASSWORD: 'test',
      SMTP_FROM_EMAIL: 'noreply@test.local',
      SMTP_TO_EMAIL: 'inbox@test.local',
      SITE_URL: `http://localhost:${APP_PORT}`,
      PUBLIC_SITE_URL: `http://localhost:${APP_PORT}`,
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  appServer.stdout?.on('data', (d) => process.stdout.write(`[app] ${d}`));
  appServer.stderr?.on('data', (d) => process.stderr.write(`[app] ${d}`));
}

async function waitForReady(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status < 500) return;
    } catch {
      // Server not yet listening — retry until deadline.
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server at ${url} not ready within ${timeoutMs}ms`);
}

async function cleanup() {
  if (browser) await browser.close().catch(() => {});
  if (appServer) appServer.kill('SIGTERM');
  if (smtpServer) await new Promise((r) => smtpServer.close(() => r()));
  try {
    fs.unlinkSync(INBOX_PATH);
  } catch {
    // Inbox file may not exist on early failures.
  }
}

async function run() {
  await startSmtpCatcher();
  spawnAppServer();
  await waitForReady(`http://localhost:${APP_PORT}/health`);
  log('app ready');

  browser = await chromium.launch();
  const ctx = await browser.newContext({ baseURL: `http://localhost:${APP_PORT}` });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning') console.log(`[browser ${t}]`, msg.text());
  });
  page.on('requestfailed', (req) =>
    console.log(`[browser failed]`, req.method(), req.url(), req.failure()?.errorText),
  );

  log('opening /nl/contact');
  await page.goto('/nl/contact', { waitUntil: 'load' });
  await page.waitForSelector('form.contact-form');

  // Widget should be rendered because PUBLIC_CAP_API_ENDPOINT is set.
  await page.waitForSelector('cap-widget', { state: 'attached' });

  // Confirm the WASM is being served from our origin (CSP-safe).
  const wasmResp = await page.request.get('/cap_wasm_bg.wasm');
  if (wasmResp.status() !== 200) {
    fail(`self-hosted WASM returned ${wasmResp.status()}`);
    return;
  }
  log(`WASM available at /cap_wasm_bg.wasm (${wasmResp.headers()['content-type'] ?? '?'})`);

  // Wait until the cap-widget custom element is upgraded (has a `solve` method).
  await page.waitForFunction(
    () => {
      const el = document.querySelector('cap-widget');
      return !!el && typeof el.solve === 'function';
    },
    { timeout: 20_000 },
  );
  log('cap-widget upgraded, triggering solve()');

  // Fill the form.
  await page.check('input[name="request_type"][value="Contact per email"]');
  await page.fill('#name', 'Live');
  await page.fill('#last_name', 'CapTest');
  await page.fill('#email', 'live@captest.nl');
  await page.fill('#phone', '0612345678');
  await page.fill('#description', 'End-to-end Cap PoW solve test.');

  // Trigger the real proof-of-work solve. The widget computes 50 PoW challenges
  // at difficulty 4 — usually < 3s on M-series hardware. Returns when done.
  const solveResult = await page.evaluate(() => {
    return document.querySelector('cap-widget').solve();
  });
  log('solve result:', JSON.stringify(solveResult));

  if (!solveResult || !solveResult.success || typeof solveResult.token !== 'string') {
    fail('cap-widget did not return a valid token');
    return;
  }
  if (!/^[a-f0-9]+:[a-f0-9]+$/i.test(solveResult.token)) {
    fail(`token has unexpected shape: ${solveResult.token}`);
    return;
  }

  // The hidden #capToken input should be filled by the onsolve handler.
  const hiddenValue = await page.inputValue('input[name="capToken"]');
  if (hiddenValue !== solveResult.token) {
    fail(
      `hidden capToken mismatch (form=${hiddenValue.slice(0, 12)}…, widget=${solveResult.token.slice(0, 12)}…)`,
    );
    return;
  }
  log('hidden capToken populated from widget');

  await page.click('button[type="submit"]');

  log('waiting for success toast');
  await page.waitForSelector('.toast >> text=Bedankt voor je bericht', { timeout: 15_000 });

  // SMTP catcher should now have the email.
  const deadline = Date.now() + 5_000;
  let inbox = [];
  while (Date.now() < deadline) {
    inbox = readInbox();
    if (inbox.length > 0) break;
    await new Promise((r) => setTimeout(r, 50));
  }

  if (inbox.length === 0) {
    fail('no email delivered to SMTP catcher');
    return;
  }
  const mail = inbox.find((m) => m.subject.includes('Nieuw contactformulier'));
  if (!mail) {
    fail(
      `expected contact email subject not found; inbox=${JSON.stringify(inbox.map((m) => m.subject))}`,
    );
    return;
  }
  log(`email delivered: "${mail.subject}"`);

  // Now verify token replay is blocked: submitting the same token a second
  // time should fail (server-side store consumes it on first use). Use a
  // page-context fetch so SvelteKit's CSRF check (Origin header) passes —
  // we're testing the server's token store, not its CSRF protection.
  log('verifying replay protection');
  const replayResult = await page.evaluate(async (token) => {
    const fd = new FormData();
    fd.append('request_type', 'Contact per email');
    fd.append('name', 'Replay');
    fd.append('last_name', 'Attempt');
    fd.append('email', 'replay@test.nl');
    fd.append('phone', '0612345678');
    fd.append('description', 'Replay attack — should fail.');
    fd.append('capToken', token);
    const res = await fetch('/nl/contact', {
      method: 'POST',
      body: fd,
      headers: { 'x-sveltekit-action': 'true' },
    });
    return { status: res.status, body: await res.text() };
  }, solveResult.token);

  if (!replayResult.body.includes('cap_failed')) {
    fail(
      `replay was not rejected: status=${replayResult.status} body=${replayResult.body.slice(0, 300)}`,
    );
    return;
  }
  log('replay correctly rejected with cap_failed');
}

run()
  .catch((err) => {
    fail(err.stack || String(err));
  })
  .finally(async () => {
    await cleanup();
    if (failed) {
      console.error('\n[cap-live] ❌ FAILED');
      process.exit(1);
    } else {
      console.log('\n[cap-live] ✅ PASS');
      process.exit(0);
    }
  });
