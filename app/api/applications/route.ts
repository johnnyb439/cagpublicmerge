import { NextRequest, NextResponse } from 'next/server'
import { JobApplication } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'
import { emailService } from '@/lib/email/emailService'
import { z } from 'zod'

// Validation schema for job application
const applicationSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  clearanceRequired: z.string().min(1, 'Clearance level is required'),
  jobId: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  resumeVersion: z.string().optional(),
  coverLetter: z.boolean().optional(),
  referral: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  resumeFile: z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    content: z.string() // Base64 encoded content
  }).optional()
})

// GET /api/applications - Get all applications for user
export async function GET(request: NextRequest) {
  try {
    // In production, get userId from authentication
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const company = searchParams.get('company')
    const search = searchParams.get('search')

    let filteredApplications = [...mockDatabase.applications]

    // Apply filters
    if (status) {
      const statusArray = status.split(',')
      filteredApplications = filteredApplications.filter(app => 
        statusArray.includes(app.status)
      )
    }

    if (company) {
      filteredApplications = filteredApplications.filter(app => 
        app.company.toLowerCase().includes(company.toLowerCase())
      )
    }

    if (search) {
      filteredApplications = filteredApplications.filter(app => 
        app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        app.company.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredApplications,
      total: filteredApplications.length
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body with Zod
    const validationResult = applicationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Generate unique application ID
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newApplication: JobApplication = {
      id: applicationId,
      jobId: validatedData.jobId || `job_${Date.now()}`,
      jobTitle: validatedData.jobTitle,
      company: validatedData.company,
      location: validatedData.location,
      salary: validatedData.salary || '',
      clearanceRequired: validatedData.clearanceRequired,
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'applied',
      notes: validatedData.notes || '',
      contactPerson: validatedData.contactPerson || '',
      contactEmail: validatedData.contactEmail || '',
      contactPhone: validatedData.contactPhone || '',
      resumeVersion: validatedData.resumeVersion || 'Latest',
      coverLetter: validatedData.coverLetter || false,
      referral: validatedData.referral || '',
      interviews: [],
      documents: [],
      timeline: [
        { 
          date: new Date().toISOString().split('T')[0], 
          event: 'Application Submitted',
          description: 'Application created via dashboard'
        }
      ],
      tags: validatedData.tags || [],
      isFavorite: validatedData.isFavorite || false,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    // Handle resume file upload if provided
    if (validatedData.resumeFile) {
      try {
        // In production, upload to cloud storage (AWS S3, etc.)
        // For now, we'll store metadata and simulate file storage
        const resumeDocument = {
          id: `doc_${Date.now()}`,
          name: validatedData.resumeFile.name,
          type: 'resume',
          size: validatedData.resumeFile.size,
          uploadDate: new Date().toISOString().split('T')[0],
          // In production, this would be a cloud storage URL
          url: `/uploads/resumes/${applicationId}/${validatedData.resumeFile.name}`
        }

        newApplication.documents.push(resumeDocument)
        newApplication.resumeVersion = validatedData.resumeFile.name

        // Add to timeline
        newApplication.timeline.push({
          date: new Date().toISOString().split('T')[0],
          event: 'Resume Uploaded',
          description: `Uploaded resume: ${validatedData.resumeFile.name}`
        })

        console.log(`Resume uploaded for application ${applicationId}: ${validatedData.resumeFile.name}`)
      } catch (resumeError) {
        console.error('Resume upload error:', resumeError)
        // Continue with application creation even if resume upload fails
      }
    }

    // Add to mock database
    mockDatabase.applications.unshift(newApplication)

    // Send confirmation email
    try {
      await emailService.sendEmail({
        to: 'user@example.com', // In production, get from authenticated user
        subject: `Application Submitted: ${newApplication.jobTitle}`,
        html: `
          <h2>Application Submitted Successfully</h2>
          <p>Dear User,</p>
          <p>Your application for <strong>${newApplication.jobTitle}</strong> at <strong>${newApplication.company}</strong> has been submitted successfully.</p>
          <p>Your application has been successfully submitted and is being reviewed.</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications/${applicationId}">View Application</a></p>
          <p>Best regards,<br>Cleared Advisory Group</p>
        `
      })
      console.log(`Confirmation email sent for application ${applicationId}`)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the application creation if email fails
    }

    return NextResponse.json({
      success: true,
      data: newApplication,
      message: 'Application submitted successfully! Confirmation email sent.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

// PUT /api/applications - Update application status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Application ID and status are required' },
        { status: 400 }
      )
    }

    // Valid status values
    const validStatuses = ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Find and update application
    const applicationIndex = mockDatabase.applications.findIndex(app => app.id === id)
    if (applicationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = mockDatabase.applications[applicationIndex]
    const oldStatus = application.status

    // Update application
    application.status = status
    application.lastUpdated = new Date().toISOString().split('T')[0]
    
    if (notes) {
      application.notes = notes
    }

    // Add timeline entry
    application.timeline.push({
      date: new Date().toISOString().split('T')[0],
      event: `Status Changed`,
      description: `Status updated from "${oldStatus}" to "${status}"`
    })

    // Send status update email
    try {
      await emailService.sendEmail({
        to: 'user@example.com', // In production, get from authenticated user
        subject: `Application Status Update: ${application.jobTitle}`,
        html: `
          <h2>Application Status Update</h2>
          <p>Dear User,</p>
          <p>Your application for <strong>${application.jobTitle}</strong> at <strong>${application.company}</strong> has been updated.</p>
          <p><strong>New Status:</strong> ${status.replace(/_/g, ' ')}</p>
          <p>${getStatusMessage(status)}</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications/${id}">View Application</a></p>
          <p>Best regards,<br>Cleared Advisory Group</p>
        `
      })
      console.log(`Status update email sent for application ${id}`)
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application status updated successfully'
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
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

// DELETE /api/applications - Delete multiple applications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No application IDs provided' },
        { status: 400 }
      )
    }

    // Remove applications with matching IDs
    const initialCount = mockDatabase.applications.length
    mockDatabase.applications = mockDatabase.applications.filter(app => !ids.includes(app.id))
    const deletedCount = initialCount - mockDatabase.applications.length

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} application(s)`,
      deletedCount
    })
  } catch (error) {
    console.error('Error deleting applications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete applications' },
      { status: 500 }
    )
  }
}