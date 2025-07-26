'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Target, Award, Briefcase } from 'lucide-react'

interface AnalyticsData {
  applications: {
    total: number
    thisMonth: number
    active: number
    responseRate: number
    interviewRate: number
    offerRate: number
    timeline: Array<{
      date: string
      applications: number
      responses: number
      interviews: number
    }>
    statusBreakdown: Record<string, number>
    topCompanies: Array<{
      name: string
      applications: number
      responses: number
    }>
  }
  certifications: {
    total: number
    active: number
    expiring: number
    expired: number
    byCategory: Record<string, number>
  }
  trends: {
    applications: number
    responseRate: number
    certifications: number
  }
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/dashboard/analytics?userId=1&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setAnalyticsData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>
  }

  // Transform data for charts
  const applicationTrends = analyticsData.applications.timeline.slice(-30).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    applications: item.applications,
    responses: item.responses,
    interviews: item.interviews
  }))

  const statusData = Object.entries(analyticsData.applications.statusBreakdown).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: getStatusColor(status)
  }))

  const certificationData = Object.entries(analyticsData.certifications.byCategory).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    color: getCategoryColor(category)
  }))

  const companyData = analyticsData.applications.topCompanies.map(company => ({
    name: company.name,
    applications: company.applications,
    responses: company.responses,
    responseRate: company.applications > 0 ? Math.round((company.responses / company.applications) * 100) : 0
  }))

  // Metrics cards data
  const metrics = [
    {
      title: 'Response Rate',
      value: `${analyticsData.applications.responseRate}%`,
      trend: analyticsData.trends.responseRate,
      icon: Activity,
      color: 'text-dynamic-green'
    },
    {
      title: 'Interview Rate',
      value: `${analyticsData.applications.interviewRate}%`,
      trend: 10,
      icon: Target,
      color: 'text-dynamic-blue'
    },
    {
      title: 'Active Applications',
      value: analyticsData.applications.active,
      trend: analyticsData.trends.applications,
      icon: Briefcase,
      color: 'text-emerald-green'
    },
    {
      title: 'Active Certifications',
      value: analyticsData.certifications.active,
      trend: analyticsData.trends.certifications,
      icon: Award,
      color: 'text-sky-blue'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-command-black"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon size={24} className={metric.color} />
              <div className="flex items-center">
                {metric.trend > 0 ? (
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                ) : metric.trend < 0 ? (
                  <TrendingDown size={16} className="text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm font-medium ${
                  metric.trend > 0 ? 'text-green-500' : metric.trend < 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {Math.abs(metric.trend)}%
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold">{metric.value}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Application Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-montserrat font-bold mb-4">Application Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={applicationTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="applications" 
              stackId="1"
              stroke="#A4D65E" 
              fill="#A4D65E"
              fillOpacity={0.8}
              name="Applications"
            />
            <Area 
              type="monotone" 
              dataKey="responses" 
              stackId="1"
              stroke="#41B6E6" 
              fill="#41B6E6"
              fillOpacity={0.8}
              name="Responses"
            />
            <Area 
              type="monotone" 
              dataKey="interviews" 
              stackId="1"
              stroke="#00AB84" 
              fill="#00AB84"
              fillOpacity={0.8}
              name="Interviews"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-montserrat font-bold mb-4">Application Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-montserrat font-bold mb-4">Top Companies</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={companyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="#A4D65E" name="Applications" />
              <Bar dataKey="responses" fill="#41B6E6" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Certifications by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-montserrat font-bold mb-4">Certifications by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={certificationData}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
              <Radar name="Certifications" dataKey="value" stroke="#00AB84" fill="#00AB84" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Response Rate by Company */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-montserrat font-bold mb-4">Company Response Rates</h3>
          <div className="space-y-4">
            {companyData.map((company, index) => (
              <div key={company.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{company.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{company.responseRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${company.responseRate}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-sky-blue to-neon-green h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    applied: '#E5E5E5',
    screening: '#7CCBDF',
    interview_scheduled: '#41B6E6',
    interviewing: '#0083CA',
    offer_received: '#00AB84',
    rejected: '#FF6B6B',
    withdrawn: '#FFD93D',
    accepted: '#A4D65E'
  }
  return colors[status] || '#E5E5E5'
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    security: '#00AB84',
    cloud: '#41B6E6',
    network: '#0083CA',
    development: '#A4D65E',
    infrastructure: '#7CCBDF',
    other: '#E5E5E5'
  }
  return colors[category] || '#E5E5E5'
}