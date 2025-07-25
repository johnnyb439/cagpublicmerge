'use client'

import { motion } from 'framer-motion'
import { 
  Briefcase, TrendingUp, Calendar, CheckCircle, XCircle,
  Clock, BarChart3, Target
} from 'lucide-react'
import { ApplicationStats as Stats } from '@/types/job-application'

interface ApplicationStatsProps {
  stats: Stats
}

export default function ApplicationStats({ stats }: ApplicationStatsProps) {
  const statCards = [
    {
      label: 'Total Applications',
      value: stats.total,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: null
    },
    {
      label: 'Active Applications',
      value: stats.active,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtext: `${Math.round((stats.active / stats.total) * 100 || 0)}% of total`
    },
    {
      label: 'Interviews Scheduled',
      value: stats.interviews,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtext: 'This month'
    },
    {
      label: 'Offers Received',
      value: stats.offers,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    }
  ]

  const metrics = [
    {
      label: 'Response Rate',
      value: `${Math.round(stats.responseRate)}%`,
      icon: TrendingUp,
      description: 'Applications with responses'
    },
    {
      label: 'Interview Rate',
      value: `${Math.round(stats.interviewConversionRate)}%`,
      icon: Target,
      description: 'Responses to interviews'
    },
    {
      label: 'Avg. Response Time',
      value: `${stats.avgTimeToResponse}d`,
      icon: Clock,
      description: 'Days to first response'
    },
    {
      label: 'Success Rate',
      value: `${Math.round((stats.offers / stats.total) * 100 || 0)}%`,
      icon: BarChart3,
      description: 'Applications to offers'
    }
  ]

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? '↑' : '↓'} 12%
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            {stat.subtext && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stat.subtext}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="text-center">
              <div className="flex justify-center mb-2">
                <metric.icon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Progress Bar for Overall Success */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Application Success
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round((stats.offers / stats.total) * 100 || 0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.offers / stats.total) * 100 || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
            <span>{stats.rejected} rejected</span>
            <span>{stats.active} in progress</span>
            <span>{stats.offers} offers</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}