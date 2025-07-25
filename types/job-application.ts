export type ApplicationStatus = 
  | 'applied'
  | 'screening'
  | 'interview_scheduled'
  | 'interviewing'
  | 'offer_received'
  | 'rejected'
  | 'withdrawn'
  | 'accepted'

export type InterviewType = 
  | 'phone_screen'
  | 'technical'
  | 'behavioral'
  | 'panel'
  | 'final'
  | 'other'

export interface Interview {
  id: string
  type: InterviewType
  date: string
  time: string
  location?: string
  interviewers?: string[]
  notes?: string
  completed: boolean
  outcome?: 'passed' | 'failed' | 'pending'
}

export interface JobApplication {
  id: string
  jobId: string
  jobTitle: string
  company: string
  location: string
  salary?: string
  clearanceRequired: string
  dateApplied: string
  status: ApplicationStatus
  notes?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  resumeVersion?: string
  coverLetter?: boolean
  referral?: string
  interviews: Interview[]
  documents: {
    name: string
    uploadDate: string
  }[]
  timeline: {
    date: string
    event: string
    description?: string
  }[]
  tags?: string[]
  isFavorite?: boolean
  lastUpdated: string
}

export interface ApplicationStats {
  total: number
  active: number
  interviews: number
  offers: number
  rejected: number
  responseRate: number
  avgTimeToResponse: number
  interviewConversionRate: number
}

export interface ApplicationFilters {
  status?: ApplicationStatus[]
  company?: string[]
  dateRange?: {
    start: string
    end: string
  }
  clearanceLevel?: string[]
  tags?: string[]
  searchQuery?: string
}