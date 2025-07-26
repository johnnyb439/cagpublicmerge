import { NextRequest, NextResponse } from 'next/server'
import { JobApplication, ApplicationStats } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'
import { withRateLimit } from '@/lib/api/withRateLimit'

// GET /api/applications/stats - Get application statistics
export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('range') // '30d', '90d', '1y', 'all'
    
    // Filter applications by date range if specified
    let filteredApps = mockDatabase.applications
    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange.replace('d', '').replace('y', '')) * (dateRange.includes('y') ? 365 : 1)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      filteredApps = mockDatabase.applications.filter(app => 
        new Date(app.dateApplied) >= cutoffDate
      )
    }

    const total = filteredApps.length
    const active = filteredApps.filter(a => 
      ['applied', 'screening', 'interview_scheduled', 'interviewing'].includes(a.status)
    ).length
    
    const interviews = filteredApps.filter(a => 
      ['interview_scheduled', 'interviewing'].includes(a.status)
    ).length
    
    const offers = filteredApps.filter(a => a.status === 'offer_received').length
    const rejected = filteredApps.filter(a => a.status === 'rejected').length
    const accepted = filteredApps.filter(a => a.status === 'accepted').length
    
    // Calculate response rate
    const withResponse = filteredApps.filter(a => a.status !== 'applied').length
    const responseRate = total > 0 ? (withResponse / total) * 100 : 0
    
    // Calculate interview conversion rate
    const interviewCount = filteredApps.filter(a => 
      ['interview_scheduled', 'interviewing', 'offer_received', 'accepted'].includes(a.status)
    ).length
    const interviewConversionRate = withResponse > 0 ? (interviewCount / withResponse) * 100 : 0

    // Calculate average time to response (mock calculation)
    const avgTimeToResponse = withResponse > 0 ? 
      Math.round(withResponse * 7 / Math.max(withResponse, 1)) : 0

    // Company breakdown
    const companyCounts = filteredApps.reduce((acc, app) => {
      acc[app.company] = (acc[app.company] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Status breakdown over time (last 30 days)
    const statusTimeline = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayApps = filteredApps.filter(app => app.dateApplied === dateStr)
      statusTimeline.push({
        date: dateStr,
        applied: dayApps.length,
        responses: dayApps.filter(a => a.status !== 'applied').length
      })
    }

    // Clearance level breakdown
    const clearanceCounts = filteredApps.reduce((acc, app) => {
      acc[app.clearanceRequired] = (acc[app.clearanceRequired] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const stats: ApplicationStats & {
      breakdown: {
        byCompany: Record<string, number>
        byClearance: Record<string, number>
        statusTimeline: Array<{ date: string; applied: number; responses: number }>
      }
      totals: {
        accepted: number
        withdrawn: number
      }
    } = {
      total,
      active,
      interviews,
      offers,
      rejected,
      responseRate: Math.round(responseRate * 10) / 10,
      avgTimeToResponse,
      interviewConversionRate: Math.round(interviewConversionRate * 10) / 10,
      breakdown: {
        byCompany: companyCounts,
        byClearance: clearanceCounts,
        statusTimeline
      },
      totals: {
        accepted,
        withdrawn: filteredApps.filter(a => a.status === 'withdrawn').length
      }
    }

    return NextResponse.json({
      success: true,
      data: stats,
      period: dateRange || 'all'
    })
  } catch (error) {
    console.error('Error calculating application stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate statistics' },
      { status: 500 }
    )
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60 // 60 requests per minute for stats
})