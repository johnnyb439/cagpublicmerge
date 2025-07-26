import { JobApplication } from '@/types/job-application'
import { Certification } from '@/app/api/certifications/route'
import { UserProfile } from '@/app/api/profile/route'

// Shared mock database - replace with actual database in production
export const mockDatabase = {
  applications: [
    {
      id: '1',
      jobId: 'job1',
      jobTitle: 'Senior Software Engineer',
      company: 'Lockheed Martin',
      location: 'Fort Meade, MD',
      salary: '$140,000 - $180,000',
      clearanceRequired: 'TS/SCI',
      dateApplied: '2024-01-15',
      status: 'interview_scheduled',
      notes: 'Great match for my skills. Emphasized cloud experience.',
      contactPerson: 'Sarah Johnson',
      contactEmail: 'sarah.johnson@lm.com',
      resumeVersion: 'v3_cloud_focused',
      coverLetter: true,
      referral: 'John Smith (former colleague)',
      interviews: [
        {
          id: '1',
          type: 'phone_screen',
          date: '2024-01-22',
          time: '2:00 PM EST',
          completed: true,
          outcome: 'passed',
          notes: 'Went well, discussed AWS experience'
        },
        {
          id: '2',
          type: 'technical',
          date: '2024-01-29',
          time: '10:00 AM EST',
          completed: false,
          interviewers: ['Mike Chen', 'Lisa Park']
        }
      ],
      documents: [],
      timeline: [
        { date: '2024-01-15', event: 'Application Submitted' },
        { date: '2024-01-18', event: 'Application Viewed' },
        { date: '2024-01-20', event: 'Phone Screen Scheduled' },
        { date: '2024-01-22', event: 'Phone Screen Completed', description: 'Positive feedback' }
      ],
      tags: ['cloud', 'aws', 'high-priority'],
      isFavorite: true,
      lastUpdated: '2024-01-22'
    },
    {
      id: '2',
      jobId: 'job2',
      jobTitle: 'DevOps Engineer',
      company: 'Raytheon',
      location: 'Arlington, VA',
      salary: '$130,000 - $160,000',
      clearanceRequired: 'Secret',
      dateApplied: '2024-01-10',
      status: 'applied',
      notes: 'Kubernetes experience is a plus',
      documents: [],
      interviews: [],
      timeline: [
        { date: '2024-01-10', event: 'Application Submitted' }
      ],
      tags: ['devops', 'kubernetes'],
      lastUpdated: '2024-01-10'
    }
  ] as JobApplication[],

  certifications: [
    {
      id: '1',
      userId: '1',
      name: 'CompTIA Security+',
      issuer: 'CompTIA',
      issueDate: '2023-06-15',
      expiryDate: '2026-06-15',
      credentialId: 'COMP001234567',
      category: 'security',
      status: 'active',
      verificationStatus: 'verified',
      documents: [],
      createdAt: '2023-06-15',
      updatedAt: '2023-06-15'
    },
    {
      id: '2',
      userId: '1',
      name: 'AWS Solutions Architect Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023-08-20',
      expiryDate: '2026-08-20',
      credentialId: 'AWS-SAA-12345',
      category: 'cloud',
      status: 'active',
      verificationStatus: 'verified',
      documents: [],
      createdAt: '2023-08-20',
      updatedAt: '2023-08-20'
    }
  ] as Certification[],

  userProfiles: [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 (555) 123-4567',
      location: 'Washington, DC',
      clearanceLevel: 'TS/SCI',
      yearsExperience: 8,
      currentTitle: 'Senior Software Engineer',
      currentCompany: 'TechCorp',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      bio: 'Experienced software engineer specializing in cloud architecture and security.',
      skills: ['AWS', 'React', 'Node.js', 'Python', 'Docker', 'Kubernetes'],
      preferences: {
        jobAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        weeklyDigest: true,
        marketingEmails: false,
        jobTypes: ['full-time', 'contract'],
        salaryRange: { min: 120000, max: 180000 },
        locations: ['Washington, DC', 'Northern Virginia', 'Remote'],
        clearanceLevels: ['Secret', 'TS/SCI'],
        remoteWork: true
      },
      privacy: {
        profileVisibility: 'cleared-only',
        showEmail: false,
        showPhone: false,
        showLocation: true,
        allowRecruiterContact: true
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    }
  ] as UserProfile[]
}