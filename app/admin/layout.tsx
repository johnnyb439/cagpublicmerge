'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, AlertTriangle } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // In a real app, this would check with your auth system
        // For now, we'll simulate admin check
        const isAdmin = checkIfUserIsAdmin()
        
        if (!isAdmin) {
          setIsAuthorized(false)
          // Redirect to unauthorized page or login
          setTimeout(() => {
            router.push('/login?redirect=/admin/dashboard&reason=admin_required')
          }, 2000)
        } else {
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error('Admin access check failed:', error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  const checkIfUserIsAdmin = (): boolean => {
    // Mock admin check - in real app, this would check JWT tokens, session, etc.
    // For demo purposes, we'll allow access
    const userRole = localStorage.getItem('userRole')
    return userRole === 'admin' || process.env.NODE_ENV === 'development'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Verifying Admin Access
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your permissions...
          </p>
        </div>
      </div>
    )
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to access the admin dashboard. This area is restricted to authorized administrators only.
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Security Notice</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This access attempt has been logged for security purposes.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-3 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors"
              >
                Login as Administrator
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cleared Advisory Group
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium">
                  ADMIN MODE
                </span>
              </div>
              
              <button
                onClick={() => {
                  localStorage.removeItem('userRole')
                  router.push('/')
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Exit Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}