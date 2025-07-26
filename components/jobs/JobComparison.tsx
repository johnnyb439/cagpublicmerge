'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Minus, MapPin, Shield, DollarSign, Calendar, Building } from 'lucide-react'

export interface Job {
  id: string | number
  title: string
  company: string
  location: string
  clearance: string
  salary: string
  type: string
  posted: string
  description: string
  requirements?: string[]
  benefits?: string[]
  skills?: string[]
  experienceLevel?: string
  remote?: boolean
  polygraph?: boolean
}

interface JobComparisonProps {
  jobs: Job[]
  onRemoveJob: (id: string | number) => void
  onClose: () => void
  isOpen: boolean
}

export default function JobComparison({ jobs, onRemoveJob, onClose, isOpen }: JobComparisonProps) {
  if (!isOpen || jobs.length === 0) return null

  const compareFields = [
    { key: 'salary', label: 'Salary', icon: DollarSign },
    { key: 'clearance', label: 'Clearance', icon: Shield },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'type', label: 'Job Type', icon: Calendar },
    { key: 'experienceLevel', label: 'Experience', icon: Building }
  ]

  const extractSalaryRange = (salary: string) => {
    const numbers = salary.match(/\d+/g)
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0]) * 1000,
        max: parseInt(numbers[1]) * 1000
      }
    }
    return { min: 0, max: 0 }
  }

  const getBestValue = (field: string, value: any): boolean => {
    if (field === 'salary') {
      const salaryRange = extractSalaryRange(value)
      const allSalaries = jobs.map(j => extractSalaryRange(j.salary))
      return salaryRange.max === Math.max(...allSalaries.map(s => s.max))
    }
    if (field === 'clearance') {
      const clearanceLevels = ['PUBLIC', 'SECRET', 'TS', 'TS/SCI', 'TS/SCI-POLY']
      const currentLevel = clearanceLevels.indexOf(value)
      const allLevels = jobs.map(j => clearanceLevels.indexOf(j.clearance))
      return currentLevel === Math.max(...allLevels)
    }
    return false
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compare Jobs ({jobs.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900">
                  Details
                </th>
                {jobs.map((job) => (
                  <th key={job.id} className="p-4 min-w-[250px]">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.company}
                      </p>
                      <button
                        onClick={() => onRemoveJob(job.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field) => {
                const Icon = field.icon
                return (
                  <tr key={field.key} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900">
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        {field.label}
                      </div>
                    </td>
                    {jobs.map((job) => {
                      const value = job[field.key as keyof Job]
                      const isBest = getBestValue(field.key, value)
                      return (
                        <td key={job.id} className="p-4 text-center">
                          <div className={`${isBest ? 'text-neon-green font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                            {value || '-'}
                            {isBest && <span className="ml-1 text-xs">★</span>}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}

              {/* Remote Work */}
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900">
                  Remote Work
                </td>
                {jobs.map((job) => (
                  <td key={job.id} className="p-4 text-center">
                    {job.remote ? (
                      <Check className="text-neon-green mx-auto" size={20} />
                    ) : (
                      <Minus className="text-gray-400 mx-auto" size={20} />
                    )}
                  </td>
                ))}
              </tr>

              {/* Polygraph */}
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900">
                  Polygraph Required
                </td>
                {jobs.map((job) => (
                  <td key={job.id} className="p-4 text-center">
                    {job.polygraph ? (
                      <Check className="text-yellow-500 mx-auto" size={20} />
                    ) : (
                      <Minus className="text-gray-400 mx-auto" size={20} />
                    )}
                  </td>
                ))}
              </tr>

              {/* Skills */}
              {jobs.some(j => j.skills) && (
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 align-top">
                    Key Skills
                  </td>
                  {jobs.map((job) => (
                    <td key={job.id} className="p-4">
                      {job.skills ? (
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="text-xs text-gray-500">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Description */}
              <tr>
                <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 align-top">
                  Description
                </td>
                {jobs.map((job) => (
                  <td key={job.id} className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {job.description}
                    </p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ★ Indicates best value in category
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}