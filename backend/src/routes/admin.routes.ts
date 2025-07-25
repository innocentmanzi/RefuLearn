import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { createNotification } from '../services/notificationService';

const router = express.Router();

// Setup PouchDB
PouchDB.plugin(PouchDBFind);
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

interface UserDoc {
  _id: string;
  _rev: string;
  type: 'user';
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface CourseDoc {
  _id: string;
  _rev: string;
  type: 'course';
  title: string;
  description: string;
  instructor: string;
  category: string;
  isActive: boolean;
  enrolledStudents?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

interface JobDoc {
  _id: string;
  _rev: string;
  type: 'job';
  title: string;
  company: string;
  isActive: boolean;
  applications?: Array<{
    _id?: string;
    applicant: string;
    appliedAt: Date;
    status: string;
  }>;
  enrollmentCount?: number;
  createdAt?: Date;
  [key: string]: any;
}



interface AssessmentDoc {
  _id: string;
  _rev: string;
  type: 'assessment';
  status: string;
  [key: string]: any;
}

interface CertificateDoc {
  _id: string;
  _rev: string;
  type: 'certificate';
  [key: string]: any;
}

interface HelpDoc {
  _id: string;
  _rev: string;
  type: 'help';
  status: string;
  [key: string]: any;
}

interface ScholarshipDoc {
  _id: string;
  _rev: string;
  type: 'scholarship';
  isActive: boolean;
  [key: string]: any;
}

// Get platform analytics
router.get('/analytics', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  // User statistics
  const totalUsers = await db.find({ selector: { type: 'user' } }).then(result => result.docs.length);
  const newUsers = await db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } }).then(result => result.docs.length);
  const activeUsers = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => result.docs.length);
  
  const usersByRole = await db.find({ selector: { type: 'user' } }).then(result => {
    return result.docs.reduce((acc: Record<string, number>, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  });

  // Course statistics
  const totalCourses = await db.find({ selector: { type: 'course' } }).then(result => result.docs.length);
  const publishedCourses = await db.find({ selector: { type: 'course', isActive: true } }).then(result => result.docs.length);
  const totalEnrollments = await db.find({ selector: { type: 'job' } }).then(result => ({ total: result.docs.reduce((acc: number, job: any) => acc + (job.enrollmentCount || 0), 0) }));

  // Course completion rates (NEW)
  const allCourses = await db.find({ selector: { type: 'course' } }).then(result => result.docs);
  const allCertificates = await db.find({ selector: { type: 'certificate' } }).then(result => result.docs);
  const completionRates = allCourses.map(course => {
    const c = course as any;
    const enrolled = Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0;
    const completions = allCertificates.filter(cert => (cert as any).courseId === c._id).length;
    return {
      name: c.title,
      rate: enrolled > 0 ? Math.round((completions / enrolled) * 100) : 0
    };
  });

  // Job statistics
  const totalJobs = await db.find({ selector: { type: 'job' } }).then(result => result.docs.length);
  const activeJobs = await db.find({ selector: { type: 'job', isActive: true } }).then(result => result.docs.length);
  const totalApplications = await db.find({ selector: { type: 'job' } }).then(result => ({ total: result.docs.reduce((acc: number, job: any) => acc + (Array.isArray(job.applications) ? job.applications.length : 0), 0) }));



  // Assessment statistics
  const totalAssessments = await db.find({ selector: { type: 'assessment' } }).then(result => result.docs.length);
  const completedAssessmentsCount = await db.find({ selector: { type: 'assessment', status: 'completed' } }).then(result => result.docs.length);

  // Certificate statistics
  const totalCertificates = await db.find({ selector: { type: 'certificate' } }).then(result => result.docs.length);

  // Help ticket statistics
  const totalTickets = await db.find({ selector: { type: 'help' } }).then(result => result.docs.length);
  const openTickets = await db.find({ selector: { type: 'help', status: 'open' } }).then(result => result.docs.length);
  const resolvedTickets = await db.find({ selector: { type: 'help', status: 'resolved' } }).then(result => result.docs.length);

  // Scholarship statistics
  const totalScholarships = await db.find({ selector: { type: 'scholarship' } }).then(result => result.docs.length);
  const activeScholarships = await db.find({ selector: { type: 'scholarship', isActive: true } }).then(result => result.docs.length);

  // Aggregate all major activities
  const activities: Array<any> = [];

  // 1. User registrations
  const activityUsers = await db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } })
    .then(result => result.docs.map((user: any) => ({
      type: 'registration',
      user: `${user.firstName} ${user.lastName}`,
      event: `User ${user.firstName} ${user.lastName} registered as ${user.role}`,
      time: user.createdAt
    })));
  activities.push(...activityUsers);

  // 2. User logins
  const activityLogins = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } })
    .then(result => result.docs.map((user: any) => ({
      type: 'login',
      user: `${user.firstName} ${user.lastName}`,
      event: `User ${user.firstName} ${user.lastName} logged in`,
      time: user.lastLogin
    })));
  activities.push(...activityLogins);

  // 3. Course publications
  const activityCourses = await db.find({ selector: { type: 'course', createdAt: { $gte: daysAgo } } })
    .then(result => result.docs.map((course: any) => ({
      type: 'course',
      user: course.instructor,
      event: `Course "${course.title}" published`,
      time: course.createdAt
    })));
  activities.push(...activityCourses);

  // 4. Job postings
  const activityJobs = await db.find({ selector: { type: 'job', createdAt: { $gte: daysAgo } } })
    .then(result => result.docs.map((job: any) => ({
      type: 'job',
      user: job.company,
      event: `Job "${job.title}" posted by ${job.company}`,
      time: job.createdAt
    })));
  activities.push(...activityJobs);

  // 5. Help ticket creations
  const recentTickets = await db.find({ selector: { type: 'help_ticket', createdAt: { $gte: daysAgo } } })
    .then(result => result.docs.map((ticket: any) => ({
      type: 'help_ticket',
      user: ticket.user,
      event: `Help ticket "${ticket.title}" created`,
      time: ticket.createdAt
    })));
  activities.push(...recentTickets);

  // 6. Help ticket responses/messages
  const ticketResponses = await db.find({ selector: { type: 'help_ticket', messages: { $exists: true } } })
    .then(result => result.docs.flatMap((ticket: any) =>
      (ticket.messages || []).map((msg: any) => ({
        type: 'help_ticket_response',
        user: msg.sender,
        event: `Response to ticket "${ticket.title}": ${msg.message}`,
        time: msg.createdAt
      }))
    ));
  activities.push(...ticketResponses);

  // 7. Assessment completions
  const activityCompletedAssessments = await db.find({ selector: { type: 'assessment', status: 'completed', completedAt: { $gte: daysAgo } } })
    .then(result => result.docs.map((assessment: any) => ({
      type: 'assessment',
      user: assessment.user,
      event: `Assessment completed`,
      time: assessment.completedAt
    })));
  activities.push(...activityCompletedAssessments);

  // 8. Certificate issuances
  const recentCertificates = await db.find({ selector: { type: 'certificate', createdAt: { $gte: daysAgo } } })
    .then(result => result.docs.map((cert: any) => ({
      type: 'certificate',
      user: cert.user,
      event: `Certificate issued`,
      time: cert.createdAt
    })));
  activities.push(...recentCertificates);

  // 9. Scholarship applications
  const recentScholarships = await db.find({ selector: { type: 'scholarship', createdAt: { $gte: daysAgo } } })
    .then(result => result.docs.map((sch: any) => ({
      type: 'scholarship',
      user: sch.user,
      event: `Scholarship application submitted`,
      time: sch.createdAt
    })));
  activities.push(...recentScholarships);

  // Sort all activities by time descending
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Limit to top 20 most recent
  const recentAll = activities.slice(0, 20);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        byRole: await usersByRole
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        enrollments: totalEnrollments.total || 0,
        completionRates
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        applications: totalApplications.total || 0
      },

      assessments: {
        total: totalAssessments,
        completed: completedAssessmentsCount
      },
      certificates: {
        total: totalCertificates
      },
      help: {
        total: totalTickets,
        open: openTickets,
        resolved: resolvedTickets
      },
      scholarships: {
        total: totalScholarships,
        active: activeScholarships
      },
      recentActivity: {
        all: recentAll,
        users: activityUsers,
        courses: activityCourses,
        jobs: activityJobs
      }
    }
  });
}));

