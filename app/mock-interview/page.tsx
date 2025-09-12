'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Mic, MicOff, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import BinaryBackground from '@/components/BinaryBackground'
interface InterviewQuestion {
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}


type InterviewTier = 'tier1' | 'tier2'
type InterviewRole = string

const interviewRoles = {
  tier1: [
    { id: 'helpdesk', name: 'Help Desk/Service Desk', description: 'Customer support and ticket resolution' },
    { id: 'osp', name: 'OSP (Outside Plant)', description: 'External network infrastructure' },
    { id: 'isp', name: 'ISP (Inside Plant)', description: 'Internal network infrastructure' },
    { id: 'fiber', name: 'Fiber Optics', description: 'Fiber installation and troubleshooting' }
  ],
  tier2: [
    { id: 'network', name: 'Network Administration', description: 'Routers, switches, and network management' },
    { id: 'systems', name: 'Systems Administration', description: 'Exchange, O365, DNS, DHCP management' }
  ]
}

// All roles now have questions available
const availableRoles = ['helpdesk', 'osp', 'isp', 'fiber', 'network', 'systems']

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MockInterviewPage() {
  const [selectedTier, setSelectedTier] = useState<InterviewTier | null>(null)
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null)
  const [isInterviewing, setIsInterviewing] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [exampleAnswer, setExampleAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [shuffledQuestions, setShuffledQuestions] = useState<InterviewQuestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [aiFeedback, setAiFeedback] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const startInterview = async () => {
    if (selectedRole) {
      setIsInterviewing(true)
      try {
        // Load questions dynamically from API
        const response = await fetch(`/api/interview-questions/${selectedRole}`)
        const data = await response.json()
        const questions = data.questions || []
        
        setShuffledQuestions(questions)
        setQuestionIndex(0)
        setQuestionCount(1)
        setCurrentQuestion(questions[0])
      } catch (error) {
        console.error('Failed to load questions:', error)
        // Show error message if API fails
        setCurrentQuestion({
          question: "Sorry, questions failed to load. Please try again.",
          answer: "Refresh the page or contact support if the issue persists."
        })
      }
    }
  }

  const generateQuestion = () => {
    if (selectedRole && shuffledQuestions.length > 0) {
      // Get next question from shuffled array
      const nextIndex = questionIndex + 1;
      if (nextIndex < shuffledQuestions.length) {
        setQuestionIndex(nextIndex);
        setCurrentQuestion(shuffledQuestions[nextIndex]);
        setUserAnswer('');
        setShowAnswer(false);
        setExampleAnswer('');
        setQuestionCount(prev => prev + 1);
      }
    }
  }

  const submitAnswer = async () => {
    if (currentQuestion && userAnswer.trim()) {
      setIsAnalyzing(true)
      setShowAnswer(true)
      setExampleAnswer(currentQuestion.answer)
      
      try {
        // Call our AI feedback API
        const response = await fetch('/api/mock-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: currentQuestion.question,
            answer: userAnswer,
            role: selectedRole,
            difficulty: (currentQuestion as any).difficulty || 'easy'
          })
        })
        
        if (response.ok) {
          const feedback = await response.json()
          setAiFeedback(feedback)
        }
      } catch (error) {
        console.error('Error getting AI feedback:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const nextQuestion = () => {
    if (questionCount < 16) {
      generateQuestion()
      setAiFeedback(null) // Reset AI feedback for next question
    } else {
      setIsInterviewing(false)
      setShowAnswer(false)
      setAiFeedback(null)
    }
  }

  const resetInterview = () => {
    setSelectedTier(null)
    setSelectedRole(null)
    setIsInterviewing(false)
    setCurrentQuestion(null)
    setUserAnswer('')
    setShowAnswer(false)
    setExampleAnswer('')
    setQuestionCount(0)
    setShuffledQuestions([])
    setQuestionIndex(0)
  }

  // Questions are now loaded dynamically by startInterview function

  return (
    <section className="relative min-h-screen bg-gray-50 dark:bg-ops-charcoal py-20">
      <BinaryBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-dynamic-green/10 text-dynamic-green px-4 py-2 rounded-full mb-4">
            <Bot className="w-5 h-5 mr-2" />
            <span className="font-semibold">Mock Interview Practice</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            Practice Makes <span className="gradient-text">Perfect</span>
          </h1>
          <p className="text-xl text-intel-gray">
            Prepare for your cleared IT interview with real questions and example answers
          </p>
        </motion.div>

        {!isInterviewing && !selectedTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-montserrat font-semibold text-center mb-8">
              Select Your Experience Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setSelectedTier('tier1')}
                className="card hover:border-sky-blue border-2 border-transparent transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg"
              >
                <h3 className="text-xl font-montserrat font-semibold mb-2">Tier 1 - Entry Level</h3>
                <p className="text-intel-gray mb-4">Help Desk, OSP, ISP, Fiber Optics</p>
                <p className="text-sm text-dynamic-green">Perfect for those starting their IT journey</p>
              </button>
              
              <button
                onClick={() => setSelectedTier('tier2')}
                className="card hover:border-dynamic-green border-2 border-transparent transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg"
              >
                <h3 className="text-xl font-montserrat font-semibold mb-2">Tier 2 - Mid Level</h3>
                <p className="text-intel-gray mb-4">Network Admin, Systems Admin</p>
                <p className="text-sm text-sky-blue">For experienced IT professionals</p>
              </button>
            </div>
          </motion.div>
        )}

        {selectedTier && !selectedRole && !isInterviewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <button
              onClick={() => setSelectedTier(null)}
              className="text-intel-gray hover:text-command-black transition-colors"
            >
              ← Back to tier selection
            </button>
            
            <h2 className="text-2xl font-montserrat font-semibold text-center mb-8">
              Select Your Target Role
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewRoles[selectedTier].map((role) => {
                const isAvailable = availableRoles.includes(role.id);
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedRole(role.id);
                        // Automatically start interview after role selection
                        setTimeout(() => {
                          startInterview();
                        }, 500);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`card border-2 transition-all duration-300 text-left group ${
                      isAvailable 
                        ? 'hover:border-emerald-green border-transparent cursor-pointer' 
                        : 'border-gray-300 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <h3 className="font-montserrat font-semibold mb-1">{role.name}</h3>
                    <p className="text-sm text-intel-gray mb-2">{role.description}</p>
                    {isAvailable ? (
                      <p className="text-sm text-emerald-green font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to start interview →
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Coming soon...
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            
          </motion.div>
        )}

        {isInterviewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="card">
              {/* Enhanced Progress Header with Difficulty */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="font-montserrat font-semibold">Question {questionCount} of 16</h3>
                  {currentQuestion && (
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (currentQuestion as any).difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      (currentQuestion as any).difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {((currentQuestion as any).difficulty || 'easy').toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={resetInterview}
                  className="text-intel-gray hover:text-command-black transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Interview Progress</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {Math.round((questionCount / 16) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-green to-cyber-cyan h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(questionCount / 16) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-ops-charcoal rounded-lg p-6 mb-6 relative">
                {/* Difficulty Icon */}
                <div className="absolute top-4 right-4">
                  {(currentQuestion as any)?.difficulty === 'easy' && (
                    <div className="text-green-500 text-2xl">💡</div>
                  )}
                  {(currentQuestion as any)?.difficulty === 'medium' && (
                    <div className="text-yellow-500 text-2xl">⚡️</div>
                  )}
                  {(currentQuestion as any)?.difficulty === 'hard' && (
                    <div className="text-red-500 text-2xl">🔥</div>
                  )}
                </div>
                <p className="text-lg pr-12">{currentQuestion?.question}</p>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-cyber-cyan dark:focus:border-cyber-cyan focus:outline-none resize-none"
                  rows={6}
                />
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                    {isRecording ? 'Stop Recording' : 'Record Answer'}
                  </button>
                  
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || showAnswer}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                    <Send className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
              
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-6"
                >
                  {/* AI-Powered Feedback Section */}
                  {isAnalyzing ? (
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                        <span className="text-purple-700 dark:text-purple-300 font-semibold">AI analyzing your response...</span>
                      </div>
                    </div>
                  ) : aiFeedback && (
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                      {/* Score Display */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">🤖 AI Feedback</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{aiFeedback.score}/5</span>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <div key={star} className={`w-5 h-5 ${star <= Math.round(aiFeedback.score) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ⭐
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Feedback Text */}
                      <div className="mb-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                          {aiFeedback.feedback}
                        </pre>
                      </div>

                      {/* Strengths and Improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                          <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Strengths</h5>
                          <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                            {aiFeedback.strengths?.map((strength: string, index: number) => (
                              <li key={index}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                          <h5 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">🎯 Improvements</h5>
                          <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                            {aiFeedback.improvements?.map((improvement: string, index: number) => (
                              <li key={index}>• {improvement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Analysis Metrics */}
                      {aiFeedback.analysis && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">📊 Detailed Analysis</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{aiFeedback.analysis.wordCount}</div>
                              <div className="text-blue-500 dark:text-blue-300">Words</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{aiFeedback.analysis.keywordsFound}</div>
                              <div className="text-purple-500 dark:text-purple-300">Keywords</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">{aiFeedback.analysis.structureScore.toFixed(1)}</div>
                              <div className="text-green-500 dark:text-green-300">Structure</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-600 dark:text-red-400">{aiFeedback.analysis.technicalScore.toFixed(1)}</div>
                              <div className="text-red-500 dark:text-red-300">Technical</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Your Answer */}
                  {userAnswer && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💭 Your Answer:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{userAnswer}</p>
                    </div>
                  )}
                  
                  {/* Example Answer */}
                  {exampleAnswer && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">✅ Expert Example:</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{exampleAnswer}</div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <span>{questionCount < 16 ? 'Next Question' : 'Finish Interview'}</span>
                      {questionCount < 16 ? (
                        <div className="text-lg">➡️</div>
                      ) : (
                        <div className="text-lg">🏆</div>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            {questionCount >= 16 && !isInterviewing && (
              <div className="text-center">
                <h3 className="text-2xl font-montserrat font-bold mb-4">Interview Complete!</h3>
                <p className="text-intel-gray mb-6">Great job! You've completed the mock interview. Review the example answers to improve your responses.</p>
                <button onClick={resetInterview} className="btn-primary">
                  Start New Interview
                </button>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 p-6 bg-dynamic-green/10 rounded-lg border border-dynamic-green/30"
        >
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-dynamic-green mr-2 mt-0.5" />
            <div>
              <h4 className="font-semibold text-dynamic-green mb-1">Pro Tip</h4>
              <p className="text-sm">
                Practice multiple times to build confidence. After submitting your answer, you'll see an example of a strong response to help you understand what interviewers are looking for.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}