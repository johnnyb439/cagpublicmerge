import dynamic from 'next/dynamic'
import React from 'react'

// Dashboard Components - Load on demand
export const DynamicAnalytics = dynamic(
  () => import('@/components/dashboard/Analytics'),
  {
    loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" }),
    ssr: false
  }
)

export const DynamicGoalTracking = dynamic(
  () => import('@/components/dashboard/GoalTracking'),
  {
    loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" }),
    ssr: false
  }
)

export const DynamicActivityTimeline = dynamic(
  () => import('@/components/dashboard/ActivityTimeline'),
  {
    loading: () => React.createElement('div', { className: "h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" }),
    ssr: false
  }
)

// AI Components - Heavy processing
export const DynamicAIResumeReviewer = dynamic(
  () => import('@/components/ai/AIResumeReviewer'),
  {
    loading: () => React.createElement('div', { className: "h-screen animate-pulse bg-gray-100 dark:bg-gray-800" }),
    ssr: false
  }
)

// Job Components
export const DynamicJobComparison = dynamic(
  () => import('@/components/jobs/JobComparison'),
  {
    loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" }),
    ssr: false
  }
)

export const DynamicAdvancedFilters = dynamic(
  () => import('@/components/jobs/AdvancedFilters'),
  {
    loading: () => React.createElement('div', { className: "h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" }),
    ssr: false
  }
)

// Chat Components
export const DynamicChatWindow = dynamic(
  () => import('@/components/chat/ChatWindow'),
  {
    loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" }),
    ssr: false
  }
)

// Utility function to preload components
export const preloadComponent = (component: any) => {
  if (typeof component.preload === 'function') {
    component.preload()
  }
}