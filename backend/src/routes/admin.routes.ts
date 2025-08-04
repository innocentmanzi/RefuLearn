import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { createNotification } from '../services/notificationService';
import { connectCouchDB } from '../config/couchdb';

const router = express.Router();

// Use proper CouchDB connection with authentication
let couchConnection: any = null;

// Initialize proper database connection
const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing CouchDB connection for admin routes...');
    
    couchConnection = await connectCouchDB();
    
    console.log('✅ Admin routes database connection successful!');
    
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Admin routes database connection failed:', errorMessage);
    return false;
  }
};

// Initialize database connection
initializeDatabase();

// Helper function to ensure database is available
const ensureDb = async (): Promise<any> => {
  try {
    if (!couchConnection) {
      console.log('⚠️ Database not available, initializing...');
      couchConnection = await connectCouchDB();
      if (!couchConnection) {
        throw new Error('Failed to establish database connection');
      }
      console.log('✅ Database connection established');
    }
    
    const database = couchConnection.getDatabase();
    if (!database) {
      console.log('❌ Database object is null, reinitializing...');
      couchConnection = await connectCouchDB();
          const retryDatabase = couchConnection.getDatabase();
    if (!retryDatabase || 
        typeof (retryDatabase as any).get !== 'function' || 
        typeof (retryDatabase as any).insert !== 'function' ||
        typeof (retryDatabase as any).list !== 'function') {
      throw new Error('Database object is not properly initialized');
    }
    return retryDatabase;
    }
    
    // Verify the database object has required methods (nano library methods)
    console.log('🔍 Database object type:', typeof database);
    console.log('🔍 Available methods:', Object.getOwnPropertyNames(database));
    console.log('🔍 Database.get method:', typeof (database as any).get);
    console.log('🔍 Database.insert method:', typeof (database as any).insert);
    console.log('🔍 Database.list method:', typeof (database as any).list);
    
    if (typeof (database as any).get !== 'function' || 
        typeof (database as any).insert !== 'function' || 
        typeof (database as any).list !== 'function') {
      console.log('❌ Database object missing required methods, reinitializing...');
      couchConnection = await connectCouchDB();
      const retryDatabase = couchConnection.getDatabase();
      if (!retryDatabase || 
          typeof (retryDatabase as any).get !== 'function' || 
          typeof (retryDatabase as any).insert !== 'function' ||
          typeof (retryDatabase as any).list !== 'function') {
        throw new Error('Database object is not properly initialized');
      }
      return retryDatabase;
    }
    
    return database;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    // Try to reconnect
    try {
      couchConnection = await connectCouchDB();
      const retryDatabase = couchConnection.getDatabase();
      if (!retryDatabase || 
          typeof (retryDatabase as any).get !== 'function' || 
          typeof (retryDatabase as any).insert !== 'function' ||
          typeof (retryDatabase as any).list !== 'function') {
        throw new Error('Database object is not properly initialized after retry');
      }
      return retryDatabase;
    } catch (retryError) {
      console.error('❌ Database retry failed:', retryError);
      throw new Error('Database connection failed after retry');
    }
  }
};

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
  overview?: string;
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
  title?: string;
  provider?: string;
  isActive: boolean;
  [key: string]: any;
}

// Get platform analytics
router.get('/analytics', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  // User statistics
  const totalUsers = await ensureDb().then(db => db.find({ selector: { type: 'user' } }).then(result => result.docs.length));
  const newUsers = await ensureDb().then(db => db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } }).then(result => result.docs.length));
  const activeUsers = await ensureDb().then(db => db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => result.docs.length));
  
  const usersByRole = await ensureDb().then(db => db.find({ selector: { type: 'user' } }).then(result => {
    return result.docs.reduce((acc: Record<string, number>, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }));

  // Course statistics
  const totalCourses = await ensureDb().then(db => db.find({ selector: { type: 'course' } }).then(result => result.docs.length));
  const publishedCourses = await ensureDb().then(db => db.find({ selector: { type: 'course', isActive: true } }).then(result => result.docs.length));
  const totalEnrollments = await ensureDb().then(db => db.find({ selector: { type: 'job' } }).then(result => ({ total: result.docs.reduce((acc: number, job: any) => acc + (job.enrollmentCount || 0), 0) })));

  // Course completion rates (NEW)
  const allCourses = await ensureDb().then(db => db.find({ selector: { type: 'course' } }).then(result => result.docs));
  const allCertificates = await ensureDb().then(db => db.find({ selector: { type: 'certificate' } }).then(result => result.docs));
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
  const totalJobs = await ensureDb().then(db => db.find({ selector: { type: 'job' } }).then(result => result.docs.length));
  const activeJobs = await ensureDb().then(db => db.find({ selector: { type: 'job', isActive: true } }).then(result => result.docs.length));
  const totalApplications = await ensureDb().then(db => db.find({ selector: { type: 'job' } }).then(result => ({ total: result.docs.reduce((acc: number, job: any) => acc + (Array.isArray(job.applications) ? job.applications.length : 0), 0) })));



  // Assessment statistics
  const totalAssessments = await ensureDb().then(db => db.find({ selector: { type: 'assessment' } }).then(result => result.docs.length));
  const completedAssessmentsCount = await ensureDb().then(db => db.find({ selector: { type: 'assessment', status: 'completed' } }).then(result => result.docs.length));

  // Certificate statistics
  const totalCertificates = await ensureDb().then(db => db.find({ selector: { type: 'certificate' } }).then(result => result.docs.length));

  // Help ticket statistics
  const totalTickets = await ensureDb().then(db => db.find({ selector: { type: 'help' } }).then(result => result.docs.length));
  const openTickets = await ensureDb().then(db => db.find({ selector: { type: 'help', status: 'open' } }).then(result => result.docs.length));
  const resolvedTickets = await ensureDb().then(db => db.find({ selector: { type: 'help', status: 'resolved' } }).then(result => result.docs.length));

  // Scholarship statistics
  const totalScholarships = await ensureDb().then(db => db.find({ selector: { type: 'scholarship' } }).then(result => result.docs.length));
  const activeScholarships = await ensureDb().then(db => db.find({ selector: { type: 'scholarship', isActive: true } }).then(result => result.docs.length));

  // Aggregate all major activities
  const activities: Array<any> = [];

  // 1. User registrations
  const activityUsers = await ensureDb().then(db => db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } }))
    .then(result => result.docs.map((user: any) => ({
      type: 'registration',
      user: `${user.firstName} ${user.lastName}`,
      event: `User ${user.firstName} ${user.lastName} registered as ${user.role}`,
      time: user.createdAt
    })));
  activities.push(...activityUsers);

  // 2. User logins
  const activityLogins = await ensureDb().then(db => db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }))
    .then(result => result.docs.map((user: any) => ({
      type: 'login',
      user: `${user.firstName} ${user.lastName}`,
      event: `User ${user.firstName} ${user.lastName} logged in`,
      time: user.lastLogin
    })));
  activities.push(...activityLogins);

  // 3. Course publications
  const activityCourses = await ensureDb().then(db => db.find({ selector: { type: 'course', createdAt: { $gte: daysAgo } } }))
    .then(result => result.docs.map((course: any) => ({
      type: 'course',
      user: course.instructor,
      event: `Course "${course.title}" published`,
      time: course.createdAt
    })));
  activities.push(...activityCourses);

  // 4. Job postings
  const activityJobs = await ensureDb().then(db => db.find({ selector: { type: 'job', createdAt: { $gte: daysAgo } } }))
    .then(result => result.docs.map((job: any) => ({
      type: 'job',
      user: job.company,
      event: `Job "${job.title}" posted by ${job.company}`,
      time: job.createdAt
    })));
  activities.push(...activityJobs);

  // 5. Help ticket creations
  const recentTickets = await ensureDb().then(db => db.find({ selector: { type: 'help_ticket', createdAt: { $gte: daysAgo } } }))
    .then(result => result.docs.map((ticket: any) => ({
      type: 'help_ticket',
      user: ticket.user,
      event: `Help ticket "${ticket.title}" created`,
      time: ticket.createdAt
    })));
  activities.push(...recentTickets);

  // 6. Help ticket responses/messages
  const ticketResponses = await ensureDb().then(db => db.find({ selector: { type: 'help_ticket', messages: { $exists: true } } }))
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
  const activityCompletedAssessments = await ensureDb().then(db => db.find({ selector: { type: 'assessment', status: 'completed', completedAt: { $gte: daysAgo } } }))
    .then(result => result.docs.map((assessment: any) => ({
      type: 'assessment',
      user: assessment.user,
      event: `Assessment completed`,
      time: assessment.completedAt
    })));
  activities.push(...activityCompletedAssessments);

  // 8. Certificate issuances
  const recentCertificates = await ensureDb().then(db => db.find({ selector: { type: 'certificate', createdAt: { $gte: daysAgo } } }))
    .then(result => result.docs.map((cert: any) => ({
      type: 'certificate',
      user: cert.user,
      event: `Certificate issued`,
      time: cert.createdAt
    })));
  activities.push(...recentCertificates);

  // 9. Scholarship applications
  const recentScholarships = await ensureDb().then(db => db.find({ selector: { type: 'scholarship', createdAt: { $gte: daysAgo } } }))
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

  const result = await ensureDb().then(db => db.find({ selector }));
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
    const user = await ensureDb().then(db => db.get(req.params['userId']) as UserDoc);
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

  const user = await ensureDb().then(db => db.get(userId) as UserDoc);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  Object.assign(user, updates);
  user.updatedAt = new Date();
  const latest = await ensureDb().then(db => db.get(user._id));
  user._rev = latest._rev;
      const updatedUser = await ensureDb().then(db => db.insert(user));

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
}));

