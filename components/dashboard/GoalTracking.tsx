'use client'

import { motion } from 'framer-motion'
import {
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Calendar,
  Plus
} from 'lucide-react'
import { useState } from 'react'

interface Goal {
  id: string
  title: string
  description: string
  category: 'career' | 'skills' | 'applications' | 'interviews'
  progress: number
  target: number
  deadline: string
  status: 'active' | 'completed' | 'paused'
  priority: 'high' | 'medium' | 'low'
}

const goals: Goal[] = [
  {
    id: '1',
    title: 'Complete 10 Job Applications',
    description: 'Apply to federal positions matching my clearance level',
    category: 'applications',
    progress: 8,
    target: 10,
    deadline: '2025-03-31',
    status: 'active',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Earn AWS Cloud Certification',
    description: 'Complete AWS Solutions Architect Associate certification',
    category: 'skills',
    progress: 3,
    target: 5,
    deadline: '2025-04-15',
    status: 'active',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Practice 5 Mock Interviews',
    description: 'Complete mock interviews to improve interview skills',
    category: 'interviews',
    progress: 5,
    target: 5,
    deadline: '2025-03-15',
    status: 'completed',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Update LinkedIn Profile',
    description: 'Optimize LinkedIn profile with military-to-civilian keywords',
    category: 'career',
    progress: 2,
    target: 3,
    deadline: '2025-03-20',
    status: 'active',
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Network with 15 Professionals',
    description: 'Connect with federal contractors and hiring managers',
    category: 'career',
    progress: 7,
    target: 15,
    deadline: '2025-04-30',
    status: 'active',
    priority: 'low'
  }
]

const categoryColors = {
  career: 'text-dynamic-green bg-green-100 dark:bg-green-900',
  skills: 'text-dynamic-blue bg-blue-100 dark:bg-blue-900',
  applications: 'text-emerald-green bg-emerald-100 dark:bg-emerald-900',
  interviews: 'text-sky-blue bg-sky-100 dark:bg-sky-900'
}

const priorityColors = {
  high: 'border-red-400 bg-red-50 dark:bg-red-900/20',
  medium: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-green-400 bg-green-50 dark:bg-green-900/20'
}

export default function GoalTracking() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory)

  const completedGoals = goals.filter(goal => goal.status === 'completed').length
  const totalGoals = goals.length
  const overallProgress = Math.round((completedGoals / totalGoals) * 100)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-montserrat font-bold">Goal Progress</h3>
          <button className="flex items-center text-dynamic-green hover:text-emerald-green transition-colors">
            <Plus size={16} className="mr-1" />
            Add Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-dynamic-green">{completedGoals}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-dynamic-blue">{totalGoals - completedGoals}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-emerald-green">{overallProgress}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'career', 'skills', 'applications', 'interviews'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-dynamic-green text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`border-l-4 rounded-lg p-6 bg-white dark:bg-command-black shadow-md ${
              priorityColors[goal.priority]
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {goal.status === 'completed' ? (
                    <CheckCircle2 className="text-dynamic-green mr-2" size={20} />
                  ) : (
                    <Circle className="text-gray-400 mr-2" size={20} />
                  )}
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {goal.title}
                  </h4>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    categoryColors[goal.category]
                  }`}>
                    {goal.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {goal.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold">
                  {goal.progress}/{goal.target}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round((goal.progress / goal.target) * 100)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    goal.status === 'completed' ? 'bg-dynamic-green' : 'bg-dynamic-blue'
                  }`}
                  style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Deadline and Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar size={14} className="mr-1" />
                Due: {new Date(goal.deadline).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                {goal.status === 'completed' && (
                  <span className="flex items-center text-dynamic-green">
                    <Award size={14} className="mr-1" />
                    Completed
                  </span>
                )}
                {goal.status === 'active' && (
                  <span className="flex items-center text-dynamic-blue">
                    <TrendingUp size={14} className="mr-1" />
                    In Progress
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}