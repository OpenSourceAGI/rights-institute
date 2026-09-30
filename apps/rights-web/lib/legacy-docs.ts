/**
 * Until 2026-05 `/docs` served a static TypeDoc build (`public/docs`), with
 * pages like `/docs/functions/ui/tabs` and `/docs/modules/…`. That build was
 * removed when the docs moved to Fumadocs, but search engines and old links
 * still request its URLs, and each one ended in a logged `NEXT_NOT_FOUND`.
 *
 * The docs page sends these to the docs home with a permanent redirect so
 * crawlers drop the old URLs. It is only consulted after Fumadocs has no page
 * for the slug, so a real page added under one of these names still wins.
 */
const LEGACY_TYPEDOC_SECTIONS = new Set(['functions', 'modules', 'assets', 'emergence', 'research']);

const LEGACY_TYPEDOC_FILES = /^(index\.html|404\.html|sitemap\.xml|(lunr-index|search-doc)(-\d+)?\.json)$/;

export function isLegacyTypedocPath(slug: string[] | undefined): boolean {
  const first = slug?.[0];
  if (!first) return false;
  return LEGACY_TYPEDOC_SECTIONS.has(first) || (slug.length === 1 && LEGACY_TYPEDOC_FILES.test(first));
}
