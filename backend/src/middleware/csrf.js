/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */

const crypto = require('crypto');
const { ValidationError } = require('../utils/errorHandler');
const { logSecurityEvent } = require('../utils/logger');

/**
 * CSRF token configuration
 */
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: false, // Must be false so JS can read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400000 // 24 hours
  }
};

/**
 * Generate CSRF token
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
};

/**
 * CSRF middleware implementation
 */
const csrf = (req, res, next) => {
  // Skip CSRF for certain paths
  const skipPaths = ['/health', '/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Set CSRF token for subsequent requests
    if (!req.cookies[CSRF_CONFIG.cookieName]) {
      const token = generateCSRFToken();
      res.cookie(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);
      res.setHeader('X-CSRF-Token', token);
    }
    return next();
  }

  // Verify CSRF token for state-changing requests
  const cookieToken = req.cookies[CSRF_CONFIG.cookieName];
  const headerToken = req.headers[CSRF_CONFIG.headerName] || 
                     req.headers['x-xsrf-token'] || 
                     req.body?._csrf;

  // Check if tokens exist
  if (!cookieToken || !headerToken) {
    logSecurityEvent('CSRF_TOKEN_MISSING', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
      userId: req.user?.id
    });

    throw new ValidationError([{
      field: 'csrf',
      message: 'CSRF token missing'
    }]);
  }

  // Verify tokens match
  if (cookieToken !== headerToken) {
    logSecurityEvent('CSRF_TOKEN_MISMATCH', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userId: req.user?.id
    });

    throw new ValidationError([{
      field: 'csrf',
      message: 'CSRF token mismatch'
    }]);
  }

  // Regenerate token periodically
  if (Math.random() < 0.1) { // 10% chance
    const newToken = generateCSRFToken();
    res.cookie(CSRF_CONFIG.cookieName, newToken, CSRF_CONFIG.cookieOptions);
    res.setHeader('X-CSRF-Token', newToken);
  }

  next();
};

/**
 * Get CSRF token endpoint
 */
const getCSRFToken = (req, res) => {
  let token = req.cookies[CSRF_CONFIG.cookieName];
  
  if (!token) {
    token = generateCSRFToken();
    res.cookie(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);
  }

  res.json({ 
    csrf_token: token,
    header_name: CSRF_CONFIG.headerName
  });
};

/**
 * CSRF error handler
 */
const handleCSRFError = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logSecurityEvent('CSRF_ATTACK_BLOCKED', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      error: err.message
    });

    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid CSRF token',
      code: 'CSRF_VALIDATION_FAILED'
    });
  } else {
    next(err);
  }
};

module.exports = {
  csrf,
  getCSRFToken,
  handleCSRFError,
  generateCSRFToken
};