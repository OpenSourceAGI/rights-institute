/** @type {import('next').NextConfig} */
const nextConfig = {
  // These ship TypeScript source rather than a build output, so Next has to
  // compile them.
  transpilePackages: [
    'legal-terms-privacy-policy',
    '@rights/contract-builder',
    '@rights/credit',
    '@rights/innovation-timeline',
    '@rights/investor-rank',
    '@rights/prosper-license',
    '@rights/site-shell',
    '@rights/startup-tools',
  ],
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
