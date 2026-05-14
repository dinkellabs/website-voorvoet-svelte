# Operations Runbook

Operational procedures for common tasks. All commands assume you are on the Hetzner VPS in `/srv/voorvoet` unless otherwise noted.

## Rotate Cloudflare Turnstile Keys

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → your site.
2. Click **Rotate secret key** — the old key keeps working for ~12 hours.
3. Copy the new **Secret key** and **Site key**.
4. Update `.env` on the server:

```fish
# Edit the relevant lines
TURNSTILE_SECRET_KEY=<new-secret-key>
PUBLIC_TURNSTILE_SITE_KEY=<new-site-key>
```

5. Redeploy the app (the upstream reverse proxy is unaffected):

```fish
docker compose pull && docker compose up -d
```

6. Verify the contact and order forms work end-to-end.
7. After 24 hours, verify the old key is fully retired in the Cloudflare dashboard.

## Change SMTP Provider

1. Obtain credentials from the new provider (host, port, username, password, from address).
2. Update `.env`:

```fish
SMTP_HOST=smtp.new-provider.com
SMTP_PORT=587
SMTP_USERNAME=new-user@new-provider.com
SMTP_PASSWORD=<new-password>
SMTP_FROM_EMAIL=noreply@voorvoet.nl
```

3. Redeploy:

```fish
docker compose pull && docker compose up -d
```

4. Test by submitting the contact form on `https://voorvoet.nl/nl/contact`.
5. Check logs for confirmation:

```fish
docker compose logs app | jq 'select(.msg | contains("email sent"))'
```

## Add a New Language

VoorVoet uses [Paraglide.js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for i18n.

1. Add the new locale to `project.inlang/settings.json`:

```json
{
  "sourceLanguageTag": "nl",
  "languageTags": ["nl", "de", "en", "fr"]
}
```

2. Create the message file by copying from an existing locale:

```fish
cp messages/en.json messages/fr.json
```

3. Translate every value in `messages/fr.json`.

4. Recompile Paraglide:

```fish
pnpm paraglide:compile
```

5. Add the locale to the route map in `src/lib/i18n/route-map.ts`. Add `"fr"` to the `Lang` type and all route slug mappings.

6. Update the lang param matcher `src/params/lang.ts` to accept `"fr"`.

7. Create blog content for the new locale:

```fish
mkdir -p src/content/blog/fr
# Copy and translate nl posts
cp src/content/blog/nl/*.md src/content/blog/fr/
```

8. Add legacy redirect entries in `src/hooks.server.ts` `LEGACY_REDIRECTS` if needed.

9. Create legal content pages for the new locale in `src/content/legal/fr/`.

10. Rebuild and test:

```fish
pnpm build
pnpm preview
```

## Add a Blog Post

Blog posts are Markdown files processed by [mdsvex](https://mdsvex.com). Each post must exist in all three language directories.

### Frontmatter shape

```yaml
---
title: "Post title"
slug: "url-slug"
summary: "One-paragraph summary shown on the blog list page."
author: "Kim Bakhuis"
date: "YYYY-MM-DD"
thumbnail: "thumbnail.jpg"
thumbnail_alt: "Descriptive alt text for the thumbnail image."
tags: ["tag1", "tag2"]
category: "Category name"
---
```

### Image requirements

- Place all post images alongside the markdown file in `src/content/blog/{lang}/{slug}/`.
- Thumbnail: 800×600 px minimum, AVIF + WebP + JPEG variants recommended.
- All inline images must have descriptive `alt` text.
- Image credits go in the post body, e.g. `*Photo: Photographer Name / Source*`.

### Steps

1. Create the post directory and files:

```fish
set SLUG "my-new-post"
for lang in nl de en
    mkdir -p src/content/blog/$lang/$SLUG
    # Create the .md file with correct frontmatter
    touch src/content/blog/$lang/$SLUG.md
end
```

2. Write the content in Dutch first (`nl`), then translate to `de` and `en`.

3. Add thumbnail image to each language directory (or symlink to a shared assets location).

4. Run the dev server and check the blog list and post pages:

```fish
pnpm dev
# Visit http://localhost:5173/nl/blog
```

5. Verify all three language variants render correctly.

6. Build and run Lighthouse to ensure no new performance regressions:

```fish
pnpm build
pnpm preview &
pnpm lighthouse
```

## Recover from a Failed Email Send

Symptoms: contact or order form returns a `502` error; logs show `"order email send failed"` or `"contact email send failed"`.

### Diagnose

```fish
# Check recent errors
docker compose logs app | jq 'select(.level == "error" and (.msg | contains("email")))'

# Look for SMTP connection errors
docker compose logs app | jq 'select(.err != null)' | tail -20
```

Common causes:

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` | SMTP server unreachable | Check `SMTP_HOST`/`SMTP_PORT` in `.env` |
| `EAUTH` | Authentication failed | Rotate `SMTP_PASSWORD` |
| `ETIMEDOUT` | Network timeout | Check VPS outbound firewall on port 587 |
| `530 Must issue a STARTTLS` | TLS negotiation failed | Confirm `requireTLS: true` in email.ts |

### Resend a submission manually

Form submissions are not persisted server-side. If an email failed, the user must resubmit the form. Consider adding a visible retry button to the error state in the form component.

### Temporary workaround

If the SMTP provider is down, set a maintenance notice by deploying a temporary static page or redirecting to a "contact via phone" page.

### Verify fix

After updating `.env`, redeploy and test:

```fish
docker compose pull && docker compose up -d
# Submit the contact form at https://voorvoet.nl/nl/contact
docker compose logs app | jq 'select(.msg | contains("email sent"))' | tail -5
```

## Operational Constraints

### Rate limiter is in-memory and single-replica

`src/lib/server/rate-limiter.ts` uses `sveltekit-rate-limiter`'s default in-memory `TTLCache`. Two implications:

- **Every container restart resets the counters.** An attacker who can trigger restarts (or just wait for them) gets fresh quota. Acceptable for a single-replica deployment; not acceptable at scale.
- **Scaling to `replicas: 2+` splits the limiter** — each replica enforces its own counters, so the effective limit doubles. Before scaling, swap in a Redis-backed `RateLimiterStore`.

The limiter keys on `event.getClientAddress()`, which only returns the real client IP because `ADDRESS_HEADER`/`XFF_DEPTH` are wired in `docker-compose.yml` and your upstream proxy forwards `X-Forwarded-For`. Drop either side and the limiter collapses to one global bucket.

### CSP report endpoint

CSP violations POST to `/csp-report` and land in pino logs at `info` level. Watch for spikes:

```fish
docker compose logs app | jq 'select(.msg == "csp violation")' | tail -20
```

A sudden run of violations after a deploy usually means a CSP directive needs a new origin (e.g. when adding a third-party widget).
