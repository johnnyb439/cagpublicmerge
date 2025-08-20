'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-command-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-montserrat font-bold text-xl mb-2">Cleared Advisory Group</h3>
              <p className="text-cyber-cyan text-sm">Your Gateway to Opportunities</p>
            </div>
            <p className="text-gray-400 text-sm">
              Bridging the gap between cleared professionals and IT contracting success.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-sky-blue transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-sky-blue transition-colors">Services</Link></li>
              <li><Link href="/mock-interview" className="hover:text-sky-blue transition-colors">Mock Interview</Link></li>
              <li><Link href="/resources" className="hover:text-sky-blue transition-colors">Resources</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/services#career-planning" className="hover:text-sky-blue transition-colors">Career Planning</Link></li>
              <li><Link href="/services#resume-translation" className="hover:text-sky-blue transition-colors">Resume Translation</Link></li>
              <li><Link href="/services#interview-prep" className="hover:text-sky-blue transition-colors">Interview Prep</Link></li>
              <li><Link href="/services#clearance-guidance" className="hover:text-sky-blue transition-colors">Clearance Guidance</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-dynamic-green" />
                <a href="mailto:info@clearedadvisorygroup.com" className="hover:text-sky-blue transition-colors">
                  info@clearedadvisorygroup.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-dynamic-green" />
                <a href="tel:1-800-CLEARED" className="hover:text-sky-blue transition-colors">
                  1-800-CLEARED
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-dynamic-green mt-1" />
                <span>Serving cleared professionals nationwide</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-sky-blue transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-blue transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-blue transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} Cleared Advisory Group. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-sky-blue transition-colors">Privacy Policy</Link>
            {' • '}
            <Link href="/terms" className="hover:text-sky-blue transition-colors">Terms of Service</Link>
            {' • '}
            <Link href="/security" className="hover:text-sky-blue transition-colors">Security</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}