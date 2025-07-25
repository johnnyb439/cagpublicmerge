import { NextRequest, NextResponse } from 'next/server'
import { messagingService } from '@/lib/messaging'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const conversationId = searchParams.get('conversationId')
    const search = searchParams.get('search')
    
    if (search) {
      const messages = messagingService.searchMessages(userId, search)
      return NextResponse.json({ messages })
    }
    
    if (conversationId) {
      const messages = messagingService.getMessages(conversationId)
      return NextResponse.json({ messages })
    }
    
    const conversations = messagingService.getConversations(userId)
    const unreadCount = messagingService.getUnreadCount(userId)
    
    return NextResponse.json({ 
      conversations,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      conversationId, 
      senderId = 'demo-user', 
      recipientId, 
      content, 
      subject,
      attachments 
    } = body
    
    const message = messagingService.sendMessage(
      conversationId,
      senderId,
      recipientId,
      content,
      subject,
      attachments
    )
    
    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}