'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, User, Shield, Briefcase, Award, MapPin, Brain } from 'lucide-react'

interface ParsedResume {
  name: string
  email: string
  phone: string
  location: string
  clearance: string
  yearsExperience: number
  currentRole: string
  skills: string[]
  certifications: string[]
  education: string
  matchScore: number
  keyHighlights: string[]
}

export default function ResumeParser() {
  const [isDragging, setIsDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null)
  const [fileName, setFileName] = useState('')

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    setFileName(file.name)
    setParsing(true)

    // Simulate AI parsing
    setTimeout(() => {
      const mockParsedData: ParsedResume = {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (703) 555-0123',
        location: 'Arlington, VA',
        clearance: 'Top Secret/SCI',
        yearsExperience: 8,
        currentRole: 'Senior Cloud Engineer',
        skills: [
          'AWS', 'Azure', 'Kubernetes', 'Docker', 'Terraform',
          'Python', 'Go', 'Jenkins', 'GitOps', 'Ansible'
        ],
        certifications: [
          'AWS Solutions Architect Professional',
          'Certified Kubernetes Administrator',
          'HashiCorp Terraform Associate',
          'Security+'
        ],
        education: 'B.S. Computer Science - Virginia Tech',
        matchScore: 92,
        keyHighlights: [
          'Led migration of 50+ microservices to Kubernetes',
          'Reduced infrastructure costs by 40% through optimization',
          'Implemented zero-downtime deployment pipeline',
          'Active TS/SCI clearance with CI Poly'
        ]
      }

      setParsedData(mockParsedData)
      setParsing(false)
    }, 3000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="text-neon-green" size={32} />
          <h2 className="text-2xl font-bold text-white">AI Resume Parser</h2>
        </div>

        {!parsedData ? (
          <>
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging 
                  ? 'border-sky-blue bg-sky-blue/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {parsing ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <Brain className="mx-auto text-neon-green mb-4" size={48} />
                  </div>
                  <p className="text-xl text-white">Parsing {fileName}...</p>
                  <p className="text-gray-400">AI is extracting candidate information</p>
                  <div className="max-w-xs mx-auto mt-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-blue to-neon-green animate-pulse" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-xl text-white mb-2">Drop resume here or click to upload</p>
                  <p className="text-gray-400">Supports PDF, DOC, DOCX, and TXT files</p>
                </>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
                <p className="text-sm text-gray-300">Instant Parsing</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto text-sky-blue mb-2" size={24} />
                <p className="text-sm text-gray-300">Clearance Detection</p>
              </div>
              <div className="text-center">
                <Brain className="mx-auto text-neon-green mb-2" size={24} />
                <p className="text-sm text-gray-300">AI-Powered Analysis</p>
              </div>
            </div>
          </>
        ) : (
          /* Parsed Results */
          <div className="space-y-6">
            {/* Header with Match Score */}
            <div className="flex items-center justify-between border-b border-gray-700 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{parsedData.name}</h3>
                <p className="text-gray-400">{parsedData.currentRole}</p>
              </div>
              <div className="text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      strokeDashoffset={`${2 * Math.PI * 35 * (1 - parsedData.matchScore / 100)}`}
                      className="text-neon-green"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{parsedData.matchScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-1">Match Score</p>
              </div>
            </div>

            {/* Contact & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <User size={16} className="text-gray-400" />
                  <span>{parsedData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FileText size={16} className="text-gray-400" />
                  <span>{parsedData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{parsedData.location}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-sky-blue" />
                  <span className="px-3 py-1 bg-sky-blue/20 text-sky-blue rounded-full text-sm">
                    {parsedData.clearance}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase size={16} className="text-gray-400" />
                  <span>{parsedData.yearsExperience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Award size={16} className="text-gray-400" />
                  <span>{parsedData.education}</span>
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Key Highlights</h4>
              <ul className="space-y-2">
                {parsedData.keyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Certifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {parsedData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300">
                    <Award size={16} className="text-yellow-500" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-700">
              <button className="px-6 py-2 bg-gradient-to-r from-sky-blue to-neon-green text-white rounded-lg hover:shadow-lg transition-all">
                Add to Talent Pool
              </button>
              <button className="px-6 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all">
                Schedule Interview
              </button>
              <button className="px-6 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all">
                Export Profile
              </button>
              <button 
                onClick={() => {
                  setParsedData(null)
                  setFileName('')
                }}
                className="px-6 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all ml-auto"
              >
                Parse Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}