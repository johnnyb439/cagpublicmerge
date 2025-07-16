'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Plane, UserCheck } from 'lucide-react'

const audiences = [
  {
    icon: Shield,
    title: "National Guard Members",
    description: "Balance drill weekends with a thriving IT career. We understand your unique scheduling needs.",
    color: "dynamic-green"
  },
  {
    icon: Award,
    title: "Reservists",
    description: "Your part-time service doesn't limit your full-time potential. We'll help you maximize both.",
    color: "dynamic-blue"
  },
  {
    icon: Plane,
    title: "Transitioning Military",
    description: "From military IT to contractor success. We translate your skills for civilian employers.",
    color: "sky-blue"
  },
  {
    icon: UserCheck,
    title: "Veterans & Cleared Professionals",
    description: "Your clearance is currency. We'll help you invest it in the right opportunities.",
    color: "emerald-green"
  }
]

export default function WhoWeServe() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            Who We <span className="gradient-text">Serve</span>
          </h2>
          <p className="text-xl text-intel-gray max-w-3xl mx-auto">
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
              className="card text-center group"
            >
              <div className={`w-16 h-16 bg-${audience.color}/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <audience.icon className={`w-8 h-8 text-${audience.color}`} />
              </div>
              <h3 className="text-xl font-montserrat font-semibold mb-3">{audience.title}</h3>
              <p className="text-intel-gray">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}