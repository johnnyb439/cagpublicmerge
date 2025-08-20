'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import MoreMenu from './MoreMenu'
import NavActions from './NavActions'
import ThemeToggle from './ThemeToggle'

export default function SiteHeader() {
  return (
    <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo/Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="p-3 rounded-lg btn-cag-gradient cag-glow">
              <Home className="w-6 h-6 text-white" />
            </Link>
            <span className="text-white font-semibold text-lg">Cleared Advisory Group</span>
          </div>

          {/* Right: More Menu + Auth Actions + Theme Toggle */}
          <div className="flex items-center space-x-6">
            <MoreMenu />
            <NavActions />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}