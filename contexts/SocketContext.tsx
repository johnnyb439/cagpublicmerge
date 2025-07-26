'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useSupabase } from '@/hooks/useSupabase';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  created_at: string;
  read_at?: string;
  senderEmail?: string;
  tempId?: string;
}

interface Notification {
  id: string;
  type: 'message' | 'job_alert' | 'application_update' | 'system';
  title: string;
  message?: string;
  data?: any;
  read: boolean;
  created_at: string;
}

interface OnlineUser {
  id: string;
  email: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Map<string, OnlineUser>;
  sendMessage: (recipientId: string, content: string, type?: string) => Promise<void>;
  markMessagesAsRead: (messageIds: string[], senderId: string) => void;
  setTyping: (recipientId: string, isTyping: boolean) => void;
  updatePresence: (status: string) => void;
  notifications: Notification[];
  unreadCount: number;
  markNotificationAsRead: (notificationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const supabase = useSupabase();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    };

    loadNotifications();

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: (session as any).access_token || session.user.id
      },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('user:status', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const updated = new Map(prev);
        if (updated.has(userId)) {
          updated.set(userId, {
            ...updated.get(userId)!,
            status,
            lastSeen: new Date().toISOString()
          });
        }
        return updated;
      });
    });

    socketInstance.on('users:online', (users: OnlineUser[]) => {
      const usersMap = new Map(users.map(user => [user.id, user]));
      setOnlineUsers(usersMap);
    });

    socketInstance.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png'
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session, supabase]);

  const sendMessage = async (recipientId: string, content: string, type = 'text') => {
    if (!socket) throw new Error('Socket not connected');

    const tempId = `temp-${Date.now()}`;
    
    return new Promise<void>((resolve, reject) => {
      socket.emit('message:send', {
        recipientId,
        content,
        type,
        tempId
      });

      const handleSent = (data: any) => {
        if (data.tempId === tempId) {
          socket.off('message:sent', handleSent);
          socket.off('message:error', handleError);
          resolve(undefined);
        }
      };

      const handleError = (data: any) => {
        if (data.tempId === tempId) {
          socket.off('message:sent', handleSent);
          socket.off('message:error', handleError);
          reject(new Error(data.error));
        }
      };

      socket.on('message:sent', handleSent);
      socket.on('message:error', handleError);

      setTimeout(() => {
        socket.off('message:sent', handleSent);
        socket.off('message:error', handleError);
        reject(new Error('Message send timeout'));
      }, 5000);
    });
  };

  const markMessagesAsRead = (messageIds: string[], senderId: string) => {
    if (!socket) return;
    socket.emit('message:read', { messageIds, senderId });
  };

  const setTyping = (recipientId: string, isTyping: boolean) => {
    if (!socket) return;
    socket.emit('message:typing', { recipientId, isTyping });
  };

  const updatePresence = (status: string) => {
    if (!socket) return;
    socket.emit('presence:update', { status });
  };

  const markNotificationAsRead = (notificationId: string) => {
    if (!socket) return;
    
    socket.emit('notification:read', { notificationId });
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    markMessagesAsRead,
    setTyping,
    updatePresence,
    notifications,
    unreadCount,
    markNotificationAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};