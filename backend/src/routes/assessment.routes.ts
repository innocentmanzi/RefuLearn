import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

const router = express.Router();

// Setup PouchDB
PouchDB.plugin(PouchDBFind);
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

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

interface AssessmentDoc {
  _id: string;
  _rev: string;
  type: 'assessment';
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
  submissions?: Array<{
    student: string;
    answers: any[];
    score?: number;
    submittedAt: Date;
    status: string;
    timeSpent?: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface UserAssessmentSubmission {
  _id: string;
  _rev: string;
  type: 'user_assessment_submission';
  user: number | string;
  assessment: number;
  attempt_number: number;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  score: number;
  passed: boolean;
  completed_at: string;
  time_taken: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserDoc {
  _id: string;
  _rev: string;
  type: 'user';
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
  [key: string]: any;
}

// Helper function to ensure user authentication
const ensureAuth = (req: AuthenticatedRequest) => {
  if (!req.user?._id) {
    throw new Error('User authentication required');
  }
  return (req.user as any)?._id?.toString();
};

// Get available assessments for user
router.get('/', authenticateToken, [
  query('courseId').optional(),
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, status, page = 1, limit = 10 } = req.query;
  
  // Use allDocs instead of find
  const result = await db.allDocs({ include_docs: true });
  let assessments = result.rows
    .map((row: any) => row.doc)
    .filter((doc: any) => doc && doc.type === 'assessment' && doc.status === 'published') as AssessmentDoc[];

  if (courseId) {
    assessments = assessments.filter((a: any) => a.course === courseId);
  }
  
  if (status && status !== 'published') {
    assessments = assessments.filter((a: any) => a.status === status);
  }

  // Pagination
  const total = assessments.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedAssessments = assessments.slice((pageNum - 1) * limitNum, pageNum * limitNum);

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

// Get assessment by ID
router.get('/:assessmentId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assessment = await db.get(req.params['assessmentId']) as AssessmentDoc;
    res.json({
      success: true,
      data: { assessment }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }
}));

// Submit assessment
router.post('/:assessmentId/submit', authenticateToken, [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').notEmpty().withMessage('Question ID is required'),
  body('answers.*.answer').notEmpty().withMessage('Answer is required'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const { answers, timeSpent } = req.body;
  const userId = ensureAuth(req);

  const assessment = await db.get(assessmentId) as AssessmentDoc;
  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  if (assessment.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Assessment is not available for submission'
    });
  }

  if (!assessment.submissions) {
    assessment.submissions = [];
  }

  // Check if already submitted
  const alreadySubmitted = assessment.submissions.some(
    (sub: any) => sub.student === userId
  );

  if (alreadySubmitted) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this assessment'
    });
  }

  // Calculate score for auto-graded questions
  let score = 0;
  const gradedAnswers = answers.map((answer: any, index: number) => {
    const question = assessment.questions[index];
    if (question && question.type === 'multiple-choice' && answer === question.correctAnswer) {
      score += question.points;
    }
    return answer;
  });

  // Add submission
  assessment.submissions.push({
    student: userId,
    answers: gradedAnswers,
    score: score,
    submittedAt: new Date(),
    status: 'submitted',
    timeSpent: timeSpent || 0
  });

  assessment.updatedAt = new Date();
  const latest = await db.get(assessment._id);
  assessment._rev = latest._rev;
  await db.put(assessment);

  res.json({
    success: true,
    message: 'Assessment submitted successfully',
    data: { score, totalPoints: assessment.totalPoints }
  });
}));

// Get user's assessment submissions
router.get('/submissions/user', authenticateToken, [
  query('status').optional().isIn(['submitted', 'graded', 'late']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  const selector: any = {
    type: 'assessment',
    'submissions.student': ensureAuth(req)
  };
  
  if (status) {
    selector['submissions.status'] = status;
  }

  const result = await db.find({ selector });
  const assessments = result.docs as AssessmentDoc[];

  const submissions = assessments.map((assessment: AssessmentDoc) => {
    const userId = ensureAuth(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    const submission = assessment.submissions!.find(
      (sub: any) => sub.student === userId
    );
    return {
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        type: assessment.type,
        course: assessment.course,
        instructor: assessment.instructor
      },
      submission
    };
  });

  // Pagination
  const total = assessments.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedSubmissions = submissions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      submissions: pagedSubmissions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSubmissions: total
      }
    }
  });
}));

