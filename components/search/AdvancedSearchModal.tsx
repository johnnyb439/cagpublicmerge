'use client'

import { useState, useEffect } from 'react'
import { X, Search, Filter, MapPin, DollarSign, Shield, Building, Clock } from 'lucide-react'
import { searchService, SearchFilters } from '@/lib/elasticsearch/search-service'

interface AdvancedSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string, filters: SearchFilters) => void
  initialQuery?: string
  initialFilters?: SearchFilters
}

export default function AdvancedSearchModal({
  isOpen,
  onClose,
  onSearch,
  initialQuery = '',
  initialFilters = {}
}: AdvancedSearchModalProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Mock options - in real app these would come from API/database
  const clearanceLevels = ['Public Trust', 'Secret', 'Top Secret', 'TS/SCI', 'TS/SCI with Polygraph']
  const locations = ['Washington, DC', 'Arlington, VA', 'Bethesda, MD', 'Colorado Springs, CO', 'San Antonio, TX', 'Remote']
  const skillOptions = ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'CISSP', 'SANS', 'Penetration Testing']

  useEffect(() => {
    if (query && query.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const suggestions = await searchService.getJobSuggestions(query)
          setSuggestions(suggestions)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        }
      }
      
      const timeoutId = setTimeout(fetchSuggestions, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const handleSearch = () => {
    onSearch(query, filters)
    onClose()
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayFilterToggle = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = (prev[key] as string[]) || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [key]: newArray
      }
    })
  }

  const clearFilters = () => {
    setFilters({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.clearance?.length) count++
    if (filters.location?.length) count++
    if (filters.salary?.min || filters.salary?.max) count++
    if (filters.skills?.length) count++
    if (filters.company?.length) count++
    if (filters.remote !== undefined) count++
    if (filters.posted?.days) count++
    return count
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto modal-mobile sm:rounded-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Search className="w-5 sm:w-6 h-5 sm:h-6 text-sky-blue" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Advanced Search</h2>
            {getActiveFilterCount() > 0 && (
              <span className="bg-sky-blue text-white text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()} filters
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Query
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter keywords, job titles, skills..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[44px] text-base"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg mt-1 shadow-lg z-10 max-h-40 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion)
                        setShowSuggestions(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clearance Levels */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-blue" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Clearance Level
                </label>
              </div>
              <div className="space-y-2">
                {clearanceLevels.map(level => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.clearance?.includes(level) || false}
                      onChange={() => handleArrayFilterToggle('clearance', level)}
                      className="rounded border-gray-300 text-sky-blue focus:ring-sky-blue"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-blue" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
              </div>
              <div className="space-y-2">
                {locations.map(location => (
                  <label key={location} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.location?.includes(location) || false}
                      onChange={() => handleArrayFilterToggle('location', location)}
                      className="rounded border-gray-300 text-sky-blue focus:ring-sky-blue"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-sky-blue" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Salary Range
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.salary?.min || ''}
                  onChange={(e) => handleFilterChange('salary', {
                    ...filters.salary,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.salary?.max || ''}
                  onChange={(e) => handleFilterChange('salary', {
                    ...filters.salary,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Posted Date */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-blue" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Posted Within
                </label>
              </div>
              <select
                value={filters.posted?.days || ''}
                onChange={(e) => handleFilterChange('posted', 
                  e.target.value ? { days: parseInt(e.target.value) } : undefined
                )}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-blue focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Any time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last week</option>
                <option value="30">Last month</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Required Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleArrayFilterToggle('skills', skill)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.skills?.includes(skill)
                      ? 'bg-sky-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Remote Work */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Work Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="remote"
                  checked={filters.remote === undefined}
                  onChange={() => handleFilterChange('remote', undefined)}
                  className="text-sky-blue focus:ring-sky-blue"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">All</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="remote"
                  checked={filters.remote === true}
                  onChange={() => handleFilterChange('remote', true)}
                  className="text-sky-blue focus:ring-sky-blue"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remote</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="remote"
                  checked={filters.remote === false}
                  onChange={() => handleFilterChange('remote', false)}
                  className="text-sky-blue focus:ring-sky-blue"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">On-site</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear all filters
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}