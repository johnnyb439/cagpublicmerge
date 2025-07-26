import { NextRequest, NextResponse } from 'next/server'
import { JobApplication } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'

// GET /api/applications/[id] - Get specific application
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

// PUT /api/applications/[id] - Update application
export async function PUT(
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

// DELETE /api/applications/[id] - Delete specific application
export async function DELETE(
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
}