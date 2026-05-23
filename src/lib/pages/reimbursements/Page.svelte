<script lang="ts">
  import type { Lang } from '$lib/i18n/route-map.js';
  import HeroBanner from '$lib/components/HeroBanner.svelte';
  import Section from '$lib/components/Section.svelte';
  import Container from '$lib/components/Container.svelte';
  import Title from '$lib/components/Title.svelte';
  import Chevron from '$lib/components/icons/Chevron.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { ReimbursementRow, PricingRow } from '$lib/data/reimbursements-types.js';

  interface Props {
    data: { lang: Lang; reimbursements: ReimbursementRow[]; pricing: PricingRow[] };
  }

  let { data }: Props = $props();

  const rows = $derived(data.reimbursements ?? []);
  const pricing = $derived(data.pricing ?? []);

  type SortColumn = 'verzekeraar' | 'pakket' | 'vergoeding';
  type SortDirection = 'asc' | 'desc';

  let searchQuery = $state('');
  let currentPage = $state(1);
  let sortColumn = $state<SortColumn | null>(null);
  let sortDirection = $state<SortDirection>('asc');
  const PAGE_SIZE = 12;

  const filteredRows = $derived(
    searchQuery.trim()
      ? rows.filter(
          (r: ReimbursementRow) =>
            r.verzekeraar.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.pakket.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.vergoeding.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : rows,
  );

  const sortedRows = $derived.by(() => {
    if (!sortColumn) return filteredRows;
    const col = sortColumn;
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...filteredRows].sort((a, b) => a[col].localeCompare(b[col], 'nl') * dir);
  });

  const totalPages = $derived(Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE)));

  const pagedRows = $derived(
    sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
  );

  const rangeStart = $derived(sortedRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1);
  const rangeEnd = $derived(Math.min(currentPage * PAGE_SIZE, sortedRows.length));

  function handleSearch() {
    currentPage = 1;
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }

  function handleSort(col: SortColumn) {
    if (sortColumn !== col) {
      sortColumn = col;
      sortDirection = 'asc';
    } else if (sortDirection === 'asc') {
      sortDirection = 'desc';
    } else {
      sortColumn = null;
      sortDirection = 'asc';
    }
    currentPage = 1;
  }

  /** Smart pagination: 1, ..., current-1, current, current+1, ..., last. */
  const paginationItems = $derived.by((): Array<number | 'ellipsis'> => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: Array<number | 'ellipsis'> = [1];
    if (currentPage > 3) items.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) items.push(i);
    if (currentPage < totalPages - 2) items.push('ellipsis');
    items.push(totalPages);
    return items;
  });
</script>

<HeroBanner
  srcFallback="/images/page_reimbursements/Hielpijn_hielspoor_plantaire_fasciits_tarieven.jpg"
  srcAvif="/images/page_reimbursements/Hielpijn_hielspoor_plantaire_fasciits_tarieven.avif"
  srcWebp="/images/page_reimbursements/Hielpijn_hielspoor_plantaire_fasciits_tarieven.webp"
  imgAlt={m.reimb_hero_img_alt()}
  overlay="blog"
  isShown={false}
  clipBottom="gentle_1"
/>

<Section class="reimb-starter-section" paddingBottom="2rem">
  <Container>
    <Title level={1} class="reimb-page-title">{m.reimb_starter_title()}</Title>
    <p class="reimb-starter-intro">{m.reimb_starter_intro()}</p>
  </Container>
</Section>

