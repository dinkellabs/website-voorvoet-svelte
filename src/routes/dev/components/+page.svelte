<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import Section from '$lib/components/Section.svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import StarterCTA from '$lib/components/StarterCTA.svelte';
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import MobileNav from '$lib/components/MobileNav.svelte';
  import { toast } from '$lib/stores/toast.svelte.js';
  import type { Lang, PageKey } from '$lib/i18n/route-map.js';

  const lang: Lang = 'nl';
  const currentPageKey: PageKey = 'home';
</script>

<svelte:head>
  <title>Component Showcase (DEV)</title>
</svelte:head>

<div class="showcase">
  <h1 class="showcase-title">Component Showcase</h1>

  <section class="demo-section">
    <h2>HeroBanner</h2>
    <HeroBanner
      title="Welkom bij VoorVoet"
      subtitle="Praktijk voor podotherapie in Enschede"
      srcFallback="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.jpg"
      srcAvif="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.avif"
      srcWebp="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.webp"
      imgAlt="Voeten in bed"
    >
      {#snippet cta()}
        <StarterCTA {lang} />
      {/snippet}
    </HeroBanner>
  </section>

  <section class="demo-section">
    <h2>Section + Container</h2>
    <Section bg="white">
      <Container>
        <p>White section with container.</p>
      </Container>
    </Section>
    <Section bg="green">
      <Container>
        <p>Green section with container.</p>
      </Container>
    </Section>
  </section>

  <section class="demo-section">
    <h2>StarterCTA</h2>
    <StarterCTA {lang} />
  </section>

  <section class="demo-section">
    <h2>ResponsiveImage</h2>
    <ResponsiveImage
      srcFallback="/images/shared/podotherapeut_enschede_voorvoet_praktijk_voor_podotherapie_logo.svg"
      alt="VoorVoet logo"
      width={300}
      height={60}
    />
  </section>

  <section class="demo-section">
    <h2>LanguageSwitcher</h2>
    <LanguageSwitcher {currentPageKey} currentLang={lang} />
  </section>

  <section class="demo-section">
    <h2>MobileNav (always visible here)</h2>
    <div style="display: flex; gap: 1rem;">
      <MobileNav
        {lang}
        {currentPageKey}
        navItems={[
          { key: 'blog', label: 'Blog', href: '/nl/blog' },
          { key: 'information', label: 'Informatie', href: '/nl/informatie' },
          { key: 'contact', label: 'Contact', href: '/nl/contact' },
        ]}
      />
    </div>
  </section>

  <section class="demo-section">
    <h2>Toast</h2>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <button onclick={() => toast.show({ kind: 'success', message: 'Formulier verzonden!' })}>
        Toon success toast
      </button>
      <button onclick={() => toast.show({ kind: 'error', message: 'Er is iets misgegaan.' })}>
        Toon error toast
      </button>
    </div>
    <Toast />
  </section>

  <section class="demo-section">
    <h2>Header</h2>
    <div style="position: relative; height: 80px; border: 1px dashed #ccc;">
      <Header {lang} {currentPageKey} />
    </div>
  </section>

  <section class="demo-section">
    <h2>Footer</h2>
    <Footer {lang} />
  </section>
</div>

<style>
  .showcase {
    max-width: 1200px;
    margin: 6rem auto 2rem;
    padding-inline: 1rem;
  }

  .showcase-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--color-text-heading);
  }

  .demo-section {
    margin-bottom: 3rem;
    padding: 1.5rem;
    border: 2px dashed var(--color-border-light);
    border-radius: 8px;
  }

  .demo-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--color-primary-700);
  }

  button {
    padding: 0.5rem 1rem;
    background: var(--color-primary-500);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background: var(--color-primary-700);
  }
</style>
