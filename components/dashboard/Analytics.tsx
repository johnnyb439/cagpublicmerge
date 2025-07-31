'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Award, Briefcase, Target } from 'lucide-react'

// Data for charts
const applicationActivityData = [
  { date: 'Jun 28', applications: 2, interviews: 1, responses: 1 },
  { date: 'Jul 1', applications: 3, interviews: 1, responses: 2 },
  { date: 'Jul 3', applications: 1, interviews: 0, responses: 1 },
  { date: 'Jul 5', applications: 2, interviews: 1, responses: 1 },
  { date: 'Jul 7', applications: 4, interviews: 2, responses: 3 },
  { date: 'Jul 9', applications: 3, interviews: 2, responses: 2 },
  { date: 'Jul 11', applications: 5, interviews: 3, responses: 4 },
  { date: 'Jul 13', applications: 2, interviews: 1, responses: 1 },
  { date: 'Jul 15', applications: 4, interviews: 2, responses: 3 },
  { date: 'Jul 17', applications: 3, interviews: 2, responses: 2 },
  { date: 'Jul 19', applications: 5, interviews: 3, responses: 3 },
  { date: 'Jul 21', applications: 4, interviews: 3, responses: 3 },
  { date: 'Jul 23', applications: 6, interviews: 4, responses: 4 },
  { date: 'Jul 25', applications: 5, interviews: 3, responses: 4 },
  { date: 'Jul 27', applications: 4, interviews: 3, responses: 3 },
]

const applicationStatusData = [
  { name: 'Screening', value: 13, percentage: 13 },
  { name: 'Interview Scheduled', value: 6, percentage: 6 },
  { name: 'Interviewing', value: 4, percentage: 4 },
  { name: 'Offer Received', value: 8, percentage: 8 },
  { name: 'Applied', value: 25, percentage: 25 },
  { name: 'Accepted', value: 4, percentage: 4 },
  { name: 'Withdrawn', value: 4, percentage: 4 },
  { name: 'Rejected', value: 33, percentage: 33 },
]

const topCompaniesData = [
  { name: 'Lockheed Martin', applications: 5, responses: 4 },
  { name: 'Raytheon', applications: 4, responses: 3 },
  { name: 'Booz Allen Hamilton', applications: 3, responses: 3 },
  { name: 'CACI', applications: 3, responses: 2 },
  { name: 'General Dynamics', applications: 2, responses: 1 },
  { name: 'Northrop Grumman', applications: 2, responses: 1 },
]

const certificationRadarData = [
  { category: 'Security', value: 85 },
  { category: 'Network', value: 75 },
  { category: 'Cloud', value: 65 },
  { category: 'DevOps', value: 55 },
  { category: 'Database', value: 45 },
]

const companyResponseRates = [
  { company: 'Lockheed Martin', rate: 75 },
  { company: 'Raytheon', rate: 67 },
  { company: 'Booz Allen Hamilton', rate: 67 },
  { company: 'CACI', rate: 50 },
  { company: 'General Dynamics', rate: 0 },
]

const COLORS = ['#00F5A0', '#00D9FF', '#7B61FF', '#FF6B6B', '#FFD93D', '#6BCF7F', '#FF9F40', '#FF6384']

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30')

  const stats = [
    { 
      label: 'Response Rate', 
      value: '67.5%', 
      trend: 'up',
      change: '+11%',
      icon: Activity,
      color: 'text-dynamic-green' 
    },
    { 
      label: 'Interview Rate', 
      value: '41.7%', 
      trend: 'up',
      change: '+16%',
      icon: Target,
      color: 'text-dynamic-blue' 
    },
    { 
      label: 'Active Applications', 
      value: '12', 
      trend: 'same',
      change: '0%',
      icon: Briefcase,
      color: 'text-emerald-green' 
    },
    { 
      label: 'Active Certifications', 
      value: '4', 
      trend: 'up',
      change: '+20%',
      icon: Award,
      color: 'text-sky-blue' 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-white dark:bg-command-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dynamic-green"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon size={24} className={stat.color} />
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-500' : 
                stat.trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {stat.trend === 'up' && <TrendingUp size={16} className="mr-1" />}
                {stat.trend === 'down' && <TrendingDown size={16} className="mr-1" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Application Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-6">Application Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={applicationActivityData}>
            <defs>
              <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5A0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00F5A0" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#7B61FF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#F3F4F6'
              }} 
            />
            <Legend />
            <Area type="monotone" dataKey="applications" stroke="#00F5A0" fillOpacity={1} fill="url(#colorApplications)" strokeWidth={2} />
            <Area type="monotone" dataKey="interviews" stroke="#00D9FF" fillOpacity={1} fill="url(#colorInterviews)" strokeWidth={2} />
            <Area type="monotone" dataKey="responses" stroke="#7B61FF" fillOpacity={1} fill="url(#colorResponses)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Application Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={applicationStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percentage}) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {applicationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Companies Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Top Companies</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCompaniesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Legend />
              <Bar dataKey="applications" fill="#00F5A0" />
              <Bar dataKey="responses" fill="#00D9FF" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certifications Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Certifications by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={certificationRadarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="category" stroke="#9CA3AF" fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
              <Radar name="Skills" dataKey="value" stroke="#00F5A0" fill="#00F5A0" fillOpacity={0.6} strokeWidth={2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Company Response Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Company Response Rates</h3>
          <div className="space-y-4">
            {companyResponseRates.map((company, index) => (
              <div key={company.company}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{company.company}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{company.rate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <motion.div 
                    className="bg-gradient-to-r from-dynamic-green to-dynamic-blue h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${company.rate}%` }}
                    transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
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