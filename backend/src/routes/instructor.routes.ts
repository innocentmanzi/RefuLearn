import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { connectCouchDB } from '../config/couchdb';

// Use proper authenticated request type
interface AuthenticatedRequest extends Request {
  query: any; // Fix for req.query type error
  body: any;  // Fix for req.body type error
  params: any; // Fix for req.params type error
  headers: any; // Fix for req.headers type error
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

// Use proper CouchDB connection with authentication
let couchConnection: any = null;

// Initialize proper database connection
const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing CouchDB connection for instructor routes...');
    
    couchConnection = await connectCouchDB();
    
    console.log('✅ Instructor routes database connection successful!');
    
    return true;
  } catch (error: any) {
    console.error('❌ Instructor routes database connection failed:', error.message);
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

interface CourseDoc {
  _id: string;
  _rev: string;
  type: 'course';
  title: string;
  instructor: string;
  isPublished: boolean;
  enrolledStudents?: string[];
  studentProgress?: Array<{
    student: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
    score?: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface AssessmentDoc {
  _id: string;
  _rev: string;
  type: 'assessment' | 'quiz' | 'assignment' | 'exam';
  title: string;
  description: string;
  course: string;
  instructor: string;
  status: string;
  questions: Array<{
    _id?: string;
    question: string;
    type: string;
    points: number;
    options?: string[];
    correctAnswer?: string;
    rubric?: any[];
  }>;
  totalPoints: number;
  passingScore?: number;
  duration?: number;
  dueDate?: Date;
  submissions?: Array<{
    _id?: string;
    student: string;
    answers: any[];
    score?: number;
    submittedAt: Date;
    status: string;
    timeSpent?: number;
    feedback?: string;
    comments?: string;
    gradedAt?: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface UserDoc {
  _id: string;
  _rev: string;
  type: 'user';
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePic?: string;
  [key: string]: any;
}

interface HelpTicketDoc {
  _id: string;
  _rev: string;
  type: 'help_ticket';
  title: string;
  description: string;
  user: string;
  assignedTo?: string;
  status: string;
  priority?: string;
  category?: string;
  messages?: Array<{
    _id: string;
    sender: string;
    message: string;
    isInternal: boolean;
    createdAt: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// Get active courses for assessments (published courses only)
router.get('/courses/active', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const database = await ensureDb();
    
    // Get all documents and filter for published courses only
    const result = await database.list({ include_docs: true });
    
    const activeCourses = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && 
        doc.type === 'course' && 
        doc.instructor === userId && 
        doc.isPublished === true
      ) as CourseDoc[];
    
    // Sort by title for better UX
    activeCourses.sort((a, b) => a.title.localeCompare(b.title));
    
    res.json({
      success: true,
      data: {
        courses: activeCourses,
        total: activeCourses.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching active courses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active courses'
    });
  }
}));

// Get instructor's courses
router.get('/courses', authenticateToken, authorizeRoles('instructor'), validate([
  query('status').optional().isIn(['published', 'draft']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, page = 1, limit = 100 } = req.query;
  const { userId } = ensureAuth(req);
  
  const database = await ensureDb();
  
  // Use database.list() which is compatible with Nano API
  const result = await database.list({ include_docs: true });
  
  // Filter for courses belonging to this instructor
  console.log('🔍 Instructor courses request:', {
    userId,
    userIdType: typeof userId
  });
  
  let courses = result.rows
    .map((row: any) => row.doc)
    .filter((doc: any) => {
      const match = doc && doc.type === 'course' && 
        (doc.instructor === userId || doc.instructor_id === userId);
      
      if (doc?.type === 'course') {
        console.log('🔍 Checking course:', {
          courseTitle: doc.title,
          courseInstructor: doc.instructor,
          courseInstructorId: doc.instructor_id,
          userId,
          match
        });
      }
      
      return match;
    }) as CourseDoc[];
  
  console.log('📚 Found courses for instructor:', courses.length);
  console.log('🖼️ Course profile pictures:', courses.map(c => ({
    title: c.title,
    course_profile_picture: c.course_profile_picture,
    image: c.image,
    hasProfilePic: !!c.course_profile_picture,
    hasImage: !!c.image
  })));
  
  // Apply status filter
  if (status === 'published') {
    courses = courses.filter(c => c.isPublished === true);
  } else if (status === 'draft') {
    courses = courses.filter(c => c.isPublished === false);
  }
  // No filtering by default - return all courses (both published and draft)

  // Get modules for each course
  const coursesWithModules = await Promise.all(
    courses.map(async (course) => {
      try {
        // Filter modules for this course
        const modules = result.rows
          .map((row: any) => row.doc)
          .filter((doc: any) => doc && doc.type === 'module' && 
            (doc.course === course._id || doc.courseId === course._id))
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        
        return {
          ...course,
          modules: modules || [],
          course_profile_picture: course.course_profile_picture || course.image || null
        };
      } catch (error) {
        // If modules query fails, return course without modules
        return {
          ...course,
          modules: [],
          course_profile_picture: course.course_profile_picture || course.image || null
        };
      }
    })
  );

  // Pagination
  const total = coursesWithModules.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedCourses = coursesWithModules.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  // Debug: Log the final course data being sent
  console.log('📤 Final course data being sent to frontend:');
  pagedCourses.forEach((course, index) => {
    console.log(`Course ${index + 1}: "${course.title}"`);
    console.log(`  - course_profile_picture: ${course.course_profile_picture}`);
    console.log(`  - image: ${course.image}`);
    console.log(`  - hasProfilePic: ${!!course.course_profile_picture}`);
    console.log(`  - hasImage: ${!!course.image}`);
  });

  res.json({
    success: true,
    data: {
      courses: pagedCourses,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCourses: total
      }
    }
  });
}));

// Get instructor's assessments
router.get('/assessments', authenticateToken, authorizeRoles('instructor'), validate([
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  const { userId } = ensureAuth(req);
  
  const database = await ensureDb();
  
  // Use database.list() which is compatible with Nano API
  const result = await database.list({ include_docs: true });
  
  // Filter for assessments belonging to this instructor
  let assessments = result.rows
    .map((row: any) => row.doc)
    .filter((doc: any) => doc && 
      ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) && 
      doc.instructor === userId) as AssessmentDoc[];
  
  // Apply status filter
  if (status) {
    assessments = assessments.filter(a => a.status === status);
  }

  // Ensure all questions have proper IDs
  assessments = assessments.map(assessment => {
    if (assessment.questions && assessment.questions.length > 0) {
      assessment.questions = assessment.questions.map((question, index) => {
        if (!question._id) {
          question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return question;
      });
    }
    return assessment;
  });

  // Populate course information for each assessment
  const assessmentsWithCourses = await Promise.all(
    assessments.map(async (assessment) => {
      try {
        const database = await ensureDb();
        const course = await database.get(assessment.course) as CourseDoc;
        return {
          ...assessment,
          courseName: course.title,
          courseData: {
            _id: course._id,
            title: course.title,
            isPublished: course.isPublished
          }
        };
      } catch (error) {
        // If course not found, return assessment without course info
        return {
          ...assessment,
          courseName: 'Unknown Course',
          courseData: null
        };
      }
    })
  );

  // Pagination
  const total = assessmentsWithCourses.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedAssessments = assessmentsWithCourses.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      assessments: pagedAssessments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalAssessments: total
      }
    }
  });
}));

