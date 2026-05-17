<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
  import type { SuperValidated } from 'sveltekit-superforms';
  import { env } from '$env/dynamic/public';
  import { contactSchema, REQUEST_TYPES } from '$lib/forms/contact-schema.js';
  import type { ContactFormData } from '$lib/forms/contact-schema.js';
  import type { FormFailureData } from '$lib/forms/action-results.js';
  import { translateFirstError } from '$lib/forms/error-messages.js';
  import { toast } from '$lib/stores/toast.svelte.js';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    data: SuperValidated<ContactFormData>;
  }

  let { data }: Props = $props();

  const { form, errors, enhance, submitting } = superForm(data, {
    validators: zodClient(contactSchema),
    onResult({ result }) {
      if (result.type === 'success') {
        toast.show({ kind: 'success', message: m.toast_contact_success() });
      } else if (result.type === 'failure') {
        const code = (result.data as FormFailureData | undefined)?.code;
        if (code === 'cap_failed') {
          toast.show({ kind: 'error', message: m.toast_cap_error() });
        } else {
          toast.show({ kind: 'error', message: m.toast_contact_error() });
        }
      } else if (result.type === 'error') {
        toast.show({ kind: 'error', message: m.toast_contact_error() });
      }
    },
  });

  const apiEndpoint = env.PUBLIC_CAP_API_ENDPOINT ?? '';

  if (!apiEndpoint && !$form.capToken) {
    $form.capToken = 'disabled';
  }

  // Gate submit on the actual schema so the button reflects real
  // validity (email format, phone format, "Bel mij terug" requires
  // phone via superRefine, …) instead of merely "not currently
  // submitting". Zod stays the single source of truth.
  const canSubmit = $derived(contactSchema.safeParse($form).success);

  let capWidget: HTMLElement | undefined = $state();

  onMount(() => {
    if (!capWidget) return;
    void import('$lib/cap-widget-loader.js').then((m) => m.loadCapWidget());
    const onSolve = (e: Event) => {
      const detail = (e as CustomEvent<{ token: string }>).detail;
      $form.capToken = detail.token;
    };
    const onReset = () => {
      $form.capToken = '';
    };
    capWidget.addEventListener('solve', onSolve);
    capWidget.addEventListener('reset', onReset);
    return () => {
      capWidget?.removeEventListener('solve', onSolve);
      capWidget?.removeEventListener('reset', onReset);
    };
  });
</script>

