import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import LiveChat from '@/components/LiveChat'
import DevModeInit from '@/components/DevModeInit'

export const metadata: Metadata = {
  title: 'Cleared Advisory Group - Your Gateway to Cleared IT Opportunities',
  description: 'Bridging the gap for National Guard, Reservists, Veterans, and cleared professionals seeking government contracting opportunities.',
  keywords: 'security clearance, government contracting, IT jobs, military transition, cleared jobs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-command-black">
        <DevModeInit />
        <SiteHeader />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        <LiveChat />
      </body>
    </html>
  )
}