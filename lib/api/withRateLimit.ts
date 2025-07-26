import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimitConfig } from '@/lib/security/rateLimiter'

type RouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse

export function withRateLimit(
  handler: RouteHandler,
  config?: RateLimitConfig
) {
  return async (request: NextRequest, context?: any) => {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, config)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    // Add rate limit headers to successful responses
    const response = await handler(request, context)
    
    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
    }
    
    return response
  }
}

// Example usage in an API route:
/*
import { withRateLimit } from '@/lib/api/withRateLimit'

export const GET = withRateLimit(async (request) => {
  // Your route logic here
  return NextResponse.json({ data: 'example' })
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10 // 10 requests per minute
})
*/