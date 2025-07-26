'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  Briefcase,
  Award,
  Users,
  Calendar,
  Settings,
  Check,
  X,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface EmailPreferences {
  jobAlerts: boolean
  applicationUpdates: boolean
  certificationReminders: boolean
  networkingUpdates: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
}

interface NotificationStats {
  totalSent: number
  pending: number
  failed: number
}

interface PendingNotification {
  id: string
  type: string
  subject: string
  content: string
  scheduledFor: string
  status: 'pending' | 'sent' | 'failed'
  createdAt: string
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    jobAlerts: true,
    applicationUpdates: true,
    certificationReminders: true,
    networkingUpdates: false,
    weeklyDigest: true,
    marketingEmails: false
  })
  const [stats, setStats] = useState<NotificationStats>({ totalSent: 0, pending: 0, failed: 0 })
  const [recentNotifications, setRecentNotifications] = useState<PendingNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState(false)

  useEffect(() => {
    fetchNotificationData()
  }, [])

  const fetchNotificationData = async () => {
    try {
      const response = await fetch('/api/notifications?userId=1')
      const result = await response.json()
      
      if (result.success) {
        setPreferences(result.data.preferences || preferences)
        setStats(result.data.stats)
        setRecentNotifications(result.data.recent || [])
      }
    } catch (error) {
      console.error('Error fetching notification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<EmailPreferences>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          action: 'update_preferences',
          preferences: newPreferences
        })
      })

      const result = await response.json()
      if (result.success) {
        setPreferences({ ...preferences, ...newPreferences })
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          action: 'send_notification',
          type: 'test_email',
          subject: 'Test Email from Cleared Advisory Group',
          content: `
            <h2>Test Email</h2>
            <p>This is a test email to verify your notification settings are working correctly.</p>
            <p>If you received this email, your notifications are configured properly!</p>
          `,
          templateData: { userName: 'Test User' }
        })
      })

      const result = await response.json()
      if (result.success) {
        setTestEmailSent(true)
        setTimeout(() => setTestEmailSent(false), 3000)
        await fetchNotificationData() // Refresh to show the new notification
      }
    } catch (error) {
      console.error('Error sending test email:', error)
    }
  }

  const handlePreferenceChange = (key: keyof EmailPreferences, value: boolean) => {
    updatePreferences({ [key]: value })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="text-green-500" size={16} />
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />
      case 'failed':
        return <AlertCircle className="text-red-500" size={16} />
      default:
        return null
    }
  }

  const notificationTypes = [
    {
      key: 'jobAlerts' as keyof EmailPreferences,
      title: 'Job Alerts',
      description: 'Receive email notifications when new jobs match your profile',
      icon: Briefcase,
      color: 'text-blue-600'
    },
    {
      key: 'applicationUpdates' as keyof EmailPreferences,
      title: 'Application Updates',
      description: 'Get notified when your job applications status changes',
      icon: Mail,
      color: 'text-green-600'
    },
    {
      key: 'certificationReminders' as keyof EmailPreferences,
      title: 'Certification Reminders',
      description: 'Reminders when your certifications are about to expire',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      key: 'networkingUpdates' as keyof EmailPreferences,
      title: 'Networking Updates',
      description: 'Updates about new connections, events, and networking opportunities',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      key: 'weeklyDigest' as keyof EmailPreferences,
      title: 'Weekly Digest',
      description: 'Weekly summary of your activity, new opportunities, and progress',
      icon: Calendar,
      color: 'text-indigo-600'
    },
    {
      key: 'marketingEmails' as keyof EmailPreferences,
      title: 'Marketing Emails',
      description: 'Product updates, tips, and promotional content',
      icon: Bell,
      color: 'text-gray-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your email preferences and notification settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.totalSent}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emails Sent</p>
            </div>
            <CheckCircle2 className="text-green-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
            </div>
            <AlertCircle className="text-red-600" size={24} />
          </div>
        </motion.div>
      </div>

      {/* Email Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Email Preferences</h3>
          <button
            onClick={sendTestEmail}
            disabled={testEmailSent}
            className={`px-4 py-2 rounded-lg transition-colors ${
              testEmailSent
                ? 'bg-green-600 text-white'
                : 'bg-dynamic-blue text-white hover:bg-sky-blue'
            }`}
          >
            {testEmailSent ? (
              <>
                <Check size={16} className="inline mr-2" />
                Test Sent!
              </>
            ) : (
              <>
                <Send size={16} className="inline mr-2" />
                Send Test Email
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {notificationTypes.map((type, index) => (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                <type.icon className={`${type.color} mr-4`} size={24} />
                <div>
                  <h4 className="font-medium">{type.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[type.key]}
                  onChange={(e) => handlePreferenceChange(type.key, e.target.checked)}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-6">Recent Notifications</h3>
        
        {recentNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="mx-auto mb-4" size={48} />
            <p>No recent notifications</p>
            <p className="text-sm">Email notifications will appear here when sent</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getStatusIcon(notification.status)}
                    <h4 className="font-medium ml-2">{notification.subject}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Type: {notification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  notification.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {notification.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Email Frequency Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Email Frequency</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Job Alerts Frequency</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How often do you want to receive job alerts?
              </p>
            </div>
            <select className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600">
              <option value="immediate">Immediate</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Digest Delivery</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When should we send your weekly digest?
              </p>
            </div>
            <select className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600">
              <option value="monday">Monday Morning</option>
              <option value="friday">Friday Evening</option>
              <option value="sunday">Sunday Evening</option>
            </select>
          </div>
        </div>
      </motion.div>
    </div>
  )
}