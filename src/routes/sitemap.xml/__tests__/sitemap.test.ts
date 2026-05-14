// @vitest-environment node
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

import { GET } from '../+server.js';
import { ROUTE_MAP, LANGS } from '$lib/i18n/route-map.js';
import { getPostsByLang } from '$lib/blog/loader.js';

describe('sitemap.xml', () => {
  const makeRequest = () => new Request('https://voorvoet.nl/sitemap.xml', { method: 'GET' });

  async function getXml(): Promise<string> {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    return response.text();
  }

  it('returns 200 with application/xml content type', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/xml');
  });

  it('contains xml declaration', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('<?xml version="1.0"');
  });

  it('contains urlset with xhtml namespace', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it('contains all language variants for home', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('https://voorvoet.nl/nl');
    expect(text).toContain('https://voorvoet.nl/de');
    expect(text).toContain('https://voorvoet.nl/en');
  });

  it('contains x-default hreflang entries', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('hreflang="x-default"');
  });

  it('contains priority 1.0 for home', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('<priority>1.0</priority>');
  });

  it('contains priority 0.8 for blog', async () => {
    const response = await GET({ request: makeRequest() } as Parameters<typeof GET>[0]);
    const text = await response.text();
    expect(text).toContain('<priority>0.8</priority>');
  });

  // Structural assertions replace the previous monolithic snapshot — a new
  // blog post used to churn ~30 lines and snowball into stale-snapshot CI
  // failures (audit 2026-05-14, CRIT-1).

  it('includes every static path from ROUTE_MAP', async () => {
    const text = await getXml();
    for (const langs of Object.values(ROUTE_MAP)) {
      for (const path of Object.values(langs)) {
        expect(text, `missing <loc> for ${path}`).toContain(`https://voorvoet.nl${path}<`);
      }
    }
  });

  it('includes every blog post slug for each language', async () => {
    const text = await getXml();
    for (const lang of LANGS) {
      for (const post of getPostsByLang(lang)) {
        expect(text, `missing blog post ${lang}/${post.slug}`).toContain(
          `/${lang}/blog/${post.slug}`,
        );
      }
    }
  });

  it('has one <url> entry per static path × lang plus one per blog post per lang', async () => {
    const text = await getXml();
    const urlCount = (text.match(/<url>/g) ?? []).length;
    const staticPaths = Object.values(ROUTE_MAP).reduce(
      (n, langs) => n + Object.keys(langs).length,
      0,
    );
    const blogPaths = LANGS.reduce((n, lang) => n + getPostsByLang(lang).length, 0);
    expect(urlCount).toBe(staticPaths + blogPaths);
  });

  it('uses each known priority value at least once', async () => {
    const text = await getXml();
    expect(text).toContain('<priority>1.0</priority>'); // home
    expect(text).toContain('<priority>0.8</priority>'); // blog index
    expect(text).toContain('<priority>0.7</priority>'); // blog posts
    expect(text).toContain('<priority>0.6</priority>'); // info/reimbursements/etc.
  });
});
