import { NextRequest, NextResponse } from 'next/server'
import { mockDatabase } from '@/lib/mock-db'
import { withRateLimit } from '@/lib/api/withRateLimit'

export interface UserProfile {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  location?: string
  clearanceLevel: string
  yearsExperience?: number
  currentTitle?: string
  currentCompany?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  bio?: string
  skills: string[]
  preferences: {
    jobAlerts: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    weeklyDigest: boolean
    marketingEmails: boolean
    jobTypes: string[]
    salaryRange?: {
      min: number
      max: number
    }
    locations: string[]
    clearanceLevels: string[]
    remoteWork: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'cleared-only'
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    allowRecruiterContact: boolean
  }
  createdAt: string
  updatedAt: string
}

// Use shared mock database

// GET /api/profile - Get user profile
export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    // In production, get userId from authentication token
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1' // Mock user ID

    const profile = mockDatabase.userProfiles.find(p => p.id === userId)
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data based on privacy settings
    const publicProfile = {
      ...profile,
      email: profile.privacy.showEmail ? profile.email : undefined,
      phone: profile.privacy.showPhone ? profile.phone : undefined,
      location: profile.privacy.showLocation ? profile.location : undefined
    }

    return NextResponse.json({
      success: true,
      data: publicProfile
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60 // 60 requests per minute for reading profile
})

// PUT /api/profile - Update user profile
export const PUT = withRateLimit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    // In production, get userId from authentication token
    const userId = body.userId || '1' // Mock user ID
    
    const profileIndex = mockDatabase.userProfiles.findIndex(p => p.id === userId)
    
    if (profileIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    const existingProfile = mockDatabase.userProfiles[profileIndex]
    
    // Update profile with new data
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...body,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString().split('T')[0]
    }

    // Merge nested objects properly
    if (body.preferences) {
      updatedProfile.preferences = {
        ...existingProfile.preferences,
        ...body.preferences
      }
    }

    if (body.privacy) {
      updatedProfile.privacy = {
        ...existingProfile.privacy,
        ...body.privacy
      }
    }

    mockDatabase.userProfiles[profileIndex] = updatedProfile

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 30 // 30 requests per minute for updating profile
})

// POST /api/profile - Create new user profile
export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['email', 'name', 'clearanceLevel']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if profile already exists
    const existingProfile = mockDatabase.userProfiles.find(p => p.email === body.email)
    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Profile with this email already exists' },
        { status: 409 }
      )
    }

    const newProfile: UserProfile = {
      id: Date.now().toString(),
      email: body.email,
      name: body.name,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      clearanceLevel: body.clearanceLevel,
      skills: body.skills || [],
      preferences: {
        jobAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        weeklyDigest: true,
        marketingEmails: false,
        jobTypes: ['full-time'],
        locations: [],
        clearanceLevels: [body.clearanceLevel],
        remoteWork: false,
        ...body.preferences
      },
      privacy: {
        profileVisibility: 'cleared-only',
        showEmail: false,
        showPhone: false,
        showLocation: true,
        allowRecruiterContact: true,
        ...body.privacy
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    mockDatabase.userProfiles.push(newProfile)

    return NextResponse.json({
      success: true,
      data: newProfile,
      message: 'Profile created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10 // 10 requests per minute for creating profiles
})