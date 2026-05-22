/**
 * Localized attribute bag for the <cap-widget> custom element.
 *
 * The widget reads its visible + ARIA strings from `data-cap-i18n-<key>`
 * attributes (see `src/cap.js:getI18nText` in the cap-widget npm package).
 * Without those attributes a Dutch / German visitor sees English defaults
 * like "Verify you're human" / "Error. Try again." over an otherwise
 * Dutch/German form.
 *
 * Spread the return value onto the element:
 *
 *   <cap-widget
 *     bind:this={capWidget}
 *     data-cap-api-endpoint={apiEndpoint}
 *     {...capWidgetI18nProps()}
 *   ></cap-widget>
 *
 * The function is evaluated at render time, so Paraglide resolves each
 * message in the active request locale.
 */

import * as m from '$lib/paraglide/messages.js';

export function capWidgetI18nProps(): Record<string, string> {
  return {
    // Visible labels — what the user sees on the widget itself.
    'data-cap-i18n-initial-state': m.cap_initial_state(),
    'data-cap-i18n-verifying-label': m.cap_verifying_label(),
    'data-cap-i18n-solved-label': m.cap_solved_label(),
    'data-cap-i18n-error-label': m.cap_error_label(),
    'data-cap-i18n-required-label': m.cap_required_label(),
    'data-cap-i18n-troubleshooting-label': m.cap_troubleshooting_label(),
    'data-cap-i18n-wasm-disabled': m.cap_wasm_disabled(),
    // ARIA labels — read by screen readers; same i18n discipline applies.
    'data-cap-i18n-group-aria-label': m.cap_group_aria_label(),
    'data-cap-i18n-verify-aria-label': m.cap_verify_aria_label(),
    'data-cap-i18n-verifying-aria-label': m.cap_verifying_aria_label(),
    'data-cap-i18n-verified-aria-label': m.cap_verified_aria_label(),
    'data-cap-i18n-error-aria-label': m.cap_error_aria_label(),
  };
}
