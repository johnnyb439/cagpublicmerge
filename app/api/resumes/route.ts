import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'

const RESUMES_FILE = path.join(process.cwd(), 'data', 'resumes.json')
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes')

// Ensure directories exist
async function ensureDirectories() {
  await mkdir(UPLOAD_DIR, { recursive: true })
  
  if (!fs.existsSync(RESUMES_FILE)) {
    fs.writeFileSync(RESUMES_FILE, JSON.stringify({ resumes: [] }, null, 2))
  }
}

// Get all resumes
function getResumes() {
  if (!fs.existsSync(RESUMES_FILE)) {
    fs.writeFileSync(RESUMES_FILE, JSON.stringify({ resumes: [] }, null, 2))
  }
  const data = fs.readFileSync(RESUMES_FILE, 'utf8')
  return JSON.parse(data).resumes
}

// Save resumes
function saveResumes(resumes: any[]) {
  fs.writeFileSync(RESUMES_FILE, JSON.stringify({ resumes }, null, 2))
}

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    let resumes = getResumes()
    
    // Filter by userId if provided
    if (userId) {
      resumes = resumes.filter((resume: any) => resume.userId === userId)
    }
    
    return NextResponse.json({
      success: true,
      resumes,
      total: resumes.length
    }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resumes' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const title = formData.get('title') as string || 'Resume'
    
    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    // Validate file type (PDF, DOC, DOCX only)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = path.extname(file.name)
    const fileName = `resume_${userId}_${timestamp}_${randomString}${fileExt}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Save metadata
    const resumes = getResumes()
    const newResume = {
      id: `resume_${timestamp}_${randomString}`,
      userId,
      title,
      fileName: file.name,
      savedFileName: fileName,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/resumes/${fileName}`,
      active: true
    }
    
    // Mark previous resumes as inactive (optional - keeps only latest as active)
    resumes.forEach((resume: any) => {
      if (resume.userId === userId) {
        resume.active = false
      }
    })
    
    resumes.push(newResume)
    saveResumes(resumes)
    
    return NextResponse.json({
      success: true,
      resume: newResume
    }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload resume' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')
    
    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID required' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    const resumes = getResumes()
    const resumeIndex = resumes.findIndex((r: any) => r.id === resumeId)
    
    if (resumeIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }
    
    // Delete the file
    const resume = resumes[resumeIndex]
    const filePath = path.join(UPLOAD_DIR, resume.savedFileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    
    // Remove from metadata
    resumes.splice(resumeIndex, 1)
    saveResumes(resumes)
    
    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully'
    }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete resume' },
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