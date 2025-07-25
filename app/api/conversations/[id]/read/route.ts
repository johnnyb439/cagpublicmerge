import { NextRequest, NextResponse } from 'next/server'
import { messagingService } from '@/lib/messaging'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId = 'demo-user' } = body
    
    messagingService.markConversationAsRead(id, userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark conversation as read' },
      { status: 500 }
    )
  }
}