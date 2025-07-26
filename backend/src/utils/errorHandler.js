/**
 * Centralized Error Handler
 * Manages error responses, logging, and security sanitization
 */

const { validationResult } = require('express-validator');

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.details = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

class SecurityError extends AppError {
  constructor(message = 'Security violation detected') {
    super(message, 403, 'SECURITY_VIOLATION');
  }
}

/**
 * Error response formatter
 */
class ErrorFormatter {
  static formatError(error, isDevelopment = false) {
    // Base error response
    const response = {
      error: {
        message: error.message || 'An error occurred',
        code: error.code || 'SERVER_ERROR',
        timestamp: error.timestamp || new Date().toISOString()
      }
    };

    // Add details for operational errors
    if (error.isOperational && error.details) {
      response.error.details = error.details;
    }

    // Add stack trace in development
    if (isDevelopment && error.stack) {
      response.error.stack = error.stack.split('\n');
    }

    // Add request ID if available
    if (error.requestId) {
      response.error.requestId = error.requestId;
    }

    return response;
  }

  static sanitizeError(error) {
    // Remove sensitive information from error messages
    const sensitivePatterns = [
      /password/gi,
      /token/gi,
      /secret/gi,
      /key/gi,
      /database/gi,
      /mongodb:\/\/[^/]+/gi,
      /postgresql:\/\/[^/]+/gi,
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b(?:\d[ -]*?){13,16}\b/g, // Credit card
    ];

    let message = error.message;
    sensitivePatterns.forEach(pattern => {
      message = message.replace(pattern, '[REDACTED]');
    });

    return message;
  }
}

/**
 * Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Import logger (circular dependency prevention)
  const logger = require('./logger');
  
  // Default to 500 server error
  let error = err;
  
  // Handle non-AppError instances
  if (!(error instanceof AppError)) {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';
    error = new AppError(message, statusCode);
  }

  // Add request ID
  error.requestId = req.id || req.headers['x-request-id'];

  // Log error
  const logData = {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    requestId: error.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id,
    timestamp: error.timestamp
  };

  // Log based on severity
  if (error.statusCode >= 500) {
    logger.errorLogger.error('Server error', { ...logData, stack: error.stack });
  } else if (error.statusCode >= 400) {
    logger.errorLogger.warn('Client error', logData);
  }

  // Sanitize error message
  const sanitizedMessage = ErrorFormatter.sanitizeError(error);
  error.message = sanitizedMessage;

  // Format response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = ErrorFormatter.formatError(error, isDevelopment);

  // Send response
  res.status(error.statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    throw new ValidationError(formattedErrors);
  }
  
  next();
};

/**
 * Not found handler (404)
 */
const notFoundHandler = (req, res, next) => {
  throw new NotFoundError('Endpoint');
};

/**
 * Database error handler
 */
const handleDatabaseError = (error) => {
  // Prisma errors
  if (error.code === 'P2002') {
    return new AppError('Duplicate entry found', 409, 'DUPLICATE_ENTRY');
  }
  if (error.code === 'P2025') {
    return new NotFoundError('Record');
  }
  if (error.code === 'P2003') {
    return new AppError('Foreign key constraint failed', 400, 'FOREIGN_KEY_ERROR');
  }
  
  // MongoDB errors
  if (error.code === 11000) {
    return new AppError('Duplicate key error', 409, 'DUPLICATE_KEY');
  }
  
  // Generic database error
  return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};

/**
 * JWT error handler
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  return error;
};

/**
 * Multer error handler
 */
const handleMulterError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 400, 'FILE_TOO_LARGE');
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', 400, 'TOO_MANY_FILES');
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400, 'UNEXPECTED_FIELD');
  }
  return new AppError('File upload error', 400, 'FILE_UPLOAD_ERROR');
};

/**
 * Global error handler for uncaught exceptions
 */
const handleUncaughtException = (error) => {
  const logger = require('./logger');
  
  logger.errorLogger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Exit process after logging
  process.exit(1);
};

/**
 * Global error handler for unhandled promise rejections
 */
const handleUnhandledRejection = (reason, promise) => {
  const logger = require('./logger');
  
  logger.errorLogger.error('Unhandled Promise Rejection', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString()
  });
  
  // Exit process after logging
  process.exit(1);
};

// Register global error handlers
process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  SecurityError,
  errorHandler,
  asyncHandler,
  handleValidationErrors,
  notFoundHandler,
  handleDatabaseError,
  handleJWTError,
  handleMulterError,
  ErrorFormatter
};