import { Message, Conversation } from '@/types/communications'

export class MessagingService {
  private messages: Message[] = []
  private conversations: Conversation[] = []
  
  constructor() {
    this.initializeDemoData()
  }
  
  private initializeDemoData() {
    // Demo conversation with recruiter
    const demoConversation: Conversation = {
      id: 'conv_1',
      participants: [
        {
          id: 'demo-user',
          name: 'John Doe',
          role: 'candidate',
          avatar: '/avatars/user.jpg'
        },
        {
          id: 'recruiter_1',
          name: 'Sarah Johnson',
          role: 'recruiter',
          avatar: '/avatars/recruiter.jpg'
        }
      ],
      jobId: 'job_1',
      jobTitle: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      unreadCount: 2,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }
    
    const demoMessages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        senderId: 'recruiter_1',
        recipientId: 'demo-user',
        subject: 'Senior Software Engineer Position',
        content: `Hi John,

I hope this message finds you well. I came across your profile and I'm impressed by your background in software development. We have an exciting opportunity for a Senior Software Engineer position at TechCorp Solutions that I think would be a perfect match for your skills.

The role involves:
- Leading development of cloud-native applications
- Mentoring junior developers
- Working with cutting-edge technologies including React, Node.js, and AWS
- Security clearance required: Secret

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss the details.

Best regards,
Sarah Johnson
Senior Technical Recruiter
TechCorp Solutions`,
        read: true,
        sentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        readAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'msg_2',
        conversationId: 'conv_1',
        senderId: 'demo-user',
        recipientId: 'recruiter_1',
        content: `Hi Sarah,

Thank you for reaching out! I'm definitely interested in learning more about the Senior Software Engineer position. The role sounds like an excellent fit for my background and career goals.

I have experience with all the technologies you mentioned, and I currently hold a Secret clearance. I'd be happy to schedule a call to discuss the opportunity in more detail.

I'm available for a phone call:
- Tomorrow between 2-5 PM EST
- Thursday between 10 AM - 12 PM EST
- Friday between 1-4 PM EST

Looking forward to hearing from you!

Best regards,
John Doe`,
        read: true,
        sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        readAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString()
      },
      {
        id: 'msg_3',
        conversationId: 'conv_1',
        senderId: 'recruiter_1',
        recipientId: 'demo-user',
        content: `Hi John,

Perfect! I'd like to schedule our call for Thursday at 10:30 AM EST. I'll send you a calendar invite shortly.

In preparation for our call, could you please send me:
1. Your most recent resume
2. Any relevant portfolio or GitHub links
3. Your salary expectations for this role

I'm excited to discuss this opportunity with you!

Best regards,
Sarah`,
        attachments: [
          {
            name: 'Job_Description_Senior_SE.pdf',
            url: '/documents/job_description.pdf',
            type: 'application/pdf'
          }
        ],
        read: false,
        sentAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: 'msg_4',
        conversationId: 'conv_1',
        senderId: 'recruiter_1',
        recipientId: 'demo-user',
        content: `Hi John,

Just wanted to follow up on our scheduled call tomorrow. I've attached the detailed job description for your review.

Looking forward to speaking with you!

Sarah`,
        read: false,
        sentAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ]
    
    demoConversation.lastMessage = demoMessages[demoMessages.length - 1]
    
    this.conversations.push(demoConversation)
    this.messages.push(...demoMessages)
  }
  
  getConversations(userId: string): Conversation[] {
    return this.conversations.filter(conv => 
      conv.participants.some(p => p.id === userId)
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.find(conv => conv.id === conversationId)
  }
  
  getMessages(conversationId: string): Message[] {
    return this.messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
  }
  
  sendMessage(
    conversationId: string,
    senderId: string,
    recipientId: string,
    content: string,
    subject?: string,
    attachments?: { name: string; url: string; type: string }[]
  ): Message {
    const message: Message = {
      id: this.generateId(),
      conversationId,
      senderId,
      recipientId,
      subject,
      content,
      attachments,
      read: false,
      sentAt: new Date().toISOString()
    }
    
    this.messages.push(message)
    
    // Update conversation
    const conversation = this.getConversation(conversationId)
    if (conversation) {
      conversation.lastMessage = message
      conversation.updatedAt = message.sentAt
      conversation.unreadCount += 1
    }
    
    return message
  }
  
  markAsRead(messageId: string): void {
    const message = this.messages.find(m => m.id === messageId)
    if (message && !message.read) {
      message.read = true
      message.readAt = new Date().toISOString()
      
      // Update conversation unread count
      const conversation = this.getConversation(message.conversationId)
      if (conversation && conversation.unreadCount > 0) {
        conversation.unreadCount -= 1
      }
    }
  }
  
  markConversationAsRead(conversationId: string, userId: string): void {
    const messages = this.getMessages(conversationId)
    messages
      .filter(msg => msg.recipientId === userId && !msg.read)
      .forEach(msg => {
        msg.read = true
        msg.readAt = new Date().toISOString()
      })
    
    // Reset unread count
    const conversation = this.getConversation(conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
  }
  
  createConversation(
    participants: { id: string; name: string; role: 'candidate' | 'recruiter' | 'admin'; avatar?: string }[],
    jobId?: string,
    jobTitle?: string,
    company?: string
  ): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      participants,
      jobId,
      jobTitle,
      company,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.conversations.push(conversation)
    return conversation
  }
  
  searchMessages(userId: string, query: string): Message[] {
    const userConversations = this.getConversations(userId)
    const conversationIds = userConversations.map(c => c.id)
    
    return this.messages.filter(msg => 
      conversationIds.includes(msg.conversationId) &&
      (msg.content.toLowerCase().includes(query.toLowerCase()) ||
       msg.subject?.toLowerCase().includes(query.toLowerCase()))
    )
  }
  
  getUnreadCount(userId: string): number {
    return this.getConversations(userId)
      .reduce((total, conv) => total + conv.unreadCount, 0)
  }
  
  private generateId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
}

// Export singleton instance
export const messagingService = new MessagingService()