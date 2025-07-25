'use client'

import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface NewsletterSignupProps {
  className?: string
  variant?: 'default' | 'compact' | 'footer'
  title?: string
  description?: string
}

export default function NewsletterSignup({ 
  className = '', 
  variant = 'default',
  title,
  description
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [categories, setCategories] = useState(['job_alerts'])
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const availableCategories = [
    { id: 'job_alerts', label: 'Job Alerts', description: 'New job opportunities matching your profile' },
    { id: 'industry_news', label: 'Industry News', description: 'Latest trends and insights in the cleared community' },
    { id: 'career_tips', label: 'Career Tips', description: 'Professional development and career advice' },
    { id: 'resources', label: 'Resources', description: 'Exclusive guides, templates, and tools' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setStatus('loading')
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          categories,
          frequency
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title || 'Stay Updated'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description || 'Get the latest job opportunities delivered to your inbox'}
            </p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{message}</p>
              </div>
            )}
          </form>
        )}
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title || 'Newsletter'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {description || 'Subscribe to get the latest job opportunities and career insights.'}
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={status === 'loading'}
            />
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
            
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{message}</p>
              </div>
            )}
          </form>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title || 'Subscribe to Our Newsletter'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {description || 'Stay informed about new job opportunities, industry insights, and career tips.'}
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Subscription Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={status === 'loading'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What would you like to receive?
            </label>
            <div className="space-y-3">
              {availableCategories.map((category) => (
                <label key={category.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={status === 'loading'}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {category.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="weekly"
                  checked={frequency === 'weekly'}
                  onChange={(e) => setFrequency(e.target.value as 'weekly')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={status === 'loading'}
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Weekly</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="monthly"
                  checked={frequency === 'monthly'}
                  onChange={(e) => setFrequency(e.target.value as 'monthly')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={status === 'loading'}
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Monthly</span>
              </label>
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || categories.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By subscribing, you agree to receive email communications from Cleared Advisory Group. 
            You can unsubscribe at any time.
          </p>
        </form>
      )}
    </div>
  )
}