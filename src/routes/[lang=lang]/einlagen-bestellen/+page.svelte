<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Lang } from '$lib/i18n/route-map.js';
  import type { SuperValidated } from 'sveltekit-superforms';
  import type { OrderFormData } from '$lib/forms/order-schema.js';
  import type { OrderPairPricing } from '$lib/data/reimbursements-types.js';
  import OrderInsolesPage from '$lib/pages/order_insoles/Page.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<OrderInsolesPage
  lang={data.lang as Lang}
  formData={data.form as SuperValidated<OrderFormData>}
  pricing={data.orderPricing as OrderPairPricing}
/>
