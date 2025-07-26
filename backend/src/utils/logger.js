/**
 * Comprehensive Logging System
 * Handles application, security, and audit logging with correlation
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure logs directory exists
const logsDir = process.env.LOG_FILE_PATH || './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom log levels
 */
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
    security: 1,
    audit: 1
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'gray',
    security: 'red bold',
    audit: 'yellow bold'
  }
};

winston.addColors(logLevels.colors);

/**
 * Log formatters
 */
const formatters = {
  // Timestamp formatter
  timestamp: winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),

  // Error formatter
  errors: winston.format.errors({ stack: true }),

  // JSON formatter for production
  json: winston.format.json(),

  // Pretty print for development
  prettyPrint: winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata, null, 2)}`;
    }
    
    return msg;
  }),

  // Security formatter (redacts sensitive data)
  security: winston.format.printf((info) => {
    const sanitized = sanitizeLogData(info);
    return JSON.stringify(sanitized);
  }),

  // Correlation ID formatter
  correlationId: winston.format((info) => {
    info.correlationId = info.correlationId || generateCorrelationId();
    return info;
  })()
};

/**
 * Transport configurations
 */
const transports = {
  // Console transport
  console: new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      formatters.timestamp,
      formatters.errors,
      winston.format.colorize(),
      formatters.prettyPrint
    )
  }),

  // Application log file
  appFile: new DailyRotateFile({
    filename: path.join(logsDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: winston.format.combine(
      formatters.timestamp,
      formatters.errors,
      formatters.correlationId,
      formatters.json
    )
  }),

  // Error log file
  errorFile: new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: winston.format.combine(
      formatters.timestamp,
      formatters.errors,
      formatters.correlationId,
      formatters.json
    )
  }),

  // Security log file
  securityFile: new DailyRotateFile({
    filename: path.join(logsDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '50m',
    maxFiles: '90d',
    level: 'security',
    format: winston.format.combine(
      formatters.timestamp,
      formatters.correlationId,
      formatters.security
    )
  }),

  // Audit log file (compliance)
  auditFile: new DailyRotateFile({
    filename: path.join(logsDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '100m',
    maxFiles: '365d',
    level: 'audit',
    format: winston.format.combine(
      formatters.timestamp,
      formatters.correlationId,
      formatters.json
    ),
    // Audit logs should be immutable
    options: { flags: 'a', mode: 0o444 }
  })
};

/**
 * Logger instances
 */
const appLogger = winston.createLogger({
  levels: logLevels.levels,
  transports: [
    transports.console,
    transports.appFile,
    transports.errorFile
  ],
  exitOnError: false
});

const securityLogger = winston.createLogger({
  levels: logLevels.levels,
  transports: [
    transports.securityFile
  ],
  exitOnError: false
});

const auditLogger = winston.createLogger({
  levels: logLevels.levels,
  transports: [
    transports.auditFile
  ],
  exitOnError: false
});

const errorLogger = winston.createLogger({
  levels: logLevels.levels,
  transports: [
    transports.errorFile
  ],
  exitOnError: false
});

/**
 * HTTP request logger middleware
 */
const httpLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  res.end = function(...args) {
    // Restore original
    res.end = originalEnd;
    res.end.apply(res, args);
    
    // Log request
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      correlationId: req.correlationId
    };
    
    // Log based on status code
    if (res.statusCode >= 500) {
      appLogger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      appLogger.warn('HTTP Request', logData);
    } else {
      appLogger.http('HTTP Request', logData);
    }
  };
  
  next();
};

/**
 * Security event logger
 */
const logSecurityEvent = (event, data = {}) => {
  const securityData = {
    event,
    ...data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  };
  
  securityLogger.log('security', 'Security Event', securityData);
  
  // Also log critical security events to error log
  if (['AUTH_FAILURE', 'INTRUSION_ATTEMPT', 'DATA_BREACH'].includes(event)) {
    errorLogger.error('Critical Security Event', securityData);
  }
};

/**
 * Audit trail logger
 */
const logAuditEvent = (action, data = {}) => {
  const auditData = {
    action,
    ...data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  };
  
  // Generate audit hash for integrity
  auditData.hash = generateAuditHash(auditData);
  
  auditLogger.log('audit', 'Audit Event', auditData);
};

/**
 * Utility functions
 */
function sanitizeLogData(data) {
  const sensitive = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });
  
  return sanitized;
}

function generateCorrelationId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateAuditHash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

/**
 * Log rotation cleanup
 */
const cleanupOldLogs = () => {
  const maxAge = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds
  
  fs.readdir(logsDir, (err, files) => {
    if (err) {
      appLogger.error('Failed to read logs directory', { error: err.message });
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        const age = Date.now() - stats.mtime.getTime();
        if (age > maxAge && !file.includes('audit')) { // Never delete audit logs
          fs.unlink(filePath, (err) => {
            if (err) {
              appLogger.error('Failed to delete old log file', { file, error: err.message });
            } else {
              appLogger.info('Deleted old log file', { file });
            }
          });
        }
      });
    });
  });
};

// Schedule log cleanup daily
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

/**
 * Express error logging
 */
const errorLoggerMiddleware = (err, req, res, next) => {
  const errorData = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id,
    correlationId: req.correlationId
  };
  
  errorLogger.error('Application Error', errorData);
  next(err);
};

/**
 * Correlation ID middleware
 */
const correlationIdMiddleware = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

/**
 * Performance monitoring
 */
const performanceLogger = {
  startTimer: (operation) => {
    const start = process.hrtime.bigint();
    return {
      end: (metadata = {}) => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        appLogger.verbose('Performance', {
          operation,
          duration: `${duration.toFixed(2)}ms`,
          ...metadata
        });
        
        // Alert on slow operations
        if (duration > 1000) {
          appLogger.warn('Slow Operation Detected', {
            operation,
            duration: `${duration.toFixed(2)}ms`,
            ...metadata
          });
        }
      }
    };
  }
};

module.exports = {
  appLogger,
  securityLogger,
  auditLogger,
  errorLogger,
  httpLogger,
  logSecurityEvent,
  logAuditEvent,
  errorLoggerMiddleware,
  correlationIdMiddleware,
  performanceLogger,
  // Convenience methods
  info: (message, meta) => appLogger.info(message, meta),
  warn: (message, meta) => appLogger.warn(message, meta),
  error: (message, meta) => appLogger.error(message, meta),
  debug: (message, meta) => appLogger.debug(message, meta),
  verbose: (message, meta) => appLogger.verbose(message, meta)
};