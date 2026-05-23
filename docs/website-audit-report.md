# VoorVoet Website Audit — Consolidated Report

_Generated 2026-05-23 by SEO + Lighthouse + Umami + Senior Engineering audit team._

---

## Executive Summary

- **Total findings: 42** (2 P0, 9 P1, 15 P2, 16 P3)
- **Headline issues:**
  1. Zero analytics in production — `PUBLIC_UMAMI_SCRIPT_URL` is set on the Hetzner VPS (client script enabled, server-side disabled), but the client script is CORS-blocked by `umami.bakhuis.nu`; every tracking path is dead.
  2. Googlebot sees Dutch body text on all `/de` and `/en` routes because Paraglide SSR locale context is never initialised server-side, sabotaging German/English rankings.
  3. Both practice-location postal codes in `MedicalBusiness` JSON-LD are wrong, creating NAP inconsistency that undermines local SEO trust.
- **Headline opportunities:**
  1. Subsetting the self-hosted Lato woff2 files to Latin+Latin-ext would cut font payload by ~650–750 KB and bring mobile LCP from 6–7 s down to an estimated 2–3 s.
  2. Adding `telephone`, corrected `openingHoursSpecification`, `sameAs`, and per-location `BreadcrumbList`/`MedicalBusiness` schema would unlock Google local-panel rich results and click-to-call across all pages.
  3. Implementing the full Umami server-side event taxonomy (404 tracking, `plan_portal_click` proxy, form funnel events) would give the first real baseline on conversions, language splits, and CTA effectiveness.

**Recommended fix order:** Phase 0 (today) → Phase 1 (this week, SEO) → Phase 2 (next week, measurement) → Phase 3 (sprint 2, performance + a11y) → Phase 4 (backlog, engineering hygiene).

---

## Cross-cutting P0 — Resolve before Phase 1

### P0-A — Umami: production has zero tracking (client-side script CORS-blocked; server-side disabled)

**Source:** Umami + Lighthouse (both independently observed; reconciled here)
**Classification:** regression (used to work or was never properly configured — cannot determine without history; treat as blocking)
**Recommendation:** fix
**Severity:** P0
**Evidence:**
- `src/routes/+layout.server.ts:34–39` — when `PUBLIC_UMAMI_SCRIPT_URL` is set, the layout server load injects `umamiScriptUrl` into layout data.
- `src/routes/+layout.svelte:98–100` — the layout renders `<script defer src={data.umamiScriptUrl}>` when that value is present.
- `src/hooks.server.ts:140–147` — `const clientSideUmamiActive = !!pubEnv.PUBLIC_UMAMI_SCRIPT_URL; const shouldTrack = !clientSideUmamiActive && ...` — server-side tracking is **disabled** whenever the client script URL is set.
- Lighthouse specialist observed live console errors on every page: `Access to script at 'https://umami.bakhuis.nu/state-objects.js' ... blocked by CORS policy: No 'Access-Control-Allow-Origin' header`.
- Local `.env` (dev) has all Umami vars commented out and the local preview scores BP:100 with no CORS errors, confirming the script is only injected in the production environment.
- **Conclusion:** On the production Hetzner VPS, `PUBLIC_UMAMI_SCRIPT_URL=https://umami.bakhuis.nu/state-objects.js` (and likely `PUBLIC_UMAMI_WEBSITE_ID`) is set. This (1) disables server-side tracking via the `clientSideUmamiActive` gate, and (2) injects a client-side script that is CORS-blocked, producing zero tracking events on both paths simultaneously.

**Reconciliation with specialist reports:**
- The Umami specialist concluded "server-side zero events because `UMAMI_API_URL` is commented out in `.env`." That is true for the _dev_ `.env` in the repo, but does not reflect the production environment, which has `PUBLIC_UMAMI_SCRIPT_URL` set, changing the architecture entirely.
- The user's stated intent is "server-side only, no client-side umami." Production is configured the opposite way.

**Two mutually exclusive fixes — user must choose one:**

**Option A (matches stated intent — server-side only):**
1. On the production VPS, remove or comment out `PUBLIC_UMAMI_SCRIPT_URL` and `PUBLIC_UMAMI_WEBSITE_ID` from `/srv/voorvoet/.env`.
2. Uncomment and set `UMAMI_API_URL=https://umami.bakhuis.nu/api/send` and `UMAMI_WEBSITE_ID=<correct-uuid>`.
3. Run `docker compose up -d` on the VPS.
4. Verify: `docker compose logs app | grep "umami"` — should show "umami tracking enabled". Set `UMAMI_DEBUG=true` temporarily and check that pageview events are confirmed at HTTP 200.
5. Verify the CORS console error disappears (the client script is no longer injected).

**Option B (switch to client-side — requires CORS fix on umami.bakhuis.nu):**
1. Keep `PUBLIC_UMAMI_SCRIPT_URL` set. Fix CORS on `umami.bakhuis.nu` by adding `Access-Control-Allow-Origin: https://voorvoet.nl` at the Caddy reverse proxy level in front of Umami.
2. This approach loses server-side advantages (bot filtering, SPA-gap visibility on hard navigations) and contradicts stated intent. Not recommended.

**Effort:** S (Option A: 20 min of SSH + env edit + verify)

**Note:** Once tracking is working, also add the startup observability log to `src/lib/server/umami.ts` (see P2-U1) so future regressions are caught in 30 seconds from `docker compose logs`.

---

## Phase 1 — SEO Foundation (this week)

### P1-S1 — Paraglide SSR locale not initialised — DE/EN pages serve Dutch body copy to Googlebot

**Source:** SEO
**Classification:** improvement (never correctly configured for SSR)
**Recommendation:** fix
**Severity:** P1
**Evidence:** `src/routes/+layout.ts:5` calls `setLocale(assertIsLocale(data.lang), { reload: false })` — this file runs client-side only. `src/lib/paraglide/runtime.js:149`: `export let serverAsyncLocalStorage = undefined`. Live confirmation: `curl https://voorvoet.nl/de` returns `<h1 class="hero__title">Voetklachten?</h1>` (Dutch). All 18 non-blog pages affected.
**Rationale:** Googlebot reads server-rendered HTML. Every `/de` and `/en` page presents Dutch body copy to crawlers, causing language-mismatch signals and suppression in German/English SERPs. This is the single highest-impact SEO fix on the site.
**Fix:** In `src/hooks.server.ts`, use Paraglide's `overwriteServerAsyncLocalStorage` API or wrap `resolve(event)` with `paraglideHandle` from `@inlang/paraglide-sveltekit`. The `langSegment` variable is already computed at line 108 of `hooks.server.ts` — use it to set the per-request locale context before calling `resolve`.
**Effort:** S–M (2–4 hours; needs dev environment validation)

