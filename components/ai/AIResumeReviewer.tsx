'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  Target,
  BarChart3,
  MessageCircle
} from 'lucide-react'
import { ResumeAnalysisResult, RealTimeOptimization } from '@/types/ai-resume'

interface AIResumeReviewerProps {
  className?: string
  jobDescription?: string
  onAnalysisComplete?: (result: ResumeAnalysisResult) => void
}

export default function AIResumeReviewer({ 
  className = '', 
  jobDescription,
  onAnalysisComplete 
}: AIResumeReviewerProps) {
  const [resumeContent, setResumeContent] = useState('')
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null)
  const [realTimeOptimization, setRealTimeOptimization] = useState<RealTimeOptimization | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'demo'>('upload')
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Real-time optimization with debouncing
  useEffect(() => {
    if (!realTimeEnabled || !resumeContent || resumeContent.length < 50) {
      setRealTimeOptimization(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/ai/realtime-optimization', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: resumeContent,
            jobDescription,
            sessionId: 'reviewer-session'
          })
        })

        if (response.ok) {
          const result = await response.json()
          setRealTimeOptimization(result.data)
        }
      } catch (error) {
        console.error('Real-time optimization error:', error)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [resumeContent, jobDescription, realTimeEnabled])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    
    try {
      const text = await extractTextFromFile(file)
      setResumeContent(text)
      setActiveTab('paste') // Switch to edit view
    } catch (error) {
      console.error('File processing error:', error)
      // Show error message to user
    }
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      } else if (file.type === 'application/pdf') {
        // For PDF files, you'd typically use a library like pdf-parse
        // For now, we'll show a placeholder
        resolve('PDF content extraction would be implemented here...')
      } else if (file.type.includes('word')) {
        // For Word documents, you'd use mammoth.js or similar
        resolve('Word document content extraction would be implemented here...')
      } else {
        reject(new Error('Unsupported file type'))
      }
    })
  }

  const analyzeResume = async () => {
    if (!resumeContent.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/resume-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: resumeContent,
          jobDescription,
          targetRole: 'Security-Cleared IT Professional',
          experience: 'Mid-level'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult(result.data)
        onAnalysisComplete?.(result.data)
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadDemoContent = async () => {
    try {
      const response = await fetch('/api/ai/resume-analysis?demo=true')
      if (response.ok) {
        const result = await response.json()
        setResumeContent(result.data.contentAnalysis.sections.map((s: any) => s.name).join('\n'))
        setAnalysisResult(result.data)
        setActiveTab('paste')
      }
    } catch (error) {
      console.error('Demo loading error:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Resume Reviewer
          </h2>
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get instant AI-powered feedback on your resume with ATS scoring, grammar checking, 
          and keyword optimization tailored for security-cleared positions.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          {[
            { id: 'upload', label: 'Upload Resume', icon: Upload },
            { id: 'paste', label: 'Edit Content', icon: FileText },
            { id: 'demo', label: 'Try Demo', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any)
                if (tab.id === 'demo') loadDemoContent()
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8"
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Upload Your Resume
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Supports PDF, Word, and text files
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </button>
                  {uploadedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {uploadedFile.name} uploaded
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {(activeTab === 'paste' || activeTab === 'demo') && (
              <motion.div
                key="paste"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Resume Content
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={realTimeEnabled}
                        onChange={(e) => setRealTimeEnabled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      Real-time analysis
                    </label>
                  </div>
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={resumeContent}
                  onChange={(e) => setResumeContent(e.target.value)}
                  placeholder="Paste your resume content here or upload a file..."
                  className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{resumeContent.length} characters</span>
                  {realTimeOptimization && (
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      ATS Score: {realTimeOptimization.atsCompatibility}%
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time Optimization Panel */}
          {realTimeOptimization && realTimeEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Real-time Suggestions
                </h4>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {realTimeOptimization.keywordMatches}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Keyword Match
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {realTimeOptimization.atsCompatibility}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    ATS Compatible
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {realTimeOptimization.readabilityScore}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Readability
                  </div>
                </div>
              </div>

              {realTimeOptimization.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Quick Improvements:
                  </h5>
                  {realTimeOptimization.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {suggestion.suggested}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={analyzeResume}
              disabled={!resumeContent.trim() || isAnalyzing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
            
            {analysisResult && (
              <button
                onClick={() => {/* Implement download report */}}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Report
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {analysisResult ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Overall Score */}
              <div className={`${getScoreBackgroundColor(analysisResult.overallRating)} rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Overall Rating
                  </h3>
                  <div className={`text-3xl font-bold ${getScoreColor(analysisResult.overallRating)}`}>
                    {analysisResult.overallRating}%
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {analysisResult.priority === 'high' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : analysisResult.priority === 'medium' ? (
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className="font-medium capitalize">
                    {analysisResult.priority} Priority
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Estimated improvement time: {analysisResult.estimatedImprovementTime}
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Score Breakdown
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(analysisResult.atsScore.breakdown).map(([category, score]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {category.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              {analysisResult.actionItems.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Action Items
                  </h3>
                  
                  <div className="space-y-3">
                    {analysisResult.actionItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          item.priority === 'high' ? 'bg-red-500' :
                          item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {item.priority}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          +{item.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Ready for Analysis
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Upload or paste your resume content, then click "Analyze Resume" to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}