import { NextRequest, NextResponse } from 'next/server'
import { securityMonitor, SecurityEventType } from '@/lib/security/monitoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const timeframe = searchParams.get('timeframe') as 'hour' | 'day' | 'week' || 'day'
    
    switch (action) {
      case 'metrics':
        const metrics = securityMonitor.getMetrics(timeframe)
        return NextResponse.json({
          success: true,
          data: metrics
        })
      
      case 'events':
        const type = searchParams.get('type') as SecurityEventType
        const severity = searchParams.get('severity')
        const ip = searchParams.get('ip')
        const resolved = searchParams.get('resolved')
        const limit = parseInt(searchParams.get('limit') || '50')
        
        const events = securityMonitor.getEvents({
          type,
          severity,
          ip,
          resolved: resolved ? resolved === 'true' : undefined,
          limit
        })
        
        return NextResponse.json({
          success: true,
          data: events
        })
      
      case 'attack-patterns':
        const targetIp = searchParams.get('ip')
        if (!targetIp) {
          return NextResponse.json(
            { error: 'IP parameter is required for attack pattern detection' },
            { status: 400 }
          )
        }
        
        const patterns = securityMonitor.detectAttackPatterns(targetIp)
        return NextResponse.json({
          success: true,
          data: patterns
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: metrics, events, or attack-patterns' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error retrieving security monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, eventId } = await request.json()
    
    if (action === 'resolve' && eventId) {
      securityMonitor.resolveEvent(eventId)
      return NextResponse.json({
        success: true,
        message: 'Event marked as resolved'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating security event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}