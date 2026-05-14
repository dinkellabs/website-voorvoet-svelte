import { describe, it, expect } from 'vitest';
import { routeFor } from '$lib/i18n/route-map.js';
import type { PageKey, Lang } from '$lib/i18n/route-map.js';

describe('LanguageSwitcher — uses routeFor', () => {
  const pageKeys: PageKey[] = [
    'home',
    'information',
    'reimbursements',
    'contact',
    'order_insoles',
    'blog',
    'credits',
    'privacy_policy',
    'terms_conditions',
  ];

  const langs: Lang[] = ['nl', 'de', 'en'];

  it('routeFor produces unique paths per lang+page', () => {
    const paths = new Set<string>();
    for (const page of pageKeys) {
      for (const lang of langs) {
        const path = routeFor(page, lang);
        expect(paths.has(path)).toBe(false);
        paths.add(path);
      }
    }
  });

  it('routeFor nl home returns /nl', () => {
    expect(routeFor('home', 'nl')).toBe('/nl');
  });

  it('routeFor de reimbursements returns /de/erstattungen', () => {
    expect(routeFor('reimbursements', 'de')).toBe('/de/erstattungen');
  });

  it('routeFor en privacy_policy returns /en/privacy-policy', () => {
    expect(routeFor('privacy_policy', 'en')).toBe('/en/privacy-policy');
  });

  it('routeFor terms_conditions differs per language', () => {
    const nl = routeFor('terms_conditions', 'nl');
    const de = routeFor('terms_conditions', 'de');
    const en = routeFor('terms_conditions', 'en');
    expect(nl).not.toBe(de);
    expect(de).not.toBe(en);
    expect(nl).not.toBe(en);
  });
});
