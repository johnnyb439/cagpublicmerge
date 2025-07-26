import { NextRequest, NextResponse } from 'next/server'
import { resumeAnalyzer } from '@/lib/ai/resume-analyzer'
// // import { withRateLimit } from '@/lib/api/withRateLimit'

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'Content is required and must be at least 20 characters' },
        { status: 400 }
      )
    }

    // Perform quick analysis
    const analysis = await resumeAnalyzer.quickAnalysis(content)

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Quick analysis API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform quick analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}