// Simple JavaScript server to bypass TypeScript issues
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Trust proxy - needed for rate limiting to work correctly
app.set('trust proxy', 1);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env['CORS_ORIGIN'] || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = ["http://localhost:3000", "http://localhost:5000"];
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'RefuLearn Backend Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RefuLearn Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      jobs: '/api/jobs',
      admin: '/api/admin',
      instructor: '/api/instructor',
      employer: '/api/employer',
      help: '/api/help',
      assessment: '/api/assessment',
      certificate: '/api/certificate',
      scholarship: '/api/scholarship',
      peerLearning: '/api/peer-learning',
      quizSession: '/api/quiz-session',
      notification: '/api/notification'
    }
  });
});

// API Routes - Basic structure
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/courses', require('./src/routes/course.routes'));
app.use('/api/jobs', require('./src/routes/job.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/employer', require('./src/routes/employer.routes'));
app.use('/api/instructor', require('./src/routes/instructor.routes'));
app.use('/api/help', require('./src/routes/help.routes'));
app.use('/api/assessment', require('./src/routes/assessment.routes'));
app.use('/api/certificate', require('./src/routes/certificate.routes'));
app.use('/api/scholarship', require('./src/routes/scholarship.routes'));
app.use('/api/peer-learning', require('./src/routes/peerLearning.routes'));
app.use('/api/quiz-session', require('./src/routes/quiz-session.routes'));
app.use('/api/notification', require('./src/routes/notification.routes'));
app.use('/api/upload', require('./src/routes/upload.routes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server with error handling
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`🚀 RefuLearn Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} is busy, trying port ${PORT + 1}`);
      server.listen(PORT + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer(); 