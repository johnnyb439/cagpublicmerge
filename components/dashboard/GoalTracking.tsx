'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target, Trophy, TrendingUp, Calendar, CheckCircle2, Circle,
  Clock, Zap, Award, Briefcase, BookOpen, Users, Plus, Edit2, Trash2
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  targetValue: number
  currentValue: number
  deadline: string
  status: 'active' | 'completed' | 'paused'
  priority: 'high' | 'medium' | 'low'
  milestones: {
    id: string
    title: string
    completed: boolean
    date?: string
  }[]
}

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete 10 Mock Interviews',
    description: 'Practice interviewing skills to improve confidence and performance',
    category: 'interview',
    targetValue: 10,
    currentValue: 5,
    deadline: '2025-08-30',
    status: 'active',
    priority: 'high',
    milestones: [
      { id: '1-1', title: 'Complete first interview', completed: true, date: '2025-07-15' },
      { id: '1-2', title: 'Reach 5 interviews', completed: true, date: '2025-07-25' },
      { id: '1-3', title: 'Score above 80%', completed: false },
      { id: '1-4', title: 'Complete all 10', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Apply to 50 Jobs',
    description: 'Expand job search to increase opportunities',
    category: 'application',
    targetValue: 50,
    currentValue: 12,
    deadline: '2025-09-15',
    status: 'active',
    priority: 'high',
    milestones: [
      { id: '2-1', title: 'Apply to 10 jobs', completed: true, date: '2025-07-20' },
      { id: '2-2', title: 'Apply to 25 jobs', completed: false },
      { id: '2-3', title: 'Apply to 40 jobs', completed: false },
      { id: '2-4', title: 'Reach 50 applications', completed: false }
    ]
  },
  {
    id: '3',
    title: 'Obtain Cloud Certification',
    description: 'Complete AWS Solutions Architect certification',
    category: 'certification',
    targetValue: 100,
    currentValue: 65,
    deadline: '2025-08-15',
    status: 'active',
    priority: 'medium',
    milestones: [
      { id: '3-1', title: 'Complete course materials', completed: true, date: '2025-07-10' },
      { id: '3-2', title: 'Pass practice exam', completed: true, date: '2025-07-22' },
      { id: '3-3', title: 'Schedule certification exam', completed: false },
      { id: '3-4', title: 'Pass certification', completed: false }
    ]
  },
  {
    id: '4',
    title: 'Network with 20 Professionals',
    description: 'Build connections in the cleared space industry',
    category: 'networking',
    targetValue: 20,
    currentValue: 8,
    deadline: '2025-09-30',
    status: 'active',
    priority: 'medium',
    milestones: [
      { id: '4-1', title: 'Connect with 5 people', completed: true, date: '2025-07-18' },
      { id: '4-2', title: 'Attend networking event', completed: true, date: '2025-07-25' },
      { id: '4-3', title: 'Reach 15 connections', completed: false },
      { id: '4-4', title: 'Complete goal', completed: false }
    ]
  }
]

const progressData = [
  { month: 'May', goals: 2, completed: 1 },
  { month: 'Jun', goals: 3, completed: 2 },
  { month: 'Jul', goals: 4, completed: 3 },
  { month: 'Aug', goals: 5, completed: 2 },
]

const categoryData = [
  { name: 'Interview Skills', value: 75, fill: '#00F5A0' },
  { name: 'Job Applications', value: 24, fill: '#00D9FF' },
  { name: 'Certifications', value: 65, fill: '#7B61FF' },
  { name: 'Networking', value: 40, fill: '#FF6B6B' },
]

const COLORS = {
  high: '#FF6B6B',
  medium: '#FFD93D',
  low: '#6BCF7F'
}

const CATEGORY_ICONS = {
  interview: Target,
  application: Briefcase,
  certification: Award,
  networking: Users
}

