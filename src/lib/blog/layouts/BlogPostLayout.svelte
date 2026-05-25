<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    title?: string;
    [key: string]: unknown;
  }

  let { children }: Props = $props();
</script>

<div class="blog-post-content">
  {@render children()}
</div>

<style>
  .blog-post-content :global(h1),
  .blog-post-content :global(h2),
  .blog-post-content :global(h3),
  .blog-post-content :global(h4),
  .blog-post-content :global(h5),
  .blog-post-content :global(h6) {
    color: var(--color-text-heading);
    font-family: var(--font-family);
    font-weight: 600;
    margin-top: var(--spacing-blog-heading-top);
    margin-bottom: var(--spacing-blog-heading-bottom);
    line-height: 1.3;
  }

  .blog-post-content :global(h1) {
    font-size: var(--font-size-h1);
  }

  .blog-post-content :global(h2) {
    font-size: var(--font-size-h2);
  }

  .blog-post-content :global(h3) {
    font-size: var(--font-size-h3);
  }

  .blog-post-content :global(h4),
  .blog-post-content :global(h5),
  .blog-post-content :global(h6) {
    font-size: var(--font-size-h4);
  }

  .blog-post-content :global(p) {
    color: var(--color-text-content);
    font-size: var(--font-size-regular);
    line-height: 1.7;
    margin-bottom: var(--spacing-blog-content-bottom);
  }

  .blog-post-content :global(a) {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .blog-post-content :global(a:hover) {
    color: var(--color-primary-500);
  }

  .blog-post-content :global(ul),
  .blog-post-content :global(ol) {
    padding-left: 1.5rem;
    margin-bottom: var(--spacing-blog-content-bottom);
    color: var(--color-text-content);
    font-size: var(--font-size-regular);
    line-height: 1.7;
  }

  .blog-post-content :global(li) {
    margin-bottom: 0.25rem;
  }

  .blog-post-content :global(img) {
    max-width: var(--blog-image-max-width);
    width: 100%;
    border-radius: var(--blog-image-border-radius);
    box-shadow: var(--image-box-shadow);
    display: block;
    margin: var(--spacing-blog-image);
  }

  .blog-post-content :global(figure) {
    margin: var(--spacing-blog-image);
    text-align: center;
  }

  .blog-post-content :global(figcaption) {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin-top: var(--spacing-blog-caption-top);
    font-style: italic;
  }
</style>
