import { ATSScore, KeywordAnalysis } from '@/types/ai-resume'
import natural from 'natural'

export class ATSService {
  private stemmer = natural.PorterStemmer
  private tokenizer = new natural.WordTokenizer()

  async calculateATSScore(
    resumeContent: string,
    jobDescription?: string
  ): Promise<ATSScore> {
    try {
      const keywordScore = this.analyzeKeywords(resumeContent, jobDescription)
      const formattingScore = this.analyzeFormatting(resumeContent)
      const skillsScore = this.analyzeSkills(resumeContent)
      const experienceScore = this.analyzeExperience(resumeContent)
      const educationScore = this.analyzeEducation(resumeContent)

      const breakdown = {
        keywords: keywordScore,
        formatting: formattingScore,
        skills: skillsScore,
        experience: experienceScore,
        education: educationScore
      }

      const overall = this.calculateOverallScore(breakdown)
      const recommendations = this.generateRecommendations(breakdown, resumeContent)

      return {
        overall,
        breakdown,
        recommendations
      }
    } catch (error) {
      console.error('ATS scoring error:', error)
      return this.getFallbackATSScore()
    }
  }

  private analyzeKeywords(resumeContent: string, jobDescription?: string): number {
    if (!jobDescription) {
      return this.analyzeStandardKeywords(resumeContent)
    }

    // Extract keywords from job description
    const jobKeywords = this.extractKeywords(jobDescription)
    const resumeKeywords = this.extractKeywords(resumeContent)

    // Calculate keyword match percentage
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.some(resumeKeyword => 
        this.stemmer.stem(keyword.toLowerCase()) === this.stemmer.stem(resumeKeyword.toLowerCase()) ||
        keyword.toLowerCase().includes(resumeKeyword.toLowerCase()) ||
        resumeKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    )

    const matchPercentage = jobKeywords.length > 0 
      ? (matchedKeywords.length / jobKeywords.length) * 100 
      : 80

    return Math.min(100, matchPercentage)
  }

  private analyzeStandardKeywords(resumeContent: string): number {
    const standardKeywords = [
      // Technical Skills
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue.js',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      
      // Security & Clearance
      'security clearance', 'secret clearance', 'top secret', 'TS/SCI', 'polygraph',
      'cybersecurity', 'information security', 'network security', 'CISSP', 'Security+',
      'CISA', 'CISM', 'CEH', 'CompTIA', 'NIST', 'ISO 27001', 'FISMA',
      
      // Government/Defense
      'government', 'federal', 'defense', 'DoD', 'DHS', 'NSA', 'FBI', 'CIA',
      'contractor', 'prime contractor', 'subcontractor',
      
      // General IT
      'system administration', 'network administration', 'database administration',
      'project management', 'agile', 'scrum', 'ITIL', 'ServiceNow',
      'help desk', 'incident response', 'troubleshooting', 'monitoring'
    ]

    const foundKeywords = standardKeywords.filter(keyword =>
      resumeContent.toLowerCase().includes(keyword.toLowerCase())
    )

    return Math.min(100, (foundKeywords.length / standardKeywords.length) * 200)
  }

