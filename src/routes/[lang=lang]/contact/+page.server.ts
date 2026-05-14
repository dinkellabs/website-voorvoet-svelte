import type { PageServerLoad } from './$types.js';
import { makeFormLoad, makeFormActions } from '$lib/forms/page-server.js';
import { contactSchema } from '$lib/forms/contact-schema.js';
import { contactAction } from '$lib/forms/contact/action.js';

export const load: PageServerLoad = makeFormLoad({
  pageKey: 'contact',
  slug: 'contact',
  schema: contactSchema,
});

export const actions = makeFormActions(contactAction);
