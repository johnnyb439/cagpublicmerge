'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-command-black p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-md w-full text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </motion.div>
        
        <h2 className="text-2xl font-montserrat font-bold mb-4 text-gray-900 dark:text-white">
          Something went wrong!
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        
        {error.digest && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reset()}
            className="glass-button text-white inline-flex items-center hover-glow"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </motion.button>
          
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button text-white inline-flex items-center hover-glow"
            >
              <Home className="w-4 h-4 mr-2" />
              Go home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}