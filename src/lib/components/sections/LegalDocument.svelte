<script lang="ts">
  interface Props {
    title: string;
    version: string;
    date?: string;
    html: string;
    sourcePdf?: string;
    isTranslation?: boolean;
    translationDisclaimer?: string;
  }

  let {
    title,
    version,
    date,
    html,
    sourcePdf,
    isTranslation = false,
    translationDisclaimer,
  }: Props = $props();
</script>

<article class="legal">
  {#if isTranslation && translationDisclaimer}
    <div class="legal__disclaimer" role="note">
      <span class="legal__disclaimer-icon" aria-hidden="true">&#9888;</span>
      {translationDisclaimer}
    </div>
  {/if}

  <header class="legal__header">
    <h1 class="legal__title">{title}</h1>
    <p class="legal__meta">
      <span>v{version}</span>
      {#if date}
        <span class="legal__sep" aria-hidden="true">·</span>
        <time datetime={date}>{date}</time>
      {/if}
      {#if sourcePdf}
        <span class="legal__sep" aria-hidden="true">·</span>
        <a href={sourcePdf} class="legal__pdf" download>PDF</a>
      {/if}
    </p>
  </header>

  <div class="legal__body prose">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html html}
  </div>
</article>

<style>
  .legal {
    max-width: 760px;
    margin-inline: auto;
  }

  .legal__disclaimer {
    background-color: #fff8e1;
    border-left: 4px solid #f59e0b;
    padding: 1rem 1.25rem;
    margin-bottom: 2rem;
    border-radius: 0 0.375rem 0.375rem 0;
    color: var(--color-text-content);
    font-size: 0.95rem;
    line-height: 1.6;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .legal__disclaimer-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    color: #f59e0b;
  }

  .legal__header {
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--color-bg-green-light);
    padding-bottom: 1rem;
  }

  .legal__title {
    font-size: clamp(1.75rem, 3vw + 0.5rem, 2.5rem);
    font-weight: 900;
    color: var(--color-text-heading);
    margin-bottom: 0.5rem;
  }

  .legal__meta {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .legal__sep {
    color: var(--color-text-muted);
  }

  .legal__pdf {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .legal__body :global(h2) {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-text-heading);
    margin: 2rem 0 0.75rem;
  }

  .legal__body :global(h3) {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--color-text-subheading);
    margin: 1.5rem 0 0.5rem;
  }

  .legal__body :global(p) {
    font-size: 1rem;
    line-height: 1.75;
    color: var(--color-text-content);
    margin-bottom: 1rem;
  }

  .legal__body :global(ul),
  .legal__body :global(ol) {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .legal__body :global(li) {
    font-size: 1rem;
    line-height: 1.75;
    color: var(--color-text-content);
    margin-bottom: 0.4rem;
  }

  .legal__body :global(a) {
    color: var(--color-text-link);
    text-decoration: underline;
  }

  .legal__body :global(em) {
    font-style: italic;
  }

  .legal__body :global(strong) {
    font-weight: 600;
  }
</style>
