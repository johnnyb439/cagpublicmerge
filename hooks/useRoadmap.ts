import { useState, useEffect, useMemo } from 'react'

interface RenewalReminder {
  certId: string
  certName: string
  expiryDate: string
  daysUntilExpiry: number
  urgency: 'low' | 'medium' | 'high'
  message: string
  color: string
}

interface CertUpgrade {
  currentCertId: string
  currentCertName: string
  recommendedCerts: {
    certId: string
    name: string
    timeToComplete: number
    salaryBoost: number
    prepResources?: any
  }[]
}

interface RoadmapData {
  renewals: RenewalReminder[]
  upgrades: CertUpgrade[]
  careerPathSuggestion?: {
    pathName: string
    remainingCerts: string[]
    estimatedTimeMonths: number
    projectedSalary: number
  }
}

interface UseRoadmapReturn {
  roadmap: RoadmapData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  urgentRenewals: RenewalReminder[]
  hasExpiring: boolean
}

/**
 * Custom hook for fetching and managing certification roadmap data
 *
 * @param userId - User ID to fetch roadmap for (optional, defaults to mock user)
 * @param autoRefresh - Whether to auto-refresh data every 5 minutes (default: true)
 * @returns Roadmap data, loading state, error, and helper functions
 *
 * @example
 * const { roadmap, loading, urgentRenewals } = useRoadmap('user-123')
 */
export function useRoadmap(userId?: string, autoRefresh = true): UseRoadmapReturn {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/roadmap', {
        headers: {
          'x-user-id': userId || 'mock-user-123',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch roadmap: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setRoadmap(data.recommendations)
      } else {
        throw new Error(data.error || 'Failed to load roadmap')
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchRoadmap()
  }, [userId])

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchRoadmap()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [userId, autoRefresh])

  // Computed values
  const urgentRenewals = useMemo(() => {
    if (!roadmap?.renewals) return []
    return roadmap.renewals.filter(r => r.urgency === 'high' || r.daysUntilExpiry <= 30)
  }, [roadmap])

  const hasExpiring = useMemo(() => {
    if (!roadmap?.renewals) return false
    return roadmap.renewals.some(r => r.daysUntilExpiry <= 90)
  }, [roadmap])

  return {
    roadmap,
    loading,
    error,
    refresh: fetchRoadmap,
    urgentRenewals,
    hasExpiring
  }
}

/**
 * Helper hook for displaying roadmap stats in dashboards
 */
export function useRoadmapStats(userId?: string) {
  const { roadmap, loading } = useRoadmap(userId)

  return useMemo(() => {
    if (loading || !roadmap) {
      return {
        totalActive: 0,
        expiringIn90Days: 0,
        recommendedNext: 0,
        estimatedSalaryIncrease: 0,
        loading
      }
    }

    const totalActive = roadmap.upgrades?.length || 0
    const expiringIn90Days = roadmap.renewals?.length || 0
    const recommendedNext = roadmap.upgrades?.reduce(
      (sum, upgrade) => sum + upgrade.recommendedCerts.length,
      0
    ) || 0

    const estimatedSalaryIncrease = roadmap.upgrades?.reduce((max, upgrade) => {
      const maxBoost = Math.max(...upgrade.recommendedCerts.map(c => c.salaryBoost))
      return Math.max(max, maxBoost)
    }, 0) || 0

    return {
      totalActive,
      expiringIn90Days,
      recommendedNext,
      estimatedSalaryIncrease,
      loading: false
    }
  }, [roadmap, loading])
}