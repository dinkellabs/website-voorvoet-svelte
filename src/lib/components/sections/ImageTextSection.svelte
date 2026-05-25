<script lang="ts">
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';

  interface Props {
    srcFallback: string;
    srcAvif?: string;
    srcWebp?: string;
    imgAlt: string;
    width?: number;
    height?: number;
    title: string;
    paragraphs: string[];
    imagePosition?: 'left' | 'right';
    /** Override the max-width of the image column (default: 333px = Layout.image_max_width). */
    imgMaxWidth?: string;
    extra?: import('svelte').Snippet;
  }

  let {
    srcFallback,
    srcAvif,
    srcWebp,
    imgAlt,
    width,
    height,
    title,
    paragraphs,
    imagePosition = 'left',
    imgMaxWidth = '333px',
    extra,
  }: Props = $props();

  const reverseClass = $derived(imagePosition === 'right' ? 'image-text--reverse' : '');
</script>

<div class="image-text {reverseClass}">
  <div class="image-text__img" style="max-width: {imgMaxWidth}">
    <ResponsiveImage
      {srcFallback}
      {srcAvif}
      {srcWebp}
      alt={imgAlt}
      {width}
      {height}
      class="image-text__pic"
    />
  </div>
  <div class="image-text__body">
    <h2 class="image-text__title">{title}</h2>
    {#each paragraphs as para (para)}
      <p class="image-text__para">{para}</p>
    {/each}
    {#if extra}
      {@render extra()}
    {/if}
  </div>
</div>

<style>
  .image-text {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  @media (min-width: 768px) {
    .image-text {
      flex-direction: row;
    }

    .image-text--reverse {
      flex-direction: row-reverse;
    }
  }

  .image-text__img {
    flex: 0 0 auto;
    width: 100%;
    margin-inline: auto;
  }

  @media (min-width: 768px) {
    .image-text__img {
      width: 35%;
      max-width: var(--image-max-width);
      margin-inline: 0;
    }
  }

  .image-text__img :global(.image-text__pic) {
    width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: block;
  }

  .image-text__body {
    flex: 1;
  }

  .image-text__title {
    font-size: var(--font-size-section-title);
    font-weight: 600;
    color: var(--color-text-heading);
    margin-bottom: 1rem;
  }

  .image-text__para {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 1rem;
  }

  .image-text__para:last-child {
    margin-bottom: 0;
  }
</style>
