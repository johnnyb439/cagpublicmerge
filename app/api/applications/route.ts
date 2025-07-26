import { NextRequest, NextResponse } from 'next/server'
import { JobApplication } from '@/types/job-application'
import { mockDatabase } from '@/lib/mock-db'

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
    
    // Validate required fields
    const requiredFields = ['jobTitle', 'company', 'location', 'clearanceRequired']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const newApplication: JobApplication = {
      id: Date.now().toString(),
      jobId: body.jobId || `job_${Date.now()}`,
      jobTitle: body.jobTitle,
      company: body.company,
      location: body.location,
      salary: body.salary || '',
      clearanceRequired: body.clearanceRequired,
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'applied',
      notes: body.notes || '',
      contactPerson: body.contactPerson || '',
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      resumeVersion: body.resumeVersion || '',
      coverLetter: body.coverLetter || false,
      referral: body.referral || '',
      interviews: [],
      documents: [],
      timeline: [
        { 
          date: new Date().toISOString().split('T')[0], 
          event: 'Application Submitted',
          description: 'Application created via dashboard'
        }
      ],
      tags: body.tags || [],
      isFavorite: body.isFavorite || false,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    mockDatabase.applications.unshift(newApplication)

    return NextResponse.json({
      success: true,
      data: newApplication,
      message: 'Application created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    )
  }
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