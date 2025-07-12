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
  // Get analytics data (reuse logic from /analytics)
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 30);

  // User statistics
  const totalUsers = await db.find({ selector: { type: 'user' } }).then(result => result.docs.length);
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

  // Job statistics
  const totalJobs = await db.find({ selector: { type: 'job' } }).then(result => result.docs.length);
  const activeJobs = await db.find({ selector: { type: 'job', isActive: true } }).then(result => result.docs.length);

  // Recent activity
  const recentUsers = await db.find({ selector: { type: 'user' } })
    .then(result => result.docs
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((user: any) => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      })));

  const recentCourses = await db.find({ selector: { type: 'course' } })
    .then(result => result.docs
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((course: any) => ({
        _id: course._id,
        title: course.title,
        category: course.category,
        isActive: course.isActive,
        createdAt: course.createdAt
      })));

  const recentJobs = await db.find({ selector: { type: 'job' } })
    .then(result => result.docs
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((job: any) => ({
        _id: job._id,
        title: job.title,
        company: job.company,
        createdAt: job.createdAt
      })));

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
      recentActivity: {
        users: recentUsers,
        courses: recentCourses,
        jobs: recentJobs
      },
      monthlyUserGrowth,
      platformActivity
    }
  });
}));

export default router; 