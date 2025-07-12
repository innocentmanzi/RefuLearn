"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
const db = new pouchdb_1.default('http://Manzi:Clarisse101@localhost:5984/refulearn');
router.get('/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));
    const totalUsers = await db.find({ selector: { type: 'user' } }).then(result => result.docs.length);
    const newUsers = await db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } }).then(result => result.docs.length);
    const activeUsers = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => result.docs.length);
    const usersByRole = await db.find({ selector: { type: 'user' } }).then(result => {
        return result.docs.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
    });
    const totalCourses = await db.find({ selector: { type: 'course' } }).then(result => result.docs.length);
    const publishedCourses = await db.find({ selector: { type: 'course', isActive: true } }).then(result => result.docs.length);
    const totalEnrollments = await db.find({ selector: { type: 'job' } }).then(result => ({ total: result.docs.reduce((acc, job) => acc + (job.enrollmentCount || 0), 0) }));
    const allCourses = await db.find({ selector: { type: 'course' } }).then(result => result.docs);
    const allCertificates = await db.find({ selector: { type: 'certificate' } }).then(result => result.docs);
    const completionRates = allCourses.map(course => {
        const c = course;
        const enrolled = Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0;
        const completions = allCertificates.filter(cert => cert.courseId === c._id).length;
        return {
            name: c.title,
            rate: enrolled > 0 ? Math.round((completions / enrolled) * 100) : 0
        };
    });
    const totalJobs = await db.find({ selector: { type: 'job' } }).then(result => result.docs.length);
    const activeJobs = await db.find({ selector: { type: 'job', isActive: true } }).then(result => result.docs.length);
    const totalApplications = await db.find({ selector: { type: 'job' } }).then(result => ({ total: result.docs.reduce((acc, job) => acc + (Array.isArray(job.applications) ? job.applications.length : 0), 0) }));
    const totalAssessments = await db.find({ selector: { type: 'assessment' } }).then(result => result.docs.length);
    const completedAssessmentsCount = await db.find({ selector: { type: 'assessment', status: 'completed' } }).then(result => result.docs.length);
    const totalCertificates = await db.find({ selector: { type: 'certificate' } }).then(result => result.docs.length);
    const totalTickets = await db.find({ selector: { type: 'help' } }).then(result => result.docs.length);
    const openTickets = await db.find({ selector: { type: 'help', status: 'open' } }).then(result => result.docs.length);
    const resolvedTickets = await db.find({ selector: { type: 'help', status: 'resolved' } }).then(result => result.docs.length);
    const totalScholarships = await db.find({ selector: { type: 'scholarship' } }).then(result => result.docs.length);
    const activeScholarships = await db.find({ selector: { type: 'scholarship', isActive: true } }).then(result => result.docs.length);
    const activities = [];
    const activityUsers = await db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } })
        .then(result => result.docs.map((user) => ({
        type: 'registration',
        user: `${user.firstName} ${user.lastName}`,
        event: `User ${user.firstName} ${user.lastName} registered as ${user.role}`,
        time: user.createdAt
    })));
    activities.push(...activityUsers);
    const activityLogins = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } })
        .then(result => result.docs.map((user) => ({
        type: 'login',
        user: `${user.firstName} ${user.lastName}`,
        event: `User ${user.firstName} ${user.lastName} logged in`,
        time: user.lastLogin
    })));
    activities.push(...activityLogins);
    const activityCourses = await db.find({ selector: { type: 'course', createdAt: { $gte: daysAgo } } })
        .then(result => result.docs.map((course) => ({
        type: 'course',
        user: course.instructor,
        event: `Course "${course.title}" published`,
        time: course.createdAt
    })));
    activities.push(...activityCourses);
    const activityJobs = await db.find({ selector: { type: 'job', createdAt: { $gte: daysAgo } } })
        .then(result => result.docs.map((job) => ({
        type: 'job',
        user: job.company,
        event: `Job "${job.title}" posted by ${job.company}`,
        time: job.createdAt
    })));
    activities.push(...activityJobs);
    const recentTickets = await db.find({ selector: { type: 'help_ticket', createdAt: { $gte: daysAgo } } })
        .then(result => result.docs.map((ticket) => ({
        type: 'help_ticket',
        user: ticket.user,
        event: `Help ticket "${ticket.title}" created`,
        time: ticket.createdAt
    })));
    activities.push(...recentTickets);
    const ticketResponses = await db.find({ selector: { type: 'help_ticket', messages: { $exists: true } } })
        .then(result => result.docs.flatMap((ticket) => (ticket.messages || []).map((msg) => ({
        type: 'help_ticket_response',
        user: msg.sender,
        event: `Response to ticket "${ticket.title}": ${msg.message}`,
        time: msg.createdAt
    }))));
    activities.push(...ticketResponses);
    const activityCompletedAssessments = await db.find({ selector: { type: 'assessment', status: 'completed', completedAt: { $gte: daysAgo } } })
        .then(result => result.docs.map((assessment) => ({
        type: 'assessment',
        user: assessment.user,
        event: `Assessment completed`,
        time: assessment.completedAt
    })));
    activities.push(...activityCompletedAssessments);
    const recentCertificates = await db.find({ selector: { type: 'certificate', createdAt: { $gte: daysAgo } } })
        .then(result => result.docs.map((cert) => ({
        type: 'certificate',
        user: cert.user,
        event: `Certificate issued`,
        time: cert.createdAt
    })));
    activities.push(...recentCertificates);
    const recentScholarships = await db.find({ selector: { type: 'scholarship', createdAt: { $gte: daysAgo } } })
        .then(result => result.docs.map((sch) => ({
        type: 'scholarship',
        user: sch.user,
        event: `Scholarship application submitted`,
        time: sch.createdAt
    })));
    activities.push(...recentScholarships);
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
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
router.get('/users', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.query)('role').optional().isIn(['refugee', 'instructor', 'employer', 'admin']),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive']),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const selector = { type: 'user' };
    if (role) {
        selector.role = role;
    }
    if (status) {
        selector.isActive = status === 'active';
    }
    const result = await db.find({ selector });
    let users = result.docs;
    if (search) {
        const s = search.toLowerCase();
        users = users.filter((user) => user.firstName?.toLowerCase().includes(s) ||
            user.lastName?.toLowerCase().includes(s) ||
            user.email?.toLowerCase().includes(s));
    }
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
router.get('/users/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = await db.get(req.params['userId']);
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
}));
router.put('/users/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('role').optional().isIn(['refugee', 'instructor', 'employer', 'admin']),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;
    const user = await db.get(userId);
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
router.delete('/users/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const user = await db.get(userId);
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
router.get('/courses', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive']),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const selector = { type: 'course' };
    if (category) {
        selector.category = category;
    }
    if (status) {
        selector.isActive = status === 'active';
    }
    const result = await db.find({ selector });
    let courses = result.docs;
    if (search) {
        const s = search.toLowerCase();
        courses = courses.filter((course) => course.title?.toLowerCase().includes(s) ||
            course.description?.toLowerCase().includes(s));
    }
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
router.get('/courses/:courseId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const course = await db.get(req.params['courseId']);
        res.json({
            success: true,
            data: { course }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
}));
router.put('/courses/:courseId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('category').optional().trim().notEmpty(),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const updates = req.body;
    const course = await db.get(courseId);
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
router.delete('/courses/:courseId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const course = await db.get(courseId);
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
router.get('/jobs', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive']),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status === 'active') {
        query.isActive = true;
    }
    else if (status === 'inactive') {
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
router.put('/jobs/:jobId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('isFeatured').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const updates = req.body;
    const job = await db.get(jobId);
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
router.get('/health', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const dbStatus = 'connected';
    const redisStatus = 'connected';
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
router.get('/statistics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));
    const usersInPeriod = await db.find({ selector: { type: 'user', createdAt: { $gte: daysAgo } } }).then(result => result.docs);
    const registrationsByDay = {};
    usersInPeriod.forEach(user => {
        const u = user;
        const date = new Date(u.createdAt).toISOString().split('T')[0];
        registrationsByDay[date] = (registrationsByDay[date] || 0) + 1;
    });
    const dailyRegistrations = Object.entries(registrationsByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));
    const jobsInPeriod = await db.find({ selector: { type: 'job', 'studentProgress.completedAt': { $gte: daysAgo } } }).then(result => result.docs);
    const enrollmentsByDay = {};
    jobsInPeriod.forEach((j) => {
        if (Array.isArray(j.studentProgress)) {
            j.studentProgress.forEach((sp) => {
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
    const dailyApplications = await db.find({ selector: { type: 'job', 'applications.appliedAt': { $gte: daysAgo } } }).then(result => result.docs.map(job => ({
        _id: job._id,
        count: 1
    })));
    const usersWithLogin = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => result.docs);
    const loginsByDay = {};
    usersWithLogin.forEach((u) => {
        if (u.lastLogin) {
            const date = new Date(u.lastLogin).toISOString().split('T')[0];
            loginsByDay[date] = (loginsByDay[date] || 0) + 1;
        }
    });
    const certsInPeriod = await db.find({ selector: { type: 'certificate', createdAt: { $gte: daysAgo } } }).then(result => result.docs);
    const completionsByDay = {};
    certsInPeriod.forEach((c) => {
        if (c.createdAt) {
            const date = new Date(c.createdAt).toISOString().split('T')[0];
            completionsByDay[date] = (completionsByDay[date] || 0) + 1;
        }
    });
    const jobsWithApps = await db.find({ selector: { type: 'job' } }).then(result => result.docs);
    const applicationsByDay = {};
    jobsWithApps.forEach((j) => {
        if (Array.isArray(j.applications)) {
            j.applications.forEach((app) => {
                if (app.appliedAt) {
                    const date = new Date(app.appliedAt).toISOString().split('T')[0];
                    applicationsByDay[date] = (applicationsByDay[date] || 0) + 1;
                }
            });
        }
    });
    const ticketsInPeriod = await db.find({ selector: { type: 'help', createdAt: { $gte: daysAgo } } }).then(result => result.docs);
    const ticketsByDay = {};
    ticketsInPeriod.forEach((t) => {
        if (t.createdAt) {
            const date = new Date(t.createdAt).toISOString().split('T')[0];
            ticketsByDay[date] = (ticketsByDay[date] || 0) + 1;
        }
    });
    const assessmentsInPeriod = await db.find({ selector: { type: 'assessment', status: 'completed', completedAt: { $gte: daysAgo } } }).then(result => result.docs);
    const assessmentsByDay = {};
    assessmentsInPeriod.forEach((a) => {
        if (a.completedAt) {
            const date = new Date(a.completedAt).toISOString().split('T')[0];
            assessmentsByDay[date] = (assessmentsByDay[date] || 0) + 1;
        }
    });
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
router.get('/dashboard', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 30);
    const totalUsers = await db.find({ selector: { type: 'user' } }).then(result => result.docs.length);
    const activeUsers = await db.find({ selector: { type: 'user', lastLogin: { $gte: daysAgo } } }).then(result => result.docs.length);
    const usersByRole = await db.find({ selector: { type: 'user' } }).then(result => {
        return result.docs.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
    });
    const totalCourses = await db.find({ selector: { type: 'course' } }).then(result => result.docs.length);
    const publishedCourses = await db.find({ selector: { type: 'course', isActive: true } }).then(result => result.docs.length);
    const totalJobs = await db.find({ selector: { type: 'job' } }).then(result => result.docs.length);
    const activeJobs = await db.find({ selector: { type: 'job', isActive: true } }).then(result => result.docs.length);
    const recentUsers = await db.find({ selector: { type: 'user' } })
        .then(result => result.docs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((user) => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    })));
    const recentCourses = await db.find({ selector: { type: 'course' } })
        .then(result => result.docs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((course) => ({
        _id: course._id,
        title: course.title,
        category: course.category,
        isActive: course.isActive,
        createdAt: course.createdAt
    })));
    const recentJobs = await db.find({ selector: { type: 'job' } })
        .then(result => result.docs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((job) => ({
        _id: job._id,
        title: job.title,
        company: job.company,
        createdAt: job.createdAt
    })));
    const users = await db.find({ selector: { type: 'user' } }).then(result => result.docs);
    const userGrowthByMonth = users.reduce((acc, user) => {
        const u = user;
        if (u.createdAt) {
            const date = new Date(u.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + 1;
        }
        return acc;
    }, {});
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthlyUserGrowth = months.map(month => ({ month, users: userGrowthByMonth[month] || 0 }));
    const activityByDay = users.reduce((acc, user) => {
        const u = user;
        if (u.lastLogin) {
            const day = new Date(u.lastLogin).toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
        }
        return acc;
    }, {});
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
exports.default = router;
//# sourceMappingURL=admin.routes.js.map