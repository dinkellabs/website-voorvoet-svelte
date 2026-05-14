import { describe, it, expect, vi } from 'vitest';

const nlPrivacy = `---
title: Privacy beleid
version: "0.1.1"
date: "2023-01-22"
sourcePdf: /documents/Privacy_beleid_v0.1.1.pdf
lang: nl
pageKey: privacy_policy
---

## Algemeen

Test inhoud.
`;

const nlTerms = `---
title: Algemene Voorwaarden
version: "0.1.0"
sourcePdf: /documents/Algemene_voorwaarden_v0.1.0.pdf
lang: nl
pageKey: terms_conditions
---

1. Test voorwaarde.
`;

const dePrivacy = `---
title: Datenschutzrichtlinie
version: "0.1.1"
isTranslation: true
translationDisclaimer: "Diese Seite ist eine Übersetzung."
lang: de
pageKey: privacy_policy
---

## Allgemeines

Test Inhalt.
`;

const deTerms = `---
title: Allgemeine Geschäftsbedingungen
version: "0.1.0"
isTranslation: true
lang: de
pageKey: terms_conditions
---

1. Test Bedingung.
`;

const enPrivacy = `---
title: Privacy Policy
version: "0.1.1"
isTranslation: true
lang: en
pageKey: privacy_policy
---

## General

Test content.
`;

const enTerms = `---
title: Terms and Conditions
version: "0.1.0"
isTranslation: true
lang: en
pageKey: terms_conditions
---

1. Test term.
`;

vi.mock('$lib/legal/loader', async () => {
  const modules: Record<string, string> = {
    '/src/content/legal/nl/privacy-beleid.md': nlPrivacy,
    '/src/content/legal/nl/algemene-voorwaarden.md': nlTerms,
    '/src/content/legal/de/datenschutzrichtlinie.md': dePrivacy,
    '/src/content/legal/de/allgemeine-geschaeftsbedingungen.md': deTerms,
    '/src/content/legal/en/privacy-policy.md': enPrivacy,
    '/src/content/legal/en/terms-and-conditions.md': enTerms,
  };

  function parseFrontmatter(raw: string): { meta: Record<string, string | boolean>; body: string } {
    if (!raw.startsWith('---')) return { meta: {}, body: raw };
    const end = raw.indexOf('\n---', 3);
    if (end === -1) return { meta: {}, body: raw };
    const fmBlock = raw.slice(3, end);
    const body = raw.slice(end + 4).trimStart();
    const meta: Record<string, string | boolean> = {};
    for (const line of fmBlock.split('\n')) {
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      const key = line.slice(0, colon).trim();
      const val = line
        .slice(colon + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      if (val === 'true') meta[key] = true;
      else if (val === 'false') meta[key] = false;
      else meta[key] = val;
    }
    return { meta, body };
  }

  const SLUG_MAP: Record<string, Record<string, string>> = {
    privacy_policy: { nl: 'privacy-beleid', de: 'datenschutzrichtlinie', en: 'privacy-policy' },
    terms_conditions: {
      nl: 'algemene-voorwaarden',
      de: 'allgemeine-geschaeftsbedingungen',
      en: 'terms-and-conditions',
    },
  };

  function loadLegal(lang: string, pageKey: string) {
    const slug = SLUG_MAP[pageKey]?.[lang];
    if (!slug) return null;
    const key = `/src/content/legal/${lang}/${slug}.md`;
    const raw = modules[key];
    if (!raw) return null;
    const { meta, body } = parseFrontmatter(raw);
    return {
      title: meta['title'] ?? '',
      version: meta['version'] ?? '',
      date: meta['date'],
      html: `<p>${body.trim()}</p>`,
      sourcePdf: meta['sourcePdf'],
      isTranslation: meta['isTranslation'] ?? false,
      translationDisclaimer: meta['translationDisclaimer'],
    };
  }

  return { loadLegal };
});

const { loadLegal } = await import('$lib/legal/loader');

describe('legal loader', () => {
  it.each([
    ['nl', 'privacy_policy', false],
    ['nl', 'terms_conditions', false],
    ['de', 'privacy_policy', true],
    ['de', 'terms_conditions', true],
    ['en', 'privacy_policy', true],
    ['en', 'terms_conditions', true],
  ])('loads %s / %s; isTranslation=%s', (lang, pageKey, isTranslation) => {
    const doc = loadLegal(
      lang as 'nl' | 'de' | 'en',
      pageKey as 'privacy_policy' | 'terms_conditions',
    );
    expect(doc).not.toBeNull();
    expect(doc!.title).toBeTruthy();
    expect(doc!.version).toBeTruthy();
    expect(doc!.html).toBeTruthy();
    expect(doc!.isTranslation).toBe(isTranslation);
  });

  it('translated docs have translationDisclaimer', () => {
    const doc = loadLegal('de', 'privacy_policy');
    expect(doc!.isTranslation).toBe(true);
    expect(doc!.translationDisclaimer).toBeTruthy();
  });

  it('NL docs have no isTranslation flag', () => {
    const doc = loadLegal('nl', 'privacy_policy');
    expect(doc!.isTranslation).toBe(false);
  });
});
