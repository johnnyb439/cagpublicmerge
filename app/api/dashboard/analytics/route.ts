import { NextRequest, NextResponse } from 'next/server'

export interface DashboardAnalytics {
  user: {
    id: string
    joinDate: string
    profileCompletion: number
    lastActive: string
  }
  applications: {
    total: number
    thisMonth: number
    active: number
    responseRate: number
    interviewRate: number
    offerRate: number
    timeline: Array<{
      date: string
      applications: number
      responses: number
      interviews: number
    }>
    statusBreakdown: Record<string, number>
    topCompanies: Array<{
      name: string
      applications: number
      responses: number
    }>
  }
  certifications: {
    total: number
    active: number
    expiring: number
    expired: number
    byCategory: Record<string, number>
    expiryTimeline: Array<{
      month: string
      expiring: number
    }>
  }
  goals: {
    applicationsGoal: number
    applicationsProgress: number
    certificationsGoal: number
    certificationsProgress: number
    interviewsGoal: number
    interviewsProgress: number
  }
  recommendations: {
    profileActions: string[]
    careerTips: string[]
    certificationSuggestions: string[]
    jobMatches: number
  }
  activity: Array<{
    date: string
    type: 'application' | 'interview' | 'certification' | 'profile' | 'goal'
    title: string
    description?: string
  }>
}

// GET /api/dashboard/analytics - Get comprehensive dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1'
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Mock data - in production, fetch from actual databases
    const analytics: DashboardAnalytics = {
      user: {
        id: userId,
        joinDate: '2024-01-01',
        profileCompletion: 85,
        lastActive: new Date().toISOString().split('T')[0]
      },
      applications: {
        total: 24,
        thisMonth: 8,
        active: 12,
        responseRate: 67.5,
        interviewRate: 41.7,
        offerRate: 16.7,
        timeline: generateTimelineData(days, 'applications'),
        statusBreakdown: {
          'applied': 6,
          'screening': 3,
          'interview_scheduled': 2,
          'interviewing': 1,
          'offer_received': 2,
          'rejected': 8,
          'withdrawn': 1,
          'accepted': 1
        },
        topCompanies: [
          { name: 'Lockheed Martin', applications: 4, responses: 3 },
          { name: 'Raytheon', applications: 3, responses: 2 },
          { name: 'Booz Allen Hamilton', applications: 3, responses: 2 },
          { name: 'CACI', applications: 2, responses: 1 },
          { name: 'General Dynamics', applications: 2, responses: 0 }
        ]
      },
      certifications: {
        total: 6,
        active: 4,
        expiring: 1,
        expired: 1,
        byCategory: {
          'security': 3,
          'cloud': 2,
          'network': 1
        },
        expiryTimeline: [
          { month: '2025-03', expiring: 0 },
          { month: '2025-04', expiring: 1 },
          { month: '2025-05', expiring: 0 },
          { month: '2025-06', expiring: 1 },
          { month: '2025-07', expiring: 0 },
          { month: '2025-08', expiring: 1 }
        ]
      },
      goals: {
        applicationsGoal: 30,
        applicationsProgress: 24,
        certificationsGoal: 8,
        certificationsProgress: 6,
        interviewsGoal: 15,
        interviewsProgress: 10
      },
      recommendations: {
        profileActions: [
          'Add your GitHub profile to increase visibility',
          'Complete your skills section with 3 more technologies',
          'Upload a professional headshot to your profile'
        ],
        careerTips: [
          'Security+ certification renewal due in 6 months',
          'Consider AWS Solutions Architect certification',
          'Update your resume with recent project achievements'
        ],
        certificationSuggestions: [
          'CISSP - High demand for security professionals',
          'Azure Fundamentals - Complement your AWS skills',
          'PMP - Project management for senior roles'
        ],
        jobMatches: 15
      },
      activity: [
        {
          date: '2024-01-22',
          type: 'interview',
          title: 'Completed technical interview',
          description: 'Senior Software Engineer at Lockheed Martin'
        },
        {
          date: '2024-01-20',
          type: 'application',
          title: 'Applied to DevOps Engineer position',
          description: 'Raytheon - Arlington, VA'
        },
        {
          date: '2024-01-18',
          type: 'certification',
          title: 'AWS certification reminder',
          description: 'Expires in 2 years - consider renewal planning'
        },
        {
          date: '2024-01-15',
          type: 'profile',
          title: 'Updated resume',
          description: 'Added new cloud migration project'
        },
        {
          date: '2024-01-12',
          type: 'goal',
          title: 'Monthly goal progress',
          description: '8 applications submitted this month'
        }
      ]
    }

    // Calculate trends
    const previousPeriodData = generatePreviousPeriodStats(days)
    const trends = {
      applications: calculateTrend(analytics.applications.thisMonth, previousPeriodData.applications),
      responseRate: calculateTrend(analytics.applications.responseRate, previousPeriodData.responseRate),
      certifications: calculateTrend(analytics.certifications.total, previousPeriodData.certifications)
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      trends,
      period,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// Helper function to generate timeline data
function generateTimelineData(days: number, type: 'applications' | 'certifications') {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Generate realistic mock data
    const applications = Math.floor(Math.random() * 3)
    const responses = Math.floor(applications * (0.6 + Math.random() * 0.3))
    const interviews = Math.floor(responses * (0.4 + Math.random() * 0.3))
    
    data.push({
      date: dateStr,
      applications,
      responses,
      interviews
    })
  }
  return data
}

// Helper function to generate previous period stats for trend calculation
function generatePreviousPeriodStats(days: number) {
  return {
    applications: 6 + Math.floor(Math.random() * 4), // Previous period application count
    responseRate: 60 + Math.random() * 20, // Previous period response rate
    certifications: 5 + Math.floor(Math.random() * 2) // Previous period certification count
  }
}

// Helper function to calculate trend percentage
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// POST /api/dashboard/analytics - Update user goals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || '1'
    
    // Validate goal data
    if (!body.goals) {
      return NextResponse.json(
        { success: false, error: 'Goals data required' },
        { status: 400 }
      )
    }

    // In production, save goals to database
    const updatedGoals = {
      applicationsGoal: body.goals.applicationsGoal || 30,
      certificationsGoal: body.goals.certificationsGoal || 8,
      interviewsGoal: body.goals.interviewsGoal || 15,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedGoals,
      message: 'Goals updated successfully'
    })
  } catch (error) {
    console.error('Error updating goals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update goals' },
      { status: 500 }
    )
  }
}