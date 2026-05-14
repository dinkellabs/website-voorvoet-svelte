import type { RequestHandler } from './$types.js';
import { withRequestId } from '$lib/server/logger.js';

export const POST: RequestHandler = async (event) => {
  const log = withRequestId(event.locals.requestId ?? 'no-request-id');

  let body: unknown;
  try {
    body = await event.request.json();
  } catch {
    body = null;
  }

  log.info({ report: body, ua: event.request.headers.get('user-agent') }, 'csp violation');

  // 204 No Content: WHATWG forbids a body on this status, so we cannot use
  // SvelteKit's `json()` helper (which always attaches one and would throw at
  // runtime). Browsers send CSP reports fire-and-forget; an empty 204 is the
  // standard response for the `report-uri` endpoint.
  return new Response(null, { status: 204 });
};
