'use client'

import { motion } from 'framer-motion'
import { 
  Briefcase, Calendar, MapPin, DollarSign, Shield, 
  CheckCircle, XCircle, Clock, Phone, AlertCircle
} from 'lucide-react'
import { JobApplication, ApplicationStatus } from '@/types/job-application'

interface ApplicationTimelineProps {
  applications: JobApplication[]
  onSelectApplication: (app: JobApplication) => void
}

const statusIcons: Record<ApplicationStatus, any> = {
  applied: Clock,
  screening: AlertCircle,
  interview_scheduled: Calendar,
  interviewing: Phone,
  offer_received: CheckCircle,
  rejected: XCircle,
  withdrawn: XCircle,
  accepted: CheckCircle
}

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-500',
  screening: 'bg-purple-500',
  interview_scheduled: 'bg-yellow-500',
  interviewing: 'bg-orange-500',
  offer_received: 'bg-green-500',
  rejected: 'bg-red-500',
  withdrawn: 'bg-gray-500',
  accepted: 'bg-emerald-500'
}

export default function ApplicationTimeline({ applications, onSelectApplication }: ApplicationTimelineProps) {
  // Sort applications by date, most recent first
  const sortedApplications = [...applications].sort(
    (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
  )

  // Group applications by month
  const groupedApplications = sortedApplications.reduce((groups, app) => {
    const date = new Date(app.dateApplied)
    const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    
    if (!groups[monthYear]) {
      groups[monthYear] = []
    }
    groups[monthYear].push(app)
    
    return groups
  }, {} as Record<string, JobApplication[]>)

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>

      {/* Timeline content */}
      <div className="space-y-8">
        {Object.entries(groupedApplications).map(([monthYear, apps], groupIndex) => (
          <div key={monthYear}>
            {/* Month header */}
            <div className="flex items-center mb-4">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border-2 border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {monthYear}
              </div>
            </div>

            {/* Applications for this month */}
            <div className="space-y-4 ml-16">
              {apps.map((app, index) => {
                const StatusIcon = statusIcons[app.status]
                const isLastInGroup = index === apps.length - 1
                
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute -left-[52px] w-8 h-8 rounded-full ${statusColors[app.status]} flex items-center justify-center`}>
                      <StatusIcon className="w-4 h-4 text-white" />
                    </div>

                    {/* Connecting line to next item */}
                    {!isLastInGroup && (
                      <div className="absolute -left-[44px] top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                    )}

                    {/* Application card */}
                    <div
                      onClick={() => onSelectApplication(app)}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {app.jobTitle}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {app.company}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(app.dateApplied).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          {app.clearanceRequired}
                        </div>
                        {app.salary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {app.salary}
                          </div>
                        )}
                      </div>

                      {/* Next interview indicator */}
                      {app.interviews.some(i => !i.completed) && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                          <Calendar className="w-4 h-4" />
                          Interview: {app.interviews.find(i => !i.completed)?.date}
                        </div>
                      )}

                      {/* Tags */}
                      {app.tags && app.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {app.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start tracking your job applications to see them here
          </p>
        </div>
      )}
    </div>
  )
}