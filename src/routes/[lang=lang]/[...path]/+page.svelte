<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Lang, PageKey } from '$lib/i18n/route-map.js';
  import type { ReimbursementRow, PricingRow } from '$lib/data/reimbursements-types.js';
  import type { LegalDocument } from '$lib/legal/loader.js';
  import InformationPage from '$lib/pages/information/Page.svelte';
  import ReimbursementsPage from '$lib/pages/reimbursements/Page.svelte';
  import CreditsPage from '$lib/pages/credits/Page.svelte';
  import PrivacyPolicyPage from '$lib/pages/privacy_policy/Page.svelte';
  import TermsConditionsPage from '$lib/pages/terms_conditions/Page.svelte';

  type CatchAllData = PageData & {
    pageKey: PageKey;
    lang: Lang;
    reimbursements?: ReimbursementRow[];
    pricing?: PricingRow[];
    legalDoc?: LegalDocument | null;
  };

  interface Props {
    data: CatchAllData;
  }

  let { data }: Props = $props();
</script>

{#if data.pageKey === 'information'}
  <InformationPage {data} />
{:else if data.pageKey === 'reimbursements'}
  <ReimbursementsPage
    data={{ ...data, reimbursements: data.reimbursements ?? [], pricing: data.pricing ?? [] }}
  />
{:else if data.pageKey === 'credits'}
  <CreditsPage {data} />
{:else if data.pageKey === 'privacy_policy'}
  <PrivacyPolicyPage data={{ ...data, legalDoc: data.legalDoc ?? null }} />
{:else if data.pageKey === 'terms_conditions'}
  <TermsConditionsPage data={{ ...data, legalDoc: data.legalDoc ?? null }} />
{/if}
