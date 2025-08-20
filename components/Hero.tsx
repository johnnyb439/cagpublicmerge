'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Clean Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Your Security Clearance is Your
            <span className="block mt-2" style={{color: 'var(--cag-blue)'}}>Gateway to Success</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            We help cleared professionals transition into lucrative IT contracting careers with personalized guidance and proven strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300" style={{backgroundColor: 'var(--cag-blue)'}}>
                Create Account
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login" className="border border-gray-400 hover:border-white text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300">
                Log In
              </Link>
            </motion.div>
          </div>

          {/* Realistic QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-32 h-32 relative bg-white border-2 border-gray-100">
                {/* QR Code Pattern */}
                <svg width="128" height="128" viewBox="0 0 128 128" className="w-full h-full">
                  {/* Corner Position Markers */}
                  <rect x="4" y="4" width="28" height="28" fill="black"/>
                  <rect x="8" y="8" width="20" height="20" fill="white"/>
                  <rect x="12" y="12" width="12" height="12" fill="black"/>
                  
                  <rect x="96" y="4" width="28" height="28" fill="black"/>
                  <rect x="100" y="8" width="20" height="20" fill="white"/>
                  <rect x="104" y="12" width="12" height="12" fill="black"/>
                  
                  <rect x="4" y="96" width="28" height="28" fill="black"/>
                  <rect x="8" y="100" width="20" height="20" fill="white"/>
                  <rect x="12" y="104" width="12" height="12" fill="black"/>
                  
                  {/* Timing Patterns */}
                  <g>
                    {Array.from({length: 11}, (_, i) => (
                      <rect key={`h-${i}`} x={36 + i * 4} y="24" width="4" height="4" fill={i % 2 === 0 ? "black" : "white"}/>
                    ))}
                    {Array.from({length: 11}, (_, i) => (
                      <rect key={`v-${i}`} x="24" y={36 + i * 4} width="4" height="4" fill={i % 2 === 0 ? "black" : "white"}/>
                    ))}
                  </g>
                  
                  {/* Data Pattern */}
                  <g>
                    <rect x="40" y="40" width="4" height="4" fill="black"/>
                    <rect x="48" y="40" width="4" height="4" fill="white"/>
                    <rect x="52" y="40" width="4" height="4" fill="black"/>
                    <rect x="60" y="40" width="4" height="4" fill="black"/>
                    <rect x="68" y="40" width="4" height="4" fill="white"/>
                    <rect x="76" y="40" width="4" height="4" fill="black"/>
                    <rect x="84" y="40" width="4" height="4" fill="black"/>
                    
                    <rect x="40" y="48" width="4" height="4" fill="white"/>
                    <rect x="44" y="48" width="4" height="4" fill="black"/>
                    <rect x="52" y="48" width="4" height="4" fill="white"/>
                    <rect x="56" y="48" width="4" height="4" fill="black"/>
                    <rect x="64" y="48" width="4" height="4" fill="black"/>
                    <rect x="72" y="48" width="4" height="4" fill="white"/>
                    <rect x="80" y="48" width="4" height="4" fill="black"/>
                    <rect x="88" y="48" width="4" height="4" fill="white"/>
                    
                    <rect x="40" y="56" width="4" height="4" fill="black"/>
                    <rect x="48" y="56" width="4" height="4" fill="black"/>
                    <rect x="56" y="56" width="4" height="4" fill="white"/>
                    <rect x="64" y="56" width="4" height="4" fill="black"/>
                    <rect x="68" y="56" width="4" height="4" fill="black"/>
                    <rect x="76" y="56" width="4" height="4" fill="white"/>
                    <rect x="84" y="56" width="4" height="4" fill="black"/>
                    
                    <rect x="40" y="64" width="4" height="4" fill="white"/>
                    <rect x="44" y="64" width="4" height="4" fill="black"/>
                    <rect x="52" y="64" width="4" height="4" fill="black"/>
                    <rect x="60" y="64" width="4" height="4" fill="white"/>
                    <rect x="68" y="64" width="4" height="4" fill="black"/>
                    <rect x="72" y="64" width="4" height="4" fill="black"/>
                    <rect x="80" y="64" width="4" height="4" fill="white"/>
                    <rect x="88" y="64" width="4" height="4" fill="black"/>
                    
                    <rect x="40" y="72" width="4" height="4" fill="black"/>
                    <rect x="48" y="72" width="4" height="4" fill="white"/>
                    <rect x="52" y="72" width="4" height="4" fill="black"/>
                    <rect x="60" y="72" width="4" height="4" fill="black"/>
                    <rect x="68" y="72" width="4" height="4" fill="white"/>
                    <rect x="76" y="72" width="4" height="4" fill="black"/>
                    <rect x="84" y="72" width="4" height="4" fill="white"/>
                    
                    <rect x="40" y="80" width="4" height="4" fill="white"/>
                    <rect x="44" y="80" width="4" height="4" fill="black"/>
                    <rect x="52" y="80" width="4" height="4" fill="white"/>
                    <rect x="60" y="80" width="4" height="4" fill="black"/>
                    <rect x="64" y="80" width="4" height="4" fill="black"/>
                    <rect x="72" y="80" width="4" height="4" fill="white"/>
                    <rect x="80" y="80" width="4" height="4" fill="black"/>
                    <rect x="88" y="80" width="4" height="4" fill="black"/>
                    
                    <rect x="40" y="88" width="4" height="4" fill="black"/>
                    <rect x="48" y="88" width="4" height="4" fill="black"/>
                    <rect x="56" y="88" width="4" height="4" fill="white"/>
                    <rect x="64" y="88" width="4" height="4" fill="black"/>
                    <rect x="68" y="88" width="4" height="4" fill="white"/>
                    <rect x="76" y="88" width="4" height="4" fill="black"/>
                    <rect x="84" y="88" width="4" height="4" fill="black"/>
                  </g>
                </svg>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center font-medium">Scan to visit site</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}