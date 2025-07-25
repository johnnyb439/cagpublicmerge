'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, Calendar, Filter, Search, Star, MoreVertical,
  Plus, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
  FileText, Phone, Mail, User, Tag, Download, Eye
} from 'lucide-react'
import Link from 'next/link'
import { JobApplication, ApplicationStatus, ApplicationStats } from '@/types/job-application'
import ApplicationCard from '@/components/applications/ApplicationCard'
import ApplicationFilters from '@/components/applications/ApplicationFilters'
import ApplicationStatsComponent from '@/components/applications/ApplicationStats'
import ApplicationTimeline from '@/components/applications/ApplicationTimeline'
import AddApplicationModal from '@/components/applications/AddApplicationModal'

// Mock data - replace with actual API calls
const mockApplications: JobApplication[] = [
  {
    id: '1',
    jobId: 'job1',
    jobTitle: 'Senior Software Engineer',
    company: 'Lockheed Martin',
    location: 'Fort Meade, MD',
    salary: '$140,000 - $180,000',
    clearanceRequired: 'TS/SCI',
    dateApplied: '2024-01-15',
    status: 'interview_scheduled',
    notes: 'Great match for my skills. Emphasized cloud experience.',
    contactPerson: 'Sarah Johnson',
    contactEmail: 'sarah.johnson@lm.com',
    resumeVersion: 'v3_cloud_focused',
    coverLetter: true,
    referral: 'John Smith (former colleague)',
    interviews: [
      {
        id: '1',
        type: 'phone_screen',
        date: '2024-01-22',
        time: '2:00 PM EST',
        completed: true,
        outcome: 'passed',
        notes: 'Went well, discussed AWS experience'
      },
      {
        id: '2',
        type: 'technical',
        date: '2024-01-29',
        time: '10:00 AM EST',
        completed: false,
        interviewers: ['Mike Chen', 'Lisa Park']
      }
    ],
    documents: [],
    timeline: [
      { date: '2024-01-15', event: 'Application Submitted' },
      { date: '2024-01-18', event: 'Application Viewed' },
      { date: '2024-01-20', event: 'Phone Screen Scheduled' },
      { date: '2024-01-22', event: 'Phone Screen Completed', description: 'Positive feedback' }
    ],
    tags: ['cloud', 'aws', 'high-priority'],
    isFavorite: true,
    lastUpdated: '2024-01-22'
  },
  {
    id: '2',
    jobId: 'job2',
    jobTitle: 'DevOps Engineer',
    company: 'Raytheon',
    location: 'Arlington, VA',
    salary: '$130,000 - $160,000',
    clearanceRequired: 'Secret',
    dateApplied: '2024-01-10',
    status: 'applied',
    notes: 'Kubernetes experience is a plus',
    documents: [],
    interviews: [],
    timeline: [
      { date: '2024-01-10', event: 'Application Submitted' }
    ],
    tags: ['devops', 'kubernetes'],
    lastUpdated: '2024-01-10'
  }
]

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-800',
  screening: 'bg-purple-100 text-purple-800',
  interview_scheduled: 'bg-yellow-100 text-yellow-800',
  interviewing: 'bg-orange-100 text-orange-800',
  offer_received: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
  accepted: 'bg-emerald-100 text-emerald-800'
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')

  // Calculate stats
  const stats: ApplicationStats = useMemo(() => {
    const total = applications.length
    const active = applications.filter(a => 
      ['applied', 'screening', 'interview_scheduled', 'interviewing'].includes(a.status)
    ).length
    const interviews = applications.filter(a => 
      ['interview_scheduled', 'interviewing'].includes(a.status)
    ).length
    const offers = applications.filter(a => a.status === 'offer_received').length
    const rejected = applications.filter(a => a.status === 'rejected').length
    
    const withResponse = applications.filter(a => a.status !== 'applied').length
    const responseRate = total > 0 ? (withResponse / total) * 100 : 0
    
    const interviewCount = applications.filter(a => 
      ['interview_scheduled', 'interviewing', 'offer_received', 'accepted'].includes(a.status)
    ).length
    const interviewConversionRate = withResponse > 0 ? (interviewCount / withResponse) * 100 : 0

    return {
      total,
      active,
      interviews,
      offers,
      rejected,
      responseRate,
      avgTimeToResponse: 7, // Mock data
      interviewConversionRate
    }
  }, [applications])

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = selectedStatuses.length === 0 || 
        selectedStatuses.includes(app.status)
      
      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, selectedStatuses])

  const handleAddApplication = (newApp: Partial<JobApplication>) => {
    const app: JobApplication = {
      id: Date.now().toString(),
      jobId: newApp.jobId || '',
      jobTitle: newApp.jobTitle || '',
      company: newApp.company || '',
      location: newApp.location || '',
      clearanceRequired: newApp.clearanceRequired || '',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'applied',
      interviews: [],
      documents: [],
      timeline: [
        { date: new Date().toISOString().split('T')[0], event: 'Application Submitted' }
      ],
      lastUpdated: new Date().toISOString().split('T')[0],
      ...newApp
    }
    setApplications([app, ...applications])
    setShowAddModal(false)
  }

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : app
    ))
  }

  const deleteApplication = (id: string) => {
    setApplications(applications.filter(app => app.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Applications Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your job applications in one place
          </p>
        </div>

        {/* Stats Overview */}
        <ApplicationStatsComponent stats={stats} />

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filters */}
            <ApplicationFilters
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
            />

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Timeline
              </button>
            </div>

            {/* Add Application Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Application
            </button>
          </div>
        </div>

        {/* Applications View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredApplications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ApplicationCard
                    application={application}
                    onUpdate={updateApplication}
                    onDelete={deleteApplication}
                    onClick={() => setSelectedApplication(application)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <ApplicationTimeline
            applications={filteredApplications}
            onSelectApplication={setSelectedApplication}
          />
        )}

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedStatuses.length > 0
                ? 'Try adjusting your filters'
                : 'Start tracking your job applications'}
            </p>
            {!searchQuery && selectedStatuses.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Application
              </button>
            )}
          </div>
        )}

        {/* Add Application Modal */}
        <AnimatePresence>
          {showAddModal && (
            <AddApplicationModal
              onClose={() => setShowAddModal(false)}
              onAdd={handleAddApplication}
            />
          )}
        </AnimatePresence>

        {/* Application Detail Modal */}
        <AnimatePresence>
          {selectedApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedApplication(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Application details would go here */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{selectedApplication.jobTitle}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedApplication.company}</p>
                  {/* Add more details */}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}