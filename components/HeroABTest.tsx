'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useABTest } from '@/hooks/useABTest'
import { useAnalytics } from '@/hooks/useAnalytics'

interface HeroCTAChanges {
  ctaText: string
  ctaColor: string
}

export default function HeroABTest() {
  const { variant, changes, trackConversion } = useABTest<HeroCTAChanges>('hero-cta-test')
  const analytics = useAnalytics()

  const handleCTAClick = () => {
    // Track conversion
    trackConversion('cta_click')
    
    // Track regular analytics
    analytics.trackClick(`hero_cta_${variant?.id || 'control'}`)
  }

  // Default values (control)
  const ctaText = changes.ctaText || 'Browse Cleared Jobs'
  const ctaColor = changes.ctaColor || 'bg-sky-blue'

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link 
          href="/jobs" 
          className={`${ctaColor} text-white px-8 py-4 rounded-lg inline-flex items-center group hover:shadow-lg transition-all`}
          onClick={handleCTAClick}
        >
          {ctaText}
          <ArrowRight className="ml-2 transition-transform group-hover:translate-x-2" size={20} />
        </Link>
      </motion.div>
      
      {/* Other CTAs remain the same */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link 
          href="/mock-interview" 
          className="glass-button text-white inline-flex items-center hover-glow"
          onClick={() => analytics.trackClick('hero_mock_interview')}
        >
          Try AI Mock Interview
        </Link>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link 
          href="/contact" 
          className="glass-button text-white inline-flex items-center hover-glow"
          onClick={() => analytics.trackClick('hero_consultation')}
        >
          Schedule Consultation
        </Link>
      </motion.div>
    </div>
  )
}