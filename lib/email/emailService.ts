import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface JobAlertData {
  userEmail: string;
  userName: string;
  jobs: Array<{
    title: string;
    company: string;
    location: string;
    url: string;
  }>;
  frequency: 'instant' | 'daily' | 'weekly';
}

interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  loginUrl: string;
}

interface ApplicationStatusData {
  userEmail: string;
  userName: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'reviewed' | 'interview' | 'offered' | 'rejected';
  dashboardUrl: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Check for email service configuration
      const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
      
      if (emailProvider === 'sendgrid') {
        // SendGrid configuration
        this.transporter = nodemailer.createTransporter({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        });
      } else if (emailProvider === 'ses') {
        // AWS SES configuration
        this.transporter = nodemailer.createTransporter({
          SES: {
            aws: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              region: process.env.AWS_REGION || 'us-east-1',
            },
          },
        });
      } else if (emailProvider === 'smtp') {
        // Generic SMTP configuration
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }

      if (this.transporter) {
        // Verify connection
        await this.transporter.verify();
        this.isConfigured = true;
        console.log('Email service configured successfully');
      }
    } catch (error) {
      console.error('Email service configuration failed:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured, email not sent');
      return false;
    }

    try {
      const defaultFrom = process.env.FROM_EMAIL || 'noreply@clearedadvisorygroup.com';
      
      const mailOptions = {
        from: options.from || `"Cleared Advisory Group" <${defaultFrom}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html || ''),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Cleared Advisory Group</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Cleared Advisory Group</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName},</h2>
            <p>Welcome to Cleared Advisory Group! We're excited to help you advance your cleared career.</p>
            <p>Your account has been successfully created. Here's what you can do next:</p>
            <ul>
              <li>Complete your profile to get personalized job matches</li>
              <li>Set up job alerts for positions that interest you</li>
              <li>Use our AI-powered mock interview tool</li>
              <li>Download our career resources</li>
            </ul>
            <a href="${data.loginUrl}" class="button">Access Your Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Cleared Advisory Group Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Cleared Advisory Group. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: 'Welcome to Cleared Advisory Group!',
      html,
    });
  }

  async sendJobAlert(data: JobAlertData): Promise<boolean> {
    const jobsHtml = data.jobs.map(job => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">${job.title}</h3>
        <p style="margin: 4px 0; color: #6b7280;">${job.company} • ${job.location}</p>
        <a href="${job.url}" style="color: #3b82f6; text-decoration: none;">View Job →</a>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Job Opportunities</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Job Opportunities</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName},</h2>
            <p>We found ${data.jobs.length} new job${data.jobs.length > 1 ? 's' : ''} matching your criteria:</p>
            ${jobsHtml}
            <p style="margin-top: 20px;">
              <a href="https://clearedadvisorygroup.com/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Jobs</a>
            </p>
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              You're receiving this because you set up job alerts. 
              <a href="https://clearedadvisorygroup.com/dashboard/alerts">Manage your alerts</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Cleared Advisory Group. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: `${data.jobs.length} New Job${data.jobs.length > 1 ? 's' : ''} Matching Your Criteria`,
      html,
    });
  }

  async sendApplicationStatusUpdate(data: ApplicationStatusData): Promise<boolean> {
    const statusMessages = {
      applied: 'Your application has been submitted successfully.',
      reviewed: 'Your application is being reviewed.',
      interview: 'Congratulations! You\'ve been invited for an interview.',
      offered: 'Congratulations! You\'ve received a job offer.',
      rejected: 'Thank you for your interest. Unfortunately, we\'ve decided to move forward with other candidates.',
    };

    const statusColors = {
      applied: '#3b82f6',
      reviewed: '#f59e0b',
      interview: '#10b981',
      offered: '#059669',
      rejected: '#ef4444',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 20px; }
          .status { background-color: ${statusColors[data.status]}; color: white; padding: 12px; border-radius: 6px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.userName},</h2>
            <p>Your application status for <strong>${data.jobTitle}</strong> at <strong>${data.company}</strong> has been updated.</p>
            <div class="status">
              <strong>Status: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</strong>
            </div>
            <p>${statusMessages[data.status]}</p>
            <a href="${data.dashboardUrl}" class="button">View Application Details</a>
            <p>Keep up the great work on your job search!</p>
            <p>Best regards,<br>The Cleared Advisory Group Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Cleared Advisory Group. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: `Application Update: ${data.jobTitle} at ${data.company}`,
      html,
    });
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  isEnabled(): boolean {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();
export default emailService;