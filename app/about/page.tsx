'use client'

import { motion } from 'framer-motion'
import { Shield, Target, Users, Award, Briefcase, Heart } from 'lucide-react'
import Image from 'next/image'
import BinaryBackground from '@/components/BinaryBackground'

const values = [
  {
    icon: Shield,
    title: "Service-First",
    description: "We honor the service of our clients by serving them with the same dedication they've shown our country.",
    color: "dynamic-green"
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Breaking down barriers to ensure every cleared professional can access our support, regardless of location.",
    color: "sky-blue"
  },
  {
    icon: Target,
    title: "Integrity",
    description: "Handling sensitive career transitions with the highest levels of confidentiality and ethical standards.",
    color: "dynamic-blue"
  },
  {
    icon: Briefcase,
    title: "Innovation",
    description: "Using modern technology and approaches to solve traditional career challenges in the cleared space.",
    color: "emerald-green"
  },
  {
    icon: Award,
    title: "Empowerment",
    description: "Transforming uncertainty into confidence through knowledge, connections, and unwavering support.",
    color: "opportunity-orange"
  }
]

const stats = [
  { number: "500+", label: "Cleared Professionals Placed" },
  { number: "98%", label: "Client Satisfaction Rate" },
  { number: "15+", label: "Years Combined Experience" },
  { number: "24/7", label: "Support Available" }
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 bg-professional-gradient text-white">
        <BinaryBackground />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-96 h-96 bg-dynamic-green/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-sky-blue/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold mb-6">
              About <span className="gradient-text">Cleared Advisory Group</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 dark:text-gray-400 max-w-3xl mx-auto">
              Your trusted bridge between military service and civilian IT success
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-command-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">
                Our <span className="gradient-text">Mission</span>
              </h2>
              <p className="text-lg text-intel-gray mb-6">
                To provide approachable, supportive, and modern career guidance that transforms security clearances 
                into meaningful IT opportunities for military-connected professionals worldwide.
              </p>
              <p className="text-lg text-intel-gray mb-6">
                We understand the unique challenges faced by National Guard members, Reservists, Veterans, and 
                transitioning military personnel. Your service commitments don't limit your potential—they enhance it.
              </p>
              <div className="bg-gray-50 dark:bg-ops-charcoal rounded-lg p-6">
                <h3 className="font-montserrat font-semibold text-xl mb-4">Our Purpose</h3>
                <p className="text-intel-gray">
                  The Cleared Advisory Group exists to bridge the gap between America's security-cleared professionals 
                  and their next career breakthrough in IT government contracting.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-hero-gradient rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-montserrat font-bold mb-6">Why We're Different</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Shield className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>100% focus on cleared professionals - it's all we do</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>Deep understanding of military culture and commitments</span>
                  </li>
                  <li className="flex items-start">
                    <Target className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>Proven pathways from service to contractor success</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>Personalized support that continues after placement</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-ops-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
              Our Core <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-intel-gray max-w-3xl mx-auto">
              The principles that guide every interaction and decision we make
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card group hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-${value.color}/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`w-7 h-7 text-${value.color}`} />
                </div>
                <h3 className="text-xl font-montserrat font-semibold mb-3">{value.title}</h3>
                <p className="text-intel-gray">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-professional-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
              Our Impact in Numbers
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-montserrat font-bold mb-2 gradient-text">
                  {stat.number}
                </div>
                <p className="text-gray-300 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-command-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
              Leadership <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-intel-gray max-w-3xl mx-auto">
              Veterans and cleared professionals who've walked in your shoes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "The Trinity Team",
                role: "Founder & CEO",
                bio: "Former Army Signal Officer with 15+ years in cleared contracting"
              },
              {
                name: "Bob Saggot",
                role: "VP of Career Services",
                bio: "Air Force Reserve, specializing in military-to-civilian transitions"
              },
              {
                name: "Michael Chen",
                role: "Director of Technology",
                bio: "Navy veteran, expert in cleared IT recruiting and placement"
              }
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-dynamic-green to-sky-blue rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-montserrat font-semibold mb-1">{member.name}</h3>
                <p className="text-dynamic-blue font-medium mb-2">{member.role}</p>
                <p className="text-intel-gray text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-ops-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">
              Ready to Join Our <span className="gradient-text">Success Stories</span>?
            </h2>
            <p className="text-xl text-intel-gray mb-8">
              Let's work together to transform your clearance into your career advantage
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-primary">
                Schedule Your Consultation
              </a>
              <a href="/services" className="btn-secondary">
                Explore Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}