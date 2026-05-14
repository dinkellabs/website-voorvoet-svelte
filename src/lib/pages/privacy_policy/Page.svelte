<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import LegalDocument from '$lib/components/sections/LegalDocument.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { LegalDocument as LegalDoc } from '$lib/legal/loader.js';

  interface Props {
    data: { lang: Lang; legalDoc: LegalDoc | null };
  }

  let { data }: Props = $props();
</script>

<HeroBanner
  title={m.legal_privacy_hero_title()}
  subtitle={m.legal_privacy_hero_subtitle()}
  srcFallback="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.jpg"
  srcAvif="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.avif"
  srcWebp="/images/page_home/podotherapeut_enschede_voeten_in_bed_podotherapie_helpt.webp"
  imgAlt={m.legal_hero_img_alt()}
  clipBottom="gentle_2"
/>

<Section>
  <Container>
    {#if data.legalDoc}
      <LegalDocument
        title={data.legalDoc.title}
        version={data.legalDoc.version}
        date={data.legalDoc.date}
        html={data.legalDoc.html}
        sourcePdf={data.legalDoc.sourcePdf}
        isTranslation={data.legalDoc.isTranslation}
        translationDisclaimer={data.legalDoc.translationDisclaimer}
      />
    {/if}
  </Container>
</Section>
