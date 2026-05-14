<script lang="ts">
  import type { PageData } from './$types.js';
  import BlogCard from '$lib/components/blog/BlogCard.svelte';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Title from '$lib/components/Title.svelte';
  import Button from '$lib/components/Button.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import {
    blog_previous_page,
    blog_next_page,
    blog_starter_intro,
  } from '$lib/paraglide/messages.js';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function postHref(slug: string): string {
    return `${data.blogBase}/${slug}`;
  }
</script>

<HeroBanner
  srcFallback="/images/page_blog/voorvoet_praktijk_voor_podotherapie_Sandalen_Durea_modern_uitneembaar_voetbed_steunzolen_op_maat_gezonde_blote_voeten_bij_zwembad.jpg"
  srcAvif="/images/page_blog/voorvoet_praktijk_voor_podotherapie_Sandalen_Durea_modern_uitneembaar_voetbed_steunzolen_op_maat_gezonde_blote_voeten_bij_zwembad.avif"
  srcWebp="/images/page_blog/voorvoet_praktijk_voor_podotherapie_Sandalen_Durea_modern_uitneembaar_voetbed_steunzolen_op_maat_gezonde_blote_voeten_bij_zwembad.webp"
  imgAlt={m.blog_hero_img_alt()}
  overlay="blog"
  isShown={false}
  clipBottom="gentle_1"
/>

<Section id="blog-content">
  <Container>
    <Title level={1} class="blog-page-title">{m.blog_hero_title()}</Title>
    <p class="blog-page-intro">{blog_starter_intro()}</p>

    <div class="blog-list">
      {#each data.posts as post, index (post.slug)}
        <BlogCard {post} href={postHref(post.slug)} isFlipped={index % 2 === 1} isHorizontal />
      {/each}
    </div>

    {#if data.totalPages > 1}
      <nav class="blog-pagination" aria-label="Blog pagination">
        <div class="blog-pagination__controls">
          {#if data.currentPage > 1}
            <Button
              href="{data.blogBase}?page={data.currentPage - 1}"
              ariaLabel={blog_previous_page()}
            >
              &larr; {blog_previous_page()}
            </Button>
          {/if}
          {#if data.currentPage < data.totalPages}
            <Button href="{data.blogBase}?page={data.currentPage + 1}" ariaLabel={blog_next_page()}>
              {blog_next_page()} &rarr;
            </Button>
          {/if}
        </div>
      </nav>
    {/if}
  </Container>
</Section>

<style>
  /* Override section padding to match OLD layout.
     OLD section_starter: padding_top = Radix 10 = 2.5rem, all others 0.
     OLD section_blog_list: section_vertical = 5rem top + bottom.
     NEW blog hero is shorter by ~136px at mobile (500px min-height but pulled under header)
     vs OLD 500px section starting below header. Compensate with extra top padding. */
  :global(#blog-content) {
    padding-block-start: 10.5rem; /* 2.5rem (starter) + ~8rem to match hero height offset at mobile */
    padding-block-end: 5rem;
  }

  @media (min-width: 768px) {
    :global(#blog-content) {
      padding-block-start: 2.5rem; /* header is larger (68px) so hero offset smaller at tablet */
    }
  }

  @media (min-width: 1024px) {
    :global(#blog-content) {
      padding-block-start: 2.5rem; /* desktop also aligns well with just 2.5rem */
    }
  }

  :global(.blog-page-title) {
    margin-bottom: var(--spacing-blog-heading-bottom);
  }

  .blog-page-intro {
    font-size: var(--font-size-regular);
    color: var(--color-text-content);
    line-height: 1.7;
    margin-bottom: 0;
  }

  .blog-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .blog-pagination {
    margin-top: 2.5rem;
    display: flex;
    justify-content: center;
  }

  .blog-pagination__controls {
    display: flex;
    gap: 1rem;
  }
</style>
