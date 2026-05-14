<script lang="ts" module>
  type DividerKey = 'gentle_1' | 'gentle_2' | 'gentle_3' | 'gentle_4';
  const SVG_DIVIDERS: Record<DividerKey, { viewBox: string; path: string }> = {
    gentle_1: { viewBox: '0 0 1200 120', path: 'M0,0V15C400,15,600,135,1200,85V0Z' },
    gentle_2: { viewBox: '0 0 1200 120', path: 'M0,0V85C400,135,600,15,1200,15V0Z' },
    gentle_3: { viewBox: '0 0 1200 120', path: 'M0,0V75C400,45,600,105,1200,15V0Z' },
    gentle_4: { viewBox: '0 0 1200 120', path: 'M0,0V45C400,75,600,15,1200,105V0Z' },
  };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';

  interface Props {
    title?: string;
    subtitle?: string;
    srcFallback: string;
    srcAvif?: string;
    srcWebp?: string;
    imgAlt?: string;
    cta?: Snippet;
    /** Visual treatment of the dark overlay over the image. */
    overlay?: 'dark' | 'hero' | 'blog' | 'subpage';
    /** Set to false to hide the title overlay (title appears below in page content). */
    isShown?: boolean;
    /** Override the minimum height of the hero. Defaults to the --hero-min-height token. */
    minHeight?: string;
    /** Optional wavy SVG divider on the bottom edge (matches OLD section clip_bottom). */
    clipBottom?: 'none' | DividerKey;
    /** Fill color of the wavy divider — should match the next section's background. */
    dividerColor?: 'white' | 'green';
    class?: string;
  }

  let {
    title,
    subtitle,
    srcFallback,
    srcAvif,
    srcWebp,
    imgAlt = '',
    cta,
    overlay = 'dark',
    isShown = true,
    minHeight,
    clipBottom = 'none',
    dividerColor = 'white',
    class: extraClass = '',
  }: Props = $props();

  const bottomDiv = $derived(clipBottom !== 'none' ? SVG_DIVIDERS[clipBottom] : null);
  const dividerFill = $derived(
    dividerColor === 'green' ? 'var(--color-bg-green-light)' : 'var(--color-bg-white)',
  );
</script>

<section
  class="hero hero--overlay-{overlay} {extraClass}"
  aria-label={title ?? imgAlt}
  style={minHeight ? `min-height: ${minHeight}` : undefined}
