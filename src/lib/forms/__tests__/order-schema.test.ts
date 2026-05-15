import { describe, it, expect } from 'vitest';
import { orderSchema } from '../order-schema.js';

const validBase = {
  first_name: 'Jan',
  last_name: 'de Vries',
  email: 'jan@example.nl',
  phone: '0612345678',
  birth_date: '01-01-1980',
  insole_type: 'Dagelijkse zolen' as const,
  quantity: 1,
  notes: '',
  capToken: 'token-abc',
};

describe('orderSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(orderSchema.safeParse(validBase).success).toBe(true);
  });

  it('accepts all three insole types', () => {
    for (const type of ['Dagelijkse zolen', 'Sportzolen', 'Zolen voor werkschoenen'] as const) {
      expect(orderSchema.safeParse({ ...validBase, insole_type: type }).success).toBe(true);
    }
  });

  it('rejects unknown insole type', () => {
    expect(orderSchema.safeParse({ ...validBase, insole_type: 'Onbekend type' }).success).toBe(
      false,
    );
  });

  it('rejects empty first_name', () => {
    expect(orderSchema.safeParse({ ...validBase, first_name: '' }).success).toBe(false);
  });

  it('rejects first_name longer than 50 chars', () => {
    expect(orderSchema.safeParse({ ...validBase, first_name: 'a'.repeat(51) }).success).toBe(false);
  });

  it('rejects empty last_name', () => {
    expect(orderSchema.safeParse({ ...validBase, last_name: '' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(orderSchema.safeParse({ ...validBase, email: 'not-valid' }).success).toBe(false);
  });

  it('rejects phone with 9 digits', () => {
    expect(orderSchema.safeParse({ ...validBase, phone: '061234567' }).success).toBe(false);
  });

  it('rejects phone with 11 digits', () => {
    expect(orderSchema.safeParse({ ...validBase, phone: '06123456789' }).success).toBe(false);
  });

  it('rejects non-numeric phone', () => {
    expect(orderSchema.safeParse({ ...validBase, phone: '061234567a' }).success).toBe(false);
  });

  it('accepts empty phone string', () => {
    expect(orderSchema.safeParse({ ...validBase, phone: '' }).success).toBe(true);
  });

  it('rejects invalid birth_date format', () => {
    expect(orderSchema.safeParse({ ...validBase, birth_date: '1980-01-01' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...validBase, birth_date: '01/01/1980' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...validBase, birth_date: '1-1-1980' }).success).toBe(false);
  });

  it('accepts valid birth_date DD-MM-YYYY', () => {
    expect(orderSchema.safeParse({ ...validBase, birth_date: '31-12-1999' }).success).toBe(true);
  });

  it('accepts quantity 1, 2, 3', () => {
    for (const q of [1, 2, 3]) {
      expect(orderSchema.safeParse({ ...validBase, quantity: q }).success).toBe(true);
    }
  });

  it('rejects quantity 0', () => {
    expect(orderSchema.safeParse({ ...validBase, quantity: 0 }).success).toBe(false);
  });

  it('rejects quantity 4', () => {
    expect(orderSchema.safeParse({ ...validBase, quantity: 4 }).success).toBe(false);
  });

  it('accepts notes up to 1000 chars', () => {
    expect(orderSchema.safeParse({ ...validBase, notes: 'a'.repeat(1000) }).success).toBe(true);
  });

  it('rejects notes longer than 1000 chars', () => {
    expect(orderSchema.safeParse({ ...validBase, notes: 'a'.repeat(1001) }).success).toBe(false);
  });

  it('treats omitted notes as empty string', () => {
    const rest = Object.fromEntries(Object.entries(validBase).filter(([k]) => k !== 'notes'));
    const result = orderSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe('');
    }
  });

  it('rejects empty capToken', () => {
    expect(orderSchema.safeParse({ ...validBase, capToken: '' }).success).toBe(false);
  });
});
