/**
 * Threat Detection Middleware
 * Integrates AI-powered threat detection into request pipeline
 */

const threatDetectionEngine = require('../security/advanced/threatDetection');
const { SecurityError } = require('../utils/errorHandler');
const { logSecurityEvent } = require('../utils/logger');

/**
 * Main threat detection middleware
 */
const detectThreats = async (req, res, next) => {
  try {
    // Skip threat detection for health checks and static assets
    if (req.url === '/health' || req.url.match(/\.(js|css|png|jpg|ico)$/)) {
      return next();
    }
    
    // Check if IP is already blocked
    if (threatDetectionEngine.isIPBlocked(req.ip)) {
      logSecurityEvent('BLOCKED_IP_ACCESS_ATTEMPT', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      throw new SecurityError('Access denied - Your IP has been blocked due to suspicious activity');
    }
    
    // Analyze request for threats
    const startTime = Date.now();
    const threatAnalysis = await threatDetectionEngine.analyzeRequest(req);
    const analysisTime = Date.now() - startTime;
    
    // Add threat analysis to request for logging
    req.threatAnalysis = {
      ...threatAnalysis,
      analysisTime
    };
    
    // Log high-risk requests
    if (threatAnalysis.overallRisk > 0.5) {
      logSecurityEvent('HIGH_RISK_REQUEST', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        risk: threatAnalysis.overallRisk,
        threats: threatAnalysis.threats,
        userId: req.user?.id,
        analysisTime
      });
    }
    
    // Block request if critical threat detected
    if (threatAnalysis.requiresAction && threatAnalysis.overallRisk > 0.9) {
      throw new SecurityError('Request blocked due to security threat detection');
    }
    
    // Add security headers based on threat level
    if (threatAnalysis.overallRisk > 0.3) {
      res.setHeader('X-Security-Alert', 'true');
      res.setHeader('X-Risk-Score', threatAnalysis.overallRisk.toFixed(2));
    }
    
    next();
  } catch (error) {
    if (error instanceof SecurityError) {
      return next(error);
    }
    
    // Log error but don't block request on detection failure
    console.error('Threat detection error:', error);
    logSecurityEvent('THREAT_DETECTION_ERROR', {
      error: error.message,
      ip: req.ip,
      url: req.url
    });
    
    // Continue with request even if threat detection fails
    next();
  }
};

/**
 * Enhanced threat detection for sensitive endpoints
 */
const detectThreatsStrict = async (req, res, next) => {
  try {
    // Run standard detection first
    await detectThreats(req, res, () => {});
    
    // Additional checks for sensitive endpoints
    const threatAnalysis = req.threatAnalysis;
    
    // Lower threshold for sensitive endpoints
    if (threatAnalysis && threatAnalysis.overallRisk > 0.5) {
      logSecurityEvent('SENSITIVE_ENDPOINT_THREAT', {
        ip: req.ip,
        url: req.url,
        risk: threatAnalysis.overallRisk,
        threats: threatAnalysis.threats,
        userId: req.user?.id
      });
      
      throw new SecurityError('Access to sensitive endpoint denied due to elevated security risk');
    }
    
    // Require additional verification for medium risk
    if (threatAnalysis && threatAnalysis.overallRisk > 0.3) {
      req.requireAdditionalVerification = true;
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Threat monitoring middleware (non-blocking)
 */
const monitorThreats = async (req, res, next) => {
  // Run threat detection asynchronously without blocking
  threatDetectionEngine.analyzeRequest(req)
    .then(analysis => {
      if (analysis.overallRisk > 0.7) {
        logSecurityEvent('THREAT_MONITORED', {
          ip: req.ip,
          url: req.url,
          risk: analysis.overallRisk,
          threats: analysis.threats
        });
      }
    })
    .catch(error => {
      console.error('Threat monitoring error:', error);
    });
  
  // Continue immediately
  next();
};

/**
 * IP blocking check middleware
 */
const checkBlockedIP = (req, res, next) => {
  if (threatDetectionEngine.isIPBlocked(req.ip)) {
    logSecurityEvent('BLOCKED_IP_REJECTED', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Your IP address has been temporarily blocked due to suspicious activity',
      code: 'IP_BLOCKED'
    });
  }
  
  next();
};

/**
 * Response monitoring for data exfiltration
 */
const monitorResponse = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Monitor send
  res.send = function(data) {
    checkDataExfiltration(req, res, data);
    return originalSend.apply(res, arguments);
  };
  
  // Monitor json
  res.json = function(data) {
    checkDataExfiltration(req, res, data);
    return originalJson.apply(res, arguments);
  };
  
  next();
};

/**
 * Check response for potential data exfiltration
 */
function checkDataExfiltration(req, res, data) {
  try {
    const dataSize = JSON.stringify(data).length;
    
    // Large response to non-admin user
    if (dataSize > 1000000 && req.user?.role !== 'admin') {
      logSecurityEvent('LARGE_DATA_RESPONSE', {
        ip: req.ip,
        url: req.url,
        userId: req.user?.id,
        dataSize,
        userRole: req.user?.role
      });
    }
    
    // Bulk data indicators
    if (Array.isArray(data) && data.length > 1000) {
      logSecurityEvent('BULK_DATA_ACCESS', {
        ip: req.ip,
        url: req.url,
        userId: req.user?.id,
        recordCount: data.length
      });
    }
  } catch (error) {
    // Don't break response on monitoring error
    console.error('Response monitoring error:', error);
  }
}

module.exports = {
  detectThreats,
  detectThreatsStrict,
  monitorThreats,
  checkBlockedIP,
  monitorResponse
};