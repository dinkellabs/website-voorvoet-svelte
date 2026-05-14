# VoorVoet Website Rewrite — Requirements Specification

This document is the single authoritative contract for rebuilding the VoorVoet podotherapy website from Reflex (Python) to FastAPI (backend) + Astro/React (frontend). No subsequent phase should need to reference the old repo.

---

## 1. Overview & Goals

**VoorVoet** is a podiatry practice in Enschede, Netherlands. The website serves as an informational site with:
- Multilingual content (nl primary, de, en)
- Two forms (contact + order insoles) that send email notifications
- A blog with 3 posts in 3 languages
- Insurance reimbursement and pricing tables
- SEO-optimized pages with structured data

**Goals of the rewrite**:
1. Replace Reflex with a modern, maintainable stack (FastAPI + Astro)
2. Achieve visual parity with the existing site
3. Improve performance (static where possible, SSR where needed)
4. Maintain all existing SEO features (structured data, hreflang, sitemaps)
5. Establish a proper quality baseline (tests, types, CI)

---

## 2. Tech Stack (Locked)

| Layer        | Technology                                                   |
|--------------|--------------------------------------------------------------|
| Backend      | Python 3.14, FastAPI, Pydantic v2, pydantic-settings, httpx, aiosmtplib, structlog, uvicorn |
| Frontend     | Astro 5+ (SSR via @astrojs/node), React islands, TypeScript strict |
| Blog         | Astro Content Collections (markdown)                         |
| i18n         | Astro built-in i18n routing (prefixDefaultLocale: true)      |
| Analytics    | Umami (script in Astro head + optional server-side relay)    |
| Bot protect  | Cloudflare Turnstile                                         |
| Email        | SMTP (ProtonMail) via aiosmtplib                             |
| Styling      | CSS custom properties (from theme tokens), no CSS framework  |
| Lint/Format  | Backend: ruff. Frontend: Biome                               |
| Types        | Backend: mypy strict. Frontend: tsc strict                   |
| Tests        | Backend: pytest + respx + aiosmtpd. Frontend: Vitest + Playwright |
| Deploy       | Docker (backend + frontend services), docker-compose, Caddy  |
| Package mgmt | Backend: uv. Frontend: pnpm                                 |
| CI           | GitHub Actions                                               |

---

## 3. Page-by-Page Specification

### 3.1 Home (`/nl`, `/de`, `/en`)

**Sections** (in order):
1. **Hero**: Full-viewport background image (`podotherapeut_enschede_kim_bakhuis_loopt_op_strand...`), gradient overlay, CTA box with title "VoorVoet" + subtitle + appointment button
2. **Who is VoorVoet**: Image-text section with Kim Bakhuis portrait
3. **Order Insoles Promo**: CTA promoting insole ordering
4. **Introduction**: Text section about the practice
5. **Information**: Grid of information cards (icon + text)
6. **Locations**: Two locations with Google Maps embeds (Eeftinksweg 13 + Beethovenlaan 10)

**Structured data**: Organization + Podiatrist JSON-LD

### 3.2 Information (`/nl/informatie`, `/de/informationen`, `/en/information`)

**Sections**:
1. Hero
2. What is Podiatry (image-text)
3. Treatment Path (behandeltraject)
4. Risk Foot (risk level cards)
5. Common Issues
6. Corporate Podiatry (image-text)
7. For Everyone
8. Starter CTA

### 3.3 Reimbursements (`/nl/vergoedingen`, `/de/erstattungen`, `/en/reimbursements`)

**Sections**:
1. Hero
2. Reimbursement Table — data from `reimbursements_2026.json` (verzekeraar, pakket, vergoeding)
3. Pricing Table — data from `pricing_2026.csv` (34 treatments with Euro prices)
4. Starter CTA

**Data**: Both files live in `data/reimbursements/`. Configurable via env vars `REIMBURSEMENTS_DATA_FILE` and `PRICING_DATA_FILE`.

### 3.4 Contact (`/nl/contact`, `/de/kontakt`, `/en/contact`)

**Sections**:
1. Hero
2. Contact Form (React island)
3. Starter CTA

**Form fields**: See Section 6 (API Contract).

### 3.5 Order Insoles (`/nl/zolen-bestellen`, `/de/einlagen-bestellen`, `/en/order-insoles`)

**Sections**:
1. Hero
2. Order Form (React island)
3. Starter CTA