// Get assessment results (for student)
router.get('/:assessmentId/results', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const userId = ensureAuth(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }

  const assessment = await db.get(assessmentId) as AssessmentDoc;
  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  if (!assessment.submissions) {
    assessment.submissions = [];
  }

  const submission = assessment.submissions.find(
    (sub: any) => sub.student === userId
  );

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'No submission found for this assessment'
    });
  }

  res.json({
    success: true,
    data: {
      submission,
      assessment: {
        title: assessment.title,
        totalPoints: assessment.totalPoints,
        passingScore: assessment.passingScore
      }
    }
  });
}));

// Get assessment analytics (instructor only)
router.get('/:assessmentId/analytics', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  
  if (!req.user?._id) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }

  const assessment = await db.get(assessmentId) as AssessmentDoc;
  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: 'Assessment not found'
    });
  }

  // Check if user is the instructor
  if (assessment.instructor !== (req.user as any)?._id?.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this assessment analytics'
    });
  }

  const assessmentDoc = assessment as AssessmentDoc;
  if (!assessmentDoc.submissions) assessmentDoc.submissions = [];

  const totalSubmissions = assessmentDoc.submissions.length;
  const gradedSubmissions = assessmentDoc.submissions.filter((s: any) => s.status === 'graded').length;
  const pendingSubmissions = assessmentDoc.submissions.filter((s: any) => s.status === 'submitted').length;

  // Calculate average score
  const totalScore = assessmentDoc.submissions.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0);
  const averageScore = totalSubmissions > 0 ? totalScore / totalSubmissions : 0;

  // Calculate pass rate
  const passedSubmissions = assessmentDoc.submissions.filter((sub: any) => {
    const percentage = ((sub.score || 0) / assessmentDoc.totalPoints) * 100;
    const passingScore = assessmentDoc.passingScore || 70;
    return percentage >= passingScore;
  }).length;

  const passRate = totalSubmissions > 0 ? (passedSubmissions / totalSubmissions) * 100 : 0;

  // Question analysis
  const questionAnalysis = assessmentDoc.questions.map((question: any) => {
    const questionSubmissions = assessmentDoc.submissions!.filter((sub: any) => 
      sub.answers.some((ans: any) => ans.questionId === question._id?.toString())
    );

    const correctAnswers = questionSubmissions.filter((sub: any) => {
      const answer = sub.answers.find((ans: any) => ans.questionId === question._id?.toString());
      return answer && answer.isCorrect;
    }).length;

    const questionPassRate = questionSubmissions.length > 0 
      ? (correctAnswers / questionSubmissions.length) * 100 
      : 0;

    return {
      questionId: question._id,
      question: question.question,
      type: question.type,
      totalAttempts: questionSubmissions.length,
      correctAnswers,
      passRate: Math.round(questionPassRate * 100) / 100
    };
  });

  // Recent submissions
  const recentSubmissions = assessmentDoc.submissions
    .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 10);

  const populatedSubmissions = await Promise.all(
    recentSubmissions.map(async (sub: any) => {
      const user = await db.get(sub.student) as UserDoc;
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
    })
  );

  res.json({
    success: true,
    data: {
      overview: {
        totalSubmissions,
        gradedSubmissions,
        pendingSubmissions,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100
      },
      questionAnalysis,
      recentSubmissions: populatedSubmissions
    }
  });
}));

