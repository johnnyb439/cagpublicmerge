'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Clock, Users, CheckCircle, BookOpen, Video, FileText } from 'lucide-react'

export default function InterviewPrepPage() {
  const [selectedCategory, setSelectedCategory] = useState('mock-interview')

  const prepCategories = [
    {
      id: 'mock-interview',
      title: 'Mock Interviews',
      icon: <Video className="w-6 h-6" />,
      description: 'Practice with AI-powered interview simulations'
    },
    {
      id: 'clearance-questions',
      title: 'Clearance Questions',
      icon: <FileText className="w-6 h-6" />,
      description: 'Common security clearance interview questions'
    },
    {
      id: 'technical-prep',
      title: 'Technical Prep',
      icon: <BookOpen className="w-6 h-6" />,
      description: 'Technical knowledge for cleared positions'
    },
    {
      id: 'behavioral',
      title: 'Behavioral Questions',
      icon: <Users className="w-6 h-6" />,
      description: 'STAR method and behavioral interview prep'
    }
  ]

  const mockInterviewTopics = [
    { title: 'General Security Clearance', duration: '15 min', difficulty: 'Beginner' },
    { title: 'Technical Role - Software Engineer', duration: '30 min', difficulty: 'Intermediate' },
    { title: 'Project Manager - Cleared Environment', duration: '20 min', difficulty: 'Intermediate' },
    { title: 'Cybersecurity Analyst', duration: '25 min', difficulty: 'Advanced' },
    { title: 'System Administrator', duration: '20 min', difficulty: 'Intermediate' }
  ]

  const commonQuestions = [
    "Tell me about your experience with security clearances.",
    "How do you handle sensitive information?",
    "Describe a time you had to work under pressure.",
    "Why are you interested in cleared positions?",
    "How do you stay current with security best practices?"
  ]

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interview <span className="text-sky-blue">Preparation</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Ace your cleared job interviews with our comprehensive preparation tools and resources
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {prepCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-sky-blue text-white shadow-lg shadow-sky-blue/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.icon}
              <span className="font-medium">{category.title}</span>
            </button>
          ))}
        </div>

        {/* Content based on selected category */}
        <div className="glass-card p-8">
          {selectedCategory === 'mock-interview' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Video className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">Mock Interview Simulations</h2>
              </div>
              <p className="text-gray-300 mb-8">
                Practice with our AI-powered mock interviews tailored for security clearance positions.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockInterviewTopics.map((topic, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors">
                    <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {topic.duration}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        topic.difficulty === 'Beginner' ? 'bg-green-900/50 text-green-300' :
                        topic.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-red-900/50 text-red-300'
                      }`}>
                        {topic.difficulty}
                      </span>
                    </div>
                    <Link
                      href="/mock-interview"
                      className="inline-flex items-center gap-2 bg-sky-blue hover:bg-sky-blue/80 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start Interview
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCategory === 'clearance-questions' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">Common Clearance Questions</h2>
              </div>
              <p className="text-gray-300 mb-8">
                Practice answering the most common questions asked during security clearance interviews.
              </p>
              
              <div className="space-y-4">
                {commonQuestions.map((question, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-sky-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </span>
                      <p className="text-white font-medium">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCategory === 'technical-prep' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">Technical Preparation</h2>
              </div>
              <p className="text-gray-300 mb-8">
                Study guides and resources for technical roles in cleared environments.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Cybersecurity Fundamentals</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Network Security Principles
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Risk Assessment Frameworks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Compliance Standards
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">System Administration</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Windows/Linux Administration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Active Directory Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Security Hardening
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedCategory === 'behavioral' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-sky-blue" />
                <h2 className="text-2xl font-bold">Behavioral Interview Prep</h2>
              </div>
              <p className="text-gray-300 mb-8">
                Master the STAR method and prepare for behavioral questions commonly asked in cleared positions.
              </p>
              
              <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">STAR Method Framework</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-sky-blue rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <h4 className="font-semibold">Situation</h4>
                    <p className="text-sm text-gray-400">Set the context</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-sky-blue rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">T</span>
                    </div>
                    <h4 className="font-semibold">Task</h4>
                    <p className="text-sm text-gray-400">Describe your role</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-sky-blue rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <h4 className="font-semibold">Action</h4>
                    <p className="text-sm text-gray-400">Explain what you did</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-sky-blue rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <h4 className="font-semibold">Result</h4>
                    <p className="text-sm text-gray-400">Share the outcome</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link
            href="/mock-interview"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-blue to-teal-400 hover:from-sky-blue/80 hover:to-teal-400/80 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg shadow-sky-blue/25 cag-glow"
          >
            <Play className="w-5 h-5" />
            Start Your Mock Interview
          </Link>
        </div>
      </div>
    </div>
  )
}