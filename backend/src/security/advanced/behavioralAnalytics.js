/**
 * Behavioral Analytics Engine
 * AI-powered user behavior analysis for anomaly detection
 */

const tf = require('@tensorflow/tfjs-node');
const brain = require('brain.js');
const crypto = require('crypto');

class BehavioralAnalyticsEngine {
  constructor() {
    this.userProfiles = new Map();
    this.anomalyThreshold = 0.85;
    this.learningRate = 0.01;
    this.network = null;
    this.initializeNetwork();
  }

  /**
   * Initialize neural network for behavior analysis
   */
  initializeNetwork() {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [20, 10],
      activation: 'sigmoid',
      learningRate: this.learningRate
    });

    // Initialize TensorFlow model for advanced pattern recognition
    this.tfModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.tfModel.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  /**
   * Track user behavior and build profile
   */
  async trackBehavior(userId, behaviorData) {
    const profile = this.getUserProfile(userId);
    
    // Behavior metrics to track
    const metrics = {
      timestamp: Date.now(),
      
      // Authentication patterns
      loginTime: behaviorData.loginTime,
      loginLocation: this.hashLocation(behaviorData.ip),
      deviceFingerprint: behaviorData.deviceFingerprint,
      authMethod: behaviorData.authMethod,
      
      // Navigation patterns
      pageSequence: behaviorData.pageSequence || [],
      avgTimePerPage: behaviorData.avgTimePerPage || 0,
      clickPattern: behaviorData.clickPattern || [],
      scrollBehavior: behaviorData.scrollBehavior || {},
      
      // Typing patterns (for high-security operations)
      typingSpeed: behaviorData.typingSpeed || 0,
      typingRhythm: behaviorData.typingRhythm || [],
      keystrokeDynamics: behaviorData.keystrokeDynamics || {},
      
      // Mouse movement patterns
      mouseVelocity: behaviorData.mouseVelocity || 0,
      mouseAcceleration: behaviorData.mouseAcceleration || 0,
      clickPressure: behaviorData.clickPressure || [],
      
      // API usage patterns
      apiCallFrequency: behaviorData.apiCallFrequency || {},
      dataAccessPatterns: behaviorData.dataAccessPatterns || [],
      searchQueries: this.hashSearchQueries(behaviorData.searchQueries || [])
    };

    // Update user profile
    profile.behaviorHistory.push(metrics);
    
    // Keep only last 1000 behavior samples
    if (profile.behaviorHistory.length > 1000) {
      profile.behaviorHistory.shift();
    }

    // Update baseline if sufficient data
    if (profile.behaviorHistory.length >= 10) {
      await this.updateUserBaseline(userId, profile);
    }

    return this.analyzeCurrentBehavior(userId, metrics);
  }

  /**
   * Analyze current behavior against baseline
   */
  async analyzeCurrentBehavior(userId, currentBehavior) {
    const profile = this.getUserProfile(userId);
    
    if (!profile.baseline || profile.behaviorHistory.length < 10) {
      return {
        anomalyScore: 0,
        isAnomalous: false,
        reason: 'Insufficient baseline data'
      };
    }

    // Convert behavior to feature vector
    const features = this.behaviorToFeatures(currentBehavior, profile.baseline);
    
    // Use neural network for anomaly detection
    const prediction = this.network.run(features);
    const anomalyScore = prediction[0];
    
    // Advanced analysis with TensorFlow
    const tfFeatures = tf.tensor2d([Object.values(features)]);
    const tfPrediction = await this.tfModel.predict(tfFeatures).data();
    
    // Combine predictions for higher accuracy
    const combinedScore = (anomalyScore + tfPrediction[0]) / 2;
    
    // Determine if behavior is anomalous
    const isAnomalous = combinedScore > this.anomalyThreshold;
    
    // Identify specific anomalies
    const anomalies = this.identifyAnomalies(currentBehavior, profile.baseline);
    
    // Risk scoring
    const riskScore = this.calculateRiskScore(anomalies, combinedScore);
    
    return {
      anomalyScore: combinedScore,
      isAnomalous,
      riskScore,
      anomalies,
      recommendation: this.getSecurityRecommendation(riskScore, anomalies)
    };
  }

  /**
   * Convert behavior to numerical features
   */
  behaviorToFeatures(behavior, baseline) {
    return {
      timeDeviation: this.calculateTimeDeviation(behavior.loginTime, baseline.avgLoginTime),
      locationChange: behavior.loginLocation !== baseline.primaryLocation ? 1 : 0,
      deviceChange: behavior.deviceFingerprint !== baseline.primaryDevice ? 1 : 0,
      typingSpeedDiff: Math.abs(behavior.typingSpeed - baseline.avgTypingSpeed) / baseline.avgTypingSpeed,
      mousePatternDiff: this.calculateMousePatternDifference(behavior, baseline),
      navigationDiff: this.calculateNavigationDifference(behavior.pageSequence, baseline.commonPaths),
      apiUsageDiff: this.calculateAPIUsageDifference(behavior.apiCallFrequency, baseline.apiBaseline),
      timePerPageDiff: Math.abs(behavior.avgTimePerPage - baseline.avgTimePerPage) / baseline.avgTimePerPage,
      searchPatternDiff: this.calculateSearchPatternDifference(behavior.searchQueries, baseline.searchPatterns),
      overallDeviation: 0 // Calculated as weighted average
    };
  }

  /**
   * Identify specific anomalies
   */
  identifyAnomalies(behavior, baseline) {
    const anomalies = [];

    // Location anomaly
    if (behavior.loginLocation !== baseline.primaryLocation) {
      anomalies.push({
        type: 'LOCATION_CHANGE',
        severity: 'HIGH',
        details: 'Login from unusual location'
      });
    }

    // Time anomaly
    const hourOfDay = new Date(behavior.loginTime).getHours();
    if (Math.abs(hourOfDay - baseline.avgLoginHour) > 6) {
      anomalies.push({
        type: 'TIME_ANOMALY',
        severity: 'MEDIUM',
        details: 'Login at unusual time'
      });
    }

    // Device anomaly
    if (behavior.deviceFingerprint !== baseline.primaryDevice) {
      anomalies.push({
        type: 'DEVICE_CHANGE',
        severity: 'HIGH',
        details: 'Login from unrecognized device'
      });
    }

    // Behavioral anomalies
    if (behavior.typingSpeed < baseline.avgTypingSpeed * 0.5) {
      anomalies.push({
        type: 'TYPING_PATTERN',
        severity: 'MEDIUM',
        details: 'Significantly slower typing detected'
      });
    }

    // API usage anomalies
    for (const [endpoint, frequency] of Object.entries(behavior.apiCallFrequency)) {
      const baselineFreq = baseline.apiBaseline[endpoint] || 0;
      if (frequency > baselineFreq * 3) {
        anomalies.push({
          type: 'API_ABUSE',
          severity: 'HIGH',
          details: `Excessive calls to ${endpoint}`
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculate risk score based on anomalies
   */
  calculateRiskScore(anomalies, anomalyScore) {
    let riskScore = anomalyScore * 0.5; // Base risk from anomaly score

    // Add risk from specific anomalies
    anomalies.forEach(anomaly => {
      switch (anomaly.severity) {
        case 'HIGH':
          riskScore += 0.3;
          break;
        case 'MEDIUM':
          riskScore += 0.15;
          break;
        case 'LOW':
          riskScore += 0.05;
          break;
      }
    });

    return Math.min(riskScore, 1); // Cap at 1
  }

  /**
   * Get security recommendation based on risk
   */
  getSecurityRecommendation(riskScore, anomalies) {
    if (riskScore > 0.9) {
      return {
        action: 'BLOCK',
        reason: 'Critical security risk detected',
        requireMFA: true,
        notifyAdmin: true,
        additionalVerification: 'BIOMETRIC'
      };
    } else if (riskScore > 0.7) {
      return {
        action: 'CHALLENGE',
        reason: 'Suspicious activity detected',
        requireMFA: true,
        notifyAdmin: true,
        additionalVerification: 'SMS'
      };
    } else if (riskScore > 0.5) {
      return {
        action: 'MONITOR',
        reason: 'Unusual behavior patterns',
        requireMFA: true,
        notifyAdmin: false,
        additionalVerification: null
      };
    } else {
      return {
        action: 'ALLOW',
        reason: 'Normal behavior',
        requireMFA: false,
        notifyAdmin: false,
        additionalVerification: null
      };
    }
  }

  /**
   * Update user baseline with new behavior data
   */
  async updateUserBaseline(userId, profile) {
    const behaviorHistory = profile.behaviorHistory;
    
    // Calculate new baseline
    const baseline = {
      avgLoginTime: this.calculateAverage(behaviorHistory.map(b => new Date(b.loginTime).getHours())),
      avgLoginHour: Math.round(this.calculateAverage(behaviorHistory.map(b => new Date(b.loginTime).getHours()))),
      primaryLocation: this.getMostFrequent(behaviorHistory.map(b => b.loginLocation)),
      primaryDevice: this.getMostFrequent(behaviorHistory.map(b => b.deviceFingerprint)),
      avgTypingSpeed: this.calculateAverage(behaviorHistory.map(b => b.typingSpeed).filter(s => s > 0)),
      avgTimePerPage: this.calculateAverage(behaviorHistory.map(b => b.avgTimePerPage).filter(t => t > 0)),
      commonPaths: this.findCommonPaths(behaviorHistory.map(b => b.pageSequence)),
      apiBaseline: this.calculateAPIBaseline(behaviorHistory.map(b => b.apiCallFrequency)),
      searchPatterns: this.extractSearchPatterns(behaviorHistory.map(b => b.searchQueries)),
      mouseProfile: this.buildMouseProfile(behaviorHistory),
      lastUpdated: Date.now()
    };

    profile.baseline = baseline;

    // Train neural network with historical data
    await this.trainNetwork(behaviorHistory, profile.labels || []);
  }

  /**
   * Train neural network with user behavior data
   */
  async trainNetwork(behaviorHistory, labels) {
    if (behaviorHistory.length < 50) {
      return; // Not enough data for training
    }

    const trainingData = behaviorHistory.map((behavior, index) => {
      const features = this.behaviorToFeatures(behavior, this.calculateTemporaryBaseline(behaviorHistory));
      const label = labels[index] || 0; // 0 = normal, 1 = anomalous
      
      return {
        input: Object.values(features),
        output: [label]
      };
    });

    // Train brain.js network
    this.network.train(trainingData.slice(0, -10), {
      iterations: 20000,
      errorThresh: 0.005
    });

    // Train TensorFlow model
    const xs = tf.tensor2d(trainingData.map(d => d.input));
    const ys = tf.tensor2d(trainingData.map(d => d.output));
    
    await this.tfModel.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
        }
      }
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  /**
   * Get or create user profile
   */
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        behaviorHistory: [],
        baseline: null,
        labels: [],
        createdAt: Date.now()
      });
    }
    return this.userProfiles.get(userId);
  }

  /**
   * Utility functions
   */
  hashLocation(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  }

  hashSearchQueries(queries) {
    return queries.map(q => crypto.createHash('sha256').update(q).digest('hex').substring(0, 8));
  }

  calculateAverage(numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length || 0;
  }

  getMostFrequent(array) {
    const frequency = {};
    array.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  }

  calculateTimeDeviation(currentTime, avgTime) {
    return Math.abs(currentTime - avgTime) / avgTime;
  }

  calculateMousePatternDifference(current, baseline) {
    if (!baseline.mouseProfile) return 0;
    
    const velocityDiff = Math.abs(current.mouseVelocity - baseline.mouseProfile.avgVelocity) / baseline.mouseProfile.avgVelocity;
    const accelerationDiff = Math.abs(current.mouseAcceleration - baseline.mouseProfile.avgAcceleration) / baseline.mouseProfile.avgAcceleration;
    
    return (velocityDiff + accelerationDiff) / 2;
  }

  calculateNavigationDifference(currentPath, commonPaths) {
    // Implement sequence matching algorithm
    return 0.1; // Placeholder
  }

  calculateAPIUsageDifference(current, baseline) {
    // Implement API usage comparison
    return 0.1; // Placeholder
  }

  calculateSearchPatternDifference(current, baseline) {
    // Implement search pattern analysis
    return 0.1; // Placeholder
  }

  findCommonPaths(pathArrays) {
    // Implement common path extraction
    return [];
  }

  calculateAPIBaseline(apiUsageArray) {
    // Implement API baseline calculation
    return {};
  }

  extractSearchPatterns(searchArrays) {
    // Implement search pattern extraction
    return [];
  }

  buildMouseProfile(behaviorHistory) {
    // Implement mouse behavior profiling
    return {
      avgVelocity: 100,
      avgAcceleration: 10
    };
  }

  calculateTemporaryBaseline(behaviorHistory) {
    // Quick baseline calculation for training
    return {
      avgLoginTime: 9,
      avgLoginHour: 9,
      primaryLocation: 'default',
      primaryDevice: 'default',
      avgTypingSpeed: 100,
      avgTimePerPage: 30,
      commonPaths: [],
      apiBaseline: {},
      searchPatterns: [],
      mouseProfile: { avgVelocity: 100, avgAcceleration: 10 }
    };
  }
}

module.exports = new BehavioralAnalyticsEngine();