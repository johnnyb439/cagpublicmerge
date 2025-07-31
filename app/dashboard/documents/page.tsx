'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Upload, Download, Trash2, Edit2, Share2,
  FileText, File, Image, Archive, Shield, Lock,
  Folder, FolderOpen, Plus, Search, Filter, Grid,
  List, Clock, Star, Eye, Copy, Move, MoreVertical,
  CheckCircle, AlertCircle, FileCheck, FilePlus
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface Document {
  id: string
  name: string
  type: 'resume' | 'certification' | 'clearance' | 'dd214' | 'transcript' | 'cover_letter' | 'other'
  size: string
  uploadDate: string
  lastModified: string
  status: 'active' | 'archived' | 'pending'
  shared: boolean
  secured: boolean
  downloads: number
  category: string
}

interface Folder {
  id: string
  name: string
  count: number
  icon: any
  color: string
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'John_Doe_Resume_2025.pdf',
    type: 'resume',
    size: '256 KB',
    uploadDate: '2025-07-28',
    lastModified: '2 days ago',
    status: 'active',
    shared: true,
    secured: false,
    downloads: 15,
    category: 'Career Documents'
  },
  {
    id: '2',
    name: 'Security_Plus_Certificate.pdf',
    type: 'certification',
    size: '1.2 MB',
    uploadDate: '2025-07-20',
    lastModified: '1 week ago',
    status: 'active',
    shared: false,
    secured: true,
    downloads: 3,
    category: 'Certifications'
  },
  {
    id: '3',
    name: 'DD-214_Discharge.pdf',
    type: 'dd214',
    size: '890 KB',
    uploadDate: '2025-06-15',
    lastModified: '1 month ago',
    status: 'active',
    shared: false,
    secured: true,
    downloads: 2,
    category: 'Military Records'
  },
  {
    id: '4',
    name: 'Secret_Clearance_Verification.pdf',
    type: 'clearance',
    size: '445 KB',
    uploadDate: '2025-07-01',
    lastModified: '3 weeks ago',
    status: 'active',
    shared: false,
    secured: true,
    downloads: 5,
    category: 'Security Clearance'
  }
]

const folders: Folder[] = [
  { id: '1', name: 'Career Documents', count: 8, icon: FileText, color: 'from-blue-600 to-cyan-600' },
  { id: '2', name: 'Certifications', count: 5, icon: FileCheck, color: 'from-emerald-600 to-green-600' },
  { id: '3', name: 'Military Records', count: 3, icon: Shield, color: 'from-orange-600 to-red-600' },
  { id: '4', name: 'Security Clearance', count: 2, icon: Lock, color: 'from-purple-600 to-indigo-600' },
  { id: '5', name: 'Education', count: 4, icon: Archive, color: 'from-amber-600 to-yellow-600' },
  { id: '6', name: 'Cover Letters', count: 6, icon: File, color: 'from-gray-600 to-slate-600' }
]

const storageData = [
  { name: 'Documents', value: 45, fill: '#3B82F6' },
  { name: 'Images', value: 20, fill: '#10B981' },
  { name: 'Archives', value: 15, fill: '#F59E0B' },
  { name: 'Other', value: 20, fill: '#6B7280' }
]

const activityData = [
  { day: 'Mon', uploads: 4, downloads: 8 },
  { day: 'Tue', uploads: 2, downloads: 12 },
  { day: 'Wed', uploads: 6, downloads: 10 },
  { day: 'Thu', uploads: 3, downloads: 15 },
  { day: 'Fri', uploads: 5, downloads: 20 },
  { day: 'Sat', uploads: 1, downloads: 5 },
  { day: 'Sun', uploads: 2, downloads: 3 }
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = !selectedFolder || doc.category === selectedFolder
    return matchesSearch && matchesFolder
  })

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId))
  }

  const handleDownload = (doc: Document) => {
    // Update download count
    setDocuments(documents.map(d => 
      d.id === doc.id ? { ...d, downloads: d.downloads + 1 } : d
    ))
  }

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'resume': return FileText
      case 'certification': return FileCheck
      case 'clearance': return Shield
      case 'dd214': return Shield
      case 'transcript': return Archive
      case 'cover_letter': return File
      default: return File
    }
  }

  const getDocumentColor = (type: Document['type']) => {
    switch (type) {
      case 'resume': return 'text-blue-600'
      case 'certification': return 'text-emerald-600'
      case 'clearance': return 'text-purple-600'
      case 'dd214': return 'text-orange-600'
      case 'transcript': return 'text-amber-600'
      case 'cover_letter': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const totalSize = '12.5 MB'
  const storageLimit = '100 MB'
  const storageUsed = 12.5

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
                Documents
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your career documents securely
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-dynamic-green to-emerald-green text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Upload size={20} className="mr-2" />
              Upload Document
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Storage Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Storage Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={storageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {storageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <p className="text-2xl font-bold">{totalSize}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">of {storageLimit} used</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-dynamic-green to-emerald-green"
                    style={{ width: `${(storageUsed / 100) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Folders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Folders</h3>
                <button className="text-dynamic-green hover:text-emerald-green">
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    !selectedFolder ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <FolderOpen size={20} className="mr-3 text-gray-600" />
                    <span>All Documents</span>
                  </div>
                  <span className="text-sm text-gray-500">{documents.length}</span>
                </button>
                
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedFolder === folder.name ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${folder.color} text-white mr-3`}>
                        <folder.icon size={16} />
                      </div>
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{folder.count}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {selectedDocs.length > 0 && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDocs.length} selected
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    <Download size={16} className="inline mr-1" />
                    Download
                  </button>
                  <button className="text-sm text-green-600 hover:text-green-700">
                    <Share2 size={16} className="inline mr-1" />
                    Share
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-700">
                    <Trash2 size={16} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </motion.div>

            {/* Documents List/Grid */}
            {viewMode === 'list' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md overflow-hidden"
              >
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDocuments.map((doc) => {
                      const Icon = getDocumentIcon(doc.type)
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedDocs.includes(doc.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDocs([...selectedDocs, doc.id])
                                  } else {
                                    setSelectedDocs(selectedDocs.filter(id => id !== doc.id))
                                  }
                                }}
                                className="mr-3"
                              />
                              <Icon size={20} className={`mr-3 ${getDocumentColor(doc.type)}`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.downloads} downloads
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {doc.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {doc.size}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {doc.lastModified}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {doc.secured && (
                                <Lock size={16} className="text-amber-600" />
                              )}
                              {doc.shared && (
                                <Share2 size={16} className="text-blue-600" />
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                doc.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                <Download size={16} className="text-gray-600 dark:text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                <Share2 size={16} className="text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc, index) => {
                  const Icon = getDocumentIcon(doc.type)
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Icon size={32} className={getDocumentColor(doc.type)} />
                        <div className="flex items-center gap-2">
                          {doc.secured && <Lock size={16} className="text-amber-600" />}
                          {doc.shared && <Share2 size={16} className="text-blue-600" />}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                        {doc.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {doc.size} • {doc.lastModified}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {doc.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Download size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Bar dataKey="uploads" fill="#10B981" name="Uploads" />
                  <Bar dataKey="downloads" fill="#3B82F6" name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}