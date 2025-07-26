import type { Metadata, Viewport } from 'next'
import './globals.css'
import './mobile-optimizations.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LiveChat from '@/components/LiveChat'
import AnalyticsProvider from '@/components/AnalyticsProvider'
import { SecurityProvider } from '@/contexts/SecurityContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider'
import { Analytics } from '@vercel/analytics/react'
import SupabaseStatus from '@/components/SupabaseStatus'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import Hotjar from '@/components/analytics/Hotjar'
import SessionProvider from '@/components/providers/SessionProvider'
import { SocketProvider } from '@/contexts/SocketContext'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import BugReporter from '@/components/BugReporter'
import PerformanceProvider from '@/components/providers/PerformanceProvider'
import PerformanceOptimizer from '@/components/performance/PerformanceOptimizer'
import { seoConfig } from '@/lib/seo/meta-tags'
import { generateOrganizationStructuredData, generateWebsiteStructuredData } from '@/lib/structured-data'
import dynamic from 'next/dynamic'

const PerformanceDashboard = dynamic(
  () => import('@/components/performance/PerformanceDashboard')
)

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clearedadvisorygroup.com'
const organizationData = generateOrganizationStructuredData(baseUrl)
const websiteData = generateWebsiteStructuredData(baseUrl)

export const metadata: Metadata = {
  title: 'Cleared Advisory Group - Premier Career Services for Security Cleared Professionals',
  description: 'Expert career guidance, job placement, and professional development for security cleared IT professionals in government contracting. Find your next cleared position today.',
  keywords: 'security clearance jobs, cleared professionals, government contracting careers, IT security clearance, defense contractor jobs, cleared job placement, security cleared resume, clearance interview prep',
  authors: [{ name: 'Cleared Advisory Group' }],
  creator: 'Cleared Advisory Group',
  publisher: 'Cleared Advisory Group',
  applicationName: 'Cleared Advisory Group',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    title: 'Cleared Advisory Group - Premier Career Services for Security Cleared Professionals',
    description: 'Expert career guidance, job placement, and professional development for security cleared IT professionals in government contracting.',
    url: baseUrl,
    siteName: 'Cleared Advisory Group',
    images: [
      {
        url: `${baseUrl}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cleared Advisory Group - Career Services for Security Cleared Professionals',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@clearedadvisory',
    creator: '@clearedadvisory',
    title: 'Cleared Advisory Group - Premier Career Services for Security Cleared Professionals',
    description: 'Expert career guidance, job placement, and professional development for security cleared IT professionals.',
    images: [`${baseUrl}/images/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
  manifest: '/manifest.json',
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: 'Career Services',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteData),
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-command-black">
        <ServiceWorkerProvider>
          <ThemeProvider>
            <SessionProvider>
              <SecurityProvider>
                <SocketProvider>
                  <AnalyticsProvider>
                    <PerformanceProvider>
                      <PerformanceOptimizer />
                      <Navbar />
                      <main className="pt-20">
                        {children}
                      </main>
                      <Footer />
                      <LiveChat />
                      <KeyboardShortcuts />
                      <BugReporter />
                      {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
                      <Analytics />
                      <SupabaseStatus />
                      <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
                      <Hotjar siteId={process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || ''} />
                    </PerformanceProvider>
                  </AnalyticsProvider>
                </SocketProvider>
              </SecurityProvider>
            </SessionProvider>
          </ThemeProvider>
        </ServiceWorkerProvider>
      </body>
    </html>
  )
}