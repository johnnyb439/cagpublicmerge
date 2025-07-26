import { useEffect, useRef, useCallback } from 'react'
import { getPerformanceMonitor } from '@/lib/performance/metrics'

interface LoadingPerformanceOptions {
  componentName: string
  trackRender?: boolean
  trackData?: boolean
  trackImages?: boolean
}

export function useLoadingPerformance(options: LoadingPerformanceOptions) {
  const { componentName, trackRender = true, trackData = false, trackImages = false } = options
  const renderStartTime = useRef<number>(0)
  const dataFetchStartTime = useRef<number>(0)
  const monitor = getPerformanceMonitor()

  // Track component render time
  useEffect(() => {
    if (trackRender) {
      renderStartTime.current = performance.now()
      
      // Use requestAnimationFrame to measure after render
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStartTime.current
        monitor.recordMetric(`${componentName}_render`, renderTime, 'ms')
      })
    }
  }, [componentName, trackRender, monitor])

  // Track data fetching
  const startDataFetch = useCallback(() => {
    if (trackData) {
      dataFetchStartTime.current = performance.now()
    }
  }, [trackData])

  const endDataFetch = useCallback((success: boolean = true) => {
    if (trackData && dataFetchStartTime.current > 0) {
      const fetchTime = performance.now() - dataFetchStartTime.current
      const metricName = success ? `${componentName}_data_fetch` : `${componentName}_data_fetch_error`
      monitor.recordMetric(metricName, fetchTime, 'ms')
      dataFetchStartTime.current = 0
    }
  }, [componentName, trackData, monitor])

  // Track image loading
  const trackImageLoad = useCallback((imageName?: string) => {
    const name = imageName ? `${componentName}_image_${imageName}` : `${componentName}_image`
    return (event: any) => {
      if (trackImages && event.target) {
        const loadTime = performance.now() - renderStartTime.current
        monitor.recordMetric(name, loadTime, 'ms')
      }
    }
  }, [componentName, trackImages, monitor])

  return {
    startDataFetch,
    endDataFetch,
    trackImageLoad
  }
}

// Hook for tracking API calls
export function useAPIPerformance() {
  const monitor = getPerformanceMonitor()

  const trackAPI = useCallback(async <T,>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    return monitor.measureAsyncExecutionTime(apiName, apiCall)
  }, [monitor])

  return { trackAPI }
}

// Hook for tracking user interactions
export function useInteractionTracking() {
  const monitor = getPerformanceMonitor()
  const interactionStartTime = useRef<number>(0)

  const startInteraction = useCallback((interactionName: string) => {
    interactionStartTime.current = performance.now()
    monitor.recordMetric(`${interactionName}_start`, 0, 'count')
  }, [monitor])

  const endInteraction = useCallback((interactionName: string, success: boolean = true) => {
    if (interactionStartTime.current > 0) {
      const duration = performance.now() - interactionStartTime.current
      const metricName = success ? `${interactionName}_duration` : `${interactionName}_error`
      monitor.recordMetric(metricName, duration, 'ms')
      interactionStartTime.current = 0
    }
  }, [monitor])

  return { startInteraction, endInteraction }
}