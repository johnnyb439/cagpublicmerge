import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { withRateLimit } from '@/lib/api/withRateLimit';
import emailService from '@/lib/email/emailService';
import { z } from 'zod';

const emailSchema = z.object({
  type: z.enum(['welcome', 'job_alert', 'application_status', 'custom']),
  data: z.object({
    userEmail: z.string().email(),
    userName: z.string(),
  }).passthrough(),
});

// POST /api/notifications/email - Send email notification
export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    // For now, allow internal system calls without auth
    // In production, you'd want to use API keys or service tokens
    const isInternalCall = request.headers.get('x-internal-api') === process.env.INTERNAL_API_SECRET;
    
    if (!session && !isInternalCall) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = emailSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { type, data } = validation.data;

    if (!emailService.isEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 503 }
      );
    }

    let emailSent = false;

    switch (type) {
      case 'welcome':
        if ('loginUrl' in data) {
          emailSent = await emailService.sendWelcomeEmail({
            userEmail: data.userEmail,
            userName: data.userName,
            loginUrl: data.loginUrl as string,
          });
        }
        break;

      case 'job_alert':
        if ('jobs' in data && 'frequency' in data) {
          emailSent = await emailService.sendJobAlert({
            userEmail: data.userEmail,
            userName: data.userName,
            jobs: data.jobs as Array<{ title: string; company: string; location: string; url: string }>,
            frequency: data.frequency as 'instant' | 'daily' | 'weekly',
          });
        }
        break;

      case 'application_status':
        if ('jobTitle' in data && 'company' in data && 'status' in data && 'dashboardUrl' in data) {
          emailSent = await emailService.sendApplicationStatusUpdate({
            userEmail: data.userEmail,
            userName: data.userName,
            jobTitle: data.jobTitle as string,
            company: data.company as string,
            status: data.status as 'applied' | 'reviewed' | 'interview' | 'offered' | 'rejected',
            dashboardUrl: data.dashboardUrl as string,
          });
        }
        break;

      case 'custom':
        if ('subject' in data && ('html' in data || 'text' in data)) {
          emailSent = await emailService.sendEmail({
            to: data.userEmail,
            subject: data.subject as string,
            html: data.html as string,
            text: data.text as string,
          });
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}, {
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 20 // 20 emails per minute max
});

// GET /api/notifications/email/status - Check email service status
export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      emailServiceEnabled: emailService.isEnabled(),
      provider: process.env.EMAIL_PROVIDER || 'not configured'
    }
  });
}, {
  interval: 60 * 1000,
  uniqueTokenPerInterval: 10
});