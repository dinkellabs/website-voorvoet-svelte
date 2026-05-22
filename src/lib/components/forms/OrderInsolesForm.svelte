<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client as zodClient } from 'sveltekit-superforms/adapters';
  import type { SuperValidated } from 'sveltekit-superforms';
  import { env } from '$env/dynamic/public';
  import { orderSchema, INSOLE_TYPES } from '$lib/forms/order-schema.js';
  import type { OrderFormData } from '$lib/forms/order-schema.js';
  import type { FormFailureData } from '$lib/forms/action-results.js';
  import { capWidgetI18nProps } from '$lib/forms/cap-widget-i18n.js';
  import { translateFirstError } from '$lib/forms/error-messages.js';
  import { localizedValidity } from '$lib/forms/localized-validity.js';
  import { toast } from '$lib/stores/toast.svelte.js';
  import * as m from '$lib/paraglide/messages.js';

  interface Props {
    data: SuperValidated<OrderFormData>;
  }

  let { data }: Props = $props();

  let submitAttempted = $state(false);

  const { form, errors, enhance, submitting, allErrors } = superForm(data, {
    validators: zodClient(orderSchema),
    onSubmit() {
      submitAttempted = true;
    },
    onResult({ result }) {
      if (result.type === 'success') {
        toast.show({ kind: 'success', message: m.toast_order_success() });
      } else if (result.type === 'failure') {
        const code = (result.data as FormFailureData | undefined)?.code;
        if (code === 'cap_failed') {
          toast.show({ kind: 'error', message: m.toast_cap_error() });
        } else {
          toast.show({ kind: 'error', message: m.toast_order_error() });
        }
      } else if (result.type === 'error') {
        toast.show({ kind: 'error', message: m.toast_order_error() });
      }
    },
  });

  const apiEndpoint = env.PUBLIC_CAP_API_ENDPOINT ?? '';
  const capEnabled = (env.PUBLIC_CAP_ENABLED ?? '').toLowerCase() === 'true';
  // Render the widget only when the server is configured to enforce Cap.
  // On dev (PUBLIC_CAP_ENABLED=false), rendering a widget that points at a
  // server with CAP_ENABLED=false would 404 /api/cap/challenge and trap the
  // user on a permanent "Error. Try again." → "Verificatie is vereist".
  const showCapWidget = capEnabled && !!apiEndpoint;

  if (!showCapWidget && !$form.capToken) {
    $form.capToken = 'disabled';
  }

  let capWidget: HTMLElement | undefined = $state();

  onMount(() => {
    if (!capWidget || !showCapWidget) return;
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

  const insoleTypeLabels: Record<string, string> = {
    'Dagelijkse zolen': m.form_insole_type_daily(),
    Sportzolen: m.form_insole_type_sport(),
    'Zolen voor werkschoenen': m.form_insole_type_work(),
  };

  // Show a one-line "form isn't complete" hint after a failed submit
  // attempt. The button itself stays enabled — earlier we gated it on
  // a hidden safeParse, which made the page look broken to users who
  // missed a radio or used an unsupported date separator. Inline
  // $errors and HTML5 `required` still surface per-field problems.
  const showErrorSummary = $derived(submitAttempted && $allErrors.length > 0);
</script>

<form method="POST" use:enhance class="order-form">
  <div class="form-row">
    <div class="form-group">
      <label for="first_name">{m.form_first_name_label()} <span class="required">*</span></label>
      <input
        id="first_name"
        name="first_name"
        type="text"
        required
        placeholder={m.form_first_name_placeholder()}
        bind:value={$form.first_name}
        aria-invalid={!!$errors.first_name}
        use:localizedValidity={{ valueMissing: m.validation_required() }}
      />
      {#if $errors.first_name}
        <p class="form-error">{translateFirstError($errors.first_name)}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="last_name">{m.form_last_name_label()} <span class="required">*</span></label>
      <input
        id="last_name"
        name="last_name"
        type="text"
        required
        placeholder={m.form_last_name_placeholder()}
        bind:value={$form.last_name}
        aria-invalid={!!$errors.last_name}
        use:localizedValidity={{ valueMissing: m.validation_required() }}
      />
      {#if $errors.last_name}
        <p class="form-error">{translateFirstError($errors.last_name)}</p>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <label for="email">{m.form_email_label()} <span class="required">*</span></label>
    <input
      id="email"
      name="email"
      type="email"
      required
      placeholder={m.form_email_placeholder()}
      bind:value={$form.email}
      aria-invalid={!!$errors.email}
      title={m.form_email_tooltip_order()}
      use:localizedValidity={{
        valueMissing: m.validation_required(),
        typeMismatch: m.validation_email_invalid(),
      }}
    />
    {#if $errors.email}
      <p class="form-error">{translateFirstError($errors.email)}</p>
    {/if}
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="birth_date">{m.form_birth_date_label()} <span class="required">*</span></label>
      <input
        id="birth_date"
        name="birth_date"
        type="text"
        required
        placeholder={m.form_birth_date_placeholder()}
        bind:value={$form.birth_date}
        aria-invalid={!!$errors.birth_date}
        title={m.form_birth_date_tooltip()}
        use:localizedValidity={{ valueMissing: m.validation_required() }}
      />
      {#if $errors.birth_date}
        <p class="form-error">{translateFirstError($errors.birth_date)}</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="quantity">{m.form_quantity_label()}</label>
      <select
        id="quantity"
        name="quantity"
        bind:value={$form.quantity}
        aria-invalid={!!$errors.quantity}
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
      </select>
      {#if $errors.quantity}
        <p class="form-error">{translateFirstError($errors.quantity)}</p>
      {/if}
    </div>
  </div>

  <div class="form-group">
    <span class="form-label">{m.form_insole_type_label()}</span>
    <div class="radio-group" role="group" aria-label={m.form_insole_type_label()}>
      {#each INSOLE_TYPES as type (type)}
        <label class="radio-label">
          <input
            type="radio"
            name="insole_type"
            value={type}
            bind:group={$form.insole_type}
            class="radio-input"
          />
          {insoleTypeLabels[type] ?? type}
        </label>
      {/each}
    </div>
    {#if $errors.insole_type}
      <p class="form-error">{translateFirstError($errors.insole_type)}</p>
    {/if}
  </div>

  <div class="form-group">
    <label for="notes">{m.form_comments_label()}</label>
    <textarea
      id="notes"
      name="notes"
      placeholder={m.form_comments_placeholder()}
      bind:value={$form.notes}
      aria-invalid={!!$errors.notes}
      rows={4}
      maxlength={1000}
    ></textarea>
    {#if $errors.notes}
      <p class="form-error">{translateFirstError($errors.notes)}</p>
    {/if}
  </div>

  {#if showCapWidget}
    <div class="form-group">
      <p class="form-label">{m.form_cap_label()}</p>
      <cap-widget
        bind:this={capWidget}
        data-cap-api-endpoint={apiEndpoint}
        {...capWidgetI18nProps()}
      ></cap-widget>
      <input type="hidden" name="capToken" bind:value={$form.capToken} />
      {#if $errors.capToken}
        <p class="form-error">{translateFirstError($errors.capToken)}</p>
      {/if}
    </div>
  {:else}
    <input type="hidden" name="capToken" value="disabled" />
  {/if}

  {#if showErrorSummary}
    <p class="form-summary form-summary--error" role="alert" aria-live="polite">
      {m.form_errors_summary()}
    </p>
  {/if}

  <div class="form-submit-row">
    <button type="submit" class="form-submit" disabled={$submitting}>
      {m.form_submit_order_insoles()}
    </button>
  </div>
</form>

<style>
  .order-form {
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

  @media (max-width: 640px) {
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
    gap: 1rem 1.5rem;
    flex-wrap: wrap;
  }

  @media (max-width: 640px) {
    .radio-group {
      flex-direction: column;
      gap: 0.5rem;
    }
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
  }

  .required {
    color: var(--color-error, #e74c3c);
    font-weight: 700;
  }

  input,
  select,
  textarea {
    font-family: var(--font-family);
    font-size: var(--font-size-regular);
    line-height: 1.5;
    color: var(--color-text-content);
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
    background-color: white;
  }

  /* UA stylesheets add their own chrome to <select> (Safari ~4px taller
     than <input> at the same padding). Strip the native appearance and
     paint a custom caret so select height matches inputs. */
  select {
    appearance: none;
    -webkit-appearance: none;
    background-image:
      url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3e%3cpath fill='none' stroke='%23555' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M1 1.5l5 5 5-5'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 0.75rem auto;
    padding-right: 2.25rem;
  }

  input:focus,
  select:focus,
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
    min-height: 100px;
  }

  .form-error {
    color: var(--color-error, #e74c3c);
    font-size: 0.9rem;
    margin: 0;
  }

  .form-summary--error {
    color: var(--color-error, #e74c3c);
    background-color: rgba(231, 76, 60, 0.08);
    border-left: 3px solid var(--color-error, #e74c3c);
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-regular);
    margin: 0;
  }

  .form-submit-row {
    display: flex;
    justify-content: flex-end;
  }

  .form-submit {
    font-family: var(--font-family);
    font-size: var(--font-size-button);
    font-weight: 700;
    background-color: var(--color-btn-primary);
    color: var(--color-text-white);
    border: none;
    border-radius: 3px;
    padding: 0.1em 0.8em;
    box-shadow: 0 4px 12px rgba(5, 168, 162, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;
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