<form method="POST" use:enhance class="contact-form">
  <div class="form-row">
    <div class="form-group">
      <label for="name">{m.form_first_name_label()} <span class="required">*</span></label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder={m.form_first_name_placeholder()}
        bind:value={$form.name}
        aria-invalid={!!$errors.name}
        required
      />
      {#if $errors.name}
        <p class="form-error">{translateFirstError($errors.name)}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="last_name">{m.form_last_name_label()} <span class="required">*</span></label>
      <input
        id="last_name"
        name="last_name"
        type="text"
        placeholder={m.form_last_name_placeholder()}
        bind:value={$form.last_name}
        aria-invalid={!!$errors.last_name}
        required
      />
      {#if $errors.last_name}
        <p class="form-error">{translateFirstError($errors.last_name)}</p>
      {/if}
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="phone">
        {m.form_phone_label()} <span class="required">*</span>
        <span
          class="tooltip-icon"
          title={m.form_phone_tooltip()}
          aria-label={m.form_phone_tooltip()}>ⓘ</span
        >
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        placeholder={m.form_phone_placeholder()}
        bind:value={$form.phone}
        aria-invalid={!!$errors.phone}
        title={m.form_phone_tooltip()}
        required
      />
      {#if $errors.phone}
        <p class="form-error">{translateFirstError($errors.phone)}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="email">
        {m.form_email_label()} <span class="required">*</span>
        <span
          class="tooltip-icon"
          title={m.form_email_tooltip()}
          aria-label={m.form_email_tooltip()}>ⓘ</span
        >
      </label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder={m.form_email_placeholder()}
        bind:value={$form.email}
        aria-invalid={!!$errors.email}
        title={m.form_email_tooltip()}
        required
      />
      {#if $errors.email}
        <p class="form-error">{translateFirstError($errors.email)}</p>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <label for="request_type">{m.form_request_type_label()}</label>
    <div class="radio-group">
      {#each REQUEST_TYPES as type (type)}
        <label class="radio-label">
          <input
            type="radio"
            name="request_type"
            value={type}
            bind:group={$form.request_type}
            class="radio-input"
          />
          {type === 'Bel mij terug' ? m.form_request_type_call_back() : m.form_request_type_email()}
        </label>
      {/each}
    </div>
    {#if $errors.request_type}
      <p class="form-error">{translateFirstError($errors.request_type)}</p>
    {/if}
  </div>

  <div class="form-group">
    <label for="description">{m.form_description_label()} <span class="required">*</span></label>
    <textarea
      id="description"
      name="description"
      placeholder={m.form_description_placeholder()}
      bind:value={$form.description}
      aria-invalid={!!$errors.description}
      rows={5}
      maxlength={2000}
      required
    ></textarea>
    {#if $errors.description}
      <p class="form-error">{translateFirstError($errors.description)}</p>
    {/if}
  </div>

  <div class="form-cap-submit-row">
    {#if apiEndpoint}
      <div class="form-group form-cap-group">
        <p class="form-label">{m.form_cap_label()}</p>
        <cap-widget bind:this={capWidget} data-cap-api-endpoint={apiEndpoint}></cap-widget>
        <input type="hidden" name="capToken" bind:value={$form.capToken} />
        {#if $errors.capToken}
          <p class="form-error">{translateFirstError($errors.capToken)}</p>
        {/if}
      </div>
    {:else}
      <div class="form-cap-group">
        <input type="hidden" name="capToken" value="disabled" />
      </div>
    {/if}
    <div class="form-submit-wrap">
      <button type="submit" class="form-submit" disabled={$submitting || !canSubmit}>
        {m.form_submit_contact()}
      </button>
    </div>
  </div>
</form>

<style>
  .contact-form {
    background-color: var(--color-bg-green-light);
    border-radius: 8px;
    padding: var(--spacing-form-padding);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 767px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .radio-group {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 400;
    cursor: pointer;
    font-size: var(--font-size-regular);
    color: var(--color-text-content);
  }

  .radio-input {
    width: auto;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    accent-color: var(--color-primary-300);
  }

  label,
  .form-label {
    font-weight: 600;
    font-size: var(--font-size-regular);
    color: var(--color-text-heading);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .tooltip-icon {
    font-size: 0.875rem;
    color: var(--color-primary-300);
    cursor: help;
    font-weight: 400;
    flex-shrink: 0;
  }

  .required {
    color: var(--color-error, #e74c3c);
    font-weight: 700;
  }

  input,
  textarea {
    font-family: var(--font-family);
    font-size: var(--font-size-regular);
    color: var(--color-text-content);
    border: 1px solid var(--color-border-light);
    border-radius: 4px;
    padding: 0.75rem 0.75rem;
    min-height: 50px;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
    background-color: white;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-primary-300);
  }

  input[aria-invalid='true'],
  textarea[aria-invalid='true'] {
    border-color: var(--color-error, #e74c3c);
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }

  .form-error {
    color: var(--color-error, #e74c3c);
    font-size: 0.9rem;
    margin: 0;
  }

  .form-cap-submit-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .form-cap-submit-row {
      flex-direction: row;
    }
  }

  .form-cap-group {
    flex: 1;
  }

  .form-submit-wrap {
    display: flex;
    align-items: flex-end;
    flex-shrink: 0;
  }

  .form-submit {
    font-family: var(--font-family);
    font-size: var(--font-size-button);
    font-weight: 700;
    background-color: var(--color-btn-primary);
    color: var(--color-text-white);
    border: none;
    border-radius: 3px;
    padding: 0.35em 1.2em;
    box-shadow: 0 4px 12px rgba(5, 168, 162, 0.3);
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      transform 0.1s ease;
  }

  .form-submit:hover:not(:disabled) {
    background-color: var(--color-btn-primary-hover);
    box-shadow: 0 6px 16px rgba(5, 168, 162, 0.4);
  }

  .form-submit:disabled {
    background-color: var(--color-border-light);
    color: var(--color-text-muted);
    box-shadow: none;
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
