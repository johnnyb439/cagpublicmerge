import { NextRequest, NextResponse } from 'next/server';

// This would connect to your actual message storage
// For demo purposes, we'll use sample data
const sampleMessages = [
  {
    id: 'msg_001',
    conversation_id: 'conv_channel_network',
    sender_id: 'user_alice456',
    content: 'Anyone have experience with Cisco SD-WAN implementations? Working on a big project and could use some insights! 🌐',
    message_type: 'text',
    sent_at: '2025-09-14T16:45:00Z',
    conversation_type: 'channel',
    channel_name: 'Network Engineers',
    sender_name: 'Alice Johnson'
  },
  {
    id: 'msg_002',
    conversation_id: 'conv_direct_001',
    sender_id: 'user_john789',
    content: 'Hey! How\'s the job search going? I heard TechCorp is hiring network engineers.',
    message_type: 'text',
    sent_at: '2025-09-14T15:30:00Z',
    conversation_type: 'direct',
    sender_name: 'John Smith'
  },
  {
    id: 'msg_003',
    conversation_id: 'conv_recruiter_001',
    sender_id: 'recruiter_sarah456',
    content: 'Hi Terrence! I came across your profile and I\'m impressed with your network engineering background. We have a Senior Network Engineer position that might be perfect for you.',
    message_type: 'text',
    sent_at: '2025-09-14T14:15:00Z',
    conversation_type: 'recruiter',
    sender_name: 'Sarah Williams (TechCorp Recruiter)',
    company: 'TechCorp'
  },
  {
    id: 'msg_004',
    conversation_id: 'conv_channel_security',
    sender_id: 'user_mike123',
    content: 'Just passed my CISSP exam! Thanks to everyone in this channel for the study tips and encouragement 🔒✅',
    message_type: 'text',
    sent_at: '2025-09-14T13:20:00Z',
    conversation_type: 'channel',
    channel_name: 'Cybersecurity Professionals',
    sender_name: 'Mike Rodriguez'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const user_id = searchParams.get('user_id');
    const conversation_type = searchParams.get('type'); // 'direct', 'channel', 'recruiter'
    const conversation_id = searchParams.get('conversation_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query || !user_id) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          required: ['q', 'user_id']
        },
        { status: 400 }
      );
    }

    // In production, this would be a proper database search
    let searchResults = sampleMessages;

    // Filter by search query (case-insensitive)
    const searchTerms = query.toLowerCase().split(' ');
    searchResults = searchResults.filter(message => {
      const searchableContent = `${message.content} ${message.sender_name}`.toLowerCase();
      return searchTerms.some(term => searchableContent.includes(term));
    });

    // Filter by conversation type
    if (conversation_type) {
      searchResults = searchResults.filter(message =>
        message.conversation_type === conversation_type
      );
    }

    // Filter by specific conversation
    if (conversation_id) {
      searchResults = searchResults.filter(message =>
        message.conversation_id === conversation_id
      );
    }

    // Sort by relevance and date (newest first)
    searchResults.sort((a, b) => {
      // Simple relevance scoring based on how many search terms match
      const aMatches = searchTerms.filter(term =>
        a.content.toLowerCase().includes(term)
      ).length;
      const bMatches = searchTerms.filter(term =>
        b.content.toLowerCase().includes(term)
      ).length;

      // If same relevance, sort by date
      if (aMatches === bMatches) {
        return new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime();
      }

      return bMatches - aMatches;
    });

    // Apply pagination
    const totalResults = searchResults.length;
    const paginatedResults = searchResults.slice(offset, offset + limit);

    // Add search highlighting (mark matched terms)
    const highlightedResults = paginatedResults.map(message => ({
      ...message,
      highlighted_content: highlightSearchTerms(message.content, searchTerms),
      relevance_score: searchTerms.filter(term =>
        message.content.toLowerCase().includes(term)
      ).length
    }));

    console.log(`🔍 MESSAGE SEARCH PERFORMED:`, {
      query,
      user_id,
      total_results: totalResults,
      returned_results: highlightedResults.length,
      filters: {
        conversation_type,
        conversation_id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: highlightedResults,
        pagination: {
          total: totalResults,
          limit,
          offset,
          has_more: offset + limit < totalResults
        },
        search_stats: {
          total_results: totalResults,
          conversation_types: [...new Set(searchResults.map(r => r.conversation_type))],
          date_range: {
            earliest: searchResults.length > 0 ?
              Math.min(...searchResults.map(r => new Date(r.sent_at).getTime())) : null,
            latest: searchResults.length > 0 ?
              Math.max(...searchResults.map(r => new Date(r.sent_at).getTime())) : null
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ MESSAGE SEARCH ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to search messages',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      user_id,
      filters = {},
      sort_by = 'relevance', // 'relevance', 'date_asc', 'date_desc'
      limit = 50,
      offset = 0
    } = body;

    if (!query || !user_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['query', 'user_id']
        },
        { status: 400 }
      );
    }

    let searchResults = sampleMessages;

    // Apply advanced filters
    const {
      conversation_types,
      date_from,
      date_to,
      sender_ids,
      has_attachments,
      message_types
    } = filters;

    // Filter by conversation types
    if (conversation_types && conversation_types.length > 0) {
      searchResults = searchResults.filter(message =>
        conversation_types.includes(message.conversation_type)
      );
    }

    // Filter by date range
    if (date_from) {
      searchResults = searchResults.filter(message =>
        new Date(message.sent_at) >= new Date(date_from)
      );
    }

    if (date_to) {
      searchResults = searchResults.filter(message =>
        new Date(message.sent_at) <= new Date(date_to)
      );
    }

    // Filter by specific senders
    if (sender_ids && sender_ids.length > 0) {
      searchResults = searchResults.filter(message =>
        sender_ids.includes(message.sender_id)
      );
    }

    // Filter by message types
    if (message_types && message_types.length > 0) {
      searchResults = searchResults.filter(message =>
        message_types.includes(message.message_type)
      );
    }

    // Apply text search
    const searchTerms = query.toLowerCase().split(' ');
    searchResults = searchResults.filter(message => {
      const searchableContent = `${message.content} ${message.sender_name}`.toLowerCase();
      return searchTerms.some(term => searchableContent.includes(term));
    });

    // Apply sorting
    if (sort_by === 'relevance') {
      searchResults.sort((a, b) => {
        const aMatches = searchTerms.filter(term =>
          a.content.toLowerCase().includes(term)
        ).length;
        const bMatches = searchTerms.filter(term =>
          b.content.toLowerCase().includes(term)
        ).length;
        return bMatches - aMatches;
      });
    } else if (sort_by === 'date_desc') {
      searchResults.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    } else if (sort_by === 'date_asc') {
      searchResults.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
    }

    // Apply pagination
    const totalResults = searchResults.length;
    const paginatedResults = searchResults.slice(offset, offset + limit);

    console.log(`🔍 ADVANCED MESSAGE SEARCH:`, {
      query,
      user_id,
      filters,
      sort_by,
      total_results: totalResults
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: paginatedResults.map(message => ({
          ...message,
          highlighted_content: highlightSearchTerms(message.content, searchTerms)
        })),
        pagination: {
          total: totalResults,
          limit,
          offset,
          has_more: offset + limit < totalResults
        },
        applied_filters: filters
      }
    });

  } catch (error) {
    console.error('❌ ADVANCED SEARCH ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform advanced search',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to highlight search terms in content
function highlightSearchTerms(content: string, searchTerms: string[]): string {
  let highlightedContent = content;

  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>');
  });

  return highlightedContent;
}