// Get user management data
router.get('/users', authenticateToken, authorizeRoles('admin'), [
  query('role').optional().isIn(['refugee', 'instructor', 'employer', 'admin']),
  query('status').optional().isIn(['active', 'inactive']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  
  const selector: any = { type: 'user' };
  
  if (role) {
    selector.role = role;
  }
  
  if (status) {
    selector.isActive = status === 'active';
  }

  const result = await db.find({ selector });
  let users = result.docs;

  // Manual filtering for search (since pouchdb-find doesn't support regex)
  if (search) {
    const s = (search as string).toLowerCase();
    users = users.filter((user: any) =>
      user.firstName?.toLowerCase().includes(s) ||
      user.lastName?.toLowerCase().includes(s) ||
      user.email?.toLowerCase().includes(s)
    );
  }

  // Pagination
  const total = users.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedUsers = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      users: pagedUsers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total
      }
    }
  });
}));

// Get user by ID
router.get('/users/:userId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await db.get(req.params['userId']) as UserDoc;
    res.json({
      success: true,
      data: { user }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
}));

// Update user
router.put('/users/:userId', authenticateToken, authorizeRoles('admin'), [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['refugee', 'instructor', 'employer', 'admin']),
  body('isActive').optional().isBoolean()
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updates = req.body;

  const user = await db.get(userId) as UserDoc;
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  Object.assign(user, updates);
  user.updatedAt = new Date();
  const latest = await db.get(user._id);
  user._rev = latest._rev;
  const updatedUser = await db.put(user);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
}));

