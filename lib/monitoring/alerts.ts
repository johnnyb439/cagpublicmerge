// Security monitoring and alerts system

interface SecurityEvent {
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: Record<string, any>
  timestamp: number
  userId?: string
  ip?: string
  userAgent?: string
}

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_SUSPICIOUS = 'LOGIN_SUSPICIOUS',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  
  // Rate limiting events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_WARNING = 'RATE_LIMIT_WARNING',
  
  // Security violations
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  
  // Access control
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  
  // Data events
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_DELETION = 'DATA_DELETION',
  
  // System events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  API_ERROR = 'API_ERROR'
}

// Alert thresholds
const alertThresholds = {
  [SecurityEventType.LOGIN_FAILED]: {
    count: 5,
    window: 15 * 60 * 1000, // 15 minutes
    severity: 'high' as const
  },
  [SecurityEventType.RATE_LIMIT_EXCEEDED]: {
    count: 10,
    window: 60 * 60 * 1000, // 1 hour
    severity: 'medium' as const
  },
  [SecurityEventType.UNAUTHORIZED_ACCESS]: {
    count: 3,
    window: 5 * 60 * 1000, // 5 minutes
    severity: 'critical' as const
  }
}

// Event store (in production, use a proper logging service)
const eventStore: SecurityEvent[] = []
const MAX_EVENTS = 10000

// Alert handlers
type AlertHandler = (event: SecurityEvent) => Promise<void>
const alertHandlers: AlertHandler[] = []

// Log security event
export async function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now()
  }
  
  // Store event
  eventStore.push(fullEvent)
  if (eventStore.length > MAX_EVENTS) {
    eventStore.shift() // Remove oldest
  }
  
  // Check thresholds
  await checkThresholds(fullEvent)
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Security Event]', fullEvent)
  }
  
  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    await sendToMonitoringService(fullEvent)
  }
}

// Check if event triggers any alerts
async function checkThresholds(event: SecurityEvent): Promise<void> {
  const threshold = alertThresholds[event.type]
  if (!threshold) return
  
  // Count similar events in time window
  const windowStart = Date.now() - threshold.window
  const similarEvents = eventStore.filter(
    e => e.type === event.type && 
         e.timestamp >= windowStart &&
         e.userId === event.userId
  )
  
  if (similarEvents.length >= threshold.count) {
    await triggerAlert({
      ...event,
      severity: threshold.severity,
      message: `Threshold exceeded: ${similarEvents.length} ${event.type} events in ${threshold.window / 1000}s`,
      details: {
        ...event.details,
        eventCount: similarEvents.length,
        timeWindow: threshold.window
      }
    })
  }
}

// Trigger alert
async function triggerAlert(event: SecurityEvent): Promise<void> {
  // Execute all alert handlers
  await Promise.all(
    alertHandlers.map(handler => 
      handler(event).catch(err => 
        console.error('Alert handler error:', err)
      )
    )
  )
}

// Register alert handler
export function registerAlertHandler(handler: AlertHandler): void {
  alertHandlers.push(handler)
}

// Built-in alert handlers
registerAlertHandler(async (event) => {
  // Console alert for critical events
  if (event.severity === 'critical') {
    console.error('🚨 CRITICAL SECURITY ALERT:', event)
  }
})

registerAlertHandler(async (event) => {
  // Email alert for high/critical events
  if (event.severity === 'high' || event.severity === 'critical') {
    // In production, send email notification
    if (process.env.NODE_ENV === 'production') {
      // await sendEmailAlert(event)
    }
  }
})

// Send to monitoring service (Sentry, DataDog, etc.)
async function sendToMonitoringService(event: SecurityEvent): Promise<void> {
  try {
    // Send to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry.captureMessage(event.message, {
      //   level: event.severity,
      //   tags: {
      //     eventType: event.type,
      //     userId: event.userId
      //   },
      //   extra: event.details
      // })
    }
    
    // Send to custom monitoring endpoint
    await fetch('/api/monitoring/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {
      // Fail silently
    })
  } catch (error) {
    console.error('Failed to send to monitoring service:', error)
  }
}

// Get recent events (for admin dashboard)
export function getRecentEvents(
  filters?: {
    type?: SecurityEventType
    severity?: string
    userId?: string
    limit?: number
  }
): SecurityEvent[] {
  let events = [...eventStore].reverse() // Most recent first
  
  if (filters?.type) {
    events = events.filter(e => e.type === filters.type)
  }
  
  if (filters?.severity) {
    events = events.filter(e => e.severity === filters.severity)
  }
  
  if (filters?.userId) {
    events = events.filter(e => e.userId === filters.userId)
  }
  
  if (filters?.limit) {
    events = events.slice(0, filters.limit)
  }
  
  return events
}

// Security metrics
export function getSecurityMetrics() {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000
  const last7d = now - 7 * 24 * 60 * 60 * 1000
  
  const events24h = eventStore.filter(e => e.timestamp >= last24h)
  const events7d = eventStore.filter(e => e.timestamp >= last7d)
  
  return {
    totalEvents24h: events24h.length,
    totalEvents7d: events7d.length,
    criticalEvents24h: events24h.filter(e => e.severity === 'critical').length,
    highEvents24h: events24h.filter(e => e.severity === 'high').length,
    topEventTypes: getTopEventTypes(events24h),
    eventsByHour: getEventsByHour(events24h)
  }
}

function getTopEventTypes(events: SecurityEvent[]): Array<{ type: string; count: number }> {
  const counts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function getEventsByHour(events: SecurityEvent[]): number[] {
  const hourCounts = new Array(24).fill(0)
  const now = Date.now()
  
  events.forEach(event => {
    const hourAgo = Math.floor((now - event.timestamp) / (60 * 60 * 1000))
    if (hourAgo < 24) {
      hourCounts[23 - hourAgo]++
    }
  })
  
  return hourCounts
}