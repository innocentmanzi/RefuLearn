import express, { Request, Response } from 'express';

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

// Use working hardcoded credentials for CouchDB connection
const dbUrl = 'http://Manzi:Clarisse101@localhost:5984/refulearn';

console.log('Job routes connecting to database with hardcoded credentials');

const db = new PouchDB(dbUrl);

interface JobDoc {
  _id: string;
  _rev: string;
  type: 'job';
  title: string;
  description: string;
  company?: string;
  location: string;
  job_type: string;
  category?: string;
  is_active: boolean;
  employer: string;
  required_skills?: string[];
  salary_range?: string;
  application_deadline?: string;
  application_link?: string;
  remote_work?: boolean;
  applications?: Array<{
    _id?: string;
    applicant: string;
    coverLetter: string;
    resume: string;
    expectedSalary?: number;
    status: string;
    appliedAt: Date;
    notes?: string;
    updatedAt?: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// Get all jobs (public)
router.get('/', [
  query('category').optional().trim(),
  query('location').optional().trim(),
  query('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { category, location, type, search, page = 1, limit = 10 } = req.query;
  
  const selector: any = { type: 'job', is_active: true, approvalStatus: 'approved' };
  
  if (category) {
    selector.category = category;
  }
  
  if (type) {
    selector.job_type = type;
  }

  const result = await db.find({ selector });
  let jobs = result.docs;

  // Manual filtering for location and search (since pouchdb-find doesn't support regex)
  if (location) {
    const loc = (location as string).toLowerCase();
    jobs = jobs.filter((job: any) => 
      job.location?.toLowerCase().includes(loc)
    );
  }
  
  if (search) {
    const s = (search as string).toLowerCase();
    jobs = jobs.filter((job: any) =>
      job.title?.toLowerCase().includes(s) ||
      job.description?.toLowerCase().includes(s) ||
      job.company?.toLowerCase().includes(s)
    );
  }

  // Filter out jobs with passed deadlines
  const today = new Date();
  jobs = jobs.filter((job: any) => {
    if (!job.application_deadline) return true; // Keep jobs without deadline
    const deadlineDate = new Date(job.application_deadline);
    const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0; // Only keep jobs with deadline today or in the future
  });

  // Pagination
  const total = jobs.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedJobs = jobs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      jobs: pagedJobs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalJobs: total
      }
    }
  });
}));

// Get job by ID (public)
router.get('/:jobId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const job = await db.get(req.params['jobId']) as JobDoc;
    console.log('📋 Retrieved job for editing:', {
      id: job._id,
      title: job.title,
      company: job.company,
      application_link: job.application_link,
      hasCompany: !!job.company,
      hasApplicationLink: !!job.application_link
    });
    res.json({
      success: true,
      data: { job }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }
}));

// Apply for job (user, employer, admin) - with error handling
router.post('/:jobId/apply', authenticateToken, authorizeRoles('refugee', 'user', 'employer', 'admin'), uploadAny, [
  body('expectedSalary').optional().isFloat({ min: 0 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const { expectedSalary } = req.body;
  const files = req.files as Express.Multer.File[];
  const { userId } = ensureAuth(req);

  // Validate required files
  if (!files || files.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Cover letter and resume files are required'
    });
  }

  // Find cover letter and resume files
  const coverLetterFile = files.find(file => file.fieldname === 'coverLetter');
  const resumeFile = files.find(file => file.fieldname === 'resume');

  if (!coverLetterFile) {
    return res.status(400).json({
      success: false,
      message: 'Cover letter file is required'
    });
  }

  if (!resumeFile) {
    return res.status(400).json({
      success: false,
      message: 'Resume file is required'
    });
  }

  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }

  if (!job.is_active) {
    return res.status(400).json({
      success: false,
      message: 'This job is no longer accepting applications'
    });
  }

  if (!job.applications) job.applications = [];

  // Check if already applied
  const alreadyApplied = job.applications.some(
    (app: any) => app.applicant === userId
  );

  if (alreadyApplied) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this job'
    });
  }

  // Add application with proper typing
  const newApplication: any = {
    _id: Date.now().toString(),
    applicant: userId,
    coverLetter: coverLetterFile.path,
    resume: resumeFile.path,
    status: 'pending',
    appliedAt: new Date()
  };

  // Only add expectedSalary if it exists
  if (expectedSalary) {
    newApplication.expectedSalary = parseFloat(expectedSalary);
  }

  job.applications.push(newApplication);

  job.updatedAt = new Date();
  const latest = await db.get(job._id);
  job._rev = latest._rev;
  await db.put(job);

  res.json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      coverLetterFile: coverLetterFile.filename,
      resumeFile: resumeFile.filename
    }
  });
}), handleUploadError);

