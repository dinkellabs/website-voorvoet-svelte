<script lang="ts">
  import { toast } from '$lib/stores/toast.svelte.js';

  interface Props {
    class?: string;
  }
  let { class: extraClass = '' }: Props = $props();
</script>

{#if toast.items.length > 0}
  <div class="toast-container {extraClass}" aria-live="polite" aria-atomic="false">
    {#each toast.items as item (item.id)}
      <div class="toast toast--{item.kind}" role="alert">
        <span class="toast__message">{item.message}</span>
        <button
          type="button"
          class="toast__close"
          aria-label="Sluiten"
          onclick={() => toast.dismiss(item.id)}
        >
          ×
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: min(24rem, calc(100vw - 2rem));
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    color: var(--color-text-white);
    font-size: var(--font-size-regular);
    animation: toast-in 0.2s ease;
  }

  .toast--success {
    background-color: var(--color-success);
  }

  .toast--error {
    background-color: var(--color-error);
  }

  .toast__message {
    flex: 1;
    line-height: 1.4;
  }

  .toast__close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    padding: 0;
    opacity: 0.8;
    transition: opacity 0.15s;
  }

  .toast__close:hover {
    opacity: 1;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
