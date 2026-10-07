import { describe, it, expect } from 'vitest';
import { DISALLOWED_PATHS, SITE_URL, sitemapEntries } from '@/lib/sitemap';
import robots from '../app/robots';

describe('sitemapEntries', () => {
  const entries = sitemapEntries(['/docs', '/docs/tech-stack']);
  const urls = entries.map((entry) => entry.url);

  it('lists the public pages, sample licenses and docs as absolute URLs', () => {
    expect(urls).toContain(SITE_URL);
    expect(urls).toContain(`${SITE_URL}/ethics`);
    expect(urls).toContain(`${SITE_URL}/prosper/codecraft-studio`);
    expect(urls).toContain(`${SITE_URL}/docs/tech-stack`);
    expect(urls.every((url) => url.startsWith(SITE_URL))).toBe(true);
  });

  it('leaves out private and noindex pages', () => {
    for (const path of ['/login', '/dashboard', '/contract/invite', '/contract/track', '/api']) {
      expect(urls.some((url) => url.startsWith(`${SITE_URL}${path}`))).toBe(false);
    }
  });

  it('has no duplicates', () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect(sitemapEntries(['/ethics']).filter((e) => e.url === `${SITE_URL}/ethics`)).toHaveLength(1);
  });
});

describe('robots', () => {
  it('allows crawling and points at the sitemap', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: DISALLOWED_PATHS },
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    });
  });
});
