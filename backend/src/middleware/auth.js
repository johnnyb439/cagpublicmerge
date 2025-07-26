/**
 * JWT Authentication Middleware
 * Handles JWT token validation, creation, and user authentication
 */

const jwt = require('jsonwebtoken');
const { JWT, ROLES } = require('../config/security');
const databaseConfig = require('../config/database');

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
      iss: JWT.ISSUER,
      aud: JWT.AUDIENCE
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      algorithm: JWT.ALGORITHM
    }
  );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh',
      iss: JWT.ISSUER,
      aud: JWT.AUDIENCE
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: JWT.ALGORITHM
    }
  );
};

/**
 * Generate token pair (access + refresh)
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    clearanceLevel: user.clearanceLevel,
    isVerified: user.isVerified
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: [JWT.ALGORITHM],
      issuer: JWT.ISSUER,
      audience: JWT.AUDIENCE
    });
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Extract token from request
 */
const extractTokenFromRequest = (req) => {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check HTTP-only cookie
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

/**
 * Main authentication middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token required'
      });
    }

    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
      // Log failed authentication attempt
      const logger = require('../utils/logger');
      logger.securityLogger.warn('Invalid token used', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        error,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    // Verify user still exists and is active
    const prisma = databaseConfig.getInstance();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        clearanceLevel: true,
        isActive: true,
        isVerified: true,
        lastLogin: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or inactive'
      });
    }

    // Add user info to request
    req.user = {
      ...user,
      permissions: ROLES[user.role]?.permissions || []
    };

    // Update last activity
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActivity: new Date() }
    });

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authentication service unavailable'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    req.user = null;
    return next();
  }

  // Use the main auth middleware
  authenticateToken(req, res, (err) => {
    if (err) {
      // If authentication fails, continue without user
      req.user = null;
    }
    next();
  });
};

/**
 * Refresh token middleware
 */
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token required'
      });
    }

    const { valid, decoded, error } = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!valid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token'
      });
    }

    // Verify user exists
    const prisma = databaseConfig.getInstance();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        clearanceLevel: true,
        isActive: true,
        isVerified: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Token refresh service unavailable'
    });
  }
};

/**
 * Set secure HTTP-only cookies for tokens
 */
const setTokenCookies = (res, tokens) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  };

  // Access token cookie (shorter expiry)
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Refresh token cookie (longer expiry)
  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Clear authentication cookies
 */
const clearTokenCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

/**
 * Check if user has specific permission
 */
const hasPermission = (user, permission) => {
  if (!user || !user.permissions) {
    return false;
  }

  // Super admin has all permissions
  if (user.permissions.includes('*')) {
    return true;
  }

  // Check specific permission
  return user.permissions.includes(permission);
};

/**
 * Get user's effective permissions based on role
 */
const getUserPermissions = (role) => {
  return ROLES[role]?.permissions || [];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  extractTokenFromRequest,
  authenticateToken,
  optionalAuth,
  refreshTokenMiddleware,
  setTokenCookies,
  clearTokenCookies,
  hasPermission,
  getUserPermissions
};