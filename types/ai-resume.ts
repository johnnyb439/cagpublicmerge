export interface ResumeAnalysisRequest {
  content: string
  jobDescription?: string
  targetRole?: string
  experience?: string
  clearanceLevel?: string
}

export interface ATSScore {
  overall: number
  breakdown: {
    keywords: number
    formatting: number
    skills: number
    experience: number
    education: number
  }
  recommendations: string[]
}

export interface GrammarCheck {
  errors: {
    type: 'grammar' | 'spelling' | 'style' | 'punctuation'
    message: string
    position: {
      start: number
      end: number
    }
    suggestions: string[]
    severity: 'error' | 'warning' | 'suggestion'
  }[]
  overallScore: number
  wordCount: number
  readabilityScore: number
}

export interface KeywordAnalysis {
  missing: string[]
  present: string[]
  suggestions: {
    keyword: string
    importance: number
    context: string
    replacements?: string[]
  }[]
  density: Record<string, number>
}

export interface ContentAnalysis {
  sections: {
    name: string
    present: boolean
    quality: number
    suggestions: string[]
  }[]
  achievements: {
    count: number
    hasQuantifiableResults: boolean
    suggestions: string[]
  }
  skills: {
    technical: string[]
    soft: string[]
    missing: string[]
    suggestions: string[]
  }
  experience: {
    totalYears: number
    relevantYears: number
    progressionAnalysis: string
    suggestions: string[]
  }
  education: {
    present: boolean
    relevant: boolean
    suggestions: string[]
  }
  certifications: {
    present: string[]
    recommended: string[]
    expiring: string[]
  }
}

export interface ResumeAnalysisResult {
  atsScore: ATSScore
  grammarCheck: GrammarCheck
  keywordAnalysis: KeywordAnalysis
  contentAnalysis: ContentAnalysis
  overallRating: number
  priority: 'high' | 'medium' | 'low'
  estimatedImprovementTime: string
  actionItems: {
    priority: 'high' | 'medium' | 'low'
    category: 'content' | 'formatting' | 'keywords' | 'grammar'
    description: string
    impact: number
  }[]
}

export interface OptimizationSuggestion {
  type: 'add' | 'modify' | 'remove' | 'reorder'
  section: string
  original?: string
  suggested: string
  reason: string
  impact: number
  keywords?: string[]
}

export interface RealTimeOptimization {
  suggestions: OptimizationSuggestion[]
  keywordMatches: number
  atsCompatibility: number
  readabilityScore: number
  activeIssues: {
    grammar: number
    formatting: number
    content: number
  }
}

export interface JobMatchAnalysis {
  matchScore: number
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  keywordAlignment: {
    matched: string[]
    missing: string[]
    priority: Record<string, number>
  }
}