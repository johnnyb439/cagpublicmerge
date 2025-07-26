import dynamic from 'next/dynamic'
import React from 'react'

// Heavy components that should be lazy loaded
export const DynamicHero = dynamic(() => import('@/components/Hero'), {
  loading: () => React.createElement('div', { className: "h-screen animate-pulse bg-gray-900" }),
  ssr: true
})

// export const DynamicJobsSection = dynamic(() => import('@/components/JobsSection'), {
//   loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800" })
// })

export const DynamicWhoWeServe = dynamic(() => import('@/components/WhoWeServe'), {
  loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800" })
})

// export const DynamicWhyChoose = dynamic(() => import('@/components/WhyChoose'), {
//   loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800" })
// })

export const DynamicMockInterview = dynamic(() => import('@/components/MockInterviewFeature'), {
  loading: () => React.createElement('div', { className: "h-screen animate-pulse bg-gray-100 dark:bg-gray-800" }),
  ssr: false
})

// export const DynamicResumeBuilder = dynamic(() => import('@/components/ResumeBuilder'), {
//   loading: () => React.createElement('div', { className: "h-screen animate-pulse bg-gray-100 dark:bg-gray-800" }),
//   ssr: false
// })

export const DynamicLiveChat = dynamic(() => import('@/components/LiveChat'), {
  ssr: false
})

// Chart components (usually heavy)
// export const DynamicAnalyticsDashboard = dynamic(
//   () => import('@/components/analytics/Dashboard'),
//   {
//     loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800" }),
//     ssr: false
//   }
// )

// Form components with validation
// export const DynamicJobApplicationForm = dynamic(
//   () => import('@/components/forms/JobApplicationForm'),
//   {
//     loading: () => React.createElement('div', { className: "h-96 animate-pulse bg-gray-100 dark:bg-gray-800" }),
//     ssr: false
//   }
// )