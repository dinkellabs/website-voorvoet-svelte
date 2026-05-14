import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Button from '../Button.svelte';

const labelSnippet = (text: string) =>
  createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Button — element selection', () => {
  it('renders an <a> when href is provided', () => {
    const { container } = render(Button, { children: labelSnippet('Boek nu'), href: '/contact' });
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('/contact');
    expect(container.querySelector('button')).toBeNull();
  });

  it('renders a <button> when no href is provided', () => {
    const { container } = render(Button, { children: labelSnippet('Verstuur') });
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('type')).toBe('button');
    expect(container.querySelector('a')).toBeNull();
  });

  it('button defaults type to "button" so it does not submit forms unexpectedly', () => {
    const { container } = render(Button, { children: labelSnippet('X') });
    expect(container.querySelector('button')?.getAttribute('type')).toBe('button');
  });

  it('button respects type="submit"', () => {
    const { container } = render(Button, { children: labelSnippet('Send'), type: 'submit' });
    expect(container.querySelector('button')?.getAttribute('type')).toBe('submit');
  });
});

describe('Button — variants', () => {
  it.each(['primary', 'secondary', 'link', 'ghost'] as const)(
    'applies btn--%s class',
    (variant) => {
      const { container } = render(Button, { children: labelSnippet('X'), variant });
      expect(container.querySelector('.btn')?.classList.contains(`btn--${variant}`)).toBe(true);
    },
  );

  it('defaults to primary variant', () => {
    const { container } = render(Button, { children: labelSnippet('X') });
    expect(container.querySelector('.btn--primary')).not.toBeNull();
  });
});

describe('Button — anchor safety', () => {
  it('auto-fills rel="noopener noreferrer" for target="_blank"', () => {
    const { container } = render(Button, {
      props: {
        children: labelSnippet('External'),
        href: 'https://example.com',
        target: '_blank',
      },
    });
    expect(container.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('respects an explicit rel override', () => {
    const { container } = render(Button, {
      props: {
        children: labelSnippet('External'),
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener',
      },
    });
    expect(container.querySelector('a')?.getAttribute('rel')).toBe('noopener');
  });

  it('does not set rel for same-tab links', () => {
    const { container } = render(Button, { children: labelSnippet('Internal'), href: '/about' });
    expect(container.querySelector('a')?.getAttribute('rel')).toBeNull();
  });
});

describe('Button — disabled state', () => {
  it('applies disabled attr on <button>', () => {
    const { container } = render(Button, { children: labelSnippet('X'), disabled: true });
    expect(container.querySelector('button')?.hasAttribute('disabled')).toBe(true);
  });

  it('reflects disabled on <a> via aria-disabled and tabindex=-1', () => {
    const { container } = render(Button, {
      children: labelSnippet('X'),
      href: '/x',
      disabled: true,
    });
    const a = container.querySelector('a');
    expect(a?.getAttribute('aria-disabled')).toBe('true');
    expect(a?.getAttribute('tabindex')).toBe('-1');
  });
});

describe('Button — class passthrough and aria-label', () => {
  it('appends a custom class', () => {
    const { container } = render(Button, { children: labelSnippet('X'), class: 'my-extra' });
    expect(container.querySelector('.btn.my-extra')).not.toBeNull();
  });

  it('sets aria-label when provided', () => {
    const { container } = render(Button, {
      children: labelSnippet('X'),
      ariaLabel: 'Sluiten',
    });
    expect(container.querySelector('.btn')?.getAttribute('aria-label')).toBe('Sluiten');
  });
});
