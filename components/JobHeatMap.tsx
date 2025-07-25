'use client'

import { useState } from 'react'
import { MapPin, Briefcase, DollarSign, Shield, Info } from 'lucide-react'

interface JobLocation {
  id: string
  city: string
  state: string
  lat: number
  lng: number
  jobCount: number
  avgSalary: number
  topEmployers: string[]
  clearanceRequired: boolean
}

export default function JobHeatMap() {
  const [selectedLocation, setSelectedLocation] = useState<JobLocation | null>(null)
  const [clearanceFilter, setClearanceFilter] = useState(false)

  // Mock data for demonstration
  const jobLocations: JobLocation[] = [
    {
      id: 'dc',
      city: 'Washington',
      state: 'DC',
      lat: 38.9072,
      lng: -77.0369,
      jobCount: 487,
      avgSalary: 145000,
      topEmployers: ['Booz Allen', 'CACI', 'SAIC'],
      clearanceRequired: true
    },
    {
      id: 'nova',
      city: 'Arlington',
      state: 'VA',
      lat: 38.8816,
      lng: -77.0910,
      jobCount: 362,
      avgSalary: 142000,
      topEmployers: ['Raytheon', 'General Dynamics', 'Leidos'],
      clearanceRequired: true
    },
    {
      id: 'bethesda',
      city: 'Bethesda',
      state: 'MD',
      lat: 38.9847,
      lng: -77.0947,
      jobCount: 289,
      avgSalary: 138000,
      topEmployers: ['Lockheed Martin', 'Northrop Grumman', 'MITRE'],
      clearanceRequired: true
    },
    {
      id: 'colorado',
      city: 'Colorado Springs',
      state: 'CO',
      lat: 38.8339,
      lng: -104.8214,
      jobCount: 156,
      avgSalary: 128000,
      topEmployers: ['Space Force', 'Boeing', 'L3Harris'],
      clearanceRequired: true
    },
    {
      id: 'huntsville',
      city: 'Huntsville',
      state: 'AL',
      lat: 34.7304,
      lng: -86.5861,
      jobCount: 134,
      avgSalary: 125000,
      topEmployers: ['NASA', 'Dynetics', 'SAIC'],
      clearanceRequired: true
    }
  ]

  const getHeatColor = (jobCount: number) => {
    if (jobCount > 400) return 'from-red-600 to-red-500'
    if (jobCount > 300) return 'from-orange-600 to-orange-500'
    if (jobCount > 200) return 'from-yellow-600 to-yellow-500'
    if (jobCount > 100) return 'from-green-600 to-green-500'
    return 'from-blue-600 to-blue-500'
  }

  const getMarkerSize = (jobCount: number) => {
    if (jobCount > 400) return 'w-16 h-16'
    if (jobCount > 300) return 'w-14 h-14'
    if (jobCount > 200) return 'w-12 h-12'
    if (jobCount > 100) return 'w-10 h-10'
    return 'w-8 h-8'
  }

  const filteredLocations = clearanceFilter 
    ? jobLocations.filter(loc => loc.clearanceRequired)
    : jobLocations

  return (
    <div className="w-full">
      <div className="glass-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="text-sky-blue" />
            Job Opportunity Heat Map
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={clearanceFilter}
                onChange={(e) => setClearanceFilter(e.target.checked)}
                className="rounded"
              />
              <Shield size={16} />
              Clearance Required Only
            </label>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative bg-gray-800 rounded-lg h-[500px] overflow-hidden">
          {/* Simple US Map Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 900 500" className="w-full h-full max-w-4xl opacity-20">
              <path
                d="M 100 200 L 150 180 L 200 170 L 300 160 L 400 150 L 500 160 L 600 170 L 700 180 L 750 200 L 780 220 L 800 250 L 780 300 L 750 350 L 700 380 L 600 400 L 500 410 L 400 410 L 300 400 L 200 380 L 150 350 L 100 300 Z"
                fill="currentColor"
                className="text-gray-600"
              />
            </svg>
          </div>

          {/* Job Location Markers */}
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${((location.lng + 130) / 60) * 100}%`,
                top: `${((50 - location.lat) / 30) * 100}%`
              }}
              onClick={() => setSelectedLocation(location)}
            >
              <div className={`${getMarkerSize(location.jobCount)} relative`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${getHeatColor(location.jobCount)} rounded-full opacity-30 animate-pulse`} />
                <div className={`absolute inset-0 bg-gradient-to-r ${getHeatColor(location.jobCount)} rounded-full opacity-60`} />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  {location.jobCount}
                </div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {location.city}, {location.state}
                </div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-card p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Job Density</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-red-500 rounded-full" />
                <span className="text-xs text-gray-300">400+ jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full" />
                <span className="text-xs text-gray-300">300-399 jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full" />
                <span className="text-xs text-gray-300">200-299 jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-500 rounded-full" />
                <span className="text-xs text-gray-300">100-199 jobs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        {selectedLocation && (
          <div className="mt-6 glass-card p-6 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedLocation.city}, {selectedLocation.state}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-sky-blue" size={20} />
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedLocation.jobCount}</p>
                      <p className="text-sm text-gray-400">Open Positions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-neon-green" size={20} />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        ${selectedLocation.avgSalary.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Avg. Salary</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="text-yellow-500" size={20} />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {selectedLocation.clearanceRequired ? 'Required' : 'Optional'}
                      </p>
                      <p className="text-sm text-gray-400">Clearance</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Top Employers:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.topEmployers.map((employer, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                        {employer}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {filteredLocations.reduce((sum, loc) => sum + loc.jobCount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{filteredLocations.length}</p>
            <p className="text-sm text-gray-400">Hot Locations</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              ${(filteredLocations.reduce((sum, loc) => sum + loc.avgSalary, 0) / filteredLocations.length / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-gray-400">Avg. Salary</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {Math.round((filteredLocations.filter(loc => loc.clearanceRequired).length / filteredLocations.length) * 100)}%
            </p>
            <p className="text-sm text-gray-400">Need Clearance</p>
          </div>
        </div>
      </div>
    </div>
  )
}