import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { applyMdxPreset } from 'fumadocs-mdx/config';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
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
