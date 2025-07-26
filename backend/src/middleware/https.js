/**
 * HTTPS Enforcement Middleware
 * Forces HTTPS connections and handles proxy configurations
 */

const { SECURITY_HEADERS } = require('../config/security');

/**
 * Middleware to enforce HTTPS connections
 * Handles both direct connections and proxy scenarios (like Vercel)
 */
const enforceHTTPS = (req, res, next) => {
  // Skip HTTPS enforcement in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if request is already HTTPS
  const isHTTPS = req.secure || 
                  req.headers['x-forwarded-proto'] === 'https' ||
                  req.headers['x-forwarded-ssl'] === 'on' ||
                  req.connection.encrypted;

  if (!isHTTPS) {
    // Log insecure connection attempt
    console.warn(`Insecure HTTP request blocked from IP: ${req.ip}, URL: ${req.url}`);
    
    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    return res.status(301).redirect(httpsUrl);
  }

  next();
};

/**
 * Middleware to set secure headers
 */
const setSecureHeaders = (req, res, next) => {
  // Force HTTPS for future requests (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      `max-age=${SECURITY_HEADERS.HSTS.maxAge}; includeSubDomains; preload`
    );
  }

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature policy for enhanced security
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );

  next();
};

/**
 * Middleware to handle trust proxy settings
 */
const configureTrustProxy = (app) => {
  // Trust proxy for deployed environments (Vercel, AWS ALB, etc.)
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', true);
  }
};

module.exports = {
  enforceHTTPS,
  setSecureHeaders,
  configureTrustProxy
};