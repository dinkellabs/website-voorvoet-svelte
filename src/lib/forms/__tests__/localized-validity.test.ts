import { describe, it, expect } from 'vitest';
import { localizedValidity } from '../localized-validity.js';

function makeInput(attrs: Partial<HTMLInputElement> = {}): HTMLInputElement {
  const input = document.createElement('input');
  Object.assign(input, { type: 'text', ...attrs });
  document.body.appendChild(input);
  return input;
}

describe('localizedValidity', () => {
  it('sets the custom valueMissing message when an empty required field is checked', () => {
    const input = makeInput({ required: true });
    localizedValidity(input, { valueMissing: 'Dit veld is verplicht' });

    // Touch the input by triggering checkValidity — the browser fires the
    // `invalid` event synchronously when the field is empty + required.
    input.checkValidity();
    expect(input.validationMessage).toBe('Dit veld is verplicht');
  });

  it('sets the custom typeMismatch message for an invalid email', () => {
    const input = makeInput({ type: 'email', value: 'not-an-email' });
    localizedValidity(input, {
      valueMissing: 'Verplicht',
      typeMismatch: 'Vul een geldig e-mailadres in',
    });

    input.checkValidity();
    expect(input.validationMessage).toBe('Vul een geldig e-mailadres in');
  });

  it('clears the custom message once the user starts typing again', () => {
    const input = makeInput({ required: true });
    localizedValidity(input, { valueMissing: 'Verplicht' });

    input.checkValidity();
    expect(input.validationMessage).toBe('Verplicht');

    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    expect(input.validationMessage).toBe('');
  });

  it('returns to default browser behaviour after destroy()', () => {
    const input = makeInput({ required: true });
    const action = localizedValidity(input, { valueMissing: 'Custom NL' });

    input.checkValidity();
    expect(input.validationMessage).toBe('Custom NL');

    action.destroy();
    // Clear stale custom validity from the first check before re-evaluating.
    input.setCustomValidity('');
    input.checkValidity();
    // After destroy the action no longer listens, so the browser default takes over.
    expect(input.validationMessage).not.toBe('Custom NL');
  });
});
