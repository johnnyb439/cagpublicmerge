import { NextRequest, NextResponse } from 'next/server'
import { JobApplication } from '@/types/job-application'

// Mock database - replace with actual database in production
let applications: JobApplication[] = []

// PUT /api/applications/[id]/interviews/[interviewId] - Update interview
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    const body = await request.json()
    const applicationIndex = applications.findIndex(app => app.id === params.id)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = applications[applicationIndex]
    const interviewIndex = application.interviews.findIndex(
      interview => interview.id === params.interviewId
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
      id: params.interviewId // Ensure ID doesn't change
    }

    applications[applicationIndex].interviews[interviewIndex] = updatedInterview
    applications[applicationIndex].lastUpdated = new Date().toISOString().split('T')[0]

    // Add timeline entry if interview was completed
    if (body.completed && !existingInterview.completed) {
      const outcome = body.outcome || 'completed'
      const timelineEntry = {
        date: new Date().toISOString().split('T')[0],
        event: `${existingInterview.type.replace(/_/g, ' ')} interview completed`,
        description: `Outcome: ${outcome}`
      }
      applications[applicationIndex].timeline.push(timelineEntry)

      // Update application status based on interview outcome
      if (outcome === 'passed' && applications[applicationIndex].status === 'interviewing') {
        applications[applicationIndex].status = 'interview_scheduled' // Ready for next round
      } else if (outcome === 'failed') {
        applications[applicationIndex].status = 'rejected'
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

// DELETE /api/applications/[id]/interviews/[interviewId] - Cancel interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    const applicationIndex = applications.findIndex(app => app.id === params.id)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = applications[applicationIndex]
    const interviewIndex = application.interviews.findIndex(
      interview => interview.id === params.interviewId
    )

    if (interviewIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Interview not found' },
        { status: 404 }
      )
    }

    const deletedInterview = application.interviews[interviewIndex]
    applications[applicationIndex].interviews.splice(interviewIndex, 1)
    applications[applicationIndex].lastUpdated = new Date().toISOString().split('T')[0]

    // Add timeline entry
    const timelineEntry = {
      date: new Date().toISOString().split('T')[0],
      event: `${deletedInterview.type.replace(/_/g, ' ')} interview cancelled`,
      description: 'Interview removed from schedule'
    }
    applications[applicationIndex].timeline.push(timelineEntry)

    // Update status if no more interviews scheduled
    if (applications[applicationIndex].interviews.length === 0 && 
        applications[applicationIndex].status === 'interview_scheduled') {
      applications[applicationIndex].status = 'applied'
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
}