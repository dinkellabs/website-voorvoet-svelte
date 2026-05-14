<script lang="ts">
  interface Props {
    srcFallback: string;
    srcAvif?: string;
    srcWebp?: string;
    alt: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    fetchpriority?: 'high' | 'low' | 'auto';
    class?: string;
  }

  let {
    srcFallback,
    srcAvif,
    srcWebp,
    alt,
    width,
    height,
    loading = 'lazy',
    fetchpriority,
    class: extraClass = '',
  }: Props = $props();
</script>

<picture>
  {#if srcAvif}
    <source srcset={srcAvif} type="image/avif" />
  {/if}
  {#if srcWebp}
    <source srcset={srcWebp} type="image/webp" />
  {/if}
  <img
    src={srcFallback}
    {alt}
    {width}
    {height}
    {loading}
    fetchpriority={fetchpriority ?? undefined}
    class={extraClass}
    decoding={loading === 'eager' ? 'sync' : 'async'}
  />
</picture>
