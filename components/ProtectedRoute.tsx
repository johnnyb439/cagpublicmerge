'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSecurity } from '@/contexts/SecurityContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredClearance?: string
}

export default function ProtectedRoute({ children, requiredClearance }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useSecurity()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/secure-login')
    }
    
    if (!isLoading && isAuthenticated && requiredClearance) {
      // Check if user has required clearance level
      const clearanceLevels = ['None', 'Confidential', 'Secret', 'Top Secret', 'TS/SCI']
      const userLevel = clearanceLevels.indexOf(user?.clearanceLevel || 'None')
      const requiredLevel = clearanceLevels.indexOf(requiredClearance)
      
      if (userLevel < requiredLevel) {
        router.push('/dashboard?error=insufficient-clearance')
      }
    }
  }, [isLoading, isAuthenticated, user, requiredClearance, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying security clearance...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}