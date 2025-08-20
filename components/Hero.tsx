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
              <Link href="/register" className="text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 cag-glow" style={{backgroundColor: 'var(--cag-blue)'}}>
                Create Account
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login" className="border border-gray-400 hover:border-white text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300">
                Log In
              </Link>
            </motion.div>
          </div>

          {/* High-Density QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-40 h-40 relative bg-white">
                {/* Complex QR Code Pattern matching reference */}
                <svg width="160" height="160" viewBox="0 0 160 160" className="w-full h-full">
                  {/* Corner Position Markers */}
                  <rect x="0" y="0" width="35" height="35" fill="black"/>
                  <rect x="5" y="5" width="25" height="25" fill="white"/>
                  <rect x="10" y="10" width="15" height="15" fill="black"/>
                  
                  <rect x="125" y="0" width="35" height="35" fill="black"/>
                  <rect x="130" y="5" width="25" height="25" fill="white"/>
                  <rect x="135" y="10" width="15" height="15" fill="black"/>
                  
                  <rect x="0" y="125" width="35" height="35" fill="black"/>
                  <rect x="5" y="130" width="25" height="25" fill="white"/>
                  <rect x="10" y="135" width="15" height="15" fill="black"/>
                  
                  {/* Timing Patterns */}
                  <g>
                    {Array.from({length: 18}, (_, i) => (
                      <rect key={`h-${i}`} x={40 + i * 5} y="30" width="5" height="5" fill={i % 2 === 0 ? "black" : "white"}/>
                    ))}
                    {Array.from({length: 18}, (_, i) => (
                      <rect key={`v-${i}`} x="30" y={40 + i * 5} width="5" height="5" fill={i % 2 === 0 ? "black" : "white"}/>
                    ))}
                  </g>
                  
                  {/* Dense Data Pattern */}
                  <g>
                    {/* Row 1 */}
                    <rect x="40" y="40" width="5" height="5" fill="black"/>
                    <rect x="50" y="40" width="5" height="5" fill="black"/>
                    <rect x="55" y="40" width="5" height="5" fill="white"/>
                    <rect x="60" y="40" width="5" height="5" fill="black"/>
                    <rect x="65" y="40" width="5" height="5" fill="white"/>
                    <rect x="70" y="40" width="5" height="5" fill="black"/>
                    <rect x="75" y="40" width="5" height="5" fill="black"/>
                    <rect x="80" y="40" width="5" height="5" fill="white"/>
                    <rect x="85" y="40" width="5" height="5" fill="black"/>
                    <rect x="90" y="40" width="5" height="5" fill="white"/>
                    <rect x="95" y="40" width="5" height="5" fill="black"/>
                    <rect x="100" y="40" width="5" height="5" fill="black"/>
                    <rect x="105" y="40" width="5" height="5" fill="white"/>
                    <rect x="110" y="40" width="5" height="5" fill="black"/>
                    <rect x="115" y="40" width="5" height="5" fill="white"/>
                    <rect x="120" y="40" width="5" height="5" fill="black"/>
                    
                    {/* Row 2 */}
                    <rect x="40" y="45" width="5" height="5" fill="white"/>
                    <rect x="45" y="45" width="5" height="5" fill="black"/>
                    <rect x="50" y="45" width="5" height="5" fill="white"/>
                    <rect x="55" y="45" width="5" height="5" fill="black"/>
                    <rect x="60" y="45" width="5" height="5" fill="black"/>
                    <rect x="65" y="45" width="5" height="5" fill="white"/>
                    <rect x="70" y="45" width="5" height="5" fill="black"/>
                    <rect x="75" y="45" width="5" height="5" fill="white"/>
                    <rect x="80" y="45" width="5" height="5" fill="black"/>
                    <rect x="85" y="45" width="5" height="5" fill="black"/>
                    <rect x="90" y="45" width="5" height="5" fill="white"/>
                    <rect x="95" y="45" width="5" height="5" fill="black"/>
                    <rect x="100" y="45" width="5" height="5" fill="white"/>
                    <rect x="105" y="45" width="5" height="5" fill="black"/>
                    <rect x="110" y="45" width="5" height="5" fill="black"/>
                    <rect x="115" y="45" width="5" height="5" fill="white"/>
                    <rect x="120" y="45" width="5" height="5" fill="black"/>
                    
                    {/* Row 3 */}
                    <rect x="40" y="50" width="5" height="5" fill="black"/>
                    <rect x="45" y="50" width="5" height="5" fill="white"/>
                    <rect x="50" y="50" width="5" height="5" fill="black"/>
                    <rect x="55" y="50" width="5" height="5" fill="white"/>
                    <rect x="60" y="50" width="5" height="5" fill="white"/>
                    <rect x="65" y="50" width="5" height="5" fill="black"/>
                    <rect x="70" y="50" width="5" height="5" fill="white"/>
                    <rect x="75" y="50" width="5" height="5" fill="black"/>
                    <rect x="80" y="50" width="5" height="5" fill="black"/>
                    <rect x="85" y="50" width="5" height="5" fill="white"/>
                    <rect x="90" y="50" width="5" height="5" fill="black"/>
                    <rect x="95" y="50" width="5" height="5" fill="white"/>
                    <rect x="100" y="50" width="5" height="5" fill="black"/>
                    <rect x="105" y="50" width="5" height="5" fill="black"/>
                    <rect x="110" y="50" width="5" height="5" fill="white"/>
                    <rect x="115" y="50" width="5" height="5" fill="black"/>
                    <rect x="120" y="50" width="5" height="5" fill="white"/>
                    
                    {/* Row 4 */}
                    <rect x="40" y="55" width="5" height="5" fill="white"/>
                    <rect x="45" y="55" width="5" height="5" fill="black"/>
                    <rect x="50" y="55" width="5" height="5" fill="black"/>
                    <rect x="55" y="55" width="5" height="5" fill="white"/>
                    <rect x="60" y="55" width="5" height="5" fill="black"/>
                    <rect x="65" y="55" width="5" height="5" fill="black"/>
                    <rect x="70" y="55" width="5" height="5" fill="white"/>
                    <rect x="75" y="55" width="5" height="5" fill="black"/>
                    <rect x="80" y="55" width="5" height="5" fill="white"/>
                    <rect x="85" y="55" width="5" height="5" fill="black"/>
                    <rect x="90" y="55" width="5" height="5" fill="black"/>
                    <rect x="95" y="55" width="5" height="5" fill="white"/>
                    <rect x="100" y="55" width="5" height="5" fill="black"/>
                    <rect x="105" y="55" width="5" height="5" fill="white"/>
                    <rect x="110" y="55" width="5" height="5" fill="black"/>
                    <rect x="115" y="55" width="5" height="5" fill="black"/>
                    <rect x="120" y="55" width="5" height="5" fill="white"/>
                    
                    {/* Row 5 */}
                    <rect x="40" y="60" width="5" height="5" fill="black"/>
                    <rect x="45" y="60" width="5" height="5" fill="white"/>
                    <rect x="50" y="60" width="5" height="5" fill="black"/>
                    <rect x="55" y="60" width="5" height="5" fill="black"/>
                    <rect x="60" y="60" width="5" height="5" fill="white"/>
                    <rect x="65" y="60" width="5" height="5" fill="black"/>
                    <rect x="70" y="60" width="5" height="5" fill="black"/>
                    <rect x="75" y="60" width="5" height="5" fill="white"/>
                    <rect x="80" y="60" width="5" height="5" fill="black"/>
                    <rect x="85" y="60" width="5" height="5" fill="white"/>
                    <rect x="90" y="60" width="5" height="5" fill="black"/>
                    <rect x="95" y="60" width="5" height="5" fill="black"/>
                    <rect x="100" y="60" width="5" height="5" fill="white"/>
                    <rect x="105" y="60" width="5" height="5" fill="black"/>
                    <rect x="110" y="60" width="5" height="5" fill="white"/>
                    <rect x="115" y="60" width="5" height="5" fill="black"/>
                    <rect x="120" y="60" width="5" height="5" fill="black"/>
                    
                    {/* Additional rows continue the pattern */}
                    <rect x="40" y="65" width="5" height="5" fill="white"/>
                    <rect x="45" y="65" width="5" height="5" fill="black"/>
                    <rect x="50" y="65" width="5" height="5" fill="white"/>
                    <rect x="55" y="65" width="5" height="5" fill="black"/>
                    <rect x="60" y="65" width="5" height="5" fill="black"/>
                    <rect x="65" y="65" width="5" height="5" fill="white"/>
                    <rect x="70" y="65" width="5" height="5" fill="black"/>
                    <rect x="75" y="65" width="5" height="5" fill="white"/>
                    <rect x="80" y="65" width="5" height="5" fill="white"/>
                    <rect x="85" y="65" width="5" height="5" fill="black"/>
                    <rect x="90" y="65" width="5" height="5" fill="white"/>
                    <rect x="95" y="65" width="5" height="5" fill="black"/>
                    <rect x="100" y="65" width="5" height="5" fill="black"/>
                    <rect x="105" y="65" width="5" height="5" fill="white"/>
                    <rect x="110" y="65" width="5" height="5" fill="black"/>
                    <rect x="115" y="65" width="5" height="5" fill="white"/>
                    <rect x="120" y="65" width="5" height="5" fill="black"/>
                    
                    {/* Continue with more complex patterns for rows 70-120 */}
                    {Array.from({length: 10}, (_, row) => 
                      Array.from({length: 17}, (_, col) => {
                        const x = 40 + col * 5;
                        const y = 70 + row * 5;
                        const pattern = (row + col) % 3 === 0 ? "black" : 
                                      (row * col + row + col) % 4 === 0 ? "black" : "white";
                        return <rect key={`${row}-${col}`} x={x} y={y} width="5" height="5" fill={pattern}/>;
                      })
                    )}
                  </g>
                  
                  {/* Alignment pattern (bottom right area) */}
                  <rect x="110" y="110" width="15" height="15" fill="black"/>
                  <rect x="112" y="112" width="11" height="11" fill="white"/>
                  <rect x="115" y="115" width="5" height="5" fill="black"/>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}