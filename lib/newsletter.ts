import { NewsletterSubscription } from '@/types/communications'
import { emailTemplates, compileHandlebarsTemplate } from './email-templates'

export class NewsletterService {
  private subscriptions: NewsletterSubscription[] = []
  
  constructor() {
    this.initializeDemoData()
  }
  
  private initializeDemoData() {
    // Demo subscription
    const demoSubscription: NewsletterSubscription = {
      id: 'sub_1',
      email: 'user@example.com',
      userId: 'demo-user',
      categories: ['job_alerts', 'industry_news', 'career_tips'],
      frequency: 'weekly',
      isActive: true,
      subscribedAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
      confirmed: true
    }
    
    this.subscriptions.push(demoSubscription)
  }
  
  async subscribe(
    email: string,
    categories: string[] = ['job_alerts'],
    frequency: 'weekly' | 'monthly' = 'weekly',
    userId?: string
  ): Promise<NewsletterSubscription> {
    // Check if already subscribed
    const existing = this.subscriptions.find(sub => sub.email === email)
    if (existing && existing.isActive) {
      throw new Error('Email already subscribed')
    }
    
    const subscription: NewsletterSubscription = {
      id: this.generateId(),
      email,
      userId,
      categories,
      frequency,
      isActive: false, // Requires confirmation
      subscribedAt: new Date().toISOString(),
      confirmationToken: this.generateToken(),
      confirmed: false
    }
    
    if (existing) {
      // Reactivate existing subscription
      existing.categories = categories
      existing.frequency = frequency
      existing.isActive = false
      existing.subscribedAt = new Date().toISOString()
      existing.confirmationToken = subscription.confirmationToken
      existing.confirmed = false
      return existing
    }
    
    this.subscriptions.push(subscription)
    
    // Send confirmation email
    await this.sendConfirmationEmail(subscription)
    
    return subscription
  }
  
  async confirmSubscription(token: string): Promise<boolean> {
    const subscription = this.subscriptions.find(sub => sub.confirmationToken === token)
    if (!subscription) {
      return false
    }
    
    subscription.confirmed = true
    subscription.isActive = true
    subscription.confirmationToken = undefined
    
    // Send welcome email
    await this.sendWelcomeEmail(subscription)
    
    return true
  }
  
  async unsubscribe(email: string): Promise<boolean> {
    const subscription = this.subscriptions.find(sub => sub.email === email)
    if (!subscription) {
      return false
    }
    
    subscription.isActive = false
    subscription.unsubscribedAt = new Date().toISOString()
    
    return true
  }
  
  getSubscription(email: string): NewsletterSubscription | undefined {
    return this.subscriptions.find(sub => sub.email === email)
  }
  
  updatePreferences(
    email: string,
    categories: string[],
    frequency: 'weekly' | 'monthly'
  ): boolean {
    const subscription = this.subscriptions.find(sub => sub.email === email)
    if (!subscription) {
      return false
    }
    
    subscription.categories = categories
    subscription.frequency = frequency
    
    return true
  }
  
  getActiveSubscriptions(frequency?: 'weekly' | 'monthly'): NewsletterSubscription[] {
    let subs = this.subscriptions.filter(sub => sub.isActive && sub.confirmed)
    
    if (frequency) {
      subs = subs.filter(sub => sub.frequency === frequency)
    }
    
    return subs
  }
  
  async sendNewsletter(
    title: string,
    subtitle: string,
    sections: { title: string; content: string }[],
    featuredJobs?: any[],
    resources?: any[],
    frequency: 'weekly' | 'monthly' = 'weekly'
  ): Promise<void> {
    const subscriptions = this.getActiveSubscriptions(frequency)
    
    for (const subscription of subscriptions) {
      await this.sendNewsletterEmail(subscription, {
        title,
        subtitle,
        sections,
        featuredJobs,
        resources
      })
    }
  }
  
  private async sendConfirmationEmail(subscription: NewsletterSubscription): Promise<void> {
    const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/confirm?token=${subscription.confirmationToken}`
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af;">Confirm Your Newsletter Subscription</h1>
        <p>Thank you for subscribing to the Cleared Advisory Group newsletter!</p>
        <p>To complete your subscription, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 15px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Subscription</a>
        </div>
        <p>You'll receive ${subscription.frequency} updates featuring:</p>
        <ul>
          <li>New job opportunities in your field</li>
          <li>Industry insights and trends</li>
          <li>Career development tips</li>
          <li>Exclusive resources and downloads</li>
        </ul>
        <p>If you didn't sign up for this newsletter, you can safely ignore this email.</p>
      </div>
    `
    
    console.log('Sending confirmation email to:', subscription.email)
    console.log('Email content:', emailContent)
  }
  
  private async sendWelcomeEmail(subscription: NewsletterSubscription): Promise<void> {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(subscription.email)}`
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af;">Welcome to Cleared Advisory Group!</h1>
        <p>Your newsletter subscription has been confirmed. Welcome to our community!</p>
        <p>You'll now receive ${subscription.frequency} updates with:</p>
        <ul>
          <li>🎯 Curated job opportunities</li>
          <li>📈 Industry trends and insights</li>
          <li>💡 Career development resources</li>
          <li>🔒 Security clearance guidance</li>
        </ul>
        <p>We're excited to help you advance your career in the cleared community.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p>You can <a href="${unsubscribeUrl}">unsubscribe</a> at any time.</p>
        </div>
      </div>
    `
    
    console.log('Sending welcome email to:', subscription.email)
    console.log('Email content:', emailContent)
  }
  
  private async sendNewsletterEmail(
    subscription: NewsletterSubscription,
    content: {
      title: string
      subtitle: string
      sections: { title: string; content: string }[]
      featuredJobs?: any[]
      resources?: any[]
    }
  ): Promise<void> {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(subscription.email)}`
    const preferencesUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/preferences?email=${encodeURIComponent(subscription.email)}`
    const jobBoardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/jobs`
    
    const compiledHtml = compileHandlebarsTemplate(emailTemplates.newsletter.html, {
      ...content,
      unsubscribeUrl,
      preferencesUrl,
      jobBoardUrl
    })
    
    const compiledSubject = compileHandlebarsTemplate(emailTemplates.newsletter.subject, content)
    
    console.log('Sending newsletter to:', subscription.email)
    console.log('Subject:', compiledSubject)
    console.log('Content preview:', compiledHtml.substring(0, 200) + '...')
  }
  
  private generateId(): string {
    return 'sub_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
  
  private generateToken(): string {
    return Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  }
}

// Export singleton instance
export const newsletterService = new NewsletterService()