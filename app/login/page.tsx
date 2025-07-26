'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Shield, AlertCircle, Building, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { secureStorage } from '@/lib/security/secureStorage'
import { validation } from '@/lib/security/validation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'jobseeker' | 'employer'>('jobseeker')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate email
      if (!validation.isValidEmail(email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (!email || !password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
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
      setError('Login failed. Please try again.')
      setLoading(false)
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center p-3 bg-red-900/50 text-red-300 rounded-lg"
              >
                <AlertCircle size={20} className="mr-2" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-blue to-neon-green text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

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