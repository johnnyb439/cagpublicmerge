'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, TrendingUp, BookOpen, Award, Briefcase, Users,
  Target, Calendar, ChevronRight, Star, Zap, Brain,
  Lightbulb, Rocket, Shield, Code, Cloud, Database
} from 'lucide-react'
import Link from 'next/link'

interface Recommendation {
  id: string
  type: 'job' | 'skill' | 'certification' | 'course' | 'networking' | 'strategy'
  title: string
  description: string
  matchScore: number
  priority: 'urgent' | 'high' | 'medium' | 'low'
  actionItems: string[]
  timeToComplete?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  icon: any
  color: string
  link?: string
}

const recommendations: Recommendation[] = [
  {
    id: '1',
    type: 'job',
    title: 'Cloud Security Engineer at AWS',
    description: 'Perfect match based on your security clearance and cloud skills. This role aligns with your career goals.',
    matchScore: 95,
    priority: 'urgent',
    actionItems: [
      'Update resume with recent cloud projects',
      'Prepare for AWS technical interview',
      'Research AWS security best practices'
    ],
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
    link: '/jobs/aws-cloud-security'
  },
  {
    id: '2',
    type: 'certification',
    title: 'AWS Solutions Architect Certification',
    description: 'Based on your profile, this certification would increase your job matches by 40%.',
    matchScore: 88,
    priority: 'high',
    actionItems: [
      'Enroll in AWS certification course',
      'Complete practice exams',
      'Schedule certification exam'
    ],
    timeToComplete: '2-3 months',
    difficulty: 'intermediate',
    icon: Award,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '3',
    type: 'skill',
    title: 'Kubernetes & Container Orchestration',
    description: 'High demand skill missing from your profile. 78% of your matched jobs require this.',
    matchScore: 82,
    priority: 'high',
    actionItems: [
      'Complete Kubernetes fundamentals course',
      'Set up local K8s environment',
      'Build a sample microservices project'
    ],
    timeToComplete: '1-2 months',
    difficulty: 'intermediate',
    icon: Code,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    type: 'networking',
    title: 'Connect with Defense Tech Recruiters',
    description: 'Expand your network in the cleared space. We found 15 relevant recruiters.',
    matchScore: 75,
    priority: 'medium',
    actionItems: [
      'Optimize LinkedIn profile',
      'Send connection requests with personalized messages',
      'Attend virtual cleared job fair on March 15'
    ],
    icon: Users,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: '5',
    type: 'course',
    title: 'Advanced Python for DevSecOps',
    description: 'Enhance your automation skills for security operations roles.',
    matchScore: 70,
    priority: 'medium',
    actionItems: [
      'Enroll in Python DevSecOps course',
      'Build security automation tools',
      'Contribute to open source security projects'
    ],
    timeToComplete: '6 weeks',
    difficulty: 'advanced',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: '6',
    type: 'strategy',
    title: 'Optimize Your Job Search Strategy',
    description: 'AI analysis shows you could improve response rate by 35% with these changes.',
    matchScore: 85,
    priority: 'high',
    actionItems: [
      'Apply to jobs within 24 hours of posting',
      'Focus on companies with high veteran hiring rates',
      'Use ATS-optimized resume format'
    ],
    icon: Target,
    color: 'from-yellow-500 to-orange-500'
  }
]

const skillGapAnalysis = [
  { skill: 'Cloud Architecture', current: 75, required: 90 },
  { skill: 'Security Frameworks', current: 85, required: 85 },
  { skill: 'DevOps/CI-CD', current: 60, required: 80 },
  { skill: 'Container Tech', current: 40, required: 75 },
  { skill: 'Automation', current: 70, required: 85 },
]

const careerPathways = [
  {
    title: 'Cloud Security Architect',
    timeline: '6-12 months',
    salary: '$150k-$180k',
    requirements: ['AWS Cert', 'Security+', '5 years exp'],
    demand: 'Very High'
  },
  {
    title: 'DevSecOps Engineer',
    timeline: '3-6 months',
    salary: '$130k-$160k',
    requirements: ['Python', 'K8s', 'CI/CD'],
    demand: 'High'
  },
  {
    title: 'Federal Solutions Architect',
    timeline: '12-18 months',
    salary: '$160k-$200k',
    requirements: ['TS/SCI', 'Cloud Certs', 'Fed Experience'],
    demand: 'High'
  }
]