<Section class="reimb-table-section" paddingBottom="1rem">
  <Container>
    <Title level={2} class="reimb-title">{m.reimb_table_title()}</Title>
    <p class="reimb-intro">
      {m.reimb_intro_p1()}
      <a
        href="https://www.podotherapie.nl/vergoedingen/"
        class="reimb-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {m.reimb_intro_nvvp_link()}
      </a>
      {m.reimb_intro_p2()}
    </p>
    <p class="reimb-intro">{m.reimb_intro_p3()}</p>

    <div class="reimb-search">
      <input
        type="search"
        bind:value={searchQuery}
        oninput={handleSearch}
        placeholder={m.reimb_search_placeholder()}
        class="reimb-search__input"
        aria-label={m.reimb_search_placeholder()}
      />
    </div>

    <div class="reimb-table-wrap">
      <!-- tabindex=0 + role=region is the WAI-ARIA APG pattern for making an
           overflowing scroll container reachable by keyboard. The element is
           intentionally non-interactive itself. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="reimb-table-scroll" tabindex="0" role="region" aria-label={m.reimb_table_title()}>
        <table class="reimb-table">
          <colgroup>
            <col class="reimb-table__col reimb-table__col--insurer" />
            <col class="reimb-table__col reimb-table__col--package" />
            <col class="reimb-table__col reimb-table__col--reimbursement" />
          </colgroup>
          <thead>
            <tr>
              {#each [{ key: 'verzekeraar', label: m.reimb_col_insurer() }, { key: 'pakket', label: m.reimb_col_package() }, { key: 'vergoeding', label: m.reimb_col_reimbursement() }] as col (col.key)}
                {@const active = sortColumn === col.key}
                <th
                  aria-sort={active
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'}
                >
                  <button
                    type="button"
                    class="reimb-table__sort"
                    onclick={() => handleSort(col.key as SortColumn)}
                    aria-label={active && sortDirection === 'asc'
                      ? m.reimb_sort_desc()
                      : m.reimb_sort_asc()}
                  >
                    <span>{col.label}</span>
                    <span class="reimb-table__chevrons" aria-hidden="true">
                      <Chevron
                        direction="up"
                        class="reimb-table__chevron reimb-table__chevron--up {active &&
                        sortDirection === 'asc'
                          ? 'reimb-table__chevron--active'
                          : ''}"
                      />
                      <Chevron
                        direction="down"
                        class="reimb-table__chevron reimb-table__chevron--down {active &&
                        sortDirection === 'desc'
                          ? 'reimb-table__chevron--active'
                          : ''}"
                      />
                    </span>
                  </button>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each pagedRows as row (row.verzekeraar + '|' + row.pakket)}
              <tr>
                <td>{row.verzekeraar}</td>
                <td>{row.pakket}</td>
                <td>{row.vergoeding}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="reimb-tablefoot">
        <div class="reimb-tablefoot__count">
          {m.reimb_pagination_showing()}
          <strong>{rangeStart}</strong>
          {m.reimb_pagination_to()}
          <strong>{rangeEnd}</strong>
          {m.reimb_pagination_of()}
          <strong>{sortedRows.length}</strong>
          {m.reimb_pagination_results()}
        </div>

        {#if totalPages > 1}
          <nav class="reimb-pagination" aria-label="Paginering">
            <button
              class="reimb-pagination__btn"
              onclick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {m.reimb_pagination_previous()}
            </button>

            {#each paginationItems as item, i (i)}
              {#if item === 'ellipsis'}
                <span class="reimb-pagination__ellipsis" aria-hidden="true">…</span>
              {:else}
                <button
                  class="reimb-pagination__btn"
                  class:reimb-pagination__btn--active={item === currentPage}
                  onclick={() => goToPage(item)}
                  aria-label="Pagina {item}"
                  aria-current={item === currentPage ? 'page' : undefined}
                >
                  {item}
                </button>
              {/if}
            {/each}

            <button
              class="reimb-pagination__btn"
              onclick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {m.reimb_pagination_next()}
            </button>
          </nav>
        {/if}
      </div>
    </div>

    <p class="reimb-disclaimer">{m.reimb_disclaimer()}</p>
  </Container>
</Section>

{#if pricing.length > 0}
  <Section class="reimb-pricing-section" paddingBottom="3rem">
    <Container>
      <Title level={2} class="pricing-title">{m.reimb_pricing_title()}</Title>
      <p class="pricing-intro">{m.reimb_pricing_intro()}</p>
      <div class="pricing-table-wrap">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          class="pricing-table-scroll"
          tabindex="0"
          role="region"
          aria-label={m.reimb_pricing_title()}
        >
          <table class="pricing-table">
            <colgroup>
              <col class="pricing-table__col pricing-table__col--treatment" />
              <col class="pricing-table__col pricing-table__col--price" />
            </colgroup>
            <thead>
              <tr>
                <th>{m.reimb_col_treatment()}</th>
                <th>{m.reimb_col_price()}</th>
              </tr>
            </thead>
            <tbody>
              {#each pricing as row (row.behandeling)}
                <tr>
                  <td>{row.behandeling}</td>
                  <td class="pricing-table__price">{row.prijs}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
      <p class="pricing-disclaimer">{m.reimb_pricing_disclaimer()}</p>
    </Container>
  </Section>
{/if}

<style>
  :global(.reimb-starter-section) {
    padding-block-start: 2rem !important;
  }

  :global(.reimb-table-section) {
    padding-block-start: 1rem !important;
  }

  :global(.reimb-pricing-section) {
    padding-block-start: 3rem !important;
  }

  :global(.reimb-page-title) {
    font-size: var(--font-size-h1);
  }

  .reimb-starter-intro {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
  }

  :global(.reimb-title) {
    color: var(--color-text-subheading);
  }

  .reimb-intro {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 1rem;
  }

  .reimb-link {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .reimb-search {
    margin-bottom: 1.5rem;
  }

  .reimb-search__input {
    width: 100%;
    max-width: 480px;
    padding: 0.6rem 1rem;
    /* Slate-300; the design-system --color-border-light (#f3f4f6) is too
       washed out to read as an outline on white. */
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .reimb-search__input:hover {
    border-color: #94a3b8;
  }

  .reimb-search__input:focus {
    border-color: var(--color-primary-500);
  }

  .reimb-table-wrap {
    border: 1px solid var(--color-border-light);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1.5rem;
    background-color: var(--color-bg-white);
  }

  .reimb-table-scroll {
    overflow-x: auto;
  }

  .reimb-table {
    width: 100%;
    /* Fixed layout so columns stay the configured widths regardless of cell
       content — sorting won't reflow column widths anymore. */
    table-layout: fixed;
    /* Below this width the inner scroll container shows a horizontal
       scrollbar instead of crushing columns. Tuned so the longest
       reimbursement strings ("Max. € 250,- per kalenderjaar (...)") don't
       wrap into too many lines on desktop. */
    min-width: 640px;
    border-collapse: collapse;
    font-size: 1rem;
  }

  .reimb-table__col--insurer {
    width: 26%;
  }

  .reimb-table__col--package {
    width: 20%;
  }

  .reimb-table__col--reimbursement {
    width: 54%;
  }

  .reimb-table th {
    background-color: var(--color-primary-500);
    color: var(--color-text-white);
    padding: 0;
    text-align: left;
    font-weight: 600;
    font-size: 1.0625rem;
  }

  .reimb-table__sort {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    padding: 0.875rem 1rem;
    background: none;
    border: 0;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .reimb-table__sort:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .reimb-table__chevrons {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }

  :global(.reimb-table__chevron) {
    width: 8px;
    height: 5px;
    opacity: 0.45;
  }

  :global(.reimb-table__chevron--active) {
    opacity: 1;
  }

  .reimb-table td {
    padding: 0.7rem 1rem;
    color: var(--color-text-content);
    vertical-align: top;
    /* table-layout: fixed truncates long unbroken tokens — let them wrap. */
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .reimb-table tbody tr:nth-child(even) td {
    background-color: var(--color-bg-white);
  }

  .reimb-table tbody tr:nth-child(odd) td {
    background-color: var(--color-bg-green-light);
  }

  .reimb-tablefoot {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1rem;
    border-top: 1px solid var(--color-border-light);
    background-color: var(--color-bg-white);
    font-size: 0.95rem;
    color: var(--color-text-content);
  }

  @media (min-width: 640px) {
    .reimb-tablefoot {
      flex-direction: row;
    }
  }

  .reimb-tablefoot__count strong {
    font-weight: 700;
  }

  .reimb-pagination {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .reimb-pagination__btn {
    font-family: var(--font-family);
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--color-border-light);
    border-radius: 4px;
    background-color: var(--color-bg-white);
    color: var(--color-text-content);
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
    min-width: 2.25rem;
  }

  .reimb-pagination__btn:hover:not(:disabled):not(.reimb-pagination__btn--active) {
    background-color: var(--color-bg-green-light);
    border-color: var(--color-primary-300);
  }

  .reimb-pagination__btn--active {
    background-color: var(--color-bg-green-light);
    border-color: var(--color-border-light);
    color: var(--color-text-content);
    font-weight: 700;
    cursor: default;
  }

  .reimb-pagination__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reimb-pagination__ellipsis {
    padding: 0.4rem 0.25rem;
    color: var(--color-text-muted);
    user-select: none;
  }

  .reimb-disclaimer {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    font-style: italic;
    line-height: 1.6;
  }

  :global(.pricing-title) {
    color: var(--color-text-subheading);
  }

  .pricing-intro {
    font-size: var(--font-size-regular);
    line-height: 1.7;
    color: var(--color-text-content);
    margin-bottom: 1rem;
  }

  .pricing-disclaimer {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    font-style: italic;
    line-height: 1.6;
    margin-top: 1.5rem;
  }

  .pricing-table-wrap {
    max-width: 800px;
    margin-inline: auto;
    border: 1px solid var(--color-border-light);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--color-bg-white);
  }

  .pricing-table-scroll {
    overflow-x: auto;
  }

  .pricing-table {
    width: 100%;
    table-layout: fixed;
    min-width: 480px;
    border-collapse: collapse;
    font-size: 1rem;
    background-color: var(--color-bg-white);
  }

  .pricing-table__col--treatment {
    width: 70%;
  }

  .pricing-table__col--price {
    width: 30%;
  }

  .pricing-table th {
    background-color: var(--color-primary-500);
    color: var(--color-text-white);
    padding: 0.875rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 1.0625rem;
  }

  .pricing-table td {
    padding: 0.7rem 1rem;
    color: var(--color-text-content);
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .pricing-table tbody tr:nth-child(even) td {
    background-color: var(--color-bg-white);
  }

  .pricing-table tbody tr:nth-child(odd) td {
    background-color: var(--color-bg-green-light);
  }

  .pricing-table__price {
    white-space: nowrap;
    font-weight: 500;
  }
</style>
