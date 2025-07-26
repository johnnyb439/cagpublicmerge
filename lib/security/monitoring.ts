/**
 * Security monitoring and logging system
 */

export interface SecurityEvent {
  id: string
  timestamp: number
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  ip: string
  userAgent?: string
  userId?: string
  details: Record<string, any>
  resolved: boolean
}

export type SecurityEventType = 
  | 'authentication_failure'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'csp_violation'
  | 'validation_failure'
  | 'unauthorized_access'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'file_upload_violation'
  | 'brute_force_attempt'
  | 'ddos_attempt'
  | 'data_breach_attempt'

export interface SecurityMetrics {
  totalEvents: number
  eventsByType: Record<SecurityEventType, number>
  eventsBySeverity: Record<string, number>
  topIPs: Array<{ ip: string; count: number }>
  recentEvents: SecurityEvent[]
  trends: {
    hourly: number[]
    daily: number[]
  }
}

class SecurityMonitor {
  private static instance: SecurityMonitor
  private events: SecurityEvent[] = []
  private maxEvents = 10000 // Keep last 10k events in memory
  private alertCallbacks: Array<(event: SecurityEvent) => void> = []

  private constructor() {
    // Start background cleanup
    setInterval(() => this.cleanup(), 60 * 60 * 1000) // Every hour
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      resolved: false,
      ...event
    }

    this.events.push(securityEvent)

    // Trigger alerts for high severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      this.triggerAlert(securityEvent)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 Security Event [${event.severity.toUpperCase()}]:`, {
        type: event.type,
        source: event.source,
        ip: event.ip,
        details: event.details
      })
    }

    // Send to external monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(securityEvent)
    }

    // Cleanup if we have too many events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }

  /**
   * Register an alert callback
   */
  onAlert(callback: (event: SecurityEvent) => void): void {
    this.alertCallbacks.push(callback)
  }

  /**
   * Get security metrics
   */
  getMetrics(timeframe: 'hour' | 'day' | 'week' = 'day'): SecurityMetrics {
    const now = Date.now()
    let cutoff: number

    switch (timeframe) {
      case 'hour':
        cutoff = now - (60 * 60 * 1000)
        break
      case 'day':
        cutoff = now - (24 * 60 * 60 * 1000)
        break
      case 'week':
        cutoff = now - (7 * 24 * 60 * 60 * 1000)
        break
    }

    const recentEvents = this.events.filter(event => event.timestamp > cutoff)

    // Count events by type
    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<SecurityEventType, number>)

    // Count events by severity
    const eventsBySeverity = recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top IPs
    const ipCounts = recentEvents.reduce((acc, event) => {
      acc[event.ip] = (acc[event.ip] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }))

    // Generate trends
    const hourly = this.generateHourlyTrend(recentEvents)
    const daily = this.generateDailyTrend(recentEvents)

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      topIPs,
      recentEvents: recentEvents.slice(-50), // Last 50 events
      trends: { hourly, daily }
    }
  }

  /**
   * Mark event as resolved
   */
  resolveEvent(eventId: string): void {
    const event = this.events.find(e => e.id === eventId)
    if (event) {
      event.resolved = true
    }
  }

  /**
   * Get events by criteria
   */
  getEvents(criteria: {
    type?: SecurityEventType
    severity?: string
    ip?: string
    resolved?: boolean
    limit?: number
  } = {}): SecurityEvent[] {
    let filtered = [...this.events]

    if (criteria.type) {
      filtered = filtered.filter(e => e.type === criteria.type)
    }
    if (criteria.severity) {
      filtered = filtered.filter(e => e.severity === criteria.severity)
    }
    if (criteria.ip) {
      filtered = filtered.filter(e => e.ip === criteria.ip)
    }
    if (criteria.resolved !== undefined) {
      filtered = filtered.filter(e => e.resolved === criteria.resolved)
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp)

    // Apply limit
    if (criteria.limit) {
      filtered = filtered.slice(0, criteria.limit)
    }

    return filtered
  }

  /**
   * Check for attack patterns
   */
  detectAttackPatterns(ip: string): {
    isSuspicious: boolean
    patterns: string[]
    riskScore: number
  } {
    const recentEvents = this.events.filter(
      event => event.ip === ip && 
      event.timestamp > Date.now() - (60 * 60 * 1000) // Last hour
    )

    const patterns: string[] = []
    let riskScore = 0

    // Pattern 1: High frequency requests
    if (recentEvents.length > 100) {
      patterns.push('high_frequency_requests')
      riskScore += 30
    }

    // Pattern 2: Multiple authentication failures
    const authFailures = recentEvents.filter(e => e.type === 'authentication_failure')
    if (authFailures.length > 5) {
      patterns.push('brute_force_attempt')
      riskScore += 40
    }

    // Pattern 3: Multiple validation failures
    const validationFailures = recentEvents.filter(e => e.type === 'validation_failure')
    if (validationFailures.length > 10) {
      patterns.push('input_fuzzing')
      riskScore += 25
    }

    // Pattern 4: CSP violations
    const cspViolations = recentEvents.filter(e => e.type === 'csp_violation')
    if (cspViolations.length > 3) {
      patterns.push('xss_attempts')
      riskScore += 35
    }

    // Pattern 5: Rate limit exceeded multiple times
    const rateLimitEvents = recentEvents.filter(e => e.type === 'rate_limit_exceeded')
    if (rateLimitEvents.length > 5) {
      patterns.push('ddos_attempt')
      riskScore += 50
    }

    return {
      isSuspicious: riskScore > 50,
      patterns,
      riskScore: Math.min(100, riskScore)
    }
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private triggerAlert(event: SecurityEvent): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in security alert callback:', error)
      }
    })
  }

  private async sendToMonitoringService(event: SecurityEvent): Promise<void> {
    // In production, send to external monitoring service
    // Examples: Sentry, DataDog, Splunk, etc.
    try {
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        })
      }
    } catch (error) {
      console.error('Failed to send security event to monitoring service:', error)
    }
  }

  private generateHourlyTrend(events: SecurityEvent[]): number[] {
    const hours = Array(24).fill(0)
    const now = new Date()
    
    events.forEach(event => {
      const eventDate = new Date(event.timestamp)
      const hourDiff = Math.floor((now.getTime() - eventDate.getTime()) / (60 * 60 * 1000))
      if (hourDiff < 24) {
        hours[23 - hourDiff]++
      }
    })
    
    return hours
  }

  private generateDailyTrend(events: SecurityEvent[]): number[] {
    const days = Array(7).fill(0)
    const now = new Date()
    
    events.forEach(event => {
      const eventDate = new Date(event.timestamp)
      const dayDiff = Math.floor((now.getTime() - eventDate.getTime()) / (24 * 60 * 60 * 1000))
      if (dayDiff < 7) {
        days[6 - dayDiff]++
      }
    })
    
    return days
  }

  private cleanup(): void {
    // Remove events older than 30 days
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000)
    this.events = this.events.filter(event => event.timestamp > cutoff)
  }
}

