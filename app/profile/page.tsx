'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Shield,
  Calendar, Edit2, Save, X, Upload, CheckCircle, AlertCircle,
  Award, FileText, Globe, Linkedin, Github, Camera, Plus,
  Building, Clock, ChevronDown, ChevronUp, Trash2, Star
} from 'lucide-react'

interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  clearanceUsed?: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  graduationDate: string
}

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
}

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
  
  // Clearance Information (Enhanced)
  clearanceLevel: string
  clearanceStatus: string
  investigationType?: string
  clearanceGrantedDate?: string
  clearanceExpiryDate?: string
  polygraphType?: string
  polygraphDate?: string
  
  // Skills (Enhanced with categories)
  technicalSkills: string[]
  softSkills: string[]
  certifications: Certification[]
  languages: string[]
  
  // Work History
  workHistory: WorkExperience[]
  
  // Education
  education: Education[]
  
  // Additional Info
  linkedin: string
  github: string
  website: string
  bio: string
  
  // Preferences
  desiredSalary?: string
  willingToRelocate: boolean
  preferredLocations: string[]
  jobTypes: string[] // Full-time, Contract, Remote, etc.
  
  // Completion tracking
  profileImage: boolean
  resume: boolean
}

const SKILL_CATEGORIES = {
  technical: 'Technical Skills',
  soft: 'Soft Skills',
  languages: 'Languages',
  certifications: 'Certifications'
}

const CLEARANCE_LEVELS = [
  'None',
  'Public Trust',
  'Secret',
  'Top Secret',
  'Top Secret/SCI'
]

const INVESTIGATION_TYPES = [
  'NACLC',
  'ANACI',
  'BI',
  'SSBI',
  'T3',
  'T5'
]

const POLYGRAPH_TYPES = [
  'None',
  'CI Polygraph',
  'Full Scope Polygraph',
  'Lifestyle Polygraph'
]

