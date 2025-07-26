/**
 * AI-Powered Threat Detection System
 * Real-time threat analysis using machine learning
 */

const tf = require('@tensorflow/tfjs-node');
const brain = require('brain.js');
const natural = require('natural');
const { logSecurityEvent, logAuditEvent } = require('../../utils/logger');
const behavioralAnalytics = require('./behavioralAnalytics');

class ThreatDetectionEngine {
  constructor() {
    this.models = {
      sqlInjection: null,
      xss: null,
      bruteForce: null,
      dataExfiltration: null,
      anomalyDetection: null
    };
    
    this.threatScores = new Map();
    this.activeThreats = new Map();
    this.blockedIPs = new Set();
    
    this.initializeModels();
  }

  /**
   * Initialize ML models for threat detection
   */
  async initializeModels() {
    // SQL Injection Detection Model
    this.models.sqlInjection = new brain.recurrent.LSTM();
    const sqlTrainingData = [
      { input: "SELECT * FROM users WHERE id = 1", output: "safe" },
      { input: "SELECT * FROM users WHERE id = 1 OR 1=1", output: "threat" },
      { input: "'; DROP TABLE users; --", output: "threat" },
      { input: "UNION SELECT password FROM admin", output: "threat" },
      { input: "SELECT name FROM products WHERE category = 'electronics'", output: "safe" }
    ];
    
    // XSS Detection Model
    this.models.xss = tf.sequential({
      layers: [
        tf.layers.embedding({ inputDim: 1000, outputDim: 32, inputLength: 100 }),
        tf.layers.lstm({ units: 64, returnSequences: false }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    this.models.xss.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Brute Force Detection Network
    this.models.bruteForce = new brain.NeuralNetwork({
      hiddenLayers: [10, 5],
      activation: 'sigmoid'
    });
    
    // Data Exfiltration Detection
    this.models.dataExfiltration = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [15], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    this.models.dataExfiltration.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Anomaly Detection Autoencoder
    this.models.anomalyDetection = tf.sequential({
      layers: [
        // Encoder
        tf.layers.dense({ inputShape: [20], units: 14, activation: 'relu' }),
        tf.layers.dense({ units: 7, activation: 'relu' }),
        // Decoder
        tf.layers.dense({ units: 14, activation: 'relu' }),
        tf.layers.dense({ units: 20, activation: 'sigmoid' })
      ]
    });
    
    this.models.anomalyDetection.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
    
    // Train models with initial data
    await this.trainModels();
  }

  /**
   * Analyze request for threats
   */
  async analyzeRequest(req) {
    const threatAnalysis = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      url: req.url,
      method: req.method,
      threats: [],
      overallRisk: 0,
      requiresAction: false
    };
    
    // 1. SQL Injection Detection
    const sqlThreat = await this.detectSQLInjection(req);
    if (sqlThreat.isThreat) {
      threatAnalysis.threats.push(sqlThreat);
    }
    
    // 2. XSS Detection
    const xssThreat = await this.detectXSS(req);
    if (xssThreat.isThreat) {
      threatAnalysis.threats.push(xssThreat);
    }
    
    // 3. Brute Force Detection
    const bruteForceThreat = await this.detectBruteForce(req);
    if (bruteForceThreat.isThreat) {
      threatAnalysis.threats.push(bruteForceThreat);
    }
    
    // 4. Data Exfiltration Detection
    const dataExfilThreat = await this.detectDataExfiltration(req);
    if (dataExfilThreat.isThreat) {
      threatAnalysis.threats.push(dataExfilThreat);
    }
    
    // 5. Anomaly Detection
    const anomalyThreat = await this.detectAnomalies(req);
    if (anomalyThreat.isThreat) {
      threatAnalysis.threats.push(anomalyThreat);
    }
    
    // Calculate overall risk score
    threatAnalysis.overallRisk = this.calculateOverallRisk(threatAnalysis.threats);
    threatAnalysis.requiresAction = threatAnalysis.overallRisk > 0.7;
    
    // Take action if high risk
    if (threatAnalysis.requiresAction) {
      await this.handleThreat(req, threatAnalysis);
    }
    
    // Update threat scores
    this.updateThreatScores(req.ip, threatAnalysis);
    
    return threatAnalysis;
  }

  /**
   * Detect SQL Injection attempts
   */
  async detectSQLInjection(req) {
    const suspiciousPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      /(--|#|\/\*|\*\/)/,
      /(\bor\b\s*\d+\s*=\s*\d+)/i,
      /(\band\b\s*\d+\s*=\s*\d+)/i,
      /[';].*?(--)/,
      /(\bhaving\b|\bgroup\s+by\b)/i,
      /(\bwaitfor\b|\bdelay\b|\bbenchmark\b)/i
    ];
    
    const checkString = (str) => {
      if (!str) return 0;
      let score = 0;
      
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(str)) {
          score += 0.3;
        }
      });
      
      // Check for encoded payloads
      const decoded = decodeURIComponent(str);
      if (decoded !== str) {
        suspiciousPatterns.forEach(pattern => {
          if (pattern.test(decoded)) {
            score += 0.2;
          }
        });
      }
      
      return Math.min(score, 1);
    };
    
    // Check all request data
    let maxScore = 0;
    maxScore = Math.max(maxScore, checkString(req.url));
    maxScore = Math.max(maxScore, checkString(JSON.stringify(req.query)));
    maxScore = Math.max(maxScore, checkString(JSON.stringify(req.body)));
    maxScore = Math.max(maxScore, checkString(JSON.stringify(req.params)));
    
    // Use ML model for advanced detection
    if (this.models.sqlInjection.run) {
      const mlScore = this.models.sqlInjection.run(req.url);
      maxScore = Math.max(maxScore, mlScore === 'threat' ? 0.9 : 0);
    }
    
    return {
      type: 'SQL_INJECTION',
      isThreat: maxScore > 0.5,
      confidence: maxScore,
      severity: maxScore > 0.8 ? 'CRITICAL' : maxScore > 0.6 ? 'HIGH' : 'MEDIUM',
      details: 'Potential SQL injection attempt detected'
    };
  }

  /**
   * Detect XSS attempts
   */
  async detectXSS(req) {
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /<embed[^>]*>/gi,
      /<object[^>]*>/gi
    ];
    
    const checkString = (str) => {
      if (!str) return 0;
      let score = 0;
      
      xssPatterns.forEach(pattern => {
        if (pattern.test(str)) {
          score += 0.4;
        }
      });
      
      // Check for encoded XSS
      const decoded = decodeURIComponent(str);
      if (decoded !== str) {
        xssPatterns.forEach(pattern => {
          if (pattern.test(decoded)) {
            score += 0.3;
          }
        });
      }
      
      // Check for HTML entity encoding
      const htmlDecoded = str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
      if (htmlDecoded !== str) {
        xssPatterns.forEach(pattern => {
          if (pattern.test(htmlDecoded)) {
            score += 0.2;
          }
        });
      }
      
      return Math.min(score, 1);
    };
    
    let maxScore = 0;
    maxScore = Math.max(maxScore, checkString(JSON.stringify(req.body)));
    maxScore = Math.max(maxScore, checkString(JSON.stringify(req.query)));
    maxScore = Math.max(maxScore, checkString(JSON.stringify(req.params)));
    
    // Check headers for XSS
    Object.values(req.headers).forEach(header => {
      maxScore = Math.max(maxScore, checkString(header));
    });
    
    return {
      type: 'XSS',
      isThreat: maxScore > 0.4,
      confidence: maxScore,
      severity: maxScore > 0.8 ? 'HIGH' : maxScore > 0.6 ? 'MEDIUM' : 'LOW',
      details: 'Potential XSS attempt detected'
    };
  }

