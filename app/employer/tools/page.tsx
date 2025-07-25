'use client'

import { useState } from 'react'
import { Shield, Brain, FileText, Users, Activity, Target } from 'lucide-react'
import ClearanceVerification from '@/components/employer/ClearanceVerification'
import ResumeParser from '@/components/employer/ResumeParser'

export default function EmployerToolsPage() {
  const [activeTab, setActiveTab] = useState('clearance')

  const tools = [
    { id: 'clearance', name: 'Clearance Verification', icon: Shield, component: ClearanceVerification },
    { id: 'resume', name: 'Resume Parser', icon: Brain, component: ResumeParser },
  ]

  const ActiveComponent = tools.find(tool => tool.id === activeTab)?.component

  return (
    <div className="min-h-screen glass-bg py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Employer Tools</h1>
          <p className="text-gray-400">Powerful tools to streamline your hiring process</p>
        </div>

        {/* Tool Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all ${
                activeTab === tool.id
                  ? 'bg-gradient-to-r from-sky-blue to-neon-green text-white shadow-lg'
                  : 'glass-card hover:bg-gray-700'
              }`}
            >
              <tool.icon size={20} />
              {tool.name}
            </button>
          ))}
        </div>

        {/* Active Tool Component */}
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  )
}