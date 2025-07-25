import { 
  Notification, 
  NotificationType, 
  NotificationChannel, 
  NotificationPriority,
  JobMatchNotification,
  ApplicationUpdateNotification,
  NotificationPreferences
} from '@/types/communications'
import { emailTemplates, compileHandlebarsTemplate } from './email-templates'

export class NotificationService {
  private notifications: Notification[] = []
  
  // In-memory storage for demo - in production, use database
  private userPreferences: Map<string, NotificationPreferences> = new Map()
  
  constructor() {
    // Set default preferences
    this.setDefaultPreferences()
  }
  
  private setDefaultPreferences() {
    const defaultPrefs: NotificationPreferences = {
      email: {
        enabled: true,
        jobMatches: true,
        applicationUpdates: true,
        interviewReminders: true,
        newsletter: true,
        promotions: false,
        frequency: 'immediate'
      },
      inApp: {
        enabled: true,
        jobMatches: true,
        applicationUpdates: true,
        interviewReminders: true,
        messages: true
      },
      sms: {
        enabled: false,
        interviewReminders: false,
        urgentUpdates: false
      }
    }
    
    // Set for demo user
    this.userPreferences.set('demo-user', defaultPrefs)
  }
  
  async sendJobMatchNotification(
    userId: string, 
    jobMatch: JobMatchNotification,
    userEmail: string,
    userName: string
  ): Promise<void> {
    const prefs = this.getUserPreferences(userId)
    
    // Create in-app notification if enabled
    if (prefs.inApp.enabled && prefs.inApp.jobMatches) {
      const notification: Notification = {
        id: this.generateId(),
        userId,
        type: 'job_match',
        title: `New Job Match: ${jobMatch.jobTitle}`,
        message: `${jobMatch.matchScore}% match at ${jobMatch.company} in ${jobMatch.location}`,
        priority: 'medium',
        channel: 'in_app',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: `/jobs/${jobMatch.jobId}`,
        metadata: jobMatch
      }
      
      this.notifications.push(notification)
    }
    
    // Send email notification if enabled
    if (prefs.email.enabled && prefs.email.jobMatches) {
      await this.sendEmailNotification(userEmail, 'jobMatch', {
        userName,
        jobTitle: jobMatch.jobTitle,
        company: jobMatch.company,
        location: jobMatch.location,
        clearanceLevel: jobMatch.clearanceLevel,
        salary: jobMatch.salary,
        matchScore: jobMatch.matchScore,
        matchReasons: jobMatch.matchReasons,
        actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${jobMatch.jobId}`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences`
      })
    }
  }
  
  async sendApplicationUpdateNotification(
    userId: string,
    update: ApplicationUpdateNotification,
    userEmail: string,
    userName: string
  ): Promise<void> {
    const prefs = this.getUserPreferences(userId)
    
    // Determine priority based on status
    let priority: NotificationPriority = 'medium'
    if (update.newStatus === 'offer_received') priority = 'high'
    if (update.newStatus === 'rejected') priority = 'low'
    if (update.newStatus === 'interview_scheduled') priority = 'high'
    
    // Create in-app notification if enabled
    if (prefs.inApp.enabled && prefs.inApp.applicationUpdates) {
      const notification: Notification = {
        id: this.generateId(),
        userId,
        type: 'application_update',
        title: `Application Update: ${update.jobTitle}`,
        message: `Status changed from ${update.previousStatus} to ${update.newStatus}`,
        priority,
        channel: 'in_app',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: `/dashboard/applications/${update.applicationId}`,
        metadata: update
      }
      
      this.notifications.push(notification)
    }
    
    // Send email notification if enabled
    if (prefs.email.enabled && prefs.email.applicationUpdates) {
      const statusClass = this.getStatusClass(update.newStatus)
      
      await this.sendEmailNotification(userEmail, 'applicationUpdate', {
        userName,
        jobTitle: update.jobTitle,
        company: update.company,
        previousStatus: update.previousStatus,
        newStatus: update.newStatus,
        statusClass,
        message: update.message,
        nextSteps: update.nextSteps,
        actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications/${update.applicationId}`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences`
      })
    }
  }
  
