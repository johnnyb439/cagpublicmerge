import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LiveChat from '@/components/LiveChat'
import { BookmarkProvider } from '@/components/bookmarks/BookmarkProvider'
// Removed AuthProvider import

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
        <BookmarkProvider>
          <Navbar />
          <main className="pt-20">
            {children}
          </main>
          <Footer />
          <LiveChat />
        </BookmarkProvider>
      </body>
    </html>
  )
}