import { describe, it, expect } from 'vitest';
import { parseCsv, getPricing } from '../reimbursements.server.js';

describe('parseCsv', () => {
  it('returns an array', () => {
    const rows = parseCsv(`behandeling,prijs\nConsultatie,€ 50.00\nZoolmeting,€ 75.00\n`);
    expect(Array.isArray(rows)).toBe(true);
  });

  it('parses euro amounts into prijsRaw numbers', () => {
    const rows = parseCsv(`behandeling,prijs\nConsultatie,€ 50.00\nZoolmeting,€ 75.50\n`);
    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(typeof row.behandeling).toBe('string');
      expect(typeof row.prijs).toBe('string');
      expect(typeof row.prijsRaw).toBe('number');
    }
    expect(rows[0]!.prijsRaw).toBe(50);
    expect(rows[1]!.prijsRaw).toBe(75.5);
  });

  it('skips empty lines', () => {
    const rows = parseCsv(`behandeling,prijs\nConsultatie,€ 50.00\n\nZoolmeting,€ 75.50\n`);
    expect(rows.length).toBe(2);
  });

  it('skips rows without a comma (malformed)', () => {
    const rows = parseCsv(`behandeling,prijs\nConsultatie only no comma here\nZoolmeting,75\n`);
    expect(rows.length).toBe(1);
    expect(rows[0]!.behandeling).toBe('Zoolmeting');
  });

  it('handles non-euro price (NaN falls back to 0)', () => {
    const rows = parseCsv(`behandeling,prijs\nConsultatie,gratis\n`);
    expect(rows.length).toBe(1);
    expect(rows[0]!.prijsRaw).toBe(0);
  });
});

describe('getPricing (default env)', () => {
  it('returns a non-empty array using the default pricing file', () => {
    const rows = getPricing();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });
});
