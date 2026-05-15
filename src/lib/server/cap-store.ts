// In-memory replay-protection + redeem-token store for capjs-core.
//
// Two namespaces in one Map:
//   - nonce:<sigHex> → expiresAt   (challenge-replay protection during /redeem)
//   - token:<tokenKey> → expiresAt (redeem-token consumption at form submit)
//
// Single-process only. Horizontal scaling requires a shared store
// (Redis/Valkey) or switching to Cap Standalone.

const store = new Map<string, number>();

const NONCE_PREFIX = 'nonce:';
const TOKEN_PREFIX = 'token:';

const PRUNE_INTERVAL_MS = 60_000;

let pruneTimer: ReturnType<typeof setInterval> | null = null;

function startPruneTimer(): void {
  if (pruneTimer) return;
  pruneTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, expiresAt] of store) {
      if (expiresAt <= now) store.delete(key);
    }
  }, PRUNE_INTERVAL_MS);
  pruneTimer.unref?.();
}

export async function consumeNonce(sigHex: string, ttlMs: number): Promise<boolean> {
  startPruneTimer();
  const key = NONCE_PREFIX + sigHex;
  const now = Date.now();
  const existing = store.get(key);
  if (existing !== undefined && existing > now) return false;
  store.set(key, now + ttlMs);
  return true;
}

export function storeToken(tokenKey: string, expiresAt: number): void {
  startPruneTimer();
  if (expiresAt <= Date.now()) return;
  store.set(TOKEN_PREFIX + tokenKey, expiresAt);
}

export function consumeToken(tokenKey: string): boolean {
  const key = TOKEN_PREFIX + tokenKey;
  const expiresAt = store.get(key);
  if (expiresAt === undefined) return false;
  store.delete(key);
  return expiresAt > Date.now();
}

export function _resetForTests(): void {
  store.clear();
  if (pruneTimer) {
    clearInterval(pruneTimer);
    pruneTimer = null;
  }
}
