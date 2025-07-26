/**
 * Security Configuration Constants
 * Contains all security-related constants and configurations
 */

module.exports = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  },

  // JWT Configuration
  JWT: {
    ALGORITHM: 'HS256',
    ISSUER: 'cleared-advisory-group',
    AUDIENCE: 'cag-users'
  },

  // Rate Limiting
  RATE_LIMITS: {
    GLOBAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100
    },
    LOGIN: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_ATTEMPTS: 5,
      PROGRESSIVE_DELAY: true
    },
    REGISTRATION: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_ATTEMPTS: 3
    },
    PASSWORD_RESET: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_ATTEMPTS: 3
    },
    RESUME_UPLOAD: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_UPLOADS: 10
    }
  },

  // PII Detection Patterns
  PII_PATTERNS: {
    SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
    SSN_NO_DASH: /\b\d{9}\b/g,
    CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
    PHONE: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    ADDRESS: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct|circle|cir|boulevard|blvd)\b/gi,
    ZIP_CODE: /\b\d{5}(?:-\d{4})?\b/g,
    DATE_OF_BIRTH: /\b(?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])[-\/](?:19|20)\d{2}\b/g
  },

  // File Upload Security
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      RESUME: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
      DOCUMENT: ['application/pdf', 'text/plain']
    },
    VIRUS_SCAN: true,
    QUARANTINE_PATH: './quarantine'
  },

  // Security Headers
  SECURITY_HEADERS: {
    CONTENT_SECURITY_POLICY: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://caglive2.vercel.app'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    HSTS: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  // Encryption Settings
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
    BCRYPT_ROUNDS: 12
  },

  // Session Configuration
  SESSION: {
    COOKIE_NAME: 'cag_session',
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    SAME_SITE: 'strict',
    HTTP_ONLY: true,
    SECURE: true
  },

  // CORS Configuration
  CORS: {
    ALLOWED_ORIGINS: [
      'https://caglive2.vercel.app',
      'https://cag-admin.vercel.app'
    ],
    CREDENTIALS: true,
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-CSRF-Token']
  },

  // Database Security
  DATABASE: {
    CONNECTION_TIMEOUT: 10000,
    IDLE_TIMEOUT: 30000,
    MAX_CONNECTIONS: 10,
    SSL_REQUIRED: true,
    QUERY_TIMEOUT: 5000
  },

  // Backup Configuration
  BACKUP: {
    RETENTION_DAYS: 30,
    COMPRESSION: true,
    ENCRYPTION: true,
    VERIFICATION: true,
    MAX_BACKUP_SIZE: 1024 * 1024 * 1024 // 1GB
  },

  // Monitoring Thresholds
  MONITORING: {
    FAILED_LOGIN_THRESHOLD: 10,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 5,
    ERROR_RATE_THRESHOLD: 0.05, // 5%
    RESPONSE_TIME_THRESHOLD: 2000 // 2 seconds
  },

  // User Roles and Permissions
  ROLES: {
    GUEST: {
      level: 0,
      permissions: ['read:public']
    },
    USER: {
      level: 1,
      permissions: ['read:profile', 'write:profile', 'read:jobs', 'write:applications', 'upload:resume']
    },
    PREMIUM: {
      level: 2,
      permissions: ['read:profile', 'write:profile', 'read:jobs', 'write:applications', 'upload:resume', 'read:analytics', 'priority:support']
    },
    ADMIN: {
      level: 3,
      permissions: ['*']
    },
    SUPER_ADMIN: {
      level: 4,
      permissions: ['*', 'system:backup', 'system:restore', 'user:impersonate']
    }
  },

  // API Versioning
  API: {
    CURRENT_VERSION: 'v1',
    SUPPORTED_VERSIONS: ['v1'],
    DEPRECATION_NOTICE_DAYS: 90
  }
};