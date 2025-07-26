// import * as Sentry from '@sentry/nextjs'

// Sentry configuration disabled temporarily due to type conflicts
// TODO: Update to latest Sentry SDK with proper Next.js 15 support

// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   
//   // Performance Monitoring
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//   
//   // Session Replay
//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1.0,
//   
//   // Release tracking
//   release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
//   
//   // Environment
//   environment: process.env.NODE_ENV,
//   
//   // Integrations
//   integrations: [
//     new Sentry.BrowserTracing({
//       routingInstrumentation: Sentry.nextRouterInstrumentation,
//     }),
//     new Sentry.Replay({
//       maskAllText: false,
//       blockAllMedia: false,
//     }),
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
//           'ResizeObserver loop limit exceeded',
//           'Non-Error promise rejection captured',
//           'Network request failed',
//         ]
//         
//         if (ignoredErrors.some(msg => error.message.includes(msg))) {
//           return null
//         }
//       }
//     }
//     
//     // Sanitize sensitive data
//     if (event.request?.cookies) {
//       event.request.cookies = '[FILTERED]'
//     }
//     
//     return event
//   },
//   
//   // User context
//   beforeBreadcrumb(breadcrumb) {
//     // Filter out certain breadcrumbs
//     if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
//       return null
//     }
//     
//     return breadcrumb
//   },
// })