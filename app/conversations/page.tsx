'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRealTimeMessaging } from '../../hooks/useRealTimeMessaging';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  reactions?: { [emoji: string]: string[] };
  is_read?: boolean;
  is_delivered?: boolean;
  read_at?: string;
  delivered_at?: string;
  is_edited?: boolean;
  reply_to?: string;
  attachment?: {
    name: string;
    size: number;
    type: string;
  };
}

interface Conversation {
  id: string;
  type: string;
  participant: {
    id: string;
    name: string;
    title: string;
    avatar_color: string;
    status: string;
  };
  last_message: {
    content: string;
    timestamp: string;
    sender: string;
    preview: string;
    time_ago: string;
    formatted_time: string;
    formatted_date: string;
  };
  message_count: number;
  is_recruiter?: boolean;
  is_official?: boolean;
  messages?: Message[];
  typing_users?: string[];
}

// IT Job Categories
const itCategories = [
  { id: 'all', name: 'All Professionals', icon: '👥', color: 'from-blue-500 to-purple-500' },
  { id: 'network', name: 'Network Engineers', icon: '🌐', color: 'from-blue-500 to-cyan-500' },
  { id: 'cloud', name: 'Cloud Architects', icon: '☁️', color: 'from-purple-500 to-pink-500' },
  { id: 'security', name: 'Security Analysts', icon: '🔒', color: 'from-red-500 to-orange-500' },
  { id: 'devops', name: 'DevOps Engineers', icon: '🔧', color: 'from-green-500 to-teal-500' },
  { id: 'database', name: 'Database Admins', icon: '💾', color: 'from-yellow-500 to-orange-500' },
  { id: 'helpdesk', name: 'Help Desk', icon: '🎧', color: 'from-indigo-500 to-purple-500' },
  { id: 'systems', name: 'Systems Admins', icon: '🖥️', color: 'from-gray-500 to-blue-500' },
];

// Sample professionals by category
const professionalsByCategory: { [key: string]: any[] } = {
  network: [
    { id: 'p1', name: 'John Smith', title: 'Senior Network Engineer', company: 'TechCorp', status: 'online', willingToChat: true },
    { id: 'p2', name: 'Sarah Johnson', title: 'Network Architect', company: 'DataFlow', status: 'online', willingToChat: true },
    { id: 'p3', name: 'Mike Chen', title: 'Network Admin', company: 'SecureNet', status: 'away', willingToChat: false },
  ],
  cloud: [
    { id: 'p4', name: 'Emily Davis', title: 'AWS Solutions Architect', company: 'CloudFirst', status: 'online', willingToChat: true },
    { id: 'p5', name: 'David Wilson', title: 'Azure Specialist', company: 'Microsoft Partner', status: 'online', willingToChat: true },
  ],
  security: [
    { id: 'p6', name: 'Alex Thompson', title: 'SOC Analyst III', company: 'CyberDefense', status: 'online', willingToChat: true },
    { id: 'p7', name: 'Jessica Martinez', title: 'Security Engineer', company: 'DefenseCorp', status: 'busy', willingToChat: false },
  ],
  devops: [
    { id: 'p8', name: 'Ryan Kumar', title: 'Senior DevOps Engineer', company: 'TechStartup', status: 'online', willingToChat: true },
  ],
  all: [] // Will be populated with all professionals
};

