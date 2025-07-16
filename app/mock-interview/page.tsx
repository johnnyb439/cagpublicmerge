'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Mic, MicOff, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

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

const sampleQuestions = {
  helpdesk: [
    "Walk me through your methodology when a colleague can't access network resources. What's your step-by-step approach?",
    "Can you explain directory services and demonstrate how you'd help someone who forgot their login credentials?",
    "A team member mentions their workstation has become sluggish. What's your diagnostic process?",
    "Compare and contrast different Windows file system formats. In what scenarios would each be most appropriate?",
    "You receive several urgent requests simultaneously. How do you prioritize and manage your workload?",
    "Tell me about remote access solutions and how you'd assist someone having trouble connecting from home.",
    "What's your approach to preparing new hardware for employee use in a corporate environment?",
    "How do you handle sensitive data when decommissioning equipment? What security measures are essential?",
    "From a support standpoint, what key changes should technicians know about recent Windows versions?",
    "A colleague encounters a critical system error with a blue screen. Walk me through your troubleshooting process."
  ],
  osp: [
    "Walk me through joining optical cables in the field. What equipment is essential for this task?",
    "Discuss the safety measures you implement when working in underground utility spaces.",
    "How do you utilize reflectometry equipment to verify optical cable integrity?",
    "Compare single-strand and multi-strand optical cables. What determines your choice for a project?",
    "What precautions do you take to maintain signal quality during cable installation?",
    "Describe your documentation process for tracking cable pathways and connection points.",
    "Why is electrical protection critical in outdoor telecommunications installations?",
    "What factors do you consider before running new cables through pre-existing pathways?",
    "How do you determine acceptable signal loss for extended optical cable installations?",
    "Compare different methods of joining optical cables. What are the pros and cons of each?"
  ],
  isp: [
    "Demonstrate your process for properly connecting and verifying category-rated network cables.",
    "Contrast the two primary ethernet wiring configurations. When is each standard used?",
    "How would you plan the cabling infrastructure for a new corporate facility?",
    "Why is organized cable routing critical in server room environments? Share your best practices.",
    "What instruments do you rely on for validating cable performance and compliance?",
    "How do you maintain industry compliance when installing structured cabling systems?",
    "Explain powered ethernet technology and its various implementation standards.",
    "What are the maximum reliable distances for different grades of network cabling?",
    "Share your system for identifying and tracking network infrastructure components.",
    "How do you diagnose sporadic connection problems in structured cabling systems?"
  ],
  fiber: [
    "Detail your preparation routine before connecting optical fiber, from initial handling to final preparation.",
    "Distinguish between various optical connector polish types and their applications.",
    "Demonstrate the correct procedure for measuring optical signal strength and attenuation.",
    "What factors contribute to excessive signal loss at connection points? How do you address them?",
    "What protective measures are essential when handling optical fiber materials?",
    "Describe your maintenance routine for optical connection points and the supplies you use.",
    "Can you explain how light behavior affects signal quality in fiber optic systems?",
    "How does wavelength division technology enhance fiber capacity? Explain the concept.",
    "You discover no signal passing through an optical connection. What's your diagnostic approach?",
    "What are the best practices for storing and protecting unused optical cables?"
  ],
  network: [
    "Break down the network communication layers and provide real-world examples for each level.",
    "Demonstrate how you'd implement virtual network segmentation on enterprise switches.",
    "Compare fixed path routing with adaptive routing protocols. When is each approach preferred?",
    "Why is loop prevention crucial in switched networks? How do protocols address this?",
    "You suspect a broadcast storm on the network. How would you identify and resolve it?",
    "A department needs a network segment for 100 devices. Calculate the appropriate addressing scheme.",
    "Contrast connection-oriented and connectionless protocols. Provide use cases for each.",
    "How do you implement traffic filtering rules to enhance network security?",
    "Share your experience with packet analysis and network performance monitoring solutions.",
    "Design a fault-tolerant network topology for a mission-critical environment.",
    "Compare exterior and interior gateway protocols. What are their primary differences?",
    "How would you prioritize voice traffic on a converged network? Explain your approach."
  ],
  systems: [
    "Outline your strategy for transitioning email services from on-site servers to cloud platforms.",
    "How do you deploy and maintain centralized configuration policies in a domain environment?",
    "Compare various disk redundancy configurations. What factors guide your selection?",
    "A domain member can't resolve internal hostnames. What's your troubleshooting approach?",
    "Describe your methodology for keeping server operating systems current and secure.",
    "Have you worked with automated configuration management? Share your experience.",
    "What metrics do you monitor to ensure database server performance? How do you optimize them?",
    "Walk me through establishing a certificate authority infrastructure for an organization.",
    "How would you design a business continuity strategy for essential server infrastructure?",
    "Share your experience managing virtual server environments and hypervisor platforms.",
    "What measures do you implement to protect server infrastructure from security threats?",
    "Describe your process for forecasting and planning future server resource requirements."
  ]
}

