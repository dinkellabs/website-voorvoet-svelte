<script lang="ts">
  interface Props {
    direction: 'up' | 'down';
    class?: string;
    title?: string;
  }
  let { direction, class: className = '', title }: Props = $props();

  const path = $derived(direction === 'up' ? 'M4 0L8 5H0z' : 'M0 0H8L4 5z');
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 8 5"
  fill="currentColor"
  aria-hidden={title ? undefined : true}
  role={title ? 'img' : undefined}
  class={className}
>
  {#if title}<title>{title}</title>{/if}
  <path d={path} />
</svg>
