'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import MoreMenu from './MoreMenu'
import NavActions from './NavActions'

export default function SiteHeader() {
  return (
    <header className="fixed top-0 w-full bg-gray-900 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="p-3 rounded-lg transition-colors duration-300" style={{backgroundColor: 'var(--cag-blue)'}}>
              <Home className="w-6 h-6 text-white" />
            </Link>
          </div>

          {/* Right: More Menu + Auth Actions */}
          <div className="flex items-center space-x-6">
            <MoreMenu />
            <NavActions />
          </div>
        </div>
      </div>
    </header>
  )
}