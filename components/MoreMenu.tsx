'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Check if user is logged in
  useEffect(() => {
    const checkUser = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userData = localStorage.getItem('user')
          if (userData) {
            setUser(JSON.parse(userData))
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Error loading user data in MoreMenu:', error)
        setUser(null)
      }
    }

    checkUser()
    
    // Listen for login/logout events
    window.addEventListener('userLogin', checkUser)
    window.addEventListener('userLogout', checkUser)
    window.addEventListener('storage', checkUser)
    
    const interval = setInterval(checkUser, 1000)

    return () => {
      window.removeEventListener('userLogin', checkUser)
      window.removeEventListener('userLogout', checkUser)
      window.removeEventListener('storage', checkUser)
      clearInterval(interval)
    }
  }, [])

  // Different menu items based on login status
  const baseMenuItems = [
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/mock-interview', label: 'Mock Interview' },
    { href: '/resources', label: 'Resources' },
  ]

  const menuItems = user 
    ? [{ href: '/dashboard', label: '📊 Dashboard' }, ...baseMenuItems]
    : baseMenuItems

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-white hover:text-sky-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-blue focus:ring-opacity-50 rounded-md px-2 py-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="More menu"
      >
        <span className="text-sm font-medium">More</span>
        {isOpen ? (
          <ChevronUp size={16} className="text-current" />
        ) : (
          <ChevronDown size={16} className="text-current" />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50"
          role="menu"
          aria-label="More menu options"
        >
          <div className="py-2">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-white hover:bg-gray-800 hover:text-sky-blue transition-colors duration-200 focus:outline-none focus:bg-gray-800 focus:text-sky-blue"
                role="menuitem"
                tabIndex={0}
                onClick={() => setIsOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsOpen(false)
                    // Navigate programmatically if needed
                    window.location.href = item.href
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}