**Form fields**: See Section 6 (API Contract).

### 3.6 Blog Index (`/nl/blog`, `/de/blog`, `/en/blog`)

**Sections**:
1. Hero
2. Blog card grid (sorted by date DESC)
3. Starter CTA

### 3.7 Blog Post (`/{lang}/blog/{slug}`)

**Sections**:
1. Hero
2. Rendered markdown content (headings, paragraphs, images with AVIF/WebP/JPG, `!button[Label](url)` custom syntax, lists)
3. Starter CTA

**Structured data**: BlogPosting JSON-LD, BreadcrumbList JSON-LD

### 3.8 Credits (`/nl/credits`, `/de/credits`, `/en/credits`)

**Sections**:
1. Hero
2. Python packages list (5 entries with multilingual descriptions)
3. Image credits table (23 entries with author, source, links)

### 3.9 404 Page

Single language (nl). Hero + message + link back.

### 3.10 Default Redirects

| From                | To              |
|---------------------|-----------------|
| `/`                 | `/nl`           |
| `/informatie`       | `/nl/informatie`|
| `/vergoedingen`     | `/nl/vergoedingen` |
| `/contact`          | `/nl/contact`   |
| `/zolen-bestellen`  | `/nl/zolen-bestellen` |
| `/credits`          | `/nl/credits`   |
| `/blog`             | `/nl/blog`      |

---

## 4. Component Inventory (Target)

### Astro Components (SSR)

| Component              | Description                                    | Source Page(s)    |
|------------------------|------------------------------------------------|-------------------|
| `Base.astro`           | Layout with head, meta, Umami, hreflang        | All               |
| `Header.astro`         | Fixed header with nav links                    | All               |
| `Footer.astro`         | Locations, contact, logos, links                | All               |
| `HeroBanner.astro`     | Full-viewport hero with bg image + gradient    | All               |
| `Section.astro`        | Section wrapper with SVG wave dividers         | All               |
| `Container.astro`      | Max-width centered container                   | All               |
| `ImageTextSection.astro`| Two-column image + text                       | Home, Info        |
| `InformationCard.astro`| Icon + text card                               | Home, Info        |
| `LocationSection.astro`| Location with map embed                        | Home              |
| `RiskLevelCard.astro`  | Risk classification card                       | Info              |
| `BlogCard.astro`       | Blog preview card (thumbnail, title, summary)  | Blog index        |
| `ResponsiveImage.astro`| `<picture>` with AVIF/WebP/JPG                | All               |
| `StarterCTA.astro`     | Bottom CTA section                             | Most pages        |

### React Islands (Interactive)

| Component                  | Description                          |
|----------------------------|--------------------------------------|
| `ContactForm.tsx`          | Contact form with validation         |
| `OrderInsolesForm.tsx`     | Order form with validation           |
| `LanguageSwitcher.tsx`     | Flag-based language popup            |
| `MobileNav.tsx`            | Hamburger menu with nav links        |
| `Toast.tsx`                | Global toast notification system     |

### Shared Utilities

| Module            | Description                                        |
|-------------------|----------------------------------------------------|
| `lib/api.ts`      | Typed fetch client (generated from OpenAPI)         |
| `lib/i18n.ts`     | Route mappings, translations, page titles           |
| `lib/toast.ts`    | Toast state store (zustand or custom)               |

---

