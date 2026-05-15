import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Run specs in parallel across workers. Form specs (contact/order) declare
  // `test.describe.configure({ mode: 'serial' })` internally so their
  // submissions don't race against the per-IP rate limiter.
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  // Default workers = CPU/2 locally; on CI runners that's still ~2x faster
  // than the previous workers: 1 default.
  workers: process.env['CI'] ? 2 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-mobile',
      testIgnore: ['**/visual-parity.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'chromium-tablet',
      testIgnore: ['**/visual-parity.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'chromium-desktop',
      testIgnore: ['**/visual-parity.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    // Visual-parity project: runs only the visual-parity spec, once, with a
    // desktop-sized default viewport. The spec self-manages all 3 viewports
    // internally and spawns its own server instances (NEW on 3001, OLD on 3002).
    {
      name: 'visual-parity',
      testMatch: ['**/visual-parity.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
  webServer: {
    command: 'node build/index.js',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    env: {
      // Node adapter default port
      PORT: '3000',
      HOST: '0.0.0.0',
      // adapter-node defaults its url.origin protocol to `https` when
      // PROTOCOL_HEADER isn't set. Without an explicit ORIGIN here, every
      // form POST gets CSRF-rejected (browser sends `Origin: http://...`,
      // server compares against `https://...`).
      ORIGIN: 'http://localhost:3000',
      // Order spec submits 7 forms in a row; production 5-per-10-min cap
      // would fail the suite. See src/lib/server/rate-limiter.ts.
      E2E_DISABLE_RATE_LIMITER: 'true',
      // Cap: server-side auto-pass. Intentionally leave
      // PUBLIC_CAP_API_ENDPOINT empty so the form renders the hidden
      // `capToken=disabled` input instead of mounting the real widget —
      // the live widget would issue background challenge/redeem fetches
      // that never settle in CI and stall `waitForLoadState('networkidle')`.
      CAP_ENABLED: 'false',
      CAP_DUMMY_MODE: 'always_pass',
      CAP_SECRET: '0000000000000000000000000000000000000000000000000000000000000000',
      PUBLIC_CAP_API_ENDPOINT: '',
      // SMTP mock: point at a port that accepts+drops mail (started in globalSetup)
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '2525',
      SMTP_USERNAME: 'test',
      SMTP_PASSWORD: 'test',
      SMTP_FROM_EMAIL: 'noreply@test.local',
      SMTP_TO_EMAIL: 'inbox@test.local',
      // Site
      SITE_URL: 'http://localhost:3000',
      PUBLIC_SITE_URL: 'http://localhost:3000',
      // Allow self-signed TLS cert on our SMTP mock
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
    },
  },
});
