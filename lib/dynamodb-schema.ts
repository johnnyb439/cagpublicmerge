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
  }
};