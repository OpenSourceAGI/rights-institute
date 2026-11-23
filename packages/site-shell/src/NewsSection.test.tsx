/**
 * @fileoverview Covers the homepage News & Blog section.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewsSection from './NewsSection';

const posts = [
  {
    title: 'Newest post',
    description: 'What changed most recently.',
    date: '2026-11-23',
    href: '/docs/blog/newest',
  },
  { title: 'Undated post', href: '/docs/blog/undated' },
];

describe('NewsSection', () => {
  it('links each post and the full list', () => {
    render(<NewsSection posts={posts} allPostsHref="/docs/blog" />);

    expect(screen.getByRole('heading', { name: 'News & Blog' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Newest post/ })).toHaveAttribute('href', '/docs/blog/newest');
    expect(screen.getByRole('link', { name: /Undated post/ })).toHaveAttribute('href', '/docs/blog/undated');
    expect(screen.getByRole('link', { name: /All posts/ })).toHaveAttribute('href', '/docs/blog');
  });

  it('shows a readable publish date', () => {
    render(<NewsSection posts={posts} />);
    const time = screen.getByText('November 23, 2026');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-11-23');
  });

  it('renders nothing when there are no posts', () => {
    const { container } = render(<NewsSection posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
