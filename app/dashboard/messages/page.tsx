'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Send, Search, Filter, MoreVertical, Paperclip,
  Phone, Video, Info, Check, CheckCheck, Clock, Star,
  Archive, Trash2, Bell, BellOff, User, Building, Shield,
  MessageSquare, Circle, Users, Hash, Lock
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  company: string
  role: string
  lastMessage: string
  timestamp: string
  unread: number
  online: boolean
  avatar?: string
  clearance?: string
  type: 'recruiter' | 'hiring_manager' | 'peer' | 'mentor'
}

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  read: boolean
  delivered: boolean
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'Lockheed Martin',
    role: 'Senior Recruiter',
    lastMessage: 'Great! Let\'s schedule a call for tomorrow...',
    timestamp: '10:30 AM',
    unread: 2,
    online: true,
    clearance: 'TS/SCI',
    type: 'recruiter'
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'Raytheon',
    role: 'Hiring Manager',
    lastMessage: 'Your background looks impressive. Are you available...',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
    clearance: 'Secret',
    type: 'hiring_manager'
  },
  {
    id: '3',
    name: 'David Martinez',
    company: 'AWS Federal',
    role: 'Cloud Architect',
    lastMessage: 'Thanks for connecting! I\'d be happy to discuss...',
    timestamp: '2 days ago',
    unread: 0,
    online: true,
    type: 'peer'
  },
  {
    id: '4',
    name: 'James Wilson',
    company: 'Veterans Mentor Network',
    role: 'Career Mentor',
    lastMessage: 'Here are some tips for your upcoming interview...',
    timestamp: '1 week ago',
    unread: 0,
    online: false,
    type: 'mentor'
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    text: 'Hi! I came across your profile and I\'m impressed with your security clearance and experience.',
    timestamp: '10:15 AM',
    read: true,
    delivered: true
  },
  {
    id: '2',
    senderId: 'user',
    text: 'Thank you for reaching out! I\'m very interested in opportunities at Lockheed Martin.',
    timestamp: '10:20 AM',
    read: true,
    delivered: true
  },
  {
    id: '3',
    senderId: '1',
    text: 'Great! Let\'s schedule a call for tomorrow to discuss the Network Administrator position.',
    timestamp: '10:30 AM',
    read: false,
    delivered: true
  }
]

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: 'user',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        delivered: true
      }
      setMessages([...messages, message])
      setNewMessage('')
      
      // Update last message in contact
      setContacts(contacts.map(contact => 
        contact.id === selectedContact.id 
          ? { ...contact, lastMessage: newMessage, timestamp: 'Just now' }
          : contact
      ))
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'unread') return matchesSearch && contact.unread > 0
    if (filterType === 'starred') return matchesSearch // Would need starred property
    return matchesSearch
  })

  const getContactTypeColor = (type: Contact['type']) => {
    switch (type) {
      case 'recruiter': return 'from-blue-600 to-cyan-600'
      case 'hiring_manager': return 'from-emerald-600 to-green-600'
      case 'peer': return 'from-purple-600 to-indigo-600'
      case 'mentor': return 'from-orange-600 to-amber-600'
      default: return 'from-gray-600 to-slate-600'
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-dynamic-green transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-gray-900 dark:text-white">
                Messages
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Connect with recruiters and professionals
              </p>
            </div>
            <div className="flex gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg"
              >
                <div className="flex items-center">
                  <MessageSquare size={20} className="mr-2" />
                  <span className="font-semibold">{contacts.reduce((sum, c) => sum + c.unread, 0)} Unread</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-lg overflow-hidden"
          style={{ height: '70vh' }}
        >
          <div className="flex h-full">
            {/* Contacts Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'unread', 'starred'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                        filterType === type
                          ? 'bg-dynamic-green text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    whileHover={{ backgroundColor: 'rgba(0, 245, 160, 0.05)' }}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getContactTypeColor(contact.type)} flex items-center justify-center text-white font-semibold`}>
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {contact.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {contact.name}
                          </h3>
                          <span className="text-xs text-gray-500">{contact.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {contact.company} • {contact.role}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 truncate mt-1">
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread > 0 && (
                        <div className="bg-dynamic-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {contact.unread}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            {selectedContact ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getContactTypeColor(selectedContact.type)} flex items-center justify-center text-white font-semibold`}>
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedContact.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building size={14} />
                          <span>{selectedContact.company}</span>
                          {selectedContact.clearance && (
                            <>
                              <Shield size={14} className="ml-2" />
                              <span>{selectedContact.clearance}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Phone size={20} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Video size={20} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Info size={20} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'user'
                          ? 'bg-gradient-to-r from-dynamic-green to-emerald-green text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          message.senderId === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{message.timestamp}</span>
                          {message.senderId === 'user' && (
                            message.read ? <CheckCheck size={14} /> : <Check size={14} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Paperclip size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dynamic-green dark:bg-gray-800 dark:border-gray-700"
                    />
                    <button
                      onClick={sendMessage}
                      className="p-2 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 text-white"
          >
            <Users size={32} className="mb-3" />
            <p className="text-2xl font-bold">{contacts.length}</p>
            <p className="text-blue-100">Active Conversations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg shadow-lg p-6 text-white"
          >
            <Building size={32} className="mb-3" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-emerald-100">Companies Connected</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg shadow-lg p-6 text-white"
          >
            <Star size={32} className="mb-3" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-orange-100">Recruiter Contacts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white"
          >
            <Shield size={32} className="mb-3" />
            <p className="text-2xl font-bold">95%</p>
            <p className="text-purple-100">Response Rate</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}