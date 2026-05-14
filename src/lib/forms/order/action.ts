import { fail, error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import type { Action } from '@sveltejs/kit';
import { orderSchema } from '$lib/forms/order-schema.js';
import { verifyTurnstileToken } from '$lib/server/turnstile.js';
import { sendOrderEmail } from '$lib/server/email.js';
import { trackEvent } from '$lib/server/umami.js';
import { orderLimiter } from '$lib/server/rate-limiter.js';
import { withRequestId } from '$lib/server/logger.js';
import { langFromParams } from '$lib/i18n/route-map.js';
import { assertLangForSlug } from '$lib/forms/assert-lang.js';
import type { FormFailureCode } from '$lib/forms/action-results.js';

export const orderAction: Action = async (event) => {
  const requestId = event.locals.requestId;
  const log = withRequestId(requestId);

  // Defence-in-depth: assertLangForSlug runs on `load`; replicate on POST so a
  // crafted submission to the wrong-language slug can't sneak through.
  const slug = event.url.pathname.split('/').pop() ?? '';
  assertLangForSlug(event.params.lang ?? '', 'order_insoles', slug);
  const lang = langFromParams(event.params);

  if (await orderLimiter.isLimited(event)) {
    log.warn({ path: event.url.pathname }, 'order form rate limited');
    error(429, 'Too many requests — please wait before submitting again.');
  }

  const form = await superValidate(event.request, zod(orderSchema));
  if (!form.valid) {
    log.info({ path: event.url.pathname }, 'order form validation failed');
    return fail(400, { form });
  }

  const turnstileOk = await verifyTurnstileToken(
    form.data.turnstileToken,
    event.getClientAddress(),
    requestId,
  );
  if (!turnstileOk) {
    log.warn({ path: event.url.pathname }, 'order form turnstile failed');
    return fail(400, { form, code: 'turnstile_failed' satisfies FormFailureCode });
  }

  try {
    await sendOrderEmail(form.data, requestId);
  } catch (err) {
    log.error({ err, path: event.url.pathname }, 'order email send failed');
    return fail(400, { form, code: 'submission_failed' satisfies FormFailureCode });
  }

  log.info({ path: event.url.pathname }, 'order form submitted successfully');

  void trackEvent({
    name: 'order_insoles_submitted',
    url: event.url.pathname,
    hostname: event.url.hostname,
    language: lang,
    userAgent: event.request.headers.get('user-agent') ?? '',
    ip: event.getClientAddress(),
  }).catch(() => {});

  return { form, success: true };
};
