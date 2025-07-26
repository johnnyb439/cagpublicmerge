/**
 * PII (Personally Identifiable Information) Filtering Middleware
 * Detects and blocks submissions containing sensitive personal information
 */

const { PII_PATTERNS } = require('../config/security');
const validator = require('validator');

/**
 * Enhanced PII detection patterns with context awareness
 */
const ENHANCED_PII_PATTERNS = {
  ...PII_PATTERNS,
  
  // Bank account numbers
  BANK_ACCOUNT: /\b\d{8,17}\b/g,
  
  // Driver's license patterns (varies by state)
  DRIVERS_LICENSE: /\b[A-Z]{1,2}\d{6,8}\b/g,
  
  // Passport numbers
  PASSPORT: /\b[A-Z]\d{8}\b/g,
  
  // Medical record numbers
  MEDICAL_RECORD: /\b(MR|MRN|MEDICAL)\s*[:#]?\s*\d{6,10}\b/gi,
  
  // Insurance policy numbers
  INSURANCE_POLICY: /\b(POLICY|POL)\s*[:#]?\s*[A-Z0-9]{8,15}\b/gi,
  
  // Employee ID numbers
  EMPLOYEE_ID: /\b(EMP|EMPLOYEE|ID)\s*[:#]?\s*\d{4,10}\b/gi
};

/**
 * Context-aware PII detection
 */
class PIIDetector {
  constructor(sensitivityLevel = 'medium') {
    this.sensitivityLevel = sensitivityLevel;
    this.patterns = this.getPatternsBySensitivity(sensitivityLevel);
  }

  /**
   * Get patterns based on sensitivity level
   */
  getPatternsBySensitivity(level) {
    switch (level) {
      case 'strict':
        return ENHANCED_PII_PATTERNS;
      case 'medium':
        return PII_PATTERNS;
      case 'low':
        return {
          SSN: PII_PATTERNS.SSN,
          CREDIT_CARD: PII_PATTERNS.CREDIT_CARD
        };
      default:
        return PII_PATTERNS;
    }
  }

  /**
   * Detect PII in text content
   */
  detectPII(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return { hasPII: false, detectedTypes: [], matches: [] };
    }

    const detectedTypes = [];
    const matches = [];
    let hasPII = false;

    // Check each pattern
    Object.entries(this.patterns).forEach(([type, pattern]) => {
      const typeMatches = text.match(pattern);
      if (typeMatches && typeMatches.length > 0) {
        hasPII = true;
        detectedTypes.push(type);
        matches.push({
          type,
          matches: typeMatches,
          count: typeMatches.length
        });
      }
    });

    // Additional validation for credit cards
    if (detectedTypes.includes('CREDIT_CARD')) {
      const validCreditCards = matches
        .find(m => m.type === 'CREDIT_CARD')
        ?.matches.filter(match => {
          const cleanNumber = match.replace(/[\s-]/g, '');
          return validator.isCreditCard(cleanNumber);
        }) || [];

      if (validCreditCards.length === 0) {
        // Remove credit card from detection if no valid cards found
        const index = detectedTypes.indexOf('CREDIT_CARD');
        detectedTypes.splice(index, 1);
        const matchIndex = matches.findIndex(m => m.type === 'CREDIT_CARD');
        matches.splice(matchIndex, 1);
        
        if (detectedTypes.length === 0) {
          hasPII = false;
        }
      }
    }

    return {
      hasPII,
      detectedTypes,
      matches,
      sensitivityLevel: this.sensitivityLevel
    };
  }

  /**
   * Sanitize text by masking PII
   */
  sanitizePII(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let sanitizedText = text;
    const maskChar = options.maskChar || '*';

    Object.entries(this.patterns).forEach(([type, pattern]) => {
      sanitizedText = sanitizedText.replace(pattern, (match) => {
        if (type === 'EMAIL' && options.preserveEmails) {
          return match; // Preserve emails if requested
        }
        
        // Keep first and last 2 characters, mask the middle
        if (match.length > 4) {
          const start = match.substring(0, 2);
          const end = match.substring(match.length - 2);
          const middle = maskChar.repeat(match.length - 4);
          return start + middle + end;
        }
        
        return maskChar.repeat(match.length);
      });
    });

    return sanitizedText;
  }
}

/**
 * Middleware to filter PII from request bodies
 */
const piiFilterMiddleware = (options = {}) => {
  const sensitivityLevel = options.sensitivityLevel || process.env.PII_DETECTION_LEVEL || 'medium';
  const detector = new PIIDetector(sensitivityLevel);
  
  return (req, res, next) => {
    try {
      // Skip if no body content
      if (!req.body || Object.keys(req.body).length === 0) {
        return next();
      }

      const excludedFields = options.excludedFields || ['password', 'token'];
      const detectedPII = [];

      // Check all string fields in request body
      const checkObject = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          // Skip excluded fields
          if (excludedFields.includes(key)) {
            continue;
          }

          if (typeof value === 'string') {
            const result = detector.detectPII(value);
            if (result.hasPII) {
              detectedPII.push({
                field: currentPath,
                ...result
              });
            }
          } else if (typeof value === 'object' && value !== null) {
            checkObject(value, currentPath);
          }
        }
      };

      checkObject(req.body);

      // If PII detected, handle based on configuration
      if (detectedPII.length > 0) {
        const logger = require('../utils/logger');
        
        // Log PII detection event
        logger.securityLogger.warn('PII detected in request', {
          ip: req.ip,
          url: req.url,
          method: req.method,
          userAgent: req.headers['user-agent'],
          detectedPII: detectedPII.map(pii => ({
            field: pii.field,
            types: pii.detectedTypes,
            count: pii.matches.length
          })),
          timestamp: new Date().toISOString()
        });

        // Block request or sanitize based on configuration
        if (options.blockOnDetection !== false) {
          return res.status(400).json({
            error: 'Invalid input',
            message: 'Request contains personally identifiable information that cannot be processed',
            code: 'PII_DETECTED',
            detectedFields: detectedPII.map(pii => pii.field)
          });
        } else {
          // Sanitize the content
          req.body = sanitizeObject(req.body, detector, options);
          req.piiDetected = detectedPII;
        }
      }

      next();
    } catch (error) {
      console.error('PII filter error:', error);
      next(error);
    }
  };
};

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj, detector, options) {
  const sanitized = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = detector.sanitizePII(value, options);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, detector, options);
    }
  }

  return sanitized;
}

/**
 * Middleware for file upload PII scanning
 */
const fileUploadPIIFilter = (options = {}) => {
  const detector = new PIIDetector(options.sensitivityLevel || 'strict');

  return async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    try {
      // For text-based files, scan content
      for (const [fieldName, file] of Object.entries(req.files)) {
        if (file.mimetype && file.mimetype.startsWith('text/')) {
          const content = file.buffer ? file.buffer.toString('utf8') : '';
          const result = detector.detectPII(content);

          if (result.hasPII) {
            const logger = require('../utils/logger');
            logger.securityLogger.warn('PII detected in uploaded file', {
              ip: req.ip,
              filename: file.originalname,
              mimetype: file.mimetype,
              detectedTypes: result.detectedTypes,
              timestamp: new Date().toISOString()
            });

            return res.status(400).json({
              error: 'File contains PII',
              message: 'Uploaded file contains personally identifiable information',
              filename: file.originalname,
              detectedTypes: result.detectedTypes
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('File PII filter error:', error);
      next(error);
    }
  };
};

module.exports = {
  PIIDetector,
  piiFilterMiddleware,
  fileUploadPIIFilter,
  ENHANCED_PII_PATTERNS
};