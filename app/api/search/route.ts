import { NextRequest, NextResponse } from 'next/server'
import { mockDatabase } from '@/lib/mock-db'

interface SearchResult {
  id: string
  type: 'job' | 'resource' | 'certification' | 'member' | 'company'
  title: string
  description: string
  url: string
  metadata?: any
  relevanceScore: number
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const type = url.searchParams.get('type') // filter by type
    const limit = parseInt(url.searchParams.get('limit') || '20')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      }, { status: 400 })
    }

    const searchQuery = query.toLowerCase().trim()
    const results: SearchResult[] = []

    // Search Jobs
    if (!type || type === 'job') {
      const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jobs?searchTerm=${encodeURIComponent(query)}&limit=10`)
      if (jobResponse.ok) {
        const jobData = await jobResponse.json()
        if (jobData.success) {
          jobData.data.jobs.forEach((job: any) => {
            const relevance = calculateJobRelevance(job, searchQuery)
            if (relevance > 0) {
              results.push({
                id: job.id,
                type: 'job',
                title: job.title,
                description: `${job.company} • ${job.location} • ${job.clearance}`,
                url: `/jobs/${job.id}`,
                metadata: {
                  company: job.company,
                  location: job.location,
                  clearance: job.clearance,
                  salary: job.salary,
                  type: job.type,
                  skills: job.skills
                },
                relevanceScore: relevance
              })
            }
          })
        }
      }
    }

    // Search Certifications
    if (!type || type === 'certification') {
      const certifications = mockDatabase.certifications || []
      certifications.forEach((cert: any) => {
        const relevance = calculateCertificationRelevance(cert, searchQuery)
        if (relevance > 0) {
          results.push({
            id: cert.id,
            type: 'certification',
            title: cert.name,
            description: `${cert.issuer} • ${cert.category}`,
            url: `/dashboard/certifications`,
            metadata: {
              issuer: cert.issuer,
              category: cert.category,
              expirationDate: cert.expirationDate
            },
            relevanceScore: relevance
          })
        }
      })
    }

    // Search Resources
    if (!type || type === 'resource') {
      const resources = [
        {
          id: '1',
          title: 'Resume Translation Worksheet',
          description: 'Convert military experience to civilian resume language',
          category: 'Resume Tools',
          url: '/resources',
          type: 'worksheet'
        },
        {
          id: '2',
          title: 'Interview Success Checklist',
          description: 'Comprehensive checklist for acing cleared IT interviews',
          category: 'Interview Prep',
          url: '/resources',
          type: 'checklist'
        },
        {
          id: '3',
          title: 'Salary Calculator',
          description: 'Calculate expected salary with clearance premiums',
          category: 'Tools',
          url: '/resources',
          type: 'calculator'
        },
        {
          id: '4',
          title: 'Clearance Calculator',
          description: 'Estimate timeline for security clearance processing',
          category: 'Tools',
          url: '/resources',
          type: 'calculator'
        },
        {
          id: '5',
          title: 'Mock Interview Practice',
          description: 'AI-powered interview practice for cleared positions',
          category: 'Interview Prep',
          url: '/mock-interview',
          type: 'tool'
        }
      ]

      resources.forEach(resource => {
        const relevance = calculateResourceRelevance(resource, searchQuery)
        if (relevance > 0) {
          results.push({
            id: resource.id,
            type: 'resource',
            title: resource.title,
            description: resource.description,
            url: resource.url,
            metadata: {
              category: resource.category,
              type: resource.type
            },
            relevanceScore: relevance
          })
        }
      })
    }

    // Search Network Members
    if (!type || type === 'member') {
      const networkMembers = [
        {
          id: '1',
          name: 'Sarah Chen',
          title: 'Senior Cybersecurity Analyst',
          company: 'Federal Security Solutions',
          location: 'Washington, DC',
          clearanceLevel: 'TS/SCI',
          expertise: ['Cybersecurity', 'Risk Assessment', 'Incident Response'],
          bio: 'Experienced cybersecurity professional with expertise in federal environments.'
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          title: 'Cloud Architect',
          company: 'AWS Professional Services',
          location: 'Arlington, VA',
          clearanceLevel: 'SECRET',
          expertise: ['AWS', 'Cloud Architecture', 'DevOps'],
          bio: 'AWS certified architect specializing in federal cloud migrations.'
        },
        {
          id: '3',
          name: 'Jennifer Park',
          title: 'Project Manager',
          company: 'Booz Allen Hamilton',
          location: 'McLean, VA',
          clearanceLevel: 'TOP SECRET',
          expertise: ['Project Management', 'Agile', 'PMI Certified'],
          bio: 'PMP certified project manager with experience in large-scale federal projects.'
        }
      ]

      networkMembers.forEach(member => {
        const relevance = calculateMemberRelevance(member, searchQuery)
        if (relevance > 0) {
          results.push({
            id: member.id,
            type: 'member',
            title: member.name,
            description: `${member.title} at ${member.company}`,
            url: '/networking',
            metadata: {
              title: member.title,
              company: member.company,
              location: member.location,
              clearanceLevel: member.clearanceLevel,
              expertise: member.expertise
            },
            relevanceScore: relevance
          })
        }
      })
    }

    // Search Companies (derived from jobs data)
    if (!type || type === 'company') {
      const companies = new Map()
      
      // Get unique companies from jobs
      const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jobs?limit=100`)
      if (jobResponse.ok) {
        const jobData = await jobResponse.json()
        if (jobData.success) {
          jobData.data.jobs.forEach((job: any) => {
            if (!companies.has(job.company)) {
              companies.set(job.company, {
                name: job.company,
                jobCount: 1,
                locations: new Set([job.location]),
                clearanceLevels: new Set([job.clearance])
              })
            } else {
              const company = companies.get(job.company)
              company.jobCount++
              company.locations.add(job.location)
              company.clearanceLevels.add(job.clearance)
            }
          })
        }
      }

      companies.forEach((companyData, companyName) => {
        if (companyName.toLowerCase().includes(searchQuery)) {
          const relevance = companyName.toLowerCase().indexOf(searchQuery) === 0 ? 1.0 : 0.7
          results.push({
            id: companyName.replace(/\s+/g, '-').toLowerCase(),
            type: 'company',
            title: companyName,
            description: `${companyData.jobCount} open positions • ${Array.from(companyData.locations).slice(0, 2).join(', ')}`,
            url: `/jobs?company=${encodeURIComponent(companyName)}`,
            metadata: {
              jobCount: companyData.jobCount,
              locations: Array.from(companyData.locations),
              clearanceLevels: Array.from(companyData.clearanceLevels)
            },
            relevanceScore: relevance
          })
        }
      })
    }

    // Sort by relevance score and limit results
    const sortedResults = results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    // Group results by type for better organization
    const groupedResults = {
      jobs: sortedResults.filter(r => r.type === 'job'),
      resources: sortedResults.filter(r => r.type === 'resource'),
      certifications: sortedResults.filter(r => r.type === 'certification'),
      members: sortedResults.filter(r => r.type === 'member'),
      companies: sortedResults.filter(r => r.type === 'company')
    }

    return NextResponse.json({
      success: true,
      data: {
        query: searchQuery,
        totalResults: sortedResults.length,
        results: sortedResults,
        groupedResults,
        stats: {
          jobs: groupedResults.jobs.length,
          resources: groupedResults.resources.length,
          certifications: groupedResults.certifications.length,
          members: groupedResults.members.length,
          companies: groupedResults.companies.length
        }
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateJobRelevance(job: any, query: string): number {
  let score = 0
  const q = query.toLowerCase()

  // Title match (highest weight)
  if (job.title.toLowerCase().includes(q)) {
    score += job.title.toLowerCase().indexOf(q) === 0 ? 1.0 : 0.8
  }

  // Company match
  if (job.company.toLowerCase().includes(q)) {
    score += 0.6
  }

  // Skills match
  const skillMatches = job.skills.filter((skill: string) => 
    skill.toLowerCase().includes(q)
  ).length
  score += skillMatches * 0.4

  // Description match
  if (job.description.toLowerCase().includes(q)) {
    score += 0.3
  }

  // Location match
  if (job.location.toLowerCase().includes(q)) {
    score += 0.2
  }

  return Math.min(score, 1.0)
}

function calculateCertificationRelevance(cert: any, query: string): number {
  let score = 0
  const q = query.toLowerCase()

  // Name match (highest weight)
  if (cert.name.toLowerCase().includes(q)) {
    score += cert.name.toLowerCase().indexOf(q) === 0 ? 1.0 : 0.8
  }

  // Issuer match
  if (cert.issuer.toLowerCase().includes(q)) {
    score += 0.6
  }

  // Category match
  if (cert.category.toLowerCase().includes(q)) {
    score += 0.4
  }

  return Math.min(score, 1.0)
}

function calculateResourceRelevance(resource: any, query: string): number {
  let score = 0
  const q = query.toLowerCase()

  // Title match (highest weight)
  if (resource.title.toLowerCase().includes(q)) {
    score += resource.title.toLowerCase().indexOf(q) === 0 ? 1.0 : 0.8
  }

  // Description match
  if (resource.description.toLowerCase().includes(q)) {
    score += 0.6
  }

  // Category match
  if (resource.category.toLowerCase().includes(q)) {
    score += 0.4
  }

  return Math.min(score, 1.0)
}

function calculateMemberRelevance(member: any, query: string): number {
  let score = 0
  const q = query.toLowerCase()

  // Name match (highest weight)
  if (member.name.toLowerCase().includes(q)) {
    score += member.name.toLowerCase().indexOf(q) === 0 ? 1.0 : 0.8
  }

  // Title match
  if (member.title.toLowerCase().includes(q)) {
    score += 0.7
  }

  // Company match
  if (member.company.toLowerCase().includes(q)) {
    score += 0.6
  }

  // Expertise match
  const expertiseMatches = member.expertise.filter((skill: string) => 
    skill.toLowerCase().includes(q)
  ).length
  score += expertiseMatches * 0.5

  // Location match
  if (member.location.toLowerCase().includes(q)) {
    score += 0.3
  }

  return Math.min(score, 1.0)
}