// Delete user
router.delete('/users/:userId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await ensureDb().then(db => db.get(userId) as UserDoc);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const latest = await ensureDb().then(db => db.get(user._id));
  user._rev = latest._rev;
  await ensureDb().then(db => db.remove(user));

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

  const result = await ensureDb().then(db => db.find({ selector }));
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

// Get course by ID with complete details
router.get('/courses/:courseId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('🔍 Admin requesting course:', req.params['courseId']);
    console.log('🔍 Admin user:', req.user);
    
    // Get database connection using the same method as course routes
    const database = await ensureDb();
    console.log('🔍 Database connection status:', database ? 'Connected' : 'Not connected');
    
    const course = await database.get(req.params['courseId']) as CourseDoc;
    console.log('🔍 Course found:', course.title, 'ID:', course._id);
    console.log('🔍 Course description:', course.description);
    console.log('🔍 Course overview:', course.overview);
    
    // Get all documents to find modules and content for this course
    const allDocsResult = await database.list({ include_docs: true });
    console.log('🔍 Total documents in database:', allDocsResult.rows.length);
    
    // Also get all quiz documents that might be related to this course
    const allQuizzesResult = await database.find({
      selector: {
        type: 'quiz',
        $or: [
          { course: course._id },
          { courseId: course._id }
        ]
      }
    });
    
    console.log('🔍 All quiz documents found for course:', allQuizzesResult.docs.length);
    console.log('🔍 Quiz documents:', allQuizzesResult.docs.map(doc => ({
      _id: doc._id,
      title: doc.title || doc.name,
      course: doc.course || doc.courseId,
      module: doc.module || doc.moduleId,
      questions: doc.questions?.length || 0
    })));
    
    // Filter modules for this course using the same logic as course routes
    const allModules = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'module' && 
        (doc.course === course._id || doc.courseId === course._id));
    
    const modules = allModules.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    
    console.log('🔍 Modules found for course:', modules.length);
    modules.forEach((module, index) => {
      console.log(`🔍 Module ${index + 1}:`, module.title, 'ID:', module._id);
      console.log(`🔍 Module ${index + 1} description:`, module.description);
    });
    
    // For each module, get its complete content including quizzes, assessments, discussions, and learning outcomes
    const modulesWithCompleteContent = await Promise.all(
      modules.map(async (module) => {
        try {
          console.log(`🔍 Processing module: ${module.title}`);
          
          // Get all documents for this module
          const allDocs = allDocsResult.rows.map((row: any) => row.doc);
          
          // Get all content items for this module (including videos, articles, files, etc.)
          const allContentItems = allDocs
            .filter((doc: any) => doc && 
              ['content', 'video', 'article', 'file', 'document', 'presentation', 'image', 'text', 'link'].includes(doc.type) && 
              (doc.module === module._id || doc.moduleId === module._id))
            .filter((contentItem: any) => {
              // Filter out content with placeholder/hardcoded titles and descriptions
              const title = contentItem.title || contentItem.name || '';
              const description = contentItem.description || contentItem.summary || '';
              const data = contentItem.data || contentItem.content || contentItem.text || '';
              
              // Check for placeholder patterns
              const isPlaceholderTitle = title.toLowerCase().includes('fsfhsadhfas') || 
                                       title.toLowerCase().includes('sjdfsdfsdf') ||
                                       title.toLowerCase().includes('gjkh') ||
                                       title.toLowerCase().includes('dvdfvsdgs') ||
                                       title.length < 3;
              
              const isPlaceholderDescription = description.toLowerCase().includes('fsfhsadhfas') || 
                                             description.toLowerCase().includes('sjdfsdfsdf') ||
                                             description.toLowerCase().includes('gjkh') ||
                                             description.toLowerCase().includes('dvdfvsdgs');
              
              const isPlaceholderData = data.toLowerCase().includes('fsfhsadhfas') || 
                                      data.toLowerCase().includes('sjdfsdfsdf') ||
                                      data.toLowerCase().includes('gjkh') ||
                                      data.toLowerCase().includes('dvdfvsdgs');
              
              // Only include content with real, meaningful data
              const hasRealTitle = title.length > 2 && !isPlaceholderTitle;
              const hasRealContent = (description.length > 5 || data.length > 5) && 
                                   !isPlaceholderDescription && !isPlaceholderData;
              
              return hasRealTitle && hasRealContent;
            })
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          
          // Also check if the module itself has contentItems array or other content fields
          const moduleContentItems = module.contentItems || module.content || [];
          const moduleVideoUrl = module.videoUrl ? [{
            _id: `module-video-${module._id}`,
            type: 'video',
            title: module.videoTitle || 'Module Video',
            url: module.videoUrl,
            description: module.videoDescription || '',
            order: 0
          }] : [];
          const moduleTextContent = module.content_text ? [{
            _id: `module-text-${module._id}`,
            type: 'text',
            title: 'Module Content',
            data: module.content_text,
            description: '',
            order: 1
          }] : [];
          
          const contentItems = [
            // Map individual content documents
            ...allContentItems.map((contentItem: any) => ({
              _id: contentItem._id,
              type: contentItem.contentType || contentItem.type || 'content',
              title: contentItem.title || contentItem.name || contentItem.filename || 'Content',
              data: contentItem.data || contentItem.content || contentItem.text || '', // Don't use description as data
              url: contentItem.url || contentItem.fileUrl || contentItem.videoUrl || contentItem.articleUrl,
              description: contentItem.description || contentItem.summary || '',
              order: contentItem.order,
              duration: contentItem.duration,
              fileType: contentItem.fileType || contentItem.mimeType,
              fileSize: contentItem.fileSize,
              thumbnail: contentItem.thumbnail || contentItem.thumbnailUrl,
              transcript: contentItem.transcript,
              subtitles: contentItem.subtitles
            })),
            // Map module-level content items (filter out placeholders)
            ...moduleContentItems
              .filter((contentItem: any) => {
                // Filter out content with placeholder/hardcoded titles and descriptions
                const title = contentItem.title || contentItem.name || '';
                const description = contentItem.description || contentItem.summary || '';
                const data = contentItem.data || contentItem.content || contentItem.text || '';
                
                // Check for placeholder patterns
                const isPlaceholderTitle = title.toLowerCase().includes('fsfhsadhfas') || 
                                         title.toLowerCase().includes('sjdfsdfsdf') ||
                                         title.toLowerCase().includes('gjkh') ||
                                         title.toLowerCase().includes('dvdfvsdgs') ||
                                         title.length < 3;
                
                const isPlaceholderDescription = description.toLowerCase().includes('fsfhsadhfas') || 
                                               description.toLowerCase().includes('sjdfsdfsdf') ||
                                               description.toLowerCase().includes('gjkh') ||
                                               description.toLowerCase().includes('dvdfvsdgs');
                
                const isPlaceholderData = data.toLowerCase().includes('fsfhsadhfas') || 
                                        data.toLowerCase().includes('sjdfsdfsdf') ||
                                        data.toLowerCase().includes('gjkh') ||
                                        data.toLowerCase().includes('dvdfvsdgs');
                
                // Only include content with real, meaningful data
                const hasRealTitle = title.length > 2 && !isPlaceholderTitle;
                const hasRealContent = (description.length > 5 || data.length > 5) && 
                                     !isPlaceholderDescription && !isPlaceholderData;
                
                return hasRealTitle && hasRealContent;
              })
              .map((contentItem: any, index: number) => ({
                _id: contentItem._id || `module-content-${index}`,
                type: contentItem.type || contentItem.contentType || 'content',
                title: contentItem.title || contentItem.name || `Content ${index + 1}`,
                data: contentItem.data || contentItem.content || contentItem.text || '', // Don't use description as data
                url: contentItem.url || contentItem.fileUrl || contentItem.videoUrl || contentItem.articleUrl,
                description: contentItem.description || contentItem.summary || '',
                order: contentItem.order || index,
                duration: contentItem.duration,
                fileType: contentItem.fileType || contentItem.mimeType,
                fileSize: contentItem.fileSize,
                thumbnail: contentItem.thumbnail || contentItem.thumbnailUrl,
                transcript: contentItem.transcript,
                subtitles: contentItem.subtitles
              })),
            // Add module video URL if present
            ...moduleVideoUrl,
            // Add module text content if present
            ...moduleTextContent
          ];
          
          console.log(`🔍 Content items found for module ${module.title}:`, contentItems.length);
          console.log(`🔍 Individual content documents found:`, allContentItems.length);
          console.log(`🔍 Module-level content items found:`, moduleContentItems.length);
          console.log(`🔍 Module video URL:`, !!module.videoUrl);
          console.log(`🔍 Module text content:`, !!module.content_text);
          console.log(`🔍 Content items details:`, contentItems.map(item => ({
            type: item.type,
            title: item.title,
            hasData: !!item.data,
            hasUrl: !!item.url,
            dataPreview: item.data?.substring(0, 100) + '...',
            urlPreview: item.url?.substring(0, 50) + '...',
            description: item.description?.substring(0, 50) + '...'
          })));
          
          // Get quizzes for this module using comprehensive logic
          const moduleQuizzes = allDocs
            .filter((doc: any) => doc && doc.type === 'quiz' && 
              (doc.module === module._id || doc.moduleId === module._id))
            .filter((quiz: any) => {
              // Filter out quizzes with placeholder/hardcoded titles
              const title = quiz.title || quiz.name || '';
              const isPlaceholder = title.toLowerCase().includes('ddhd') || 
                                   title.toLowerCase().includes('fhg') || 
                                   title.toLowerCase().includes('fsdfgds') ||
                                   title.length < 3; // Very short titles are likely placeholders
              
              // Only include quizzes with real content
              const hasRealQuestions = quiz.questions && quiz.questions.length > 0;
              const hasRealTitle = title.length > 2 && !isPlaceholder;
              
              return hasRealQuestions && hasRealTitle;
            })
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          
          // Also check if module itself has quizzes array - but filter out hardcoded/placeholder data
          const moduleLevelQuizzes = (module.quizzes || []).filter((quiz: any) => {
            // Filter out quizzes with placeholder/hardcoded titles
            const title = quiz.title || quiz.name || '';
            const isPlaceholder = title.toLowerCase().includes('ddhd') || 
                                 title.toLowerCase().includes('fhg') || 
                                 title.toLowerCase().includes('fsdfgds') ||
                                 title.toLowerCase().includes('fsfhsadhfas') || 
                                 title.toLowerCase().includes('sjdfsdfsdf') ||
                                 title.toLowerCase().includes('gjkh') ||
                                 title.toLowerCase().includes('dvdfvsdgs') ||
                                 title.length < 3; // Very short titles are likely placeholders
            
            // Only include quizzes with real content
            const hasRealQuestions = quiz.questions && quiz.questions.length > 0;
            const hasRealTitle = title.length > 2 && !isPlaceholder;
            
            return hasRealQuestions && hasRealTitle;
          });
          
          console.log(`🔍 Raw module quizzes array:`, module.quizzes?.length || 0);
          console.log(`🔍 Filtered module-level quizzes:`, moduleLevelQuizzes.length);
          console.log(`🔍 Individual quiz documents found:`, moduleQuizzes.length);
          
          const quizzes = [
            // Map individual quiz documents
            ...moduleQuizzes.map((quiz: any) => ({
              _id: quiz._id,
              title: quiz.title || quiz.name || 'Quiz',
              description: quiz.description,
              totalPoints: quiz.totalPoints || quiz.points,
              duration: quiz.duration,
              dueDate: quiz.dueDate,
              isPublished: quiz.status === 'published' || quiz.isPublished,
              isActive: quiz.status === 'published' || quiz.isActive,
              questions: (quiz.questions || quiz.questionList || []).map((question: any) => ({
                question: question.question || question.text || question.title || 'No question text',
                options: question.options || question.choices || [],
                correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 
                               question.correct !== undefined ? question.correct :
                               question.answer !== undefined ? question.answer : undefined,
                explanation: question.explanation || question.reason || ''
              })),
              status: quiz.status,
              instructorId: quiz.instructorId,
              courseId: quiz.courseId,
              moduleId: quiz.module || quiz.moduleId
            })),
            // Map module-level quizzes
            ...moduleLevelQuizzes.map((quiz: any, index: number) => ({
              _id: quiz._id || `module-quiz-${index}`,
              title: quiz.title || quiz.name || `Quiz ${index + 1}`,
              description: quiz.description,
              totalPoints: quiz.totalPoints || quiz.points,
              duration: quiz.duration,
              dueDate: quiz.dueDate,
              isPublished: quiz.status === 'published' || quiz.isPublished,
              isActive: quiz.status === 'published' || quiz.isActive,
              questions: (quiz.questions || quiz.questionList || []).map((question: any) => ({
                question: question.question || question.text || question.title || 'No question text',
                options: question.options || question.choices || [],
                correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 
                               question.correct !== undefined ? question.correct :
                               question.answer !== undefined ? question.answer : undefined,
                explanation: question.explanation || question.reason || ''
              })),
              status: quiz.status,
              instructorId: quiz.instructorId,
              courseId: quiz.courseId,
              moduleId: module._id
            }))
          ];
          
          console.log(`🔍 Quizzes found for module ${module.title}:`, quizzes.length);
          console.log(`🔍 Individual quiz documents:`, moduleQuizzes.length);
          console.log(`🔍 Module-level quizzes:`, moduleLevelQuizzes.length);
          console.log(`🔍 Quiz details:`, quizzes.map(quiz => ({
            title: quiz.title,
            questionCount: quiz.questions?.length || 0,
            hasQuestions: !!quiz.questions?.length,
            questions: quiz.questions?.map((q: any) => ({
              question: q.question || q.text,
              options: q.options?.length || 0,
              hasCorrectAnswer: q.correctAnswer !== undefined,
              correctAnswer: q.correctAnswer
            }))
          })));
          
          // Get assessments for this module
          const assessments = allDocs
            .filter((doc: any) => doc && ['assessment', 'assignment', 'exam'].includes(doc.type) && 
              (doc.module === module._id || doc.moduleId === module._id))
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((assessment: any) => ({
              _id: assessment._id,
              title: assessment.title,
              description: assessment.description,
              totalPoints: assessment.totalPoints,
              timeLimit: assessment.timeLimit,
              dueDate: assessment.dueDate,
              isPublished: assessment.isPublished,
              isActive: assessment.isActive
            }));
          
          console.log(`🔍 Assessments found for module ${module.title}:`, assessments.length);
          
          // Get discussions for this module
          const discussions = allDocs
            .filter((doc: any) => doc && doc.type === 'discussion' && 
              (doc.module === module._id || doc.moduleId === module._id))
            .filter((discussion: any) => {
              // Log all discussions for debugging
              console.log('🔍 Backend discussion being filtered:', {
                title: discussion.title,
                content: discussion.content,
                category: discussion.category
              });
              
              // Filter out obvious placeholder content
              const title = discussion.title || '';
              const content = discussion.content || '';
              
              // Filter out placeholder patterns and very short content
              const isPlaceholder = 
                title.toLowerCase().includes('fsdgfsdgdg') || 
                title.toLowerCase().includes('sfgsdgfsdgfsd') ||
                title.toLowerCase().includes('fsfhsadhfas') || 
                title.toLowerCase().includes('sjdfsdfsdf') ||
                title.toLowerCase().includes('gjkh') ||
                title.toLowerCase().includes('dvdfvsdgs') ||
                content.toLowerCase().includes('fsdgfsdgdg') ||
                content.toLowerCase().includes('sfgsdgfsdgfsd') ||
                content.toLowerCase().includes('fsfhsadhfas') || 
                content.toLowerCase().includes('sjdfsdfsdf') ||
                content.toLowerCase().includes('gjkh') ||
                content.toLowerCase().includes('dvdfvsdgs') ||
                title.length < 3 ||
                content.length < 3;
              
              return !isPlaceholder;
            })
            .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
            .map((discussion: any) => ({
              _id: discussion._id,
              title: discussion.title,
              content: discussion.content,
              category: discussion.category,
              replies: discussion.replies || []
            }));
          
          console.log(`🔍 Discussions found for module ${module.title}:`, discussions.length);
          
          // Get learning outcomes for this module
          const learningOutcomes = allDocs
            .filter((doc: any) => doc && doc.type === 'learning_outcome' && 
              (doc.module === module._id || doc.moduleId === module._id));
          
          console.log(`🔍 Learning outcomes found for module ${module.title}:`, learningOutcomes.length);
          
          // Get resources for this module
          const resources = allDocs
            .filter((doc: any) => doc && doc.type === 'resource' && 
              (doc.module === module._id || doc.moduleId === module._id));
          
          console.log(`🔍 Resources found for module ${module.title}:`, resources.length);
          
          // Get assignments for this module
          const assignments = allDocs
            .filter((doc: any) => doc && doc.type === 'assignment' && 
              (doc.module === module._id || doc.moduleId === module._id));
          
          console.log(`🔍 Assignments found for module ${module.title}:`, assignments.length);
          
          return {
            ...module,
            content: contentItems || [],
            quizzes: quizzes || [],
            assessments: assessments || [],
            discussions: discussions || [],
            learningOutcomes: learningOutcomes || [],
            resources: resources || [],
            assignments: assignments || []
          };
        } catch (error) {
          console.error('Error fetching module content:', error);
          return {
            ...module,
            content: [],
            quizzes: [],
            assessments: [],
            discussions: [],
            learningOutcomes: [],
            resources: [],
            assignments: []
          };
        }
      })
    );
    
    // Get course-level learning outcomes
    const courseLearningOutcomes = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'learning_outcome' && 
        (doc.course === course._id || doc.courseId === course._id));
    
    console.log('🔍 Course-level learning outcomes found:', courseLearningOutcomes.length);
    
    // Get course-level resources
    const courseResources = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'resource' && 
        (doc.course === course._id || doc.courseId === course._id));
    
    console.log('🔍 Course-level resources found:', courseResources.length);
    
    // Get course-level assessments
    const courseAssessments = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && ['assessment', 'assignment', 'exam'].includes(doc.type) && 
        (doc.course === course._id || doc.courseId === course._id) && 
        !doc.module && !doc.moduleId); // Only course-level assessments
    
    console.log('🔍 Course-level assessments found:', courseAssessments.length);
    
    // Get course-level discussions
    const courseDiscussions = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'discussion' && 
        (doc.course === course._id || doc.courseId === course._id) && 
        !doc.module && !doc.moduleId) // Only course-level discussions
      .filter((discussion: any) => {
        // Log all course-level discussions for debugging
        console.log('🔍 Course-level discussion being filtered:', {
          title: discussion.title,
          content: discussion.content,
          category: discussion.category
        });
        
        // Filter out obvious placeholder content
        const title = discussion.title || '';
        const content = discussion.content || '';
        
        // Filter out placeholder patterns and very short content
        const isPlaceholder = 
          title.toLowerCase().includes('fsdgfsdgdg') || 
          title.toLowerCase().includes('sfgsdgfsdgfsd') ||
          title.toLowerCase().includes('fsfhsadhfas') || 
          title.toLowerCase().includes('sjdfsdfsdf') ||
          title.toLowerCase().includes('gjkh') ||
          title.toLowerCase().includes('dvdfvsdgs') ||
          content.toLowerCase().includes('fsdgfsdgdg') ||
          content.toLowerCase().includes('sfgsdgfsdgfsd') ||
          content.toLowerCase().includes('fsfhsadhfas') || 
          content.toLowerCase().includes('sjdfsdfsdf') ||
          content.toLowerCase().includes('gjkh') ||
          content.toLowerCase().includes('dvdfvsdgs') ||
          title.length < 3 ||
          content.length < 3;
        
        return !isPlaceholder;
      });
    
    console.log('🔍 Course-level discussions found:', courseDiscussions.length);
    
    // Get course-level quizzes
    const courseQuizzes = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'quiz' && 
        (doc.course === course._id || doc.courseId === course._id) && 
        !doc.module && !doc.moduleId) // Only course-level quizzes
      .filter((quiz: any) => {
        // Filter out quizzes with placeholder/hardcoded titles
        const title = quiz.title || quiz.name || '';
        const isPlaceholder = title.toLowerCase().includes('ddhd') || 
                             title.toLowerCase().includes('fhg') || 
                             title.toLowerCase().includes('fsdfgds') ||
                             title.toLowerCase().includes('fsfhsadhfas') || 
                             title.toLowerCase().includes('sjdfsdfsdf') ||
                             title.toLowerCase().includes('gjkh') ||
                             title.toLowerCase().includes('dvdfvsdgs') ||
                             title.length < 3; // Very short titles are likely placeholders
        
        // Only include quizzes with real content
        const hasRealQuestions = quiz.questions && quiz.questions.length > 0;
        const hasRealTitle = title.length > 2 && !isPlaceholder;
        
        return hasRealQuestions && hasRealTitle;
      })
      .map((quiz: any) => ({
        _id: quiz._id,
        title: quiz.title || quiz.name || 'Quiz',
        description: quiz.description,
        totalPoints: quiz.totalPoints || quiz.points,
        duration: quiz.duration,
        dueDate: quiz.dueDate,
        isPublished: quiz.status === 'published' || quiz.isPublished,
        isActive: quiz.status === 'published' || quiz.isActive,
        questions: (quiz.questions || quiz.questionList || []).map((question: any) => ({
          question: question.question || question.text || question.title || 'No question text',
          options: question.options || question.choices || [],
          correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : 
                         question.correct !== undefined ? question.correct :
                         question.answer !== undefined ? question.answer : undefined,
          explanation: question.explanation || question.reason || ''
        })),
        status: quiz.status,
        instructorId: quiz.instructorId,
        courseId: quiz.courseId
      }));
    
    console.log('🔍 Course-level quizzes found:', courseQuizzes.length);
    console.log('🔍 Course-level quiz details:', courseQuizzes.map(quiz => ({
      title: quiz.title,
      questionCount: quiz.questions?.length || 0,
      questions: quiz.questions?.map((q: any) => ({
        question: q.question,
        options: q.options?.length || 0,
        hasCorrectAnswer: q.correctAnswer !== undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    })));
    
    // Log all quiz documents found before filtering
    const allQuizDocs = allDocsResult.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'quiz');
    
    console.log('🔍 All quiz documents found in database:', allQuizDocs.length);
    console.log('🔍 All quiz titles:', allQuizDocs.map(doc => ({
      _id: doc._id,
      title: doc.title || doc.name,
      course: doc.course || doc.courseId,
      module: doc.module || doc.moduleId,
      hasQuestions: !!(doc.questions && doc.questions.length > 0)
    })));
    
    // Get instructor information
    let instructorInfo = null;
    if (course.instructor) {
      try {
        const instructor = await ensureDb().then(db => db.get(course.instructor));
        if (instructor && instructor.type === 'user') {
          instructorInfo = {
            _id: instructor._id,
            name: instructor.name || `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Unknown',
            email: instructor.email,
            profilePic: instructor.profilePic
          };
        }
      } catch (instructorError) {
        console.warn('⚠️ Could not fetch instructor info:', instructorError);
      }
    }
    
    // Return course with complete details
    const courseWithCompleteDetails = {
      ...course,
      modules: modulesWithCompleteContent || [],
      courseLearningOutcomes: courseLearningOutcomes || [],
      courseResources: courseResources || [],
      courseAssessments: courseAssessments || [],
      courseDiscussions: courseDiscussions || [],
      courseQuizzes: courseQuizzes || [],
      instructorInfo: instructorInfo
    };
    
    console.log('🔍 Final course with complete details:', {
      title: courseWithCompleteDetails.title,
      description: courseWithCompleteDetails.description?.substring(0, 100) + '...',
      overview: courseWithCompleteDetails.overview?.substring(0, 100) + '...',
      moduleCount: courseWithCompleteDetails.modules.length,
      totalContentItems: courseWithCompleteDetails.modules.reduce((sum, module) => 
        sum + (module.content?.length || 0) + (module.quizzes?.length || 0) + (module.assessments?.length || 0) + 
        (module.discussions?.length || 0) + (module.learningOutcomes?.length || 0) + (module.resources?.length || 0) + 
        (module.assignments?.length || 0), 0
      ),
      courseLearningOutcomes: courseWithCompleteDetails.courseLearningOutcomes.length,
      courseResources: courseWithCompleteDetails.courseResources.length,
      courseAssessments: courseWithCompleteDetails.courseAssessments.length,
      courseDiscussions: courseWithCompleteDetails.courseDiscussions.length,
      courseQuizzes: courseWithCompleteDetails.courseQuizzes.length,
      instructorInfo: !!courseWithCompleteDetails.instructorInfo
    });
    
    res.json({
      success: true,
      data: { course: courseWithCompleteDetails }
    });
  } catch (err) {
    console.error('Error fetching course details:', err);
    
    // Try to get basic course info to debug
    try {
      const database = await ensureDb();
      const basicCourse = await database.get(req.params['courseId']);
      console.log('🔍 Basic course info found:', {
        _id: basicCourse._id,
        title: basicCourse.title,
        description: basicCourse.description,
        overview: basicCourse.overview,
        type: basicCourse.type
      });
      
      res.json({
        success: true,
        data: { 
          course: {
            ...basicCourse,
            modules: [],
            courseLearningOutcomes: [],
            courseResources: [],
            courseAssessments: [],
            courseDiscussions: [],
            courseQuizzes: [],
            instructorInfo: null
          }
        }
      });
    } catch (basicErr) {
      console.error('❌ Course not found at all:', basicErr);
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
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

  const course = await ensureDb().then(db => db.get(courseId) as CourseDoc);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  Object.assign(course, updates);
  course.updatedAt = new Date();
  const latest = await ensureDb().then(db => db.get(course._id));
  course._rev = latest._rev;
      const updatedCourse = await ensureDb().then(db => db.insert(course));

  res.json({
    success: true,
    message: 'Course updated successfully',
    data: { course: updatedCourse }
  });
}));

// Delete course
router.delete('/courses/:courseId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const course = await ensureDb().then(db => db.get(courseId) as CourseDoc);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const latest = await ensureDb().then(db => db.get(course._id));
  course._rev = latest._rev;
  await ensureDb().then(db => db.remove(course));

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

  const jobs = await ensureDb().then(db => db.find({ selector: query }).then(result => result.docs));

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

  const job = await ensureDb().then(db => db.get(jobId) as any);
  if (!job) {
    res.status(404).json({
      success: false,
      message: 'Job not found'
    });
    return;
  }

  Object.assign(job, updates);
  job.updatedAt = new Date();
  const latest = await ensureDb().then(db => db.get(job._id));
  job._rev = latest._rev;
  const updatedJob = await ensureDb().then(db => db.insert(job));

  res.json({
    success: true,
    message: 'Job updated successfully',
    data: { job: updatedJob }
  });
}));

// Get job by ID with complete details for admin approval
router.get('/jobs/:jobId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('🔍 Admin requesting job:', req.params['jobId']);
    
    const database = await ensureDb();
    const job = await database.get(req.params['jobId']) as JobDoc;
    console.log('🔍 Job found:', job.title, 'ID:', job._id);
    
    // Get employer information
    let employerInfo = null;
    if (job.employer) {
      try {
        const employer = await database.get(job.employer);
        if (employer && employer.type === 'user') {
          const name = employer.name || `${employer.firstName || ''} ${employer.lastName || ''}`.trim();
          employerInfo = {
            _id: employer._id,
            name: name || null,
            email: employer.email || null,
            companyName: employer.companyName || null,
            profilePic: employer.profilePic || null
          };
        }
      } catch (employerError) {
        console.warn('⚠️ Could not fetch employer info:', employerError);
      }
    }
    
    // Get job applications if any
    let applications = [];
    if (job.applications && job.applications.length > 0) {
      try {
        applications = await Promise.all(
          job.applications.map(async (app: any) => {
            try {
              const applicant = await database.get(app.applicant);
              if (applicant && applicant.type === 'user') {
                return {
                  ...app,
                  applicant: {
                    _id: applicant._id,
                    name: applicant.name || `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown',
                    email: applicant.email,
                    profilePic: applicant.profilePic
                  }
                };
              }
              return app;
            } catch (applicantError) {
              console.warn('⚠️ Could not fetch applicant info:', applicantError);
              return app;
            }
          })
        );
      } catch (applicationsError) {
        console.warn('⚠️ Could not fetch applications:', applicationsError);
      }
    }
    
    // Return job with complete details
    const jobWithCompleteDetails = {
      ...job,
      employerInfo,
      applications
    };
    
    console.log('🔍 Final job with complete details:', {
      title: jobWithCompleteDetails.title,
      company: jobWithCompleteDetails.company,
      employerInfo: !!jobWithCompleteDetails.employerInfo,
      applicationsCount: jobWithCompleteDetails.applications.length
    });
    
    res.json({
      success: true,
      data: { job: jobWithCompleteDetails }
    });
  } catch (err) {
    console.error('Error fetching job details:', err);
    res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
}));

