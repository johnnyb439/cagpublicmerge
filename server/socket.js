const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase only if credentials are available
let supabase = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const activeUsers = new Map();
const userSockets = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return next(new Error('Authentication error'));
      }
      socket.userId = user.id;
      socket.userEmail = user.email;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    activeUsers.set(socket.userId, {
      id: socket.userId,
      email: socket.userEmail,
      status: 'online',
      lastSeen: new Date().toISOString()
    });
    
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, []);
    }
    userSockets.get(socket.userId).push(socket.id);

    io.emit('user:status', {
      userId: socket.userId,
      status: 'online'
    });

    socket.join(`user:${socket.userId}`);

    socket.on('message:send', async (data) => {
      try {
        const { recipientId, content, type = 'text' } = data;
        
        const { data: message, error } = await supabase
          .from('messages')
          .insert({
            sender_id: socket.userId,
            recipient_id: recipientId,
            content,
            type,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        io.to(`user:${recipientId}`).emit('message:receive', {
          ...message,
          senderEmail: socket.userEmail
        });

        socket.emit('message:sent', {
          ...message,
          tempId: data.tempId
        });

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: recipientId,
            type: 'message',
            title: `New message from ${socket.userEmail}`,
            message: content.substring(0, 100),
            data: { messageId: message.id, senderId: socket.userId },
            read: false
          });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', {
          tempId: data.tempId,
          error: 'Failed to send message'
        });
      }
    });

    socket.on('message:typing', ({ recipientId, isTyping }) => {
      io.to(`user:${recipientId}`).emit('message:typing', {
        userId: socket.userId,
        isTyping
      });
    });

    socket.on('message:read', async ({ messageIds, senderId }) => {
      try {
        const { error } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', messageIds)
          .eq('recipient_id', socket.userId);

        if (!error) {
          io.to(`user:${senderId}`).emit('message:read', {
            messageIds,
            readBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('conversation:join', async ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${socket.userId},recipient_id.eq.${socket.userId}`)
        .order('created_at', { ascending: true })
        .limit(50);

      socket.emit('conversation:history', messages);
    });

    socket.on('notification:read', async ({ notificationId }) => {
      try {
        await supabase
          .from('notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId)
          .eq('user_id', socket.userId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    socket.on('presence:update', ({ status }) => {
      activeUsers.set(socket.userId, {
        ...activeUsers.get(socket.userId),
        status,
        lastSeen: new Date().toISOString()
      });

      io.emit('user:status', {
        userId: socket.userId,
        status
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      const sockets = userSockets.get(socket.userId) || [];
      const updatedSockets = sockets.filter(id => id !== socket.id);
      
      if (updatedSockets.length === 0) {
        activeUsers.set(socket.userId, {
          ...activeUsers.get(socket.userId),
          status: 'offline',
          lastSeen: new Date().toISOString()
        });

        io.emit('user:status', {
          userId: socket.userId,
          status: 'offline'
        });

        userSockets.delete(socket.userId);
      } else {
        userSockets.set(socket.userId, updatedSockets);
      }
    });
  });

  setInterval(() => {
    io.emit('users:online', Array.from(activeUsers.values()));
  }, 30000);

  return io;
}

module.exports = { initializeSocket };