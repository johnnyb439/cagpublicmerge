'use client'

import { useState, useEffect } from 'react'
import { secureStorage } from '@/lib/security/secureStorage'
import { validation } from '@/lib/security/validation'
import { 
  User, Upload, FileText, Shield, Award, TrendingUp, MapPin, 
  DollarSign, Calendar, Mail, Search, Edit, Check, X, Star,
  Briefcase, Clock, ChevronRight, AlertCircle, Sparkles,
  Target, Building, Brain, CheckCircle2, XCircle, LayoutDashboard,
  MessageSquare, Linkedin, ExternalLink, Bell, Plus, RotateCcw,
  Filter, Settings, GitBranch, Package, Rocket
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    role: 'Senior Software Engineer',
    clearance: 'Top Secret/SCI',
    location: 'Arlington, VA',
    avatar: null as string | null,
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    profileStrength: 75,
    linkedinUrl: ''
  })

  const [dreamJob, setDreamJob] = useState({
    title: 'Senior Cloud Architect',
    locations: ['Washington DC, Remote'],
    salaryRange: [120000, 180000],
    availability: 'Available Now',
    clearanceLevel: 'Top Secret/SCI',
    tags: ['Remote', 'Full-Time'],
    emailAlerts: true
  })

  const [documents, setDocuments] = useState({
    resume: { uploaded: true, lastUpdate: '2 days ago' },
    certifications: [
      { name: 'AWS Solutions Architect', active: true, color: 'bg-orange-500' },
      { name: 'Security+', active: false, color: 'bg-gray-500' },
      { name: 'CISSP', active: false, color: 'bg-gray-500' }
    ]
  })

  const activityStats = {
    jobsApplied: 12,
    jobsSaved: 24,
    aiReviews: 3,
    interviewsScheduled: 2,
    hiringProgress: 65
  }

  const badges = [
    { id: 1, name: 'Top 10% Resume', icon: Star, earned: true, color: 'text-yellow-500' },
    { id: 2, name: 'TS/SCI', icon: Shield, earned: true, color: 'text-blue-500' },
    { id: 3, name: 'Cyber Certified', icon: CheckCircle2, earned: true, color: 'text-green-500' },
    { id: 4, name: 'Fast Responder', icon: Clock, earned: false, color: 'text-gray-400' },
  ]

  const availabilityOptions = ['Available Now', '2 Weeks Notice', '1 Month Notice', '2+ Months Notice']
  const clearanceOptions = ['Public Trust', 'Secret', 'Top Secret', 'Top Secret/SCI', 'TS/SCI + Poly']
  const tagOptions = ['Remote', 'Hybrid', 'On-Site', 'Contract', 'Full-Time', 'Part-Time']

  // GitHub-style activity data
  const activityData = Array.from({ length: 53 }, (_, week) => 
    Array.from({ length: 7 }, (_, day) => ({
      date: new Date(2024, 0, week * 7 + day + 1),
      count: Math.floor(Math.random() * 5)
    }))
  )

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const userData = await secureStorage.getItem('user')
        if (!userData) {
          router.push('/login')
          return
        }
        
        setUser(userData)
        
        // Load additional profile data
        const profileDetails = await secureStorage.getItem('profileDetails')
        
        setProfileData(prev => ({
          ...prev,
          name: userData.name || 'John Doe',
          email: userData.email || 'john.doe@email.com',
          role: profileDetails?.role || 'Senior Software Engineer',
          clearance: userData.clearanceLevel || 'Top Secret/SCI',
          location: profileDetails?.location || 'Arlington, VA',
          phone: profileDetails?.phone || '+1 (555) 123-4567',
          linkedinUrl: profileDetails?.linkedinUrl || ''
        }))
      } catch (error) {
        console.error('Error loading profile:', error)
        router.push('/secure-login')
      }
    }
    
    loadProfileData()
  }, [router])

  const handleSaveProfile = async () => {
    try {
      setIsEditing(false)
      
      // Validate and sanitize input
      const sanitizedData = {
        name: validation.sanitizeInput(profileData.name),
        clearanceLevel: profileData.clearance,
        email: profileData.email
      }
      
      // Update user data
      await secureStorage.setItem('user', {
        ...user,
        ...sanitizedData
      }, true)
      
      // Save additional profile details
      await secureStorage.setItem('profileDetails', {
        role: validation.sanitizeInput(profileData.role),
        location: validation.sanitizeInput(profileData.location),
        phone: validation.sanitizeInput(profileData.phone),
        linkedinUrl: validation.isValidLinkedInURL(profileData.linkedinUrl) ? profileData.linkedinUrl : '',
        updatedAt: Date.now()
      }, true)
      
      setUser({ ...user, ...sanitizedData })
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-gray-800'
    if (count === 1) return 'bg-green-900'
    if (count === 2) return 'bg-green-700'
    if (count === 3) return 'bg-green-500'
    return 'bg-green-400'
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Binary Pattern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="text-green-500 font-mono text-lg leading-relaxed">
            {Array(30).fill(null).map((_, i) => (
              <div key={i} className="whitespace-nowrap">
                {Array(15).fill('01101000 01100101 01101100 01110000 00100000 ').join('')}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">JD</span>
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Upload size={12} className="text-white" />
                </button>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>
                <p className="text-gray-400 mb-2">{profileData.role}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Shield size={16} className="text-blue-500" />
                    {profileData.clearance}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} className="text-green-500" />
                    {profileData.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <MessageSquare size={20} />
                Messages
              </button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit size={20} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Strength */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Profile Strength</span>
              <span className="text-sm font-medium">{profileData.profileStrength}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileData.profileStrength}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Documents & Certifications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                Documents & Certifications
              </h3>
              
              {/* Resume Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Resume</span>
                  </div>
                  <button className="text-blue-500 hover:text-blue-400 text-sm">
                    Update
                  </button>
                </div>
                <p className="text-sm text-gray-400">Last updated {documents.resume.lastUpdate}</p>
              </div>

              {/* Certifications */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Certifications</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {documents.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${cert.color}`}
                    >
                      {cert.name}
                    </span>
                  ))}
                </div>
                <button className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-1">
                  <Plus size={16} />
                  Add Certification
                </button>
              </div>

              {/* AI Review Button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Brain size={20} />
                Let AI Review My Resume
              </button>
            </motion.div>

            {/* Dream Job Tracker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Dream Job Tracker (AI Module)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dream Job Title</label>
                  <input
                    type="text"
                    value={dreamJob.title}
                    onChange={(e) => setDreamJob({...dreamJob, title: e.target.value})}
                    placeholder="e.g., Senior Cloud Architect"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Locations</label>
                  <input
                    type="text"
                    value={dreamJob.locations.join(', ')}
                    onChange={(e) => setDreamJob({...dreamJob, locations: e.target.value.split(', ')})}
                    placeholder="e.g., Washington DC, Remote"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button className="mt-2 text-blue-500 hover:text-blue-400 text-sm">
                    📍
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Salary Range</label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-500">${dreamJob.salaryRange[0].toLocaleString()}</span>
                    <span className="text-sm text-green-500">${dreamJob.salaryRange[1].toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="80000"
                      max="250000"
                      step="5000"
                      value={dreamJob.salaryRange[0]}
                      onChange={(e) => setDreamJob({
                        ...dreamJob,
                        salaryRange: [parseInt(e.target.value), dreamJob.salaryRange[1]]
                      })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Availability</label>
                    <select
                      value={dreamJob.availability}
                      onChange={(e) => setDreamJob({...dreamJob, availability: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      {availabilityOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Clearance Level</label>
                    <select
                      value={dreamJob.clearanceLevel}
                      onChange={(e) => setDreamJob({...dreamJob, clearanceLevel: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      {clearanceOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = dreamJob.tags.includes(tag)
                            ? dreamJob.tags.filter(t => t !== tag)
                            : [...dreamJob.tags, tag]
                          setDreamJob({...dreamJob, tags: newTags})
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          dreamJob.tags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            {/* Activity Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                📊 Activity Snapshot
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Jobs Applied</span>
                  <span className="text-2xl font-bold text-green-500">{activityStats.jobsApplied}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Jobs Saved</span>
                  <span className="text-2xl font-bold text-blue-500">{activityStats.jobsSaved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">AI Resume Reviews</span>
                  <span className="text-2xl font-bold text-green-500">{activityStats.aiReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Interviews Scheduled</span>
                  <span className="text-2xl font-bold text-yellow-500">{activityStats.interviewsScheduled}</span>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Hiring Progress</span>
                    <span className="text-sm font-medium">{activityStats.hiringProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${activityStats.hiringProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Credibility & Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🏆 Credibility & Badges
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border text-center ${
                      badge.earned 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-900 border-gray-800 opacity-50'
                    }`}
                    title={
                      badge.name === 'TS/SCI' 
                        ? 'This is self-declared information provided by the user. Recruiters should verify clearances independently.'
                        : undefined
                    }
                  >
                    <badge.icon className={`${badge.color} mb-2 mx-auto`} size={32} />
                    <p className="text-sm font-medium">{badge.name}</p>
                  </div>
                ))}
              </div>

              <button className="w-full text-blue-500 hover:text-blue-400 text-sm">
                View All Achievements
              </button>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* GitHub Activity Calendar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Activity</h3>
                <span className="text-sm text-gray-400">All 6 contributions in the last year</span>
              </div>

              {/* Activity Grid */}
              <div className="space-y-1">
                <div className="grid grid-cols-53 gap-1">
                  {activityData.flat().map((day, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)}`}
                      title={`${day.count} contributions on ${day.date.toDateString()}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-900"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-700"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>

              <button className="w-full mt-4 text-blue-500 hover:text-blue-400 text-sm">
                Report repository
              </button>
            </motion.div>

            {/* Releases */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Releases</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <GitBranch size={16} />
                <span>1 tag</span>
              </div>
              <button className="w-full mt-4 text-blue-500 hover:text-blue-400 text-sm">
                Create a new release
              </button>
            </motion.div>

            {/* Packages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Packages</h3>
              <p className="text-sm text-gray-400 mb-4">No packages published</p>
              <button className="w-full text-blue-500 hover:text-blue-400 text-sm">
                Publish your first package
              </button>
            </motion.div>

            {/* Deployments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Deployments</h3>
                <span className="text-sm text-gray-400">62</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Production - caglive2</span>
                  <span className="text-xs text-gray-400">1 hour ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Production - caglive</span>
                  <span className="text-xs text-gray-400">1 hour ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm">Preview - caglive2</span>
                  <span className="text-xs text-gray-400">1 hour ago</span>
                </div>
              </div>
              <button className="w-full mt-4 text-blue-500 hover:text-blue-400 text-sm">
                + 59 deployments
              </button>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Languages</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">TypeScript</span>
                  </div>
                  <span className="text-sm text-gray-400">89.6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Other</span>
                  </div>
                  <span className="text-sm text-gray-400">1.4%</span>
                </div>
              </div>
            </motion.div>

            {/* Suggested workflows */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Suggested workflows</h3>
              <p className="text-sm text-gray-400 mb-4">Based on your tech stack</p>
              
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Settings size={16} className="text-gray-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Datadog Synthetics</h4>
                  <p className="text-xs text-gray-400">Run Datadog Synthetic tests within your GitHub Actions workflow</p>
                </div>
                <button className="text-blue-500 hover:text-blue-400 text-sm">
                  Configure
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}