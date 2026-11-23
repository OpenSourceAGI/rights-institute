/**
 * Blog posts live in the docs content under content/docs/blog, so they get the
 * docs layout, sidebar and sitemap for free. This picks them out of the docs
 * pages for the homepage's News & Blog section.
 */
import type { NewsPost } from '@rights/site-shell/NewsSection';

export const BLOG_BASE_URL = '/docs/blog';

interface BlogPageLike {
  url: string;
  data: { title: string; description?: string; date?: string | Date; author?: string };
}

function isoDate(value: string | Date | undefined): string | undefined {
  if (!value) return undefined;
  // YAML parses an unquoted 2026-11-23 into a Date; keep just the day.
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
}

/** Blog posts from the given docs pages, newest first. The blog index itself is left out. */
export function blogPosts(pages: BlogPageLike[]): NewsPost[] {
  return pages
    .filter((page) => page.url.startsWith(`${BLOG_BASE_URL}/`))
    .map((page) => ({
      title: page.data.title,
      description: page.data.description,
      date: isoDate(page.data.date),
      author: page.data.author,
      href: page.url,
    }))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}
