'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, AlertCircle, Award, Clock, CheckCircle,
  XCircle, ChevronRight, BookOpen, Target, DollarSign,
  Calendar, ExternalLink, Plus, AlertTriangle
} from 'lucide-react'

interface RenewalReminder {
  certId: string
  certName: string
  expiryDate: string
  daysUntilExpiry: number
  urgency: 'low' | 'medium' | 'high'
  message: string
  color: string
}

interface CertUpgrade {
  currentCertId: string
  currentCertName: string
  recommendedCerts: {
    certId: string
    name: string
    timeToComplete: number
    salaryBoost: number
    prepResources?: any
  }[]
}

interface RoadmapData {
  renewals: RenewalReminder[]
  upgrades: CertUpgrade[]
  careerPathSuggestion?: {
    pathName: string
    remainingCerts: string[]
    estimatedTimeMonths: number
    projectedSalary: number
  }
}

export default function CareerRoadmap({ userId }: { userId?: string }) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'status' | 'renewals' | 'upgrades'>('status')
  const [studyNotes, setStudyNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    fetchRoadmap()
  }, [userId])

  const fetchRoadmap = async () => {
    try {
      const response = await fetch('/api/roadmap', {
        headers: { 'x-user-id': userId || 'mock-user-123' }
      })
      const data = await response.json()
      if (data.success) {
        setRoadmap(data.recommendations)
      }
    } catch (error) {
      console.error('Failed to fetch roadmap:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToPlan = async (certId: string) => {
    // TODO: Implement add to plan functionality
    console.log('Adding to plan:', certId)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      </div>
    )
  }

  // Empty state
  if (!roadmap || (!roadmap.renewals.length && !roadmap.upgrades.length)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-white dark:bg-command-black rounded-lg shadow-lg"
      >
        <Award className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Start Your Career Roadmap
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add a certification to start your personalized career journey
        </p>
        <button
          onClick={() => window.location.href = '/dashboard/certifications'}
          className="px-6 py-3 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
        >
          Add Your First Certification
        </button>
      </motion.div>
    )
  }

  const activeCerts = roadmap.upgrades.length
  const expiringSoon = roadmap.renewals.filter(r => r.urgency === 'medium' || r.urgency === 'high').length
  const expired = roadmap.renewals.filter(r => r.daysUntilExpiry < 0).length

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Your Certification Status
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircle className="text-green-600 dark:text-green-400 mr-2" size={18} />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              Active: {activeCerts}
            </span>
          </div>
          {expiringSoon > 0 && (
            <div className="flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mr-2" size={18} />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Expiring Soon: {expiringSoon}
              </span>
            </div>
          )}
          {expired > 0 && (
            <div className="flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <XCircle className="text-red-600 dark:text-red-400 mr-2" size={18} />
              <span className="text-sm font-medium text-red-800 dark:text-red-300">
                Expired: {expired}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('status')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'status'
              ? 'border-dynamic-green text-dynamic-green'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('renewals')}
          className={`pb-2 px-1 border-b-2 transition-colors flex items-center ${
            activeTab === 'renewals'
              ? 'border-dynamic-green text-dynamic-green'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Next 90 Days
          {roadmap.renewals.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 rounded-full">
              {roadmap.renewals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'upgrades'
              ? 'border-dynamic-green text-dynamic-green'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Recommended Next Steps
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Overview Tab */}
          {activeTab === 'status' && roadmap.careerPathSuggestion && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {roadmap.careerPathSuggestion.pathName}
                  </h3>
                  <p className="opacity-90 mb-4">Your recommended career path</p>
                </div>
                <Target className="opacity-50" size={32} />
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2" size={18} />
                    <span className="text-sm opacity-90">Time to Complete</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {roadmap.careerPathSuggestion.estimatedTimeMonths} months
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <DollarSign className="mr-2" size={18} />
                    <span className="text-sm opacity-90">Projected Salary</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${roadmap.careerPathSuggestion.projectedSalary.toLocaleString()}
                  </p>
                </div>
              </div>

              {roadmap.careerPathSuggestion.remainingCerts.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm opacity-90 mb-3">Certifications needed:</p>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.careerPathSuggestion.remainingCerts.map(cert => (
                      <span key={cert} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {cert.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Renewals Tab */}
          {activeTab === 'renewals' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {roadmap.renewals.length === 0 ? (
                <div className="bg-white dark:bg-command-black rounded-lg p-8 text-center">
                  <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No certifications expiring in the next 90 days
                  </p>
                </div>
              ) : (
                roadmap.renewals.map(renewal => (
                  <div
                    key={renewal.certId}
                    className={`bg-white dark:bg-command-black rounded-lg p-6 border-l-4 shadow-lg ${
                      renewal.urgency === 'high' ? 'border-red-500' :
                      renewal.urgency === 'medium' ? 'border-yellow-500' :
                      'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <AlertCircle
                            className={
                              renewal.urgency === 'high' ? 'text-red-500 mr-2' :
                              renewal.urgency === 'medium' ? 'text-yellow-500 mr-2' :
                              'text-blue-500 mr-2'
                            }
                            size={20}
                          />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {renewal.certName}
                          </h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{renewal.message}</p>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={14} className="mr-1" />
                          Expires: {new Date(renewal.expiryDate).toLocaleDateString()}
                          <span className="ml-3 font-semibold">
                            ({renewal.daysUntilExpiry} days)
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-dynamic-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                        Renew
                        <ExternalLink size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Upgrades Tab */}
          {activeTab === 'upgrades' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {roadmap.upgrades.map(upgrade => (
                <div key={upgrade.currentCertId} className="bg-white dark:bg-command-black rounded-lg p-6 shadow-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Based on your <span className="font-semibold text-gray-900 dark:text-white">{upgrade.currentCertName}</span>:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upgrade.recommendedCerts.map(cert => (
                      <div
                        key={cert.certId}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {cert.name}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock size={14} className="mr-2" />
                            {cert.timeToComplete} months to complete
                          </div>
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <TrendingUp size={14} className="mr-2" />
                            +{cert.salaryBoost}% salary increase
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => addToPlan(cert.certId)}
                            className="flex-1 px-3 py-2 bg-dynamic-green text-white rounded hover:bg-emerald-green transition-colors flex items-center justify-center text-sm"
                          >
                            <Plus size={16} className="mr-1" />
                            Add to Plan
                          </button>
                          {cert.prepResources?.udemy && (
                            <a
                              href={cert.prepResources.udemy}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center text-sm"
                            >
                              <BookOpen size={16} className="mr-1" />
                              Start Prep
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Study Notes */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-lg p-6 sticky top-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Study Notes</h3>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ChevronRight className={`transform transition-transform ${showNotes ? 'rotate-90' : ''}`} size={20} />
              </button>
            </div>

            {showNotes && (
              <div className="space-y-4">
                <textarea
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  placeholder="Track your study progress, goals, and reminders..."
                  className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-dynamic-green focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Save Notes
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-dynamic-blue hover:underline">
                  CompTIA Study Guides
                </a>
                <a href="#" className="block text-sm text-dynamic-blue hover:underline">
                  AWS Training Portal
                </a>
                <a href="#" className="block text-sm text-dynamic-blue hover:underline">
                  Exam Scheduling
                </a>
                <a href="#" className="block text-sm text-dynamic-blue hover:underline">
                  Practice Tests
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}