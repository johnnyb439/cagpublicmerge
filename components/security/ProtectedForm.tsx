'use client'

import React, { FormEvent, ReactNode } from 'react'
import { useRecaptcha } from '@/lib/security/recaptcha'
import { AlertCircle } from 'lucide-react'

interface ProtectedFormProps {
  children: ReactNode
  onSubmit: (data: FormData, recaptchaToken: string) => Promise<void>
  action: string // reCAPTCHA action name
  className?: string
  showRecaptchaBadge?: boolean
}

export default function ProtectedForm({
  children,
  onSubmit,
  action,
  className,
  showRecaptchaBadge = true
}: ProtectedFormProps) {
  const { execute, siteKey } = useRecaptcha()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Execute reCAPTCHA
      const recaptchaToken = await execute(action)
      
      if (!recaptchaToken && siteKey) {
        throw new Error('reCAPTCHA verification failed')
      }

      // Get form data
      const formData = new FormData(e.currentTarget)
      
      // Submit with reCAPTCHA token
      await onSubmit(formData, recaptchaToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={className}>
        {children}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Submit'}
        </button>
      </form>
      
      {showRecaptchaBadge && siteKey && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Terms of Service
          </a>{' '}
          apply.
        </div>
      )}
    </>
  )
}