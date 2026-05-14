# SPEC_DELTAS — SvelteKit Deviations from REQUIREMENTS.md

This file records every place the SvelteKit build intentionally deviates from
`docs/REQUIREMENTS.md`, which was written for a FastAPI + Astro architecture.
The REQUIREMENTS doc remains the authoritative contract for *what* to build
(pages, forms, content model, SEO, design tokens, etc.); only the *how* changes.

---

## §1 / §2 — Architecture: Single app instead of FastAPI + Astro split

**REQUIREMENTS says**: Two separate services — a Python FastAPI backend and an
Astro SSR frontend deployed as separate Docker containers.

**SvelteKit does**: A single SvelteKit application handles both server-side
rendering and all server logic. No Python/FastAPI service exists. The Docker
deployment runs one Node.js container instead of two services.

---

## §2 — Tech Stack replacements

| REQUIREMENTS (Astro) | SvelteKit replacement |
|---|---|
| Astro 5+ (SSR via @astrojs/node) | SvelteKit (SSR via @sveltejs/adapter-node) |
| React islands for interactive components | Svelte components (no React dependency) |
| Astro Content Collections (markdown) | mdsvex content collections |
| Astro built-in i18n routing (`prefixDefaultLocale: true`) | Paraglide.js (`@inlang/paraglide-sveltekit`) |
| Biome (frontend lint/format) | ESLint + Prettier (Biome does not support `.svelte` files) |
| Python 3.14, FastAPI, Pydantic v2, aiosmtplib, structlog, uvicorn | Removed — SvelteKit server-side code replaces backend |
| `openapi-typescript` generated fetch client (`lib/api.ts`) | Removed — no OpenAPI schema; forms use SvelteKit form actions |

---

## §4 — Component inventory: `.astro` files become `.svelte` files

**REQUIREMENTS says**: All layout and page-section components are Astro
components (`.astro` extension, e.g. `Base.astro`, `HeroBanner.astro`,
`BlogCard.astro`, etc.).

**SvelteKit does**: All components are Svelte components (`.svelte` extension).
The component names and responsibilities remain the same; only the file format
and syntax change.

The "React islands" (`ContactForm.tsx`, `OrderInsolesForm.tsx`,
`LanguageSwitcher.tsx`, `MobileNav.tsx`, `Toast.tsx`) become `.svelte`
components — no React or TSX files.

---

## §4 — Shared utilities: `lib/api.ts` removed

**REQUIREMENTS says**: `lib/api.ts` is a typed fetch client generated from the
OpenAPI schema via `openapi-typescript`.

**SvelteKit does**: No generated API client. Form submissions are handled
entirely by SvelteKit form actions (`+page.server.ts`). No `lib/api.ts` file
is needed.

---

## §6 — Form transport: form actions instead of JSON REST endpoints

**REQUIREMENTS says**: Contact form POSTs JSON to `POST /api/contact`; order
form POSTs JSON to `POST /api/orders/insoles`. Response codes are 204/400/422/502.

**SvelteKit does**: Both forms use SvelteKit form actions defined in the
corresponding `+page.server.ts` files. The HTML form submits as
`application/x-www-form-urlencoded`; the action returns a typed `ActionResult`.

**Unchanged**: All field names, validation rules, turnstile integration, and
email behaviour from §6 still apply exactly. The request/response *shape* is
preserved; only the transport layer changes (form actions vs. JSON REST).

`GET /health` is not needed and is omitted.

---

## §6 — Backend env vars: `PUBLIC_API_URL` removed

**REQUIREMENTS says**: `PUBLIC_API_URL` points the Astro frontend at the
FastAPI backend.

**SvelteKit does**: No separate backend URL. All server logic runs inside
SvelteKit. `PUBLIC_API_URL` is unused and not defined.

---

## §9 — Environment variables: `PUBLIC_` prefix differences

**REQUIREMENTS says**: Astro exposes client-side vars via the `PUBLIC_` prefix
(`PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_SITE_URL`, etc.).

