<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import { routeFor } from '$lib/i18n/route-map.js';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    lang: Lang;
  }

  let { lang }: Props = $props();

  // Route external portal traffic through /go/plan so the server can record
  // a `plan_portal_click` Umami event before redirecting to LINK_PLAN_PORTAL.
  const href = $derived(
    page.data.planPortalUrl ? `/go/plan?lang=${lang}` : routeFor('contact', lang),
  );
  const isExternal = $derived(!!page.data.planPortalUrl);
</script>

<a
  {href}
  class="starter-cta"
  target={isExternal ? '_blank' : undefined}
  rel={isExternal ? 'noopener noreferrer' : undefined}
>
  {m.cta_book_appointment()}
</a>

<style>
  .starter-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-btn-primary);
    color: var(--color-text-white);
    font-size: var(--font-size-button);
    font-weight: 600;
    padding: 0.1em 0.8em;
    border-radius: 3px;
    text-decoration: none;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(5, 168, 162, 0.3);
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }

  .starter-cta:hover {
    background-color: var(--color-btn-primary-hover);
    box-shadow: 0 6px 16px rgba(5, 168, 162, 0.4);
    text-decoration: none;
  }

  .starter-cta:active {
    background-color: var(--color-btn-primary-hover);
  }
</style>
