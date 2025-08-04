import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadAny, handleUploadError } from '../middleware/upload';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

const router = express.Router();

// Setup PouchDB
PouchDB.plugin(PouchDBFind);
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

interface AuthenticatedRequest extends Request {
  user?: { _id: string; role?: string; [key: string]: any; };
  params: any;
  body: any;
  query: any;
  files?: Express.Multer.File[];
  t?: (key: string) => string;
}

const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user?._id) throw new Error('User authentication required');
  return { userId: req.user._id.toString(), user: req.user as NonNullable<AuthenticatedRequest['user']> };
};

interface ScholarshipDoc {
  _id: string;
  _rev?: string;
  type: 'scholarship';
  title: string;
  description: string;
  provider: string;
  location: string;
  benefits: string;
  link: string;
  deadline: Date;
  requirements?: string[];
  employer: string;
  isActive: boolean;
  applications?: Array<{
    _id?: string;
    applicant: string;
    status: string;
    appliedAt: Date;
    essayReason?: string;
    cvDocument?: string;
    degreeDocument?: string;
    financialApproval?: string;
    additionalDocuments?: string[];
    documents?: string[];
    feedback?: string;
    updatedAt?: Date;
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
  profilePic?: string;
  companyName?: string;
  [key: string]: any;
}

// Get all scholarships (public)
router.get('/', [
  query('deadline').optional().isISO8601(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { deadline, search, page = 1, limit = 10 } = req.query;
  
  const selector: any = { type: 'scholarship', isActive: true, approvalStatus: 'approved' };
  
  if (deadline) {
    selector.deadline = { $gte: new Date(deadline as string) };
  }

  const result = await db.find({ selector });
  let scholarships = result.docs;

  // Manual filtering for search (since pouchdb-find doesn't support regex)
  if (search) {
    const s = (search as string).toLowerCase();
    scholarships = scholarships.filter((scholarship: any) =>
      scholarship.title?.toLowerCase().includes(s) ||
      scholarship.description?.toLowerCase().includes(s) ||
      scholarship.provider?.toLowerCase().includes(s) ||
      scholarship.location?.toLowerCase().includes(s)
    );
  }

  // Filter out scholarships with passed deadlines
  const today = new Date();
  scholarships = scholarships.filter((scholarship: any) => {
    if (!scholarship.deadline) return true; // Keep scholarships without deadline
    const deadlineDate = new Date(scholarship.deadline);
    const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0; // Only keep scholarships with deadline today or in the future
  });

  // Add computed field for frontend compatibility
  scholarships = scholarships.map((scholarship: any) => ({
    ...scholarship,
    daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }));

  // Pagination
  const total = scholarships.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedScholarships = scholarships.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      scholarships: pagedScholarships,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalScholarships: total
      }
    }
  });
}));

// Get scholarship by ID (public)
router.get('/:scholarshipId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const scholarship = await db.get(req.params['scholarshipId']) as ScholarshipDoc;
    
    // Add computed field for frontend compatibility
    const scholarshipWithDays = {
      ...scholarship,
      daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
    
    res.json({
      success: true,
      data: { scholarship: scholarshipWithDays }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
  }
}));