// Withdraw application (user, employer, admin)
router.delete('/:jobId/apply', authenticateToken, authorizeRoles('refugee', 'user', 'employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const { userId } = ensureAuth(req);

  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }

  if (!job.applications) job.applications = [];

  // Remove application
  job.applications = job.applications.filter(
    (app: any) => app.applicant !== userId
  );

  job.updatedAt = new Date();
  const latest = await db.get(job._id);
  job._rev = latest._rev;
  await db.put(job);

  res.json({
    success: true,
    message: 'Application withdrawn successfully'
  });
}));

// DEBUG: Check applications data (employer and admin only)
router.get('/debug/applications', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  
  // Get all jobs
  const result = await db.find({ selector: { type: 'job' } });
  const jobs = result.docs;
  
  const debugInfo = jobs.map((job: any) => ({
    _id: job._id,
    title: job.title,
    hasApplications: !!job.applications,
    applicationsCount: job.applications ? job.applications.length : 0,
    applications: job.applications || [],
    myApplications: job.applications ? job.applications.filter((app: any) => app.applicant === userId) : []
  }));
  
  res.json({
    success: true,
    data: {
      currentUserId: userId,
      totalJobs: jobs.length,
      jobs: debugInfo
    }
  });
}));

// Get all job applications (employer and admin only)
router.get('/applications/user', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  // Get all jobs first, then filter client-side (CouchDB nested array queries are problematic)
  const result = await db.find({ selector: { type: 'job' } });
  const jobs = result.docs as JobDoc[];
  
  // Find all jobs that have applications from any user
  const jobsWithApplications = jobs.filter((job: JobDoc) => {
    return job.applications && job.applications.length > 0;
  });

  // Flatten all applications from all jobs
  const allApplications = jobsWithApplications.flatMap((job: JobDoc) => {
    return job.applications!.map((app: any) => ({
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.job_type,
        employer: job.employer
      },
      application: app
    }));
  });

  // Pagination
  const total = allApplications.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedApplications = allApplications.slice((pageNum - 1) * limitNum, pageNum * limitNum);

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

// Create job (employer only)
router.post('/', authenticateToken, authorizeRoles('employer', 'admin'), [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('job_type').isIn(['Full Time', 'Part Time', 'Contract', 'Internship']).withMessage('Invalid job type'),
  body('required_skills').isArray().withMessage('Required skills must be an array'),
  body('salary_range').trim().notEmpty().withMessage('Salary range is required'),
  body('application_deadline').isISO8601().withMessage('Application deadline must be a valid date'),
  body('application_link').optional().trim(),
  body('is_active').isBoolean().withMessage('is_active must be a boolean'),
  body('remote_work').isBoolean().withMessage('remote_work must be a boolean'),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log('Received job creation request:', JSON.stringify(req.body, null, 2));
  
  const { userId } = ensureAuth(req);
  const {
    title, company, description, location, job_type, required_skills,
    salary_range, application_deadline, application_link, is_active, remote_work
  } = req.body;
  const jobData = {
    _id: Date.now().toString(),
    type: 'job',
    title,
    company,
    description,
    location,
    job_type,
    required_skills: required_skills || [],
    salary_range: salary_range || 'Competitive',
    application_deadline,
    application_link: application_link || '',
    is_active: false, // Set to false until approved by admin
    isActive: false, // Also set isActive for consistency
    remote_work: remote_work !== undefined ? remote_work : false,
    employer: userId,
    approvalStatus: 'pending', // Add approval status
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('Creating job with data:', JSON.stringify(jobData, null, 2));
  const job = await db.put(jobData);
  console.log('✅ Job created successfully:', job);
  
  // Verify the job was saved by retrieving it
  try {
    const savedJob = await db.get(job.id);
    console.log('✅ Job retrieved from database:', savedJob);
  } catch (error) {
    console.error('❌ Error retrieving job from database:', error);
  }
  
  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: { job }
  });
}));

