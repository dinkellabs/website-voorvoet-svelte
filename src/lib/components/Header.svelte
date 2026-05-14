<script lang="ts">
  import type { Lang, PageKey } from '$lib/i18n/route-map.js';
  import { routeFor } from '$lib/i18n/route-map.js';
  import * as m from '$lib/paraglide/messages.js';
  import Container from './Container.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import MobileNav from './MobileNav.svelte';

  interface Props {
    lang: Lang;
    currentPageKey: PageKey | null;
  }

  let { lang, currentPageKey }: Props = $props();

  const ALL_NAV_KEYS: PageKey[] = ['home', 'blog', 'information', 'reimbursements', 'contact'];

  const navItems = $derived(
    ALL_NAV_KEYS.filter((key) => key !== currentPageKey).map((key) => ({
      key,
      label: {
        home: m.nav_home(),
        blog: m.nav_blog(),
        information: m.nav_information(),
        reimbursements: m.nav_reimbursements(),
        contact: m.nav_contact(),
        order_insoles: m.nav_order_insoles(),
        credits: '',
        privacy_policy: '',
        terms_conditions: '',
      }[key],
      href: routeFor(key, lang),
    })),
  );

  const homeHref = $derived(routeFor('home', lang));
</script>

<a class="skip-to-content" href="#main-content">{m.nav_skip_to_content()}</a>

<header
  class="site-header"
  style="backdrop-filter: saturate(180%) blur(6px); -webkit-backdrop-filter: saturate(180%) blur(6px);"
>
  <Container>
    <div class="header-inner">
      <a href={homeHref} class="logo-link">
        <img
          src="/images/shared/podotherapeut_enschede_voorvoet_praktijk_voor_podotherapie_logo.svg"
          alt={m.nav_logo_alt()}
          class="logo"
          width="300"
          height="60"
        />
      </a>

      <div class="header-right">
        <nav class="desktop-nav" aria-label="Hoofdnavigatie">
          {#each navItems as item (item.key)}
            <a href={item.href} class="nav-link">{item.label}</a>
          {/each}
        </nav>

        <div class="desktop-lang">
          <LanguageSwitcher {currentPageKey} currentLang={lang} />
        </div>

        <MobileNav {lang} {currentPageKey} {navItems} />
      </div>
    </div>
  </Container>
</header>

<style>
  .skip-to-content {
    position: absolute;
    left: -9999px;
    top: 1rem;
    background: var(--color-primary-700);
    color: var(--color-text-white);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 600;
    z-index: 9999;
    text-decoration: none;
    transition: left 0s;
  }

  .skip-to-content:focus {
    left: 1rem;
  }

  .site-header {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 20;
    width: 100%;
    background: transparent;
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: 0;
  }

  .logo-link {
    display: flex;
    flex-shrink: 0;
  }

  .logo {
    width: 66%;
    max-width: 300px;
    height: auto;
  }

  @media (min-width: 768px) {
    .logo {
      width: clamp(200px, calc(200px + (100vw - 768px) * 1.22), 300px);
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .desktop-nav {
    display: none;
    gap: 12px;
    align-items: center;
  }

  @media (min-width: 768px) {
    .desktop-nav {
      display: flex;
    }
  }

  .nav-link {
    font-size: var(--font-size-nav);
    font-weight: 600;
    color: var(--color-text-heading);
    text-decoration: none;
    transition: color 0.2s;
    white-space: nowrap;
  }

  .nav-link:hover {
    color: var(--color-primary-300);
  }

  .desktop-lang {
    display: none;
  }

  @media (min-width: 640px) {
    .desktop-lang {
      display: flex;
    }
  }
</style>
