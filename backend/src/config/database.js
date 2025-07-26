/**
 * Database Configuration and Connection Management
 * Handles Prisma client initialization and connection pooling
 */

const { PrismaClient } = require('@prisma/client');

class DatabaseConfig {
  constructor() {
    this.prisma = null;
    this.isConnected = false;
  }

  /**
   * Initialize Prisma client with security configurations
   */
  initialize() {
    if (this.prisma) {
      return this.prisma;
    }

    // Configure Prisma with logging and security settings
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'minimal', // Minimize error information in production
    });

    // Set up event handlers
    this.setupEventHandlers();

    // Connect to database
    return this.connect();
  }

  /**
   * Connect to database
   */
  async connect() {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      console.log('✅ Database connection established');
      
      // Log successful connection
      const { logSecurityEvent } = require('../utils/logger');
      logSecurityEvent('DATABASE_CONNECTED', {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
      
      return this.prisma;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      
      // Log connection failure
      const { logSecurityEvent } = require('../utils/logger');
      logSecurityEvent('DATABASE_CONNECTION_FAILED', {
        error: error.message,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
      
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('Database disconnected');
      
      const { logSecurityEvent } = require('../utils/logger');
      logSecurityEvent('DATABASE_DISCONNECTED', {
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get Prisma client instance
   */
  getInstance() {
    if (!this.prisma) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.prisma;
  }

  /**
   * Set up Prisma event handlers for monitoring and security
   */
  setupEventHandlers() {
    // Query logging (development only)
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        console.log('Query: ' + e.query);
        console.log('Duration: ' + e.duration + 'ms');
      });
    }

    // Error logging
    this.prisma.$on('error', (e) => {
      console.error('Database error:', e.message);
      
      // Log database errors for security monitoring
      const { logSecurityEvent } = require('../utils/logger');
      logSecurityEvent('DATABASE_ERROR', {
        error: e.message,
        timestamp: e.timestamp
      });
    });

    // Warning logging
    this.prisma.$on('warn', (e) => {
      console.warn('Database warning:', e.message);
    });
  }

  /**
   * Execute transaction with automatic retry logic
   */
  async executeTransaction(callback, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const timeout = options.timeout || 5000;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.prisma.$transaction(callback, {
          maxWait: timeout,
          timeout: timeout * 2,
          isolationLevel: options.isolationLevel || 'Serializable'
        });
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (this.isRetryableError(error) && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.warn(`Transaction failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Check if database error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = [
      'P2034', // Transaction failed due to concurrent update
      'P2024', // Timed out fetching a new connection
      'P2002', // Unique constraint failed (might be due to race condition)
    ];

    return retryableCodes.includes(error.code) || 
           error.message.includes('deadlock') ||
           error.message.includes('timeout');
  }

  /**
   * Health check for database connection
   */
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        connected: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get database metrics
   */
  async getMetrics() {
    try {
      const metrics = await this.prisma.$metrics.json();
      return {
        ...metrics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get database metrics:', error);
      return null;
    }
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await databaseConfig.disconnect();
});

module.exports = databaseConfig;