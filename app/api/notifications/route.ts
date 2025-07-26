import { NextRequest, NextResponse } from 'next/server'
import { mockDatabase } from '@/lib/mock-db'

interface EmailPreferences {
  jobAlerts: boolean
  applicationUpdates: boolean
  certificationReminders: boolean
  networkingUpdates: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
}

interface NotificationTemplate {
  id: string
  type: 'job_alert' | 'application_update' | 'certification_reminder' | 'networking_update' | 'weekly_digest'
  subject: string
  template: string
  frequency: 'immediate' | 'daily' | 'weekly'
}

interface PendingNotification {
  id: string
  userId: string
  type: string
  subject: string
  content: string
  templateData: any
  scheduledFor: string
  status: 'pending' | 'sent' | 'failed'
  createdAt: string
}

// Mock data for email preferences and notifications
const emailPreferences: Record<string, EmailPreferences> = {
  '1': {
    jobAlerts: true,
    applicationUpdates: true,
    certificationReminders: true,
    networkingUpdates: false,
    weeklyDigest: true,
    marketingEmails: false
  }
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: '1',
    type: 'job_alert',
    subject: 'New {clearanceLevel} Jobs Match Your Profile',
    template: `
      <h2>New Job Opportunities</h2>
      <p>Hi {userName},</p>
      <p>We found {jobCount} new jobs that match your profile:</p>
      {jobList}
      <p><a href="{jobsUrl}">View All Jobs</a></p>
    `,
    frequency: 'daily'
  },
  {
    id: '2',
    type: 'application_update',
    subject: 'Application Update: {jobTitle} at {company}',
    template: `
      <h2>Application Status Update</h2>
      <p>Hi {userName},</p>
      <p>Your application for <strong>{jobTitle}</strong> at {company} has been updated:</p>
      <p><strong>Status:</strong> {status}</p>
      <p>{message}</p>
      <p><a href="{applicationUrl}">View Application</a></p>
    `,
    frequency: 'immediate'
  },
  {
    id: '3',
    type: 'certification_reminder',
    subject: 'Certification Expiring Soon: {certificationName}',
    template: `
      <h2>Certification Expiration Reminder</h2>
      <p>Hi {userName},</p>
      <p>Your <strong>{certificationName}</strong> certification is expiring soon:</p>
      <p><strong>Expiration Date:</strong> {expirationDate}</p>
      <p><strong>Days Remaining:</strong> {daysRemaining}</p>
      <p>Don't let your certification lapse! <a href="{renewalUrl}">Renew Now</a></p>
    `,
    frequency: 'immediate'
  },
  {
    id: '4',
    type: 'weekly_digest',
    subject: 'Your Weekly Career Digest',
    template: `
      <h2>Weekly Career Digest</h2>
      <p>Hi {userName},</p>
      <p>Here's your weekly summary:</p>
      <ul>
        <li><strong>Applications:</strong> {applicationCount} active applications</li>
        <li><strong>New Jobs:</strong> {newJobCount} jobs matching your profile</li>
        <li><strong>Network:</strong> {connectionCount} new connections</li>
        <li><strong>Goals:</strong> {goalProgress}% progress this week</li>
      </ul>
      <p><a href="{dashboardUrl}">View Dashboard</a></p>
    `,
    frequency: 'weekly'
  }
]

