import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP, CLSMetric, FCPMetric, FIDMetric, LCPMetric, TTFBMetric, INPMetric } from 'web-vitals'
import { getPerformanceMonitor } from './metrics'

export interface WebVitalsScore {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: {
    good: number
    poor: number
  }
}

// Web Vitals thresholds based on Google's recommendations
const thresholds = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
}

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[metric as keyof typeof thresholds]
  if (!threshold) return 'needs-improvement'
  
  if (value <= threshold.good) return 'good'
  if (value > threshold.poor) return 'poor'
  return 'needs-improvement'
}

function formatMetricValue(metric: string, value: number): number {
  // CLS is a unitless score, others are in milliseconds
  return metric === 'CLS' ? Math.round(value * 1000) / 1000 : Math.round(value)
}

export function initWebVitals() {
  const monitor = getPerformanceMonitor()

  // First Contentful Paint
  onFCP((metric: FCPMetric) => {
    const value = formatMetricValue('FCP', metric.value)
    monitor.recordMetric('web_vitals_fcp', value, 'ms')
    sendWebVitalToAnalytics({
      metric: 'FCP',
      value,
      rating: getRating('FCP', value),
      threshold: thresholds.FCP
    })
  })

  // Largest Contentful Paint
  onLCP((metric: LCPMetric) => {
    const value = formatMetricValue('LCP', metric.value)
    monitor.recordMetric('web_vitals_lcp', value, 'ms')
    sendWebVitalToAnalytics({
      metric: 'LCP',
      value,
      rating: getRating('LCP', value),
      threshold: thresholds.LCP
    })
  })

  // First Input Delay
  onFID((metric: FIDMetric) => {
    const value = formatMetricValue('FID', metric.value)
    monitor.recordMetric('web_vitals_fid', value, 'ms')
    sendWebVitalToAnalytics({
      metric: 'FID',
      value,
      rating: getRating('FID', value),
      threshold: thresholds.FID
    })
  })

  // Cumulative Layout Shift
  onCLS((metric: CLSMetric) => {
    const value = formatMetricValue('CLS', metric.value)
    monitor.recordMetric('web_vitals_cls', value, 'score')
    sendWebVitalToAnalytics({
      metric: 'CLS',
      value,
      rating: getRating('CLS', value),
      threshold: thresholds.CLS
    })
  })

  // Time to First Byte
  onTTFB((metric: TTFBMetric) => {
    const value = formatMetricValue('TTFB', metric.value)
    monitor.recordMetric('web_vitals_ttfb', value, 'ms')
    sendWebVitalToAnalytics({
      metric: 'TTFB',
      value,
      rating: getRating('TTFB', value),
      threshold: thresholds.TTFB
    })
  })

  // Interaction to Next Paint (INP)
  onINP((metric: INPMetric) => {
    const value = formatMetricValue('INP', metric.value)
    monitor.recordMetric('web_vitals_inp', value, 'ms')
    sendWebVitalToAnalytics({
      metric: 'INP',
      value,
      rating: getRating('INP', value),
      threshold: thresholds.INP
    })
  })
}

function sendWebVitalToAnalytics(score: WebVitalsScore) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: score.metric,
      value: score.value,
      metric_rating: score.rating,
      non_interaction: true
    })
  }

  // Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/web-vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...score,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(() => {
      // Silently fail
    })
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = score.rating === 'good' ? '✅' : score.rating === 'poor' ? '❌' : '⚠️'
    console.log(`${emoji} ${score.metric}: ${score.value} (${score.rating})`)
  }
}