<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Title from '$lib/components/Title.svelte';
  import Button from '$lib/components/Button.svelte';
  import { getPackages, getImageCredits } from '$lib/data/credits.js';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    data: { lang: Lang };
  }

  let { data }: Props = $props();
  const lang = $derived(data.lang);

  const packages = getPackages();
  const images = getImageCredits();
</script>

<HeroBanner
  srcFallback="/images/page_credits/credits_hero_banner.jpg"
  srcAvif="/images/page_credits/credits_hero_banner.avif"
  srcWebp="/images/page_credits/credits_hero_banner.webp"
  imgAlt={m.credits_hero_img_alt()}
  isShown={false}
  minHeight="400px"
  clipBottom="gentle_2"
/>

<Section>
  <Container>
    <Title level={1} class="credits-page-title">{m.credits_page_title()}</Title>
    <p class="credits-page-intro">{m.credits_page_intro()}</p>

    <div class="developer">
      <img
        src="/images/page_credits/dennis_bakhuis_data_scientist_voorvoet_website_developer.jpg"
        alt={m.credits_developer_name()}
        class="developer__img"
        width="533"
        height="732"
        loading="lazy"
        decoding="async"
      />
      <div class="developer__body">
        <Title level={2} class="credits-section-title">{m.credits_developer_title()}</Title>
        <p class="developer__desc">{m.credits_developer_desc()}</p>
        <p class="developer__connect">
          <Button variant="link" href="https://linkedin.com/in/dennisbakhuis" target="_blank">
            LinkedIn
          </Button>
        </p>
      </div>
    </div>
  </Container>
</Section>

<Section clipTop="gentle_1">
  <Container>
    <Title level={2} class="credits-section-title">{m.credits_packages_title()}</Title>
    <div class="packages-list">
      {#each packages as pkg (pkg.name)}
        <div class="pkg-row">
          <Button variant="link" href={pkg.url} target="_blank" class="pkg-name">
            {pkg.name}
          </Button>
          <span class="pkg-desc">{pkg.desc[lang] ?? pkg.desc.nl}</span>
        </div>
      {/each}
    </div>
  </Container>
</Section>

<Section clipTop="gentle_1">
  <Container>
    <Title level={2} class="credits-section-title">{m.credits_images_title()}</Title>
    <div class="images-table-wrap">
      <table class="images-table">
        <thead>
          <tr>
            <th>{m.credits_col_afbeelding()}</th>
            <th>{m.credits_col_desc()}</th>
            <th>{m.credits_col_auteur()}</th>
            <th>{m.credits_col_bron()}</th>
          </tr>
        </thead>
        <tbody>
          {#each images as img (img.imagePath)}
            <tr>
              <td>
                <img
                  src={img.imagePath}
                  alt={img.desc[lang] ?? img.desc.nl}
                  class="credits-img-thumb"
                  width="80"
                  height="60"
                  loading="lazy"
                  decoding="async"
                />
              </td>
              <td>{img.desc[lang] ?? img.desc.nl}</td>
              <td>
                {#if img.authorUrl}
                  <Button variant="link" href={img.authorUrl} target="_blank">
                    {img.author ?? '—'}
                  </Button>
                {:else}
                  {img.author ?? '—'}
                {/if}
              </td>
              <td>
                {#if img.sourceUrl}
                  <Button variant="link" href={img.sourceUrl} target="_blank">
                    {img.source}
                  </Button>
                {:else}
                  {img.source}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Container>
</Section>

<style>
  :global(.credits-page-title) {
    font-size: clamp(1.75rem, 2.5vw + 0.75rem, 2.5rem);
    margin-bottom: 0.75rem;
  }

  .credits-page-intro {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 2rem;
  }

  :global(.credits-section-title) {
    font-size: clamp(1.2rem, 1.5vw + 0.5rem, 1.5rem);
    margin-bottom: 1rem;
  }

  .developer {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }

  @media (min-width: 640px) {
    .developer {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  .developer__img {
    width: 180px;
    height: auto;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .developer__body {
    flex: 1;
  }

  .developer__desc {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 0.75rem;
  }

  .developer__connect {
    margin-top: 0.5rem;
  }

  .packages-list {
    display: flex;
    flex-direction: column;
  }

  .pkg-row {
    display: flex;
    gap: 1.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border-light);
    align-items: baseline;
  }

  :global(.pkg-name) {
    font-weight: 600;
    min-width: 160px;
    flex-shrink: 0;
  }

  .pkg-desc {
    color: var(--color-text-content);
    font-size: var(--font-size-regular);
  }

  .images-table-wrap {
    overflow-x: auto;
  }

  .images-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    background-color: var(--color-bg-white);
  }

  .images-table th {
    background-color: var(--color-primary-500);
    color: var(--color-text-white);
    padding: 0.5rem 0.75rem;
    text-align: left;
    font-weight: 600;
    white-space: nowrap;
  }

  .images-table td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border-light);
    color: var(--color-text-content);
    vertical-align: middle;
  }

  .images-table tr:nth-child(even) td {
    background-color: #f9fafb;
  }

  .credits-img-thumb {
    width: 64px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
    display: block;
  }
</style>
