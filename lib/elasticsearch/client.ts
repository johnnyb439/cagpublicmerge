'use client'

import { Client } from '@elastic/elasticsearch'

class ElasticsearchClient {
  private client: Client | null = null
  private fallbackData: Map<string, any[]> = new Map()

  constructor() {
    this.initializeClient()
    this.initializeFallbackData()
  }

  private initializeClient() {
    try {
      if (process.env.ELASTICSEARCH_URL) {
        this.client = new Client({
          node: process.env.ELASTICSEARCH_URL,
          auth: process.env.ELASTICSEARCH_AUTH ? {
            username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
            password: process.env.ELASTICSEARCH_PASSWORD || ''
          } : undefined,
          tls: {
            rejectUnauthorized: false
          }
        })
        console.log('Elasticsearch client initialized')
      }
    } catch (error) {
      console.warn('Elasticsearch not configured, using fallback search:', error)
    }
  }

  private initializeFallbackData() {
    // Mock job data for fallback
    this.fallbackData.set('jobs', [
      {
        id: '1',
        title: 'Senior Software Engineer - TS/SCI',
        company: 'Defense Contractor Alpha',
        location: 'Arlington, VA',
        clearance: 'TS/SCI',
        salary: '$120,000 - $160,000',
        description: 'Senior software engineer role requiring TS/SCI clearance for defense applications',
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS'],
        posted: '2024-07-20'
      },
      {
        id: '2', 
        title: 'Cybersecurity Analyst - Secret',
        company: 'Government Agency Beta',
        location: 'Washington, DC',
        clearance: 'Secret',
        salary: '$90,000 - $120,000',
        description: 'Cybersecurity analyst position with Secret clearance requirement',
        skills: ['CISSP', 'SANS', 'Penetration Testing', 'Network Security'],
        posted: '2024-07-18'
      },
      {
        id: '3',
        title: 'DevOps Engineer - Top Secret',
        company: 'Aerospace Defense Corp',
        location: 'Colorado Springs, CO', 
        clearance: 'Top Secret',
        salary: '$130,000 - $170,000',
        description: 'DevOps engineer for classified aerospace systems',
        skills: ['Kubernetes', 'Docker', 'Jenkins', 'Terraform', 'Git'],
        posted: '2024-07-15'
      }
    ])

    // Mock user data
    this.fallbackData.set('users', [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        clearance: 'TS/SCI',
        skills: ['JavaScript', 'Python', 'React'],
        location: 'Arlington, VA'
      },
      {
        id: '2',
        name: 'Sarah Johnson', 
        email: 'sarah.j@example.com',
        clearance: 'Secret',
        skills: ['Cybersecurity', 'CISSP', 'Network Security'],
        location: 'Washington, DC'
      }
    ])
  }

  async search(index: string, query: any): Promise<any> {
    try {
      if (this.client) {
        const response = await this.client.search({
          index,
          body: query
        })
        return response.body
      } else {
        return this.fallbackSearch(index, query)
      }
    } catch (error) {
      console.warn('Elasticsearch search failed, using fallback:', error)
      return this.fallbackSearch(index, query)
    }
  }

  private fallbackSearch(index: string, query: any): any {
    const data = this.fallbackData.get(index) || []
    
    // Simple text search in fallback
    if (query.query?.multi_match?.query) {
      const searchTerm = query.query.multi_match.query.toLowerCase()
      const filtered = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm)
      )
      
      return {
        hits: {
          total: { value: filtered.length },
          hits: filtered.map((item, index) => ({
            _id: item.id || index.toString(),
            _source: item,
            _score: 1.0
          }))
        }
      }
    }

    // Return all data if no specific query
    return {
      hits: {
        total: { value: data.length },
        hits: data.map((item, index) => ({
          _id: item.id || index.toString(),
          _source: item,
          _score: 1.0
        }))
      }
    }
  }

  async fuzzySearch(index: string, field: string, value: string, options: any = {}): Promise<any> {
    const query = {
      query: {
        fuzzy: {
          [field]: {
            value,
            fuzziness: options.fuzziness || 'AUTO',
            max_expansions: options.max_expansions || 50,
            prefix_length: options.prefix_length || 0
          }
        }
      }
    }

    return this.search(index, query)
  }

  async suggest(index: string, field: string, text: string): Promise<string[]> {
    try {
      if (this.client) {
        const response = await this.client.search({
          index,
          body: {
            suggest: {
              text_suggest: {
                text,
                completion: {
                  field: `${field}_suggest`,
                  size: 5
                }
              }
            }
          }
        })
        
        return response.body.suggest?.text_suggest?.[0]?.options?.map((opt: any) => opt.text) || []
      } else {
        return this.fallbackSuggestions(index, field, text)
      }
    } catch (error) {
      console.warn('Elasticsearch suggestions failed, using fallback:', error)
      return this.fallbackSuggestions(index, field, text)
    }
  }

  private fallbackSuggestions(index: string, field: string, text: string): string[] {
    const data = this.fallbackData.get(index) || []
    const suggestions = new Set<string>()
    
    data.forEach(item => {
      if (item[field]) {
        const fieldValue = Array.isArray(item[field]) ? item[field] : [item[field]]
        fieldValue.forEach((val: string) => {
          if (val.toLowerCase().includes(text.toLowerCase())) {
            suggestions.add(val)
          }
        })
      }
    })
    
    return Array.from(suggestions).slice(0, 5)
  }

  async multiSearch(searches: any[]): Promise<any[]> {
    try {
      if (this.client) {
        const response = await this.client.msearch({
          body: searches.flatMap(search => [
            { index: search.index },
            search.body
          ])
        })
        return response.body.responses
      } else {
        return Promise.all(searches.map(search => 
          this.search(search.index, search.body)
        ))
      }
    } catch (error) {
      console.warn('Elasticsearch multi-search failed, using fallback:', error)
      return Promise.all(searches.map(search => 
        this.search(search.index, search.body)
      ))
    }
  }

  async indexDocument(index: string, id: string, document: any): Promise<any> {
    try {
      if (this.client) {
        const response = await this.client.index({
          index,
          id,
          body: document
        })
        return response.body
      } else {
        // Store in fallback data
        const data = this.fallbackData.get(index) || []
        const existingIndex = data.findIndex(item => item.id === id)
        
        if (existingIndex >= 0) {
          data[existingIndex] = { ...document, id }
        } else {
          data.push({ ...document, id })
        }
        
        this.fallbackData.set(index, data)
        return { _id: id, result: 'created' }
      }
    } catch (error) {
      console.error('Failed to index document:', error)
      throw error
    }
  }

  async deleteDocument(index: string, id: string): Promise<any> {
    try {
      if (this.client) {
        const response = await this.client.delete({
          index,
          id
        })
        return response.body
      } else {
        const data = this.fallbackData.get(index) || []
        const filtered = data.filter(item => item.id !== id)
        this.fallbackData.set(index, filtered)
        return { _id: id, result: 'deleted' }
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      throw error
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (this.client) {
        await this.client.ping()
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
}

export const elasticsearch = new ElasticsearchClient()
export default elasticsearch