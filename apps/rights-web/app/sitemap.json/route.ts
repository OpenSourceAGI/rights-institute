import { source } from '@/lib/source';
import { SITE_URL, sitemapEntries } from '@/lib/sitemap';

/** The same URL list as /sitemap.xml, as JSON for tools that prefer it. */
export function GET(): Response {
  const pages = sitemapEntries(source.getPages().map((page) => page.url));
  const body = { site: SITE_URL, sitemap: `${SITE_URL}/sitemap.xml`, count: pages.length, pages };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  });
}
