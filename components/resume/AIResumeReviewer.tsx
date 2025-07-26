'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Sparkles,
  TrendingUp,
  Target,
  Shield,
  Award,
  Briefcase,
  Code,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'

interface Correction {
  id: string
  type: 'grammar' | 'spelling' | 'formatting' | 'content'
  severity: 'error' | 'warning' | 'suggestion'
  section: string
  original: string
  corrected: string
  explanation: string
  line?: number
}

interface Suggestion {
  id: string
  category: 'keywords' | 'skills' | 'experience' | 'formatting' | 'certifications' | 'clearance'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  example?: string
  impact: string
}

interface AIReviewResult {
  overallScore: number
  corrections: Correction[]
  suggestions: Suggestion[]
  strengths: string[]
  missingKeywords: string[]
  clearanceOptimization: {
    mentioned: boolean
    prominence: 'high' | 'medium' | 'low'
    suggestions: string[]
  }
  atsScore: number
  readabilityScore: number
}

interface AIResumeReviewerProps {
  resumeContent?: string
  onReviewComplete?: (result: AIReviewResult) => void
}

export default function AIResumeReviewer({ resumeContent, onReviewComplete }: AIResumeReviewerProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null)
  const [activeTab, setActiveTab] = useState<'corrections' | 'suggestions' | 'overview'>('overview')
  const [expandedCorrections, setExpandedCorrections] = useState<Set<string>>(new Set())
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  const runAIReview = async () => {
    setIsReviewing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const mockResult: AIReviewResult = {
      overallScore: 78,
      atsScore: 82,
      readabilityScore: 85,
      corrections: [
        {
          id: '1',
          type: 'grammar',
          severity: 'error',
          section: 'Professional Summary',
          original: 'Experienced developer with 5 years experience in...',
          corrected: 'Experienced developer with 5 years of experience in...',
          explanation: 'Add "of" for proper grammar',
          line: 3
        },
        {
          id: '2',
          type: 'spelling',
          severity: 'error',
          section: 'Skills',
          original: 'Kubernettes',
          corrected: 'Kubernetes',
          explanation: 'Correct spelling of the container orchestration platform',
          line: 15
        },
        {
          id: '3',
          type: 'formatting',
          severity: 'warning',
          section: 'Work Experience',
          original: 'software engineer - techcorp',
          corrected: 'Software Engineer - TechCorp',
          explanation: 'Use proper title case for job titles and company names',
          line: 22
        },
        {
          id: '4',
          type: 'content',
          severity: 'suggestion',
          section: 'Achievements',
          original: 'Improved system performance',
          corrected: 'Improved system performance by 40%, reducing load times from 3s to 1.8s',
          explanation: 'Quantify achievements with specific metrics for greater impact',
          line: 28
        }
      ],
      suggestions: [
        {
          id: 's1',
          category: 'clearance',
          priority: 'high',
          title: 'Highlight Security Clearance',
          description: 'Move your TS/SCI clearance to the top of your resume, immediately after your name and contact info',
          example: 'Active TS/SCI with Full Scope Polygraph (Current as of 2024)',
          impact: 'Increases visibility to recruiters filtering for cleared candidates'
        },
        {
          id: 's2',
          category: 'keywords',
          priority: 'high',
          title: 'Add Missing Technical Keywords',
          description: 'Include these high-demand keywords that match your experience',
          example: 'DevSecOps, Zero Trust Architecture, NIST Compliance, FedRAMP',
          impact: 'Improves ATS matching by 25% for cleared technical roles'
        },
        {
          id: 's3',
          category: 'skills',
          priority: 'medium',
          title: 'Group Skills by Category',
          description: 'Organize skills into categories for better readability',
          example: 'Programming: Python, Java, Go | Cloud: AWS, Azure | Security: SIEM, IAM',
          impact: 'Makes it easier for recruiters to quickly assess your capabilities'
        },
        {
          id: 's4',
          category: 'experience',
          priority: 'high',
          title: 'Use STAR Method for Achievements',
          description: 'Structure accomplishments using Situation, Task, Action, Result format',
          example: 'Led migration of legacy systems to AWS (Situation), reducing infrastructure costs by 30% (Result)',
          impact: 'Provides concrete evidence of your impact'
        },
        {
          id: 's5',
          category: 'certifications',
          priority: 'medium',
          title: 'Add Certification Dates',
          description: 'Include earned and expiration dates for all certifications',
          example: 'Security+ CE (CompTIA) - Earned: 2023, Expires: 2026',
          impact: 'Shows current qualifications and professional development'
        }
      ],
      strengths: [
        'Strong technical skills section with relevant technologies',
        'Security clearance is mentioned',
        'Good mix of technical and soft skills',
        'Professional formatting and structure'
      ],
      missingKeywords: [
        'Agile/Scrum',
        'CI/CD',
        'Infrastructure as Code',
        'Terraform',
        'SIEM tools',
        'Incident Response',
        'Risk Assessment'
      ],
      clearanceOptimization: {
        mentioned: true,
        prominence: 'medium',
        suggestions: [
          'Move clearance to header section',
          'Include polygraph status',
          'Add investigation date',
          'Mention sponsorship eligibility'
        ]
      }
    }
    
    setReviewResult(mockResult)
    setIsReviewing(false)
    
    if (onReviewComplete) {
      onReviewComplete(mockResult)
    }
  }

  const toggleCorrection = (id: string) => {
    const newExpanded = new Set(expandedCorrections)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCorrections(newExpanded)
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(new Set(copiedItems).add(id))
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return XCircle
      case 'warning': return AlertCircle
      case 'suggestion': return Sparkles
      default: return AlertCircle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-500 bg-red-500/20'
      case 'warning': return 'text-yellow-500 bg-yellow-500/20'
      case 'suggestion': return 'text-blue-500 bg-blue-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/20'
      case 'low': return 'text-green-500 bg-green-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clearance': return Shield
      case 'keywords': return Target
      case 'skills': return Code
      case 'experience': return Briefcase
      case 'certifications': return Award
      case 'formatting': return FileText
      default: return Sparkles
    }
  }

  return (
    <div className="w-full">
      {/* Review Button */}
      {!reviewResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={runAIReview}
            disabled={isReviewing}
            className="px-8 py-4 bg-gradient-to-r from-sky-blue to-neon-green text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg font-semibold"
          >
            {isReviewing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                AI is reviewing your resume...
              </>
            ) : (
              <>
                <Brain size={24} />
                Get AI Review with Corrections
              </>
            )}
          </button>
          <p className="text-gray-400 text-sm mt-3">
            Get detailed grammar corrections, formatting fixes, and content suggestions
          </p>
        </motion.div>
      )}

      {/* Review Results */}
      {reviewResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Score Overview */}
          <div className="glass-card rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{reviewResult.overallScore}%</div>
                <p className="text-gray-400">Overall Score</p>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-blue to-neon-green transition-all duration-500"
                    style={{ width: `${reviewResult.overallScore}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{reviewResult.atsScore}%</div>
                <p className="text-gray-400">ATS Score</p>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${reviewResult.atsScore}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{reviewResult.readabilityScore}%</div>
                <p className="text-gray-400">Readability</p>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${reviewResult.readabilityScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('corrections')}
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'corrections'
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              Corrections
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {reviewResult.corrections.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'suggestions'
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              Suggestions
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                {reviewResult.suggestions.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Strengths */}
                <div className="glass-card rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {reviewResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clearance Optimization */}
                <div className="glass-card rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="text-sky-blue" />
                    Security Clearance Optimization
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        reviewResult.clearanceOptimization.mentioned 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {reviewResult.clearanceOptimization.mentioned ? 'Mentioned' : 'Not Found'}
                      </span>
                      {reviewResult.clearanceOptimization.mentioned && (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          reviewResult.clearanceOptimization.prominence === 'high' 
                            ? 'bg-green-500/20 text-green-500'
                            : reviewResult.clearanceOptimization.prominence === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {reviewResult.clearanceOptimization.prominence} prominence
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {reviewResult.clearanceOptimization.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                            <TrendingUp className="text-yellow-500 mt-0.5 flex-shrink-0" size={14} />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="glass-card rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="text-yellow-500" />
                    Missing Keywords
                  </h3>
                  <p className="text-gray-400 mb-3">Add these keywords to improve ATS matching:</p>
                  <div className="flex flex-wrap gap-2">
                    {reviewResult.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'corrections' && (
              <motion.div
                key="corrections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {reviewResult.corrections.length === 0 ? (
                  <div className="glass-card rounded-lg p-8 text-center">
                    <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                    <p className="text-xl text-white">No corrections needed!</p>
                    <p className="text-gray-400 mt-2">Your resume is grammatically correct.</p>
                  </div>
                ) : (
                  reviewResult.corrections.map((correction) => {
                    const Icon = getSeverityIcon(correction.severity)
                    const colorClass = getSeverityColor(correction.severity)
                    const isExpanded = expandedCorrections.has(correction.id)
                    
                    return (
                      <motion.div
                        key={correction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-semibold text-white">{correction.section}</h4>
                                  {correction.line && (
                                    <span className="text-xs text-gray-500">Line {correction.line}</span>
                                  )}
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                                    {correction.type}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">{correction.explanation}</p>
                              </div>
                              <button
                                onClick={() => toggleCorrection(correction.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                            </div>
                            
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-3"
                              >
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-red-500 text-sm font-medium">Original</span>
                                    <XCircle className="text-red-500" size={16} />
                                  </div>
                                  <p className="text-gray-300 font-mono text-sm">{correction.original}</p>
                                </div>
                                
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-green-500 text-sm font-medium">Corrected</span>
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="text-green-500" size={16} />
                                      <button
                                        onClick={() => copyToClipboard(correction.corrected, correction.id)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                      >
                                        {copiedItems.has(correction.id) ? (
                                          <Check size={16} className="text-green-500" />
                                        ) : (
                                          <Copy size={16} />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 font-mono text-sm">{correction.corrected}</p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </motion.div>
            )}

            {activeTab === 'suggestions' && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {reviewResult.suggestions.map((suggestion, index) => {
                  const Icon = getCategoryIcon(suggestion.category)
                  const priorityColor = getPriorityColor(suggestion.priority)
                  
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-lg p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${priorityColor}`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{suggestion.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${priorityColor}`}>
                              {suggestion.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-300 mb-3">{suggestion.description}</p>
                          
                          {suggestion.example && (
                            <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-400 mb-1">Example:</p>
                              <p className="text-sm text-gray-200 font-mono">{suggestion.example}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <TrendingUp className="text-green-500" size={16} />
                            <p className="text-sm text-green-500">Impact: {suggestion.impact}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}