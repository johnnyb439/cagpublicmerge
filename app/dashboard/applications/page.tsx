'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Briefcase, Calendar, Clock, MapPin, Building,
  DollarSign, CheckCircle, XCircle, AlertCircle, Filter,
  Search, TrendingUp, FileText, Eye, Trash2, Plus,
  BarChart2, PieChart, Activity, Target, Shield
} from 'lucide-react'

interface Application {
  id: string
  jobTitle: string
  company: string
  location: string
  salary: string
  appliedDate: string
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  lastUpdate: string
  clearanceRequired: string
  notes: string
  nextStep?: string
  interviewDate?: string
}

const mockApplications: Application[] = [
  {
    id: '1',
    jobTitle: 'Senior Network Administrator',
    company: 'Lockheed Martin',
    location: 'Arlington, VA',
    salary: '$110,000 - $130,000',
    appliedDate: '2025-07-28',
    status: 'interview',
    lastUpdate: '2 hours ago',
    clearanceRequired: 'Secret',
    notes: 'Phone screen scheduled',
    interviewDate: '2025-08-05',
    nextStep: 'Technical phone screen with hiring manager'
  },
  {
    id: '2',
    jobTitle: 'Cloud Security Engineer',
    company: 'AWS Federal',
    location: 'Herndon, VA',
    salary: '$130,000 - $160,000',
    appliedDate: '2025-07-25',
    status: 'screening',
    lastUpdate: '1 day ago',
    clearanceRequired: 'TS/SCI',
    notes: 'Application under review'
  },
  {
    id: '3',
    jobTitle: 'DevOps Engineer',
    company: 'Booz Allen Hamilton',
    location: 'McLean, VA',
    salary: '$120,000 - $140,000',
    appliedDate: '2025-07-20',
    status: 'offer',
    lastUpdate: '3 days ago',
    clearanceRequired: 'Secret',
    notes: 'Offer received!',
    nextStep: 'Review offer package'
  },
  {
    id: '4',
    jobTitle: 'Systems Administrator',
    company: 'CACI',
    location: 'Chantilly, VA',
    salary: '$95,000 - $115,000',
    appliedDate: '2025-07-15',
    status: 'rejected',
    lastUpdate: '1 week ago',
    clearanceRequired: 'Secret',
    notes: 'Position filled'
  },
  {
    id: '5',
    jobTitle: 'Network Security Analyst',
    company: 'Raytheon',
    location: 'Sterling, VA',
    salary: '$105,000 - $125,000',
    appliedDate: '2025-07-18',
    status: 'applied',
    lastUpdate: '5 days ago',
    clearanceRequired: 'Top Secret',
    notes: 'Waiting for response'
  }
]

const statusColors = {
  applied: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: Clock },
  screening: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: Eye },
  interview: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', icon: Calendar },
  offer: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: XCircle },
  withdrawn: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', icon: AlertCircle }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(mockApplications)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['applied', 'screening', 'interview'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length,
    responseRate: Math.round((applications.filter(a => a.status !== 'applied').length / applications.length) * 100)
  }

  const statusCounts = {
    applied: applications.filter(a => a.status === 'applied').length,
    screening: applications.filter(a => a.status === 'screening').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-dynamic-green transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">
                Job Applications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track and manage your job applications
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-6 py-3 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Add Application
            </button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="text-gray-500" size={24} />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="text-dynamic-green" size={24} />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-purple-500" size={24} />
              <span className="text-sm text-gray-500">Scheduled</span>
            </div>
            <p className="text-2xl font-bold">{stats.interviews}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Interviews</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="text-green-500" size={24} />
              <span className="text-sm text-gray-500">Success</span>
            </div>
            <p className="text-2xl font-bold">{stats.offers}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Offers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-dynamic-blue" size={24} />
              <span className="text-sm text-gray-500">Rate</span>
            </div>
            <p className="text-2xl font-bold">{stats.responseRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Pipeline View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Application Pipeline</h2>
          <div className="flex justify-between items-center">
            {Object.entries(statusCounts).map(([status, count], index) => (
              <div key={status} className="flex-1 text-center">
                <div className={`p-3 rounded-lg ${statusColors[status as keyof typeof statusColors].bg} mb-2`}>
                  <p className={`text-2xl font-bold ${statusColors[status as keyof typeof statusColors].text}`}>
                    {count}
                  </p>
                </div>
                <p className="text-sm capitalize text-gray-600 dark:text-gray-400">{status}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((app, index) => {
            const StatusIcon = statusColors[app.status].icon
            
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${statusColors[app.status].bg}`}>
                          <StatusIcon size={24} className={statusColors[app.status].text} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {app.jobTitle}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <Building size={16} className="mr-1" />
                              {app.company}
                            </span>
                            <span className="flex items-center">
                              <MapPin size={16} className="mr-1" />
                              {app.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign size={16} className="mr-1" />
                              {app.salary}
                            </span>
                            <span className="flex items-center">
                              <Shield size={16} className="mr-1" />
                              {app.clearanceRequired}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status].bg} ${statusColors[app.status].text}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Eye size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Applied: {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        Updated: {app.lastUpdate}
                      </span>
                    </div>
                  </div>

                  {app.nextStep && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-400">Next Step:</span>{' '}
                        <span className="text-blue-600 dark:text-blue-300">{app.nextStep}</span>
                      </p>
                      {app.interviewDate && (
                        <p className="text-sm mt-1 text-blue-600 dark:text-blue-300">
                          Scheduled: {new Date(app.interviewDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {app.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Notes:</span> {app.notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}