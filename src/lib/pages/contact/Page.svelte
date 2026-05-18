<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import type { SuperValidated } from 'sveltekit-superforms';
  import type { ContactFormData } from '$lib/forms/contact-schema.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Title from '$lib/components/Title.svelte';
  import ContactForm from '$lib/components/forms/ContactForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    lang: Lang;
    formData: SuperValidated<ContactFormData>;
  }

  // lang is passed from route but not used directly in this template
  let { formData }: Props = $props();
</script>

<HeroBanner
  srcFallback="/images/page_contact/voetklachten_enschede_zere_voeten_voorvoet_contact.jpg"
  srcAvif="/images/page_contact/voetklachten_enschede_zere_voeten_voorvoet_contact.avif"
  srcWebp="/images/page_contact/voetklachten_enschede_zere_voeten_voorvoet_contact.webp"
  imgAlt={m.nav_contact()}
  overlay="blog"
  isShown={false}
  clipBottom="gentle_2"
/>

<Section class="contact-starter-section" paddingBottom="3rem">
  <Container>
    <Title level={1} class="contact-starter__title">{m.contact_page_title()}</Title>
    <p class="contact-starter__desc">{m.contact_page_intro_p1()}</p>
    <p class="contact-starter__desc">{m.contact_page_intro_p2()}</p>
    <p class="contact-starter__desc">{m.contact_page_intro_p3()}</p>
  </Container>
</Section>

<Section class="contact-form-section" paddingBottom="5rem">
  <Container>
    <ContactForm data={formData} />
  </Container>
</Section>

<style>
  :global(.contact-starter-section) {
    padding-block-start: 3rem !important;
  }

  :global(.contact-form-section) {
    padding-block-start: 1rem !important;
  }

  :global(.contact-starter__title) {
    font-size: var(--font-size-h1);
    margin-bottom: 0.75rem;
  }

  .contact-starter__desc {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 0.75rem;
  }

  .contact-starter__desc:last-of-type {
    margin-bottom: 0;
  }
</style>
