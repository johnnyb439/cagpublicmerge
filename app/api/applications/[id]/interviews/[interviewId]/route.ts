import { NextRequest, NextResponse } from 'next/server'
import { JobApplication } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'
import { withRateLimit } from '@/lib/api/withRateLimit'

// PUT /api/applications/[id]/interviews/[interviewId] - Update interview
export const PUT = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  const { id, interviewId } = await params;
  try {
    const body = await request.json()
    const applicationIndex = mockDatabase.applications.findIndex(app => app.id === id)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = mockDatabase.applications[applicationIndex]
    const interviewIndex = application.interviews.findIndex(
      interview => interview.id === interviewId
    )

    if (interviewIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Interview not found' },
        { status: 404 }
      )
    }

    const existingInterview = application.interviews[interviewIndex]
    
    // Update interview
    const updatedInterview = {
      ...existingInterview,
      ...body,
      id: interviewId // Ensure ID doesn't change
    }

    mockDatabase.applications[applicationIndex].interviews[interviewIndex] = updatedInterview
    mockDatabase.applications[applicationIndex].lastUpdated = new Date().toISOString().split('T')[0]

    // Add timeline entry if interview was completed
    if (body.completed && !existingInterview.completed) {
      const outcome = body.outcome || 'completed'
      const timelineEntry = {
        date: new Date().toISOString().split('T')[0],
        event: `${existingInterview.type.replace(/_/g, ' ')} interview completed`,
        description: `Outcome: ${outcome}`
      }
      mockDatabase.applications[applicationIndex].timeline.push(timelineEntry)

      // Update application status based on interview outcome
      if (outcome === 'passed' && mockDatabase.applications[applicationIndex].status === 'interviewing') {
        mockDatabase.applications[applicationIndex].status = 'interview_scheduled' // Ready for next round
      } else if (outcome === 'failed') {
        mockDatabase.applications[applicationIndex].status = 'rejected'
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedInterview,
      message: 'Interview updated successfully'
    })
  } catch (error) {
    console.error('Error updating interview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update interview' },
      { status: 500 }
    )
  }
}

}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 30 // 30 requests per minute for interview updates
})

// DELETE /api/applications/[id]/interviews/[interviewId] - Cancel interview
export const DELETE = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  const { id, interviewId } = await params;
  try {
    const applicationIndex = mockDatabase.applications.findIndex(app => app.id === id)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = mockDatabase.applications[applicationIndex]
    const interviewIndex = application.interviews.findIndex(
      interview => interview.id === interviewId
    )

    if (interviewIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Interview not found' },
        { status: 404 }
      )
    }

    const deletedInterview = application.interviews[interviewIndex]
    mockDatabase.applications[applicationIndex].interviews.splice(interviewIndex, 1)
    mockDatabase.applications[applicationIndex].lastUpdated = new Date().toISOString().split('T')[0]

    // Add timeline entry
    const timelineEntry = {
      date: new Date().toISOString().split('T')[0],
      event: `${deletedInterview.type.replace(/_/g, ' ')} interview cancelled`,
      description: 'Interview removed from schedule'
    }
    mockDatabase.applications[applicationIndex].timeline.push(timelineEntry)

    // Update status if no more interviews scheduled
    if (mockDatabase.applications[applicationIndex].interviews.length === 0 && 
        mockDatabase.applications[applicationIndex].status === 'interview_scheduled') {
      mockDatabase.applications[applicationIndex].status = 'applied'
    }

    return NextResponse.json({
      success: true,
      data: deletedInterview,
      message: 'Interview cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling interview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel interview' },
      { status: 500 }
    )
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 20 // 20 requests per minute for cancelling interviews
})