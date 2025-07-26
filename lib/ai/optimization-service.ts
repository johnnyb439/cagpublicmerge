import { RealTimeOptimization, OptimizationSuggestion } from '@/types/ai-resume'
import { atsService } from './ats-service'
import { grammarService } from './grammar-service'

export class OptimizationService {
  private optimizationCache = new Map<string, RealTimeOptimization>()
  private debounceTimers = new Map<string, NodeJS.Timeout>()

  async analyzeRealTime(
    resumeContent: string,
    jobDescription?: string,
    sessionId: string = 'default'
  ): Promise<RealTimeOptimization> {
    // Debounce rapid changes
    if (this.debounceTimers.has(sessionId)) {
      clearTimeout(this.debounceTimers.get(sessionId)!)
    }

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        const result = await this.performOptimizationAnalysis(resumeContent, jobDescription)
        this.optimizationCache.set(sessionId, result)
        resolve(result)
      }, 300) // 300ms debounce

      this.debounceTimers.set(sessionId, timer)
    })
  }

  private async performOptimizationAnalysis(
    resumeContent: string,
    jobDescription?: string
  ): Promise<RealTimeOptimization> {
    try {
      // Run parallel analysis
      const [suggestions, keywordMatches, atsScore, grammarCheck] = await Promise.all([
        this.generateOptimizationSuggestions(resumeContent, jobDescription),
        this.calculateKeywordMatches(resumeContent, jobDescription),
        atsService.calculateATSScore(resumeContent, jobDescription),
        grammarService.checkGrammar(resumeContent)
      ])

      return {
        suggestions,
        keywordMatches,
        atsCompatibility: atsScore.overall,
        readabilityScore: grammarCheck.readabilityScore,
        activeIssues: {
          grammar: grammarCheck.errors.filter(e => e.severity === 'error').length,
          formatting: this.countFormattingIssues(resumeContent),
          content: this.countContentIssues(resumeContent)
        }
      }
    } catch (error) {
      console.error('Real-time optimization error:', error)
      return this.getFallbackOptimization()
    }
  }

  private async generateOptimizationSuggestions(
    resumeContent: string,
    jobDescription?: string
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []

    // Content structure suggestions
    suggestions.push(...this.analyzeContentStructure(resumeContent))

    // Keyword optimization suggestions
    if (jobDescription) {
      suggestions.push(...await this.analyzeKeywordOptimization(resumeContent, jobDescription))
    }

    // Action verb suggestions
    suggestions.push(...this.analyzeActionVerbs(resumeContent))

    // Quantification suggestions
    suggestions.push(...this.analyzeQuantification(resumeContent))

    // Security clearance suggestions
    suggestions.push(...this.analyzeSecurityClearance(resumeContent))

    // Sort by impact and return top suggestions
    return suggestions
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 10)
  }

  private analyzeContentStructure(resumeContent: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const content = resumeContent.toLowerCase()

    // Check for missing sections
    const requiredSections = [
      { name: 'Professional Summary', keywords: ['summary', 'profile', 'objective'] },
      { name: 'Core Competencies', keywords: ['skills', 'competencies', 'expertise'] },
      { name: 'Professional Experience', keywords: ['experience', 'employment', 'work history'] },
      { name: 'Education', keywords: ['education', 'degree', 'academic'] },
      { name: 'Certifications', keywords: ['certifications', 'credentials', 'certificates'] }
    ]

    requiredSections.forEach(section => {
      const hasSection = section.keywords.some(keyword => content.includes(keyword))
      if (!hasSection) {
        suggestions.push({
          type: 'add',
          section: section.name,
          suggested: `Add a ${section.name} section to improve ATS parsing`,
          reason: `${section.name} section helps ATS systems categorize your qualifications`,
          impact: 8,
          keywords: section.keywords
        })
      }
    })

    // Check for contact information
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeContent)
    const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeContent)
    const hasLinkedIn = content.includes('linkedin')

    if (!hasEmail) {
      suggestions.push({
        type: 'add',
        section: 'Contact',
        suggested: 'Add your professional email address',
        reason: 'Email is essential for recruiter contact',
        impact: 9
      })
    }

    if (!hasPhone) {
      suggestions.push({
        type: 'add',
        section: 'Contact',
        suggested: 'Add your phone number',
        reason: 'Phone number enables direct recruiter contact',
        impact: 7
      })
    }

    if (!hasLinkedIn) {
      suggestions.push({
        type: 'add',
        section: 'Contact',
        suggested: 'Add your LinkedIn profile URL',
        reason: 'LinkedIn profile provides additional professional context',
        impact: 6
      })
    }

    return suggestions
  }

  private async analyzeKeywordOptimization(
    resumeContent: string,
    jobDescription: string
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []
    
    try {
      const keywordAnalysis = await atsService.generateKeywordAnalysis(resumeContent, jobDescription)
      
      // Suggest adding missing high-importance keywords
      keywordAnalysis.suggestions
        .filter(suggestion => suggestion.importance >= 7)
        .slice(0, 5)
        .forEach(suggestion => {
          suggestions.push({
            type: 'add',
            section: 'Keywords',
            suggested: `Incorporate "${suggestion.keyword}" in your ${suggestion.context}`,
            reason: `High-importance keyword with ${suggestion.importance}/10 relevance`,
            impact: suggestion.importance,
            keywords: [suggestion.keyword]
          })
        })

      // Suggest keyword density improvements
      Object.entries(keywordAnalysis.density)
        .filter(([, density]) => density > 3) // Over 3% density
        .forEach(([keyword, density]) => {
          suggestions.push({
            type: 'modify',
            section: 'Keywords',
            suggested: `Reduce usage of "${keyword}" to avoid keyword stuffing`,
            reason: `Current density of ${density.toFixed(1)}% may trigger ATS spam filters`,
            impact: 6,
            keywords: [keyword]
          })
        })

    } catch (error) {
      console.error('Keyword analysis error:', error)
    }

    return suggestions
  }

  private analyzeActionVerbs(resumeContent: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    
    const weakVerbs = [
      { weak: 'managed', strong: ['led', 'directed', 'orchestrated', 'supervised'] },
      { weak: 'worked on', strong: ['developed', 'implemented', 'created', 'built'] },
      { weak: 'handled', strong: ['resolved', 'processed', 'executed', 'delivered'] },
      { weak: 'responsible for', strong: ['oversaw', 'managed', 'directed', 'led'] },
      { weak: 'helped', strong: ['assisted', 'supported', 'facilitated', 'enabled'] },
      { weak: 'did', strong: ['executed', 'performed', 'accomplished', 'achieved'] }
    ]

    weakVerbs.forEach(verb => {
      const regex = new RegExp(`\\b${verb.weak}\\b`, 'gi')
      const matches = resumeContent.match(regex)
      
      if (matches && matches.length > 0) {
        const randomStrong = verb.strong[Math.floor(Math.random() * verb.strong.length)]
        suggestions.push({
          type: 'modify',
          section: 'Experience',
          original: verb.weak,
          suggested: `Replace "${verb.weak}" with stronger action verbs like "${randomStrong}"`,
          reason: 'Strong action verbs create more impact and demonstrate leadership',
          impact: 7
        })
      }
    })

    return suggestions
  }

  private analyzeQuantification(resumeContent: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    
    // Look for bullet points or sentences that could benefit from quantification
    const bullets = resumeContent.split(/[•\-\*]/).filter(bullet => bullet.trim().length > 20)
    
    bullets.forEach((bullet, index) => {
      const hasNumbers = /\d+/.test(bullet)
      const hasPercentage = /%/.test(bullet)
      const hasCurrency = /\$/.test(bullet)
      const hasMetrics = /\b(users|customers|systems|servers|projects|teams|hours|days|months|years)\b/i.test(bullet)
      
      if (!hasNumbers && !hasPercentage && !hasCurrency && bullet.length > 30) {
        // Check if it's an achievement that could be quantified
        const achievementKeywords = /\b(improved|increased|reduced|saved|generated|managed|led|created|developed|implemented)\b/i
        if (achievementKeywords.test(bullet)) {
          suggestions.push({
            type: 'modify',
            section: 'Experience',
            original: bullet.trim().substring(0, 50) + '...',
            suggested: 'Add specific metrics (numbers, percentages, dollar amounts)',
            reason: 'Quantified achievements are more impactful and memorable',
            impact: 8
          })
        }
      }
    })

    return suggestions.slice(0, 3) // Limit to top 3 suggestions
  }

  private analyzeSecurityClearance(resumeContent: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const content = resumeContent.toLowerCase()
    
    // Check for security clearance mentions
    const clearanceLevels = ['secret', 'top secret', 'ts/sci', 'confidential', 'public trust']
    const hasClearance = clearanceLevels.some(level => content.includes(level))
    
    if (!hasClearance && (content.includes('government') || content.includes('federal') || content.includes('dod'))) {
      suggestions.push({
        type: 'add',
        section: 'Clearance',
        suggested: 'Specify your security clearance level if you have one',
        reason: 'Security clearance is crucial for government/defense positions',
        impact: 9,
        keywords: ['security clearance', 'clearance level']
      })
    }

    // Check for polygraph mention if TS/SCI is mentioned
    if (content.includes('ts/sci') && !content.includes('poly')) {
      suggestions.push({
        type: 'add',
        section: 'Clearance',
        suggested: 'Specify polygraph status if applicable (CI poly, lifestyle poly)',
        reason: 'Polygraph status is important for TS/SCI positions',
        impact: 7,
        keywords: ['polygraph', 'CI poly', 'lifestyle poly']
      })
    }

    return suggestions
  }

  private calculateKeywordMatches(resumeContent: string, jobDescription?: string): number {
    if (!jobDescription) return 0

    try {
      const jobWords = this.extractKeywords(jobDescription)
      const resumeWords = this.extractKeywords(resumeContent)
      
      const matches = jobWords.filter(jobWord =>
        resumeWords.some(resumeWord =>
          resumeWord.toLowerCase().includes(jobWord.toLowerCase()) ||
          jobWord.toLowerCase().includes(resumeWord.toLowerCase())
        )
      )

      return Math.min(100, (matches.length / jobWords.length) * 100)
    } catch (error) {
      console.error('Keyword matching error:', error)
      return 0
    }
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - in production, use more sophisticated NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word))

    // Return unique words
    return Array.from(new Set(words))
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'upon', 'against',
      'under', 'over', 'across', 'along', 'around', 'behind', 'beyond', 'is',
      'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]
    return stopWords.includes(word.toLowerCase())
  }

  private countFormattingIssues(resumeContent: string): number {
    let issues = 0

    // Check for common formatting problems
    if (/\t+/.test(resumeContent)) issues++ // Tab characters
    if (/  +/.test(resumeContent)) issues++ // Multiple spaces
    if (/\n{3,}/.test(resumeContent)) issues++ // Excessive line breaks
    if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resumeContent)) issues++ // Missing email
    if (!/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeContent)) issues++ // Missing phone

    return issues
  }

  private countContentIssues(resumeContent: string): number {
    let issues = 0
    const content = resumeContent.toLowerCase()

    // Check for missing key sections
    if (!content.includes('experience') && !content.includes('employment')) issues++
    if (!content.includes('education') && !content.includes('degree')) issues++
    if (!content.includes('skills') && !content.includes('competencies')) issues++

    // Check for weak content indicators
    if (resumeContent.length < 500) issues++ // Too short
    if (!/\d+/.test(resumeContent)) issues++ // No quantification
    if (!/(improved|increased|reduced|managed|led|created|developed)/i.test(resumeContent)) issues++ // No strong action verbs

    return issues
  }

  clearCache(sessionId?: string): void {
    if (sessionId) {
      this.optimizationCache.delete(sessionId)
      if (this.debounceTimers.has(sessionId)) {
        clearTimeout(this.debounceTimers.get(sessionId)!)
        this.debounceTimers.delete(sessionId)
      }
    } else {
      this.optimizationCache.clear()
      this.debounceTimers.forEach(timer => clearTimeout(timer))
      this.debounceTimers.clear()
    }
  }

  private getFallbackOptimization(): RealTimeOptimization {
    return {
      suggestions: [
        {
          type: 'add',
          section: 'Summary',
          suggested: 'Add a professional summary section',
          reason: 'Professional summary helps ATS systems understand your profile',
          impact: 8
        }
      ],
      keywordMatches: 0,
      atsCompatibility: 75,
      readabilityScore: 75,
      activeIssues: {
        grammar: 0,
        formatting: 1,
        content: 1
      }
    }
  }
}

export const optimizationService = new OptimizationService()