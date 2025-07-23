'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, MessageCircle } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-20 bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-hero p-8 md:p-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Your clearance is your competitive advantage. Let us help you leverage it for maximum career impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="glass-button bg-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 inline-flex items-center justify-center group"
            >
              <Calendar className="mr-2" size={20} />
              Schedule Free Consultation
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
            </Link>
            
            <Link 
              href="/mock-interview" 
              className="glass-button text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2" size={20} />
              Try Mock Interview
            </Link>
          </div>
          
          <p className="text-white/70 text-sm mt-8">
            No commitment required • 100% confidential • Military-friendly scheduling
          </p>
        </motion.div>
      </div>
    </section>
  )
}