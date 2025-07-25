export type NotificationType = 
  | 'job_match'
  | 'application_update'
  | 'interview_reminder'
  | 'offer_received'
  | 'deadline_reminder'
  | 'newsletter'
  | 'system'
  | 'message'

export type NotificationChannel = 
  | 'email'
  | 'in_app'
  | 'sms'

export type NotificationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

export interface NotificationPreferences {
  email: {
    enabled: boolean
    jobMatches: boolean
    applicationUpdates: boolean
    interviewReminders: boolean
    newsletter: boolean
    promotions: boolean
    frequency: 'immediate' | 'daily' | 'weekly'
  }
  inApp: {
    enabled: boolean
    jobMatches: boolean
    applicationUpdates: boolean
    interviewReminders: boolean
    messages: boolean
  }
  sms: {
    enabled: boolean
    interviewReminders: boolean
    urgentUpdates: boolean
  }
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  channel: NotificationChannel
  read: boolean
  createdAt: string
  readAt?: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  type: NotificationType
}

export interface JobMatchNotification {
  jobId: string
  jobTitle: string
  company: string
  matchScore: number
  matchReasons: string[]
  salary?: string
  location: string
  clearanceLevel: string
}

export interface ApplicationUpdateNotification {
  applicationId: string
  jobTitle: string
  company: string
  previousStatus: string
  newStatus: string
  message?: string
  nextSteps?: string[]
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  subject?: string
  content: string
  attachments?: {
    name: string
    url: string
    type: string
  }[]
  read: boolean
  sentAt: string
  readAt?: string
  parentMessageId?: string
}

export interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    role: 'candidate' | 'recruiter' | 'admin'
    avatar?: string
  }[]
  jobId?: string
  jobTitle?: string
  company?: string
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface NewsletterSubscription {
  id: string
  email: string
  userId?: string
  categories: string[]
  frequency: 'weekly' | 'monthly'
  isActive: boolean
  subscribedAt: string
  unsubscribedAt?: string
  confirmationToken?: string
  confirmed: boolean
}