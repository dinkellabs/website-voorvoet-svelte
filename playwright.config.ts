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
      // Turnstile: server-side auto-pass
      TURNSTILE_ENABLED: 'false',
      TURNSTILE_DUMMY_MODE: 'always_pass',
      TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
      PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
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
