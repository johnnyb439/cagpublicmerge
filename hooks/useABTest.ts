'use client'

import { useEffect, useState } from 'react'
import { experiments, matchesTargetAudience, Variant } from '@/lib/ab-testing/experiments'
import { trackEvent } from '@/components/analytics/GoogleAnalytics'

interface ABTestResult<T = any> {
  variant: Variant | null
  isLoading: boolean
  trackConversion: (metric: string, value?: number) => void
  changes: T
}

export function useABTest<T = any>(experimentId: string): ABTestResult<T> {
  const [variant, setVariant] = useState<Variant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const experiment = experiments.find(exp => exp.id === experimentId)
    
    if (!experiment || experiment.status !== 'running') {
      setIsLoading(false)
      return
    }

    // Get or create user variant assignment
    const storageKey = `ab_test_${experimentId}`
    let assignedVariantId = localStorage.getItem(storageKey)

    if (!assignedVariantId) {
      // Check if user matches target audience
      const userContext = {
        isNewUser: !localStorage.getItem('returning_user'),
        clearanceLevel: localStorage.getItem('user_clearance') || undefined,
        device: getDeviceType()
      }

      if (!matchesTargetAudience(experiment.targetAudience, userContext)) {
        // User doesn't match audience, use control
        assignedVariantId = 'control'
      } else {
        // Randomly assign variant based on weights
        assignedVariantId = assignVariant(experiment.variants)
      }

      localStorage.setItem(storageKey, assignedVariantId)
      
      // Track experiment exposure
      trackEvent('ab_test_exposure', 'experiment', experimentId, assignedVariantId as any)
    }

    const selectedVariant = experiment.variants.find(v => v.id === assignedVariantId)
    setVariant(selectedVariant || null)
    setIsLoading(false)
  }, [experimentId])

  const trackConversion = (metric: string, value?: number) => {
    if (!variant) return
    
    trackEvent(
      'ab_test_conversion',
      'experiment',
      `${experimentId}_${metric}`,
      value
    )
  }

  return {
    variant,
    isLoading,
    trackConversion,
    changes: (variant?.changes || {}) as T
  }
}

// Helper function to assign variant based on weights
function assignVariant(variants: Variant[]): string {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
  const random = Math.random() * totalWeight
  
  let cumulative = 0
  for (const variant of variants) {
    cumulative += variant.weight
    if (random <= cumulative) {
      return variant.id
    }
  }
  
  return variants[0].id // Fallback to first variant
}

// Helper function to detect device type
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Hook for tracking metrics
export function useABTestMetrics(experimentId: string) {
  const trackMetric = (metric: string, value?: number) => {
    trackEvent(
      'ab_test_metric',
      'experiment',
      `${experimentId}_${metric}`,
      value
    )
  }

  return { trackMetric }
}