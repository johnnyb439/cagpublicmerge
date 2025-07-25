'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  Award,
  FileText,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface TimelineItem {
  id: string
  type: 'application' | 'interview' | 'certification' | 'profile' | 'goal' | 'achievement'
  title: string
  description?: string
  timestamp: string
  status?: 'completed' | 'pending' | 'upcoming'
  icon: any
  color: string
}

const timelineData: TimelineItem[] = [
  {
    id: '1',
    type: 'application',
    title: 'Applied to Network Administrator at TechCorp',
    description: 'Application submitted and under review',
    timestamp: '2 hours ago',
    status: 'pending',
    icon: Briefcase,
    color: 'text-dynamic-blue'
  },
  {
    id: '2',
    type: 'interview',
    title: 'Completed mock interview for Systems Admin',
    description: 'Score: 85/100 - Great performance!',
    timestamp: '1 day ago',
    status: 'completed',
    icon: Target,
    color: 'text-dynamic-green'
  },
  {
    id: '3',
    type: 'goal',
    title: 'Goal Achieved: Complete 5 Mock Interviews',
    description: 'You\'ve improved your interview skills significantly',
    timestamp: '2 days ago',
    status: 'completed',
    icon: CheckCircle,
    color: 'text-emerald-green'
  },
  {
    id: '4',
    type: 'certification',
    title: 'Added Security+ certification',
    description: 'Certification verified and added to profile',
    timestamp: '3 days ago',
    status: 'completed',
    icon: Award,
    color: 'text-sky-blue'
  },
  {
    id: '5',
    type: 'interview',
    title: 'Interview scheduled with Federal Systems Inc.',
    description: 'Virtual interview on March 20, 2025 at 2:00 PM EST',
    timestamp: 'In 5 days',
    status: 'upcoming',
    icon: Calendar,
    color: 'text-dynamic-blue'
  },
  {
    id: '6',
    type: 'profile',
    title: 'Updated resume with military translations',
    timestamp: '1 week ago',
    status: 'completed',
    icon: FileText,
    color: 'text-gray-600'
  },
  {
    id: '7',
    type: 'application',
    title: 'Application viewed by HR at CloudGov Solutions',
    description: 'Your profile was viewed 3 times',
    timestamp: '1 week ago',
    status: 'pending',
    icon: AlertCircle,
    color: 'text-dynamic-blue'
  }
]

export default function ActivityTimeline() {
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
          {timelineData.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
          })}
        </div>
      </div>
    </motion.div>
  )
}