// Get course assessments
router.get('/course/:courseId', authenticateToken, [
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;
  
  const selector: any = { type: 'assessment', course: courseId };
  
  if (status) {
    selector.status = status;
  }

  // Use list instead of find for compatibility
  const result = await db.allDocs({ include_docs: true });
  const allAssessments = result.rows
    .map((row: any) => row.doc)
    .filter((doc: any) => doc && doc.type === 'assessment' && doc.course === courseId) as AssessmentDoc[];

  // Apply status filter if needed
  const assessments = status ? allAssessments.filter((a: any) => a.status === status) : allAssessments;

  // Pagination
  const total = assessments.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedAssessments = assessments.slice((pageNum - 1) * limitNum, pageNum * limitNum);

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

// Admin: Create assessment - Fix req.user access
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('dueDate').optional(),
  body('totalPoints').optional().isInt({ min: 0 }).withMessage('Total points must be non-negative'),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = ensureAuth(req);
  
  const assessment: AssessmentDoc = {
    ...req.body,
    _id: Date.now().toString(),
    _rev: '',
    type: 'assessment',
    course: req.body.course || 'general',
    instructor: userId,
    status: 'published',
    questions: req.body.questions || [],
    totalPoints: req.body.totalPoints || 0,
    passingScore: req.body.passingScore || 70,
    duration: req.body.duration || 60,
    createdAt: new Date(),
    updatedAt: new Date(),
    submissions: []
  };
  
  const result = await db.post(assessment);
  res.status(201).json({ success: true, message: 'Assessment created successfully', data: { assessment } });
}));

// Admin: Get all assessments
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const selector: any = { type: 'assessment' };
  const result = await db.find({ selector });
  const assessments = result.docs as AssessmentDoc[];
  res.json({ success: true, data: { assessments } });
}));

// Admin: Get assessment by ID
router.get('/admin/:assessmentId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assessment = await db.get(req.params.assessmentId) as AssessmentDoc;
  if (!assessment) {
    return res.status(404).json({ success: false, message: 'Assessment not found' });
  }
  res.json({ success: true, data: { assessment } });
}));

// Admin: Update assessment
router.put('/admin/:assessmentId', authenticateToken, authorizeRoles('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('dueDate').optional(),
  body('totalPoints').optional().isInt({ min: 0 }),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const updates = req.body;
  const assessment = await db.get(assessmentId) as AssessmentDoc;
  if (!assessment) {
    return res.status(404).json({ success: false, message: 'Assessment not found' });
  }
  Object.assign(assessment, updates);
  assessment.updatedAt = new Date();
  const latest = await db.get(assessment._id) as AssessmentDoc;
  assessment._rev = latest._rev;
  await db.put(assessment);
  res.json({ success: true, message: 'Assessment updated successfully', data: { assessment } });
}));

// Admin: Delete assessment
router.delete('/admin/:assessmentId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const assessment = await db.get(assessmentId) as AssessmentDoc;
  if (!assessment) {
    return res.status(404).json({ success: false, message: 'Assessment not found' });
  }
  const latest = await db.get(assessment._id) as AssessmentDoc;
  assessment._rev = latest._rev;
  await db.remove(assessment);
  res.json({ success: true, message: 'Assessment deleted successfully' });
}));

// ===== NEW USER ASSESSMENT SUBMISSION ENDPOINTS =====

