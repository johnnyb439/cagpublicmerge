import { NextResponse } from 'next/server';

// ADVANCED ANALYSIS ENGINE
function analyzeAnswer(answer: string, role: string, difficulty?: string) {
  const cleanAnswer = answer.toLowerCase().trim();
  const wordCount = answer.split(' ').length;
  
  // 1. LENGTH SCORING (Optimal: 50-200 words)
  let lengthScore = 1;
  if (wordCount >= 50 && wordCount <= 200) lengthScore = 5;
  else if (wordCount >= 30 && wordCount < 50) lengthScore = 4;
  else if (wordCount >= 20 && wordCount < 30) lengthScore = 3;
  else if (wordCount >= 10 && wordCount < 20) lengthScore = 2;
  
  // 2. KEYWORD SCORING - Role-specific technical terms
  const roleKeywords = {
    helpdesk: ['troubleshoot', 'diagnose', 'document', 'escalate', 'user', 'customer', 'ticket', 'resolution', 'support'],
    network: ['configure', 'protocol', 'vlan', 'routing', 'switch', 'firewall', 'bandwidth', 'subnet', 'topology'],
    systems: ['server', 'database', 'backup', 'security', 'performance', 'monitoring', 'virtualization', 'administration'],
    isp: ['bandwidth', 'service', 'connectivity', 'outage', 'infrastructure', 'customer', 'installation', 'fiber'],
    osp: ['cable', 'fiber', 'installation', 'maintenance', 'safety', 'plant', 'infrastructure', 'outdoor'],
    fiber: ['splice', 'connector', 'optic', 'attenuation', 'loss', 'testing', 'cleaning', 'fusion']
  };
  
  const keywords = roleKeywords[role as keyof typeof roleKeywords] || [];
  const keywordCount = keywords.filter(keyword => cleanAnswer.includes(keyword)).length;
  const keywordScore = Math.min(5, (keywordCount / keywords.length) * 5 + 1);
  
  // 3. STRUCTURE SCORING - Professional formatting indicators
  let structureScore = 1;
  const hasSteps = /step|first|second|then|next|finally/.test(cleanAnswer);
  const hasBullets = /•|\*|-/.test(answer);
  const hasCategories = /\*\*.*?\*\*/.test(answer);
  
  if (hasCategories && hasBullets) structureScore = 5;
  else if (hasSteps || hasBullets) structureScore = 4;
  else if (cleanAnswer.includes(':')) structureScore = 3;
  else if (cleanAnswer.includes('.') && wordCount > 20) structureScore = 2;
  
  // 4. TECHNICAL DEPTH SCORING
  const technicalTerms = ['configuration', 'implementation', 'analysis', 'optimization', 'troubleshooting', 'methodology'];
  const technicalCount = technicalTerms.filter(term => cleanAnswer.includes(term)).length;
  const technicalScore = Math.min(5, technicalCount + 1);
  
  // Generate detailed feedback
  let detailedFeedback = "";
  if (lengthScore < 3) detailedFeedback += "Consider expanding your response with more details. ";
  if (keywordScore < 3) detailedFeedback += `Include more ${role}-specific technical terms. `;
  if (structureScore < 3) detailedFeedback += "Organize your answer with clear steps or categories. ";
  if (technicalScore < 3) detailedFeedback += "Demonstrate deeper technical knowledge. ";
  
  if (detailedFeedback === "") {
    detailedFeedback = "Excellent comprehensive response with good technical depth and structure!";
  }
  
  return {
    lengthScore,
    keywordScore,
    structureScore,
    technicalScore,
    detailedFeedback,
    wordCount,
    keywordCount
  };
}

