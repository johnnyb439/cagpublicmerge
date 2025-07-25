'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  BookOpen,
  Users,
  Target,
  Star,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  Award,
  Calendar,
  Clock,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface Recommendation {
  id: string
  type: 'job' | 'skill' | 'networking' | 'certification' | 'resource' | 'action'
  title: string
  description: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionText?: string
  metadata?: {
    match?: string
    deadline?: string
    difficulty?: string
    timeEstimate?: string
  }
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    type: 'job',
    title: 'Cloud Security Engineer at Federal Systems',
    description: 'Perfect match for your Security+ certification and network admin experience',
    reason: 'Based on your skills and clearance level',
    priority: 'high',
    actionUrl: '/jobs',
    actionText: 'View Job',
    metadata: {
      match: '94%',
      deadline: '5 days left'
    }
  },
  {
    id: '2',
    type: 'skill',
    title: 'Learn Kubernetes Fundamentals',
    description: 'Container orchestration is in high demand for federal cloud positions',
    reason: 'Missing from your skill set, requested in 73% of matched jobs',
    priority: 'high',
    actionUrl: '/resources',
    actionText: 'Start Learning',
    metadata: {
      difficulty: 'Intermediate',
      timeEstimate: '2-3 weeks'
    }
  },
  {
    id: '3',
    type: 'certification',
    title: 'AWS Solutions Architect Associate',
    description: 'Boost your cloud credentials with this industry-standard certification',
    reason: 'Complements your current skill set and clearance',
    priority: 'medium',
    actionUrl: 'https://aws.amazon.com/certification/',
    actionText: 'Learn More',
    metadata: {
      difficulty: 'Intermediate',
      timeEstimate: '6-8 weeks'
    }
  },
  {
    id: '4',
    type: 'networking',
    title: 'Federal Cloud Computing Meetup',
    description: 'Connect with hiring managers from top federal contractors',
    reason: 'Based on your career goals and location',
    priority: 'medium',
    actionUrl: '#',
    actionText: 'RSVP',
    metadata: {
      deadline: 'March 25, 2025'
    }
  },
  {
    id: '5',
    type: 'action',
    title: 'Update Your LinkedIn Headline',
    description: 'Add "Security Clearance" and "Cloud Computing" keywords',
    reason: 'Your profile views are 40% below industry average',
    priority: 'high',
    actionText: 'Quick Fix',
    metadata: {
      timeEstimate: '5 minutes'
    }
  },
  {
    id: '6',
    type: 'resource',
    title: 'Federal Resume Writing Guide',
    description: 'Learn how to translate military experience for federal positions',
    reason: 'Your application-to-interview ratio could improve',
    priority: 'medium',
    actionUrl: '/resources',
    actionText: 'Download Guide',
    metadata: {
      timeEstimate: '30 minutes read'
    }
  }
]

const typeIcons = {
  job: Briefcase,
  skill: BookOpen,
  networking: Users,
  certification: Award,
  resource: BookOpen,
  action: Target
}

const typeColors = {
  job: 'text-dynamic-green bg-green-100 dark:bg-green-900',
  skill: 'text-dynamic-blue bg-blue-100 dark:bg-blue-900',
  networking: 'text-emerald-green bg-emerald-100 dark:bg-emerald-900',
  certification: 'text-sky-blue bg-sky-100 dark:bg-sky-900',
  resource: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
  action: 'text-orange-600 bg-orange-100 dark:bg-orange-900'
}

const priorityIndicators = {
  high: 'border-red-400 bg-red-50 dark:bg-red-900/20',
  medium: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-green-400 bg-green-50 dark:bg-green-900/20'
}

export default function PersonalizedRecommendations() {
  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-lg p-6 text-white"
      >
        <div className="flex items-center mb-4">
          <Lightbulb size={24} className="mr-3" />
          <h3 className="text-lg font-montserrat font-bold">
            Personalized Recommendations
          </h3>
        </div>
        <p className="text-sm opacity-90 mb-2">
          AI-powered suggestions to accelerate your federal career
        </p>
        <div className="flex items-center text-sm">
          <Star className="mr-1" size={16} />
          {highPriorityCount} high-priority actions available
        </div>
      </motion.div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = typeIcons[rec.type]
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`border-l-4 rounded-lg p-6 bg-white dark:bg-command-black shadow-md ${
                priorityIndicators[rec.priority]
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start flex-1">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`p-2 rounded-lg ${typeColors[rec.type]}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {rec.title}
                      </h4>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {rec.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      💡 {rec.reason}
                    </p>

                    {/* Metadata */}
                    {rec.metadata && (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {rec.metadata.match && (
                          <div className="flex items-center">
                            <TrendingUp size={14} className="mr-1" />
                            {rec.metadata.match} match
                          </div>
                        )}
                        {rec.metadata.deadline && (
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {rec.metadata.deadline}
                          </div>
                        )}
                        {rec.metadata.difficulty && (
                          <div className="flex items-center">
                            <Target size={14} className="mr-1" />
                            {rec.metadata.difficulty}
                          </div>
                        )}
                        {rec.metadata.timeEstimate && (
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {rec.metadata.timeEstimate}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {rec.actionText && (
                <div className="flex justify-end">
                  {rec.actionUrl ? (
                    rec.actionUrl.startsWith('http') ? (
                      <a
                        href={rec.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-dynamic-green hover:bg-emerald-green rounded-lg transition-colors"
                      >
                        {rec.actionText}
                        <ExternalLink size={14} className="ml-2" />
                      </a>
                    ) : (
                      <Link
                        href={rec.actionUrl}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-dynamic-green hover:bg-emerald-green rounded-lg transition-colors"
                      >
                        {rec.actionText}
                        <ChevronRight size={14} className="ml-2" />
                      </Link>
                    )
                  ) : (
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-dynamic-green hover:bg-emerald-green rounded-lg transition-colors">
                      {rec.actionText}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}