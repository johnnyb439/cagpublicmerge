import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    
    const notifications = notificationService.getNotifications(userId, unreadOnly)
    
    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId = 'demo-user', data } = body
    
    switch (type) {
      case 'job_match':
        await notificationService.sendJobMatchNotification(
          userId,
          data.jobMatch,
          data.userEmail || 'user@example.com',
          data.userName || 'User'
        )
        break
        
      case 'application_update':
        await notificationService.sendApplicationUpdateNotification(
          userId,
          data.update,
          data.userEmail || 'user@example.com',
          data.userName || 'User'
        )
        break
        
      case 'interview_reminder':
        await notificationService.sendInterviewReminder(
          userId,
          data.interview,
          data.userEmail || 'user@example.com',
          data.userName || 'User'
        )
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}