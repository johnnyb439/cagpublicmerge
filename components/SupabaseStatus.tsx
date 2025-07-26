'use client'

import { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { Database, AlertCircle, CheckCircle, X } from 'lucide-react'

export default function SupabaseStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const isDev = process.env.NODE_ENV === 'development'
  
  useEffect(() => {
    setIsConnected(isSupabaseConfigured())
  }, [])
  
  if (!isDev || !showBanner) return null
  
  return (
    <div className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 ${
      isConnected 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            isConnected 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {isConnected ? 'Supabase Connected' : 'Development Mode'}
          </h3>
          <div className={`mt-2 text-sm ${
            isConnected 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {isConnected ? (
              <p>Database connection established.</p>
            ) : (
              <>
                <p>Using local storage for demo.</p>
                <p className="mt-1">Demo credentials:</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• john.doe@example.com / Test123!@#</li>
                  <li>• recruiter@techcorp.com / Test123!@#</li>
                </ul>
                <a 
                  href="/SUPABASE_SETUP.md" 
                  target="_blank"
                  className="mt-2 inline-flex items-center text-xs underline hover:no-underline"
                >
                  Setup Supabase →
                </a>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="ml-4 flex-shrink-0"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
    </div>
  )
}