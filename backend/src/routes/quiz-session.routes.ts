import express, { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { connectCouchDB } from '../config/couchdb';

// Use proper authenticated request type
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
}

// Helper function to ensure user authentication
const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user?._id) {
    throw new Error('User authentication required');
  }
  return {
    userId: req.user._id.toString(),
    user: req.user as NonNullable<AuthenticatedRequest['user']>
  };
};

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
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId, courseId, moduleId, duration } = req.body;
    const { userId } = ensureAuth(req);

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
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const { userId } = ensureAuth(req);

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
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;
    const { userId } = ensureAuth(req);

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
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const { userId: instructorId } = ensureAuth(req);

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
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;
    const { userId } = ensureAuth(req);

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

    // 🔥 NEW: Automatically update course progress when quiz is completed
    try {
      console.log('🎯 Updating course progress after quiz completion...');
      
      // Calculate completion key for this quiz (same format as frontend)
      // We need to find the quiz index within the module
      const courseDoc = await database.get(session.courseId);
      if (courseDoc && courseDoc.modules) {
        const moduleDoc = await database.get(session.moduleId);
        if (moduleDoc && moduleDoc.quizzes) {
          // Find the index of this quiz within the module
          const quizIndex = moduleDoc.quizzes.findIndex((quiz: any) => quiz._id === session.quizId);
          if (quizIndex !== -1) {
            // Calculate the item index within all content items
            let itemIndex = 0;
            if (moduleDoc.description) itemIndex++;
            if (moduleDoc.content) itemIndex++;
            if (moduleDoc.videoUrl) itemIndex++;
            if (moduleDoc.resources) itemIndex += moduleDoc.resources.length;
            if (moduleDoc.assessments) itemIndex += moduleDoc.assessments.length;
            // Add quiz index
            itemIndex += quizIndex;
            
            const completionKey = `quiz-${itemIndex}`;
            
            console.log('🎯 Quiz completion details:', {
              quizId: session.quizId,
              moduleId: session.moduleId,
              courseId: session.courseId,
              quizIndex,
              itemIndex,
              completionKey
            });
            
            // Update course progress using the same logic as the progress endpoint
            if (!courseDoc.studentProgress) {
              courseDoc.studentProgress = [];
            }
            
            // Find or create module progress entry
            let moduleProgress = courseDoc.studentProgress.find(
              (p: any) => p.student === userId && p.moduleId === session.moduleId
            );
            
            if (!moduleProgress) {
              moduleProgress = {
                student: userId,
                moduleId: session.moduleId,
                completed: false,
                score: 0,
                completedAt: null,
                completedItems: []
              };
              courseDoc.studentProgress.push(moduleProgress);
            }
            
            // Initialize completedItems array if it doesn't exist
            if (!moduleProgress.completedItems) {
              moduleProgress.completedItems = [];
            }
            
            // Add completion key if not already present
            if (!moduleProgress.completedItems.includes(completionKey)) {
              moduleProgress.completedItems.push(completionKey);
              console.log('✅ Added quiz completion to progress:', completionKey);
              
              // Update course document
              courseDoc.updatedAt = new Date();
              const latestCourse = await database.get(courseDoc._id);
              courseDoc._rev = latestCourse._rev;
              await database.insert(courseDoc);
              
              console.log('✅ Course progress updated successfully after quiz completion');
            } else {
              console.log('ℹ️ Quiz already marked as completed in progress');
            }
          }
        }
      }
    } catch (progressError: any) {
      console.error('⚠️ Failed to update course progress after quiz completion:', progressError.message);
      // Don't fail the quiz submission if progress update fails
    }

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

// Check if user has completed a specific quiz (enhanced version)
router.get('/:quizId/completion-status', authenticateToken, authorizeRoles('refugee', 'user'), [
  param('quizId').notEmpty().withMessage('Quiz ID is required')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const { userId } = ensureAuth(req);

    console.log('🔍 Enhanced quiz completion check:', { userId, quizId });

    const database = await ensureDb();

    // Method 1: Find completed quiz session
    let completedSession = null;
    try {
      const completedSessions = await database.find({
        selector: {
          type: 'quiz_session',
          userId,
          quizId,
          status: 'completed'
        },
        sort: [{ submittedAt: 'desc' }],
        limit: 1
      });

      if (completedSessions.docs.length > 0) {
        completedSession = completedSessions.docs[0];
        console.log('✅ Found completed quiz session:', completedSession._id);
      }
    } catch (sessionErr) {
      console.log('⚠️ Quiz session query failed:', sessionErr);
    }

    // Method 2: Check if any quiz session exists for this user+quiz (regardless of status)
    if (!completedSession) {
      try {
        const allSessions = await database.find({
          selector: {
            type: 'quiz_session',
            userId,
            quizId
          },
          sort: [{ createdAt: 'desc' }],
          limit: 5
        });

        console.log('🔍 All sessions for this user+quiz:', allSessions.docs.map((s: any) => ({
          id: s._id,
          status: s.status,
          score: s.score,
          submittedAt: s.submittedAt
        })));

        // Find any session with a score (might be completed but status not updated)
        const sessionWithScore = allSessions.docs.find((s: any) => s.score !== undefined && s.score !== null);
        if (sessionWithScore) {
          completedSession = sessionWithScore;
          console.log('✅ Found session with score:', sessionWithScore._id, 'Score:', sessionWithScore.score);
        }
      } catch (allSessionsErr) {
        console.log('⚠️ All sessions query failed:', allSessionsErr);
      }
    }

    // Method 3: Check all quiz sessions and filter manually (last resort)
    if (!completedSession) {
      try {
        console.log('🔍 Trying comprehensive search...');
        const allQuizSessions = await database.list({ include_docs: true });
        
        const userQuizSessions = allQuizSessions.rows
          .map((row: any) => row.doc)
          .filter((doc: any) => 
            doc && 
            doc.type === 'quiz_session' && 
            doc.userId === userId && 
            doc.quizId === quizId &&
            (doc.status === 'completed' || doc.score !== undefined)
          );

        console.log('🔍 Comprehensive search found:', userQuizSessions.length, 'sessions');

        if (userQuizSessions.length > 0) {
          // Get the most recent one
          completedSession = userQuizSessions.sort((a: any, b: any) => 
            new Date(b.submittedAt || b.updatedAt || b.createdAt).getTime() - 
            new Date(a.submittedAt || a.updatedAt || a.createdAt).getTime()
          )[0];
          console.log('✅ Found session via comprehensive search:', completedSession._id);
        }
      } catch (comprehensiveErr) {
        console.log('⚠️ Comprehensive search failed:', comprehensiveErr);
      }
    }

    if (completedSession) {
      return res.json({
        success: true,
        data: {
          isCompleted: true,
          completedAt: completedSession.submittedAt || completedSession.updatedAt,
          score: completedSession.score,
          timeSpent: completedSession.timeSpent,
          sessionId: completedSession._id,
          method: 'enhanced_search'
        }
      });
    }

    // No completed session found
    console.log('ℹ️ No completed quiz session found for user');
    res.json({
      success: true,
      data: {
        isCompleted: false,
        completedAt: null,
        score: null,
        timeSpent: null,
        sessionId: null
      }
    });
  } catch (error: any) {
    console.error('Error checking quiz completion status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check quiz completion status'
    });
  }
}));

export default router; 