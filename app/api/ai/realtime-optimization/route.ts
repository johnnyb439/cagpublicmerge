import { NextRequest, NextResponse } from 'next/server'
import { optimizationService } from '@/lib/ai/optimization-service'
import { withRateLimit } from '@/lib/api/withRateLimit'

export const POST = withRateLimit(async (request: NextRequest) => {
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
}, {
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 15 // 15 requests per hour for realtime optimization
})

export const DELETE = withRateLimit(async (request: NextRequest) => {
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
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 30 // 30 requests per minute for cache clearing
})