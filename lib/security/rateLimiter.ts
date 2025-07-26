import { NextRequest } from 'next/server'
import { LRUCache } from 'lru-cache'

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Different rate limits for different endpoints
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Auth endpoints - stricter limits
  '/api/auth/login': {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 5
  },
  '/api/auth/register': {
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 3
  },
  '/api/auth/reset-password': {
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 3
  },
  
  // AI endpoints - expensive operations
  '/api/ai/resume-analysis': {
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 10
  },
  '/api/ai/quick-analysis': {
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 20
  },
  
  // General API endpoints
  '/api/jobs': {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30
  },
  '/api/applications': {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 20
  },
  
  // Default for other endpoints
  default: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 60
  }
}

// Create separate caches for different rate limit intervals
const rateLimiters = new Map<string, LRUCache<string, number[]>>()

function getRateLimiter(interval: number): LRUCache<string, number[]> {
  const key = `limiter_${interval}`
  
  if (!rateLimiters.has(key)) {
    const limiter = new LRUCache<string, number[]>({
      max: 5000, // Max number of unique IPs to track
      ttl: interval
    })
    rateLimiters.set(key, limiter)
  }
  
  return rateLimiters.get(key)!
}

export async function rateLimit(
  request: NextRequest,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  // Get config for this endpoint
  const pathname = new URL(request.url).pathname
  const endpointConfig = config || rateLimitConfigs[pathname] || rateLimitConfigs.default
  
  // Get identifier (IP + User ID if authenticated)
  const identifier = getIdentifier(request)
  
  // Get the appropriate rate limiter
  const limiter = getRateLimiter(endpointConfig.interval)
  
  // Get current request timestamps for this identifier
  const now = Date.now()
  const timestamps = limiter.get(identifier) || []
  
  // Filter out old timestamps
  const recentTimestamps = timestamps.filter(
    timestamp => now - timestamp < endpointConfig.interval
  )
  
  // Check if limit exceeded
  if (recentTimestamps.length >= endpointConfig.uniqueTokenPerInterval) {
    return {
      success: false,
      limit: endpointConfig.uniqueTokenPerInterval,
      remaining: 0,
      reset: Math.min(...recentTimestamps) + endpointConfig.interval
    }
  }
  
  // Add current timestamp
  recentTimestamps.push(now)
  limiter.set(identifier, recentTimestamps)
  
  return {
    success: true,
    limit: endpointConfig.uniqueTokenPerInterval,
    remaining: endpointConfig.uniqueTokenPerInterval - recentTimestamps.length,
    reset: now + endpointConfig.interval
  }
}

function getIdentifier(request: NextRequest): string {
  // Try to get real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  
  // Get user ID from auth header if available
  const authHeader = request.headers.get('authorization')
  const userId = authHeader ? extractUserIdFromToken(authHeader) : 'anonymous'
  
  return `${ip}_${userId}`
}

function extractUserIdFromToken(authHeader: string): string {
  // This is a placeholder - implement based on your auth system
  // For JWT, you would decode the token and extract the user ID
  try {
    const token = authHeader.replace('Bearer ', '')
    // Decode JWT and extract user ID
    // const decoded = jwt.decode(token)
    // return decoded?.userId || 'anonymous'
    return 'anonymous' // Placeholder
  } catch {
    return 'anonymous'
  }
}

// Middleware helper
export function createRateLimitMiddleware(config?: RateLimitConfig) {
  return async (request: NextRequest) => {
    const result = await rateLimit(request, config)
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    return null // Continue to the route handler
  }
}