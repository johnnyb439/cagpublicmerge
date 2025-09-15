import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id') || 'user_tone123';

    // Read the sample conversations
    const filePath = path.join(process.cwd(), 'public/api/sample-conversations.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    // Format conversations with time-friendly timestamps
    const formattedConversations = data.conversations.map((conv: any) => {
      const lastMessage = conv.last_message;
      const messageTime = new Date(lastMessage.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - messageTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo = '';
      if (diffMins < 1) {
        timeAgo = 'Just now';
      } else if (diffMins < 60) {
        timeAgo = `${diffMins}m ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}h ago`;
      } else if (diffDays < 7) {
        timeAgo = `${diffDays}d ago`;
      } else {
        timeAgo = messageTime.toLocaleDateString();
      }

      return {
        ...conv,
        last_message: {
          ...lastMessage,
          time_ago: timeAgo,
          formatted_time: messageTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          formatted_date: messageTime.toLocaleDateString()
        }
      };
    });

    // Sort by most recent message first
    formattedConversations.sort((a: any, b: any) =>
      new Date(b.last_message.timestamp).getTime() -
      new Date(a.last_message.timestamp).getTime()
    );

    console.log(`✅ CONVERSATIONS LIST RETRIEVED:`, {
      user_id,
      total_conversations: formattedConversations.length,
      recruiters: formattedConversations.filter((c: any) => c.is_recruiter).length,
      official: formattedConversations.filter((c: any) => c.is_official).length
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations: formattedConversations,
        count: formattedConversations.length,
        unread_count: formattedConversations.filter((c: any) =>
          c.last_message.sender !== user_id
        ).length
      }
    });

  } catch (error) {
    console.error('❌ CONVERSATIONS LIST ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversations' },
      { status: 500 }
    );
  }
}