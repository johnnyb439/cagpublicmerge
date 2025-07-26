import { NextRequest, NextResponse } from 'next/server'

export interface JobMatchResult {
  id: string
  jobId: string
  title: string
  company: string
  location: string
  clearanceRequired: string
  salary?: string
  matchPercentage: number
  matchReasons: string[]
  improvementTips: string[]
  keywordMatches: string[]
  missingKeywords: string[]
  jobUrl: string
  datePosted: string
  applicationDeadline?: string
  description: string
  requirements: string[]
  preferredSkills: string[]
}

// Mock job database
const mockJobs = [
  {
    id: 'job1',
    title: 'Senior Cloud Engineer',
    company: 'Booz Allen Hamilton',
    location: 'McLean, VA',
    clearanceRequired: 'TS/SCI',
    salary: '$150,000 - $180,000',
    description: 'Lead cloud infrastructure design and implementation for government clients.',
    requirements: ['TS/SCI clearance', '5+ years cloud experience', 'AWS certification', 'Docker', 'Kubernetes'],
    preferredSkills: ['Terraform', 'Jenkins', 'Python', 'Agile'],
    datePosted: '2024-01-20',
    applicationDeadline: '2024-02-20'
  },
  {
    id: 'job2',
    title: 'DevOps Engineer',
    company: 'Raytheon',
    location: 'Arlington, VA',
    clearanceRequired: 'Secret',
    salary: '$130,000 - $160,000',
    description: 'Automate deployment pipelines and manage containerized applications.',
    requirements: ['Secret clearance', 'CI/CD experience', 'Docker', 'Git'],
    preferredSkills: ['Jenkins', 'GitLab CI', 'Kubernetes', 'AWS'],
    datePosted: '2024-01-18',
    applicationDeadline: '2024-02-15'
  },
  {
    id: 'job3',
    title: 'Full Stack Developer',
    company: 'CACI',
    location: 'Chantilly, VA',
    clearanceRequired: 'TS/SCI',
    salary: '$140,000 - $170,000',
    description: 'Develop modern web applications for intelligence community.',
    requirements: ['TS/SCI clearance', 'React', 'Node.js', 'SQL databases'],
    preferredSkills: ['TypeScript', 'GraphQL', 'AWS', 'Agile'],
    datePosted: '2024-01-15',
    applicationDeadline: '2024-02-10'
  },
  {
    id: 'job4',
    title: 'Cybersecurity Analyst',
    company: 'General Dynamics',
    location: 'Falls Church, VA',
    clearanceRequired: 'TS/SCI with Poly',
    salary: '$160,000 - $190,000',
    description: 'Analyze security threats and implement defensive measures.',
    requirements: ['TS/SCI with Poly', 'Security+', 'SIEM tools', 'Incident response'],
    preferredSkills: ['CISSP', 'Splunk', 'Python', 'Risk assessment'],
    datePosted: '2024-01-12',
    applicationDeadline: '2024-02-05'
  },
  {
    id: 'job5',
    title: 'Data Engineer',
    company: 'Lockheed Martin',
    location: 'Bethesda, MD',
    clearanceRequired: 'Secret',
    salary: '$135,000 - $165,000',
    description: 'Build and maintain data pipelines for analytics platforms.',
    requirements: ['Secret clearance', 'Python', 'SQL', 'ETL processes'],
    preferredSkills: ['Spark', 'Kafka', 'AWS', 'Machine learning'],
    datePosted: '2024-01-10'
  }
]

