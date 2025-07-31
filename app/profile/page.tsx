'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Shield,
  Calendar, Edit2, Save, X, Upload, CheckCircle, AlertCircle,
  Award, FileText, Globe, Linkedin, Github, Camera
} from 'lucide-react'

interface ProfileData {
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  
  // Professional Info
  title: string
  yearsOfExperience: string
  clearanceLevel: string
  clearanceStatus: string
  
  // Additional Info
  linkedin: string
  github: string
  website: string
  bio: string
  skills: string[]
  
  // Completion tracking
  profileImage: boolean
  resume: boolean
  certifications: boolean
  workHistory: boolean
  education: boolean
}

const completionSteps = [
  { id: 'basic', label: 'Basic Information', fields: ['firstName', 'lastName', 'email', 'phone', 'location'], weight: 20 },
  { id: 'professional', label: 'Professional Details', fields: ['title', 'yearsOfExperience', 'clearanceLevel'], weight: 20 },
  { id: 'profileImage', label: 'Profile Picture', fields: ['profileImage'], weight: 10 },
  { id: 'resume', label: 'Resume Upload', fields: ['resume'], weight: 15 },
  { id: 'certifications', label: 'Certifications', fields: ['certifications'], weight: 10 },
  { id: 'workHistory', label: 'Work History', fields: ['workHistory'], weight: 10 },
  { id: 'education', label: 'Education', fields: ['education'], weight: 10 },
  { id: 'additional', label: 'Additional Info', fields: ['bio', 'skills'], weight: 5 }
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '',
    location: '',
    title: '',
    yearsOfExperience: '',
    clearanceLevel: 'Secret',
    clearanceStatus: 'Active',
    linkedin: '',
    github: '',
    website: '',
    bio: '',
    skills: [],
    profileImage: false,
    resume: false,
    certifications: false,
    workHistory: false,
    education: false
  })
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setProfileData(prev => ({
        ...prev,
        email: user.email,
        firstName: user.name?.split(' ')[0] || 'Test',
        lastName: user.name?.split(' ')[1] || 'User',
        clearanceLevel: user.clearanceLevel
      }))
    }
  }, [])

  const calculateCompletion = () => {
    let totalCompletion = 0
    
    completionSteps.forEach(step => {
      let stepComplete = true
      step.fields.forEach(field => {
        const value = profileData[field as keyof ProfileData]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          stepComplete = false
        }
      })
      if (stepComplete) {
        totalCompletion += step.weight
      }
    })
    
    return totalCompletion
  }

  const getIncompleteSteps = () => {
    return completionSteps.filter(step => {
      return step.fields.some(field => {
        const value = profileData[field as keyof ProfileData]
        return !value || (Array.isArray(value) && value.length === 0)
      })
    })
  }

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData))
    setIsEditing(false)
  }

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const completion = calculateCompletion()
  const incompleteSteps = getIncompleteSteps()

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
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-dynamic-green transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors shadow-lg ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-dynamic-green hover:bg-emerald-green text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <Save size={20} className="mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 size={20} className="mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Completion Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile Completion</h2>
            <span className={`text-2xl font-bold ${
              completion === 100 ? 'text-green-600' : 
              completion >= 75 ? 'text-yellow-600' : 
              'text-orange-600'
            }`}>
              {completion}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
            <motion.div
              className={`h-4 rounded-full bg-gradient-to-r ${
                completion === 100 ? 'from-green-400 to-green-600' :
                completion >= 75 ? 'from-yellow-400 to-yellow-600' :
                'from-orange-400 to-orange-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          {completion < 100 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Complete these sections to reach 100%:</p>
              <div className="flex flex-wrap gap-2">
                {incompleteSteps.map(step => (
                  <span 
                    key={step.id}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    {step.label} (+{step.weight}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-dynamic-green to-dynamic-blue flex items-center justify-center text-white text-4xl font-bold">
                {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-dynamic-green text-white rounded-full hover:bg-emerald-green transition-colors">
                  <Camera size={20} />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{profileData.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{profileData.lastName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profileData.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Phone size={16} className="inline mr-2" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profileData.phone || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MapPin size={16} className="inline mr-2" />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="City, State"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profileData.location || 'Not provided'}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Professional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Briefcase size={16} className="inline mr-2" />
                Job Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                  placeholder="e.g., Network Administrator"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profileData.title || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar size={16} className="inline mr-2" />
                Years of Experience
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.yearsOfExperience}
                  onChange={(e) => setProfileData({...profileData, yearsOfExperience: e.target.value})}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profileData.yearsOfExperience || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Shield size={16} className="inline mr-2" />
                Clearance Level
              </label>
              {isEditing ? (
                <select
                  value={profileData.clearanceLevel}
                  onChange={(e) => setProfileData({...profileData, clearanceLevel: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                >
                  <option>None</option>
                  <option>Public Trust</option>
                  <option>Secret</option>
                  <option>Top Secret</option>
                  <option>Top Secret/SCI</option>
                </select>
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profileData.clearanceLevel}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clearance Status
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {profileData.clearanceStatus}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Skills</h2>
          {isEditing && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add a skill"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
              >
                Add
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center"
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
            {profileData.skills.length === 0 && !isEditing && (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            href="/dashboard/resume"
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-xl transition-all text-center"
          >
            <FileText className="mx-auto mb-3 text-dynamic-green" size={32} />
            <h3 className="font-semibold mb-1">Upload Resume</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add or update your resume</p>
          </Link>
          
          <Link
            href="/dashboard/certifications"
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-xl transition-all text-center"
          >
            <Award className="mx-auto mb-3 text-dynamic-blue" size={32} />
            <h3 className="font-semibold mb-1">Manage Certifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add your certifications</p>
          </Link>
          
          <Link
            href="/dashboard/settings"
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-xl transition-all text-center"
          >
            <Shield className="mx-auto mb-3 text-purple-500" size={32} />
            <h3 className="font-semibold mb-1">Privacy Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Control your visibility</p>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}