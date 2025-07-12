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
  
  const selector: any = { type: 'job', is_active: true };
  
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
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { expectedSalary } = req.body;
  const files = req.files as Express.Multer.File[];
  const userId = req.user._id.toString();

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
router.delete('/:jobId/apply', authenticateToken, authorizeRoles('refugee', 'user', 'employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const userId = req.user._id.toString();

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
router.get('/debug/applications', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id.toString();
  
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
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('job_type').isIn(['Full Time', 'Part Time', 'Contract', 'Internship']).withMessage('Invalid job type'),
  body('required_skills').isArray().withMessage('Required skills must be an array'),
  body('salary_range').trim().notEmpty().withMessage('Salary range is required'),
  body('application_deadline').isISO8601().withMessage('Application deadline must be a valid date'),
  body('application_link').optional().trim(),
  body('is_active').isBoolean().withMessage('is_active must be a boolean'),
  body('remote_work').isBoolean().withMessage('remote_work must be a boolean'),
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  console.log('Received job creation request:', JSON.stringify(req.body, null, 2));
  
  const {
    title, description, location, job_type, required_skills,
    salary_range, application_deadline, application_link, is_active, remote_work
  } = req.body;
  const jobData = {
    _id: Date.now().toString(),
    type: 'job',
    title,
    description,
    location,
    job_type,
    required_skills: required_skills || [],
    salary_range: salary_range || 'Competitive',
    application_deadline,
    application_link: application_link || '',
    is_active: is_active !== undefined ? is_active : true,
    remote_work: remote_work !== undefined ? remote_work : false,
    employer: req.user._id.toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('Creating job with data:', JSON.stringify(jobData, null, 2));
  const job = await db.put(jobData);
  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: { job }
  });
}));

// Update job (employer only)
router.put('/:jobId', authenticateToken, authorizeRoles('employer', 'admin'), [
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('location').optional().trim(),
  body('job_type').optional().isIn(['Full Time', 'Part Time', 'Contract', 'Internship']),
  body('required_skills').optional().isArray(),
  body('salary_range').optional().trim(),
  body('application_deadline').optional().isISO8601(),
  body('application_link').optional().trim(),
  body('is_active').optional().isBoolean(),
  body('remote_work').optional().isBoolean(),
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: req.t('job.not_found')
    });
  }
  // Check if user is the employer who created the job or admin
  if (job.employer !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this job'
    });
  }
  const allowedFields = [
    'title', 'description', 'location', 'job_type', 'required_skills',
    'salary_range', 'application_deadline', 'application_link', 'is_active', 'remote_work'
  ];
  allowedFields.forEach(field => {
    if (typeof req.body[field] !== 'undefined') job[field] = req.body[field];
  });
  job.updatedAt = new Date();
  const latest = await db.get(job._id);
  job._rev = latest._rev;
  const updatedJob = await db.put(job);
  res.json({
    success: true,
    message: 'Job updated successfully',
    data: { job: updatedJob }
  });
}));

// Delete job (employer, admin)
router.delete('/:jobId', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await db.get(jobId) as JobDoc;
  if (!job) {
    return res.status(404).json({ success: false, message: req.t('job.not_found') });
  }
  // Only allow employer who owns the job or admin
  if (req.user.role !== 'admin' && job.employer !== req.user._id.toString()) {
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
router.get('/employer/jobs', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  let selector: any = { type: 'job' };
  if (req.user.role !== 'admin') {
    selector.employer = req.user._id.toString();
  }
  const result = await db.find({ selector });
  const jobs = result.docs;
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

// DEBUG: Get all jobs with employer info (temporary diagnostic endpoint)
router.get('/debug/all-jobs', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const result = await db.find({ selector: { type: 'job' } });
  const jobsInfo = result.docs.map((job: any) => ({
    _id: job._id,
    title: job.title,
    employer: job.employer,
    employerType: typeof job.employer,
    hasEmployer: job.hasOwnProperty('employer'),
    currentUserId: req.user._id,
    currentUserIdString: req.user._id.toString(),
    matches: job.employer === req.user._id.toString()
  }));
  
  res.json({
    success: true,
    data: {
      totalJobs: result.docs.length,
      currentUser: {
        id: req.user._id,
        idString: req.user._id.toString(),
        role: req.user.role
      },
      jobs: jobsInfo
    }
  });
}));

// Get job applications (employer and admin only)
router.get('/:jobId/applications', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
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
], validate([]), asyncHandler(async (req: Request, res: Response) => {
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
router.get('/:jobId/analytics', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
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
router.post('/admin/fix-employer-field', authenticateToken, authorizeRoles('admin', 'employer'), asyncHandler(async (req: Request, res: Response) => {
  const { employerId, jobIds } = req.body;
  
  if (!employerId || !jobIds || !Array.isArray(jobIds)) {
    return res.status(400).json({
      success: false,
      message: 'employerId and jobIds array are required'
    });
  }

  // If user is employer (not admin), they can only assign jobs to themselves
  if (req.user.role === 'employer' && employerId !== req.user._id.toString()) {
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

// UTILITY: Fix employer's own jobs (employer/admin)
router.post('/fix-my-jobs', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user._id.toString();
  
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
      job.employer = currentUserId;
      job.updatedAt = new Date();
      await db.put(job);
      results.push({ 
        jobId: job._id, 
        status: 'updated', 
        title: job.title,
        assignedTo: currentUserId 
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


export default router; 