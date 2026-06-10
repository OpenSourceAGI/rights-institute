import { defineConfig } from 'vite';
import vinext from 'vinext';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
      '@/lib': resolve(__dirname, './lib'),
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