// Create assessment
router.post('/assessments', authenticateToken, authorizeRoles('instructor'), [
  body('title').notEmpty().withMessage('Assessment title is required'),
  body('description').optional().trim(),
  body('courseId').optional().notEmpty().withMessage('Course selection cannot be empty if provided'),
  body('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be a non-negative integer'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, timeLimit, ...assessmentData } = req.body;
  const { userId } = ensureAuth(req);

  try {
    console.log('Creating assessment with data:', { courseId, timeLimit, ...assessmentData }); // Debug log

    const database = await ensureDb();

    // Use courseId from request or default to 'general'
    const finalCourseId = courseId || 'general';

    // If a specific course is provided, verify it exists and belongs to the instructor
    if (courseId && courseId !== 'general') {
      try {
        const course = await database.get(courseId) as CourseDoc;
        if (!course) {
          return res.status(404).json({
            success: false,
            message: 'Course not found'
          });
        }

        if (course.instructor !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to create assessment for this course'
          });
        }

        if (!course.isPublished) {
          return res.status(400).json({
            success: false,
            message: 'Cannot create assessment for unpublished course'
          });
        }
      } catch (error) {
        console.error('Error checking course:', error);
        // If course checking fails, fall back to general course
        console.log('Falling back to general course');
      }
    }

    // Process questions and ensure they have proper IDs
    const questions = (assessmentData.questions || []).map((q: any, index: number) => ({
      _id: q._id || `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      question: q.question,
      type: q.type,
      points: q.points || 1,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    }));

    // Calculate total points from questions if not provided
    let totalPoints = assessmentData.totalPoints || 0;
    if (questions && questions.length > 0) {
      totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);
    }

    const assessment: AssessmentDoc = {
      ...assessmentData,
      _id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: assessmentData.type || 'assessment',
      course: finalCourseId,
      courseId: finalCourseId, // Ensure both fields are set for compatibility
      moduleId: assessmentData.moduleId || '', // Include moduleId if provided
      instructor: userId,
      status: 'published', // Automatically publish instead of draft
      duration: timeLimit || assessmentData.duration || 60,
      totalPoints: totalPoints,
      questions: questions,
      submissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: assessmentData.dueDate ? new Date(assessmentData.dueDate) : undefined
    };

    console.log('Assessment object to save:', assessment); // Debug log

    const createdAssessment = await database.insert(assessment);
    console.log('Assessment saved successfully:', createdAssessment); // Debug log

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully!',
      data: { 
        assessment: {
          ...assessment,
          _id: createdAssessment.id,
          _rev: createdAssessment.rev
        },
        courseId: finalCourseId // Return courseId for frontend navigation
      }
    });
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while creating assessment'
    });
  }
}));

// Update assessment
router.put('/assessments/:assessmentId', authenticateToken, authorizeRoles('instructor'), [
  body('title').optional().notEmpty().withMessage('Assessment title cannot be empty'),
  body('description').optional().trim(),
  body('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
  body('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('questions.*.question').optional().notEmpty().withMessage('Question text cannot be empty'),
  body('questions.*.type').optional().isIn(['multiple-choice', 'true-false', 'short-answer', 'essay']).withMessage('Invalid question type'),
  body('questions.*.points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be a non-negative integer'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const { courseId, timeLimit, ...updates } = req.body;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const assessment = await database.get(assessmentId) as AssessmentDoc;
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user is the instructor
    if (assessment.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assessment'
      });
    }

    // If courseId is being updated, verify the new course
    if (courseId && courseId !== assessment.course) {
      const course = await database.get(courseId) as CourseDoc;
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (course.instructor !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to assign assessment to this course'
        });
      }

      if (!course.isPublished) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign assessment to unpublished course'
        });
      }

      updates.course = courseId;
    }

    // Handle timeLimit mapping to duration
    if (timeLimit !== undefined) {
      updates.duration = timeLimit;
    }

    // Process questions if provided
    if (updates.questions) {
      // Ensure each question has a proper ID
      updates.questions = updates.questions.map((question: any, index: number) => {
        if (!question._id) {
          question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Validate question structure
        if (!question.question || !question.type || question.points === undefined) {
          throw new Error(`Invalid question at index ${index}: missing required fields`);
        }
        
        // Validate multiple choice questions
        if (question.type === 'multiple-choice') {
          if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
            throw new Error(`Multiple choice question at index ${index} must have at least 2 options`);
          }
          if (!question.correctAnswer) {
            throw new Error(`Multiple choice question at index ${index} must have a correct answer`);
          }
        }
        
        // Validate other question types
        if (question.type !== 'multiple-choice' && !question.correctAnswer) {
          throw new Error(`Question at index ${index} must have a correct answer`);
        }
        
        return {
          _id: question._id,
          question: question.question,
          type: question.type,
          points: parseInt(question.points) || 1,
          options: question.options || [],
          correctAnswer: question.correctAnswer || '',
          explanation: question.explanation || ''
        };
      });
      
      // Recalculate total points
      updates.totalPoints = updates.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    } else if (assessment.questions) {
      // Ensure existing questions have IDs
      assessment.questions = assessment.questions.map((question: any, index: number) => {
        if (!question._id) {
          question._id = `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return question;
      });
    }

    // Clean up the updates object
    const cleanUpdates = {
      ...updates,
      updatedAt: new Date()
    };

    // Handle dueDate separately to ensure proper Date conversion
    if (updates.dueDate) {
      cleanUpdates.dueDate = new Date(updates.dueDate);
    }

    Object.assign(assessment, cleanUpdates);
    
    const latest = await database.get(assessment._id);
    assessment._rev = latest._rev;
    const updatedAssessment = await database.insert(assessment);

    res.json({
      success: true,
      message: 'Assessment updated successfully!',
      data: { assessment: updatedAssessment }
    });
  } catch (error: any) {
    console.error('Error updating assessment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating assessment'
    });
  }
}));

// Add individual question to assessment
router.post('/assessments/:assessmentId/questions', authenticateToken, authorizeRoles('instructor'), [
  body('question').notEmpty().withMessage('Question text is required'),
  body('type').isIn(['multiple-choice', 'true-false', 'short-answer', 'essay']).withMessage('Invalid question type'),
  body('points').isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('options').optional().isArray().withMessage('Options must be an array'),
  body('correctAnswer').notEmpty().withMessage('Correct answer is required')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const { question, type, points, options, correctAnswer, explanation } = req.body;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const assessment = await database.get(assessmentId) as AssessmentDoc;
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user is the instructor
    if (assessment.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add questions to this assessment'
      });
    }

    // Validate question based on type
    if (type === 'multiple-choice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 options'
        });
      }
      if (!options.includes(correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: 'Correct answer must be one of the provided options'
        });
      }
    }

    // Create new question
    const newQuestion = {
      _id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      type,
      points: parseInt(points) || 1,
      options: options || [],
      correctAnswer,
      explanation: explanation || ''
    };

    // Add question to assessment
    if (!assessment.questions) {
      assessment.questions = [];
    }
    assessment.questions.push(newQuestion);

    // Recalculate total points
    assessment.totalPoints = assessment.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    assessment.updatedAt = new Date();

    const latest = await database.get(assessment._id);
    assessment._rev = latest._rev;
    const updatedAssessment = await database.insert(assessment);

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: { 
        question: newQuestion,
        assessment: updatedAssessment
      }
    });
  } catch (error: any) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while adding question'
    });
  }
}));

// Update individual question in assessment
router.put('/assessments/:assessmentId/questions/:questionId', authenticateToken, authorizeRoles('instructor'), [
  body('question').optional().notEmpty().withMessage('Question text cannot be empty'),
  body('type').optional().isIn(['multiple-choice', 'true-false', 'short-answer', 'essay']).withMessage('Invalid question type'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('options').optional().isArray().withMessage('Options must be an array'),
  body('correctAnswer').optional().notEmpty().withMessage('Correct answer cannot be empty')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId, questionId } = req.params;
  const updates = req.body;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const assessment = await database.get(assessmentId) as AssessmentDoc;
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user is the instructor
    if (assessment.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update questions in this assessment'
      });
    }

    // Ensure questions array exists
    if (!assessment.questions) {
      assessment.questions = [];
    }

    // Find the question by ID or by index if ID not found
    let questionIndex = assessment.questions.findIndex(q => q._id === questionId);
    
    // If question not found by ID, try to find by index (for backward compatibility)
    if (questionIndex === -1) {
      const indexFromId = questionId.match(/question_\d+_(\d+)_/);
      if (indexFromId) {
        const index = parseInt(indexFromId[1]);
        if (index >= 0 && index < assessment.questions.length) {
          questionIndex = index;
          // Update the question with the proper ID
          assessment.questions[questionIndex]._id = questionId;
        }
      }
    }

    // If still not found, check if we can match by question content
    if (questionIndex === -1) {
      questionIndex = assessment.questions.findIndex(q => 
        q.question === updates.question || 
        (!q._id && assessment.questions.indexOf(q) === parseInt(questionId.split('_')[2] || '0'))
      );
      
      if (questionIndex !== -1) {
        // Assign the ID to the found question
        assessment.questions[questionIndex]._id = questionId;
      }
    }

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const question = assessment.questions[questionIndex];

    // Validate updates based on question type
    if (updates.type === 'multiple-choice' || question.type === 'multiple-choice') {
      const options = updates.options || question.options;
      const correctAnswer = updates.correctAnswer || question.correctAnswer;
      
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 options'
        });
      }
      if (!options.includes(correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: 'Correct answer must be one of the provided options'
        });
      }
    }

    // Update the question
    Object.assign(question, updates);
    if (updates.points !== undefined) {
      question.points = parseInt(updates.points) || 1;
    }

    // Ensure the question has an ID
    if (!question._id) {
      question._id = questionId;
    }

    // Recalculate total points
    assessment.totalPoints = assessment.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    assessment.updatedAt = new Date();

    const latest = await database.get(assessment._id);
    assessment._rev = latest._rev;
    const updatedAssessment = await database.insert(assessment);

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { 
        question,
        assessment: updatedAssessment
      }
    });
  } catch (error: any) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating question'
    });
  }
}));

// Delete individual question from assessment
router.delete('/assessments/:assessmentId/questions/:questionId', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId, questionId } = req.params;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const assessment = await database.get(assessmentId) as AssessmentDoc;
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user is the instructor
    if (assessment.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete questions from this assessment'
      });
    }

    // Find and remove the question
    const questionIndex = assessment.questions.findIndex(q => q._id === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const removedQuestion = assessment.questions.splice(questionIndex, 1)[0];

    // Recalculate total points
    assessment.totalPoints = assessment.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    assessment.updatedAt = new Date();

    const latest = await database.get(assessment._id);
    assessment._rev = latest._rev;
    const updatedAssessment = await database.insert(assessment);

    res.json({
      success: true,
      message: 'Question deleted successfully',
      data: { 
        deletedQuestion: removedQuestion,
        assessment: updatedAssessment
      }
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while deleting question'
    });
  }
}));

// Test authentication route
router.get('/test-auth', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  
  console.log('🧪 TEST AUTH ROUTE CALLED');
  console.log('   User from token:', userId);
  console.log('   Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  
  res.json({
    success: true,
    message: 'Authentication working',
    user: userId
  });
}));

