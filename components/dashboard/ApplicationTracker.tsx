'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, Calendar, Clock, CheckCircle, XCircle, 
  AlertCircle, FileText, Phone, Mail, ExternalLink,
  TrendingUp, Archive
} from 'lucide-react'
import Link from 'next/link'
import { secureStorage } from '@/lib/security/secureStorage'

export interface Application {
  id: string
  jobTitle: string
  company: string
  location: string
  appliedDate: string
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  lastUpdate: string
  notes?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  jobUrl?: string
  salary?: string
  nextSteps?: string
  interviews?: Interview[]
}

interface Interview {
  id: string
  date: string
  type: 'phone' | 'video' | 'onsite'
  interviewer?: string
  notes?: string
  completed: boolean
}

const statusConfig = {
  applied: { color: 'bg-blue-500', icon: FileText, label: 'Applied' },
  screening: { color: 'bg-yellow-500', icon: Clock, label: 'Screening' },
  interview: { color: 'bg-purple-500', icon: Phone, label: 'Interview' },
  offer: { color: 'bg-green-500', icon: CheckCircle, label: 'Offer' },
  rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
  withdrawn: { color: 'bg-gray-500', icon: Archive, label: 'Withdrawn' }
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const saved = await secureStorage.getItem('jobApplications') || []
      setApplications(saved)
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    try {
      const updated = applications.map(app =>
        app.id === id ? { ...app, ...updates, lastUpdate: new Date().toISOString() } : app
      )
      setApplications(updated)
      await secureStorage.setItem('jobApplications', updated, true)
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    
    try {
      const updated = applications.filter(app => app.id !== id)
      setApplications(updated)
      await secureStorage.setItem('jobApplications', updated, true)
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter)

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['applied', 'screening', 'interview'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Briefcase className="text-sky-blue" size={32} />
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
            <TrendingUp className="text-neon-green" size={32} />
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Interviews</p>
              <p className="text-2xl font-bold text-white">{stats.interviews}</p>
            </div>
            <Phone className="text-purple-500" size={32} />
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Offers</p>
              <p className="text-2xl font-bold text-white">{stats.offers}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all' ? 'bg-sky-blue text-white' : 'glass-card hover:bg-gray-700'
          }`}
        >
          All ({applications.length})
        </button>
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = applications.filter(a => a.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filter === status ? 'bg-sky-blue text-white' : 'glass-card hover:bg-gray-700'
              }`}
            >
              <config.icon size={16} />
              {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-lg">
            <Briefcase className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-400">No applications found</p>
            <Link href="/jobs" className="text-sky-blue hover:text-sky-blue/80 mt-2 inline-block">
              Browse Jobs →
            </Link>
          </div>
        ) : (
          filteredApplications.map((application) => {
            const status = statusConfig[application.status]
            const isExpanded = expandedId === application.id
            
            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-lg overflow-hidden"
              >
                {/* Main Content */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : application.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {application.jobTitle}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-2">{application.company} • {application.location}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Applied {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Updated {new Date(application.lastUpdate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      {application.jobUrl && (
                        <a
                          href={application.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-700 p-6 space-y-4"
                  >
                    {/* Contact Information */}
                    {(application.contactName || application.contactEmail || application.contactPhone) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Contact Information</h4>
                        <div className="space-y-1">
                          {application.contactName && (
                            <p className="text-white">{application.contactName}</p>
                          )}
                          {application.contactEmail && (
                            <a href={`mailto:${application.contactEmail}`} className="text-sky-blue hover:text-sky-blue/80 flex items-center gap-2">
                              <Mail size={14} />
                              {application.contactEmail}
                            </a>
                          )}
                          {application.contactPhone && (
                            <a href={`tel:${application.contactPhone}`} className="text-sky-blue hover:text-sky-blue/80 flex items-center gap-2">
                              <Phone size={14} />
                              {application.contactPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Notes</h4>
                      <textarea
                        value={application.notes || ''}
                        onChange={(e) => updateApplication(application.id, { notes: e.target.value })}
                        placeholder="Add notes about this application..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-blue"
                        rows={3}
                      />
                    </div>

                    {/* Status Update */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Update Status</h4>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(statusConfig).map(([statusKey, config]) => (
                          <button
                            key={statusKey}
                            onClick={() => updateApplication(application.id, { status: statusKey as any })}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              application.status === statusKey
                                ? `${config.color} text-white`
                                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            }`}
                          >
                            {config.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => deleteApplication(application.id)}
                        className="px-4 py-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })
        )}
      </div>

      {/* Add New Application */}
      <div className="text-center">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors"
        >
          <Briefcase size={20} />
          Track New Application
        </Link>
      </div>
    </div>
  )
}