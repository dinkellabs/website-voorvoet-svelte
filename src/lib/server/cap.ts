import { createHash } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import { building, dev } from '$app/environment';
import { withRequestId } from '$lib/server/logger.js';
import { consumeToken } from '$lib/server/cap-store.js';

// `building` is true during `vite build`'s analyse pass; env vars aren't
// loaded then. Skip the production guard so the build doesn't trip.
const isProduction = !dev && !building;

// E2E escape valve: playwright runs `node build/index.js` (isProduction=true)
// but with bot protection disabled. Setting CAP_DUMMY_MODE=always_pass
// bypasses the production guards. NEVER set this in real production.
const dummyMode = env.CAP_DUMMY_MODE === 'always_pass';
const capEnabled = (env.CAP_ENABLED ?? 'false').toLowerCase() === 'true';

const rawSecret = env.CAP_SECRET ?? '';
const publicEndpoint = pubEnv.PUBLIC_CAP_API_ENDPOINT ?? '';

if (isProduction && !dummyMode) {
  if (!capEnabled) {
    throw new Error(
      'CAP_ENABLED must be exactly "true" in production. Refusing to start with bot protection disabled.',
    );
  }
  if (Buffer.byteLength(rawSecret, 'utf8') < 16) {
    throw new Error('CAP_SECRET must be set to ≥16 bytes in production.');
  }
  if (!publicEndpoint) {
    throw new Error('PUBLIC_CAP_API_ENDPOINT must be set in production.');
  }
}

export const CAP_ENABLED = capEnabled;
export const CAP_SECRET = rawSecret;

export function isCapEnabled(): boolean {
  return capEnabled && !dummyMode;
}

export function getCapSecret(): string {
  return rawSecret;
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

// capjs-core issues `${id}:${verToken}` to the user and stores
// `${id}:${sha256(verToken)}` server-side. Recompute it from the submitted
// token, then look it up + consume from our store.
function tokenKeyFromSubmitted(token: string): string | null {
  const sep = token.indexOf(':');
  if (sep <= 0 || sep === token.length - 1) return null;
  const id = token.slice(0, sep);
  const verToken = token.slice(sep + 1);
  return `${id}:${sha256Hex(verToken)}`;
}

export async function verifyCapToken(
  token: string,
  requestId?: string,
): Promise<boolean> {
  const log = withRequestId(requestId ?? 'no-request-id');

  if (!capEnabled) {
    log.debug('cap disabled — skipping verification');
    return true;
  }

  if (dummyMode) {
    log.debug('cap dummy mode — skipping verification');
    return true;
  }

  if (!token) {
    log.warn('cap token missing');
    return false;
  }

  const tokenKey = tokenKeyFromSubmitted(token);
  if (!tokenKey) {
    log.warn('cap token malformed');
    return false;
  }

  const ok = consumeToken(tokenKey);
  if (!ok) {
    log.warn('cap token unknown or already consumed');
  }
  return ok;
}
