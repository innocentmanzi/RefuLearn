import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { connectCouchDB } from '../config/couchdb';

const router = express.Router();

// Database connection
let couchConnection: any = null;

const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing CouchDB connection for quiz session routes...');
    couchConnection = await connectCouchDB();
    console.log('✅ Quiz session routes database connection successful!');
    return true;
  } catch (error: any) {
    console.error('❌ Quiz session routes database connection failed:', error.message);
    return false;
  }
};

// Initialize database connection
initializeDatabase();

// Helper function to ensure database is available
const ensureDb = async (): Promise<any> => {
  if (!couchConnection) {
    console.log('⚠️ Database not available, reinitializing...');
    const connectionSuccess = await initializeDatabase();
    if (!connectionSuccess || !couchConnection) {
      throw new Error('Database connection failed');
    }
  }
  return couchConnection.getDatabase();
};

// Interface for quiz session document
interface QuizSessionDoc {
  _id: string;
  _rev?: string;
  type: 'quiz_session';
  userId: string;
  quizId: string;
  courseId: string;
  moduleId: string;
  startTime: Date;
  durationMinutes: number;
  endTime: Date;
  status: 'active' | 'completed' | 'expired' | 'abandoned';
  answers: { [questionIndex: number]: any };
  timeSpent: number; // in seconds
  score?: number;
  submittedAt?: Date;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

// Start a new quiz session
router.post('/start', authenticateToken, authorizeRoles('refugee', 'user'), [
  body('quizId').notEmpty().withMessage('Quiz ID is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { quizId, courseId, moduleId, duration } = req.body;
    const userId = req.user._id.toString();

    console.log('🚀 Starting new quiz session:', { userId, quizId, duration });

    const database = await ensureDb();

    // Check if there's already an active session for this user and quiz
    const existingSessions = await database.find({
      selector: {
        type: 'quiz_session',
        userId,
        quizId,
        status: 'active'
      }
    });

    if (existingSessions.docs.length > 0) {
      const existingSession = existingSessions.docs[0];
      const now = new Date();
      const endTime = new Date(existingSession.endTime);
      
      if (now > endTime) {
        // Session has expired, mark it as expired
        existingSession.status = 'expired';
        existingSession.isExpired = true;
        existingSession.updatedAt = now;
        await database.insert(existingSession);
        
        console.log('⏰ Previous session expired, creating new one');
      } else {
        // Return existing active session
        const timeRemaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);
        console.log('✅ Returning existing active session with', timeRemaining, 'seconds remaining');
        
        return res.json({
          success: true,
          data: {
            sessionId: existingSession._id,
            startTime: existingSession.startTime,
            endTime: existingSession.endTime,
            timeRemaining,
            status: existingSession.status,
            answers: existingSession.answers || {}
          }
        });
      }
    }

    // Create new quiz session
    const now = new Date();
    const durationMinutes = parseInt(duration);
    const endTime = new Date(now.getTime() + (durationMinutes * 60 * 1000));

    const sessionDoc: QuizSessionDoc = {
      _id: `quiz_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'quiz_session',
      userId,
      quizId,
      courseId,
      moduleId,
      startTime: now,
      durationMinutes,
      endTime,
      status: 'active',
      answers: {},
      timeSpent: 0,
      isExpired: false,
      createdAt: now,
      updatedAt: now
    };

    const result = await database.insert(sessionDoc);
    console.log('✅ Quiz session created:', result.id);

    const timeRemaining = durationMinutes * 60; // in seconds

    res.status(201).json({
      success: true,
      message: 'Quiz session started successfully',
      data: {
        sessionId: result.id,
        startTime: now,
        endTime,
        timeRemaining,
        status: 'active',
        answers: {}
      }
    });
  } catch (error: any) {
    console.error('Error starting quiz session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz session'
    });
  }
}));

// Get current quiz session status
router.get('/:quizId/status', authenticateToken, authorizeRoles('refugee', 'user'), [
  param('quizId').notEmpty().withMessage('Quiz ID is required')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id.toString();

    console.log('📊 Getting quiz session status:', { userId, quizId });

    const database = await ensureDb();

    // Find active session for this user and quiz
    const sessions = await database.find({
      selector: {
        type: 'quiz_session',
        userId,
        quizId,
        status: 'active'
      },
      sort: [{ createdAt: 'desc' }],
      limit: 1
    });

    if (sessions.docs.length === 0) {
      return res.json({
        success: true,
        data: {
          hasActiveSession: false,
          sessionId: null,
          timeRemaining: null,
          status: null
        }
      });
    }

    const session = sessions.docs[0];
    const now = new Date();
    const endTime = new Date(session.endTime);
    
    if (now > endTime) {
      // Session has expired
      session.status = 'expired';
      session.isExpired = true;
      session.updatedAt = now;
      await database.insert(session);
      
      return res.json({
        success: true,
        data: {
          hasActiveSession: false,
          sessionId: session._id,
          timeRemaining: 0,
          status: 'expired'
        }
      });
    }

    const timeRemaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);

    res.json({
      success: true,
      data: {
        hasActiveSession: true,
        sessionId: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        timeRemaining,
        status: session.status,
        answers: session.answers || {}
      }
    });
  } catch (error: any) {
    console.error('Error getting quiz session status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz session status'
    });
  }
}));

// Update quiz session (save answers)
router.put('/:sessionId/answers', authenticateToken, authorizeRoles('refugee', 'user'), [
  param('sessionId').notEmpty().withMessage('Session ID is required'),
  body('answers').isObject().withMessage('Answers must be an object')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id.toString();

    console.log('💾 Updating quiz session answers:', { sessionId, userId });

    const database = await ensureDb();

    // Get the session and verify ownership
    const session = await database.get(sessionId) as QuizSessionDoc;

    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz session'
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Quiz session is not active'
      });
    }

    // Check if session has expired
    const now = new Date();
    const endTime = new Date(session.endTime);
    
    if (now > endTime) {
      session.status = 'expired';
      session.isExpired = true;
      session.updatedAt = now;
      await database.insert(session);
      
      return res.status(400).json({
        success: false,
        message: 'Quiz session has expired'
      });
    }

    // Update answers and time spent
    const timeSpent = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
    session.answers = { ...session.answers, ...answers };
    session.timeSpent = timeSpent;
    session.updatedAt = now;

    await database.insert(session);

    res.json({
      success: true,
      message: 'Quiz session updated successfully',
      data: {
        timeSpent,
        timeRemaining: Math.floor((endTime.getTime() - now.getTime()) / 1000)
      }
    });
  } catch (error: any) {
    console.error('Error updating quiz session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz session'
    });
  }
}));

// Get quiz submissions for instructors
router.get('/quiz/:quizId/submissions', authenticateToken, authorizeRoles('instructor'), [
  param('quizId').notEmpty().withMessage('Quiz ID is required')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user._id.toString();

    console.log('📊 Getting quiz submissions for instructor:', { instructorId, quizId });

    const database = await ensureDb();

    // First, verify the instructor owns this quiz
    const quiz = await database.get(quizId);
    if (quiz.instructorId !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view submissions for this quiz'
      });
    }

    // Find all completed sessions for this quiz
    const sessions = await database.find({
      selector: {
        type: 'quiz_session',
        quizId,
        status: { $in: ['completed', 'expired'] }
      },
      sort: [{ submittedAt: 'desc' }]
    });

    // Get user details for each submission
    const submissions = await Promise.all(
      sessions.docs.map(async (session: QuizSessionDoc) => {
        try {
          const user = await database.get(session.userId);
          return {
            sessionId: session._id,
            student: {
              id: user._id,
              firstName: user.firstName || 'Unknown',
              lastName: user.lastName || 'Student',
              email: user.email || 'No email'
            },
            score: session.score || 0,
            timeSpent: session.timeSpent || 0,
            timeSpentMinutes: Math.round((session.timeSpent || 0) / 60 * 100) / 100, // Round to 2 decimal places
            submittedAt: session.submittedAt || session.updatedAt,
            status: session.status,
            answers: session.answers || {},
            startTime: session.startTime,
            endTime: session.endTime,
            isExpired: session.isExpired || false
          };
        } catch (error) {
          console.error('Error getting user details for submission:', error);
          return {
            sessionId: session._id,
            student: {
              id: session.userId,
              firstName: 'Unknown',
              lastName: 'Student',
              email: 'Unknown'
            },
            score: session.score || 0,
            timeSpent: session.timeSpent || 0,
            timeSpentMinutes: Math.round((session.timeSpent || 0) / 60 * 100) / 100,
            submittedAt: session.submittedAt || session.updatedAt,
            status: session.status,
            answers: session.answers || {},
            startTime: session.startTime,
            endTime: session.endTime,
            isExpired: session.isExpired || false
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        quizTitle: quiz.title,
        totalSubmissions: submissions.length,
        submissions
      }
    });
  } catch (error: any) {
    console.error('Error getting quiz submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz submissions'
    });
  }
}));

// Submit quiz with time validation
router.post('/:sessionId/submit', authenticateToken, authorizeRoles('refugee', 'user'), [
  param('sessionId').notEmpty().withMessage('Session ID is required'),
  body('answers').isObject().withMessage('Answers must be an object')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id.toString();

    console.log('📤 Submitting quiz session:', { sessionId, userId });

    const database = await ensureDb();

    // Get the session and verify ownership
    const session = await database.get(sessionId) as QuizSessionDoc;

    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this quiz session'
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz has already been submitted'
      });
    }

    const now = new Date();
    const endTime = new Date(session.endTime);
    
    // Allow submission even if slightly past end time (grace period of 10 seconds)
    const gracePeriod = 10 * 1000; // 10 seconds
    if (now.getTime() > endTime.getTime() + gracePeriod) {
      session.status = 'expired';
      session.isExpired = true;
      session.updatedAt = now;
      await database.insert(session);
      
      return res.status(400).json({
        success: false,
        message: 'Quiz session has expired and cannot be submitted'
      });
    }

    // Calculate time spent and score
    const timeSpent = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
    
    // Get the quiz to calculate score
    const quiz = await database.get(session.quizId);
    let correctAnswers = 0;
    
    if (quiz && quiz.questions) {
      quiz.questions.forEach((question: any, index: number) => {
        const userAnswer = answers[index];
        const correctAnswer = question.correctAnswer;
        
        if (question.type === 'multiple-choice' || question.type === 'multiple_choice') {
          if (userAnswer === correctAnswer) {
            correctAnswers++;
          }
        } else if (question.type === 'true-false' || question.type === 'true_false') {
          // Handle different formats of true/false answers
          const normalizedUserAnswer = userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1';
          const normalizedCorrectAnswer = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1';
          
          if (normalizedUserAnswer === normalizedCorrectAnswer) {
            correctAnswers++;
          }
        } else if (question.type === 'short-answer' || question.type === 'short_answer') {
          // For short answers, check if user provided an answer and it's not empty
          if (userAnswer && userAnswer.toString().trim().length > 0) {
            // Simple check - if there's a correct answer specified, do basic matching
            if (correctAnswer && typeof correctAnswer === 'string') {
              const userAnswerLower = userAnswer.toString().toLowerCase().trim();
              const correctAnswerLower = correctAnswer.toLowerCase().trim();
              if (userAnswerLower === correctAnswerLower || userAnswerLower.includes(correctAnswerLower)) {
                correctAnswers++;
              }
            } else {
              // If no correct answer specified, give credit for attempting
              correctAnswers++;
            }
          }
        }
      });
    }
    
    const score = quiz && quiz.questions ? Math.round((correctAnswers / quiz.questions.length) * 100) : 0;

    // Update session as completed
    session.answers = { ...session.answers, ...answers };
    session.timeSpent = timeSpent;
    session.status = 'completed';
    session.score = score;
    session.submittedAt = now;
    session.updatedAt = now;

    await database.insert(session);

    console.log('✅ Quiz session submitted successfully');

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        sessionId: session._id,
        score,
        timeSpent,
        submittedAt: now,
        answers: session.answers
      }
    });
  } catch (error: any) {
    console.error('Error submitting quiz session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
}));

export default router; 