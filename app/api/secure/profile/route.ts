import { NextRequest } from 'next/server'
import { z } from 'zod'
import { 
  rateLimit, 
  validateInput, 
  createSecureResponse, 
  createErrorResponse,
  requiresAudit
} from '@/lib/api/security'
import { auditLogger, logUserAction } from '@/lib/audit/logger'
import { supabase } from '@/lib/supabase/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// Validation schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).max(20).optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional()
})

// GET /api/secure/profile - Get user profile
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, {
      windowMs: 60000,
      max: 100
    })
    if (rateLimitResult) return rateLimitResult

    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        first_name,
        last_name,
        phone,
        clearance_level,
        clearance_verified,
        clearance_expiry,
        bio,
        skills,
        years_experience,
        linkedin_url,
        github_url,
        mfa_enabled,
        created_at,
        updated_at
      `)
      .eq('id', session.user.id)
      .single()

    if (error || !profile) {
      return createErrorResponse('Profile not found', 404)
    }

    // Remove sensitive fields
    const { mfa_secret, ...safeProfile } = profile

    // Log profile view
    await logUserAction('VIEW_PROFILE', 'user', session.user.id, {
      self: true
    })

    return createSecureResponse({
      success: true,
      data: safeProfile
    })

  } catch (error) {
    console.error('Profile GET error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

// PUT /api/secure/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, {
      windowMs: 60000,
      max: 20 // Lower limit for updates
    })
    if (rateLimitResult) return rateLimitResult

    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Parse and validate request body
    const body = await req.json()
    const validation = validateInput(body, updateProfileSchema)
    
    if (!validation.success) {
      return createErrorResponse('Invalid input', 400, validation.errors)
    }

    // Get current profile for audit logging
    const { data: currentProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    // Update profile
    const updateData = {
      first_name: validation.data.firstName,
      last_name: validation.data.lastName,
      phone: validation.data.phone,
      bio: validation.data.bio,
      skills: validation.data.skills,
      years_experience: validation.data.yearsExperience,
      linkedin_url: validation.data.linkedinUrl,
      github_url: validation.data.githubUrl,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      return createErrorResponse('Failed to update profile', 500)
    }

    // Audit log with old and new data
    if (requiresAudit(req)) {
      await auditLogger.log({
        user_id: session.user.id,
        action: 'UPDATE_PROFILE',
        resource_type: 'user',
        resource_id: session.user.id,
        old_data: currentProfile,
        new_data: updatedProfile,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
    }

    // Remove sensitive fields from response
    const { mfa_secret, ...safeProfile } = updatedProfile

    return createSecureResponse({
      success: true,
      data: safeProfile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile PUT error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

// DELETE /api/secure/profile - Delete user account
export async function DELETE(req: NextRequest) {
  try {
    // Strict rate limiting for account deletion
    const rateLimitResult = await rateLimit(req, {
      windowMs: 3600000, // 1 hour
      max: 3
    })
    if (rateLimitResult) return rateLimitResult

    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Verify password (in production, you'd require password confirmation)
    const body = await req.json()
    const { password, reason } = body

    if (!password) {
      return createErrorResponse('Password confirmation required', 400)
    }

    // TODO: Verify password against hash

    // Soft delete approach - anonymize data instead of hard delete
    const anonymizedData = {
      email: `deleted_${session.user.id}@example.com`,
      first_name: 'Deleted',
      last_name: 'User',
      phone: null,
      bio: null,
      skills: null,
      linkedin_url: null,
      github_url: null,
      clearance_level: 'None',
      clearance_verified: false,
      clearance_expiry: null,
      active: false,
      deleted_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('users')
      .update(anonymizedData)
      .eq('id', session.user.id)

    if (error) {
      return createErrorResponse('Failed to delete account', 500)
    }

    // Audit log account deletion
    await auditLogger.log({
      user_id: session.user.id,
      action: 'DELETE_ACCOUNT',
      resource_type: 'user',
      resource_id: session.user.id,
      metadata: {
        reason,
        timestamp: new Date().toISOString()
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    // Invalidate session
    // In production, you'd also clear all sessions for this user

    return createSecureResponse({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Profile DELETE error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}