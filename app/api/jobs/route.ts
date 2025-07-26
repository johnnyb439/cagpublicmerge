import { NextRequest, NextResponse } from 'next/server'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  clearance: string
  salary: string
  salaryMin?: number
  salaryMax?: number
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Contract-to-Hire'
  posted: string
  description: string
  requirements: string[]
  skills: string[]
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive'
  remote: boolean
  polygraph: boolean
  certifications: string[]
  benefits: string[]
  companySize: string
  industry: string
  applicationDeadline?: string
  jobUrl?: string
  contactEmail?: string
  views: number
  applications: number
}

// Mock job database with more realistic data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Network Administrator',
    company: 'Lockheed Martin',
    location: 'Arlington, VA',
    clearance: 'SECRET',
    salary: '$95,000 - $125,000',
    salaryMin: 95000,
    salaryMax: 125000,
    type: 'Full-time',
    posted: '2024-01-20',
    description: 'Lead network infrastructure initiatives for defense contracts. Manage complex network architectures and ensure security compliance.',
    requirements: [
      'Active SECRET clearance',
      '5+ years network administration experience',
      'CCNA or higher certification',
      'Experience with DoD networks'
    ],
    skills: ['Cisco', 'Palo Alto', 'TCP/IP', 'VPN', 'Firewall Management', 'Network Security'],
    experienceLevel: 'Senior Level',
    remote: false,
    polygraph: false,
    certifications: ['CCNA', 'Security+'],
    benefits: ['Health Insurance', '401k Match', 'Clearance Sponsorship', 'Tuition Reimbursement'],
    companySize: '10,000+ employees',
    industry: 'Defense',
    views: 342,
    applications: 28
  },
  {
    id: '2',
    title: 'Cloud Solutions Architect',
    company: 'Amazon Web Services',
    location: 'Herndon, VA',
    clearance: 'TS/SCI',
    salary: '$140,000 - $180,000',
    salaryMin: 140000,
    salaryMax: 180000,
    type: 'Full-time',
    posted: '2024-01-18',
    description: 'Design and implement cloud solutions for intelligence community clients using AWS GovCloud.',
    requirements: [
      'Active TS/SCI clearance',
      'AWS Solutions Architect certification',
      '7+ years cloud architecture experience',
      'Experience with FedRAMP compliance'
    ],
    skills: ['AWS', 'Terraform', 'Kubernetes', 'Python', 'DevOps', 'Cloud Security'],
    experienceLevel: 'Senior Level',
    remote: true,
    polygraph: true,
    certifications: ['AWS Solutions Architect', 'AWS Security Specialty'],
    benefits: ['Stock Options', 'Remote Work', 'Health Insurance', '401k'],
    companySize: '1,000-5,000 employees',
    industry: 'Cloud Services',
    views: 567,
    applications: 45
  },
  {
    id: '3',
    title: 'Junior Cybersecurity Analyst',
    company: 'Booz Allen Hamilton',
    location: 'Fort Meade, MD',
    clearance: 'SECRET',
    salary: '$75,000 - $95,000',
    salaryMin: 75000,
    salaryMax: 95000,
    type: 'Full-time',
    posted: '2024-01-22',
    description: 'Support SOC operations and incident response for federal clients. Great opportunity for career growth.',
    requirements: [
      'Active SECRET clearance (or ability to obtain)',
      'Security+ certification',
      '1-3 years security experience',
      'Bachelor\'s degree in IT or related field'
    ],
    skills: ['SIEM', 'Incident Response', 'Network Security', 'Splunk', 'Python'],
    experienceLevel: 'Entry Level',
    remote: false,
    polygraph: false,
    certifications: ['Security+'],
    benefits: ['Clearance Sponsorship', 'Training Budget', 'Health Insurance', 'Mentorship Program'],
    companySize: '10,000+ employees',
    industry: 'Consulting',
    views: 892,
    applications: 67
  },
  {
    id: '4',
    title: 'DevSecOps Engineer',
    company: 'Raytheon Technologies',
    location: 'Colorado Springs, CO',
    clearance: 'TS',
    salary: '$120,000 - $150,000',
    salaryMin: 120000,
    salaryMax: 150000,
    type: 'Full-time',
    posted: '2024-01-19',
    description: 'Implement secure CI/CD pipelines for space and missile defense programs.',
    requirements: [
      'Active TS clearance',
      '5+ years DevOps experience',
      'Experience with secure development practices',
      'Kubernetes and Docker expertise'
    ],
    skills: ['Jenkins', 'GitLab CI', 'Kubernetes', 'Docker', 'Ansible', 'Security Scanning'],
    experienceLevel: 'Mid Level',
    remote: false,
    polygraph: false,
    certifications: ['CKA', 'Security+'],
    benefits: ['Relocation Assistance', 'Flexible Schedule', 'Health Insurance', '401k Match'],
    companySize: '10,000+ employees',
    industry: 'Defense',
    views: 453,
    applications: 31
  },
  {
    id: '5',
    title: 'IT Project Manager',
    company: 'CACI International',
    location: 'Chantilly, VA',
    clearance: 'TS/SCI',
    salary: '$130,000 - $160,000',
    salaryMin: 130000,
    salaryMax: 160000,
    type: 'Full-time',
    posted: '2024-01-21',
    description: 'Lead IT modernization projects for intelligence community clients.',
    requirements: [
      'Active TS/SCI clearance with Poly',
      'PMP certification',
      '7+ years IT project management',
      'Agile/Scrum experience'
    ],
    skills: ['Project Management', 'Agile', 'Scrum', 'Risk Management', 'Stakeholder Management'],
    experienceLevel: 'Senior Level',
    remote: false,
    polygraph: true,
    certifications: ['PMP', 'Agile'],
    benefits: ['Performance Bonus', 'Executive Training', 'Health Insurance', '401k'],
    companySize: '10,000+ employees',
    industry: 'Defense',
    views: 234,
    applications: 19
  },
  {
    id: '6',
    title: 'Database Administrator',
    company: 'General Dynamics IT',
    location: 'Falls Church, VA',
    clearance: 'SECRET',
    salary: '$100,000 - $130,000',
    salaryMin: 100000,
    salaryMax: 130000,
    type: 'Full-time',
    posted: '2024-01-17',
    description: 'Maintain and optimize Oracle and PostgreSQL databases for DoD systems.',
    requirements: [
      'Active SECRET clearance',
      '5+ years DBA experience',
      'Oracle certification preferred',
      'Experience with database security'
    ],
    skills: ['Oracle', 'PostgreSQL', 'SQL', 'Performance Tuning', 'Backup/Recovery', 'Database Security'],
    experienceLevel: 'Mid Level',
    remote: true,
    polygraph: false,
    certifications: ['Oracle DBA'],
    benefits: ['Remote Work', 'Health Insurance', '401k', 'Professional Development'],
    companySize: '10,000+ employees',
    industry: 'IT Services',
    views: 178,
    applications: 12
  },
  {
    id: '7',
    title: 'Systems Engineer',
    company: 'Northrop Grumman',
    location: 'Redondo Beach, CA',
    clearance: 'TS',
    salary: '$115,000 - $145,000',
    salaryMin: 115000,
    salaryMax: 145000,
    type: 'Full-time',
    posted: '2024-01-16',
    description: 'Design and implement systems for satellite ground operations.',
    requirements: [
      'Active TS clearance',
      'Systems engineering experience',
      'Linux administration skills',
      'Satellite systems knowledge preferred'
    ],
    skills: ['Linux', 'Systems Architecture', 'Satellite Systems', 'Python', 'Bash Scripting'],
    experienceLevel: 'Mid Level',
    remote: false,
    polygraph: false,
    certifications: ['Linux+', 'Security+'],
    benefits: ['Relocation Package', 'Stock Options', 'Health Insurance', 'Flexible Hours'],
    companySize: '10,000+ employees',
    industry: 'Aerospace',
    views: 298,
    applications: 23
  },
  {
    id: '8',
    title: 'Help Desk Technician II',
    company: 'SAIC',
    location: 'Quantico, VA',
    clearance: 'SECRET',
    salary: '$55,000 - $70,000',
    salaryMin: 55000,
    salaryMax: 70000,
    type: 'Contract',
    posted: '2024-01-23',
    description: 'Provide Tier 2 support for Marine Corps IT systems.',
    requirements: [
      'Active SECRET clearance',
      'CompTIA A+ certification',
      '2+ years help desk experience',
      'Customer service skills'
    ],
    skills: ['Windows 10', 'Active Directory', 'Help Desk', 'Ticketing Systems', 'Customer Service'],
    experienceLevel: 'Entry Level',
    remote: false,
    polygraph: false,
    certifications: ['A+', 'Security+'],
    benefits: ['Health Insurance', 'Clearance Maintenance'],
    companySize: '10,000+ employees',
    industry: 'Defense',
    views: 534,
    applications: 42
  }
]

