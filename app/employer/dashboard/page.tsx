'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Search, MapPin, Shield, Clock, TrendingUp, 
  Briefcase, Star, Filter, ChevronRight, Building,
  Target, Activity, DollarSign, Calendar, Eye
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EmployerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    if (parsedUser.type !== 'employer') {
      router.push('/dashboard')
      return
    }
    
    setUser(parsedUser)
  }, [router])

  const stats = {
    activeJobs: 8,
    totalCandidates: 147,
    interviews: 12,
    hires: 3
  }

  const recentCandidates = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'DevOps Engineer',
      clearance: 'TS/SCI',
      location: 'Arlington, VA',
      matchScore: 95,
      status: 'Interview Scheduled'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Cybersecurity Analyst',
      clearance: 'Secret',
      location: 'Bethesda, MD',
      matchScore: 88,
      status: 'New Application'
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'Cloud Architect',
      clearance: 'Top Secret',
      location: 'Alexandria, VA',
      matchScore: 92,
      status: 'Reviewing'
    }
  ]

  const activeJobs = [
    {
      id: 1,
      title: 'Senior DevOps Engineer',
      location: 'Arlington, VA',
      clearance: 'TS/SCI',
      applicants: 23,
      new: 5,
      postedDays: 3
    },
    {
      id: 2,
      title: 'Cybersecurity Analyst',
      location: 'Bethesda, MD',
      clearance: 'Secret',
      applicants: 45,
      new: 12,
      postedDays: 7
    },
    {
      id: 3,
      title: 'Cloud Solutions Architect',
      location: 'Remote',
      clearance: 'Top Secret',
      applicants: 31,
      new: 8,
      postedDays: 5
    }
  ]

  if (!user) return null

  return (
    <div className="min-h-screen glass-bg py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-card rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Employer Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/employer/post-job"
                className="px-6 py-3 bg-gradient-to-r from-sky-blue to-neon-green text-white rounded-lg hover:shadow-lg transition-all"
              >
                Post New Job
              </Link>
              <Link
                href="/employer/talent-radar"
                className="px-6 py-3 glass-card rounded-lg hover:bg-gray-700 transition-all"
              >
                <Target className="inline mr-2" size={20} />
                TalentRadar
              </Link>
              <Link
                href="/employer/tools"
                className="px-6 py-3 glass-card rounded-lg hover:bg-gray-700 transition-all"
              >
                <Shield className="inline mr-2" size={20} />
                Employer Tools
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Jobs</p>
                  <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
                </div>
                <Briefcase className="text-sky-blue" size={32} />
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Candidates</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCandidates}</p>
                </div>
                <Users className="text-neon-green" size={32} />
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Interviews</p>
                  <p className="text-2xl font-bold text-white">{stats.interviews}</p>
                </div>
                <Calendar className="text-purple-500" size={32} />
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Hires This Month</p>
                  <p className="text-2xl font-bold text-white">{stats.hires}</p>
                </div>
                <TrendingUp className="text-emerald-500" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          {['overview', 'candidates', 'jobs', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-sky-blue text-white'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Candidates */}
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-sky-blue" />
                Recent Candidates
              </h2>
              <div className="space-y-4">
                {recentCandidates.map((candidate) => (
                  <div key={candidate.id} className="glass-card p-4 rounded-lg hover:bg-gray-700 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{candidate.name}</h3>
                        <p className="text-sm text-gray-400">{candidate.role}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Shield size={14} className="text-sky-blue" />
                            {candidate.clearance}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-neon-green" />
                            {candidate.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neon-green">{candidate.matchScore}%</div>
                        <div className="text-xs text-gray-400">Match Score</div>
                        <div className={`text-xs mt-1 px-2 py-1 rounded ${
                          candidate.status === 'Interview Scheduled' ? 'bg-sky-blue/20 text-sky-blue' :
                          candidate.status === 'New Application' ? 'bg-neon-green/20 text-neon-green' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {candidate.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/employer/candidates" className="block mt-4 text-sky-blue hover:underline text-sm">
                View All Candidates →
              </Link>
            </div>

            {/* Active Jobs */}
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="text-neon-green" />
                Active Job Postings
              </h2>
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <div key={job.id} className="glass-card p-4 rounded-lg hover:bg-gray-700 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{job.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield size={14} />
                            {job.clearance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {job.postedDays} days ago
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{job.applicants}</div>
                        <div className="text-xs text-gray-400">Applicants</div>
                        {job.new > 0 && (
                          <div className="text-xs mt-1 px-2 py-1 bg-neon-green/20 text-neon-green rounded">
                            +{job.new} new
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/employer/jobs" className="block mt-4 text-sky-blue hover:underline text-sm">
                Manage All Jobs →
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="glass-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">All Candidates</h2>
              <div className="flex gap-4">
                <button className="px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2">
                  <Filter size={20} />
                  Filter
                </button>
                <button className="px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2">
                  <Search size={20} />
                  Search
                </button>
              </div>
            </div>
            <p className="text-gray-400">Candidate management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="glass-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Job Management</h2>
              <Link
                href="/employer/post-job"
                className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                Post New Job
              </Link>
            </div>
            <p className="text-gray-400">Job management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Recruitment Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-4 rounded-lg">
                <Activity className="text-sky-blue mb-2" size={24} />
                <p className="text-sm text-gray-400">Application Rate</p>
                <p className="text-2xl font-bold">18.4/day</p>
                <p className="text-xs text-neon-green">+12% from last week</p>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <Eye className="text-neon-green mb-2" size={24} />
                <p className="text-sm text-gray-400">Job Views</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-sky-blue">This week</p>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <Star className="text-yellow-500 mb-2" size={24} />
                <p className="text-sm text-gray-400">Quality Score</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-gray-400">Top 10% match rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}