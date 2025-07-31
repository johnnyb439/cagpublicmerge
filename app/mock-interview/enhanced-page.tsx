'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Bot, Mic, MicOff, Send, RefreshCw, CheckCircle, 
  AlertCircle, Trophy, Clock, Target, TrendingUp, Star,
  Brain, Zap, Award, BarChart2, Play, Pause
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface InterviewSession {
  id: string
  role: string
  tier: string
  date: string
  score: number
  questionsAnswered: number
  totalQuestions: number
  timeSpent: number
  confidence: number
}

interface PerformanceMetrics {
  averageScore: number
  totalInterviews: number
  improvement: number
  strongAreas: string[]
  improvementAreas: string[]
}

const mockSessions: InterviewSession[] = [
  {
    id: '1',
    role: 'Help Desk',
    tier: 'Tier 1',
    date: '2025-07-28',
    score: 85,
    questionsAnswered: 16,
    totalQuestions: 16,
    timeSpent: 45,
    confidence: 80
  },
  {
    id: '2',
    role: 'Help Desk',
    tier: 'Tier 1',
    date: '2025-07-25',
    score: 75,
    questionsAnswered: 16,
    totalQuestions: 16,
    timeSpent: 50,
    confidence: 70
  },
  {
    id: '3',
    role: 'Help Desk',
    tier: 'Tier 1',
    date: '2025-07-20',
    score: 65,
    questionsAnswered: 12,
    totalQuestions: 16,
    timeSpent: 40,
    confidence: 60
  }
]

const performanceData = [
  { date: 'Jul 20', score: 65, confidence: 60 },
  { date: 'Jul 22', score: 70, confidence: 65 },
  { date: 'Jul 25', score: 75, confidence: 70 },
  { date: 'Jul 27', score: 80, confidence: 75 },
  { date: 'Jul 28', score: 85, confidence: 80 }
]

const skillsData = [
  { skill: 'Technical Knowledge', value: 85, fill: '#00F5A0' },
  { skill: 'Communication', value: 75, fill: '#00D9FF' },
  { skill: 'Problem Solving', value: 80, fill: '#7B61FF' },
  { skill: 'Customer Service', value: 90, fill: '#FFD93D' }
]

export default function EnhancedMockInterviewPage() {
  const [showDashboard, setShowDashboard] = useState(true)
  const [sessions, setSessions] = useState<InterviewSession[]>(mockSessions)
  const [currentScore, setCurrentScore] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateMetrics = (): PerformanceMetrics => {
    const avgScore = Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length)
    const improvement = sessions.length > 1 ? sessions[0].score - sessions[sessions.length - 1].score : 0
    
    return {
      averageScore: avgScore,
      totalInterviews: sessions.length,
      improvement,
      strongAreas: ['Customer Service', 'Technical Knowledge'],
      improvementAreas: ['Communication', 'Time Management']
    }
  }

  const metrics = calculateMetrics()

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
                Mock Interview Practice
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Practice with AI-powered interview questions and track your progress
              </p>
            </div>
            <button
              onClick={() => setShowDashboard(false)}
              className="flex items-center px-6 py-3 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors shadow-lg"
            >
              <Play size={20} className="mr-2" />
              Start New Interview
            </button>
          </div>
        </motion.div>

        {showDashboard ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="text-yellow-500" size={24} />
                  <span className="text-sm text-gray-500">Average</span>
                </div>
                <p className="text-2xl font-bold">{metrics.averageScore}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Target className="text-dynamic-green" size={24} />
                  <span className="text-sm text-gray-500">Total</span>
                </div>
                <p className="text-2xl font-bold">{metrics.totalInterviews}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interviews Completed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="text-dynamic-blue" size={24} />
                  <span className="text-sm text-gray-500">Progress</span>
                </div>
                <p className="text-2xl font-bold">+{Math.abs(metrics.improvement)}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Improvement</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Brain className="text-purple-500" size={24} />
                  <span className="text-sm text-gray-500">Ready</span>
                </div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interview Ready</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="lg:col-span-2 bg-white dark:bg-command-black rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Performance Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#00F5A0" 
                      strokeWidth={3}
                      dot={{ fill: '#00F5A0', r: 6 }}
                      name="Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#00D9FF" 
                      strokeWidth={3}
                      dot={{ fill: '#00D9FF', r: 6 }}
                      name="Confidence"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Skills Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Skills Assessment</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={skillsData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#00F5A0" background={{ fill: '#374151' }}>
                      {skillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </RadialBar>
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {skillsData.map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: skill.fill }} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{skill.skill}</span>
                      </div>
                      <span className="text-sm font-medium">{skill.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-8 bg-white dark:bg-command-black rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-6">Recent Interview Sessions</h2>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-dynamic-green transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        session.score >= 80 ? 'bg-green-100 dark:bg-green-900/20' :
                        session.score >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        <Trophy className={
                          session.score >= 80 ? 'text-green-600' :
                          session.score >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        } size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{session.role} - {session.tier}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.date).toLocaleDateString()} • {session.timeSpent} minutes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{session.score}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.questionsAnswered}/{session.totalQuestions} questions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tips and Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md p-6 text-white">
                <Zap size={32} className="mb-3" />
                <h3 className="text-lg font-semibold mb-2">Quick Tips</h3>
                <ul className="text-sm space-y-2">
                  <li>• Practice STAR method for behavioral questions</li>
                  <li>• Research the company and clearance requirements</li>
                  <li>• Prepare questions to ask the interviewer</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md p-6 text-white">
                <Award size={32} className="mb-3" />
                <h3 className="text-lg font-semibold mb-2">Your Strengths</h3>
                <ul className="text-sm space-y-2">
                  {metrics.strongAreas.map(area => (
                    <li key={area}>✓ {area}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md p-6 text-white">
                <Target size={32} className="mb-3" />
                <h3 className="text-lg font-semibold mb-2">Focus Areas</h3>
                <ul className="text-sm space-y-2">
                  {metrics.improvementAreas.map(area => (
                    <li key={area}>• {area}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">Interview interface would go here...</p>
            <button
              onClick={() => setShowDashboard(true)}
              className="mt-4 text-dynamic-green hover:text-emerald-green"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </section>
  )
}