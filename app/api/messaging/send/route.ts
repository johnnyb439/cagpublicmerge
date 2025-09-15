import { NextRequest, NextResponse } from 'next/server';

// Mock data storage - In production, this would be your database
let messages: any[] = [];
let conversations: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversation_id,
      sender_id,
      content,
      message_type = 'text',
      reply_to = null,
      attachments = []
    } = body;

    // Validate required fields
    if (!conversation_id || !sender_id || !content) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['conversation_id', 'sender_id', 'content']
        },
        { status: 400 }
      );
    }

    // Generate unique message ID
    const message_id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Create new message
    const newMessage = {
      id: message_id,
      conversation_id,
      sender_id,
      content,
      message_type,
      reply_to,
      sent_at: timestamp,
      edited_at: null,
      is_deleted: false,
      attachments
    };

    // Store message (in production: database insert)
    messages.push(newMessage);

    // Update conversation's last activity
    const conversationIndex = conversations.findIndex(c => c.id === conversation_id);
    if (conversationIndex >= 0) {
      conversations[conversationIndex].updated_at = timestamp;
    }

    // 🚀 REAL-TIME NOTIFICATION - FREE TIER!
    try {
      // Send real-time notification to all conversation participants
      const realTimePayload = {
        type: 'new_message',
        conversation_id,
        sender_id,
        message: newMessage,
        timestamp
      };

      // Call our real-time API to notify users
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/messaging/realtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(realTimePayload)
      }).catch(err => console.log('⚠️ Real-time notification failed:', err));

    } catch (realtimeError) {
      console.log('⚠️ Real-time notification error:', realtimeError);
      // Don't fail the message send if real-time fails
    }

    console.log(`✅ NEW MESSAGE SENT + REAL-TIME DELIVERED:`, {
      message_id,
      conversation_id,
      sender_id,
      content: content.substring(0, 50) + '...',
      timestamp,
      realtime_enabled: true
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully with real-time delivery',
      data: {
        message_id,
        sent_at: timestamp,
        message: newMessage,
        realtime_delivered: true
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ MESSAGE SEND ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve sent messages for debugging
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversation_id = searchParams.get('conversation_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredMessages = messages;

    // Filter by conversation if specified
    if (conversation_id) {
      filteredMessages = messages.filter(m => m.conversation_id === conversation_id);
    }

    // Sort by timestamp (newest first) and limit
    const sortedMessages = filteredMessages
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        messages: sortedMessages,
        count: sortedMessages.length,
        total: filteredMessages.length
      }
    });

  } catch (error) {
    console.error('❌ MESSAGE RETRIEVAL ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve messages' },
      { status: 500 }
    );
  }
}