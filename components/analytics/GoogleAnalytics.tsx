'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Extend window type for GA
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      
      // Track page views
      window.gtag('config', measurementId, {
        page_path: url,
        custom_map: {
          dimension1: 'clearance_level',
          dimension2: 'user_type',
          dimension3: 'job_category'
        }
      })
    }
  }, [pathname, searchParams, measurementId])

  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              send_page_view: false
            });
          `,
        }}
      />
    </>
  )
}

// Helper functions for custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Specific event trackers
export const trackJobView = (jobId: string, jobTitle: string, company: string) => {
  trackEvent('view_job', 'engagement', `${jobTitle} at ${company}`, jobId as any)
}

export const trackJobApplication = (jobId: string, jobTitle: string) => {
  trackEvent('apply_job', 'conversion', jobTitle)
}

export const trackResumeUpload = () => {
  trackEvent('upload_resume', 'engagement')
}

export const trackMockInterview = (type: string) => {
  trackEvent('start_mock_interview', 'engagement', type)
}

export const trackUserRegistration = (method: string) => {
  trackEvent('sign_up', 'conversion', method)
}

export const trackUserLogin = (method: string) => {
  trackEvent('login', 'engagement', method)
}

// E-commerce tracking for premium features
export const trackPurchase = (item: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: Date.now().toString(),
      value: value,
      currency: 'USD',
      items: [{
        item_id: item,
        item_name: item,
        price: value,
        quantity: 1
      }]
    })
  }
}