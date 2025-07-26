'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSecurity } from '@/contexts/SecurityContext'
import { validation } from '@/lib/security/validation'

export default function SecureLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useSecurity()
  
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    clearanceLevel: 'None'
  })
  
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
  }>({ strength: 'weak', errors: [] })

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason === 'timeout') {
      setError('Your session has expired. Please login again.')
    }
  }, [searchParams])

  useEffect(() => {
    if (formData.password) {
      const result = validation.validatePassword(formData.password)
      setPasswordStrength({
        strength: result.strength,
        errors: result.errors
      })
    }
  }, [formData.password])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: validation.sanitizeInput(value)
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login
        const result = await login(formData.email, formData.password)
        if (result.success) {
          setSuccessMessage('Login successful! Redirecting...')
          setTimeout(() => router.push('/dashboard'), 1000)
        } else {
          setError(result.error || 'Login failed')
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }

        // This would normally be an API call
        // For demo purposes, we'll simulate registration
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        if (users.find((u: any) => u.email === formData.email)) {
          setError('Email already registered')
          setIsLoading(false)
          return
        }

        users.push({
          id: `user_${Date.now()}`,
          email: formData.email,
          password: formData.password, // In real app, this would be hashed server-side
          name: formData.name,
          clearanceLevel: formData.clearanceLevel,
          createdAt: Date.now()
        })
        
        localStorage.setItem('users', JSON.stringify(users))
        setSuccessMessage('Registration successful! Please login.')
        setIsLogin(true)
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'strong': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      default: return 'text-red-500'
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-command-black rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-dynamic-green rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Secure {isLogin ? 'Login' : 'Registration'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin 
                ? 'Access your cleared professional account' 
                : 'Create your secure account'}
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">Enhanced Security Active</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>End-to-end encryption for all data</li>
                  <li>30-minute auto-logout for security</li>
                  <li>Multi-tab session synchronization</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-sm text-green-800 dark:text-green-300">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                placeholder="john.doe@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {!isLogin && formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Password Strength:
                    </span>
                    <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                      {passwordStrength.strength.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 'strong' ? 'bg-green-500 w-full' :
                        passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                        'bg-red-500 w-1/3'
                      }`}
                    />
                  </div>
                  {passwordStrength.errors.length > 0 && (
                    <ul className="mt-2 text-xs text-red-600 dark:text-red-400 space-y-1">
                      {passwordStrength.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Clearance Level
                  </label>
                  <select
                    name="clearanceLevel"
                    value={formData.clearanceLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="None">None</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Secret">Secret</option>
                    <option value="Top Secret">Top Secret</option>
                    <option value="TS/SCI">TS/SCI</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-dynamic-green text-white py-3 rounded-lg font-semibold hover:bg-emerald-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setSuccessMessage('')
                }}
                className="ml-2 text-dynamic-green hover:text-emerald-green font-medium"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}