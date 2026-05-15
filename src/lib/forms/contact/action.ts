import { fail, error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import type { Action } from '@sveltejs/kit';
import { contactSchema } from '$lib/forms/contact-schema.js';
import { verifyCapToken } from '$lib/server/cap.js';
import { sendContactEmail } from '$lib/server/email.js';
import { trackEvent } from '$lib/server/umami.js';
import { contactLimiter } from '$lib/server/rate-limiter.js';
import { withRequestId } from '$lib/server/logger.js';
import { langFromParams } from '$lib/i18n/route-map.js';
import { assertLangForSlug } from '$lib/forms/assert-lang.js';
import type { FormFailureCode } from '$lib/forms/action-results.js';

export const contactAction: Action = async (event) => {
  const requestId = event.locals.requestId;
  const log = withRequestId(requestId);

  // Defence-in-depth: assertLangForSlug runs on `load`; replicate on POST so a
  // crafted submission to /de/contact (which doesn't exist as a GET) can't
  // sneak through and arrive in analytics under the wrong language.
  const slug = event.url.pathname.split('/').pop() ?? '';
  assertLangForSlug(event.params.lang ?? '', 'contact', slug);
  const lang = langFromParams(event.params);

  if (await contactLimiter.isLimited(event)) {
    log.warn({ path: event.url.pathname }, 'contact form rate limited');
    error(429, 'Too many requests — please wait before submitting again.');
  }

  const form = await superValidate(event.request, zod(contactSchema));
  if (!form.valid) {
    log.info({ path: event.url.pathname }, 'contact form validation failed');
    return fail(400, { form });
  }

  const capOk = await verifyCapToken(form.data.capToken, requestId);
  if (!capOk) {
    log.warn({ path: event.url.pathname }, 'contact form cap failed');
    return fail(400, { form, code: 'cap_failed' satisfies FormFailureCode });
  }

  try {
    await sendContactEmail(form.data, requestId);
  } catch (err) {
    log.error({ err, path: event.url.pathname }, 'contact email send failed');
    return fail(400, { form, code: 'submission_failed' satisfies FormFailureCode });
  }

  log.info({ path: event.url.pathname }, 'contact form submitted successfully');

  void trackEvent({
    name: 'contact_form_submitted',
    url: event.url.pathname,
    hostname: event.url.hostname,
    language: lang,
    userAgent: event.request.headers.get('user-agent') ?? '',
    ip: event.getClientAddress(),
  }).catch(() => {});

  return { form, success: true };
};
