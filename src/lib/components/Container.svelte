<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    class?: string;
  }

  let { children, class: extraClass = '' }: Props = $props();
</script>

<div class="container {extraClass}">
  {@render children()}
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin-inline: auto;
    padding-inline: var(--spacing-container-padding);
    width: 100%;
  }
</style>