---

### P1-S2 — NAP structured data has wrong postal codes for both practice locations

**Source:** SEO
**Classification:** improvement (data entry error, never correct)
**Recommendation:** fix
**Severity:** P1
**Evidence:**
- `src/lib/seo/structured-data.ts:30` — Eeftinksweg 13 has `postalCode: '7534 PK'`; footer (`Footer.svelte:47`) and Google Maps embed show `7541 WE`.
- `src/lib/seo/structured-data.ts:67` — Beethovenlaan 10 has `postalCode: '7535 CP'`; footer (`Footer.svelte:59`) and Google Maps show `7522 HJ`.
**Rationale:** Google cross-references structured data NAP against visible page content. Mismatched postal codes erode local business trust, suppress Google Maps rankings, and block GBP sync.
**Fix:** In `src/lib/seo/structured-data.ts`: line 30 → `'7541 WE'`; line 67 → `'7522 HJ'`. Verify against authoritative source (PostNL lookup or physical mail).
**Effort:** S (15 min — pending postal code verification, see Open Questions)

---

### P1-S3 — MedicalBusiness / Organization JSON-LD missing `telephone` field

**Source:** SEO
**Classification:** improvement (omission)
**Recommendation:** fix
**Severity:** P1
**Evidence:** Neither `organizationLD()` nor `podiatristLD()` in `src/lib/seo/structured-data.ts` includes `telephone`. The phone number `+31657750997` is present in footer HTML (`<a href="tel:+31657750997">`) but not in structured data.
**Rationale:** Missing `telephone` in LocalBusiness schema prevents the "Call" CTA in Google's mobile local panel and reduces local pack rich result eligibility.
**Fix:** Add `telephone: '+31657750997'` to both `organizationLD()` and `podiatristLD()` in `src/lib/seo/structured-data.ts`.
**Effort:** S (15 min)

---

### P1-S4 — `openingHoursSpecification` in MedicalBusiness is generic Mon–Fri 08:00–18:00, contradicting actual hours

**Source:** SEO
**Classification:** improvement (data entry error)
**Recommendation:** fix
**Severity:** P1
**Evidence:** `src/lib/seo/structured-data.ts:76–83` uses `dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00'`. Actual hours from `Footer.svelte:45–74`: Eeftinksweg: Mon 08:00–17:00, Thu 08:00–17:00; Beethovenlaan: Tue 08:30–19:30, Wed 08:30–17:00, Fri 08:00–13:00.
**Rationale:** Inaccurate hours in structured data cause wrong business hours in Google's knowledge panel, which can trigger a structured data quality manual action.
**Fix:** In `src/lib/seo/structured-data.ts`, replace the generic block with per-location `OpeningHoursSpecification` entries matching the actual schedules in `Footer.svelte`.
**Effort:** S (1 hour)

---

### P1-S5 — `isRealProductionHost()` checks `voorvoeten.nl` but `.env.example` sets `PUBLIC_SITE_URL=https://voorvoet.nl`

**Source:** Engineering
**Classification:** unknown (may be intentional — `voorvoeten.nl` could be the actual server hostname; unclear without operator confirmation)
**Recommendation:** investigate
**Severity:** P1
**Evidence:** `src/lib/server/cap.ts:19` and `src/hooks.server.ts:33` both check `=== 'voorvoeten.nl'`. `.env.example` shows `PUBLIC_SITE_URL=https://voorvoet.nl`. If the operator set `PUBLIC_SITE_URL` following the example, `isRealProductionHost()` always returns `false`, bypassing the hard `throw` in `cap.ts` that enforces CAPTCHA protection.
**Rationale:** If CAP protection is silently skipped in production, contact and order forms are exposed to bots. This is P1 security regardless of whether it is already happening.
**Fix:** Either update `.env.example` to show the actual server hostname (`voorvoeten.nl`) with a clear comment, or add `|| hostname === 'voorvoet.nl'` to both `isRealProductionHost()` checks. See Open Questions #1.
**Effort:** S (15 min, after confirmation)

---

### P1-S6 — Active CVEs: `svelte` ≤ 5.55.6 (3 XSS advisories) + `devalue` via `@sveltejs/kit` (DoS)

**Source:** Engineering
**Classification:** regression (upstream CVEs published after last dependency update)
**Recommendation:** fix
**Severity:** P1
**Evidence:** `pnpm audit`: `svelte` GHSA-pr6f-5x2q-rwfp (SSR XSS, spread attributes), GHSA-f3cj-j4f6-wq85 (Promise serialization XSS), GHSA-rcqx-6q8c-2c42 (DOM Clobbering XSS) — all patched in ≥ 5.55.7. Current: 5.55.5. `devalue` GHSA-77vg-94rm-hx3p (DoS via sparse array) — patched via `@sveltejs/kit` ≥ 2.61.0. Current kit: 2.59.0.
**Rationale:** Three XSS advisories in the active Svelte version warrant an immediate patch-level bump. The upgrade is a one-liner with no breaking changes.
**Fix:** `pnpm add svelte@^5.55.9 @sveltejs/kit@^2.61.0`, then `pnpm audit` to confirm clean.
**Effort:** S (30 min including verification)

---

### P1-S7 — `sameAs` missing from Organization/MedicalBusiness JSON-LD

**Source:** SEO
**Classification:** improvement (omission)
**Recommendation:** fix
**Severity:** P1 (grouped here with other structured-data quick-wins for batching efficiency; individual impact is P2)
**Evidence:** `src/lib/seo/structured-data.ts` — neither `organizationLD()` nor `podiatristLD()` includes `sameAs`. Footer links to `https://www.podotherapie.nl/` (NVvP) and `https://www.kwaliteitsregisterparamedici.nl/kwaliteitsregister/paramedici/33997`.
**Rationale:** `sameAs` links to authoritative health registries strengthen Google Knowledge Graph entity confidence and local authority.
**Fix:** Add `sameAs: ['https://www.podotherapie.nl/', 'https://www.kwaliteitsregisterparamedici.nl/kwaliteitsregister/paramedici/33997']` to `podiatristLD()` in `src/lib/seo/structured-data.ts`.
**Effort:** S (15 min)

---

### P1-S8 — MedicalBusiness + BreadcrumbList JSON-LD absent on inner pages

