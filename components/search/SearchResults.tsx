'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, DollarSign, Clock, Building, Shield, Star, Eye } from 'lucide-react'
import { searchService, SearchFilters, SearchOptions } from '@/lib/elasticsearch/search-service'
import AdvancedSearchModal from './AdvancedSearchModal'

interface SearchResultsProps {
  initialQuery?: string
  initialFilters?: SearchFilters
}

export default function SearchResults({ initialQuery = '', initialFilters = {} }: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [results, setResults] = useState<any>({ hits: { total: 0, items: [] }, aggregations: null })
  const [loading, setLoading] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'relevance', order: 'desc' })
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    if (query || Object.keys(filters).length > 0) {
      handleSearch()
    }
  }, [query, filters, currentPage, sortBy])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const options: SearchOptions = {
        page: currentPage,
        size: 20,
        sort: sortBy.field === 'relevance' ? [] : [sortBy],
        highlight: true,
        suggestions: true
      }

      const searchResults = await searchService.searchJobs(query, filters, options)
      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdvancedSearch = (newQuery: string, newFilters: SearchFilters) => {
    setQuery(newQuery)
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setQuery('')
    setFilters({})
    setCurrentPage(1)
    setResults({ hits: { total: 0, items: [] }, aggregations: null })
  }

  const formatSalary = (salary: string) => {
    if (!salary) return 'Salary not specified'
    return salary
  }

  const formatPostedDate = (date: string) => {
    const posted = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - posted.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Posted today'
    if (diffDays < 7) return `Posted ${diffDays} days ago`
    if (diffDays < 30) return `Posted ${Math.ceil(diffDays / 7)} weeks ago`
    return `Posted ${Math.ceil(diffDays / 30)} months ago`
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.clearance?.length) count++
    if (filters.location?.length) count++
    if (filters.salary?.min || filters.salary?.max) count++
    if (filters.skills?.length) count++
    if (filters.remote !== undefined) count++
    return count
  }

  const totalPages = Math.ceil(results.hits.total / 20)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, skills, companies..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Advanced
                {getActiveFilterCount() > 0 && (
                  <span className="bg-sky-blue text-white text-xs px-2 py-1 rounded-full ml-1">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
              
              {(query || getActiveFilterCount() > 0) && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.clearance?.map(level => (
                <span key={level} className="bg-sky-blue/10 text-sky-blue px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {level}
                </span>
              ))}
              {filters.location?.map(loc => (
                <span key={loc} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {loc}
                </span>
              ))}
              {(filters.salary?.min || filters.salary?.max) && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${filters.salary?.min || 0}k - ${filters.salary?.max || '∞'}k
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Refine Results</h3>
              
              {results.aggregations && (
                <div className="space-y-6">
                  {/* Clearance Levels */}
                  {results.aggregations.clearance_levels?.buckets?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clearance Level</h4>
                      <div className="space-y-2">
                        {results.aggregations.clearance_levels.buckets.slice(0, 5).map((bucket: any) => (
                          <label key={bucket.key} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={filters.clearance?.includes(bucket.key) || false}
                                onChange={() => {
                                  const newClearance = filters.clearance?.includes(bucket.key)
                                    ? filters.clearance.filter(c => c !== bucket.key)
                                    : [...(filters.clearance || []), bucket.key]
                                  setFilters(prev => ({ ...prev, clearance: newClearance }))
                                }}
                                className="rounded border-gray-300 text-sky-blue focus:ring-sky-blue"
                              />
                              <span className="text-gray-700 dark:text-gray-300">{bucket.key}</span>
                            </div>
                            <span className="text-gray-500 text-xs">({bucket.doc_count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {results.aggregations.locations?.buckets?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</h4>
                      <div className="space-y-2">
                        {results.aggregations.locations.buckets.slice(0, 5).map((bucket: any) => (
                          <label key={bucket.key} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={filters.location?.includes(bucket.key) || false}
                                onChange={() => {
                                  const newLocation = filters.location?.includes(bucket.key)
                                    ? filters.location.filter(l => l !== bucket.key)
                                    : [...(filters.location || []), bucket.key]
                                  setFilters(prev => ({ ...prev, location: newLocation }))
                                }}
                                className="rounded border-gray-300 text-sky-blue focus:ring-sky-blue"
                              />
                              <span className="text-gray-700 dark:text-gray-300">{bucket.key}</span>
                            </div>
                            <span className="text-gray-500 text-xs">({bucket.doc_count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {results.hits.total.toLocaleString()} Jobs Found
                </h2>
                {loading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-sky-blue border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <select
                  value={`${sortBy.field}-${sortBy.order}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy({ field, order: order as 'asc' | 'desc' })
                  }}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="relevance-desc">Most Relevant</option>
                  <option value="posted-desc">Newest First</option>
                  <option value="posted-asc">Oldest First</option>
                  <option value="salary_numeric-desc">Highest Salary</option>
                  <option value="salary_numeric-asc">Lowest Salary</option>
                </select>
              </div>
            </div>

            {/* Job Results */}
            <div className="space-y-4">
              {results.hits.items.map((job: any) => (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {job.highlight?.title?.[0] ? (
                          <span dangerouslySetInnerHTML={{ __html: job.highlight.title[0] }} />
                        ) : (
                          job.title
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatPostedDate(job.posted)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="bg-sky-blue/10 text-sky-blue px-3 py-1 rounded-full text-sm font-medium">
                        {job.clearance}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Star className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {job.highlight?.description?.[0] ? (
                      <span dangerouslySetInnerHTML={{ __html: job.highlight.description[0] }} />
                    ) : (
                      job.description
                    )}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatSalary(job.salary)}</span>
                      </div>
                      
                      {job.skills && (
                        <div className="flex gap-1">
                          {job.skills.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded text-xs">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="px-4 py-2 text-sky-blue border border-sky-blue rounded-lg hover:bg-sky-blue hover:text-white transition-colors">
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      <button className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-sky-blue/90 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const page = i + Math.max(1, currentPage - 2)
                    if (page > totalPages) return null
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded ${
                          page === currentPage
                            ? 'bg-sky-blue text-white'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        initialQuery={query}
        initialFilters={filters}
      />
    </div>
  )
}