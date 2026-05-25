<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'link' | 'ghost';

  interface Props {
    children: Snippet;
    variant?: Variant;
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    rel?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    ariaLabel?: string;
    class?: string;
  }

  let {
    children,
    variant = 'primary',
    href,
    target,
    rel,
    type = 'button',
    disabled = false,
    onclick,
    ariaLabel,
    class: extraClass = '',
  }: Props = $props();

  const variantClass = $derived(`btn--${variant}`);
  const computedRel = $derived(target === '_blank' ? (rel ?? 'noopener noreferrer') : rel);
</script>

{#if href}
  <a
    {href}
    {target}
    rel={computedRel}
    aria-label={ariaLabel}
    class="btn {variantClass} {extraClass}"
    aria-disabled={disabled || undefined}
    tabindex={disabled ? -1 : undefined}
  >
    {@render children()}
  </a>
{:else}
  <button
    {type}
    {disabled}
    {onclick}
    aria-label={ariaLabel}
    class="btn {variantClass} {extraClass}"
  >
    {@render children()}
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-button);
    font-weight: 600;
    padding: 0.1em 0.8em;
    border-radius: 3px;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .btn[aria-disabled='true'],
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .btn--primary {
    background-color: var(--color-btn-primary);
    color: var(--color-text-white);
    box-shadow: 0 4px 12px rgba(5, 168, 162, 0.3);
  }

  .btn--primary:hover {
    background-color: var(--color-btn-primary-hover);
    box-shadow: 0 6px 16px rgba(5, 168, 162, 0.4);
    text-decoration: none;
  }

  .btn--primary:active {
    background-color: var(--color-btn-primary-hover);
  }

  .btn--secondary {
    background-color: transparent;
    color: var(--color-btn-primary);
    border: 2px solid var(--color-btn-primary);
  }

  .btn--secondary:hover {
    background-color: var(--color-btn-primary);
    color: var(--color-text-white);
    text-decoration: none;
  }

  .btn--ghost {
    background-color: transparent;
    color: var(--color-text-heading);
    padding: 0.1em 0.4em;
  }

  .btn--ghost:hover {
    background-color: rgba(0, 0, 0, 0.05);
    text-decoration: none;
  }

  .btn--link {
    /* Reset the base .btn box so a link variant flows as inline text in
       a paragraph: inherit font-size (.btn forces 1.5rem), drop the
       inline-flex container, and let the underline track the line-box. */
    display: inline;
    background-color: transparent;
    color: var(--color-text-link);
    font-size: inherit;
    font-weight: 400;
    padding: 0;
    text-decoration: underline;
    box-shadow: none;
    white-space: normal;
  }

  .btn--link:hover {
    text-decoration: underline;
    opacity: 0.85;
  }
</style>
