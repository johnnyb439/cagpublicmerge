'use client'

import { motion } from 'framer-motion'
import { FileText, Users, MessageSquare, Shield, Compass, Bot, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import BinaryBackground from '@/components/BinaryBackground'

const services = [
  {
    id: 'career-planning',
    icon: Compass,
    title: 'Career Transition Planning',
    description: 'Strategic roadmap from military service to IT contracting success',
    features: [
      'Personalized career assessment and gap analysis',
      'Clearance-to-career pathway development',
      'Timeline planning around military commitments',
      'Industry landscape orientation',
      'Goal setting and milestone tracking'
    ],
    color: 'dynamic-green'
  },
  {
    id: 'resume-translation',
    icon: FileText,
    title: 'Resume Translation',
    description: 'Transform military experience into civilian IT language',
    features: [
      'Military-to-civilian skills translation',
      'ATS-optimized formatting',
      'Clearance highlighting strategies',
      'Technical skills emphasis',
      'Accomplishment quantification'
    ],
    color: 'sky-blue'
  },
  {
    id: 'interview-prep',
    icon: MessageSquare,
    title: 'Interview Preparation',
    description: 'Master the art of cleared IT interviews',
    features: [
      'AI-powered mock interviews',
      'Technical question preparation',
      'Behavioral interview coaching',
      'Clearance discussion guidance',
      'Salary negotiation strategies'
    ],
    color: 'dynamic-blue'
  },
  {
    id: 'clearance-guidance',
    icon: Shield,
    title: 'Clearance Guidance',
    description: 'Maximize the value of your security clearance',
    features: [
      'Clearance maintenance best practices',
      'Understanding clearance requirements',
      'Navigating the cleared job market',
      'Clearance upgrade pathways',
      'Compliance and reporting guidance'
    ],
    color: 'emerald-green'
  },
  {
    id: 'contractor-navigation',
    icon: Users,
    title: 'Contractor Navigation',
    description: 'Successfully transition to the contracting world',
    features: [
      'Understanding contractor vs W2 benefits',
      'Prime contractor introductions',
      'Contract negotiation support',
      'Benefits and compensation guidance',
      'Long-term career planning'
    ],
    color: 'opportunity-orange'
  },
  {
    id: 'ai-interview-tool',
    icon: Bot,
    title: 'AI Mock Interview Tool',
    description: 'Practice with our intelligent interview simulator',
    features: [
      'Tier 1: Help Desk, OSP, ISP, Fiber positions',
      'Tier 2: Network & Systems Administration',
      'Real-time AI feedback',
      'Unlimited practice sessions',
      'Progress tracking and improvement tips'
    ],
    color: 'dynamic-green',
    isNew: true
  }
]

const process = [
  {
    step: 1,
    title: 'Initial Consultation',
    description: 'Free 30-minute discovery call to understand your goals and current situation'
  },
  {
    step: 2,
    title: 'Customized Plan',
    description: 'Develop a personalized roadmap based on your clearance, skills, and objectives'
  },
  {
    step: 3,
    title: 'Active Support',
    description: 'Work together through resume optimization, interview prep, and job applications'
  },
  {
    step: 4,
    title: 'Ongoing Success',
    description: 'Continue support through offer negotiation and first 90 days in new role'
  }
]

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 bg-professional-gradient text-white">
        <BinaryBackground />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-sky-blue/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-dynamic-blue/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold mb-6">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive support designed specifically for cleared professionals entering the IT contracting world
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white dark:bg-command-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card group hover:shadow-xl transition-all duration-300 relative"
              >
                {service.isNew && (
                  <div className="absolute -top-3 -right-3 bg-mission-magenta text-white px-3 py-1 rounded-full text-xs font-semibold">
                    NEW
                  </div>
                )}
                
                <div className={`w-16 h-16 bg-${service.color}/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className={`w-8 h-8 text-${service.color}`} />
                </div>
                
                <h3 className="text-xl font-montserrat font-semibold mb-3">{service.title}</h3>
                <p className="text-intel-gray mb-4">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-green mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-intel-gray">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {service.id === 'ai-interview-tool' ? (
                  <Link href="/mock-interview" className="text-dynamic-green font-semibold flex items-center hover:gap-2 transition-all duration-300">
                    Try It Now <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <Link href={`/contact?service=${service.id}`} className="text-dynamic-green font-semibold flex items-center hover:gap-2 transition-all duration-300">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
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
              How We <span className="gradient-text">Work Together</span>
            </h2>
            <p className="text-xl text-intel-gray max-w-3xl mx-auto">
              A proven process that takes you from uncertainty to success
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-dynamic-green via-sky-blue to-emerald-green"></div>
            
            <div className="space-y-12">
              {process.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center justify-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className="flex-1 text-right pr-8 hidden lg:block">
                    {index % 2 === 0 && (
                      <div>
                        <h3 className="text-2xl font-montserrat font-semibold mb-2">{item.title}</h3>
                        <p className="text-intel-gray">{item.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="w-16 h-16 bg-hero-gradient rounded-full flex items-center justify-center text-white font-montserrat font-bold text-xl shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left pl-8 hidden lg:block">
                    {index % 2 !== 0 && (
                      <div>
                        <h3 className="text-2xl font-montserrat font-semibold mb-2">{item.title}</h3>
                        <p className="text-intel-gray">{item.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Version */}
                  <div className="lg:hidden ml-8">
                    <h3 className="text-xl font-montserrat font-semibold mb-2">{item.title}</h3>
                    <p className="text-intel-gray">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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
              Investment in Your <span className="gradient-text">Future</span>
            </h2>
            <p className="text-xl text-intel-gray max-w-3xl mx-auto">
              Flexible options designed to fit your needs and budget
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'Perfect for exploring your options',
                features: [
                  'Initial consultation',
                  'AI mock interview tool access',
                  'Basic resources library',
                  'Email support'
                ],
                cta: 'Get Started',
                featured: false
              },
              {
                name: 'Professional',
                price: '$200',
                description: 'Comprehensive career transition support',
                features: [
                  'Everything in Starter',
                  'Resume translation service',
                  '3 coaching sessions',
                  'Interview preparation',
                  'Job search strategy',
                  '30-day support'
                ],
                cta: 'Choose Professional',
                featured: true
              },
              {
                name: 'Executive',
                price: 'Custom',
                description: 'Full-service placement and ongoing support',
                features: [
                  'Everything in Professional',
                  'Unlimited coaching',
                  'Direct employer introductions',
                  'Negotiation support',
                  '90-day guarantee',
                  'Ongoing career management'
                ],
                cta: 'Contact Us',
                featured: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`card ${plan.featured ? 'border-2 border-dynamic-green shadow-xl scale-105' : ''}`}
              >
                {plan.featured && (
                  <div className="bg-dynamic-green text-white text-center py-2 -m-6 mb-6 rounded-t-lg">
                    <span className="text-sm font-semibold">MOST POPULAR</span>
                  </div>
                )}
                
                <h3 className="text-2xl font-montserrat font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== 'Free' && plan.price !== 'Custom' && (
                    <span className="text-intel-gray ml-2">one-time</span>
                  )}
                </div>
                <p className="text-intel-gray mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-green mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/contact"
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    plan.featured
                      ? 'bg-dynamic-green text-white hover:bg-opacity-90'
                      : 'bg-gray-100 dark:bg-gray-800 text-command-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20"
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Take the first step toward your cleared IT career success
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary bg-white dark:bg-gray-800 text-command-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                Schedule Free Consultation
              </Link>
              <Link href="/mock-interview" className="btn-secondary border-white text-white hover:bg-white/10">
                Try Mock Interview
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}