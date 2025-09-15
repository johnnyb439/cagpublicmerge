// AWS Messaging Service
// Frontend service to connect to AWS backend for real-time messaging

import { awsConfig } from './aws-config';

class AWSMessagingService {
  private websocket: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string = '';

  // Initialize the messaging service
  async initialize(userId: string) {
    this.userId = userId;
    await this.connectWebSocket();
  }

  // Connect to AWS WebSocket API Gateway
  private async connectWebSocket() {
    try {
      const wsUrl = `${awsConfig.api.websocketUrl}?userId=${this.userId}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('✅ Connected to AWS WebSocket');
        this.reconnectAttempts = 0;
        this.sendPresenceUpdate('online');
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleIncomingMessage(data);
      };

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.websocket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  // Handle reconnection with exponential backoff
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

      setTimeout(() => {
        this.reconnectAttempts++;
        this.connectWebSocket();
      }, delay);
    }
  }

  // Send message through AWS Lambda
  async sendMessage(params: {
    conversationId: string;
    content: string;
    senderName: string;
    messageType?: 'text' | 'attachment';
    attachment?: any;
    replyTo?: string;
  }) {
    try {
      const response = await fetch(`${awsConfig.api.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...params,
          senderId: this.userId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get messages from DynamoDB
  async getMessages(conversationId: string, limit = 50, lastEvaluatedKey?: string) {
    try {
      const params = new URLSearchParams({
        conversationId,
        limit: limit.toString(),
        ...(lastEvaluatedKey && { lastEvaluatedKey })
      });

      const response = await fetch(`${awsConfig.api.baseUrl}/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Get conversations from DynamoDB
  async getConversations(limit = 20) {
    try {
      const response = await fetch(`${awsConfig.api.baseUrl}/conversations?userId=${this.userId}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get conversations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(params: {
    type: 'direct' | 'group' | 'channel';
    participants: string[];
    name?: string;
    category?: string;
  }) {
    try {
      const response = await fetch(`${awsConfig.api.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...params,
          createdBy: this.userId,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Upload attachment to S3
  async uploadAttachment(file: File, conversationId: string) {
    try {
      // Get pre-signed URL from Lambda
      const response = await fetch(`${awsConfig.api.baseUrl}/attachments/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${response.statusText}`);
      }

      const { uploadUrl, fileKey } = await response.json();

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      return {
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  // Send typing indicator
  sendTypingIndicator(conversationId: string, isTyping: boolean) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        action: 'typing',
        conversationId,
        userId: this.userId,
        isTyping
      }));
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, messageIds: string[]) {
    try {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          action: 'markRead',
          conversationId,
          messageIds,
          userId: this.userId
        }));
      }

      // Also update via REST API for persistence
      await fetch(`${awsConfig.api.baseUrl}/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          conversationId,
          messageIds,
          userId: this.userId,
          readAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Update user presence
  sendPresenceUpdate(status: 'online' | 'away' | 'busy' | 'offline', customStatus?: string) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        action: 'updatePresence',
        userId: this.userId,
        status,
        customStatus
      }));
    }
  }

  // Get online users by category
  async getOnlineUsers(category?: string) {
    try {
      const params = new URLSearchParams({
        ...(category && { category })
      });

      const response = await fetch(`${awsConfig.api.baseUrl}/users/online?${params}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get online users: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting online users:', error);
      throw error;
    }
  }

  // Handle incoming WebSocket messages
  private handleIncomingMessage(data: any) {
    console.log('📨 Incoming message:', data);

    switch (data.type) {
      case 'new_message':
        this.messageHandlers.forEach(handler => handler(data));
        break;

      case 'typing_indicator':
        // Handle typing indicator
        break;

      case 'read_receipt':
        // Handle read receipt
        break;

      case 'presence_update':
        // Handle presence update
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Register message handler
  onMessage(id: string, handler: (data: any) => void) {
    this.messageHandlers.set(id, handler);
  }

  // Unregister message handler
  offMessage(id: string) {
    this.messageHandlers.delete(id);
  }

  // Get authentication token from Cognito
  private async getAuthToken(): Promise<string> {
    // In production, get token from Cognito
    // For now, return a placeholder
    return 'cognito-jwt-token';
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.websocket) {
      this.sendPresenceUpdate('offline');
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Export singleton instance
export const messagingService = new AWSMessagingService();