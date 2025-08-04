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

interface AuthenticatedRequest extends Request {
  user?: { _id: string; role?: string; [key: string]: any; };
}

const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user?._id) throw new Error('User authentication required');
  return { userId: req.user._id.toString(), user: req.user as NonNullable<AuthenticatedRequest['user']> };
};

interface EmployerDoc {
  _id: string;
  _rev: string;
  type: 'employer';
  user: string;
  companyName: string;
  industry: string;
  companySize: string;
  location: string;
  website?: string;
  description: string;
  isVerified: boolean;
  jobs?: string[];
  scholarships?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface JobDoc {
  _id: string;
  _rev: string;
  type: 'job';
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: string;
  isActive: boolean;
  employer: string;
  applications?: Array<{
    _id?: string;
    applicant: string;
    appliedAt: Date;
    status: string;
    coverLetter?: string;
    resume?: string;
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
  [key: string]: any;
}

// Get all employers (public)
router.get('/', [
  query('industry').optional().trim(),
  query('location').optional().trim(),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { industry, location, search, page = 1, limit = 10 } = req.query;
  
  const selector: any = { type: 'employer', isVerified: true };
  
  if (industry) {
    selector.industry = industry;
  }

  const result = await db.find({ selector });
  let employers = result.docs;

  // Manual filtering for location and search (since pouchdb-find doesn't support regex)
  if (location) {
    const loc = (location as string).toLowerCase();
    employers = employers.filter((employer: any) => 
      employer.location?.toLowerCase().includes(loc)
    );
  }
  
  if (search) {
    const s = (search as string).toLowerCase();
    employers = employers.filter((employer: any) =>
      employer.companyName?.toLowerCase().includes(s) ||
      employer.description?.toLowerCase().includes(s)
    );
  }

  // Pagination
  const total = employers.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedEmployers = employers.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      employers: pagedEmployers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalEmployers: total
      }
    }
  });
}));

