'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Plane, UserCheck } from 'lucide-react'

const audiences = [
  {
    icon: Shield,
    title: "National Guard Members",
    description: "Balance drill weekends with a thriving IT career. We understand your unique scheduling needs.",
    bgColor: "bg-dynamic-green/10",
    iconColor: "text-dynamic-green"
  },
  {
    icon: Award,
    title: "Reservists",
    description: "Your part-time service doesn't limit your full-time potential. We'll help you maximize both.",
    bgColor: "bg-dynamic-blue/10",
    iconColor: "text-dynamic-blue"
  },
  {
    icon: Plane,
    title: "Transitioning Military",
    description: "From military IT to contractor success. We translate your skills for civilian employers.",
    bgColor: "bg-sky-blue/10",
    iconColor: "text-sky-blue"
  },
  {
    icon: UserCheck,
    title: "Veterans & Cleared Professionals",
    description: "Your clearance is currency. We'll help you invest it in the right opportunities.",
    bgColor: "bg-emerald-green/10",
    iconColor: "text-emerald-green"
  }
]

export default function WhoWeServe() {
  return (
    <section className="py-20 bg-gradient-to-br from-command-black via-ops-charcoal to-command-black relative overflow-hidden">
      {/* Binary background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="text-dynamic-green font-mono text-sm leading-relaxed">
          {Array(20).fill(null).map((_, i) => (
            <div key={i} className="whitespace-nowrap">
              {Array(10).fill('01101000 01100101 01101100 01110000 ').join('')}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-4 text-white">
            Who We <span className="gradient-text">Serve</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We specialize in helping cleared professionals navigate the complex world of government IT contracting
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card text-center group hover-lift"
            >
              <div className={`w-16 h-16 ${audience.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <audience.icon className={`w-8 h-8 ${audience.iconColor}`} />
              </div>
              <h3 className="text-xl font-montserrat font-semibold mb-3 text-white">{audience.title}</h3>
              <p className="text-gray-300">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}