/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { 
  authenticateToken, 
  generateTokenPair,
  setTokenCookies,
  clearTokenCookies 
} = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const rateLimiter = require('../middleware/rateLimiter');
const piiFilter = require('../middleware/piiFilter');
const { handleValidationErrors, asyncHandler, AuthenticationError, ValidationError } = require('../utils/errorHandler');
const { PasswordSecurity, TokenGenerator } = require('../utils/encryption');
const { logSecurityEvent, logAuditEvent } = require('../utils/logger');
const behavioralAnalytics = require('../security/advanced/behavioralAnalytics');

// Rate limiting for auth endpoints
const authRateLimit = rateLimiter.createLimiter('auth', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts'
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
  authRateLimit,
  piiFilter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .custom((value) => {
        const validation = PasswordSecurity.validatePasswordStrength(value);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        return true;
      }),
    body('firstName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name required'),
    body('lastName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name required'),
    body('clearanceLevel')
      .optional()
      .isIn(['NONE', 'PUBLIC_TRUST', 'SECRET', 'TOP_SECRET', 'TOP_SECRET_SCI', 'TS_SCI_POLY'])
      .withMessage('Invalid clearance level')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, clearanceLevel } = req.body;
    
    // Import database config
    const databaseConfig = require('../config/database');
    const prisma = databaseConfig.getInstance();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new ValidationError([{
        field: 'email',
        message: 'Email already registered'
      }]);
    }
    
    // Hash password
    const hashedPassword = await PasswordSecurity.hashPassword(password);
    
    // Generate verification token
    const verificationToken = TokenGenerator.generateURLSafeToken();
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        clearanceLevel: clearanceLevel || 'NONE',
        role: 'user',
        isVerified: false,
        verificationToken,
        settings: {
          create: {
            emailNotifications: true,
            twoFactorEnabled: false
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clearanceLevel: true
      }
    });
    
    // Log security event
    logSecurityEvent('USER_REGISTRATION', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Log audit event
    logAuditEvent('CREATE_USER', {
      userId: user.id,
      performedBy: 'SYSTEM',
      resource: 'user',
      resourceId: user.id
    });
    
    // Generate tokens
    const tokens = generateTokenPair(user);
    setTokenCookies(res, tokens);
    
    // TODO: Send verification email
    
    res.status(201).json({
      message: 'Registration successful',
      user,
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .notEmpty()
      .withMessage('Password required'),
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be boolean')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;
    
    const databaseConfig = require('../config/database');
    const prisma = databaseConfig.getInstance();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        settings: true
      }
    });
    
    if (!user) {
      // Log failed attempt
      logSecurityEvent('LOGIN_FAILED', {
        email,
        reason: 'USER_NOT_FOUND',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Verify password
    const isValidPassword = await PasswordSecurity.verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      // Update failed login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: user.failedLoginAttempts + 1,
          lastFailedLogin: new Date()
        }
      });
      
      // Log failed attempt
      logSecurityEvent('LOGIN_FAILED', {
        userId: user.id,
        email,
        reason: 'INVALID_PASSWORD',
        failedAttempts: user.failedLoginAttempts + 1,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Check if account should be locked
      if (user.failedLoginAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: false }
        });
        
        logSecurityEvent('ACCOUNT_LOCKED', {
          userId: user.id,
          email,
          reason: 'EXCESSIVE_FAILED_ATTEMPTS',
          ip: req.ip
        });
      }
      
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Check if account is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is disabled');
    }
    
    // Check if email is verified
    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      throw new AuthenticationError('Email verification required');
    }
    
    // Track user behavior
    await behavioralAnalytics.trackBehavior(user.id, {
      loginTime: Date.now(),
      ip: req.ip,
      deviceFingerprint: req.headers['user-agent'],
      authMethod: 'password'
    });
    
    // Reset failed login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastLogin: new Date()
      }
    });
    
    // Generate tokens
    const tokens = generateTokenPair(user, rememberMe);
    setTokenCookies(res, tokens, rememberMe);
    
    // Log successful login
    logSecurityEvent('LOGIN_SUCCESS', {
      userId: user.id,
      email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      rememberMe
    });
    
    logAuditEvent('USER_LOGIN', {
      userId: user.id,
      performedBy: user.id,
      ip: req.ip
    });
    
    // Prepare user response (exclude sensitive data)
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      clearanceLevel: user.clearanceLevel,
      isVerified: user.isVerified,
      settings: user.settings
    };
    
    res.json({
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Clear cookies
    clearTokenCookies(res);
    
    // TODO: Add token to blacklist if using token blacklisting
    
    // Log logout
    logSecurityEvent('LOGOUT', {
      userId: req.user.id,
      ip: req.ip
    });
    
    logAuditEvent('USER_LOGOUT', {
      userId: req.user.id,
      performedBy: req.user.id,
      ip: req.ip
    });
    
    res.json({
      message: 'Logout successful'
    });
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }
    
    // Verify refresh token
    const jwt = require('jsonwebtoken');
    let decoded;
    
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      clearTokenCookies(res);
      throw new AuthenticationError('Invalid refresh token');
    }
    
    // Get user
    const databaseConfig = require('../config/database');
    const prisma = databaseConfig.getInstance();
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user || !user.isActive) {
      clearTokenCookies(res);
      throw new AuthenticationError('User not found or inactive');
    }
    
    // Generate new token pair
    const tokens = generateTokenPair(user);
    setTokenCookies(res, tokens);
    
    // Log token refresh
    logSecurityEvent('TOKEN_REFRESH', {
      userId: user.id,
      ip: req.ip
    });
    
    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    });
  })
);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email',
  [
    query('token')
      .notEmpty()
      .withMessage('Verification token required')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { token } = req.query;
    
    const databaseConfig = require('../config/database');
    const prisma = databaseConfig.getInstance();
    
    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        isVerified: false
      }
    });
    
    if (!user) {
      throw new ValidationError([{
        field: 'token',
        message: 'Invalid or expired verification token'
      }]);
    }
    
    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        emailVerifiedAt: new Date()
      }
    });
    
    // Log verification
    logSecurityEvent('EMAIL_VERIFIED', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });
    
    logAuditEvent('VERIFY_EMAIL', {
      userId: user.id,
      performedBy: user.id,
      ip: req.ip
    });
    
    res.json({
      message: 'Email verified successfully'
    });
  })
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const databaseConfig = require('../config/database');
    const prisma = databaseConfig.getInstance();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Always return success to prevent email enumeration
    if (!user) {
      logSecurityEvent('PASSWORD_RESET_FAILED', {
        email,
        reason: 'USER_NOT_FOUND',
        ip: req.ip
      });
      
      return res.json({
        message: 'If the email exists, a reset link has been sent'
      });
    }
    
    // Generate reset token
    const resetToken = TokenGenerator.generateURLSafeToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour
    
    // Save reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });
    
    // TODO: Send reset email
    
    // Log password reset request
    logSecurityEvent('PASSWORD_RESET_REQUESTED', {
      userId: user.id,
      email,
      ip: req.ip
    });
    
    logAuditEvent('REQUEST_PASSWORD_RESET', {
      userId: user.id,
      performedBy: user.id,
      ip: req.ip
    });
    
    res.json({
      message: 'If the email exists, a reset link has been sent'
    });
  })
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .custom((value) => {
        const validation = PasswordSecurity.validatePasswordStrength(value);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        return true;
      })
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    
    const databaseConfig = require('../config/database');
    const prisma = databaseConfig.getInstance();
    
    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      throw new ValidationError([{
        field: 'token',
        message: 'Invalid or expired reset token'
      }]);
    }
    
    // Hash new password
    const hashedPassword = await PasswordSecurity.hashPassword(password);
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date()
      }
    });
    
    // Log password reset
    logSecurityEvent('PASSWORD_RESET_SUCCESS', {
      userId: user.id,
      ip: req.ip
    });
    
    logAuditEvent('RESET_PASSWORD', {
      userId: user.id,
      performedBy: user.id,
      ip: req.ip
    });
    
    res.json({
      message: 'Password reset successful'
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const databaseConfig = require('../config/database');
    const prisma = databaseConfig.getInstance();
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clearanceLevel: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true,
        settings: true
      }
    });
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    res.json({
      user
    });
  })
);

module.exports = router;