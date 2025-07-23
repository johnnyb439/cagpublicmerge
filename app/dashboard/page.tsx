'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserData {
  email: string
  name: string
  clearanceLevel: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
      </div>
    )
  }

  const stats = [
    { label: 'Profile Completion', value: '75%', icon: User, color: 'text-dynamic-green' },
    { label: 'Jobs Applied', value: '12', icon: Briefcase, color: 'text-dynamic-blue' },
    { label: 'Certifications', value: '3', icon: Award, color: 'text-emerald-green' },
    { label: 'Mock Interviews', value: '5', icon: Target, color: 'text-sky-blue' }
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
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8">
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
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            >
              <LogOut size={20} className="mr-2" />
              Log Out
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon size={24} className={stat.color} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
            >
              <h2 className="text-xl font-montserrat font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/jobs"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                >
                  <Briefcase className="text-dynamic-green mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Browse Jobs</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View cleared positions</p>
                  </div>
                </Link>
                <Link
                  href="/mock-interview"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                >
                  <Target className="text-dynamic-blue mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Practice Interview</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered prep</p>
                  </div>
                </Link>
                <Link
                  href="/resources"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                >
                  <BookOpen className="text-emerald-green mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Resources</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Career guides</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/resume"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                >
                  <FileText className="text-sky-blue mr-3" size={24} />
                  <div>
                    <p className="font-semibold">Update Resume</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Military translation</p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
            >
              <h2 className="text-xl font-montserrat font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-dynamic-green rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">{activity.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Job Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
            >
              <h2 className="text-xl font-montserrat font-bold mb-6">Job Matches</h2>
              <div className="space-y-4">
                {recommendedJobs.map((job, index) => (
                  <Link
                    key={index}
                    href="/jobs"
                    className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
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
      </div>
    </section>
  )
}