// Update job (admin only)
router.put('/jobs/:jobId', authenticateToken, authorizeRoles('admin'), [
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
], validate([]), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  const updates = req.body;

  const job = await ensureDb().then(db => db.get(jobId) as any);
  if (!job) {
    res.status(404).json({
      success: false,
      message: 'Job not found'
    });
    return;
  }

  Object.assign(job, updates);
  job.updatedAt = new Date();
  const latest = await ensureDb().then(db => db.get(job._id));
  job._rev = latest._rev;
  const updatedJob = await ensureDb().then(db => db.insert(job));

  res.json({
    success: true,
    message: 'Job updated successfully',
    data: { job: updatedJob }
  });
}));



// Test database connection
router.get('/test-db', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Testing database connection...');
    const database = await ensureDb();
    console.log('✅ Database connection successful');
    
    // Test basic operations
    const allDocs = await database.list({ include_docs: true });
    console.log('✅ Database list operation successful, found', allDocs.rows.length, 'documents');
    
    res.json({
      success: true,
      message: 'Database connection test successful',
      data: {
        totalDocuments: allDocs.rows.length,
        databaseType: typeof database,
        availableMethods: Object.getOwnPropertyNames(database)
      }
    });
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
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
  const usersInPeriod = await ensureDb().then(db => db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } }).then(result => result.docs));
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
  const jobsInPeriod = await ensureDb().then(db => db.find({ selector: { type: 'job', 'studentProgress.completedAt': { $gte: daysAgo } } }).then(result => result.docs));
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
  const dailyApplications = await ensureDb().then(db => db.find({ selector: { type: 'job', 'applications.appliedAt': { $gte: daysAgo } } }).then(result =>
    result.docs.map(job => ({
      _id: job._id,
      count: 1
    }))
  ));

  // Professional daily platform activity tracking
  // 1. User logins
  const usersWithLogin = await ensureDb().then(db => db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => result.docs));
  const loginsByDay = {} as Record<string, number>;
  usersWithLogin.forEach((u: any) => {
    if (u.lastLogin) {
      const date = new Date(u.lastLogin).toISOString().split('T')[0];
      loginsByDay[date] = (loginsByDay[date] || 0) + 1;
    }
  });

  // 2. Course completions (certificates)
  const certsInPeriod = await ensureDb().then(db => db.find({ selector: { type: 'certificate', createdAt: { $gte: daysAgo } } }).then(result => result.docs));
  const completionsByDay = {} as Record<string, number>;
  certsInPeriod.forEach((c: any) => {
    if (c.createdAt) {
      const date = new Date(c.createdAt).toISOString().split('T')[0];
      completionsByDay[date] = (completionsByDay[date] || 0) + 1;
    }
  });

  // 3. Job applications
  const jobsWithApps = await ensureDb().then(db => db.find({ selector: { type: 'job' } }).then(result => result.docs));
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
  const ticketsInPeriod = await ensureDb().then(db => db.find({ selector: { type: 'help', createdAt: { $gte: daysAgo } } }).then(result => result.docs));
  const ticketsByDay = {} as Record<string, number>;
  ticketsInPeriod.forEach((t: any) => {
    if (t.createdAt) {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      ticketsByDay[date] = (ticketsByDay[date] || 0) + 1;
    }
  });

  // 5. Assessment completions
  const assessmentsInPeriod = await ensureDb().then(db => db.find({ selector: { type: 'assessment', status: 'completed', completedAt: { $gte: daysAgo } } }).then(result => result.docs));
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
    const allDocs = await ensureDb().then(db => db.list({ include_docs: true }));
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
  const totalUsers = await ensureDb().then(db => db.find({ selector: { type: 'user' } }).then(result => {
    console.log('👥 User query result:', result.docs.length, 'users found');
    return result.docs.length;
  }));
  
  const activeUsers = await ensureDb().then(db => db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => {
    console.log('🟢 Active users result:', result.docs.length, 'active users found');
    return result.docs.length;
  }));
  
  const usersByRole = await ensureDb().then(db => db.find({ selector: { type: 'user' } }).then(result => {
    const roles = result.docs.reduce((acc: Record<string, number>, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('👥 Users by role:', roles);
    return roles;
  }));

  // Course statistics
  const totalCourses = await ensureDb().then(db => db.find({ selector: { type: 'course' } }).then(result => {
    console.log('📚 Course query result:', result.docs.length, 'courses found');
    return result.docs.length;
  }));
  
  const publishedCourses = await ensureDb().then(db => db.find({ selector: { type: 'course', isActive: true } }).then(result => {
    console.log('📚 Published courses result:', result.docs.length, 'published courses found');
    return result.docs.length;
  }));

  // Job statistics
  const totalJobs = await ensureDb().then(db => db.find({ selector: { type: 'job' } }).then(result => {
    console.log('💼 Job query result:', result.docs.length, 'jobs found');
    return result.docs.length;
  }));
  
  const activeJobs = await ensureDb().then(db => db.find({ selector: { type: 'job', isActive: true } }).then(result => {
    console.log('💼 Active jobs result:', result.docs.length, 'active jobs found');
    return result.docs.length;
  }));

  // Recent activity from last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  // Get all recent activity from last week
  const allDocs = await ensureDb().then(db => db.list({ include_docs: true }));
  const recentActivities: any[] = [];

  // Helper function to get user details
  const getUserDetails = async (userId: string) => {
    try {
      const user: any = await ensureDb().then(db => db.get(userId));
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
    } catch {
      return 'Unknown User';
    }
  };

  // Helper function to get course details
  const getCourseDetails = async (courseId: string) => {
    try {
      const course: any = await ensureDb().then(db => db.get(courseId));
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
  const users = await ensureDb().then(db => db.find({ selector: { type: 'user' } }).then(result => result.docs));
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
        jobs: { total: activeJobs, active: activeJobs }
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
  
  // Get only PENDING courses (not approved or rejected)
  const pendingCourses = await ensureDb().then(db => db.find({ 
    selector: { 
      type: 'course',
      $or: [
        { approvalStatus: { $exists: false } },
        { approvalStatus: 'pending' },
        { approvalStatus: 'draft' },
        { approvalStatus: null }
      ]
    } 
  }).then(result => result.docs));
  console.log('📚 Pending courses found:', pendingCourses.length);
  console.log('📚 Course details:', pendingCourses.map((c: any) => ({
    id: c._id,
    title: c.title,
    isPublished: c.isPublished,
    approvalStatus: c.approvalStatus,
    instructor: c.instructor
  })));
  
  // Get only PENDING jobs (not approved or rejected)
  const pendingJobsResult = await ensureDb().then(db => db.find({ 
    selector: { 
      type: 'job',
      $or: [
        { approvalStatus: { $exists: false } },
        { approvalStatus: 'pending' },
        { approvalStatus: null }
      ]
    } 
  }));
  const pendingJobs = pendingJobsResult.docs;
  console.log('💼 Pending jobs found:', pendingJobs.length);
  console.log('💼 Job details:', pendingJobs.map((job: any) => ({
    id: job._id,
    title: job.title,
    approvalStatus: job.approvalStatus,
    is_active: job.is_active,
    isActive: job.isActive,
    employer: job.employer
  })));
  
  // Get only PENDING scholarships (not approved or rejected)
  const pendingScholarshipsResult = await ensureDb().then(db => db.find({ 
    selector: { 
      type: 'scholarship',
      $or: [
        { approvalStatus: { $exists: false } },
        { approvalStatus: 'pending' },
        { approvalStatus: null }
      ]
    } 
  }));
  const pendingScholarships = pendingScholarshipsResult.docs;
  console.log('🎓 Pending scholarships found:', pendingScholarships.length);
  console.log('🎓 Scholarship details:', pendingScholarships.map((s: any) => ({
    id: s._id,
    title: s.title,
    approvalStatus: s.approvalStatus,
    isActive: s.isActive,
    provider: s.provider
  })));
  
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
  try {
    console.log('🔍 Course approval request received:', {
      courseId: req.params.courseId,
      action: req.body.action,
      reason: req.body.reason,
      user: req.user
    });
    
    const { courseId } = req.params;
    const { action, reason } = req.body;
    
    console.log('🔍 Fetching course from database...');
    const course = await ensureDb().then(db => db.get(courseId)) as any;
    
    console.log('🔍 Course found:', {
      id: course?._id,
      title: course?.title,
      type: course?.type,
      currentStatus: course?.approvalStatus
    });
    
    if (!course || course.type !== 'course') {
      console.log('❌ Course not found or invalid type');
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }
    
    console.log('🔍 Updating course approval status...');
    
    // Get the latest version of the course to avoid conflicts
    const latestCourse = await ensureDb().then(db => db.get(courseId));
    latestCourse.isPublished = action === 'approve';
    latestCourse.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    latestCourse.approvedAt = new Date();
    latestCourse.approvalReason = reason || '';
    latestCourse.updatedAt = new Date();
    
    console.log('🔍 Saving updated course to database...');
    const updatedCourse = await ensureDb().then(db => db.insert(latestCourse));
    console.log('✅ Course updated successfully:', updatedCourse);
  
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
  
    console.log('🔍 Creating notification for instructor...');
    
    // Create notification for the instructor
    try {
      console.log('🔔 Attempting to create notification for course approval/rejection...');
      console.log('📋 Course details:', {
        id: latestCourse._id,
        title: latestCourse.title,
        instructor: latestCourse.instructor,
        action: action
      });
      
      const notificationData = {
        recipient: latestCourse.instructor,
        title: `Course ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your course "${latestCourse.title}" has been ${action}d${reason ? `: ${reason}` : ''}.`,
        category: (action === 'approve' ? 'course_approval' : 'course_rejection') as 'course_approval' | 'course_rejection',
        relatedItem: {
          type: 'course' as const,
          id: latestCourse._id,
          title: latestCourse.title
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
    
    console.log('✅ Course approval process completed successfully');
    
    res.json({
      success: true,
      message: `Course ${action}d successfully`,
      data: { course: latestCourse }
    });
    
  } catch (error: any) {
    console.error('❌ Error in course approval process:', error);
    console.error('❌ Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      name: error?.name || 'Unknown error type'
    });
    
    res.status(500).json({
      success: false,
      message: 'Error processing approval',
      error: error?.message || 'Unknown error occurred'
    });
  }
}));

// Approve/Reject Job
router.put('/jobs/:jobId/approval', authenticateToken, authorizeRoles('admin'), [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').optional().trim()
], validate([]), asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  const { action, reason } = req.body;
  
  const job = await ensureDb().then(db => db.get(jobId) as any);
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
  
      await ensureDb().then(db => db.insert(job));
  
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
  
  const scholarship = await ensureDb().then(db => db.get(scholarshipId) as any);
  if (!scholarship || scholarship.type !== 'scholarship') {
    res.status(404).json({ success: false, message: 'Scholarship not found' });
    return;
  }
  
  scholarship.isActive = action === 'approve';
  scholarship.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
  scholarship.approvedAt = new Date();
  scholarship.approvalReason = reason || '';
  scholarship.updatedAt = new Date();
  
      await ensureDb().then(db => db.insert(scholarship));
  
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

// Get scholarship by ID with complete details for admin approval
router.get('/scholarships/:scholarshipId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('🔍 Admin requesting scholarship:', req.params['scholarshipId']);
    
    const database = await ensureDb();
    const scholarship = await database.get(req.params['scholarshipId']) as ScholarshipDoc;
    console.log('🔍 Scholarship found:', scholarship.title, 'ID:', scholarship._id);
    
    // Get employer information
    let employerInfo = null;
    if (scholarship.employer) {
      try {
        const employer = await database.get(scholarship.employer);
        if (employer && employer.type === 'user') {
          const name = employer.name || `${employer.firstName || ''} ${employer.lastName || ''}`.trim();
          employerInfo = {
            _id: employer._id,
            name: name || null,
            email: employer.email || null,
            companyName: employer.companyName || null,
            profilePic: employer.profilePic || null
          };
        }
      } catch (employerError) {
        console.warn('⚠️ Could not fetch employer info:', employerError);
      }
    }
    
    // Get scholarship applications if any
    let applications = [];
    if (scholarship.applications && scholarship.applications.length > 0) {
      try {
        applications = await Promise.all(
          scholarship.applications.map(async (app: any) => {
            try {
              const applicant = await database.get(app.applicant);
              if (applicant && applicant.type === 'user') {
                return {
                  ...app,
                  applicant: {
                    _id: applicant._id,
                    name: applicant.name || `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown',
                    email: applicant.email,
                    profilePic: applicant.profilePic
                  }
                };
              }
              return app;
            } catch (applicantError) {
              console.warn('⚠️ Could not fetch applicant info:', applicantError);
              return app;
            }
          })
        );
      } catch (applicationsError) {
        console.warn('⚠️ Could not fetch applications:', applicationsError);
      }
    }
    
    // Return scholarship with complete details
    const scholarshipWithCompleteDetails = {
      ...scholarship,
      employerInfo,
      applications,
      daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
    
    console.log('🔍 Final scholarship with complete details:', {
      title: (scholarshipWithCompleteDetails as any).title,
      provider: (scholarshipWithCompleteDetails as any).provider,
      employerInfo: !!scholarshipWithCompleteDetails.employerInfo,
      applicationsCount: scholarshipWithCompleteDetails.applications.length,
      daysRemaining: scholarshipWithCompleteDetails.daysRemaining
    });
    
    res.json({
      success: true,
      data: { scholarship: scholarshipWithCompleteDetails }
    });
  } catch (err) {
    console.error('Error fetching scholarship details:', err);
    res.status(404).json({
      success: false,
      message: 'Scholarship not found'
    });
  }
}));

// Admin - Get all help tickets with user information
router.get('/help-tickets', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response): Promise<void> => {
      console.log('🎫 Admin fetching help tickets...');
    console.log('🔄 Cache-busting request received');
  
  try {
    // Get help tickets - use flexible query to find tickets regardless of exact type field
    const result = await ensureDb().then(db => db.find({ 
      selector: {
        $or: [
          { type: 'help-ticket' },
          { type: 'helpTicket' }, 
          { type: 'ticket' },
          { category: { $exists: true }, description: { $exists: true } },
          { subject: { $exists: true } }
        ]
      }
    }));
    
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
            let userResult = await ensureDb().then(db => db.find({
              selector: { type: 'user', _id: userId }
            }));
            
            // If not found, try to get by email (in case userId is actually an email)
            if (userResult.docs.length === 0) {
              userResult = await ensureDb().then(db => db.find({
                selector: { type: 'user', email: userId }
              }));
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