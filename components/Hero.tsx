'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'
import { isDevMode } from '@/lib/dev-mode'

export default function Hero() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      setIsLoading(true)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      if (isDevMode) {
        // Dev mode fallback
        setUser({ username: 'dev-user' })
      } else {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDashboardClick = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login?next=%2Fdashboard')
    }
  }

  const renderCTAs = () => {
    if (!mounted || isLoading) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <div className="w-40 h-12 bg-gray-800 rounded-lg animate-pulse" />
          <div className="w-32 h-12 bg-gray-800 rounded-lg animate-pulse" />
        </div>
      )
    }

    if (user) {
      // Signed IN - Show Dashboard
      return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button 
              onClick={handleDashboardClick}
              className="text-white font-semibold px-8 py-3 rounded-lg btn-cag-gradient cag-glow"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      )
    }

    // Signed OUT - Show Create Account and Log In
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/register" className="text-white font-semibold px-8 py-3 rounded-lg btn-cag-gradient cag-glow">
            Create Account
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/login" className="border border-gray-400 hover:border-white text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300">
            Log In
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Clean Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Your Security Clearance is Your
            <span className="block mt-2 gradient-text-animated">Gateway to Success</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            We help cleared professionals transition into lucrative IT contracting careers with personalized guidance and proven strategies.
          </p>

          {renderCTAs()}

          {/* CAG QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-40 h-40 relative">
                <Image
                  src="/qr-code-cag.png"
                  alt="CAG QR Code"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}