'use client'

import { useState } from 'react'
import { Users, Shield, MapPin, MessageCircle, Calendar, UserPlus, Search, Filter } from 'lucide-react'

export default function NetworkPage() {
  const [selectedTab, setSelectedTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')

  const networkTabs = [
    { id: 'discover', label: 'Discover', icon: <Search className="w-4 h-4" /> },
    { id: 'connections', label: 'My Network', icon: <Users className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'groups', label: 'Groups', icon: <Shield className="w-4 h-4" /> }
  ]

  const professionals = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Cybersecurity Analyst',
      clearance: 'TS/SCI',
      location: 'Washington, DC',
      company: 'Defense Contractor',
      experience: '8 years',
      skills: ['NIST', 'Risk Assessment', 'SOC Analysis'],
      mutualConnections: 12
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Systems Administrator',
      clearance: 'Secret',
      location: 'Virginia Beach, VA',
      company: 'Government Agency',
      experience: '5 years',
      skills: ['Windows Server', 'Active Directory', 'PowerShell'],
      mutualConnections: 8
    },
    {
      id: 3,
      name: 'Jennifer Martinez',
      title: 'Project Manager',
      clearance: 'TS',
      location: 'Colorado Springs, CO',
      company: 'Aerospace Company',
      experience: '10 years',
      skills: ['PMP', 'Agile', 'Security Compliance'],
      mutualConnections: 15
    }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Virtual Career Fair - Cleared Professionals',
      date: 'August 25, 2025',
      time: '2:00 PM EST',
      attendees: 250,
      type: 'Career Fair'
    },
    {
      id: 2,
      title: 'Cybersecurity Trends in Defense',
      date: 'August 28, 2025',
      time: '1:00 PM EST',
      attendees: 150,
      type: 'Webinar'
    },
    {
      id: 3,
      title: 'Networking Mixer - DC Metro Area',
      date: 'September 2, 2025',
      time: '6:00 PM EST',
      attendees: 75,
      type: 'In-Person'
    }
  ]

  const groups = [
    {
      id: 1,
      name: 'Cleared Cybersecurity Professionals',
      members: 1250,
      description: 'Connect with cybersecurity professionals holding security clearances',
      isJoined: true
    },
    {
      id: 2,
      name: 'Government Contractors Network',
      members: 850,
      description: 'Discussion group for government contracting professionals',
      isJoined: false
    },
    {
      id: 3,
      name: 'Military Transition Support',
      members: 2100,
      description: 'Support network for transitioning military personnel',
      isJoined: true
    }
  ]

  const getClearanceBadgeColor = (clearance: string) => {
    switch (clearance) {
      case 'TS/SCI':
        return 'bg-red-900/50 text-red-300 border-red-500'
      case 'TS':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-500'
      case 'Secret':
        return 'bg-blue-900/50 text-blue-300 border-blue-500'
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Professional <span className="text-sky-blue">Network</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Connect with cleared professionals, join industry groups, and attend networking events
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {networkTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                selectedTab === tab.id
                  ? 'bg-sky-blue text-white shadow-lg shadow-sky-blue/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-card p-8">
          {selectedTab === 'discover' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">Discover Professionals</h2>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name, title, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-sky-blue focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Professional Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {professionals.map((person) => (
                  <div key={person.id} className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{person.name}</h3>
                        <p className="text-gray-300 text-sm">{person.title}</p>
                        <p className="text-gray-400 text-sm">{person.company}</p>
                      </div>
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getClearanceBadgeColor(person.clearance)}`}>
                        {person.clearance}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      {person.location}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {person.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{person.mutualConnections} mutual connections</span>
                      <button className="flex items-center gap-2 bg-sky-blue hover:bg-sky-blue/80 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'connections' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">My Network</h2>
              </div>
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No connections yet</h3>
                <p className="text-gray-400 mb-6">Start connecting with other cleared professionals to build your network</p>
                <button 
                  onClick={() => setSelectedTab('discover')}
                  className="bg-sky-blue hover:bg-sky-blue/80 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Discover Professionals
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'events' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">Upcoming Events</h2>
              </div>
              
              <div className="space-y-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-800/50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                        <div className="flex items-center gap-4 text-gray-300 text-sm">
                          <span>{event.date}</span>
                          <span>{event.time}</span>
                          <span className="px-2 py-1 bg-sky-blue/20 text-sky-blue rounded text-xs">
                            {event.type}
                          </span>
                        </div>
                      </div>
                      <button className="bg-sky-blue hover:bg-sky-blue/80 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Register
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Users className="w-4 h-4" />
                      {event.attendees} registered
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'groups' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">Professional Groups</h2>
              </div>
              
              <div className="space-y-6">
                {groups.map((group) => (
                  <div key={group.id} className="bg-gray-800/50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{group.name}</h3>
                        <p className="text-gray-300 mb-3">{group.description}</p>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Users className="w-4 h-4" />
                          {group.members.toLocaleString()} members
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        group.isJoined 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-sky-blue hover:bg-sky-blue/80 text-white'
                      }`}>
                        {group.isJoined ? 'Joined' : 'Join Group'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Privacy & Security Notice</h3>
              <p className="text-yellow-200 text-sm">
                We prioritize your privacy and security. Only general clearance levels and professional information are shared. 
                No sensitive personal or clearance details are ever displayed publicly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}