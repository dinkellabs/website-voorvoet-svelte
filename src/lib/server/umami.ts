import { env } from '$env/dynamic/private';
import { isbot } from 'isbot';

export type UmamiEvent = {
  name: string;
  url: string;
  hostname: string;
  language: 'nl' | 'de' | 'en';
  referrer?: string;
  userAgent: string;
  ip?: string;
  data?: Record<string, string | number | boolean>;
};

/**
 * Sends an event to the Umami analytics API.
 *
 * Silent no-op when UMAMI_API_URL is unset.
 * Bot user agents are filtered; never throws to caller.
 *
 * @param event - The analytics event to track
 */
export async function trackEvent(event: UmamiEvent): Promise<void> {
  const apiUrl = env.UMAMI_API_URL;
  if (!apiUrl) return;

  if (isbot(event.userAgent)) return;

  const timeoutMs = parseInt(env.UMAMI_TIMEOUT_MS ?? '1500', 10);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const payload: Record<string, unknown> = {
    type: 'event',
    payload: {
      website: env.UMAMI_WEBSITE_ID ?? '',
      name: event.name,
      url: event.url,
      hostname: event.hostname,
      language: event.language,
      referrer: event.referrer ?? '',
      ...(event.data ? { data: event.data } : {}),
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': event.userAgent,
  };

  if (event.ip) {
    headers['X-Forwarded-For'] = event.ip;
  }

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    // Fire-and-forget: swallow all errors (timeouts, network failures, etc.)
  } finally {
    clearTimeout(timer);
  }
}
