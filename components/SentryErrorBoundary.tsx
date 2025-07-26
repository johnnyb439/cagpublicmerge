'use client'

// Sentry integration temporarily disabled
// TODO: Re-enable when Sentry SDK is updated for Next.js 15

export default function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Helper to capture exceptions manually
export const captureException = (error: Error, context?: Record<string, any>) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Exception captured:', error, context)
  }
}