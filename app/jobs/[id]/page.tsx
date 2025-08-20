'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Shield, 
  DollarSign, 
  Calendar, 
  Building,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

// This would come from your API in production
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
    ]
  },
  2: {
    id: 2,
    title: "Help Desk Technician",
    company: "CyberShield Solutions",
    location: "Fort Meade, MD",
    clearance: "SECRET",
    salary: "$55,000 - $70,000",
    type: "Full-time",
    posted: "3 days ago",
    description: "Entry-level IT support position. Security+ preferred. Active clearance required.",
    fullDescription: `Join our growing team as a Help Desk Technician supporting critical government operations at Fort Meade. This is an excellent opportunity for someone beginning their cleared IT career.

Perfect for:
• Recent military veterans transitioning to civilian IT
• Entry-level professionals with active clearances
• Those seeking stable government contract work`,
    requirements: [
      "Active SECRET clearance (required)",
      "CompTIA A+ certification (preferred)",
      "Security+ certification (obtain within 6 months)",
      "Customer service experience",
      "Basic knowledge of Windows 10/11",
      "Ability to work in a fast-paced environment"
    ],
    responsibilities: [
      "Provide Tier 1 technical support",
      "Reset passwords and manage user accounts",
      "Install and configure software",
      "Document all support tickets",
      "Escalate complex issues appropriately",
      "Maintain professional customer service"
    ],
    benefits: [
      "Clear career progression path",
      "Paid training and certifications",
      "Health, dental, and vision insurance",
      "401(k) with company match",
      "On-site gym access",
      "Mentorship program"
    ]
  },
  3: {
    id: 3,
    title: "Systems Administrator",
    company: "Federal Systems Inc",
    location: "Remote",
    clearance: "TS/SCI",
    salary: "$110,000 - $140,000",
    type: "Full-time",
    posted: "1 week ago",
    description: "Senior sys admin role supporting intelligence community. Polygraph required.",
    fullDescription: `We're seeking a Senior Systems Administrator for a fully remote position supporting the intelligence community. This role requires TS/SCI clearance with polygraph and offers excellent compensation for the right candidate.

This is a 100% remote position with occasional travel to secure facilities for briefings (less than 10%).`,
    requirements: [
      "Active TS/SCI clearance with current polygraph",
      "10+ years systems administration experience",
      "Expert knowledge of Linux (RHEL/CentOS)",
      "Experience with VMware vSphere",
      "Scripting skills (Python, Bash, PowerShell)",
      "Experience with classified networks"
    ],
    responsibilities: [
      "Manage enterprise Linux infrastructure",
      "Automate routine tasks with scripts",
      "Maintain security compliance",
      "Perform system hardening per STIGs",
      "Support disaster recovery planning",
      "Mentor junior administrators"
    ],
    benefits: [
      "Top-tier salary range",
      "100% remote work",
      "Premium health insurance (100% covered)",
      "6% 401(k) match, immediate vesting",
      "4 weeks PTO + federal holidays",
      "$5,000 annual training budget"
    ]
  },
  4: {
    id: 4,
    title: "Cloud Engineer",
    company: "AWS Federal",
    location: "Herndon, VA",
    clearance: "SECRET",
    salary: "$120,000 - $150,000",
    type: "Full-time",
    posted: "4 days ago",
    description: "AWS cloud engineer supporting federal clients. Experience with GovCloud required.",
    fullDescription: `Amazon Web Services is seeking a Cloud Engineer to support our federal government clients. You'll work with cutting-edge cloud technologies while maintaining the security standards required for government workloads.

Join the leader in cloud computing and help government agencies modernize their infrastructure.`,
    requirements: [
      "Active SECRET clearance (TS preferred)",
      "AWS Solutions Architect certification",
      "3+ years AWS experience",
      "Experience with AWS GovCloud",
      "Infrastructure as Code (Terraform/CloudFormation)",
      "Understanding of FedRAMP requirements"
    ],
    responsibilities: [
      "Design and implement cloud solutions",
      "Migrate workloads to AWS GovCloud",
      "Implement security best practices",
      "Optimize cloud costs",
      "Provide technical guidance to clients",
      "Create architecture documentation"
    ],
    benefits: [
      "Industry-leading compensation",
      "Amazon stock options",
      "Comprehensive benefits package",
      "Flexible work arrangements",
      "Access to AWS training and certifications",
      "Career growth opportunities"
    ]
  },
  5: {
    id: 5,
    title: "Cybersecurity Analyst",
    company: "DefenseNet Corp",
    location: "Colorado Springs, CO",
    clearance: "TS",
    salary: "$95,000 - $125,000",
    type: "Full-time",
    posted: "1 day ago",
    description: "SOC analyst position supporting Space Force operations. CISSP preferred.",
    fullDescription: `Join our Security Operations Center supporting critical Space Force missions. This role offers the unique opportunity to protect our nation's space assets while working with advanced security technologies.

Located in beautiful Colorado Springs with views of Pikes Peak and access to world-class outdoor recreation.`,
    requirements: [
      "Active TS clearance (SCI eligible)",
      "Security+ certification (required)",
      "CISSP or CCSP (preferred)",
      "3+ years SOC experience",
      "Experience with SIEM tools (Splunk preferred)",
      "Knowledge of threat hunting techniques"
    ],
    responsibilities: [
      "Monitor security events 24/7",
      "Investigate potential incidents",
      "Perform threat hunting activities",
      "Create and tune SIEM rules",
      "Document security incidents",
      "Brief leadership on threats"
    ],
    benefits: [
      "Competitive salary with shift differential",
      "Relocation assistance available",
      "Excellent work-life balance",
      "Health and wellness programs",
      "401(k) with generous match",
      "Beautiful Colorado location"
    ]
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const jobId = parseInt(params.id as string)
    const jobData = jobDatabase[jobId as keyof typeof jobDatabase]
    
    if (jobData) {
      setJob(jobData)
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dynamic-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-montserrat font-bold mb-4">Job Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">This job posting may have been removed or expired.</p>
          <Link href="/jobs" className="btn-primary">
            Back to Job Board
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-dynamic-green dark:hover:text-dynamic-green mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Jobs
        </motion.button>

        {/* Job Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-8 mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-montserrat font-bold mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 flex items-center">
                <Building size={20} className="mr-2" />
                {job.company}
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar size={16} className="mr-1" />
              Posted {job.posted}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <MapPin size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              {job.location}
            </div>
            <div className="flex items-center text-dynamic-green font-semibold">
              <Shield size={20} className="mr-2" />
              {job.clearance}
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <DollarSign size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              {job.salary}
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Clock size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
              {job.type}
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/contact"
              className="btn-primary flex-1 text-center"
            >
              Apply Now
            </Link>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Save Job
            </button>
          </div>
        </motion.div>

        {/* Job Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-8 mb-8"
        >
          <h2 className="text-2xl font-montserrat font-bold mb-4">About This Role</h2>
          <div className="prose max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {job.fullDescription}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-8 mb-8"
        >
          <h2 className="text-2xl font-montserrat font-bold mb-4">Requirements</h2>
          <ul className="space-y-3">
            {job.requirements.map((req: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircle size={20} className="text-dynamic-green mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{req}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Responsibilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-8 mb-8"
        >
          <h2 className="text-2xl font-montserrat font-bold mb-4">Responsibilities</h2>
          <ul className="space-y-3">
            {job.responsibilities.map((resp: string, index: number) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-dynamic-blue rounded-full mr-3 mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300">{resp}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white dark:bg-command-black rounded-lg shadow-md p-8 mb-8"
        >
          <h2 className="text-2xl font-montserrat font-bold mb-4">Benefits & Perks</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {job.benefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircle size={20} className="text-emerald-green mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Apply CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-gradient-to-r from-dynamic-green to-dynamic-blue rounded-lg p-8 text-white text-center"
        >
          <h2 className="text-2xl font-montserrat font-bold mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="mb-6">
            This position requires an active {job.clearance} clearance. Apply now to connect with our team.
          </p>
          <Link
            href="/contact"
            className="btn-primary bg-white dark:bg-gray-800 text-command-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 inline-block"
          >
            Apply for This Position
          </Link>
        </motion.div>
      </div>
    </section>
  )
}