// Get employer dashboard data
router.get('/dashboard', authenticateToken, authorizeRoles('employer', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  console.log('🔍 Dashboard API called by employer:', userId);
  
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  // Job statistics
  const totalJobsResult = await db.find({ selector: { type: 'job', employer: userId } });
  const totalJobs = totalJobsResult.docs.length;
  console.log(`📊 Found ${totalJobs} total jobs for employer ${userId}`);
  
  // Check deadlines and automatically update job status
  const today = new Date();
  const jobsToUpdate: any[] = [];
  
  for (const job of totalJobsResult.docs) {
    if (job.application_deadline) {
      const deadlineDate = new Date(job.application_deadline);
      const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // If deadline has passed and job is still active, mark it as inactive
      if (daysDiff < 0 && (job.isActive || job.is_active)) {
        console.log(`⚠️ Job "${job.title}" deadline has passed (${daysDiff} days ago), marking as inactive`);
        jobsToUpdate.push({
          ...job,
          isActive: false,
          is_active: false,
          updatedAt: new Date()
        });
      }
    }
  }
  
  // Update jobs in database if any need updating
  if (jobsToUpdate.length > 0) {
    console.log(`🔄 Updating ${jobsToUpdate.length} jobs with passed deadlines`);
    try {
      for (const jobUpdate of jobsToUpdate) {
        await db.put(jobUpdate);
      }
      console.log('✅ Successfully updated jobs with passed deadlines');
    } catch (error) {
      console.error('❌ Error updating jobs with passed deadlines:', error);
    }
  }
  
  // Get updated job counts after deadline checks
  const activeJobsResult = await db.find({ selector: { type: 'job', employer: userId, isActive: true } });
  const activeJobs = activeJobsResult.docs.length;
  console.log(`📊 Found ${activeJobs} active jobs (after deadline check)`);
  
  const closedJobsResult = await db.find({ selector: { type: 'job', employer: userId, isActive: false } });
  const closedJobs = closedJobsResult.docs.length;
  console.log(`📊 Found ${closedJobs} closed jobs (after deadline check)`);
  
  const recentJobsResult = await db.find({ selector: { type: 'job', employer: userId, createdAt: { $gte: daysAgo } } });
  const recentJobs = recentJobsResult.docs.length;

  // Application statistics
  const allJobsResult = await db.find({ selector: { type: 'job', employer: userId } });
  
  // Debug: Check each job's applications
  console.log('🔍 Job applications breakdown:');
  allJobsResult.docs.forEach((job: any) => {
    const appCount = job.applications?.length || 0;
    console.log(`  - "${job.title}": ${appCount} applications (Active: ${job.isActive})`);
    if (appCount > 0) {
      job.applications.forEach((app: any, idx: number) => {
        console.log(`    ${idx + 1}. Status: ${app.status}, Applied: ${app.appliedAt}`);
      });
    }
  });
  
  const totalApplications = allJobsResult.docs.reduce((sum: number, job: any) => sum + (job.applications?.length || 0), 0);
  console.log(`📊 Found ${totalApplications} total applications across all jobs`);
  
  const pendingApplications = allJobsResult.docs.reduce((sum: number, job: any) => {
    return sum + (job.applications?.filter((app: any) => app.status === 'pending').length || 0);
  }, 0);
  console.log(`📊 Found ${pendingApplications} pending applications`);
  
  const hiredApplications = allJobsResult.docs.reduce((sum: number, job: any) => {
    return sum + (job.applications?.filter((app: any) => app.status === 'hired').length || 0);
  }, 0);
  console.log(`📊 Found ${hiredApplications} hired applications`);

  // Scholarship statistics
  const totalScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: userId } });
  const totalScholarships = totalScholarshipsResult.docs.length;
  
  // Check deadlines and automatically update scholarship status
  const scholarshipsToUpdate: any[] = [];
  
  for (const scholarship of totalScholarshipsResult.docs) {
    if (scholarship.deadline) {
      const deadlineDate = new Date(scholarship.deadline);
      const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // If deadline has passed and scholarship is still active, mark it as inactive
      if (daysDiff < 0 && (scholarship.isActive || scholarship.is_active)) {
        console.log(`⚠️ Scholarship "${scholarship.title}" deadline has passed (${daysDiff} days ago), marking as inactive`);
        scholarshipsToUpdate.push({
          ...scholarship,
          isActive: false,
          is_active: false,
          updatedAt: new Date()
        });
      }
    }
  }
  
  // Update scholarships in database if any need updating
  if (scholarshipsToUpdate.length > 0) {
    console.log(`🔄 Updating ${scholarshipsToUpdate.length} scholarships with passed deadlines`);
    try {
      for (const scholarshipUpdate of scholarshipsToUpdate) {
        await db.put(scholarshipUpdate);
      }
      console.log('✅ Successfully updated scholarships with passed deadlines');
    } catch (error) {
      console.error('❌ Error updating scholarships with passed deadlines:', error);
    }
  }
  
  const activeScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: userId, isActive: true } });
  const activeScholarships = activeScholarshipsResult.docs.length;
  
  const totalScholarshipApplications = totalScholarshipsResult.docs.reduce((sum: number, scholarship: any) => sum + (scholarship.applications?.length || 0), 0);

  // Recent jobs
  const recentJobsListResult = await db.find({ selector: { type: 'job', employer: userId } });
  const recentJobsList = recentJobsListResult.docs
    .sort((a: any, b: any) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5)
    .map((job: any) => ({
      title: job.title,
      location: job.location,
      isActive: job.isActive,
      createdAt: job.createdAt
    }));

  // Recent applications
  const allApplications = allJobsResult.docs.flatMap((job: any) => 
    (job.applications || []).map((app: any) => ({
      ...app,
      jobTitle: job.title,
      jobId: job._id,
      appliedAt: app.appliedAt
    }))
  );
  
  // Populate user data for recent applications
  const recentApplicationsWithUsers = await Promise.all(
    allApplications
      .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5)
      .map(async (app: any) => {
        try {
          const user = await db.get(app.applicant) as any;
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
        } catch (error) {
          console.error('Error fetching user for application:', app.applicant, error);
          return {
            ...app,
            user: {
              _id: app.applicant,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com'
            }
          };
        }
      })
  );

  // Enhanced job posting trends for charts - last 6 months of real data
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const monthlyJobPostings = last6Months.map(monthKey => {
    const jobsInMonth = allJobsResult.docs.filter((job: any) => {
      if (!job.createdAt) return false;
      const jobDate = new Date(job.createdAt);
      const jobMonthKey = `${jobDate.getFullYear()}-${(jobDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return jobMonthKey === monthKey;
    }).length;
    
    return {
      month: monthKey,
      jobs: jobsInMonth,
      monthLabel: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  });

  // Enhanced application trends - daily applications for current month and weekly for past months
  const applicationTrends = last6Months.map(monthKey => {
    const appsInMonth = allApplications.filter(app => {
      const appDate = new Date(app.appliedAt);
      const appMonthKey = `${appDate.getFullYear()}-${(appDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return appMonthKey === monthKey;
    }).length;
    
    return {
      month: monthKey,
      applications: appsInMonth,
      monthLabel: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  });

  // Enhanced scholarship posting trends for charts - last 6 months of real data
  const monthlyScholarshipPostings = last6Months.map(monthKey => {
    const scholarshipsInMonth = totalScholarshipsResult.docs.filter((scholarship: any) => {
      if (!scholarship.createdAt) return false;
      const scholarshipDate = new Date(scholarship.createdAt);
      const scholarshipMonthKey = `${scholarshipDate.getFullYear()}-${(scholarshipDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return scholarshipMonthKey === monthKey;
    }).length;
    
    return {
      month: monthKey,
      scholarships: scholarshipsInMonth,
      monthLabel: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  });

  console.log('📊 Chart data generated from database:');
  console.log('  Monthly Job Postings:', monthlyJobPostings);
  console.log('  Application Trends:', applicationTrends);
  console.log('  Monthly Scholarship Postings:', monthlyScholarshipPostings);

  // Top performing jobs with status breakdown
  const topJobs = allJobsResult.docs
    .map((job: any) => {
      const applications = job.applications || [];
      const totalApplications = applications.length;
      
      // Count applications by status
      const statusCounts = applications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate success rate (hired + shortlisted / total)
      const successfulApplications = (statusCounts.hired || 0) + (statusCounts.shortlisted || 0);
      const successRate = totalApplications > 0 ? (successfulApplications / totalApplications) * 100 : 0;
      
      // Calculate processing rate (non-pending applications / total)
      const processedApplications = totalApplications - (statusCounts.pending || 0);
      const processingRate = totalApplications > 0 ? (processedApplications / totalApplications) * 100 : 0;
      
      return {
        title: job.title,
        jobId: job._id,
        applicationCount: totalApplications,
        isActive: job.isActive,
        statusBreakdown: statusCounts,
        successRate: Math.round(successRate),
        processingRate: Math.round(processingRate),
        hiredCount: statusCounts.hired || 0,
        shortlistedCount: statusCounts.shortlisted || 0,
        pendingCount: statusCounts.pending || 0,
        rejectedCount: statusCounts.rejected || 0
      };
    })
    .sort((a, b) => b.applicationCount - a.applicationCount)
    .slice(0, 5);
    
  console.log('📊 Top performing jobs with status breakdown:');
  topJobs.forEach(job => {
    console.log(`  "${job.title}": ${job.applicationCount} applications`);
    console.log(`    - Hired: ${job.hiredCount}, Shortlisted: ${job.shortlistedCount}, Pending: ${job.pendingCount}, Rejected: ${job.rejectedCount}`);
    console.log(`    - Success Rate: ${job.successRate}%, Processing Rate: ${job.processingRate}%`);
  });

  // Application status distribution
  const applicationStatusDistribution = allApplications.reduce((acc: Record<string, number>, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  // Recent scholarships
  const recentScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: userId } });
  const recentScholarships = recentScholarshipsResult.docs
    .sort((a: any, b: any) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5)
    .map((scholarship: any) => ({
      title: scholarship.title,
      amount: scholarship.amount,
      isActive: scholarship.isActive,
      deadline: scholarship.deadline,
      createdAt: scholarship.createdAt
    }));

  // Recent scholarship applications
  const allScholarshipApplications = recentScholarshipsResult.docs.flatMap((scholarship: any) =>
    (scholarship.applications || []).map((app: any) => ({
      ...app,
      scholarshipTitle: scholarship.title,
      scholarshipId: scholarship._id,
      appliedAt: app.appliedAt
    }))
  );
  
  // Populate user data for recent scholarship applications
  const recentScholarshipApplicationsWithUsers = await Promise.all(
    allScholarshipApplications
      .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5)
             .map(async (app: any) => {
         try {
           const user = await db.get(app.applicant) as any;
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
         } catch (error) {
           console.error('Error fetching user for scholarship application:', app.applicant, error);
           return {
             ...app,
             user: {
               _id: app.applicant,
               firstName: 'Unknown',
               lastName: 'User',
               email: 'unknown@example.com'
             }
           };
         }
       })
  );

  const responseData = {
    success: true,
    data: {
      overview: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          recent: recentJobs
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          hired: hiredApplications
        },
        scholarships: {
          total: totalScholarships,
          active: activeScholarships,
          applications: totalScholarshipApplications
        }
      },
      charts: {
        monthlyJobPostings: monthlyJobPostings,
        monthlyScholarshipPostings: monthlyScholarshipPostings,
        applicationTrends: applicationTrends,
        applicationStatusDistribution: Object.entries(applicationStatusDistribution).map(([status, count]) => ({
          status,
          count
        }))
      },
      recentActivity: {
        jobs: recentJobsList,
        applications: recentApplicationsWithUsers,
        scholarships: recentScholarships,
        scholarshipApplications: recentScholarshipApplicationsWithUsers
      },
      topJobs: topJobs
    }
  };
  
  console.log('✅ Sending dashboard response with:', {
    jobStats: responseData.data.overview.jobs,
    applicationStats: responseData.data.overview.applications,
    recentApplicantsCount: responseData.data.recentActivity.applications.length,
    topJobsCount: responseData.data.topJobs.length
  });
  
  res.json(responseData);
}));

// Get employer by ID (public)
router.get('/:employerId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const employer = await db.get(req.params['employerId']) as EmployerDoc;
    res.json({
      success: true,
      data: { employer }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Employer not found'
    });
  }
}));

// Create employer profile
router.post('/', authenticateToken, authorizeRoles('employer'), [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('companySize').trim().notEmpty().withMessage('Company size is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('website').optional().isURL().withMessage('Invalid website URL')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  // Check if employer profile already exists
  const existingResult = await db.find({ 
    selector: { type: 'employer', user: userId }
  });
  if (existingResult.docs.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Employer profile already exists'
    });
  }

  const employerData = {
    ...req.body,
    user: userId,
    type: 'employer',
    isVerified: false,
    jobs: [],
    scholarships: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const employer = await db.put(employerData);

  res.status(201).json({
    success: true,
    message: 'Employer profile created successfully',
    data: { employer }
  });
}));

// Update employer profile
router.put('/profile', authenticateToken, authorizeRoles('employer'), [
  body('companyName').optional().trim().notEmpty(),
  body('industry').optional().trim().notEmpty(),
  body('companySize').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('website').optional().isURL()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const updates = req.body;

  const result = await db.find({ 
    selector: { type: 'employer', user: userId }
  });
  const employer = result.docs[0] as EmployerDoc;

  if (!employer) {
    return res.status(404).json({
      success: false,
      message: 'Employer profile not found'
    });
  }

  Object.assign(employer, updates);
  employer.updatedAt = new Date();
  const latest = await db.get(employer._id);
  employer._rev = latest._rev;
  const updatedEmployer = await db.put(employer);

  res.json({
    success: true,
    message: 'Employer profile updated successfully',
    data: { employer: updatedEmployer }
  });
}));

// Get employer's jobs
router.get('/jobs/employer', authenticateToken, authorizeRoles('employer'), [
  query('status').optional().isIn(['active', 'inactive', 'closed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { status, page = 1, limit = 10 } = req.query;
  
  console.log('🔍 Employer jobs endpoint called by user:', userId);
  
  const selector: any = { type: 'job', employer: userId };
  console.log('🔍 Selector:', selector);
  
  // Debug: Check all jobs in database
  const allJobsResult = await db.find({ selector: { type: 'job' } });
  console.log('📊 Total jobs in database:', allJobsResult.docs.length);
  allJobsResult.docs.forEach((job: any, index) => {
    console.log(`  Job ${index + 1}:`, {
      id: job._id,
      title: job.title,
      employer: job.employer,
      employerType: typeof job.employer,
      matches: job.employer === userId,
      isActive: job.isActive,
      approvalStatus: job.approvalStatus
    });
  });

  const result = await db.find({ selector });
  let jobs = result.docs;
  console.log('📊 Jobs found for this employer:', jobs.length);

  // Check deadlines and automatically update job status
  const today = new Date();
  const jobsToUpdate: any[] = [];
  
  for (const job of jobs) {
    if (job.application_deadline) {
      const deadlineDate = new Date(job.application_deadline);
      const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // If deadline has passed and job is still active, mark it as inactive
      if (daysDiff < 0 && (job.isActive || job.is_active)) {
        console.log(`⚠️ Job "${job.title}" deadline has passed (${daysDiff} days ago), marking as inactive`);
        jobsToUpdate.push({
          ...job,
          isActive: false,
          is_active: false,
          updatedAt: new Date()
        });
      }
    }
  }
  
  // Update jobs in database if any need updating
  if (jobsToUpdate.length > 0) {
    console.log(`🔄 Updating ${jobsToUpdate.length} jobs with passed deadlines`);
    try {
      for (const jobUpdate of jobsToUpdate) {
        await db.put(jobUpdate);
      }
      console.log('✅ Successfully updated jobs with passed deadlines');
      
      // Refresh jobs list after updates
      const updatedResult = await db.find({ selector });
      jobs = updatedResult.docs;
    } catch (error) {
      console.error('❌ Error updating jobs with passed deadlines:', error);
    }
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

// Get employer's scholarships
router.get('/scholarships/employer', authenticateToken, authorizeRoles('employer'), [
  query('status').optional().isIn(['active', 'inactive', 'closed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { status, page = 1, limit = 10 } = req.query;
  
  const selector: any = { type: 'scholarship', employer: userId };
  if (status) {
    selector.status = status;
  }

  const result = await db.find({ selector });
  let scholarships = result.docs;

  // Check deadlines and automatically update scholarship status
  const today = new Date();
  const scholarshipsToUpdate: any[] = [];
  
  for (const scholarship of scholarships) {
    if (scholarship.deadline) {
      const deadlineDate = new Date(scholarship.deadline);
      const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // If deadline has passed and scholarship is still active, mark it as inactive
      if (daysDiff < 0 && (scholarship.isActive || scholarship.is_active)) {
        console.log(`⚠️ Scholarship "${scholarship.title}" deadline has passed (${daysDiff} days ago), marking as inactive`);
        scholarshipsToUpdate.push({
          ...scholarship,
          isActive: false,
          is_active: false,
          updatedAt: new Date()
        });
      }
    }
  }
  
  // Update scholarships in database if any need updating
  if (scholarshipsToUpdate.length > 0) {
    console.log(`🔄 Updating ${scholarshipsToUpdate.length} scholarships with passed deadlines`);
    try {
      for (const scholarshipUpdate of scholarshipsToUpdate) {
        await db.put(scholarshipUpdate);
      }
      console.log('✅ Successfully updated scholarships with passed deadlines');
      
      // Refresh scholarships list after updates
      const updatedResult = await db.find({ selector });
      scholarships = updatedResult.docs;
    } catch (error) {
      console.error('❌ Error updating scholarships with passed deadlines:', error);
    }
  }

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

// Get job applications for employer
router.get('/jobs/:jobId/applications', authenticateToken, authorizeRoles('employer'), [
  query('status').optional().isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { jobId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  // Debug log: print jobId being fetched
  console.log('DEBUG: Fetching job applications for jobId:', jobId);
  console.log('DEBUG: User ID:', userId);
  console.log('DEBUG: Query params:', { status, page, limit });

  let job: any;
  try {
    job = await db.get(jobId);
    console.log('DEBUG: Job found:', {
      id: job._id,
      title: job.title,
      employer: job.employer,
      applicationsCount: job.applications ? job.applications.length : 0
    });
  } catch (err: any) {
    console.error('DEBUG: Error fetching job:', err);
    return res.status(404).json({
      success: false,
      message: 'Job not found',
      debug: typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err)
    });
  }

  // Check if user is the employer (compare job.employer to userId)
  if (job.employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view applications for this job'
    });
  }

  let applications = (job as any).applications || [];
  if (status) {
    applications = applications.filter((app: any) => app.status === status);
  }

  // Paginate applications
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedApplications = applications.slice(startIndex, endIndex);

  // Populate user data for applications with error handling
  const populatedApplications = await Promise.all(
    paginatedApplications.map(async (app: any) => {
      try {
        const user = await db.get(app.applicant) as any;
        return {
          ...app,
          user
        };
      } catch (error) {
        console.error('Error fetching user for job application:', app.applicant, error);
        // Return application with placeholder user data if user not found
        return {
          ...app,
          user: {
            _id: app.applicant,
            firstName: 'Unknown',
            lastName: 'User',
            email: 'unknown@example.com'
          }
        };
      }
    })
  );

  const responseData = {
    success: true,
    data: {
      applications: populatedApplications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(applications.length / Number(limit)),
        totalApplications: applications.length
      }
    }
  };

  console.log('DEBUG: Job applications response:', {
    success: responseData.success,
    applicationsCount: responseData.data.applications.length,
    totalApplications: responseData.data.pagination.totalApplications
  });

  res.json(responseData);
}));

// Update job application status
router.put('/jobs/:jobId/applications/:applicationId', authenticateToken, authorizeRoles('employer'), [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status'),
  body('notes').optional().trim()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { jobId, applicationId } = req.params;
  const { status, notes } = req.body;

  const job = await db.get(jobId) as any;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Check if user is the employer
  if ((job as any).employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update applications for this job'
    });
  }

  const application = (job as any).applications?.find((app: any) => app._id?.toString() === applicationId);
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

  await db.put(job);

  res.json({
    success: true,
    message: 'Application status updated successfully',
    data: { application }
  });
}));

// Get scholarship applications for employer
router.get('/scholarships/:scholarshipId/applications', authenticateToken, authorizeRoles('employer'), [
  query('status').optional().isIn(['pending', 'reviewed', 'approved', 'rejected']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { scholarshipId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  const scholarship = await db.get(scholarshipId) as any;
  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
  }

  // Check if user is the employer
  if ((scholarship as any).employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view applications for this scholarship'
    });
  }

  let applications = (scholarship as any).applications || [];
  
  if (status) {
    applications = applications.filter((app: any) => app.status === status);
  }

  // Paginate applications
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedApplications = applications.slice(startIndex, endIndex);

  // Populate user data for applications with error handling
  const populatedApplications = await Promise.all(
    paginatedApplications.map(async (app: any) => {
      try {
        const user = await db.get(app.applicant) as any;
        return {
          ...app,
          user
        };
      } catch (error) {
        console.error('Error fetching user for scholarship application:', app.applicant, error);
        // Return application with placeholder user data if user not found
        return {
          ...app,
          user: {
            _id: app.applicant,
            firstName: 'Unknown',
            lastName: 'User',
            email: 'unknown@example.com'
          }
        };
      }
    })
  );

  res.json({
    success: true,
    data: {
      applications: populatedApplications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(applications.length / Number(limit)),
        totalApplications: applications.length
      }
    }
  });
}));

// Update scholarship application status
router.put('/scholarships/:scholarshipId/applications/:applicationId', authenticateToken, authorizeRoles('employer'), [
  body('status').isIn(['pending', 'accepted', 'rejected', 'shortlisted', 'reviewed', 'hired', 'closed']).withMessage('Invalid status'),
  body('feedback').optional().trim()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { scholarshipId, applicationId } = req.params;
  const { status, feedback } = req.body;

  const scholarship = await db.get(scholarshipId) as any;
  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
  }

  // Check if user is the employer
  if ((scholarship as any).employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update applications for this scholarship'
    });
  }

  const application = (scholarship as any).applications?.find((app: any) => app._id?.toString() === applicationId);
  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found'
    });
  }

  application.status = status;
  if (feedback) {
    application.feedback = feedback;
  }
  application.updatedAt = new Date();

  await db.put(scholarship);

  res.json({
    success: true,
    message: 'Application status updated successfully',
    data: { application }
  });
}));

// Get employer analytics
router.get('/analytics', authenticateToken, authorizeRoles('employer'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  // Job statistics
  const totalJobsResult = await db.find({ selector: { type: 'job', employer: userId } });
  const totalJobs = totalJobsResult.docs.length;
  const activeJobsResult = await db.find({ selector: { type: 'job', employer: userId, isActive: true } });
  const activeJobs = activeJobsResult.docs.length;
  const newJobsResult = await db.find({ selector: { type: 'job', employer: userId, createdAt: { $gte: daysAgo } } });
  const newJobs = newJobsResult.docs.length;

  // Application statistics
  const jobs = await db.find({ selector: { type: 'job', employer: userId } });
  const totalApplications = jobs.docs.reduce((sum: number, job: any) => sum + ((job as any).applications?.length || 0), 0);
  
  const applicationStatusCounts = jobs.docs.reduce((acc: Record<string, number>, job) => {
    (job as any).applications?.forEach((app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Scholarship statistics
  const totalScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: userId } });
  const totalScholarships = totalScholarshipsResult.docs.length;
  const activeScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: userId, isActive: true } });
  const activeScholarships = activeScholarshipsResult.docs.length;
  const newScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: userId, createdAt: { $gte: daysAgo } } });
  const newScholarships = newScholarshipsResult.docs.length;

  // Scholarship application statistics
  const scholarships = await db.find({ selector: { type: 'scholarship', employer: userId } });
  const totalScholarshipApplications = scholarships.docs.reduce((sum: number, scholarship: any) => sum + ((scholarship as any).applications?.length || 0), 0);
  
  const scholarshipApplicationStatusCounts = scholarships.docs.reduce((acc: Record<string, number>, scholarship) => {
    (scholarship as any).applications?.forEach((app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Recent activity
  const recentJobsResult = await db.find({ selector: { type: 'job', employer: userId } });
  const recentJobs = recentJobsResult.docs
    .sort((a: any, b: any) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5)
    .map((job: any) => ({ 
      title: job.title || 'Untitled Job', 
      isActive: job.isActive || false, 
      createdAt: job.createdAt || new Date() 
    }));

  const recentScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: userId } });
  const recentScholarships = recentScholarshipsResult.docs
    .sort((a: any, b: any) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5)
    .map((scholarship: any) => ({ 
      title: scholarship.title || 'Untitled Scholarship', 
      isActive: scholarship.isActive || false, 
      createdAt: scholarship.createdAt || new Date() 
    }));

  res.json({
    success: true,
    data: {
      jobs: {
        total: totalJobs,
        active: activeJobs,
        new: newJobs
      },
      applications: {
        total: totalApplications,
        byStatus: applicationStatusCounts
      },
      scholarships: {
        total: totalScholarships,
        active: activeScholarships,
        new: newScholarships
      },
      scholarshipApplications: {
        total: totalScholarshipApplications,
        byStatus: scholarshipApplicationStatusCounts
      },
      recentActivity: {
        jobs: recentJobs,
        scholarships: recentScholarships
      }
    }
  });
}));

// Get employer profile
router.get('/profile', authenticateToken, authorizeRoles('employer'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as any;
  
  res.json({
    success: true,
    data: { user }
  });
}));

// Post a new job
router.post('/jobs', authenticateToken, authorizeRoles('employer'), [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('requirements').isArray().withMessage('Requirements must be an array'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('salary.currency').trim().notEmpty().withMessage('Currency is required'),
  body('employmentType').trim().notEmpty().withMessage('Employment type is required'),
  body('application_deadline').custom(value => {
    if (!value) throw new Error('Application deadline is required');
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new Error('Application deadline must be a valid date');
    return true;
  }),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  
  console.log('🔧 Job creation request received');
  console.log('👤 User ID:', userId);
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
  
  const jobData = {
    _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...req.body,
    type: 'job',
    employer: userId,
    applications: [],
    isActive: false, // Set to false until approved
    approvalStatus: 'pending', // Add approval status
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('🔧 Job data to be created:', JSON.stringify(jobData, null, 2));

  const job = await db.put(jobData);
  console.log('✅ Job created successfully:', jobData._id);

  res.status(201).json({
    success: true,
    message: 'Job posted successfully',
    data: { job: jobData }
  });
}));

// Update a job
router.put('/jobs/:jobId', authenticateToken, authorizeRoles('employer'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('requirements').optional().isArray(),
  body('location').optional().trim().notEmpty(),
  body('salary.min').optional().isNumeric(),
  body('salary.max').optional().isNumeric(),
  body('salary.currency').optional().trim().notEmpty(),
  body('employmentType').optional().trim().notEmpty(),
  body('application_deadline').optional().custom(value => {
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Application deadline must be a valid date');
    }
    return true;
  }),
  body('isActive').optional().isBoolean()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { jobId } = req.params;
  const updates = req.body;

  const job = await db.get(jobId) as any;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Check if user is the employer
  if (job.employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this job'
    });
  }

  Object.assign(job, updates);
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

// Delete a job
router.delete('/jobs/:jobId', authenticateToken, authorizeRoles('employer'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { jobId } = req.params;

  const job = await db.get(jobId) as any;
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  // Check if user is the employer
  if (job.employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this job'
    });
  }

  await db.remove(job);

  res.json({
    success: true,
    message: 'Job deleted successfully'
  });
}));

// Post a new scholarship
router.post('/scholarships', authenticateToken, authorizeRoles('employer'), [
  body('title').trim().notEmpty().withMessage('Scholarship title is required'),
  body('description').trim().notEmpty().withMessage('Scholarship description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid date'),
  body('requirements').optional().trim(),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const scholarshipData = {
    ...req.body,
    type: 'scholarship',
    employer: userId,
    applications: [],
    isActive: false, // Set to false until approved
    approvalStatus: 'pending', // Add approval status
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const scholarship = await db.put(scholarshipData);

  res.status(201).json({
    success: true,
    message: 'Scholarship posted successfully',
    data: { scholarship }
  });
}));

// Update a scholarship
router.put('/scholarships/:scholarshipId', authenticateToken, authorizeRoles('employer'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('amount').optional().isNumeric(),
  body('deadline').optional().isISO8601(),
  body('requirements').optional().trim(),
  body('isActive').optional().isBoolean()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { scholarshipId } = req.params;
  const updates = req.body;

  const scholarship = await db.get(scholarshipId) as any;
  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
  }

  // Check if user is the employer
  if (scholarship.employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this scholarship'
    });
  }

  Object.assign(scholarship, updates);
  scholarship.updatedAt = new Date();
  const latest = await db.get(scholarship._id);
  scholarship._rev = latest._rev;
  const updatedScholarship = await db.put(scholarship);

  res.json({
    success: true,
    message: 'Scholarship updated successfully',
    data: { scholarship: updatedScholarship }
  });
}));

// Delete a scholarship
router.delete('/scholarships/:scholarshipId', authenticateToken, authorizeRoles('employer'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { scholarshipId } = req.params;

  const scholarship = await db.get(scholarshipId) as any;
  if (!scholarship) {
    return res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
  }

  // Check if user is the employer
  if (scholarship.employer.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this scholarship'
    });
  }

  await db.remove(scholarship);

  res.json({
    success: true,
    message: 'Scholarship deleted successfully'
  });
}));

export default router; 