'use client'

import Link from 'next/link'
import { MessageSquare, Bell, Mail, ArrowRight } from 'lucide-react'

export default function DemoIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Feature Demos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Explore our interactive feature demonstrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <Link href="/demo/communications">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <Bell className="w-8 h-8 text-blue-600" />
                    <MessageSquare className="w-8 h-8 text-green-600" />
                    <Mail className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Communication Features
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      Test notifications, messaging, and newsletter systems
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                  Email Notifications
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full">
                  In-App Messaging
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full">
                  Newsletter System
                </span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm rounded-full">
                  Status Updates
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            More demos coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}