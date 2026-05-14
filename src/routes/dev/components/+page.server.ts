import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

// 404 the route at the server level in production so the component-showcase
// bundle never ships to clients and the SSR response is a true 404 (not a
// hydrated client-side 404 from inside the page).
export const load: PageServerLoad = () => {
  if (!dev) error(404, 'Not found');
  return {};
};
