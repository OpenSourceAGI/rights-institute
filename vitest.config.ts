import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '.vinext', '.wrangler'],
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
      ],
    },
  },
  resolve: {
    alias: {
      'cloudflare:workers': resolve(__dirname, './test/mocks/cloudflare-workers.ts'),
      '@/components': resolve(__dirname, './components'),
      '@/ui': resolve(__dirname, './components/ui'),
      '@/lib': resolve(__dirname, './lib'),
      '@/types': resolve(__dirname, './app/types'),
      '@/sample-data': resolve(__dirname, './app/sample-data'),
      '@': resolve(__dirname, './app'),
    },
  },
});
