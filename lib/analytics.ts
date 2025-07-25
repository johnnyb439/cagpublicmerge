// Simple analytics wrapper that can be extended with Google Analytics, Mixpanel, etc.

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
}

class Analytics {
  private isProduction = process.env.NODE_ENV === 'production'

  // Track page views
  pageView(url: string) {
    if (!this.isProduction) {
      console.log('[Analytics] Page View:', url)
      return
    }

    // In production, integrate with your analytics provider
    // Example: Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      })
    }
  }

  // Track custom events
  track(event: AnalyticsEvent) {
    if (!this.isProduction) {
      console.log('[Analytics] Event:', event.name, event.properties)
      return
    }

    // In production, send to your analytics provider
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        event_category: 'engagement',
        ...event.properties,
      })
    }
  }

  // Track user identification
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.isProduction) {
      console.log('[Analytics] Identify:', userId, traits)
      return
    }

    // In production, identify user in your analytics provider
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        user_id: userId,
        ...traits,
      })
    }
  }

  // Track form submissions
  trackFormSubmit(formName: string, data?: Record<string, any>) {
    this.track({
      name: 'form_submit',
      properties: {
        form_name: formName,
        ...data,
      },
    })
  }

  // Track button clicks
  trackClick(buttonName: string, properties?: Record<string, any>) {
    this.track({
      name: 'button_click',
      properties: {
        button_name: buttonName,
        ...properties,
      },
    })
  }

  // Track job applications
  trackJobApplication(jobId: string, jobTitle: string) {
    this.track({
      name: 'job_application',
      properties: {
        job_id: jobId,
        job_title: jobTitle,
      },
    })
  }

  // Track mock interview sessions
  trackMockInterview(action: 'start' | 'complete' | 'abandon', duration?: number) {
    this.track({
      name: 'mock_interview',
      properties: {
        action,
        duration,
      },
    })
  }

  // Track resource downloads
  trackDownload(resourceName: string, resourceType: string) {
    this.track({
      name: 'resource_download',
      properties: {
        resource_name: resourceName,
        resource_type: resourceType,
      },
    })
  }
}

export const analytics = new Analytics()