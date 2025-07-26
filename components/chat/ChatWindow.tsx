'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useSupabase } from '@/hooks/useSupabase';
import { useSession } from 'next-auth/react';
import { Send, Paperclip, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  type: string;
  created_at: string;
  read_at?: string;
}

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export default function ChatWindow({ recipientId, recipientName, recipientAvatar }: ChatWindowProps) {
  const { data: session } = useSession();
  const { socket, sendMessage, markMessagesAsRead, setTyping, onlineUsers } = useSocket();
  const supabase = useSupabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTypingState] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recipientStatus = onlineUsers.get(recipientId);
  const isOnline = recipientStatus?.status === 'online';

  useEffect(() => {
    if (!session?.user) return;

    const loadMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${session.user.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        const unreadMessages = data
          .filter((m: Message) => m.sender_id === recipientId && !m.read_at)
          .map((m: Message) => m.id);
        
        if (unreadMessages.length > 0) {
          markMessagesAsRead(unreadMessages, recipientId);
        }
      }
      setLoading(false);
    };

    loadMessages();

    if (socket) {
      socket.emit('conversation:join', { conversationId: `${session.user.id}-${recipientId}` });

      const handleNewMessage = (message: Message) => {
        if (
          (message.sender_id === recipientId && message.recipient_id === session.user.id) ||
          (message.sender_id === session.user.id && message.recipient_id === recipientId)
        ) {
          setMessages(prev => [...prev, message]);
          
          if (message.sender_id === recipientId) {
            markMessagesAsRead([message.id], recipientId);
          }
        }
      };

      const handleTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
        if (userId === recipientId) {
          setRecipientTyping(isTyping);
        }
      };

      const handleMessageRead = ({ messageIds }: { messageIds: string[] }) => {
        setMessages(prev => 
          prev.map(msg => 
            messageIds.includes(msg.id) 
              ? { ...msg, read_at: new Date().toISOString() }
              : msg
          )
        );
      };

      socket.on('message:receive', handleNewMessage);
      socket.on('message:typing', handleTyping);
      socket.on('message:read', handleMessageRead);

      return () => {
        socket.off('message:receive', handleNewMessage);
        socket.off('message:typing', handleTyping);
        socket.off('message:read', handleMessageRead);
      };
    }
  }, [session, recipientId, socket, supabase, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !session?.user) return;

    try {
      await sendMessage(recipientId, inputMessage.trim());
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!typing) {
      setTyping(recipientId, true);
      setTypingState(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(recipientId, false);
      setTypingState(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={recipientAvatar || '/images/default-avatar.png'}
              alt={recipientName}
              className="w-10 h-10 rounded-full"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{recipientName}</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Active now' : recipientStatus ? `Last seen ${formatDistanceToNow(new Date(recipientStatus.lastSeen), { addSuffix: true })}` : 'Offline'}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === session?.user?.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                  {isOwn && (
                    message.read_at ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {recipientTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}