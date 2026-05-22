import { describe, it, expect } from 'vitest';
import { capWidgetI18nProps } from '../cap-widget-i18n.js';

describe('capWidgetI18nProps', () => {
  it('produces all 12 data-cap-i18n-* attributes the widget reads', () => {
    // Mirrors `getI18nText(...)` call sites in cap-widget@0.1.52/src/cap.js.
    // If cap-widget adds a key in a future major, the user-visible default
    // would silently leak through in English — this is the canary.
    const expectedKeys = [
      'data-cap-i18n-initial-state',
      'data-cap-i18n-verifying-label',
      'data-cap-i18n-solved-label',
      'data-cap-i18n-error-label',
      'data-cap-i18n-required-label',
      'data-cap-i18n-troubleshooting-label',
      'data-cap-i18n-wasm-disabled',
      'data-cap-i18n-group-aria-label',
      'data-cap-i18n-verify-aria-label',
      'data-cap-i18n-verifying-aria-label',
      'data-cap-i18n-verified-aria-label',
      'data-cap-i18n-error-aria-label',
    ];
    const props = capWidgetI18nProps();
    expect(Object.keys(props).sort()).toEqual([...expectedKeys].sort());
  });

  it('returns non-empty strings for every key', () => {
    const props = capWidgetI18nProps();
    for (const [key, value] of Object.entries(props)) {
      expect(value, `${key} should not be empty`).toBeTruthy();
      expect(typeof value).toBe('string');
    }
  });
});
