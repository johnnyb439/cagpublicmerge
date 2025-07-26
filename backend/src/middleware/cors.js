/**
 * CORS Configuration Middleware
 * Secure Cross-Origin Resource Sharing configuration
 */

const cors = require('cors');
const { CORS } = require('../config/security');

/**
 * CORS configuration with security best practices
 */
const corsOptions = {
  // Allow only specified origins
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) in development
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (CORS.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },

  // Allow credentials (cookies, authorization headers)
  credentials: CORS.CREDENTIALS,

  // Allowed HTTP methods
  methods: CORS.METHODS,

  // Allowed headers
  allowedHeaders: CORS.ALLOWED_HEADERS,

  // Headers exposed to the client
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],

  // How long the browser should cache CORS preflight requests
  maxAge: 86400, // 24 hours

  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * Custom CORS middleware with additional security checks
 */
const secureCORS = (req, res, next) => {
  const origin = req.headers.origin;

  // Log CORS requests for monitoring
  if (origin) {
    console.log(`CORS request from origin: ${origin}, method: ${req.method}, path: ${req.path}`);
  }

  // Apply CORS
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error('CORS error:', err.message);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'CORS policy violation'
      });
    }
    next();
  });
};

/**
 * Dynamic CORS for development
 */
const developmentCORS = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
});

/**
 * Get appropriate CORS middleware based on environment
 */
const getCORSMiddleware = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Using development CORS configuration');
    return developmentCORS;
  }
  
  console.log('Using production CORS configuration');
  return secureCORS;
};

module.exports = {
  getCORSMiddleware,
  corsOptions,
  secureCORS,
  developmentCORS
};