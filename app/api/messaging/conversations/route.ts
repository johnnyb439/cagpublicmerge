import { NextRequest, NextResponse } from 'next/server';

// Mock data storage - In production, this would be your database
let conversations: any[] = [];
let participants: any[] = [];

// Sample initial data
if (conversations.length === 0) {
  conversations.push(
    {
      id: 'conv_direct_demo',
      type: 'direct',
      title: null,
      created_by: 'user_tone123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      metadata: { is_recruiter_chat: false }
    },
    {
      id: 'conv_channel_network',
      type: 'channel',
      title: 'Network Engineers Chat',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      metadata: {
        job_category: 'network_engineering',
        channel_id: 'channel_network_eng'
      }
    }
  );

  participants.push(
    {
      id: 'part_001',
      conversation_id: 'conv_direct_demo',
      user_id: 'user_tone123',
      role: 'member',
      joined_at: new Date().toISOString(),
      last_read_at: null,
      notifications_enabled: true
    },
    {
      id: 'part_002',
      conversation_id: 'conv_channel_network',
      user_id: 'user_tone123',
      role: 'member',
      joined_at: new Date().toISOString(),
      last_read_at: null,
      notifications_enabled: true
    }
  );
}

// GET - Retrieve conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const type = searchParams.get('type'); // direct, channel, recruiter
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id parameter is required' },
        { status: 400 }
      );
    }

    // Find conversations where user is a participant
    const userParticipations = participants.filter(p => p.user_id === user_id);
    const conversationIds = userParticipations.map(p => p.conversation_id);

    let userConversations = conversations.filter(c =>
      conversationIds.includes(c.id) && c.is_active
    );

    // Filter by type if specified
    if (type) {
      userConversations = userConversations.filter(c => c.type === type);
    }

    // Sort by last activity (most recent first)
    userConversations.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // Limit results
    userConversations = userConversations.slice(0, limit);

    // Add participant info to each conversation
    const conversationsWithParticipants = userConversations.map(conv => {
      const convParticipants = participants.filter(p => p.conversation_id === conv.id);
      return {
        ...conv,
        participants: convParticipants,
        participant_count: convParticipants.length
      };
    });

    console.log(`✅ CONVERSATIONS RETRIEVED for ${user_id}:`, {
      count: conversationsWithParticipants.length,
      types: [...new Set(conversationsWithParticipants.map(c => c.type))]
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversationsWithParticipants,
        count: conversationsWithParticipants.length
      }
    });

  } catch (error) {
    console.error('❌ CONVERSATIONS RETRIEVAL ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversations' },
      { status: 500 }
    );
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      created_by,
      participants: initialParticipants = [],
      metadata = {}
    } = body;

    // Validate required fields
    if (!type || !created_by) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['type', 'created_by']
        },
        { status: 400 }
      );
    }

    // Validate conversation type
    const validTypes = ['direct', 'group', 'channel', 'recruiter'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: 'Invalid conversation type',
          valid_types: validTypes
        },
        { status: 400 }
      );
    }

    // Generate unique conversation ID
    const conversation_id = `conv_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Create new conversation
    const newConversation = {
      id: conversation_id,
      type,
      title,
      created_by,
      created_at: timestamp,
      updated_at: timestamp,
      is_active: true,
      metadata
    };

    // Store conversation
    conversations.push(newConversation);

    // Add creator as first participant
    const creatorParticipant = {
      id: `part_${Date.now()}_creator`,
      conversation_id,
      user_id: created_by,
      role: type === 'channel' ? 'admin' : 'member',
      joined_at: timestamp,
      last_read_at: null,
      notifications_enabled: true
    };

    participants.push(creatorParticipant);

    // Add additional participants if provided
    initialParticipants.forEach((participant: any, index: number) => {
      const newParticipant = {
        id: `part_${Date.now()}_${index}`,
        conversation_id,
        user_id: participant.user_id,
        role: participant.role || 'member',
        joined_at: timestamp,
        last_read_at: null,
        notifications_enabled: true
      };
      participants.push(newParticipant);
    });

    console.log(`✅ NEW CONVERSATION CREATED:`, {
      conversation_id,
      type,
      created_by,
      participant_count: initialParticipants.length + 1
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        conversation_id,
        conversation: newConversation,
        participants: participants.filter(p => p.conversation_id === conversation_id)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ CONVERSATION CREATION ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to create conversation',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}