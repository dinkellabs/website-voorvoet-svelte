import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: {
    SITE_URL: 'https://voorvoet.nl',
  },
}));

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

import { buildMeta } from '../meta.js';
import { buildAlternates } from '../alternates.js';

describe('buildMeta', () => {
  it('returns correct title for nl home', () => {
    const meta = buildMeta({
      pageKey: 'home',
      lang: 'nl',
      url: 'https://voorvoet.nl/nl',
    });
    expect(meta.title).toBe('Podotherapeut Enschede - Voetklachten Behandelen | VoorVoet');
  });

  it('returns correct canonical', () => {
    const url = 'https://voorvoet.nl/nl/blog';
    const meta = buildMeta({ pageKey: 'blog', lang: 'nl', url });
    expect(meta.canonical).toBe(url);
  });

  it('has all required OG fields', () => {
    const meta = buildMeta({
      pageKey: 'contact',
      lang: 'en',
      url: 'https://voorvoet.nl/en/contact',
    });
    expect(meta.og.title).toBeTruthy();
    expect(meta.og.description).toBeTruthy();
    expect(meta.og.image).toBeTruthy();
    expect(meta.og.locale).toBe('en_US');
    expect(meta.og.type).toBe('website');
  });

  it('twitter card is summary_large_image', () => {
    const meta = buildMeta({
      pageKey: 'home',
      lang: 'de',
      url: 'https://voorvoet.nl/de',
    });
    expect(meta.twitter.card).toBe('summary_large_image');
  });
});

describe('buildAlternates', () => {
  it('includes all 3 language variants', () => {
    const alternates = buildAlternates('home');
    const langs = alternates.map((a) => a.lang);
    expect(langs).toContain('nl');
    expect(langs).toContain('de');
    expect(langs).toContain('en');
  });

  it('includes x-default pointing to nl', () => {
    const alternates = buildAlternates('home');
    const xDefault = alternates.find((a) => a.lang === 'x-default');
    expect(xDefault).toBeDefined();
    expect(xDefault!.href).toContain('/nl');
  });

  it('returns 4 entries (3 langs + x-default)', () => {
    const alternates = buildAlternates('information');
    expect(alternates).toHaveLength(4);
  });

  it('canonical hrefs use siteUrl prefix', () => {
    const alternates = buildAlternates('blog');
    for (const alt of alternates) {
      expect(alt.href).toMatch(/^https?:\/\//);
    }
  });

  it('x-default for information points to nl/informatie', () => {
    const alternates = buildAlternates('information');
    const xDefault = alternates.find((a) => a.lang === 'x-default');
    expect(xDefault!.href).toBe('https://voorvoet.nl/nl/informatie');
  });

  it('all alternates share one origin (no mixed staging/prod domains)', () => {
    for (const pageKey of [
      'home',
      'information',
      'reimbursements',
      'contact',
      'order_insoles',
      'blog',
      'credits',
    ] as const) {
      const alternates = buildAlternates(pageKey);
      const origins = new Set(alternates.map((a) => new URL(a.href).origin));
      expect(origins.size, `mixed origins on ${pageKey}: ${[...origins].join(', ')}`).toBe(1);
    }
  });
});