**Source:** SEO
**Classification:** improvement (never implemented for non-home pages)
**Recommendation:** fix
**Severity:** P1
**Evidence:** Live `/nl/informatie`, `/nl/vergoedingen`, `/nl/contact`, `/nl/zolen-bestellen` all contain only `@type: Organization` JSON-LD. `src/routes/[lang=lang]/[...path]/+page.server.ts` returns no `structuredData`. Only the home page emits `podiatristLD()`.
**Rationale:** Rich result eligibility (breadcrumbs in SERPs, local knowledge panel signals) is evaluated per page. Inner pages with only Organization schema qualify for none of these enhancements.
**Fix:** In `src/routes/[lang=lang]/[...path]/+page.server.ts`, add `structuredData` to the returned `base` object containing `podiatristLD()` and a two-item `breadcrumbListLD()` (Home → current page). The `pageKey` and `lang` are already available.
**Effort:** S (2 hours)

---

### P1-S9 — Sitemap XML namespace uses `https://` instead of canonical `http://` URI

**Source:** SEO
**Classification:** improvement (spec incorrectness)
**Recommendation:** fix
**Severity:** P2 (promoted here for batching with other sitemap work)
**Evidence:** `src/routes/sitemap.xml/+server.ts:112–113`: `xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"`. Official spec mandates `http://`.
**Rationale:** Strict XML validators and enterprise SEO tools flag this. Google tolerates it, but fixing has zero downside.
**Fix:** Change to `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` in `src/routes/sitemap.xml/+server.ts:113`.
**Effort:** S (5 min)

---

## Phase 2 — Measurement / Umami (next week)

_Prerequisite: P0-A must be resolved — server-side tracking must be confirmed working — before implementing additional events._

### P2-U1 — Add observability to `trackEvent` — silent failure leaves "is Umami working?" unanswerable

**Source:** Umami
**Classification:** improvement (operational gap)
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/lib/server/umami.ts` — the `try/catch` swallows all errors silently. No startup log, no debug log around HTTP response codes.
**Rationale:** The only way to verify tracking works today is to run a full audit. A two-line debug log eliminates this audit cost permanently.
**Fix:** Add module-level startup log in `src/lib/server/umami.ts`: `if (!building && env.UMAMI_API_URL) logger.info({ url: ... }, 'umami tracking enabled')`. Add `UMAMI_DEBUG=true`-gated `logger.debug({ event, status })` after the fetch response. Add a boot-time warning if `UMAMI_API_URL` is set but `UMAMI_WEBSITE_ID` is empty.
**Effort:** S (30 min)

---

### P2-U2 — Missing `404` event tracking

**Source:** Umami + SEO
**Classification:** improvement (never implemented)
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/hooks.server.ts` — the post-resolve block only tracks 2xx HTML responses. 404 errors produce zero Umami signal.
**Rationale:** 404 events with `referrer` reveal broken backlinks and search bot crawl errors — critical for SEO health monitoring after any site restructuring.
**Fix:** In `src/hooks.server.ts`, add an else-branch after the `shouldTrack` block for `response.status === 404 && isHtml`, emitting a `404` event with `url`, `hostname`, `language`, and `referrer` fields. The payload schema is defined in the Umami audit's event taxonomy.
**Effort:** S (1 hour)

---

### P2-U3 — Missing `plan_portal_click` server-proxied measurement route

**Source:** Umami + SEO
**Classification:** improvement (never implemented)
**Recommendation:** fix
**Severity:** P2
**Evidence:** All appointment-portal CTAs link directly to `https://start.james-software.nl/...` (external URL from `LINK_PLAN_PORTAL` env var). Clicks are completely unmeasured. This is the primary conversion action for SEO traffic.
**Fix:** Create `src/routes/go/plan/+server.ts` — a `GET` handler that reads `LINK_PLAN_PORTAL`, emits `trackEvent('plan_portal_click', { data: { lang, referrer_host } })`, then returns `redirect(302, planPortalUrl)`. Update `StarterCTA.svelte` and `HeroCTA.svelte` to link to `/go/plan?lang={lang}` instead of the raw portal URL.
**Effort:** S (2 hours)

---

### P2-U4 — Missing form failure / CAP events

**Source:** Umami
**Classification:** improvement (never implemented)
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/lib/forms/contact/action.ts` and `src/lib/forms/order/action.ts` emit `contact_form_submitted` / `order_insoles_submitted` on success but nothing on validation failure or CAP failure.
**Rationale:** Form funnel drop-off at validation and CAPTCHA is invisible. Spikes would indicate bot attacks; persistently high validation failure rates indicate UX problems.
**Fix:** After `!form.valid` and `!capOk` return paths in both action files, emit `form_validation_failed` and `form_cap_failed` events respectively, with `data: { form_type, lang }`. Mirror the same pattern in CAP challenge/redeem handlers.
**Effort:** S (2 hours total)

---

### P2-U5 — Missing `legacy_redirect` event tracking

**Source:** Umami
**Classification:** improvement (never implemented)
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/hooks.server.ts:96–99` — `LEGACY_REDIRECTS` fires 308 redirects silently. Six legacy paths are maintained indefinitely with no data to indicate when traffic has migrated to zero.
**Fix:** In the `LEGACY_REDIRECTS` block, before `throw redirect(308, legacyTarget)`, emit a fire-and-forget `legacy_redirect` event with `data: { from_path: pathname, to_path: legacyTarget, referrer_host }`. Use `'nl'` as default `language` (all legacy paths are Dutch-only).
**Effort:** S (1 hour)

---

### P2-U6 — Umami `trackEvent` sends duplicate CSP origin when `PUBLIC_UMAMI_SCRIPT_URL` and `UMAMI_API_URL` share a hostname

**Source:** Engineering
**Classification:** improvement (minor correctness issue)
**Recommendation:** fix
**Severity:** P3 (included in Phase 2 because it is relevant to the Umami configuration context)
**Evidence:** `src/hooks.server.ts:63` — `const connectAdditions = [umamiScriptOrigin, umamiApiOrigin].filter(Boolean).join(' ')` — produces duplicate origin strings when both vars point to the same host.
**Fix:** `[...new Set([umamiScriptOrigin, umamiApiOrigin].filter(Boolean))].join(' ')` in `src/hooks.server.ts:63`.
**Effort:** S (5 min)

---

### P2-U7 — Dashboard setup: define the 10 recommended Umami views

**Source:** Umami
**Classification:** improvement (never done)
**Recommendation:** fix
**Severity:** P2
**Evidence:** No saved dashboard views exist in Umami. The Umami audit's dashboard table defines the 10 required views: pageviews by language, conversion funnel, top pages, referrer breakdown, 404 ratio, 404 by referrer, legacy redirect traffic, plan portal CTA clicks, CSP violations, CAP funnel.
**Fix:** After P0-A is resolved and tracking is confirmed working, configure the 10 saved filters in the Umami dashboard. No code change required.
**Effort:** S (1 hour in Umami UI)