// Delete user
router.delete('/users/:userId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await db.get(userId) as UserDoc;
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const latest = await db.get(user._id);
  user._rev = latest._rev;
  await db.remove(user);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Get course management data
router.get('/courses', authenticateToken, authorizeRoles('admin'), [
  query('category').optional().trim(),
  query('status').optional().isIn(['active', 'inactive']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { category, status, search, page = 1, limit = 20 } = req.query;
  
  const selector: any = { type: 'course' };
  
  if (category) {
    selector.category = category;
  }
  
  if (status) {
    selector.isActive = status === 'active';
  }

  const result = await db.find({ selector });
  let courses = result.docs;

  // Manual filtering for search (since pouchdb-find doesn't support regex)
  if (search) {
    const s = (search as string).toLowerCase();
    courses = courses.filter((course: any) =>
      course.title?.toLowerCase().includes(s) ||
      course.description?.toLowerCase().includes(s)
    );
  }

  // Pagination
  const total = courses.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedCourses = courses.slice((pageNum - 1) * limitNum, pageNum * limitNum);

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

// Get course by ID
router.get('/courses/:courseId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const course = await db.get(req.params['courseId']) as CourseDoc;
    res.json({
      success: true,
      data: { course }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }
}));

// Update course
router.put('/courses/:courseId', authenticateToken, authorizeRoles('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('isActive').optional().isBoolean()
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const updates = req.body;

  const course = await db.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  Object.assign(course, updates);
  course.updatedAt = new Date();
  const latest = await db.get(course._id);
  course._rev = latest._rev;
  const updatedCourse = await db.put(course);

  res.json({
    success: true,
    message: 'Course updated successfully',
    data: { course: updatedCourse }
  });
}));

// Delete course
router.delete('/courses/:courseId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const course = await db.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const latest = await db.get(course._id);
  course._rev = latest._rev;
  await db.remove(course);

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
}));

// Get job management data
router.get('/jobs', authenticateToken, authorizeRoles('admin'), [
  query('status').optional().isIn(['active', 'inactive']),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { status, search, page = 1, limit = 20 } = req.query;
  
  const query: any = {};
  
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }

  const jobs = await db.find({ selector: query }).then(result => result.docs);

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

// Update job (admin only)
router.put('/jobs/:jobId', authenticateToken, authorizeRoles('admin'), [
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
], validate([]), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  const updates = req.body;

  const job = await db.get(jobId) as any;
  if (!job) {
    res.status(404).json({
      success: false,
      message: 'Job not found'
    });
    return;
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



// Get system health
router.get('/health', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const dbStatus = 'connected'; // You can add actual DB health check here
  const redisStatus = 'connected'; // You can add actual Redis health check here
  
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };

  res.json({
    success: true,
    data: {
      status: 'healthy',
      database: dbStatus,
      redis: redisStatus,
      system: systemInfo
    }
  });
}));

