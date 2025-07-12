// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// import '../types/express';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import * as apiDocs from '../api-docs.json';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import jobRoutes from './routes/job.routes';
import adminRoutes from './routes/admin.routes';
import employerRoutes from './routes/employer.routes';
import instructorRoutes from './routes/instructor.routes';
import helpRoutes from './routes/help.routes';
import assessmentRoutes from './routes/assessment.routes';
import certificateRoutes from './routes/certificate.routes';
import scholarshipRoutes from './routes/scholarship.routes';
import peerLearningRoutes from './routes/peerLearning.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authenticateToken } from './middleware/auth';

// Import database connection
import { connectCouchDB } from './config/couchdb';
import { connectRedis } from './config/redis';
import { setupI18n, getI18nMiddleware } from './config/i18n';

// Import logger
import { logger } from './utils/logger';

const app = express();
const server = createServer(app);

// Trust proxy - needed for rate limiting to work correctly
app.set('trust proxy', 1);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env['CORS_ORIGIN'] || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limiter for progress tracking endpoints
const progressLimiter = rateLimit({
  windowMs: parseInt(process.env['PROGRESS_RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute
  max: parseInt(process.env['PROGRESS_RATE_LIMIT_MAX_REQUESTS'] || '50'), // 50 requests per minute
  message: 'Too many progress requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000"
];

const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (!isProduction) {
      // Allow all origins in development
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Apply different rate limiters based on path
app.use('/api/courses/*/progress', progressLimiter); // More lenient for progress endpoints
app.use(generalLimiter); // General rate limiter for all other endpoints

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Internationalization middleware
app.use(getI18nMiddleware());

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'RefuLearn API is running - Database connection updated',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/employer', authenticateToken, employerRoutes);
app.use('/api/instructor', authenticateToken, instructorRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/peer-learning', peerLearningRoutes);
app.use('/', swaggerUi.serve, swaggerUi.setup(apiDocs));

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    logger.info(`User ${socket.id} left room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Make io available to routes
app.set('io', io);

const PORT = process.env['PORT'] || 5000;

const startServer = async () => {
  try {
    // Setup internationalization
    await setupI18n();

    // Connect to CouchDB (non-blocking)
    try {
      await connectCouchDB();
      logger.info('CouchDB connected successfully');
    } catch (couchError) {
      logger.error('CouchDB connection failed, but server will continue:', couchError);
      logger.warn('Some features may not work properly without CouchDB');
    }

    // Connect to Redis (non-blocking)
    try {
      await connectRedis();
      logger.info('Redis connected successfully');
    } catch (redisError) {
      logger.error('Redis connection failed, but server will continue:', redisError);
      logger.warn('Session management may not work properly without Redis');
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`\n🚀 API running at: http://localhost:${PORT}\n`);
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer(); 