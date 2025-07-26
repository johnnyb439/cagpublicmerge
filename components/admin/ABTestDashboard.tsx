'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FlaskConical, Play, Pause, BarChart3, Users, 
  TrendingUp, Clock, CheckCircle, XCircle 
} from 'lucide-react'
import { experiments, Experiment } from '@/lib/ab-testing/experiments'

export default function ABTestDashboard() {
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="text-green-500" size={16} />
      case 'paused': return <Pause className="text-yellow-500" size={16} />
      case 'completed': return <CheckCircle className="text-blue-500" size={16} />
      default: return <Clock className="text-gray-500" size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FlaskConical className="text-purple-500" />
          A/B Testing Dashboard
        </h2>
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
          Create New Experiment
        </button>
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {experiments.map((experiment) => (
          <motion.div
            key={experiment.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer"
            onClick={() => setSelectedExperiment(experiment)}
          >
            {/* Experiment Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {experiment.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {experiment.description}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(experiment.status)}`}>
                {getStatusIcon(experiment.status)}
                {experiment.status}
              </span>
            </div>

            {/* Variants */}
            <div className="space-y-2 mb-4">
              {experiment.variants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {variant.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {variant.weight}%
                  </span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tracking:</p>
              <div className="flex flex-wrap gap-2">
                {experiment.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                  >
                    {metric.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Mock Results (in production, fetch from analytics) */}
            {experiment.status === 'running' && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(Math.random() * 10000)}
                  </p>
                  <p className="text-xs text-gray-500">Participants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    +{(Math.random() * 20).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Conversion Lift</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected Experiment Details */}
      {selectedExperiment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Experiment Details: {selectedExperiment.name}
          </h3>
          
          {/* Mock Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Conversion Rate by Variant</h4>
              <div className="space-y-2">
                {selectedExperiment.variants.map((variant, index) => (
                  <div key={variant.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{variant.name}</span>
                      <span className="text-sm font-medium">
                        {(Math.random() * 10 + 5).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.random() * 40 + 40}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Statistical Significance</h4>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-green-500 mb-2">95.2%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence Level
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Results are statistically significant
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              View Full Report
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Export Data
            </button>
            {selectedExperiment.status === 'running' && (
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                Pause Experiment
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}