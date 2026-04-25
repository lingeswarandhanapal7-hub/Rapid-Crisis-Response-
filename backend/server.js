require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const initializeEmergencySocket = require('./src/emergency/socketHandler');

// Connect DB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Allow any localhost port in development
const corsOrigin = (origin, callback) => {
  if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Initialize Emergency System
const emergencySocketHandlers = initializeEmergencySocket(io);
app.set('emergencySocket', emergencySocketHandlers);

// Middleware
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/patients', require('./src/routes/patients'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/emergency', require('./src/routes/emergencyRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join:role', (role) => {
    socket.join(role);
    console.log(`   └─ Joined room: ${role}`);
  });

  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`   └─ Joined room: user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🏥 Hospital API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
});
