const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS (Vercel deployments, localhost, custom domains)
const corsOptions = {
  origin: true, // Universal origin reflection with credentials for Vercel, localhost, and custom domains
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Setup Socket.IO with dynamic CORS for Vercel & local environments
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database (with automatic fallback to pre-seeded high-performance in-memory persistence)
connectDB();

// Root route (confirms service is live when hitting Render URL directly)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Traverse Travel Platform API Server',
    health: '/health',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve Static Frontend Assets in Production or when client dist is built
const path = require('path');
const fs = require('fs');
const distPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // All other GET requests route to index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Health & System Info Route (supports /health for Render and /api/health)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'online',
    platform: 'Traverse Travel Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'Trip Planner with Day-by-Day Itineraries',
      'Travelers Matching (Traveling at Same Time)',
      'Travel Alumni & Completed Trip Reviews',
      'Live Multi-channel Global Chat via Socket.io',
      'Admin Operations & Inquiries Dashboard',
      'JWT Authentication & Role Control'
    ]
  });
});

// Real-Time Socket.io Handlers
const activeUsers = new Map(); // socket.id -> { userId, name, avatar, channel }

const getOnlineUserIds = () => {
  return Array.from(new Set(Array.from(activeUsers.values()).map(u => u.userId).filter(Boolean)));
};

app.get('/api/auth/online-users', (req, res) => {
  res.json(getOnlineUserIds());
});

io.on('connection', (socket) => {
  // Send current online user IDs immediately on connect
  socket.emit('online_users', getOnlineUserIds());

  // Join Channel Room & Register Personal User Room
  socket.on('join_channel', ({ channel, user }) => {
    if (channel) socket.join(channel);
    if (user && user._id) {
      const userRoom = `user_${user._id.toString()}`;
      socket.join(userRoom);
      activeUsers.set(socket.id, {
        userId: user._id.toString(),
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        channel
      });
    }

    // Broadcast updated active count and online user IDs
    io.emit('online_count', activeUsers.size);
    io.emit('online_users', getOnlineUserIds());
    if (channel) {
      io.to(channel).emit('channel_users_update', Array.from(activeUsers.values()).filter(u => u.channel === channel));
    }
  });

  // Explicit Register User event for authenticated sockets
  socket.on('register_user', (userData) => {
    const userId = typeof userData === 'object' && userData !== null ? userData._id : userData;
    if (userId) {
      const uId = userId.toString();
      const userRoom = `user_${uId}`;
      socket.join(userRoom);

      if (activeUsers.has(socket.id)) {
        const u = activeUsers.get(socket.id);
        u.userId = uId;
        activeUsers.set(socket.id, u);
      } else {
        activeUsers.set(socket.id, { userId: uId });
      }

      io.emit('online_count', activeUsers.size);
      io.emit('online_users', getOnlineUserIds());
    }
  });

  // Switch channel
  socket.on('switch_channel', ({ oldChannel, newChannel, user }) => {
    if (oldChannel && oldChannel !== newChannel) {
      socket.leave(oldChannel);
    }
    if (newChannel) {
      socket.join(newChannel);
    }
    if (user && user._id) {
      socket.join(`user_${user._id.toString()}`);
    }
    if (activeUsers.has(socket.id)) {
      const u = activeUsers.get(socket.id);
      u.channel = newChannel;
      activeUsers.set(socket.id, u);
    }
    if (newChannel) {
      io.to(newChannel).emit('channel_users_update', Array.from(activeUsers.values()).filter(u => u.channel === newChannel));
    }
  });

  // Real-time chat message broadcast
  socket.on('send_message', (messageData) => {
    const channel = messageData.channel || 'general';
    // Broadcast to the channel room
    io.to(channel).emit('receive_message', messageData);

    // If it's a direct message with recipientId, ensure recipient and sender get it directly
    if (messageData.recipientId) {
      const recipientRoom = `user_${messageData.recipientId.toString()}`;
      io.to(recipientRoom).emit('receive_message', messageData);
      io.to(recipientRoom).emit('direct_message_received', messageData);
    }
    if (messageData.senderId) {
      const senderRoom = `user_${messageData.senderId.toString()}`;
      io.to(senderRoom).emit('receive_message', messageData);
    }
  });

  // Typing indicators
  socket.on('typing', ({ channel, user }) => {
    if (channel) {
      socket.to(channel).emit('user_typing', { user, channel });
    }
  });

  socket.on('stop_typing', ({ channel, user }) => {
    if (channel) {
      socket.to(channel).emit('user_stop_typing', { user, channel });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (activeUsers.has(socket.id)) {
      const u = activeUsers.get(socket.id);
      activeUsers.delete(socket.id);
      io.emit('online_count', activeUsers.size);
      io.emit('online_users', getOnlineUserIds());
      if (u.channel) {
        io.to(u.channel).emit('channel_users_update', Array.from(activeUsers.values()).filter(x => x.channel === u.channel));
      }
    }
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` Traverse Travel Platform Server running on port ${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api/health`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(` WebSocket: ws://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});
