'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Zap, Globe, Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface WebVitalsMetrics {
  FCP?: number;
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTFB?: number;
}

interface PerformanceData {
  webVitals: WebVitalsMetrics
  resources: {
    total: number
    scripts: number
    stylesheets: number
    images: number
    totalSize: number
    cacheHitRate: number
  }
  metrics: Array<{
    name: string
    value: number
    unit: string
  }>
}

export default function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const updatePerformanceData = () => {
      // Mock performance data for development
      const mockData: PerformanceData = {
        webVitals: {
          FCP: 1200,
          LCP: 2100,
          FID: 80,
          CLS: 0.05,
          TTFB: 600
        },
        resources: {
          total: 45,
          scripts: 12,
          stylesheets: 8,
          images: 15,
          totalSize: 2048000,
          cacheHitRate: 85
        },
        metrics: [
          { name: 'Page Load', value: 1200, unit: 'ms' },
          { name: 'DOM Ready', value: 800, unit: 'ms' },
          { name: 'Interactive', value: 1500, unit: 'ms' }
        ]
      }
      
      setPerformanceData(mockData)
    }

    // Initial update
    updatePerformanceData()

    // Update every 5 seconds
    const interval = setInterval(updatePerformanceData, 5000)

    return () => clearInterval(interval)
  }, [isClient])

  const getWebVitalStatus = (metric: string, value: number | undefined) => {
    if (value === undefined) return { color: 'text-gray-500', icon: AlertTriangle, status: 'Pending' }
    
    const thresholds: Record<string, { good: number; poor: number }> = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return { color: 'text-gray-500', icon: AlertTriangle, status: 'Unknown' }

    if (value <= threshold.good) {
      return { color: 'text-green-600', icon: CheckCircle, status: 'Good' }
    } else if (value > threshold.poor) {
      return { color: 'text-red-600', icon: AlertTriangle, status: 'Poor' }
    } else {
      return { color: 'text-yellow-600', icon: TrendingUp, status: 'Needs Improvement' }
    }
  }

  if (!isClient || !performanceData) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle performance dashboard"
      >
        <Activity className="w-6 h-6" />
      </button>

      {/* Dashboard */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isVisible ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed top-0 right-0 w-96 h-full bg-white dark:bg-gray-900 shadow-2xl z-40 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Performance
            </h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Web Vitals */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Core Web Vitals
            </h3>
            <div className="space-y-3">
              {Object.entries({
                FCP: 'First Contentful Paint',
                LCP: 'Largest Contentful Paint',
                FID: 'First Input Delay',
                CLS: 'Cumulative Layout Shift',
                TTFB: 'Time to First Byte'
              }).map(([key, label]) => {
                const value = performanceData.webVitals[key as keyof WebVitalsMetrics]
                const status = getWebVitalStatus(key, value)
                const StatusIcon = status.icon

                return (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                      <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${status.color}`}>
                        {value !== undefined ? (
                          key === 'CLS' ? value.toFixed(3) : `${value}ms`
                        ) : 'Measuring...'}
                      </span>
                      <span className={`text-xs ${status.color}`}>
                        {status.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resource Metrics */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Resource Loading
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceData.resources.total}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Resources
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(performanceData.resources.totalSize / 1024).toFixed(1)}KB
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Size
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {performanceData.resources.cacheHitRate}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Cache Hit Rate
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">JS:</span>
                    <span className="font-medium">{performanceData.resources.scripts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">CSS:</span>
                    <span className="font-medium">{performanceData.resources.stylesheets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Images:</span>
                    <span className="font-medium">{performanceData.resources.images}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Recent Metrics
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {performanceData.metrics.map((metric, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {metric.name}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}