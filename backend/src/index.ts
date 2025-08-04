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
import quizSessionRoutes from './routes/quiz-session.routes';
import notificationRoutes from './routes/notification.routes';

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

// Rate limiting - more lenient for development
const isDevelopment = process.env.NODE_ENV !== 'production';

const generalLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || (isDevelopment ? '60000' : '900000')), // 1 minute in dev, 15 minutes in prod
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || (isDevelopment ? '1000' : '100')), // 1000 in dev, 100 in prod
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limiter for progress tracking endpoints
const progressLimiter = rateLimit({
  windowMs: parseInt(process.env['PROGRESS_RATE_LIMIT_WINDOW_MS'] || (isDevelopment ? '60000' : '60000')), // 1 minute
  max: parseInt(process.env['PROGRESS_RATE_LIMIT_MAX_REQUESTS'] || (isDevelopment ? '500' : '50')), // 500 in dev, 50 in prod
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

// Apply different rate limiters based on path - but skip in development
if (!isDevelopment) {
  app.use('/api/courses/*/progress', progressLimiter); // More lenient for progress endpoints
  app.use(generalLimiter); // General rate limiter for all other endpoints
} else {
  console.log('🚧 Development mode: Rate limiting disabled');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Internationalization middleware
app.use(getI18nMiddleware());

// Static files - Commented out to prevent interference with Supabase URLs
// app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'RefuLearn API is running - Database connection updated',
    timestamp: new Date().toISOString()
  });
});

// Simple test route to verify server is working
app.get('/api/test-server', (_req, res) => {
  console.log('🔍 SERVER TEST ROUTE HIT');
  res.json({ message: 'Server test route working', timestamp: new Date().toISOString() });
});

// API endpoint to convert localhost URLs to Supabase URLs
app.get('/api/convert-file-url', async (req, res) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ 
      error: 'Missing URL parameter',
      message: 'Please provide a URL to convert'
    });
  }
  
  console.log('📁 Converting URL:', url);
  
  try {
    // Check if it's a localhost URL
    if (url.includes('localhost:5001/uploads/')) {
      let filePath = url.replace('http://localhost:5001/uploads/', '');
      console.log('📁 Extracted file path:', filePath);
      
      // Fix malformed file paths (remove double structure)
      let fileName = '';
      if (filePath.includes('/') && filePath.split('/').length > 2) {
        // If path has multiple levels, take only the last part
        const pathParts = filePath.split('/');
        fileName = pathParts[pathParts.length - 1];
        const folder = pathParts[0]; // e.g., 'general'
        filePath = `${folder}/${fileName}`;
        console.log('📁 Fixed malformed path to:', filePath);
      }
      
      // Try to extract the original filename from the malformed path
      // Example: "Innocent-Manzi_report_turnitin_Submission.pdf-1753407858600.pdf/1753407858600-100667242.pdf"
      // Should become: "general/Innocent-Manzi_report_turnitin_Submission-1753407858600-100667242.pdf"
      if (fileName && fileName.includes('.pdf-') && fileName.includes('/')) {
        const parts = fileName.split('/');
        if (parts.length >= 2) {
          const originalName = parts[0].replace('.pdf-', '-');
          const timestamp = parts[1];
          filePath = `general/${originalName}-${timestamp}`;
          console.log('📁 Reconstructed path from malformed URL:', filePath);
        }
      }
      
      // Import the getFileUrl function
      const { getFileUrl } = require('./src/config/supabase');
      const supabaseUrl = getFileUrl('uploads', filePath);
      
      console.log('📁 Converted to Supabase URL:', supabaseUrl);
      
      res.json({ 
        success: true,
        originalUrl: url,
        supabaseUrl: supabaseUrl,
        fixedPath: filePath
      });
    } else {
      // If it's already a Supabase URL or other URL, return as is
      res.json({ 
        success: true,
        originalUrl: url,
        supabaseUrl: url
      });
    }
  } catch (error) {
    console.error('📁 Error converting URL:', error);
    res.status(500).json({ 
      error: 'Failed to convert URL',
      message: 'Could not convert the provided URL to a Supabase URL'
    });
  }
});

// File serving route that redirects to Supabase URLs
app.get('/uploads/*', async (req, res) => {
  console.log('📁 FILE ACCESS ATTEMPT - Path:', req.path);
  
  // Extract the file path from the URL
  let filePath = req.path.replace('/uploads/', '');
  console.log('📁 Extracted file path:', filePath);
  
  try {
    // Fix malformed file paths (remove double structure)
    let fileName = '';
    if (filePath.includes('/') && filePath.split('/').length > 2) {
      // If path has multiple levels, take only the last part
      const pathParts = filePath.split('/');
      fileName = pathParts[pathParts.length - 1];
      const folder = pathParts[0]; // e.g., 'general'
      filePath = `${folder}/${fileName}`;
      console.log('📁 Fixed malformed path to:', filePath);
    }
    
    // Try to construct the Supabase URL
    // The file path should be in format: general/filename-timestamp.pdf
    const { getFileUrl } = require('./src/config/supabase');
    const supabaseUrl = getFileUrl('uploads', filePath);
    
    console.log('📁 Redirecting to Supabase URL:', supabaseUrl);
    
    // Redirect to the Supabase URL
    res.redirect(supabaseUrl);
  } catch (error) {
    console.error('📁 Error constructing Supabase URL:', error);
    res.status(404).json({ 
      error: 'File not found',
      message: 'Files are stored in Supabase storage, not locally. Please use the correct Supabase URL.',
      path: filePath
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
console.log('🔧 Mounting course routes at /api/courses');
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
app.use('/api/quiz-sessions', authenticateToken, quizSessionRoutes);
app.use('/api/notifications', notificationRoutes);
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

const PORT = 5001; // Force port 5001 to avoid conflicts

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

// Handle unhandled promise rejections - don't crash in development
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  
  // In development, log the error but don't crash the server
  if (isDevelopment) {
    console.warn('⚠️ Development mode: Server continues despite unhandled rejection');
    return;
  }
  
  // In production, gracefully shut down
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions - don't crash in development  
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  
  // In development, log the error but don't crash the server
  if (isDevelopment) {
    console.warn('⚠️ Development mode: Server continues despite uncaught exception');
    return;
  }
  
  // In production, exit immediately
  process.exit(1);
});

startServer(); 