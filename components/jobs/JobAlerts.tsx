'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, BellOff, Plus, Trash2, Edit2, Check, X, 
  Mail, MessageSquare, Calendar, Filter, Zap
} from 'lucide-react'
import { JobFilters } from './AdvancedFilters'
import { secureStorage } from '@/lib/security/secureStorage'

export interface JobAlert {
  id: string
  name: string
  filters: JobFilters
  frequency: 'instant' | 'daily' | 'weekly'
  deliveryMethods: {
    email: boolean
    sms: boolean
    inApp: boolean
  }
  active: boolean
  createdAt: string
  lastTriggered?: string
  matchCount?: number
}

interface JobAlertsProps {
  currentFilters?: JobFilters
}

export default function JobAlerts({ currentFilters }: JobAlertsProps) {
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<JobAlert>>({
    name: '',
    frequency: 'daily',
    deliveryMethods: {
      email: true,
      sms: false,
      inApp: true
    },
    active: true
  })

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const saved = await secureStorage.getItem('jobAlerts') || []
      setAlerts(saved)
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const saveAlert = async () => {
    if (!formData.name?.trim()) return

    const newAlert: JobAlert = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      filters: currentFilters || {} as JobFilters,
      frequency: formData.frequency || 'daily',
      deliveryMethods: formData.deliveryMethods || { email: true, sms: false, inApp: true },
      active: formData.active !== false,
      createdAt: editingId ? alerts.find(a => a.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    }

    try {
      const updatedAlerts = editingId
        ? alerts.map(a => a.id === editingId ? newAlert : a)
        : [...alerts, newAlert]
      
      await secureStorage.setItem('jobAlerts', updatedAlerts, true)
      setAlerts(updatedAlerts)
      
      // Send welcome email for new alerts if email delivery is enabled
      if (!editingId && newAlert.deliveryMethods.email) {
        await sendAlertConfirmationEmail(newAlert)
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving alert:', error)
    }
  }

  const sendAlertConfirmationEmail = async (alert: JobAlert) => {
    try {
      const user = await secureStorage.getItem('user')
      if (!user?.email) return

      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom',
          data: {
            userEmail: user.email,
            userName: user.name || 'User',
            subject: `Job Alert Created: ${alert.name}`,
            html: `
              <h2>Job Alert Created Successfully</h2>
              <p>Your job alert "${alert.name}" has been created and is now active.</p>
              <p><strong>Frequency:</strong> ${alert.frequency}</p>
              <p>You'll receive notifications when new jobs match your criteria.</p>
              <p><a href="${window.location.origin}/dashboard/alerts">Manage your alerts</a></p>
            `
          }
        })
      })
    } catch (error) {
      console.error('Error sending confirmation email:', error)
    }
  }

  const deleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const updatedAlerts = alerts.filter(a => a.id !== id)
      await secureStorage.setItem('jobAlerts', updatedAlerts, true)
      setAlerts(updatedAlerts)
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const toggleAlert = async (id: string) => {
    try {
      const updatedAlerts = alerts.map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      )
      await secureStorage.setItem('jobAlerts', updatedAlerts, true)
      setAlerts(updatedAlerts)
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const editAlert = (alert: JobAlert) => {
    setFormData({
      name: alert.name,
      frequency: alert.frequency,
      deliveryMethods: alert.deliveryMethods,
      active: alert.active
    })
    setEditingId(alert.id)
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      frequency: 'daily',
      deliveryMethods: {
        email: true,
        sms: false,
        inApp: true
      },
      active: true
    })
    setEditingId(null)
    setShowCreateForm(false)
  }

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'instant': return Zap
      case 'daily': return Calendar
      case 'weekly': return Calendar
      default: return Bell
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'instant': return 'Instant'
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      default: return frequency
    }
  }

  return (
    <div className="glass-card rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Job Alerts</h3>
          <p className="text-gray-400 text-sm">Get notified when new jobs match your criteria</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Create Alert
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-800 rounded-lg"
          >
            <h4 className="text-lg font-medium text-white mb-4">
              {editingId ? 'Edit Alert' : 'Create New Alert'}
            </h4>
            
            {/* Alert Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alert Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Senior Cloud Engineer Roles"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sky-blue"
              />
            </div>

            {/* Frequency */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['instant', 'daily', 'weekly'].map((freq) => {
                  const Icon = getFrequencyIcon(freq)
                  return (
                    <button
                      key={freq}
                      onClick={() => setFormData({ ...formData, frequency: freq as any })}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.frequency === freq
                          ? 'border-sky-blue bg-sky-blue/20 text-sky-blue'
                          : 'border-gray-700 hover:border-gray-600 text-gray-400'
                      }`}
                    >
                      <Icon size={20} className="mx-auto mb-1" />
                      <p className="text-sm capitalize">{freq}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Delivery Methods */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delivery Methods
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.deliveryMethods?.email || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryMethods: {
                        ...formData.deliveryMethods!,
                        email: e.target.checked
                      }
                    })}
                    className="mr-3 rounded border-gray-600 text-sky-blue focus:ring-sky-blue"
                  />
                  <Mail size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-300">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.deliveryMethods?.sms || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryMethods: {
                        ...formData.deliveryMethods!,
                        sms: e.target.checked
                      }
                    })}
                    className="mr-3 rounded border-gray-600 text-sky-blue focus:ring-sky-blue"
                  />
                  <MessageSquare size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-300">SMS notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.deliveryMethods?.inApp || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryMethods: {
                        ...formData.deliveryMethods!,
                        inApp: e.target.checked
                      }
                    })}
                    className="mr-3 rounded border-gray-600 text-sky-blue focus:ring-sky-blue"
                  />
                  <Bell size={16} className="mr-2 text-gray-400" />
                  <span className="text-gray-300">In-app notifications</span>
                </label>
              </div>
            </div>

            {/* Current Filters Info */}
            {currentFilters && (
              <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">This alert will use your current search filters:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentFilters.searchTerm && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                      Search: {currentFilters.searchTerm}
                    </span>
                  )}
                  {currentFilters.clearance && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                      Clearance: {currentFilters.clearance}
                    </span>
                  )}
                  {currentFilters.location && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                      Location: {currentFilters.location}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAlert}
                disabled={!formData.name?.trim()}
                className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update Alert' : 'Create Alert'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="mx-auto mb-3 opacity-50" size={32} />
            <p>No job alerts set up yet</p>
            <p className="text-sm mt-1">Create your first alert to get notified about new opportunities</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const FreqIcon = getFrequencyIcon(alert.frequency)
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border transition-all ${
                  alert.active
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-900 border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-medium">{alert.name}</h4>
                      {alert.active ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                          Paused
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FreqIcon size={14} />
                        {getFrequencyLabel(alert.frequency)}
                      </span>
                      <span className="flex items-center gap-2">
                        {alert.deliveryMethods.email && <Mail size={14} />}
                        {alert.deliveryMethods.sms && <MessageSquare size={14} />}
                        {alert.deliveryMethods.inApp && <Bell size={14} />}
                      </span>
                    </div>
                    
                    {alert.lastTriggered && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last triggered: {new Date(alert.lastTriggered).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`p-2 rounded transition-colors ${
                        alert.active
                          ? 'text-green-500 hover:bg-green-500/20'
                          : 'text-gray-400 hover:bg-gray-700'
                      }`}
                      title={alert.active ? 'Pause alert' : 'Activate alert'}
                    >
                      {alert.active ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                    <button
                      onClick={() => editAlert(alert)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-sky-blue/20 border border-sky-blue/50 rounded-lg">
        <p className="text-sm text-sky-blue">
          <span className="font-semibold">Pro Tip:</span> Set up instant alerts for high-priority searches 
          to be the first to apply to new opportunities matching your criteria.
        </p>
      </div>
    </div>
  )
}