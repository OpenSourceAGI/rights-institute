import type { MetadataRoute } from 'next';
import { DISALLOWED_PATHS, SITE_URL } from '@/lib/sitemap';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: DISALLOWED_PATHS },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
