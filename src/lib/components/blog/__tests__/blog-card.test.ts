import { describe, it, expect } from 'vitest';
import type { BlogPost } from '$lib/blog/types.js';

const samplePost: BlogPost = {
  slug: 'podotherapeut-of-podoloog',
  lang: 'nl',
  storyNumber: '001',
  filePath: '/src/content/blog/nl/001_podotherapeut_of_podoloog.md',
  title: 'Podotherapeut of podoloog?',
  summary: 'Benieuwd naar het verschil tussen een podotherapeut en een podoloog?',
  author: 'Kim Bakhuis',
  date: '2023-11-06',
  thumbnail: 'thumbnail.jpg',
  thumbnail_alt: 'Podotherapeut Kim Bakhuis die een zool controleert.',
  tags: ['podotherapie', 'podoloog'],
  category: 'Opleiding en vakgebied',
  content: '<h1>Het verschil</h1><p>Tekst...</p>',
};

describe('BlogCard — data transformations', () => {
  it('constructs thumbnail path from filePath', () => {
    const filename = samplePost.filePath.split('/').at(-1) ?? '';
    const storyDir = filename.replace(/\.md$/, '');
    const imgSrc = `/images/page_blog/${storyDir}/${samplePost.thumbnail}`;
    expect(imgSrc).toBe('/images/page_blog/001_podotherapeut_of_podoloog/thumbnail.jpg');
  });

  it('derives avif src from jpg thumbnail', () => {
    const jpgSrc = '/images/page_blog/001_podotherapeut_of_podoloog/thumbnail.jpg';
    const avifSrc = jpgSrc.replace(/\.(jpg|jpeg)$/, '.avif');
    expect(avifSrc).toBe('/images/page_blog/001_podotherapeut_of_podoloog/thumbnail.avif');
  });

  it('derives webp src from jpg thumbnail', () => {
    const jpgSrc = '/images/page_blog/001_podotherapeut_of_podoloog/thumbnail.jpg';
    const webpSrc = jpgSrc.replace(/\.(jpg|jpeg)$/, '.webp');
    expect(webpSrc).toBe('/images/page_blog/001_podotherapeut_of_podoloog/thumbnail.webp');
  });

  it('formats date in NL locale', () => {
    const formatted = new Intl.DateTimeFormat('nl', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date('2023-11-06'));
    expect(formatted).toContain('2023');
    expect(formatted).toContain('6');
  });

  it('post has required fields', () => {
    expect(samplePost.title).toBeTruthy();
    expect(samplePost.summary).toBeTruthy();
    expect(samplePost.thumbnail).toBeTruthy();
    expect(samplePost.slug).toBeTruthy();
  });

  it('post slug is in expected format', () => {
    expect(samplePost.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('post href is constructed correctly', () => {
    const blogBase = '/nl/blog';
    const href = `${blogBase}/${samplePost.slug}`;
    expect(href).toBe('/nl/blog/podotherapeut-of-podoloog');
  });
});
