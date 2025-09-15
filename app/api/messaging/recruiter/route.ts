import { NextRequest, NextResponse } from 'next/server';

// Mock data storage
let recruiterMessages: any[] = [];
let messageTemplates: any[] = [];

// Initialize message templates for recruiters
if (messageTemplates.length === 0) {
  messageTemplates = [
    {
      id: 'template_initial',
      name: 'Initial Outreach',
      category: 'outreach',
      subject: 'Exciting {position} Opportunity at {company}',
      content: `Hi {candidate_name}!

I came across your profile and I'm impressed with your {skills} background and experience in {specialization}.

We have a {position} role at {company} that I believe would be a perfect match for your expertise. The position offers:

• Competitive salary range: {salary_range}
• {benefit_1}
• {benefit_2}
• Remote/hybrid flexibility

Would you be open to a brief 15-minute call this week to discuss this opportunity? I'd love to share more details about the role and learn about your career goals.

Best regards,
{recruiter_name}
{company}
{contact_info}`,
      variables: ['candidate_name', 'skills', 'specialization', 'position', 'company', 'salary_range', 'benefit_1', 'benefit_2', 'recruiter_name', 'contact_info']
    },
    {
      id: 'template_followup',
      name: 'Follow-up',
      category: 'followup',
      subject: 'Following up on {position} opportunity at {company}',
      content: `Hi {candidate_name},

I wanted to follow up on the {position} opportunity I mentioned at {company}.

I understand you're likely exploring multiple options, and I'd love to answer any questions you might have about this role or our company culture.

The hiring manager is particularly interested in candidates with your {key_skill} expertise, and I believe this could be an excellent next step in your career.

Would you have 10 minutes for a quick call this week?

Thanks for your time!

{recruiter_name}
{company}`,
      variables: ['candidate_name', 'position', 'company', 'key_skill', 'recruiter_name']
    },
    {
      id: 'template_interview',
      name: 'Interview Invitation',
      category: 'interview',
      subject: 'Interview Invitation - {position} at {company}',
      content: `Hi {candidate_name},

Great news! The hiring team would like to move forward with your application for the {position} role.

We'd like to schedule a {interview_type} interview at your convenience. The interview will cover:

• Technical discussion about {technical_area}
• Overview of the role and team structure
• Your questions about the position and company

Please let me know your availability for the following times:
• {time_slot_1}
• {time_slot_2}
• {time_slot_3}

Looking forward to hearing from you!

{recruiter_name}
{company}`,
      variables: ['candidate_name', 'position', 'company', 'interview_type', 'technical_area', 'time_slot_1', 'time_slot_2', 'time_slot_3', 'recruiter_name']
    }
  ];

  console.log(`✅ INITIALIZED ${messageTemplates.length} RECRUITER MESSAGE TEMPLATES`);
}

// GET - Retrieve recruiter message templates or sent messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const recruiter_id = searchParams.get('recruiter_id');
    const candidate_id = searchParams.get('candidate_id');

    if (action === 'templates') {
      // Return available message templates
      return NextResponse.json({
        success: true,
        data: {
          templates: messageTemplates,
          count: messageTemplates.length,
          categories: [...new Set(messageTemplates.map(t => t.category))]
        }
      });
    }

    if (action === 'messages') {
      // Return sent recruiter messages
      let filteredMessages = recruiterMessages;

      if (recruiter_id) {
        filteredMessages = filteredMessages.filter(m => m.recruiter_id === recruiter_id);
      }

      if (candidate_id) {
        filteredMessages = filteredMessages.filter(m => m.candidate_id === candidate_id);
      }

      // Sort by sent date (newest first)
      filteredMessages.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

      return NextResponse.json({
        success: true,
        data: {
          messages: filteredMessages,
          count: filteredMessages.length
        }
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid action parameter',
        valid_actions: ['templates', 'messages']
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ RECRUITER GET ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recruiter data' },
      { status: 500 }
    );
  }
}

// POST - Send recruiter message to candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      recruiter_id,
      candidate_id,
      template_id,
      variables = {},
      custom_subject,
      custom_content,
      company,
      position,
      job_category
    } = body;

    if (action === 'send_message') {
      // Validate required fields for sending message
      if (!recruiter_id || !candidate_id) {
        return NextResponse.json(
          {
            error: 'Missing required fields',
            required: ['recruiter_id', 'candidate_id']
          },
          { status: 400 }
        );
      }

      let subject = '';
      let content = '';

      if (template_id) {
        // Use template with variables
        const template = messageTemplates.find(t => t.id === template_id);
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }

        // Replace variables in template
        subject = template.subject;
        content = template.content;

        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`{${key}}`, 'g');
          subject = subject.replace(regex, value as string);
          content = content.replace(regex, value as string);
        });

      } else if (custom_subject && custom_content) {
        // Use custom message
        subject = custom_subject;
        content = custom_content;

      } else {
        return NextResponse.json(
          {
            error: 'Either template_id or both custom_subject and custom_content are required'
          },
          { status: 400 }
        );
      }

      // Generate unique message ID
      const message_id = `rec_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      // Create recruiter message record
      const newMessage = {
        id: message_id,
        recruiter_id,
        candidate_id,
        subject,
        content,
        template_id,
        variables,
        company,
        position,
        job_category,
        sent_at: timestamp,
        status: 'sent',
        read_at: null,
        replied_at: null
      };

      // Store message
      recruiterMessages.push(newMessage);

      console.log(`✅ RECRUITER MESSAGE SENT:`, {
        message_id,
        recruiter_id,
        candidate_id,
        company,
        position,
        template_id: template_id || 'custom'
      });

      return NextResponse.json({
        success: true,
        message: 'Recruiter message sent successfully',
        data: {
          message_id,
          sent_at: timestamp,
          message: newMessage
        }
      }, { status: 201 });

    } else if (action === 'create_template') {
      // Create new custom template
      const { name, category, subject, content, variables: templateVariables } = body;

      if (!name || !category || !subject || !content) {
        return NextResponse.json(
          {
            error: 'Missing required fields for template creation',
            required: ['name', 'category', 'subject', 'content']
          },
          { status: 400 }
        );
      }

      const template_id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTemplate = {
        id: template_id,
        name,
        category,
        subject,
        content,
        variables: templateVariables || [],
        created_by: recruiter_id,
        created_at: new Date().toISOString(),
        is_custom: true
      };

      messageTemplates.push(newTemplate);

      console.log(`✅ CUSTOM TEMPLATE CREATED:`, {
        template_id,
        name,
        category,
        created_by: recruiter_id
      });

      return NextResponse.json({
        success: true,
        message: 'Custom template created successfully',
        data: {
          template_id,
          template: newTemplate
        }
      }, { status: 201 });

    } else {
      return NextResponse.json(
        {
          error: 'Invalid action',
          valid_actions: ['send_message', 'create_template']
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ RECRUITER MESSAGE ERROR:', error);
    return NextResponse.json(
      {
        error: 'Failed to process recruiter action',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}