// GET /api/jobs - Get filtered jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const clearance = searchParams.get('clearance') || ''
    const salaryMin = parseInt(searchParams.get('salaryMin') || '0')
    const salaryMax = parseInt(searchParams.get('salaryMax') || '500000')
    const experienceLevel = searchParams.getAll('experienceLevel')
    const jobType = searchParams.getAll('jobType')
    const skills = searchParams.getAll('skills')
    const remote = searchParams.get('remote') === 'true'
    const polygraph = searchParams.get('polygraph') === 'true'
    const certifications = searchParams.getAll('certifications')
    const postedWithin = searchParams.get('postedWithin')
    const sortBy = searchParams.get('sortBy') || 'posted'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Filter jobs
    let filteredJobs = [...mockJobs]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      )
    }

    // Location filter
    if (location) {
      const locationLower = location.toLowerCase()
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower) ||
        (job.remote && locationLower.includes('remote'))
      )
    }

    // Clearance filter
    if (clearance) {
      filteredJobs = filteredJobs.filter(job => job.clearance === clearance)
    }

    // Salary filter
    filteredJobs = filteredJobs.filter(job => 
      (job.salaryMin || 0) >= salaryMin && (job.salaryMax || 999999) <= salaryMax
    )

    // Experience level filter
    if (experienceLevel.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        experienceLevel.includes(job.experienceLevel)
      )
    }

    // Job type filter
    if (jobType.length > 0) {
      filteredJobs = filteredJobs.filter(job => jobType.includes(job.type))
    }

    // Skills filter
    if (skills.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        skills.some(skill => 
          job.skills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      )
    }

    // Remote filter
    if (remote) {
      filteredJobs = filteredJobs.filter(job => job.remote)
    }

    // Polygraph filter
    if (polygraph) {
      filteredJobs = filteredJobs.filter(job => job.polygraph)
    }

    // Certifications filter
    if (certifications.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        certifications.some(cert => 
          job.certifications.some(jobCert => 
            jobCert.toLowerCase().includes(cert.toLowerCase())
          )
        )
      )
    }

    // Posted within filter
    if (postedWithin) {
      const now = new Date()
      const daysMap: Record<string, number> = {
        '24h': 1,
        '3d': 3,
        '7d': 7,
        '14d': 14,
        '30d': 30
      }
      const days = daysMap[postedWithin] || 30
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      
      filteredJobs = filteredJobs.filter(job => 
        new Date(job.posted) >= cutoffDate
      )
    }

    // Sort jobs
    switch (sortBy) {
      case 'salary':
        filteredJobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0))
        break
      case 'company':
        filteredJobs.sort((a, b) => a.company.localeCompare(b.company))
        break
      case 'relevance':
        // Simple relevance based on search term matches
        if (search) {
          filteredJobs.sort((a, b) => {
            const searchLower = search.toLowerCase()
            const aScore = (a.title.toLowerCase().includes(searchLower) ? 3 : 0) +
                          (a.skills.some(s => s.toLowerCase().includes(searchLower)) ? 2 : 0) +
                          (a.description.toLowerCase().includes(searchLower) ? 1 : 0)
            const bScore = (b.title.toLowerCase().includes(searchLower) ? 3 : 0) +
                          (b.skills.some(s => s.toLowerCase().includes(searchLower)) ? 2 : 0) +
                          (b.description.toLowerCase().includes(searchLower) ? 1 : 0)
            return bScore - aScore
          })
        }
        break
      case 'posted':
      default:
        filteredJobs.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime())
    }

    // Pagination
    const total = filteredJobs.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

    // Get aggregations for filters
    const aggregations = {
      clearanceLevels: Array.from(new Set(mockJobs.map(j => j.clearance))).map(clearance => ({
        value: clearance,
        count: mockJobs.filter(j => j.clearance === clearance).length
      })),
      experienceLevels: Array.from(new Set(mockJobs.map(j => j.experienceLevel))).map(level => ({
        value: level,
        count: mockJobs.filter(j => j.experienceLevel === level).length
      })),
      jobTypes: Array.from(new Set(mockJobs.map(j => j.type))).map(type => ({
        value: type,
        count: mockJobs.filter(j => j.type === type).length
      })),
      companies: Array.from(new Set(mockJobs.map(j => j.company))).map(company => ({
        value: company,
        count: mockJobs.filter(j => j.company === company).length
      })),
      locations: Array.from(new Set(mockJobs.map(j => j.location))).map(location => ({
        value: location,
        count: mockJobs.filter(j => j.location === location).length
      }))
    }

    return NextResponse.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      aggregations,
      appliedFilters: {
        search,
        location,
        clearance,
        salaryMin,
        salaryMax,
        experienceLevel,
        jobType,
        skills,
        remote,
        polygraph,
        certifications,
        postedWithin,
        sortBy
      }
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create job alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In production, save job alert to database
    const jobAlert = {
      id: Date.now().toString(),
      userId: body.userId || '1',
      name: body.name,
      filters: body.filters,
      frequency: body.frequency || 'daily',
      email: body.email,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: jobAlert,
      message: 'Job alert created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create job alert' },
      { status: 500 }
    )
  }
}