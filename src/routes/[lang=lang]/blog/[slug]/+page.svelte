<script lang="ts">
  import type { PageData } from './$types.js';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Title from '$lib/components/Title.svelte';
  import Button from '$lib/components/Button.svelte';
  import {
    blog_back_to_blog,
    blog_published_on,
    blog_by_author,
    blog_hero_img_alt,
  } from '$lib/paraglide/messages.js';
  import { env } from '$env/dynamic/public';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const showAuthor = $derived(env.PUBLIC_BLOG_SHOW_AUTHOR === 'true');
  const showDate = $derived(env.PUBLIC_BLOG_SHOW_PUBLICATION_DATE === 'true');

  function formatDate(dateStr: string): string {
    try {
      return new Intl.DateTimeFormat(data.post.lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }
</script>

<HeroBanner
  srcFallback="/images/page_blog/voorvoet_praktijk_voor_podotherapie_Sandalen_Durea_modern_uitneembaar_voetbed_steunzolen_op_maat_gezonde_blote_voeten_bij_zwembad.jpg"
  srcAvif="/images/page_blog/voorvoet_praktijk_voor_podotherapie_Sandalen_Durea_modern_uitneembaar_voetbed_steunzolen_op_maat_gezonde_blote_voeten_bij_zwembad.avif"
  srcWebp="/images/page_blog/voorvoet_praktijk_voor_podotherapie_Sandalen_Durea_modern_uitneembaar_voetbed_steunzolen_op_maat_gezonde_blote_voeten_bij_zwembad.webp"
  imgAlt={blog_hero_img_alt()}
  overlay="blog"
  isShown={false}
  clipBottom="gentle_1"
/>

<Section id="blog-post-content">
  <Container>
    <article class="blog-post">
      <header class="blog-post__header">
        <Button variant="ghost" href={data.blogBase} class="blog-post__back">
          &larr; {blog_back_to_blog()}
        </Button>
        <Title level={1} class="blog-post__title">{data.post.title}</Title>
        {#if showDate && data.post.date}
          <p class="blog-post__meta">
            {blog_published_on({ date: formatDate(data.post.date) })}
            {#if showAuthor && data.post.author}
              &mdash; {blog_by_author({ author: data.post.author })}
            {/if}
          </p>
        {:else if showAuthor && data.post.author}
          <p class="blog-post__meta">{blog_by_author({ author: data.post.author })}</p>
        {/if}
      </header>

      <div class="blog-post__content">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html data.post.content}
      </div>

      <footer class="blog-post__footer">
        <Button variant="ghost" href={data.blogBase} class="blog-post__back-footer">
          &larr; {blog_back_to_blog()}
        </Button>
      </footer>
    </article>
  </Container>
</Section>

<style>
  /* Match OLD blog post section padding: padding_top="1em", padding_bottom="2em".
     At mobile, add extra top padding to compensate for shorter hero (see blog list page). */
  :global(#blog-post-content) {
    padding-block-start: 9em; /* 1em (old) + ~8em to compensate hero height offset at mobile */
    padding-block-end: 2em;
  }

  @media (min-width: 768px) {
    :global(#blog-post-content) {
      padding-block-start: 1em;
    }
  }

  .blog-post {
    max-width: 800px;
    margin-inline: auto;
  }

  .blog-post__header {
    margin-bottom: 2rem;
  }

  :global(.blog-post__back) {
    color: var(--color-primary-500);
    font-weight: 600;
    font-size: var(--font-size-regular);
    margin-bottom: 1rem;
  }

  :global(.blog-post__back:hover) {
    color: var(--color-primary-700);
  }

  :global(.blog-post__title) {
    font-size: var(--font-size-h1);
    line-height: 1.3;
    margin-bottom: 0.75rem;
  }

  .blog-post__meta {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }

  .blog-post__content {
    line-height: 1.7;
  }

  .blog-post__content :global(h1),
  .blog-post__content :global(h2),
  .blog-post__content :global(h3),
  .blog-post__content :global(h4),
  .blog-post__content :global(h5),
  .blog-post__content :global(h6) {
    color: var(--color-text-heading);
    font-weight: 600;
    margin-top: var(--spacing-blog-heading-top);
    margin-bottom: var(--spacing-blog-heading-bottom);
    line-height: 1.3;
  }

  .blog-post__content :global(h1) {
    font-size: var(--font-size-h1);
  }

  .blog-post__content :global(h2) {
    font-size: var(--font-size-h2);
  }

  .blog-post__content :global(h3) {
    font-size: var(--font-size-h3);
  }

  .blog-post__content :global(h4),
  .blog-post__content :global(h5),
  .blog-post__content :global(h6) {
    font-size: var(--font-size-h4);
  }

  .blog-post__content :global(p) {
    color: var(--color-text-content);
    font-size: var(--font-size-regular);
    line-height: 1.7;
    margin-bottom: var(--spacing-blog-content-bottom);
  }

  .blog-post__content :global(a) {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .blog-post__content :global(a:hover) {
    color: var(--color-primary-500);
  }

  .blog-post__content :global(ul),
  .blog-post__content :global(ol) {
    padding-left: 1.5rem;
    margin-bottom: var(--spacing-blog-content-bottom);
    color: var(--color-text-content);
    font-size: var(--font-size-regular);
    line-height: 1.7;
  }

  .blog-post__content :global(li) {
    margin-bottom: 0.25rem;
  }

  .blog-post__content :global(img) {
    max-width: var(--blog-image-max-width);
    width: 100%;
    border-radius: var(--blog-image-border-radius);
    box-shadow: var(--image-box-shadow);
    display: block;
    margin: var(--spacing-blog-image);
  }

  .blog-post__content :global(figure) {
    margin: var(--spacing-blog-image);
    text-align: center;
  }

  .blog-post__content :global(figure img) {
    margin: 0 auto;
  }

  .blog-post__content :global(figcaption) {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin-top: 0.5rem;
    font-style: italic;
  }

  .blog-post__content :global(.blog-button-wrap) {
    display: flex;
    justify-content: center;
    margin: 1.5rem 0;
  }

  .blog-post__content :global(.blog-inline-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    font-weight: 600;
    font-size: var(--font-size-button);
    padding: 0.1em 0.8em;
    text-decoration: none;
    white-space: nowrap;
    background-color: var(--color-btn-primary);
    color: var(--color-text-white);
    box-shadow: 0 4px 12px rgba(5, 168, 162, 0.3);
    transition: all 0.2s ease;
  }

  .blog-post__content :global(.blog-inline-button:hover) {
    background-color: var(--color-btn-primary-hover);
    box-shadow: 0 6px 16px rgba(5, 168, 162, 0.4);
  }

  .blog-post__footer {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border-light);
  }

  :global(.blog-post__back-footer) {
    color: var(--color-primary-500);
    font-weight: 600;
    font-size: var(--font-size-regular);
  }

  :global(.blog-post__back-footer:hover) {
    text-decoration: underline;
  }
</style>
