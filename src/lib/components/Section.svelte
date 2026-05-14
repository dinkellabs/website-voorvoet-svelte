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

  interface Props {
    children: Snippet;
    bg?: 'white' | 'green';
    id?: string;
    class?: string;
    paddingBottom?: string;
    clipTop?: 'none' | DividerKey;
    clipBottom?: 'none' | DividerKey;
    /** Color of the divider SVG fill — should match the adjacent section's bg. */
    dividerColor?: 'white' | 'green';
  }

  let {
    children,
    bg = 'white',
    id,
    class: extraClass = '',
    paddingBottom,
    clipTop = 'none',
    clipBottom = 'none',
    dividerColor = bg === 'green' ? 'white' : 'green',
  }: Props = $props();

  const bgClass = $derived(bg === 'green' ? 'section--green' : 'section--white');
  const fillVar = $derived(
    dividerColor === 'green' ? 'var(--color-bg-green-light)' : 'var(--color-bg-white)',
  );
  const topDiv = $derived(clipTop !== 'none' ? SVG_DIVIDERS[clipTop] : null);
  const bottomDiv = $derived(clipBottom !== 'none' ? SVG_DIVIDERS[clipBottom] : null);
  const clipClass = $derived(
    topDiv && bottomDiv
      ? 'section--clip-both'
      : topDiv
        ? 'section--clip-top'
        : bottomDiv
          ? 'section--clip-bottom'
          : '',
  );
</script>

<section
  {id}
  class="section {bgClass} {clipClass} {extraClass}"
  style:padding-bottom={paddingBottom}
>
  {#if topDiv}
    <div class="divider divider--top" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={topDiv.viewBox} preserveAspectRatio="none">
        <path d={topDiv.path} style:fill={fillVar} />
      </svg>
    </div>
  {/if}

  {@render children()}

  {#if bottomDiv}
    <div class="divider divider--bottom" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={bottomDiv.viewBox}
        preserveAspectRatio="none"
      >
        <path d={bottomDiv.path} style:fill={fillVar} />
      </svg>
    </div>
  {/if}
</section>

<style>
  /* Base: vertical padding equals the section-vertical token (no extra for dividers).
     Clip variants add 3rem extra (≈ SVG divider height 75px) on the clipped side. */
  .section {
    position: relative;
    padding-block: var(--spacing-section-vertical);
    width: 100%;
  }

  .section--clip-top {
    padding-block-start: calc(var(--spacing-section-vertical) + 3rem);
  }

  .section--clip-bottom {
    padding-block-end: calc(var(--spacing-section-vertical) + 3rem);
  }

  .section--clip-both {
    padding-block: calc(var(--spacing-section-vertical) + 3rem);
  }

  .section--white {
    background-color: var(--color-bg-white);
  }

  .section--green {
    background-color: var(--color-bg-green-light);
  }

  .divider {
    position: absolute;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    pointer-events: none;
  }

  .divider--top {
    top: -1px;
  }

  .divider--bottom {
    bottom: -1px;
    transform: rotate(180deg);
  }

  .divider svg {
    position: relative;
    display: block;
    width: calc(100% + 3px);
    height: 75px;
  }
</style>
