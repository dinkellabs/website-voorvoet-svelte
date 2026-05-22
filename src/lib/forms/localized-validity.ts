/**
 * Svelte action: override the browser's English HTML5 validation tooltips
 * ("Please fill out this field", "Please include an '@' in the email address")
 * with locale-aware messages compiled by Paraglide.
 *
 * The browser-native tooltip uses the user's *UI* locale, not the document's
 * `lang` attribute, so a Dutch visitor running an English Chrome sees the
 * popup in English unless we hand it our own string via `setCustomValidity`.
 *
 * Usage in a Svelte 5 component:
 *
 *   <input
 *     use:localizedValidity={{
 *       valueMissing: m.validation_required(),
 *       typeMismatch: m.validation_email_invalid(),
 *     }}
 *   />
 *
 * Pass the strings already translated — the action stays i18n-library-agnostic.
 */

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface LocalizedValidityMessages {
  /** Shown when the field is `required` and empty. */
  valueMissing?: string;
  /** Shown when the input value doesn't match its `type` (e.g. type=email). */
  typeMismatch?: string;
  /** Shown when the input value doesn't match its `pattern=` attribute. */
  patternMismatch?: string;
}

export function localizedValidity(node: ValidatableElement, messages: LocalizedValidityMessages) {
  let current: LocalizedValidityMessages = messages;

  const applyValidity = () => {
    if (node.validity.valueMissing && current.valueMissing) {
      node.setCustomValidity(current.valueMissing);
    } else if (node.validity.typeMismatch && current.typeMismatch) {
      node.setCustomValidity(current.typeMismatch);
    } else if (node.validity.patternMismatch && current.patternMismatch) {
      node.setCustomValidity(current.patternMismatch);
    } else {
      node.setCustomValidity('');
    }
  };

  // Clear on input so the browser re-evaluates against the schema, then
  // re-apply on the next `invalid` event if the field is still bad.
  const onInput = () => node.setCustomValidity('');

  node.addEventListener('invalid', applyValidity);
  node.addEventListener('input', onInput);

  return {
    update(next: LocalizedValidityMessages) {
      current = next;
    },
    destroy() {
      node.removeEventListener('invalid', applyValidity);
      node.removeEventListener('input', onInput);
    },
  };
}
