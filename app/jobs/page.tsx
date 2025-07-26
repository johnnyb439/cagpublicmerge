'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Shield, DollarSign, Filter, ChevronRight, Layers, Save, ChevronLeft, Building } from 'lucide-react'
import Link from 'next/link'
import JobHeatMap from '@/components/JobHeatMap'
import AdvancedFilters, { JobFilters } from '@/components/jobs/AdvancedFilters'
import SavedSearches from '@/components/jobs/SavedSearches'
import JobComparison, { Job as ComparisonJob } from '@/components/jobs/JobComparison'
import { SkeletonJobCard } from '@/components/ui/Skeleton'

interface Job {
  id: string
  title: string
  company: string
  location: string
  clearance: string
  salary: string
  salaryMin?: number
  salaryMax?: number
  type: string
  posted: string
  description: string
  requirements: string[]
  skills: string[]
  experienceLevel: string
  remote: boolean
  polygraph: boolean
  certifications: string[]
  benefits: string[]
  views: number
  applications: number
}

interface Aggregations {
  clearanceLevels: { value: string; count: number }[]
  experienceLevels: { value: string; count: number }[]
  jobTypes: { value: string; count: number }[]
  companies: { value: string; count: number }[]
  locations: { value: string; count: number }[]
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<ComparisonJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showHeatMap, setShowHeatMap] = useState(false)
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [aggregations, setAggregations] = useState<Aggregations | null>(null)
  const [totalJobs, setTotalJobs] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('posted')
  
  const [filters, setFilters] = useState<JobFilters>({
    searchTerm: '',
    location: '',
    clearance: '',
    salary: { min: 0, max: 300000 },
    experienceLevel: [],
    jobType: [],
    skills: [],
    postedWithin: '',
    remote: false,
    polygraph: false,
    certifications: []
  })

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Add filter parameters
      if (filters.searchTerm) params.append('search', filters.searchTerm)
      if (filters.location) params.append('location', filters.location)
      if (filters.clearance) params.append('clearance', filters.clearance)
      params.append('salaryMin', filters.salary.min.toString())
      params.append('salaryMax', filters.salary.max.toString())
      filters.experienceLevel.forEach(level => params.append('experienceLevel', level))
      filters.jobType.forEach(type => params.append('jobType', type))
      filters.skills.forEach(skill => params.append('skills', skill))
      if (filters.remote) params.append('remote', 'true')
      if (filters.polygraph) params.append('polygraph', 'true')
      filters.certifications.forEach(cert => params.append('certifications', cert))
      if (filters.postedWithin) params.append('postedWithin', filters.postedWithin)
      params.append('sortBy', sortBy)
      params.append('page', currentPage.toString())
      params.append('limit', '10')

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setJobs(result.data)
        setAggregations(result.aggregations)
        setTotalJobs(result.pagination.total)
        setTotalPages(result.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, currentPage, sortBy])

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSaveSearch = async () => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Search - ${filters.searchTerm || 'All Jobs'}`,
          filters,
          frequency: 'daily',
          email: 'user@example.com' // Get from user session
        })
      })

      if (response.ok) {
        alert('Search saved successfully! You will receive email alerts for matching jobs.')
      }
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  const toggleJobSelection = (job: Job) => {
    const jobForComparison: ComparisonJob = {
      ...job,
      experienceLevel: job.experienceLevel
    }
    
    setSelectedJobs(prev => {
      const exists = prev.find(j => j.id === job.id)
      if (exists) {
        return prev.filter(j => j.id !== job.id)
      }
      return [...prev, jobForComparison]
    })
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <section className="relative min-h-screen glass-bg py-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4 text-white">
            Cleared IT <span className="text-sky-blue">Job Board</span>
          </h1>
          <p className="text-xl text-gray-300">
            Exclusive opportunities for security cleared professionals
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setShowHeatMap(false)}
              className={`px-6 py-2 rounded-lg transition-all ${
                !showHeatMap ? 'bg-sky-blue text-white' : 'glass-card hover:bg-gray-700'
              }`}
            >
              Job Listings
            </button>
            <button
              onClick={() => setShowHeatMap(true)}
              className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                showHeatMap ? 'bg-sky-blue text-white' : 'glass-card hover:bg-gray-700'
              }`}
            >
              <MapPin size={20} />
              Heat Map View
            </button>
          </div>
        </motion.div>

        {/* Show either Heat Map or Job Listings */}
        {showHeatMap ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <JobHeatMap />
          </motion.div>
        ) : (
          <>
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="glass-card rounded-lg shadow-md p-6 mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search job title, company, or skills..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-sky-blue"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Location or Remote..."
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-sky-blue"
                  />
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(true)}
                  className="px-4 sm:px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center sm:justify-start"
                >
                  <Filter size={20} className="mr-2" />
                  Filters
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowSavedSearches(!showSavedSearches)}
                  className="px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Saved Searches
                </button>
                <button
                  onClick={handleSaveSearch}
                  className="px-4 py-2 glass-card rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Save This Search
                </button>
                {selectedJobs.length > 0 && (
                  <button
                    onClick={() => setShowComparison(true)}
                    className="px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 transition-colors flex items-center gap-2"
                  >
                    <Layers size={16} />
                    Compare ({selectedJobs.length})
                  </button>
                )}
                
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 glass-card rounded-lg bg-gray-700 text-white border border-gray-600"
                >
                  <option value="posted">Most Recent</option>
                  <option value="salary">Highest Salary</option>
                  <option value="company">Company Name</option>
                  <option value="relevance">Most Relevant</option>
                </select>
              </div>

              {/* Active Filters Display */}
              {(filters.clearance || filters.experienceLevel.length > 0 || filters.jobType.length > 0 || 
                filters.skills.length > 0 || filters.remote || filters.polygraph) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.clearance && (
                    <span className="px-3 py-1 bg-sky-blue/20 text-sky-blue rounded-full text-sm flex items-center gap-1">
                      <Shield size={14} />
                      {filters.clearance}
                      <button onClick={() => setFilters({...filters, clearance: ''})} className="ml-1">×</button>
                    </span>
                  )}
                  {filters.experienceLevel.map(level => (
                    <span key={level} className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
                      {level}
                      <button 
                        onClick={() => setFilters({...filters, experienceLevel: filters.experienceLevel.filter(l => l !== level)})} 
                        className="ml-1"
                      >×</button>
                    </span>
                  ))}
                  {filters.remote && (
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                      Remote
                      <button onClick={() => setFilters({...filters, remote: false})} className="ml-1">×</button>
                    </span>
                  )}
                </div>
              )}
            </motion.div>

            {/* Results Count and Stats */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-300">
                Showing <span className="font-semibold">{jobs.length}</span> of{' '}
                <span className="font-semibold">{totalJobs}</span> cleared positions
              </p>
              
              {/* Quick Stats */}
              {aggregations && (
                <div className="hidden md:flex gap-4 text-sm text-gray-400">
                  <span>{aggregations.companies.length} Companies</span>
                  <span>{aggregations.locations.length} Locations</span>
                  <span>{aggregations.clearanceLevels.length} Clearance Levels</span>
                </div>
              )}
            </div>

            {/* Job Listings */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonJobCard key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white dark:bg-command-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-montserrat font-semibold">
                              <Link href={`/jobs/${job.id}`} className="hover:text-dynamic-green transition-colors">
                                {job.title}
                              </Link>
                            </h3>
                            <input
                              type="checkbox"
                              checked={selectedJobs.some(j => j.id === job.id)}
                              onChange={() => toggleJobSelection(job)}
                              className="ml-4 mt-1"
                              title="Select for comparison"
                            />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center">
                              <Building size={16} className="mr-1" />
                              {job.company}
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm">{job.experienceLevel}</span>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>
                          
                          {/* Skills Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="px-2 py-1 text-xs text-gray-500">
                                +{job.skills.length - 5} more
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin size={16} className="mr-1" />
                              {job.location}
                              {job.remote && <span className="ml-1 text-green-500">(Remote Available)</span>}
                            </div>
                            <div className="flex items-center text-dynamic-green font-semibold">
                              <Shield size={16} className="mr-1" />
                              {job.clearance}
                              {job.polygraph && <span className="ml-1 text-red-500">(Poly)</span>}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <DollarSign size={16} className="mr-1" />
                              {job.salary}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col justify-between items-end">
                          <div className="text-right mb-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400 block">
                              {getRelativeTime(job.posted)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {job.views} views • {job.applications} applicants
                            </span>
                          </div>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="px-4 py-2 bg-sky-blue text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center text-sm"
                          >
                            View Details
                            <ChevronRight size={16} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 glass-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    
                    <span className="text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 glass-card rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!isLoading && jobs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 dark:text-gray-400 mb-4">No jobs found matching your criteria</p>
                <button
                  onClick={() => {
                    setFilters({
                      searchTerm: '',
                      location: '',
                      clearance: '',
                      salary: { min: 0, max: 300000 },
                      experienceLevel: [],
                      jobType: [],
                      skills: [],
                      postedWithin: '',
                      remote: false,
                      polygraph: false,
                      certifications: []
                    })
                  }}
                  className="text-dynamic-green hover:text-emerald-green transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}

            {/* Job Alerts CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-lg p-8 text-white text-center"
            >
              <h2 className="text-2xl font-montserrat font-bold mb-4">
                Don't Miss Out on New Opportunities
              </h2>
              <p className="mb-6">
                Get notified when new cleared positions matching your skills are posted
              </p>
              <button
                onClick={handleSaveSearch}
                className="px-6 py-3 bg-gradient-to-r from-sky-blue to-neon-green text-white rounded-lg hover:shadow-lg transition-all"
              >
                Set Up Job Alerts
              </button>
            </motion.div>
          </>
        )}
        
        {/* Advanced Filters Modal */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowAdvancedFilters(false)}
          isOpen={showAdvancedFilters}
          aggregations={aggregations}
        />
        
        {/* Job Comparison Modal */}
        <JobComparison
          jobs={selectedJobs}
          onRemoveJob={(id) => setSelectedJobs(prev => prev.filter(j => j.id !== id))}
          onClose={() => setShowComparison(false)}
          isOpen={showComparison}
        />
        
        {/* Saved Searches Modal */}
        {showSavedSearches && (
          <SavedSearches
            currentFilters={filters}
            onLoadSearch={(savedFilters) => {
              setFilters(savedFilters)
              setShowSavedSearches(false)
            }}
          />
        )}
      </div>
    </section>
  )
}