'use client'

import elasticsearch from './client'

export interface SearchFilters {
  clearance?: string[]
  location?: string[]
  salary?: { min?: number; max?: number }
  skills?: string[]
  company?: string[]
  remote?: boolean
  posted?: { days?: number }
}

export interface SearchOptions {
  page?: number
  size?: number
  sort?: { field: string; order: 'asc' | 'desc' }[]
  highlight?: boolean
  fuzzy?: boolean
  suggestions?: boolean
}

export interface SearchResult {
  hits: {
    total: number
    items: any[]
  }
  aggregations?: any
  suggestions?: string[]
}

class SearchService {
  
  async searchJobs(
    query: string = '',
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const { page = 1, size = 20, sort = [], highlight = true, fuzzy = false } = options
    
    const esQuery: any = {
      from: (page - 1) * size,
      size,
      query: this.buildJobQuery(query, filters, fuzzy),
      aggs: this.buildJobAggregations(),
      ...(highlight && {
        highlight: {
          fields: {
            title: {},
            description: {},
            skills: {}
          }
        }
      }),
      ...(sort.length > 0 && {
        sort: sort.map(s => ({ [s.field]: { order: s.order } }))
      })
    }

    const response = await elasticsearch.search('jobs', esQuery)
    
    let suggestions: string[] = []
    if (options.suggestions && query) {
      suggestions = await this.getJobSuggestions(query)
    }

    return {
      hits: {
        total: response.hits.total.value,
        items: response.hits.hits.map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          ...hit._source,
          ...(hit.highlight && { highlight: hit.highlight })
        }))
      },
      aggregations: response.aggregations,
      suggestions
    }
  }

  async searchUsers(
    query: string = '',
    filters: any = {},
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const { page = 1, size = 20, sort = [] } = options
    
    const esQuery: any = {
      from: (page - 1) * size,
      size,
      query: this.buildUserQuery(query, filters),
      ...(sort.length > 0 && {
        sort: sort.map(s => ({ [s.field]: { order: s.order } }))
      })
    }

    const response = await elasticsearch.search('users', esQuery)

    return {
      hits: {
        total: response.hits.total.value,
        items: response.hits.hits.map((hit: any) => ({
          id: hit._id,
          score: hit._score,
          ...hit._source
        }))
      }
    }
  }

  async globalSearch(query: string, options: SearchOptions = {}): Promise<any> {
    const searches = [
      { index: 'jobs', body: { query: this.buildJobQuery(query, {}) } },
      { index: 'users', body: { query: this.buildUserQuery(query, {}) } }
    ]

    const responses = await elasticsearch.multiSearch(searches)
    
    return {
      jobs: {
        total: responses[0].hits.total.value,
        items: responses[0].hits.hits.slice(0, 5).map((hit: any) => ({
          id: hit._id,
          type: 'job',
          ...hit._source
        }))
      },
      users: {
        total: responses[1].hits.total.value,
        items: responses[1].hits.hits.slice(0, 5).map((hit: any) => ({
          id: hit._id,
          type: 'user',
          ...hit._source
        }))
      }
    }
  }

  async getJobSuggestions(query: string): Promise<string[]> {
    const suggestions = await Promise.all([
      elasticsearch.suggest('jobs', 'title', query),
      elasticsearch.suggest('jobs', 'skills', query),
      elasticsearch.suggest('jobs', 'company', query)
    ])
    
    return [...new Set(suggestions.flat())].slice(0, 8)
  }

  async getSimilarJobs(jobId: string, limit: number = 5): Promise<any[]> {
    // First get the job to find similar ones
    const job = await this.getJobById(jobId)
    if (!job) return []

    const query = {
      query: {
        more_like_this: {
          fields: ['title', 'description', 'skills'],
          like: [{ _index: 'jobs', _id: jobId }],
          min_term_freq: 1,
          max_query_terms: 12
        }
      },
      size: limit
    }

    const response = await elasticsearch.search('jobs', query)
    return response.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }))
  }

  private buildJobQuery(query: string, filters: SearchFilters, fuzzy: boolean = false): any {
    const must: any[] = []
    const filter: any[] = []

    // Text search
    if (query) {
      if (fuzzy) {
        must.push({
          multi_match: {
            query,
            fields: ['title^3', 'description^2', 'skills^2', 'company'],
            fuzziness: 'AUTO',
            operator: 'or'
          }
        })
      } else {
        must.push({
          multi_match: {
            query,
            fields: ['title^3', 'description^2', 'skills^2', 'company'],
            operator: 'or'
          }
        })
      }
    }

    // Clearance filter
    if (filters.clearance?.length) {
      filter.push({
        terms: { 'clearance.keyword': filters.clearance }
      })
    }

    // Location filter
    if (filters.location?.length) {
      filter.push({
        terms: { 'location.keyword': filters.location }
      })
    }

    // Salary range filter
    if (filters.salary) {
      const salaryQuery: any = {}
      if (filters.salary.min) salaryQuery.gte = filters.salary.min
      if (filters.salary.max) salaryQuery.lte = filters.salary.max
      
      if (Object.keys(salaryQuery).length > 0) {
        filter.push({
          range: { salary_numeric: salaryQuery }
        })
      }
    }

    // Skills filter
    if (filters.skills?.length) {
      filter.push({
        terms: { 'skills.keyword': filters.skills }
      })
    }

    // Company filter
    if (filters.company?.length) {
      filter.push({
        terms: { 'company.keyword': filters.company }
      })
    }

    // Remote work filter
    if (filters.remote !== undefined) {
      filter.push({
        term: { remote: filters.remote }
      })
    }

    // Posted date filter
    if (filters.posted?.days) {
      filter.push({
        range: {
          posted: {
            gte: `now-${filters.posted.days}d/d`
          }
        }
      })
    }

    return {
      bool: {
        ...(must.length > 0 && { must }),
        ...(filter.length > 0 && { filter })
      }
    }
  }

  private buildUserQuery(query: string, filters: any): any {
    const must: any[] = []
    const filter: any[] = []

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^2', 'skills', 'location'],
          operator: 'or'
        }
      })
    }

    if (filters.clearance?.length) {
      filter.push({
        terms: { 'clearance.keyword': filters.clearance }
      })
    }

    if (filters.skills?.length) {
      filter.push({
        terms: { 'skills.keyword': filters.skills }
      })
    }

    return {
      bool: {
        ...(must.length > 0 && { must }),
        ...(filter.length > 0 && { filter })
      }
    }
  }

  private buildJobAggregations(): any {
    return {
      clearance_levels: {
        terms: { field: 'clearance.keyword', size: 10 }
      },
      locations: {
        terms: { field: 'location.keyword', size: 20 }
      },
      companies: {
        terms: { field: 'company.keyword', size: 15 }
      },
      skills: {
        terms: { field: 'skills.keyword', size: 30 }
      },
      salary_ranges: {
        range: {
          field: 'salary_numeric',
          ranges: [
            { to: 75000, key: 'Under $75k' },
            { from: 75000, to: 100000, key: '$75k - $100k' },
            { from: 100000, to: 125000, key: '$100k - $125k' },
            { from: 125000, to: 150000, key: '$125k - $150k' },
            { from: 150000, key: 'Over $150k' }
          ]
        }
      }
    }
  }

  private async getJobById(id: string): Promise<any> {
    try {
      const response = await elasticsearch.search('jobs', {
        query: { term: { _id: id } }
      })
      return response.hits.hits[0]?._source
    } catch (error) {
      console.error('Error fetching job by ID:', error)
      return null
    }
  }

  async indexJob(job: any): Promise<void> {
    await elasticsearch.indexDocument('jobs', job.id, {
      ...job,
      salary_numeric: this.extractSalaryNumber(job.salary),
      posted: job.posted || new Date().toISOString().split('T')[0]
    })
  }

  async deleteJob(jobId: string): Promise<void> {
    await elasticsearch.deleteDocument('jobs', jobId)
  }

  async indexUser(user: any): Promise<void> {
    await elasticsearch.indexDocument('users', user.id, user)
  }

  private extractSalaryNumber(salary: string): number {
    if (!salary) return 0
    const matches = salary.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g)
    if (matches && matches.length > 0) {
      return parseInt(matches[0].replace(/[$,]/g, ''))
    }
    return 0
  }
}

export const searchService = new SearchService()
export default searchService