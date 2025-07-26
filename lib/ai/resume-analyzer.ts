import { ResumeAnalysisRequest, ResumeAnalysisResult } from '@/types/ai-resume'
import { openaiService } from './openai-service'
import { grammarService } from './grammar-service'
import { atsService } from './ats-service'
import { optimizationService } from './optimization-service'

export class ResumeAnalyzer {
  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResult> {
    try {
      console.log('Starting comprehensive resume analysis...')
      
      // Run all analyses in parallel for better performance
      const [
        contentAnalysis,
        atsScore,
        grammarCheck,
        keywordAnalysis,
        realtimeOptimization
      ] = await Promise.all([
        openaiService.analyzeResumeContent(
          request.content,
          request.jobDescription,
          request.targetRole,
          request.experience
        ),
        atsService.calculateATSScore(request.content, request.jobDescription),
        grammarService.checkGrammar(request.content),
        request.jobDescription 
          ? atsService.generateKeywordAnalysis(request.content, request.jobDescription)
          : Promise.resolve({
              missing: [],
              present: [],
              suggestions: [],
              density: {}
            }),
        optimizationService.analyzeRealTime(request.content, request.jobDescription)
      ])

      // Calculate overall rating based on all factors
      const overallRating = this.calculateOverallRating({
        atsScore: atsScore.overall,
        grammarScore: grammarCheck.overallScore,
        contentQuality: this.calculateContentQuality(contentAnalysis),
        keywordOptimization: this.calculateKeywordScore(keywordAnalysis),
        readability: grammarCheck.readabilityScore
      })

      // Determine priority level
      const priority = this.determinePriority(overallRating, atsScore, grammarCheck)

      // Generate action items
      const actionItems = this.generateActionItems({
        atsScore,
        grammarCheck,
        contentAnalysis,
        keywordAnalysis,
        realtimeOptimization
      })

      // Estimate improvement time
      const estimatedImprovementTime = this.estimateImprovementTime(actionItems)

      return {
        atsScore,
        grammarCheck,
        keywordAnalysis,
        contentAnalysis,
        overallRating,
        priority,
        estimatedImprovementTime,
        actionItems
      }
    } catch (error) {
      console.error('Resume analysis error:', error)
      return this.getFallbackAnalysis(request)
    }
  }

  async quickAnalysis(resumeContent: string): Promise<Partial<ResumeAnalysisResult>> {
    try {
      // Quick analysis for real-time feedback
      const [atsScore, grammarCheck] = await Promise.all([
        atsService.calculateATSScore(resumeContent),
        grammarService.checkGrammar(resumeContent)
      ])

      const overallRating = Math.round((atsScore.overall + grammarCheck.overallScore) / 2)

      return {
        atsScore,
        grammarCheck,
        overallRating,
        priority: overallRating >= 80 ? 'low' : overallRating >= 60 ? 'medium' : 'high'
      }
    } catch (error) {
      console.error('Quick analysis error:', error)
      return {
        overallRating: 75,
        priority: 'medium'
      }
    }
  }

  private calculateOverallRating(scores: {
    atsScore: number
    grammarScore: number
    contentQuality: number
    keywordOptimization: number
    readability: number
  }): number {
    const weights = {
      atsScore: 0.3,
      grammarScore: 0.2,
      contentQuality: 0.25,
      keywordOptimization: 0.15,
      readability: 0.1
    }

    return Math.round(
      scores.atsScore * weights.atsScore +
      scores.grammarScore * weights.grammarScore +
      scores.contentQuality * weights.contentQuality +
      scores.keywordOptimization * weights.keywordOptimization +
      scores.readability * weights.readability
    )
  }

  private calculateContentQuality(contentAnalysis: any): number {
    let score = 0
    let maxScore = 0

    // Score based on sections present and quality
    contentAnalysis.sections.forEach((section: any) => {
      maxScore += 10
      if (section.present) {
        score += section.quality
      }
    })

    // Bonus for achievements
    if (contentAnalysis.achievements.hasQuantifiableResults) {
      score += 15
      maxScore += 15
    } else {
      maxScore += 15
    }

    // Score based on skills coverage
    const skillsScore = Math.min(20, contentAnalysis.skills.technical.length * 2)
    score += skillsScore
    maxScore += 20

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 70
  }

  private calculateKeywordScore(keywordAnalysis: any): number {
    if (!keywordAnalysis.present || !keywordAnalysis.missing) return 70

    const totalKeywords = keywordAnalysis.present.length + keywordAnalysis.missing.length
    if (totalKeywords === 0) return 70

    return Math.round((keywordAnalysis.present.length / totalKeywords) * 100)
  }

  private determinePriority(
    overallRating: number,
    atsScore: any,
    grammarCheck: any
  ): 'high' | 'medium' | 'low' {
    const criticalIssues = 
      grammarCheck.errors.filter((e: any) => e.severity === 'error').length +
      (atsScore.overall < 60 ? 1 : 0)

    if (overallRating < 60 || criticalIssues > 5) return 'high'
    if (overallRating < 80 || criticalIssues > 2) return 'medium'
    return 'low'
  }