export default function GoalTracking() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'interview',
    targetValue: 10,
    deadline: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const activeGoals = goals.filter(g => g.status === 'active').length
  const overallProgress = Math.round((goals.reduce((acc, goal) => 
    acc + (goal.currentValue / goal.targetValue) * 100, 0) / totalGoals))

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map(m => 
            m.id === milestoneId ? { ...m, completed: !m.completed, date: !m.completed ? new Date().toISOString().split('T')[0] : undefined } : m
          )
        }
      }
      return goal
    }))
  }

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.deadline) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        targetValue: newGoal.targetValue,
        currentValue: 0,
        deadline: newGoal.deadline,
        status: 'active',
        priority: newGoal.priority,
        milestones: []
      }
      setGoals([...goals, goal])
      setShowAddGoal(false)
      setNewGoal({
        title: '',
        description: '',
        category: 'interview',
        targetValue: 10,
        deadline: '',
        priority: 'medium'
      })
    }
  }

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId))
    setSelectedGoal(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <Target className="text-dynamic-green" size={24} />
            <span className="text-xs md:text-sm text-gray-500">Overall</span>
          </div>
          <p className="text-xl md:text-2xl font-bold mb-1">{overallProgress}%</p>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Average Progress</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <Trophy className="text-yellow-500" size={24} />
            <span className="text-xs md:text-sm text-gray-500">Status</span>
          </div>
          <p className="text-xl md:text-2xl font-bold mb-1">{completedGoals}/{totalGoals}</p>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Goals Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <Clock className="text-dynamic-blue" size={24} />
            <span className="text-xs md:text-sm text-gray-500">Active</span>
          </div>
          <p className="text-xl md:text-2xl font-bold mb-1">{activeGoals}</p>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">In Progress</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <Zap className="text-purple-500" size={24} />
            <span className="text-xs md:text-sm text-gray-500">Streak</span>
          </div>
          <p className="text-xl md:text-2xl font-bold mb-1">7 days</p>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Goals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-command-black rounded-lg shadow-md p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold">Your Goals</h3>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center px-3 md:px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
            >
              <Plus size={20} className="mr-2" />
              Add Goal
            </button>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => {
              const Icon = CATEGORY_ICONS[goal.category as keyof typeof CATEGORY_ICONS]
              const progress = (goal.currentValue / goal.targetValue) * 100
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex items-start flex-1">
                      <div className={`p-1.5 md:p-2 rounded-lg mr-2 md:mr-3 flex-shrink-0 ${
                        goal.category === 'interview' ? 'bg-green-100 dark:bg-green-900/20' :
                        goal.category === 'application' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        goal.category === 'certification' ? 'bg-purple-100 dark:bg-purple-900/20' :
                        'bg-orange-100 dark:bg-orange-900/20'
                      }`}>
                        <Icon size={20} className={
                          goal.category === 'interview' ? 'text-green-600' :
                          goal.category === 'application' ? 'text-blue-600' :
                          goal.category === 'certification' ? 'text-purple-600' :
                          'text-orange-600'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200 truncate">{goal.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{goal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {goal.priority}
                      </span>
                      <button 
                        onClick={() => setSelectedGoal(goal)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        {goal.currentValue} / {goal.targetValue}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-dynamic-green to-dynamic-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Milestones</p>
                    {goal.milestones.map((milestone) => (
                      <div 
                        key={milestone.id}
                        onClick={() => toggleMilestone(goal.id, milestone.id)}
                        className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                      >
                        {milestone.completed ? (
                          <CheckCircle2 size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <Circle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                        )}
                        <span className={`text-xs md:text-sm flex-1 ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {milestone.title}
                        </span>
                        {milestone.date && (
                          <span className="text-xs text-gray-500 ml-2">{milestone.date}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="mr-1" />
                      <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      daysLeft < 7 ? 'text-red-500' : 
                      daysLeft < 30 ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>
                      {daysLeft} days left
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Progress Charts */}
        <div className="space-y-4 md:space-y-6">
          {/* Category Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 md:p-6"
          >
            <h3 className="text-base md:text-lg font-semibold mb-4">Progress by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={categoryData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#00F5A0" background={{ fill: '#374151' }}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RadialBar>
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.fill }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 md:p-6"
          >
            <h3 className="text-base md:text-lg font-semibold mb-4">Monthly Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F5A0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00F5A0" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Area type="monotone" dataKey="goals" stroke="#00F5A0" fillOpacity={1} fill="url(#colorGoals)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" stroke="#00D9FF" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md p-4 md:p-6 text-white"
          >
            <h3 className="text-base md:text-lg font-semibold mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg mr-3">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="font-medium">Goal Crusher</p>
                  <p className="text-sm opacity-80">Completed 5 goals this month</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg mr-3">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-medium">Week Warrior</p>
                  <p className="text-sm opacity-80">7-day goal streak</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg mr-3">
                  <Target size={20} />
                </div>
                <div>
                  <p className="font-medium">Interview Pro</p>
                  <p className="text-sm opacity-80">5 mock interviews completed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-xl p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg md:text-xl font-bold mb-4">Add New Goal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                  placeholder="e.g., Complete AWS Certification"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="interview">Interview Skills</option>
                    <option value="application">Job Applications</option>
                    <option value="certification">Certifications</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddGoal}
                className="flex-1 px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
              >
                Add Goal
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-xl p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg md:text-xl font-bold mb-4">Edit Goal</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Editing: {selectedGoal.title}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Progress</label>
                <input
                  type="number"
                  value={selectedGoal.currentValue}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0
                    setGoals(goals.map(g => 
                      g.id === selectedGoal.id 
                        ? { ...g, currentValue: Math.min(newValue, g.targetValue) }
                        : g
                    ))
                    setSelectedGoal({ ...selectedGoal, currentValue: newValue })
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                  min="0"
                  max={selectedGoal.targetValue}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Target: {selectedGoal.targetValue}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={selectedGoal.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as 'active' | 'completed' | 'paused'
                    setGoals(goals.map(g => 
                      g.id === selectedGoal.id 
                        ? { ...g, status: newStatus }
                        : g
                    ))
                    setSelectedGoal({ ...selectedGoal, status: newStatus })
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedGoal(null)}
                className="flex-1 px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
              >
                Done
              </button>
              <button
                onClick={() => {
                  handleDeleteGoal(selectedGoal.id)
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}