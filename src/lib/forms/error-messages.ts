import * as m from '$lib/paraglide/messages.js';

/**
 * Schemas emit stable codes (e.g. `phone_invalid`) instead of localized
 * strings so that NL/DE/EN visitors see the validation error in their own
 * language. Map a code to the matching Paraglide message at render time.
 */
export function translateFormError(code: string | undefined): string {
  if (!code) return '';
  switch (code) {
    case 'email_invalid':
      return m.validation_email_invalid();
    case 'phone_invalid':
      return m.validation_phone_invalid();
    case 'phone_required_for_callback':
      return m.validation_phone_required_for_callback();
    case 'birth_date_invalid':
      return m.validation_birth_date_invalid();
    case 'birth_date_unreal':
      return m.validation_birth_date_unreal();
    case 'birth_date_out_of_range':
      return m.validation_birth_date_out_of_range({ min: 4, max: 120 });
    case 'cap_required':
      return m.validation_cap_required();
    case 'quantity_invalid':
      return m.validation_quantity_invalid();
    case 'name_too_short':
    case 'last_name_too_short':
    case 'first_name_required':
    case 'last_name_required':
    case 'description_required':
      return m.validation_required();
    case 'name_too_long':
    case 'last_name_too_long':
    case 'first_name_too_long':
    case 'description_too_long':
    case 'notes_too_long':
      return m.validation_max_length({ max: 'N/A' });
    default:
      return m.validation_generic();
  }
}

/**
 * Translates an array of error strings (as superforms emits) — returns the
 * first translated message, or empty string if none.
 */
export function translateFirstError(errors: string[] | undefined): string {
  return translateFormError(errors?.[0]);
}
