'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initWebVitals } from '@/lib/performance/web-vitals'
import { getPerformanceMonitor, measurePageLoad } from '@/lib/performance/metrics'

export default function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals()
    
    // Measure page load performance
    measurePageLoad()

    // Track route changes
    const monitor = getPerformanceMonitor()
    monitor.recordMetric('route_change', 0, 'count')

    return () => {
      // Cleanup if needed
    }
  }, [pathname])

  return <>{children}</>
}