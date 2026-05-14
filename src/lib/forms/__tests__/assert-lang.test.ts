import { describe, it, expect } from 'vitest';
import { assertLangForSlug } from '../assert-lang.js';

describe('assertLangForSlug', () => {
  it('does not throw for correct nl/contact', () => {
    expect(() => assertLangForSlug('nl', 'contact', 'contact')).not.toThrow();
  });

  it('does not throw for correct de/kontakt', () => {
    expect(() => assertLangForSlug('de', 'contact', 'kontakt')).not.toThrow();
  });

  it('does not throw for correct en/contact', () => {
    expect(() => assertLangForSlug('en', 'contact', 'contact')).not.toThrow();
  });

  it('does not throw for correct nl/zolen-bestellen', () => {
    expect(() => assertLangForSlug('nl', 'order_insoles', 'zolen-bestellen')).not.toThrow();
  });

  it('does not throw for correct de/einlagen-bestellen', () => {
    expect(() => assertLangForSlug('de', 'order_insoles', 'einlagen-bestellen')).not.toThrow();
  });

  it('throws 404 when slug does not match lang (de tries contact)', () => {
    let errorThrown: { status: number } | null = null;
    try {
      assertLangForSlug('de', 'contact', 'contact');
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });

  it('throws 404 when slug does not match lang (nl tries kontakt)', () => {
    let errorThrown: { status: number } | null = null;
    try {
      assertLangForSlug('nl', 'contact', 'kontakt');
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });

  it('throws 404 for unknown lang', () => {
    let errorThrown: { status: number } | null = null;
    try {
      assertLangForSlug('xx', 'contact', 'contact');
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        errorThrown = err as { status: number };
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown!.status).toBe(404);
  });
});
