import { NextRequest } from 'next/server'
import { LRUCache } from 'lru-cache'
import { rateLimit, RateLimitConfig, RateLimitResult } from './rateLimiter'

export interface AdvancedRateLimitConfig extends RateLimitConfig {
  burstLimit?: number // Allow short bursts
  slidingWindow?: boolean // Use sliding window instead of fixed window
  skipSuccessfulGET?: boolean // Skip rate limiting for successful GET requests
  whitelist?: string[] // IP addresses to skip rate limiting
  blacklist?: string[] // IP addresses to always block
}

export interface AdvancedRateLimitResult extends RateLimitResult {
  reason?: string
  isBlacklisted?: boolean
  isWhitelisted?: boolean
}

// Suspicious activity tracking
interface SuspiciousActivity {
  consecutiveFailures: number
  lastFailure: number
  totalRequests: number
  patterns: string[]
}

// Caches for advanced rate limiting
const suspiciousActivityCache = new LRUCache<string, SuspiciousActivity>({
  max: 1000,
  ttl: 24 * 60 * 60 * 1000 // 24 hours
})

const burstCache = new LRUCache<string, number[]>({
  max: 1000,
  ttl: 60 * 1000 // 1 minute for burst detection
})

// IP reputation tracking
const ipReputationCache = new LRUCache<string, number>({
  max: 5000,
  ttl: 60 * 60 * 1000 // 1 hour
})

export async function advancedRateLimit(
  request: NextRequest,
  config: AdvancedRateLimitConfig = {}
): Promise<AdvancedRateLimitResult> {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check blacklist first
  if (config.blacklist?.includes(ip)) {
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: Date.now() + (24 * 60 * 60 * 1000),
      reason: 'IP blacklisted',
      isBlacklisted: true
    }
  }
  
  // Check whitelist
  if (config.whitelist?.includes(ip)) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: Date.now() + config.interval,
      isWhitelisted: true
    }
  }
  
  // Check for suspicious patterns
  const suspiciousResult = checkSuspiciousActivity(request, ip, userAgent)
  if (!suspiciousResult.success) {
    return suspiciousResult
  }
  
  // Check burst limit
  if (config.burstLimit) {
    const burstResult = checkBurstLimit(ip, config.burstLimit)
    if (!burstResult.success) {
      return burstResult
    }
  }
  
  // Apply standard rate limiting
  const standardResult = await rateLimit(request, config)
  
  // Track IP reputation
  updateIPReputation(ip, standardResult.success)
  
  return {
    ...standardResult,
    reason: standardResult.success ? undefined : 'Rate limit exceeded'
  }
}

function getClientIP(request: NextRequest): string {
  // Try multiple headers to get real IP
  const candidates = [
    request.headers.get('cf-connecting-ip'), // Cloudflare
    request.headers.get('x-real-ip'), // Nginx
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(), // Load balancer
    request.ip,
    'unknown'
  ]
  
  return candidates.find(ip => ip && ip !== 'unknown') || 'unknown'
}

function checkSuspiciousActivity(
  request: NextRequest,
  ip: string,
  userAgent: string
): AdvancedRateLimitResult {
  const now = Date.now()
  const activity = suspiciousActivityCache.get(ip) || {
    consecutiveFailures: 0,
    lastFailure: 0,
    totalRequests: 0,
    patterns: []
  }
  
  activity.totalRequests++
  
  // Check for bot patterns
  const botPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ]
  
  const isBotLike = botPatterns.some(pattern => pattern.test(userAgent))
  
  // Check for suspicious request patterns
  const pathname = new URL(request.url).pathname
  const suspiciousPatterns = [
    /\.php$/,
    /wp-admin/,
    /\.env/,
    /config/,
    /admin/,
    /\.git/,
    /\.\./
  ]
  
  const isSuspiciousPath = suspiciousPatterns.some(pattern => pattern.test(pathname))
  
  // Rate of requests (more than 10 per second is suspicious)
  const requestRate = activity.totalRequests / Math.max(1, (now - activity.lastFailure) / 1000)
  
  if (isBotLike || isSuspiciousPath || requestRate > 10) {
    activity.consecutiveFailures++
    activity.lastFailure = now
    activity.patterns.push(`${isBotLike ? 'bot' : ''}${isSuspiciousPath ? 'suspicious-path' : ''}${requestRate > 10 ? 'high-rate' : ''}`)
    
    suspiciousActivityCache.set(ip, activity)
    
    // Block after 5 suspicious activities
    if (activity.consecutiveFailures >= 5) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: now + (60 * 60 * 1000), // 1 hour block
        reason: 'Suspicious activity detected'
      }
    }
  }
  
  return { success: true, limit: 0, remaining: 0, reset: 0 }
}

function checkBurstLimit(ip: string, burstLimit: number): AdvancedRateLimitResult {
  const now = Date.now()
  const timestamps = burstCache.get(ip) || []
  
  // Filter timestamps from last 10 seconds
  const recentTimestamps = timestamps.filter(ts => now - ts < 10000)
  
  if (recentTimestamps.length >= burstLimit) {
    return {
      success: false,
      limit: burstLimit,
      remaining: 0,
      reset: Math.min(...recentTimestamps) + 10000,
      reason: 'Burst limit exceeded'
    }
  }
  
  // Add current timestamp
  recentTimestamps.push(now)
  burstCache.set(ip, recentTimestamps)
  
  return { success: true, limit: 0, remaining: 0, reset: 0 }
}

function updateIPReputation(ip: string, success: boolean): void {
  const currentScore = ipReputationCache.get(ip) || 50 // Start with neutral score
  
  if (success) {
    // Slowly improve reputation for successful requests
    const newScore = Math.min(100, currentScore + 1)
    ipReputationCache.set(ip, newScore)
  } else {
    // Quickly decrease reputation for failures
    const newScore = Math.max(0, currentScore - 5)
    ipReputationCache.set(ip, newScore)
  }
}

// Get IP reputation score (0-100, lower is worse)
export function getIPReputation(ip: string): number {
  return ipReputationCache.get(ip) || 50
}

// Security middleware with adaptive rate limiting
export function createSecurityMiddleware(config: AdvancedRateLimitConfig = {}) {
  return async (request: NextRequest) => {
    const ip = getClientIP(request)
    const reputation = getIPReputation(ip)
    
    // Adjust rate limits based on reputation
    const adjustedConfig = {
      ...config,
      uniqueTokenPerInterval: Math.floor(config.uniqueTokenPerInterval * (reputation / 100))
    }
    
    return advancedRateLimit(request, adjustedConfig)
  }
}

// DDoS protection
export function detectDDoS(requests: number, timeWindow: number): boolean {
  // Simple DDoS detection: more than 1000 requests per minute
  return requests > 1000 && timeWindow < 60000
}