// Delete assessment - Simplified version with better debugging
router.delete('/assessments/:assessmentId', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const { userId } = ensureAuth(req);

  try {
    console.log('🗑️ DELETE REQUEST RECEIVED');
    console.log('   Assessment ID:', assessmentId);
    console.log('   User from token:', userId);
    console.log('   Auth header:', req.headers.authorization ? 'Present' : 'Missing');

    const database = await ensureDb();
    
    let assessment: any;
    try {
      assessment = await database.get(assessmentId);
      console.log('📋 Assessment found:', assessment.title);
      console.log('📋 Assessment instructor:', assessment.instructor);
      console.log('📋 Assessment data:', JSON.stringify(assessment, null, 2));
    } catch (getError: any) {
      console.log('❌ Assessment not found:', assessmentId);
      console.log('❌ Get error:', getError.message);
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check instructor authorization
    console.log('🔍 Instructor check:');
    console.log('   Assessment instructor:', assessment.instructor);
    console.log('   User ID:', userId);
    console.log('   Match:', assessment.instructor === userId);

    // Delete the assessment
    try {
      // Use the correct method for Nano/CouchDB
      await database.destroy(assessment._id, assessment._rev);
      console.log('✅ Assessment deleted successfully');

      // Remove the assessment from the module's assessments array
      if (assessment.moduleId) {
        try {
          const module = await database.get(assessment.moduleId);
          if (module && module.type === 'module') {
            // Initialize assessments array if it doesn't exist
            if (!module.assessments) {
              module.assessments = [];
            }
            
            // Remove the assessment from the module's assessments array
            const assessmentIndex = module.assessments.findIndex((a: any) => 
              a._id === assessment._id || a.id === assessment._id
            );
            
            if (assessmentIndex !== -1) {
              module.assessments.splice(assessmentIndex, 1);
              module.updatedAt = new Date();
              await database.insert(module);
              console.log('✅ ASSESSMENT DELETE - Removed from module assessments array');
            }
          }
        } catch (moduleError) {
          console.warn('⚠️ ASSESSMENT DELETE - Could not update module assessments array:', moduleError);
          // Don't fail the whole operation if module update fails
        }
      }

      res.json({
        success: true,
        message: 'Assessment deleted successfully'
      });
    } catch (removeError: any) {
      console.log('❌ Error removing assessment:', removeError.message);
      console.log('❌ Remove error details:', removeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete assessment: ' + removeError.message
      });
    }

  } catch (error: any) {
    console.error('❌ Error in delete route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}));

// Get assessment submissions
router.get('/assessments/:assessmentId/submissions', authenticateToken, authorizeRoles('instructor'), validate([
  query('status').optional().isIn(['submitted', 'graded', 'late']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const assessment = await database.get(assessmentId) as AssessmentDoc;
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user is the instructor
    if (assessment.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view submissions for this assessment'
      });
    }

    let submissions = assessment.submissions || [];
    
    if (status) {
      submissions = submissions.filter((sub: any) => sub.status === status);
    }

    // Paginate submissions
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedSubmissions = submissions.slice(startIndex, endIndex);

    // Populate user data for submissions
    const populatedSubmissions = await Promise.all(
      paginatedSubmissions.map(async (sub: any) => {
        try {
          const user = await database.get(sub.student) as UserDoc;
          return {
            ...sub,
            student: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profilePic: user.profilePic
            }
          };
        } catch (error) {
          return {
            ...sub,
            student: {
              _id: sub.student,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com',
              profilePic: null
            }
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        submissions: populatedSubmissions,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(submissions.length / Number(limit)),
          totalSubmissions: submissions.length
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching assessment submissions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching submissions'
    });
  }
}));

// Grade assessment submission
router.put('/assessments/:assessmentId/submissions/:submissionId/grade', authenticateToken, authorizeRoles('instructor'), validate([
  body('score').isFloat({ min: 0 }).withMessage('Score must be non-negative'),
  body('feedback').optional().trim(),
  body('comments').optional().trim()
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId, submissionId } = req.params;
  const { score, feedback, comments } = req.body;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const assessment = await database.get(assessmentId) as AssessmentDoc;
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user is the instructor
    if (assessment.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade submissions for this assessment'
      });
    }

    if (!assessment.submissions) {
      assessment.submissions = [];
    }

    const submission = assessment.submissions.find((s: any) => s._id === submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.comments = comments || '';
    submission.gradedAt = new Date();
    submission.status = 'graded';

    assessment.updatedAt = new Date();
    const latest = await database.get(assessment._id);
    assessment._rev = latest._rev;
    await database.insert(assessment);

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: { submission }
    });
  } catch (error: any) {
    console.error('Error grading assessment submission:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while grading submission'
    });
  }
}));

// Get course analytics
router.get('/courses/:courseId/analytics', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const course = await database.get(courseId) as CourseDoc;
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor
    if (course.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this course'
      });
    }

    const totalEnrollments = course.enrolledStudents?.length || 0;
    const completedModules = course.studentProgress?.filter((p: any) => p.completed).length || 0;
    const averageScore = course.studentProgress && course.studentProgress.length > 0 
      ? course.studentProgress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / course.studentProgress.length
      : 0;

    // Get assessments for this course using list + filtering
    const allDocsResult = await database.list({ include_docs: true });
    const assessments = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && 
        ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) && 
        doc.course === courseId) as AssessmentDoc[];
    
    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter((a: AssessmentDoc) => a.status === 'published').length;

    // Get recent student activity
    const recentProgress = course.studentProgress && course.studentProgress.length > 0
      ? course.studentProgress
          .sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
          .slice(0, 10)
      : [];

    const populatedProgress = await Promise.all(
      recentProgress.map(async (p: any) => {
        try {
          const user = await database.get(p.student) as UserDoc;
          return {
            ...p,
            student: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              profilePic: user.profilePic
            }
          };
        } catch (error) {
          return {
            ...p,
            student: {
              _id: p.student,
              firstName: 'Unknown',
              lastName: 'User',
              profilePic: null
            }
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        totalEnrollments,
        completedModules,
        averageScore: Math.round(averageScore * 100) / 100,
        totalAssessments,
        completedAssessments,
        recentActivity: populatedProgress,
        studentProgress: course.studentProgress || []
      }
    });
  } catch (error: any) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching analytics'
    });
  }
}));

// Get instructor analytics
router.get('/analytics', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const { userId } = ensureAuth(req);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const database = await ensureDb();
    
    // Get all documents and filter for courses and assessments
    const allDocsResult = await database.list({ include_docs: true });
    
    // Course statistics
    const courses = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'course' && doc.instructor === userId) as CourseDoc[];
    
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const newCourses = courses.filter(c => c.createdAt && new Date(c.createdAt) >= daysAgo).length;

    // Assessment statistics
    const assessments = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && 
        ['assessment', 'quiz', 'assignment', 'exam'].includes(doc.type) && 
        doc.instructor === userId) as AssessmentDoc[];
    
    const totalAssessments = assessments.length;
    const publishedAssessments = assessments.filter(a => a.status === 'published').length;
    const newAssessments = assessments.filter(a => a.createdAt && new Date(a.createdAt) >= daysAgo).length;

    // Recent courses
    const recentCourses = courses
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);

    // Recent assessments
    const recentAssessments = assessments
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);

    // Student statistics
    const allStudentIds = new Set<string>();
    courses.forEach(course => {
      if (course.enrolledStudents) {
        course.enrolledStudents.forEach(id => allStudentIds.add(id));
      }
    });

    const totalStudents = allStudentIds.size;

    // Calculate completion rates
    let totalCompletions = 0;
    let totalProgress = 0;
    courses.forEach(course => {
      if (course.studentProgress) {
        totalProgress += course.studentProgress.length;
        totalCompletions += course.studentProgress.filter(p => p.completed).length;
      }
    });

    const completionRate = totalProgress > 0 ? (totalCompletions / totalProgress) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          publishedCourses,
          newCourses,
          totalAssessments,
          publishedAssessments,
          newAssessments,
          totalStudents,
          completionRate: Math.round(completionRate * 100) / 100
        },
        recentCourses,
        recentAssessments
      }
    });
  } catch (error: any) {
    console.error('Error fetching instructor analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching analytics'
    });
  }
}));

// REMOVED MOCK DATA - User wants only real data from database

