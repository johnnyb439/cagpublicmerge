import { supabase, isSupabaseConfigured } from './client'
import { secureStorage } from '@/lib/security/secureStorage'
import { sessionManager } from '@/lib/security/sessionManager'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  clearanceLevel: string
  role: 'jobseeker' | 'employer' | 'admin'
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService
  
  private constructor() {}
  
  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService()
    }
    return SupabaseAuthService.instance
  }
  
  /**
   * Sign up a new user
   */
  async signUp(
    email: string, 
    password: string, 
    metadata: {
      name: string
      clearanceLevel: string
      role: 'jobseeker' | 'employer'
    }
  ) {
    try {
      // Use Supabase if configured
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        })
        
        if (error) throw error
        
        return { success: true, user: data.user }
      }
      
      // Fallback to local storage for development
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const existingUser = users.find((u: any) => u.email === email)
      
      if (existingUser) {
        throw new Error('User already exists')
      }
      
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password, // In production, this would be hashed
        ...metadata,
        createdAt: new Date().toISOString()
      }
      
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      return { success: true, user: newUser }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string) {
    try {
      // Use Supabase if configured
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        // Initialize secure storage with password
        await secureStorage.initialize(password)
        
        // Create session
        await sessionManager.createSession(
          data.user.id,
          data.user.email!,
          password
        )
        
        // Get user profile
        const profile = await this.getUserProfile(data.user.id)
        
        // Store user data securely
        await secureStorage.setItem('user', profile, true)
        
        return { success: true, user: profile }
      }
      
      // Fallback to local storage for development
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find((u: any) => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error('Invalid credentials')
      }
      
      // Initialize secure storage
      await secureStorage.initialize(password)
      
      // Create session
      await sessionManager.createSession(user.id, user.email, password)
      
      // Store user data
      const userData: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        clearanceLevel: user.clearanceLevel,
        role: user.role || 'jobseeker'
      }
      
      await secureStorage.setItem('user', userData, true)
      
      return { success: true, user: userData }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut()
      }
      
      // Clear session and secure storage
      await sessionManager.destroySession()
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return null
        
        return await this.getUserProfile(user.id)
      }
      
      // Fallback to secure storage
      const userData = await secureStorage.getItem('user')
      return userData
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }
  
  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string): Promise<AuthUser> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error || !data) {
        throw new Error('User profile not found')
      }
      
      return {
        id: data.id,
        email: data.email,
        name: `${data.first_name} ${data.last_name}`,
        clearanceLevel: data.clearance_level,
        role: data.role as 'jobseeker' | 'employer' | 'admin'
      }
    }
    
    // Fallback for development
    const userData = await secureStorage.getItem('user')
    if (!userData) throw new Error('User not found')
    
    return userData
  }
  
  /**
   * Update user password
   */
  async updatePassword(currentPassword: string, newPassword: string) {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (error) throw error
      }
      
      // Update secure storage master password
      await secureStorage.changeMasterPassword(currentPassword, newPassword)
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        })
        
        if (error) throw error
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Verify email with OTP
   */
  async verifyEmail(email: string, token: string) {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup'
        })
        
        if (error) throw error
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export const supabaseAuth = SupabaseAuthService.getInstance()