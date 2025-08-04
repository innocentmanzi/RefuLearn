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

    // Validate that the quiz exists in the module
    try {
      const moduleDoc = await database.get(moduleId);
      if (!moduleDoc) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      if (!moduleDoc.quizzes || !Array.isArray(moduleDoc.quizzes)) {
        return res.status(404).json({
          success: false,
          message: 'Module has no quizzes'
        });
      }

      // Filter out undefined values and check if quiz exists
      const validQuizzes = moduleDoc.quizzes.filter((q: any) => q !== undefined && q !== null);
      const quizExists = validQuizzes.some((q: any) => 
        q._id === quizId || 
        q.id === quizId || 
        q.quizId === quizId ||
        q._id?.includes(quizId) ||
        quizId?.includes(q._id) ||
        q._id === quizId.replace(/[\s_]+/g, '-') ||
        q._id === quizId.replace(/[\s-]+/g, '_') ||
        (q.title && q.title.toLowerCase().includes(quizId.toLowerCase())) ||
        (q.title && quizId.toLowerCase().includes(q.title.toLowerCase()))
      );

      if (!quizExists) {
        console.log('❌ Quiz not found in module during session creation');
        console.log('❌ Looking for quiz ID:', quizId);
        console.log('❌ Available quiz IDs:', validQuizzes.map((q: any) => q._id));
        console.log('❌ Available quiz titles:', validQuizzes.map((q: any) => q.title));
        
        // If there's only one quiz in the module, allow it as fallback
        if (validQuizzes.length === 1) {
          console.log('⚠️ Using single quiz as fallback during session creation:', { 
            quizId: validQuizzes[0]._id, 
            title: validQuizzes[0].title 
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Quiz not found in module'
          });
        }
      }

      console.log('✅ Quiz validation passed for session creation');
    } catch (error: any) {
      console.error('❌ Error validating quiz during session creation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate quiz'
      });
    }

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
            sessionId: existingSession._id, // Use the original _id
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
      _id: `quiz-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        sessionId: sessionDoc._id, // Use the original _id instead of result.id
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

    // Find active session for this user and quiz - with error handling
    let sessions;
    try {
      sessions = await database.find({
        selector: {
          type: 'quiz_session',
          userId,
          quizId,
          status: 'active'
        },
        sort: [{ createdAt: 'desc' }],
        limit: 1
      });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      // Return safe default response instead of throwing error
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
    // Return safe default response instead of 500 error
    res.json({
      success: true,
      data: {
        hasActiveSession: false,
        sessionId: null,
        timeRemaining: null,
        status: null
      }
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

    // Fix session ID format - replace spaces with hyphens and underscores with hyphens
    const normalizedSessionId = sessionId.replace(/[\s_]+/g, '-');
    console.log('🔧 Normalized session ID:', { original: sessionId, normalized: normalizedSessionId });

    // Get the session and verify ownership
    let session: QuizSessionDoc;
    try {
      session = await database.get(normalizedSessionId) as QuizSessionDoc;
      console.log('✅ Found session with normalized ID:', { sessionId: session._id, quizId: session.quizId, userId: session.userId });
    } catch (error: any) {
      console.log('⚠️ Failed to get session with normalized ID, trying original format...');
      try {
        session = await database.get(sessionId) as QuizSessionDoc;
        console.log('✅ Found session with original ID:', { sessionId: session._id, quizId: session.quizId, userId: session.userId });
      } catch (error2: any) {
        console.error('❌ Failed to get quiz session with both formats:', { original: sessionId, normalized: normalizedSessionId, error: error2.message });
        return res.status(404).json({
          success: false,
          message: 'Quiz session not found'
        });
      }
    }

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
    let quiz;
    try {
      console.log('🔍 Looking for quiz with ID:', session.quizId);
      console.log('🔍 Looking in module:', session.moduleId);
      
      // Get the module that contains the quiz
      const moduleDoc = await database.get(session.moduleId);
      console.log('✅ Found module:', { moduleId: moduleDoc._id, title: moduleDoc.title });
      
      // Find the quiz within the module
      if (moduleDoc.quizzes && Array.isArray(moduleDoc.quizzes)) {
        // Filter out undefined values and log the quiz IDs for debugging
        const validQuizzes = moduleDoc.quizzes.filter((q: any) => q !== undefined && q !== null);
        console.log('🔍 Valid quizzes in module:', validQuizzes.length, 'out of', moduleDoc.quizzes.length);
        console.log('🔍 Quiz IDs in module:', validQuizzes.map((q: any) => q._id));
        console.log('🔍 Quiz titles in module:', validQuizzes.map((q: any) => q.title));
        
        if (validQuizzes.length === 0) {
          console.log('❌ No valid quizzes found in module');
          return res.status(404).json({
            success: false,
            message: 'No valid quizzes found in module'
          });
        }
        
        // Try exact match first
        quiz = validQuizzes.find((q: any) => q._id === session.quizId);
        
        if (!quiz) {
          console.log('❌ Quiz not found by exact ID match. Looking for:', session.quizId);
          console.log('❌ Available quiz IDs:', validQuizzes.map((q: any) => q._id));
          
          // Try to find by partial match or different ID format
          const partialMatch = validQuizzes.find((q: any) => 
            q._id?.includes(session.quizId) || 
            session.quizId?.includes(q._id) ||
            q.id === session.quizId ||
            q.quizId === session.quizId ||
            q._id === session.quizId.replace(/[\s_]+/g, '-') ||
            q._id === session.quizId.replace(/[\s-]+/g, '_')
          );
          
          if (partialMatch) {
            console.log('✅ Found quiz by partial match:', { quizId: partialMatch._id, title: partialMatch.title });
            quiz = partialMatch;
          } else {
            // Last resort: try to find by title or other properties
            console.log('🔍 Trying to find quiz by title or other properties...');
            const titleMatch = validQuizzes.find((q: any) => 
              q.title && q.title.toLowerCase().includes(session.quizId.toLowerCase()) ||
              session.quizId.toLowerCase().includes(q.title?.toLowerCase() || '')
            );
            
            if (titleMatch) {
              console.log('✅ Found quiz by title match:', { quizId: titleMatch._id, title: titleMatch.title });
              quiz = titleMatch;
            } else {
              // If we have only one quiz in the module, use it as fallback
              if (validQuizzes.length === 1) {
                console.log('⚠️ Using single quiz as fallback:', { quizId: validQuizzes[0]._id, title: validQuizzes[0].title });
                quiz = validQuizzes[0];
              } else {
                console.log('❌ Could not find matching quiz. Available quizzes:');
                validQuizzes.forEach((q: any, index: number) => {
                  console.log(`  ${index + 1}. ID: ${q._id}, Title: ${q.title}`);
                });
                return res.status(404).json({
                  success: false,
                  message: 'Quiz not found in module'
                });
              }
            }
          }
        }
        
        if (quiz) {
          console.log('✅ Found quiz in module:', { quizId: quiz._id, title: quiz.title, questionCount: quiz.questions?.length });
        }
      } else {
        console.log('❌ Module has no quizzes array or quizzes is not an array');
        console.log('❌ Module quizzes property:', moduleDoc.quizzes);
        return res.status(404).json({
          success: false,
          message: 'Module has no quizzes'
        });
      }
    } catch (error: any) {
      console.error('❌ Failed to get module or quiz:', error);
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
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

    try {
      await database.insert(session);
    } catch (error: any) {
      console.error('❌ Failed to update quiz session:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save quiz submission'
      });
    }

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

// Debug endpoint to inspect module and quiz data
router.get('/debug/module/:moduleId', authenticateToken, authorizeRoles('refugee', 'user', 'instructor', 'admin'), [
  param('moduleId').notEmpty().withMessage('Module ID is required')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { moduleId } = req.params;
    const { userId } = ensureAuth(req);

    console.log('🔍 DEBUG: Inspecting module:', moduleId);

    const database = await ensureDb();

    // Get the module
    const moduleDoc = await database.get(moduleId);
    if (!moduleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Analyze quizzes array
    const quizzesAnalysis = {
      hasQuizzesProperty: !!moduleDoc.quizzes,
      isArray: Array.isArray(moduleDoc.quizzes),
      totalLength: moduleDoc.quizzes ? moduleDoc.quizzes.length : 0,
      validQuizzes: 0,
      undefinedQuizzes: 0,
      nullQuizzes: 0,
      quizDetails: [] as Array<{
        index: number;
        id: any;
        title: any;
        questionCount: any;
        type: string;
      }>
    };

    if (moduleDoc.quizzes && Array.isArray(moduleDoc.quizzes)) {
      moduleDoc.quizzes.forEach((quiz: any, index: number) => {
        if (quiz === undefined) {
          quizzesAnalysis.undefinedQuizzes++;
        } else if (quiz === null) {
          quizzesAnalysis.nullQuizzes++;
        } else {
          quizzesAnalysis.validQuizzes++;
          quizzesAnalysis.quizDetails.push({
            index,
            id: quiz._id,
            title: quiz.title,
            questionCount: quiz.questions?.length || 0,
            type: typeof quiz
          });
        }
      });
    }

    res.json({
      success: true,
      data: {
        module: {
          _id: moduleDoc._id,
          title: moduleDoc.title,
          type: moduleDoc.type
        },
        quizzesAnalysis,
        rawQuizzes: moduleDoc.quizzes
      }
    });
  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug module'
    });
  }
}));

// Get all quiz sessions for a specific user and quiz
router.get('/user/:quizId', authenticateToken, authorizeRoles('refugee', 'user'), [
  param('quizId').notEmpty().withMessage('Quiz ID is required')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const { userId } = ensureAuth(req);

    console.log('🔍 Getting user quiz sessions:', { userId, quizId });

    const database = await ensureDb();

    // Find all quiz sessions for this user and quiz
    let sessions = [];
    try {
      const result = await database.find({
        selector: {
          type: 'quiz_session',
          userId,
          quizId
        },
        sort: [{ createdAt: 'desc' }]
      });

      sessions = result.docs;
      console.log('✅ Found', sessions.length, 'quiz sessions for user');
    } catch (error) {
      console.log('⚠️ Quiz sessions query failed:', error);
      
      // Fallback: search all documents
      try {
        const allDocs = await database.list({ include_docs: true });
        sessions = allDocs.rows
          .map((row: any) => row.doc)
          .filter((doc: any) => 
            doc && 
            doc.type === 'quiz_session' && 
            doc.userId === userId && 
            doc.quizId === quizId
          );
        console.log('✅ Found', sessions.length, 'quiz sessions via fallback search');
      } catch (fallbackError) {
        console.log('⚠️ Fallback search also failed:', fallbackError);
      }
    }

    // Format the sessions for response
    const formattedSessions = sessions.map((session: any) => ({
      _id: session._id,
      status: session.status,
      score: session.score,
      timeSpent: session.timeSpent,
      submittedAt: session.submittedAt,
      createdAt: session.createdAt,
      answers: session.answers
    }));

    res.json({
      success: true,
      data: {
        sessions: formattedSessions,
        total: formattedSessions.length
      }
    });
  } catch (error: any) {
    console.error('Error getting user quiz sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user quiz sessions'
    });
  }
}));

// Debug endpoint to check all quiz sessions for a user
router.get('/debug/user-sessions', authenticateToken, authorizeRoles('refugee', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = ensureAuth(req);

    console.log('🔍 DEBUG: Getting all quiz sessions for user:', userId);

    const database = await ensureDb();

    // Get all quiz sessions for this user
    const allDocs = await database.list({ include_docs: true });
    const userSessions = allDocs.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => 
        doc && 
        doc.type === 'quiz_session' && 
        doc.userId === userId
      );

    console.log('🔍 Found', userSessions.length, 'quiz sessions for user');

    // Format the sessions for response
    const formattedSessions = userSessions.map((session: any) => ({
      _id: session._id,
      quizId: session.quizId,
      courseId: session.courseId,
      moduleId: session.moduleId,
      status: session.status,
      score: session.score,
      timeSpent: session.timeSpent,
      submittedAt: session.submittedAt,
      createdAt: session.createdAt,
      answers: session.answers
    }));

    res.json({
      success: true,
      data: {
        userId,
        totalSessions: formattedSessions.length,
        sessions: formattedSessions
      }
    });
  } catch (error: any) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user sessions'
    });
  }
}));

// Direct quiz submission endpoint (simplified version)
router.post('/submit', authenticateToken, authorizeRoles('refugee', 'user'), [
  body('quizId').notEmpty().withMessage('Quiz ID is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('answers').isObject().withMessage('Answers must be an object'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId, courseId, moduleId, answers, timeSpent, score } = req.body;
    const { userId } = ensureAuth(req);

    console.log('📤 Direct quiz submission:', { userId, quizId, courseId, moduleId, score, timeSpent });

    const database = await ensureDb();

    // Check for existing completed session
    const result = await database.list({ include_docs: true });
    const existingSessions = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'quiz_session' && doc.userId === userId && doc.quizId === quizId && doc.status === 'completed')
      .slice(0, 1);

    if (existingSessions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this quiz'
      });
    }

    const now = new Date();

    // Create a quiz session record
    const sessionDoc = {
      _id: `quiz-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'quiz_session',
      userId,
      quizId,
      courseId,
      moduleId,
      startTime: now,
      durationMinutes: 30,
      endTime: now,
      status: 'completed',
      answers,
      timeSpent: timeSpent || 0,
      score: score || 0,
      submittedAt: now,
      isExpired: false,
      createdAt: now,
      updatedAt: now
    };

    await database.insert(sessionDoc);

    console.log('✅ Quiz session saved successfully:', sessionDoc._id);

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        sessionId: sessionDoc._id,
        score: sessionDoc.score,
        timeSpent: sessionDoc.timeSpent,
        submittedAt: now,
        answers: sessionDoc.answers
      }
    });
  } catch (error: any) {
    console.error('Error in direct quiz submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
}));

export default router; 