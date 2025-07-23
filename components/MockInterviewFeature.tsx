'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bot, CheckCircle, Clock, Target, Brain } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "AI-Powered Feedback",
    description: "Get instant, personalized feedback on your responses"
  },
  {
    icon: Target,
    title: "Cleared-Specific",
    description: "Questions tailored for government IT contractor roles"
  },
  {
    icon: Clock,
    title: "Practice Anytime",
    description: "Available 24/7 to fit your schedule"
  },
  {
    icon: CheckCircle,
    title: "Track Progress",
    description: "Monitor your improvement over time"
  }
]

export default function MockInterviewFeature() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-ops-charcoal dark:via-command-black dark:to-ops-charcoal transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-dynamic-blue/10 dark:bg-dynamic-blue/20 text-dynamic-blue px-4 py-2 rounded-full mb-4">
            <Bot className="w-5 h-5 mr-2" />
            <span className="font-semibold">AI Feature</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-4 dark:text-white">
            Practice with <span className="gradient-text-animated">AI Mock Interviews</span>
          </h2>
          <p className="text-xl text-intel-gray dark:text-gray-300 max-w-3xl mx-auto">
            Prepare for your cleared IT interviews with our intelligent AI that understands the unique requirements of government contracting
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-dynamic-green/20 to-dynamic-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-dynamic-green" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">{feature.title}</h3>
              <p className="text-intel-gray dark:text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden"
        >
          <div className="glass-hero p-8 md:p-12 text-center">
            <h3 className="text-3xl font-montserrat font-bold mb-4 text-white">
              Ready to Ace Your Interview?
            </h3>
            <p className="text-lg mb-8 text-gray-200 max-w-2xl mx-auto">
              Join thousands of cleared professionals who've improved their interview skills with our AI-powered practice tool
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/mock-interview" className="glass-button bg-white/20 text-white px-8 py-4 text-lg font-semibold hover-glow inline-block">
                Start Free Practice Session
              </Link>
            </motion.div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-dynamic-blue/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-dynamic-green/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}