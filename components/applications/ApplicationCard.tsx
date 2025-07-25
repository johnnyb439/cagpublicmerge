'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase, Calendar, MapPin, DollarSign, Shield, MoreVertical,
  Star, Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail,
  Edit, Trash2, FileText, ExternalLink
} from 'lucide-react'
import { JobApplication, ApplicationStatus } from '@/types/job-application'

interface ApplicationCardProps {
  application: JobApplication
  onUpdate: (id: string, updates: Partial<JobApplication>) => void
  onDelete: (id: string) => void
  onClick: () => void
}

const statusConfig: Record<ApplicationStatus, { icon: any; color: string; bgColor: string }> = {
  applied: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  screening: { icon: AlertCircle, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  interview_scheduled: { icon: Calendar, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  interviewing: { icon: Phone, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  offer_received: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  withdrawn: { icon: XCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  accepted: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
}

export default function ApplicationCard({ application, onUpdate, onDelete, onClick }: ApplicationCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const StatusIcon = statusConfig[application.status].icon

  const daysSinceApplied = Math.floor(
    (new Date().getTime() - new Date(application.dateApplied).getTime()) / (1000 * 60 * 60 * 24)
  )

  const nextInterview = application.interviews.find(i => !i.completed)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdate(application.id, { isFavorite: !application.isFavorite })
  }

  const formatStatus = (status: ApplicationStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 relative overflow-hidden group"
    >
      {/* Favorite indicator */}
      {application.isFavorite && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 transform rotate-45 translate-x-8 -translate-y-8">
          <Star className="w-4 h-4 text-white absolute bottom-2 left-2 transform -rotate-45" fill="currentColor" />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
              {application.jobTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {application.company}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-6 top-14 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle edit
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(application.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[application.status].bgColor} ${statusConfig[application.status].color}`}>
            <StatusIcon className="w-4 h-4" />
            {formatStatus(application.status)}
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            {application.location}
          </div>
          {application.salary && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              {application.salary}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            {application.clearanceRequired} clearance required
          </div>
        </div>

        {/* Next Interview */}
        {nextInterview && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Next Interview: {nextInterview.type.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {new Date(nextInterview.date).toLocaleDateString()} at {nextInterview.time}
            </p>
          </div>
        )}

        {/* Tags */}
        {application.tags && application.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {application.tags.map(tag => (
              <span
                key={tag}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {daysSinceApplied}d ago
            </div>
            {application.interviews.length > 0 && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {application.interviews.length}
              </div>
            )}
          </div>
          
          <button
            onClick={handleToggleFavorite}
            className={`${
              application.isFavorite ? 'text-yellow-500' : 'text-gray-400'
            } hover:text-yellow-500 transition-colors`}
          >
            <Star className="w-5 h-5" fill={application.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pt-8 pb-4 px-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            {application.contactEmail && (
              <a
                href={`mailto:${application.contactEmail}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-3 h-3" />
                Email
              </a>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}