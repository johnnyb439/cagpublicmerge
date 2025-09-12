'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import { getCurrentUser, signOut } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { isDevMode } from '@/lib/dev-mode'

export default function NavActions() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkAuthState()

    // Listen to auth state changes
    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuthState()
          break
        case 'signedOut':
          setUser(null)
          setIsLoading(false)
          break
      }
    })

    return () => hubListener()
  }, [])

  const checkAuthState = async () => {
    try {
      setIsLoading(true)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      if (isDevMode) {
        // Dev mode fallback
        setUser({ username: 'dev-user' })
      } else {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      // Force signout on error
      setUser(null)
      router.push('/')
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-20 h-9 bg-gray-800 rounded-md animate-pulse" />
        <div className="w-28 h-9 bg-gray-800 rounded-md animate-pulse" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 px-4 py-2 text-sm text-white hover:text-sky-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-opacity-50 rounded-md"
        >
          <User size={16} />
          <span>Dashboard</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-white hover:text-red-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 rounded-md"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/login"
        className="px-4 py-2 text-sm text-white hover:text-sky-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-opacity-50 rounded-md"
      >
        Log In
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 text-sm text-white rounded-md btn-cag-gradient cag-glow focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-opacity-50"
      >
        Create Account
      </Link>
    </div>
  )
}