// Get platform statistics
router.get('/statistics', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  // Daily user registrations
  const usersInPeriod = await db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } }).then(result => result.docs);
  const registrationsByDay = {} as Record<string, number>;
  usersInPeriod.forEach(user => {
    const u = user as any;
    const date = new Date(u.createdAt).toISOString().split('T')[0];
    registrationsByDay[date] = (registrationsByDay[date] || 0) + 1;
  });
  const dailyRegistrations = Object.entries(registrationsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Daily course enrollments
  const jobsInPeriod = await db.find({ selector: { type: 'job', 'studentProgress.completedAt': { $gte: daysAgo } } }).then(result => result.docs);
  const enrollmentsByDay = {} as Record<string, number>;
  jobsInPeriod.forEach((j: any) => {
    if (Array.isArray(j.studentProgress)) {
      j.studentProgress.forEach((sp: any) => {
        if (sp.completedAt) {
          const date = new Date(sp.completedAt).toISOString().split('T')[0];
          enrollmentsByDay[date] = (enrollmentsByDay[date] || 0) + 1;
        }
      });
    }
  });
  const dailyEnrollments = Object.entries(enrollmentsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Daily job applications
  const dailyApplications = await db.find({ selector: { type: 'job', 'applications.appliedAt': { $gte: daysAgo } } }).then(result =>
    result.docs.map(job => ({
      _id: job._id,
      count: 1
    }))
  );

  // Professional daily platform activity tracking
  // 1. User logins
  const usersWithLogin = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => result.docs);
  const loginsByDay = {} as Record<string, number>;
  usersWithLogin.forEach((u: any) => {
    if (u.lastLogin) {
      const date = new Date(u.lastLogin).toISOString().split('T')[0];
      loginsByDay[date] = (loginsByDay[date] || 0) + 1;
    }
  });

  // 2. Course completions (certificates)
  const certsInPeriod = await db.find({ selector: { type: 'certificate', createdAt: { $gte: daysAgo } } }).then(result => result.docs);
  const completionsByDay = {} as Record<string, number>;
  certsInPeriod.forEach((c: any) => {
    if (c.createdAt) {
      const date = new Date(c.createdAt).toISOString().split('T')[0];
      completionsByDay[date] = (completionsByDay[date] || 0) + 1;
    }
  });

  // 3. Job applications
  const jobsWithApps = await db.find({ selector: { type: 'job' } }).then(result => result.docs);
  const applicationsByDay = {} as Record<string, number>;
  jobsWithApps.forEach((j: any) => {
    if (Array.isArray(j.applications)) {
      j.applications.forEach((app: any) => {
        if (app.appliedAt) {
          const date = new Date(app.appliedAt).toISOString().split('T')[0];
          applicationsByDay[date] = (applicationsByDay[date] || 0) + 1;
        }
      });
    }
  });

  // 4. Help tickets
  const ticketsInPeriod = await db.find({ selector: { type: 'help', createdAt: { $gte: daysAgo } } }).then(result => result.docs);
  const ticketsByDay = {} as Record<string, number>;
  ticketsInPeriod.forEach((t: any) => {
    if (t.createdAt) {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      ticketsByDay[date] = (ticketsByDay[date] || 0) + 1;
    }
  });

  // 5. Assessment completions
  const assessmentsInPeriod = await db.find({ selector: { type: 'assessment', status: 'completed', completedAt: { $gte: daysAgo } } }).then(result => result.docs);
  const assessmentsByDay = {} as Record<string, number>;
  assessmentsInPeriod.forEach((a: any) => {
    if (a.completedAt) {
      const date = new Date(a.completedAt).toISOString().split('T')[0];
      assessmentsByDay[date] = (assessmentsByDay[date] || 0) + 1;
    }
  });

  // Combine all days
  const allDays = new Set([
    ...Object.keys(loginsByDay),
    ...Object.keys(completionsByDay),
    ...Object.keys(applicationsByDay),
    ...Object.keys(ticketsByDay),
    ...Object.keys(assessmentsByDay)
  ]);
  const dailyPlatformActivity = Array.from(allDays).sort().map(date => {
    const logins = loginsByDay[date] || 0;
    const completions = completionsByDay[date] || 0;
    const applications = applicationsByDay[date] || 0;
    const tickets = ticketsByDay[date] || 0;
    const assessments = assessmentsByDay[date] || 0;
    return {
      date,
      logins,
      completions,
      applications,
      tickets,
      assessments,
      total: logins + completions + applications + tickets + assessments
    };
  });

  res.json({
    success: true,
    data: {
      dailyRegistrations,
      dailyEnrollments,
      dailyApplications,
      dailyPlatformActivity
    }
  });
}));

