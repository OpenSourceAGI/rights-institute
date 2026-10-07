import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { sitemapEntries } from '@/lib/sitemap';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(source.getPages().map((page) => page.url));
}
