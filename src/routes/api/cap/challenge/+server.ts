import { json, error } from '@sveltejs/kit';
import { generateChallenge } from 'capjs-core';
import type { RequestHandler } from './$types';
import { isCapEnabled, getCapSecret } from '$lib/server/cap.js';
import { withRequestId } from '$lib/server/logger.js';

export const POST: RequestHandler = async ({ locals }) => {
  if (!isCapEnabled()) {
    error(404, 'Cap is not enabled on this server');
  }

  const log = withRequestId(locals.requestId);

  try {
    const challenge = await generateChallenge(getCapSecret());
    return json(challenge);
  } catch (err) {
    log.error({ err }, 'cap challenge generation failed');
    error(500, 'failed to generate challenge');
  }
};