// Enhanced AI-powered feedback system - CAG Enterprise Grade
export async function POST(request: Request) {
  try {
    const { question, answer, role, tier, difficulty } = await request.json();

    let score = 0;
    let feedback = "";
    let strengths: string[] = [];
    let improvements: string[] = [];
    
    // ADVANCED EVALUATION ENGINE - Multi-factor analysis
    const analysis = analyzeAnswer(answer, role, difficulty);
    
    // Calculate base score from multiple factors
    score = Math.min(5, Math.max(1, 
      (analysis.lengthScore + analysis.keywordScore + analysis.structureScore + analysis.technicalScore) / 4
    ));
    
    // Generate personalized feedback based on score
    if (score >= 4.5) {
      feedback = "🏆 OUTSTANDING response! Your answer demonstrates expert-level knowledge and excellent communication skills.";
      strengths = ["Expert knowledge", "Clear communication", "Comprehensive coverage", "Professional structure"];
    } else if (score >= 3.5) {
      feedback = "✅ STRONG answer! You show solid understanding with good technical depth.";
      strengths = ["Good technical knowledge", "Clear examples", "Logical structure"];
      improvements = ["Add more specific metrics", "Include edge cases"];
    } else if (score >= 2.5) {
      feedback = "📈 GOOD foundation, but there's room to elevate your response.";
      strengths = ["Shows understanding", "Basic structure"];
      improvements = ["Add specific examples", "Include technical details", "Expand on best practices"];
    } else if (score >= 1.5) {
      feedback = "⚡️ You're on the right track! Let's build on this foundation.";
      strengths = ["Shows effort", "Basic concept understanding"];
      improvements = ["Provide specific examples", "Add technical depth", "Structure your response better"];
    } else {
      feedback = "🎯 Great opportunity to show more! Interviewers want to see your expertise shine.";
      strengths = ["Willingness to engage"];
      improvements = ["Provide detailed response", "Include specific examples", "Show technical knowledge", "Use structured approach"];
    }
    
    // Add detailed analysis feedback
    feedback += `\n\n📊 **Analysis:** ${analysis.detailedFeedback}`;

    // Add role-specific coaching tips
    const roleSpecificTips = getRoleSpecificTips(role, answer.toLowerCase());
    if (roleSpecificTips) {
      feedback += `\n\n💡 **${role.toUpperCase()} Focus:** ${roleSpecificTips}`;
    }

    // Add difficulty-based expectations
    if (difficulty) {
      const difficultyTips = getDifficultyTips(difficulty, score);
      if (difficultyTips) {
        feedback += `\n\n🎯 **${difficulty.toUpperCase()} Level:** ${difficultyTips}`;
      }
    }

    return NextResponse.json({
      feedback,
      score: Math.round(score * 10) / 10, // Round to 1 decimal
      strengths,
      improvements,
      analysis: {
        wordCount: analysis.wordCount,
        keywordsFound: analysis.keywordCount,
        lengthScore: analysis.lengthScore,
        keywordScore: analysis.keywordScore,
        structureScore: analysis.structureScore,
        technicalScore: analysis.technicalScore
      }
    });

  } catch (error) {
    console.error('Interview feedback error:', error);
    return NextResponse.json(
      { 
        feedback: "Unable to process your answer. Please try again.",
        score: 0,
        strengths: [],
        improvements: ["Please provide a valid response"]
      },
      { status: 500 }
    );
  }
}

function getRoleSpecificTips(role: string, answer: string): string {
  switch (role) {
    case 'helpdesk':
      if (!answer.includes('customer') && !answer.includes('user')) {
        return "Emphasize user communication and customer service. Mention how you'd keep the user informed throughout the process.";
      }
      return "Great focus on customer service! This shows you understand the help desk mentality.";
      
    case 'network':
      if (!answer.includes('protocol') && !answer.includes('configure')) {
        return "Include specific protocols (TCP/IP, VLAN, routing) and configuration commands to show hands-on experience.";
      }
      return "Excellent technical depth! Your protocol knowledge shines through.";
      
    case 'systems':
      if (!answer.includes('security') && !answer.includes('performance')) {
        return "Highlight security considerations and performance impact. Systems admins must think about both.";
      }
      return "Strong systems thinking! You're considering both security and performance aspects.";
      
    case 'fiber':
      if (!answer.includes('safety') && !answer.includes('loss')) {
        return "Mention safety procedures and loss measurements. These are critical for fiber work.";
      }
      return "Great attention to fiber-specific details and safety considerations!";
      
    default:
      return "";
  }
}

function getDifficultyTips(difficulty: string, score: number): string {
  switch (difficulty) {
    case 'easy':
      if (score < 3) return "For entry-level questions, focus on clear step-by-step processes and basic safety.";
      return "Good grasp of fundamentals! This foundation will serve you well.";
      
    case 'medium':
      if (score < 3) return "Mid-level questions need more technical depth. Include specific tools, commands, or procedures.";
      return "Solid technical knowledge! You're showing intermediate-level expertise.";
      
    case 'hard':
      if (score < 3) return "Advanced questions require expert-level detail. Include edge cases, best practices, and industry standards.";
      return "Expert-level response! You're demonstrating senior-level knowledge and experience.";
      
    default:
      return "";
  }
}