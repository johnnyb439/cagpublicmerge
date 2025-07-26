'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeJobs: 89,
    totalApplications: 3456,
    pendingReviews: 23,
    monthlySignups: 156,
    jobViews: 12890,
    conversionRate: 4.2,
    avgTimeToHire: 28
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'user_signup', user: 'John Smith', time: '5 min ago', details: 'TS/SCI Clearance' },
    { id: 2, type: 'job_posted', company: 'Defense Corp', time: '12 min ago', details: 'Senior Developer' },
    { id: 3, type: 'application', user: 'Sarah Johnson', time: '25 min ago', details: 'Applied to Cyber Analyst' },
    { id: 4, type: 'content_update', admin: 'Admin User', time: '1 hour ago', details: 'Updated job posting guidelines' }
  ])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'jobs', label: 'Job Management', icon: Briefcase },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-green-600">+{stats.monthlySignups} this month</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg mt-2 sm:mt-0">
              <Users className="w-4 sm:w-6 h-4 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</p>
              <p className="text-xs sm:text-sm text-gray-500">{stats.jobViews.toLocaleString()} views</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg mt-2 sm:mt-0">
              <Briefcase className="w-4 sm:w-6 h-4 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Applications</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-blue-600">{stats.conversionRate}% conversion</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg mt-2 sm:mt-0">
              <FileText className="w-4 sm:w-6 h-4 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReviews}</p>
              <p className="text-xs sm:text-sm text-orange-600">Requires attention</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-lg mt-2 sm:mt-0">
              <AlertTriangle className="w-4 sm:w-6 h-4 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 bg-sky-blue/10 rounded-full flex items-center justify-center">
                  {activity.type === 'user_signup' && <Users className="w-5 h-5 text-sky-blue" />}
                  {activity.type === 'job_posted' && <Briefcase className="w-5 h-5 text-sky-blue" />}
                  {activity.type === 'application' && <FileText className="w-5 h-5 text-sky-blue" />}
                  {activity.type === 'content_update' && <Edit className="w-5 h-5 text-sky-blue" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.type === 'user_signup' && `${activity.user} signed up`}
                    {activity.type === 'job_posted' && `${activity.company} posted a new job`}
                    {activity.type === 'application' && `${activity.user} submitted an application`}
                    {activity.type === 'content_update' && `${activity.admin} updated content`}
                  </p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Add New Job</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new job posting</p>
            </div>
          </div>
        </button>

        <button className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Manage Users</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and edit user accounts</p>
            </div>
          </div>
        </button>

        <button className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">View Analytics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check platform performance</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email, clearance..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>All Clearances</option>
              <option>Public Trust</option>
              <option>Secret</option>
              <option>Top Secret</option>
              <option>TS/SCI</option>
            </select>
            <button className="px-4 py-3 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Download className="w-4 h-4 inline mr-1" />
                Export
              </button>
              <button className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors">
                <Plus className="w-4 h-4 inline mr-1" />
                Add User
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clearance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { id: 1, name: 'John Smith', email: 'john@example.com', clearance: 'TS/SCI', status: 'Active', joined: '2024-01-15' },
                { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', clearance: 'Secret', status: 'Active', joined: '2024-02-03' },
                { id: 3, name: 'Mike Wilson', email: 'mike@example.com', clearance: 'Top Secret', status: 'Pending', joined: '2024-07-20' }
              ].map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-sky-blue/10 text-sky-blue px-2 py-1 rounded-full text-xs font-medium">
                      {user.clearance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderJobManagement = () => (
    <div className="space-y-6">
      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active Jobs</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
          <p className="text-sm text-green-600">+12 this week</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pending Approval</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
          <p className="text-sm text-orange-600">Needs review</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Applications</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3,456</p>
          <p className="text-sm text-blue-600">4.2% avg conversion</p>
        </div>
      </div>

      {/* Job Listings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Postings</h3>
            <button className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors">
              <Plus className="w-4 h-4 inline mr-1" />
              New Job
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {[
            { id: 1, title: 'Senior Software Engineer', company: 'Defense Corp', status: 'Active', applications: 45, posted: '2024-07-20' },
            { id: 2, title: 'Cybersecurity Analyst', company: 'Gov Agency', status: 'Pending', applications: 12, posted: '2024-07-18' },
            { id: 3, title: 'DevOps Engineer', company: 'Aerospace Co', status: 'Active', applications: 28, posted: '2024-07-15' }
          ].map(job => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.status === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {job.status}
                </span>
                <span className="text-sm text-gray-500">{job.applications} applications</span>
                <div className="flex gap-2">
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'users':
        return renderUserManagement()
      case 'jobs':
        return renderJobManagement()
      case 'content':
        return <div className="text-center py-12 text-gray-500">Content Management coming soon...</div>
      case 'analytics':
        return <div className="text-center py-12 text-gray-500">Advanced Analytics coming soon...</div>
      case 'settings':
        return <div className="text-center py-12 text-gray-500">Settings panel coming soon...</div>
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-sky-blue/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-sky-blue" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, jobs, content, and monitor platform performance
          </p>
        </div>

        {/* Navigation Tabs - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-w-fit touch-manipulation ${
                    activeTab === tab.id
                      ? 'border-sky-blue text-sky-blue'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  )
}