>
  <div class="hero__bg">
    <ResponsiveImage
      {srcFallback}
      {srcAvif}
      {srcWebp}
      alt={imgAlt}
      loading="eager"
      fetchpriority="high"
      class="hero__img"
    />
    <div class="hero__overlay hero__overlay--{overlay}" aria-hidden="true"></div>
  </div>

  {#if isShown && (title || subtitle || cta)}
    <div class="hero__content">
      <div class="hero__text">
        {#if title}
          <h1 class="hero__title">{title}</h1>
        {/if}
        {#if subtitle}
          <p class="hero__subtitle">{subtitle}</p>
        {/if}
      </div>
      {#if cta}
        <div class="hero__cta">
          {@render cta()}
        </div>
      {/if}
    </div>
  {/if}

  {#if bottomDiv}
    <div class="hero__divider hero__divider--bottom" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={bottomDiv.viewBox}
        preserveAspectRatio="none"
      >
        <path d={bottomDiv.path} style:fill={dividerFill} />
      </svg>
    </div>
  {/if}
</section>

<style>
  .hero {
    /* Pull hero up under the sticky semi-transparent header so the image
       starts at y=0 like OLD (where the header overlays the hero image). */
    margin-top: calc(-1 * var(--header-height, 68px));
    position: relative;
    min-height: var(--hero-min-height);
    display: flex;
    align-items: stretch;
    overflow: hidden;
  }

  .hero__bg {
    position: absolute;
    inset: 0;
  }

  /* The img sits inside a <picture> wrapper (default display: inline, no
     explicit height), so `height: 100%` resolves to auto and the img falls
     back to its natural aspect ratio — overflowing the section. OLD avoids
     this by making the img itself position: absolute; inset: 0 so it fills
     .hero__bg directly (skipping the inline <picture>). object-fit: cover
     then crops the 1920x1400 image to the section's actual aspect ratio. */
  .hero__bg :global(.hero__img) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  /* OLD applies a brightness/saturate filter to the hero image to lift colours
     before the gradient overlay is screened on top. Without this the screen
     blend looks muddy. */
  .hero--overlay-hero .hero__bg :global(.hero__img) {
    filter: brightness(1.05) saturate(1.06);
  }

  .hero__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .hero__overlay--dark {
    background: linear-gradient(to right, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.1) 100%);
  }

  /* OLD home hero gradient: white→teal, full bleed, with mix-blend-mode: screen
     so the image colours bleach to white at top and shift teal at bottom rather
     than getting flatly tinted. */
  .hero__overlay--hero {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(16, 185, 129, 0.35) 100%
    );
    mix-blend-mode: screen;
  }

  /* Blog/subpage hero: horizontal gradient 270deg — white on right, teal on left.
     Matches OLD: linear-gradient(270deg, rgba(255,255,255,.55) 0%, rgba(16,185,129,.35) 100%) */
  .hero__overlay--blog {
    background: linear-gradient(
      270deg,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(16, 185, 129, 0.35) 100%
    );
  }

  .hero__overlay--subpage {
    background: linear-gradient(
      270deg,
      rgba(255, 255, 255, 0.35) 0%,
      rgba(16, 185, 129, 0.35) 100%
    );
  }

  .hero__content {
    position: relative;
    z-index: 1;
    max-width: var(--max-width);
    margin-inline: auto;
    padding-inline: var(--spacing-container-padding);
    width: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    align-self: stretch;
  }

  .hero__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* OLD vstack(spacing="2") = 8px gap between title and subtitle. */
    gap: 0.5rem;
    padding-top: 2.5rem;
  }

  .hero__title {
    font-size: var(--font-size-hero-title);
    font-weight: 900;
    color: var(--color-text-white);
    line-height: 1.05;
    /* OLD jumbo_text has no margin — spacing handled by vstack gap. */
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    text-align: center;
    /* OLD's jumbo_text is rendered as <p>, not a heading, so it doesn't
       inherit the Radix heading -0.00625em tracking — keep this title at
       neutral letter-spacing even though we render it as <h1>. */
    letter-spacing: normal;
  }

  .hero__subtitle {
    font-size: var(--font-size-hero-subtitle);
    color: var(--color-text-white);
    font-weight: 600;
    line-height: 1.15;
    /* OLD rx.heading default margin-bottom 1rem. */
    margin: 0 0 1rem;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    text-align: center;
    opacity: 0.95;
    /* The subtitle is a heading semantically (OLD renders it as h1). It's a
       <p> on NEW to avoid two h1s, but it should track like a Radix heading. */
    letter-spacing: -0.00625em;
  }

  /* When the overlay is the white-to-teal home hero, drop white text in
     favour of the brand primary for the title and dark heading for the
     subtitle. Matches OLD jumbo_text(color=primary[300]). */
  .hero--overlay-hero .hero__title {
    color: var(--color-primary-300);
    text-shadow: none;
  }

  .hero--overlay-hero .hero__subtitle {
    color: var(--color-text-heading);
    text-shadow: none;
  }

  /* Blog/subpage hero: OLD section height 500px (starting below header).
     For NEW (margin-top: -header-height): min-height = OLD_height + header-height = 500+68 = 568px.
     This places the blog section bottom at: -68 + 568 = 500 = OLD section bottom (68+500=568? no...)
     Empirically, 500px gives the best blog diff (24.09% desktop vs 29.26% with 303px default). */
  .hero--overlay-blog,
  .hero--overlay-subpage {
    min-height: 500px;
  }

  @media (min-width: 1024px) {
    .hero--overlay-blog,
    .hero--overlay-subpage {
      min-height: 533px;
    }
  }

  /* Home hero min-height — matches OLD Layout.hero_min_height responsive array
     [700px, 750px, 800px, 850px] at breakpoints [base, 640, 768, 1024+].
     Without these, at < 1024px the hero falls back to 303px and the CTA box
     overflows into the next section. */
  .hero--overlay-hero {
    min-height: 700px;
  }

  @media (min-width: 640px) {
    .hero--overlay-hero {
      min-height: 750px;
    }
  }

  @media (min-width: 768px) {
    .hero--overlay-hero {
      min-height: 800px;
    }
  }

  @media (min-width: 1024px) {
    .hero--overlay-hero {
      min-height: 850px;
    }
  }

  .hero__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    padding-bottom: 1rem;
    margin-bottom: 4rem;
  }

  @media (min-width: 768px) {
    .hero__cta {
      justify-content: flex-end;
      padding-right: 1.25rem;
    }
  }

  /* Wavy SVG divider at the bottom of the hero (matches OLD section clip_bottom).
     Uses the same 75px height + flipped path as Section.svelte. */
  .hero__divider {
    position: absolute;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    pointer-events: none;
    z-index: 2;
  }

  .hero__divider--bottom {
    bottom: -1px;
    transform: rotate(180deg);
  }

  .hero__divider svg {
    position: relative;
    display: block;
    width: calc(100% + 3px);
    height: 75px;
  }
</style>
