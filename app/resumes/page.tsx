'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react'

interface Resume {
  id: string
  userId: string
  title: string
  fileName: string
  savedFileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  url: string
  active: boolean
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check authentication on client side only
    const currentUser = localStorage.getItem('currentUser')
    setIsAuthenticated(!!currentUser)
    
    if (currentUser) {
      fetchResumes()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchResumes = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        setLoading(false)
        return
      }

      const user = JSON.parse(currentUser)
      const response = await fetch(`/api/resumes?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setResumes(data.resumes)
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    setUploadSuccess(false)

    try {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        setUploadError('Please sign in to upload a resume')
        setUploading(false)
        return
      }

      const user = JSON.parse(currentUser)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadSuccess(true)
        fetchResumes() // Refresh the list
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        setTimeout(() => {
          setUploadSuccess(false)
        }, 3000)
      } else {
        setUploadError(data.error || 'Failed to upload resume')
      }
    } catch (error) {
      setUploadError('An error occurred while uploading')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const response = await fetch(`/api/resumes?resumeId=${resumeId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchResumes() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show sign in required if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to manage your resumes</p>
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign In →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage your resumes</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            <p className="text-gray-600 mb-4">
              Drag and drop your resume here, or click to browse
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
              disabled={uploading}
            />
            
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Select File
                </>
              )}
            </label>
            
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </p>
            
            {uploadSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Resume uploaded successfully!
              </div>
            )}
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Resumes List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Resumes</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No resumes uploaded yet</p>
              <p className="text-sm text-gray-500 mt-2">Upload your first resume to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {resume.fileName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {formatFileSize(resume.fileSize)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Uploaded {formatDate(resume.uploadedAt)}
                          </span>
                          {resume.active && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Resume"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                      <a
                        href={resume.url}
                        download={resume.fileName}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Resume"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Resume"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Resume Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep your resume up to date with your latest experience</li>
                <li>Upload different versions for different job types</li>
                <li>Your active resume will be used for quick applications</li>
                <li>All resumes are stored securely and can be accessed anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}