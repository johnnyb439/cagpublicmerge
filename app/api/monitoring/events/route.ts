import { NextRequest, NextResponse } from 'next/server'
// // import { withRateLimit } from '@/lib/api/withRateLimit'
import { logSecurityEvent, getRecentEvents, getSecurityMetrics, SecurityEventType } from '@/lib/monitoring/alerts'

// POST: Log a security event
const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.type || !body.severity || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, severity, message' },
        { status: 400 }
      )
    }

    // Validate event type
    if (!Object.values(SecurityEventType).includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Validate severity
    if (!['low', 'medium', 'high', 'critical'].includes(body.severity)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      )
    }

    // Extract client info
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Log the event
    await logSecurityEvent({
      type: body.type,
      severity: body.severity,
      message: body.message,
      details: body.details || {},
      userId: body.userId,
      ip,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging security event:', error)
    return NextResponse.json(
      { error: 'Failed to log security event' },
      { status: 500 }
    )
  }
}

// GET: Retrieve recent events (admin only)
const getHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    
    // Basic auth check - in production, implement proper admin auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const type = searchParams.get('type') as SecurityEventType | null
    const severity = searchParams.get('severity')
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const metrics = searchParams.get('metrics') === 'true'

    if (metrics) {
      // Return security metrics
      const securityMetrics = getSecurityMetrics()
      return NextResponse.json(securityMetrics)
    } else {
      // Return recent events
      const events = getRecentEvents({
        type: type || undefined,
        severity: severity || undefined,
        userId: userId || undefined,
        limit: Math.min(limit, 1000) // Cap at 1000 events
      })

      return NextResponse.json({
        events,
        total: events.length
      })
    }
  } catch (error) {
    console.error('Error retrieving security events:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve security events' },
      { status: 500 }
    )
  }
}

// Apply rate limiting - disabled for now
export const POST = postHandler;
export const GET = getHandler;