// Admin dashboard endpoint for frontend compatibility
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  console.log('🔍 Admin Dashboard: Starting data fetch...');
  
  // Get analytics data (reuse logic from /analytics)
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 30);

  try {
    // Debug: Check what's actually in the database
    const allDocs = await db.allDocs({ include_docs: true });
    console.log('📊 Total documents in database:', allDocs.rows.length);
    
    // Debug: Check document types
    const docTypes = allDocs.rows.map(row => (row.doc as any)?.type).filter(Boolean);
    console.log('📋 Document types found:', [...new Set(docTypes)]);
    
    // Debug: Check for users specifically
    const allUsers = allDocs.rows.filter(row => {
      const doc = row.doc as any;
      return doc?.type === 'user' || doc?.email || doc?.firstName || doc?.role;
    });
    console.log('👥 Users found:', allUsers.length);
    console.log('👥 Sample user data:', allUsers[0]?.doc);

  } catch (debugError) {
    console.error('❌ Debug queries failed:', debugError);
  }

  // User statistics
  const totalUsers = await db.find({ selector: { type: 'user' } }).then(result => {
    console.log('👥 User query result:', result.docs.length, 'users found');
    return result.docs.length;
  });
  
  const activeUsers = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => {
    console.log('🟢 Active users result:', result.docs.length, 'active users found');
    return result.docs.length;
  });
  
  const usersByRole = await db.find({ selector: { type: 'user' } }).then(result => {
    const roles = result.docs.reduce((acc: Record<string, number>, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('👥 Users by role:', roles);
    return roles;
  });

  // Course statistics
  const totalCourses = await db.find({ selector: { type: 'course' } }).then(result => {
    console.log('📚 Course query result:', result.docs.length, 'courses found');
    return result.docs.length;
  });
  
  const publishedCourses = await db.find({ selector: { type: 'course', isActive: true } }).then(result => {
    console.log('📚 Published courses result:', result.docs.length, 'published courses found');
    return result.docs.length;
  });

  // Job statistics
  const totalJobs = await db.find({ selector: { type: 'job' } }).then(result => {
    console.log('💼 Job query result:', result.docs.length, 'jobs found');
    return result.docs.length;
  });
  
  const activeJobs = await db.find({ selector: { type: 'job', isActive: true } }).then(result => {
    console.log('💼 Active jobs result:', result.docs.length, 'active jobs found');
    return result.docs.length;
  });

  // Recent activity from last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  // Get all recent activity from last week
  const allDocs = await db.allDocs({ include_docs: true });
  const recentActivities: any[] = [];

  // Helper function to get user details
  const getUserDetails = async (userId: string) => {
    try {
      const user: any = await db.get(userId);
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
    } catch {
      return 'Unknown User';
    }
  };

  // Helper function to get course details
  const getCourseDetails = async (courseId: string) => {
    try {
      const course: any = await db.get(courseId);
      return course.title || 'Unknown Course';
    } catch {
      return 'Unknown Course';
    }
  };

  // Process all documents for recent activity
  for (const row of allDocs.rows) {
    const doc: any = row.doc;
    if (!doc || !doc.createdAt) continue;
    
    const createdDate = new Date(doc.createdAt);
    if (createdDate < lastWeek) continue; // Only last week
    
    let userName = 'Unknown User';
    let courseTitle = '';
    
    switch (doc.type) {
      case 'course':
        if (doc.instructor) {
          userName = await getUserDetails(doc.instructor);
        }
        recentActivities.push({
          type: 'course_created',
          title: `Course "${doc.title}" created`,
          description: `${userName} created a new course in ${doc.category || 'General'}`,
          timestamp: doc.createdAt,
          user: userName,
          icon: '📚'
        });
        break;
        
      case 'job':
        if (doc.employer) {
          userName = await getUserDetails(doc.employer);
        }
        recentActivities.push({
          type: 'job_posted',
          title: `Job "${doc.title}" posted`,
          description: `${userName} posted a new position at ${doc.company || 'Unknown Company'}`,
          timestamp: doc.createdAt,
          user: userName,
          icon: '💼'
        });
        break;
        
      case 'assessment':
        if (doc.instructor) {
          userName = await getUserDetails(doc.instructor);
        }
        if (doc.courseId) {
          courseTitle = await getCourseDetails(doc.courseId);
        }
        recentActivities.push({
          type: 'assessment_created',
          title: `Assessment "${doc.title}" created`,
          description: `${userName} created assessment "${doc.title}"${courseTitle ? ` in course "${courseTitle}"` : ''}`,
          timestamp: doc.createdAt,
          user: userName,
          icon: '📝'
        });
        break;
        
      case 'quiz':
        if (doc.instructorId) {
          userName = await getUserDetails(doc.instructorId);
        }
        if (doc.courseId) {
          courseTitle = await getCourseDetails(doc.courseId);
        }
        recentActivities.push({
          type: 'quiz_created',
          title: `Quiz "${doc.title}" created`,
          description: `${userName} created quiz "${doc.title}"${courseTitle ? ` in course "${courseTitle}"` : ''}`,
          timestamp: doc.createdAt,
          user: userName,
          icon: '❓'
        });
        break;
        
      case 'certificate':
        if (doc.userId) {
          userName = await getUserDetails(doc.userId);
        }
        if (doc.courseId) {
          courseTitle = await getCourseDetails(doc.courseId);
        }
        recentActivities.push({
          type: 'certificate_issued',
          title: `Certificate issued`,
          description: `${userName} received a certificate${courseTitle ? ` for course "${courseTitle}"` : ''}`,
          timestamp: doc.createdAt,
          user: userName,
          icon: '🏆'
        });
        break;
        
      case 'help':
        if (doc.userId) {
          userName = await getUserDetails(doc.userId);
        }
        recentActivities.push({
          type: 'help_ticket',
          title: `Help ticket created`,
          description: `${userName} created support request: ${doc.subject || 'No subject'}`,
          timestamp: doc.createdAt,
          user: userName,
          icon: '🆘'
        });
        break;
    }
    
    // Check for course enrollments (stored in course documents)
    if (doc.type === 'course' && doc.enrolledStudents && Array.isArray(doc.enrolledStudents)) {
      for (const enrollment of doc.enrolledStudents) {
        if (enrollment.enrolledAt) {
          const enrollDate = new Date(enrollment.enrolledAt);
          if (enrollDate >= lastWeek) {
            const studentName = enrollment.userId ? await getUserDetails(enrollment.userId) : 'Unknown Student';
            recentActivities.push({
              type: 'course_enrollment',
              title: `Student enrolled in "${doc.title}"`,
              description: `${studentName} enrolled in course "${doc.title}" (${doc.category || 'General'})`,
              timestamp: enrollment.enrolledAt,
              user: studentName,
              icon: '✅'
            });
          }
        }
      }
    }
    
    // Check for job applications (stored in job documents)
    if (doc.type === 'job' && doc.applications && Array.isArray(doc.applications)) {
      for (const application of doc.applications) {
        if (application.appliedAt) {
          const appDate = new Date(application.appliedAt);
          if (appDate >= lastWeek) {
            const applicantName = application.applicant ? await getUserDetails(application.applicant) : 'Unknown Applicant';
            recentActivities.push({
              type: 'job_application',
              title: `Application for "${doc.title}"`,
              description: `${applicantName} applied for "${doc.title}" at ${doc.company || 'Unknown Company'}`,
              timestamp: application.appliedAt,
              user: applicantName,
              icon: '📄'
            });
          }
        }
      }
    }
  }

  // Sort by timestamp and get most recent 15 activities
  const sortedActivities = recentActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  // Monthly user growth (real data)
  const users = await db.find({ selector: { type: 'user' } }).then(result => result.docs);
  const userGrowthByMonth = users.reduce((acc: Record<string, number>, user) => {
    const u = user as any;
    if (u.createdAt) {
      const date = new Date(u.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthlyUserGrowth = months.map(month => ({ month, users: userGrowthByMonth[month] || 0 }));

  // Platform activity (real data: logins per day)
  const activityByDay = users.reduce((acc: Record<string, number>, user) => {
    const u = user as any;
    if (u.lastLogin) {
      const day = new Date(u.lastLogin).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const platformActivity = last7Days.map(date => ({ date, logins: activityByDay[date] || 0, submissions: 0 }));

  res.json({
    success: true,
    data: {
      overview: {
        users: { total: totalUsers, active: activeUsers, byRole: await usersByRole },
        courses: { total: totalCourses, published: publishedCourses },
        jobs: { total: totalJobs, active: activeJobs }
      },
      recentActivity: sortedActivities,
      monthlyUserGrowth,
      platformActivity
    }
  });
}));

// Get pending approvals for admin
router.get('/pending-approvals', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  console.log('🔍 Fetching pending approvals...');
  
  // Debug: Check all courses in database
  const allCourses = await db.find({ selector: { type: 'course' } }).then(result => result.docs);
  console.log('📚 Total courses in database:', allCourses.length);
  console.log('📚 Course isPublished values:', allCourses.map((c: any) => ({ title: c.title, isPublished: c.isPublished, isActive: c.isActive })));
  
  // Debug: Check all jobs in database
  const allJobs = await db.find({ selector: { type: 'job' } }).then(result => result.docs);
  console.log('💼 Total jobs in database:', allJobs.length);
  console.log('💼 Job approval statuses:', allJobs.map((j: any) => ({ title: j.title, approvalStatus: j.approvalStatus, isActive: j.isActive })));
  
  // Debug: Check all scholarships in database
  const allScholarships = await db.find({ selector: { type: 'scholarship' } }).then(result => result.docs);
  console.log('🎓 Total scholarships in database:', allScholarships.length);
  console.log('🎓 Scholarship approval statuses:', allScholarships.map((s: any) => ({ title: s.title, approvalStatus: s.approvalStatus, isActive: s.isActive })));
  
  // Get pending courses (unpublished, missing isPublished field, or pending approval)
  const pendingCourses = await db.find({ 
    selector: { 
      type: 'course', 
      $or: [
        { isPublished: false },
        { isPublished: { $exists: false } },
        { approvalStatus: 'pending' }
      ]
    } 
  }).then(result => result.docs);
  console.log('📚 Pending courses found:', pendingCourses.length);
  console.log('📚 Pending course details:', pendingCourses.map((c: any) => ({
    id: c._id,
    title: c.title,
    isPublished: c.isPublished,
    approvalStatus: c.approvalStatus,
    instructor: c.instructor
  })));
  
  // Get pending jobs (pending status or missing approvalStatus field)
  // First get all jobs, then filter in JavaScript since CouchDB $or and $exists might not work as expected
  const allJobsResult = await db.find({ selector: { type: 'job' } });
  const pendingJobs = allJobsResult.docs.filter((job: any) => 
    !job.approvalStatus || job.approvalStatus === 'pending'
  );
  console.log('💼 Pending jobs found:', pendingJobs.length);
  
  // Debug: Check all jobs in database
  console.log('🔍 Total jobs in database:', allJobsResult.docs.length);
  console.log('🔍 Job details:', allJobsResult.docs.map((job: any) => ({
    id: job._id,
    title: job.title,
    approvalStatus: job.approvalStatus,
    is_active: job.is_active,
    isActive: job.isActive,
    employer: job.employer
  })));
  
  // Get pending scholarships (pending status or missing approvalStatus field)
  const allScholarshipsResult = await db.find({ selector: { type: 'scholarship' } });
  const pendingScholarships = allScholarshipsResult.docs.filter((scholarship: any) => 
    !scholarship.approvalStatus || scholarship.approvalStatus === 'pending'
  );
  console.log('🎓 Pending scholarships found:', pendingScholarships.length);
  
  res.json({
    success: true,
    data: {
      courses: pendingCourses,
      jobs: pendingJobs,
      scholarships: pendingScholarships,
      total: pendingCourses.length + pendingJobs.length + pendingScholarships.length
    }
  });
}));

// Approve/Reject Course
router.put('/courses/:courseId/approval', authenticateToken, authorizeRoles('admin'), [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').optional().trim()
], validate([]), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { action, reason } = req.body;
  
  const course = await db.get(courseId) as any;
  if (!course || course.type !== 'course') {
    res.status(404).json({ success: false, message: 'Course not found' });
    return;
  }
  
  course.isPublished = action === 'approve';
  course.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
  course.approvedAt = new Date();
  course.approvalReason = reason || '';
  course.updatedAt = new Date();
  
  await db.put(course);
  
  // Create notification for the instructor
  try {
    console.log('🔔 Attempting to create notification for course approval/rejection...');
    console.log('📋 Course details:', {
      id: course._id,
      title: course.title,
      instructor: course.instructor,
      action: action
    });
    
    const notificationData = {
      recipient: course.instructor,
      title: `Course ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your course "${course.title}" has been ${action}d${reason ? `: ${reason}` : ''}.`,
      category: (action === 'approve' ? 'course_approval' : 'course_rejection') as 'course_approval' | 'course_rejection',
      relatedItem: {
        type: 'course' as const,
        id: course._id,
        title: course.title
      }
    };
    
    console.log('📝 Notification data:', JSON.stringify(notificationData, null, 2));
    
    const notificationResult = await createNotification(notificationData);
    console.log('✅ Notification created successfully:', notificationResult);
  } catch (notificationError: any) {
    console.error('❌ Failed to create notification:', notificationError);
    console.error('❌ Error details:', {
      message: notificationError?.message || 'Unknown error',
      stack: notificationError?.stack || 'No stack trace',
      name: notificationError?.name || 'Unknown error type'
    });
    // Don't fail the approval process if notification fails
  }
  
  res.json({
    success: true,
    message: `Course ${action}d successfully`,
    data: { course }
  });
}));

// Approve/Reject Job
router.put('/jobs/:jobId/approval', authenticateToken, authorizeRoles('admin'), [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').optional().trim()
], validate([]), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  const { action, reason } = req.body;
  
  const job = await db.get(jobId) as any;
  if (!job || job.type !== 'job') {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }
  
  job.isActive = action === 'approve';
  job.is_active = action === 'approve'; // Also update is_active field for consistency
  job.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
  job.approvedAt = new Date();
  job.approvalReason = reason || '';
  job.updatedAt = new Date();
  
  await db.put(job);
  
  // Create notification for the employer
  try {
    console.log('🔔 Attempting to create notification for job approval/rejection...');
    console.log('📋 Job details:', {
      id: job._id,
      title: job.title,
      employer: job.employer,
      action: action
    });
    
    const notificationData = {
      recipient: job.employer,
      title: `Job ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your job "${job.title}" has been ${action}d${reason ? `: ${reason}` : ''}.`,
      category: (action === 'approve' ? 'job_approval' : 'job_rejection') as 'job_approval' | 'job_rejection',
      relatedItem: {
        type: 'job' as const,
        id: job._id,
        title: job.title
      }
    };
    
    console.log('📝 Notification data:', JSON.stringify(notificationData, null, 2));
    
    const notificationResult = await createNotification(notificationData);
    console.log('✅ Notification created successfully:', notificationResult);
  } catch (notificationError: any) {
    console.error('❌ Failed to create notification:', notificationError);
    console.error('❌ Error details:', {
      message: notificationError?.message || 'Unknown error',
      stack: notificationError?.stack || 'No stack trace',
      name: notificationError?.name || 'Unknown error type'
    });
    // Don't fail the approval process if notification fails
  }
  
  res.json({
    success: true,
    message: `Job ${action}d successfully`,
    data: { job }
  });
}));