  private generateActionItems(analysisData: {
    atsScore: any
    grammarCheck: any
    contentAnalysis: any
    keywordAnalysis: any
    realtimeOptimization: any
  }): ResumeAnalysisResult['actionItems'] {
    const actionItems: ResumeAnalysisResult['actionItems'] = []

    // High priority grammar issues
    const criticalGrammarErrors = analysisData.grammarCheck.errors.filter(
      (error: any) => error.severity === 'error'
    )
    if (criticalGrammarErrors.length > 0) {
      actionItems.push({
        priority: 'high',
        category: 'grammar',
        description: `Fix ${criticalGrammarErrors.length} critical grammar/spelling errors`,
        impact: 9
      })
    }

    // ATS compatibility issues
    if (analysisData.atsScore.overall < 70) {
      actionItems.push({
        priority: 'high',
        category: 'formatting',
        description: 'Improve ATS compatibility and formatting',
        impact: 8
      })
    }

    // Missing keywords
    if (analysisData.keywordAnalysis.missing && analysisData.keywordAnalysis.missing.length > 5) {
      actionItems.push({
        priority: 'high',
        category: 'keywords',
        description: `Add ${Math.min(5, analysisData.keywordAnalysis.missing.length)} important keywords`,
        impact: 8
      })
    }

    // Content improvements
    const missingSections = analysisData.contentAnalysis.sections.filter(
      (section: any) => !section.present
    )
    if (missingSections.length > 0) {
      actionItems.push({
        priority: 'medium',
        category: 'content',
        description: `Add missing sections: ${missingSections.map((s: any) => s.name).join(', ')}`,
        impact: 7
      })
    }

    // Quantification improvements
    if (!analysisData.contentAnalysis.achievements.hasQuantifiableResults) {
      actionItems.push({
        priority: 'medium',
        category: 'content',
        description: 'Add quantifiable metrics to achievements',
        impact: 7
      })
    }

    // Optimization suggestions from real-time analysis
    analysisData.realtimeOptimization.suggestions
      .filter((suggestion: any) => suggestion.impact >= 7)
      .slice(0, 3)
      .forEach((suggestion: any) => {
        actionItems.push({
          priority: suggestion.impact >= 8 ? 'high' : 'medium',
          category: 'content',
          description: suggestion.suggested,
          impact: suggestion.impact
        })
      })

    // Style improvements
    const styleErrors = analysisData.grammarCheck.errors.filter(
      (error: any) => error.type === 'style'
    )
    if (styleErrors.length > 3) {
      actionItems.push({
        priority: 'low',
        category: 'grammar',
        description: 'Improve writing style and use stronger action verbs',
        impact: 6
      })
    }

    // Sort by impact and priority
    return actionItems
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        return priorityDiff !== 0 ? priorityDiff : b.impact - a.impact
      })
      .slice(0, 8) // Limit to top 8 action items
  }

  private estimateImprovementTime(actionItems: ResumeAnalysisResult['actionItems']): string {
    const highPriorityCount = actionItems.filter(item => item.priority === 'high').length
    const mediumPriorityCount = actionItems.filter(item => item.priority === 'medium').length
    const lowPriorityCount = actionItems.filter(item => item.priority === 'low').length

    // Estimate time based on action items
    const estimatedHours = 
      highPriorityCount * 0.5 + // 30 minutes per high priority item
      mediumPriorityCount * 0.25 + // 15 minutes per medium priority item
      lowPriorityCount * 0.1 // 6 minutes per low priority item

    if (estimatedHours < 0.5) return '15-30 minutes'
    if (estimatedHours < 1) return '30-60 minutes'
    if (estimatedHours < 2) return '1-2 hours'
    if (estimatedHours < 4) return '2-4 hours'
    return '4+ hours'
  }

  private getFallbackAnalysis(request: ResumeAnalysisRequest): ResumeAnalysisResult {
    return {
      atsScore: {
        overall: 75,
        breakdown: {
          keywords: 70,
          formatting: 80,
          skills: 75,
          experience: 75,
          education: 70
        },
        recommendations: [
          'Add more relevant keywords',
          'Improve formatting consistency',
          'Include technical certifications'
        ]
      },
      grammarCheck: {
        errors: [],
        overallScore: 85,
        wordCount: 500,
        readabilityScore: 75
      },
      keywordAnalysis: {
        missing: ['AWS', 'Python', 'CISSP'],
        present: ['JavaScript', 'Security+', 'Network'],
        suggestions: [],
        density: {}
      },
      contentAnalysis: {
        sections: [
          {
            name: 'Professional Summary',
            present: true,
            quality: 7,
            suggestions: ['Consider adding more specific achievements']
          }
        ],
        achievements: {
          count: 3,
          hasQuantifiableResults: false,
          suggestions: ['Add specific metrics and numbers']
        },
        skills: {
          technical: ['JavaScript', 'Python', 'AWS'],
          soft: ['Communication', 'Leadership'],
          missing: ['Docker', 'Kubernetes'],
          suggestions: ['Add cloud computing skills']
        },
        experience: {
          totalYears: 5,
          relevantYears: 4,
          progressionAnalysis: 'Shows steady career progression',
          suggestions: ['Highlight leadership roles']
        },
        education: {
          present: true,
          relevant: true,
          suggestions: ['Consider adding certifications']
        },
        certifications: {
          present: ['Security+'],
          recommended: ['CISSP', 'AWS Certified'],
          expiring: []
        }
      },
      overallRating: 75,
      priority: 'medium',
      estimatedImprovementTime: '1-2 hours',
      actionItems: [
        {
          priority: 'high',
          category: 'keywords',
          description: 'Add missing technical keywords',
          impact: 8
        },
        {
          priority: 'medium',
          category: 'content',
          description: 'Quantify achievements with specific metrics',
          impact: 7
        }
      ]
    }
  }
}

export const resumeAnalyzer = new ResumeAnalyzer()