  /**
   * Detect brute force attacks
   */
  async detectBruteForce(req) {
    const ip = req.ip;
    const endpoint = req.url;
    const key = `${ip}:${endpoint}`;
    
    // Initialize tracking if not exists
    if (!this.bruteForceTracking) {
      this.bruteForceTracking = new Map();
    }
    
    const now = Date.now();
    const timeWindow = 60000; // 1 minute
    const maxAttempts = 10;
    
    // Get or create tracking data
    let tracking = this.bruteForceTracking.get(key) || {
      attempts: [],
      blocked: false
    };
    
    // Add current attempt
    tracking.attempts.push(now);
    
    // Remove old attempts
    tracking.attempts = tracking.attempts.filter(time => now - time < timeWindow);
    
    // Calculate attempt rate
    const attemptRate = tracking.attempts.length / (timeWindow / 1000);
    const isAuthEndpoint = /auth|login|signin|password/i.test(endpoint);
    
    // Neural network features
    const features = {
      attemptCount: tracking.attempts.length / 100,
      attemptRate: attemptRate / 10,
      isAuthEndpoint: isAuthEndpoint ? 1 : 0,
      timeSinceLastAttempt: tracking.attempts.length > 1 ? 
        (now - tracking.attempts[tracking.attempts.length - 2]) / 1000 : 1
    };
    
    // Use neural network for detection
    const mlScore = this.models.bruteForce.run(features);
    const threatScore = Math.max(
      tracking.attempts.length / maxAttempts,
      mlScore,
      isAuthEndpoint && tracking.attempts.length > 5 ? 0.8 : 0
    );
    
    // Update tracking
    this.bruteForceTracking.set(key, tracking);
    
    return {
      type: 'BRUTE_FORCE',
      isThreat: threatScore > 0.6,
      confidence: threatScore,
      severity: threatScore > 0.9 ? 'CRITICAL' : threatScore > 0.7 ? 'HIGH' : 'MEDIUM',
      details: `${tracking.attempts.length} attempts in ${timeWindow/1000}s`,
      metadata: {
        attempts: tracking.attempts.length,
        rate: attemptRate,
        endpoint: endpoint
      }
    };
  }

