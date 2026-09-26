import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { workspaceAliases, WORKSPACE_PACKAGES } from './workspace-packages.ts';

// The repo root, so that the workspace packages are inside Vitest's root: it
// can only transform (and so measure) untested files that are under root.
const repoRoot = resolve(__dirname, '../..');
const app = (glob: string) => `apps/rights-web/${glob}`;
const packages = (glob: string) => WORKSPACE_PACKAGES.map((name) => `packages/${name}/src/${glob}`);

export default defineConfig({
  test: {
    root: repoRoot,
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(__dirname, './vitest.setup.ts')],
    // The packages' tests run here because they resolve '@/components/ui/*'
    // and '@/lib/*' through this app's aliases.
    include: [app('**/*.test.{ts,tsx}'), ...packages('**/*.test.{ts,tsx}')],
    // Globbed rather than bare names: with workspace packages each of
    // packages/*/node_modules is a nested tree too, and a bare 'node_modules'
    // only matches the one at the repo root — which pulled dependencies' own
    // *.test.tsx sources into the run.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.vinext/**',
      '**/.wrangler/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: resolve(__dirname, './coverage'),
      include: [
        app('lib/**/*.{ts,tsx}'),
        app('app/**/*.{ts,tsx}'),
        app('components/**/*.{ts,tsx}'),
        ...packages('**/*.{ts,tsx}'),
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        app('app/**/page.tsx'),
        app('app/**/layout.tsx'),
        app('app/error.tsx'),
        app('app/not-found.tsx'),
        app('components/ui/**'),
        app('components/*/index.ts'),
        app('lib/*/index.ts'),
        'packages/*/src/index.ts',
      ],
    },
  },
  resolve: {
    // Array form so the entries can be regexes — matches the block in
    // vite.config.ts.
    alias: [
      ...workspaceAliases(__dirname),
      { find: 'cloudflare:workers', replacement: resolve(__dirname, './test/mocks/cloudflare-workers.ts') },
      { find: /^@\/lib\/(.*)$/, replacement: `${resolve(__dirname, './lib')}/$1` },
      { find: /^@\/components\/(.*)$/, replacement: `${resolve(__dirname, './components')}/$1` },
      { find: /^@\/(.*)$/, replacement: `${resolve(__dirname, './app')}/$1` },
    ],
  },
});
