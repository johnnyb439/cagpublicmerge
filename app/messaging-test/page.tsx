'use client';

import { useState, useEffect } from 'react';
import { useRealTimeMessaging } from '../../hooks/useRealTimeMessaging';

export default function MessagingTestPage() {
  const [userId] = useState('user_tone123'); // Your test user ID
  const [conversationId] = useState('conv_channel_network');
  const [messageText, setMessageText] = useState('');
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 REAL-TIME MESSAGING HOOK - FREE TIER MAGIC!
  const {
    isConnected,
    connectionError,
    messages: realTimeMessages,
    sendRealTimeMessage,
    sendTypingIndicator
  } = useRealTimeMessaging({
    user_id: userId,
    conversation_id: conversationId,
    onMessage: (message) => {
      console.log('🔥 NEW REAL-TIME MESSAGE:', message);
    },
    onConnectionChange: (connected) => {
      console.log(`🔌 Connection status: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
    }
  });

  // 📤 SEND MESSAGE FUNCTION
  const sendMessage = async () => {
    if (!messageText.trim()) return;

    setIsLoading(true);
    try {
      // Send message via API (this will trigger real-time notifications)
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender_id: userId,
          content: messageText,
          message_type: 'text'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSentMessages(prev => [result.data.message, ...prev]);
        setMessageText('');
        console.log('✅ Message sent successfully:', result);
      } else {
        console.error('❌ Failed to send message');
      }
    } catch (error) {
      console.error('❌ Send message error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✏️ TYPING INDICATOR
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    // Send typing indicator
    if (e.target.value.length > 0) {
      sendTypingIndicator(true);
    } else {
      sendTypingIndicator(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔥 Enterprise Real-Time Messaging Test
        </h1>
        <p className="text-gray-600">
          Testing the FREE AWS tier real-time communication system!
        </p>
      </div>

      {/* Connection Status */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          isConnected
            ? 'bg-green-100 border border-green-300'
            : 'bg-red-100 border border-red-300'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <div>
            <div className="font-semibold">
              {isConnected ? '🔌 Connected to Real-Time System' : '❌ Disconnected'}
            </div>
            {connectionError && (
              <div className="text-sm text-red-600">{connectionError}</div>
            )}
            <div className="text-sm text-gray-600">
              User ID: {userId} | Conversation: {conversationId}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">📤 Send Message</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Text
              </label>
              <input
                type="text"
                value={messageText}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
                disabled={isLoading}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={isLoading || !messageText.trim() || !isConnected}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : '🚀 Send Message with Real-Time Delivery'}
            </button>
          </div>

          {/* Sent Messages */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">📨 Sent Messages ({sentMessages.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sentMessages.map((msg, index) => (
                <div key={msg.id || index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="text-sm text-gray-600">
                    {new Date(msg.sent_at).toLocaleTimeString()}
                  </div>
                  <div className="font-medium">{msg.content}</div>
                  <div className="text-xs text-gray-500">ID: {msg.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Messages */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Real-Time Messages</h2>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {realTimeMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Waiting for real-time messages...
              </div>
            ) : (
              realTimeMessages.slice(-10).reverse().map((msg, index) => (
                <div key={msg.timestamp + index} className={`p-3 rounded border-l-4 ${
                  msg.type === 'connection_established' ? 'bg-green-50 border-green-400' :
                  msg.type === 'new_message' ? 'bg-yellow-50 border-yellow-400' :
                  msg.type === 'keep_alive' ? 'bg-gray-50 border-gray-300' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm">
                      {msg.type === 'connection_established' && '🔌 Connected'}
                      {msg.type === 'new_message' && '💬 New Message'}
                      {msg.type === 'keep_alive' && '❤️ Keep Alive'}
                      {msg.type === 'typing_indicator' && '✏️ Typing'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  {msg.message && (
                    <div className="mt-2">
                      <div className="font-medium">{msg.message.content}</div>
                      <div className="text-xs text-gray-500">
                        From: {msg.message.sender_id}
                      </div>
                    </div>
                  )}

                  {msg.type === 'connection_established' && (
                    <div className="mt-2 text-sm text-green-700">
                      🔥 Real-time messaging is now active!
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* API Testing Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 API Testing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={async () => {
                const response = await fetch(`/api/messaging/channels?user_id=${userId}`);
                const data = await response.json();
                console.log('📡 CHANNELS:', data);
                alert(`Found ${data.data.channels.length} channels! Check console for details.`);
              }}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              🌐 Test Channels API
            </button>

            <button
              onClick={async () => {
                const response = await fetch(`/api/messaging/conversations?user_id=${userId}`);
                const data = await response.json();
                console.log('💬 CONVERSATIONS:', data);
                alert(`Found ${data.data.conversations.length} conversations! Check console.`);
              }}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              💬 Test Conversations
            </button>

            <button
              onClick={async () => {
                const response = await fetch('/api/messaging/recruiter?action=templates');
                const data = await response.json();
                console.log('💼 RECRUITER TEMPLATES:', data);
                alert(`Found ${data.data.templates.length} recruiter templates! Check console.`);
              }}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              💼 Test Recruiter API
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <strong>💡 Pro Tips:</strong>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>• Open this page in multiple tabs to test real-time messaging</li>
              <li>• Check the browser console for detailed API responses</li>
              <li>• Messages are delivered instantly with Server-Sent Events</li>
              <li>• Everything runs on FREE AWS tier with zero additional costs!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}