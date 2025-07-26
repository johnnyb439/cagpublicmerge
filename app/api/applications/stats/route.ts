import { NextRequest, NextResponse } from 'next/server'
import { JobApplication, ApplicationStats } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'
// // import { withRateLimit } from '@/lib/api/withRateLimit'

// GET /api/applications/stats - Get application statistics
export async function GET(request: NextRequest) {
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

    // Status breakdown
    const statusCounts = filteredApps.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const stats = {
      totalApplications,
      withResponse,
      withInterview: interviewCount,
      withOffer: offerCount,
      responseRate,
      interviewConversionRate,
      avgTimeToResponse,
      companyCounts,
      statusCounts,
      recentActivity: filteredApps
        .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
        .slice(0, 5)
        .map(app => ({
          id: app.id,
          jobTitle: app.jobTitle,
          company: app.company,
          status: app.status,
          appliedDate: app.appliedDate
        }))
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching application stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application stats' },
      { status: 500 }
    )
  }
}