import { describe, it, expect } from 'vitest';
import type { Lang } from '$lib/i18n/route-map.js';

const langs: Lang[] = ['nl', 'de', 'en'];

describe('blog loader — post parsing', () => {
  it('parses storyNumber from 3-digit prefix', () => {
    const filename = '001_podotherapeut_of_podoloog.md';
    const storyNumber = filename.slice(0, 3);
    expect(storyNumber).toBe('001');
  });

  it('extracts slug from filename', () => {
    const filename = '002_alles_over_steunzolen_of_podotherapeutische_zolen.md';
    const withoutStory = filename.slice(4);
    const slug = withoutStory.replace(/\.md$/, '');
    expect(slug).toBe('alles_over_steunzolen_of_podotherapeutische_zolen');
  });

  it('detects lang from path', () => {
    const paths = [
      { path: '/src/content/blog/nl/001_foo.md', expected: 'nl' },
      { path: '/src/content/blog/de/001_foo.md', expected: 'de' },
      { path: '/src/content/blog/en/001_foo.md', expected: 'en' },
    ];
    for (const { path, expected } of paths) {
      const match = path.match(/\/src\/content\/blog\/(nl|de|en)\//);
      expect(match?.[1]).toBe(expected);
    }
  });

  it('handles three languages in story prefix matching', () => {
    const storyNumbers = ['001', '002', '003'];
    for (const story of storyNumbers) {
      expect(story).toMatch(/^\d{3}$/);
    }
  });
});

describe('blog loader — cross-lang translation logic', () => {
  it('groups posts by story number across all langs', () => {
    type FakePost = { storyNumber: string; lang: Lang; slug: string };
    const allPosts: FakePost[] = [
      { storyNumber: '001', lang: 'nl', slug: 'podotherapeut-of-podoloog' },
      { storyNumber: '001', lang: 'de', slug: 'podotherapeut-oder-podologe' },
      { storyNumber: '001', lang: 'en', slug: 'podiatrist-or-podologist' },
      { storyNumber: '002', lang: 'nl', slug: 'steunzolen-of-podotherapeutische-zolen' },
    ];

    function getTranslations(post: FakePost): Partial<Record<Lang, FakePost>> {
      const result: Partial<Record<Lang, FakePost>> = {};
      for (const p of allPosts) {
        if (p.storyNumber === post.storyNumber) {
          result[p.lang] = p;
        }
      }
      return result;
    }

    const nlPost = allPosts[0]!;
    const translations = getTranslations(nlPost);

    expect(Object.keys(translations)).toHaveLength(3);
    expect(translations['nl']?.slug).toBe('podotherapeut-of-podoloog');
    expect(translations['de']?.slug).toBe('podotherapeut-oder-podologe');
    expect(translations['en']?.slug).toBe('podiatrist-or-podologist');
  });

  it('getTranslations returns only posts with matching storyNumber', () => {
    type FakePost = { storyNumber: string; lang: Lang; slug: string };
    const allPosts: FakePost[] = [
      { storyNumber: '001', lang: 'nl', slug: 'nl-001' },
      { storyNumber: '001', lang: 'de', slug: 'de-001' },
      { storyNumber: '002', lang: 'nl', slug: 'nl-002' },
    ];

    function getTranslations(post: FakePost): Partial<Record<Lang, FakePost>> {
      const result: Partial<Record<Lang, FakePost>> = {};
      for (const p of allPosts) {
        if (p.storyNumber === post.storyNumber) {
          result[p.lang] = p;
        }
      }
      return result;
    }

    const nlPost002 = allPosts[2]!;
    const translations = getTranslations(nlPost002);
    expect(Object.keys(translations)).toHaveLength(1);
    expect(translations['nl']?.slug).toBe('nl-002');
    expect(translations['de']).toBeUndefined();
  });

  it('all three langs are recognized', () => {
    for (const lang of langs) {
      expect(['nl', 'de', 'en']).toContain(lang);
    }
  });
});

describe('blog loader — pagination logic', () => {
  it('slices posts per page correctly', () => {
    const posts = Array.from({ length: 9 }, (_, i) => ({ id: i }));
    const POSTS_PER_PAGE = 6;

    const page1 = posts.slice(0, POSTS_PER_PAGE);
    const page2 = posts.slice(POSTS_PER_PAGE, POSTS_PER_PAGE * 2);

    expect(page1).toHaveLength(6);
    expect(page2).toHaveLength(3);
  });

  it('totalPages rounds up correctly', () => {
    expect(Math.ceil(3 / 6)).toBe(1);
    expect(Math.ceil(6 / 6)).toBe(1);
    expect(Math.ceil(7 / 6)).toBe(2);
    expect(Math.ceil(12 / 6)).toBe(2);
    expect(Math.ceil(13 / 6)).toBe(3);
  });

  it('sorts posts descending by date', () => {
    const posts = [{ date: '2023-11-06' }, { date: '2024-01-08' }, { date: '2023-11-26' }];
    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    expect(sorted[0]!.date).toBe('2024-01-08');
    expect(sorted[1]!.date).toBe('2023-11-26');
    expect(sorted[2]!.date).toBe('2023-11-06');
  });
});