// Apply for scholarship
router.post('/:scholarshipId/apply', authenticateToken, uploadAny, handleUploadError, [
  body('essayReason').trim().notEmpty().withMessage('Essay explaining why you are applying is required')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId } = req.params;
  const { essayReason } = req.body;
  const { userId } = ensureAuth(req);
  
  // Check for required files
  const files = req.files as Express.Multer.File[];
  const cvDocument = files?.find(f => f.fieldname === 'cvDocument');
  const degreeDocument = files?.find(f => f.fieldname === 'degreeDocument');
  const financialApproval = files?.find(f => f.fieldname === 'financialApproval');
  const additionalDocuments = files?.filter(f => f.fieldname === 'additionalDocuments');
  
  if (!cvDocument) {
    return res.status(400).json({
      success: false,
      message: 'CV document is required'
    });
  }
  
  if (!degreeDocument) {
    return res.status(400).json({
      success: false,
      message: 'Degree document is required'
    });
  }
  
  if (!financialApproval) {
    return res.status(400).json({
      success: false,
      message: 'Financial approval document is required'
    });
  }

  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
  }

  if (!scholarship.isActive) {
    return res.status(400).json({
      success: false,
      message: 'This scholarship is no longer accepting applications'
    });
  }

  if (new Date() > new Date(scholarship.deadline)) {
    return res.status(400).json({
      success: false,
      message: 'Application deadline has passed'
    });
  }

  if (!scholarship.applications) {
    scholarship.applications = [];
  }

  // Check if already applied
  const alreadyApplied = scholarship.applications.some(
    (app: any) => app.applicant === userId
  );

  if (alreadyApplied) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this scholarship'
    });
  }

  // Add application
  scholarship.applications.push({
    _id: Date.now().toString(),
    applicant: userId,
    status: 'pending',
    appliedAt: new Date(),
    essayReason,
    cvDocument: cvDocument.path,
    degreeDocument: degreeDocument.path,
    financialApproval: financialApproval.path,
    additionalDocuments: additionalDocuments.map(file => file.path)
  });

  scholarship.updatedAt = new Date();
  const latest = await db.get(scholarship._id);
  scholarship._rev = latest._rev;
  await db.put(scholarship);

  res.json({
    success: true,
    message: 'Application submitted successfully'
  });
}));

// Debug endpoint to check user applications
router.get('/debug/user-applications', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  
  // Get all scholarships
  const result = await db.find({ 
    selector: { 
      type: 'scholarship'
    }
  });
  
  const scholarships = result.docs;
  const debug = {
    currentUserId: userId,
    currentUserRole: user.role,
    totalScholarships: scholarships.length,
    scholarshipsWithApplications: scholarships.filter((s: any) => s.applications && s.applications.length > 0).length,
    allApplications: scholarships.map((s: any) => ({
      scholarshipId: s._id,
      scholarshipTitle: s.title,
      applications: s.applications || []
    })).filter(s => s.applications.length > 0)
  };
  
  res.json(debug);
}));

// Get all scholarship applications (employer/admin only)
router.get('/applications/user', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const { userId, user } = ensureAuth(req);

  // Get all scholarships and return all applications from all users
  const result = await db.find({ 
    selector: { 
      type: 'scholarship'
    }
  });

  const scholarships = result.docs;
  const applications = scholarships
    .filter((scholarship: any) => 
      scholarship.applications && 
      scholarship.applications.length > 0
    )
    .flatMap((scholarship: any) => {
      return scholarship.applications.map((application: any) => ({
        scholarship: {
          _id: scholarship._id,
          title: scholarship.title,
          provider: scholarship.provider,
          location: scholarship.location,
          benefits: scholarship.benefits,
          link: scholarship.link,
          deadline: scholarship.deadline,
          isActive: scholarship.isActive,
          daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        },
        application
      }));
    });

  // Pagination
  const total = applications.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedApplications = applications.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      applications: pagedApplications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalApplications: total
      }
    }
  });
}));

// Create scholarship (employer only)
router.post('/', authenticateToken, authorizeRoles('employer', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('provider').trim().notEmpty().withMessage('Provider is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('benefits').trim().notEmpty().withMessage('Benefits are required'),
  body('link').trim().notEmpty().withMessage('Application link is required'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array'),
  body('deadline').isISO8601().withMessage('Valid deadline is required'),
  body('isActive').optional().isBoolean()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const scholarship: ScholarshipDoc = {
    ...req.body,
    _id: Date.now().toString(),
    type: 'scholarship',
    employer: userId,
    applications: [],
    isActive: false, // Set to false until approved
    approvalStatus: 'pending', // Add approval status
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await db.put(scholarship);
  res.status(201).json({
    success: true,
    message: 'Scholarship created successfully',
    data: { scholarship }
  });
}));

// Update scholarship (employer only)
router.put('/:scholarshipId', authenticateToken, authorizeRoles('employer', 'admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('provider').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('benefits').optional().trim().notEmpty(),
  body('link').optional().trim().notEmpty(),
  body('requirements').optional().isArray(),
  body('deadline').optional().isISO8601(),
  body('isActive').optional().isBoolean()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId } = req.params;
  const updates = req.body;
  const { userId, user } = ensureAuth(req);
  
  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
    return;
  }
  
  // Check if user owns this scholarship or is admin
  if (scholarship.employer !== userId && user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only update your own scholarships'
    });
    return;
  }
  
  Object.assign(scholarship, updates);
  scholarship.updatedAt = new Date();
  const latest = await db.get(scholarship._id);
  scholarship._rev = latest._rev;
  await db.put(scholarship);
  
  res.json({
    success: true,
    message: 'Scholarship updated successfully',
    data: { scholarship }
  });
}));

