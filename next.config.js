/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ships TypeScript source rather than a build output, like the workspace
  // packages it sits alongside, so Next has to compile it.
  transpilePackages: ['legal-terms-privacy-policy'],
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

export default nextConfig
