'use client'

import Link from 'next/link'
import MoreMenu from './MoreMenu'
import NavActions from './NavActions'

export default function SiteHeader() {
  return (
    <header className="fixed top-0 w-full bg-gray-900 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sky-blue rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-white font-montserrat font-semibold text-lg">
                CAG
              </span>
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