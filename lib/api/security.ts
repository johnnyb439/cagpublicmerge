import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// API Key store (in production, use database)
const apiKeyStore = new Map<string, { userId: string; permissions: string[] }>()

export interface RateLimitOptions {
  windowMs: number
  max: number
  message?: string
}

export interface ApiSecurityContext {
  userId?: string
  userEmail?: string
  apiKey?: string
  ipAddress: string
  userAgent: string
}

// Rate limiting middleware
export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {
    windowMs: 60000, // 1 minute
    max: 100
  }
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(req)
  const now = Date.now()
  
  const record = rateLimitStore.get(identifier) || { count: 0, resetTime: now + options.windowMs }
  
  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + options.windowMs
  }
  
  record.count++
  rateLimitStore.set(identifier, record)
  
  if (record.count > options.max) {
    return NextResponse.json(
      { error: options.message || 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(options.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
        }
      }
    )
  }
  
  return null
}

// API Key validation
export async function validateApiKey(req: NextRequest): Promise<ApiSecurityContext | null> {
  const apiKey = req.headers.get('x-api-key')
  
  if (!apiKey) {
    return null
  }
  
  // Hash the API key for comparison
  const hashedKey = createHash('sha256').update(apiKey).digest('hex')
  
  // Check if key exists and is valid
  const keyData = apiKeyStore.get(hashedKey)
  
  if (!keyData) {
    return null
  }
  
  return {
    userId: keyData.userId,
    apiKey: hashedKey,
    ipAddress: getClientIp(req),
    userAgent: req.headers.get('user-agent') || 'Unknown'
  }
}

// Input validation helper
export function validateInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// JWT token generation
export function generateToken(payload: any, expiresIn: string = '1h'): string {
  const secret = process.env.JWT_SECRET || 'development-secret'
  return jwt.sign(payload, secret, { expiresIn })
}

// JWT token verification
export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'development-secret'
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}

// Generate secure API key
export function generateApiKey(): string {
  return randomBytes(32).toString('hex')
}

// Hash API key for storage
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

// Get client IP address
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  return '127.0.0.1'
}

// Get client identifier for rate limiting
function getClientIdentifier(req: NextRequest): string {
  const userId = req.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }
  
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    return `api:${hashApiKey(apiKey)}`
  }
  
  return `ip:${getClientIp(req)}`
}

// Security headers for API responses
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache'
  }
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

// Check if request requires audit logging
export function requiresAudit(req: NextRequest): boolean {
  const auditRequired = req.headers.get('x-audit-required')
  return auditRequired === 'true' || ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
}

// Create API response with security headers
export function createSecureResponse(
  data: any,
  status: number = 200,
  additionalHeaders?: HeadersInit
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      ...getSecurityHeaders(),
      ...additionalHeaders
    }
  })
}

// Validate CORS origin
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false
  
  const allowedOrigins = [
    process.env.NEXTAUTH_URL!,
    'https://caglive.vercel.app',
    'https://clearedadvisorygroup.com'
  ]
  
  return allowedOrigins.includes(origin)
}

// API error response helper
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  return createSecureResponse(
    {
      error: message,
      details: process.env.NODE_ENV === 'development' ? details : undefined
    },
    status
  )
}