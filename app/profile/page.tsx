'use client'

import { useState, useEffect } from 'react'
import { 
  User, Upload, FileText, Shield, Award, TrendingUp, MapPin, 
  DollarSign, Calendar, Mail, Search, Edit, Check, X, Star,
  Briefcase, Clock, ChevronRight, AlertCircle, Sparkles,
  Target, Building, Brain, CheckCircle2, XCircle, LayoutDashboard,
  MessageSquare, Linkedin, ExternalLink, Bell
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MessagingCenter from '@/components/MessagingCenter'
import NotificationCenter from '@/components/NotificationCenter'

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [profileData, setProfileData] = useState({
    name: '',
    role: '',
    clearance: '',
    location: '',
    avatar: null as string | null,
    email: '',
    phone: '',
    profileStrength: 75,
    linkedinUrl: ''
  })

  const [dreamJob, setDreamJob] = useState({
    title: '',
    locations: [''],
    salaryRange: [120000, 180000],
    availability: 'Available Now',
    clearanceLevel: 'Top Secret/SCI',
    tags: ['Remote', 'Full-Time'],
    emailAlerts: true
  })

  const [aiSuggestion, setAiSuggestion] = useState({
    visible: true,
    message: 'Try uploading your AWS certification to match 2 more jobs in your area!'
  })

  const [documents, setDocuments] = useState({
    resume: { uploaded: true, lastUpdate: '2 days ago' },
    certifications: ['AWS Solutions Architect', 'Security+', 'CISSP']
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
    { id: 2, name: 'TS/SCI Verified', icon: Shield, earned: true, color: 'text-blue-500' },
    { id: 3, name: 'Cyber Certified', icon: Award, earned: true, color: 'text-green-500' },
    { id: 4, name: 'Fast Responder', icon: Clock, earned: false, color: 'text-gray-400' },
  ]

  const availabilityOptions = ['Available Now', '2 Weeks Notice', '1 Month Notice', '2+ Months Notice']
  const clearanceOptions = ['Public Trust', 'Secret', 'Top Secret', 'Top Secret/SCI', 'TS/SCI + Poly']
  const tagOptions = ['Remote', 'Hybrid', 'On-Site', 'Contract', 'Full-Time', 'Part-Time']

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setProfileData(prev => ({
      ...prev,
      name: parsedUser.name || 'John Doe',
      email: parsedUser.email || 'john.doe@email.com',
      role: 'Senior Software Engineer',
      clearance: parsedUser.clearanceLevel || 'Top Secret/SCI',
      location: 'Arlington, VA',
      phone: '+1 (555) 123-4567',
    }))
  }, [router])

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Save profile data
    localStorage.setItem('user', JSON.stringify({
      ...user,
      name: profileData.name,
      clearanceLevel: profileData.clearance
    }))
  }

  if (!user) return null

  return (
    <div className="min-h-screen glass-bg text-gray-100 relative overflow-hidden py-20">
      {/* Binary Pattern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="text-neon-green font-mono text-lg leading-relaxed">
            {Array(30).fill(null).map((_, i) => (
              <div key={i} className="whitespace-nowrap">
                {Array(15).fill('01101000 01100101 01101100 01110000 00100000 ').join('')}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex justify-end gap-4 mb-6">
          <NotificationCenter />
          <button
            onClick={() => setIsMessageCenterOpen(!isMessageCenterOpen)}
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-colors"
          >
            <MessageSquare size={20} />
            <span>Messages</span>
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-colors"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Profile Overview Card */}
        <div className="glass-card rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-sky-blue to-neon-green p-0.5">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt={profileData.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-400" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-sky-blue rounded-full flex items-center justify-center hover:bg-neon-green transition-colors">
                  <Upload size={16} className="text-white" />
                </button>
              </div>
              
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="text-2xl font-bold bg-gray-700 rounded px-2 py-1 mb-1"
                  />
                ) : (
                  <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>
                )}
                <p className="text-gray-400">{profileData.role}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Shield size={16} className="text-sky-blue" />
                    {profileData.clearance}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} className="text-neon-green" />
                    {profileData.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-green text-gray-900 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    <Check size={20} />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Edit size={20} />
                  Edit Profile
                </button>
              )}
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
                className="bg-gradient-to-r from-sky-blue to-neon-green h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileData.profileStrength}%` }}
              />
            </div>
          </div>

          {/* AI Suggestion */}
          {aiSuggestion.visible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-gradient-to-r from-sky-blue/20 to-neon-green/20 rounded-lg border border-sky-blue/30 flex items-start gap-3"
            >
              <Sparkles className="text-sky-blue mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm">{aiSuggestion.message}</p>
              </div>
              <button
                onClick={() => setAiSuggestion({...aiSuggestion, visible: false})}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-4 rounded-lg text-center">
            <Briefcase className="text-sky-blue mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{activityStats.jobsApplied}</div>
            <div className="text-sm text-gray-400">Jobs Applied</div>
          </div>
          <div className="glass-card p-4 rounded-lg text-center">
            <Star className="text-yellow-500 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{activityStats.jobsSaved}</div>
            <div className="text-sm text-gray-400">Jobs Saved</div>
          </div>
          <div className="glass-card p-4 rounded-lg text-center">
            <Brain className="text-neon-green mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{activityStats.aiReviews}</div>
            <div className="text-sm text-gray-400">AI Reviews</div>
          </div>
          <div className="glass-card p-4 rounded-lg text-center">
            <Calendar className="text-purple-500 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{activityStats.interviewsScheduled}</div>
            <div className="text-sm text-gray-400">Interviews</div>
          </div>
          <div className="glass-card p-4 rounded-lg text-center">
            <TrendingUp className="text-emerald-500 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{activityStats.hiringProgress}%</div>
            <div className="text-sm text-gray-400">Progress</div>
          </div>
        </div>

        {/* Badges */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border ${
                  badge.earned 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-gray-900 border-gray-800 opacity-50'
                }`}
              >
                <badge.icon className={`${badge.color} mb-2`} size={32} />
                <p className="text-sm font-medium">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dream Job Settings */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="text-sky-blue" />
            Dream Job Preferences
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Desired Title</label>
              <input
                type="text"
                value={dreamJob.title}
                onChange={(e) => setDreamJob({...dreamJob, title: e.target.value})}
                placeholder="e.g., Senior DevOps Engineer"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:border-sky-blue border border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Clearance Level</label>
              <select
                value={dreamJob.clearanceLevel}
                onChange={(e) => setDreamJob({...dreamJob, clearanceLevel: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:border-sky-blue border border-gray-600"
              >
                {clearanceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Salary Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={dreamJob.salaryRange[0]}
                  onChange={(e) => setDreamJob({
                    ...dreamJob, 
                    salaryRange: [parseInt(e.target.value), dreamJob.salaryRange[1]]
                  })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:border-sky-blue border border-gray-600"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  value={dreamJob.salaryRange[1]}
                  onChange={(e) => setDreamJob({
                    ...dreamJob, 
                    salaryRange: [dreamJob.salaryRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:border-sky-blue border border-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Availability</label>
              <select
                value={dreamJob.availability}
                onChange={(e) => setDreamJob({...dreamJob, availability: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:border-sky-blue border border-gray-600"
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dreamJob.emailAlerts}
                onChange={(e) => setDreamJob({...dreamJob, emailAlerts: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Send me email alerts for matching jobs</span>
            </label>
          </div>
        </div>
      </div>

      {/* Messaging Center Modal */}
      {isMessageCenterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">Messages</h2>
              <button
                onClick={() => setIsMessageCenterOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <MessagingCenter />
          </div>
        </div>
      )}
    </div>
  )
}

// Add missing import for motion
import { motion } from 'framer-motion'