'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { ErrorBoundary } from '@sentry/nextjs'

interface FallbackProps {
  error: Error
  resetError: () => void
}

function ErrorFallback({ error, resetError }: FallbackProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error)
    }
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're sorry for the inconvenience. Our team has been notified and is working on a fix.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="px-6 py-3 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors"
          >
            Try Again
          </button>
          <p className="text-sm text-gray-500">
            Error ID: {Sentry.lastEventId()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={ErrorFallback} showDialog>
      {children}
    </ErrorBoundary>
  )
}

// Helper to capture exceptions manually
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context)
    }
    Sentry.captureException(error)
  })
}

// Helper to capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level)
}

// Helper to add user context
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user)
}

// Helper to add custom context
export const addBreadcrumb = (breadcrumb: {
  message: string
  category?: string
  level?: Sentry.SeverityLevel
  data?: Record<string, any>
}) => {
  Sentry.addBreadcrumb(breadcrumb)
}