// Update job (employer only)
router.put('/:jobId', authenticateToken, authorizeRoles('employer', 'admin'), [
  body('title').optional().trim(),
  body('company').optional().trim(),
  body('description').optional().trim(),
  body('location').optional().trim(),
  body('job_type').optional().isIn(['Full Time', 'Part Time', 'Contract', 'Internship']),
  body('required_skills').optional().isArray(),
  body('salary_range').optional().trim(),
  body('application_deadline').optional().isISO8601(),
  body('application_link').optional().trim(),
  body('is_active').optional().isBoolean(),
  body('remote_work').optional().isBoolean(),
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  console.log('🔧 Updating job:', jobId);
  console.log('📋 Update data received:', JSON.stringify(req.body, null, 2));
  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }
  // Check if user is the employer who created the job or admin
  const { userId, user } = ensureAuth(req);
  if (job.employer !== userId && user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this job'
    });
  }
  const allowedFields = [
    'title', 'company', 'description', 'location', 'job_type', 'required_skills',
    'salary_range', 'application_deadline', 'application_link', 'is_active', 'remote_work'
  ];
  allowedFields.forEach(field => {
    if (typeof req.body[field] !== 'undefined') {
      console.log(`🔧 Updating field '${field}': "${job[field]}" → "${req.body[field]}"`);
      job[field] = req.body[field];
    }
  });
  job.updatedAt = new Date();
  const latest = await db.get(job._id);
  job._rev = latest._rev;
  const updatedJob = await db.put(job);
  
  console.log('✅ Job updated successfully:', {
    id: job._id,
    title: job.title,
    company: job.company,
    application_link: job.application_link
  });
  res.json({
    success: true,
    message: 'Job updated successfully',
    data: { job: updatedJob }
  });
}));

// Delete job (employer, admin)
router.delete('/:jobId', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({ success: false, message: req.t('job.not_found') });
  }
  // Only allow employer who owns the job or admin
  const { userId, user } = ensureAuth(req);
  if (user.role !== 'admin' && job.employer !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
  }
  const latest = await db.get(job._id);
  job._rev = latest._rev;
  await db.remove(job);
  res.json({
    success: true,
    message: 'Job deleted successfully'
  });
}));

// Get employer's jobs
router.get('/employer/jobs', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log('🔍 Employer jobs endpoint called');
  
  const { page = 1, limit = 10 } = req.query;
  let selector: any = { type: 'job' };
  const { userId, user } = ensureAuth(req);
  console.log('👤 User:', { id: userId, role: user.role });
  if (user.role !== 'admin') {
    selector.employer = userId;
  }
  
  console.log('🔍 Selector:', selector);
  
  const result = await db.find({ selector });
  console.log('📊 Total jobs found:', result.docs.length);
  
  // Debug: Show all jobs and their employer fields
  const allJobsResult = await db.find({ selector: { type: 'job' } });
  console.log('🔍 All jobs in database:', allJobsResult.docs.length);
  allJobsResult.docs.forEach((job: any, index) => {
    console.log(`  Job ${index + 1}:`, {
      id: job._id,
      title: job.title,
      employer: job.employer,
      employerType: typeof job.employer,
      matches: job.employer === userId
    });
  });
  
  const jobs = result.docs;
  // Pagination
  const total = jobs.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedJobs = jobs.slice((pageNum - 1) * limitNum, pageNum * limitNum);
  
  console.log('📋 Returning jobs:', pagedJobs.length);
  
  res.json({
    success: true,
    data: {
      jobs: pagedJobs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalJobs: total
      }
    }
  });
}));

