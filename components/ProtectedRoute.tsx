'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'
import { isDevMode } from '@/lib/dev-mode'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await getCurrentUser()
      setIsAuthenticated(true)
    } catch (error) {
      if (isDevMode) {
        // Allow access in dev mode
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Redirect to login with next parameter
        const nextParam = encodeURIComponent(pathname)
        router.replace(`/login?next=${nextParam}`)
      }
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}