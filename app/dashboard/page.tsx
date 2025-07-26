'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { secureStorage } from '@/lib/security/secureStorage'
import { 
  User, 
  Briefcase, 
  Award, 
  FileText, 
  Target, 
  Calendar,
  Bell,
  LogOut,
  ChevronRight,
  BookOpen,
  MessageSquare,
  FolderOpen,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Analytics from '@/components/dashboard/Analytics'
import ActivityTimeline from '@/components/dashboard/ActivityTimeline'
import GoalTracking from '@/components/dashboard/GoalTracking'
import PersonalizedRecommendations from '@/components/dashboard/PersonalizedRecommendations'
import MessagingCenter from '@/components/MessagingCenter'
import ErrorBoundary from '@/components/ErrorBoundary'
import { SkeletonDashboardCard } from '@/components/ui/Skeleton'
import OnboardingModal from '@/components/OnboardingModal'

interface UserData {
  email: string
  name: string
  clearanceLevel: string
  onboardingCompleted?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [certCount, setCertCount] = useState(0)
  const [jobApplications, setJobApplications] = useState(0)
  const [mockInterviews, setMockInterviews] = useState(0)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is logged in
        const userData = await secureStorage.getItem('user')
        if (userData) {
          setUser(userData)
          
          // Check if user needs onboarding
          const onboardingStatus = await secureStorage.getItem('onboardingCompleted')
          if (!onboardingStatus && !userData.onboardingCompleted) {
            setShowOnboarding(true)
          }
          
          // Calculate profile completion
          let completed = 25 // Base for having an account
          if (userData.name) completed += 15
          if (userData.email) completed += 15
          if (userData.clearanceLevel) completed += 15
          
          const currentResume = await secureStorage.getItem('currentResume')
          if (currentResume) completed += 15
          
          const certifications = await secureStorage.getItem('certifications')
          if (certifications) {
            completed += 15
            setCertCount(certifications.length)
          }
          
          setProfileCompletion(completed)
          
          // Get job applications count
          const applications = await secureStorage.getItem('jobApplications')
          if (applications) {
            setJobApplications(applications.length)
          }
          
          // Get mock interviews count
          const interviews = await secureStorage.getItem('mockInterviews')
          if (interviews) {
            setMockInterviews(interviews.length)
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // If secure storage not initialized, redirect to secure login
        router.push('/secure-login')
      } finally {
        setIsDataLoading(false)
      }
    }
    
    loadUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      await secureStorage.removeItem('user')
      await secureStorage.clear()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
      </div>
    )
  }

  const stats = [
    { 
      label: 'Profile Completion', 
      value: `${profileCompletion}%`, 
      icon: User, 
      color: profileCompletion === 100 ? 'text-dynamic-green' : profileCompletion >= 75 ? 'text-yellow-500' : 'text-orange-500',
      href: '/profile',
      description: profileCompletion === 100 ? 'Profile complete!' : 'Complete your profile',
      progress: true,
      progressValue: profileCompletion
    },
    { 
      label: 'Jobs Applied', 
      value: jobApplications.toString(), 
      icon: Briefcase, 
      color: 'text-dynamic-blue',
      href: '/dashboard/applications',
      description: jobApplications > 0 ? 'View applications' : 'Start applying'
    },
    { 
      label: 'Certifications', 
      value: certCount.toString(), 
      icon: Award, 
      color: 'text-emerald-green',
      href: '/dashboard/certifications',
      description: certCount > 0 ? 'Manage certifications' : 'Add certifications'
    },
    { 
      label: 'Mock Interviews', 
      value: mockInterviews.toString(), 
      icon: Target, 
      color: 'text-sky-blue',
      href: '/mock-interview',
      description: mockInterviews > 0 ? 'Practice more' : 'Start practicing'
    }
  ]

  const recentActivity = [
    { type: 'application', title: 'Applied to Network Administrator at TechCorp', time: '2 hours ago' },
    { type: 'interview', title: 'Completed mock interview for Systems Admin', time: '1 day ago' },
    { type: 'certification', title: 'Added Security+ certification', time: '3 days ago' },
    { type: 'profile', title: 'Updated resume', time: '1 week ago' }
  ]

  const recommendedJobs = [
    { title: 'Cloud Engineer', company: 'AWS Federal', clearance: 'SECRET', match: '92%' },
    { title: 'DevOps Engineer', company: 'Federal Cloud Systems', clearance: 'SECRET', match: '88%' },
    { title: 'Network Security Engineer', company: 'Secure Federal Networks', clearance: 'TS', match: '85%' }
  ]

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
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Clearance Level: <span className="text-dynamic-green font-semibold">{user.clearanceLevel}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/settings"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-dynamic-green transition-colors"
              >
                <User size={20} className="mr-2" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut size={20} className="mr-2" />
                Log Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {isDataLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonDashboardCard key={i} />
              ))}
            </>
          ) : (
            stats.map((stat, index) => (
            <Link
              key={stat.label}
              href={stat.href}
              passHref
              className="block relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon size={24} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                {stat.progress && (
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-blue to-neon-green transition-all duration-500"
                      style={{ width: `${stat.progressValue}%` }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {stat.description}
                </p>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </motion.div>
            </Link>
          )))}
        </div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-2 mb-8"
        >
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'goals', label: 'Goals' },
              { id: 'recommendations', label: 'Recommendations' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-dynamic-green text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-montserrat font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                <Link
                  href="/jobs"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Briefcase className="text-dynamic-green mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Browse Jobs</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View cleared positions</p>
                  </div>
                </Link>
                <Link
                  href="/mock-interview"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Target className="text-dynamic-blue mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Practice Interview</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered prep</p>
                  </div>
                </Link>
                <Link
                  href="/resources"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <BookOpen className="text-emerald-green mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Resources</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Career guides</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/resume"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <FileText className="text-sky-blue mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Update Resume</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Military translation</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/applications"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Briefcase className="text-orange-500 mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Track Applications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage job applications</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/certifications"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Award className="text-purple-500 mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Certifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track credentials</p>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMessageCenterOpen(true)}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <MessageSquare className="text-cyan-500 mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Messages</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Chat with recruiters</p>
                  </div>
                </button>
                <Link
                  href="/networking"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Users className="text-violet-500 mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Network</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect with professionals</p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity - Use new Timeline component */}
            <ActivityTimeline />
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Job Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-montserrat font-bold mb-6">Job Matches</h2>
              <div className="space-y-4">
                {recommendedJobs.map((job, index) => (
                  <Link
                    key={index}
                    href="/jobs"
                    className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      <span className="text-sm text-dynamic-green font-semibold">{job.match}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Requires: {job.clearance}</p>
                  </Link>
                ))}
              </div>
              <Link
                href="/jobs"
                className="mt-4 flex items-center text-dynamic-green hover:text-emerald-green transition-colors"
              >
                View all matches
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-montserrat font-bold mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="text-dynamic-blue mr-3 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Virtual Career Fair</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">March 15, 2025 • 2:00 PM EST</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="text-dynamic-blue mr-3 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Resume Workshop</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">March 20, 2025 • 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-lg p-6 text-white"
            >
              <div className="flex items-center mb-4">
                <Bell size={24} className="mr-3" />
                <h3 className="font-semibold">Job Alerts Active</h3>
              </div>
              <p className="text-sm mb-4">
                You're receiving alerts for Network Admin and Cloud Engineer positions.
              </p>
              <button className="text-sm underline hover:no-underline">
                Manage Preferences
              </button>
            </motion.div>
          </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <ErrorBoundary>
            <Analytics />
          </ErrorBoundary>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <ErrorBoundary>
            <GoalTracking />
          </ErrorBoundary>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <ErrorBoundary>
            <PersonalizedRecommendations />
          </ErrorBoundary>
        )}
      </div>

      {/* Messaging Center Modal */}
      {isMessageCenterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">Messages</h2>
              <button
                onClick={() => setIsMessageCenterOpen(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MessagingCenter />
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={async (data) => {
          try {
            // Save onboarding data
            await secureStorage.setItem('onboardingCompleted', true)
            
            // Update user data with onboarding info
            const updatedUser = {
              ...user,
              ...data,
              onboardingCompleted: true
            }
            
            await secureStorage.setItem('user', updatedUser)
            setUser(updatedUser)
            setShowOnboarding(false)
            
            // Recalculate profile completion
            let completed = 25
            if (updatedUser.firstName && updatedUser.lastName) completed += 15
            if (updatedUser.email) completed += 15
            if (updatedUser.clearanceLevel) completed += 15
            if (updatedUser.phone && updatedUser.location) completed += 15
            
            const currentResume = await secureStorage.getItem('currentResume')
            if (currentResume) completed += 15
            
            setProfileCompletion(completed)
            
            // Show success message (you could add a toast notification here)
            console.log('Onboarding completed successfully!')
          } catch (error) {
            console.error('Error saving onboarding data:', error)
          }
        }}
      />
    </section>
  )
}