// Delete scholarship (employer only)
router.delete('/:scholarshipId', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId } = req.params;
  const { userId, user } = ensureAuth(req);
  
  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
    return;
  }
  
  // Check if user owns this scholarship or is admin
  if (scholarship.employer !== userId && user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only delete your own scholarships'
    });
    return;
  }
  
  const latest = await db.get(scholarship._id);
  await db.remove(latest);
  
  res.json({
    success: true,
    message: 'Scholarship deleted successfully'
  });
}));

// Get employer's scholarships
router.get('/employer/scholarships', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;
  const { userId, user } = ensureAuth(req);
  const skip = (Number(page) - 1) * Number(limit);
  
  const query: any = { type: 'scholarship', employer: userId };
  
  if (status) {
    query.isActive = status === 'active';
  }
  
  const result = await db.find({ selector: query });
  let scholarships = result.docs as ScholarshipDoc[];
  
  // Add computed field for frontend compatibility
  scholarships = scholarships.map((scholarship: any) => ({
    ...scholarship,
    daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }));
  
  const total = scholarships.length;
  const pagedScholarships = scholarships.slice(skip, skip + Number(limit));
  
  res.json({
    success: true,
    data: {
      scholarships: pagedScholarships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Get scholarship applications (employer only)
router.get('/:scholarshipId/applications', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  const { userId, user } = ensureAuth(req);
  const skip = (Number(page) - 1) * Number(limit);
  
  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  
  if (!scholarship) {
    res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
    return;
  }
  
  // Check if user owns this scholarship or is admin
  if (scholarship.employer !== userId && user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only view applications for your own scholarships'
    });
    return;
  }
  
  let applications = scholarship.applications || [];
  
  if (status) {
    applications = applications.filter((app: any) => app.status === status);
  }
  
  const paginatedApplications = applications.slice(skip, skip + Number(limit));
  
  const enrichedApplications = await Promise.all(paginatedApplications.map(async (app: any) => {
    try {
      const user = await db.get(app.applicant) as UserDoc;
      return {
        ...app,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePic: user.profilePic
        }
      };
    } catch (err) {
      return app;
    }
  }));
  
  const total = applications.length;
  
  res.json({
    success: true,
    data: {
      applications: enrichedApplications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Update application status (employer only)
router.put('/:scholarshipId/applications/:applicationId', authenticateToken, authorizeRoles('employer', 'admin'), [
  body('status').isIn(['pending', 'accepted', 'rejected', 'shortlisted', 'reviewed', 'hired', 'closed']).withMessage('Invalid status'),
  body('feedback').optional().trim()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId, applicationId } = req.params;
  const { status, feedback } = req.body;
  const { userId, user } = ensureAuth(req);
  
  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
    return;
  }
  
  // Check if user owns this scholarship or is admin
  if (scholarship.employer !== userId && user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only update applications for your own scholarships'
    });
    return;
  }
  
  if (!scholarship.applications) {
    scholarship.applications = [];
  }
  
  const application = scholarship.applications.find((app: any) => app._id === applicationId);
  if (!application) {
    res.status(404).json({
      success: false,
      message: 'Application not found'
    });
    return;
  }
  
  application.status = status;
  if (feedback) {
    application.feedback = feedback;
  }
  application.updatedAt = new Date();
  
  scholarship.updatedAt = new Date();
  const latest = await db.get(scholarship._id);
  scholarship._rev = latest._rev;
  await db.put(scholarship);
  
  res.json({
    success: true,
    message: 'Application status updated successfully'
  });
}));

