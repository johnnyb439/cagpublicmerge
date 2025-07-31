import { NextResponse } from 'next/server'

// Expanded job details - in production this would come from a database
const jobDatabase = {
  1: {
    id: 1,
    title: "Network Administrator",
    company: "TechCorp Defense",
    location: "Arlington, VA",
    clearance: "SECRET",
    salary: "$85,000 - $105,000",
    type: "Full-time",
    posted: "2 days ago",
    description: "Seeking experienced Network Admin for DoD contract. Must have active SECRET clearance.",
    fullDescription: `We are seeking an experienced Network Administrator to join our team supporting a critical DoD contract in Arlington, VA. This role requires an active SECRET clearance and strong technical expertise in enterprise networking.

The ideal candidate will have experience with:
• Cisco routing and switching
• Network security best practices
• DoD network environments
• Troubleshooting complex network issues
• Documentation and change management`,
    requirements: [
      "Active SECRET clearance (required)",
      "Security+ certification (required)",
      "5+ years network administration experience",
      "Experience with Cisco IOS and NX-OS",
      "Knowledge of DoD STIGs and security requirements",
      "Bachelor's degree in IT or related field (or equivalent experience)"
    ],
    responsibilities: [
      "Monitor and maintain network infrastructure",
      "Implement security patches and updates",
      "Troubleshoot connectivity issues",
      "Document network configurations",
      "Support incident response activities",
      "Collaborate with security team on compliance"
    ],
    benefits: [
      "Competitive salary with annual reviews",
      "Comprehensive health insurance",
      "401(k) with 6% company match",
      "3 weeks PTO + federal holidays",
      "Professional development budget",
      "Security clearance maintenance support"
    ],
    companyInfo: {
      name: "TechCorp Defense",
      size: "500-1000 employees",
      industry: "Defense Contracting",
      about: "Leading provider of IT solutions to the Department of Defense with over 20 years of experience."
    }
  },
  // Add more detailed job entries as needed
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = parseInt(params.id)
  const job = jobDatabase[id as keyof typeof jobDatabase]
  
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(job)
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  // In production, this would update a job posting
  const body = await request.json()
  
  return NextResponse.json({
    success: true,
    message: 'Job updated successfully',
    id: params.id
  })
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  // In production, this would delete a job posting
  
  return NextResponse.json({
    success: true,
    message: 'Job deleted successfully',
    id: params.id
  })
}