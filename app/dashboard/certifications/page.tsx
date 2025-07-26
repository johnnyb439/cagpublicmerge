'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Calendar,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Filter,
  Search,
  BarChart3,
  Users,
  TrendingUp,
  X,
  Save
} from 'lucide-react'

interface Certification {
  id: string
  name: string
  issuer: string
  description: string
  dateEarned: string
  expirationDate: string
  credentialId?: string
  verificationUrl?: string
  category: 'security' | 'cloud' | 'networking' | 'project-management' | 'programming' | 'other'
  status: 'active' | 'expired' | 'expiring-soon'
  reminderSet: boolean
  priority: 'high' | 'medium' | 'low'
}

const categoryColors = {
  security: 'text-red-600 bg-red-100 dark:bg-red-900',
  cloud: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
  networking: 'text-green-600 bg-green-100 dark:bg-green-900',
  'project-management': 'text-purple-600 bg-purple-100 dark:bg-purple-900',
  programming: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
  other: 'text-gray-600 bg-gray-100 dark:bg-gray-900'
}

const statusColors = {
  active: 'text-green-600 bg-green-100 dark:bg-green-900',
  expired: 'text-red-600 bg-red-100 dark:bg-red-900',
  'expiring-soon': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCert, setEditingCert] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'dateEarned' | 'expirationDate'>('expirationDate')
  const [newCert, setNewCert] = useState<Partial<Certification>>({
    category: 'security',
    priority: 'medium',
    reminderSet: true
  })

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/certifications?userId=1')
      const result = await response.json()
      
      if (result.success) {
        // Process certifications to determine status based on expiration
        const processedCerts = result.data.map((cert: any) => {
          const today = new Date()
          const expirationDate = new Date(cert.expirationDate)
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          let status: Certification['status'] = 'active'
          if (daysUntilExpiration < 0) {
            status = 'expired'
          } else if (daysUntilExpiration <= 30) {
            status = 'expiring-soon'
          }
          
          return {
            ...cert,
            status
          }
        })
        
        setCertifications(processedCerts)
      }
    } catch (error) {
      console.error('Error fetching certifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCertification = async () => {
    if (!newCert.name || !newCert.issuer || !newCert.dateEarned || !newCert.expirationDate) return

    try {
      const certification: Certification = {
        id: Date.now().toString(),
        name: newCert.name,
        issuer: newCert.issuer,
        description: newCert.description || '',
        dateEarned: newCert.dateEarned,
        expirationDate: newCert.expirationDate,
        credentialId: newCert.credentialId,
        verificationUrl: newCert.verificationUrl,
        category: newCert.category as Certification['category'],
        status: 'active',
        reminderSet: newCert.reminderSet || false,
        priority: newCert.priority as Certification['priority']
      }

      // Determine status based on expiration
      const today = new Date()
      const expirationDate = new Date(certification.expirationDate)
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiration < 0) {
        certification.status = 'expired'
      } else if (daysUntilExpiration <= 30) {
        certification.status = 'expiring-soon'
        
        // Schedule certification reminder notification
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: '1',
              action: 'schedule_cert_reminder',
              certificationName: certification.name,
              expirationDate: certification.expirationDate,
              daysRemaining: daysUntilExpiration,
              userName: 'User'
            })
          })
        } catch (error) {
          console.error('Error scheduling certification reminder:', error)
        }
      }

      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          certification
        })
      })

      if (response.ok) {
        setCertifications([...certifications, certification])
        setShowAddForm(false)
        setNewCert({
          category: 'security',
          priority: 'medium',
          reminderSet: true
        })
      }
    } catch (error) {
      console.error('Error saving certification:', error)
    }
  }

  const deleteCertification = async (certId: string) => {
    try {
      const response = await fetch(`/api/certifications?userId=1&certId=${certId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCertifications(certifications.filter(cert => cert.id !== certId))
      }
    } catch (error) {
      console.error('Error deleting certification:', error)
    }
  }

  const updateCertification = async (certId: string, updates: Partial<Certification>) => {
    try {
      const response = await fetch('/api/certifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          certId,
          updates
        })
      })

      if (response.ok) {
        setCertifications(certifications.map(cert => 
          cert.id === certId ? { ...cert, ...updates } : cert
        ))
      }
    } catch (error) {
      console.error('Error updating certification:', error)
    }
  }

  // Filter and sort certifications
  const filteredCertifications = certifications
    .filter(cert => {
      const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'dateEarned':
          return new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime()
        case 'expirationDate':
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
        default:
          return 0
      }
    })

  // Statistics
  const totalCerts = certifications.length
  const activeCerts = certifications.filter(cert => cert.status === 'active').length
  const expiringSoon = certifications.filter(cert => cert.status === 'expiring-soon').length
  const expired = certifications.filter(cert => cert.status === 'expired').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-montserrat font-bold mb-1">
                Certification Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your professional certifications and track expiration dates
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Certification
            </button>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-dynamic-green">{totalCerts}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Certifications</p>
              </div>
              <Award className="text-dynamic-green" size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCerts}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              </div>
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{expiringSoon}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
              </div>
              <Clock className="text-yellow-600" size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{expired}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search certifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="all">All Categories</option>
              <option value="security">Security</option>
              <option value="cloud">Cloud</option>
              <option value="networking">Networking</option>
              <option value="project-management">Project Management</option>
              <option value="programming">Programming</option>
              <option value="other">Other</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'dateEarned' | 'expirationDate')}
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="expirationDate">Sort by Expiration</option>
              <option value="name">Sort by Name</option>
              <option value="dateEarned">Sort by Date Earned</option>
            </select>
          </div>
        </motion.div>

        {/* Add Certification Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Add New Certification</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Certification Name *"
                value={newCert.name || ''}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />

              <input
                type="text"
                placeholder="Issuing Organization *"
                value={newCert.issuer || ''}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />

              <input
                type="date"
                placeholder="Date Earned *"
                value={newCert.dateEarned || ''}
                onChange={(e) => setNewCert({ ...newCert, dateEarned: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />

              <input
                type="date"
                placeholder="Expiration Date *"
                value={newCert.expirationDate || ''}
                onChange={(e) => setNewCert({ ...newCert, expirationDate: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />

              <input
                type="text"
                placeholder="Credential ID"
                value={newCert.credentialId || ''}
                onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />

              <input
                type="url"
                placeholder="Verification URL"
                value={newCert.verificationUrl || ''}
                onChange={(e) => setNewCert({ ...newCert, verificationUrl: e.target.value })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              />

              <select
                value={newCert.category}
                onChange={(e) => setNewCert({ ...newCert, category: e.target.value as Certification['category'] })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="security">Security</option>
                <option value="cloud">Cloud</option>
                <option value="networking">Networking</option>
                <option value="project-management">Project Management</option>
                <option value="programming">Programming</option>
                <option value="other">Other</option>
              </select>

              <select
                value={newCert.priority}
                onChange={(e) => setNewCert({ ...newCert, priority: e.target.value as Certification['priority'] })}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <textarea
                placeholder="Description"
                value={newCert.description || ''}
                onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
                className="md:col-span-2 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                rows={3}
              />
            </div>

            <div className="flex items-center mt-4 mb-6">
              <input
                type="checkbox"
                id="reminderSet"
                checked={newCert.reminderSet || false}
                onChange={(e) => setNewCert({ ...newCert, reminderSet: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="reminderSet" className="text-sm text-gray-600 dark:text-gray-400">
                Set expiration reminder (30 days before)
              </label>
            </div>

            <button
              onClick={saveCertification}
              disabled={!newCert.name || !newCert.issuer || !newCert.dateEarned || !newCert.expirationDate}
              className="w-full py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors disabled:opacity-50"
            >
              <Save size={16} className="inline mr-2" />
              Save Certification
            </button>
          </motion.div>
        )}

        {/* Certifications List */}
        <div className="space-y-4">
          {filteredCertifications.length === 0 ? (
            <div className="text-center py-12">
              <Award className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No certifications found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first certification to get started'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
                >
                  Add Your First Certification
                </button>
              )}
            </div>
          ) : (
            filteredCertifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold mr-3">{cert.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[cert.category]}`}>
                        {cert.category.replace('-', ' ')}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${statusColors[cert.status]}`}>
                        {cert.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{cert.issuer}</p>
                    {cert.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">{cert.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCert(cert.id)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteCertification(cert.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="mr-2" />
                    Earned: {new Date(cert.dateEarned).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock size={16} className="mr-2" />
                    Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                  </div>
                  {cert.credentialId && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Award size={16} className="mr-2" />
                      ID: {cert.credentialId}
                    </div>
                  )}
                </div>

                {cert.verificationUrl && (
                  <div className="mt-4">
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-dynamic-green hover:text-emerald-green transition-colors"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Verify Certification
                    </a>
                  </div>
                )}

                {cert.status === 'expiring-soon' && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="text-yellow-600 mr-2" size={16} />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        This certification expires in {Math.ceil((new Date(cert.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                )}

                {cert.status === 'expired' && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="text-red-600 mr-2" size={16} />
                      <span className="text-sm text-red-800 dark:text-red-200">
                        This certification expired on {new Date(cert.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}