// POST /api/jobs/match - Find matching jobs based on user profile/resume
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract user data for matching
    const userSkills = body.skills || []
    const userClearance = body.clearanceLevel || ''
    const userLocation = body.location || ''
    const userExperience = body.yearsExperience || 0
    const resumeKeywords = body.resumeKeywords || []
    const preferences = body.preferences || {}

    // Combine all user keywords
    const allUserKeywords = [...userSkills, ...resumeKeywords].map(k => k.toLowerCase())

    const jobMatches: JobMatchResult[] = mockJobs.map(job => {
      let matchScore = 0
      const matchReasons: string[] = []
      const improvementTips: string[] = []
      const keywordMatches: string[] = []
      const missingKeywords: string[] = []

      // Clearance matching (40% weight)
      if (isCompatibleClearance(userClearance, job.clearanceRequired)) {
        matchScore += 40
        matchReasons.push(`Clearance compatible (${job.clearanceRequired})`)
      } else {
        matchScore -= 20
        improvementTips.push(`Obtain ${job.clearanceRequired} clearance for this role`)
      }

      // Skills matching (35% weight)
      const jobKeywords = [...job.requirements, ...job.preferredSkills].map(k => k.toLowerCase())
      let skillMatches = 0
      let totalSkills = jobKeywords.length

      jobKeywords.forEach(jobKeyword => {
        const matches = allUserKeywords.some(userKeyword => 
          userKeyword.includes(jobKeyword) || jobKeyword.includes(userKeyword)
        )
        if (matches) {
          skillMatches++
          keywordMatches.push(jobKeyword)
        } else {
          missingKeywords.push(jobKeyword)
        }
      })

      const skillMatchPercent = totalSkills > 0 ? (skillMatches / totalSkills) * 35 : 0
      matchScore += skillMatchPercent

      if (skillMatchPercent > 25) {
        matchReasons.push(`Strong skill alignment (${Math.round((skillMatches / totalSkills) * 100)}%)`)
      }

      // Location matching (15% weight)
      if (userLocation && isLocationMatch(userLocation, job.location)) {
        matchScore += 15
        matchReasons.push('Location preference match')
      } else if (preferences.remoteWork) {
        matchScore += 10
        matchReasons.push('Remote work preference considered')
      }

      // Experience matching (10% weight)
      if (userExperience >= getRequiredExperience(job.title)) {
        matchScore += 10
        matchReasons.push('Experience requirements met')
      } else {
        improvementTips.push('Gain more relevant experience for senior roles')
      }

      // Add specific improvement tips based on missing keywords
      if (missingKeywords.length > 0) {
        const topMissing = missingKeywords.slice(0, 3)
        improvementTips.push(`Consider adding these skills: ${topMissing.join(', ')}`)
      }

      // Ensure score is between 0 and 100
      matchScore = Math.max(0, Math.min(100, matchScore))

      return {
        id: `match_${job.id}`,
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        clearanceRequired: job.clearanceRequired,
        salary: job.salary,
        matchPercentage: Math.round(matchScore),
        matchReasons,
        improvementTips,
        keywordMatches,
        missingKeywords,
        jobUrl: `/jobs/${job.id}`,
        datePosted: job.datePosted,
        applicationDeadline: job.applicationDeadline,
        description: job.description,
        requirements: job.requirements,
        preferredSkills: job.preferredSkills
      }
    })

    // Sort by match percentage and filter based on preferences
    const minMatchThreshold = body.minMatch || 50
    const filteredMatches = jobMatches
      .filter(match => match.matchPercentage >= minMatchThreshold)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)

    // Limit results
    const limit = body.limit || 10
    const topMatches = filteredMatches.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: topMatches,
      total: filteredMatches.length,
      searchCriteria: {
        minMatch: minMatchThreshold,
        userSkills: userSkills.length,
        clearanceLevel: userClearance,
        location: userLocation
      }
    })
  } catch (error) {
    console.error('Error matching jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to match jobs' },
      { status: 500 }
    )
  }
}

// Helper functions
function isCompatibleClearance(userClearance: string, jobClearance: string): boolean {
  const clearanceLevels = {
    'Public Trust': 1,
    'Secret': 2,
    'TS/SCI': 3,
    'TS/SCI with Poly': 4
  }

  const userLevel = clearanceLevels[userClearance as keyof typeof clearanceLevels] || 0
  const jobLevel = clearanceLevels[jobClearance as keyof typeof clearanceLevels] || 0

  return userLevel >= jobLevel
}

function isLocationMatch(userLocation: string, jobLocation: string): boolean {
  // Simple location matching - can be enhanced with geocoding
  const userArea = userLocation.toLowerCase()
  const jobArea = jobLocation.toLowerCase()
  
  // Check for common area matches
  const dmvAreas = ['washington', 'virginia', 'maryland', 'dc', 'arlington', 'alexandria', 'bethesda', 'mclean']
  
  const userInDMV = dmvAreas.some(area => userArea.includes(area))
  const jobInDMV = dmvAreas.some(area => jobArea.includes(area))
  
  return userInDMV && jobInDMV
}

function getRequiredExperience(jobTitle: string): number {
  const title = jobTitle.toLowerCase()
  if (title.includes('senior') || title.includes('lead')) return 5
  if (title.includes('principal') || title.includes('architect')) return 8
  if (title.includes('junior') || title.includes('entry')) return 0
  return 3 // Default mid-level
}

// GET /api/jobs/match - Get saved job matches for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1'
    
    // In production, fetch saved matches from database
    const savedMatches = [
      {
        id: 'saved_1',
        userId,
        jobId: 'job1',
        matchPercentage: 92,
        savedAt: '2024-01-20',
        notes: 'Great fit for cloud experience'
      }
    ]

    return NextResponse.json({
      success: true,
      data: savedMatches
    })
  } catch (error) {
    console.error('Error fetching saved matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved matches' },
      { status: 500 }
    )
  }
}