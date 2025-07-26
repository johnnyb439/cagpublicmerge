/**
 * Secure Express Application
 * Main application file with comprehensive security implementation
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

// Security middleware imports
const { configureTrustProxy, enforceHTTPS, setSecureHeaders } = require('./middleware/https');
const { getCORSMiddleware } = require('./middleware/cors');
const { 
  globalLimiter, 
  authLimiter, 
  addRateLimitHeaders 
} = require('./middleware/rateLimiter');
const { piiFilterMiddleware } = require('./middleware/piiFilter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Database configuration
const databaseConfig = require('./config/database');

// Create Express app
const app = express();

// Configure trust proxy for deployed environments
configureTrustProxy(app);

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://caglive2.vercel.app"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// HTTPS enforcement
app.use(enforceHTTPS);
app.use(setSecureHeaders);

// CORS configuration
app.use(getCORSMiddleware());

// Request logging
app.use(logger.requestLogger);

// Rate limiting
app.use(addRateLimitHeaders);
app.use('/api/auth', authLimiter);
app.use(globalLimiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Input sanitization
app.use(mongoSanitize());

// PII filtering
app.use('/api', piiFilterMiddleware({
  sensitivityLevel: process.env.PII_DETECTION_LEVEL || 'medium',
  blockOnDetection: true,
  excludedFields: ['password', 'token', 'refreshToken']
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/backup', require('./routes/backup'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await databaseConfig.healthCheck();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CAG Secure Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      resume: '/api/resume',
      jobs: '/api/jobs',
      admin: '/api/admin',
      backup: '/api/backup'
    },
    security: {
      https: 'enforced',
      cors: 'configured',
      rateLimit: 'active',
      piiFilter: 'enabled',
      authentication: 'JWT with HTTP-only cookies'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await databaseConfig.close();
    console.log('Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Initialize application
const initializeApp = async () => {
  try {
    // Initialize database
    await databaseConfig.initialize();
    console.log('Database initialized successfully');

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Secure CAG Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔒 Security features: HTTPS, CORS, Rate Limiting, PII Filtering, JWT Auth`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
if (require.main === module) {
  initializeApp();
}

module.exports = app;