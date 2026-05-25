<script lang="ts">
  import ResponsiveImage from '$lib/components/ResponsiveImage.svelte';
  import { blog_read_more, blog_published_on } from '$lib/paraglide/messages.js';
  import { env } from '$env/dynamic/public';
  import type { BlogPost } from '$lib/blog/types.js';

  interface Props {
    post: BlogPost;
    href: string;
    /** When true, render a horizontal card (image left, text right). */
    isHorizontal?: boolean;
    /** When true and horizontal, flip the image to the right side. */
    isFlipped?: boolean;
    class?: string;
  }

  let {
    post,
    href,
    isHorizontal = false,
    isFlipped = false,
    class: extraClass = '',
  }: Props = $props();

  const showDate = $derived(env.PUBLIC_BLOG_SHOW_PUBLICATION_DATE === 'true');

  function thumbnailPath(storyDir: string, filename: string): string {
    return `/images/page_blog/${storyDir}/${filename}`;
  }

  function storyDirFromPath(filePath: string): string {
    const parts = filePath.split('/');
    const filename = parts.at(-1) ?? '';
    return filename.replace(/\.md$/, '');
  }

  const storyDir = $derived(storyDirFromPath(post.filePath));
  const imgSrc = $derived(thumbnailPath(storyDir, post.thumbnail));
  const imgAvif = $derived(imgSrc.replace(/\.(jpg|jpeg)$/, '.avif'));
  const imgWebp = $derived(imgSrc.replace(/\.(jpg|jpeg)$/, '.webp'));

  function formatDate(dateStr: string): string {
    try {
      return new Intl.DateTimeFormat(post.lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }
</script>

{#if isHorizontal}
  <article class="blog-card-h {extraClass}" class:blog-card-h--flip={isFlipped}>
    <a {href} class="blog-card-h__link" aria-label={post.title}>
      <div class="blog-card-h__thumbnail">
        <ResponsiveImage
          srcFallback={imgSrc}
          srcAvif={imgAvif}
          srcWebp={imgWebp}
          alt={post.thumbnail_alt}
          loading="lazy"
          class="blog-card-h__img"
        />
      </div>
      <div class="blog-card-h__body">
        <h2 class="blog-card-h__title">{post.title}</h2>
        {#if showDate && post.date}
          <p class="blog-card-h__date">{blog_published_on({ date: formatDate(post.date) })}</p>
        {/if}
        <p class="blog-card-h__summary">{post.summary}</p>
        <span class="blog-card-h__cta">{blog_read_more()} &rarr;</span>
      </div>
    </a>
  </article>
{:else}
  <article class="blog-card {extraClass}">
    <a {href} class="blog-card__link" aria-label={post.title}>
      <div class="blog-card__thumbnail">
        <ResponsiveImage
          srcFallback={imgSrc}
          srcAvif={imgAvif}
          srcWebp={imgWebp}
          alt={post.thumbnail_alt}
          loading="lazy"
          class="blog-card__img"
        />
      </div>
      <div class="blog-card__body">
        <h2 class="blog-card__title">{post.title}</h2>
        {#if showDate && post.date}
          <p class="blog-card__date">{blog_published_on({ date: formatDate(post.date) })}</p>
        {/if}
        <p class="blog-card__summary">{post.summary}</p>
        <span class="blog-card__cta">{blog_read_more()}</span>
      </div>
    </a>
  </article>
{/if}

<style>
  /* Vertical card (default) */
  .blog-card {
    background-color: var(--color-bg-white);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: var(--image-box-shadow);
    transition: box-shadow 0.2s ease;
    max-width: var(--card-max-width);
    min-width: var(--card-min-width);
    width: 100%;
  }

  .blog-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .blog-card__link {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    height: 100%;
  }

  .blog-card__thumbnail {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }

  .blog-card :global(.blog-card__img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .blog-card__body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .blog-card__title {
    font-size: var(--font-size-card-title);
    font-weight: 600;
    color: var(--color-text-heading);
    margin: 0;
    line-height: 1.3;
  }

  .blog-card__date {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin: 0;
  }

  .blog-card__summary {
    font-size: var(--font-size-regular);
    color: var(--color-text-content);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .blog-card__cta {
    display: inline-flex;
    align-items: center;
    color: var(--color-primary-500);
    font-weight: 600;
    font-size: var(--font-size-regular);
    margin-top: auto;
    padding-top: 0.5rem;
  }

  /* Horizontal card — matches OLD blog_card: padding 1.5rem box, 250px square thumbnail,
     row layout on md+, column (thumbnail first) on mobile. */
  .blog-card-h {
    background-color: var(--color-bg-white);
    border-radius: 8px;
    padding: 1.5rem;
    margin-block: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;
    width: 100%;
  }

  .blog-card-h:hover {
    box-shadow: 0 8px 24px rgba(5, 168, 162, 0.4);
    transform: translateY(-2px);
  }

  .blog-card-h__link {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    gap: 1.5rem;
    align-items: center;
  }

  @media (min-width: 768px) {
    .blog-card-h__link {
      flex-direction: row;
    }

    .blog-card-h--flip .blog-card-h__link {
      flex-direction: row-reverse;
    }
  }

  .blog-card-h__thumbnail {
    width: 250px;
    height: 250px;
    flex-shrink: 0;
    border-radius: var(--image-border-radius);
    overflow: hidden;
    box-shadow: var(--image-box-shadow);
  }

  @media (max-width: 767px) {
    .blog-card-h__thumbnail {
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
    }
  }

  .blog-card-h :global(.blog-card-h__img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .blog-card-h__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
    justify-content: center;
    align-items: flex-start;
  }

  .blog-card-h__title {
    font-size: var(--font-size-card-title);
    font-weight: 600;
    color: var(--color-text-heading);
    margin: 0;
    line-height: 1.3;
  }

  .blog-card-h__date {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin: 0;
  }

  .blog-card-h__summary {
    font-size: var(--font-size-regular);
    color: var(--color-text-content);
    line-height: 1.6;
    margin: 0 0 0.5rem;
  }

  .blog-card-h__cta {
    display: inline-flex;
    align-items: center;
    color: var(--color-primary-500);
    font-weight: 600;
    font-size: var(--font-size-regular);
    margin-top: auto;
    padding-top: 0.5rem;
    text-decoration: none;
  }
</style>
