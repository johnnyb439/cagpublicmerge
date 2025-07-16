'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Mic, MicOff, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
// import { interviewQuestions, InterviewQuestion } from './interview-data'

interface InterviewQuestion {
  question: string;
  answer: string;
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

// 5 CompTIA A+ inspired interview questions
const helpdeskQuestions: InterviewQuestion[] = [
  {
    question: "A user reports their computer is running slowly. What are the first three things you would check?",
    answer: "First, I would open Task Manager to check CPU, memory, and disk usage to identify any processes consuming excessive resources. Second, I would verify available hard drive space, ensuring at least 15% is free for optimal performance. Third, I would check for malware by running a full antivirus scan and reviewing startup programs that might be loading unnecessarily. I'd also document findings in the ticket for future reference."
  },
  {
    question: "Explain what DHCP is and how it works in simple terms a non-technical user could understand.",
    answer: "DHCP stands for Dynamic Host Configuration Protocol. Think of it like a hotel front desk - when you check in (connect to the network), the desk clerk (DHCP server) automatically assigns you a room number (IP address) and gives you information about hotel services like the restaurant and gym (DNS servers and gateway). This happens automatically so you don't have to configure anything manually. The assignment is temporary and can be given to someone else when you check out (disconnect)."
  },
  {
    question: "You need to set up a new workstation for an employee. Walk me through your process from unboxing to ready-to-use.",
    answer: "I would start by unboxing and physically setting up the hardware, connecting all peripherals. Next, I'd power on and enter BIOS to verify hardware is recognized and update firmware if needed. Then I'd boot from our network or USB to apply the company's standard Windows image. After imaging, I'd join the computer to the domain, install role-specific software, configure Outlook and network drives, enable BitLocker encryption, run all Windows updates, test all applications and peripherals, and finally create documentation in our asset management system before delivering to the user with a brief orientation."
  },
  {
    question: "A user cannot print to a network printer that was working yesterday. How would you troubleshoot this?",
    answer: "I'd start by checking if other users can print to the same printer to determine if it's isolated to this user. Then I'd verify the printer is online and has paper/toner by checking its status page. On the user's computer, I'd clear the print spooler by stopping the service, deleting stuck jobs, and restarting it. I'd ping the printer's IP address to verify network connectivity, check if the printer driver needs updating, ensure the user didn't accidentally change their default printer, and verify their account has permissions to print. If needed, I'd remove and re-add the printer with fresh drivers."
  },
  {
    question: "What is the difference between RAM and storage, and how would you explain it to a user asking why their computer needs both?",
    answer: "I'd explain that RAM is like your desk workspace - it's where you spread out papers you're actively working on for quick access. Storage (hard drive/SSD) is like your filing cabinet - it permanently stores all your documents even when you're not using them. When you open a program, it moves from the filing cabinet (storage) to your desk (RAM) so you can work with it quickly. The bigger your desk (more RAM), the more things you can work on at once without slowing down. The bigger your filing cabinet (more storage), the more files you can keep permanently. You need both because RAM is temporary but fast, while storage is permanent but slower."
  },
  {
    question: "A user complains about receiving too many spam emails. What steps would you take to help reduce spam in their inbox?",
    answer: "First, I'd check if their email client's spam filter is properly enabled and configured. I'd show them how to mark emails as spam to train the filter, and check if legitimate emails are in the spam folder. Next, I'd advise them never to reply to spam or click unsubscribe links in suspicious emails. I'd help them create rules to automatically filter common spam keywords, review their email address exposure online, and consider setting up a separate email for online shopping or subscriptions. For persistent issues, I might recommend changing email addresses or implementing additional anti-spam solutions. I'd also educate them about phishing attempts and how to identify suspicious emails."
  },
  {
    question: "How would you help a user who says their computer 'just shut off' and won't turn back on?",
    answer: "I'd start with basic power troubleshooting: verify the power cable is connected securely, test the outlet with another device, and check for tripped circuit breakers. For laptops, I'd remove the battery (if removable) and try powering on with just AC power. Next, I'd look for signs of life like LED lights or fan noise when pressing the power button. I'd perform a hard reset by unplugging power, removing the battery, holding the power button for 30 seconds, then reconnecting. If it's a desktop, I'd check internal connections and try one stick of RAM. For overheating issues, I'd let it cool down completely before attempting to power on. If these steps fail, it likely indicates hardware failure requiring further diagnosis or replacement."
  },
  {
    question: "Explain the difference between a virus, malware, and ransomware to a non-technical user.",
    answer: "I'd use simple analogies: A virus is like a cold that spreads from person to person - it's a type of malicious software that copies itself and spreads to other files or computers. Malware is the umbrella term for all malicious software, like how 'illness' covers all types of sickness including colds, flu, and infections. It includes viruses, spyware, trojans, and more. Ransomware is a specific type of malware that's like a kidnapper - it locks up your files and demands payment to release them. The key points are: viruses spread, malware is any bad software, and ransomware holds your data hostage. All three can be prevented with good antivirus software, regular updates, and careful online behavior."
  },
  {
    question: "A remote user cannot connect to the company VPN. Walk through your troubleshooting process.",
    answer: "I'd start by verifying their internet connection is working by having them browse to a website. Then I'd check if they're using the correct VPN server address and credentials, including any recent password changes. I'd ensure their VPN client is up-to-date and reinstall if necessary. Next, I'd verify their firewall isn't blocking VPN ports (typically 1723 for PPTP, 1701 for L2TP, or 443 for SSL VPN). I'd have them try connecting from a different network to rule out ISP blocking. I'd check if their account is active in Active Directory and has VPN access permissions. For certificate-based VPNs, I'd verify certificate validity. I'd also check our VPN server status and user connection limits. If needed, I'd use alternative connection methods like SSL VPN or provide temporary remote access through other approved tools."
  },
  {
    question: "How do you determine if a computer hardware issue is caused by the motherboard, power supply, or RAM?",
    answer: "I use a systematic elimination process. For power supply issues, I check if fans spin up, listen for clicking sounds, test with a multimeter or PSU tester, and look for burning smells. A completely dead system often indicates PSU failure. For RAM issues, I listen for beep codes, test with one stick at a time in different slots, run memory diagnostic tools, and look for random crashes or blue screens with memory-related errors. For motherboard issues, I check for physical damage like bulging capacitors, test with minimal components (CPU, one RAM stick, PSU), verify all power connections, and look for diagnostic LED codes. The key is isolating components - if the system works with certain RAM removed, it's likely RAM; if swapping PSU fixes it, that's the culprit; persistent issues with known good components suggest motherboard failure."
  }
];

// For now, we'll only show helpdesk questions since those are the only ones with answers
const availableRoles = ['helpdesk']

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

