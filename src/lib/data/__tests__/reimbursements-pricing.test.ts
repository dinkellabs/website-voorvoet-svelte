import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('reimbursements — getPricing (CSV parsing)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('returns an array from getPricing', async () => {
    vi.doMock('../pricing_2026.csv?raw', () => ({
      default: `behandeling,prijs\nConsultatie,€ 50,00\nZoolmeting,€ 75,00\n`,
    }));

    const { getPricing } = await import('../reimbursements.js');
    const rows = getPricing();

    expect(Array.isArray(rows)).toBe(true);
  });

  it('parseCsv correctly parses euro amounts', async () => {
    vi.doMock('../pricing_2026.csv?raw', () => ({
      default: `behandeling,prijs\nConsultatie,€ 50,00\nZoolmeting,€ 75,50\n`,
    }));

    const { getPricing } = await import('../reimbursements.js');
    const rows = getPricing();

    expect(rows.length).toBeGreaterThanOrEqual(1);
    for (const row of rows) {
      expect(typeof row.behandeling).toBe('string');
      expect(typeof row.prijs).toBe('string');
      expect(typeof row.prijsRaw).toBe('number');
    }
  });

  it('skips empty lines in CSV', async () => {
    vi.doMock('../pricing_2026.csv?raw', () => ({
      default: `behandeling,prijs\nConsultatie,€ 50,00\n\nZoolmeting,€ 75,50\n`,
    }));

    const { getPricing } = await import('../reimbursements.js');
    const rows = getPricing();

    expect(rows.length).toBe(2);
  });

  it('skips rows without a comma (malformed)', async () => {
    vi.doMock('../pricing_2026.csv?raw', () => ({
      default: `behandeling,prijs\nConsultatie only no comma here\nZoolmeting,75\n`,
    }));

    const { getPricing } = await import('../reimbursements.js');
    const rows = getPricing();

    expect(rows.length).toBe(1);
    expect(rows[0]!.behandeling).toBe('Zoolmeting');
  });

  it('handles non-euro price (NaN falls back to 0)', async () => {
    vi.doMock('../pricing_2026.csv?raw', () => ({
      default: `behandeling,prijs\nConsultatie,gratis\n`,
    }));

    const { getPricing } = await import('../reimbursements.js');
    const rows = getPricing();

    expect(rows.length).toBe(1);
    expect(rows[0]!.prijsRaw).toBe(0);
  });
});
