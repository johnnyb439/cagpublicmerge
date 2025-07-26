// Performance metrics collection utility
export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

export interface WebVitalsMetrics {
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
  INP?: number // Interaction to Next Paint
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private webVitals: WebVitalsMetrics = {}
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Observe paint timing
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.webVitals.FCP = Math.round(entry.startTime)
              this.recordMetric('FCP', entry.startTime, 'ms')
            }
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        this.observers.set('paint', paintObserver)

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.webVitals.LCP = Math.round(lastEntry.startTime)
          this.recordMetric('LCP', lastEntry.startTime, 'ms')
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)

        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidValue = entry.processingStart - entry.startTime
            this.webVitals.FID = Math.round(fidValue)
            this.recordMetric('FID', fidValue, 'ms')
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)

        // Observe layout shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.webVitals.CLS = Math.round(clsValue * 1000) / 1000
          this.recordMetric('CLS', clsValue, 'score')
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.set('cls', clsObserver)
      } catch (e) {
        console.warn('Performance Observer not fully supported:', e)
      }
    }

    // Measure navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navTiming) {
        this.webVitals.TTFB = Math.round(navTiming.responseStart - navTiming.requestStart)
        this.recordMetric('TTFB', this.webVitals.TTFB, 'ms')
      }
    }
  }

  recordMetric(name: string, value: number, unit: string) {
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value * 100) / 100,
      unit,
      timestamp: Date.now()
    }
    this.metrics.push(metric)
    this.sendMetricToAnalytics(metric)
  }

  measureExecutionTime<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, 'ms')
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, 'ms')
      throw error
    }
  }

  async measureAsyncExecutionTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, 'ms')
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, 'ms')
      throw error
    }
  }

  private sendMetricToAnalytics(metric: PerformanceMetric) {
    // Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        value: metric.value,
        metric_unit: metric.unit,
        page_path: window.location.pathname
      })
    }

    // Also send to custom endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          page: window.location.pathname,
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // Silently fail - don't impact user experience
      })
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals }
  }

  clearMetrics() {
    this.metrics = []
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor
}

// Utility functions
export function reportWebVitals(metric: any) {
  const monitor = getPerformanceMonitor()
  monitor.recordMetric(metric.name, metric.value, 'ms')
}

export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    setTimeout(() => {
      const monitor = getPerformanceMonitor()
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navTiming) {
        monitor.recordMetric('page_load_time', navTiming.loadEventEnd - navTiming.fetchStart, 'ms')
        monitor.recordMetric('dom_content_loaded', navTiming.domContentLoadedEventEnd - navTiming.fetchStart, 'ms')
        monitor.recordMetric('dns_lookup', navTiming.domainLookupEnd - navTiming.domainLookupStart, 'ms')
        monitor.recordMetric('tcp_connection', navTiming.connectEnd - navTiming.connectStart, 'ms')
      }
    }, 0)
  })
}