  const startInterview = () => {
    if (selectedRole) {
      setIsInterviewing(true)
      generateQuestion()
    }
  }

  const generateQuestion = () => {
    if (selectedRole === 'helpdesk') {
      // Get next question in sequence (cycling through 5 questions)
      const questionIndex = questionCount % helpdeskQuestions.length;
      const nextQuestion = helpdeskQuestions[questionIndex];
      setCurrentQuestion(nextQuestion);
      setUserAnswer('');
      setShowAnswer(false);
      setExampleAnswer('');
      setQuestionCount(prev => prev + 1);
    }
  }

  const submitAnswer = () => {
    if (currentQuestion) {
      setShowAnswer(true)
      setExampleAnswer(currentQuestion.answer)
    }
  }

  const nextQuestion = () => {
    if (questionCount < 10) {
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
  }

  // Ensure question loads when interview starts
  useEffect(() => {
    if (isInterviewing && selectedRole === 'helpdesk' && !currentQuestion) {
      const firstQuestion = helpdeskQuestions[0];
      setCurrentQuestion(firstQuestion);
      setQuestionCount(1);
    }
  }, [isInterviewing, selectedRole, currentQuestion]);

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
                          generateQuestion();
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
                      <p className="text-sm text-gray-500 italic">
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
                <h3 className="font-montserrat font-semibold">Question {questionCount} of 10</h3>
                <button
                  onClick={resetInterview}
                  className="text-intel-gray hover:text-command-black transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
                      isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
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
                      <p className="text-sm text-gray-700">{userAnswer}</p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-emerald-green/10 border border-emerald-green/30 rounded-lg">
                    <h4 className="font-semibold text-emerald-green mb-2">✓ Example Answer:</h4>
                    <p className="text-sm text-gray-700">{exampleAnswer}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="btn-primary"
                    >
                      {questionCount < 10 ? 'Next Question' : 'Finish Interview'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            {questionCount >= 10 && !isInterviewing && (
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