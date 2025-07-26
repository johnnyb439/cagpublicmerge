'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Calendar, Send, CheckCircle } from 'lucide-react'
import BinaryBackground from '@/components/BinaryBackground'
import ProtectedForm from '@/components/security/ProtectedForm'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    clearanceLevel: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (formDataSubmitted: FormData, recaptchaToken: string) => {
    // Convert FormData to our expected format
    const submitData = {
      name: formDataSubmitted.get('name') as string,
      email: formDataSubmitted.get('email') as string,
      phone: formDataSubmitted.get('phone') as string,
      service: formDataSubmitted.get('service') as string,
      clearanceLevel: formDataSubmitted.get('clearanceLevel') as string,
      message: formDataSubmitted.get('message') as string
    }
    
    try {
      // Send to backend with CAPTCHA token
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitData,
          recaptchaToken
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit contact form')
      }

      // Update local state for UI
      setFormData(submitData)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Contact form submission error:', error)
      throw error
    }
  }


  return (
    <section className="relative min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <BinaryBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            Let's Start Your <span className="gradient-text">Journey</span>
          </h1>
          <p className="text-xl text-intel-gray max-w-3xl mx-auto">
            Schedule a free consultation to discuss how we can help you leverage your clearance for career success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="card">
              <h2 className="text-2xl font-montserrat font-semibold mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-dynamic-green/10 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-dynamic-green" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:info@clearedadvisorygroup.com" className="text-intel-gray hover:text-sky-blue transition-colors">
                      info@clearedadvisorygroup.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-sky-blue/10 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-sky-blue" />
                  </div>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href="tel:1-800-CLEARED" className="text-intel-gray hover:text-sky-blue transition-colors">
                      1-800-CLEARED
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-green/10 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-emerald-green" />
                  </div>
                  <div>
                    <p className="font-semibold">Schedule</p>
                    <p className="text-intel-gray">Mon-Fri 8AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-professional-gradient text-white">
              <h3 className="text-xl font-montserrat font-semibold mb-4">Why Choose CAG?</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ 100% focus on cleared professionals</li>
                <li>✓ Military-friendly scheduling</li>
                <li>✓ Proven track record of success</li>
                <li>✓ Personalized career strategies</li>
                <li>✓ Ongoing support after placement</li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            {!isSubmitted ? (
              <div className="card">
                <h2 className="text-2xl font-montserrat font-semibold mb-6">Schedule Your Free Consultation</h2>
                
                <ProtectedForm
                  onSubmit={handleSubmit}
                  action="contact_form"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        defaultValue={formData.name}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-sky-blue dark:focus:border-sky-blue focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        defaultValue={formData.email}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-sky-blue dark:focus:border-sky-blue focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        defaultValue={formData.phone}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-sky-blue dark:focus:border-sky-blue focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium mb-2">Service Affiliation *</label>
                      <select
                        id="service"
                        name="service"
                        required
                        defaultValue={formData.service}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-sky-blue dark:focus:border-sky-blue focus:outline-none"
                      >
                        <option value="">Select your affiliation</option>
                        <option value="national-guard">National Guard</option>
                        <option value="reserves">Reserves</option>
                        <option value="veteran">Veteran</option>
                        <option value="active-duty">Transitioning Active Duty</option>
                        <option value="civilian">Cleared Civilian</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="clearanceLevel" className="block text-sm font-medium mb-2">Clearance Level *</label>
                      <select
                        id="clearanceLevel"
                        name="clearanceLevel"
                        required
                        defaultValue={formData.clearanceLevel}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-sky-blue dark:focus:border-sky-blue focus:outline-none"
                      >
                        <option value="">Select clearance level</option>
                        <option value="secret">SECRET</option>
                        <option value="ts">TOP SECRET</option>
                        <option value="ts-sci">TS/SCI</option>
                        <option value="public-trust">Public Trust</option>
                        <option value="none">No Clearance</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Tell us about your career goals
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      defaultValue={formData.message}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-sky-blue dark:focus:border-sky-blue focus:outline-none resize-none"
                      placeholder="What are your IT career goals? What challenges are you facing?"
                    />
                  </div>
                </ProtectedForm>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-emerald-green mx-auto mb-4" />
                <h2 className="text-2xl font-montserrat font-semibold mb-2">Thank You!</h2>
                <p className="text-intel-gray mb-6">
                  We've received your consultation request and will contact you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      service: '',
                      clearanceLevel: '',
                      message: ''
                    })
                  }}
                  className="btn-secondary"
                >
                  Submit Another Request
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}