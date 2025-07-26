import { NextRequest, NextResponse } from 'next/server'
import { resumeAnalyzer } from '@/lib/ai/resume-analyzer'
import { ResumeAnalysisRequest } from '@/types/ai-resume'
import { validateWithZod, zodSchemas } from '@/lib/security/validation'
import { securityLogger } from '@/lib/security/monitoring'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent')
  
  try {
    const body = await request.json()

    // Validate input with Zod
    const validation = validateWithZod(zodSchemas.resumeAnalysis, body)
    if (!validation.success) {
      securityLogger.logValidationFailure(ip, 'resume-analysis', JSON.stringify(body), validation.errors?.join(', ') || '', userAgent || undefined)
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Analyze resume
    if (!validation.data) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    
    const analysis = await resumeAnalyzer.analyzeResume(validation.data)

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Resume analysis API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demo = searchParams.get('demo')

    if (demo === 'true') {
      // Return demo analysis for testing
      const demoAnalysis = await resumeAnalyzer.analyzeResume({
        content: `
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years of experience in web development and cloud technologies. 
Skilled in JavaScript, Python, and AWS. Seeking opportunities in cleared environments.

EXPERIENCE
Senior Software Developer | TechCorp | 2020 - Present
- Developed web applications using React and Node.js
- Managed AWS infrastructure and deployment pipelines
- Led team of 3 junior developers
- Improved system performance by 25%

Software Developer | StartupXYZ | 2018 - 2020
- Built REST APIs using Python and Django
- Worked with PostgreSQL databases
- Participated in agile development process

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2018

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker, SQL, Git
        `,
        targetRole: 'Senior Software Engineer',
        experience: 'Mid-level'
      })

      return NextResponse.json({
        success: true,
        data: demoAnalysis,
        demo: true,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Invalid request. Use POST to analyze resume or GET with demo=true for demo data.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Demo analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate demo analysis' },
      { status: 500 }
    )
  }
}