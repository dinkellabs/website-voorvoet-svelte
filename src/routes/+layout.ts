import { setLocale, assertIsLocale } from '$lib/paraglide/runtime.js';
import type { LayoutLoad } from './$types.js';

export const load: LayoutLoad = ({ data }) => {
  setLocale(assertIsLocale(data.lang), { reload: false });
  return data;
};
