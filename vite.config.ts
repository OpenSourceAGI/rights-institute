import { defineConfig } from 'vite';
import vinext from 'vinext';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Workaround: vinext's local-fonts plugin skips its own shim files via a
    // startsWith guard, but on Windows path.resolve returns backslashes while
    // Vite normalizes IDs to forward slashes — the guard misses and the plugin
    // treats the comment `src: './my-font.woff2'` in font-local.js as real code.
    {
      name: 'vinext-font-shim-fix',
      enforce: 'pre',
      resolveId(id, importer) {
        if (id === './my-font.woff2' && importer && importer.replace(/\\/g, '/').includes('vinext') && importer.replace(/\\/g, '/').includes('font-local')) {
          return '\0virtual:vinext-font-placeholder';
        }
      },
      load(id) {
        if (id === '\0virtual:vinext-font-placeholder') return 'export default ""';
      },
    },
    fumadocsMdx(),
    tailwindcss(),
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['globe.gl', 'three']
  },
  resolve: {
    alias: {
      // Specific aliases must precede the bare '@' alias — Vite matches them
      // in insertion order, so '@' first would swallow '@/lib/*' etc.
      '@/components': resolve(__dirname, './components'),
      '@/ui': resolve(__dirname, './components/ui'),
      '@/lib': resolve(__dirname, './lib'),
      '@/types': resolve(__dirname, './app/types'),
      '@/sample-data': resolve(__dirname, './app/sample-data'),
      '@': resolve(__dirname, './app'),
      'three/webgpu': 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js',
      'three/tsl': 'three/examples/jsm/nodes/Nodes.js'
    }
  },
  define: {
    global: 'globalThis',
  },
  ssr: {
    external: ['@libsql/client'],
  },
  server: {
    port: 9000,
    host: true,
  },
});