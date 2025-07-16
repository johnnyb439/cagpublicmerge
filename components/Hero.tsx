'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Users, Briefcase } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-professional-gradient"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-dynamic-green/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-dynamic-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-blue/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Banner */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-8 py-3">
              <span className="text-white font-semibold text-lg">Proudly Serving America's Cleared Professionals</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-montserrat font-bold text-white mb-6">
            Your Gateway to
            <span className="block gradient-text">Cleared IT Opportunities</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Bridging the gap for National Guard, Reservists, Veterans, and cleared professionals 
            seeking lucrative government contracting careers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/jobs" className="btn-primary inline-flex items-center">
              Browse Cleared Jobs
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link href="/mock-interview" className="btn-secondary inline-flex items-center">
              Try AI Mock Interview
            </Link>
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Schedule Consultation
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
            >
              <Shield className="w-12 h-12 text-dynamic-green mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">SECRET+ Required</h3>
              <p className="text-gray-400 text-sm">We specialize in opportunities for cleared professionals</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
            >
              <Users className="w-12 h-12 text-dynamic-blue mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Military-Friendly</h3>
              <p className="text-gray-400 text-sm">Understanding your unique service commitments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
            >
              <Briefcase className="w-12 h-12 text-emerald-green mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">IT Focus</h3>
              <p className="text-gray-400 text-sm">From help desk to systems administration</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}