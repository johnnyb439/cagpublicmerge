import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import { z } from 'zod'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaToken: z.string().optional()
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['jobseeker', 'employer'])
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mfaToken: { label: '2FA Code', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials) return null

        try {
          // Validate input
          const { email, password, mfaToken } = loginSchema.parse(credentials)

          // Get user from database
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

          if (error || !user) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const passwordValid = await bcrypt.compare(password, user.password_hash)
          if (!passwordValid) {
            throw new Error('Invalid credentials')
          }

          // Check MFA if enabled
          if (user.mfa_enabled) {
            if (!mfaToken) {
              throw new Error('MFA token required')
            }

            const verified = speakeasy.totp.verify({
              secret: user.mfa_secret,
              encoding: 'base32',
              token: mfaToken,
              window: 2
            })

            if (!verified) {
              throw new Error('Invalid MFA token')
            }
          }

          // Update last login
          await supabase
            .from('users')
            .update({
              last_login: new Date().toISOString(),
              login_count: user.login_count + 1
            })
            .eq('id', user.id)

          // Create audit log
          await createAuditLog({
            user_id: user.id,
            action: 'LOGIN',
            resource_type: 'auth',
            ip_address: credentials.ip || null
          })

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            clearanceLevel: user.clearance_level,
            clearanceVerified: user.clearance_verified,
            mfaEnabled: user.mfa_enabled
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clearanceLevel = user.clearanceLevel
        token.clearanceVerified = user.clearanceVerified
        token.mfaEnabled = user.mfaEnabled
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.clearanceLevel = token.clearanceLevel as string
        session.user.clearanceVerified = token.clearanceVerified as boolean
        session.user.mfaEnabled = token.mfaEnabled as boolean
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      // Log successful sign in
      console.log(`User ${user.email} signed in`)
    },
    async signOut({ session, token }) {
      // Log sign out
      if (session?.user?.id) {
        await createAuditLog({
          user_id: session.user.id,
          action: 'LOGOUT',
          resource_type: 'auth'
        })
      }
    }
  }
}

// Helper function to create audit logs
async function createAuditLog(data: {
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  ip_address?: string | null
  user_agent?: string | null
  old_data?: any
  new_data?: any
}) {
  try {
    await supabase.from('audit_logs').insert(data)
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

// MFA setup functions
export async function generateMFASecret(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `ClearedAdvisoryGroup:${userId}`,
    issuer: 'ClearedAdvisoryGroup'
  })

  // Store encrypted secret in database
  await supabase
    .from('users')
    .update({ mfa_secret: secret.base32 })
    .eq('id', userId)

  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url
  }
}

export async function verifyMFAToken(userId: string, token: string) {
  const { data: user } = await supabase
    .from('users')
    .select('mfa_secret')
    .eq('id', userId)
    .single()

  if (!user?.mfa_secret) {
    throw new Error('MFA not set up')
  }

  return speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: 'base32',
    token,
    window: 2
  })
}

export async function enableMFA(userId: string, token: string) {
  const verified = await verifyMFAToken(userId, token)
  
  if (!verified) {
    throw new Error('Invalid MFA token')
  }

  await supabase
    .from('users')
    .update({ mfa_enabled: true })
    .eq('id', userId)

  await createAuditLog({
    user_id: userId,
    action: 'ENABLE_MFA',
    resource_type: 'user_settings'
  })

  return true
}