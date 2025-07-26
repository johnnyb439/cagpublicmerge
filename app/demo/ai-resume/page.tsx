'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Target, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react'
import AIResumeReviewer from '@/components/ai/AIResumeReviewer'
import { ResumeAnalysisResult } from '@/types/ai-resume'

export default function AIResumeDemoPage() {
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null)
  const [selectedJobDescription, setSelectedJobDescription] = useState('')

  const sampleJobDescriptions = [
    {
      title: 'Senior Software Engineer - Defense Contractor',
      description: `We are seeking a Senior Software Engineer with an active security clearance to join our defense contracting team.

Requirements:
- Bachelor's degree in Computer Science or related field
- 5+ years of software development experience
- Active Secret or Top Secret security clearance
- Proficiency in Java, Python, and JavaScript
- Experience with AWS cloud services
- Knowledge of agile development methodologies
- Strong problem-solving and communication skills
- Experience with DevOps practices and CI/CD pipelines

Preferred Qualifications:
- Master's degree in Computer Science
- TS/SCI clearance with polygraph
- CompTIA Security+ certification
- Experience with containerization (Docker, Kubernetes)
- Knowledge of cybersecurity best practices
- Experience working with government clients`
    },
    {
      title: 'Cybersecurity Analyst - Federal Agency',
      description: `Federal agency seeks a Cybersecurity Analyst to protect critical infrastructure and sensitive data.

Requirements:
- Bachelor's degree in Cybersecurity, Information Security, or related field
- 3+ years of cybersecurity experience
- Active Secret security clearance (TS/SCI preferred)
- CISSP, CISA, or CISM certification
- Experience with SIEM tools and incident response
- Knowledge of NIST Cybersecurity Framework
- Understanding of network security principles
- Strong analytical and documentation skills

Preferred Qualifications:
- CEH or GCIH certification
- Experience with penetration testing
- Knowledge of cloud security (AWS, Azure)
- Familiarity with compliance frameworks (FISMA, FedRAMP)
- Programming skills in Python or PowerShell`
    },
    {
      title: 'DevOps Engineer - Government Contractor',
      description: `Government contractor seeking a DevOps Engineer to support mission-critical applications.

Requirements:
- Bachelor's degree in Computer Science, Engineering, or related field
- 4+ years of DevOps experience
- Active security clearance (Secret minimum)
- Experience with AWS or Azure cloud platforms
- Proficiency in Infrastructure as Code (Terraform, CloudFormation)
- Knowledge of containerization and orchestration
- Experience with CI/CD pipelines (Jenkins, GitLab CI)
- Scripting skills in Python, Bash, or PowerShell

Preferred Qualifications:
- AWS Certified Solutions Architect
- Experience with monitoring tools (Prometheus, Grafana)
- Knowledge of security scanning tools
- Experience with government compliance requirements
- Agile/Scrum experience`
    }
  ]

  const handleAnalysisComplete = (result: ResumeAnalysisResult) => {
    setAnalysisResult(result)
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced OpenAI integration for comprehensive resume evaluation',
      color: 'text-blue-600'
    },
    {
      icon: Target,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Detailed Scoring',
      description: 'Get breakdown scores for keywords, formatting, and content',
      color: 'text-purple-600'
    },
    {
      icon: Sparkles,
      title: 'Real-time Feedback',
      description: 'Live optimization suggestions as you type',
      color: 'text-orange-600'
    }
  ]

  const technicalDetails = [
    {
      category: 'AI Integration',
      items: [
        'OpenAI GPT-4 for content analysis',
        'Natural Language Processing for keyword extraction',
        'Custom prompting for security-cleared positions',
        'Fallback analysis for reliability'
      ]
    },
    {
      category: 'Analysis Features',
      items: [
        'ATS compatibility scoring',
        'Grammar and spelling checks',
        'Keyword density analysis',
        'Content structure evaluation',
        'Achievement quantification assessment'
      ]
    },
    {
      category: 'Optimization',
      items: [
        'Real-time suggestions with debouncing',
        'Job description matching',
        'Security clearance optimization',
        'Action verb strengthening',
        'Quantification recommendations'
      ]
    },
    {
      category: 'Output',
      items: [
        'Overall rating with priority levels',
        'Detailed score breakdowns',
        'Actionable improvement items',
        'Time estimates for improvements',
        'Downloadable analysis reports'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Resume Reviewer Demo
            </h1>
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Experience our advanced AI-powered resume analysis system with real-time optimization, 
            ATS scoring, and tailored feedback for security-cleared professionals.
          </p>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-3`} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Job Description Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Optional: Select a Job Description for Targeted Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleJobDescriptions.map((job, index) => (
              <button
                key={index}
                onClick={() => setSelectedJobDescription(job.description)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedJobDescription === job.description
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Click to use for targeted resume analysis
                </p>
              </button>
            ))}
          </div>
          {selectedJobDescription && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Job description selected for analysis
                </span>
              </div>
              <button
                onClick={() => setSelectedJobDescription('')}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear selection
              </button>
            </div>
          )}
        </motion.div>

        {/* AI Resume Reviewer Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AIResumeReviewer
            jobDescription={selectedJobDescription}
            onAnalysisComplete={handleAnalysisComplete}
            className="mb-12"
          />
        </motion.div>

        {/* Technical Implementation Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalDetails.map((category, index) => (
              <div key={category.category}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {category.category}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* API Endpoints */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Available API Endpoints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                  POST /api/ai/resume-analysis
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Complete resume analysis with AI
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <code className="text-sm font-mono text-green-600 dark:text-green-400">
                  POST /api/ai/quick-analysis
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Fast ATS and grammar scoring
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <code className="text-sm font-mono text-purple-600 dark:text-purple-400">
                  POST /api/ai/realtime-optimization
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Live optimization suggestions
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              Analysis Complete!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {analysisResult.overallRating}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {analysisResult.atsScore.overall}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">ATS Compatible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {analysisResult.grammarCheck.overallScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Grammar Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {analysisResult.actionItems.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Improvements</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              {analysisResult.priority === 'high' ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">High Priority Improvements Available</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">Good Resume Foundation</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}