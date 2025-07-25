'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  Download,
  Trash2,
  Search,
  Filter,
  FolderOpen,
  File,
  Image,
  FileCheck,
  FileX,
  ChevronLeft,
  Eye,
  Share2,
  Clock,
  Shield,
  Award,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Document {
  id: string
  name: string
  type: 'resume' | 'certification' | 'transcript' | 'clearance' | 'other'
  size: string
  uploadDate: string
  lastModified: string
  status: 'active' | 'expired' | 'pending'
  category: string
  tags: string[]
  sharedWith: string[]
}

const documentTypeIcons = {
  resume: FileText,
  certification: Award,
  transcript: FileCheck,
  clearance: Shield,
  other: File
}

const documentTypeColors = {
  resume: 'text-blue-500 bg-blue-500/20',
  certification: 'text-green-500 bg-green-500/20',
  transcript: 'text-purple-500 bg-purple-500/20',
  clearance: 'text-red-500 bg-red-500/20',
  other: 'text-gray-500 bg-gray-500/20'
}

export default function DocumentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      // Load documents from localStorage
      const savedDocs = localStorage.getItem('userDocuments')
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs))
      } else {
        // Default documents for demo
        const defaultDocs: Document[] = [
          {
            id: '1',
            name: 'Resume_2025_Final.pdf',
            type: 'resume',
            size: '2.4 MB',
            uploadDate: '2025-01-15',
            lastModified: '2025-01-15',
            status: 'active',
            category: 'Career Documents',
            tags: ['latest', 'tech', 'cleared'],
            sharedWith: []
          },
          {
            id: '2',
            name: 'Security_Plus_Certificate.pdf',
            type: 'certification',
            size: '1.2 MB',
            uploadDate: '2024-06-20',
            lastModified: '2024-06-20',
            status: 'active',
            category: 'Certifications',
            tags: ['CompTIA', 'security', 'valid'],
            sharedWith: ['TechCorp', 'CyberSec Inc']
          },
          {
            id: '3',
            name: 'TS_SCI_Clearance_Verification.pdf',
            type: 'clearance',
            size: '856 KB',
            uploadDate: '2023-03-10',
            lastModified: '2023-03-10',
            status: 'active',
            category: 'Security Clearance',
            tags: ['TS/SCI', 'active', 'verified'],
            sharedWith: ['Federal Systems LLC']
          },
          {
            id: '4',
            name: 'Bachelor_Degree_Transcript.pdf',
            type: 'transcript',
            size: '3.1 MB',
            uploadDate: '2022-05-15',
            lastModified: '2022-05-15',
            status: 'active',
            category: 'Education',
            tags: ['BS', 'Computer Science', 'official'],
            sharedWith: []
          },
          {
            id: '5',
            name: 'AWS_Solutions_Architect.pdf',
            type: 'certification',
            size: '1.8 MB',
            uploadDate: '2024-11-01',
            lastModified: '2024-11-01',
            status: 'active',
            category: 'Certifications',
            tags: ['AWS', 'cloud', 'architect'],
            sharedWith: ['CloudTech Solutions']
          }
        ]
        setDocuments(defaultDocs)
        localStorage.setItem('userDocuments', JSON.stringify(defaultDocs))
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: determineDocType(file.name),
      size: formatFileSize(file.size),
      uploadDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: 'active',
      category: 'Uncategorized',
      tags: [],
      sharedWith: []
    }

    const updatedDocs = [...documents, newDoc]
    setDocuments(updatedDocs)
    localStorage.setItem('userDocuments', JSON.stringify(updatedDocs))
    setIsUploading(false)
  }

  const determineDocType = (filename: string): Document['type'] => {
    const lower = filename.toLowerCase()
    if (lower.includes('resume') || lower.includes('cv')) return 'resume'
    if (lower.includes('cert') || lower.includes('certificate')) return 'certification'
    if (lower.includes('transcript')) return 'transcript'
    if (lower.includes('clearance') || lower.includes('security')) return 'clearance'
    return 'other'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDelete = (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id)
    setDocuments(updatedDocs)
    localStorage.setItem('userDocuments', JSON.stringify(updatedDocs))
  }

  const handleShare = (doc: Document, company: string) => {
    const updatedDocs = documents.map(d => 
      d.id === doc.id 
        ? { ...d, sharedWith: [...d.sharedWith, company] }
        : d
    )
    setDocuments(updatedDocs)
    localStorage.setItem('userDocuments', JSON.stringify(updatedDocs))
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesFilter
  })

  const documentStats = {
    total: documents.length,
    active: documents.filter(d => d.status === 'active').length,
    shared: documents.filter(d => d.sharedWith.length > 0).length,
    recent: documents.filter(d => {
      const uploadDate = new Date(d.uploadDate)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return uploadDate > thirtyDaysAgo
    }).length
  }

  if (!user) {
    return (
      <div className="min-h-screen glass-bg py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-blue"></div>
      </div>
    )
  }

  return (
    <section className="min-h-screen glass-bg py-20">
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
            className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-montserrat font-bold mb-2 text-white">
                Document Management
              </h1>
              <p className="text-gray-400">
                Store and manage your important career documents
              </p>
            </div>
            <label className="bg-gradient-to-r from-sky-blue to-neon-green text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center cursor-pointer">
              <Upload size={20} className="mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Document'}
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={isUploading}
              />
            </label>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Documents</p>
                <p className="text-2xl font-bold text-white">{documentStats.total}</p>
              </div>
              <FolderOpen className="text-sky-blue" size={32} />
            </div>
          </div>
          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{documentStats.active}</p>
              </div>
              <FileCheck className="text-green-500" size={32} />
            </div>
          </div>
          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Shared</p>
                <p className="text-2xl font-bold text-white">{documentStats.shared}</p>
              </div>
              <Share2 className="text-purple-500" size={32} />
            </div>
          </div>
          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Recent</p>
                <p className="text-2xl font-bold text-white">{documentStats.recent}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="glass-card rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white"
              >
                <option value="all">All Types</option>
                <option value="resume">Resumes</option>
                <option value="certification">Certifications</option>
                <option value="transcript">Transcripts</option>
                <option value="clearance">Clearance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc, index) => {
            const Icon = documentTypeIcons[doc.type]
            const colorClass = documentTypeColors[doc.type]
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-lg p-6 hover:bg-gray-700/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClass}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 text-white truncate">{doc.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{doc.category}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Size:</span>
                    <span>{doc.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Uploaded:</span>
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                  </div>
                  {doc.sharedWith.length > 0 && (
                    <div className="flex items-center text-purple-400">
                      <Share2 size={14} className="mr-1" />
                      <span className="text-xs">Shared with {doc.sharedWith.length} companies</span>
                    </div>
                  )}
                </div>
                
                {doc.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 glass-card rounded-lg p-6"
        >
          <h2 className="text-xl font-montserrat font-bold mb-4 text-white">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 glass-card rounded-lg hover:bg-gray-700 transition-colors text-left">
              <Briefcase className="text-sky-blue mb-2" size={24} />
              <h3 className="font-semibold mb-1">Create Application Package</h3>
              <p className="text-sm text-gray-400">Bundle documents for job applications</p>
            </button>
            <button className="p-4 glass-card rounded-lg hover:bg-gray-700 transition-colors text-left">
              <Shield className="text-neon-green mb-2" size={24} />
              <h3 className="font-semibold mb-1">Verify Clearance</h3>
              <p className="text-sm text-gray-400">Update clearance verification status</p>
            </button>
            <button className="p-4 glass-card rounded-lg hover:bg-gray-700 transition-colors text-left">
              <Award className="text-purple-500 mb-2" size={24} />
              <h3 className="font-semibold mb-1">Add Certification</h3>
              <p className="text-sm text-gray-400">Upload new professional certifications</p>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}