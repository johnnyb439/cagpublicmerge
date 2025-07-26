'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  MapPin,
  Briefcase,
  Award,
  MessageCircle,
  UserPlus,
  Filter,
  Calendar,
  Globe,
  Shield,
  Star,
  Building,
  Phone,
  Mail,
  Linkedin,
  ExternalLink,
  Coffee,
  Network,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface NetworkMember {
  id: string
  name: string
  title: string
  company: string
  location: string
  clearanceLevel: 'SECRET' | 'TOP_SECRET' | 'TS_SCI'
  experience: number
  expertise: string[]
  avatar?: string
  bio: string
  linkedinUrl?: string
  isConnected: boolean
  mutualConnections: number
  lastActive: string
  availability: 'available' | 'busy' | 'away'
  mentoring: boolean
  lookingForJob: boolean
  rating: number
  responseRate: number
}

interface NetworkEvent {
  id: string
  title: string
  type: 'virtual' | 'in-person' | 'webinar'
  date: string
  time: string
  location: string
  attendees: number
  maxAttendees: number
  tags: string[]
  description: string
  organizer: string
}

const clearanceLevels = {
  SECRET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TOP_SECRET: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  TS_SCI: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

const availabilityColors = {
  available: 'bg-green-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500'
}

export default function NetworkingPage() {
  const [members, setMembers] = useState<NetworkMember[]>([])
  const [events, setEvents] = useState<NetworkEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClearance, setSelectedClearance] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all')
  const [showMentorsOnly, setShowMentorsOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'mentorship'>('members')

  useEffect(() => {
    fetchNetworkData()
  }, [])

  const fetchNetworkData = async () => {
    try {
      // Mock data for networking members
      const mockMembers: NetworkMember[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          title: 'Senior Cybersecurity Analyst',
          company: 'Federal Security Solutions',
          location: 'Washington, DC',
          clearanceLevel: 'TS_SCI',
          experience: 8,
          expertise: ['Cybersecurity', 'Risk Assessment', 'Incident Response'],
          bio: 'Experienced cybersecurity professional with expertise in federal environments. Happy to mentor junior professionals.',
          isConnected: false,
          mutualConnections: 5,
          lastActive: '2 hours ago',
          availability: 'available',
          mentoring: true,
          lookingForJob: false,
          rating: 4.8,
          responseRate: 95
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          title: 'Cloud Architect',
          company: 'AWS Professional Services',
          location: 'Arlington, VA',
          clearanceLevel: 'SECRET',
          experience: 12,
          expertise: ['AWS', 'Cloud Architecture', 'DevOps'],
          bio: 'AWS certified architect specializing in federal cloud migrations. Available for coffee chats.',
          isConnected: true,
          mutualConnections: 8,
          lastActive: '1 day ago',
          availability: 'busy',
          mentoring: true,
          lookingForJob: false,
          rating: 4.9,
          responseRate: 88
        },
        {
          id: '3',
          name: 'Jennifer Park',
          title: 'Project Manager',
          company: 'Booz Allen Hamilton',
          location: 'McLean, VA',
          clearanceLevel: 'TOP_SECRET',
          experience: 6,
          expertise: ['Project Management', 'Agile', 'PMI Certified'],
          bio: 'PMP certified project manager with experience in large-scale federal projects.',
          isConnected: false,
          mutualConnections: 3,
          lastActive: '3 hours ago',
          availability: 'available',
          mentoring: false,
          lookingForJob: true,
          rating: 4.7,
          responseRate: 92
        },
        {
          id: '4',
          name: 'David Thompson',
          title: 'Network Engineer',
          company: 'CACI',
          location: 'Reston, VA',
          clearanceLevel: 'SECRET',
          experience: 15,
          expertise: ['Network Security', 'Cisco', 'Network Design'],
          bio: 'Senior network engineer with extensive federal experience. Love helping newcomers to cleared space.',
          isConnected: false,
          mutualConnections: 12,
          lastActive: '5 hours ago',
          availability: 'available',
          mentoring: true,
          lookingForJob: false,
          rating: 4.6,
          responseRate: 90
        },
        {
          id: '5',
          name: 'Amanda Wilson',
          title: 'Data Scientist',
          company: 'Palantir Technologies',
          location: 'Washington, DC',
          clearanceLevel: 'TS_SCI',
          experience: 4,
          expertise: ['Machine Learning', 'Python', 'Data Analytics'],
          bio: 'Data scientist working on federal analytics projects. Open to collaboration and knowledge sharing.',
          isConnected: true,
          mutualConnections: 6,
          lastActive: '1 hour ago',
          availability: 'available',
          mentoring: false,
          lookingForJob: false,
          rating: 4.8,
          responseRate: 96
        }
      ]

      const mockEvents: NetworkEvent[] = [
        {
          id: '1',
          title: 'Cleared Professionals Happy Hour',
          type: 'in-person',
          date: '2025-02-15',
          time: '6:00 PM EST',
          location: 'The Hamilton, Washington DC',
          attendees: 24,
          maxAttendees: 50,
          tags: ['networking', 'social', 'dc-area'],
          description: 'Monthly networking event for cleared professionals in the DC area.',
          organizer: 'DC Cleared Network'
        },
        {
          id: '2',
          title: 'Federal Cloud Security Workshop',
          type: 'webinar',
          date: '2025-02-20',
          time: '2:00 PM EST',
          location: 'Virtual',
          attendees: 156,
          maxAttendees: 500,
          tags: ['cloud', 'security', 'workshop'],
          description: 'Learn about the latest cloud security practices for federal environments.',
          organizer: 'Sarah Chen'
        },
        {
          id: '3',
          title: 'Mentorship Lunch & Learn',
          type: 'in-person',
          date: '2025-02-25',
          time: '12:00 PM EST',
          location: 'Rosslyn, VA',
          attendees: 18,
          maxAttendees: 30,
          tags: ['mentorship', 'career', 'lunch'],
          description: 'Quarterly mentorship session focused on career development in the cleared space.',
          organizer: 'Cleared Advisory Group'
        }
      ]

      setMembers(mockMembers)
      setEvents(mockEvents)
    } catch (error) {
      console.error('Error fetching network data:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectWithMember = async (memberId: string) => {
    setMembers(members.map(member => 
      member.id === memberId 
        ? { ...member, isConnected: true }
        : member
    ))
  }

  const sendMessage = (memberId: string) => {
    // This would typically open a messaging interface
    console.log(`Opening message to member ${memberId}`)
  }

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesClearance = selectedClearance === 'all' || member.clearanceLevel === selectedClearance
    const matchesLocation = selectedLocation === 'all' || member.location.includes(selectedLocation)
    const matchesExpertise = selectedExpertise === 'all' || member.expertise.some(skill => 
      skill.toLowerCase().includes(selectedExpertise.toLowerCase())
    )
    const matchesMentoring = !showMentorsOnly || member.mentoring

    return matchesSearch && matchesClearance && matchesLocation && matchesExpertise && matchesMentoring
  })

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date())

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
          </div>
        </div>
      </div>
    )
  }

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
                Professional Network
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with cleared professionals, find mentors, and grow your career
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-dynamic-green">{members.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-dynamic-blue">{members.filter(m => m.isConnected).length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-2 mb-8"
        >
          <div className="flex space-x-1">
            {[
              { id: 'members', label: 'Network Members', icon: Users },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'mentorship', label: 'Mentorship', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-dynamic-green text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>

                <select
                  value={selectedClearance}
                  onChange={(e) => setSelectedClearance(e.target.value)}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="all">All Clearances</option>
                  <option value="SECRET">SECRET</option>
                  <option value="TOP_SECRET">TOP SECRET</option>
                  <option value="TS_SCI">TS/SCI</option>
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="all">All Locations</option>
                  <option value="Washington">Washington, DC</option>
                  <option value="Arlington">Arlington, VA</option>
                  <option value="McLean">McLean, VA</option>
                  <option value="Reston">Reston, VA</option>
                </select>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mentorsOnly"
                    checked={showMentorsOnly}
                    onChange={(e) => setShowMentorsOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="mentorsOnly" className="text-sm text-gray-600 dark:text-gray-400">
                    Mentors only
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${availabilityColors[member.availability]}`}></div>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.title}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${clearanceLevels[member.clearanceLevel]}`}>
                      {member.clearanceLevel.replace('_', '/')}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Building size={14} className="mr-2" />
                      {member.company}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={14} className="mr-2" />
                      {member.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase size={14} className="mr-2" />
                      {member.experience} years experience
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.expertise.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {member.expertise.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        +{member.expertise.length - 3}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {member.bio}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star size={12} className="mr-1 text-yellow-500" />
                      {member.rating} rating
                    </div>
                    <div>{member.responseRate}% response rate</div>
                    {member.mentoring && (
                      <div className="flex items-center text-dynamic-green">
                        <Award size={12} className="mr-1" />
                        Mentor
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {member.isConnected ? (
                      <button
                        onClick={() => sendMessage(member.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={() => connectWithMember(member.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-dynamic-blue text-white rounded-lg hover:bg-sky-blue transition-colors"
                      >
                        <UserPlus size={16} className="mr-2" />
                        Connect
                      </button>
                    )}
                    {member.linkedinUrl && (
                      <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Linkedin size={16} />
                      </button>
                    )}
                  </div>

                  {member.mutualConnections > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {member.mutualConnections} mutual connections
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No members found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {upcomingEvents.map((event, index) => (
                <div key={event.id} className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold mr-3">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.type === 'virtual' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          event.type === 'in-person' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock size={16} className="mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin size={16} className="mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users size={16} className="mr-2" />
                      {event.attendees}/{event.maxAttendees} attending
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Organized by {event.organizer}
                    </p>
                    <button className="px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}

        {/* Mentorship Tab */}
        {activeTab === 'mentorship' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Mentorship Program Overview */}
            <div className="bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Cleared Professionals Mentorship Program</h2>
              <p className="text-lg mb-6">
                Connect with experienced professionals who understand the unique challenges of working in the cleared space.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{members.filter(m => m.mentoring).length}</div>
                  <div className="text-sm opacity-90">Active Mentors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">92%</div>
                  <div className="text-sm opacity-90">Match Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">4.8</div>
                  <div className="text-sm opacity-90">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Available Mentors */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Available Mentors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {members.filter(member => member.mentoring).map((mentor, index) => (
                  <div key={mentor.id} className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-full flex items-center justify-center text-white font-semibold">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <h4 className="font-semibold">{mentor.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-500 mr-1" />
                        <span className="text-sm">{mentor.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building size={14} className="mr-2" />
                        {mentor.company}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Briefcase size={14} className="mr-2" />
                        {mentor.experience} years experience
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {mentor.expertise.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {mentor.bio}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {mentor.responseRate}% response rate
                      </span>
                      <button className="px-4 py-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors">
                        Request Mentorship
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Become a Mentor */}
            <div className="bg-white dark:bg-command-black rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Become a Mentor</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Share your expertise and help others succeed in the cleared space.
                  </p>
                </div>
                <button className="px-6 py-3 bg-dynamic-blue text-white rounded-lg hover:bg-sky-blue transition-colors">
                  Join as Mentor
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}