export default function PersonalizedRecommendations() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedRec, setExpandedRec] = useState<string | null>(null)

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: Sparkles },
    { id: 'job', label: 'Job Matches', icon: Briefcase },
    { id: 'skill', label: 'Skills', icon: Code },
    { id: 'certification', label: 'Certifications', icon: Award },
    { id: 'networking', label: 'Networking', icon: Users },
  ]

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedCategory)

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="mr-3" size={32} />
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Career Insights</h2>
              <p className="text-purple-100 mt-1">Personalized recommendations based on your profile and market trends</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Last updated</p>
            <p className="font-semibold">2 hours ago</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              selectedCategory === cat.id
                ? 'bg-dynamic-green text-white shadow-md'
                : 'bg-white dark:bg-command-black text-gray-700 dark:text-gray-300 hover:shadow-md'
            }`}
          >
            <cat.icon size={18} className="mr-2" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRecommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${rec.color} text-white mr-4`}>
                      <rec.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {rec.title}
                        </h3>
                        <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                          rec.priority === 'urgent' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                      
                      {/* Match Score */}
                      <div className="flex items-center mb-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Match Score</span>
                            <span className="font-semibold">{rec.matchScore}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full bg-gradient-to-r ${rec.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${rec.matchScore}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {rec.timeToComplete && (
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {rec.timeToComplete}
                          </div>
                        )}
                        {rec.difficulty && (
                          <div className="flex items-center">
                            <Zap size={14} className="mr-1" />
                            {rec.difficulty}
                          </div>
                        )}
                      </div>

                      {/* Action Items */}
                      <div 
                        className={`transition-all duration-300 ${
                          expandedRec === rec.id ? 'max-h-96' : 'max-h-0'
                        } overflow-hidden`}
                      >
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action Items:</p>
                          <ul className="space-y-2">
                            {rec.actionItems.map((item, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                    className="text-sm text-dynamic-green hover:text-emerald-green transition-colors"
                  >
                    {expandedRec === rec.id ? 'Show Less' : 'View Action Plan'}
                  </button>
                  {rec.link && (
                    <Link
                      href={rec.link}
                      className="flex items-center text-sm text-dynamic-blue hover:text-sky-blue transition-colors"
                    >
                      Learn More
                      <ChevronRight size={16} className="ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Skill Gap Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Lightbulb className="mr-2 text-yellow-500" size={20} />
              Skill Gap Analysis
            </h3>
            <div className="space-y-3">
              {skillGapAnalysis.map((skill) => (
                <div key={skill.skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{skill.skill}</span>
                    <span className={skill.current >= skill.required ? 'text-green-500' : 'text-orange-500'}>
                      {skill.current}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="absolute top-0 left-0 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"
                        style={{ width: `${skill.required}%` }}
                      />
                      <motion.div
                        className={`absolute top-0 left-0 h-2 rounded-full ${
                          skill.current >= skill.required 
                            ? 'bg-gradient-to-r from-green-400 to-green-600' 
                            : 'bg-gradient-to-r from-orange-400 to-orange-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.current}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Career Pathways */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Rocket className="mr-2 text-purple-500" size={20} />
              Recommended Career Paths
            </h3>
            <div className="space-y-4">
              {careerPathways.map((path, index) => (
                <div 
                  key={path.title}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-dynamic-green transition-colors cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {path.title}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                      <span className="font-medium">{path.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Salary:</span>
                      <span className="font-medium text-green-600">{path.salary}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Demand:</span>
                      <span className={`font-medium ${
                        path.demand === 'Very High' ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {path.demand}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Key Requirements:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {path.requirements.map((req) => (
                        <span 
                          key={req}
                          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-br from-dynamic-green to-dynamic-blue rounded-lg shadow-md p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="mr-2" size={20} />
              Pro Tips
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="text-lg mr-2">💡</span>
                Apply to jobs within 24 hours of posting for 3x higher response rate
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2">🎯</span>
                Focus on roles requiring your clearance level for faster hiring
              </li>
              <li className="flex items-start">
                <span className="text-lg mr-2">📈</span>
                Update your profile weekly to stay visible to recruiters
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Add missing import
import { CheckCircle2 } from 'lucide-react'