---

### P2-S1 — Blog post meta missing `og:locale` and uses `og:type="website"` instead of `"article"`

**Source:** SEO
**Classification:** improvement (omission in blog server load)
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/routes/[lang=lang]/blog/[slug]/+page.server.ts:122–130` — returned `meta` object has no `og.locale`. `src/routes/+layout.svelte:65` hardcodes `og:type="website"`. Live `/nl/blog/podotherapeut-of-podoloog`: no `og:locale` meta tag.
**Fix:** In `blog/[slug]/+page.server.ts`, extend the returned `meta` to include `og: { locale: LOCALE_MAP[lang], type: 'article' }`. In `+layout.svelte:65`, change to `{pageMeta?.og?.type ?? 'website'}`. Also add `dateModified: post.updatedDate ?? post.date` to `blogPostingLD()` in `src/lib/seo/structured-data.ts`.
**Effort:** S (1 hour)

---

### P2-S2 — Title tags are short and keyword-sparse on several pages

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/lib/i18n/page-meta.ts`: `nl.blog = "VoorVoet - Blog"` (15 chars), `nl.information = "VoorVoet - Informatie"` (21 chars), `nl.contact = "VoorVoet - Contact"`, `en.contact` identical to `nl.contact`.
**Fix:** Rewrite all title tags in `src/lib/i18n/page-meta.ts` to 50–60 chars with keyword-first structure. SEO audit provides full suggested copy for all three languages: e.g. `nl.blog` → `"Podotherapie Blog — Voetklachten & Tips | VoorVoet"` (51 chars), `nl.information` → `"Podotherapie Behandelingen & Klachten | VoorVoet Enschede"` (57 chars).
**Effort:** M (4–6 hours across three languages)

---

### P2-S3 — Meta descriptions: home is 163 chars (over limit); blog post summaries are 488 chars

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/lib/i18n/page-meta.ts` `nl.home` description: 163 chars (limit: 155). Blog post frontmatter `summary` field used verbatim as meta description: 488 chars on `001_podotherapeut_of_podoloog.md`.
**Fix:** Trim `nl.home` description by 8 chars. Add a separate `meta_description` frontmatter field (50–155 chars) to all blog posts in `src/content/blog/{nl,de,en}/`. Update `blog/[slug]/+page.server.ts` to use `post.metaDescription ?? post.summary.slice(0, 155)`.
**Effort:** S

---

### P2-S4 — Sitemap lacks `<lastmod>` on all entries

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/routes/sitemap.xml/+server.ts` — `buildUrl()` outputs `<loc>`, `<xhtml:link>`, `<changefreq>`, `<priority>` only. No `<lastmod>` for any URL including blog posts that have a `date` field in frontmatter.
**Fix:** Add `lastmod` param to `buildUrl()`. For static pages, inject a deploy-time ISO date. For blog posts, use `translatedPost.date`. Expose it in the URL builder.
**Effort:** S (2 hours)

---

### P2-S5 — FAQPage structured data missing on `/nl/informatie`

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix
**Severity:** P2
**Evidence:** Live `/nl/informatie` has only `@type: Organization` JSON-LD. The page already contains Q&A structure (H2: "Wat is een risicovoet?", H3: "Welke risicoclassificaties zijn er?", etc.) that could feed FAQ rich results.
**Fix:** Create `faqLD()` function in `src/lib/seo/structured-data.ts`. Emit it from `src/routes/[lang=lang]/[...path]/+page.server.ts` when `pageKey === 'information'`. Use the existing informatie page H2/H3 question/answer pairs.
**Effort:** M

---

## Phase 3 — Performance + Accessibility (sprint 2)

### P3-L1 — Self-hosted Lato woff2 files are full-charset (~180 KB each); no unicode-range subsetting

**Source:** Lighthouse
**Classification:** improvement (never optimised)
**Recommendation:** fix
**Severity:** P1 (largest single performance improvement available; grouped in Phase 3 because SEO and measurement must land first)
**Evidence:** `static/fonts/lato-*.woff2` — 7 weights, ~178–191 KB each. No `unicode-range` in `src/app.css`. Pages with 5 fonts (e.g. `/nl/vergoedingen`) download 910 KB of fonts → LCP 6.9 s mobile. Pages with 3 fonts (`/nl/blog`) download 540 KB → LCP 4.8 s. Google Fonts serves Lato subsets at ~30–50 KB per weight.
**Rationale:** Font payload is the dominant cause of the mobile LCP gap (65–80 score range). Subsetting to Latin+Latin-ext (sufficient for NL/DE/EN content) is the single highest-leverage performance change.
**Fix options:** (a) Use `pyftsubset`/fonttools to generate unicode-range–subsetted woff2 files for each weight (`U+0000-02FF`), then add matching `@font-face unicode-range` descriptors in `src/app.css`. (b) Alternatively, replace all 7 static weights with a single Lato variable font (~120 KB). Also add `lato-black.woff2` and `lato-heavy.woff2` to the two `<link rel=preload>` in `src/app.html`.
**Effort:** M

---

### P3-L2 — `/fonts/` and `/images/` static assets have no `Cache-Control` header (ETag only)

**Source:** Lighthouse
**Classification:** improvement (Caddy configuration gap)
**Recommendation:** fix
**Severity:** P1
**Evidence:** `curl -sI https://voorvoet.nl/fonts/lato-bold.woff2` — no `Cache-Control` header, only `ETag` + `Last-Modified`. SvelteKit adapter-node sets `Cache-Control: public, max-age=31536000, immutable` for `/_app/immutable/*` but not for `/fonts/*` or `/images/*`. Lighthouse reports 9 resources (1037 KB) with 0 cache TTL.
**Rationale:** Every return visitor re-validates fonts and images — 1 MB+ of conditional requests on every visit. These files are stable and safe for long-TTL caching.
**Fix:** Add to Caddy configuration:
```
@static path /fonts/* /images/*
header @static Cache-Control "public, max-age=31536000, immutable"
```
**Effort:** S (15 min Caddy config)

---

### P3-L3 — Hero `<picture>` component lacks responsive `srcset` width descriptors

