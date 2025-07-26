import { NextRequest, NextResponse } from 'next/server'
import { JobApplication } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'
// // import { withRateLimit } from '@/lib/api/withRateLimit'
import { emailService } from '@/lib/email/emailService'

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

      // Send email notification for status changes
      try {
        await emailService.sendEmail({
          to: 'user@example.com', // In production, get from authenticated user
          subject: `Application Status Update: ${updatedApplication.jobTitle}`,
          html: `
            <h2>Application Status Update</h2>
            <p>Dear User,</p>
            <p>Your application for <strong>${updatedApplication.jobTitle}</strong> at <strong>${updatedApplication.company}</strong> has been updated.</p>
            <p><strong>New Status:</strong> ${body.status.replace(/_/g, ' ')}</p>
            <p>${getStatusMessage(body.status)}</p>
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications/${id}">View Application</a></p>
            <p>Best regards,<br>Cleared Advisory Group</p>
          `
        })
        console.log(`Status update email sent for application ${id}`)
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
      }
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

    // Send withdrawal notification email
    try {
      await emailService.sendEmail({
        to: 'user@example.com', // In production, get from authenticated user
        subject: `Application Withdrawn: ${deletedApplication.jobTitle}`,
        html: `
          <h2>Application Withdrawn</h2>
          <p>Dear User,</p>
          <p>Your application for <strong>${deletedApplication.jobTitle}</strong> at <strong>${deletedApplication.company}</strong> has been withdrawn.</p>
          <p>Your application has been withdrawn from consideration.</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications">View Applications</a></p>
          <p>Best regards,<br>Cleared Advisory Group</p>
        `
      })
      console.log(`Withdrawal email sent for application ${id}`)
    } catch (emailError) {
      console.error('Failed to send withdrawal email:', emailError)
    }

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

// POST /api/applications/[id] - Upload documents to application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json()
    const { fileName, fileType, fileSize, fileContent, documentType = 'other' } = body

    if (!fileName || !fileContent) {
      return NextResponse.json(
        { success: false, error: 'File name and content are required' },
        { status: 400 }
      )
    }

    const applicationIndex = mockDatabase.applications.findIndex(app => app.id === id)
    
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = mockDatabase.applications[applicationIndex]

    // Create document record
    const document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: fileName,
      type: documentType, // 'resume', 'cover_letter', 'other'
      size: fileSize || 0,
      uploadDate: new Date().toISOString().split('T')[0],
      // In production, upload to cloud storage and store the URL
      url: `/uploads/applications/${id}/${fileName}`
    }

    application.documents.push(document)
    application.lastUpdated = new Date().toISOString().split('T')[0]

    // Add timeline entry
    application.timeline.push({
      date: new Date().toISOString().split('T')[0],
      event: 'Document Uploaded',
      description: `Uploaded ${documentType}: ${fileName}`
    })

    // Update resume version if it's a resume
    if (documentType === 'resume') {
      application.resumeVersion = fileName
    }

    return NextResponse.json({
      success: true,
      data: {
        document,
        application
      },
      message: 'Document uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

// Helper function to get status-specific messages
function getStatusMessage(status: string): string {
  const messages = {
    'applied': 'Your application has been submitted and is being reviewed.',
    'screening': 'Your application is under review by the hiring team.',
    'interview': 'Congratulations! You have been selected for an interview.',
    'offer': 'Congratulations! You have received a job offer.',
    'rejected': 'Thank you for your interest. We have decided to move forward with other candidates.',
    'withdrawn': 'Your application has been withdrawn.'
  }
  return messages[status] || 'Your application status has been updated.'
}