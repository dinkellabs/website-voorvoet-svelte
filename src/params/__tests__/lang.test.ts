import { describe, it, expect } from 'vitest';
import { match } from '../lang.js';

describe('[lang=lang] param matcher', () => {
  it.each(['nl', 'de', 'en'])('accepts %s', (lang) => {
    expect(match(lang)).toBe(true);
  });

  it.each(['fr', 'NL', 'nl/', '', 'nlnl', 'nl-be', 'en;', 'enen'])('rejects %s', (bad) => {
    expect(match(bad)).toBe(false);
  });
});
