'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'

// Stub function for auth - you can replace this with your actual auth logic
function getUser() {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'null' && userData !== '{}') {
      const user = JSON.parse(userData)
      // Only return user if it has meaningful data
      return user && Object.keys(user).length > 0 ? user : null
    }
    return null
  } catch (error) {
    return null
  }
}

function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}

// Temporary function to simulate login for testing
function tempLogin() {
  if (typeof window !== 'undefined') {
    const testUser = { 
      id: 1, 
      name: 'Test User', 
      email: 'test@example.com' 
    }
    localStorage.setItem('user', JSON.stringify(testUser))
    window.location.reload()
  }
}

export default function NavActions() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUser(getUser())
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
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
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user')
              setUser(null)
              window.location.href = '/'
              window.location.reload()
            }
          }}
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
      <button
        onClick={tempLogin}
        className="px-4 py-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded-md border border-yellow-400"
      >
        [Test Login]
      </button>
    </div>
  )
}