'use client'

import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'

const WhoWeServe = dynamic(() => import('@/components/WhoWeServe'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
})

const OurProcess = dynamic(() => import('@/components/OurProcess'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
})

const MockInterviewFeature = dynamic(() => import('@/components/MockInterviewFeature'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
})

const SuccessStories = dynamic(() => import('@/components/SuccessStories'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
})

const CTASection = dynamic(() => import('@/components/CTASection'), {
  loading: () => <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800" />
})

export default function Home() {
  return (
    <>
      <Hero />
      <WhoWeServe />
      <OurProcess />
      <MockInterviewFeature />
      <SuccessStories />
      <CTASection />
    </>
  )
}