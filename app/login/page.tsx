'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFormValidation } from '@/hooks/useFormValidation'
import FormInput from '@/components/ui/FormInput'
import Spinner from '@/components/ui/Spinner'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function LoginPage() {
  const router = useRouter()
  const analytics = useAnalytics()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validation = useFormValidation(
    { email: '', password: '' },
    {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      password: {
        required: true,
        minLength: 6,
        message: 'Password must be at least 6 characters'
      }
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validation.validateAll()) {
      return
    }

    setLoading(true)
    
    // Track login attempt
    analytics.trackFormSubmit('login', {
      email: validation.values.email,
    })

    // Simulate login - in production this would connect to your auth system
    setTimeout(() => {
      // Simulate authentication check
      if (validation.values.email === 'demo@cleared.gov' && validation.values.password === 'secret123') {
        // Track successful login
        analytics.track({
          name: 'login_success',
          properties: { email: validation.values.email }
        })
        
        // Store minimal user data in localStorage for demo
        localStorage.setItem('user', JSON.stringify({
          email: validation.values.email,
          name: validation.values.email.split('@')[0],
          clearanceLevel: 'SECRET'
        }))
        router.push('/dashboard')
      } else {
        // Track failed login
        analytics.track({
          name: 'login_failed',
          properties: { email: validation.values.email }
        })
        
        setError('Invalid email or password. Try demo@cleared.gov / secret123')
        setLoading(false)
      }
    }, 1500)
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white dark:bg-command-black rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-full mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-montserrat font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Log in to your Cleared Advisory account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="email"
              type="email"
              label="Email Address"
              value={validation.values.email}
              onChange={(e) => validation.handleChange('email', e.target.value)}
              onBlur={() => validation.handleBlur('email')}
              error={validation.errors.email}
              touched={validation.touched.email}
              icon={<User size={20} />}
              placeholder="john.doe@email.com"
              success={validation.touched.email && !validation.errors.email && !!validation.values.email}
            />

            <FormInput
              id="password"
              type="password"
              label="Password"
              value={validation.values.password}
              onChange={(e) => validation.handleChange('password', e.target.value)}
              onBlur={() => validation.handleBlur('password')}
              error={validation.errors.password}
              touched={validation.touched.password}
              icon={<Lock size={20} />}
              placeholder="••••••••"
              success={validation.touched.password && !validation.errors.password && !!validation.values.password}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg"
              >
                <AlertCircle size={20} className="mr-2" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-dynamic-green hover:text-emerald-green">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !validation.isValid}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-ops-charcoal rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              <strong>Security Notice:</strong> We never store sensitive clearance information. 
              Your privacy is our priority.
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-dynamic-green hover:text-emerald-green font-semibold">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}