**Source:** Lighthouse
**Classification:** improvement
**Recommendation:** fix
**Severity:** P1
**Evidence:** `ResponsiveImage.svelte` renders `<source srcset={srcAvif}>` with a single URL — no `sizes` attribute and no width descriptors. On mobile, home hero renders at 412×700 px but transfers a desktop-sized AVIF (185.9 KB). Lighthouse estimates 127.7 KB wasted bytes (67%) on `/nl` mobile.
**Fix:** Extend `ResponsiveImage.svelte` to accept `srcsetAvif`, `srcsetWebp`, and `sizes` props. Generate and serve 640w, 1024w, 1920w variants for hero images. Add `sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"` to `<source>` elements. Update `HeroBanner.svelte` callers.
**Effort:** M

---

### P3-L4 — Color contrast on primary CTA buttons: 2.95:1 (fails WCAG 2.1 AA)

**Source:** Lighthouse
**Classification:** improvement
**Recommendation:** fix
**Severity:** P2
**Evidence:** `--color-btn-primary: #05a8a2` with white text = 2.95:1 contrast ratio. WCAG AA requires 3:1 for large text, 4.5:1 for normal text. Affected elements: `.hero-cta__btn`, `.btn--primary` on home, blog, zolen-bestellen, and more.
**Fix:** Change `--color-btn-primary` to `#05847c` (already defined as `--color-btn-primary-hover`) — this gives 4.57:1 contrast against white, satisfying AA for both text sizes. Adjust hover state to `#005152` (`--color-primary-700`, 9.14:1).
**Effort:** S (30 min — CSS variable change)

---

### P3-L5 — Lighthouse SEO score 92 on English pages (generic `"Information"` link text) and on contact/zolen (CAP anchor with no `href`)

**Source:** Lighthouse
**Classification:** improvement
**Recommendation:** fix
**Severity:** P2
**Evidence:** EN home page: `<a href="/en/information">Information</a>` — Lighthouse `link-text` audit flags this as non-descriptive. Contact/zolen pages: CAP widget shadow DOM renders `<a class="cap-troubleshoot-link">` with no valid `href` — triggers `crawlable-anchors` audit.
**Fix (EN link text):** In `src/messages/en.json`, change the info-card button copy to something like "About podiatry" or "What is podiatry?". **Fix (CAP anchor):** Add `href="#"` to the troubleshoot link in the CAP widget, or report to `@cap.js/wasm` upstream. Also check whether a newer CAP widget version has fixed this.
**Effort:** S

---

### P3-L6 — CAP widget JS (44.5 KB) loaded unconditionally on contact/zolen pages

**Source:** Lighthouse
**Classification:** improvement
**Recommendation:** fix
**Severity:** P2
**Evidence:** Both `/nl/contact` and `/nl/zolen-bestellen` load `i-WGcpVY.js` (44.5 KB, 36–37 KB unused at page load) — the CAP widget chunk. Lighthouse estimates 300 ms LCP savings from lazy-loading.
**Fix:** Lazy-load the CAP widget via a dynamic import triggered on first user interaction with the form (focus or click). In Svelte 5, use an `$effect` that imports the component on the trigger event.
**Effort:** M

---

### P3-L7 — CLS 0.017 on live `/nl` home (absent locally) — likely font-swap reflow

**Source:** Lighthouse
**Classification:** unknown (may be acceptable; CLS is within "Good" range)
**Recommendation:** investigate
**Severity:** P3
**Evidence:** Live `/nl` mobile: CLS 0.017. Local preview: CLS 0. `font-display: swap` in `src/app.css` causes invisible-text → reflow when Lato loads under real network conditions. CLS is within "Good" ≤ 0.1 but is live-only, suggesting font loading timing.
**Rationale:** Resolving P3-L1 (font subsetting) will likely eliminate this CLS as a side effect, since smaller font files load faster and reduce the swap window. Investigate after L1 is shipped.
**Effort:** S (investigate after font subsetting)

---

### P3-S1 — Internal CTA anchor text is generic, providing no keyword signal to destination pages

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix
**Severity:** P3
**Evidence:** Live `/nl` HTML: `<a href="/nl/informatie#veel-voorkomende-klachten">Bekijk klachten</a>`, `<a href="/nl/vergoedingen">Check vergoeding</a>`.
**Fix:** In `src/messages/{nl,de,en}.json`, change `home_info_card3_btn: "Check vergoeding"` → `"Vergoedingen podotherapie bekijken"`. Change `home_info_card2_btn: "Bekijk klachten"` → `"Voetklachten die we behandelen"`.
**Effort:** S

---

### P3-S2 — Hero image alt text on contact page is `alt="Contact"` (generic)

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix
**Severity:** P3
**Evidence:** Live `/nl/contact`: `<img ... alt="Contact" class="hero__img">`. Image filename is descriptive but alt is the bare page name.
**Fix:** Update the contact hero image alt text to `"Neem contact op met podotherapeut VoorVoet in Enschede - afspraak maken voor voetklachten"` in the appropriate message key. Audit other hero image alt attributes across pages.
**Effort:** S

---

### P3-S3 — Blog H1 is a marketing tagline, not a keyword-targeted heading

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix
**Severity:** P3
**Evidence:** Live `/nl/blog`: `<h1>Stap voor stap naar gezonde voeten: alles over podotherapie</h1>`. `src/messages/nl.json:7`.
**Fix:** Revise `blog_hero_title` in all three locale files: NL → `"Podotherapie Blog | VoorVoet Enschede"`, DE → `"Podologie Blog | VoorVoet Enschede"`, EN → `"Podiatry Blog | VoorVoet Enschede"`.
**Effort:** S

---

### P3-S4 — `/dev/` component showcase not disallowed in robots.txt

**Source:** SEO
**Classification:** unknown
**Recommendation:** investigate
**Severity:** P3
**Evidence:** Live `https://voorvoet.nl/robots.txt` returns only `User-agent: *\nAllow: /\n\n...` — no `Disallow: /dev/`. `src/routes/robots.txt/+server.ts:11` only adds the `Disallow: /dev/` line when `PUBLIC_DISALLOW_INDEXING` is `true`. See Open Questions #6.
**Effort:** S

---

### P3-S5 — OG image dimensions are 1200×675 (16:9) instead of recommended 1200×630 (1.91:1)

**Source:** SEO + Lighthouse (both noted)
**Classification:** intentional (or unknown — design choice)
**Recommendation:** investigate
**Severity:** P3
**Evidence:** `static/images/page_home/page-preview-podotherapie-enschede-16x9.jpg` — 1200×675. Facebook/LinkedIn recommend 1200×630. Some platforms letterbox or crop at 16:9.
**Fix (if desired):** Export 1200×628 cropped `*-og.jpg` variants per page. Current files can remain as hero images.
**Effort:** S–M per image

