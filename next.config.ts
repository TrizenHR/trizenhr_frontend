import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Tree-shake icon imports — faster nav / smaller client bundles
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Cache busting configuration
  generateBuildId: async () => {
    // Use BUILD_ID from environment or timestamp for cache busting
    // In production, you can set BUILD_ID env var for consistent builds
    return process.env.BUILD_ID || `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
  
  // Headers for cache control
  async headers() {
    return [
      {
        // Static assets - long cache with versioning
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Images and assets - medium cache
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        // API routes - no cache
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        // HTML pages - short cache for updates
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Compress responses
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
