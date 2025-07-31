'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-ops-charcoal">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-montserrat font-bold mb-4">Something went wrong!</h2>
        <p className="text-intel-gray mb-8 max-w-md mx-auto">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  )
}