  private analyzeFormatting(resumeContent: string): number {
    let score = 100
    const issues = []

    // Check for standard sections
    const requiredSections = [
      { name: 'Professional Summary', patterns: ['summary', 'profile', 'objective'] },
      { name: 'Experience', patterns: ['experience', 'employment', 'work history'] },
      { name: 'Education', patterns: ['education', 'academic', 'degree'] },
      { name: 'Skills', patterns: ['skills', 'technical skills', 'competencies'] }
    ]

    requiredSections.forEach(section => {
      const hasSection = section.patterns.some(pattern =>
        resumeContent.toLowerCase().includes(pattern)
      )
      if (!hasSection) {
        score -= 10
        issues.push(`Missing ${section.name} section`)
      }
    })

    // Check for problematic formatting
    const formattingIssues = [
      { pattern: /\t+/g, penalty: 5, name: 'Tab characters detected' },
      { pattern: /  +/g, penalty: 2, name: 'Multiple spaces' },
      { pattern: /\n{3,}/g, penalty: 3, name: 'Excessive line breaks' },
      { pattern: /[^\x00-\x7F]/g, penalty: 1, name: 'Non-ASCII characters' }
    ]

    formattingIssues.forEach(issue => {
      const matches = resumeContent.match(issue.pattern)
      if (matches && matches.length > 3) {
        score -= issue.penalty
        issues.push(issue.name)
      }
    })

    // Check for contact information
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeContent)
    const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeContent)

    if (!hasEmail) {
      score -= 15
      issues.push('Missing email address')
    }
    if (!hasPhone) {
      score -= 10
      issues.push('Missing phone number')
    }

    return Math.max(0, score)
  }

  private analyzeSkills(resumeContent: string): number {
    const skillCategories = {
      programming: ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust'],
      frameworks: ['React', 'Angular', 'Vue.js', 'Express', 'Django', 'Flask', 'Spring', '.NET'],
      databases: ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server'],
      cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible'],
      security: ['CISSP', 'Security+', 'CISA', 'CISM', 'CEH', 'penetration testing', 'vulnerability assessment'],
      certifications: ['CompTIA', 'Cisco', 'Microsoft', 'Amazon', 'Google', 'PMI', 'ITIL']
    }

    let totalSkills = 0
    let foundSkills = 0

    Object.values(skillCategories).forEach(skills => {
      totalSkills += skills.length
      skills.forEach(skill => {
        if (resumeContent.toLowerCase().includes(skill.toLowerCase())) {
          foundSkills++
        }
      })
    })

    const skillsPercentage = totalSkills > 0 ? (foundSkills / totalSkills) * 100 : 0
    return Math.min(100, skillsPercentage * 2) // Boost the score as finding any skills is good
  }

  private analyzeExperience(resumeContent: string): number {
    let score = 0

    // Check for years of experience mentions
    const yearPatterns = [
      /(\d+)\+?\s*years?\s+of\s+experience/gi,
      /(\d+)\+?\s*years?\s+experience/gi,
      /experience\s*:\s*(\d+)\+?\s*years?/gi
    ]

    let maxYears = 0
    yearPatterns.forEach(pattern => {
      const matches = resumeContent.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const years = parseInt(match.match(/\d+/)?.[0] || '0')
          maxYears = Math.max(maxYears, years)
        })
      }
    })

    // Score based on years of experience
    if (maxYears >= 10) score += 40
    else if (maxYears >= 5) score += 30
    else if (maxYears >= 2) score += 20
    else score += 10

    // Check for job titles and progression
    const seniorityKeywords = [
      'senior', 'lead', 'principal', 'architect', 'manager', 'director',
      'chief', 'head of', 'team lead', 'technical lead'
    ]

    const hasSeniorRole = seniorityKeywords.some(keyword =>
      resumeContent.toLowerCase().includes(keyword)
    )

    if (hasSeniorRole) score += 20

    // Check for quantified achievements
    const quantifiedPatterns = [
      /\d+%/g, // percentages
      /\$[\d,]+/g, // dollar amounts
      /\d+[,\d]*\s+(users|customers|clients|systems|servers)/gi,
      /(increased|decreased|improved|reduced|saved|generated)\s+.*\d+/gi
    ]

    let quantifiedCount = 0
    quantifiedPatterns.forEach(pattern => {
      const matches = resumeContent.match(pattern)
      if (matches) quantifiedCount += matches.length
    })

    score += Math.min(40, quantifiedCount * 5)

    return Math.min(100, score)
  }

  private analyzeEducation(resumeContent: string): number {
    let score = 0

    // Check for degree levels
    const degreePatterns = [
      /\b(PhD|Ph\.D|Doctorate|Doctoral)\b/gi,
      /\b(Master'?s?|MS|MA|MBA|M\.S\.|M\.A\.)\b/gi,
      /\b(Bachelor'?s?|BS|BA|B\.S\.|B\.A\.)\b/gi,
      /\b(Associate'?s?|AS|AA|A\.S\.|A\.A\.)\b/gi
    ]

    const degreeScores = [40, 30, 20, 15] // PhD, Master's, Bachelor's, Associate's

    degreePatterns.forEach((pattern, index) => {
      if (pattern.test(resumeContent)) {
        score = Math.max(score, degreeScores[index])
      }
    })

    // Check for relevant fields
    const relevantFields = [
      'computer science', 'information technology', 'software engineering',
      'cybersecurity', 'information systems', 'electrical engineering',
      'mathematics', 'data science', 'network security'
    ]

    const hasRelevantField = relevantFields.some(field =>
      resumeContent.toLowerCase().includes(field)
    )

    if (hasRelevantField) score += 20

    // Check for certifications (education related)
    const certifications = [
      'CompTIA', 'Cisco', 'Microsoft', 'Amazon', 'Google', 'PMI',
      'CISSP', 'Security+', 'Network+', 'A+', 'CCNA', 'CCNP'
    ]

    const certCount = certifications.filter(cert =>
      resumeContent.toLowerCase().includes(cert.toLowerCase())
    ).length

    score += Math.min(30, certCount * 5)

    return Math.min(100, score)
  }

  private calculateOverallScore(breakdown: ATSScore['breakdown']): number {
    const weights = {
      keywords: 0.3,
      skills: 0.25,
      experience: 0.2,
      formatting: 0.15,
      education: 0.1
    }

    return Math.round(
      breakdown.keywords * weights.keywords +
      breakdown.skills * weights.skills +
      breakdown.experience * weights.experience +
      breakdown.formatting * weights.formatting +
      breakdown.education * weights.education
    )
  }

  private generateRecommendations(
    breakdown: ATSScore['breakdown'],
    resumeContent: string
  ): string[] {
    const recommendations = []

    if (breakdown.keywords < 70) {
      recommendations.push('Add more relevant keywords from the job description')
      recommendations.push('Include industry-specific terminology and technical skills')
    }

    if (breakdown.formatting < 80) {
      recommendations.push('Use standard section headers (Summary, Experience, Education, Skills)')
      recommendations.push('Ensure consistent formatting and remove special characters')
      recommendations.push('Include complete contact information')
    }

    if (breakdown.skills < 70) {
      recommendations.push('List more technical skills and certifications')
      recommendations.push('Include specific tools, technologies, and methodologies')
      recommendations.push('Add security clearance level if applicable')
    }

    if (breakdown.experience < 70) {
      recommendations.push('Quantify achievements with specific numbers and metrics')
      recommendations.push('Include years of experience in relevant roles')
      recommendations.push('Highlight progression and increasing responsibilities')
    }

    if (breakdown.education < 50) {
      recommendations.push('Include educational background and relevant degrees')
      recommendations.push('Add professional certifications and training')
      recommendations.push('List relevant coursework or continuing education')
    }

    // Security clearance specific recommendations
    if (!resumeContent.toLowerCase().includes('clearance')) {
      recommendations.push('Specify security clearance level if you have one')
    }

    return recommendations
  }

  private extractKeywords(text: string): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'upon', 'against',
      'under', 'over', 'across', 'along', 'around', 'behind', 'beyond',
      'experience', 'years', 'work', 'working', 'job', 'position', 'role'
    ])

    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || []
    
    // Filter out stop words and short words
    const keywords = tokens
      .filter(token => token.length > 2 && !stopWords.has(token))
      .filter(token => /^[a-zA-Z+#.-]+$/.test(token)) // Allow technical symbols

    // Get unique keywords with frequency
    const keywordFreq: Record<string, number> = {}
    keywords.forEach(keyword => {
      keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1
    })

    // Return keywords sorted by frequency, take top 50
    return Object.entries(keywordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 50)
      .map(([keyword]) => keyword)
  }

  async generateKeywordAnalysis(
    resumeContent: string,
    jobDescription: string
  ): Promise<KeywordAnalysis> {
    const jobKeywords = this.extractKeywords(jobDescription)
    const resumeKeywords = this.extractKeywords(resumeContent)

    const missing = jobKeywords.filter(keyword =>
      !resumeKeywords.some(resumeKeyword =>
        this.stemmer.stem(keyword) === this.stemmer.stem(resumeKeyword) ||
        keyword.includes(resumeKeyword) ||
        resumeKeyword.includes(keyword)
      )
    )

    const present = jobKeywords.filter(keyword =>
      resumeKeywords.some(resumeKeyword =>
        this.stemmer.stem(keyword) === this.stemmer.stem(resumeKeyword) ||
        keyword.includes(resumeKeyword) ||
        resumeKeyword.includes(keyword)
      )
    )

    const suggestions = missing.slice(0, 10).map(keyword => ({
      keyword,
      importance: this.calculateKeywordImportance(keyword, jobDescription),
      context: this.suggestKeywordContext(keyword),
      replacements: this.suggestReplacements(keyword, resumeKeywords)
    }))

    const density = this.calculateKeywordDensity(resumeContent, [...jobKeywords, ...resumeKeywords])

    return {
      missing,
      present,
      suggestions,
      density
    }
  }

  private calculateKeywordImportance(keyword: string, jobDescription: string): number {
    const frequency = (jobDescription.toLowerCase().match(new RegExp(keyword, 'g')) || []).length
    const position = jobDescription.toLowerCase().indexOf(keyword)
    const totalLength = jobDescription.length

    // Higher importance for keywords that appear frequently and early in the description
    const frequencyScore = Math.min(10, frequency * 2)
    const positionScore = position < totalLength * 0.3 ? 5 : position < totalLength * 0.6 ? 3 : 1

    return Math.min(10, frequencyScore + positionScore)
  }

  private suggestKeywordContext(keyword: string): string {
    const contextSuggestions: Record<string, string> = {
      'python': 'Add to technical skills section or project descriptions',
      'aws': 'Include in cloud computing experience or certifications',
      'security': 'Highlight in cybersecurity experience or clearance section',
      'management': 'Emphasize in leadership roles or project management',
      'agile': 'Mention in project methodology or development process experience'
    }

    return contextSuggestions[keyword.toLowerCase()] || 
           'Consider adding to relevant experience or skills section'
  }

  private suggestReplacements(keyword: string, resumeKeywords: string[]): string[] {
    // Find similar keywords in resume that could be enhanced
    const similar = resumeKeywords.filter(resumeKeyword =>
      resumeKeyword.includes(keyword.substring(0, 3)) ||
      keyword.includes(resumeKeyword.substring(0, 3))
    )

    return similar.slice(0, 3)
  }

  private calculateKeywordDensity(text: string, keywords: string[]): Record<string, number> {
    const density: Record<string, number> = {}
    const totalWords = (text.match(/\b\w+\b/g) || []).length

    keywords.forEach(keyword => {
      const count = (text.toLowerCase().match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length
      density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0
    })

    return density
  }

  private getFallbackATSScore(): ATSScore {
    return {
      overall: 75,
      breakdown: {
        keywords: 70,
        formatting: 80,
        skills: 75,
        experience: 75,
        education: 70
      },
      recommendations: [
        'Add more relevant keywords from job descriptions',
        'Include technical certifications and skills',
        'Quantify achievements with specific metrics',
        'Ensure consistent formatting throughout'
      ]
    }
  }
}

export const atsService = new ATSService()