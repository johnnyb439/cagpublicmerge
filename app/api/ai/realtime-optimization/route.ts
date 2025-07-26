import { NextRequest, NextResponse } from 'next/server'
import { optimizationService } from '@/lib/ai/optimization-service'
// // import { withRateLimit } from '@/lib/api/withRateLimit'

export async function POST(request: NextRequest) {
  try {
    const { content, jobDescription, sessionId } = await request.json()

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Content is required and must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Perform real-time optimization analysis
    const optimization = await optimizationService.analyzeRealTime(
      content,
      jobDescription,
      sessionId || 'anonymous'
    )

    return NextResponse.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Real-time optimization API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform real-time optimization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    optimizationService.clearCache(sessionId || undefined)

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    })
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}