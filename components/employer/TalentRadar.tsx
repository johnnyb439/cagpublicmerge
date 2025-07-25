'use client'

import { useState } from 'react'
import { Search, Filter, MapPin, Shield, Clock, Star, ChevronRight, Target, Users } from 'lucide-react'
import Link from 'next/link'

interface Candidate {
  id: number
  name: string
  title: string
  clearance: string
  location: string
  skills: string[]
  experience: number
  availability: string
  matchScore: number
  lastActive: string
}

export default function TalentRadar() {
  const [selectedJob, setSelectedJob] = useState('Senior DevOps Engineer')
  const [clearanceFilter, setClearanceFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  
  // Mock data for demonstration
  const candidates: Candidate[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'DevOps Engineer',
      clearance: 'TS/SCI',
      location: 'Arlington, VA',
      skills: ['Kubernetes', 'AWS', 'Terraform', 'Python'],
      experience: 8,
      availability: 'Immediate',
      matchScore: 95,
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Senior Cloud Engineer',
      clearance: 'Secret',
      location: 'Bethesda, MD',
      skills: ['AWS', 'Azure', 'Docker', 'Jenkins'],
      experience: 6,
      availability: '2 weeks',
      matchScore: 88,
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Emily Davis',
      title: 'Platform Engineer',
      clearance: 'Top Secret',
      location: 'Alexandria, VA',
      skills: ['Kubernetes', 'GitOps', 'Ansible', 'Go'],
      experience: 10,
      availability: '1 month',
      matchScore: 92,
      lastActive: '3 hours ago'
    },
    {
      id: 4,
      name: 'James Wilson',
      title: 'Infrastructure Engineer',
      clearance: 'TS/SCI + Poly',
      location: 'Reston, VA',
      skills: ['VMware', 'Terraform', 'Python', 'Splunk'],
      experience: 12,
      availability: 'Immediate',
      matchScore: 90,
      lastActive: '1 hour ago'
    }
  ]

  const filteredCandidates = candidates.filter(candidate => {
    if (clearanceFilter !== 'all' && candidate.clearance !== clearanceFilter) return false
    if (locationFilter !== 'all' && !candidate.location.includes(locationFilter)) return false
    return true
  })

  const getClearanceColor = (clearance: string) => {
    if (clearance.includes('TS/SCI')) return 'text-red-500 bg-red-500/20'
    if (clearance.includes('Top Secret')) return 'text-orange-500 bg-orange-500/20'
    if (clearance.includes('Secret')) return 'text-yellow-500 bg-yellow-500/20'
    return 'text-blue-500 bg-blue-500/20'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <Target className="text-sky-blue" size={36} />
          TalentRadar™
        </h1>
        <p className="text-gray-400">AI-powered candidate matching for your cleared positions</p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Position</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white"
            >
              <option>Senior DevOps Engineer</option>
              <option>Cybersecurity Analyst</option>
              <option>Cloud Architect</option>
              <option>Data Engineer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Clearance Level</label>
            <select
              value={clearanceFilter}
              onChange={(e) => setClearanceFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white"
            >
              <option value="all">All Clearances</option>
              <option value="Secret">Secret</option>
              <option value="Top Secret">Top Secret</option>
              <option value="TS/SCI">TS/SCI</option>
              <option value="TS/SCI + Poly">TS/SCI + Poly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white"
            >
              <option value="all">All Locations</option>
              <option value="Arlington">Arlington, VA</option>
              <option value="Alexandria">Alexandria, VA</option>
              <option value="Bethesda">Bethesda, MD</option>
              <option value="Reston">Reston, VA</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
            <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-sky-blue text-white">
              <option>All</option>
              <option>Immediate</option>
              <option>2 weeks</option>
              <option>1 month</option>
              <option>2+ months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Matches</p>
              <p className="text-2xl font-bold text-white">{filteredCandidates.length}</p>
            </div>
            <Users className="text-sky-blue" size={32} />
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">90%+ Match</p>
              <p className="text-2xl font-bold text-white">
                {filteredCandidates.filter(c => c.matchScore >= 90).length}
              </p>
            </div>
            <Star className="text-neon-green" size={32} />
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Available Now</p>
              <p className="text-2xl font-bold text-white">
                {filteredCandidates.filter(c => c.availability === 'Immediate').length}
              </p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">TS/SCI+</p>
              <p className="text-2xl font-bold text-white">
                {filteredCandidates.filter(c => c.clearance.includes('TS/SCI')).length}
              </p>
            </div>
            <Shield className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="glass-card rounded-lg p-6 hover:bg-gray-700/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-xl font-semibold text-white">{candidate.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getClearanceColor(candidate.clearance)}`}>
                    {candidate.clearance}
                  </span>
                  <span className="text-xs text-gray-400">Active {candidate.lastActive}</span>
                </div>
                
                <p className="text-gray-300 mb-2">{candidate.title} • {candidate.experience} years experience</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {candidate.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Available: {candidate.availability}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-center ml-8">
                <div className="relative w-24 h-24 mb-2">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - candidate.matchScore / 100)}`}
                      className="text-neon-green transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{candidate.matchScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Match Score</p>
                <button className="mt-3 px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-1">
                  View Profile
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 glass-card rounded-lg hover:bg-gray-700 transition-all">
          Load More Candidates
        </button>
      </div>
    </div>
  )
}