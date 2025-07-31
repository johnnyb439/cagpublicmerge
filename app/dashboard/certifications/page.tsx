'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Award, Calendar, CheckCircle, XCircle,
  Clock, FileText, Trash2, Edit, Download, Upload,
  Shield, Cloud, Network, Database, Code, Lock
} from 'lucide-react'

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  category: string
  status: 'active' | 'expiring' | 'expired'
  icon: any
  color: string
}

const mockCertifications: Certification[] = [
  {
    id: '1',
    name: 'CompTIA Security+',
    issuer: 'CompTIA',
    issueDate: '2024-01-15',
    expiryDate: '2027-01-15',
    credentialId: 'COMP001234',
    category: 'Security',
    status: 'active',
    icon: Shield,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: '2',
    name: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    issueDate: '2023-11-20',
    expiryDate: '2025-11-20',
    credentialId: 'AWS-SAA-C03',
    category: 'Cloud',
    status: 'active',
    icon: Cloud,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: '3',
    name: 'CCNA',
    issuer: 'Cisco',
    issueDate: '2023-08-10',
    expiryDate: '2026-08-10',
    credentialId: 'CSCO001234',
    category: 'Network',
    status: 'active',
    icon: Network,
    color: 'from-green-500 to-teal-500'
  }
]

const popularCertifications = [
  { name: 'CompTIA Security+', icon: Shield, color: 'from-red-500 to-orange-500' },
  { name: 'AWS Cloud Practitioner', icon: Cloud, color: 'from-blue-500 to-indigo-500' },
  { name: 'CISSP', icon: Lock, color: 'from-purple-500 to-pink-500' },
  { name: 'Azure Fundamentals', icon: Cloud, color: 'from-sky-500 to-blue-500' },
  { name: 'CCNA', icon: Network, color: 'from-green-500 to-teal-500' },
  { name: 'PMP', icon: FileText, color: 'from-gray-500 to-gray-700' }
]

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>(mockCertifications)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    category: 'Other'
  })

  const totalCerts = certifications.length
  const activeCerts = certifications.filter(c => c.status === 'active').length
  const expiringSoon = certifications.filter(c => c.status === 'expiring').length
  const expiredCerts = certifications.filter(c => c.status === 'expired').length

  const handleAddCertification = () => {
    if (newCert.name && newCert.issuer) {
      const cert: Certification = {
        id: Date.now().toString(),
        ...newCert,
        status: 'active',
        icon: Shield,
        color: 'from-purple-500 to-pink-500'
      }
      setCertifications([...certifications, cert])
      setNewCert({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        category: 'Other'
      })
      setShowAddForm(false)
    }
  }

  const handleDeleteCertification = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id))
  }

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
                My Certifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track and manage your professional certifications
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-6 py-3 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Add Certification
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Award className="text-dynamic-blue" size={24} />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold">{totalCerts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Certifications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-green-500" size={24} />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <p className="text-2xl font-bold">{activeCerts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-yellow-500" size={24} />
              <span className="text-sm text-gray-500">Soon</span>
            </div>
            <p className="text-2xl font-bold">{expiringSoon}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <XCircle className="text-red-500" size={24} />
              <span className="text-sm text-gray-500">Expired</span>
            </div>
            <p className="text-2xl font-bold">{expiredCerts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
          </motion.div>
        </div>

        {/* Add Certification Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-6">Add New Certification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Certification Name *</label>
                <input
                  type="text"
                  value={newCert.name}
                  onChange={(e) => setNewCert({...newCert, name: e.target.value})}
                  placeholder="e.g., CompTIA Security+"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Issuing Organization *</label>
                <input
                  type="text"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({...newCert, issuer: e.target.value})}
                  placeholder="e.g., CompTIA"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Issue Date *</label>
                <input
                  type="date"
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert({...newCert, issueDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({...newCert, expiryDate: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Credential ID</label>
                <input
                  type="text"
                  value={newCert.credentialId}
                  onChange={(e) => setNewCert({...newCert, credentialId: e.target.value})}
                  placeholder="e.g., COMP001234"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={newCert.category}
                  onChange={(e) => setNewCert({...newCert, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                >
                  <option>Security</option>
                  <option>Cloud</option>
                  <option>Network</option>
                  <option>Database</option>
                  <option>Project Management</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                className="px-6 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
              >
                Add Certification
              </button>
            </div>
          </motion.div>
        )}

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`h-2 rounded-t-lg bg-gradient-to-r ${cert.color}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${cert.color} text-white`}>
                    <cert.icon size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Edit size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCertification(cert.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-1">{cert.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{cert.issuer}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="mr-2" />
                    <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock size={16} className="mr-2" />
                    <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FileText size={16} className="mr-2" />
                    <span>ID: {cert.credentialId}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cert.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                      cert.status === 'expiring' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {cert.status === 'active' ? 'Active' : cert.status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                    </span>
                    <span className="text-xs text-gray-500">{cert.category}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Popular Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Popular Certifications for Cleared Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularCertifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-dynamic-green transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${cert.color} text-white mr-3`}>
                  <cert.icon size={20} />
                </div>
                <span className="font-medium">{cert.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}