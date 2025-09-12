import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface InterviewQuestion {
  id: string
  category: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

// Load questions from JSON files
async function loadQuestions(category: string): Promise<InterviewQuestion[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'api', `questions-${category}.json`)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error(`Error loading questions for ${category}:`, error)
    return []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: categoryParam } = await params
  const category = categoryParam.toLowerCase()
  
  // Load questions from JSON database
  const questions = await loadQuestions(category)
  
  if (questions.length === 0) {
    return NextResponse.json({ error: 'Category not found or no questions available' }, { status: 404 })
  }

  // Progressive difficulty: Start with easier questions, gradually increase difficulty
  const easyQuestions = questions.filter(q => q.difficulty === 'easy')
  const mediumQuestions = questions.filter(q => q.difficulty === 'medium')
  const hardQuestions = questions.filter(q => q.difficulty === 'hard')

  // Shuffle within each difficulty group
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Build interview set: 5 easy, 5 medium, 5 hard (or proportional if fewer available)
  const interviewQuestions = [
    ...shuffleArray(easyQuestions).slice(0, Math.min(5, easyQuestions.length)),
    ...shuffleArray(mediumQuestions).slice(0, Math.min(5, mediumQuestions.length)),
    ...shuffleArray(hardQuestions).slice(0, Math.min(5, hardQuestions.length))
  ]

  // If we don't have enough for full interview, add more from available pool
  const remainingNeeded = 15 - interviewQuestions.length
  if (remainingNeeded > 0) {
    const allRemaining = questions.filter(q => !interviewQuestions.includes(q))
    interviewQuestions.push(...shuffleArray(allRemaining).slice(0, remainingNeeded))
  }

  return NextResponse.json({ 
    questions: interviewQuestions,
    total: questions.length,
    breakdown: {
      easy: easyQuestions.length,
      medium: mediumQuestions.length,
      hard: hardQuestions.length
    }
  })
}