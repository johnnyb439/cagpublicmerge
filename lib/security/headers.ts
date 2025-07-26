import { generateCSPHeader, getCSPDirectives } from './csp'

export interface SecurityHeaders {
  [key: string]: string
}

export const getSecurityHeaders = (isDev: boolean = false): SecurityHeaders => {
  const cspConfig = getCSPDirectives(isDev)
  const cspHeader = generateCSPHeader(cspConfig)

  return {
    // Content Security Policy
    'Content-Security-Policy': cspConfig.reportOnly ? '' : cspHeader,
    'Content-Security-Policy-Report-Only': cspConfig.reportOnly ? cspHeader : '',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (Feature Policy)
    'Permissions-Policy': [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'navigation-override=()',
      'payment=(self)',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ].join(', '),
    
    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': isDev 
      ? '' 
      : 'max-age=31536000; includeSubDomains; preload',
    
    // Cross-Origin policies
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    
    // Remove server information
    'Server': '',
    'X-Powered-By': '',
    
    // Cache control for sensitive endpoints
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}

// Middleware function to apply security headers
export const applySecurityHeaders = (
  headers: Headers,
  isDev: boolean = false
): void => {
  const securityHeaders = getSecurityHeaders(isDev)
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value)
    }
  })
}

// Security headers for API routes
export const getAPISecurityHeaders = (): SecurityHeaders => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
      ? 'http://localhost:*' 
      : 'https://clearedadvisorygroup.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  }
}

// Rate limiting headers
export const getRateLimitHeaders = (
  limit: number,
  remaining: number,
  reset: number
): SecurityHeaders => {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
    'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
  }
}