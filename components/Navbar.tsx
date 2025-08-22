'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { initDevMode, isDevMode } from '@/lib/dev-mode'

// Force recompile

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true)

    // Initialize dev mode first if needed
    if (isDevMode) {
      initDevMode()
    }

    // Check if user is logged in
    const checkUser = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userData = localStorage.getItem('user')
          console.log('🔍 Navbar: checking user data:', userData) // Debug log
          console.log('🔍 Navbar: current user state:', user) // Debug log
          if (userData) {
            const parsed = JSON.parse(userData)
            console.log('✅ Navbar: found user:', parsed) // Debug log
            setUser(parsed)
          } else {
            console.log('❌ Navbar: no user data found') // Debug log
            setUser(null)
          }
        }
      } catch (error) {
        console.error('💥 Error loading user data:', error)
        setUser(null)
      }
    }

    // Initial check immediately
    checkUser()

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkUser)

    // Listen for custom login events
    window.addEventListener('userLogin', checkUser)
    window.addEventListener('userLogout', checkUser)

    // Also check more frequently for current tab login/logout
    const interval = setInterval(checkUser, 500)

    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('userLogin', checkUser)
      window.removeEventListener('userLogout', checkUser)
      clearInterval(interval)
    }
  }, [])

  // Navigation links for non-authenticated users
  const publicNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/mock-interview', label: 'Mock Interview' },
    { href: '/resources', label: 'Resources' },
    { href: '/register', label: 'Create Account', isButton: true },
  ]

  // Navigation links for authenticated users
  const authenticatedNavLinks = [
    { href: '/dashboard', label: 'Dashboard', isButton: true },
    { href: '/jobs', label: 'Jobs' },
    { href: '/interview-prep', label: 'Interview Prep' },
    { href: '/resources', label: 'Resources' },
    { href: '/network', label: 'Network' },
    { href: '/profile', label: 'Profile' },
  ]

  const navLinks = user ? authenticatedNavLinks : publicNavLinks
  console.log('🔍 Navbar: user state:', user) // Debug log
  console.log('🔍 Navbar: isClient:', isClient) // Debug log
  console.log('🔍 Navbar: using nav links:', navLinks) // Debug log
  
  // Force a different render if not on client side yet
  if (!isClient) {
    return <nav className="fixed top-0 w-full glass-nav z-50">Loading...</nav>
  }

  return (
    <nav className="fixed top-0 w-full glass-nav z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div>
                <span className="text-white font-montserrat font-bold text-xl whitespace-nowrap">Cleared Advisory Group TEST</span>
                <p className="text-sky-blue text-xs">Your Gateway to Opportunities</p>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.isButton 
                  ? "bg-cag-blue hover:bg-cag-blue/80 text-white px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap text-sm lg:text-base cag-glow"
                  : "text-white hover:text-sky-blue transition-colors duration-300 whitespace-nowrap text-sm lg:text-base px-2"
                }
              >
                {link.label}
              </Link>
            ))}
            
            {/* User Account Links */}
            {user ? (
              <button
                onClick={() => {
                  localStorage.removeItem('user')
                  setUser(null)
                  window.dispatchEvent(new CustomEvent('userLogout'))
                  window.location.href = '/'
                }}
                className="text-white hover:text-sky-blue transition-colors duration-300 whitespace-nowrap text-sm lg:text-base"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-white hover:text-sky-blue transition-colors duration-300 whitespace-nowrap text-sm lg:text-base"
              >
                Sign In
              </Link>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* American Flag */}
            <div className="flex items-center space-x-2 ml-4">
              <div className="w-8 h-5 relative bg-patriot-red">
                {/* Red and white stripes */}
                <div className="absolute inset-0 flex flex-col">
                  {[...Array(13)].map((_, i) => (
                    <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-patriot-red' : 'bg-white'}`}></div>
                  ))}
                </div>
                {/* Blue canton with 50 stars */}
                <div className="absolute top-0 left-0 w-[40%] h-[54%] bg-navy-blue flex items-center justify-center overflow-hidden">
                  <div className="text-white text-[3px] leading-[3px] tracking-[0.5px]">
                    ★★★★★★<br/>
                    ★★★★★<br/>
                    ★★★★★★<br/>
                    ★★★★★<br/>
                    ★★★★★★<br/>
                    ★★★★★<br/>
                    ★★★★★★<br/>
                    ★★★★★<br/>
                    ★★★★★★
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">USA</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-sky-blue"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="glass-card mt-2 transform transition-transform duration-300 ease-in-out">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.isButton 
                  ? "block bg-cag-blue hover:bg-cag-blue/80 text-white px-4 py-2 rounded-lg transition-all duration-300 mb-2 cag-glow text-center"
                  : "block text-white hover:text-sky-blue py-2 transition-colors duration-300"
                }
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Theme Toggle in Mobile */}
            <div className="border-t border-gray-700 mt-4 pt-4 flex items-center justify-between">
              <span className="text-white">Theme</span>
              <ThemeToggle />
            </div>
            
            {/* User Account Links in Mobile */}
            <div className="border-t border-gray-700 mt-4 pt-4">
              {user ? (
                <button
                  onClick={() => {
                    localStorage.removeItem('user')
                    setUser(null)
                    window.dispatchEvent(new CustomEvent('userLogout'))
                    setIsOpen(false)
                    window.location.href = '/'
                  }}
                  className="block text-white hover:text-sky-blue py-2 transition-colors duration-300 w-full text-left"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block text-white hover:text-sky-blue py-2 transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}