'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import JobAlerts from '@/components/jobs/JobAlerts'

export default function JobAlertsPage() {
  return (
    <div className="min-h-screen glass-bg py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/jobs"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Job Alerts</h1>
          <p className="text-gray-400">
            Set up alerts to get notified when new jobs match your criteria
          </p>
        </motion.div>

        {/* Job Alerts Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <JobAlerts />
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-card rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-3">How Job Alerts Work</h3>
          <div className="space-y-3 text-gray-300">
            <p>
              • <strong>Instant Alerts:</strong> Get notified immediately when a new job matching your criteria is posted
            </p>
            <p>
              • <strong>Daily Digest:</strong> Receive a summary of all matching jobs posted in the last 24 hours
            </p>
            <p>
              • <strong>Weekly Roundup:</strong> Get a comprehensive list of the week's opportunities every Monday
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Note: Email and SMS notifications require account verification. In-app notifications are available immediately.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}