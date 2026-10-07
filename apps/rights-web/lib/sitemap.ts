/**
 * The list of public, indexable URLs — shared by /sitemap.xml, /sitemap.json
 * and /robots.txt so the three can't drift apart.
 *
 * Only pages meant for search belong here. Per-user pages (login, dashboard)
 * and token pages (contract invites/tracking, which carry `noindex`) are left
 * out on purpose: a sitemap that lists a noindex URL is what Search Console
 * reports as "Excluded by 'noindex' tag".
 */
export const SITE_URL = 'https://rights.institute';

export type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SitemapEntry {
  url: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

/** Sample licenses pre-rendered under /prosper/<slug>. */
export const PROSPER_SAMPLE_SLUGS = [
  'codecraft-studio',
  'design-system',
  'enterprise-platform',
  'open-source-toolkit',
];

const STATIC_ROUTES: Array<[path: string, changeFrequency: ChangeFrequency, priority: number]> = [
  ['/', 'weekly', 1],
  ['/understandings-problems', 'monthly', 0.9],
  ['/ethics', 'monthly', 0.8],
  ['/prosper', 'monthly', 0.8],
  ['/contract', 'monthly', 0.8],
  ['/credit', 'monthly', 0.7],
  ['/investor-rank', 'weekly', 0.7],
  ['/startup-tools', 'weekly', 0.7],
  ['/timeline', 'monthly', 0.7],
  ['/terms-privacy', 'yearly', 0.3],
];

/** Paths crawlers have no reason to fetch. */
export const DISALLOWED_PATHS = ['/api/'];

const absolute = (path: string) => (path === '/' ? SITE_URL : `${SITE_URL}${path}`);

/** Every indexable URL; `docPaths` are the docs pages' paths (e.g. `/docs/tech-stack`). */
export function sitemapEntries(docPaths: string[]): SitemapEntry[] {
  const entries: SitemapEntry[] = [
    ...STATIC_ROUTES.map(([path, changeFrequency, priority]) => ({
      url: absolute(path),
      changeFrequency,
      priority,
    })),
    ...PROSPER_SAMPLE_SLUGS.map((slug) => ({
      url: absolute(`/prosper/${slug}`),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    })),
    ...docPaths.map((path) => ({
      url: absolute(path),
      changeFrequency: 'weekly' as const,
      priority: path === '/docs' ? 0.7 : 0.5,
    })),
  ];

  // Docs paths could repeat a static one; keep the first.
  const seen = new Set<string>();
  return entries.filter((entry) => !seen.has(entry.url) && seen.add(entry.url));
}
