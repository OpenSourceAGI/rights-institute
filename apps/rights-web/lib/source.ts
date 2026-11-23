import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import { pageSchema } from 'fumadocs-core/source/schema';

// Blog posts under content/docs/blog carry a publish date and an author.
// Both reuse the optional-string schema of `description`, so this file needs
// no zod import of its own.
const optionalString = pageSchema.shape.description;

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({ date: optionalString, author: optionalString }),
    // Remote images (favicon services etc.) are sized over the network at
    // build time. One dead URL answering 404 used to fail the whole build and
    // so block every deploy; render it unsized instead.
    mdxOptions: applyMdxPreset({ remarkImageOptions: { onError: 'ignore' } }),
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
