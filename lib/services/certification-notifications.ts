import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { UserCertificationItem } from '@/lib/dynamodb-schema'

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocumentClient.from(dynamoClient)

interface NotificationLog {
  userId: string
  certId: string
  type: '90days' | '60days' | '30days'
  message: string
  timestamp: string
}

/**
 * Check all certifications and update expiry status
 * This function should be called by a cron job or serverless scheduler
 */
export async function checkCertificationExpiry(): Promise<NotificationLog[]> {
  const logs: NotificationLog[] = []

  try {
    // Scan all user certifications
    const scanCommand = new ScanCommand({
      TableName: 'cag-user-certifications',
      FilterExpression: 'attribute_exists(expiryDate) AND #status = :active',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':active': 'active'
      }
    })

    const response = await docClient.send(scanCommand)
    const certifications = (response.Items || []) as UserCertificationItem[]

    const now = new Date()
    const notifications: Promise<void>[] = []

    for (const cert of certifications) {
      if (!cert.expiryDate) continue

      const expiryDate = new Date(cert.expiryDate)
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      let newStatus: UserCertificationItem['status'] = cert.status
      let reminderType: '90days' | '60days' | '30days' | null = null
      let shouldNotify = false

      // Determine status and reminder type
      if (daysUntilExpiry < 0) {
        newStatus = 'expired'
      } else if (daysUntilExpiry <= 30) {
        newStatus = 'expiring_soon'
        if (!cert.renewalReminderSent?.['30days']) {
          reminderType = '30days'
          shouldNotify = true
        }
      } else if (daysUntilExpiry <= 60) {
        newStatus = 'expiring_soon'
        if (!cert.renewalReminderSent?.['60days']) {
          reminderType = '60days'
          shouldNotify = true
        }
      } else if (daysUntilExpiry <= 90) {
        newStatus = 'expiring_soon'
        if (!cert.renewalReminderSent?.['90days']) {
          reminderType = '90days'
          shouldNotify = true
        }
      }

      // Update certification status if changed
      if (newStatus !== cert.status || shouldNotify) {
        const updateExpression: string[] = ['#status = :status', 'updatedAt = :updatedAt']
        const expressionAttributeNames: any = { '#status': 'status' }
        const expressionAttributeValues: any = {
          ':status': newStatus,
          ':updatedAt': new Date().toISOString()
        }

        // Mark reminder as sent
        if (shouldNotify && reminderType) {
          updateExpression.push('renewalReminderSent.#reminderType = :true')
          expressionAttributeNames['#reminderType'] = reminderType
          expressionAttributeValues[':true'] = true

          // Log notification
          const certName = cert.certId
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')

          const message = reminderType === '30days'
            ? `URGENT: Your ${certName} expires in ${daysUntilExpiry} days!`
            : reminderType === '60days'
            ? `Your ${certName} expires in ${daysUntilExpiry} days. Schedule renewal soon.`
            : `Your ${certName} expires in ${daysUntilExpiry} days. Time to start planning.`

          logs.push({
            userId: cert.userId,
            certId: cert.certId,
            type: reminderType,
            message,
            timestamp: new Date().toISOString()
          })

          // TODO: Send actual notification (email, in-app, push)
          console.log(`[NOTIFICATION] User ${cert.userId}: ${message}`)
        }

        const updateCommand = new UpdateCommand({
          TableName: 'cag-user-certifications',
          Key: {
            userId: cert.userId,
            certId: cert.certId
          },
          UpdateExpression: `SET ${updateExpression.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues
        })

        notifications.push(docClient.send(updateCommand))
      }
    }

    // Execute all updates in parallel
    await Promise.all(notifications)

    console.log(`[CERT-CHECK] Processed ${certifications.length} certifications, sent ${logs.length} notifications`)

    return logs
  } catch (error) {
    console.error('[CERT-CHECK] Error checking certification expiry:', error)
    throw error
  }
}

/**
 * Send in-app toast notification (placeholder for UI integration)
 */
export function sendInAppNotification(userId: string, message: string, type: 'info' | 'warning' | 'error') {
  // TODO: Integrate with your notification system (e.g., WebSocket, SSE, or polling)
  // For now, just log it
  console.log(`[IN-APP] ${type.toUpperCase()} notification for user ${userId}: ${message}`)

  // This would typically:
  // 1. Store in a notifications table
  // 2. Send via WebSocket to connected clients
  // 3. Update UI notification badge/counter
}

/**
 * Send email notification (placeholder for email integration)
 */
export async function sendEmailNotification(userId: string, subject: string, body: string) {
  // TODO: Integrate with email service (AWS SES, SendGrid, etc.)
  console.log(`[EMAIL] Queued email for user ${userId}`)
  console.log(`  Subject: ${subject}`)
  console.log(`  Body: ${body}`)

  // This would typically:
  // 1. Look up user's email from profile
  // 2. Format HTML email template
  // 3. Send via email service
  // 4. Log delivery status
}

/**
 * Serverless handler for AWS Lambda or Vercel Cron
 */
export async function certificationCheckHandler() {
  try {
    const logs = await checkCertificationExpiry()

    // Process notifications
    for (const log of logs) {
      // Send in-app notification
      sendInAppNotification(log.userId, log.message, log.type === '30days' ? 'warning' : 'info')

      // Send email for urgent reminders
      if (log.type === '30days' || log.type === '60days') {
        await sendEmailNotification(
          log.userId,
          `Certification Renewal Reminder`,
          log.message
        )
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        notificationsSent: logs.length,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Certification check failed:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to check certifications'
      })
    }
  }
}