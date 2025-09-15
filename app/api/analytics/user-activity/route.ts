import { NextRequest, NextResponse } from 'next/server'

// Mock analytics database (in production, use real database)
const userActivityStore = new Map<string, Array<{
  timestamp: Date
  action: string
  page: string
  metadata?: any
}>>()

const userStatsStore = new Map<string, {
  totalSessions: number
  totalPageViews: number
  averageSessionTime: number
  lastActiveDate: Date
  favoriteFeatures: string[]
  interviewsCompleted: number
  jobsViewed: number
  subscriptionTier: string
}>()

export async function POST(request: NextRequest) {
  try {
    const { userId, action, page, metadata } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId and action are required' },
        { status: 400 }
      )
    }

    // Record the activity
    const activity = {
      timestamp: new Date(),
      action,
      page: page || 'unknown',
      metadata: metadata || {}
    }

    // Add to user's activity log
    if (!userActivityStore.has(userId)) {
      userActivityStore.set(userId, [])
    }
    userActivityStore.get(userId)!.push(activity)

    // Update user stats
    let userStats = userStatsStore.get(userId) || {
      totalSessions: 0,
      totalPageViews: 0,
      averageSessionTime: 0,
      lastActiveDate: new Date(),
      favoriteFeatures: [],
      interviewsCompleted: 0,
      jobsViewed: 0,
      subscriptionTier: 'free'
    }

    // Update stats based on action
    switch (action) {
      case 'page_view':
        userStats.totalPageViews++
        break
      case 'session_start':
        userStats.totalSessions++
        break
      case 'interview_completed':
        userStats.interviewsCompleted++
        break
      case 'job_viewed':
        userStats.jobsViewed++
        break
      case 'feature_used':
        if (metadata?.feature) {
          const feature = metadata.feature
          const index = userStats.favoriteFeatures.indexOf(feature)
          if (index === -1) {
            userStats.favoriteFeatures.push(feature)
          }
        }
        break
    }

    userStats.lastActiveDate = new Date()
    userStatsStore.set(userId, userStats)

    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully',
      activity: {
        action,
        page,
        timestamp: activity.timestamp
      }
    })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track activity',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeframe = searchParams.get('timeframe') || '7d' // 7d, 30d, 90d

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter required' },
        { status: 400 }
      )
    }

    // Get user activities
    const activities = userActivityStore.get(userId) || []
    const userStats = userStatsStore.get(userId) || {
      totalSessions: 0,
      totalPageViews: 0,
      averageSessionTime: 0,
      lastActiveDate: new Date(),
      favoriteFeatures: [],
      interviewsCompleted: 0,
      jobsViewed: 0,
      subscriptionTier: 'free'
    }

    // Filter activities by timeframe
    const now = new Date()
    const timeframeDays = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 7
    const cutoffDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000))
    
    const recentActivities = activities.filter(activity => 
      activity.timestamp > cutoffDate
    )

    // Calculate engagement metrics
    const dailyActivity = new Map<string, number>()
    const featureUsage = new Map<string, number>()
    
    recentActivities.forEach(activity => {
      const day = activity.timestamp.toISOString().split('T')[0]
      dailyActivity.set(day, (dailyActivity.get(day) || 0) + 1)
      
      if (activity.action === 'feature_used' && activity.metadata?.feature) {
        const feature = activity.metadata.feature
        featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1)
      }
    })

    return NextResponse.json({
      success: true,
      analytics: {
        userId,
        timeframe,
        summary: {
          totalActivities: recentActivities.length,
          uniqueDaysActive: dailyActivity.size,
          ...userStats
        },
        charts: {
          dailyActivity: Array.from(dailyActivity.entries()).map(([date, count]) => ({
            date,
            activities: count
          })),
          featureUsage: Array.from(featureUsage.entries()).map(([feature, count]) => ({
            feature,
            usage: count
          }))
        },
        recentActivities: recentActivities.slice(-10) // Last 10 activities
      }
    })

  } catch (error) {
    console.error('Analytics retrieval error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}