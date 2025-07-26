'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Shield, AlertCircle, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedForm from '@/components/security/ProtectedForm'

export default function RegisterPage() {
  const router = useRouter()

  const handleSubmit = async (formData: FormData, recaptchaToken: string) => {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const clearanceLevel = formData.get('clearanceLevel') as string
    const agreeToTerms = formData.get('agreeToTerms') === 'on'

    // Validation
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match')
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    if (!agreeToTerms) {
      throw new Error('Please agree to the terms and conditions')
    }

    try {
      // Send registration request with CAPTCHA token
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          clearanceLevel,
          recaptchaToken
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      // Store user data locally
      localStorage.setItem('user', JSON.stringify({
        email,
        name,
        clearanceLevel
      }))
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
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
            <h1 className="text-2xl font-montserrat font-bold mb-2 dark:text-white">Create Your Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Join the cleared professional community</p>
          </div>

          {/* Account Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
              <button
                className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
              >
                Individual
              </button>
              <Link 
                href="/register/company"
                className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Company
              </Link>
            </div>
          </div>

          {/* Form */}
          <ProtectedForm
            onSubmit={handleSubmit}
            action="register"
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-dynamic-green dark:text-white"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-dynamic-green dark:text-white"
                  placeholder="john.doe@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="clearance" className="block text-sm font-medium mb-2">
                Current Clearance Level
              </label>
              <select
                id="clearance"
                name="clearanceLevel"
                className="w-full px-4 py-3 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-dynamic-green dark:text-white"
                required
              >
                <option value="">Select clearance level</option>
                <option value="NONE">No Clearance</option>
                <option value="PUBLIC">Public Trust</option>
                <option value="SECRET">SECRET</option>
                <option value="TS">TOP SECRET</option>
                <option value="TS/SCI">TS/SCI</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-dynamic-green dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:border-dynamic-green dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                name="agreeToTerms"
                className="mt-1 mr-2"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-dynamic-green hover:text-emerald-green">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-dynamic-green hover:text-emerald-green">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </ProtectedForm>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-ops-charcoal rounded-lg">
            <div className="flex items-start">
              <Check className="text-green-600 mr-2 mt-0.5" size={16} />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold mb-1">Your Privacy is Protected</p>
                <ul className="space-y-1">
                  <li>• We never store sensitive clearance details</li>
                  <li>• No SSN or personal investigation data</li>
                  <li>• Your information is encrypted and secure</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-dynamic-green hover:text-emerald-green font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}