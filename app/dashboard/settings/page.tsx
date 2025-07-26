'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Globe,
  Bell,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Briefcase,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import NotificationSettings from '@/components/notifications/NotificationSettings'

interface UserProfile {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  location?: string
  clearanceLevel: string
  yearsExperience?: number
  currentTitle?: string
  currentCompany?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  bio?: string
  skills: string[]
  preferences: {
    jobAlerts: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    weeklyDigest: boolean
    marketingEmails: boolean
    jobTypes: string[]
    salaryRange?: {
      min: number
      max: number
    }
    locations: string[]
    clearanceLevels: string[]
    remoteWork: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'cleared-only'
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    allowRecruiterContact: boolean
  }
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile?userId=1')
      const result = await response.json()
      
      if (result.success && result.data) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, userId: '1' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return
    setProfile({ ...profile, ...updates })
  }

  const updatePreferences = (preferences: Partial<UserProfile['preferences']>) => {
    if (!profile) return
    setProfile({
      ...profile,
      preferences: { ...profile.preferences, ...preferences }
    })
  }

  const updatePrivacy = (privacy: Partial<UserProfile['privacy']>) => {
    if (!profile) return
    setProfile({
      ...profile,
      privacy: { ...profile.privacy, ...privacy }
    })
  }

  const handleSkillAdd = (skill: string) => {
    if (!profile || profile.skills.includes(skill)) return
    updateProfile({ skills: [...profile.skills, skill] })
  }

  const handleSkillRemove = (skill: string) => {
    if (!profile) return
    updateProfile({ skills: profile.skills.filter(s => s !== skill) })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-gray-600 dark:text-gray-400">Unable to load your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-montserrat font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </motion.div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg flex items-center ${
              saveStatus === 'success' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}
          >
            {saveStatus === 'success' ? (
              <>
                <CheckCircle size={20} className="mr-2" />
                Profile saved successfully!
              </>
            ) : (
              <>
                <AlertCircle size={20} className="mr-2" />
                Error saving profile. Please try again.
              </>
            )}
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-2 mb-6"
        >
          <div className="flex space-x-1">
            {['personal', 'preferences', 'notifications', 'privacy'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-dynamic-green text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName || ''}
                    onChange={(e) => updateProfile({ firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName || ''}
                    onChange={(e) => updateProfile({ lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile({ email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateProfile({ phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => updateProfile({ location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Arlington, VA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Shield size={16} className="inline mr-1" />
                    Clearance Level
                  </label>
                  <select
                    value={profile.clearanceLevel}
                    onChange={(e) => updateProfile({ clearanceLevel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="SECRET">SECRET</option>
                    <option value="TS">TOP SECRET</option>
                    <option value="TS/SCI">TS/SCI</option>
                    <option value="TS/SCI w/ Poly">TS/SCI w/ Poly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Briefcase size={16} className="inline mr-1" />
                    Current Title
                  </label>
                  <input
                    type="text"
                    value={profile.currentTitle || ''}
                    onChange={(e) => updateProfile({ currentTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Senior Network Engineer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Current Company</label>
                  <input
                    type="text"
                    value={profile.currentCompany || ''}
                    onChange={(e) => updateProfile({ currentCompany: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Lockheed Martin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <input
                    type="number"
                    value={profile.yearsExperience || ''}
                    onChange={(e) => updateProfile({ yearsExperience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    min="0"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        onClick={() => handleSkillRemove(skill)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      if (input.value.trim()) {
                        handleSkillAdd(input.value.trim())
                        input.value = ''
                      }
                    }
                  }}
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="font-medium">Social Links</h4>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Globe size={16} className="inline mr-1" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profile.linkedinUrl || ''}
                    onChange={(e) => updateProfile({ linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Globe size={16} className="inline mr-1" />
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profile.githubUrl || ''}
                    onChange={(e) => updateProfile({ githubUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="https://github.com/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Globe size={16} className="inline mr-1" />
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={profile.portfolioUrl || ''}
                    onChange={(e) => updateProfile({ portfolioUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    placeholder="https://portfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Job & Notification Preferences</h3>
              
              {/* Notification Settings */}
              <div>
                <h4 className="font-medium mb-4">
                  <Bell size={16} className="inline mr-1" />
                  Notifications
                </h4>
                <div className="space-y-3">
                  {[
                    { key: 'jobAlerts', label: 'Job Alerts', desc: 'Get notified about new job matches' },
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get text message alerts' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of job opportunities' },
                    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips and career advice' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                      </div>
                      <button
                        onClick={() => updatePreferences({ [key]: !profile.preferences[key as keyof typeof profile.preferences] })}
                        className="text-dynamic-green"
                      >
                        {profile.preferences[key as keyof typeof profile.preferences] ? (
                          <ToggleRight size={32} />
                        ) : (
                          <ToggleLeft size={32} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Preferences */}
              <div>
                <h4 className="font-medium mb-4">
                  <Briefcase size={16} className="inline mr-1" />
                  Job Preferences
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Job Types</label>
                    <div className="space-y-2">
                      {['Full-time', 'Part-time', 'Contract', 'Contract-to-Hire'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.preferences.jobTypes.includes(type)}
                            onChange={(e) => {
                              const types = e.target.checked
                                ? [...profile.preferences.jobTypes, type]
                                : profile.preferences.jobTypes.filter(t => t !== type)
                              updatePreferences({ jobTypes: types })
                            }}
                            className="mr-2"
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      Salary Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={profile.preferences.salaryRange?.min || 0}
                        onChange={(e) => updatePreferences({
                          salaryRange: {
                            min: parseInt(e.target.value) || 0,
                            max: profile.preferences.salaryRange?.max || 300000
                          }
                        })}
                        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        placeholder="Min salary"
                      />
                      <input
                        type="number"
                        value={profile.preferences.salaryRange?.max || 300000}
                        onChange={(e) => updatePreferences({
                          salaryRange: {
                            min: profile.preferences.salaryRange?.min || 0,
                            max: parseInt(e.target.value) || 300000
                          }
                        })}
                        className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        placeholder="Max salary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Clearance Levels</label>
                    <div className="space-y-2">
                      {['SECRET', 'TS', 'TS/SCI', 'TS/SCI w/ Poly'].map(level => (
                        <label key={level} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.preferences.clearanceLevels.includes(level)}
                            onChange={(e) => {
                              const levels = e.target.checked
                                ? [...profile.preferences.clearanceLevels, level]
                                : profile.preferences.clearanceLevels.filter(l => l !== level)
                              updatePreferences({ clearanceLevels: levels })
                            }}
                            className="mr-2"
                          />
                          {level}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Remote Work</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Include remote positions in job matches
                      </p>
                    </div>
                    <button
                      onClick={() => updatePreferences({ remoteWork: !profile.preferences.remoteWork })}
                      className="text-dynamic-green"
                    >
                      {profile.preferences.remoteWork ? (
                        <ToggleRight size={32} />
                      ) : (
                        <ToggleLeft size={32} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <NotificationSettings />
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
              
              <div>
                <h4 className="font-medium mb-4">
                  <Lock size={16} className="inline mr-1" />
                  Profile Visibility
                </h4>
                <select
                  value={profile.privacy.profileVisibility}
                  onChange={(e) => updatePrivacy({ profileVisibility: e.target.value as UserProfile['privacy']['profileVisibility'] })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="cleared-only">Cleared Only - Only cleared professionals</option>
                  <option value="private">Private - Nobody can view</option>
                </select>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Information Visibility</h4>
                <div className="space-y-3">
                  {[
                    { key: 'showEmail', label: 'Show Email Address' },
                    { key: 'showPhone', label: 'Show Phone Number' },
                    { key: 'showLocation', label: 'Show Location' },
                    { key: 'allowRecruiterContact', label: 'Allow Recruiter Contact' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <p className="font-medium">{label}</p>
                      <button
                        onClick={() => updatePrivacy({ [key]: !profile.privacy[key as keyof typeof profile.privacy] })}
                        className="text-dynamic-green"
                      >
                        {profile.privacy[key as keyof typeof profile.privacy] ? (
                          <ToggleRight size={32} />
                        ) : (
                          <ToggleLeft size={32} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <AlertCircle size={16} className="inline mr-2" />
                  Your security clearance information is always protected and only shown to verified employers.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 flex justify-end"
        >
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="px-6 py-3 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </motion.div>
      </div>
    </section>
  )
}