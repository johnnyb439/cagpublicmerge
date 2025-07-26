# Performance Optimizations

## Overview
This document outlines the performance optimizations implemented for the Cleared Advisory Group website to ensure fast load times and optimal user experience.

## 1. Code Splitting

### Implementation
- Dynamic imports for heavy components
- Route-based code splitting via Next.js
- Component-level splitting for large features

### Usage
```typescript
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Disable SSR for client-only components
})
```

### Files Created
- `/utils/dynamicImports.ts` - Centralized dynamic import definitions

## 2. Service Worker & Offline Support

### Features
- Offline page fallback
- Asset caching for static resources
- Background sync for form submissions
- Update notifications

### Files Created
- `/public/sw.js` - Service worker implementation
- `/public/manifest.json` - PWA manifest
- `/app/offline/page.tsx` - Offline fallback page
- `/hooks/useServiceWorker.ts` - Service worker registration
- `/components/ServiceWorkerProvider.tsx` - Provider component

### Configuration
The service worker is automatically registered in production and caches:
- Static pages
- CSS and JavaScript bundles
- Images and fonts
- API responses (with expiration)

## 3. Redis Caching

### Implementation
- Redis client with in-memory fallback
- Cache decorators for methods
- API route caching middleware

### Usage
```typescript
// Using cache wrapper
const data = await withCache(
  'cache-key',
  async () => fetchExpensiveData(),
  300 // TTL in seconds
)

// Using decorator
@Cacheable(600)
async getUserProfile(userId: string) {
  // Method implementation
}
```

### Files Created
- `/lib/redis/client.ts` - Redis client and cache manager

### Environment Variables
```env
ENABLE_REDIS=true
REDIS_URL=redis://localhost:6379
```

## 4. Bundle Size Optimization

### Next.js Configuration
- SWC minification enabled
- CSS optimization
- Package import optimization for common libraries
- Production source maps disabled

### Bundle Analysis
Run `npm run analyze` to generate bundle analysis report

### Webpack Optimizations
- Tree shaking enabled
- Module concatenation
- Chunk splitting strategy

## 5. Image Lazy Loading

### Components
- `OptimizedImage` - Wrapper around Next.js Image with loading states
- `LazyLoad` - Generic lazy loading wrapper using Intersection Observer

### Usage
```typescript
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority={false} // Lazy load by default
/>

<LazyLoad placeholder={<Skeleton />}>
  <ExpensiveComponent />
</LazyLoad>
```

### Files Created
- `/components/ui/OptimizedImage.tsx` - Optimized image component
- `/components/LazyLoad.tsx` - Lazy loading wrapper
- `/hooks/useIntersectionObserver.ts` - Intersection observer hook

## 6. Performance Monitoring

### Web Vitals Tracking
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Files Created
- `/components/PerformanceMonitor.tsx` - Performance monitoring component

## Performance Best Practices

### 1. Images
- Use WebP format when possible
- Implement responsive images with srcset
- Lazy load below-the-fold images
- Use priority loading for hero images

### 2. JavaScript
- Minimize third-party scripts
- Use dynamic imports for large libraries
- Defer non-critical scripts
- Remove unused dependencies

### 3. CSS
- Use CSS modules or styled-components
- Minimize CSS-in-JS runtime overhead
- Remove unused CSS with PurgeCSS
- Use critical CSS inlining

### 4. Caching Strategy
- Static assets: Cache for 1 year
- API responses: Cache based on data freshness needs
- HTML pages: Cache with revalidation
- Use ETags for conditional requests

### 5. Server-Side Optimizations
- Enable Gzip/Brotli compression
- Use HTTP/2 or HTTP/3
- Implement early hints
- Use CDN for static assets

## Monitoring and Testing

### Tools
1. **Lighthouse** - Run in Chrome DevTools
2. **WebPageTest** - Detailed performance analysis
3. **Bundle Analyzer** - `npm run analyze`
4. **Chrome DevTools** - Performance profiling

### Performance Budgets
- FCP: < 1.8s
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Total Bundle Size: < 200KB (gzipped)

### Regular Maintenance
1. Weekly bundle size checks
2. Monthly performance audits
3. Quarterly dependency updates
4. Annual architecture review

## Future Optimizations

### Planned Improvements
1. Implement React Server Components
2. Add Edge caching with Vercel
3. Optimize font loading strategy
4. Implement predictive prefetching
5. Add resource hints (preconnect, prefetch)

### Experimental Features
- Partial hydration
- Islands architecture
- Streaming SSR
- React Suspense boundaries