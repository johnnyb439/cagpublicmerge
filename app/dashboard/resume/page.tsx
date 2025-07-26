'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Upload, Sparkles, Brain, CheckCircle2, 
  AlertCircle, Download, Star, TrendingUp, Shield,
  Target, Calendar, Clock, ChevronLeft, Eye
} from 'lucide-react'
import Link from 'next/link'
import ResumeCard from '@/components/resume/ResumeCard'
import ResumeVersionList from '@/components/resume/ResumeVersionList'
import ResumeInsightsPanel from '@/components/resume/ResumeInsightsPanel'
import ResumeToJobMatcher from '@/components/resume/ResumeToJobMatcher'
import AIResumeReviewer from '@/components/resume/AIResumeReviewer'

interface Resume {
  id: string
  name: string
  filename: string
  size: string
  uploadDate: string
  isDefault: boolean
  version: number
  notes?: string
  aiScore?: number
  lastAIReview?: string
}

interface Suggestion {
  type: 'keyword' | 'skill' | 'improvement' | 'tip'
  text: string
  priority: 'high' | 'medium' | 'low'
}

interface InsightData {
  overallScore: number
  keywordsFound: string[]
  missingKeywords: string[]
  strengths: string[]
  suggestions: Suggestion[]
  clearanceAlignment: boolean
  atsScore: number
}

interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  clearanceRequired: string
  matchPercentage: number
  improvementTips: string[]
  jobUrl: string
}