  /**
   * Detect data exfiltration attempts
   */
  async detectDataExfiltration(req) {
    const responseSize = req.res?.get('content-length') || 0;
    const requestSize = req.get('content-length') || 0;
    
    // Features for ML model
    const features = [
      responseSize / 1000000, // Response size in MB
      requestSize / 1000000, // Request size in MB
      req.method === 'GET' ? 1 : 0,
      req.method === 'POST' ? 1 : 0,
      /export|download|backup|dump/i.test(req.url) ? 1 : 0,
      /\.csv|\.json|\.xml|\.sql|\.tar|\.zip/i.test(req.url) ? 1 : 0,
      req.query.limit ? parseInt(req.query.limit) / 10000 : 0,
      req.query.offset ? parseInt(req.query.offset) / 10000 : 0,
      /select.*from|table|database/i.test(JSON.stringify(req.query)) ? 1 : 0,
      req.headers['accept']?.includes('application/json') ? 1 : 0,
      req.user?.role === 'admin' ? 0.5 : 1, // Admin users less suspicious
      this.getTimeOfDayRisk(), // Higher risk during off-hours
      this.getGeoRisk(req.ip), // Geographic risk score
      this.getHistoricalDataAccess(req.user?.id), // Historical access patterns
      req.url.split('/').length / 10 // URL depth
    ];
    
    // Pad features to expected size
    while (features.length < 15) {
      features.push(0);
    }
    
    // Use TensorFlow model
    const tfFeatures = tf.tensor2d([features]);
    const prediction = await this.models.dataExfiltration.predict(tfFeatures).data();
    tfFeatures.dispose();
    
    const mlScore = prediction[0];
    
    // Rule-based checks
    let ruleScore = 0;
    
    // Large data transfer
    if (responseSize > 10000000) { // 10MB
      ruleScore += 0.3;
    }
    
    // Bulk data indicators
    if (/all|full|complete|entire/i.test(req.url)) {
      ruleScore += 0.2;
    }
    
    // Off-hours access
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      ruleScore += 0.1;
    }
    
    const finalScore = Math.max(mlScore, ruleScore);
    
