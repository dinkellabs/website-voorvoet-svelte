<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Lang } from '$lib/i18n/route-map.js';
  import HomePage from '$lib/pages/home/Page.svelte';

  interface Props {
    data: PageData & { lang: Lang };
  }

  let { data }: Props = $props();
</script>

<HomePage {data} />
