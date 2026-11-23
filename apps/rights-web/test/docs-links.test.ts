/**
 * Every docs link the homepage and top navigation point at must resolve to a
 * real docs page. A docs file that moves (as the AI guides did, from
 * comparisons/services to comparisons/intelligence) otherwise leaves the
 * homepage card pointing at a 404.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE_CATEGORIES, SITE_LINKS } from '@rights/site-shell/site-nav';
import { blogPosts } from '@/lib/blog';

const DOCS_DIR = resolve(__dirname, '../content/docs');

function docsFileFor(href: string): string | undefined {
  const slug = href.replace(/^\/docs\/?/, '');
  const base = slug ? resolve(DOCS_DIR, slug) : resolve(DOCS_DIR, 'index');
  const candidates = [
    `${base}.md`,
    `${base}.mdx`,
    resolve(base, 'index.md'),
    resolve(base, 'index.mdx'),
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

const docsHrefs = [
  ...SITE_CATEGORIES.flatMap((category) => category.documents.map((doc) => doc.href)),
  ...SITE_LINKS.map((link) => link.href),
].filter((href) => href === '/docs' || href.startsWith('/docs/'));

describe('docs links from the homepage and navigation', () => {
  it.each(docsHrefs)('%s resolves to a docs page', (href) => {
    expect(docsFileFor(href), href).toBeDefined();
  });
});

describe('docs folder sidebars', () => {
  // A meta.json that names a page which isn't in its folder leaves a gap in
  // the sidebar; it's the trace a moved file leaves behind.
  function metaFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) return metaFiles(path);
      return entry.name === 'meta.json' ? [path] : [];
    });
  }

  it.each(metaFiles(DOCS_DIR))('%s lists only pages that exist', (metaPath) => {
    const dir = resolve(metaPath, '..');
    const { pages = [] } = JSON.parse(readFileSync(metaPath, 'utf8')) as { pages?: string[] };
    for (const page of pages) {
      if (page.startsWith('...') || page.startsWith('---')) continue;
      const exists = ['.md', '.mdx'].some((ext) => existsSync(resolve(dir, `${page}${ext}`)))
        || existsSync(resolve(dir, page));
      expect(exists, `${page} in ${metaPath}`).toBe(true);
    }
  });
});

describe('blogPosts', () => {
  it('keeps only blog posts, newest first, without the blog index', () => {
    const posts = blogPosts([
      { url: '/docs/blog', data: { title: 'News & Blog' } },
      { url: '/docs/blog/older', data: { title: 'Older', date: '2026-01-02' } },
      { url: '/docs/development', data: { title: 'Development' } },
      { url: '/docs/blog/newer', data: { title: 'Newer', date: new Date('2026-03-04T00:00:00Z') } },
    ]);
    expect(posts.map((post) => [post.title, post.date])).toEqual([
      ['Newer', '2026-03-04'],
      ['Older', '2026-01-02'],
    ]);
  });
});
