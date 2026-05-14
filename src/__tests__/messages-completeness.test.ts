import { describe, it, expect } from 'vitest';

import nlMessages from '../../messages/nl.json';
import deMessages from '../../messages/de.json';
import enMessages from '../../messages/en.json';

const SCHEMA_KEY = '$schema';

function userKeys(obj: Record<string, unknown>): string[] {
  return Object.keys(obj).filter((k) => k !== SCHEMA_KEY);
}

const nlKeys = userKeys(nlMessages as Record<string, unknown>);
const deKeys = userKeys(deMessages as Record<string, unknown>);
const enKeys = userKeys(enMessages as Record<string, unknown>);

describe('Paraglide messages completeness', () => {
  it('de has all keys from nl', () => {
    const missing = nlKeys.filter((k) => !deKeys.includes(k));
    expect(missing, `Keys in nl but missing from de: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('en has all keys from nl', () => {
    const missing = nlKeys.filter((k) => !enKeys.includes(k));
    expect(missing, `Keys in nl but missing from en: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('nl has all keys from de', () => {
    const missing = deKeys.filter((k) => !nlKeys.includes(k));
    expect(missing, `Keys in de but missing from nl: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('nl has all keys from en', () => {
    const missing = enKeys.filter((k) => !nlKeys.includes(k));
    expect(missing, `Keys in en but missing from nl: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('all locale files have the same key count', () => {
    expect(deKeys.length).toBe(nlKeys.length);
    expect(enKeys.length).toBe(nlKeys.length);
  });
});
