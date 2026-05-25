import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { isbot } from 'isbot';
import logger from '$lib/server/logger.js';

export type UmamiEvent = {
  // Omit for pageviews — Umami v2 routes events without `name` to the
  // pageview table (event_type=1, counted in Visitors/Visits/Views).
  // Set a string for custom events (event_type=2, Events panel only).
  name?: string;
  url: string;
  hostname: string;
  language: 'nl' | 'de' | 'en';
  referrer?: string;
  userAgent: string;
  ip?: string;
  data?: Record<string, string | number | boolean>;
};

const debugEnabled = (env.UMAMI_DEBUG ?? '').toLowerCase() === 'true';

if (!building) {
  if (env.UMAMI_API_URL) {
    if (!env.UMAMI_WEBSITE_ID) {
      logger.warn(
        'UMAMI_API_URL is set but UMAMI_WEBSITE_ID is empty — events will be rejected by Umami.',
      );
    } else {
      logger.info(
        { url: env.UMAMI_API_URL, debug: debugEnabled },
        'umami tracking enabled (server-side)',
      );
    }
  } else {
    logger.info('umami tracking disabled (UMAMI_API_URL not set)');
  }
}

/**
 * Sends an event to the Umami analytics API.
 *
 * Silent no-op when UMAMI_API_URL is unset.
 * Bot user agents are filtered; never throws to caller.
 * Set UMAMI_DEBUG=true to log every POST response status.
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
      ...(event.name ? { name: event.name } : {}),
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
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (debugEnabled) {
      logger.info(
        {
          name: event.name,
          url: event.url,
          status: response.status,
          ok: response.ok,
        },
        'umami event posted',
      );
    }
  } catch (err) {
    if (debugEnabled) {
      logger.info({ name: event.name, url: event.url, err }, 'umami event post failed');
    }
  } finally {
    clearTimeout(timer);
  }
}
