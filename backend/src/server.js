/**
 * Main Server Entry Point
 * Configures and starts the secure Express server
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// Import middleware
const { enforceHTTPS, setSecureHeaders, configureTrustProxy } = require('./middleware/https');
const { csrf } = require('./middleware/csrf');
const rateLimiter = require('./middleware/rateLimiter');
const piiFilter = require('./middleware/piiFilter');
const { correlationIdMiddleware, httpLogger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();

// Configure trust proxy
configureTrustProxy(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
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
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Correlation-ID'],
  exposedHeaders: ['X-CSRF-Token', 'X-Correlation-ID'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security sanitization
app.use(mongoSanitize()); // Prevent MongoDB injection
app.use(xss()); // Clean user input from malicious HTML
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Compression
app.use(compression());

// Logging and correlation
app.use(correlationIdMiddleware);
app.use(httpLogger);

// Global rate limiting
app.use(rateLimiter.globalLimiter);

// CSRF protection (after cookie parser)
app.use(csrf);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);

// TODO: Add other routes
// app.use('/api/users', require('./routes/users'));
// app.use('/api/resumes', require('./routes/resumes'));
// app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/admin', require('./routes/admin'));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection
const databaseConfig = require('./config/database');

// Server startup
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database
    await databaseConfig.initialize();
    console.log('✅ Database connected successfully');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`🔒 HTTPS enforcement: ${process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'}`);
      console.log(`🛡️ CSRF protection: enabled`);
      console.log(`⚡ Rate limiting: enabled`);
      console.log(`🔍 PII filtering: enabled`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Close database connection
        await databaseConfig.disconnect();
        console.log('Database connection closed');
        
        process.exit(0);
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;