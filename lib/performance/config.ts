// Performance optimization configuration

export const performanceConfig = {
  // Image optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Request caching
  cache: {
    // API routes cache configuration
    api: {
      jobs: 60 * 5, // 5 minutes
      profile: 60 * 10, // 10 minutes
      static: 60 * 60 * 24, // 24 hours
    },
    // Static assets
    static: {
      images: 60 * 60 * 24 * 365, // 1 year
      fonts: 60 * 60 * 24 * 365, // 1 year
      styles: 60 * 60 * 24 * 30, // 30 days
      scripts: 60 * 60 * 24 * 30, // 30 days
    }
  },

  // Prefetch configuration
  prefetch: {
    // Routes to prefetch on idle
    routes: ['/dashboard', '/jobs', '/resources'],
    // Delay before prefetching (ms)
    delay: 2000,
  },

  // Bundle splitting
  bundleSplitting: {
    // Vendor chunks
    vendor: ['react', 'react-dom', 'next'],
    // Common chunks
    common: ['@/components/ui', '@/lib/utils'],
  }
}