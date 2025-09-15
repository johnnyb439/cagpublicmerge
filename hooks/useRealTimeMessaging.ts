import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  sent_at: string;
}

interface RealTimeMessage {
  type: string;
  conversation_id?: string;
  sender_id?: string;
  message?: Message;
  timestamp: string;
  data?: any;
}

interface UseRealTimeMessagingProps {
  user_id: string;
  conversation_id?: string;
  onMessage?: (message: RealTimeMessage) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export const useRealTimeMessaging = ({
  user_id,
  conversation_id,
  onMessage,
  onConnectionChange
}: UseRealTimeMessagingProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<RealTimeMessage[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  // 🔌 ESTABLISH REAL-TIME CONNECTION - FREE TIER!
  const connect = useCallback(() => {
    if (!user_id) {
      console.warn('⚠️ Cannot connect: user_id is required');
      return;
    }

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Build connection URL with current origin
      const baseUrl = window.location.origin;
      const url = new URL('/api/messaging/realtime', baseUrl);
      url.searchParams.set('user_id', user_id);
      if (conversation_id) {
        url.searchParams.set('conversation_id', conversation_id);
      }

      console.log(`🔌 CONNECTING TO REAL-TIME MESSAGING:`, {
        user_id,
        conversation_id,
        url: url.toString()
      });

      // Create Server-Sent Events connection
      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ REAL-TIME CONNECTION ESTABLISHED');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        onConnectionChange?.(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: RealTimeMessage = JSON.parse(event.data);

          console.log(`⚡ REAL-TIME MESSAGE RECEIVED:`, {
            type: data.type,
            conversation_id: data.conversation_id,
            sender_id: data.sender_id,
            timestamp: data.timestamp
          });

          // Add to messages array
          setMessages(prev => [...prev, data]);

          // Call custom handler
          onMessage?.(data);

          // Handle different message types
          switch (data.type) {
            case 'connection_established':
              console.log('🔥 Real-time messaging ready!');
              break;

            case 'new_message':
              // Show browser notification if supported
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Message', {
                  body: data.message?.content?.substring(0, 100) || 'You have a new message',
                  icon: '/favicon.ico'
                });
              }
              break;

            case 'user_joined_channel':
              console.log(`👋 User joined channel: ${data.data?.user_name}`);
              break;

            case 'typing_indicator':
              console.log(`✏️ ${data.data?.user_name} is typing...`);
              break;

            case 'keep_alive':
              // Connection health check - do nothing
              break;
          }

        } catch (error) {
          console.error('❌ Error parsing real-time message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ REAL-TIME CONNECTION ERROR:', error);
        setIsConnected(false);
        setConnectionError('Connection lost');
        onConnectionChange?.(false);

        // Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/5)`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setConnectionError('Failed to reconnect after 5 attempts');
        }
      };

    } catch (error) {
      console.error('❌ Failed to establish real-time connection:', error);
      setConnectionError('Failed to connect');
      onConnectionChange?.(false);
    }
  }, [user_id, conversation_id, onMessage, onConnectionChange]);

  // 📤 SEND REAL-TIME MESSAGE
  const sendRealTimeMessage = useCallback(async (type: string, data: any) => {
    try {
      const response = await fetch('/api/messaging/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          sender_id: user_id,
          conversation_id,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log(`⚡ REAL-TIME MESSAGE SENT:`, { type, result });
      return result;

    } catch (error) {
      console.error('❌ Failed to send real-time message:', error);
      throw error;
    }
  }, [user_id, conversation_id]);

  // 🔌 DISCONNECT
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    onConnectionChange?.(false);

    console.log('🔌 REAL-TIME CONNECTION CLOSED');
  }, [onConnectionChange]);

  // 🔄 RECONNECT
  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // 📝 SEND TYPING INDICATOR
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (isConnected) {
      sendRealTimeMessage('typing_indicator', {
        is_typing: isTyping,
        user_name: 'Current User' // In production, get from user context
      }).catch(console.error);
    }
  }, [isConnected, sendRealTimeMessage]);

  // 🚀 AUTO-CONNECT ON MOUNT
  useEffect(() => {
    connect();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 🔄 RECONNECT ON user_id OR conversation_id CHANGE
  useEffect(() => {
    if (eventSourceRef.current) {
      reconnect();
    }
  }, [user_id, conversation_id, reconnect]);

  return {
    // Connection state
    isConnected,
    connectionError,

    // Messages
    messages,

    // Actions
    sendRealTimeMessage,
    sendTypingIndicator,
    reconnect,
    disconnect,

    // Clear messages (for UI state management)
    clearMessages: () => setMessages([])
  };
};