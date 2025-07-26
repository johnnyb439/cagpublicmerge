import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Protected routes configuration
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin']
const adminOnlyRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  // const supabase = createMiddlewareClient({ req: request, res: response })
  
  // Enhanced Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Enhanced Content Security Policy for Supabase and authentication
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://www.google-analytics.com https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ]
  
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))
  
  // Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  
  // Check authentication for protected routes
  const pathname = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route))
  
  // Temporarily disable auth checks until Supabase is configured
  /*
  if (isProtectedRoute) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Check admin access
    if (isAdminRoute) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
        
      if (user?.role !== 'admin') {
        return NextResponse.redirect(new URL('/403', request.url))
      }
    }
    
    // Add user context to headers
    response.headers.set('x-user-id', session.user.id)
    response.headers.set('x-user-email', session.user.email || '')
  }
  */
  
  // Rate limiting headers
  response.headers.set('X-RateLimit-Limit', process.env.API_RATE_LIMIT || '100')
  response.headers.set('X-RateLimit-Window', process.env.API_RATE_WINDOW_MS || '60000')
  
  // Audit logging flag for sensitive operations
  if (request.method !== 'GET' && isProtectedRoute) {
    response.headers.set('x-audit-required', 'true')
  }
  
  // Cache headers for static assets
  const staticExtensions = ['.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2']
  const isStaticAsset = staticExtensions.some(ext => pathname.endsWith(ext))
  
  if (isStaticAsset) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname.startsWith('/_next/static/')) {
    // Next.js static files
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname.startsWith('/api/')) {
    // API routes - shorter cache
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60')
  } else {
    // HTML pages - cache with revalidation
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}