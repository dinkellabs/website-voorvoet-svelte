import { describe, it, expect } from 'vitest';
import { getReimbursements } from '../reimbursements.server.js';
import reimbursementsRaw from '../reimbursements_2026.json';

describe('reimbursements data', () => {
  it('JSON file parses to an array', () => {
    expect(Array.isArray(reimbursementsRaw)).toBe(true);
  });

  it('first header row is filtered out by getReimbursements', () => {
    const rows = getReimbursements();
    for (const row of rows) {
      expect(row.verzekeraar).not.toBe('Verzekeraar');
    }
  });

  it('returns at least one row', () => {
    expect(getReimbursements().length).toBeGreaterThan(0);
  });

  it('each row has verzekeraar, pakket, vergoeding', () => {
    const rows = getReimbursements();
    for (const row of rows) {
      expect(typeof row.verzekeraar).toBe('string');
      expect(typeof row.pakket).toBe('string');
      expect(typeof row.vergoeding).toBe('string');
    }
  });
});
