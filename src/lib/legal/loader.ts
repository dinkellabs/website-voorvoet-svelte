import type { Lang } from '$lib/i18n/route-map.js';
import type { PageKey } from '$lib/i18n/route-map.js';

export interface LegalDocument {
  title: string;
  version: string;
  date?: string;
  html: string;
  sourcePdf?: string;
  isTranslation: boolean;
  translationDisclaimer?: string;
}

const modules = import.meta.glob<string>('/src/content/legal/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function parseFrontmatter(raw: string): { meta: Record<string, string | boolean>; body: string } {
  if (!raw.startsWith('---')) {
    return { meta: {}, body: raw };
  }
  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    return { meta: {}, body: raw };
  }
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
    if (val === 'true') {
      meta[key] = true;
    } else if (val === 'false') {
      meta[key] = false;
    } else {
      meta[key] = val;
    }
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
    const h6 = line.match(/^#{6}\s+(.*)/);
    const h5 = line.match(/^#{5}\s+(.*)/);
    const h4 = line.match(/^#{4}\s+(.*)/);
    const h3 = line.match(/^#{3}\s+(.*)/);
    const h2 = line.match(/^#{2}\s+(.*)/);
    const h1 = line.match(/^#{1}\s+(.*)/);
    const ulItem = line.match(/^[-*]\s+(.*)/);
    const olItem = line.match(/^\d+\.\s+(.*)/);

    if (h6) {
      flushList();
      out.push(`<h6>${inlineFormat(h6[1] ?? '')}</h6>`);
    } else if (h5) {
      flushList();
      out.push(`<h5>${inlineFormat(h5[1] ?? '')}</h5>`);
    } else if (h4) {
      flushList();
      out.push(`<h4>${inlineFormat(h4[1] ?? '')}</h4>`);
    } else if (h3) {
      flushList();
      out.push(`<h3>${inlineFormat(h3[1] ?? '')}</h3>`);
    } else if (h2) {
      flushList();
      out.push(`<h2>${inlineFormat(h2[1] ?? '')}</h2>`);
    } else if (h1) {
      flushList();
      out.push(`<h1>${inlineFormat(h1[1] ?? '')}</h1>`);
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

const SLUG_MAP: Record<PageKey, Record<Lang, string>> = {
  privacy_policy: {
    nl: 'privacy-beleid',
    de: 'datenschutzrichtlinie',
    en: 'privacy-policy',
  },
  terms_conditions: {
    nl: 'algemene-voorwaarden',
    de: 'allgemeine-geschaeftsbedingungen',
    en: 'terms-and-conditions',
  },
  home: { nl: '', de: '', en: '' },
  information: { nl: '', de: '', en: '' },
  reimbursements: { nl: '', de: '', en: '' },
  contact: { nl: '', de: '', en: '' },
  order_insoles: { nl: '', de: '', en: '' },
  blog: { nl: '', de: '', en: '' },
  credits: { nl: '', de: '', en: '' },
};

export function loadLegal(
  lang: Lang,
  pageKey: 'privacy_policy' | 'terms_conditions',
): LegalDocument | null {
  const slug = SLUG_MAP[pageKey][lang];
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
