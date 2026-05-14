# E2E Tests (Playwright)

End-to-end tests for the VoorVoet SvelteKit rewrite. All specs run against the
**production Node.js build** (`node build/index.js`) on port **3000** to catch
any SSR vs CSR mismatches.

---

## Quick start

```fish
# 1. Build the app (required before first run)
pnpm build

# 2. Install Chromium (one-time)
pnpm exec playwright install --with-deps chromium

# 3. Run all E2E tests
pnpm exec playwright test

# 4. Run a single spec
pnpm exec playwright test e2e/contact-form.spec.ts

# 5. View the HTML report
pnpm exec playwright show-report playwright-report
```

---

## Environment variables

The `webServer` block in `playwright.config.ts` passes the following env vars
to the production server process. You do **not** need to set them manually for
local runs.

| Variable                       | Value used in tests     | Purpose                                                              |
| ------------------------------ | ----------------------- | -------------------------------------------------------------------- |
| `PORT`                         | `3000`                  | Node adapter listen port                                             |
| `TURNSTILE_ENABLED`            | `false`                 | Disables Cloudflare Turnstile check server-side (auto-pass)          |
| `TURNSTILE_DUMMY_MODE`         | `always_pass`           | Turnstile widget renders in bypass mode                              |
| `SMTP_HOST`                    | `127.0.0.1`             | Points nodemailer at the in-process SMTP catcher                     |
| `SMTP_PORT`                    | `2525`                  | SMTP catcher port (started in `global-setup.ts`)                     |
| `SMTP_USERNAME`                | `test`                  | Accepted by the SMTP mock unconditionally                            |
| `SMTP_PASSWORD`                | `test`                  | Accepted by the SMTP mock unconditionally                            |
| `SMTP_FROM_EMAIL`              | `noreply@test.local`    | Test sender address                                                  |
| `SMTP_TO_EMAIL`                | `inbox@test.local`      | Test recipient address                                               |
| `SITE_URL`                     | `http://localhost:3000` | Canonical URL prefix for SEO meta                                    |
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0`                     | Allows nodemailer to connect to the SMTP mock's self-signed TLS cert |

---

## SMTP mock

`email.ts` uses `nodemailer` with `requireTLS: true`. The test infrastructure
starts a plain TCP server in `e2e/global-setup.ts` that:

1. Advertises `STARTTLS` in its EHLO response.
2. Upgrades to TLS using a `selfsigned`-generated self-signed certificate.
3. Accepts any `AUTH` credentials.
4. Records each delivered message to `e2e/smtp-inbox.json` as a JSON array of
   `{ from, to, subject, data }` objects.

Specs that assert email delivery call `readInbox()` from `e2e/helpers.ts`.
`clearInbox()` is called in `beforeEach` to prevent cross-test contamination.

**Why not `nodemailer-mock`?** It patches the nodemailer module in-process, but
the production server runs as a _separate_ child process (`node build/index.js`),
so the mock can never intercept those calls.

---

## Spec inventory

| File                         | Tests | Description                                                  |
| ---------------------------- | ----- | ------------------------------------------------------------ |
| `redirects.spec.ts`          | 7     | REQUIREMENTS §3.10 redirects (bare paths → `/nl/…`)          |
| `404.spec.ts`                | 3     | Non-existent routes → custom 404 page                        |
| `language-switching.spec.ts` | 8     | Switch nl→de→en on every top-level page                      |
| `blog.spec.ts`               | 15    | Index, post navigation, hreflang on all 3 languages          |
| `contact-form.spec.ts`       | 3     | Fill/submit contact form + SMTP assertion                    |
| `order-form.spec.ts`         | 7     | Fill/submit order form for all 3 insole types and quantities |
| `seo.spec.ts`                | 23    | Title, description, canonical, OG, hreflang, JSON-LD         |
| `accessibility.spec.ts`      | 24    | axe-core (serious/critical violations fail the test)         |

---

## Viewing the HTML report

After a run (especially a failed CI run), download the `playwright-report`
artifact and run:

```fish
pnpm exec playwright show-report playwright-report
```

The report opens in your browser at `http://localhost:9323`.

---

## Skipped tests / known limitations

- **Google Maps embeds**: The home page uses static map images (no iframes),
  so no Cloudflare-dependent resources need skipping.
- **Visual parity**: `e2e/visual-parity.spec.ts` is owned by agent 3C and is
  excluded from the regular three viewport projects via `testIgnore`.
- **Pagination**: Only 3 blog posts exist (well below the 6-per-page threshold),
  so pagination is asserted to be absent rather than tested.