// Combine all professionals for 'all' category
professionalsByCategory.all = Object.values(professionalsByCategory)
  .filter(arr => Array.isArray(arr))
  .flat();

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [onlineVisibility, setOnlineVisibility] = useState<'everyone' | 'contacts' | 'custom' | 'no-recruiters'>('everyone');
  const [blockedGroups, setBlockedGroups] = useState<string[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [showCustomListModal, setShowCustomListModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [listMode, setListMode] = useState<'allow' | 'block'>('allow');
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUserDiscovery, setShowUserDiscovery] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current user (in production, get from auth context)
  const currentUserId = 'user_tone123';
  const currentUserName = 'Terrence Morris';

  // Real-time messaging hook
  const {
    isConnected,
    sendRealTimeMessage,
    sendTypingIndicator,
    messages: realTimeMessages
  } = useRealTimeMessaging({
    user_id: currentUserId,
    conversation_id: selectedConversation?.id
  });

  // Popular reaction emojis
  const reactionEmojis = ['🔥', '💪', '👑', '💯', '🚀', '❤️', '👍', '😂'];

  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle real-time messages
  useEffect(() => {
    if (realTimeMessages.length > 0) {
      const latestMessage = realTimeMessages[realTimeMessages.length - 1];
      if (latestMessage.type === 'new_message' && latestMessage.message) {
        const newMessage: Message = {
          id: latestMessage.message.id,
          content: latestMessage.message.content,
          sender_id: latestMessage.message.sender_id,
          sender_name: latestMessage.sender_id === currentUserId ? currentUserName : selectedConversation?.participant.name || 'Unknown',
          timestamp: latestMessage.message.sent_at,
          is_read: false
        };
        setMessages(prev => [...prev, newMessage]);
      }
    }
  }, [realTimeMessages, currentUserId, selectedConversation]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    // In production, fetch from API
    // For now, create sample messages
    const sampleMessages: Message[] = [
      {
        id: 'msg_1',
        content: selectedConversation?.last_message.content || '',
        sender_id: selectedConversation?.participant.id || '',
        sender_name: selectedConversation?.participant.name || '',
        timestamp: selectedConversation?.last_message.timestamp || new Date().toISOString(),
        reactions: { '🔥': ['user_tone123'] },
        is_delivered: true,
        is_read: true,
        delivered_at: new Date(Date.now() - 120000).toISOString(),
        read_at: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: 'msg_2',
        content: 'Thanks for reaching out! I\'d be happy to discuss this opportunity.',
        sender_id: currentUserId,
        sender_name: currentUserName,
        timestamp: new Date().toISOString(),
        is_delivered: true,
        is_read: true,
        delivered_at: new Date(Date.now() - 30000).toISOString(),
        read_at: new Date(Date.now() - 15000).toISOString()
      }
    ];
    setMessages(sampleMessages);
  }, [selectedConversation, currentUserId, currentUserName]);

  // Handle conversation selection
  const handleConversationSelect = useCallback((conv: Conversation) => {
    setSelectedConversation(conv);
    loadMessages(conv.id);
    setShowEmojiPicker(null);
  }, [loadMessages]);

  // Send message
  const sendMessage = useCallback(async () => {
    if ((!messageInput.trim() && !attachedFile) || !selectedConversation) return;

    let messageContent = messageInput;
    if (attachedFile) {
      messageContent = `📎 Attached: ${attachedFile.name}\n${messageInput}`;
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      content: messageContent,
      sender_id: currentUserId,
      sender_name: currentUserName,
      timestamp: new Date().toISOString(),
      is_delivered: false,
      is_read: false
    };

    // Add to local state immediately
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setAttachedFile(null);

    // Simulate delivery after 1 second
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === newMessage.id
          ? { ...msg, is_delivered: true, delivered_at: new Date().toISOString() }
          : msg
      ));
    }, 1000);

    // Simulate read receipt after 2-3 seconds (if not in incognito)
    if (!incognitoMode && showReadReceipts) {
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        ));
      }, 2000 + Math.random() * 1000);
    }

    // Send via real-time connection
    if (isConnected && !incognitoMode) {  // Don't send real-time in incognito
      await sendRealTimeMessage('new_message', {
        conversation_id: selectedConversation.id,
        content: messageContent,
        message_type: attachedFile ? 'attachment' : 'text',
        attachment: attachedFile ? {
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type
        } : undefined
      });
    }
  }, [messageInput, attachedFile, selectedConversation, currentUserId, currentUserName, isConnected, incognitoMode, sendRealTimeMessage]);

  // Handle typing indicator
  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  }, [isTyping, sendTypingIndicator]);

  // Add reaction to message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || {};
        const users = reactions[emoji] || [];

        if (users.includes(currentUserId)) {
          // Remove reaction
          reactions[emoji] = users.filter(id => id !== currentUserId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          // Add reaction
          reactions[emoji] = [...users, currentUserId];
        }

        return { ...msg, reactions };
      }
      return msg;
    }));
    setShowEmojiPicker(null);
  }, [currentUserId]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/messaging/conversations-list?user_id=user_tone123');
      const data = await response.json();

      if (data.success) {
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getConversationBadge = (conv: Conversation) => {
    if (conv.is_official) return '🏢 CAG';
    if (conv.is_recruiter) return '💼 Recruiter';
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">💬 Messages</h1>
              <p className="text-sm text-gray-300">
                {conversations.length} conversations • {conversations.filter(c => c.last_message.sender !== 'user_tone123').length} unread
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* User Discovery Section */}
        {showUserDiscovery && (
          <div className="mb-6">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Find IT Professionals</h2>
                <button
                  onClick={() => setShowUserDiscovery(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {itCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Professionals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(professionalsByCategory[selectedCategory] || []).map(professional => (
                  <div
                    key={professional.id}
                    className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => {
                      // Start conversation with this professional
                      const newConv = {
                        id: `conv_${professional.id}`,
                        type: 'direct',
                        participant: {
                          id: professional.id,
                          name: professional.name,
                          title: `${professional.title} @ ${professional.company}`,
                          avatar_color: 'from-blue-500 to-green-500',
                          status: professional.status
                        },
                        last_message: {
                          content: 'Start a conversation...',
                          timestamp: new Date().toISOString(),
                          sender: professional.id,
                          preview: 'Start a conversation...',
                          time_ago: 'Now',
                          formatted_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          formatted_date: new Date().toLocaleDateString()
                        },
                        message_count: 0
                      };
                      setConversations(prev => [newConv, ...prev]);
                      setSelectedConversation(newConv);
                      setShowUserDiscovery(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 bg-gradient-to-r ${itCategories.find(c => c.id === selectedCategory)?.color || 'from-gray-500 to-gray-600'} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                          {professional.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${
                          professional.status === 'online' ? 'bg-green-500' :
                          professional.status === 'away' ? 'bg-yellow-500' :
                          professional.status === 'busy' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{professional.name}</h4>
                        <p className="text-xs text-gray-400 truncate">{professional.title}</p>
                        <p className="text-xs text-gray-500 truncate">{professional.company}</p>

                        <div className="flex items-center gap-2 mt-1">
                          {professional.willingToChat ? (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              Available to chat
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Not available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No results */}
              {(!professionalsByCategory[selectedCategory] || professionalsByCategory[selectedCategory].length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <p>No professionals in this category yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">

              {/* Search and Discover */}
              <div className="p-4 border-b border-gray-700">
                <button
                  onClick={() => setShowUserDiscovery(!showUserDiscovery)}
                  className="w-full mb-3 bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Discover IT Professionals</span>
                </button>

                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 text-sm"
                />
              </div>

              {/* Conversations */}
              <div className="divide-y divide-gray-700 overflow-y-auto" style={{ maxHeight: '70vh' }}>
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleConversationSelect(conv)}
                      className={`p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-gray-700 border-r-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 bg-gradient-to-r ${conv.participant.avatar_color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                            {conv.participant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(conv.participant.status)}`}></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white text-sm truncate">
                                {conv.participant.name}
                              </h3>
                              {getConversationBadge(conv) && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                  {getConversationBadge(conv)}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {conv.last_message.time_ago}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 mb-2 truncate">
                            {conv.participant.title}
                          </p>

                          <p className="text-sm text-gray-300 line-clamp-2 leading-tight">
                            {conv.last_message.preview}
                          </p>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              {conv.message_count} messages
                            </span>
                            {conv.last_message.sender !== 'user_tone123' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col" style={{ height: '70vh' }}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 bg-gradient-to-r ${selectedConversation.participant.avatar_color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                          {selectedConversation.participant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(selectedConversation.participant.status)}`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-white text-sm truncate">
                          {selectedConversation.participant.name}
                          {getConversationBadge(selectedConversation) && (
                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                              {getConversationBadge(selectedConversation)}
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-gray-400 truncate">
                          {selectedConversation.participant.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Settings Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                          >
                            <span className="text-sm">Settings</span>
                            <svg className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showSettings && (
                            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20">
                              <div className="p-4 border-b border-gray-700">
                                <h3 className="text-white font-semibold">Privacy Settings</h3>
                              </div>

                              <div className="p-4 space-y-4">
                                {/* Incognito Mode */}
                                <label className="flex items-center justify-between cursor-pointer hover:bg-gray-800 p-2 rounded">
                                  <span className="text-sm text-gray-300">Incognito Mode</span>
                                  <input
                                    type="checkbox"
                                    checked={incognitoMode}
                                    onChange={(e) => setIncognitoMode(e.target.checked)}
                                    className="rounded text-blue-600"
                                  />
                                </label>

                                {/* Read Receipts */}
                                <label className="flex items-center justify-between cursor-pointer hover:bg-gray-800 p-2 rounded">
                                  <div>
                                    <span className="text-sm text-gray-300">Read Receipts</span>
                                    <p className="text-xs text-gray-500 mt-0.5">Show when messages are read</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={showReadReceipts && !incognitoMode}
                                    disabled={incognitoMode}
                                    onChange={(e) => setShowReadReceipts(e.target.checked)}
                                    className="rounded text-blue-600 disabled:opacity-50"
                                  />
                                </label>

                                {/* Online Status Visibility */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-300">Who can see I'm online</span>
                                    <button
                                      onClick={() => {
                                        setShowCustomListModal(true);
                                        setShowSettings(false);
                                      }}
                                      className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      Customize
                                    </button>
                                  </div>

                                  <select
                                    value={onlineVisibility}
                                    onChange={(e) => {
                                      const value = e.target.value as typeof onlineVisibility;
                                      setOnlineVisibility(value);
                                      if (value === 'no-recruiters' && !blockedGroups.includes('Recruiters')) {
                                        setBlockedGroups([...blockedGroups, 'Recruiters']);
                                      }
                                    }}
                                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-300"
                                  >
                                    <option value="everyone">Everyone</option>
                                    <option value="contacts">My Contacts Only</option>
                                    <option value="no-recruiters">Everyone except Recruiters</option>
                                    <option value="custom">Custom List</option>
                                  </select>

                                  {/* Show active restrictions */}
                                  {(blockedGroups.length > 0 || blockedUsers.length > 0 || allowedUsers.length > 0) && (
                                    <div className="p-2 bg-gray-800 rounded text-xs space-y-1">
                                      {blockedGroups.length > 0 && (
                                        <div className="text-red-400">
                                          Blocked: {blockedGroups.join(', ')}
                                        </div>
                                      )}
                                      {allowedUsers.length > 0 && onlineVisibility === 'custom' && (
                                        <div className="text-green-400">
                                          Visible to: {allowedUsers.slice(0, 2).join(', ')}
                                          {allowedUsers.length > 2 && ` +${allowedUsers.length - 2} more`}
                                        </div>
                                      )}
                                      {blockedUsers.length > 0 && (
                                        <div className="text-red-400">
                                          Hidden from: {blockedUsers.slice(0, 2).join(', ')}
                                          {blockedUsers.length > 2 && ` +${blockedUsers.length - 2} more`}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-3 border-t border-gray-700 text-xs text-gray-500 space-y-1">
                                  {incognitoMode && <div>• Read receipts disabled</div>}
                                  {!showReadReceipts && !incognitoMode && <div>• Read receipts turned off</div>}
                                  {onlineVisibility === 'no-recruiters' && <div>• Hidden from recruiters</div>}
                                  {onlineVisibility === 'custom' && <div>• Custom visibility active</div>}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Custom List Modal */}
                          {showCustomListModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-gray-900 border border-gray-700 rounded-lg w-[450px] max-h-[600px] overflow-hidden">
                                <div className="p-4 border-b border-gray-700">
                                  <h3 className="text-white font-semibold">Manage Online Status Visibility</h3>
                                  <p className="text-xs text-gray-400 mt-1">Control who can see when you're online</p>
                                </div>

                                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                                  {/* Quick Options */}
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-300">Quick Settings</h4>
                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700">
                                        <input
                                          type="checkbox"
                                          checked={blockedGroups.includes('Recruiters')}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setBlockedGroups([...blockedGroups, 'Recruiters']);
                                            } else {
                                              setBlockedGroups(blockedGroups.filter(g => g !== 'Recruiters'));
                                            }
                                          }}
                                          className="rounded text-blue-600"
                                        />
                                        <span className="text-sm text-gray-300">Hide from all Recruiters</span>
                                      </label>
                                      <label className="flex items-center gap-2 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700">
                                        <input
                                          type="checkbox"
                                          checked={blockedGroups.includes('Unknown')}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setBlockedGroups([...blockedGroups, 'Unknown']);
                                            } else {
                                              setBlockedGroups(blockedGroups.filter(g => g !== 'Unknown'));
                                            }
                                          }}
                                          className="rounded text-blue-600"
                                        />
                                        <span className="text-sm text-gray-300">Hide from unknown contacts</span>
                                      </label>
                                    </div>
                                  </div>

                                  {/* Custom Lists */}
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-300">Specific People</h4>

                                    {/* Mode Toggle */}
                                    <div className="flex gap-2 mb-3">
                                      <button
                                        onClick={() => setListMode('allow')}
                                        className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
                                          listMode === 'allow'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                      >
                                        Allow List
                                      </button>
                                      <button
                                        onClick={() => setListMode('block')}
                                        className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
                                          listMode === 'block'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                      >
                                        Block List
                                      </button>
                                    </div>

                                    {/* Add Person Input */}
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && newUserName.trim()) {
                                            if (listMode === 'allow') {
                                              setAllowedUsers([...allowedUsers, newUserName.trim()]);
                                            } else {
                                              setBlockedUsers([...blockedUsers, newUserName.trim()]);
                                            }
                                            setNewUserName('');
                                          }
                                        }}
                                        placeholder={listMode === 'allow' ? 'Add person to allow...' : 'Add person to block...'}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
                                      />
                                      <button
                                        onClick={() => {
                                          if (newUserName.trim()) {
                                            if (listMode === 'allow') {
                                              setAllowedUsers([...allowedUsers, newUserName.trim()]);
                                            } else {
                                              setBlockedUsers([...blockedUsers, newUserName.trim()]);
                                            }
                                            setNewUserName('');
                                          }
                                        }}
                                        className={`px-4 py-2 rounded text-sm ${
                                          listMode === 'allow'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                        } text-white`}
                                      >
                                        Add
                                      </button>
                                    </div>

                                    {/* Lists Display */}
                                    {listMode === 'allow' ? (
                                      <div className="space-y-1">
                                        {allowedUsers.length === 0 ? (
                                          <p className="text-sm text-gray-500 italic p-2">No one in allow list</p>
                                        ) : (
                                          allowedUsers.map((name, index) => (
                                            <div key={index} className="flex items-center justify-between bg-green-900/20 border border-green-800/30 p-2 rounded">
                                              <span className="text-sm text-green-400">{name}</span>
                                              <button
                                                onClick={() => setAllowedUsers(allowedUsers.filter((_, i) => i !== index))}
                                                className="text-red-400 hover:text-red-300 text-xs"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        {blockedUsers.length === 0 ? (
                                          <p className="text-sm text-gray-500 italic p-2">No one in block list</p>
                                        ) : (
                                          blockedUsers.map((name, index) => (
                                            <div key={index} className="flex items-center justify-between bg-red-900/20 border border-red-800/30 p-2 rounded">
                                              <span className="text-sm text-red-400">{name}</span>
                                              <button
                                                onClick={() => setBlockedUsers(blockedUsers.filter((_, i) => i !== index))}
                                                className="text-gray-400 hover:text-gray-300 text-xs"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                                  <button
                                    onClick={() => setShowCustomListModal(false)}
                                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOnlineVisibility('custom');
                                      setShowCustomListModal(false);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                  >
                                    Save Settings
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Connection Status */}
                        {isConnected && !incognitoMode && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-500">Connected</span>
                          </div>
                        )}

                        {incognitoMode && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">Incognito</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-400">
                          {selectedConversation.participant.status.charAt(0).toUpperCase() + selectedConversation.participant.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg) => {
                      const isOwnMessage = msg.sender_id === currentUserId;
                      return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isOwnMessage ? 'justify-end' : ''}`}>
                          {!isOwnMessage && (
                            <div className={`w-8 h-8 bg-gradient-to-r ${selectedConversation.participant.avatar_color} rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
                              {selectedConversation.participant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                          )}

                          <div className={`flex-1 ${isOwnMessage ? 'max-w-xs' : 'max-w-md'}`}>
                            <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                              <span className="text-sm font-medium text-white">
                                {msg.sender_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.is_edited && <span className="text-xs text-gray-500">(edited)</span>}

                              {/* Read Receipts */}
                              {isOwnMessage && showReadReceipts && (
                                <span className="relative group">
                                  {!msg.is_delivered && !msg.is_read && (
                                    <span className="text-xs text-gray-500">⏱</span>
                                  )}
                                  {msg.is_delivered && !msg.is_read && (
                                    <span className="text-xs text-gray-400">✓</span>
                                  )}
                                  {msg.is_read && (
                                    <span className="text-xs text-blue-400">✓✓</span>
                                  )}

                                  {/* Hover tooltip */}
                                  {(msg.delivered_at || msg.read_at) && (
                                    <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                      {msg.is_read && msg.read_at && (
                                        <div>Read at {new Date(msg.read_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                      )}
                                      {!msg.is_read && msg.delivered_at && (
                                        <div>Delivered at {new Date(msg.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                      )}
                                    </div>
                                  )}
                                </span>
                              )}
                            </div>

                            <div className="relative group">
                              <div className={`rounded-lg p-3 ${isOwnMessage ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-200'}`}>
                                  {msg.content}
                                </p>
                              </div>

                              {/* Reactions */}
                              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                                    <button
                                      key={emoji}
                                      onClick={() => addReaction(msg.id, emoji)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                        users.includes(currentUserId)
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      }`}
                                    >
                                      <span>{emoji}</span>
                                      <span>{users.length}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Reaction picker */}
                              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                  className="bg-gray-800 text-gray-400 hover:text-white p-1 rounded"
                                >
                                  😊
                                </button>
                                {showEmojiPicker === msg.id && (
                                  <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 flex gap-1 z-10">
                                    {reactionEmojis.map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => addReaction(msg.id, emoji)}
                                        className="hover:bg-gray-700 p-1 rounded"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {isOwnMessage && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                              TM
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {selectedConversation?.typing_users && selectedConversation.typing_users.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span>{selectedConversation.participant.name} is typing...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-700 mt-auto">
                    {/* File attachment preview */}
                    {attachedFile && (
                      <div className="mb-2 p-2 bg-gray-700 rounded flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm text-gray-300">{attachedFile.name}</span>
                          <span className="text-xs text-gray-500">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => setAttachedFile(null)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAttachedFile(file);
                          }
                        }}
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                      />

                      {/* Attachment button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors flex items-center justify-center"
                        title="Attach file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>

                      <input
                        type="text"
                        placeholder={attachedFile ? "Type a message for your attachment..." : "Type your message..."}
                        value={messageInput}
                        onChange={handleTyping}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                      />

                      <button
                        onClick={sendMessage}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Send
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      {isTyping && (
                        <div className="text-xs text-gray-500">You are typing...</div>
                      )}
                      <div className="text-xs text-gray-500">
                        Accepts: PDF, Word, Images (Max 10MB)
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-gray-300">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}