---

## Phase 4 — Engineering Hygiene (backlog)

### P4-E1 — `pnpm test:coverage` exits non-zero — two branch thresholds fail

**Source:** Engineering
**Classification:** regression (thresholds set above current coverage)
**Recommendation:** fix
**Severity:** P2
**Evidence:** `src/routes/**/+page.server.ts` branches at 77.55% (threshold 78%); `src/hooks.server.ts` branches at 78.46% (threshold 80%). Root causes: blog pagination branch unreachable until 7+ posts per language; hooks Umami CSP branches untested.
**Fix:** Either add missing test cases for `hooks.server.ts` Umami CSP branches (and bring blog threshold back in line as content grows), or lower hooks threshold to 78% with a explanatory comment. A failing coverage gate that is routinely ignored is worse than an honest threshold.
**Effort:** S

---

### P4-E2 — CI workflow is `workflow_dispatch`-only — no automatic run on push/PR

**Source:** Engineering
**Classification:** intentional (soft-launch comment in `ci.yml`)
**Recommendation:** fix
**Severity:** P3
**Evidence:** `.github/workflows/ci.yml:7` — `on: workflow_dispatch`. Docker publish workflow fires on push but does not run unit tests — only `pnpm build`.
**Fix:** Add `on: push: branches: [main, dev]` and `on: pull_request:` triggers to `ci.yml`. Split Playwright/Lighthouse into a separate optional job if CI runtime is a concern.
**Effort:** M

---

### P4-E3 — Lighthouse CI assertions are `warn`, not `error` — regressions land silently

**Source:** Engineering
**Classification:** intentional (soft-launch comment in `lighthouserc.cjs`)
**Recommendation:** fix
**Severity:** P3
**Evidence:** `lighthouse/lighthouserc.cjs:65–68` — all four categories use `['warn', { minScore: … }]`.
**Fix:** Promote at minimum `accessibility` and `seo` assertions to `error` (these are deterministic). Establish a baseline on the GitHub Actions runner and promote `performance` once variance is characterised.
**Effort:** S

---

### P4-E4 — `style-src: unsafe-inline` in CSP

**Source:** Engineering
**Classification:** unknown (may be required by a third-party widget)
**Recommendation:** investigate
**Severity:** P2
**Evidence:** `svelte.config.js:47` — `'style-src': ['self', 'unsafe-inline']`. Svelte's scoped styles compile to separate CSS files and should not require `unsafe-inline`.
**Fix:** Audit which dependency (if any) requires inline styles. Likely candidate: CAP widget. If none, remove. If CAP widget requires it, add a hash or nonce for that element only.
**Effort:** M

---

### P4-E5 — `Permissions-Policy` includes deprecated `interest-cohort=()` directive

**Source:** Engineering
**Classification:** improvement
**Recommendation:** fix
**Severity:** P3
**Evidence:** `src/hooks.server.ts:130` — `'camera=(), microphone=(), geolocation=(), interest-cohort=()'`. FLoC was cancelled; `interest-cohort` is a no-op in all current browsers.
**Fix:** Remove `interest-cohort=()`. Add `browsing-topics=()` to opt out of the Topics API.
**Effort:** S

---

### P4-E6 — `fail(400, …)` used for SMTP send failures (should be 502/503)

**Source:** Engineering
**Classification:** improvement
**Recommendation:** fix
**Severity:** P3
**Evidence:** `src/lib/forms/contact/action.ts:47` and `src/lib/forms/order/action.ts:46` — `return fail(400, { form, code: 'submission_failed' })` for email send errors.
**Fix:** Use `fail(502, …)` for SMTP infrastructure failures so proxy/monitoring tools correctly classify 5xx (infrastructure) vs 4xx (client input errors).
**Effort:** S

---

### P4-E7 — `createTransport()` creates a new nodemailer transport on every form submission

**Source:** Engineering
**Classification:** improvement
**Recommendation:** fix
**Severity:** P3
**Evidence:** `src/lib/server/email.ts:45–59` — `createTransport()` called inside `sendContactEmail`/`sendOrderEmail` on every invocation. Each submission incurs a new TCP + TLS handshake.
**Fix:** Move transport creation to module scope (singleton). Add `pool: true` and call `transport.verify()` at startup to surface SMTP misconfiguration early.
**Effort:** S

---

### P4-E8 — `isRealProductionHost()` duplicated verbatim in `cap.ts` and `hooks.server.ts`

**Source:** Engineering
**Classification:** intentional (justified in code comment; duplication exists to allow diverging behaviour)
**Recommendation:** keep (but extract the hostname string constant)
**Severity:** P3
**Evidence:** `src/lib/server/cap.ts:14–23` and `src/hooks.server.ts:28–37`. Comment at hooks line 27 acknowledges the duplication deliberately.
**Fix:** Extract `const PRODUCTION_HOSTNAME = 'voorvoeten.nl'` to `src/lib/server/config.ts` so the string literal is defined once. Keep the two function implementations separate.
**Effort:** S

---

### P4-E9 — Blog content `eager`-loaded at module init; no documented scaling threshold

**Source:** Engineering
**Classification:** intentional (acceptable at current scale)
**Recommendation:** keep (with comment)
**Severity:** P3
**Evidence:** `src/lib/blog/loader.ts:11` — `import.meta.glob({ eager: true })`. 9 posts across 3 languages. Comment noting "migrate to lazy loading at 50+ posts" is missing.
**Fix:** Add inline comment at `loader.ts:11`: "Eager-load is fine at current post count. Migrate to dynamic import at ≥50 posts per language to avoid cold-start memory pressure."
**Effort:** S

---

### P4-E10 — `svelte-check` emits 4 warnings suppressed by default

**Source:** Engineering
**Classification:** unknown
**Recommendation:** investigate
**Severity:** P3
**Evidence:** `ContactForm.svelte:24` and `OrderInsolesForm.svelte:24` — `state_referenced_locally` Svelte 5 warning on `superForm(data, …)`. `reimbursements/Page.svelte:143` and `:262` — `a11y_no_noninteractive_tabindex` on scrollable table containers.
**Fix:** For the `state_referenced_locally` warnings, verify the prop flow is correct (it is, since `data` comes from SSR load) then suppress explicitly with a `$inspect`/comment. For `tabindex`, switch to `<section>` or suppress with a justified `<!-- svelte-ignore -->`.
**Effort:** S

---

### P4-E11 — Batch-update all patch-level outdated dependencies

