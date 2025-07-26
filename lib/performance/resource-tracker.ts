import { getPerformanceMonitor } from './metrics'

export interface ResourceMetrics {
  scripts: number
  stylesheets: number
  images: number
  fonts: number
  total: number
  totalSize: number
  cachedResources: number
  cacheHitRate: number
}

export class ResourceTracker {
  private monitor = getPerformanceMonitor()

  analyzeResources(): ResourceMetrics {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return this.getEmptyMetrics()
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const metrics: ResourceMetrics = {
      scripts: 0,
      stylesheets: 0,
      images: 0,
      fonts: 0,
      total: resources.length,
      totalSize: 0,
      cachedResources: 0,
      cacheHitRate: 0
    }

    resources.forEach(resource => {
      // Categorize resources
      if (resource.name.match(/\.(js|mjs)$/i)) {
        metrics.scripts++
      } else if (resource.name.match(/\.css$/i)) {
        metrics.stylesheets++
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        metrics.images++
      } else if (resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
        metrics.fonts++
      }

      // Calculate sizes (when available)
      if (resource.transferSize !== undefined) {
        metrics.totalSize += resource.transferSize
        
        // Check if resource was cached (transferSize is 0 for cached resources)
        if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
          metrics.cachedResources++
        }
      }
    })

    // Calculate cache hit rate
    if (metrics.total > 0) {
      metrics.cacheHitRate = Math.round((metrics.cachedResources / metrics.total) * 100)
    }

    // Record metrics
    this.monitor.recordMetric('resource_count', metrics.total, 'count')
    this.monitor.recordMetric('resource_size', metrics.totalSize / 1024, 'KB')
    this.monitor.recordMetric('cache_hit_rate', metrics.cacheHitRate, '%')

    return metrics
  }

  trackLongTasks(threshold: number = 50) {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log long tasks
          this.monitor.recordMetric('long_task', entry.duration, 'ms')
          
          // In development, warn about long tasks
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Long task detected: ${entry.duration}ms`, entry)
          }
        }
      })

      observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // Long task API might not be supported
    }
  }

  analyzeBundleSizes() {
    if (typeof window === 'undefined') return

    const scripts = performance.getEntriesByType('resource').filter(
      entry => entry.name.match(/\.(js|mjs)$/i)
    ) as PerformanceResourceTiming[]

    const bundles = scripts.map(script => {
      const urlParts = script.name.split('/')
      const filename = urlParts[urlParts.length - 1]
      
      return {
        name: filename,
        size: script.transferSize || 0,
        duration: script.duration,
        cached: script.transferSize === 0 && script.decodedBodySize > 0
      }
    })

    // Sort by size
    bundles.sort((a, b) => b.size - a.size)

    // Log largest bundles in development
    if (process.env.NODE_ENV === 'development' && bundles.length > 0) {
      console.groupCollapsed('📦 Bundle Sizes')
      bundles.slice(0, 5).forEach(bundle => {
        const sizeInKB = (bundle.size / 1024).toFixed(2)
        const emoji = bundle.cached ? '💾' : '🌐'
        console.log(`${emoji} ${bundle.name}: ${sizeInKB}KB (${bundle.duration.toFixed(2)}ms)`)
      })
      console.groupEnd()
    }

    return bundles
  }

  private getEmptyMetrics(): ResourceMetrics {
    return {
      scripts: 0,
      stylesheets: 0,
      images: 0,
      fonts: 0,
      total: 0,
      totalSize: 0,
      cachedResources: 0,
      cacheHitRate: 0
    }
  }
}

// Singleton instance
let resourceTracker: ResourceTracker | null = null

export function getResourceTracker(): ResourceTracker {
  if (!resourceTracker) {
    resourceTracker = new ResourceTracker()
  }
  return resourceTracker
}