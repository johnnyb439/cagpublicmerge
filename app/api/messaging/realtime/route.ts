import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for real-time connections - FREE TIER FRIENDLY!
const connections = new Map<string, ReadableStreamDefaultController>();
const userConnections = new Map<string, Set<string>>();

// Message queue for real-time delivery
let messageQueue: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const conversation_id = searchParams.get('conversation_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔌 REAL-TIME CONNECTION ESTABLISHED:`, {
      user_id,
      conversation_id: conversation_id || 'all',
      timestamp: new Date().toISOString()
    });

    // Create Server-Sent Events stream - ZERO AWS COST!
    const stream = new ReadableStream({
      start(controller) {
        const connection_id = `conn_${user_id}_${Date.now()}`;

        // Store connection
        connections.set(connection_id, controller);

        // Track user connections
        if (!userConnections.has(user_id)) {
          userConnections.set(user_id, new Set());
        }
        userConnections.get(user_id)!.add(connection_id);

        // Send initial connection confirmation
        controller.enqueue(`data: ${JSON.stringify({
          type: 'connection_established',
          user_id,
          connection_id,
          timestamp: new Date().toISOString(),
          message: '🔥 Real-time messaging connected! You\'ll receive instant updates.'
        })}\n\n`);

        // Send any queued messages for this user
        const userMessages = messageQueue.filter(msg =>
          msg.recipient_id === user_id ||
          (conversation_id && msg.conversation_id === conversation_id)
        );

        userMessages.forEach(msg => {
          controller.enqueue(`data: ${JSON.stringify(msg)}\n\n`);
        });

        // Clean up queued messages that were delivered
        messageQueue = messageQueue.filter(msg =>
          !(msg.recipient_id === user_id ||
            (conversation_id && msg.conversation_id === conversation_id))
        );

        // Keep-alive ping every 30 seconds
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'keep_alive',
              timestamp: new Date().toISOString()
            })}\n\n`);
          } catch (error) {
            // Connection closed, clean up
            clearInterval(keepAliveInterval);
            cleanup();
          }
        }, 30000);

        // Cleanup function
        const cleanup = () => {
          clearInterval(keepAliveInterval);
          connections.delete(connection_id);

          if (userConnections.has(user_id)) {
            userConnections.get(user_id)!.delete(connection_id);
            if (userConnections.get(user_id)!.size === 0) {
              userConnections.delete(user_id);
            }
          }

          console.log(`🔌 CONNECTION CLOSED:`, {
            connection_id,
            user_id,
            active_connections: connections.size
          });
        };

        // Handle client disconnect
        request.signal?.addEventListener('abort', cleanup);
      },

      cancel() {
        // Connection cancelled by client
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
      }
    });

  } catch (error) {
    console.error('❌ REAL-TIME CONNECTION ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to establish real-time connection' },
      { status: 500 }
    );
  }
}

// POST - Send real-time message to connected users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      recipient_id,
      conversation_id,
      sender_id,
      message,
      data
    } = body;

    if (!type || !sender_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['type', 'sender_id']
        },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const realTimeMessage = {
      type,
      recipient_id,
      conversation_id,
      sender_id,
      message,
      data,
      timestamp,
      id: `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    let delivered = 0;

    if (recipient_id) {
      // Send to specific user
      const userConnectionIds = userConnections.get(recipient_id);
      if (userConnectionIds) {
        userConnectionIds.forEach(connection_id => {
          const controller = connections.get(connection_id);
          if (controller) {
            try {
              controller.enqueue(`data: ${JSON.stringify(realTimeMessage)}\n\n`);
              delivered++;
            } catch (error) {
              // Connection closed, will be cleaned up
              console.log(`⚠️  Connection ${connection_id} appears closed`);
            }
          }
        });
      }

      // If user not connected, queue message
      if (delivered === 0) {
        messageQueue.push(realTimeMessage);
        console.log(`📬 MESSAGE QUEUED for offline user:`, recipient_id);
      }

    } else if (conversation_id) {
      // Broadcast to all users in conversation (channel message)
      connections.forEach((controller, connection_id) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(realTimeMessage)}\n\n`);
          delivered++;
        } catch (error) {
          // Connection closed
        }
      });
    }

    console.log(`⚡ REAL-TIME MESSAGE SENT:`, {
      type,
      recipient_id,
      conversation_id,
      delivered_to_connections: delivered,
      queued: delivered === 0 && recipient_id ? true : false,
      active_connections: connections.size
    });

    return NextResponse.json({
      success: true,
      message: 'Real-time message sent',
      data: {
        message_id: realTimeMessage.id,
        delivered_connections: delivered,
        queued: delivered === 0 && recipient_id ? true : false,
        timestamp
      }
    });

  } catch (error) {
    console.error('❌ REAL-TIME SEND ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to send real-time message' },
      { status: 500 }
    );
  }
}

// GET connection stats (for debugging)
export async function OPTIONS() {
  return NextResponse.json({
    success: true,
    stats: {
      active_connections: connections.size,
      connected_users: userConnections.size,
      queued_messages: messageQueue.length,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage()
    }
  });
}