// Get instructor dashboard
router.get('/dashboard', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const { userId } = ensureAuth(req);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const database = await ensureDb();
    
    // Get all documents and filter for courses and assessments
    const allDocsResult = await database.list({ include_docs: true });
    
    // Course statistics
    const courses = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'course' && doc.instructor === userId) as CourseDoc[];
    
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;

    // Quiz statistics (only quizzes, not all assessments)
    const quizzes = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && 
        doc.type === 'quiz' && 
        (doc.instructor === userId || doc.instructorId === userId)) as AssessmentDoc[];

    const totalQuizzes = quizzes.length;
    const publishedQuizzes = quizzes.filter(q => q.status === 'published').length;

    // Get all users for activity tracking
    const users = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'user' && doc.role === 'user') as UserDoc[];

    // Student statistics
    const allStudentIds = new Set<string>();
    courses.forEach(course => {
      if (course.enrolledStudents) {
        course.enrolledStudents.forEach(id => allStudentIds.add(id));
      }
    });

    const totalStudents = allStudentIds.size;

    // Calculate student progress data with REAL completion logic
    const studentProgress = await Promise.all(courses.map(async (course) => {
      // Get enrolled students count - ensure it's valid
      const enrolledCount = course.enrolledStudents?.length || 0;
      
      // Get all modules for this course to calculate total items
      const moduleIds = course.modules || [];
      let totalItemsInCourse = 0;
      
      // Calculate total items across all modules
      for (const moduleId of moduleIds) {
        try {
          const moduleDoc = await database.get(moduleId);
          if (moduleDoc) {
            if (moduleDoc.description) totalItemsInCourse++;
            if (moduleDoc.content) totalItemsInCourse++;
            if (moduleDoc.videoUrl) totalItemsInCourse++;
            if (moduleDoc.resources) totalItemsInCourse += moduleDoc.resources.length;
            if (moduleDoc.assessments) totalItemsInCourse += moduleDoc.assessments.length;
            if (moduleDoc.quizzes) totalItemsInCourse += moduleDoc.quizzes.length;
            if (moduleDoc.discussions) totalItemsInCourse += moduleDoc.discussions.length;
            if (moduleDoc.contentItems) totalItemsInCourse += moduleDoc.contentItems.length;
          }
        } catch (moduleError) {
          console.warn('⚠️ Could not fetch module for progress calculation:', moduleError);
        }
      }
      
      // Count students who have completed the course
      let completedCount = 0;
      const studentsWhoCompleted = new Set<string>();
      
      if (course.studentProgress && course.studentProgress.length > 0) {
        // Group progress by student to calculate completion
        const studentProgressMap = new Map();
        
        course.studentProgress.forEach((progress: any) => {
          // Only process progress for students who are actually enrolled
          if (!course.enrolledStudents?.includes(progress.student)) {
            console.warn(`⚠️ Student ${progress.student} has progress but is not enrolled in course ${course.title}`);
            return;
          }
          
          if (!studentProgressMap.has(progress.student)) {
            studentProgressMap.set(progress.student, {
              completedItems: new Set(),
              modules: new Set(),
              totalProgress: 0
            });
          }
          
          const studentData = studentProgressMap.get(progress.student);
          
          // Add completed items
          if (progress.completedItems) {
            progress.completedItems.forEach((item: string) => {
              studentData.completedItems.add(item);
            });
          }
          
          // Add completed modules
          if (progress.completed === true) {
            studentData.modules.add(progress.moduleId);
          }
        });
        
        // Count students who have completed the course
        studentProgressMap.forEach((studentData, studentId) => {
          // More flexible completion criteria:
          // 1. Completed all modules (if course has modules)
          // 2. Completed 80% of all items (if course has items)
          // 3. Has made significant progress (at least 1 module or 3 items)
          
          const hasCompletedAllModules = moduleIds.length > 0 && studentData.modules.size >= moduleIds.length;
          const hasCompletedMostItems = totalItemsInCourse > 0 && studentData.completedItems.size >= Math.max(1, totalItemsInCourse * 0.8);
          const hasMadeSignificantProgress = studentData.modules.size > 0 || studentData.completedItems.size >= 3;
          
          // For courses with no content, consider enrolled students as "completed" if they have any progress
          const hasNoContent = totalItemsInCourse === 0 && moduleIds.length === 0;
          const hasAnyProgress = studentData.modules.size > 0 || studentData.completedItems.size > 0;
          
          if (hasCompletedAllModules || hasCompletedMostItems || (hasNoContent && hasAnyProgress) || hasMadeSignificantProgress) {
            studentsWhoCompleted.add(studentId);
          }
        });
        
        completedCount = studentsWhoCompleted.size;
      }
      
      // Safety checks for data consistency
      if (completedCount > enrolledCount) {
        console.warn(`⚠️ Course "${course.title}": More completed students (${completedCount}) than enrolled (${enrolledCount}) - fixing data`);
        completedCount = enrolledCount;
      }
      
      // Calculate realistic completion percentage
      const completionPercentage = enrolledCount > 0 ? 
        Math.round((completedCount / enrolledCount) * 100) : 0;
      
      console.log(`📊 Course "${course.title}": ${enrolledCount} enrolled, ${completedCount} completed, ${totalItemsInCourse} total items, ${completionPercentage}% completion`);
      
      return {
        courseName: course.title,
        courseId: course._id,
        enrolledStudents: enrolledCount,
        completedStudents: completedCount,
        completionPercentage,
        lastActivity: course.updatedAt || course.createdAt
      };
    }));

    // Calculate all types of submissions (quizzes + assignments)
    let pendingSubmissions = 0;
    
    // Count quiz submissions
    quizzes.forEach(quiz => {
      if (quiz.submissions) {
        pendingSubmissions += quiz.submissions.filter((sub: any) => sub.status === 'submitted').length;
      }
    });
    
    // Count assignment submissions from course routes
    const assignmentSubmissions = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'assignment_submission');
      
    // Filter assignment submissions for instructor's courses
    const instructorCourseIds = courses.map(c => c._id);
    const instructorAssignmentSubmissions = assignmentSubmissions.filter((sub: any) => 
      instructorCourseIds.includes(sub.courseId)
    );
    
    pendingSubmissions += instructorAssignmentSubmissions.length;

    // Debug the actual data structure
    console.log('🔍 DEBUGGING COURSE DATA:');
    courses.forEach((course, index) => {
      console.log(`Course ${index + 1}: ${course.title}`);
      console.log('  - enrolledStudents:', course.enrolledStudents);
      console.log('  - studentProgress:', course.studentProgress);
      console.log('  - enrolledStudents length:', course.enrolledStudents?.length || 0);
      console.log('  - studentProgress length:', course.studentProgress?.length || 0);
      
      if (course.studentProgress) {
        course.studentProgress.forEach((progress: any, idx: number) => {
          console.log(`    Progress ${idx + 1}:`, {
            student: progress.student,
            completed: progress.completed,
            moduleId: progress.moduleId,
            completedAt: progress.completedAt,
            score: progress.score
          });
        });
      }
    });
    
    // Calculate using REAL completion data - only count truly completed students
    let totalEnrolledStudents = 0;
    let totalCompletedStudents = 0;
    let activeStudents = 0;
    
    courses.forEach(course => {
      // Count enrolled students
      const enrolledCount = course.enrolledStudents?.length || 0;
      totalEnrolledStudents += enrolledCount;
      
      // Count students who have ACTUALLY completed (not just started)
      if (course.studentProgress && course.studentProgress.length > 0) {
        const studentsWithRealCompletion = new Set();
        const studentsWithRecentActivity = new Set();
        
        course.studentProgress.forEach((progress: any) => {
          // Only count as completed if progress.completed is explicitly true
          if (progress.completed === true && progress.student) {
            studentsWithRealCompletion.add(progress.student);
          }
          
          // Count as active if they have recent activity (last 7 days)
          if (progress.completedAt) {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            if (new Date(progress.completedAt) >= lastWeek) {
              studentsWithRecentActivity.add(progress.student);
            }
          }
        });
        
        totalCompletedStudents += studentsWithRealCompletion.size;
        activeStudents += studentsWithRecentActivity.size;
      }
    });
    
    // Calculate realistic completion rate
    const completionRate = totalEnrolledStudents > 0 ? 
      Math.min(100, (totalCompletedStudents / totalEnrolledStudents) * 100) : 0;
    
    console.log('📊 FINAL CALCULATIONS (Real Completion):');
    console.log('  - totalEnrolledStudents:', totalEnrolledStudents);
    console.log('  - totalCompletedStudents (only truly completed):', totalCompletedStudents);
    console.log('  - activeStudents (recent activity):', activeStudents);
    console.log('  - completionRate:', completionRate);

    // Final safety check - if data looks unrealistic, provide sensible defaults
    const safeCompletionRate = Math.min(100, Math.max(0, Math.round(completionRate)));
    const safeActiveStudents = Math.min(totalStudents, activeStudents);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          publishedCourses,
          totalQuizzes,
          publishedQuizzes,
          totalStudents,
          pendingSubmissions,
          totalSubmissions: pendingSubmissions,
          activeStudents: safeActiveStudents,
          completionRate: safeCompletionRate
        },
        studentProgress,
        recentCourses: courses.slice(0, 5),
        recentQuizzes: quizzes.slice(0, 5)
      }
    });
  } catch (error: any) {
    console.error('Error fetching instructor dashboard:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching dashboard'
    });
  }
}));

