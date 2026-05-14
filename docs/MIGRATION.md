# DNS Cutover & Migration Plan

Migration from the existing **voorvoet.nl** Reflex (Python) site to the new SvelteKit site.

## Pre-Cutover Checklist

Complete all items before touching DNS:

- [ ] New site passes all quality gates (`pnpm lint && pnpm check && pnpm test && pnpm build`)
- [ ] Lighthouse scores meet targets: Perf ≥ 0.95, A11y = 1.00, BP ≥ 0.95, SEO = 1.00
- [ ] All three language variants tested manually (nl, de, en)
- [ ] Contact form delivers email end-to-end (test with real SMTP credentials)
- [ ] Order form delivers email end-to-end
- [ ] Blog posts render correctly in all three languages
- [ ] `/sitemap.xml` returns valid XML with all page URLs
- [ ] `/robots.txt` is correct
- [ ] `/health` endpoint returns 200
- [ ] Hreflang tags verified with [hreflang tag testing tool](https://technicalseo.com/tools/hreflang/)
- [ ] Structured data validated at [schema.org validator](https://validator.schema.org/)
- [ ] Umami analytics tracking verified (pageview event fires on navigation)
- [ ] All legacy redirects tested (/ → /nl, /contact → /nl/contact, etc.)
- [ ] TLS certificate obtained and valid on new server (`curl -I https://voorvoet.nl`)
- [ ] Old server and new server both running simultaneously before DNS change

## TTL Preparation

At least **48 hours** before cutover, reduce the DNS TTL for `voorvoet.nl` and `www.voorvoet.nl` to **60 seconds** in Hetzner DNS. This minimises the propagation window during the actual switch.

## Cutover Steps

1. Log in to [Hetzner DNS Console](https://dns.hetzner.com/).

2. Update the `A` record for `voorvoet.nl` to the new server's IPv4.

3. Update the `AAAA` record for `voorvoet.nl` to the new server's IPv6 (if applicable).

4. Update `www.voorvoet.nl` records to the new server (or keep CNAME → `voorvoet.nl`).

5. Wait for TTL propagation (~60 seconds with the reduced TTL set above).

6. Verify DNS has propagated:

```fish
dig +short voorvoet.nl A
dig +short voorvoet.nl AAAA
# Should return the new server's IP
```

7. Verify the site serves over HTTPS:

```fish
curl -I https://voorvoet.nl/nl
# Expected: HTTP/2 200
```

8. Run a final Lighthouse audit against the live domain.

## Post-Cutover Monitoring

Monitor for 24–48 hours after cutover:

### Umami Analytics

- Verify pageviews are being recorded in the Umami dashboard.
- Compare traffic volume to the old site's baseline (if Umami was running on the old site).

### Uptime

```fish
# Manual check
curl -I https://voorvoet.nl/health

# Or configure an uptime monitor (e.g. Better Uptime, UptimeRobot) pointing to /health
```

### Error logs

```fish
# Watch for any 4xx/5xx errors in real time
docker compose logs -f app | jq 'select(.status >= 400)'
```

### Lighthouse Budget

Re-run Lighthouse against the live domain after cutover:

```fish
pnpm lighthouse
```

Scores should clear:
- Performance ≥ 0.95 (upstream proxy must enable gzip/zstd + long-lived `Cache-Control` for `/_app/immutable/*`)
- Best Practices ≥ 0.95 (compression closes `uses-text-compression`)
- Accessibility = 1.00
- SEO = 1.00

### Axe Accessibility

Run the axe sweep against the live domain:

```fish
# Update the base URL in e2e tests or run_axe.ts directly
pnpm e2e
```

## Rollback to Old Site

If the new site has a critical failure within the first 24 hours:

1. Log in to Hetzner DNS Console.
2. Revert the `A` record for `voorvoet.nl` to the old server's IP.
3. Wait for TTL propagation (60 seconds if TTL was reduced).
4. Verify traffic is back on the old server.
5. Investigate the failure on the new server without live traffic.

After rollback:

- Increase TTL back to a standard value (e.g. 3600 seconds).
- Fix the root cause on the new server.
- Re-run the pre-cutover checklist before attempting cutover again.

## Restore TTL

After cutover is confirmed stable (24–48 hours), restore TTL to a normal value:

```
voorvoet.nl A 3600 <new-server-ip>
```
