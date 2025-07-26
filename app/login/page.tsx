'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Shield, AlertCircle, Building, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { secureStorage } from '@/lib/security/secureStorage'
import { validation } from '@/lib/security/validation'
import ProtectedForm from '@/components/security/ProtectedForm'

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'jobseeker' | 'employer'>('jobseeker')

  const handleSubmit = async (formData: FormData, recaptchaToken: string) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Validate email
      if (!validation.isValidEmail(email)) {
        throw new Error('Please enter a valid email address')
      }

      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }

      // Send login request with CAPTCHA token
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: validation.sanitizeInput(email),
          password,
          userType,
          recaptchaToken
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      // Initialize secure storage with password-derived key
      await secureStorage.initialize(password)

      // Store user data securely
      const userData = {
        email: validation.sanitizeInput(email),
        name: email.split('@')[0],
        type: userType,
        clearanceLevel: userType === 'jobseeker' ? 'SECRET' : null,
        loginTime: Date.now()
      }

      await secureStorage.setItem('user', userData, true)
      
      // Redirect based on user type
      setTimeout(() => {
        router.push(userType === 'employer' ? '/employer/dashboard' : '/dashboard')
      }, 500)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  return (
    <section className="min-h-screen glass-bg py-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full mx-4"
      >
        <div className="glass-card rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sky-blue to-neon-green rounded-full mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-montserrat font-bold mb-2 text-white">Welcome Back</h1>
            <p className="text-gray-300">Log in to your Cleared Advisory account</p>
          </div>

          {/* User Type Toggle */}
          <div className="flex rounded-lg overflow-hidden mb-6 border border-gray-600">
            <button
              type="button"
              onClick={() => setUserType('jobseeker')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
                userType === 'jobseeker' 
                  ? 'bg-sky-blue text-white' 
                  : 'bg-transparent text-gray-300 hover:bg-gray-700'
              }`}
            >
              <UserCheck size={20} />
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setUserType('employer')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
                userType === 'employer' 
                  ? 'bg-sky-blue text-white' 
                  : 'bg-transparent text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Building size={20} />
              Employer
            </button>
          </div>

          {/* Form */}
          <ProtectedForm
            onSubmit={handleSubmit}
            action="login"
            className="space-y-6"
            showRecaptchaBadge={false}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white placeholder-gray-400"
                  placeholder={userType === 'employer' ? 'recruiter@company.com' : 'john.doe@email.com'}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </ProtectedForm>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="text-sky-blue hover:underline text-sm">
              Forgot your password?
            </Link>
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-sky-blue hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}