import { describe, it, expect } from 'vitest';
import { isExternal, renderButton, processButtonSyntax } from '$lib/blog/remark-button.js';

describe('isExternal', () => {
  it('returns true for http URLs not on voorvoet.nl', () => {
    expect(isExternal('http://example.com')).toBe(true);
  });

  it('returns true for https URLs not on voorvoet.nl', () => {
    expect(isExternal('https://example.com/foo')).toBe(true);
  });

  it('returns false for voorvoet.nl URLs', () => {
    expect(isExternal('https://voorvoet.nl/nl/blog')).toBe(false);
  });

  it('returns false for relative URLs', () => {
    expect(isExternal('/nl/contact')).toBe(false);
  });

  it('returns false for http://voorvoet.nl', () => {
    expect(isExternal('http://voorvoet.nl')).toBe(false);
  });
});

describe('renderButton', () => {
  it('renders a BlogButton tag with label and href', () => {
    const result = renderButton('Click me', 'https://example.com');
    expect(result).toContain('BlogButton');
    expect(result).toContain('label="Click me"');
    expect(result).toContain('href="https://example.com"');
  });

  it('adds target and rel for external links', () => {
    const result = renderButton('External', 'https://example.com');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('does not add target/rel for internal voorvoet.nl links', () => {
    const result = renderButton('Internal', 'https://voorvoet.nl/nl');
    expect(result).not.toContain('target="_blank"');
    expect(result).not.toContain('rel="noopener noreferrer"');
  });

  it('does not add target/rel for relative links', () => {
    const result = renderButton('Relative', '/nl/contact');
    expect(result).not.toContain('target="_blank"');
  });

  it('escapes double quotes in label', () => {
    const result = renderButton('Say "hello"', 'https://example.com');
    expect(result).toContain('&quot;');
  });
});

describe('processButtonSyntax', () => {
  it('converts !button[Label](url) to BlogButton tag', () => {
    const input = '!button[Maak een afspraak](https://voorvoet.nl)';
    const result = processButtonSyntax(input);
    expect(result).toContain('BlogButton');
    expect(result).toContain('label="Maak een afspraak"');
    expect(result).toContain('href="https://voorvoet.nl"');
  });

  it('renders external link with target="_blank"', () => {
    const input = '!button[Go](https://example.com)';
    const result = processButtonSyntax(input);
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('renders malformed input with empty label as plain text', () => {
    const input = '!button[](https://example.com)';
    const result = processButtonSyntax(input);
    expect(result).toBe(input);
  });

  it('renders malformed input with empty href as plain text', () => {
    const input = '!button[Label]()';
    const result = processButtonSyntax(input);
    expect(result).toBe(input);
  });

  it('handles multiple buttons in one string', () => {
    const input = '!button[First](https://a.com) and !button[Second](https://b.com)';
    const result = processButtonSyntax(input);
    expect(result).toContain('label="First"');
    expect(result).toContain('label="Second"');
  });

  it('does not alter text without button syntax', () => {
    const input = 'Just some regular text with a [link](https://example.com)';
    const result = processButtonSyntax(input);
    expect(result).toBe(input);
  });
});
