'use client';

import { useState, useEffect } from 'react';
import { useRealTimeMessaging } from '../../hooks/useRealTimeMessaging';

interface JobCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  member_count?: number;
}

interface OnlineUser {
  user_id: string;
  name: string;
  job_category: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  custom_status?: string;
  is_available_for_chat: boolean;
  is_available_for_recruiter: boolean;
  last_seen_friendly: string;
}

interface PrivacySettings {
  allow_messages: boolean;
  allow_recruiter_messages: boolean;
  show_online_status: boolean;
  auto_away_minutes: number;
}

export default function MessagesPage() {
  const [currentUserId] = useState('user_tone123');
  const [selectedCategory, setSelectedCategory] = useState<string>('network_engineering');
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [userPrivacy, setUserPrivacy] = useState<PrivacySettings>({
    allow_messages: true,
    allow_recruiter_messages: true,
    show_online_status: true,
    auto_away_minutes: 15
  });
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'busy' | 'offline'>('online');
  const [customStatus, setCustomStatus] = useState('Available for professional discussions');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time messaging hook
  const { isConnected, messages: realTimeMessages } = useRealTimeMessaging({
    user_id: currentUserId,
    conversation_id: selectedCategory ? `conv_channel_${selectedCategory}` : undefined
  });

  // Load job categories and initial data
  useEffect(() => {
    loadJobCategories();
    loadOnlineUsers();
    loadUserSettings();
  }, [selectedCategory]);

  const loadJobCategories = async () => {
    try {
      const response = await fetch('/api/messaging/channels');
      const data = await response.json();

      if (data.success) {
        const categories = data.data.channels.map((channel: any) => ({
          id: channel.job_category,
          name: channel.name,
          icon: channel.icon,
          description: channel.description,
          member_count: channel.member_count
        }));
        setJobCategories(categories);
      }
    } catch (error) {
      console.error('❌ Failed to load job categories:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await fetch(`/api/messaging/presence?action=online_users&job_category=${selectedCategory}`);
      const data = await response.json();

      if (data.success) {
        setOnlineUsers(data.data.users);
      }
    } catch (error) {
      console.error('❌ Failed to load online users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      const response = await fetch(`/api/messaging/presence?action=user_settings&user_id=${currentUserId}`);
      const data = await response.json();

      if (data.success) {
        setUserPrivacy(data.data.privacy_settings);
        setUserStatus(data.data.presence.status);
        setCustomStatus(data.data.presence.custom_status || '');
      }
    } catch (error) {
      console.error('❌ Failed to load user settings:', error);
    }
  };

  const updateUserStatus = async (newStatus: 'online' | 'away' | 'busy' | 'offline', newCustomStatus?: string) => {
    try {
      const response = await fetch('/api/messaging/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          user_id: currentUserId,
          status: newStatus,
          custom_status: newCustomStatus || customStatus
        })
      });

      if (response.ok) {
        setUserStatus(newStatus);
        if (newCustomStatus !== undefined) {
          setCustomStatus(newCustomStatus);
        }
        loadOnlineUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('❌ Failed to update status:', error);
    }
  };

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    try {
      const response = await fetch('/api/messaging/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_privacy',
          user_id: currentUserId,
          ...newSettings
        })
      });

      if (response.ok) {
        setUserPrivacy(prev => ({ ...prev, ...newSettings }));
        setShowPrivacyModal(false);
        loadOnlineUsers(); // Refresh to show/hide based on new privacy settings
      }
    } catch (error) {
      console.error('❌ Failed to update privacy settings:', error);
    }
  };

  const startDirectMessage = async (user: OnlineUser) => {
    if (!user.is_available_for_chat) {
      alert(`${user.name} is currently unavailable for messages.`);
      return;
    }

    // In a real app, this would create a conversation and navigate to it
    setSelectedUser(user);
    console.log(`🚀 Starting conversation with ${user.name}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'away': return '🟡';
      case 'busy': return '🔴';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading messaging platform...</p>
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
              <h1 className="text-2xl font-bold text-white">💬 Professional Messaging</h1>
              <p className="text-sm text-gray-300">
                Connect with {onlineUsers.length} professionals in your field
              </p>
            </div>

            {/* User Status Controls */}
            <div className="flex items-center gap-4">
              <select
                value={userStatus}
                onChange={(e) => updateUserStatus(e.target.value as any)}
                className="text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
              >
                <option value="online">🟢 Online</option>
                <option value="away">🟡 Away</option>
                <option value="busy">🔴 Busy</option>
                <option value="offline">⚫ Offline</option>
              </select>

              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded border border-gray-600 text-white"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Online Users List - Now takes most of the space */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-white text-sm truncate">
                      👥 Online in {jobCategories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                  </div>
                  <button
                    onClick={loadOnlineUsers}
                    className="text-xs text-blue-400 hover:text-blue-300 ml-2 flex-shrink-0"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-700">
                {onlineUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    No users currently online in this category
                  </div>
                ) : (
                  onlineUsers.map((user) => (
                    <div key={user.user_id} className="p-4 hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">{user.name}</div>
                            <div className="text-xs text-gray-300 truncate">{user.custom_status}</div>
                            <div className="text-xs text-gray-400">Last seen: {user.last_seen_friendly}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {user.is_available_for_chat ? (
                            <button
                              onClick={() => startDirectMessage(user)}
                              className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                            >
                              💬 Message
                            </button>
                          ) : (
                            <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded border border-gray-600">
                              {user.status === 'busy' ? '🔴 Busy' : '❌ N/A'}
                            </div>
                          )}

                          <div className="text-sm" title={`${user.status.charAt(0).toUpperCase() + user.status.slice(1)}`}>
                            {getStatusIcon(user.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Status & Quick Actions Area */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="p-4">
                <h3 className="font-semibold text-white mb-3">Your Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(userStatus)}`}></div>
                    <span className="text-sm font-medium capitalize text-gray-200">{userStatus}</span>
                  </div>
                  <div className="text-sm text-gray-300">{customStatus}</div>
                  <div className="text-xs text-gray-400">
                    Messages: {userPrivacy.allow_messages ? '✅ Enabled' : '❌ Disabled'}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Selector - Compact */}
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-4">
              <div className="p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white text-sm">🏢 Community</h3>
              </div>
              <div className="p-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                >
                  {jobCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedUser && (
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mt-4">
                <div className="p-4">
                  <div className="text-center text-gray-400">
                    <div className="text-3xl mb-2">💬</div>
                    <p className="text-xs text-gray-300">Chat with</p>
                    <p className="text-sm text-white font-medium">{selectedUser.name}</p>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-xs"
                    >
                      ← Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Settings Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">🔒 Privacy Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={userPrivacy.allow_messages}
                    onChange={(e) => setUserPrivacy(prev => ({ ...prev, allow_messages: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Allow direct messages from other professionals</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={userPrivacy.allow_recruiter_messages}
                    onChange={(e) => setUserPrivacy(prev => ({ ...prev, allow_recruiter_messages: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Allow messages from recruiters</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={userPrivacy.show_online_status}
                    onChange={(e) => setUserPrivacy(prev => ({ ...prev, show_online_status: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Show my online status to others</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Auto-away after (minutes):
                </label>
                <input
                  type="number"
                  value={userPrivacy.auto_away_minutes}
                  onChange={(e) => setUserPrivacy(prev => ({ ...prev, auto_away_minutes: parseInt(e.target.value) || 15 }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                  min="5"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Custom Status Message:
                </label>
                <input
                  type="text"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white placeholder-gray-400"
                  placeholder="What are you working on?"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updatePrivacySettings(userPrivacy);
                  updateUserStatus(userStatus, customStatus);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}