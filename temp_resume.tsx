'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import EnhancedResumeCard from '@/components/resume/EnhancedResumeCard'
import ResumePreview from '@/components/resume/ResumePreview'
import AISuggestionsPanel from '@/components/resume/AISuggestionsPanel'
import ResumeVersionList from '@/components/resume/ResumeVersionList'
import { detectPII } from '@/utils/piiDetection'
import mammoth from 'mammoth'
import { pdfjs } from 'react-pdf'
import Toast from '@/components/ui/Toast'

interface Resume {
  id: string
  name: string
  filename: string
  size: string
  uploadDate: string
  isDefault: boolean
  version: number
  notes?: string
}

interface Suggestion {
  type: 'keyword' | 'skill' | 'improvement' | 'tip'
  text: string
  priority: 'high' | 'medium' | 'low'
}


export default function UpdateResumePage() {
  const [currentResume, setCurrentResume] = useState<Resume | null>(null)
  const [resumeHistory, setResumeHistory] = useState<Resume[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [aiScore, setAiScore] = useState(0)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [missingKeywords, setMissingKeywords] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAIReview, setHasAIReview] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedResume = localStorage.getItem('currentResume')
    const savedHistory = localStorage.getItem('resumeHistory')
    
    if (savedResume) {
      setCurrentResume(JSON.parse(savedResume))
    }
    if (savedHistory) {
      setResumeHistory(JSON.parse(savedHistory))
    }
  }, [])

  const showNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setCurrentFile(file)
    setHasAIReview(false)
    
    // Create file URL for preview
    const url = URL.createObjectURL(file)
    setFileUrl(url)

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newResume: Resume = {
      id: Date.now().toString(),
      name: file.name,
      filename: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toLocaleDateString(),
      isDefault: false,
      version: resumeHistory.length + 1,
    }

    // Move current resume to history if exists
    if (currentResume) {
      const updatedHistory = [currentResume, ...resumeHistory].slice(0, 10)
      setResumeHistory(updatedHistory)
      localStorage.setItem('resumeHistory', JSON.stringify(updatedHistory))
    }

    setCurrentResume(newResume)
    localStorage.setItem('currentResume', JSON.stringify(newResume))
    setIsUploading(false)
    showNotification('Resume uploaded successfully!')
  }

  const handleRunAIReview = async () => {
    if (!currentFile) return
    
    setIsAnalyzing(true)
    
    try {
      // Extract text from file
      let extractedText = ''
      
      if (currentFile.type === 'application/pdf') {
        // For PDF extraction, we'd normally use pdf.js
        // This is a mock for demonstration
        extractedText = 'Mock extracted PDF text...'
      } else if (currentFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Extract text from DOCX
        const arrayBuffer = await currentFile.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        extractedText = result.value
      }
      
      // Check for PII
      const piiCheck = detectPII(extractedText)
      if (piiCheck.hasPII) {
        showNotification('PII detected! Please remove sensitive information before analysis.')
        setIsAnalyzing(false)
        return
      }
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI results
      setAiScore(85)
      setKeywords(['TS/SCI', 'AWS', 'React', 'Node.js', 'Agile', 'Docker', 'Kubernetes'])
      setMissingKeywords(['Python', 'Jenkins', 'Terraform', 'CISSP'])
      setSuggestions([
        {
          type: 'keyword',
          text: 'Add AWS Certified Security certification to strengthen cloud credentials',
          priority: 'high'
        },
        {
          type: 'skill',
          text: 'Include experience with SIEM tools to align with security roles',
          priority: 'medium'
        },
        {
          type: 'improvement',
          text: 'Quantify accomplishments - e.g., "Managed 50+ servers" instead of "Managed servers"',
          priority: 'high'
        },
        {
          type: 'tip',
          text: 'Consider mentioning cloud migration experience for senior positions',
          priority: 'low'
        }
      ])
      
      setHasAIReview(true)
      setIsAnalyzing(false)
      showNotification('AI analysis complete!')
      
    } catch (error) {
      console.error('Error during AI analysis:', error)
      setIsAnalyzing(false)
      showNotification('Error analyzing resume. Please try again.')
    }
  }
  
  const handleDownloadReport = () => {
    // Generate and download AI suggestions report
    const report = {
      score: aiScore,
      keywords,
      missingKeywords,
      suggestions,
      date: new Date().toLocaleDateString()
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume-ai-analysis.json'
    a.click()
    URL.revokeObjectURL(url)
    
    showNotification('Report downloaded successfully!')
  }

  const handleDeleteResume = () => {
    setCurrentResume(null)
    setCurrentFile(null)
    setFileUrl(null)
    setHasAIReview(false)
    setAiScore(0)
    setSuggestions([])
    setKeywords([])
    setMissingKeywords([])
    localStorage.removeItem('currentResume')
    showNotification('Resume deleted successfully')
  }

  const handleSetDefault = (value: boolean) => {
    if (currentResume) {
      const updatedResume = { ...currentResume, isDefault: value }
      setCurrentResume(updatedResume)
      localStorage.setItem('currentResume', JSON.stringify(updatedResume))
      showNotification(value ? 'Resume set as default' : 'Default status removed')
    }
  }

  const handleRestoreVersion = (versionId: string) => {
    const versionToRestore = resumeHistory.find(r => r.id === versionId)
    if (versionToRestore) {
      // Move current to history
      if (currentResume) {
        const updatedHistory = [currentResume, ...resumeHistory.filter(r => r.id !== versionId)]
        setResumeHistory(updatedHistory)
        localStorage.setItem('resumeHistory', JSON.stringify(updatedHistory))
      }

      setCurrentResume(versionToRestore)
      localStorage.setItem('currentResume', JSON.stringify(versionToRestore))
      showNotification('Resume version restored successfully')
      
      // Re-analyze
      setIsAnalyzing(true)
      setTimeout(() => {
        setIsAnalyzing(false)
      }, 2000)
    }
  }

  const handlePreviewVersion = (versionId: string) => {
    // Preview functionality would be implemented here
    console.log('Preview version:', versionId)
  }

  const handleUpdateNotes = (versionId: string, notes: string) => {
    const updatedHistory = resumeHistory.map(resume =>
      resume.id === versionId ? { ...resume, notes } : resume
    )
    setResumeHistory(updatedHistory)
    localStorage.setItem('resumeHistory', JSON.stringify(updatedHistory))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Binary Pattern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="text-dynamic-green font-mono text-lg leading-relaxed">
            {Array(30).fill(null).map((_, i) => (
              <div key={i} className="whitespace-nowrap">
                {Array(15).fill('01101000 01100101 01101100 01110000 00100000 ').join('')}
              </div>
            ))}
          </div>
        </div>
        {/* Scattered larger binary numbers */}
        <div className="absolute top-10 left-20 text-cyber-cyan opacity-10 font-mono text-4xl transform rotate-12">
          01010011
        </div>
        <div className="absolute top-40 right-32 text-dynamic-green opacity-10 font-mono text-3xl transform -rotate-6">
          11001010
        </div>
        <div className="absolute bottom-20 left-40 text-sky-blue opacity-10 font-mono text-5xl transform rotate-45">
          10110
        </div>
        <div className="absolute bottom-40 right-20 text-emerald-green opacity-10 font-mono text-3xl transform -rotate-12">
          01101110
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Update Resume</h1>
          <p className="mt-2 text-gray-400">
            Upload and manage your resume to match with cleared jobs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Version History */}
          <div className="lg:col-span-1">
            <ResumeVersionList
              versions={resumeHistory}
              onRestore={handleRestoreVersion}
              onPreview={handlePreviewVersion}
              onUpdateNotes={handleUpdateNotes}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Resume Upload Card */}
              <div>
                <EnhancedResumeCard
                  currentResume={currentResume}
                  onUpload={handleFileUpload}
                  onDelete={handleDeleteResume}
                  onSetDefault={handleSetDefault}
                  onRunAIReview={handleRunAIReview}
                  isUploading={isUploading}
                  hasAIReview={hasAIReview}
                />
              </div>

              {/* Resume Preview */}
              <div>
                <ResumePreview
                  file={currentFile}
                  fileUrl={fileUrl}
                />
              </div>
            </div>

            {/* AI Suggestions Panel */}
            {(hasAIReview || isAnalyzing) && (
              <AISuggestionsPanel
                score={aiScore}
                suggestions={suggestions}
                keywords={keywords}
                missingKeywords={missingKeywords}
                isAnalyzing={isAnalyzing}
                onDownloadReport={handleDownloadReport}
              />
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}