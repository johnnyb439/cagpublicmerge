// import * as Sentry from '@sentry/nextjs'

// Sentry configuration disabled temporarily due to type conflicts
// TODO: Update to latest Sentry SDK with proper Next.js 15 support

// Sentry.init({
//   dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
//   
//   // Performance Monitoring
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//   
//   // Release tracking
//   release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
//   
//   // Environment
//   environment: process.env.NODE_ENV,
//   
//   // Integrations
//   integrations: [
//     new Sentry.Integrations.Http({ tracing: true }),
//   ],
//   
//   // Filtering
//   beforeSend(event, hint) {
//     // Filter out certain errors
//     if (event.exception) {
//       const error = hint.originalException
//       
//       // Ignore certain errors
//       if (error && error.message) {
//         const ignoredErrors = [
//           'ECONNREFUSED',
//           'ETIMEDOUT',
//           'socket hang up',
//         ]
//         
//         if (ignoredErrors.some(msg => error.message.includes(msg))) {
//           return null
//         }
//       }
//     }
//     
//     // Sanitize sensitive data
//     if (event.request?.data) {
//       const data = event.request.data
//       if (typeof data === 'object' && data !== null) {
//         // Remove sensitive fields
//         const sensitiveFields = ['password', 'token', 'secret', 'apiKey']
//         sensitiveFields.forEach(field => {
//           if (field in data) {
//             data[field] = '[FILTERED]'
//           }
//         })
//       }
//     }
//     
//     return event
//   },
// })