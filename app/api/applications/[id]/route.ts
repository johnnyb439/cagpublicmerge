import { NextRequest, NextResponse } from 'next/server'
import { JobApplication } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'
import { withRateLimit } from '@/lib/api/withRateLimit'

// GET /api/applications/[id] - Get specific application
export const GET = withRateLimit(async (
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
      data: application
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60 // 60 requests per minute for reading
})

// PUT /api/applications/[id] - Update application
export const PUT = withRateLimit(async (
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

    const existingApp = mockDatabase.applications[applicationIndex]
    
    // Update application with new data
    const updatedApplication: JobApplication = {
      ...existingApp,
      ...body,
      id: id, // Ensure ID doesn't change
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    // Add timeline entry for status changes
    if (body.status && body.status !== existingApp.status) {
      const statusEvent = {
        date: new Date().toISOString().split('T')[0],
        event: `Status changed to ${body.status.replace(/_/g, ' ')}`,
        description: body.statusNote || undefined
      }
      updatedApplication.timeline = [...existingApp.timeline, statusEvent]
    }

    mockDatabase.applications[applicationIndex] = updatedApplication

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 30 // 30 requests per minute for updates
})

// DELETE /api/applications/[id] - Delete specific application
export const DELETE = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const applicationIndex = mockDatabase.applications.findIndex(app => app.id === id)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const deletedApplication = mockDatabase.applications[applicationIndex]
    mockDatabase.applications.splice(applicationIndex, 1)

    return NextResponse.json({
      success: true,
      data: deletedApplication,
      message: 'Application deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 20 // 20 requests per minute for deletes
})