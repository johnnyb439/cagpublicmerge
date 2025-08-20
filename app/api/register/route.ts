import { NextRequest, NextResponse } from 'next/server';

// Admin API configuration
const ADMIN_API_URL = 'http://localhost:3003/api/sync/users';
const API_KEY = 'CAG_API_KEY_2025_SECURE';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.email || !body.password || !body.username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, register user locally (simplified for testing)
    const localUser = {
      email: body.email,
      username: body.username,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      createdAt: new Date().toISOString()
    };

    console.log('[PUBLIC SITE] New user registration:', localUser.email);

    // Then sync with admin panel
    try {
      const adminResponse = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          ...localUser,
          source: 'public_site',
          role: 'user'
        })
      });

      const adminData = await adminResponse.json();
      
      if (!adminResponse.ok) {
        console.error('[PUBLIC SITE] Failed to sync with admin:', adminData.error);
        // Continue anyway - user is registered locally
      } else {
        console.log('[PUBLIC SITE] User synced to admin panel successfully');
      }
    } catch (syncError) {
      console.error('[PUBLIC SITE] Could not sync with admin panel:', syncError);
      // Continue - don't fail registration if admin sync fails
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        email: localUser.email,
        username: localUser.username
      }
    });
  } catch (error) {
    console.error('[PUBLIC SITE] Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}