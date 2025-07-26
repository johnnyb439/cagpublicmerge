'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react'

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
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    category: 'career',
    priority: 'medium',
    status: 'active',
    progress: 0,
    target: 1
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/dashboard/analytics?userId=1')
      const result = await response.json()
      
      if (result.success) {
        // For now, use mock goals data
        const mockGoals: Goal[] = [
          {
            id: '1',
            title: 'Complete ' + result.data.goals.applicationsGoal + ' Job Applications',
            description: 'Apply to federal positions matching my clearance level',
            category: 'applications',
            progress: result.data.goals.applicationsProgress,
            target: result.data.goals.applicationsGoal,
            deadline: '2025-03-31',
            status: result.data.goals.applicationsProgress >= result.data.goals.applicationsGoal ? 'completed' : 'active',
            priority: 'high'
          },
          {
            id: '2',
            title: 'Earn ' + result.data.goals.certificationsGoal + ' Certifications',
            description: 'Complete professional certifications',
            category: 'skills',
            progress: result.data.goals.certificationsProgress,
            target: result.data.goals.certificationsGoal,
            deadline: '2025-04-15',
            status: result.data.goals.certificationsProgress >= result.data.goals.certificationsGoal ? 'completed' : 'active',
            priority: 'high'
          },
          {
            id: '3',
            title: 'Complete ' + result.data.goals.interviewsGoal + ' Mock Interviews',
            description: 'Practice interview skills',
            category: 'interviews',
            progress: result.data.goals.interviewsProgress,
            target: result.data.goals.interviewsGoal,
            deadline: '2025-03-15',
            status: result.data.goals.interviewsProgress >= result.data.goals.interviewsGoal ? 'completed' : 'active',
            priority: 'medium'
          }
        ]
        
        // Load additional goals from localStorage
        const savedGoals = localStorage.getItem('userGoals')
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
            ...goal,
            status: goal.status === 'in_progress' ? 'active' : goal.status
          }))
          setGoals([...mockGoals, ...parsedGoals])
        } else {
          setGoals(mockGoals)
        }
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGoal = async () => {
    if (!newGoal.title || !newGoal.deadline) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      category: newGoal.category as Goal['category'],
      progress: newGoal.progress || 0,
      target: newGoal.target || 1,
      deadline: newGoal.deadline,
      status: 'active',
      priority: newGoal.priority as Goal['priority']
    }

    // Save to localStorage for persistence
    const existingGoals = localStorage.getItem('userGoals')
    const savedGoals = existingGoals ? JSON.parse(existingGoals) : []
    savedGoals.push(goal)
    localStorage.setItem('userGoals', JSON.stringify(savedGoals))

    setGoals([...goals, goal])
    setShowAddGoal(false)
    setNewGoal({
      category: 'career',
      priority: 'medium',
      status: 'active',
      progress: 0,
      target: 1
    })

    // Update goals in API
    try {
      await fetch('/api/dashboard/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          goals: {
            applicationsGoal: goals.find(g => g.category === 'applications')?.target || 30,
            certificationsGoal: goals.find(g => g.category === 'skills')?.target || 8,
            interviewsGoal: goals.find(g => g.category === 'interviews')?.target || 15
          }
        })
      })
    } catch (error) {
      console.error('Error updating goals:', error)
    }
  }

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = {
          ...goal,
          progress: newProgress,
          status: (newProgress >= goal.target ? 'completed' : 'active') as Goal['status']
        }
        return updatedGoal
      }
      return goal
    })

    setGoals(updatedGoals)
    
    // Update localStorage
    const customGoals = updatedGoals.filter(g => !['1', '2', '3'].includes(g.id))
    localStorage.setItem('userGoals', JSON.stringify(customGoals))
  }

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    
    // Update localStorage
    const customGoals = updatedGoals.filter(g => !['1', '2', '3'].includes(g.id))
    localStorage.setItem('userGoals', JSON.stringify(customGoals))
  }

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory)

  const completedGoals = goals.filter(goal => goal.status === 'completed').length
  const totalGoals = goals.length
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
      </div>
    )
  }

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
          <button 
            onClick={() => setShowAddGoal(true)}
            className="flex items-center text-dynamic-green hover:text-emerald-green transition-colors"
          >
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

      {/* Add Goal Form */}
      {showAddGoal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Add New Goal</h4>
            <button 
              onClick={() => setShowAddGoal(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Goal title"
              value={newGoal.title || ''}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            />
            
            <textarea
              placeholder="Description (optional)"
              value={newGoal.description || ''}
              onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              rows={2}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({...newGoal, category: e.target.value as Goal['category']})}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="career">Career</option>
                <option value="skills">Skills</option>
                <option value="applications">Applications</option>
                <option value="interviews">Interviews</option>
              </select>
              
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({...newGoal, priority: e.target.value as Goal['priority']})}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Target"
                value={newGoal.target || 1}
                onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value) || 1})}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                min="1"
              />
              
              <input
                type="date"
                value={newGoal.deadline || ''}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            
            <button
              onClick={saveGoal}
              disabled={!newGoal.title || !newGoal.deadline}
              className="w-full py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors disabled:opacity-50"
            >
              <Save size={16} className="inline mr-2" />
              Save Goal
            </button>
          </div>
        </motion.div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No goals in this category. Create your first goal!
          </div>
        ) : (
          filteredGoals.map((goal, index) => (
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
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {goal.progress}/{goal.target}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((goal.progress / goal.target) * 100)}%
                    </div>
                  </div>
                  {!['1', '2', '3'].includes(goal.id) && (
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <div className="flex gap-2">
                    {editingGoal === goal.id ? (
                      <>
                        <input
                          type="number"
                          value={goal.progress}
                          onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                          min="0"
                          max={goal.target}
                        />
                        <button 
                          onClick={() => setEditingGoal(null)}
                          className="text-dynamic-green"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setEditingGoal(goal.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
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
          ))
        )}
      </div>
    </div>
  )
}