// Get scholarship analytics (employer only)
router.get('/:scholarshipId/analytics', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId } = req.params;
  const { userId, user } = ensureAuth(req);
  
  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
    return;
  }
  
  // Check if user owns this scholarship or is admin
  if (scholarship.employer !== userId && user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only view analytics for your own scholarships'
    });
    return;
  }
  
  const applications = scholarship.applications || [];
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app: any) => app.status === 'pending').length;
  const acceptedApplications = applications.filter((app: any) => app.status === 'accepted').length;
  const rejectedApplications = applications.filter((app: any) => app.status === 'rejected').length;
  const shortlistedApplications = applications.filter((app: any) => app.status === 'shortlisted').length;
  
  const statusCounts = applications.reduce((acc: any, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    success: true,
    data: {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      shortlistedApplications,
      statusCounts,
      maxRecipients: scholarship.maxRecipients,
      isActive: scholarship.isActive,
      applicationDeadline: scholarship.deadline
    }
  });
}));

// Admin: Create scholarship
router.post('/admin', authenticateToken, authorizeRoles('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('provider').trim().notEmpty().withMessage('Provider is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('benefits').trim().notEmpty().withMessage('Benefits are required'),
  body('link').trim().notEmpty().withMessage('Application link is required'),
  body('employer').notEmpty().withMessage('Valid employer ID is required'),
  body('deadline').optional().isISO8601(),
  body('isActive').optional().isBoolean(),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const scholarship: ScholarshipDoc = {
    ...req.body,
    _id: Date.now().toString(),
    type: 'scholarship',
    applications: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await db.put(scholarship);
  res.status(201).json({ success: true, message: 'Scholarship created successfully', data: { scholarship } });
}));

// Admin: Get all scholarships
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const result = await db.find({ selector: { type: 'scholarship' } });
  const scholarships = result.docs as ScholarshipDoc[];
  
  // Populate employer data
  const populatedScholarships = await Promise.all(
    scholarships.map(async (scholarship: ScholarshipDoc) => {
      try {
        const employer = await db.get(scholarship.employer) as UserDoc;
        return {
          ...scholarship,
          daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          employer: {
            _id: employer._id,
            firstName: employer.firstName,
            lastName: employer.lastName,
            companyName: employer.companyName
          }
        };
      } catch (err) {
        return {
          ...scholarship,
          daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        };
      }
    })
  );
  
  res.json({ success: true, data: { scholarships: populatedScholarships } });
}));

// Admin: Get scholarship by ID
router.get('/admin/:scholarshipId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const scholarship = await db.get(req.params.scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    return res.status(404).json({ success: false, message: 'Scholarship not found' });
  }
  
  // Populate employer data
  try {
    const employer = await db.get(scholarship.employer) as UserDoc;
    const populatedScholarship = {
      ...scholarship,
      daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      employer: {
        _id: employer._id,
        firstName: employer.firstName,
        lastName: employer.lastName,
        companyName: employer.companyName
      }
    };
    res.json({ success: true, data: { scholarship: populatedScholarship } });
  } catch (err) {
    const scholarshipWithDays = {
      ...scholarship,
      daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
    res.json({ success: true, data: { scholarship: scholarshipWithDays } });
  }
}));

// Admin: Update scholarship
router.put('/admin/:scholarshipId', authenticateToken, authorizeRoles('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('provider').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('benefits').optional().trim().notEmpty(),
  body('link').optional().trim().notEmpty(),
  body('deadline').optional().isISO8601(),
  body('isActive').optional().isBoolean(),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId } = req.params;
  const updates = req.body;
  const { userId, user } = ensureAuth(req);
  
  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    return res.status(404).json({ success: false, message: 'Scholarship not found' });
  }
  
  Object.assign(scholarship, updates);
  scholarship.updatedAt = new Date();
  
  const latest = await db.get(scholarship._id);
  scholarship._rev = latest._rev;
  await db.put(scholarship);
  
  res.json({ success: true, message: 'Scholarship updated successfully', data: { scholarship } });
}));

// Admin: Delete scholarship
router.delete('/admin/:scholarshipId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { scholarshipId } = req.params;
  const { userId, user } = ensureAuth(req);
  const scholarship = await db.get(scholarshipId) as ScholarshipDoc;
  if (!scholarship) {
    return res.status(404).json({ success: false, message: 'Scholarship not found' });
  }
  
  const latest = await db.get(scholarship._id);
  await db.remove(latest);
  
  res.json({ success: true, message: 'Scholarship deleted successfully' });
}));

export default router; 