'use client'

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
  ResponsiveContainer
} from 'recharts'

const jobApplicationData = [
  { month: 'Jan', applications: 5, interviews: 2, offers: 0 },
  { month: 'Feb', applications: 8, interviews: 3, offers: 1 },
  { month: 'Mar', applications: 12, interviews: 5, offers: 2 },
  { month: 'Apr', applications: 10, interviews: 4, offers: 1 },
  { month: 'May', applications: 15, interviews: 7, offers: 3 },
  { month: 'Jun', applications: 20, interviews: 8, offers: 2 }
]

const skillsData = [
  { name: 'Network Security', value: 85, color: '#A4D65E' },
  { name: 'Cloud Computing', value: 70, color: '#41B6E6' },
  { name: 'System Admin', value: 90, color: '#00AB84' },
  { name: 'DevOps', value: 65, color: '#0083CA' },
  { name: 'Cybersecurity', value: 80, color: '#7CCBDF' }
]

const clearanceDistribution = [
  { name: 'PUBLIC', value: 15, color: '#E5E5E5' },
  { name: 'SECRET', value: 45, color: '#A4D65E' },
  { name: 'TS', value: 30, color: '#41B6E6' },
  { name: 'TS/SCI', value: 10, color: '#00AB84' }
]

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Job Application Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-montserrat font-bold mb-4">Application Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={jobApplicationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="applications" 
              stroke="#A4D65E" 
              strokeWidth={2}
              name="Applications"
            />
            <Line 
              type="monotone" 
              dataKey="interviews" 
              stroke="#41B6E6" 
              strokeWidth={2}
              name="Interviews"
            />
            <Line 
              type="monotone" 
              dataKey="offers" 
              stroke="#00AB84" 
              strokeWidth={2}
              name="Offers"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Skills Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-montserrat font-bold mb-4">Skills Assessment</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skillsData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="value" fill="#A4D65E">
              {skillsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Clearance Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-white dark:bg-command-black rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-montserrat font-bold mb-4">Job Market by Clearance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={clearanceDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {clearanceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}