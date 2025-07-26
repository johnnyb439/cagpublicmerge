import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notifications'
// // import { withRateLimit } from '@/lib/api/withRateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'demo-user' } = body
    
    notificationService.markAllAsRead(userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}