/**
 * Rate Limiting and Brute Force Protection Middleware
 * Implements multiple layers of rate limiting for different endpoints
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { RATE_LIMITS } = require('../config/security');

/**
 * Global rate limiter for all requests
 */
const globalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.WINDOW_MS,
  max: RATE_LIMITS.GLOBAL.MAX_REQUESTS,
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later',
    retryAfter: Math.ceil(RATE_LIMITS.GLOBAL.WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to handle proxies
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Skip successful requests for some endpoints
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
  onLimitReached: (req, res) => {
    console.warn(`Global rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
  max: RATE_LIMITS.LOGIN.MAX_ATTEMPTS,
  message: {
    error: 'Too many login attempts',
    message: 'Too many failed login attempts, please try again later',
    retryAfter: Math.ceil(RATE_LIMITS.LOGIN.WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed requests
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Rate limit by IP and email combination for more granular control
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },
  onLimitReached: (req, res) => {
    const email = req.body?.email || 'unknown';
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}, email: ${email}`);
    
    // Log security event
    require('../utils/logger').securityLogger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      email,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Progressive slow down for repeated login attempts
 */
const loginSlowDown = slowDown({
  windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
  delayAfter: 2, // Allow 2 requests per window without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },
  onLimitReached: (req, res) => {
    console.warn(`Login slow down activated for IP: ${req.ip}`);
  }
});

/**
 * Rate limiter for user registration
 */
const registrationLimiter = rateLimit({
  windowMs: RATE_LIMITS.REGISTRATION.WINDOW_MS,
  max: RATE_LIMITS.REGISTRATION.MAX_ATTEMPTS,
  message: {
    error: 'Too many registration attempts',
    message: 'Too many registration attempts from this IP, please try again later',
    retryAfter: Math.ceil(RATE_LIMITS.REGISTRATION.WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res) => {
    console.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
  }
});

/**
 * Rate limiter for password reset requests
 */
const passwordResetLimiter = rateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.WINDOW_MS,
  max: RATE_LIMITS.PASSWORD_RESET.MAX_ATTEMPTS,
  message: {
    error: 'Too many password reset attempts',
    message: 'Too many password reset requests, please try again later',
    retryAfter: Math.ceil(RATE_LIMITS.PASSWORD_RESET.WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP and email for password resets
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },
  onLimitReached: (req, res) => {
    const email = req.body?.email || 'unknown';
    console.warn(`Password reset rate limit exceeded for IP: ${req.ip}, email: ${email}`);
  }
});

/**
 * Rate limiter for file uploads (resumes, documents)
 */
const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.RESUME_UPLOAD.WINDOW_MS,
  max: RATE_LIMITS.RESUME_UPLOAD.MAX_UPLOADS,
  message: {
    error: 'Too many upload attempts',
    message: 'Upload limit exceeded, please try again later',
    retryAfter: Math.ceil(RATE_LIMITS.RESUME_UPLOAD.WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count successful uploads
  skipFailedRequests: true,
  onLimitReached: (req, res) => {
    console.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
  }
});

/**
 * API-specific rate limiter for different endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits based on endpoint
    if (req.path.startsWith('/api/admin')) {
      return 50; // Lower limit for admin endpoints
    }
    if (req.path.startsWith('/api/search')) {
      return 30; // Lower limit for search endpoints
    }
    return 100; // Default limit
  },
  message: {
    error: 'API rate limit exceeded',
    message: 'Too many API requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create custom rate limiter with specific configuration
 */
const createCustomLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    onLimitReached: options.onLimitReached || (() => {}),
    ...options
  });
};

/**
 * Middleware to add rate limiting headers to all responses
 */
const addRateLimitHeaders = (req, res, next) => {
  // Add custom security headers
  res.setHeader('X-Rate-Limit-Policy', 'strict');
  res.setHeader('X-Security-Level', 'high');
  next();
};

module.exports = {
  globalLimiter,
  authLimiter,
  loginSlowDown,
  registrationLimiter,
  passwordResetLimiter,
  uploadLimiter,
  apiLimiter,
  createCustomLimiter,
  addRateLimitHeaders
};