## 5. Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors - Primary */
  --color-primary-50: #ffffff;
  --color-primary-100: #d1fae5;
  --color-primary-300: #05a8a2;
  --color-primary-500: #05847c;
  --color-primary-700: #005152;

  /* Colors - Backgrounds */
  --color-bg-white: #ffffff;
  --color-bg-green-light: #dcedec;

  /* Colors - Text */
  --color-text-heading: #111827;
  --color-text-subheading: #1f2937;
  --color-text-content: #131f1e;
  --color-text-white: #ffffff;
  --color-text-muted: #666666;
  --color-text-placeholder: #888888;
  --color-text-secondary: #4a4a4a;
  --color-text-link: #3b82f6;

  /* Colors - Borders */
  --color-border-light: #f3f4f6;

  /* Colors - Semantic */
  --color-error: #ef4444;
  --color-success: #05847c;

  /* Typography */
  --font-family: "Lato", ui-sans-serif, system-ui, sans-serif;
  --font-size-regular: 1.125rem;
  --font-size-button: 1.5rem;
  --font-size-nav: 1.25rem;
  --font-size-card-title: 1.25rem;
  --font-size-body-accent: 1.25rem;

  /* Spacing */
  --spacing-section-vertical: 5rem;
  --spacing-grid-gap: 2rem;
  --spacing-section-gap: 2rem;
  --spacing-card: 3rem;

  /* Layout */
  --max-width: 1200px;
  --card-max-width: 350px;
  --card-min-width: 280px;
  --image-max-width: 333px;
  --image-border-radius: 4px;
  --image-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --blog-image-max-width: 800px;
}
```

Responsive values (section titles, hero titles, spacing, etc.) use `clamp()` or media queries at breakpoints: 640px, 768px, 1024px.

---

## 6. API Contract

### `GET /health`

Response 200:
```json
{ "status": "ok", "version": "1.0.0" }
```

### `POST /api/contact`

Request body:
```json
{
  "first_name": "string (required, non-empty)",
  "last_name": "string (required, non-empty)",
  "request_type": "\"Bel mij terug\" | \"Contact per email\"",
  "phone": "string (required, 10 digits, numeric only)",
  "email": "string (required, valid email format)",
  "description": "string (required, max 2000 chars)",
  "turnstile_token": "string (required if turnstile enabled)"
}
```

Responses:
- 204: Success (email sent)
- 400 `turnstile_failed`: Turnstile verification failed
- 422: Validation error (Pydantic)
- 502 `email_failed`: SMTP failure

Email subject: `"Nieuw contactformulier: {request_type}"`

### `POST /api/orders/insoles`

Request body:
```json
{
  "first_name": "string (required)",
  "last_name": "string (required)",
  "email": "string (required, valid email)",
  "birth_date": "string (required, DD-MM-YYYY format)",
  "insole_type": "\"Dagelijkse zolen\" | \"Sportzolen\" | \"Zolen voor werkschoenen\"",
  "quantity": "int (1-3)",
  "comments": "string (optional, max 2000 chars)",
  "turnstile_token": "string (required if turnstile enabled)"
}
```

Responses: same pattern as contact.

Email subject: `"Nieuw bestelling extra paar zolen: {first_name} {last_name}"`

---

## 7. Content Model

### Blog Frontmatter Schema

```yaml
title: string       # Required
slug: string        # Required, URL-safe
summary: string     # Required, used in meta description + cards
author: string      # e.g., "Kim Bakhuis"
date: string        # YYYY-MM-DD
thumbnail: string   # Filename in post's image directory
thumbnail_alt: string
tags: string[]
category: string
```

### Blog Content Features

- Standard markdown (headings h1-h6, paragraphs, bold, italic, links)
- Images with automatic AVIF/WebP/JPG resolution
- Custom `!button[Label](url)` syntax → renders as CTA button
- Ordered and unordered lists

### Translation Linking

Posts are linked across languages by the 3-digit story number prefix in the filename (e.g., `001_*`). This drives hreflang generation.

### File Organization

```
src/content/blog/
├── nl/
│   ├── podotherapeut-of-podoloog.md        (story 001)
│   ├── steunzolen-podotherapeutische-zolen.md (story 002)
│   └── zonder-voetklachten-nieuw-jaar.md    (story 003)
├── de/
│   └── ... (same 3 posts)
└── en/
    └── ... (same 3 posts)
