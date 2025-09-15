'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Award,
  BarChart3,
  Activity,
  Calendar
} from 'lucide-react'

interface UserAnalytics {
  userId: string
  timeframe: string
  summary: {
    totalActivities: number
    uniqueDaysActive: number
    totalSessions: number
    totalPageViews: number
    interviewsCompleted: number
    jobsViewed: number
    subscriptionTier: string
  }
  charts: {
    dailyActivity: Array<{ date: string; activities: number }>
    featureUsage: Array<{ feature: string; usage: number }>
  }
}

interface PerformanceAnalytics {
  userId: string
  stats: {
    totalInterviews: number
    averageScore: number
    bestCategory: string
    improvementTrend: number
    timeSpentTotal: number
    completionRate: number
    difficultyProgression: {
      easy: number
      medium: number
      hard: number
    }
  }
  trends: {
    performanceOverTime: Array<{ date: string; score: number; category: string }>
    categoryBreakdown: Array<{ category: string; averageScore: number; totalInterviews: number }>
  }
  insights: {
    strongestArea: string
    improvementTrend: number
    recommendedFocus: string
  }
}

interface AnalyticsDashboardProps {
  userId?: string
  className?: string
}

export default function AnalyticsDashboard({ 
  userId = 'user_premium_1', 
  className = '' 
}: AnalyticsDashboardProps) {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [userId, timeframe])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch user activity analytics
      const userResponse = await fetch(`/api/analytics/user-activity?userId=${userId}&timeframe=${timeframe}`)
      const userData = await userResponse.json()
      
      // Fetch interview performance analytics
      const performanceResponse = await fetch(`/api/analytics/interview-performance?userId=${userId}`)
      const performanceData = await performanceResponse.json()
      
      if (userData.success) {
        setUserAnalytics(userData.analytics)
      }
      
      if (performanceData.success) {
        setPerformanceAnalytics(performanceData.performance)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatScore = (score: number) => {
    return (score * 20).toFixed(1) // Convert 1-5 scale to percentage
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Activity className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Interviews */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Interviews</p>
              <p className="text-2xl font-bold text-blue-900">
                {performanceAnalytics?.stats.totalInterviews || 0}
              </p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Average Score</p>
              <p className="text-2xl font-bold text-green-900">
                {performanceAnalytics ? formatScore(performanceAnalytics.stats.averageScore) : '0'}%
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Time Spent */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Time Spent</p>
              <p className="text-2xl font-bold text-purple-900">
                {performanceAnalytics ? Math.round(performanceAnalytics.stats.timeSpentTotal / 60) : 0}h
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {/* Activity Level */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Activities</p>
              <p className="text-2xl font-bold text-orange-900">
                {userAnalytics?.summary.totalActivities || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      {performanceAnalytics && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strongest Area */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Strongest Area</h4>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-lg font-semibold text-blue-600 capitalize">
                {performanceAnalytics.insights.strongestArea || 'Keep practicing!'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {performanceAnalytics.insights.recommendedFocus}
              </p>
            </div>

            {/* Improvement Trend */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Improvement Trend</h4>
                {getTrendIcon(performanceAnalytics.insights.improvementTrend)}
              </div>
              <p className={`text-lg font-semibold ${getTrendColor(performanceAnalytics.insights.improvementTrend)}`}>
                {performanceAnalytics.insights.improvementTrend > 0 ? '+' : ''}
                {performanceAnalytics.insights.improvementTrend.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {performanceAnalytics.insights.improvementTrend > 0 
                  ? 'You\'re improving!' 
                  : performanceAnalytics.insights.improvementTrend < 0 
                    ? 'Keep practicing'
                    : 'Steady performance'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {performanceAnalytics?.trends.categoryBreakdown && performanceAnalytics.trends.categoryBreakdown.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-3">
            {performanceAnalytics.trends.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 capitalize">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatScore(category.averageScore)}%</p>
                  <p className="text-sm text-gray-500">{category.totalInterviews} interviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {userAnalytics && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{userAnalytics.summary.totalSessions}</p>
              <p className="text-sm text-blue-700">Sessions</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{userAnalytics.summary.totalPageViews}</p>
              <p className="text-sm text-green-700">Page Views</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{userAnalytics.summary.jobsViewed}</p>
              <p className="text-sm text-purple-700">Jobs Viewed</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{userAnalytics.summary.uniqueDaysActive}</p>
              <p className="text-sm text-orange-700">Active Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}