import { describe, it, expect, vi } from 'vitest';

const privacyNlContent = `---
title: Privacy beleid
version: "0.1.1"
date: "2023-01-22"
sourcePdf: /documents/Privacy_beleid_v0.1.1.pdf
isTranslation: false
---

## Algemeen

Test inhoud.

Dit is een paragraaf.
`;

const termsNlContent = `---
title: Algemene Voorwaarden
version: "0.1.0"
sourcePdf: /documents/Algemene_voorwaarden_v0.1.0.pdf
---

1. Test voorwaarde.

- Bullet punt

**Vet tekst** en *cursief*.

### Kopje

`;

const privacyDeContent = `---
title: Datenschutzrichtlinie
version: "0.1.1"
isTranslation: true
translationDisclaimer: "Diese Seite ist eine Übersetzung."
---

## Allgemeines

Test Inhalt.
`;

const privacyEnContent = `---
title: Privacy Policy
version: "0.1.1"
isTranslation: true
---

## General

Test content.
`;

const termsEnContent = `---
title: Terms and Conditions
version: "0.1.0"
isTranslation: true
---

1. Test term.
`;

const termsDeContent = `---
title: Allgemeine Geschäftsbedingungen
version: "0.1.0"
isTranslation: true
---

1. Test Bedingung.
`;

vi.mock('$lib/legal/loader.js', async () => {
  const modules: Record<string, string> = {
    '/src/content/legal/nl/privacy-beleid.md': privacyNlContent,
    '/src/content/legal/nl/algemene-voorwaarden.md': termsNlContent,
    '/src/content/legal/de/datenschutzrichtlinie.md': privacyDeContent,
    '/src/content/legal/de/allgemeine-geschaeftsbedingungen.md': termsDeContent,
    '/src/content/legal/en/privacy-policy.md': privacyEnContent,
    '/src/content/legal/en/terms-and-conditions.md': termsEnContent,
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

  function mdToHtml(md: string): string {
    const lines = md.split('\n');
    const out: string[] = [];
    let inList = false;
    let inOl = false;

    function flushList() {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
    }

    function inlineFormat(s: string): string {
      return s
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    }

    for (const line of lines) {
      const h3 = line.match(/^#{3}\s+(.*)/);
      const h2 = line.match(/^#{2}\s+(.*)/);
      const ulItem = line.match(/^[-*]\s+(.*)/);
      const olItem = line.match(/^\d+\.\s+(.*)/);

      if (h3) {
        flushList();
        out.push(`<h3>${inlineFormat(h3[1] ?? '')}</h3>`);
      } else if (h2) {
        flushList();
        out.push(`<h2>${inlineFormat(h2[1] ?? '')}</h2>`);
      } else if (ulItem) {
        if (!inList) {
          flushList();
          out.push('<ul>');
          inList = true;
        }
        out.push(`<li>${inlineFormat(ulItem[1] ?? '')}</li>`);
      } else if (olItem) {
        if (!inOl) {
          flushList();
          out.push('<ol>');
          inOl = true;
        }
        out.push(`<li>${inlineFormat(olItem[1] ?? '')}</li>`);
      } else if (line.trim() === '') {
        flushList();
        out.push('');
      } else {
        flushList();
        out.push(`<p>${inlineFormat(line.trim())}</p>`);
      }
    }
    flushList();
    return out.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
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
    if (typeof raw !== 'string') return null;
    const { meta, body } = parseFrontmatter(raw);
    return {
      title: (meta['title'] as string) ?? '',
      version: (meta['version'] as string) ?? '',
      date: meta['date'] as string | undefined,
      html: mdToHtml(body),
      sourcePdf: meta['sourcePdf'] as string | undefined,
      isTranslation: (meta['isTranslation'] as boolean) ?? false,
      translationDisclaimer: meta['translationDisclaimer'] as string | undefined,
    };
  }

  return { loadLegal };
});

const { loadLegal } = await import('$lib/legal/loader.js');

describe('legal loader — direct module testing', () => {
  it('loads nl privacy policy with correct metadata', () => {
    const doc = loadLegal('nl', 'privacy_policy');
    expect(doc).not.toBeNull();
    expect(doc!.title).toBe('Privacy beleid');
    expect(doc!.version).toBe('0.1.1');
    expect(doc!.isTranslation).toBe(false);
    expect(doc!.date).toBe('2023-01-22');
    expect(doc!.sourcePdf).toBeTruthy();
  });

  it('loads nl terms_conditions', () => {
    const doc = loadLegal('nl', 'terms_conditions');
    expect(doc).not.toBeNull();
    expect(doc!.title).toBe('Algemene Voorwaarden');
    expect(doc!.isTranslation).toBe(false);
  });

  it('loads de privacy_policy with isTranslation=true', () => {
    const doc = loadLegal('de', 'privacy_policy');
    expect(doc).not.toBeNull();
    expect(doc!.isTranslation).toBe(true);
    expect(doc!.translationDisclaimer).toBeTruthy();
  });

  it('loads en privacy_policy with isTranslation=true', () => {
    const doc = loadLegal('en', 'privacy_policy');
    expect(doc).not.toBeNull();
    expect(doc!.isTranslation).toBe(true);
  });

  it('loads en terms_conditions', () => {
    const doc = loadLegal('en', 'terms_conditions');
    expect(doc).not.toBeNull();
    expect(doc!.title).toBe('Terms and Conditions');
  });

  it('returns null for unknown pageKey', () => {
    const doc = loadLegal('nl', 'home' as 'privacy_policy');
    expect(doc).toBeNull();
  });

  it('html contains heading tags for ## headers', () => {
    const doc = loadLegal('nl', 'privacy_policy');
    expect(doc!.html).toContain('<h2>');
  });

  it('html contains ordered list for numbered items', () => {
    const doc = loadLegal('nl', 'terms_conditions');
    expect(doc!.html).toContain('<ol>');
    expect(doc!.html).toContain('<li>');
  });

  it('html contains unordered list for bullet items', () => {
    const doc = loadLegal('nl', 'terms_conditions');
    expect(doc!.html).toContain('<ul>');
  });

  it('html contains strong tag for bold text', () => {
    const doc = loadLegal('nl', 'terms_conditions');
    expect(doc!.html).toContain('<strong>');
  });

  it('html contains em tag for italic text', () => {
    const doc = loadLegal('nl', 'terms_conditions');
    expect(doc!.html).toContain('<em>');
  });

  it('html contains h3 tag for ### headers', () => {
    const doc = loadLegal('nl', 'terms_conditions');
    expect(doc!.html).toContain('<h3>');
  });
});
