import { defineConfig, devices } from '@playwright/test';

// Local fast-iteration config (NOT committed to source tree by intent).
// Assumes the app server is already running on :3000 and an SMTP catcher
// on :2525. Skips webServer + globalSetup, so iterations don't pay
// server-startup cost.
//
// Usage:
//   1. Start app server in background (PORT=3000 HOST=0.0.0.0 ORIGIN=...
//      TURNSTILE_* SMTP_* etc; see e2e/global-setup.ts for SMTP).
//   2. pnpm exec playwright test --config=playwright-isolate.config.ts \
//        e2e/<spec>.spec.ts -g '<test name regex>'
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['line']],
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  globalSetup: './e2e/global-setup.ts',
  projects: [
    {
      name: 'chromium-desktop',
      testIgnore: ['**/visual-parity.spec.ts', '**/__debug.spec.ts'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