export default function UpdateResumePage() {
  const [currentResume, setCurrentResume] = useState<Resume | null>(null)
  const [resumeHistory, setResumeHistory] = useState<Resume[]>([])
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAIReview, setHasAIReview] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'insights' | 'matches' | 'reviewer'>('upload')

  // Load from localStorage on mount
  useEffect(() => {
    const savedResume = localStorage.getItem('currentResume')
    const savedHistory = localStorage.getItem('resumeHistory')
    const savedInsights = localStorage.getItem('resumeInsights')
    
    if (savedResume) {
      setCurrentResume(JSON.parse(savedResume))
    }
    if (savedHistory) {
      setResumeHistory(JSON.parse(savedHistory))
    }
    if (savedInsights) {
      setInsights(JSON.parse(savedInsights))
      setHasAIReview(true)
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setHasAIReview(false)
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newResume: Resume = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      filename: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toLocaleDateString(),
      isDefault: resumeHistory.length === 0,
      version: resumeHistory.length + 1,
    }

    // Move current to history
    if (currentResume) {
      const updatedHistory = [currentResume, ...resumeHistory].slice(0, 10)
      setResumeHistory(updatedHistory)
      localStorage.setItem('resumeHistory', JSON.stringify(updatedHistory))
    }

    setCurrentResume(newResume)
    localStorage.setItem('currentResume', JSON.stringify(newResume))
    setIsUploading(false)
    setActiveTab('insights')
  }

  const handleRunAIReview = async () => {
    if (!currentResume) return
    
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const mockInsights: InsightData = {
      overallScore: 85,
      keywordsFound: ['TS/SCI', 'AWS', 'React', 'Node.js', 'Agile', 'Docker', 'Kubernetes', 'CI/CD', 'Python'],
      missingKeywords: ['Terraform', 'Jenkins', 'CISSP', 'Security+'],
      strengths: [
        'Strong technical skills section',
        'Quantified achievements (30% improvement metrics)',
        'Relevant clearance prominently displayed',
        'Good mix of technical and soft skills'
      ],
      suggestions: [
        {
          type: 'keyword',
          text: 'Add "Infrastructure as Code" and "Terraform" to align with DevOps roles',
          priority: 'high'
        },
        {
          type: 'skill',
          text: 'Include specific SIEM tools (Splunk, ELK) for security-focused positions',
          priority: 'medium'
        },
        {
          type: 'improvement',
          text: 'Add a professional summary highlighting your cleared status and key skills',
          priority: 'high'
        },
        {
          type: 'tip',
          text: 'Consider adding relevant certifications section (Security+, AWS, etc.)',
          priority: 'medium'
        }
      ],
      clearanceAlignment: true,
      atsScore: 82
    }
    
    // Generate job matches
    const mockMatches: JobMatch[] = [
      {
        id: '1',
        title: 'Senior Cloud Engineer',
        company: 'Booz Allen Hamilton',
        location: 'McLean, VA',
        clearanceRequired: 'TS/SCI',
        matchPercentage: 92,
        improvementTips: ['Add Terraform experience', 'Highlight cloud migration projects'],
        jobUrl: '/jobs/1'
      },
      {
        id: '2',
        title: 'DevOps Engineer',
        company: 'Raytheon',
        location: 'Arlington, VA',
        clearanceRequired: 'Secret',
        matchPercentage: 88,
        improvementTips: ['Include Jenkins/GitLab CI experience', 'Add containerization metrics'],
        jobUrl: '/jobs/2'
      },
      {
        id: '3',
        title: 'Full Stack Developer',
        company: 'CACI',
        location: 'Chantilly, VA',
        clearanceRequired: 'TS/SCI',
        matchPercentage: 85,
        improvementTips: ['Add more frontend frameworks', 'Include API development examples'],
        jobUrl: '/jobs/3'
      }
    ]
    
    setInsights(mockInsights)
    setJobMatches(mockMatches)
    localStorage.setItem('resumeInsights', JSON.stringify(mockInsights))
    
    // Update resume with AI score
    const updatedResume = { 
      ...currentResume, 
      aiScore: mockInsights.overallScore,
      lastAIReview: new Date().toLocaleDateString()
    }
    setCurrentResume(updatedResume)
    localStorage.setItem('currentResume', JSON.stringify(updatedResume))
    
    setHasAIReview(true)
    setIsAnalyzing(false)
  }

  const handleDownloadReport = () => {
    if (!insights || !currentResume) return
    
    const report = {
      resume: currentResume.name,
      date: new Date().toLocaleDateString(),
      overallScore: insights.overallScore,
      atsScore: insights.atsScore,
      keywordsFound: insights.keywordsFound,
      missingKeywords: insights.missingKeywords,
      strengths: insights.strengths,
      suggestions: insights.suggestions,
      jobMatches: jobMatches.map(j => ({
        title: j.title,
        company: j.company,
        match: `${j.matchPercentage}%`
      }))
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-ai-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteResume = () => {
    setCurrentResume(null)
    setInsights(null)
    setJobMatches([])
    setHasAIReview(false)
    localStorage.removeItem('currentResume')
    localStorage.removeItem('resumeInsights')
  }

  const handleSetDefault = (value: boolean) => {
    if (currentResume) {
      const updatedResume = { ...currentResume, isDefault: value }
      setCurrentResume(updatedResume)
      localStorage.setItem('currentResume', JSON.stringify(updatedResume))
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'keyword': return Target
      case 'skill': return Brain
      case 'improvement': return TrendingUp
      case 'tip': return Sparkles
      default: return AlertCircle
    }
  }

  const getSuggestionColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/20'
      case 'low': return 'text-green-500 bg-green-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen glass-bg py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Resume Management</h1>
          <p className="mt-2 text-gray-400">
            Upload, analyze, and optimize your resume with AI-powered insights
          </p>
        </motion.div>

        {/* Stats Overview */}
        {currentResume && hasAIReview && insights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Score</p>
                  <p className="text-2xl font-bold text-white">{insights.overallScore}%</p>
                </div>
                <Brain className="text-sky-blue" size={32} />
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">ATS Score</p>
                  <p className="text-2xl font-bold text-white">{insights.atsScore}%</p>
                </div>
                <Shield className="text-neon-green" size={32} />
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Job Matches</p>
                  <p className="text-2xl font-bold text-white">{jobMatches.length}</p>
                </div>
                <Target className="text-purple-500" size={32} />
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Keywords</p>
                  <p className="text-2xl font-bold text-white">{insights.keywordsFound.length}</p>
                </div>
                <Star className="text-yellow-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {currentResume && (
          <div className="flex gap-4 mb-8 flex-wrap">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              Upload & Manage
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'insights'
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              AI Insights
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'matches'
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              Job Matches
            </button>
            <button
              onClick={() => setActiveTab('reviewer')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'reviewer'
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              AI Reviewer
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Version History */}
          <div className="lg:col-span-1">
            <ResumeVersionList
              versions={resumeHistory}
              onRestore={(id) => {
                const versionToRestore = resumeHistory.find(r => r.id === id)
                if (versionToRestore && currentResume) {
                  setResumeHistory([currentResume, ...resumeHistory.filter(r => r.id !== id)])
                  setCurrentResume(versionToRestore)
                  setHasAIReview(false)
                }
              }}
              onPreview={(id) => console.log('Preview', id)}
              onUpdateNotes={(id, notes) => {
                const updated = resumeHistory.map(r => 
                  r.id === id ? { ...r, notes } : r
                )
                setResumeHistory(updated)
                localStorage.setItem('resumeHistory', JSON.stringify(updated))
              }}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {(!currentResume || activeTab === 'upload') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ResumeCard
                  currentResume={currentResume}
                  onUpload={handleFileUpload}
                  onDelete={handleDeleteResume}
                  onSetDefault={handleSetDefault}
                  isUploading={isUploading}
                />
                
                {currentResume && !hasAIReview && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center"
                  >
                    <button
                      onClick={handleRunAIReview}
                      disabled={isAnalyzing}
                      className="px-8 py-4 bg-gradient-to-r from-sky-blue to-neon-green text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Analyzing your resume...
                        </>
                      ) : (
                        <>
                          <Brain size={20} />
                          Let AI Review My Resume
                        </>
                      )}
                    </button>
                    <p className="text-gray-400 text-sm mt-2">
                      Get instant feedback and job matching recommendations
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'insights' && hasAIReview && insights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* AI Insights Overview */}
                <div className="glass-card rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Brain className="text-sky-blue" />
                      AI Analysis Results
                    </h2>
                    <button
                      onClick={handleDownloadReport}
                      className="px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download Report
                    </button>
                  </div>

                  {/* Strengths */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="text-green-500" size={20} />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {insights.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="text-yellow-500" size={20} />
                      Improvement Suggestions
                    </h3>
                    <div className="space-y-3">
                      {insights.suggestions.map((suggestion, index) => {
                        const Icon = getSuggestionIcon(suggestion.type)
                        const colorClass = getSuggestionColor(suggestion.priority)
                        
                        return (
                          <div key={index} className="glass-card p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-300">{suggestion.text}</p>
                                <span className={`text-xs mt-1 inline-block px-2 py-1 rounded ${colorClass}`}>
                                  {suggestion.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Keywords Analysis */}
                <ResumeInsightsPanel 
                  insights={{
                    ...insights,
                    suggestions: insights.suggestions.map(s => s.text)
                  }}
                  isAnalyzing={isAnalyzing}
                />
              </motion.div>
            )}

            {activeTab === 'matches' && hasAIReview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ResumeToJobMatcher jobMatches={jobMatches} isAnalyzing={isAnalyzing} />
              </motion.div>
            )}

            {activeTab === 'reviewer' && currentResume && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2"
              >
                <AIResumeReviewer 
                  resumeContent={currentResume.name}
                  onReviewComplete={(result) => {
                    console.log('AI Review completed:', result)
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}