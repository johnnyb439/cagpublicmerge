// DynamoDB Table Schemas for CAG Messaging Platform
// These define the structure of our AWS DynamoDB tables

// CONVERSATIONS TABLE
export interface ConversationItem {
  conversationId: string;          // Partition Key (PK)
  createdAt: string;               // Sort Key (SK)
  type: 'direct' | 'group' | 'channel';
  participants: string[];          // Array of user IDs
  lastMessage?: {
    messageId: string;
    content: string;
    senderId: string;
    timestamp: string;
  };
  metadata?: {
    name?: string;                 // For group chats
    category?: string;              // For IT category channels
    isRecruiter?: boolean;
    isOfficial?: boolean;
  };
  unreadCounts: { [userId: string]: number };
  updatedAt: string;
}

// MESSAGES TABLE
export interface MessageItem {
  conversationId: string;          // Partition Key (PK)
  messageId: string;               // Sort Key (SK) - timestamp#uuid format
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'attachment' | 'system';
  timestamp: string;

  // Read receipts
  deliveredTo?: string[];          // User IDs who received the message
  readBy?: string[];               // User IDs who read the message
  deliveredAt?: { [userId: string]: string };
  readAt?: { [userId: string]: string };

  // Additional features
  reactions?: { [emoji: string]: string[] };
  attachment?: {
    fileKey: string;               // S3 object key
    fileName: string;
    fileSize: number;
    fileType: string;
    url?: string;                  // Pre-signed S3 URL
  };
  editedAt?: string;
  replyTo?: string;                // Message ID being replied to
  deleted?: boolean;
}

// USERS TABLE (Extended for messaging)
export interface UserProfileItem {
  userId: string;                   // Partition Key (PK)
  email: string;
  name: string;
  title?: string;
  company?: string;
  category?: string;                // IT job category

  // Messaging preferences
  preferences: {
    showOnlineStatus: boolean;
    readReceipts: boolean;
    messageNotifications: boolean;
    incognitoMode: boolean;
  };

  // Privacy settings
  privacy: {
    onlineVisibility: 'everyone' | 'contacts' | 'custom' | 'no-recruiters';
    blockedUsers: string[];
    allowedUsers: string[];
    blockedGroups: string[];        // e.g., ['recruiters']
  };

  // Professional info
  professional: {
    skills?: string[];
    certifications?: string[];
    yearsExperience?: number;
    clearanceLevel?: string;
    willingToChat: boolean;
    availableForOpportunities: boolean;
  };

  createdAt: string;
  updatedAt: string;
}

// USER PRESENCE TABLE (TTL enabled for auto-cleanup)
export interface UserPresenceItem {
  userId: string;                   // Partition Key (PK)
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  customStatus?: string;
  activeConversations?: string[];   // Currently viewing these conversations
  typingIn?: string;                // Conversation ID where user is typing
  ttl?: number;                     // Time-to-live for auto-deletion (Unix timestamp)
}

// Global Secondary Indexes (GSI) needed:
// 1. conversations-by-participant: participant-index (participantId as PK)
// 2. messages-by-sender: sender-index (senderId as PK)
// 3. users-by-category: category-index (category as PK)
// 4. users-by-company: company-index (company as PK)

// CERTIFICATION CATALOG TABLE
export interface CertificationCatalogItem {
  certId: string;                   // Partition Key (PK) - e.g., 'comptia-security-plus'
  vendor: string;                    // CompTIA, AWS, Cisco, etc.
  name: string;                      // Full certification name
  level: 'entry' | 'associate' | 'professional' | 'expert';
  category: 'security' | 'cloud' | 'network' | 'database' | 'devops' | 'project';
  renewalCycleMonths: number;        // How often to renew (e.g., 36 for 3 years)
  recommendedNextCerts: string[];    // Array of certId values for next certs
  prepResources: {
    official?: string;               // Official vendor training URL
    udemy?: string;                  // Udemy course URL
    coursera?: string;               // Coursera course URL
    examTopics?: string;             // Practice exam URL
  };
  avgSalaryBoost: number;            // Percentage salary increase
  demandScore: number;               // 1-10 scale for job market demand
  requiredExperience?: number;      // Years of experience recommended
  prerequisites?: string[];          // Other certIds required first
}

// USER CERTIFICATIONS TABLE
export interface UserCertificationItem {
  userId: string;                    // Partition Key (PK)
  certId: string;                    // Sort Key (SK) - matches CertificationCatalogItem.certId
  dateEarned: string;                // ISO date string
  expiryDate?: string;               // ISO date string (if applicable)
  credentialId?: string;             // Vendor-provided credential ID
  status: 'active' | 'expiring_soon' | 'expired' | 'planned';
  verificationUrl?: string;          // Link to verify certification
  score?: number;                    // Exam score if available
  renewalReminderSent?: {
    '90days'?: boolean;
    '60days'?: boolean;
    '30days'?: boolean;
  };
  notes?: string;                    // Personal notes about the cert
  createdAt: string;
  updatedAt: string;
}

// CAREER ROADMAP TABLE
export interface CareerRoadmapItem {
  userId: string;                    // Partition Key (PK)
  roadmapId: string;                 // Sort Key (SK) - UUID
  currentRole?: string;              // Current job title
  targetRole?: string;               // Desired job title
  targetSalary?: number;             // Desired salary
  timelineMonths?: number;           // How long to achieve goal
  plannedCerts: {
    certId: string;
    targetDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'not_started' | 'studying' | 'scheduled' | 'completed';
  }[];
  milestones: {
    date: string;
    description: string;
    achieved: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const DynamoDBTables = {
  conversations: {
    name: 'cag-conversations',
    partitionKey: 'conversationId',
    sortKey: 'createdAt',
    gsi: ['participant-index']
  },
  messages: {
    name: 'cag-messages',
    partitionKey: 'conversationId',
    sortKey: 'messageId',
    gsi: ['sender-index']
  },
  users: {
    name: 'cag-users',
    partitionKey: 'userId',
    gsi: ['category-index', 'company-index']
  },
  presence: {
    name: 'cag-user-presence',
    partitionKey: 'userId',
    ttl: true  // Enable TTL for automatic cleanup
  },
  certificationCatalog: {
    name: 'cag-certification-catalog',
    partitionKey: 'certId'
  },
  userCertifications: {
    name: 'cag-user-certifications',
    partitionKey: 'userId',
    sortKey: 'certId',
    gsi: ['expiry-index', 'status-index']
  },
  careerRoadmaps: {
    name: 'cag-career-roadmaps',
    partitionKey: 'userId',
    sortKey: 'roadmapId'
  }
};