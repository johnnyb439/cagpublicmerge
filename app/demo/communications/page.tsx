'use client'

import { useState } from 'react'
import { Bell, MessageSquare, Mail, Send, CheckCircle } from 'lucide-react'
import NotificationCenter from '@/components/NotificationCenter'
import MessagingCenter from '@/components/MessagingCenter'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function CommunicationsDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'notifications' | 'messaging' | 'newsletter'>('notifications')
  const [demoResult, setDemoResult] = useState('')

  const triggerJobMatchNotification = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'job_match',
          userId: 'demo-user',
          data: {
            jobMatch: {
              jobId: 'job_123',
              jobTitle: 'Senior Software Engineer',
              company: 'TechCorp Solutions',
              matchScore: 95,
              matchReasons: [
                'Perfect match for React and Node.js skills',
                'Salary range meets your requirements',
                'Location preference aligned',
                'Required security clearance level matches'
              ],
              salary: '$120,000 - $150,000',
              location: 'Arlington, VA',
              clearanceLevel: 'Secret'
            },
            userEmail: 'demo@example.com',
            userName: 'John Doe'
          }
        })
      })

      if (response.ok) {
        setDemoResult('✅ Job match notification sent!')
        setTimeout(() => setDemoResult(''), 3000)
      }
    } catch (error) {
      setDemoResult('❌ Failed to send notification')
      setTimeout(() => setDemoResult(''), 3000)
    }
  }

  const triggerApplicationUpdate = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'application_update',
          userId: 'demo-user',
          data: {
            update: {
              applicationId: 'app_456',
              jobTitle: 'Senior Software Engineer',
              company: 'TechCorp Solutions',
              previousStatus: 'applied',
              newStatus: 'interview_scheduled',
              message: 'Your application has moved to the next round! We\'d like to schedule a technical interview.',
              nextSteps: [
                'Prepare for technical coding interview',
                'Review React and Node.js concepts',
                'Prepare questions about the role and company'
              ]
            },
            userEmail: 'demo@example.com',
            userName: 'John Doe'
          }
        })
      })

      if (response.ok) {
        setDemoResult('✅ Application update notification sent!')
        setTimeout(() => setDemoResult(''), 3000)
      }
    } catch (error) {
      setDemoResult('❌ Failed to send notification')
      setTimeout(() => setDemoResult(''), 3000)
    }
  }

  const triggerInterviewReminder = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interview_reminder',
          userId: 'demo-user',
          data: {
            interview: {
              jobTitle: 'Senior Software Engineer',
              company: 'TechCorp Solutions',
              date: 'Tomorrow',
              time: '2:00 PM EST',
              type: 'Technical Interview',
              location: 'Virtual - Zoom Link',
              interviewers: ['Sarah Johnson', 'Mike Chen']
            },
            userEmail: 'demo@example.com',
            userName: 'John Doe'
          }
        })
      })

      if (response.ok) {
        setDemoResult('✅ Interview reminder sent!')
        setTimeout(() => setDemoResult(''), 3000)
      }
    } catch (error) {
      setDemoResult('❌ Failed to send notification')
      setTimeout(() => setDemoResult(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Communication Features Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Experience our comprehensive communication system including notifications, messaging, and newsletter features.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveDemo('notifications')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeDemo === 'notifications'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Bell className="w-5 h-5 inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveDemo('messaging')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeDemo === 'messaging'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Messaging
            </button>
            <button
              onClick={() => setActiveDemo('newsletter')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeDemo === 'newsletter'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Mail className="w-5 h-5 inline mr-2" />
              Newsletter
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {activeDemo === 'notifications' && 'Notification System'}
              {activeDemo === 'messaging' && 'Messaging System'}
              {activeDemo === 'newsletter' && 'Newsletter System'}
            </h2>

            {activeDemo === 'notifications' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Live Demo</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Click the notification icon in the top-right corner to see existing notifications
                    </p>
                  </div>
                  <NotificationCenter />
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Trigger Test Notifications:</h3>
                  
                  <button
                    onClick={triggerJobMatchNotification}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Job Match Notification
                  </button>

                  <button
                    onClick={triggerApplicationUpdate}
                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Application Update
                  </button>

                  <button
                    onClick={triggerInterviewReminder}
                    className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Interview Reminder
                  </button>

                  {demoResult && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-300 text-center">{demoResult}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeDemo === 'messaging' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Live Demo</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Click the messaging icon to view and send messages
                    </p>
                  </div>
                  <MessagingCenter />
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Features:</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Real-time messaging with recruiters
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Job-specific conversation threads
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      File attachments support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Unread message tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Search conversation history
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeDemo === 'newsletter' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Newsletter Features:</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Customizable subscription preferences
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Multiple content categories
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Weekly or monthly frequency options
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Double opt-in confirmation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Easy unsubscribe process
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Live Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Live Demo
            </h2>

            {activeDemo === 'notifications' && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  The notification system provides real-time updates about job matches, application status changes, 
                  and interview reminders. Users can customize their notification preferences and receive updates 
                  via email and in-app notifications.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Email Templates Include:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Job match notifications with match scores</li>
                    <li>• Application status updates with next steps</li>
                    <li>• Interview reminders with calendar integration</li>
                    <li>• Newsletter with featured jobs and resources</li>
                  </ul>
                </div>
              </div>
            )}

            {activeDemo === 'messaging' && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  The messaging system enables direct communication between candidates and recruiters. 
                  Each conversation is tied to specific job opportunities, making it easy to track 
                  communication history and maintain context.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Demo Conversation Available:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    View the existing conversation with Sarah Johnson (TechCorp Solutions recruiter) 
                    about the Senior Software Engineer position. Try sending a reply to see the system in action!
                  </p>
                </div>
              </div>
            )}

            {activeDemo === 'newsletter' && (
              <div className="space-y-4">
                <NewsletterSignup 
                  title="Try the Newsletter Signup"
                  description="Test the newsletter subscription process with email confirmation and customizable preferences."
                />
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notification System</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Multi-channel delivery (email, in-app, SMS)</li>
                <li>• Template-based email generation</li>
                <li>• User preference management</li>
                <li>• Priority-based notification handling</li>
                <li>• Read/unread status tracking</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Messaging System</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Real-time conversation threads</li>
                <li>• File attachment support</li>
                <li>• Job-specific context tracking</li>
                <li>• Unread message counters</li>
                <li>• Message search functionality</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Newsletter System</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Double opt-in confirmation</li>
                <li>• Category-based subscriptions</li>
                <li>• Frequency preferences</li>
                <li>• Template-based content delivery</li>
                <li>• Unsubscribe management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}