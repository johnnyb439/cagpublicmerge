import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
// // import { withRateLimit } from '@/lib/api/withRateLimit';
import { resumeAnalyzer } from '@/lib/ai/resume-analyzer';
import { z } from 'zod';

const resumeReviewSchema = z.object({
  content: z.string().min(100, 'Resume content must be at least 100 characters'),
  jobDescription: z.string().optional(),
  targetRole: z.string().optional(),
  experience: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  analysisType: z.enum(['quick', 'comprehensive']).default('comprehensive'),
});

// POST /api/ai/resume-review - Analyze resume with AI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validation = resumeReviewSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { content, jobDescription, targetRole, experience, analysisType } = validation.data;

    // Log the analysis request for monitoring
    console.log(`Resume analysis requested by user ${session.user.id}, type: ${analysisType}`);

    let analysisResult;

    if (analysisType === 'quick') {
      // Quick analysis for real-time feedback
      analysisResult = await resumeAnalyzer.quickAnalysis(content);
    } else {
      // Comprehensive analysis
      analysisResult = await resumeAnalyzer.analyzeResume({
        content,
        jobDescription,
        targetRole,
        experience
      });
    }

    // Track successful analysis
    console.log(`Resume analysis completed for user ${session.user.id}, overall rating: ${analysisResult.overallRating}`);

    return NextResponse.json({
      success: true,
      data: {
        ...analysisResult,
        analysisType,
        timestamp: new Date().toISOString(),
        userId: session.user.id,
      }
    });

  } catch (error) {
    console.error('Resume analysis API error:', error);
    
    // Return a helpful error message
    if (error instanceof Error) {
      if (error.message.includes('OpenAI')) {
        return NextResponse.json(
          { success: false, error: 'AI analysis service temporarily unavailable' },
          { status: 503 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
};

// GET /api/ai/resume-review/history - Get user's analysis history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, you'd fetch from a database
    // For now, return mock history data
    const mockHistory = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        overallRating: 82,
        priority: 'medium',
        analysisType: 'comprehensive',
        actionItemsCount: 5
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        overallRating: 76,
        priority: 'high',
        analysisType: 'quick',
        actionItemsCount: 8
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        history: mockHistory,
        totalAnalyses: mockHistory.length,
        averageRating: mockHistory.reduce((sum, h) => sum + h.overallRating, 0) / mockHistory.length
      }
    });

  } catch (error) {
    console.error('Resume history API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
};