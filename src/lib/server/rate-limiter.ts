import { RateLimiter, type Rate } from 'sveltekit-rate-limiter/server';

// Per-form limits use separate limiter instances so abuse on one form doesn't
// starve the other; the buckets are intentionally not shared. The tuple is
// extracted to keep limits in sync — a future tightening on contact must apply
// to orders too unless we explicitly diverge.
const FORM_LIMIT_PER_IP: Rate = [5, '10m'];

export const contactLimiter = new RateLimiter({ IP: FORM_LIMIT_PER_IP });
export const orderLimiter = new RateLimiter({ IP: FORM_LIMIT_PER_IP });
