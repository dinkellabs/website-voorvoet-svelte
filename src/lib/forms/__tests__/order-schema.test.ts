import { describe, it, expect } from 'vitest';
import { orderSchema } from '../order-schema.js';

const validBase = {
  first_name: 'Jan',
  last_name: 'de Vries',
  email: 'jan@example.nl',
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

  it('defaults insole_type to Dagelijkse zolen when omitted', () => {
    const rest = Object.fromEntries(Object.entries(validBase).filter(([k]) => k !== 'insole_type'));
    const result = orderSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.insole_type).toBe('Dagelijkse zolen');
    }
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

  it('rejects clearly invalid birth_date strings', () => {
    expect(orderSchema.safeParse({ ...validBase, birth_date: '1980-01-01' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...validBase, birth_date: 'not-a-date' }).success).toBe(false);
    expect(orderSchema.safeParse({ ...validBase, birth_date: '' }).success).toBe(false);
  });

  it('rejects impossible days/months with the birth_date_unreal code', () => {
    // The pre-fix regex (`/^\d{2}-\d{2}-\d{4}$/`) would accept all of these.
    for (const input of ['45-05-1982', '30-02-1990', '31-04-1990', '00-01-1990', '15-13-1990']) {
      const result = orderSchema.safeParse({ ...validBase, birth_date: input });
      expect(result.success, `expected ${input} to be rejected`).toBe(false);
      if (!result.success) {
        const codes = result.error.issues.map((i) => i.message);
        expect(codes, `expected ${input} -> birth_date_unreal`).toContain('birth_date_unreal');
      }
    }
  });

  it('accepts leap-day in a leap year and rejects it in a non-leap year', () => {
    expect(orderSchema.safeParse({ ...validBase, birth_date: '29-02-2000' }).success).toBe(true);
    const nonLeap = orderSchema.safeParse({ ...validBase, birth_date: '29-02-2001' });
    expect(nonLeap.success).toBe(false);
    if (!nonLeap.success) {
      expect(nonLeap.error.issues.map((i) => i.message)).toContain('birth_date_unreal');
    }
  });

  it('rejects birth dates outside the 4–120 year age range', () => {
    // Yesterday → age 0 → fails min
    const today = new Date();
    const tooYoung = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const tooYoungStr = `${String(tooYoung.getDate()).padStart(2, '0')}-${String(tooYoung.getMonth() + 1).padStart(2, '0')}-${tooYoung.getFullYear()}`;
    const young = orderSchema.safeParse({ ...validBase, birth_date: tooYoungStr });
    expect(young.success).toBe(false);
    if (!young.success) {
      expect(young.error.issues.map((i) => i.message)).toContain('birth_date_out_of_range');
    }

    // 150 years ago → fails max
    const tooOld = `01-01-${today.getFullYear() - 150}`;
    const old = orderSchema.safeParse({ ...validBase, birth_date: tooOld });
    expect(old.success).toBe(false);
    if (!old.success) {
      expect(old.error.issues.map((i) => i.message)).toContain('birth_date_out_of_range');
    }
  });

  it('accepts canonical birth_date DD-MM-YYYY', () => {
    expect(orderSchema.safeParse({ ...validBase, birth_date: '31-12-1999' }).success).toBe(true);
  });

  it('accepts single-digit day and month with dash separator', () => {
    const result = orderSchema.safeParse({ ...validBase, birth_date: '1-1-1980' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.birth_date).toBe('01-01-1980');
    }
  });

  it('accepts slash and dot separators and normalises to dashes', () => {
    for (const input of ['01/01/1980', '1/1/1980', '01.01.1980', '1.1.1980']) {
      const result = orderSchema.safeParse({ ...validBase, birth_date: input });
      expect(result.success, `expected ${input} to be accepted`).toBe(true);
      if (result.success) {
        expect(result.data.birth_date).toBe('01-01-1980');
      }
    }
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

  it('does not declare a phone field', () => {
    const result = orderSchema.safeParse({ ...validBase, phone: '0612345678' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('phone' in result.data).toBe(false);
    }
  });
});