**SvelteKit does**: SvelteKit uses the same `PUBLIC_` prefix convention via
`$env/static/public`, so variable *names* are kept identical. `PUBLIC_API_URL`
is the one exception — it is removed (see §6 delta above).

Backend-only vars (`SMTP_*`, `TURNSTILE_SECRET_KEY`, `REIMBURSEMENTS_DATA_FILE`,
`PRICING_DATA_FILE`, `BLOG_SHOW_*`) are accessed via `$env/static/private` or
`$env/dynamic/private` in `+page.server.ts` / `+server.ts` — same semantics,
no Python process required.

---

## §7 — Blog: mdsvex instead of Astro Content Collections

**REQUIREMENTS says**: Blog posts use Astro Content Collections with the
frontmatter schema defined in §7.

**SvelteKit does**: Blog posts use mdsvex. The frontmatter schema (title, slug,
summary, author, date, thumbnail, thumbnail_alt, tags, category) is unchanged.
The file layout (`src/content/blog/{lang}/{NNN}_{slug}.md`) is unchanged.
The custom `!button[Label](url)` syntax is implemented as an mdsvex remark
plugin instead of an Astro remark plugin.

---

## §10 — Quality: ESLint + Prettier instead of Biome

**REQUIREMENTS says**: Frontend lint/format uses Biome.

**SvelteKit does**: ESLint + Prettier with `eslint-plugin-svelte` and
`prettier-plugin-svelte`. Biome is excluded because it does not support
`.svelte` files. All other quality requirements (tsc strict, Vitest ≥70%,
Playwright E2E) remain in force.

---

## §10 — Quality: `openapi-typescript` step removed

**REQUIREMENTS says**: Type safety pipeline is Pydantic → OpenAPI →
`openapi-typescript` → typed fetch client.

**SvelteKit does**: No OpenAPI schema is generated. End-to-end type safety is
achieved through SvelteKit's typed form actions and TypeScript interfaces for
data files. The `openapi-typescript` build step does not exist.

---

## §11 — Asset paths

**REQUIREMENTS says**: Images go to `src/frontend/public/images/`, data files
to `src/frontend/src/data/`, PDFs to `src/frontend/public/documents/`.

**SvelteKit does**: Paths follow SvelteKit conventions:
- Images → `static/images/`
- PDFs → `static/documents/`
- Favicons/manifest/robots.txt → `static/`
- Data files → `src/lib/data/`
- Blog content → `src/content/blog/{lang}/`

---

## §12 — Privacy/Terms pages

**REQUIREMENTS says** (resolved question 8): Convert PDFs to Astro pages
(not external PDFs).

**SvelteKit does**: Convert PDFs to SvelteKit pages (`+page.svelte`) in the
appropriate route directories. The PDFs are still present in `static/documents/`
as a fallback/download asset, but the canonical user-facing URLs render
SvelteKit pages.

---

## §3.3 — Reimbursements data: server-side only

**REQUIREMENTS says**: Data files are configurable via env vars
`REIMBURSEMENTS_DATA_FILE` and `PRICING_DATA_FILE`, implying the FastAPI backend
reads and serves them.

**SvelteKit does**: Data files are read directly in `+page.server.ts` load
functions. The env vars are still supported to allow switching between
`*_2025` and `*_2026` versions.

---

## Not changed

Everything else in REQUIREMENTS.md applies without modification:
- All pages, routes, and URL structures (§3, §3.10)
- All design tokens and CSS custom properties (§5)
- Form field names, validation rules, and email behaviour (§6)
- Blog frontmatter schema and `!button[]()` syntax (§7)
- All SEO requirements: structured data, hreflang, sitemap, Open Graph (§8)
- All env var names except `PUBLIC_API_URL` (§9)
- Static map images for locations (resolved question 9)
- Lato self-hosting (resolved question 4)
- Lucide icons (resolved question 5)
- Same-tab appointment link (resolved question 1)