```

### Static Data Files

- `reimbursements_2026.json`: array of `{verzekeraar, pakket, vergoeding}`
- `pricing_2026.csv`: `Behandeling,Prijs` (34 rows, Euro format)
- `credits.ts`: Python packages + image credits (from `data/credits.py`)

---

## 8. SEO Requirements

### Per Page
- `<title>` tag per language (from PAGE_TITLES)
- `<meta name="description">` per language (from PAGE_DESCRIPTIONS)
- `<link rel="canonical">` with full URL
- Open Graph: title, description, url, type (website/article), locale, site_name, image
- Twitter Card: summary_large_image
- `<html lang="{lang}">` attribute
- Hreflang tags: all 3 language variants + x-default (→ nl)
- Favicon links (ico, png 96x96, svg, apple-touch-icon, manifest)

### Structured Data (JSON-LD)
- Organization (brand identity) — home page
- Podiatrist (full business schema with addresses, hours, geo) — home page
- BlogPosting — each blog post
- BreadcrumbList — all pages

### Sitemap
- All pages in all languages with alternates
- Priority: home=1.0, blog=0.8, blog posts=0.7, others=0.6
- Changefreq: home/blog=weekly, others=monthly

---

## 9. Environment Variables

| Variable                   | Type    | Default              | Required |
|----------------------------|---------|----------------------|----------|
| TURNSTILE_SITE_KEY         | string  | dummy key            | no       |
| TURNSTILE_SECRET_KEY       | string  | dummy key            | no       |
| TURNSTILE_ENABLED          | bool    | false                | no       |
| TURNSTILE_DUMMY_MODE       | enum    | always_pass          | no       |
| SMTP_HOST                  | string  | smtp.protonmail.ch   | no       |
| SMTP_PORT                  | int     | 587                  | no       |
| SMTP_USERNAME              | string  | -                    | yes*     |
| SMTP_PASSWORD              | string  | -                    | yes*     |
| SMTP_FROM_EMAIL            | string  | -                    | yes*     |
| SMTP_TO_EMAIL              | string  | -                    | yes*     |
| LINK_PLAN_PORTAL           | string  | -                    | no       |
| BLOG_SHOW_AUTHOR           | bool    | false                | no       |
| BLOG_SHOW_PUBLICATION_DATE | bool    | false                | no       |
| SITE_URL                   | string  | https://voorvoet.nl  | no       |
| UMAMI_SCRIPT_URL           | string  | -                    | no       |
| UMAMI_WEBSITE_ID           | string  | -                    | no       |
| REIMBURSEMENTS_DATA_FILE   | string  | reimbursements_2026.json | no   |
| PRICING_DATA_FILE          | string  | pricing_2026.csv     | no       |

*Required for email sending to work. App starts without them but forms will fail.

Frontend-specific (PUBLIC_ prefix for Astro):
| Variable                      | Purpose                  |
|-------------------------------|--------------------------|
| PUBLIC_TURNSTILE_SITE_KEY     | Turnstile widget key     |
| PUBLIC_API_URL                | Backend API base URL     |
| PUBLIC_SITE_URL               | Site URL for meta tags   |
| PUBLIC_UMAMI_SCRIPT_URL       | Umami script URL         |
| PUBLIC_UMAMI_WEBSITE_ID       | Umami website ID         |
| PUBLIC_LINK_PLAN_PORTAL       | Appointment portal URL   |

---

## 10. Quality Bar

See `docs/phase1/quality_spec.md` for full details.

**Summary**:
- Backend: ruff (lint+format), mypy strict, pytest ≥80% coverage
- Frontend: Biome (lint+format), tsc strict, Vitest ≥70% coverage
- Pre-commit: all hooks must pass before commit
- CI: GitHub Actions with matrix builds
- E2E: Playwright against docker-compose stack
- Type safety: Pydantic → OpenAPI → openapi-typescript → typed fetch client

---

## 11. Assets to Migrate

- 144 image files from `assets/images/` → `src/frontend/public/images/`
- 9 blog markdown files → `src/frontend/src/content/blog/{lang}/`
- 4 data files (reimbursements JSON + pricing CSV, 2025 + 2026) → `src/frontend/src/data/` or `src/backend/data/`
- SVG logo, favicons, manifest → `src/frontend/public/`
- PDF documents (privacy policy, terms) → `src/frontend/public/documents/`
- `styles.css` (form validation styles) → integrated into new CSS

---

## 12. Resolved Questions

1. **Appointment portal**: `LINK_PLAN_PORTAL` is still valid. Opens in **same tab** (new tab gets blocked by popup blockers).
2. **Blog pagination**: Yes, needed. Build pagination component for the blog index.
3. **Reimbursements data**: Owner (Dennis) updates manually. No admin UI needed.
4. **Font self-hosting**: Yes. Self-host Lato for GDPR/performance.
5. **Icons**: Replace Font Awesome 4.7 with **Lucide** icons (only ~5 icons used: phone, envelope, chevron-down, menu, x).
6. **Umami**: Self-hosted on owner's home server. URLs configured via env vars.
7. **DNS/Deployment**: VPS on **Hetzner** with Hetzner DNS. No Cloudflare proxy (Turnstile still works without CF proxy).
8. **Privacy/Terms**: Convert PDFs to **Astro pages** (not external PDFs).
9. **Google Maps**: Use **static map images** (no iframe embeds) for performance/privacy.
10. **Email templates**: Keep **simple inline HTML** (no MJML).