let pendingNotifications: PendingNotification[] = []

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const type = url.searchParams.get('type') // 'preferences' | 'pending' | 'templates'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'preferences':
        const preferences = emailPreferences[userId] || {
          jobAlerts: true,
          applicationUpdates: true,
          certificationReminders: true,
          networkingUpdates: false,
          weeklyDigest: true,
          marketingEmails: false
        }
        return NextResponse.json({ success: true, data: preferences })

      case 'pending':
        const userNotifications = pendingNotifications.filter(n => n.userId === userId)
        return NextResponse.json({ success: true, data: userNotifications })

      case 'templates':
        return NextResponse.json({ success: true, data: notificationTemplates })

      default:
        // Get notification history for user
        const notifications = pendingNotifications
          .filter(n => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20)

        return NextResponse.json({
          success: true,
          data: {
            preferences: emailPreferences[userId],
            recent: notifications,
            stats: {
              totalSent: notifications.filter(n => n.status === 'sent').length,
              pending: notifications.filter(n => n.status === 'pending').length,
              failed: notifications.filter(n => n.status === 'failed').length
            }
          }
        })
    }
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, ...data } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'update_preferences':
        emailPreferences[userId] = { ...emailPreferences[userId], ...data.preferences }
        return NextResponse.json({ 
          success: true, 
          message: 'Email preferences updated successfully',
          data: emailPreferences[userId]
        })

      case 'send_notification':
        const notification: PendingNotification = {
          id: Date.now().toString(),
          userId,
          type: data.type,
          subject: data.subject,
          content: data.content,
          templateData: data.templateData || {},
          scheduledFor: data.scheduledFor || new Date().toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
        
        pendingNotifications.push(notification)
        
        // Simulate sending email (in real app, this would trigger email service)
        setTimeout(() => {
          const index = pendingNotifications.findIndex(n => n.id === notification.id)
          if (index !== -1) {
            pendingNotifications[index].status = 'sent'
          }
        }, 1000)

        return NextResponse.json({ 
          success: true, 
          message: 'Notification queued successfully',
          data: notification
        })

      case 'schedule_job_alert':
        // Create job alert notification based on user preferences
        const userPrefs = emailPreferences[userId]
        if (!userPrefs?.jobAlerts) {
          return NextResponse.json({ 
            success: false, 
            error: 'Job alerts are disabled for this user' 
          })
        }

        const jobAlert: PendingNotification = {
          id: Date.now().toString(),
          userId,
          type: 'job_alert',
          subject: `New ${data.clearanceLevel || 'Cleared'} Jobs Match Your Profile`,
          content: generateJobAlertContent(data),
          templateData: data,
          scheduledFor: new Date().toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
        
        pendingNotifications.push(jobAlert)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Job alert scheduled successfully',
          data: jobAlert
        })

      case 'schedule_cert_reminder':
        // Create certification reminder
        const certPrefs = emailPreferences[userId]
        if (!certPrefs?.certificationReminders) {
          return NextResponse.json({ 
            success: false, 
            error: 'Certification reminders are disabled for this user' 
          })
        }

        const certReminder: PendingNotification = {
          id: Date.now().toString(),
          userId,
          type: 'certification_reminder',
          subject: `Certification Expiring Soon: ${data.certificationName}`,
          content: generateCertReminderContent(data),
          templateData: data,
          scheduledFor: new Date().toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
        
        pendingNotifications.push(certReminder)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Certification reminder scheduled successfully',
          data: certReminder
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const notificationId = url.searchParams.get('notificationId')

    if (!userId || !notificationId) {
      return NextResponse.json(
        { success: false, error: 'User ID and notification ID are required' },
        { status: 400 }
      )
    }

    const index = pendingNotifications.findIndex(
      n => n.id === notificationId && n.userId === userId
    )

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    pendingNotifications.splice(index, 1)

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateJobAlertContent(data: any): string {
  const jobList = data.jobs?.map((job: any) => 
    `<li><strong>${job.title}</strong> at ${job.company} - ${job.location} (${job.clearanceLevel})</li>`
  ).join('') || '<li>No specific jobs provided</li>'

  return `
    <h2>New Job Opportunities</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>We found ${data.jobCount || 0} new jobs that match your profile:</p>
    <ul>${jobList}</ul>
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/jobs">View All Jobs</a></p>
    <hr>
    <p><small>You're receiving this because you have job alerts enabled. <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings">Manage preferences</a></small></p>
  `
}

function generateCertReminderContent(data: any): string {
  return `
    <h2>Certification Expiration Reminder</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>Your <strong>${data.certificationName}</strong> certification is expiring soon:</p>
    <p><strong>Expiration Date:</strong> ${data.expirationDate}</p>
    <p><strong>Days Remaining:</strong> ${data.daysRemaining}</p>
    <p>Don't let your certification lapse! Make sure to renew before it expires.</p>
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/certifications">Manage Certifications</a></p>
    <hr>
    <p><small>You're receiving this because you have certification reminders enabled. <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings">Manage preferences</a></small></p>
  `
}