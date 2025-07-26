'use client'

import { useEffect } from 'react'

export default function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Web Vitals monitoring
      try {
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint')
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
        if (fcp) {
          console.log(`FCP: ${fcp.startTime.toFixed(2)}ms`)
        }

        // Largest Contentful Paint
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`)
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            console.log(`FID: ${entry.processingStart - entry.startTime}ms`)
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              console.log(`CLS: ${clsValue.toFixed(4)}`)
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Memory usage (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory
          console.log(`Memory Usage: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`)
        }

        // Clean up
        return () => {
          observer.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
        }
      } catch (error) {
        console.error('Performance monitoring error:', error)
      }
    }
  }, [])

  return null
}