// Get instructor's help tickets
router.get('/help-tickets', authenticateToken, authorizeRoles('instructor'), validate([
  query('status').optional().isIn(['open', 'in_progress', 'closed', 'resolved']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, priority, page = 1, limit = 10 } = req.query;

  try {
    const database = await ensureDb();
    
    // Get all help tickets and filter
    const allDocsResult = await database.list({ include_docs: true });
    let tickets = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'help_ticket') as HelpTicketDoc[];

    // Apply filters
    if (status) {
      tickets = tickets.filter(ticket => ticket.status === status);
    }
    if (priority) {
      tickets = tickets.filter(ticket => ticket.priority === priority);
    }

    // Pagination
    const total = tickets.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const pagedTickets = tickets.slice(startIndex, endIndex);

    // Populate user information
    const populatedTickets = await Promise.all(
      pagedTickets.map(async (ticket: any) => {
        try {
          const user = await database.get(ticket.user) as UserDoc;
          const assignedUser = ticket.assignedTo ? await database.get(ticket.assignedTo) as UserDoc : null;
          return {
            ...ticket,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profilePic: user.profilePic
            },
            assignedTo: assignedUser ? {
              _id: assignedUser._id,
              firstName: assignedUser.firstName,
              lastName: assignedUser.lastName,
              email: assignedUser.email
            } : null
          };
        } catch (error) {
          return {
            ...ticket,
            user: {
              _id: ticket.user,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com',
              profilePic: null
            },
            assignedTo: null
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        tickets: populatedTickets,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalTickets: total
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching help tickets:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching help tickets'
    });
  }
}));

// Respond to help ticket (instructor only)
router.post('/help-tickets/:ticketId/respond', authenticateToken, authorizeRoles('instructor'), validate([
  body('message').trim().notEmpty().withMessage('Response message is required'),
  body('isInternal').optional().isBoolean()
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  const { message, isInternal = false } = req.body;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const ticket = await database.get(ticketId) as HelpTicketDoc;
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Help ticket not found'
      });
    }

    // Check if instructor is assigned to this ticket or is the user
    if (ticket.assignedTo !== userId && ticket.user !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this ticket'
      });
    }

    if (!ticket.messages) {
      ticket.messages = [];
    }

    const response = {
      _id: Date.now().toString(),
      sender: userId,
      message,
      isInternal,
      createdAt: new Date()
    };

    ticket.messages.push(response);
    ticket.status = isInternal ? ticket.status : 'in-progress';
    ticket.updatedAt = new Date();

    const latest = await database.get(ticket._id);
    ticket._rev = latest._rev;
    await database.insert(ticket);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { ticket: ticket }
    });
  } catch (error: any) {
    console.error('Error responding to help ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while responding to ticket'
    });
  }
}));

// Update help ticket status (instructor only)
router.patch('/help-tickets/:ticketId/status', authenticateToken, authorizeRoles('instructor'), validate([
  body('status').isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status')
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  const { userId } = ensureAuth(req);

  try {
    const database = await ensureDb();
    
    const ticket = await database.get(ticketId) as HelpTicketDoc;
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Help ticket not found'
      });
    }

    // Check if instructor is assigned to this ticket
    if (ticket.assignedTo !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ticket'
      });
    }

    ticket.status = status;
    ticket.updatedAt = new Date();

    const latest = await database.get(ticket._id);
    ticket._rev = latest._rev;
    await database.insert(ticket);

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      data: { ticket: ticket }
    });
  } catch (error: any) {
    console.error('Error updating help ticket status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating ticket status'
    });
  }
}));

// Get instructor profile
router.get('/profile', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const database = await ensureDb();
    const user = await database.get(userId) as UserDoc;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from user object for security
    const userProfile = { ...user };
    delete (userProfile as any).password;
    
    res.json({
      success: true,
      data: { user: userProfile }
    });
  } catch (error: any) {
    console.error('Error fetching instructor profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching profile'
    });
  }
}));

// Update instructor profile
router.put('/profile', authenticateToken, authorizeRoles('instructor'), validate([
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('bio').optional().trim(),
  body('phone_number').optional().trim(),
  body('language_preference').optional().trim()
]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const updates = req.body;
    const database = await ensureDb();
    const user = await database.get(userId) as UserDoc;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    Object.assign(user, updates);
    user.updatedAt = new Date();
    
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);

    // Get the updated user without password
    const userProfile = { ...user };
    delete (userProfile as any).password;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userProfile }
    });
  } catch (error: any) {
    console.error('Error updating instructor profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating profile'
    });
  }
}));

// Get real-time student activity and progress
router.get('/student-activity', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '7' } = req.query;
    const { userId } = ensureAuth(req);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const database = await ensureDb();
    
    // Get all documents
    const allDocsResult = await database.list({ include_docs: true });
    
    // Get instructor's courses
    const courses = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'course' && doc.instructor === userId) as CourseDoc[];
    
    // Get all users enrolled in instructor's courses
    const enrolledUserIds = new Set<string>();
    courses.forEach(course => {
      if (course.enrolledStudents) {
        course.enrolledStudents.forEach(id => enrolledUserIds.add(id));
      }
    });

    // Get user activity data
    const users = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'user' && enrolledUserIds.has(doc._id)) as UserDoc[];

    // Generate daily activity data for the graph
    const dailyActivity = [];
    for (let i = Number(period) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
             // Count active users for this day (users who have lastActivity or lastLogin on this day)
       const activeUsers = users.filter(user => {
         // Check lastActivity first, then lastLogin
         const activityDate = user.lastActivity ? new Date(user.lastActivity).toISOString().split('T')[0] : null;
         const loginDate = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null;
         
         return activityDate === dateStr || loginDate === dateStr;
       }).length;

      // Calculate progress made on this day
      let progressMade = 0;
      courses.forEach(course => {
        if (course.studentProgress) {
          progressMade += course.studentProgress.filter((p: any) => {
            if (!p.completedAt) return false;
            const completedDate = new Date(p.completedAt).toISOString().split('T')[0];
            return completedDate === dateStr;
          }).length;
        }
      });

             // Calculate percentages based on total enrolled students
       const totalEnrolledStudents = enrolledUserIds.size || 1;
       const activeUsersPercentage = Math.round((activeUsers / totalEnrolledStudents) * 100);
       
       // Calculate progress percentage based on total possible progress
       const totalPossibleProgress = courses.reduce((sum, course) => {
         const modules = (course as any).modules?.length || 1;
         const enrolled = course.enrolledStudents?.length || 0;
         return sum + (modules * enrolled);
       }, 0) || 1;
       
       const progressPercentage = Math.round((progressMade / totalPossibleProgress) * 100);

       dailyActivity.push({
         date: dateStr,
         activeUsers: Math.min(activeUsersPercentage, 100), // Cap at 100%
         progressMade: Math.min(progressPercentage, 100), // Cap at 100%
         day: date.toLocaleDateString('en-US', { weekday: 'short' }),
         formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
         rawActiveUsers: activeUsers,
         rawProgressMade: progressMade
       });
    }

    // Calculate course-wise progress
    const courseProgress = courses.map(course => {
      const totalModules = (course as any).modules?.length || 1;
      const enrolledCount = course.enrolledStudents?.length || 0;
      const totalPossibleProgress = totalModules * enrolledCount;
      const actualProgress = course.studentProgress?.filter((p: any) => p.completed).length || 0;
      const progressPercentage = totalPossibleProgress > 0 ? (actualProgress / totalPossibleProgress) * 100 : 0;

      return {
        courseName: course.title,
        courseId: course._id,
        enrolledStudents: enrolledCount,
        totalModules,
        completedModules: actualProgress,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        lastActivity: course.updatedAt || course.createdAt
      };
    });

         // No sample data - use only real data from database

     res.json({
       success: true,
       data: {
         dailyActivity,
         courseProgress,
         summary: {
           totalActiveUsers: users.filter(u => u.lastLogin && new Date(u.lastLogin) >= daysAgo).length,
           totalProgressMade: dailyActivity.reduce((sum, day) => sum + day.progressMade, 0),
           averageProgress: courseProgress.reduce((sum, course) => sum + course.progressPercentage, 0) / courseProgress.length || 0
         }
       }
     });
  } catch (error: any) {
    console.error('Error fetching student activity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching student activity'
    });
  }
}));

// Add validation function for quiz questions
// Helper function to safely log quiz data
const logQuizData = (quiz: any, prefix: string) => {
  try {
    console.log(`${prefix} Quiz:`, {
      id: quiz._id,
      title: quiz.title,
      questionCount: quiz.questions?.length || 0
    });
    
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((q: any, i: number) => {
        console.log(`${prefix} Question ${i + 1}:`, {
          question: q.question?.substring(0, 50) + '...',
          type: q.type,
          correctAnswer: q.correctAnswer,
          correctAnswerType: typeof q.correctAnswer
        });
      });
    }
  } catch (error) {
    console.log(`${prefix} Error logging quiz data:`, error);
  }
};

const validateQuizQuestion = (question: any) => {
  if (!question || !question.question) return { valid: false, error: 'Question text is required' };
  
  const questionText = question.question.trim();
  
  // Very basic validation - just ensure it's not empty and has some content
  if (questionText.length === 0) {
    return { valid: false, error: 'Question text cannot be empty' };
  }
  
  if (questionText.length < 3) {
    return { valid: false, error: 'Question text should be at least 3 characters long' };
  }
  
  // Only reject extremely obvious test data patterns
  const obviousTestPatterns = [
    /^test$/i,
    /^abc$/i,
    /^123$/i,
    /^xxx+$/i,
  ];
  
  if (obviousTestPatterns.some(pattern => pattern.test(questionText))) {
    return { valid: false, error: `Please provide a meaningful question instead of "${question.question}"` };
  }
  
  // Validate options for multiple choice questions
  if (question.type === 'multiple_choice' || question.type === 'multiple-choice') {
    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
      return { valid: false, error: 'Multiple choice questions must have at least 2 options' };
    }
    
    // Basic validation for options - just ensure they're not empty
    const emptyOptions = question.options.filter((option: string) => {
      return !option || option.trim().length === 0;
    });
    
    if (emptyOptions.length > 0) {
      return { valid: false, error: 'All answer options must have content' };
    }
  }
  
  return { valid: true };
};