// UTILITY: Fix employer's own jobs (employer/admin)
router.post('/fix-my-jobs', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  
  // Find all jobs that might belong to this user but have undefined/missing employer field
  const allJobs = await db.find({ selector: { type: 'job' } });
  
  // Fix: Properly type the jobs and filter
  const jobsToFix = allJobs.docs.filter((job: any) => 
    job.type === 'job' && (!job.employer || job.employer === 'undefined' || job.employer === undefined)
  );

  if (jobsToFix.length === 0) {
    return res.json({
      success: true,
      message: 'No jobs found that need fixing',
      data: { results: [] }
    });
  }

  const results = [];
  for (const jobDoc of jobsToFix) {
    try {
      // Fix: Get the latest job document and update it properly
      const job = await db.get(jobDoc._id) as JobDoc;
      job.employer = userId;
      job.updatedAt = new Date();
      await db.put(job);
      results.push({ 
        jobId: job._id, 
        status: 'updated', 
        title: job.title,
        assignedTo: userId 
      });
    } catch (error) {
      results.push({ 
        jobId: jobDoc._id, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  res.json({
    success: true,
    message: `Fixed ${results.filter(r => r.status === 'updated').length} jobs`,
    data: { results }
  });
}));

// DEBUG: Get all jobs with employer info (temporary diagnostic endpoint)
router.get('/debug/all-jobs', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, user } = ensureAuth(req);
  const result = await db.find({ selector: { type: 'job' } });
  const jobsInfo = result.docs.map((job: any) => ({
    _id: job._id,
    title: job.title,
    employer: job.employer,
    employerType: typeof job.employer,
    hasEmployer: job.hasOwnProperty('employer'),
    currentUserId: userId,
    currentUserIdString: userId,
    matches: job.employer === userId,
    approvalStatus: job.approvalStatus,
    is_active: job.is_active,
    isActive: job.isActive,
    createdAt: job.createdAt
  }));
  
  res.json({
    success: true,
    data: {
      totalJobs: result.docs.length,
      currentUser: {
        id: userId,
        idString: userId,
        role: user.role
      },
      jobs: jobsInfo
    }
  });
}));

// DEBUG: Simple endpoint to check all jobs (no auth required for testing)
router.get('/debug/check-jobs', asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await db.find({ selector: { type: 'job' } });
    console.log('🔍 All jobs in database:', result.docs.length);
    console.log('📋 Jobs:', result.docs.map((job: any) => ({
      id: job._id,
      title: job.title,
      approvalStatus: job.approvalStatus,
      is_active: job.is_active,
      isActive: job.isActive,
      employer: job.employer,
      createdAt: job.createdAt
    })));
    
    res.json({
      success: true,
      data: {
        totalJobs: result.docs.length,
        jobs: result.docs
      }
    });
  } catch (error) {
    console.error('❌ Error checking jobs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Get job applications (employer and admin only)
router.get('/:jobId/applications', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;

  const job = await db.get(jobId) as JobDoc;

  if (!job) {
    return res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }

  // Allow all employers and admins to view applications for any job
  res.json({
    success: true,
    data: { applications: job.applications || [] }
  });
}));

