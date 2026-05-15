# Deployment Guide

The VoorVoet SvelteKit site ships as a Docker image published to GitHub Container Registry by the `docker-publish.yml` workflow on every push to `main`. The image is intended to run **behind an upstream reverse proxy** that terminates TLS and forwards traffic to the app on port 3000.

## Deployment Model

```
  Internet  ──TLS──▶  Your reverse proxy  ──HTTP──▶  app container :3000
                     (Nginx / Caddy / Traefik on your host)
```

The app container is responsible for:
- Serving the SvelteKit app on port 3000
- Outbound SMTP to deliver form submissions
- Outbound HTTPS to (optionally) Umami

Bot protection runs **fully in-process** via the embedded
[capjs-core](https://capjs.js.org) proof-of-work CAPTCHA — no third-party
egress, no separate sidecar container, no shared cache. See
[docs/RUNBOOK.md](RUNBOOK.md#rotate-cap_secret) for the secret-rotation
procedure.

The upstream proxy is responsible for:
- TLS termination (Let's Encrypt or otherwise)
- HTTP → HTTPS redirect
- HSTS header
- Static asset caching headers (optional — the app sets `Cache-Control: public, max-age=31536000, immutable` on `/_app/immutable/*`)
- Restricting `/health` to internal networks (optional — the endpoint is intentionally minimal but exposes app liveness)
- Forwarding `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`, `X-Request-Id` (optional)

## Image

The publish workflow pushes to:

```
ghcr.io/dinkellabs/website-voorvoet-svelte:<VERSION>
ghcr.io/dinkellabs/website-voorvoet-svelte:latest
```

Where `<VERSION>` is the content of the repo-root `VERSION` file at the commit. The workflow refuses to publish if the version tag already exists in GHCR, so every release requires a `VERSION` bump (use `make bump VERSION=X.Y.Z`).

## Environment Variables

Copy `.env.example` to `.env` on the host and fill in every required value before the first run:

```fish
cp .env.example .env
$EDITOR .env

# Lock down the secrets file — anything in the docker group can read it otherwise.
chmod 600 .env
chown root:root .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP relay hostname, e.g. `smtp.protonmail.ch` |
| `SMTP_PORT` | SMTP port (default `587`) |
| `SMTP_USERNAME` | SMTP auth username |
| `SMTP_PASSWORD` | SMTP auth password (keep secret) |
| `SMTP_FROM_EMAIL` | Envelope sender address |
| `SMTP_TO_EMAIL` | Recipient address for form submissions |
| `CAP_ENABLED` | Set `true` in production. The app refuses to start otherwise (boot guard) |
| `CAP_SECRET` | HMAC key for Cap challenge JWTs. Must be ≥16 bytes — generate with `openssl rand -hex 32` |
| `PUBLIC_CAP_API_ENDPOINT` | Path the widget POSTs to (typically `/api/cap/`); the widget appends `challenge` and `redeem` |
| `SITE_URL` | Full URL, e.g. `https://voorvoet.nl` |
| `PUBLIC_SITE_URL` | Same as `SITE_URL` |

Optional:

| Variable | Default | Description |
|----------|---------|-------------|
| `BLOG_SHOW_AUTHOR` | `false` | Show author on blog posts |
| `BLOG_SHOW_PUBLICATION_DATE` | `false` | Show publication date on blog posts |
| `UMAMI_API_URL` | — | Server-side Umami endpoint |
| `UMAMI_WEBSITE_ID` | — | Umami website UUID (server-side) |
| `UMAMI_TIMEOUT_MS` | `1500` | Umami request timeout |
| `PUBLIC_UMAMI_SCRIPT_URL` | — | Client-side Umami script URL |
| `PUBLIC_UMAMI_WEBSITE_ID` | — | Umami website UUID (client-side) |

### Umami: server-side vs client-side

Pick **one mode**, not both, or every pageview is counted twice.

- Setting `PUBLIC_UMAMI_SCRIPT_URL` activates the client-side script. Captures SPA navigation; needs JS.
- Setting `UMAMI_API_URL` (without the public script) activates the server-side path. Works without JS; doesn't see SPA navigation.
- If both are set, `hooks.server.ts` skips the server-side path and the client-side script wins.

### Proxy headers

`docker-compose.yml` sets `ADDRESS_HEADER=x-forwarded-for`, `XFF_DEPTH=1`, `PROTOCOL_HEADER=x-forwarded-proto`, `HOST_HEADER=x-forwarded-host`, and `BODY_SIZE_LIMIT=524288` on the `app` service. These tell adapter-node to trust `X-Forwarded-*` headers from your upstream proxy so `event.getClientAddress()` returns the real client IP.

`XFF_DEPTH` counts the number of trusted proxies in front of the app:

- `1` — one proxy in front (typical: your host's Nginx/Caddy/Traefik)
- `2` — two proxies (e.g. Cloudflare → your host's proxy → app)

**Do not** drop these env vars or the rate limiter and Umami analytics collapse to a single global bucket keyed on the proxy's IP.

Your upstream proxy must actually forward these headers. For Nginx:

```nginx
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host  $host;
```

For Caddy: `reverse_proxy` does this by default.

For Traefik: the `forwardedHeaders` middleware handles it.

### HSTS

The container does **not** set the HSTS header — your upstream reverse proxy should. Recommended value once your subdomains are audited:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Submit at [hstspreload.org](https://hstspreload.org) after every `voorvoet.nl` subdomain is verified to terminate TLS. Doing this prematurely makes subdomain TLS failures unrecoverable for up to a year per cached client.

## Exposing the container to your proxy

`docker-compose.yml` uses `expose: 3000` (declares the port for inter-container linking but does not publish it to the host). Two common exposure patterns:

### Proxy on the host

Add a port mapping bound to localhost so only the host's proxy can reach the app:

```yaml
services:
  app:
    ports:
      - '127.0.0.1:3000:3000'
```

Then point your host's Nginx/Caddy at `http://127.0.0.1:3000`.

### Proxy in Docker

Attach the app to your proxy's external network:

```yaml
services:
  app:
    networks:
      - reverse-proxy

networks:
  reverse-proxy:
    external: true
```

Drop the `expose: 3000` — networked containers can reach each other on any port without it.

Keep these overrides in a `docker-compose.override.yml` (gitignored, host-specific) rather than editing the tracked base file.

## First Deploy

```fish
# On the host
mkdir -p /srv/voorvoet
cd /srv/voorvoet

# Copy compose + env from the repo
curl -O https://raw.githubusercontent.com/dinkellabs/website-voorvoet-svelte/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/dinkellabs/website-voorvoet-svelte/main/.env.example
mv .env.example .env
$EDITOR .env
chmod 600 .env

# Optional: override.yml with your ports / external network setup
$EDITOR docker-compose.override.yml

# Pull and start
docker compose pull
docker compose up -d

# Verify
docker compose ps
docker compose logs -f app
```

Then add the app's upstream block to your reverse proxy and reload.

## Redeploy

```fish
cd /srv/voorvoet
docker compose pull
docker compose up -d
```

The healthcheck (`/health` endpoint) must pass before the new container is considered ready. The old container is stopped after the new one passes — adapter-node respects `SIGTERM` for a graceful shutdown within the 35s `stop_grace_period`.

## Rollback by Tag

The publish workflow tags the GHCR image with the `VERSION` file contents at each release. To roll back, edit `docker-compose.yml` (or your override) to pin the previous tag:

```yaml
services:
  app:
    image: ghcr.io/dinkellabs/website-voorvoet-svelte:0.1.0
```

```fish
docker compose pull
docker compose up -d
```

## Log Inspection

```fish
# Follow live logs
docker compose logs -f --tail=100 app

# Structured JSON in production — filter with jq
docker compose logs app | jq '.'

# Trace one request by ID (the upstream proxy can stamp X-Request-Id;
# the app reuses it if present, otherwise mints one).
docker compose logs app | jq 'select(.requestId == "uuid-here")'

# Errors only
docker compose logs app | jq 'select(.level == "error")'

# Count log levels in the last hour
docker compose logs --since=1h app | jq -r '.level' | sort | uniq -c
```

## Health Check

```fish
# Internal (from the host)
curl http://127.0.0.1:3000/health

# External (via your reverse proxy)
curl -I https://voorvoet.nl/health
```

The endpoint returns minimal info. If you don't want `/health` reachable from the public internet, block or 404 it at the upstream proxy — the container's own healthcheck hits it via loopback inside the container, so blocking external access won't affect that.
