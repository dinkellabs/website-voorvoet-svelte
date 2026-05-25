<script lang="ts">
  import type { Lang, PageKey } from '$lib/i18n/route-map.js';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  interface NavItem {
    key: PageKey;
    label: string;
    href: string;
  }

  interface Props {
    lang: Lang;
    currentPageKey: PageKey | null;
    navItems: NavItem[];
  }

  let { lang, currentPageKey, navItems }: Props = $props();

  let open = $state(false);

  function close() {
    open = false;
  }
</script>

<div class="mobile-nav">
  <button
    type="button"
    class="mobile-nav__toggle"
    onclick={() => (open = !open)}
    aria-expanded={open}
    aria-label={open ? 'Menu sluiten' : 'Menu openen'}
    aria-controls="mobile-menu"
  >
    {#if open}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path
          d="M6 6l16 16M22 6L6 22"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    {:else}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path
          d="M4 8h20M4 14h20M4 20h20"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    {/if}
  </button>

  {#if open}
    <div class="mobile-nav__backdrop" onclick={close} aria-hidden="true" role="presentation"></div>

    <nav id="mobile-menu" class="mobile-nav__menu" aria-label="Mobiel menu">
      {#each navItems as item (item.key)}
        <a href={item.href} class="mobile-nav__link" onclick={close}>
          {item.label}
        </a>
      {/each}

      <div class="mobile-nav__lang">
        <LanguageSwitcher {currentPageKey} currentLang={lang} />
      </div>
    </nav>
  {/if}
</div>

<style>
  .mobile-nav {
    display: inline-flex;
    position: relative;
  }

  .mobile-nav__toggle {
    display: inline-flex;
    padding: 8px;
    border: none;
    background: transparent;
    color: var(--color-primary-700);
    cursor: pointer;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .mobile-nav__toggle:hover {
    color: var(--color-primary-300);
  }

  @media (min-width: 768px) {
    .mobile-nav {
      display: none;
    }
  }

  .mobile-nav__backdrop {
    position: fixed;
    inset: 0;
    z-index: 39;
  }

  .mobile-nav__menu {
    position: fixed;
    top: 68px;
    right: 16px;
    margin-top: 8px;
    border: 1px solid var(--color-primary-50);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 8px;
    min-width: 200px;
    max-width: 90%;
    z-index: 40;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: saturate(180%) blur(10px);
    -webkit-backdrop-filter: saturate(180%) blur(10px);
    display: flex;
    flex-direction: column;
  }

  .mobile-nav__link {
    display: block;
    padding: 10px 16px;
    color: var(--color-primary-700);
    font-size: var(--font-size-nav);
    font-weight: 600;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.15s;
  }

  .mobile-nav__link:hover {
    color: var(--color-primary-300);
    text-decoration: underline;
  }

  .mobile-nav__lang {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--color-border-light);
    margin-top: 4px;
    padding-top: 8px;
  }
</style>