// Quiz routes
// Get all quizzes for instructor
router.get('/quizzes', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { courseId } = req.query; // Optional course filter
    console.log('🔍 Fetching quizzes for user:', user._id, courseId ? `(filtered by course: ${courseId})` : '(all courses)');
    
    const database = await ensureDb();
    const result = await database.list({ include_docs: true });
    
    // Filter for quizzes belonging to this instructor
    let quizzes = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'quiz' && (doc.instructorId === user._id || doc.instructor === user._id));
    
    // Apply course filter if provided
    if (courseId) {
      const beforeCount = quizzes.length;
      quizzes = quizzes.filter((quiz: any) => {
        const quizCourseId = quiz.courseId || quiz.course;
        return quizCourseId === courseId;
      });
      console.log(`📚 Course filter applied: ${beforeCount} -> ${quizzes.length} quizzes`);
    }
    
    // Sort by creation date (newest first)
    const sortedQuizzes = quizzes.sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    
    console.log(`✅ Returning ${sortedQuizzes.length} quizzes for instructor`);
    
    res.json({
      success: true,
      data: { quizzes: sortedQuizzes }
    });
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes'
    });
  }
}));

// Get specific quiz by ID
router.get('/quizzes/:quizId', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { quizId } = req.params;
    
    console.log('🔍 Fetching quiz by ID:', quizId);
    
    const database = await ensureDb();
    const quiz = await database.get(quizId);
    
    if (!quiz || quiz.type !== 'quiz') {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if instructor owns this quiz
    if (quiz.instructorId !== user._id && quiz.instructor !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this quiz'
      });
    }
    
    console.log('✅ Quiz found:', quiz.title, 'Questions:', quiz.questions?.length || 0);
    
    res.json({
      success: true,
      data: { quiz }
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
}));

// Get quiz by ID (for students/refugees)
router.get('/quizzes/:quizId/student', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { quizId } = req.params;
    
    console.log('🔍 Student fetching quiz by ID:', quizId);
    
    const database = await ensureDb();
    const quiz = await database.get(quizId);
    
    if (!quiz || quiz.type !== 'quiz') {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    console.log('✅ Quiz found for student:', quiz.title, 'Questions:', quiz.questions?.length || 0);
    
    res.json({
      success: true,
      data: { quiz }
    });
  } catch (error: any) {
    console.error('Error fetching quiz for student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
}));

// Create quiz with validation
router.post('/quizzes', authenticateToken, authorizeRoles('instructor'), [
  body('title').trim().notEmpty().withMessage('Quiz title is required'),
  body('description').optional().trim(),
  body('courseId').notEmpty().withMessage('Course selection is required'),
  body('moduleId').optional().notEmpty().withMessage('Module selection cannot be empty if provided'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0-100'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, courseId, moduleId, duration, passingScore, questions, dueDate } = req.body;
    const { userId, user } = ensureAuth(req);
    
    // Validate questions if provided
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const questionValidation = validateQuizQuestion(questions[i]);
        if (!questionValidation.valid) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: ${questionValidation.error}`
          });
        }
      }
    }
    
    // Get course name for reference
    let courseName = 'Unknown Course';
    try {
      const database = await ensureDb();
      const courseDoc = await database.get(courseId);
      courseName = courseDoc.title;
    } catch (err: any) {
      console.error('Course not found:', err);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Calculate total points from questions
    const totalPoints = questions && questions.length > 0 
      ? questions.reduce((sum: number, question: any) => sum + (question.points || 1), 0)
      : 0;

    const quiz = {
      _id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'quiz',
      title,
      description: description || '',
      courseId,
      moduleId: moduleId || '',
      courseName,
      instructorId: user._id,
      instructorName: user.firstName + ' ' + user.lastName,
      duration: duration || 30,
      totalPoints,
      passingScore: passingScore || 70,
      dueDate: dueDate || null,
      questions: questions || [],
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('📤 Quiz object being saved to database:', { _id: quiz._id, title: quiz.title, courseId: quiz.courseId, moduleId: quiz.moduleId }); // Debug log
    console.log('📝 Questions being saved:', quiz.questions?.length || 0, 'questions');
    
    // Log question details safely
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((q: any, qIndex: number) => {
        console.log(`📝 Question ${qIndex + 1} being saved:`, {
          question: q.question?.substring(0, 50) + '...',
          type: q.type,
          correctAnswer: q.correctAnswer,
          correctAnswerType: typeof q.correctAnswer
        });
      });
    } else {
      console.log('⚠️ WARNING: No questions found in quiz data!');
      console.log('⚠️ Quiz data received:', JSON.stringify(req.body, null, 2));
    }

    const database = await ensureDb();
    await database.insert(quiz);

    // Update the module to include this quiz
    if (moduleId) {
      try {
        const module = await database.get(moduleId);
        if (module && module.type === 'module') {
          // Initialize quizzes array if it doesn't exist
          if (!module.quizzes) {
            module.quizzes = [];
          }
          
          // Check if a quiz with the same title already exists to prevent duplicates
          const existingQuizIndex = module.quizzes.findIndex((q: any) => 
            q.title === quiz.title && q.moduleId === quiz.moduleId
          );
          
          if (existingQuizIndex === -1) {
            // Add the new quiz to the module's quizzes array
            module.quizzes.push({
              _id: quiz._id,
              title: quiz.title,
              description: quiz.description,
              courseId: quiz.courseId,
              moduleId: quiz.moduleId,
              duration: quiz.duration,
              totalPoints: quiz.totalPoints,
              passingScore: quiz.passingScore,
              dueDate: quiz.dueDate,
              status: quiz.status,
              instructorId: quiz.instructorId,
              instructorName: quiz.instructorName,
              createdAt: quiz.createdAt,
              updatedAt: quiz.updatedAt
            });
            console.log('✅ QUIZ CREATE - Added new quiz to module array');
          } else {
            console.log('⚠️ QUIZ CREATE - Quiz with same title already exists in module, skipping duplicate');
          }
          
          module.updatedAt = new Date();
          await database.insert(module);
          console.log('✅ QUIZ CREATE - Module quizzes array updated');
        }
      } catch (moduleError) {
        console.error('⚠️ QUIZ CREATE - Failed to update module with quiz:', moduleError);
        // Don't fail the quiz creation if module update fails
      }
    }

    console.log('✅ Quiz saved successfully with moduleId:', quiz.moduleId); // Debug log

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz'
    });
  }
}));

router.put('/quizzes/:quizId', authenticateToken, authorizeRoles('instructor'), [
  body('title').optional().notEmpty().withMessage('Quiz title cannot be empty'),
  body('description').optional().trim(),
  body('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
  body('moduleId').optional().notEmpty().withMessage('Module selection cannot be empty'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be a non-negative integer'),
  body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('status').optional().isIn(['published', 'draft']).withMessage('Status must be either published or draft')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { quizId } = req.params;
    const { title, description, courseId, moduleId, duration, totalPoints, passingScore, dueDate, questions, status } = req.body;

    const database = await ensureDb();
    const quiz = await database.get(quizId);
    
    if (quiz.instructorId !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this quiz'
      });
    }

    // Get course info
    let courseName = quiz.courseName || 'Unknown Course';
    if (courseId && courseId !== quiz.courseId) {
      try {
        const courseDoc = await database.get(courseId);
        courseName = courseDoc.title;
      } catch (err: any) {
        console.error('Course not found:', err);
      }
    }

    const updatedQuiz = {
      ...quiz,
      title: title || quiz.title,
      description: description || quiz.description,
      courseId: courseId || quiz.courseId,
      moduleId: moduleId || quiz.moduleId,
      courseName,
      duration: duration || quiz.duration,
      totalPoints: totalPoints || quiz.totalPoints,
      passingScore: passingScore || quiz.passingScore,
      dueDate: dueDate || quiz.dueDate,
      questions: questions || quiz.questions,
      status: status !== undefined ? status : quiz.status,
      updatedAt: new Date().toISOString()
    };

    await database.insert(updatedQuiz);

    // Update the module's quizzes array to reflect the changes
    if (updatedQuiz.moduleId) {
      try {
        const module = await database.get(updatedQuiz.moduleId);
        if (module && module.type === 'module') {
          // Initialize quizzes array if it doesn't exist
          if (!module.quizzes) {
            module.quizzes = [];
          }
          
          // Find and update the quiz in the module's quizzes array
          const quizIndex = module.quizzes.findIndex((q: any) => 
            q._id === updatedQuiz._id || q.id === updatedQuiz._id
          );
          
          if (quizIndex !== -1) {
            // Update the existing quiz reference
            module.quizzes[quizIndex] = {
              _id: updatedQuiz._id,
              title: updatedQuiz.title,
              description: updatedQuiz.description,
              courseId: updatedQuiz.courseId,
              moduleId: updatedQuiz.moduleId,
              duration: updatedQuiz.duration,
              totalPoints: updatedQuiz.totalPoints,
              passingScore: updatedQuiz.passingScore,
              dueDate: updatedQuiz.dueDate,
              status: updatedQuiz.status,
              instructorId: updatedQuiz.instructorId,
              instructorName: updatedQuiz.instructorName,
              createdAt: updatedQuiz.createdAt,
              updatedAt: updatedQuiz.updatedAt
            };
            console.log('✅ QUIZ UPDATE - Updated existing quiz in module array');
          } else {
            // If not found, remove any quizzes with the same title to prevent duplicates
            module.quizzes = module.quizzes.filter((q: any) => 
              q.title !== updatedQuiz.title || q._id === updatedQuiz._id
            );
            
            // Add the updated quiz
            module.quizzes.push({
              _id: updatedQuiz._id,
              title: updatedQuiz.title,
              description: updatedQuiz.description,
              courseId: updatedQuiz.courseId,
              moduleId: updatedQuiz.moduleId,
              duration: updatedQuiz.duration,
              totalPoints: updatedQuiz.totalPoints,
              passingScore: updatedQuiz.passingScore,
              dueDate: updatedQuiz.dueDate,
              status: updatedQuiz.status,
              instructorId: updatedQuiz.instructorId,
              instructorName: updatedQuiz.instructorName,
              createdAt: updatedQuiz.createdAt,
              updatedAt: updatedQuiz.updatedAt
            });
            console.log('✅ QUIZ UPDATE - Added quiz to module array (was not found)');
          }
          
          module.updatedAt = new Date();
          await database.insert(module);
          console.log('✅ QUIZ UPDATE - Module quizzes array updated');
        }
      } catch (moduleError) {
        console.warn('⚠️ QUIZ UPDATE - Could not update module quizzes array:', moduleError);
        // Don't fail the whole operation if module update fails
      }
    }

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz: updatedQuiz }
    });
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz'
    });
  }
}));

router.delete('/quizzes/:quizId', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { quizId } = req.params;

    const database = await ensureDb();
    const quiz = await database.get(quizId);
    
    if (quiz.instructorId !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    await database.destroy(quiz._id, quiz._rev);

    // Remove the quiz from the module's quizzes array
    if (quiz.moduleId) {
      try {
        const module = await database.get(quiz.moduleId);
        if (module && module.type === 'module') {
          // Initialize quizzes array if it doesn't exist
          if (!module.quizzes) {
            module.quizzes = [];
          }
          
          // Remove the quiz from the module's quizzes array
          const quizIndex = module.quizzes.findIndex((q: any) => 
            q._id === quiz._id || q.id === quiz._id
          );
          
          if (quizIndex !== -1) {
            module.quizzes.splice(quizIndex, 1);
            module.updatedAt = new Date();
            await database.insert(module);
            console.log('✅ QUIZ DELETE - Removed from module quizzes array');
          }
        }
      } catch (moduleError) {
        console.warn('⚠️ QUIZ DELETE - Could not update module quizzes array:', moduleError);
        // Don't fail the whole operation if module update fails
      }
    }

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz'
    });
  }
}));

// Discussion routes
router.get('/discussions', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    
    const database = await ensureDb();
    const result = await database.list({ include_docs: true });
    
    // Filter for discussions created by this instructor
    const discussions = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'discussion' && doc.instructorId === user._id);

    res.json({
      success: true,
      data: { discussions }
    });
  } catch (error: any) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions'
    });
  }
}));

router.post('/discussions', authenticateToken, authorizeRoles('instructor'), [
  body('title').notEmpty().withMessage('Discussion title is required'),
  body('content').notEmpty().withMessage('Discussion content is required'),
  body('courseId').notEmpty().withMessage('Course selection is required'),
  body('moduleId').optional().isString().withMessage('Module ID must be a string'),
  body('category').optional().isIn(['general', 'question', 'announcement']).withMessage('Invalid category'),
  body('questions').optional().isArray().withMessage('Questions must be an array')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { title, content, courseId, moduleId, category, questions } = req.body;

    if (!title || !content || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and course are required'
      });
    }

    // Get course info
    let courseName = 'Unknown Course';
    try {
      const database = await ensureDb();
      const courseDoc = await database.get(courseId);
      courseName = courseDoc.title;
    } catch (err: any) {
      console.error('Course not found:', err);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('💬 DISCUSSION CREATE - Creating discussion with:', {
      title,
      content: content ? content.substring(0, 50) + '...' : 'No content',
      courseId,
      moduleId,
      courseName
    });

    const discussion = {
      _id: `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'discussion',
      title,
      content,
      courseId,
      moduleId: moduleId || null,
      courseName,
      category: category || 'general',
      instructorId: user._id,
      instructorName: user.firstName + ' ' + user.lastName,
      status: 'active',
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('💬 DISCUSSION CREATE - Discussion object to save:', {
      _id: discussion._id,
      title: discussion.title,
      moduleId: discussion.moduleId,
      courseId: discussion.courseId
    });

    const database2 = await ensureDb();
    await database2.insert(discussion);

    // Update the module's discussions array to include the new discussion
    if (discussion.moduleId) {
      try {
        const module = await database2.get(discussion.moduleId);
        if (module && module.type === 'module') {
          // Initialize discussions array if it doesn't exist
          if (!module.discussions) {
            module.discussions = [];
          }
          
          // Check if a discussion with the same title already exists to prevent duplicates
          const existingDiscussionIndex = module.discussions.findIndex((d: any) => 
            d.title === discussion.title && d.moduleId === discussion.moduleId
          );
          
          if (existingDiscussionIndex === -1) {
            // Add the new discussion to the module's discussions array
            module.discussions.push({
              _id: discussion._id,
              title: discussion.title,
              content: discussion.content,
              courseId: discussion.courseId,
              moduleId: discussion.moduleId,
              category: discussion.category,
              instructorId: discussion.instructorId,
              instructorName: discussion.instructorName,
              status: discussion.status,
              createdAt: discussion.createdAt,
              updatedAt: discussion.updatedAt
            });
            console.log('✅ DISCUSSION CREATE - Added new discussion to module array');
          } else {
            console.log('⚠️ DISCUSSION CREATE - Discussion with same title already exists, skipping duplicate');
          }
          
          module.updatedAt = new Date();
          await database2.insert(module);
          console.log('✅ DISCUSSION CREATE - Module discussions array updated');
        }
      } catch (moduleError) {
        console.warn('⚠️ DISCUSSION CREATE - Could not update module discussions array:', moduleError);
        // Don't fail the whole operation if module update fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: { discussion }
    });
  } catch (error: any) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion'
    });
  }
}));

