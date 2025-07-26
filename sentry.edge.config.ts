import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Filtering
  beforeSend(event) {
    // Sanitize sensitive data from edge runtime
    if (event.request?.headers) {
      const headers = event.request.headers
      if ('authorization' in headers) {
        headers.authorization = '[FILTERED]'
      }
      if ('cookie' in headers) {
        headers.cookie = '[FILTERED]'
      }
    }
    
    return event
  },
})