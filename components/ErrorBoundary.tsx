'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ errorInfo })
    
    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry or other error tracking service
      // logErrorToService(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      const isDevelopment = process.env.NODE_ENV === 'development'

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-ops-charcoal p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-command-black rounded-lg shadow-xl p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>

              {isDevelopment && this.state.error && (
                <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development Only):
                  </h2>
                  <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        {'\n\nComponent Stack:'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-6 py-3 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Refresh Page
                </button>
                
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Link>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
                If this problem persists, please{' '}
                <Link href="/contact" className="text-dynamic-green hover:underline">
                  contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}