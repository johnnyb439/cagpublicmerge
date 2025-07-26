'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { sessionManager } from '@/lib/security/sessionManager'
import { secureStorage } from '@/lib/security/secureStorage'
import { validation } from '@/lib/security/validation'

interface User {
  id: string
  email: string
  name: string
  clearanceLevel: string
}

interface SecurityContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string, clearanceLevel: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  remainingTime: number
  extendSession: () => Promise<void>
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

export function SecurityProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [remainingTime, setRemainingTime] = useState(0)
  const [showWarning, setShowWarning] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  // Update remaining time every second
  useEffect(() => {
    const interval = setInterval(async () => {
      const time = await sessionManager.getRemainingTime()
      setRemainingTime(Math.floor(time / 1000)) // Convert to seconds
    }, 1000)

    return () => clearInterval(interval)
  }, [user])

  // Set up session callbacks
  useEffect(() => {
    sessionManager.setOnTimeout(() => {
      handleSessionTimeout()
    })

    sessionManager.setOnWarning(() => {
      setShowWarning(true)
    })
  }, [])

  const checkSession = async () => {
    try {
      const session = await sessionManager.getSession()
      if (session) {
        const userData = await secureStorage.getItem('user')
        if (userData) {
          setUser(userData)
        }
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSessionTimeout = () => {
    setUser(null)
    router.push('/login?reason=timeout')
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate inputs
      if (!validation.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' }
      }

      // In a real app, this would be an API call
      // For now, we'll check against stored user data
      const storedUsers = localStorage.getItem('users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      
      const user = users.find((u: any) => u.email === email)
      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify password (in real app, this would be done server-side)
      // For demo, we'll use a simple check
      const expectedPassword = await secureStorage.hashPassword(password)
      if (user.password !== expectedPassword) {
        // Try with plain password for legacy users
        if (user.password !== password) {
          return { success: false, error: 'Invalid email or password' }
        }
      }

      // Create session
      await sessionManager.createSession(user.id || email, email, password)
      
      // Store user data securely
      const userData = {
        id: user.id || email,
        email: user.email,
        name: user.name,
        clearanceLevel: user.clearanceLevel
      }
      await secureStorage.setItem('user', userData, true)
      
      setUser(userData)
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    clearanceLevel: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate inputs
      const emailValid = validation.isValidEmail(email)
      if (!emailValid) {
        return { success: false, error: 'Invalid email format' }
      }

      const passwordValidation = validation.validatePassword(password)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors[0] }
      }

      if (!validation.isValidName(name)) {
        return { success: false, error: 'Invalid name format' }
      }

      if (!validation.isValidClearanceLevel(clearanceLevel)) {
        return { success: false, error: 'Invalid clearance level' }
      }

      // Check if user already exists
      const storedUsers = localStorage.getItem('users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      
      if (users.find((u: any) => u.email === email)) {
        return { success: false, error: 'Email already registered' }
      }

      // Hash password
      const hashedPassword = await secureStorage.hashPassword(password)
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password: hashedPassword,
        name: validation.sanitizeInput(name),
        clearanceLevel,
        createdAt: Date.now()
      }
      
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      // Auto-login after registration
      return await login(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await sessionManager.destroySession()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const updatePassword = async (
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      // Validate new password
      const passwordValidation = validation.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors[0] }
      }

      // Change password in secure storage
      await secureStorage.changeMasterPassword(currentPassword, newPassword)
      
      // Update user password in storage
      const storedUsers = localStorage.getItem('users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      const userIndex = users.findIndex((u: any) => u.email === user.email)
      
      if (userIndex !== -1) {
        users[userIndex].password = await secureStorage.hashPassword(newPassword)
        localStorage.setItem('users', JSON.stringify(users))
      }
      
      return { success: true }
    } catch (error) {
      console.error('Password update failed:', error)
      return { success: false, error: 'Failed to update password' }
    }
  }

  const extendSession = async () => {
    await sessionManager.extendSession()
    setShowWarning(false)
  }

  return (
    <SecurityContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updatePassword,
        remainingTime,
        extendSession
      }}
    >
      {children}
      
      {/* Session Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Session Expiring Soon</h3>
            <p className="mb-6">
              Your session will expire in 5 minutes due to inactivity. 
              Would you like to continue?
            </p>
            <div className="flex gap-4">
              <button
                onClick={extendSession}
                className="flex-1 bg-dynamic-green text-white px-4 py-2 rounded-lg hover:bg-emerald-green"
              >
                Continue Session
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </SecurityContext.Provider>
  )
}

export function useSecurity() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}