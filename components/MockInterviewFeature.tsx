'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bot, Layers, Network, Server, Headphones, Wifi } from 'lucide-react'

const tiers = [
  {
    level: "Tier 1",
    title: "Entry Level IT",
    icon: Headphones,
    positions: [
      { name: "Help Desk/Service Desk", icon: Headphones },
      { name: "OSP (Outside Plant)", icon: Wifi },
      { name: "ISP (Inside Plant)", icon: Server },
      { name: "Fiber Optics", icon: Network }
    ],
    color: "sky-blue"
  },
  {
    level: "Tier 2",
    title: "Mid-Level IT",
    icon: Server,
    positions: [
      { name: "Network Administration", icon: Network },
      { name: "Systems Administration", icon: Server },
      { name: "Exchange/O365 Admin", icon: Layers },
      { name: "DNS/DHCP Management", icon: Bot }
    ],
    color: "dynamic-green"
  }
]

export default function MockInterviewFeature() {
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
          <div className="inline-flex items-center bg-dynamic-blue/10 text-dynamic-blue px-4 py-2 rounded-full mb-4">
            <Bot className="w-5 h-5 mr-2" />
            <span className="font-semibold">New Feature</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            AI-Powered <span className="gradient-text">Mock Interviews</span>
          </h2>
          <p className="text-xl text-intel-gray max-w-3xl mx-auto">
            Practice with our intelligent interview simulator designed specifically for cleared IT positions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {tiers.map((tier, tierIndex) => (
            <motion.div
              key={tier.level}
              initial={{ opacity: 0, x: tierIndex === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 bg-${tier.color}/10 rounded-lg flex items-center justify-center mr-4`}>
                  <tier.icon className={`w-6 h-6 text-${tier.color}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-montserrat font-bold">{tier.level}</h3>
                  <p className="text-intel-gray">{tier.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tier.positions.map((position) => (
                  <div key={position.name} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <position.icon className="w-5 h-5 text-intel-gray mr-3" />
                    <span className="text-sm font-medium">{position.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-professional-gradient rounded-2xl p-8 md:p-12 text-white text-center"
        >
          <h3 className="text-3xl font-montserrat font-bold mb-4">
            Ready to Ace Your Interview?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Practice common cleared IT interview questions with real-time AI feedback
          </p>
          <Link href="/mock-interview" className="btn-primary">
            Start Mock Interview
          </Link>
        </motion.div>
      </div>
    </section>
  )
}