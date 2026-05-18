/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['i.imgur.com'],
    unoptimized: true,
  },
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: false,
}

module.exports = nextConfig

// OpenNext bindings during `next dev` so getCloudflareContext()/env work locally.
if (process.env.NODE_ENV !== 'production') {
  import('@opennextjs/cloudflare').then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev()
  }).catch(() => {})
}