// Approve/Reject Scholarship
router.put('/scholarships/:scholarshipId/approval', authenticateToken, authorizeRoles('admin'), [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').optional().trim()
], validate([]), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { scholarshipId } = req.params;
  const { action, reason } = req.body;
  
  const scholarship = await db.get(scholarshipId) as any;
  if (!scholarship || scholarship.type !== 'scholarship') {
    res.status(404).json({ success: false, message: 'Scholarship not found' });
    return;
  }
  
  scholarship.isActive = action === 'approve';
  scholarship.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
  scholarship.approvedAt = new Date();
  scholarship.approvalReason = reason || '';
  scholarship.updatedAt = new Date();
  
  await db.put(scholarship);
  
  // Create notification for the employer
  try {
    console.log('🔔 Attempting to create notification for scholarship approval/rejection...');
    console.log('📋 Scholarship details:', {
      id: scholarship._id,
      title: scholarship.title,
      employer: scholarship.employer,
      action: action
    });
    
    const notificationData = {
      recipient: scholarship.employer,
      title: `Scholarship ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your scholarship "${scholarship.title}" has been ${action}d${reason ? `: ${reason}` : ''}.`,
      category: (action === 'approve' ? 'scholarship_approval' : 'scholarship_rejection') as 'scholarship_approval' | 'scholarship_rejection',
      relatedItem: {
        type: 'scholarship' as const,
        id: scholarship._id,
        title: scholarship.title
      }
    };
    
    console.log('📝 Notification data:', JSON.stringify(notificationData, null, 2));
    
    const notificationResult = await createNotification(notificationData);
    console.log('✅ Notification created successfully:', notificationResult);
  } catch (notificationError: any) {
    console.error('❌ Failed to create notification:', notificationError);
    console.error('❌ Error details:', {
      message: notificationError?.message || 'Unknown error',
      stack: notificationError?.stack || 'No stack trace',
      name: notificationError?.name || 'Unknown error type'
    });
    // Don't fail the approval process if notification fails
  }
  
  res.json({
    success: true,
    message: `Scholarship ${action}d successfully`,
    data: { scholarship }
  });
}));

