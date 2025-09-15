import { NextRequest, NextResponse } from 'next/server';

// Mock data storage - In production, this would be your database
let userPresence: Map<string, any> = new Map();
let privacySettings: Map<string, any> = new Map();

// Initialize with sample data
if (userPresence.size === 0) {
  const sampleUsers = [
    {
      user_id: 'user_tone123',
      name: 'Terrence Morris',
      job_category: 'network_engineering',
      status: 'online',
      custom_status: 'Available for networking discussions',
      last_seen: new Date().toISOString(),
      privacy: {
        allow_messages: true,
        allow_recruiter_messages: true,
        show_online_status: true,
        auto_away_minutes: 15
      }
    },
    {
      user_id: 'user_alice456',
      name: 'Alice Johnson',
      job_category: 'network_engineering',
      status: 'online',
      custom_status: 'Working on SD-WAN project',
      last_seen: new Date().toISOString(),
      privacy: {
        allow_messages: true,
        allow_recruiter_messages: false,
        show_online_status: true,
        auto_away_minutes: 30
      }
    },
    {
      user_id: 'user_mike789',
      name: 'Mike Rodriguez',
      job_category: 'cybersecurity',
      status: 'away',
      custom_status: 'In a meeting',
      last_seen: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
      privacy: {
        allow_messages: true,
        allow_recruiter_messages: true,
        show_online_status: true,
        auto_away_minutes: 10
      }
    },
    {
      user_id: 'user_sarah123',
      name: 'Sarah Williams',
      job_category: 'help_desk',
      status: 'online',
      custom_status: 'Happy to help with support questions!',
      last_seen: new Date().toISOString(),
      privacy: {
        allow_messages: true,
        allow_recruiter_messages: false,
        show_online_status: true,
        auto_away_minutes: 20
      }
    },
    {
      user_id: 'user_john456',
      name: 'John Smith',
      job_category: 'cloud_engineering',
      status: 'busy',
      custom_status: 'Deep in AWS architecture work',
      last_seen: new Date().toISOString(),
      privacy: {
        allow_messages: false,
        allow_recruiter_messages: false,
        show_online_status: true,
        auto_away_minutes: 5
      }
    }
  ];

  sampleUsers.forEach(user => {
    userPresence.set(user.user_id, {
      user_id: user.user_id,
      name: user.name,
      job_category: user.job_category,
      status: user.status,
      custom_status: user.custom_status,
      last_seen: user.last_seen
    });

    privacySettings.set(user.user_id, user.privacy);
  });

  console.log(`✅ INITIALIZED PRESENCE DATA for ${sampleUsers.length} users`);
}

// GET - Retrieve user presence and online users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const user_id = searchParams.get('user_id');
    const job_category = searchParams.get('job_category');

    if (action === 'online_users') {
      // Get online users in specific job category
      let onlineUsers = Array.from(userPresence.values()).filter(user => {
        const privacy = privacySettings.get(user.user_id) || {};

        // Only show users who allow their status to be visible
        if (!privacy.show_online_status) return false;

        // Filter by job category if specified
        if (job_category && user.job_category !== job_category) return false;

        // Only show truly online users (not offline)
        return user.status !== 'offline';
      });

      // Add privacy info and availability
      onlineUsers = onlineUsers.map(user => {
        const privacy = privacySettings.get(user.user_id) || {};
        return {
          ...user,
          is_available_for_chat: privacy.allow_messages && user.status !== 'busy',
          is_available_for_recruiter: privacy.allow_recruiter_messages,
          last_seen_friendly: getTimeFriendly(user.last_seen)
        };
      });

      // Sort by status priority (online > away > busy)
      const statusPriority = { 'online': 1, 'away': 2, 'busy': 3 };
      onlineUsers.sort((a, b) => {
        const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 4;
        const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 4;
        return aPriority - bPriority;
      });

      console.log(`👥 ONLINE USERS RETRIEVED:`, {
        job_category: job_category || 'all',
        total_users: onlineUsers.length,
        available_for_chat: onlineUsers.filter(u => u.is_available_for_chat).length
      });

      return NextResponse.json({
        success: true,
        data: {
          users: onlineUsers,
          count: onlineUsers.length,
          job_category,
          stats: {
            online: onlineUsers.filter(u => u.status === 'online').length,
            away: onlineUsers.filter(u => u.status === 'away').length,
            busy: onlineUsers.filter(u => u.status === 'busy').length,
            available_for_chat: onlineUsers.filter(u => u.is_available_for_chat).length
          }
        }
      });

    } else if (action === 'user_settings' && user_id) {
      // Get specific user's presence and privacy settings
      const presence = userPresence.get(user_id);
      const privacy = privacySettings.get(user_id) || {};

      if (!presence) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          presence,
          privacy_settings: privacy
        }
      });

    } else {
      return NextResponse.json(
        {
          error: 'Invalid action parameter',
          valid_actions: ['online_users', 'user_settings']
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ PRESENCE GET ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve presence data' },
      { status: 500 }
    );
  }
}

// POST - Update user presence or privacy settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user_id } = body;

    if (!action || !user_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['action', 'user_id']
        },
        { status: 400 }
      );
    }

    if (action === 'update_status') {
      const { status, custom_status } = body;

      if (!['online', 'away', 'busy', 'offline'].includes(status)) {
        return NextResponse.json(
          {
            error: 'Invalid status',
            valid_statuses: ['online', 'away', 'busy', 'offline']
          },
          { status: 400 }
        );
      }

      // Update user presence
      const currentPresence = userPresence.get(user_id) || {};
      const updatedPresence = {
        ...currentPresence,
        user_id,
        status,
        custom_status: custom_status || currentPresence.custom_status,
        last_seen: new Date().toISOString()
      };

      userPresence.set(user_id, updatedPresence);

      console.log(`✅ USER STATUS UPDATED:`, {
        user_id,
        status,
        custom_status: custom_status || 'unchanged'
      });

      return NextResponse.json({
        success: true,
        message: 'Status updated successfully',
        data: {
          presence: updatedPresence
        }
      });

    } else if (action === 'update_privacy') {
      const {
        allow_messages,
        allow_recruiter_messages,
        show_online_status,
        auto_away_minutes
      } = body;

      // Update privacy settings
      const currentPrivacy = privacySettings.get(user_id) || {};
      const updatedPrivacy = {
        ...currentPrivacy,
        allow_messages: allow_messages !== undefined ? allow_messages : currentPrivacy.allow_messages,
        allow_recruiter_messages: allow_recruiter_messages !== undefined ? allow_recruiter_messages : currentPrivacy.allow_recruiter_messages,
        show_online_status: show_online_status !== undefined ? show_online_status : currentPrivacy.show_online_status,
        auto_away_minutes: auto_away_minutes !== undefined ? auto_away_minutes : currentPrivacy.auto_away_minutes
      };

      privacySettings.set(user_id, updatedPrivacy);

      console.log(`✅ PRIVACY SETTINGS UPDATED:`, {
        user_id,
        settings: updatedPrivacy
      });

      return NextResponse.json({
        success: true,
        message: 'Privacy settings updated successfully',
        data: {
          privacy_settings: updatedPrivacy
        }
      });

    } else {
      return NextResponse.json(
        {
          error: 'Invalid action',
          valid_actions: ['update_status', 'update_privacy']
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ PRESENCE UPDATE ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to update presence data',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to format time in friendly way
function getTimeFriendly(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}