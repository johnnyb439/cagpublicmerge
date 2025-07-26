'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSupabase } from '@/hooks/useSupabase';
import ChatWindow from '@/components/chat/ChatWindow';
import { MessageCircle, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '@/contexts/SocketContext';

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const { onlineUsers } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const loadConversations = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, email, name, avatar_url),
          recipient:recipient_id(id, email, name, avatar_url)
        `)
        .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (messages) {
        const conversationMap = new Map<string, Conversation>();

        messages.forEach((message: any) => {
          const otherUser = message.sender_id === session.user.id 
            ? message.recipient 
            : message.sender;
          
          if (!conversationMap.has(otherUser.id)) {
            conversationMap.set(otherUser.id, {
              userId: otherUser.id,
              userName: otherUser.name || otherUser.email,
              userAvatar: otherUser.avatar_url,
              lastMessage: message.content,
              lastMessageTime: message.created_at,
              unreadCount: 0
            });
          }

          if (message.sender_id !== session.user.id && !message.read_at) {
            const conv = conversationMap.get(otherUser.id)!;
            conv.unreadCount++;
          }
        });

        setConversations(Array.from(conversationMap.values()));
      }

      setLoading(false);
    };

    loadConversations();

    const userIdFromUrl = searchParams.get('user');
    if (userIdFromUrl) {
      setSelectedUser(userIdFromUrl);
    }
  }, [session, searchParams, supabase]);

  useEffect(() => {
    if (selectedUser && conversations.length > 0) {
      const userData = conversations.find(c => c.userId === selectedUser);
      if (userData) {
        setSelectedUserData(userData);
      }
    }
  }, [selectedUser, conversations]);

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-2">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          <div className="border-r dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
              <h1 className="text-2xl font-bold mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {filteredConversations.map((conversation) => {
                    const isOnline = onlineUsers.has(conversation.userId);
                    const isSelected = selectedUser === conversation.userId;

                    return (
                      <button
                        key={conversation.userId}
                        onClick={() => setSelectedUser(conversation.userId)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <img
                              src={conversation.userAvatar || '/images/default-avatar.png'}
                              alt={conversation.userName}
                              className="w-12 h-12 rounded-full"
                            />
                            {isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {conversation.userName}
                              </h3>
                              {conversation.lastMessageTime && (
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(conversation.lastMessageTime), {
                                    addSuffix: true
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {conversation.lastMessage}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 h-full">
            {selectedUser && selectedUserData ? (
              <ChatWindow
                recipientId={selectedUser}
                recipientName={selectedUserData.userName}
                recipientAvatar={selectedUserData.userAvatar}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}