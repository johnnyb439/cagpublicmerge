'use client'

import { Amplify } from 'aws-amplify'
import amplifyconfig from '../src/amplifyconfiguration.json'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import LiveChat from '@/components/LiveChat'
import DevModeInit from '@/components/DevModeInit'

Amplify.configure(amplifyconfig)

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <>
      <DevModeInit />
      <SiteHeader />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <LiveChat />
    </>
  )
}