**Source:** Engineering
**Classification:** improvement
**Recommendation:** fix
**Severity:** P3
**Evidence:** `pnpm outdated`: `@inlang/paraglide-js`, `isbot`, `vitest`, `zod`, `vite`, `@sveltejs/vite-plugin-svelte` (7.0.0 → 7.1.2), etc. — all patch or minor.
**Fix:** One maintenance PR: batch-update all patch/minor packages. Separate PR for `prettier-plugin-svelte` 3 → 4 (major; requires `pnpm format` + full diff review).
**Effort:** S

---

### P4-E12 — HSTS header absent at application layer (documented as proxy responsibility)

**Source:** Engineering + Lighthouse
**Classification:** intentional
**Recommendation:** keep (add deployment checklist item)
**Severity:** P3
**Evidence:** `docs/DEPLOY.md:115–122` — HSTS intentionally omitted from container; upstream Caddy is responsible. No `Strict-Transport-Security` header on live site.
**Fix:** No code change. Add to `docs/DEPLOY.md` deployment checklist: `curl -I https://voorvoet.nl | grep Strict-Transport` as a pre-launch verification step.
**Effort:** S

---

### P4-E13 — Visual-parity e2e spec is a dead one-shot test

**Source:** Engineering
**Classification:** intentional (migration complete)
**Recommendation:** investigate / remove
**Severity:** P3
**Evidence:** `e2e/visual-parity.spec.ts` auto-skips when the old site directory is absent and is explicitly marked "MANUAL ONE-SHOT". Migration is complete at version ≥ 0.4.0.
**Fix:** Remove the spec file or archive it with a comment explaining it served its purpose.
**Effort:** S

---

### P4-S1 — Content gap: no dedicated service landing pages for high-intent local queries

**Source:** SEO
**Classification:** improvement (structural)
**Recommendation:** fix (Phase 4 — L effort, content + dev)
**Severity:** P2
**Evidence:** All clinical information is on one `/nl/informatie` page. High-intent queries with no dedicated page: "hielspoor behandeling enschede", "steunzolen op maat enschede", "ingegroeide teennagel podotherapeut enschede", "diabetische voetzorg enschede", "platvoeten behandeling enschede", "kinderpodotherapie enschede", "sportpodotherapie enschede", "bedrijfspodotherapie enschede".
**Fix:** Add a `treatments` route key with `/nl/behandelingen`, `/de/behandlungen`, `/en/treatments`. Create anchor-linked sections per condition with `Service` JSON-LD per treatment. Over time, add individual sub-pages per treatment.
**Effort:** L

---

### P4-S2 — Only 3 blog posts (all ~2023); insufficient topical authority

**Source:** SEO
**Classification:** improvement
**Recommendation:** fix (ongoing)
**Severity:** P2
**Evidence:** `src/content/blog/nl/` — 3 posts: `001_podotherapeut_of_podoloog.md` (2023-11-06), plus 2 others. Most recent post is ~2023.
**Fix:** Establish a cadence of 2 NL blog posts per month on high-intent topics (hielspoor, steunzolen, ingegroeide teennagel, etc.) with proper frontmatter: `meta_description`, `tags`, `thumbnail` with descriptive alt. Cross-link to `/nl/vergoedingen` and `/nl/zolen-bestellen`.
**Effort:** L (ongoing)

---

## Cross-cutting Issues

### CC-1 — Two-domain architecture (`voorvoet.nl` vs `voorvoeten.nl`) undocumented

**Source:** Engineering
**Phases:** P1-S5 (security), P4-E8 (architecture)
**Evidence:** `voorvoet.nl` is the user-facing domain (in all SEO, docs, structured data). `voorvoeten.nl` is the server hostname used in `isRealProductionHost()`. No documentation explains this split.
**Action:** Add a comment in `src/lib/server/config.ts` (or equivalent) explaining the two-domain setup and why the production guard uses `voorvoeten.nl`. This prevents the same confusion recurring in future operator onboarding.

---

### CC-2 — SPA navigation gap in server-side Umami tracking

**Source:** Umami
**Phases:** P0-A, P2 (all measurement work)
**Evidence:** SvelteKit SPA transitions after initial page load are not captured by server-side tracking. Only full page loads (direct URL, hard refresh, form POST redirect) are counted.
**Accepted trade-off:** For a marketing site this size, the primary conversion metric (form submit) is fully tracked server-side. Pageview counts will undercount multi-page sessions. This is the intended behaviour given "server-side only" preference. Document as accepted in `docs/DEPLOY.md`.

---

### CC-3 — `TURNSTILE_*` env vars in `.env` do not match `CAP_*` vars expected by codebase

**Source:** Umami (noted as out-of-scope; escalated here)
**Evidence:** Local `.env` contains `TURNSTILE_SECRET_KEY`, `TURNSTILE_ENABLED` — these do not match `CAP_ENABLED` / `CAP_SECRET` expected by `src/lib/server/cap.ts`. Suggests `.env` was not regenerated after a migration from Turnstile to Cap.
**Action:** Regenerate `.env` from `.env.example` to remove stale Turnstile keys. Add a note in `docs/DEPLOY.md` about the migration history.

---

## Open Questions for the User

1. **P1-S5 — Production hostname:** Is `PUBLIC_SITE_URL` set to `https://voorvoeten.nl` or `https://voorvoet.nl` in `/srv/voorvoet/.env` on the Hetzner VPS? The answer determines whether the CAPTCHA boot guard is currently active in production. (Yes/No: is the production `.env` already using `voorvoeten.nl`?)

2. **P1-S2 — Correct postal codes:** Are `7541 WE` (Eeftinksweg 13) and `7522 HJ` (Beethovenlaan 10) definitively correct? The footer and Google Maps embeds use these values; structured data uses different codes. Please verify against a physical letter or PostNL lookup before making the code change.

3. **P0-A — Tracking intent:** Do you want to keep "server-side only" tracking (Option A: remove `PUBLIC_UMAMI_SCRIPT_URL` from production, set `UMAMI_API_URL`) or switch to client-side (Option B: fix CORS on `umami.bakhuis.nu`)? Option A matches your stated intent; Option B requires changes to the Umami server config.

4. **P0-A — Production Umami instance:** What is the correct `UMAMI_WEBSITE_ID` UUID and the exact Umami API endpoint URL (`/api/send`)? These are needed to set the env vars on the VPS.

5. **P0-A — Umami server version:** Is `umami.bakhuis.nu` running Umami v1 or v2? The codebase sends a v2 `{type, payload}` format. If it is v1, events will be silently dropped (HTTP 400).

