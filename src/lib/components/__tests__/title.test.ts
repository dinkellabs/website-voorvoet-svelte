import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Title from '../Title.svelte';

const textSnippet = (text: string) =>
  createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Title — element selection by level', () => {
  it.each([1, 2, 3] as const)('renders <h%i> for level=%i', (level) => {
    const { container } = render(Title, { children: textSnippet('Heading'), level });
    expect(container.querySelector(`h${level}`)).not.toBeNull();
  });

  it('does not render multiple heading tags', () => {
    const { container } = render(Title, { children: textSnippet('Heading'), level: 2 });
    expect(container.querySelectorAll('h1, h2, h3').length).toBe(1);
  });
});

describe('Title — class composition', () => {
  it('applies title and level-specific class', () => {
    const { container } = render(Title, { children: textSnippet('X'), level: 2 });
    const el = container.querySelector('h2');
    expect(el?.classList.contains('title')).toBe(true);
    expect(el?.classList.contains('title--h2')).toBe(true);
  });

  it('appends a custom class without dropping the base', () => {
    const { container } = render(Title, {
      children: textSnippet('X'),
      level: 1,
      class: 'page-hero',
    });
    const el = container.querySelector('h1');
    expect(el?.classList.contains('title')).toBe(true);
    expect(el?.classList.contains('title--h1')).toBe(true);
    expect(el?.classList.contains('page-hero')).toBe(true);
  });
});

describe('Title — id passthrough', () => {
  it('forwards id to the heading element for in-page anchors', () => {
    const { container } = render(Title, {
      children: textSnippet('X'),
      level: 2,
      id: 'introduction',
    });
    expect(container.querySelector('h2')?.id).toBe('introduction');
  });

  it('omits id when not provided', () => {
    const { container } = render(Title, { children: textSnippet('X'), level: 2 });
    expect(container.querySelector('h2')?.hasAttribute('id')).toBe(false);
  });
});
