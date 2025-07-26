/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides granular permission checking for different user roles
 */

const { ROLES } = require('../config/security');
const { hasPermission } = require('./auth');

/**
 * Check if user has required role level
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const userLevel = ROLES[userRole]?.level || 0;
    const requiredLevel = ROLES[requiredRole]?.level || 0;

    if (userLevel < requiredLevel) {
      // Log unauthorized access attempt
      const logger = require('../utils/logger');
      logger.securityLogger.warn('Unauthorized role access attempt', {
        userId: req.user.id,
        userRole,
        requiredRole,
        ip: req.ip,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${requiredRole}`,
        userRole,
        requiredRole
      });
    }

    next();
  };
};

/**
 * Check if user has any of the specified roles
 */
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const userLevel = ROLES[userRole]?.level || 0;
    
    const hasRequiredRole = roles.some(role => {
      const requiredLevel = ROLES[role]?.level || 0;
      return userLevel >= requiredLevel;
    });

    if (!hasRequiredRole) {
      const logger = require('../utils/logger');
      logger.securityLogger.warn('Unauthorized role access attempt', {
        userId: req.user.id,
        userRole,
        requiredRoles: roles,
        ip: req.ip,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        userRole,
        requiredRoles: roles
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!hasPermission(req.user, permission)) {
      const logger = require('../utils/logger');
      logger.securityLogger.warn('Unauthorized permission access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        ip: req.ip,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required permission: ${permission}`,
        userRole: req.user.role,
        requiredPermission: permission
      });
    }

    next();
  };
};

/**
 * Check if user has any of the specified permissions
 */
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const hasRequiredPermission = permissions.some(permission => 
      hasPermission(req.user, permission)
    );

    if (!hasRequiredPermission) {
      const logger = require('../utils/logger');
      logger.securityLogger.warn('Unauthorized permission access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermissions: permissions,
        userPermissions: req.user.permissions,
        ip: req.ip,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required permissions: ${permissions.join(', ')}`,
        userRole: req.user.role,
        requiredPermissions: permissions
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource or has admin privileges
 */
const requireOwnershipOrAdmin = (resourceIdParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Admin users can access any resource
    if (hasPermission(req.user, '*')) {
      return next();
    }

    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // If no resource ID provided, user must be accessing their own data
      if (!resourceId) {
        return next();
      }

      // Check resource ownership in database
      const databaseConfig = require('../config/database');
      const prisma = databaseConfig.getInstance();

      // This is a generic check - you might need to customize based on your data model
      const resource = await prisma.user.findFirst({
        where: {
          id: resourceId,
          [userIdField]: userId
        }
      });

      if (!resource) {
        const logger = require('../utils/logger');
        logger.securityLogger.warn('Unauthorized resource access attempt', {
          userId,
          resourceId,
          userRole: req.user.role,
          ip: req.ip,
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        error: 'Server Error',
        message: 'Unable to verify resource ownership'
      });
    }
  };
};

/**
 * Require verified user (email verification)
 */
const requireVerifiedUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

/**
 * Require active clearance for cleared job positions
 */
const requireActiveClearance = (minimumLevel = 'SECRET') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const clearanceLevels = {
      'PUBLIC_TRUST': 1,
      'SECRET': 2,
      'TOP_SECRET': 3,
      'TOP_SECRET_SCI': 4,
      'TS_SCI_POLY': 5
    };

    const userClearanceLevel = clearanceLevels[req.user.clearanceLevel] || 0;
    const requiredClearanceLevel = clearanceLevels[minimumLevel] || 0;

    if (userClearanceLevel < requiredClearanceLevel) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient clearance level. Required: ${minimumLevel}`,
        userClearance: req.user.clearanceLevel,
        requiredClearance: minimumLevel
      });
    }

    next();
  };
};

/**
 * Rate limiting based on user role
 */
const roleBasedRateLimit = (limits) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(); // Let global rate limiter handle unauthenticated requests
    }

    const userRole = req.user.role;
    const roleLimit = limits[userRole];

    if (roleLimit) {
      // Apply role-specific rate limiting
      req.rateLimit = {
        ...req.rateLimit,
        max: roleLimit.max || req.rateLimit.max,
        windowMs: roleLimit.windowMs || req.rateLimit.windowMs
      };
    }

    next();
  };
};

/**
 * Middleware to check user subscription/plan limits
 */
const checkPlanLimits = (feature, limitField) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    try {
      // Admin users have no limits
      if (hasPermission(req.user, '*')) {
        return next();
      }

      const databaseConfig = require('../config/database');
      const prisma = databaseConfig.getInstance();

      // Get user's current usage and plan limits
      const userStats = await prisma.userStats.findUnique({
        where: { userId: req.user.id },
        include: { user: { include: { subscription: true } } }
      });

      if (!userStats) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Unable to verify plan limits'
        });
      }

      const currentUsage = userStats[limitField] || 0;
      const planLimit = userStats.user.subscription?.[limitField] || 0;

      if (currentUsage >= planLimit) {
        return res.status(403).json({
          error: 'Plan Limit Exceeded',
          message: `You have reached your ${feature} limit for this plan`,
          currentUsage,
          planLimit,
          feature
        });
      }

      // Add usage info to request for tracking
      req.planUsage = {
        current: currentUsage,
        limit: planLimit,
        remaining: planLimit - currentUsage
      };

      next();
    } catch (error) {
      console.error('Plan limit check error:', error);
      return res.status(500).json({
        error: 'Server Error',
        message: 'Unable to verify plan limits'
      });
    }
  };
};

module.exports = {
  requireRole,
  requireAnyRole,
  requirePermission,
  requireAnyPermission,
  requireOwnershipOrAdmin,
  requireVerifiedUser,
  requireActiveClearance,
  roleBasedRateLimit,
  checkPlanLimits
};