// Helper functions for common security events
export const securityLogger = {
  logAuthFailure: (ip: string, email: string, userAgent?: string) => {
    SecurityMonitor.getInstance().logEvent({
      type: 'authentication_failure',
      severity: 'medium',
      source: 'auth',
      ip,
      userAgent,
      details: { email, attemptedEmail: email }
    })
  },

  logRateLimitExceeded: (ip: string, endpoint: string, userAgent?: string) => {
    SecurityMonitor.getInstance().logEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      source: endpoint,
      ip,
      userAgent,
      details: { endpoint, limit_type: 'api_rate_limit' }
    })
  },

  logSuspiciousActivity: (ip: string, activity: string, details: Record<string, any>, userAgent?: string) => {
    SecurityMonitor.getInstance().logEvent({
      type: 'suspicious_activity',
      severity: 'high',
      source: 'monitoring',
      ip,
      userAgent,
      details: { activity, ...details }
    })
  },

  logCSPViolation: (ip: string, violation: any, userAgent?: string) => {
    SecurityMonitor.getInstance().logEvent({
      type: 'csp_violation',
      severity: 'medium',
      source: 'csp',
      ip,
      userAgent,
      details: violation
    })
  },

  logValidationFailure: (ip: string, field: string, value: string, error: string, userAgent?: string) => {
    SecurityMonitor.getInstance().logEvent({
      type: 'validation_failure',
      severity: 'low',
      source: 'validation',
      ip,
      userAgent,
      details: { field, value: value.substring(0, 100), error }
    })
  }
}

export const securityMonitor = SecurityMonitor.getInstance()