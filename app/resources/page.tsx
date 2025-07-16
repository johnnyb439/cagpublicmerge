'use client'

import { motion } from 'framer-motion'
import { BookOpen, Download, FileText, Shield, Briefcase, TrendingUp, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'

interface ResourceItem {
  title: string;
  description: string;
  type: string;
  readTime?: string;
  featured?: boolean;
  downloadable?: boolean;
  interactive?: boolean;
}

const resources: Array<{
  category: string;
  icon: any;
  items: ResourceItem[];
}> = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    items: [
      {
        title: 'Clearance 101: Complete Guide',
        description: 'Everything you need to know about security clearances',
        type: 'guide',
        readTime: '15 min',
        featured: true
      },
      {
        title: 'Military to Civilian IT Transition Roadmap',
        description: 'Step-by-step guide for transitioning service members',
        type: 'guide',
        readTime: '20 min',
        featured: false
      },
      {
        title: 'Understanding Government Contracting',
        description: 'Basics of the cleared contractor ecosystem',
        type: 'article',
        readTime: '10 min',
        featured: false
      }
    ]
  },
  {
    category: 'Career Development',
    icon: TrendingUp,
    items: [
      {
        title: 'Top 10 IT Certifications for Cleared Professionals',
        description: 'Most valuable certifications in the cleared space',
        type: 'guide',
        readTime: '12 min',
        featured: false
      },
      {
        title: 'Resume Translation Worksheet',
        description: 'Convert military experience to civilian terms',
        type: 'template',
        downloadable: true,
        featured: false
      },
      {
        title: 'Interview Success Checklist',
        description: 'Prepare for cleared IT interviews like a pro',
        type: 'checklist',
        downloadable: true,
        featured: false
      }
    ]
  },
  {
    category: 'Industry Insights',
    icon: Briefcase,
    items: [
      {
        title: '2025 Cleared IT Salary Guide',
        description: 'Current compensation trends by clearance level',
        type: 'report',
        readTime: '25 min',
        featured: true
      },
      {
        title: 'Hot Skills in Cleared IT',
        description: 'Most in-demand skills for 2025 and beyond',
        type: 'article',
        readTime: '8 min',
        featured: false
      },
      {
        title: 'Major Defense Contractors Guide',
        description: 'Overview of top employers in the cleared space',
        type: 'guide',
        readTime: '18 min',
        featured: false
      }
    ]
  },
  {
    category: 'Tools & Templates',
    icon: FileText,
    items: [
      {
        title: 'Clearance Timeline Calculator',
        description: 'Estimate your investigation timeline',
        type: 'tool',
        interactive: true,
        featured: false
      },
      {
        title: 'Network Tracker Spreadsheet',
        description: 'Organize your professional connections',
        type: 'template',
        downloadable: true,
        featured: false
      },
      {
        title: 'Goal Setting Workbook',
        description: 'Plan your cleared career journey',
        type: 'workbook',
        downloadable: true,
        featured: false
      }
    ]
  }
]

const faqs = [
  {
    question: "How long does it take to get a security clearance?",
    answer: "SECRET clearances typically take 2-4 months, while TOP SECRET can take 6-12 months. Having an active clearance significantly speeds up the process."
  },
  {
    question: "Can I work remotely with a security clearance?",
    answer: "Many cleared positions now offer remote or hybrid options, especially for software development and cybersecurity roles. However, some positions require on-site work in SCIFs."
  },
  {
    question: "How do I maintain my clearance between jobs?",
    answer: "Your clearance remains active for 2 years after leaving a cleared position. Stay current with CE requirements and consider joining the reserves to maintain access."
  },
  {
    question: "What's the difference between W2 and 1099 for cleared work?",
    answer: "W2 offers traditional benefits and stability, while 1099 typically provides higher hourly rates but requires self-management of taxes and benefits. We help you evaluate both options."
  },
  {
    question: "Do I need IT experience to get cleared IT jobs?",
    answer: "Entry-level positions like help desk often value clearance over extensive experience. We'll help you identify transferable skills and appropriate starting positions."
  }
]

const blogPosts = [
  {
    title: "5 Mistakes Cleared Professionals Make When Job Hunting",
    date: "January 10, 2025",
    excerpt: "Avoid these common pitfalls that can derail your cleared career search...",
    readTime: "5 min read"
  },
  {
    title: "From Combat Arms to Cybersecurity: A Success Story",
    date: "January 5, 2025",
    excerpt: "How one Army veteran leveraged his clearance to break into tech...",
    readTime: "8 min read"
  },
  {
    title: "Understanding Polygraph Requirements in 2025",
    date: "December 28, 2024",
    excerpt: "What to expect from CI, FS, and Lifestyle polygraphs...",
    readTime: "10 min read"
  }
]

export default function ResourcesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 bg-professional-gradient text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-green/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-opportunity-orange/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold mb-6">
              Resources & <span className="gradient-text">Knowledge Hub</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Free guides, tools, and insights to accelerate your cleared IT career
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {resources.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-dynamic-green/10 rounded-lg flex items-center justify-center mr-4">
                  <category.icon className="w-6 h-6 text-dynamic-green" />
                </div>
                <h2 className="text-2xl font-montserrat font-semibold">{category.category}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: itemIndex * 0.05 }}
                    viewport={{ once: true }}
                    className={`card group hover:shadow-xl transition-all duration-300 ${
                      item.featured ? 'border-2 border-cyber-cyan' : ''
                    }`}
                  >
                    {item.featured && (
                      <div className="absolute -top-3 -right-3 bg-sky-blue text-white px-3 py-1 rounded-full text-xs font-semibold">
                        FEATURED
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-montserrat font-semibold group-hover:text-dynamic-green transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center text-sm text-intel-gray">
                        {item.readTime && (
                          <>
                            <Clock className="w-4 h-4 mr-1" />
                            {item.readTime}
                          </>
                        )}
                        {item.downloadable && <Download className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <p className="text-intel-gray mb-4">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm bg-gray-100 px-3 py-1 rounded-full capitalize">
                        {item.type}
                      </span>
                      <Link 
                        href="#" 
                        className="text-dynamic-green font-medium flex items-center hover:gap-2 transition-all duration-300"
                      >
                        Access <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-montserrat font-bold mb-4">
              Latest <span className="gradient-text">Insights</span>
            </h2>
            <p className="text-xl text-intel-gray">
              Stay updated with trends and tips in the cleared IT space
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                <div className="text-sm text-intel-gray mb-2">{post.date}</div>
                <h3 className="text-xl font-montserrat font-semibold mb-3 hover:text-dynamic-green transition-colors">
                  <Link href="#">{post.title}</Link>
                </h3>
                <p className="text-intel-gray mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sky-blue">{post.readTime}</span>
                  <Link href="#" className="text-dynamic-green font-medium flex items-center hover:gap-2 transition-all duration-300">
                    Read More <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-montserrat font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-xl text-intel-gray">
              Quick answers to common cleared career questions
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="card"
              >
                <h3 className="text-lg font-montserrat font-semibold mb-3 flex items-start">
                  <Shield className="w-5 h-5 text-dynamic-green mr-3 mt-0.5 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-intel-gray ml-8">{faq.answer}</p>
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
              Need Personalized Guidance?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our experts are ready to help you navigate your unique career path
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary bg-white text-command-black hover:bg-gray-100">
                Schedule Consultation
              </Link>
              <Link href="/mock-interview" className="btn-secondary border-white text-white hover:bg-white/10">
                Practice Interviews
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}