<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import { routeFor } from '$lib/i18n/route-map.js';
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import CheckSquareO from '$lib/components/icons/CheckSquareO.svelte';

  interface Props {
    lang: Lang;
    title: string;
    items: string[];
  }

  let { lang, title, items }: Props = $props();

  // Route external portal traffic through /go/plan so the server can record
  // a `plan_portal_click` Umami event before redirecting to LINK_PLAN_PORTAL.
  const href = $derived(page.data.planPortalUrl ? `/go/plan?lang=${lang}` : routeFor('contact', lang));
  const isExternal = $derived(!!page.data.planPortalUrl);
</script>

<div
  class="hero-cta"
  style="backdrop-filter: saturate(1.05) blur(1px); -webkit-backdrop-filter: saturate(1.05) blur(1px);"
>
  <h2 class="hero-cta__title">{title}</h2>
  <div class="hero-cta__list-wrap">
    <ul class="hero-cta__list">
      {#each items as item (item)}
        <li class="hero-cta__item">
          <span class="hero-cta__check" aria-hidden="true">
            <CheckSquareO size={20} />
          </span>
          <span class="hero-cta__item-text">{item}</span>
        </li>
      {/each}
    </ul>
  </div>
  <div class="hero-cta__btn-wrap">
    <a
      {href}
      class="hero-cta__btn"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >{m.cta_book_appointment()}</a>
  </div>
</div>

<style>
  /* Container — matches OLD hero_cta_box: green-light bg, 0.75rem radius,
     responsive padding token, responsive width/max-width tokens, soft shadow,
     backdrop-filter applied inline (the unprefixed property gets stripped by
     the CSS minifier; keep both prefixed/unprefixed via the style attribute). */
  .hero-cta {
    background-color: var(--color-bg-green-light);
    border-radius: 0.75rem;
    padding: var(--spacing-hero-cta-padding);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    width: var(--hero-cta-width);
    max-width: var(--hero-cta-max-width);
  }

  .hero-cta__title {
    font-size: var(--font-size-hero-cta-title);
    font-weight: 700;
    color: var(--color-text-heading);
    text-align: center;
    line-height: 1.15;
    /* OLD: rx.heading default margin-bottom 1rem + outer vstack(spacing="4")
       gap 1rem stack (flex gap doesn't collapse with margin). Total = 2rem
       between the title baseline and the start of the list block. */
    margin: 0 0 2rem;
  }

  /* OLD wraps the inner vstack of items in `display: flex; justify-content:
     center; width: 100%;` so the list is centered as a group within the box
     (while each row is still left-aligned around its own icon). */
  .hero-cta__list-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    /* OLD vstack(spacing="4") gap = 1rem between list block and button block. */
    margin-bottom: 1rem;
  }

  /* OLD vstack(spacing="3") between list items = 12px = 0.75rem */
  .hero-cta__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* OLD icon_list_item: hstack(spacing="3", align="center") with 12px gap */
  .hero-cta__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-text-content);
    /* FontSizes.regular */
    font-size: var(--font-size-regular);
    line-height: 1.6;
  }

  /* OLD fa_icon size="1.25rem", color text content. The lucide icon ships as
     an inline SVG sized via the size prop, so this just colors and aligns it. */
  .hero-cta__check {
    display: inline-flex;
    align-items: center;
    color: var(--color-text-content);
    flex-shrink: 0;
    /* OLD applies position:relative; top:1px to nudge the icon onto the
       text baseline. */
    position: relative;
    top: 1px;
  }

  .hero-cta__item-text {
    flex: 1;
  }

  .hero-cta__btn-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /* OLD button(): primary bg, white text, font-size button (1.5rem),
     padding 0.1em 0.8em, radius 3px, soft teal shadow. */
  .hero-cta__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-btn-primary);
    color: var(--color-text-white);
    font-size: var(--font-size-button);
    font-weight: 700;
    padding: 0.1em 0.8em;
    border-radius: 3px;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(5, 168, 162, 0.3);
    white-space: nowrap;
    transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .hero-cta__btn:hover {
    background-color: var(--color-btn-primary-hover);
    box-shadow: 0 6px 16px rgba(5, 168, 162, 0.4);
  }
</style>
