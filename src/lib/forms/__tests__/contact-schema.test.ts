import { describe, it, expect } from 'vitest';
import { contactSchema } from '../contact-schema.js';

const validBase = {
  request_type: 'Bel mij terug' as const,
  name: 'Jan',
  last_name: 'de Vries',
  email: 'jan@example.nl',
  phone: '0612345678',
  description: 'Ik heb een vraag over mijn behandeling.',
  turnstileToken: 'token-abc',
};

describe('contactSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(contactSchema.safeParse(validBase).success).toBe(true);
  });

  it('accepts both request_type values', () => {
    for (const rt of ['Bel mij terug', 'Contact per email'] as const) {
      expect(contactSchema.safeParse({ ...validBase, request_type: rt }).success).toBe(true);
    }
  });

  it('rejects unknown request_type', () => {
    expect(
      contactSchema.safeParse({ ...validBase, request_type: 'Stuur mij een mail' }).success,
    ).toBe(false);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(contactSchema.safeParse({ ...validBase, name: 'J' }).success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    expect(contactSchema.safeParse({ ...validBase, name: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(contactSchema.safeParse({ ...validBase, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects phone with fewer than 10 digits', () => {
    expect(contactSchema.safeParse({ ...validBase, phone: '061234567' }).success).toBe(false);
  });

  it('rejects phone with more than 10 digits', () => {
    expect(contactSchema.safeParse({ ...validBase, phone: '06123456789' }).success).toBe(false);
  });

  it('rejects phone with non-numeric characters', () => {
    expect(contactSchema.safeParse({ ...validBase, phone: '061234567a' }).success).toBe(false);
  });

  it('accepts empty phone when request_type is "Contact per email"', () => {
    expect(
      contactSchema.safeParse({
        ...validBase,
        request_type: 'Contact per email',
        phone: '',
      }).success,
    ).toBe(true);
  });

  it('rejects empty phone when request_type is "Bel mij terug" (cross-field refine)', () => {
    expect(
      contactSchema.safeParse({ ...validBase, request_type: 'Bel mij terug', phone: '' }).success,
    ).toBe(false);
  });

  it('accepts exactly 2000-char description', () => {
    expect(contactSchema.safeParse({ ...validBase, description: 'a'.repeat(2000) }).success).toBe(
      true,
    );
  });

  it('rejects description longer than 2000 chars', () => {
    expect(contactSchema.safeParse({ ...validBase, description: 'a'.repeat(2001) }).success).toBe(
      false,
    );
  });

  it('rejects empty description', () => {
    expect(contactSchema.safeParse({ ...validBase, description: '' }).success).toBe(false);
  });

  it('rejects missing turnstileToken', () => {
    const rest = Object.fromEntries(
      Object.entries(validBase).filter(([k]) => k !== 'turnstileToken'),
    );
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty turnstileToken', () => {
    expect(contactSchema.safeParse({ ...validBase, turnstileToken: '' }).success).toBe(false);
  });

  it.each([
    ['request_type', undefined],
    ['name', undefined],
    ['email', undefined],
    ['description', undefined],
    ['turnstileToken', undefined],
  ])('rejects missing required field: %s', (field, value) => {
    const payload = { ...validBase, [field]: value };
    expect(contactSchema.safeParse(payload).success).toBe(false);
  });
});
