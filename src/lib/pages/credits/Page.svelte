<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Title from '$lib/components/Title.svelte';
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
        <p class="developer__desc">{m.credits_developer_para1()}</p>
        <p class="developer__desc">{m.credits_developer_para2()}</p>
      </div>
    </div>

    <p class="developer__desc developer__desc--full">
      {#each m
        .credits_developer_para3()
        .split(/(LinkedIn|GitHub)/) as part, i (i)}{#if part === 'LinkedIn'}<a
            href="https://linkedin.com/in/dennisbakhuis"
            target="_blank"
            rel="noopener noreferrer">LinkedIn</a
          >{:else if part === 'GitHub'}<a
            href="https://github.com/dennisbakhuis"
            target="_blank"
            rel="noopener noreferrer">GitHub</a
          >{:else}{part}{/if}{/each}
    </p>

    <Title level={2} class="credits-section-title credits-section-title--sub">
      {m.credits_packages_title()}
    </Title>
    <div class="packages-list">
      {#each packages as pkg (pkg.name)}
        <div class="pkg-row">
          <a href={pkg.url} target="_blank" rel="noopener noreferrer" class="pkg-name-link">
            {pkg.name}
          </a>
          <span class="pkg-desc">{pkg.desc[lang] ?? pkg.desc.nl}</span>
        </div>
      {/each}
    </div>

    <Title level={2} class="credits-section-title credits-section-title--sub">
      {m.credits_images_title()}
    </Title>
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
                  <a href={img.authorUrl} target="_blank" rel="noopener noreferrer">
                    {img.author ?? '—'}
                  </a>
                {:else}
                  {img.author ?? '—'}
                {/if}
              </td>
              <td>
                {#if img.sourceUrl}
                  <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {img.source}
                  </a>
                {:else}
                  {img.source}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="credits-version">{m.credits_version_label({ version: __APP_VERSION__ })}</p>
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

  /* h2s that introduce a new content block within the single Section get
     extra space above so they read as section breaks in the absence of
     visual dividers. */
  :global(.credits-section-title--sub) {
    margin-top: 2.5rem;
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
    width: 360px;
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

  /* Para3 sits outside the image+body row so it can span full width
     below the photo (matches the Reflex original layout). */
  .developer__desc--full {
    margin-top: 1.25rem;
  }

  /* Inline anchors inside developer__desc paragraphs should inherit the
     paragraph's body-text size — Button variant="link" was inheriting
     .btn's 1.5rem font-size, making LinkedIn / GitHub look oversized. */
  .developer__desc :global(a) {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .developer__desc :global(a:hover) {
    opacity: 0.85;
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

  .pkg-name-link {
    font-weight: 600;
    min-width: 160px;
    flex-shrink: 0;
    font-size: var(--font-size-regular);
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .pkg-name-link:hover {
    opacity: 0.85;
  }

  .pkg-desc {
    color: var(--color-text-content);
    font-size: var(--font-size-regular);
  }

  .images-table a {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .images-table a:hover {
    opacity: 0.85;
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

  .credits-version {
    margin-top: 2.5rem;
    font-size: 0.85rem;
    color: var(--color-text-content);
    opacity: 0.7;
    text-align: right;
  }
</style>
