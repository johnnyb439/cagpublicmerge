import { NextRequest, NextResponse } from 'next/server'

// Mock interview performance database
const interviewPerformanceStore = new Map<string, Array<{
  interviewId: string
  timestamp: Date
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionsAnswered: number
  totalQuestions: number
  averageScore: number
  timeSpent: number
  strengthAreas: string[]
  improvementAreas: string[]
  feedback: {
    overall: string
    strengths: string[]
    improvements: string[]
  }
}>>()

const performanceStatsStore = new Map<string, {
  totalInterviews: number
  averageScore: number
  bestCategory: string
  improvementTrend: number
  timeSpentTotal: number
  completionRate: number
  difficultyProgression: {
    easy: number
    medium: number
    hard: number
  }
}>()

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      interviewId,
      category, 
      difficulty, 
      questionsAnswered, 
      totalQuestions, 
      scores,
      timeSpent,
      feedback 
    } = await request.json()

    if (!userId || !interviewId || !category) {
      return NextResponse.json(
        { success: false, error: 'userId, interviewId, and category are required' },
        { status: 400 }
      )
    }

    // Calculate average score
    const averageScore = scores && scores.length > 0 
      ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length 
      : 0

    // Analyze performance for strengths and improvements
    const strengthAreas: string[] = []
    const improvementAreas: string[] = []

    if (averageScore >= 4) strengthAreas.push(category)
    if (averageScore < 3) improvementAreas.push(category)

    const performanceRecord = {
      interviewId,
      timestamp: new Date(),
      category,
      difficulty: difficulty || 'medium',
      questionsAnswered: questionsAnswered || 0,
      totalQuestions: totalQuestions || 15,
      averageScore,
      timeSpent: timeSpent || 0,
      strengthAreas,
      improvementAreas,
      feedback: feedback || {
        overall: `Completed ${category} interview with ${averageScore.toFixed(1)}/5 average score`,
        strengths: strengthAreas,
        improvements: improvementAreas
      }
    }

    // Add to user's performance history
    if (!interviewPerformanceStore.has(userId)) {
      interviewPerformanceStore.set(userId, [])
    }
    interviewPerformanceStore.get(userId)!.push(performanceRecord)

    // Update performance stats
    const userPerformances = interviewPerformanceStore.get(userId)!
    let performanceStats = performanceStatsStore.get(userId) || {
      totalInterviews: 0,
      averageScore: 0,
      bestCategory: '',
      improvementTrend: 0,
      timeSpentTotal: 0,
      completionRate: 0,
      difficultyProgression: { easy: 0, medium: 0, hard: 0 }
    }

    // Calculate updated stats
    performanceStats.totalInterviews = userPerformances.length
    performanceStats.averageScore = userPerformances.reduce((sum, perf) => sum + perf.averageScore, 0) / userPerformances.length
    performanceStats.timeSpentTotal = userPerformances.reduce((sum, perf) => sum + perf.timeSpent, 0)
    performanceStats.completionRate = userPerformances.reduce((sum, perf) => sum + (perf.questionsAnswered / perf.totalQuestions), 0) / userPerformances.length

    // Find best category
    const categoryScores = new Map<string, number[]>()
    userPerformances.forEach(perf => {
      if (!categoryScores.has(perf.category)) {
        categoryScores.set(perf.category, [])
      }
      categoryScores.get(perf.category)!.push(perf.averageScore)
    })

    let bestCategory = ''
    let bestScore = 0
    categoryScores.forEach((scores, category) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      if (avgScore > bestScore) {
        bestScore = avgScore
        bestCategory = category
      }
    })
    performanceStats.bestCategory = bestCategory

    // Update difficulty progression
    performanceStats.difficultyProgression = {
      easy: userPerformances.filter(p => p.difficulty === 'easy').length,
      medium: userPerformances.filter(p => p.difficulty === 'medium').length,
      hard: userPerformances.filter(p => p.difficulty === 'hard').length
    }

    // Calculate improvement trend (last 5 vs previous 5)
    if (userPerformances.length >= 5) {
      const recent5 = userPerformances.slice(-5)
      const previous5 = userPerformances.slice(-10, -5)
      const recentAvg = recent5.reduce((sum, perf) => sum + perf.averageScore, 0) / recent5.length
      const previousAvg = previous5.length > 0 
        ? previous5.reduce((sum, perf) => sum + perf.averageScore, 0) / previous5.length 
        : recentAvg
      performanceStats.improvementTrend = ((recentAvg - previousAvg) / previousAvg) * 100
    }

    performanceStatsStore.set(userId, performanceStats)

    return NextResponse.json({
      success: true,
      message: 'Interview performance recorded successfully',
      performance: performanceRecord,
      stats: performanceStats
    })

  } catch (error) {
    console.error('Interview performance tracking error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track interview performance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter required' },
        { status: 400 }
      )
    }

    const userPerformances = interviewPerformanceStore.get(userId) || []
    const performanceStats = performanceStatsStore.get(userId) || {
      totalInterviews: 0,
      averageScore: 0,
      bestCategory: '',
      improvementTrend: 0,
      timeSpentTotal: 0,
      completionRate: 0,
      difficultyProgression: { easy: 0, medium: 0, hard: 0 }
    }

    // Filter by category if specified
    const filteredPerformances = category 
      ? userPerformances.filter(perf => perf.category === category)
      : userPerformances

    // Get recent performances
    const recentPerformances = filteredPerformances
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)

    // Calculate performance trends
    const performanceTrend = userPerformances.slice(-10).map(perf => ({
      date: perf.timestamp.toISOString().split('T')[0],
      score: perf.averageScore,
      category: perf.category
    }))

    return NextResponse.json({
      success: true,
      performance: {
        userId,
        stats: performanceStats,
        recentInterviews: recentPerformances,
        trends: {
          performanceOverTime: performanceTrend,
          categoryBreakdown: Array.from(
            userPerformances.reduce((acc, perf) => {
              if (!acc.has(perf.category)) {
                acc.set(perf.category, [])
              }
              acc.get(perf.category)!.push(perf.averageScore)
              return acc
            }, new Map<string, number[]>())
          ).map(([category, scores]) => ({
            category,
            averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
            totalInterviews: scores.length
          }))
        },
        insights: {
          strongestArea: performanceStats.bestCategory,
          improvementTrend: performanceStats.improvementTrend,
          recommendedFocus: performanceStats.averageScore < 3 ? 'Focus on fundamentals' : 
                            performanceStats.averageScore < 4 ? 'Practice advanced scenarios' : 
                            'Ready for senior roles!'
        }
      }
    })

  } catch (error) {
    console.error('Performance analytics retrieval error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve performance analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}