    return {
      type: 'DATA_EXFILTRATION',
      isThreat: finalScore > 0.6,
      confidence: finalScore,
      severity: finalScore > 0.8 ? 'CRITICAL' : finalScore > 0.7 ? 'HIGH' : 'MEDIUM',
      details: 'Potential data exfiltration detected',
      metadata: {
        responseSize,
        requestSize,
        endpoint: req.url
      }
    };
  }

  /**
   * Detect anomalies using autoencoder
   */
  async detectAnomalies(req) {
    // Extract request features
    const features = this.extractRequestFeatures(req);
    
    // Convert to tensor
    const inputTensor = tf.tensor2d([features]);
    
    // Get reconstruction
    const reconstruction = await this.models.anomalyDetection.predict(inputTensor).data();
    
    // Calculate reconstruction error
    const error = features.reduce((sum, val, idx) => {
      return sum + Math.pow(val - reconstruction[idx], 2);
    }, 0) / features.length;
    
    inputTensor.dispose();
    
    // Higher error means more anomalous
    const anomalyScore = Math.min(error * 10, 1);
    
    return {
      type: 'ANOMALY',
      isThreat: anomalyScore > 0.7,
      confidence: anomalyScore,
      severity: anomalyScore > 0.9 ? 'HIGH' : anomalyScore > 0.8 ? 'MEDIUM' : 'LOW',
      details: 'Anomalous request pattern detected',
      metadata: {
        reconstructionError: error,
        features: features.slice(0, 5) // Show first 5 features
      }
    };
  }

  /**
   * Extract features from request for anomaly detection
   */
  extractRequestFeatures(req) {
    const features = [];
    
    // Time-based features
    const now = new Date();
    features.push(now.getHours() / 24);
    features.push(now.getDay() / 7);
    features.push(now.getDate() / 31);
    
    // Request features
    features.push(req.method === 'GET' ? 0 : req.method === 'POST' ? 0.5 : 1);
    features.push(req.url.length / 200);
    features.push(Object.keys(req.headers).length / 20);
    features.push(JSON.stringify(req.body || {}).length / 1000);
    features.push(Object.keys(req.query || {}).length / 10);
    
    // User features
    features.push(req.user ? 1 : 0);
    features.push(req.user?.role === 'admin' ? 1 : 0);
    
    // Content features
    features.push(req.get('content-type')?.includes('json') ? 1 : 0);
    features.push(req.get('accept')?.includes('json') ? 1 : 0);
    
    // Security features
    features.push(req.secure ? 1 : 0);
    features.push(req.get('authorization') ? 1 : 0);
    
    // Network features
    features.push(this.isInternalIP(req.ip) ? 0 : 1);
    features.push(this.getGeoRisk(req.ip));
    
    // Historical features
    features.push(this.getThreatScore(req.ip));
    features.push(this.getRequestRate(req.ip));
    
    // Path features
    features.push(req.url.split('/').length / 10);
    features.push(/\.\w+$/.test(req.url) ? 1 : 0);
    
    // Ensure we have exactly 20 features
    while (features.length < 20) features.push(0);
    if (features.length > 20) features.length = 20;
    
    return features;
  }

  /**
   * Calculate overall risk score
   */
  calculateOverallRisk(threats) {
    if (threats.length === 0) return 0;
    
    // Weight threats by severity
    const weights = {
      CRITICAL: 1.0,
      HIGH: 0.8,
      MEDIUM: 0.5,
      LOW: 0.3
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    threats.forEach(threat => {
      const weight = weights[threat.severity] || 0.5;
      totalScore += threat.confidence * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Handle detected threats
   */
  async handleThreat(req, threatAnalysis) {
    const { ip, threats, overallRisk } = threatAnalysis;
    
    // Log security event
    logSecurityEvent('THREAT_DETECTED', {
      ip,
      url: req.url,
      method: req.method,
      threats: threats.map(t => ({
        type: t.type,
        severity: t.severity,
        confidence: t.confidence
      })),
      overallRisk,
      userId: req.user?.id,
      userAgent: req.headers['user-agent']
    });
    
    // Block IP if critical threat
    if (overallRisk > 0.9 || threats.some(t => t.severity === 'CRITICAL')) {
      this.blockIP(ip, 3600000); // Block for 1 hour
      
      logSecurityEvent('IP_BLOCKED', {
        ip,
        reason: 'Critical threat detected',
        duration: '1 hour',
        threats: threats.map(t => t.type)
      });
    }
    
    // Alert security team
    if (overallRisk > 0.8) {
      this.alertSecurityTeam(threatAnalysis);
    }
    
    // Update active threats
    this.activeThreats.set(ip, {
      ...threatAnalysis,
      firstSeen: this.activeThreats.get(ip)?.firstSeen || Date.now(),
      lastSeen: Date.now(),
      count: (this.activeThreats.get(ip)?.count || 0) + 1
    });
  }

  /**
   * Helper methods
   */
  getTimeOfDayRisk() {
    const hour = new Date().getHours();
    // Higher risk during off-hours (10 PM - 6 AM)
    if (hour >= 22 || hour < 6) return 0.8;
    // Lower risk during business hours
    if (hour >= 9 && hour < 17) return 0.2;
    return 0.5;
  }

  getGeoRisk(ip) {
    // Simplified geo risk - in production, use GeoIP database
    // For now, return random risk for demonstration
    return Math.random() * 0.5;
  }

  isInternalIP(ip) {
    return /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip);
  }

  getHistoricalDataAccess(userId) {
    // In production, query actual historical data
    return 0.3;
  }

  getThreatScore(ip) {
    return this.threatScores.get(ip)?.score || 0;
  }

  getRequestRate(ip) {
    // Calculate requests per minute for this IP
    return 0.1;
  }

  updateThreatScores(ip, analysis) {
    const current = this.threatScores.get(ip) || { score: 0, count: 0 };
    
    this.threatScores.set(ip, {
      score: (current.score * current.count + analysis.overallRisk) / (current.count + 1),
      count: current.count + 1,
      lastSeen: Date.now()
    });
  }

  blockIP(ip, duration) {
    this.blockedIPs.add(ip);
    setTimeout(() => this.blockedIPs.delete(ip), duration);
  }

  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  alertSecurityTeam(threatAnalysis) {
    // In production, send alerts via email, Slack, etc.
    console.error('🚨 SECURITY ALERT:', threatAnalysis);
  }

  /**
   * Train models with sample data
   */
  async trainModels() {
    // Train SQL injection model
    const sqlTrainingData = [
      { input: "SELECT * FROM users", output: "safe" },
      { input: "SELECT * FROM users WHERE id = ?", output: "safe" },
      { input: "SELECT * FROM users WHERE name = 'John'", output: "safe" },
      { input: "'; DROP TABLE users; --", output: "threat" },
      { input: "1' OR '1'='1", output: "threat" },
      { input: "admin'--", output: "threat" },
      { input: "1 UNION SELECT password FROM admin", output: "threat" }
    ];
    
    // Simplified training for demo
    // In production, use larger datasets and proper training
    console.log('Threat detection models initialized');
  }
}

// Export singleton instance
module.exports = new ThreatDetectionEngine();