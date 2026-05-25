<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import type { LayoutData } from './$types.js';

  type Props = {
    data: LayoutData;
    children: import('svelte').Snippet;
  };

  let { data, children }: Props = $props();

  const siteUrl = 'https://voorvoet.nl';
  const defaultOgImage = `${siteUrl}/images/page_home/page-preview-podotherapie-enschede-16x9.jpg`;

  // Page-level meta is in $page.data (from +page.server.ts loads).
  // Layout data only contains layout-level fields; read per-page SEO data
  // from the page store via App.PageData (declared in src/app.d.ts).
  const pageMeta = $derived(page.data.meta);
  const pageAlternates = $derived(page.data.alternates);
  const pageStructuredData = $derived(page.data.structuredData);
  const siteStructuredData = $derived(page.data.siteStructuredData);

  const ogImage = $derived(pageMeta?.og?.image ?? defaultOgImage);
  const ogImageFull = $derived(ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`);

  // Merge site-wide (Organization, …) and per-page (Podiatrist,
  // BlogPosting, …) structured data, then emit one <script> per entry so
  // each is a distinct item to parsers/validators (matches OLD pattern).
  const allStructuredData = $derived([
    ...(siteStructuredData ?? []),
    ...(Array.isArray(pageStructuredData)
      ? pageStructuredData
      : pageStructuredData
        ? [pageStructuredData]
        : []),
  ] as Array<unknown>);

  const structuredDataScripts = $derived(
    allStructuredData
      .map(
        (item) =>
          `<${'script'} type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</${'script'}>`,
      )
      .join(''),
  );
</script>

<svelte:head>
  {#if pageMeta?.title}
    <title>{pageMeta.title}</title>
    <meta property="og:title" content={pageMeta.title} />
    <meta name="twitter:title" content={pageMeta.title} />
  {/if}

  {#if pageMeta?.description}
    <meta name="description" content={pageMeta.description} />
    <meta property="og:description" content={pageMeta.description} />
    <meta name="twitter:description" content={pageMeta.description} />
  {/if}

  <meta property="og:type" content={pageMeta?.og?.type ?? 'website'} />
  <meta property="og:site_name" content="VoorVoet" />

  {#if pageMeta?.og?.locale}
    <meta property="og:locale" content={pageMeta.og.locale} />
  {/if}

  <meta property="og:image" content={ogImageFull} />
  <meta name="twitter:image" content={ogImageFull} />

  {#if pageMeta?.canonical}
    <link rel="canonical" href={pageMeta.canonical} />
    <meta property="og:url" content={pageMeta.canonical} />
  {/if}

  <meta name="twitter:card" content="summary_large_image" />

  {#if pageAlternates}
    {#each pageAlternates as alt (alt.lang)}
      <link rel="alternate" hreflang={alt.lang} href={alt.href} />
    {/each}
  {/if}

  {#if structuredDataScripts}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html structuredDataScripts}
  {/if}

  <link rel="icon" href="/favicon.ico" sizes="32x32" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />

  {#if data.umamiScriptUrl}
    <script defer src={data.umamiScriptUrl} data-website-id={data.umamiWebsiteId}></script>
  {/if}
</svelte:head>

<Header lang={data.lang} currentPageKey={data.pageKey} />

<main id="main-content" class="main-content">
  {@render children()}
</main>

<Footer lang={data.lang} />

<Toast />

<style>
  .main-content {
    padding-top: var(--header-height, 68px);
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
</style>
