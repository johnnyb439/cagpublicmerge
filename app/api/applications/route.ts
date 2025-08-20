import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const APPLICATIONS_FILE = path.join(process.cwd(), 'data', 'applications.json')

// Ensure file exists
function ensureFile() {
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify({ applications: [] }, null, 2))
  }
}

// Get all applications
function getApplications() {
  ensureFile()
  const data = fs.readFileSync(APPLICATIONS_FILE, 'utf8')
  return JSON.parse(data).applications
}

// Save applications
function saveApplications(applications: any[]) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify({ applications }, null, 2))
}

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const jobId = searchParams.get('jobId')
    
    let applications = getApplications()
    
    // Filter by userId if provided
    if (userId) {
      applications = applications.filter((app: any) => app.userId === userId)
    }
    
    // Filter by jobId if provided
    if (jobId) {
      applications = applications.filter((app: any) => app.jobId === jobId)
    }
    
    return NextResponse.json({
      success: true,
      applications,
      total: applications.length
    }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, jobId, jobTitle, company, coverLetter, resume } = body
    
    if (!userId || !jobId || !jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    const applications = getApplications()
    
    // Check if already applied
    const existing = applications.find(
      (app: any) => app.userId === userId && app.jobId === jobId
    )
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already applied to this job' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    // Create new application
    const newApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      jobId,
      jobTitle,
      company,
      coverLetter: coverLetter || '',
      resume: resume || null,
      status: 'submitted', // submitted, reviewing, interview, rejected, offered
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      timeline: [
        {
          status: 'submitted',
          timestamp: new Date().toISOString(),
          note: 'Application submitted'
        }
      ]
    }
    
    applications.push(newApplication)
    saveApplications(applications)
    
    return NextResponse.json({
      success: true,
      application: newApplication
    }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, status, note } = body
    
    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    const applications = getApplications()
    const appIndex = applications.findIndex((app: any) => app.id === applicationId)
    
    if (appIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }
    
    // Update application
    applications[appIndex].status = status
    applications[appIndex].updatedAt = new Date().toISOString()
    
    // Add to timeline
    applications[appIndex].timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`
    })
    
    // Add note if provided
    if (note) {
      applications[appIndex].notes.push({
        text: note,
        timestamp: new Date().toISOString()
      })
    }
    
    saveApplications(applications)
    
    return NextResponse.json({
      success: true,
      application: applications[appIndex]
    }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS
  })
}