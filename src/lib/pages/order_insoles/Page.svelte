<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import { routeFor } from '$lib/i18n/route-map.js';
  import type { SuperValidated } from 'sveltekit-superforms';
  import type { OrderFormData } from '$lib/forms/order-schema.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Title from '$lib/components/Title.svelte';
  import Button from '$lib/components/Button.svelte';
  import OrderInsolesForm from '$lib/components/forms/OrderInsolesForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    lang: Lang;
    formData: SuperValidated<OrderFormData>;
  }

  let { lang, formData }: Props = $props();

  const reimbHref = $derived(routeFor('reimbursements', lang));
</script>

<HeroBanner
  srcFallback="/images/page_order_insoles/hiking_shoes.jpg"
  srcAvif="/images/page_order_insoles/hiking_shoes.avif"
  srcWebp="/images/page_order_insoles/hiking_shoes.webp"
  imgAlt={m.order_page_img_alt()}
  isShown={false}
  minHeight="500px"
  clipBottom="gentle_2"
/>

<Section>
  <Container>
    <div class="order-starter">
      <Title level={1} class="order-starter__title">{m.order_page_title()}</Title>
      <p class="order-starter__pricing">{m.order_pricing_extra_pair()}</p>
      <p class="order-starter__pricing">{m.order_pricing_workshoes()}</p>
      <p class="order-starter__pricing">
        <Button variant="link" href={reimbHref}>{m.order_pricing_link()}</Button>
      </p>
      <p class="order-starter__terms">{m.order_page_intro_terms()}</p>
    </div>
    <OrderInsolesForm data={formData} />
  </Container>
</Section>

<style>
  .order-starter {
    margin-bottom: 2rem;
  }

  :global(.order-starter__title) {
    font-size: var(--font-size-h1);
    margin-bottom: 0.75rem;
  }

  .order-starter__pricing {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 0.25rem;
  }

  .order-starter__terms {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    font-style: italic;
    margin-top: 1rem;
  }
</style>
