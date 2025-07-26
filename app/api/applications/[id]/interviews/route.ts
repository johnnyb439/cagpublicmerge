import { NextRequest, NextResponse } from 'next/server'
import { JobApplication, Interview } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'

// GET /api/applications/[id]/interviews - Get all interviews for application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const application = mockDatabase.applications.find(app => app.id === id)
    
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application.interviews
    })
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

// POST /api/applications/[id]/interviews - Add new interview
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json()
    const applicationIndex = mockDatabase.applications.findIndex(app => app.id === id)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    const requiredFields = ['type', 'date', 'time']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const newInterview: Interview = {
      id: Date.now().toString(),
      type: body.type,
      date: body.date,
      time: body.time,
      location: body.location,
      interviewers: body.interviewers || [],
      notes: body.notes || '',
      completed: false
    }

    mockDatabase.applications[applicationIndex].interviews.push(newInterview)
    mockDatabase.applications[applicationIndex].lastUpdated = new Date().toISOString().split('T')[0]

    // Add timeline entry
    const timelineEntry = {
      date: new Date().toISOString().split('T')[0],
      event: `${body.type.replace(/_/g, ' ')} interview scheduled`,
      description: `Scheduled for ${body.date} at ${body.time}`
    }
    mockDatabase.applications[applicationIndex].timeline.push(timelineEntry)

    // Update status if this is the first interview
    if (mockDatabase.applications[applicationIndex].interviews.length === 1 && 
        mockDatabase.applications[applicationIndex].status === 'applied') {
      mockDatabase.applications[applicationIndex].status = 'interview_scheduled'
    }

    return NextResponse.json({
      success: true,
      data: newInterview,
      message: 'Interview scheduled successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to schedule interview' },
      { status: 500 }
    )
  }
}