  async sendInterviewReminder(
    userId: string,
    interview: {
      jobTitle: string
      company: string
      date: string
      time: string
      type: string
      location?: string
      interviewers?: string[]
    },
    userEmail: string,
    userName: string
  ): Promise<void> {
    const prefs = this.getUserPreferences(userId)
    
    // Create in-app notification if enabled
    if (prefs.inApp.enabled && prefs.inApp.interviewReminders) {
      const notification: Notification = {
        id: this.generateId(),
        userId,
        type: 'interview_reminder',
        title: `Interview Reminder: ${interview.jobTitle}`,
        message: `${interview.date} at ${interview.time} with ${interview.company}`,
        priority: 'high',
        channel: 'in_app',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: `/dashboard/applications`,
        metadata: interview
      }
      
      this.notifications.push(notification)
    }
    
    // Send email notification if enabled
    if (prefs.email.enabled && prefs.email.interviewReminders) {
      await this.sendEmailNotification(userEmail, 'interviewReminder', {
        userName,
        jobTitle: interview.jobTitle,
        company: interview.company,
        date: interview.date,
        time: interview.time,
        interviewType: interview.type,
        location: interview.location,
        interviewers: interview.interviewers?.join(', '),
        calendarUrl: this.generateCalendarUrl(interview),
        applicationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications`,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences`
      })
    }
  }
  
  private async sendEmailNotification(
    email: string, 
    templateType: keyof typeof emailTemplates, 
    data: Record<string, any>
  ): Promise<void> {
    const template = emailTemplates[templateType]
    const compiledHtml = compileHandlebarsTemplate(template.html, data)
    const compiledSubject = compileHandlebarsTemplate(template.subject, data)
    
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email:', {
      to: email,
      subject: compiledSubject,
      html: compiledHtml
    })
    
    // For demo purposes, we'll just log the email
    // In production, you would use an email service:
    /*
    await emailService.send({
      to: email,
      subject: compiledSubject,
      html: compiledHtml
    })
    */
  }
  
  getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.filter(n => n.userId === userId)
    return unreadOnly ? userNotifications.filter(n => !n.read) : userNotifications
  }
  
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      notification.readAt = new Date().toISOString()
    }
  }
  
  markAllAsRead(userId: string): void {
    this.notifications
      .filter(n => n.userId === userId && !n.read)
      .forEach(n => {
        n.read = true
        n.readAt = new Date().toISOString()
      })
  }
  
  deleteNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId)
    if (index > -1) {
      this.notifications.splice(index, 1)
    }
  }
  
  getUserPreferences(userId: string): NotificationPreferences {
    return this.userPreferences.get(userId) || this.getDefaultPreferences()
  }
  
  updateUserPreferences(userId: string, preferences: NotificationPreferences): void {
    this.userPreferences.set(userId, preferences)
  }
  
  private getDefaultPreferences(): NotificationPreferences {
    return {
      email: {
        enabled: true,
        jobMatches: true,
        applicationUpdates: true,
        interviewReminders: true,
        newsletter: true,
        promotions: false,
        frequency: 'immediate'
      },
      inApp: {
        enabled: true,
        jobMatches: true,
        applicationUpdates: true,
        interviewReminders: true,
        messages: true
      },
      sms: {
        enabled: false,
        interviewReminders: false,
        urgentUpdates: false
      }
    }
  }
  
  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'screening': 'screening',
      'interview_scheduled': 'interview',
      'interviewing': 'interview',
      'offer_received': 'offer',
      'rejected': 'rejected',
      'withdrawn': 'rejected'
    }
    return statusMap[status] || 'default'
  }
  
  private generateCalendarUrl(interview: any): string {
    const startDate = new Date(`${interview.date} ${interview.time}`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Interview: ${interview.jobTitle} at ${interview.company}`,
      dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      details: `Interview for ${interview.jobTitle} position at ${interview.company}`,
      location: interview.location || 'Virtual'
    })
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }
  
  private generateId(): string {
    return 'notif_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
}

// Export singleton instance
export const notificationService = new NotificationService()