export default function MockInterviewPage() {
  const [selectedTier, setSelectedTier] = useState<InterviewTier | null>(null)
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null)
  const [isInterviewing, setIsInterviewing] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)

  const startInterview = () => {
    if (selectedRole) {
      setIsInterviewing(true)
      generateQuestion()
    }
  }

  const generateQuestion = () => {
    const questions = sampleQuestions[selectedRole as keyof typeof sampleQuestions] || sampleQuestions.helpdesk
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    setCurrentQuestion(randomQuestion)
    setUserAnswer('')
    setFeedback('')
    setQuestionCount(prev => prev + 1)
  }

  const submitAnswer = async () => {
    // Show loading state
    setFeedback("🤔 Analyzing your answer...");
    
    try {
      // Call AI API
      const response = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          answer: userAnswer,
          role: selectedRole,
          tier: selectedTier
        }),
      });
      
      const data = await response.json();
      
      // Display AI feedback
      setFeedback(data.feedback);
      
      // If we have detailed feedback, we could display it
      if (data.strengths && data.strengths.length > 0) {
        console.log('Strengths:', data.strengths);
      }
      if (data.improvements && data.improvements.length > 0) {
        console.log('Areas to improve:', data.improvements);
      }
      
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      // Fallback to basic analysis if AI fails
      const answer = userAnswer.toLowerCase();
      if (answer.includes("mad") || answer.includes("angry")) {
        setFeedback("❌ This response shows poor emotional control. Maintain professionalism.");
      } else if (answer.length < 20) {
        setFeedback("⚠️ Your answer is too brief. Provide more detail.");
      } else {
        setFeedback("✓ Thank you for your answer. Consider adding specific examples.");
      }
    }
    
    // Continue to next question after delay
    setTimeout(() => {
      if (questionCount < 5) {
        generateQuestion();
      } else {
        setIsInterviewing(false);
        setFeedback("Interview complete! The AI has evaluated all your responses. Review areas where you can improve.");
      }
    }, 4000);
  }

  const resetInterview = () => {
    setSelectedTier(null)
    setSelectedRole(null)
    setIsInterviewing(false)
    setCurrentQuestion('')
    setUserAnswer('')
    setFeedback('')
    setQuestionCount(0)
  }

  return (
    <section className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-dynamic-green/10 text-dynamic-green px-4 py-2 rounded-full mb-4">
            <Bot className="w-5 h-5 mr-2" />
            <span className="font-semibold">AI Mock Interview</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            Practice Makes <span className="gradient-text">Perfect</span>
          </h1>
          <p className="text-xl text-intel-gray">
            Prepare for your cleared IT interview with our AI-powered practice tool
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
              {interviewRoles[selectedTier].map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    // Automatically start interview after role selection
                    setTimeout(() => {
                      setIsInterviewing(true);
                      generateQuestion();
                    }, 500);
                  }}
                  className="card hover:border-emerald-green border-2 border-transparent transition-all duration-300 text-left group"
                >
                  <h3 className="font-montserrat font-semibold mb-1">{role.name}</h3>
                  <p className="text-sm text-intel-gray mb-2">{role.description}</p>
                  <p className="text-sm text-emerald-green font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to start interview →
                  </p>
                </button>
              ))}
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
                <h3 className="font-montserrat font-semibold">Question {questionCount} of 5</h3>
                <button
                  onClick={resetInterview}
                  className="text-intel-gray hover:text-command-black transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-lg">{currentQuestion}</p>
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
                      isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                    {isRecording ? 'Stop Recording' : 'Record Answer'}
                  </button>
                  
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                    <Send className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
              
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-lg ${
                    feedback.startsWith('❌') ? 'bg-red-50 border border-red-200' :
                    feedback.startsWith('⚠️') ? 'bg-yellow-50 border border-yellow-200' :
                    feedback.startsWith('✅') ? 'bg-emerald-green/10 border border-emerald-green/30' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div>
                      <h4 className={`font-semibold mb-1 ${
                        feedback.startsWith('❌') ? 'text-red-700' :
                        feedback.startsWith('⚠️') ? 'text-yellow-700' :
                        feedback.startsWith('✅') ? 'text-emerald-green' :
                        'text-gray-700'
                      }`}>AI Feedback</h4>
                      <p className="text-sm text-gray-700">{feedback}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {questionCount >= 5 && !currentQuestion && (
              <div className="text-center">
                <h3 className="text-2xl font-montserrat font-bold mb-4">Interview Complete!</h3>
                <p className="text-intel-gray mb-6">Great job! You've completed the mock interview.</p>
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
                Practice multiple times with different roles to build confidence. Our AI adapts questions based on your selected position and provides personalized feedback to help you improve.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}