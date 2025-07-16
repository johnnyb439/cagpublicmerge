import { NextResponse } from 'next/server';

// Basic feedback system without AI integration for demo deployment
export async function POST(request: Request) {
  try {
    const { question, answer, role, tier } = await request.json();

    // Simulate AI-like feedback based on answer length and keywords
    let score = 3;
    let feedback = "";
    
    // Basic evaluation logic
    if (!answer || answer.length < 10) {
      score = 1;
      feedback = "⚠️ Your answer is too brief. Please provide more detail and specific examples.";
    } else if (answer.length < 50) {
      score = 2;
      feedback = "Your answer shows some understanding, but could benefit from more depth and examples.";
    } else if (answer.toLowerCase().includes('experience') || 
               answer.toLowerCase().includes('team') || 
               answer.toLowerCase().includes('problem')) {
      score = 4;
      feedback = "✓ Good answer! You included relevant experience and showed understanding of the role.";
      
      if (answer.length > 150) {
        score = 5;
        feedback = "✓ Excellent response! You provided detailed examples and demonstrated strong communication skills.";
      }
    } else {
      score = 3;
      feedback = "Your answer is adequate but could be improved by including specific examples from your experience.";
    }

    // Add role-specific feedback
    if (role === 'helpdesk') {
      if (!answer.toLowerCase().includes('customer') && !answer.toLowerCase().includes('user')) {
        feedback += " For help desk roles, remember to emphasize user communication and customer service aspects.";
      }
    } else if (role === 'osp' || role === 'isp' || role === 'fiber') {
      if (!answer.toLowerCase().includes('safety') && !answer.toLowerCase().includes('standard')) {
        feedback += " For infrastructure roles, consider mentioning safety protocols and industry standards.";
      }
    } else if (role === 'network') {
      if (!answer.toLowerCase().includes('protocol') && !answer.toLowerCase().includes('configure')) {
        feedback += " For network admin roles, demonstrate your knowledge of protocols and configuration experience.";
      }
    } else if (role === 'systems') {
      if (!answer.toLowerCase().includes('security') && !answer.toLowerCase().includes('performance')) {
        feedback += " For systems admin roles, highlight security measures and performance optimization strategies.";
      }
    }

    return NextResponse.json({
      feedback,
      score,
      strengths: score >= 4 ? ["Good communication", "Relevant examples"] : ["Shows effort"],
      improvements: score < 4 ? ["Add specific examples", "Expand on technical skills"] : ["Consider brevity"]
    });

  } catch (error) {
    console.error('Error processing interview:', error);
    return NextResponse.json(
      { 
        feedback: "Unable to process your answer. Please try again.",
        score: 0 
      },
      { status: 500 }
    );
  }
}