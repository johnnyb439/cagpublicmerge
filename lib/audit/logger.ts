import { supabase, getServiceSupabase } from '@/lib/supabase/client'
import { backupAuditLogs } from '@/lib/aws/s3'

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'UPDATE_PROFILE'
  | 'VIEW_PROFILE'
  | 'DELETE_ACCOUNT'
  | 'VIEW_JOB'
  | 'APPLY_JOB'
  | 'UPLOAD_RESUME'
  | 'DELETE_RESUME'
  | 'ENABLE_MFA'
  | 'DISABLE_MFA'
  | 'CHANGE_PASSWORD'
  | 'API_ACCESS'
  | 'ADMIN_ACTION'
  | 'DATA_EXPORT'
  | 'DATA_DELETE'

export type ResourceType = 
  | 'auth'
  | 'user'
  | 'job'
  | 'application'
  | 'resume'
  | 'company'
  | 'settings'
  | 'api'
  | 'admin'

export interface AuditLogEntry {
  user_id?: string
  action: AuditAction
  resource_type: ResourceType
  resource_id?: string
  ip_address?: string
  user_agent?: string
  old_data?: any
  new_data?: any
  metadata?: Record<string, any>
}

export interface AuditContext {
  userId?: string
  ipAddress?: string
  userAgent?: string
}

class AuditLogger {
  private static instance: AuditLogger
  private queue: AuditLogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private context: AuditContext = {}

  private constructor() {
    // Flush queue every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 5000)
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  // Set global context for audit logs
  setContext(context: Partial<AuditContext>) {
    this.context = { ...this.context, ...context }
  }

  // Log an audit event
  async log(entry: AuditLogEntry): Promise<void> {
    const enrichedEntry = {
      ...entry,
      user_id: entry.user_id || this.context.userId,
      ip_address: entry.ip_address || this.context.ipAddress,
      user_agent: entry.user_agent || this.context.userAgent,
      created_at: new Date().toISOString()
    }

    // Add to queue for batch processing
    this.queue.push(enrichedEntry)

    // Flush immediately for critical actions
    if (this.isCriticalAction(entry.action)) {
      await this.flush()
    }
  }

  // Batch insert audit logs
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const logsToInsert = [...this.queue]
    this.queue = []

    try {
      const serviceSupabase = getServiceSupabase()
      const { error } = await serviceSupabase
        .from('audit_logs')
        .insert(logsToInsert)

      if (error) {
        console.error('Failed to insert audit logs:', error)
        // Re-add to queue for retry
        this.queue.unshift(...logsToInsert)
      }
    } catch (error) {
      console.error('Audit log flush error:', error)
      // Re-add to queue for retry
      this.queue.unshift(...logsToInsert)
    }
  }

  // Check if action is critical and needs immediate logging
  private isCriticalAction(action: AuditAction): boolean {
    const criticalActions: AuditAction[] = [
      'LOGIN',
      'DELETE_ACCOUNT',
      'CHANGE_PASSWORD',
      'ENABLE_MFA',
      'DISABLE_MFA',
      'ADMIN_ACTION',
      'DATA_DELETE'
    ]
    return criticalActions.includes(action)
  }

  // Query audit logs
  async query(filters: {
    userId?: string
    action?: AuditAction
    resourceType?: ResourceType
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<any[]> {
    let query = supabase.from('audit_logs').select('*')

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters.action) {
      query = query.eq('action', filters.action)
    }
    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType)
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString())
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString())
    }

    query = query.order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to query audit logs:', error)
      return []
    }

    return data || []
  }

  // Generate compliance report
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    summary: Record<AuditAction, number>
    userActivity: Record<string, number>
    suspiciousActivity: any[]
    totalEvents: number
  }> {
    const logs = await this.query({ startDate, endDate })

    const summary: Record<string, number> = {}
    const userActivity: Record<string, number> = {}
    const suspiciousActivity: any[] = []

    for (const log of logs) {
      // Count by action
      summary[log.action] = (summary[log.action] || 0) + 1

      // Count by user
      if (log.user_id) {
        userActivity[log.user_id] = (userActivity[log.user_id] || 0) + 1
      }

      // Detect suspicious activity
      if (this.isSuspicious(log)) {
        suspiciousActivity.push(log)
      }
    }

    return {
      summary: summary as Record<AuditAction, number>,
      userActivity,
      suspiciousActivity,
      totalEvents: logs.length
    }
  }

  // Detect suspicious activity patterns
  private isSuspicious(log: any): boolean {
    // Multiple failed login attempts
    if (log.action === 'LOGIN' && log.metadata?.failed) {
      return true
    }

    // Unusual time activity (outside business hours)
    const hour = new Date(log.created_at).getHours()
    if (hour < 6 || hour > 22) {
      return ['DELETE_ACCOUNT', 'DATA_DELETE', 'ADMIN_ACTION'].includes(log.action)
    }

    // Rapid succession of sensitive actions
    // (Would need to implement time-based analysis)

    return false
  }

  // Archive old logs to S3
  async archiveOldLogs(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const oldLogs = await this.query({
      endDate: cutoffDate
    })

    if (oldLogs.length > 0) {
      try {
        // Backup to S3
        await backupAuditLogs(oldLogs)

        // Delete from database
        const { error } = await getServiceSupabase()
          .from('audit_logs')
          .delete()
          .lte('created_at', cutoffDate.toISOString())

        if (error) {
          console.error('Failed to delete old audit logs:', error)
        }
      } catch (error) {
        console.error('Failed to archive audit logs:', error)
      }
    }
  }

  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Helper functions for common audit scenarios
export async function logUserAction(
  action: AuditAction,
  resourceType: ResourceType,
  resourceId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await auditLogger.log({
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata
  })
}

export async function logApiAccess(
  endpoint: string,
  method: string,
  statusCode: number,
  userId?: string
): Promise<void> {
  await auditLogger.log({
    action: 'API_ACCESS',
    resource_type: 'api',
    resource_id: endpoint,
    user_id: userId,
    metadata: {
      method,
      statusCode,
      timestamp: Date.now()
    }
  })
}

export async function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any
): Promise<void> {
  await auditLogger.log({
    action: 'ADMIN_ACTION',
    resource_type: 'admin',
    metadata: {
      event,
      severity,
      details,
      alertSent: severity === 'critical'
    }
  })
}

// Middleware helper for API routes
export function withAuditLogging(
  handler: Function,
  action: AuditAction,
  resourceType: ResourceType
) {
  return async (req: any, res: any) => {
    const start = Date.now()
    let statusCode = 200

    try {
      const result = await handler(req, res)
      statusCode = res.statusCode || 200
      return result
    } catch (error) {
      statusCode = 500
      throw error
    } finally {
      await logApiAccess(
        req.url,
        req.method,
        statusCode,
        req.headers['x-user-id']
      )
    }
  }
}