// Update application status (employer only)
router.put('/:jobId/applications/:applicationId', authenticateToken, authorizeRoles('employer', 'admin'), [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired', 'closed']).withMessage('Invalid status'),
  body('notes').optional().trim()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId, applicationId } = req.params;
  // Handle both JSON and form data
  const { status, notes } = req.body;

  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }

  // Allow all employers and admins to update applications for any job

  if (!job.applications) job.applications = [];

  const application = job.applications.find((app: any) => app._id === applicationId);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  application.status = status;
  if (notes) {
    application.notes = notes;
  }
  application.updatedAt = new Date();

  job.updatedAt = new Date();
  const latest = await db.get(job._id);
  job._rev = latest._rev;
  await db.put(job);

  res.json({
    success: true,
    message: 'Application status updated successfully',
    data: { application }
  });
}));

// Get job analytics (employer only)
router.get('/:jobId/analytics', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;

  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }

  // Allow all employers and admins to view analytics for any job

  // Fix: Check if applications exist before accessing
  const applications = job.applications || [];
  const totalApplications = applications.length;
  const statusCounts = applications.reduce((acc: any, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      totalApplications,
      statusCounts,
      applications
    }
  });
}));

// UTILITY: Fix jobs missing employer field (admin/employer)
router.post('/admin/fix-employer-field', authenticateToken, authorizeRoles('admin', 'employer'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { employerId, jobIds } = req.body;
  const { userId, user } = ensureAuth(req);
  
  if (!employerId || !jobIds || !Array.isArray(jobIds)) {
    return res.status(400).json({
      success: false,
      message: 'employerId and jobIds array are required'
    });
  }

  // If user is employer (not admin), they can only assign jobs to themselves
  if (user.role === 'employer' && employerId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Employers can only assign jobs to themselves'
    });
  }

  const results = [];
  for (const jobId of jobIds) {
    try {
      const job = await db.get(jobId) as JobDoc;
      if (job && job.type === 'job') {
        if (!job.employer) {
          job.employer = employerId;
          job.updatedAt = new Date();
          const latest = await db.get(job._id);
          job._rev = latest._rev;
          await db.put(job);
          results.push({ jobId, status: 'updated', title: job.title });
        } else {
          results.push({ jobId, status: 'already-has-employer', employer: job.employer, title: job.title });
        }
      }
    } catch (error) {
      results.push({ jobId, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  res.json({
    success: true,
    message: 'Employer field fix operation completed',
    data: { results }
  });
}));

// UTILITY: Fix all jobs to ensure they have proper approval status (admin only)
router.post('/fix-all-jobs-approval', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const allJobs = await db.find({ selector: { type: 'job' } });
  
  const results = [];
  for (const jobDoc of allJobs.docs) {
    try {
      const job = await db.get(jobDoc._id) as JobDoc;
      let needsUpdate = false;
      
      // Ensure job has approvalStatus field
      if (!job.approvalStatus) {
        job.approvalStatus = job.is_active || job.isActive ? 'approved' : 'pending';
        needsUpdate = true;
      }
      
      // Ensure job has both is_active and isActive fields
      if (job.is_active !== undefined && job.isActive === undefined) {
        job.isActive = job.is_active;
        needsUpdate = true;
      }
      
      if (job.isActive !== undefined && job.is_active === undefined) {
        job.is_active = job.isActive;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        job.updatedAt = new Date();
        await db.put(job);
        results.push({ 
          jobId: job._id, 
          status: 'updated', 
          title: job.title,
          approvalStatus: job.approvalStatus,
          is_active: job.is_active,
          isActive: job.isActive
        });
      } else {
        results.push({ 
          jobId: job._id, 
          status: 'no_change', 
          title: job.title,
          approvalStatus: job.approvalStatus,
          is_active: job.is_active,
          isActive: job.isActive
        });
      }
    } catch (error) {
      results.push({ 
        jobId: jobDoc._id, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  res.json({
    success: true,
    message: `Processed ${results.length} jobs, ${results.filter(r => r.status === 'updated').length} updated`,
    data: { results }
  });
}));


export default router; 