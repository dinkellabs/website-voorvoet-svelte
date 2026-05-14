<script lang="ts">
  import type { Snippet } from 'svelte';

  type Level = 1 | 2 | 3;

  interface Props {
    children: Snippet;
    level: Level;
    id?: string;
    class?: string;
  }

  let { children, level, id, class: extraClass = '' }: Props = $props();

  const levelClass = $derived(`title--h${level}`);
</script>

{#if level === 1}
  <h1 {id} class="title {levelClass} {extraClass}">{@render children()}</h1>
{:else if level === 2}
  <h2 {id} class="title {levelClass} {extraClass}">{@render children()}</h2>
{:else}
  <h3 {id} class="title {levelClass} {extraClass}">{@render children()}</h3>
{/if}

<style>
  .title {
    color: var(--color-text-heading);
    margin: 0 0 1rem;
    line-height: 1.2;
  }

  .title--h1 {
    font-size: var(--font-size-section-title);
    font-weight: 700;
  }

  .title--h2 {
    font-size: var(--font-size-section-title);
    font-weight: 700;
  }

  .title--h3 {
    font-size: var(--font-size-section-subtitle);
    font-weight: 600;
    color: var(--color-text-subheading);
    margin-bottom: 0.5rem;
  }
</style>