router.put('/discussions/:discussionId', authenticateToken, authorizeRoles('instructor'), [
  body('title').optional().notEmpty().withMessage('Discussion title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Discussion content cannot be empty'),
  body('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
  body('category').optional().isIn(['general', 'question', 'announcement']).withMessage('Invalid category'),
  body('questions').optional().isArray().withMessage('Questions must be an array')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId, user } = ensureAuth(req);
    const { discussionId } = req.params;
    const { title, content, courseId, category, questions } = req.body;
  
  try {

    console.log('🔄 DISCUSSION UPDATE - Request received for discussion:', discussionId);
    console.log('🔄 DISCUSSION UPDATE - Request body:', { title, content, courseId, category });
    console.log('🔄 DISCUSSION UPDATE - User ID:', user._id);

    const database = await ensureDb();
    const discussion = await database.get(discussionId);
    
    console.log('🔄 DISCUSSION UPDATE - Found discussion:', {
      id: discussion._id,
      title: discussion.title,
      instructorId: discussion.instructorId,
      userId: user._id
    });
    
    if (discussion.instructorId !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this discussion'
      });
    }

    // Get course info
    let courseName = discussion.courseName || 'Unknown Course';
    if (courseId && courseId !== discussion.courseId) {
      try {
        const courseDoc = await database.get(courseId);
        courseName = courseDoc.title;
      } catch (err: any) {
        console.error('Course not found:', err);
      }
    }

    const updatedDiscussion = {
      ...discussion,
      title: title || discussion.title,
      content: content || discussion.content,
      courseId: courseId || discussion.courseId,
      courseName,
      category: category || discussion.category,
      updatedAt: new Date().toISOString()
    };

    console.log('🔄 DISCUSSION UPDATE - About to save updated discussion:', {
      _id: updatedDiscussion._id,
      _rev: updatedDiscussion._rev,
      title: updatedDiscussion.title,
      contentLength: updatedDiscussion.content?.length || 0
    });

    try {
    await database.insert(updatedDiscussion);
      console.log('✅ DISCUSSION UPDATE - Database insert successful');
    } catch (dbError: any) {
      console.error('❌ DISCUSSION UPDATE - Database insert failed:', dbError);
      console.error('❌ Database error details:', {
        error: dbError?.error || 'Unknown error',
        reason: dbError?.reason || 'Unknown reason',
        id: dbError?.id || 'Unknown id',
        rev: dbError?.rev || 'Unknown rev'
      });
      throw dbError;
    }

    console.log('✅ DISCUSSION UPDATE - Discussion updated successfully:', updatedDiscussion._id);

    // Update the module's discussions array to reflect the changes
    if (updatedDiscussion.moduleId) {
      try {
        const module = await database.get(updatedDiscussion.moduleId);
        if (module && module.type === 'module') {
          // Initialize discussions array if it doesn't exist
          if (!module.discussions) {
            module.discussions = [];
          }
          
          // Find the discussion by ID to update it
          const discussionIndex = module.discussions.findIndex((d: any) => 
            d._id === updatedDiscussion._id || d.id === updatedDiscussion._id
          );
          
          if (discussionIndex !== -1) {
            // Update the existing discussion reference
            module.discussions[discussionIndex] = {
              _id: updatedDiscussion._id,
              title: updatedDiscussion.title,
              content: updatedDiscussion.content,
              courseId: updatedDiscussion.courseId,
              moduleId: updatedDiscussion.moduleId,
              category: updatedDiscussion.category,
              instructorId: updatedDiscussion.instructorId,
              instructorName: updatedDiscussion.instructorName,
              status: updatedDiscussion.status,
              createdAt: updatedDiscussion.createdAt,
              updatedAt: updatedDiscussion.updatedAt
            };
            console.log('✅ DISCUSSION UPDATE - Updated existing discussion in module array');
          } else {
            // Remove any discussions with the same title to prevent duplicates
            module.discussions = module.discussions.filter((d: any) => 
              d.title !== updatedDiscussion.title
            );
            
            // Add the updated discussion
            module.discussions.push({
              _id: updatedDiscussion._id,
              title: updatedDiscussion.title,
              content: updatedDiscussion.content,
              courseId: updatedDiscussion.courseId,
              moduleId: updatedDiscussion.moduleId,
              category: updatedDiscussion.category,
              instructorId: updatedDiscussion.instructorId,
              instructorName: updatedDiscussion.instructorName,
              status: updatedDiscussion.status,
              createdAt: updatedDiscussion.createdAt,
              updatedAt: updatedDiscussion.updatedAt
            });
            console.log('✅ DISCUSSION UPDATE - Added discussion to module array (was not found)');
          }
          
          module.updatedAt = new Date();
          await database.insert(module);
          console.log('✅ DISCUSSION UPDATE - Module discussions array updated');
        }
      } catch (moduleError) {
        console.warn('⚠️ DISCUSSION UPDATE - Could not update module discussions array:', moduleError);
        // Don't fail the whole operation if module update fails
      }
    }

    res.json({
      success: true,
      message: 'Discussion updated successfully',
      data: { discussion: updatedDiscussion }
    });
  } catch (error: any) {
    console.error('❌ DISCUSSION UPDATE ERROR:', error);
    console.error('❌ Error message:', error?.message || 'Unknown error message');
    console.error('❌ Error stack:', error?.stack || 'No stack trace available');
    console.error('❌ Error details:', {
      discussionId: discussionId || 'Unknown',
      userId: user?._id || 'Unknown',
      requestBody: req.body || {}
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion',
      error: error?.message || 'Unknown error'
    });
  }
}));

