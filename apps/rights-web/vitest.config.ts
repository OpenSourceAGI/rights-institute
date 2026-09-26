import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
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
      reportsDirectory: './coverage',
      include: ['lib/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/error.tsx',
        'app/not-found.tsx',
        'components/ui/**',
        'components/*/index.ts',
        'lib/*/index.ts',
      ],
    },
  },
  resolve: {
    // Array form so the entries can be regexes — matches the block in
    // vite.config.ts.
    alias: [
      { find: 'cloudflare:workers', replacement: resolve(__dirname, './test/mocks/cloudflare-workers.ts') },
      { find: /^@\/lib\/(.*)$/, replacement: `${resolve(__dirname, './lib')}/$1` },
      { find: /^@\/components\/(.*)$/, replacement: `${resolve(__dirname, './components')}/$1` },
      { find: /^@\/(.*)$/, replacement: `${resolve(__dirname, './app')}/$1` },
    ],
  },
});
