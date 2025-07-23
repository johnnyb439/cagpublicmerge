'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Mic, MicOff, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import BinaryBackground from '@/components/BinaryBackground'
import { interviewQuestions, InterviewQuestion } from './interview-data'


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

// For now, we'll only show helpdesk questions since those are the only ones with answers
const availableRoles = ['helpdesk']

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

  const startInterview = () => {
    if (selectedRole) {
      setIsInterviewing(true)
      // Shuffle questions when starting interview
      if (selectedRole === 'helpdesk') {
        const questions = interviewQuestions.helpdesk || [];
        const shuffled = shuffleArray(questions);
        setShuffledQuestions(shuffled);
        setQuestionIndex(0);
        setQuestionCount(1);
        setCurrentQuestion(shuffled[0]);
      }
    }
  }

  const generateQuestion = () => {
    if (selectedRole === 'helpdesk' && shuffledQuestions.length > 0) {
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

  const submitAnswer = () => {
    if (currentQuestion) {
      setShowAnswer(true)
      setExampleAnswer(currentQuestion.answer)
    }
  }

  const nextQuestion = () => {
    if (questionCount < 16) {
      generateQuestion()
    } else {
      setIsInterviewing(false)
      setShowAnswer(false)
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

  // Ensure question loads when interview starts
  useEffect(() => {
    if (isInterviewing && selectedRole === 'helpdesk' && !currentQuestion && shuffledQuestions.length === 0) {
      // This will be handled by startInterview now
      const questions = interviewQuestions.helpdesk || [];
      const shuffled = shuffleArray(questions);
      setShuffledQuestions(shuffled);
      setQuestionIndex(0);
      setQuestionCount(1);
      setCurrentQuestion(shuffled[0]);
    }
  }, [isInterviewing, selectedRole, currentQuestion, shuffledQuestions]);

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
                className="card hover:border-sky-blue border-2 border-transparent transition-all duration-300"
              >
                <h3 className="text-xl font-montserrat font-semibold mb-2">Tier 1 - Entry Level</h3>
                <p className="text-intel-gray mb-4">Help Desk, OSP, ISP, Fiber Optics</p>
                <p className="text-sm text-dynamic-green">Perfect for those starting their IT journey</p>
              </button>
              
              <button
                onClick={() => setSelectedTier('tier2')}
                className="card hover:border-dynamic-green border-2 border-transparent transition-all duration-300"
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
                          setIsInterviewing(true);
                          // Shuffle questions when starting interview
                          if (role.id === 'helpdesk') {
                            const questions = interviewQuestions.helpdesk || [];
                            const shuffled = shuffleArray(questions);
                            setShuffledQuestions(shuffled);
                            setQuestionIndex(0);
                            setQuestionCount(1);
                            setCurrentQuestion(shuffled[0]);
                          }
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-montserrat font-semibold">Question {questionCount} of 16</h3>
                <button
                  onClick={resetInterview}
                  className="text-intel-gray hover:text-command-black transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-ops-charcoal rounded-lg p-4 mb-6">
                <p className="text-lg">{currentQuestion?.question}</p>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:border-cyber-cyan focus:outline-none resize-none"
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
              
              {showAnswer && exampleAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  {userAnswer && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-700 mb-2">Your Answer:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{userAnswer}</p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-emerald-green/10 border border-emerald-green/30 rounded-lg">
                    <h4 className="font-semibold text-emerald-green mb-2">✓ Example Answer:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{exampleAnswer}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="btn-primary"
                    >
                      {questionCount < 16 ? 'Next Question' : 'Finish Interview'}
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