// Admin - Get all help tickets with user information
router.get('/help-tickets', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
      console.log('🎫 Admin fetching help tickets...');
    console.log('🔄 Cache-busting request received');
  
  try {
    // Get help tickets - use flexible query to find tickets regardless of exact type field
    const result = await db.find({ 
      selector: {
        $or: [
          { type: 'help-ticket' },
          { type: 'helpTicket' }, 
          { type: 'ticket' },
          { category: { $exists: true }, description: { $exists: true } },
          { subject: { $exists: true } }
        ]
      }
    });
    
    let tickets = result.docs;
    console.log(`📋 Found ${tickets.length} help tickets`);
    console.log('🔍 Sample ticket structure:', tickets[0]);
    
    // Sort tickets by createdAt (newest first) in JavaScript since we can't use database sort without index
    tickets = tickets.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
    
    // Get user information for each ticket
    const ticketsWithUsers = await Promise.all(
      tickets.map(async (ticket: any) => {
        let userInfo = null;
        
        // Try different possible user ID field names - help tickets use 'user' field
        const userId = ticket.user || ticket.userId || ticket.author || ticket.createdBy;
        
        if (userId) {
          try {
            console.log(`🔍 Looking up user for ticket ${ticket._id}, userId: ${userId}`);
            
            // First try to get user by _id
            let userResult = await db.find({
              selector: { type: 'user', _id: userId }
            });
            
            // If not found, try to get by email (in case userId is actually an email)
            if (userResult.docs.length === 0) {
              userResult = await db.find({
                selector: { type: 'user', email: userId }
              });
            }
            
            if (userResult.docs.length > 0) {
              const user = userResult.docs[0] as any;
              userInfo = {
                firstName: user.firstName || 'Unknown',
                lastName: user.lastName || '',
                email: user.email || '',
                role: user.role || ''
              };
              console.log(`✅ Found user: ${userInfo.firstName} ${userInfo.lastName}`);
            } else {
              console.log(`❌ User not found for userId: ${userId}`);
            }
          } catch (userError) {
            console.log(`⚠️ Could not fetch user info for ticket ${ticket._id}:`, userError);
          }
        } else {
          console.log(`⚠️ No userId found in ticket ${ticket._id}`);
        }
        
        return {
          ...ticket,
          user: userInfo
        };
      })
    );
    
    console.log('✅ Help tickets with user info prepared for admin');
    
    res.json({
      success: true,
      data: ticketsWithUsers
    });
    
  } catch (error) {
    console.error('❌ Error fetching help tickets for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch help tickets'
    });
  }
}));

export default router; 