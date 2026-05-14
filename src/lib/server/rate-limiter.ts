import { RateLimiter, type Rate } from 'sveltekit-rate-limiter/server';
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Per-form limits use separate limiter instances so abuse on one form doesn't
// starve the other; the buckets are intentionally not shared. The tuple is
// extracted to keep limits in sync — a future tightening on contact must apply
// to orders too unless we explicitly diverge.
const FORM_LIMIT_PER_IP: Rate = [5, '10m'];

const rawContactLimiter = new RateLimiter({ IP: FORM_LIMIT_PER_IP });
const rawOrderLimiter = new RateLimiter({ IP: FORM_LIMIT_PER_IP });

// E2E escape valve. Playwright's order spec submits 7 successful forms in a
// row; the production 5-per-10-min cap would fail the suite even on a fresh
// process. NEVER set this in production.
const disabled = env.E2E_DISABLE_RATE_LIMITER === 'true';

type Limiter = { isLimited: (event: RequestEvent) => Promise<boolean> };

function wrap(limiter: RateLimiter): Limiter {
  return {
    isLimited: async (event) => (disabled ? false : limiter.isLimited(event)),
  };
}

export const contactLimiter: Limiter = wrap(rawContactLimiter);
export const orderLimiter: Limiter = wrap(rawOrderLimiter);