6. **P3-S4 — `/dev/` route in production:** Is `https://voorvoet.nl/dev/` accessible in production? If yes, `Disallow: /dev/` should be added to the non-disallow branch of `src/routes/robots.txt/+server.ts` regardless of the `PUBLIC_DISALLOW_INDEXING` flag value.

7. **P3-L1 — Font subset range:** Does any content on the site use characters outside Latin + Latin-ext (Unicode `U+0000-02FF`)? German text uses ä, ö, ü, ß — all within Latin-ext. Are there any typographic special characters (e.g. guillemets, specialized diacritics) that would require a wider range?

8. **P3-L1 — Variable font option:** Would switching from 7 static Lato weights to a single Lato variable font (~120 KB) be acceptable from a design/brand standpoint?

9. **P4-S1 — Treatments hub priority:** Is creating a `/nl/behandelingen` hub page (with dedicated sections for hielspoor, steunzolen, etc.) within the next quarter, or is that a longer-term roadmap item?

10. **P4-S2 — Blog content calendar:** Is there a planned publishing schedule for new blog posts? Understanding whether 2+ posts/month is feasible affects how much Phase 4 content strategy needs to be structured vs. opportunistic.

---

## Suggested Fix Order — Concrete Checklist

Work through these top-to-bottom. Each item is self-contained.

### Phase 0 — Today (unblock measurement)

- [ ] **1.** SSH to Hetzner VPS. Run `grep UMAMI /srv/voorvoet/.env` and `grep PUBLIC_UMAMI /srv/voorvoet/.env`. Confirm `PUBLIC_UMAMI_SCRIPT_URL` is set (explains the CORS error). Answer Open Question #3 (server-side vs client-side intent). Then:
  - If server-side (recommended): comment out `PUBLIC_UMAMI_SCRIPT_URL` and `PUBLIC_UMAMI_WEBSITE_ID`; uncomment and set `UMAMI_API_URL` and `UMAMI_WEBSITE_ID` with real values. Run `docker compose up -d`. Set `UMAMI_DEBUG=true` temporarily. Check `docker compose logs app | grep umami`.
  - If client-side: add `Access-Control-Allow-Origin: https://voorvoet.nl` at Caddy on `umami.bakhuis.nu`.
- [ ] **2.** Add startup log + debug log to `src/lib/server/umami.ts` (spec in P2-U1). This is the "fire alarm" — prevents needing another audit to diagnose tracking status.
- [ ] **3.** Verify tracking is working: open any page in a private browser window and check Umami dashboard for a pageview event within 30 seconds.

### Phase 1 — This Week (SEO foundation)

- [ ] **4.** Bump CVEs: `pnpm add svelte@^5.55.9 @sveltejs/kit@^2.61.0` then `pnpm audit`. (P1-S6)
- [ ] **5.** Confirm postal codes (Open Question #2). Then fix `src/lib/seo/structured-data.ts` line 30 (`7541 WE`) and line 67 (`7522 HJ`). (P1-S2)
- [ ] **6.** Add `telephone: '+31657750997'` to both `organizationLD()` and `podiatristLD()` in `src/lib/seo/structured-data.ts`. (P1-S3)
- [ ] **7.** Add `sameAs` array to `podiatristLD()` with NVvP and Kwaliteitsregister URLs. (P1-S7)
- [ ] **8.** Fix `openingHoursSpecification` in `podiatristLD()` — replace generic Mon–Fri 08:00–18:00 with per-location actual hours from `Footer.svelte`. (P1-S4)
- [ ] **9.** Add `podiatristLD()` + two-item `breadcrumbListLD()` to the catch-all `src/routes/[lang=lang]/[...path]/+page.server.ts` for all inner pages. (P1-S8)
- [ ] **10.** Fix Paraglide SSR locale: in `src/hooks.server.ts`, use `overwriteServerAsyncLocalStorage` or `paraglideHandle` so the `langSegment` from line 108 sets the per-request locale before `resolve(event)`. Validate with `curl https://voorvoet.nl/de | grep "hero__title"` — should return German text. (P1-S1)
- [ ] **11.** Fix sitemap namespace `https://` → `http://` in `src/routes/sitemap.xml/+server.ts:113`. (P1-S9)
- [ ] **12.** Confirm production hostname (Open Question #1). Then fix `isRealProductionHost()` in both `src/lib/server/cap.ts:19` and `src/hooks.server.ts:33` to also accept the correct hostname. (P1-S5)

### Phase 2 — Next Week (measurement)

- [ ] **13.** Add `404` event tracking in `src/hooks.server.ts` post-resolve block. (P2-U2)
- [ ] **14.** Create `src/routes/go/plan/+server.ts` redirect proxy and update all `LINK_PLAN_PORTAL` CTA links to `/go/plan?lang={lang}`. (P2-U3)
- [ ] **15.** Add form failure events (`form_validation_failed`, `form_cap_failed`) in both form action files and CAP handlers. (P2-U4)
- [ ] **16.** Add `legacy_redirect` event before the 308 throw in `src/hooks.server.ts`. (P2-U5)
- [ ] **17.** Deduplicate Umami CSP origin: `src/hooks.server.ts:63`. (P2-U6)
- [ ] **18.** Add `og:locale` + `og:type="article"` to `src/routes/[lang=lang]/blog/[slug]/+page.server.ts` meta return. Update `+layout.svelte:65` to use `pageMeta?.og?.type`. (P2-S1)
- [ ] **19.** Rewrite page titles in `src/lib/i18n/page-meta.ts` for all three languages (see SEO audit Phase 2 for full copy). (P2-S2)
- [ ] **20.** Trim `nl.home` meta description. Add `meta_description` frontmatter to all blog posts. Update `blog/[slug]/+page.server.ts` to use it. (P2-S3)
- [ ] **21.** Add `<lastmod>` to sitemap `buildUrl()` in `src/routes/sitemap.xml/+server.ts`. (P2-S4)
- [ ] **22.** Create `faqLD()` in `src/lib/seo/structured-data.ts` and emit it on the informatie page. (P2-S5)
- [ ] **23.** Configure the 10 recommended Umami dashboard views. (P2-U7)

---

## Appendix — Per-specialist Artifact Paths

- SEO: `artifacts/website-audit/2026-05-23T072306Z/seo-audit.md`
- Lighthouse: `artifacts/website-audit/2026-05-23T072306Z/lighthouse-audit.md` (+ 20 JSON reports in `artifacts/website-audit/2026-05-23T072306Z/lighthouse/`)
- Umami: `artifacts/website-audit/2026-05-23T072306Z/umami-audit.md`
- Engineering: `artifacts/website-audit/2026-05-23T072306Z/engineering-audit.md`
