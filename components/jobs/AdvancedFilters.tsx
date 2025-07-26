'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'

export interface JobFilters {
  searchTerm: string
  location: string
  clearance: string
  salary: {
    min: number
    max: number
  }
  experienceLevel: string[]
  jobType: string[]
  skills: string[]
  postedWithin: string
  remote: boolean
  polygraph: boolean
  certifications: string[]
}

interface Aggregations {
  clearanceLevels: { value: string; count: number }[]
  experienceLevels: { value: string; count: number }[]
  jobTypes: { value: string; count: number }[]
  companies: { value: string; count: number }[]
  locations: { value: string; count: number }[]
}

interface AdvancedFiltersProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  onClose: () => void
  isOpen: boolean
  aggregations?: Aggregations | null
}

const skillOptions = [
  'AWS', 'Azure', 'Python', 'Java', 'JavaScript', 'React', 'Node.js',
  'Docker', 'Kubernetes', 'Linux', 'Windows Server', 'VMware',
  'Cisco', 'Network Security', 'SIEM', 'Splunk', 'SQL', 'NoSQL',
  'DevOps', 'CI/CD', 'Jenkins', 'GitLab', 'Terraform', 'Ansible'
]

const certificationOptions = [
  'Security+', 'CISSP', 'CEH', 'CCNA', 'CCNP', 'AWS Solutions Architect',
  'AWS Security', 'Azure Administrator', 'PMP', 'ITIL', 'Linux+',
  'Network+', 'CySA+', 'CASP+', 'GCIH', 'GIAC'
]

const postedWithinOptions = [
  { value: '', label: 'Any time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' }
]

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onClose,
  isOpen,
  aggregations
}: AdvancedFiltersProps) {
  if (!isOpen) return null

  const handleCheckboxChange = (category: 'experienceLevel' | 'jobType' | 'skills' | 'certifications', value: string) => {
    const currentValues = filters[category]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({
      ...filters,
      [category]: newValues
    })
  }

  const handleSliderChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      salary: { min: value[0], max: value[1] }
    })
  }

  const formatSalary = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`
  }

  const resetFilters = () => {
    onFiltersChange({
      searchTerm: '',
      location: '',
      clearance: '',
      salary: { min: 0, max: 300000 },
      experienceLevel: [],
      jobType: [],
      skills: [],
      postedWithin: '',
      remote: false,
      polygraph: false,
      certifications: []
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-command-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-montserrat font-bold">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clearance Level */}
            <div>
              <h3 className="font-semibold mb-3">Clearance Level</h3>
              <select
                value={filters.clearance}
                onChange={(e) => onFiltersChange({ ...filters, clearance: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">All Clearances</option>
                {aggregations?.clearanceLevels.map(({ value, count }) => (
                  <option key={value} value={value}>
                    {value} ({count})
                  </option>
                )) || (
                  <>
                    <option value="SECRET">SECRET</option>
                    <option value="TS">TOP SECRET</option>
                    <option value="TS/SCI">TS/SCI</option>
                  </>
                )}
              </select>
            </div>

            {/* Posted Within */}
            <div>
              <h3 className="font-semibold mb-3">Posted Within</h3>
              <select
                value={filters.postedWithin}
                onChange={(e) => onFiltersChange({ ...filters, postedWithin: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {postedWithinOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary Range */}
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-3">
                Salary Range: {formatSalary(filters.salary.min)} - {formatSalary(filters.salary.max)}
              </h3>
              <div className="px-3">
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="5000"
                  value={filters.salary.max}
                  onChange={(e) => handleSliderChange([filters.salary.min, parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$100k</span>
                  <span>$200k</span>
                  <span>$300k+</span>
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <h3 className="font-semibold mb-3">Experience Level</h3>
              <div className="space-y-2">
                {aggregations?.experienceLevels.map(({ value, count }) => (
                  <label key={value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.experienceLevel.includes(value)}
                      onChange={() => handleCheckboxChange('experienceLevel', value)}
                      className="mr-2"
                    />
                    <span>{value} ({count})</span>
                  </label>
                )) || ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'].map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.experienceLevel.includes(level)}
                      onChange={() => handleCheckboxChange('experienceLevel', level)}
                      className="mr-2"
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div>
              <h3 className="font-semibold mb-3">Job Type</h3>
              <div className="space-y-2">
                {aggregations?.jobTypes.map(({ value, count }) => (
                  <label key={value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.jobType.includes(value)}
                      onChange={() => handleCheckboxChange('jobType', value)}
                      className="mr-2"
                    />
                    <span>{value} ({count})</span>
                  </label>
                )) || ['Full-time', 'Part-time', 'Contract', 'Contract-to-Hire'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.jobType.includes(type)}
                      onChange={() => handleCheckboxChange('jobType', type)}
                      className="mr-2"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Remote & Polygraph */}
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-3">Additional Requirements</h3>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.remote}
                    onChange={(e) => onFiltersChange({ ...filters, remote: e.target.checked })}
                    className="mr-2"
                  />
                  <span>Remote Positions Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.polygraph}
                    onChange={(e) => onFiltersChange({ ...filters, polygraph: e.target.checked })}
                    className="mr-2"
                  />
                  <span>Polygraph Required</span>
                </label>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="font-semibold mb-3">Skills</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {skillOptions.map(skill => (
                  <label key={skill} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={() => handleCheckboxChange('skills', skill)}
                      className="mr-2"
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="font-semibold mb-3">Certifications</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {certificationOptions.map(cert => (
                  <label key={cert} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.certifications.includes(cert)}
                      onChange={() => handleCheckboxChange('certifications', cert)}
                      className="mr-2"
                    />
                    <span>{cert}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={resetFilters}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Reset All
          </button>
          <div className="space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}