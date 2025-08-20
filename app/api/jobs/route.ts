import { NextResponse } from 'next/server'

// Sample job data - in production this would come from a database
const jobs = [
  {
    id: 1,
    title: "Network Administrator",
    company: "TechCorp Defense",
    location: "Arlington, VA",
    clearance: "SECRET",
    salary: "$85,000 - $105,000",
    type: "Full-time",
    posted: "2 days ago",
    description: "Seeking experienced Network Admin for DoD contract. Must have active SECRET clearance.",
    tier: "Tier 2"
  },
  {
    id: 2,
    title: "Help Desk Technician",
    company: "CyberShield Solutions",
    location: "Fort Meade, MD",
    clearance: "SECRET",
    salary: "$55,000 - $70,000",
    type: "Full-time",
    posted: "3 days ago",
    description: "Entry-level IT support position. Security+ preferred. Active clearance required.",
    tier: "Tier 1"
  },
  {
    id: 3,
    title: "Systems Administrator",
    company: "Federal Systems Inc",
    location: "Remote",
    clearance: "TS/SCI",
    salary: "$110,000 - $140,000",
    type: "Full-time",
    posted: "1 week ago",
    description: "Senior sys admin role supporting intelligence community. Polygraph required.",
    tier: "Tier 2"
  },
  {
    id: 4,
    title: "Cloud Engineer",
    company: "AWS Federal",
    location: "Herndon, VA",
    clearance: "SECRET",
    salary: "$120,000 - $150,000",
    type: "Full-time",
    posted: "4 days ago",
    description: "AWS cloud engineer supporting federal clients. Experience with GovCloud required.",
    tier: "Tier 2"
  },
  {
    id: 5,
    title: "Cybersecurity Analyst",
    company: "DefenseNet Corp",
    location: "Colorado Springs, CO",
    clearance: "TS",
    salary: "$95,000 - $125,000",
    type: "Full-time",
    posted: "1 day ago",
    description: "SOC analyst position supporting Space Force operations. CISSP preferred.",
    tier: "Tier 2"
  },
  {
    id: 6,
    title: "IT Support Specialist",
    company: "Military Tech Solutions",
    location: "San Antonio, TX",
    clearance: "SECRET",
    salary: "$50,000 - $65,000",
    type: "Full-time",
    posted: "5 days ago",
    description: "Supporting Air Force base operations. Great entry point for veterans.",
    tier: "Tier 1"
  },
  {
    id: 7,
    title: "Network Security Engineer",
    company: "Secure Federal Networks",
    location: "Quantico, VA",
    clearance: "TS",
    salary: "$105,000 - $135,000",
    type: "Full-time",
    posted: "1 week ago",
    description: "Design and implement secure networks for federal agencies.",
    tier: "Tier 2"
  },
  {
    id: 8,
    title: "Database Administrator",
    company: "Intel Systems Corp",
    location: "McLean, VA",
    clearance: "TS/SCI",
    salary: "$115,000 - $145,000",
    type: "Full-time",
    posted: "3 days ago",
    description: "Oracle and PostgreSQL DBA supporting intelligence systems.",
    tier: "Tier 2"
  },
  {
    id: 9,
    title: "Fiber Optic Technician",
    company: "Defense Communications Inc",
    location: "Norfolk, VA",
    clearance: "SECRET",
    salary: "$60,000 - $80,000",
    type: "Full-time",
    posted: "2 days ago",
    description: "Install and maintain fiber infrastructure on military installations.",
    tier: "Tier 1"
  },
  {
    id: 10,
    title: "DevOps Engineer",
    company: "Federal Cloud Systems",
    location: "Remote",
    clearance: "SECRET",
    salary: "$125,000 - $155,000",
    type: "Full-time",
    posted: "6 days ago",
    description: "CI/CD pipeline development for federal cloud environments.",
    tier: "Tier 2"
  }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Get query parameters
  const search = searchParams.get('search')?.toLowerCase() || ''
  const location = searchParams.get('location')?.toLowerCase() || ''
  const clearance = searchParams.get('clearance') || ''
  const tier = searchParams.get('tier') || ''
  
  // Filter jobs based on query parameters
  let filteredJobs = jobs
  
  if (search) {
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search) ||
      job.description.toLowerCase().includes(search)
    )
  }
  
  if (location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location)
    )
  }
  
  if (clearance) {
    filteredJobs = filteredJobs.filter(job => 
      job.clearance === clearance
    )
  }
  
  if (tier) {
    filteredJobs = filteredJobs.filter(job => 
      job.tier === tier
    )
  }
  
  return NextResponse.json({
    jobs: filteredJobs,
    total: filteredJobs.length
  })
}

export async function POST(request: Request) {
  // In production, this would create a new job posting
  // For now, return success response
  const body = await request.json()
  
  return NextResponse.json({
    success: true,
    message: 'Job posting created successfully',
    id: Math.floor(Math.random() * 1000)
  })
}