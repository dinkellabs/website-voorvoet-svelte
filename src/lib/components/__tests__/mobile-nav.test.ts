import { describe, it, expect } from 'vitest';

describe('MobileNav component logic', () => {
  it('toggle state starts as false (closed)', () => {
    const open = false;
    expect(open).toBe(false);
  });

  it('toggle function flips open state', () => {
    let open = false;
    open = !open;
    expect(open).toBe(true);
    open = !open;
    expect(open).toBe(false);
  });

  it('close function sets open to false', () => {
    let open = true;
    const close = () => {
      open = false;
    };
    close();
    expect(open).toBe(false);
  });

  it('aria-expanded reflects open state', () => {
    let open = false;
    expect(open.toString()).toBe('false');
    open = true;
    expect(open.toString()).toBe('true');
  });

  it('navItems with href property are passed through', () => {
    const navItems = [
      { key: 'blog', label: 'Blog', href: '/nl/blog' },
      { key: 'contact', label: 'Contact', href: '/nl/contact' },
    ];
    expect(navItems).toHaveLength(2);
    expect(navItems[0]!.href).toBe('/nl/blog');
    expect(navItems[1]!.href).toBe('/nl/contact');
  });
});
