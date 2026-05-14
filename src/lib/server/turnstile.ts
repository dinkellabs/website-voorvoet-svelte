import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';
import { building, dev } from '$app/environment';
import { withRequestId } from '$lib/server/logger.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT_MS = 5000;

const DUMMY_ALWAYS_PASS_SITE_KEY = '1x00000000000000000000AA';

// `building` is true during `vite build`'s analyse pass; env vars aren't
// loaded then. Skip the production guard so the build doesn't trip.
const isProduction = !dev && !building;
const turnstileEnabled = (env.TURNSTILE_ENABLED ?? 'false').toLowerCase() === 'true';
const usingDummySiteKey = pubEnv.PUBLIC_TURNSTILE_SITE_KEY === DUMMY_ALWAYS_PASS_SITE_KEY;

if (isProduction) {
  if (!turnstileEnabled) {
    throw new Error(
      'TURNSTILE_ENABLED must be exactly "true" in production. Refusing to start with bot protection disabled.',
    );
  }
  if (usingDummySiteKey) {
    throw new Error(
      'PUBLIC_TURNSTILE_SITE_KEY is the Cloudflare always-pass dummy key. Refusing to start in production.',
    );
  }
  if (!env.TURNSTILE_SECRET_KEY) {
    throw new Error('TURNSTILE_SECRET_KEY must be set in production.');
  }
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp: string,
  requestId?: string,
): Promise<boolean> {
  const log = withRequestId(requestId ?? 'no-request-id');

  if (!turnstileEnabled) {
    log.debug('turnstile disabled — skipping verification');
    return true;
  }

  if (usingDummySiteKey) {
    log.debug('dummy site key detected — skipping verification');
    return true;
  }

  if (!token) {
    log.warn('turnstile token missing');
    return false;
  }

  const secretKey = env.TURNSTILE_SECRET_KEY ?? '';
  if (!secretKey) {
    log.error('TURNSTILE_SECRET_KEY not configured');
    return false;
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
    remoteip: remoteIp,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    log.warn({ err: aborted ? 'timeout' : err }, 'turnstile verify network error');
    return false;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    log.warn({ status: response.status }, 'turnstile verify HTTP error');
    return false;
  }

  const result = (await response.json()) as {
    success: boolean;
    'error-codes'?: string[];
  };
  if (!result.success) {
    log.warn({ errorCodes: result['error-codes'] ?? [] }, 'turnstile verification failed');
  }
  return result.success === true;
}
