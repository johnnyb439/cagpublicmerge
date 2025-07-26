# Real-time Features Implementation

## Overview
This document describes the real-time features implemented using Socket.io and Supabase for the Cleared Advisory Group website.

## Features Implemented

### 1. Real-time Messaging
- Direct messaging between users and recruiters
- Message status indicators (sent, delivered, read)
- Typing indicators
- Message persistence in Supabase

### 2. Real-time Notifications
- Instant notifications for new messages
- Job alert notifications
- Application status updates
- Browser push notifications support

### 3. Online Presence
- Real-time online/offline status
- Last seen timestamps
- Active user indicators
- Presence updates across all connected clients

### 4. Collaborative Features
- Typing indicators
- Read receipts
- Real-time message updates
- Multi-device synchronization

## Architecture

### Backend (Socket.io Server)
- Custom Next.js server with Socket.io integration
- Authentication via NextAuth tokens
- Message persistence in Supabase
- Redis caching for performance (optional)

### Frontend Components
- `SocketContext` - WebSocket connection management
- `ChatWindow` - Main messaging interface
- `NotificationBell` - Real-time notification display
- `MessagesPage` - Conversation list and chat interface

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install socket.io socket.io-client @supabase/realtime-js --legacy-peer-deps
   ```

2. **Database Setup**
   Run the SQL schema in `lib/supabase/realtime-schema.sql` in your Supabase dashboard

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage

### Sending Messages
```typescript
const { sendMessage } = useSocket();
await sendMessage(recipientId, 'Hello!', 'text');
```

### Listening for Notifications
```typescript
const { notifications, unreadCount } = useSocket();
// Notifications are automatically updated in real-time
```

### Updating Presence
```typescript
const { updatePresence } = useSocket();
updatePresence('away'); // online, away, busy, offline
```

## Security Considerations

1. **Authentication**
   - All socket connections require valid NextAuth tokens
   - User identity verified on each connection

2. **Authorization**
   - Row Level Security (RLS) on Supabase tables
   - Users can only access their own messages
   - Service role key used only on server side

3. **Data Privacy**
   - Messages encrypted in transit (WSS)
   - No message content logged on server
   - Automatic cleanup of old presence data

## Performance Optimizations

1. **Connection Management**
   - Automatic reconnection on disconnect
   - Connection pooling for multiple tabs
   - Heartbeat mechanism for connection health

2. **Message Delivery**
   - Message queuing for offline users
   - Delivery confirmation system
   - Optimistic UI updates

3. **Caching**
   - Redis caching for user presence (optional)
   - Local message cache for quick access
   - Conversation list caching

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if server is running with Socket.io support
   - Verify NEXT_PUBLIC_SOCKET_URL is correct
   - Check browser console for errors

2. **Messages Not Sending**
   - Verify user is authenticated
   - Check Supabase connection
   - Ensure RLS policies are configured

3. **Notifications Not Working**
   - Grant browser notification permissions
   - Check if service worker is registered
   - Verify notification settings

## Future Enhancements

1. **Group Messaging**
   - Multi-user conversations
   - Group admin features
   - Message threading

2. **Rich Media**
   - Image/file attachments
   - Voice messages
   - Video calls integration

3. **Advanced Features**
   - Message search
   - Message reactions
   - Message editing/deletion
   - End-to-end encryption