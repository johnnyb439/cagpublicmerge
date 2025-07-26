'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Award,
  FileText,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  TrendingUp,
  MessageSquare,
  XCircle
} from 'lucide-react'

interface TimelineItem {
  id: string
  type: 'application' | 'interview' | 'certification' | 'profile' | 'goal' | 'achievement' | 'offer' | 'rejection'
  title: string
  description?: string
  timestamp: string
  date: string
  status?: 'completed' | 'pending' | 'upcoming'
  icon: any
  color: string
}

export default function ActivityTimeline() {
  const [activities, setActivities] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      // Fetch data from multiple sources
      const [analyticsRes, applicationsRes] = await Promise.all([
        fetch('/api/dashboard/analytics?userId=1&period=30d'),
        fetch('/api/applications?userId=1')
      ])

      const analyticsData = await analyticsRes.json()
      const applicationsData = await applicationsRes.json()

      if (analyticsData.success && applicationsData.success) {
        // Combine and transform activities
        const combinedActivities = transformActivities(analyticsData.data, applicationsData.data)
        setActivities(combinedActivities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const transformActivities = (analytics: any, applications: any[]): TimelineItem[] => {
    const activities: TimelineItem[] = []

    // Transform application activities
    applications.forEach(app => {
      // Application submitted
      activities.push({
        id: `app-${app.id}`,
        type: 'application',
        title: `Applied to ${app.jobTitle} at ${app.company}`,
        description: app.location,
        timestamp: getRelativeTime(app.dateApplied),
        date: app.dateApplied,
        status: 'completed',
        icon: Briefcase,
        color: 'text-dynamic-blue'
      })

      // Interview scheduled
      app.interviews?.forEach((interview: any) => {
        if (!interview.completed) {
          activities.push({
            id: `interview-${interview.id}`,
            type: 'interview',
            title: `Interview scheduled with ${app.company}`,
            description: `${interview.type.replace(/_/g, ' ')} on ${interview.date} at ${interview.time}`,
            timestamp: getRelativeTime(interview.date),
            date: interview.date,
            status: 'upcoming',
            icon: Calendar,
            color: 'text-dynamic-blue'
          })
        } else {
          activities.push({
            id: `interview-${interview.id}`,
            type: 'interview',
            title: `Completed ${interview.type.replace(/_/g, ' ')} with ${app.company}`,
            description: interview.outcome === 'passed' ? 'Positive feedback received' : 'Interview completed',
            timestamp: getRelativeTime(interview.date),
            date: interview.date,
            status: 'completed',
            icon: interview.outcome === 'passed' ? CheckCircle : Target,
            color: interview.outcome === 'passed' ? 'text-dynamic-green' : 'text-gray-600'
          })
        }
      })

      // Status changes
      if (app.status === 'offer_received') {
        activities.push({
          id: `offer-${app.id}`,
          type: 'offer',
          title: `Received offer from ${app.company}`,
          description: app.salary || 'Congratulations!',
          timestamp: getRelativeTime(app.lastUpdated),
          date: app.lastUpdated,
          status: 'completed',
          icon: TrendingUp,
          color: 'text-emerald-green'
        })
      } else if (app.status === 'rejected') {
        activities.push({
          id: `rejection-${app.id}`,
          type: 'rejection',
          title: `Application update from ${app.company}`,
          description: 'Position filled or requirements not met',
          timestamp: getRelativeTime(app.lastUpdated),
          date: app.lastUpdated,
          status: 'completed',
          icon: XCircle,
          color: 'text-red-500'
        })
      }

      // Timeline events
      app.timeline?.forEach((event: any, index: number) => {
        if (index > 0 && !activities.find(a => a.title.includes(event.event))) {
          activities.push({
            id: `timeline-${app.id}-${index}`,
            type: 'application',
            title: event.event,
            description: event.description,
            timestamp: getRelativeTime(event.date),
            date: event.date,
            status: 'completed',
            icon: AlertCircle,
            color: 'text-sky-blue'
          })
        }
      })
    })

    // Add mock certification and goal activities from analytics
    if (analytics.activity) {
      analytics.activity.forEach((activity: any) => {
        const iconMap: Record<string, any> = {
          certification: Award,
          profile: FileText,
          goal: CheckCircle,
          achievement: TrendingUp
        }

        activities.push({
          id: `analytics-${activity.date}-${activity.type}`,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: getRelativeTime(activity.date),
          date: activity.date,
          status: 'completed',
          icon: iconMap[activity.type] || MessageSquare,
          color: getActivityColor(activity.type)
        })
      })
    }

    // Sort by date descending
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20)
  }

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (date > now) {
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Tomorrow'
      if (diffDays < 7) return `In ${diffDays} days`
      return `In ${Math.ceil(diffDays / 7)} weeks`
    } else {
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return `${Math.ceil(diffDays / 30)} months ago`
    }
  }

  const getActivityColor = (type: string): string => {
    const colors: Record<string, string> = {
      application: 'text-dynamic-blue',
      interview: 'text-sky-blue',
      certification: 'text-emerald-green',
      profile: 'text-gray-600',
      goal: 'text-dynamic-green',
      achievement: 'text-yellow-500',
      offer: 'text-emerald-green',
      rejection: 'text-red-500'
    }
    return colors[type] || 'text-gray-600'
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-montserrat font-bold">Activity Timeline</h3>
        <button className="text-sm text-dynamic-green hover:text-emerald-green transition-colors">
          View All
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent activity. Start applying to jobs to see your timeline!
            </div>
          ) : (
            activities.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                  className="relative flex items-start"
                >
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-command-black border-2 ${
                    item.status === 'completed' ? 'border-dynamic-green' : 
                    item.status === 'upcoming' ? 'border-dynamic-blue' : 
                    'border-gray-300'
                  }`}>
                    <Icon size={20} className={item.color} />
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.status && (
                        <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          item.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock size={14} className="mr-1" />
                      {item.timestamp}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </motion.div>
  )
}