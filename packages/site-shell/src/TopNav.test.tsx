/**
 * @fileoverview Covers the site-wide top navigation.
 *
 * The bar renders from the root layout on every page, so what matters is that
 * every category from the shared catalogue is reachable: a dropdown per
 * category, each listing its documents with the right hrefs, and a menu that
 * closes again on Escape.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@rights/auth/AuthButton', () => ({
  AuthButton: () => <button type="button">Sign In</button>,
}));

const { TopNav, TOP_NAV_Z_CLASS } = await import('./TopNav');
const { SITE_CATEGORIES, SITE_LINKS, categoryNavLabel, navLabel } = await import('./site-nav');

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('TopNav', () => {
  it('offers a dropdown trigger for every category', () => {
    render(<TopNav />);

    for (const category of SITE_CATEGORIES) {
      expect(screen.getByRole('button', { name: new RegExp(categoryNavLabel(category)) })).toBeInTheDocument();
    }
  });

  it('keeps every category collapsed until it is opened', () => {
    render(<TopNav />);

    for (const category of SITE_CATEGORIES) {
      expect(screen.getByRole('button', { name: new RegExp(categoryNavLabel(category)) })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    }
  });

  it('lists a category\'s documents, linking each to its own page', () => {
    render(<TopNav />);
    const category = SITE_CATEGORIES[0];

    fireEvent.click(screen.getByRole('button', { name: new RegExp(categoryNavLabel(category)) }));

    for (const doc of category.documents) {
      // A document with a create shortcut is linked twice under the same
      // label — the reading link and the authoring one — so match on hrefs.
      const hrefs = screen
        .getAllByRole('link', { name: new RegExp(navLabel(doc)) })
        .map((link) => link.getAttribute('href'));
      expect(hrefs).toContain(doc.href);
    }
  });

  it('offers a create shortcut beside any document that can be authored', () => {
    render(<TopNav />);
    const category = SITE_CATEGORIES.find((entry) =>
      entry.documents.some((doc) => doc.createHref),
    )!;

    fireEvent.click(screen.getByRole('button', { name: new RegExp(categoryNavLabel(category)) }));

    for (const doc of category.documents.filter((entry) => entry.createHref)) {
      const hrefs = screen
        .getAllByRole('link', { name: new RegExp(navLabel(doc)) })
        .map((link) => link.getAttribute('href'));
      expect(hrefs).toContain(doc.createHref);
    }
  });

  it('closes an open menu on Escape', () => {
    render(<TopNav />);
    const category = SITE_CATEGORIES[0];
    const trigger = screen.getByRole('button', { name: new RegExp(categoryNavLabel(category)) });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('stacks the bar above the sticky headers pages render for themselves', () => {
    render(<TopNav />);

    // Page headers sit at z-40 and come later in the document, so an equal
    // level would let them paint over an open dropdown. See TOP_NAV_Z_CLASS.
    const level = Number(/^z-\[(\d+)\]$/.exec(TOP_NAV_Z_CLASS)?.[1]);
    expect(level).toBeGreaterThan(50);
    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveClass(TOP_NAV_Z_CLASS);
  });

  it('carries the sign-in state and a link home', () => {
    render(<TopNav />);

    expect(screen.getAllByRole('button', { name: 'Sign In' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Rights Institute' })).toHaveAttribute('href', '/');

    for (const link of SITE_LINKS.filter((entry) => entry.href !== '/')) {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href);
    }
  });
});