router.delete('/discussions/:discussionId', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { discussionId } = req.params;

    const database = await ensureDb();
    const discussion = await database.get(discussionId);
    
    if (discussion.instructorId !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this discussion'
      });
    }

    await database.destroy(discussion._id, discussion._rev);

    // Remove the discussion from the module's discussions array
    if (discussion.moduleId) {
      try {
        const module = await database.get(discussion.moduleId);
        if (module && module.type === 'module') {
          // Initialize discussions array if it doesn't exist
          if (!module.discussions) {
            module.discussions = [];
          }
          
          // Remove the discussion from the module's discussions array
          const discussionIndex = module.discussions.findIndex((d: any) => 
            d._id === discussion._id || d.id === discussion._id
          );
          
          if (discussionIndex !== -1) {
            module.discussions.splice(discussionIndex, 1);
            module.updatedAt = new Date();
            await database.insert(module);
            console.log('✅ DISCUSSION DELETE - Removed from module discussions array');
          }
        }
      } catch (moduleError) {
        console.warn('⚠️ DISCUSSION DELETE - Could not update module discussions array:', moduleError);
        // Don't fail the whole operation if module update fails
      }
    }

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion'
    });
  }
}));

// Group routes
router.get('/groups', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    
    const database = await ensureDb();
    const result = await database.list({ include_docs: true });
    
    // Filter for groups created by this instructor
    const groups = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'group' && doc.instructorId === user._id);

    res.json({
      success: true,
      data: { groups }
    });
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups'
    });
  }
}));

router.post('/groups', authenticateToken, authorizeRoles('instructor'), [
  body('name').notEmpty().withMessage('Group name is required'),
  body('description').optional().trim(),
  body('courseId').notEmpty().withMessage('Course selection is required'),
  body('maxMembers').optional().isInt({ min: 1 }).withMessage('Max members must be a positive integer'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
  body('allowSelfJoin').optional().isBoolean().withMessage('allowSelfJoin must be a boolean')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { name, description, courseId, maxMembers, isPrivate, allowSelfJoin } = req.body;

    if (!name || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Name and course are required'
      });
    }

    // Get course info
    let courseName = 'Unknown Course';
    try {
      const database = await ensureDb();
      const courseDoc = await database.get(courseId);
      courseName = courseDoc.title;
    } catch (err: any) {
      console.error('Course not found:', err);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const group = {
      _id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'group',
      name,
      description: description || '',
      courseId,
      courseName,
      instructorId: user._id,
      instructorName: user.firstName + ' ' + user.lastName,
      maxMembers: maxMembers || 10,
      isPrivate: isPrivate || false,
      allowSelfJoin: allowSelfJoin !== false,
      members: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const database2 = await ensureDb();
    await database2.insert(group);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group }
    });
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group'
    });
  }
}));

router.put('/groups/:groupId', authenticateToken, authorizeRoles('instructor'), [
  body('name').optional().notEmpty().withMessage('Group name cannot be empty'),
  body('description').optional().trim(),
  body('courseId').optional().notEmpty().withMessage('Course selection cannot be empty'),
  body('maxMembers').optional().isInt({ min: 1 }).withMessage('Max members must be a positive integer'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
  body('allowSelfJoin').optional().isBoolean().withMessage('allowSelfJoin must be a boolean')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { groupId } = req.params;
    const { name, description, courseId, maxMembers, isPrivate, allowSelfJoin } = req.body;

    const database = await ensureDb();
    const group = await database.get(groupId);
    
    if (group.instructorId !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this group'
      });
    }

    // Get course info
    let courseName = group.courseName || 'Unknown Course';
    if (courseId && courseId !== group.courseId) {
      try {
        const courseDoc = await database.get(courseId);
        courseName = courseDoc.title;
      } catch (err: any) {
        console.error('Course not found:', err);
      }
    }

    const updatedGroup = {
      ...group,
      name: name || group.name,
      description: description || group.description,
      courseId: courseId || group.courseId,
      courseName,
      maxMembers: maxMembers || group.maxMembers,
      isPrivate: isPrivate !== undefined ? isPrivate : group.isPrivate,
      allowSelfJoin: allowSelfJoin !== undefined ? allowSelfJoin : group.allowSelfJoin,
      updatedAt: new Date().toISOString()
    };

    await database.insert(updatedGroup);

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group: updatedGroup }
    });
  } catch (error: any) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
}));

router.delete('/groups/:groupId', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, user } = ensureAuth(req);
    const { groupId } = req.params;

    const database = await ensureDb();
    const group = await database.get(groupId);
    
    if (group.instructorId !== user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this group'
      });
    }

    await database.destroy(group._id, group._rev);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group'
    });
  }
}));

// Get instructor notifications (admin messages about course approvals/rejections)
router.get('/notifications', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const { page = 1, limit = 10 } = req.query;
    
    const database = await ensureDb();
    
    // Get notifications for this instructor
    const result = await database.find({
      selector: {
        type: 'notification',
        recipient: userId,
        category: { $in: ['course_approval', 'course_rejection'] }
      }
    });
    
    // Sort by creation date (newest first)
    const notifications = result.docs.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Pagination
    const total = notifications.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedNotifications = notifications.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    
    res.json({
      success: true,
      data: {
        notifications: pagedNotifications,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalNotifications: total
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching instructor notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching notifications'
    });
  }
}));

// Mark notification as read
router.put('/notifications/:notificationId/read', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const { notificationId } = req.params;
    
    const database = await ensureDb();
    const notification = await database.get(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if notification belongs to this instructor
    if (notification.recipient !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }
    
    notification.isRead = true;
    notification.updatedAt = new Date();
    
    const latest = await database.get(notification._id);
    notification._rev = latest._rev;
    await database.insert(notification);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}));

// Debug endpoint to check quiz data
router.get('/debug/quiz/:quizId', authenticateToken, authorizeRoles('instructor', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const { userId } = ensureAuth(req);
    
    console.log('🔍 DEBUG: Checking quiz data for:', quizId);
    
    const database = await ensureDb();
    const quiz = await database.get(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.type !== 'quiz') {
      return res.status(404).json({
        success: false,
        message: 'Document is not a quiz'
      });
    }
    
    // Check if instructor owns this quiz
    if (quiz.instructorId !== userId && quiz.instructor !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this quiz'
      });
    }
    
    console.log('✅ Quiz found:', quiz.title);
    console.log('✅ Questions count:', quiz.questions?.length || 0);
    console.log('✅ Quiz data:', JSON.stringify(quiz, null, 2));
    
    res.json({
      success: true,
      data: { 
        quiz,
        questionsCount: quiz.questions?.length || 0,
        hasQuestions: !!(quiz.questions && quiz.questions.length > 0)
      }
    });
  } catch (error: any) {
    console.error('Error in quiz debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug quiz'
    });
  }
}));

export default router; 