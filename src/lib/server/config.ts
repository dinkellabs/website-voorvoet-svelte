/**
 * Hostnames that count as "real production" for the purposes of boot-time
 * guards (CAP enforcement, missing-env warnings). The site is reachable on
 * two domains:
 *   - voorvoet.nl    — primary user-facing domain
 *   - voorvoeten.nl  — server hostname kept as an alias
 *
 * Both are listed so the guards trip regardless of which `PUBLIC_SITE_URL` is
 * configured in the production environment.
 */
export const PRODUCTION_HOSTNAMES = ['voorvoet.nl', 'voorvoeten.nl'] as const;

export function isProductionHostname(hostname: string): boolean {
  return (PRODUCTION_HOSTNAMES as readonly string[]).includes(hostname);
}
