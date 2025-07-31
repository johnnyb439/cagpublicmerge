'use client'

import Hero from '@/components/Hero'
import WhoWeServe from '@/components/WhoWeServe'
import OurProcess from '@/components/OurProcess'
import MockInterviewFeature from '@/components/MockInterviewFeature'
import SuccessStories from '@/components/SuccessStories'
import CTASection from '@/components/CTASection'

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