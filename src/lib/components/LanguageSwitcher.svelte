<script lang="ts">
  import { page } from '$app/state';
  import { routeFor, type Lang, type PageKey } from '$lib/i18n/route-map.js';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    currentPageKey: PageKey | null;
    currentLang: Lang;
  }

  let { currentPageKey, currentLang }: Props = $props();

  const LANGUAGE_CODES: Lang[] = ['nl', 'de', 'en'];

  const LANGUAGE_META: Record<Lang, { flag: string; nameKey: () => string }> = {
    nl: { flag: '🇳🇱', nameKey: m.lang_nl },
    de: { flag: '🇩🇪', nameKey: m.lang_de },
    en: { flag: '🇬🇧', nameKey: m.lang_en },
  };

  let open = $state(false);

  function routeForLang(targetLang: Lang): string {
    if (currentPageKey) {
      return routeFor(currentPageKey, targetLang);
    }
    const currentPath = page.url.pathname;
    const segments = currentPath.split('/');
    segments[1] = targetLang;
    return segments.join('/');
  }

  function handleKeydown(event: globalThis.KeyboardEvent) {
    if (event.key === 'Escape') open = false;
  }

  function handleOutsideClick(event: globalThis.MouseEvent) {
    const target = event.target as globalThis.Element;
    if (!target.closest('.lang-switcher')) {
      open = false;
    }
  }

  $effect(() => {
    if (!open) return;
    // Defer attaching the listener so the same click that opened the menu
    // doesn't immediately bubble to document and close it. Svelte 5 flushes
    // $effect synchronously during the click, which would otherwise let the
    // outside-click handler fire on the very click that toggled `open`.
    const timer = globalThis.setTimeout(() => {
      globalThis.document.addEventListener('click', handleOutsideClick);
    }, 0);
    return () => {
      globalThis.clearTimeout(timer);
      globalThis.document.removeEventListener('click', handleOutsideClick);
    };
  });

  const currentMeta = $derived(LANGUAGE_META[currentLang] ?? LANGUAGE_META['nl']!);

  const languageRoutes = $derived(
    LANGUAGE_CODES.map((code) => ({
      code,
      flag: LANGUAGE_META[code]!.flag,
      name: LANGUAGE_META[code]!.nameKey(),
      href: routeForLang(code),
    })),
  );
</script>

<div class="lang-switcher">
  <button
    type="button"
    class="lang-switcher__trigger"
    onclick={() => (open = !open)}
    aria-expanded={open}
    aria-label={m.lang_switcher_label()}
    onkeydown={handleKeydown}
  >
    <span class="lang-switcher__flag-wrap" aria-hidden="true">
      <span class="lang-switcher__flag">{currentMeta.flag}</span>
      <svg
        class="lang-switcher__chevron"
        class:lang-switcher__chevron--open={open}
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 4l4 4 4-4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </button>

  {#if open}
    <div class="lang-switcher__menu" role="menu" aria-label={m.lang_switcher_label()}>
      {#each languageRoutes as lang (lang.code)}
        <!--
          data-sveltekit-reload forces a full document navigation rather
          than client-side routing, so the server-rendered <html lang>
          attribute (and any other lang-dependent SSR output) refreshes.
          Without it, swapping language client-side leaves html[lang]
          stale.
        -->
        <a
          href={lang.href}
          class="lang-switcher__option"
          class:lang-switcher__option--active={lang.code === currentLang}
          role="menuitem"
          data-sveltekit-reload
          onclick={() => (open = false)}
        >
          <span class="lang-switcher__option-flag" aria-hidden="true">{lang.flag}</span>
          <span class="lang-switcher__option-name">{lang.name}</span>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lang-switcher {
    position: relative;
  }

  .lang-switcher__trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s;
  }

  .lang-switcher__trigger:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* Wrapper positions flag + chevron stacked: flag on top, chevron below-center */
  .lang-switcher__flag-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .lang-switcher__flag {
    font-size: 1.5rem;
    line-height: 1;
    transition: transform 0.2s;
    display: block;
  }

  .lang-switcher__trigger:hover .lang-switcher__flag {
    transform: scale(1.1);
  }

  .lang-switcher__chevron {
    color: var(--color-text-heading);
    transition: transform 0.2s ease;
    position: absolute;
    bottom: -14px;
    left: 50%;
    transform: translateX(-50%);
  }

  .lang-switcher__chevron--open {
    transform: translateX(-50%) rotate(180deg);
  }

  .lang-switcher__menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    border: 1px solid var(--color-primary-50);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 8px;
    min-width: 180px;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: saturate(180%) blur(10px);
    -webkit-backdrop-filter: saturate(180%) blur(10px);
  }

  .lang-switcher__option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.15s;
    width: 100%;
  }

  .lang-switcher__option:hover {
    background-color: rgba(5, 132, 124, 0.08);
  }

  .lang-switcher__option--active {
    background-color: rgba(5, 132, 124, 0.12);
  }

  .lang-switcher__option-flag {
    font-size: 1.5rem;
    line-height: 1;
    transition: transform 0.2s;
  }

  .lang-switcher__option:hover .lang-switcher__option-flag {
    transform: scale(1.2);
  }

  .lang-switcher__option-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-primary-700);
  }

  .lang-switcher__option:hover .lang-switcher__option-name {
    color: var(--color-primary-300);
    text-decoration: underline;
  }
</style>
