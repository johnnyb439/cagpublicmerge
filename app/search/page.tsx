'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Briefcase,
  BookOpen,
  Award,
  Users,
  Building,
  MapPin,
  Shield,
  Clock,
  ExternalLink,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  type: 'job' | 'resource' | 'certification' | 'member' | 'company'
  title: string
  description: string
  url: string
  metadata?: any
  relevanceScore: number
}

interface SearchData {
  query: string
  totalResults: number
  results: SearchResult[]
  groupedResults: {
    jobs: SearchResult[]
    resources: SearchResult[]
    certifications: SearchResult[]
    members: SearchResult[]
    companies: SearchResult[]
  }
  stats: {
    jobs: number
    resources: number
    certifications: number
    members: number
    companies: number
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchData, setSearchData] = useState<SearchData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams({
        q: query,
        limit: '50'
      })
      
      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }

      const response = await fetch(`/api/search?${params}`)
      const result = await response.json()

      if (result.success) {
        setSearchData(result.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedType])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim())
      // Update URL without refresh
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase size={16} />
      case 'resource': return <BookOpen size={16} />
      case 'certification': return <Award size={16} />
      case 'member': return <Users size={16} />
      case 'company': return <Building size={16} />
      default: return <Search size={16} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'resource': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'certification': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'member': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200'
      case 'company': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const resultTypes = [
    { key: 'all', label: 'All Results', icon: Search },
    { key: 'job', label: 'Jobs', icon: Briefcase },
    { key: 'resource', label: 'Resources', icon: BookOpen },
    { key: 'certification', label: 'Certifications', icon: Award },
    { key: 'member', label: 'Network', icon: Users },
    { key: 'company', label: 'Companies', icon: Building }
  ]

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
            Search Everything
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find jobs, resources, certifications, network members, and companies all in one place
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for jobs, skills, companies, certifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-dynamic-green dark:bg-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-dynamic-green text-white rounded-lg hover:bg-emerald-green transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </motion.div>

        {/* Type Filters */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-command-black rounded-lg shadow-md p-4 mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {resultTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => {
                    setSelectedType(type.key)
                    if (searchQuery.trim()) {
                      performSearch(searchQuery.trim())
                    }
                  }}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type.key
                      ? 'bg-dynamic-green text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <type.icon size={16} className="mr-2" />
                  {type.label}
                  {searchData && type.key !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                      {searchData.stats[type.key as keyof typeof searchData.stats] || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green"></div>
          </div>
        )}

        {searchData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Results Summary */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {searchData.totalResults} results for "{searchData.query}"
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{searchData.stats.jobs} jobs</span>
                <span>{searchData.stats.resources} resources</span>
                <span>{searchData.stats.certifications} certifications</span>
                <span>{searchData.stats.members} members</span>
                <span>{searchData.stats.companies} companies</span>
              </div>
            </div>

            {/* Results List */}
            {searchData.totalResults === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Try searching with different keywords or check your spelling
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(selectedType === 'all' ? searchData.results : 
                  searchData.groupedResults[selectedType as keyof typeof searchData.groupedResults] || []
                ).map((result, index) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <Link href={result.url} className="block">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${getTypeColor(result.type)}`}>
                            {getTypeIcon(result.type)}
                            <span className="ml-1 capitalize">{result.type}</span>
                          </span>
                          <div className="w-2 h-2 bg-dynamic-green rounded-full opacity-60"></div>
                          <span className="ml-2 text-xs text-gray-500">
                            {Math.round(result.relevanceScore * 100)}% match
                          </span>
                        </div>
                        <ExternalLink size={16} className="text-gray-400" />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 hover:text-dynamic-green transition-colors">
                        {result.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {result.description}
                      </p>

                      {/* Metadata based on type */}
                      {result.metadata && (
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-500">
                          {result.type === 'job' && (
                            <>
                              {result.metadata.clearance && (
                                <span className="flex items-center">
                                  <Shield size={12} className="mr-1" />
                                  {result.metadata.clearance}
                                </span>
                              )}
                              {result.metadata.location && (
                                <span className="flex items-center">
                                  <MapPin size={12} className="mr-1" />
                                  {result.metadata.location}
                                </span>
                              )}
                            </>
                          )}
                          
                          {result.type === 'certification' && result.metadata.expirationDate && (
                            <span className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              Expires: {new Date(result.metadata.expirationDate).toLocaleDateString()}
                            </span>
                          )}
                          
                          {result.type === 'member' && (
                            <>
                              {result.metadata.location && (
                                <span className="flex items-center">
                                  <MapPin size={12} className="mr-1" />
                                  {result.metadata.location}
                                </span>
                              )}
                              {result.metadata.clearanceLevel && (
                                <span className="flex items-center">
                                  <Shield size={12} className="mr-1" />
                                  {result.metadata.clearanceLevel}
                                </span>
                              )}
                            </>
                          )}
                          
                          {result.type === 'company' && result.metadata.jobCount && (
                            <span className="flex items-center">
                              <TrendingUp size={12} className="mr-1" />
                              {result.metadata.jobCount} open positions
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center py-12"
          >
            <Search className="mx-auto text-gray-400 mb-6" size={64} />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
              Ready to search?
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-8 max-w-md mx-auto">
              Enter your search terms above to find jobs, resources, certifications, network members, and companies.
            </p>

            {/* Popular Searches */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'cybersecurity',
                  'cloud engineer',
                  'security+',
                  'clearance jobs',
                  'devops',
                  'network security',
                  'aws',
                  'project manager'
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term)
                      performSearch(term)
                    }}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-dynamic-green hover:text-white transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}