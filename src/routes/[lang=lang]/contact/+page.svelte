<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Lang } from '$lib/i18n/route-map.js';
  import type { SuperValidated } from 'sveltekit-superforms';
  import type { ContactFormData } from '$lib/forms/contact-schema.js';
  import ContactPage from '$lib/pages/contact/Page.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<ContactPage lang={data.lang as Lang} formData={data.form as SuperValidated<ContactFormData>} />