// Create user assessment submission
router.post('/user-submissions', authenticateToken, [
  body('user').exists().withMessage('User is required'),
  body('assessment').exists().withMessage('Assessment is required'),
  body('attempt_number').isInt({ min: 1 }).withMessage('Attempt number must be a positive integer'),
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.question').notEmpty().withMessage('Question is required'),
  body('answers.*.answer').notEmpty().withMessage('Answer is required'),
  body('score').exists().withMessage('Score is required'),
  body('passed').isBoolean().withMessage('Passed must be a boolean'),
  body('completed_at').notEmpty().withMessage('Completed_at is required'),
  body('time_taken').isInt({ min: 0 }).withMessage('Time taken must be non-negative')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Accept all fields as provided
  const submission: UserAssessmentSubmission = {
    ...req.body,
    _id: Date.now().toString(),
    _rev: '',
    type: 'user_assessment_submission',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    const result = await db.post(submission);
    res.status(201).json({
      success: true,
      message: 'Assessment submission created successfully',
      data: {
        submission: {
          ...submission,
          _id: result.id,
          _rev: result.rev
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment submission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Get user assessment submissions
router.get('/user-submissions', authenticateToken, [
  query('assessment').optional().isInt({ min: 1 }),
  query('user').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessment, user, page = 1, limit = 10 } = req.query;
  
  const selector: any = { type: 'user_assessment_submission' };
  
  // If user is not admin/instructor, only show their own submissions
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }
  
  if (!['admin', 'instructor'].includes((req.user as any)?.role || '')) {
    selector.user = parseInt((req.user as any)?._id?.toString() || '') || (req.user as any)?._id;
  } else if (user) {
    selector.user = parseInt(user as string);
  }
  
  if (assessment) {
    selector.assessment = parseInt(assessment as string);
  }

  const result = await db.find({ selector });
  const submissions = result.docs as UserAssessmentSubmission[];

  // Pagination
  const total = submissions.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedSubmissions = submissions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      submissions: pagedSubmissions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSubmissions: total
      }
    }
  });
}));

// Get user assessment submission by ID
router.get('/user-submissions/:submissionId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { submissionId } = req.params;
  const userId = ensureAuth(req);

  try {
    const submission = await db.get(submissionId) as UserAssessmentSubmission;
    
    if (submission.type !== 'user_assessment_submission') {
      return res.status(404).json({
        success: false,
        message: 'Assessment submission not found'
      });
    }

    // Check if user has access to this submission
    const userRole = req.user?.role || '';
    if (!['admin', 'instructor'].includes(userRole) && 
        submission.user !== (parseInt(userId) || userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Assessment submission not found'
    });
  }
}));

// Update user assessment submission - Fix auth
router.put('/user-submissions/:submissionId', authenticateToken, [
  body('score').optional().isInt({ min: 0 }).withMessage('Score must be non-negative'),
  body('passed').optional().isBoolean().withMessage('Passed must be a boolean'),
  body('answers').optional().isArray().withMessage('Answers must be an array')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { submissionId } = req.params;
  const updates = req.body;
  const userId = ensureAuth(req);

  try {
    const submission = await db.get(submissionId) as UserAssessmentSubmission;
    
    if (submission.type !== 'user_assessment_submission') {
      return res.status(404).json({
        success: false,
        message: 'Assessment submission not found'
      });
    }

    // Check if user has access to update this submission
    const userRole = req.user?.role || '';
    if (!['admin', 'instructor'].includes(userRole) && 
        submission.user !== (parseInt(userId) || userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this submission'
      });
    }

    // Update fields
    Object.assign(submission, updates);
    submission.updatedAt = new Date();

    const latest = await db.get(submission._id);
    submission._rev = latest._rev;
    const result = await db.post(submission);

    res.json({
      success: true,
      message: 'Assessment submission updated successfully',
      data: {
        submission: {
          ...submission,
          _rev: result.rev
        }
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Assessment submission not found'
    });
  }
}));

// Delete user assessment submission - Fix auth
router.delete('/user-submissions/:submissionId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { submissionId } = req.params;
  const userId = ensureAuth(req);

  try {
    const submission = await db.get(submissionId) as UserAssessmentSubmission;
    
    if (submission.type !== 'user_assessment_submission') {
      return res.status(404).json({
        success: false,
        message: 'Assessment submission not found'
      });
    }

    // Check if user has access to delete this submission
    const userRole = req.user?.role || '';
    if (!['admin', 'instructor'].includes(userRole) && 
        submission.user !== (parseInt(userId) || userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this submission'
      });
    }

    const latest = await db.get(submission._id);
    submission._rev = latest._rev;
    await db.remove(submission);

    res.json({
      success: true,
      message: 'Assessment submission deleted successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Assessment submission not found'
    });
  }
}));

export default router; 