import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
  dev: false,
  building: false,
}));

import {
  organizationLD,
  podiatristLD,
  blogPostingLD,
  breadcrumbListLD,
} from '../structured-data.js';

describe('organizationLD', () => {
  it('returns @type Organization', () => {
    const result = organizationLD();
    expect(result['@type']).toBe('Organization');
  });

  it('contains the organization name', () => {
    const result = organizationLD();
    expect(result.name).toBe('VoorVoet');
  });
});

describe('podiatristLD', () => {
  it('returns @type MedicalBusiness', () => {
    const result = podiatristLD();
    expect(result['@type']).toBe('MedicalBusiness');
  });

  it('includes address', () => {
    const result = podiatristLD();
    expect(Array.isArray(result.address)).toBe(true);
  });
});

describe('blogPostingLD', () => {
  const post = {
    title: 'Test Post',
    summary: 'A test summary',
    author: 'Kim Bakhuis',
    date: '2024-01-01',
  };

  it('returns @type BlogPosting', () => {
    const result = blogPostingLD(post, 'nl', 'https://voorvoet.nl/nl/blog/test');
    expect(result['@type']).toBe('BlogPosting');
  });

  it('includes headline matching post title', () => {
    const result = blogPostingLD(post, 'nl', 'https://voorvoet.nl/nl/blog/test');
    expect(result.headline).toBe(post.title);
  });

  it('includes the url', () => {
    const url = 'https://voorvoet.nl/nl/blog/test';
    const result = blogPostingLD(post, 'nl', url);
    expect(result.url).toBe(url);
  });

  it('includes author info', () => {
    const result = blogPostingLD(post, 'nl', 'https://voorvoet.nl/nl/blog/test');
    expect((result.author as { name: string }).name).toBe(post.author);
  });
});

describe('breadcrumbListLD', () => {
  it('returns @type BreadcrumbList', () => {
    const result = breadcrumbListLD([
      { name: 'Home', url: 'https://voorvoet.nl/nl' },
      { name: 'Blog', url: 'https://voorvoet.nl/nl/blog' },
    ]);
    expect(result['@type']).toBe('BreadcrumbList');
  });

  it('includes correct number of items', () => {
    const items = [
      { name: 'Home', url: 'https://voorvoet.nl/nl' },
      { name: 'Blog', url: 'https://voorvoet.nl/nl/blog' },
      { name: 'Post', url: 'https://voorvoet.nl/nl/blog/test' },
    ];
    const result = breadcrumbListLD(items);
    const listElement = result.itemListElement as Array<{ position: number; name: string }>;
    expect(listElement).toHaveLength(3);
    expect(listElement[0]!.position).toBe(1);
    expect(listElement[2]!.position).toBe(3);
  });

  it('assigns correct names', () => {
    const items = [
      { name: 'Home', url: 'https://voorvoet.nl/nl' },
      { name: 'Blog', url: 'https://voorvoet.nl/nl/blog' },
    ];
    const result = breadcrumbListLD(items);
    const listElement = result.itemListElement as Array<{ name: string }>;
    expect(listElement[0]!.name).toBe('Home');
    expect(listElement[1]!.name).toBe('Blog');
  });
});
