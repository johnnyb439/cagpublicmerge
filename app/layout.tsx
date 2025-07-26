import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LiveChat from '@/components/LiveChat'
import AnalyticsProvider from '@/components/AnalyticsProvider'
import { SecurityProvider } from '@/contexts/SecurityContext'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Cleared Advisory Group - Your Gateway to Cleared IT Opportunities',
  description: 'Bridging the gap for National Guard, Reservists, Veterans, and cleared professionals seeking government contracting opportunities.',
  keywords: 'security clearance, government contracting, IT jobs, military transition, cleared jobs',
  openGraph: {
    title: 'Cleared Advisory Group',
    description: 'Your Gateway to Cleared IT Opportunities',
    url: 'https://caglive.vercel.app',
    siteName: 'Cleared Advisory Group',
    images: [
      {
        url: '/images/cag-logo.png',
        width: 450,
        height: 350,
        alt: 'Cleared Advisory Group',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cleared Advisory Group',
    description: 'Your Gateway to Cleared IT Opportunities',
    images: ['/images/cag-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-command-black">
        <ThemeProvider>
          <SecurityProvider>
            <AnalyticsProvider>
              <Navbar />
              <main className="pt-20">
                {children}
              </main>
              <Footer />
              <LiveChat />
            </AnalyticsProvider>
          </SecurityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}