export default function EnhancedProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
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
    investigationType: '',
    clearanceGrantedDate: '',
    clearanceExpiryDate: '',
    polygraphType: 'None',
    polygraphDate: '',
    technicalSkills: [],
    softSkills: [],
    certifications: [],
    languages: [],
    workHistory: [],
    education: [],
    linkedin: '',
    github: '',
    website: '',
    bio: '',
    desiredSalary: '',
    willingToRelocate: false,
    preferredLocations: [],
    jobTypes: [],
    profileImage: false,
    resume: false
  })

  const [newSkill, setNewSkill] = useState('')
  const [skillCategory, setSkillCategory] = useState('technical')

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('enhancedProfileData')
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile))
    } else {
      // Load basic user data
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setProfileData(prev => ({
          ...prev,
          email: user.email,
          firstName: user.name?.split(' ')[0] || 'Test',
          lastName: user.name?.split(' ')[1] || 'User',
          clearanceLevel: user.clearanceLevel || 'Secret'
        }))
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('enhancedProfileData', JSON.stringify(profileData))
    setIsEditing(false)
    // Show success message
    alert('Profile saved successfully!')
  }

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const skillKey = `${skillCategory}Skills` as keyof Pick<ProfileData, 'technicalSkills' | 'softSkills'>
      if (skillCategory === 'languages') {
        setProfileData(prev => ({
          ...prev,
          languages: [...prev.languages, newSkill.trim()]
        }))
      } else if (skillCategory === 'technical' || skillCategory === 'soft') {
        setProfileData(prev => ({
          ...prev,
          [skillKey]: [...prev[skillKey], newSkill.trim()]
        }))
      }
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string, category: string) => {
    if (category === 'languages') {
      setProfileData(prev => ({
        ...prev,
        languages: prev.languages.filter(s => s !== skill)
      }))
    } else {
      const skillKey = `${category}Skills` as keyof Pick<ProfileData, 'technicalSkills' | 'softSkills'>
      setProfileData(prev => ({
        ...prev,
        [skillKey]: prev[skillKey].filter(s => s !== skill)
      }))
    }
  }

  const handleAddWorkExperience = () => {
    const newWork: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
    setProfileData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, newWork]
    }))
  }

  const handleUpdateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setProfileData(prev => ({
      ...prev,
      workHistory: prev.workHistory.map(work =>
        work.id === id ? { ...work, [field]: value } : work
      )
    }))
  }

  const handleRemoveWorkExperience = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter(work => work.id !== id)
    }))
  }

  const calculateCompletion = () => {
    let score = 0
    const checks = [
      { condition: profileData.firstName && profileData.lastName, weight: 10 },
      { condition: profileData.email && profileData.phone, weight: 10 },
      { condition: profileData.location, weight: 5 },
      { condition: profileData.title && profileData.yearsOfExperience, weight: 15 },
      { condition: profileData.clearanceLevel && profileData.clearanceStatus, weight: 10 },
      { condition: profileData.clearanceGrantedDate, weight: 5 },
      { condition: profileData.technicalSkills.length > 0, weight: 10 },
      { condition: profileData.softSkills.length > 0, weight: 5 },
      { condition: profileData.workHistory.length > 0, weight: 20 },
      { condition: profileData.education.length > 0, weight: 10 },
      { condition: profileData.bio, weight: 5 },
      { condition: profileData.resume, weight: 5 }
    ]
    
    checks.forEach(check => {
      if (check.condition) score += check.weight
    })
    
    return score
  }

  const completion = calculateCompletion()

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Enhanced Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Complete your profile to increase visibility to recruiters
              </p>
            </div>
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
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile Strength</h2>
            <span className={`text-2xl font-bold ${
              completion >= 90 ? 'text-green-600' : 
              completion >= 70 ? 'text-yellow-600' : 
              'text-orange-600'
            }`}>
              {completion}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <motion.div
              className={`h-4 rounded-full bg-gradient-to-r ${
                completion >= 90 ? 'from-green-400 to-green-600' :
                completion >= 70 ? 'from-yellow-400 to-yellow-600' :
                'from-orange-400 to-orange-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Enhanced Clearance Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Shield className="mr-2 text-dynamic-green" size={24} />
              Security Clearance Information
            </h2>
            <button
              onClick={() => setActiveSection(activeSection === 'clearance' ? null : 'clearance')}
              className="text-gray-500 hover:text-gray-700"
            >
              {activeSection === 'clearance' ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clearance Level
              </label>
              {isEditing ? (
                <select
                  value={profileData.clearanceLevel}
                  onChange={(e) => setProfileData({...profileData, clearanceLevel: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                >
                  {CLEARANCE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 dark:text-gray-100 font-semibold">{profileData.clearanceLevel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              {isEditing ? (
                <select
                  value={profileData.clearanceStatus}
                  onChange={(e) => setProfileData({...profileData, clearanceStatus: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="Active">Active</option>
                  <option value="Current">Current</option>
                  <option value="Expired">Expired</option>
                  <option value="In Process">In Process</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.clearanceStatus === 'Active' ? 'bg-green-100 text-green-800' :
                  profileData.clearanceStatus === 'Current' ? 'bg-blue-100 text-blue-800' :
                  profileData.clearanceStatus === 'In Process' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {profileData.clearanceStatus}
                </span>
              )}
            </div>

            {activeSection === 'clearance' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investigation Type
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.investigationType}
                      onChange={(e) => setProfileData({...profileData, investigationType: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="">Select Type</option>
                      {INVESTIGATION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{profileData.investigationType || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Granted Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.clearanceGrantedDate}
                      onChange={(e) => setProfileData({...profileData, clearanceGrantedDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">
                      {profileData.clearanceGrantedDate || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Polygraph Type
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.polygraphType}
                      onChange={(e) => setProfileData({...profileData, polygraphType: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    >
                      {POLYGRAPH_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{profileData.polygraphType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Polygraph Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.polygraphDate}
                      onChange={(e) => setProfileData({...profileData, polygraphDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">
                      {profileData.polygraphDate || 'Not specified'}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Enhanced Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Skills & Expertise</h2>
          
          {isEditing && (
            <div className="flex gap-2 mb-6">
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="technical">Technical Skills</option>
                <option value="soft">Soft Skills</option>
                <option value="languages">Languages</option>
              </select>
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
                <Plus size={20} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Technical Skills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.technicalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(skill, 'technical')}
                        className="ml-2 text-blue-600 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {profileData.technicalSkills.length === 0 && (
                  <span className="text-gray-500 text-sm">No technical skills added</span>
                )}
              </div>
            </div>

            {/* Soft Skills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Soft Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.softSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(skill, 'soft')}
                        className="ml-2 text-green-600 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {profileData.softSkills.length === 0 && (
                  <span className="text-gray-500 text-sm">No soft skills added</span>
                )}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm flex items-center"
                  >
                    <Globe size={14} className="mr-1" />
                    {lang}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(lang, 'languages')}
                        className="ml-2 text-purple-600 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {profileData.languages.length === 0 && (
                  <span className="text-gray-500 text-sm">No languages added</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Work History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Briefcase className="mr-2 text-dynamic-blue" size={24} />
              Work History
            </h2>
            {isEditing && (
              <button
                onClick={handleAddWorkExperience}
                className="flex items-center px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Experience
              </button>
            )}
          </div>

          <div className="space-y-4">
            {profileData.workHistory.map((work, index) => (
              <div key={work.id} className="border rounded-lg p-4 dark:border-gray-700">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        value={work.position}
                        onChange={(e) => handleUpdateWorkExperience(work.id, 'position', e.target.value)}
                        placeholder="Position Title"
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700 mr-2"
                      />
                      <button
                        onClick={() => handleRemoveWorkExperience(work.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={work.company}
                      onChange={(e) => handleUpdateWorkExperience(work.id, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={work.startDate}
                        onChange={(e) => handleUpdateWorkExperience(work.id, 'startDate', e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                      />
                      <input
                        type="date"
                        value={work.endDate}
                        onChange={(e) => handleUpdateWorkExperience(work.id, 'endDate', e.target.value)}
                        disabled={work.current}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={work.current}
                        onChange={(e) => handleUpdateWorkExperience(work.id, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      Currently working here
                    </label>
                    <textarea
                      value={work.description}
                      onChange={(e) => handleUpdateWorkExperience(work.id, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={work.clearanceUsed || ''}
                      onChange={(e) => handleUpdateWorkExperience(work.id, 'clearanceUsed', e.target.value)}
                      placeholder="Clearance level used (optional)"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{work.position || 'Position'}</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center">
                          <Building size={16} className="mr-1" />
                          {work.company || 'Company'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar size={14} className="mr-1" />
                          {work.startDate || 'Start'} - {work.current ? 'Present' : work.endDate || 'End'}
                        </p>
                        {work.clearanceUsed && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                            <Shield size={14} className="mr-1" />
                            {work.clearanceUsed} clearance used
                          </p>
                        )}
                      </div>
                    </div>
                    {work.description && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300">{work.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {profileData.workHistory.length === 0 && !isEditing && (
              <p className="text-gray-500 text-center py-4">No work experience added yet</p>
            )}
          </div>
        </motion.div>

        {/* Job Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Job Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Desired Salary Range
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.desiredSalary}
                  onChange={(e) => setProfileData({...profileData, desiredSalary: e.target.value})}
                  placeholder="e.g., $80,000 - $120,000"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">
                  {profileData.desiredSalary || 'Not specified'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Willing to Relocate
              </label>
              {isEditing ? (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.willingToRelocate}
                    onChange={(e) => setProfileData({...profileData, willingToRelocate: e.target.checked})}
                    className="mr-2"
                  />
                  Yes, I'm willing to relocate
                </label>
              ) : (
                <p className="text-gray-900 dark:text-gray-100">
                  {profileData.willingToRelocate ? 'Yes' : 'No'}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}