'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, X, Send, Camera, AlertCircle } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import ProtectedForm from '@/components/security/ProtectedForm'

interface BugReport {
  title: string
  description: string
  type: 'bug' | 'feature' | 'improvement'
  priority: 'low' | 'medium' | 'high' | 'critical'
  url: string
  userAgent: string
  screenshot?: string
}

export default function BugReporter() {
  const [isOpen, setIsOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Partial<BugReport>>({
    type: 'bug',
    priority: 'medium',
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  })

  const handleSubmit = async (submittedFormData: FormData, recaptchaToken: string) => {
    const title = submittedFormData.get('title') as string
    const description = submittedFormData.get('description') as string
    const type = submittedFormData.get('type') as string || formData.type
    const priority = formData.priority // Keep using state for priority

    const bugData = {
      title,
      description,
      type,
      priority,
      url: formData.url,
      userAgent: formData.userAgent,
      recaptchaToken
    }

    try {
      // Capture in Sentry
      const eventId = Sentry.captureMessage(`Bug Report: ${title}`, 'info')
      Sentry.withScope((scope) => {
        scope.setTag('bug-report', true)
        scope.setContext('bug-details', {
          ...bugData,
          eventId
        })
      })

      // Create GitHub issue via API
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bugData,
          sentryEventId: eventId
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
          setFormData({
            type: 'bug',
            priority: 'medium',
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        }, 3000)
      } else {
        throw new Error('Failed to submit bug report')
      }
    } catch (error) {
      console.error('Failed to submit bug report:', error)
      throw error
    }
  }

  const captureScreenshot = async () => {
    try {
      // Use html2canvas or similar library
      // For now, we'll just indicate the feature
      alert('Screenshot capture would be implemented with html2canvas library')
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
    }
  }

  return (
    <>
      {/* Floating Bug Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110"
        title="Report a Bug"
      >
        <Bug size={24} />
      </button>

      {/* Bug Report Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bug className="text-red-500" size={24} />
                    Report an Issue
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form */}
              {!submitted ? (
                <ProtectedForm 
                  onSubmit={handleSubmit} 
                  action="bug_report"
                  className="p-6 space-y-4"
                  showRecaptchaBadge={false}
                >
                  {/* Issue Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Issue Type
                    </label>
                    <select
                      name="type"
                      defaultValue={formData.type}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="bug">Bug</option>
                      <option value="feature">Feature Request</option>
                      <option value="improvement">Improvement</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['low', 'medium', 'high', 'critical'].map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: priority as any })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                            formData.priority === priority
                              ? priority === 'critical' ? 'bg-red-500 text-white'
                              : priority === 'high' ? 'bg-orange-500 text-white'
                              : priority === 'medium' ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={formData.title || ''}
                      placeholder="Brief description of the issue"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      defaultValue={formData.description || ''}
                      placeholder="Please describe the issue in detail. Include steps to reproduce if it's a bug."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Screenshot */}
                  <div>
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Camera size={16} />
                      Attach Screenshot
                    </button>
                  </div>

                  {/* System Info */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>URL:</strong> {formData.url}</p>
                    <p className="truncate"><strong>Browser:</strong> {formData.userAgent}</p>
                  </div>

                </ProtectedForm>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-green-600 dark:text-green-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Thank you for your report!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We've received your report and will look into it as soon as possible.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}