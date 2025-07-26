'use client'

import Script from 'next/script'

interface HotjarProps {
  siteId: string
  hotjarVersion?: number
}

export default function Hotjar({ siteId, hotjarVersion = 6 }: HotjarProps) {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <Script
      id="hotjar"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${siteId},hjsv:${hotjarVersion}};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
      }}
    />
  )
}

// Hotjar event tracking
export const identifyUser = (userId: string, attributes?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).hj) {
    (window as any).hj('identify', userId, attributes || {})
  }
}

// Virtual page view for SPAs
export const trackVirtualPageView = (path: string) => {
  if (typeof window !== 'undefined' && (window as any).hj) {
    (window as any).hj('vpv', path)
  }
}

// Trigger events
export const triggerEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && (window as any).hj) {
    (window as any).hj('event', eventName)
  }
}

// Tag recordings
export const tagRecording = (tags: string[]) => {
  if (typeof window !== 'undefined' && (window as any).hj) {
    (window as any).hj('tagRecording', tags)
  }
}