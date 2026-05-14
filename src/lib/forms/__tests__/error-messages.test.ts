import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/paraglide/messages.js', () => ({
  validation_email_invalid: () => 'email_invalid_msg',
  validation_phone_invalid: () => 'phone_invalid_msg',
  validation_phone_required_for_callback: () => 'phone_required_msg',
  validation_birth_date_invalid: () => 'birth_date_invalid_msg',
  validation_turnstile_required: () => 'turnstile_required_msg',
  validation_quantity_invalid: () => 'quantity_invalid_msg',
  validation_required: () => 'required_msg',
  validation_max_length: ({ max }: { max: string }) => `max_length_msg(${max})`,
  validation_generic: () => 'generic_msg',
}));

import { translateFormError, translateFirstError } from '../error-messages.js';

describe('translateFormError', () => {
  it('returns empty string when code is undefined', () => {
    expect(translateFormError(undefined)).toBe('');
  });

  it.each([
    ['email_invalid', 'email_invalid_msg'],
    ['phone_invalid', 'phone_invalid_msg'],
    ['phone_required_for_callback', 'phone_required_msg'],
    ['birth_date_invalid', 'birth_date_invalid_msg'],
    ['turnstile_required', 'turnstile_required_msg'],
    ['quantity_invalid', 'quantity_invalid_msg'],
  ])('maps %s', (code, expected) => {
    expect(translateFormError(code)).toBe(expected);
  });

  it.each([
    'name_too_short',
    'last_name_too_short',
    'first_name_required',
    'last_name_required',
    'description_required',
  ])('maps %s → required_msg', (code) => {
    expect(translateFormError(code)).toBe('required_msg');
  });

  it.each([
    'name_too_long',
    'last_name_too_long',
    'first_name_too_long',
    'description_too_long',
    'notes_too_long',
  ])('maps %s → max_length_msg(N/A)', (code) => {
    expect(translateFormError(code)).toBe('max_length_msg(N/A)');
  });

  it('falls back to generic_msg for unknown codes', () => {
    expect(translateFormError('something_else_entirely')).toBe('generic_msg');
  });
});

describe('translateFirstError', () => {
  it('returns empty string for undefined errors', () => {
    expect(translateFirstError(undefined)).toBe('');
  });

  it('returns empty string for empty array', () => {
    expect(translateFirstError([])).toBe('');
  });

  it('translates only the first error', () => {
    expect(translateFirstError(['email_invalid', 'phone_invalid'])).toBe('email_invalid_msg');
  });
});
