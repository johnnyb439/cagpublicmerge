import { NextRequest, NextResponse } from 'next/server';

// Mock data storage - In production, this would be your database
let channels: any[] = [];
let channelMembers: any[] = [];

// Initialize channels with job categories
if (channels.length === 0) {
  const jobCategories = [
    {
      id: 'network_engineering',
      name: 'Network Engineering',
      icon: '🌐',
      description: 'Network infrastructure, routing, switching, and network security professionals.'
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      icon: '🔒',
      description: 'Information security, ethical hacking, compliance, and security architecture.'
    },
    {
      id: 'cloud_engineering',
      name: 'Cloud Engineering',
      icon: '☁️',
      description: 'AWS, Azure, Google Cloud, DevOps, and cloud infrastructure specialists.'
    },
    {
      id: 'systems_admin',
      name: 'Systems Administration',
      icon: '🖥️',
      description: 'Server management, Linux, Windows, and infrastructure operations.'
    },
    {
      id: 'help_desk',
      name: 'Help Desk & Support',
      icon: '🎧',
      description: 'Technical support, user assistance, and customer service professionals.'
    },
    {
      id: 'devops',
      name: 'DevOps Engineering',
      icon: '⚙️',
      description: 'CI/CD, automation, infrastructure as code, and deployment pipelines.'
    },
    {
      id: 'data_engineering',
      name: 'Data Engineering',
      icon: '📊',
      description: 'Data pipelines, analytics, databases, and business intelligence.'
    },
    {
      id: 'software_dev',
      name: 'Software Development',
      icon: '💻',
      description: 'Programming, web development, mobile apps, and software architecture.'
    }
  ];

  channels = jobCategories.map(category => ({
    id: `channel_${category.id}`,
    name: category.name,
    slug: category.id.replace('_', '-'),
    description: category.description,
    job_category: category.id,
    icon: category.icon,
    is_public: true,
    member_count: Math.floor(Math.random() * 300) + 50, // Mock member counts
    created_at: new Date().toISOString()
  }));

  console.log(`✅ INITIALIZED ${channels.length} JOB CATEGORY CHANNELS`);
}

// GET - Retrieve all channels or specific channel info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel_id = searchParams.get('channel_id');
    const job_category = searchParams.get('job_category');
    const user_id = searchParams.get('user_id');

    // Get specific channel
    if (channel_id) {
      const channel = channels.find(c => c.id === channel_id);
      if (!channel) {
        return NextResponse.json(
          { error: 'Channel not found' },
          { status: 404 }
        );
      }

      // Get channel members
      const members = channelMembers.filter(m => m.channel_id === channel_id);

      return NextResponse.json({
        success: true,
        data: {
          channel: {
            ...channel,
            members,
            member_count: members.length
          }
        }
      });
    }

    // Filter by job category
    let filteredChannels = channels;
    if (job_category) {
      filteredChannels = channels.filter(c => c.job_category === job_category);
    }

    // If user_id provided, add membership info
    if (user_id) {
      const userMemberships = channelMembers.filter(m => m.user_id === user_id);
      filteredChannels = filteredChannels.map(channel => ({
        ...channel,
        is_member: userMemberships.some(m => m.channel_id === channel.id),
        user_role: userMemberships.find(m => m.channel_id === channel.id)?.role || null
      }));
    }

    // Sort channels by member count (most popular first)
    filteredChannels.sort((a, b) => b.member_count - a.member_count);

    console.log(`✅ CHANNELS RETRIEVED:`, {
      total_channels: filteredChannels.length,
      user_id: user_id || 'anonymous',
      filter: job_category || 'all'
    });

    return NextResponse.json({
      success: true,
      data: {
        channels: filteredChannels,
        count: filteredChannels.length,
        categories: [...new Set(channels.map(c => c.job_category))]
      }
    });

  } catch (error) {
    console.error('❌ CHANNELS RETRIEVAL ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve channels' },
      { status: 500 }
    );
  }
}

// POST - Join a channel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel_id, user_id, action = 'join' } = body;

    if (!channel_id || !user_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['channel_id', 'user_id']
        },
        { status: 400 }
      );
    }

    // Check if channel exists
    const channel = channels.find(c => c.id === channel_id);
    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    const existingMembership = channelMembers.find(
      m => m.channel_id === channel_id && m.user_id === user_id
    );

    if (action === 'join') {
      // Join channel
      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this channel' },
          { status: 400 }
        );
      }

      const newMember = {
        id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel_id,
        user_id,
        role: 'member',
        joined_at: new Date().toISOString(),
        is_muted: false
      };

      channelMembers.push(newMember);

      // Update channel member count
      const channelIndex = channels.findIndex(c => c.id === channel_id);
      if (channelIndex >= 0) {
        channels[channelIndex].member_count = channelMembers.filter(
          m => m.channel_id === channel_id
        ).length;
      }

      console.log(`✅ USER JOINED CHANNEL:`, {
        user_id,
        channel: channel.name,
        member_count: channels[channelIndex]?.member_count
      });

      return NextResponse.json({
        success: true,
        message: `Successfully joined ${channel.name}`,
        data: {
          membership: newMember,
          channel: channels[channelIndex]
        }
      }, { status: 201 });

    } else if (action === 'leave') {
      // Leave channel
      if (!existingMembership) {
        return NextResponse.json(
          { error: 'User is not a member of this channel' },
          { status: 400 }
        );
      }

      // Remove membership
      const memberIndex = channelMembers.findIndex(
        m => m.channel_id === channel_id && m.user_id === user_id
      );
      if (memberIndex >= 0) {
        channelMembers.splice(memberIndex, 1);
      }

      // Update channel member count
      const channelIndex = channels.findIndex(c => c.id === channel_id);
      if (channelIndex >= 0) {
        channels[channelIndex].member_count = channelMembers.filter(
          m => m.channel_id === channel_id
        ).length;
      }

      console.log(`✅ USER LEFT CHANNEL:`, {
        user_id,
        channel: channel.name,
        member_count: channels[channelIndex]?.member_count
      });

      return NextResponse.json({
        success: true,
        message: `Successfully left ${channel.name}`,
        data: {
          channel: channels[channelIndex]
        }
      });

    } else {
      return NextResponse.json(
        {
          error: 'Invalid action',
          valid_actions: ['join', 'leave']
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ CHANNEL MEMBERSHIP ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to update channel membership',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}