import type { PageServerLoad } from './$types.js';
import { makeFormLoad, makeFormActions } from '$lib/forms/page.server.js';
import { orderSchema } from '$lib/forms/order-schema.js';
import { orderAction } from '$lib/forms/order/action.js';

export const load: PageServerLoad = makeFormLoad({
  pageKey: 'order_insoles',
  slug: 'zolen-bestellen',
  schema: orderSchema,
});

export const actions = makeFormActions(orderAction);
