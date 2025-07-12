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
router.get('/', [
    (0, express_validator_1.query)('industry').optional().trim(),
    (0, express_validator_1.query)('location').optional().trim(),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { industry, location, search, page = 1, limit = 10 } = req.query;
    const selector = { type: 'employer', isVerified: true };
    if (industry) {
        selector.industry = industry;
    }
    const result = await db.find({ selector });
    let employers = result.docs;
    if (location) {
        const loc = location.toLowerCase();
        employers = employers.filter((employer) => employer.location?.toLowerCase().includes(loc));
    }
    if (search) {
        const s = search.toLowerCase();
        employers = employers.filter((employer) => employer.companyName?.toLowerCase().includes(s) ||
            employer.description?.toLowerCase().includes(s));
    }
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
router.get('/dashboard', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('🔍 Dashboard API called by employer:', req.user._id);
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));
    const totalJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString() } });
    const totalJobs = totalJobsResult.docs.length;
    console.log(`📊 Found ${totalJobs} total jobs for employer ${req.user._id}`);
    const activeJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString(), isActive: true } });
    const activeJobs = activeJobsResult.docs.length;
    console.log(`📊 Found ${activeJobs} active jobs`);
    const closedJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString(), isActive: false } });
    const closedJobs = closedJobsResult.docs.length;
    console.log(`📊 Found ${closedJobs} closed jobs`);
    const recentJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString(), createdAt: { $gte: daysAgo } } });
    const recentJobs = recentJobsResult.docs.length;
    const allJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString() } });
    console.log('🔍 Job applications breakdown:');
    allJobsResult.docs.forEach((job) => {
        const appCount = job.applications?.length || 0;
        console.log(`  - "${job.title}": ${appCount} applications (Active: ${job.isActive})`);
        if (appCount > 0) {
            job.applications.forEach((app, idx) => {
                console.log(`    ${idx + 1}. Status: ${app.status}, Applied: ${app.appliedAt}`);
            });
        }
    });
    const totalApplications = allJobsResult.docs.reduce((sum, job) => sum + (job.applications?.length || 0), 0);
    console.log(`📊 Found ${totalApplications} total applications across all jobs`);
    const pendingApplications = allJobsResult.docs.reduce((sum, job) => {
        return sum + (job.applications?.filter((app) => app.status === 'pending').length || 0);
    }, 0);
    console.log(`📊 Found ${pendingApplications} pending applications`);
    const hiredApplications = allJobsResult.docs.reduce((sum, job) => {
        return sum + (job.applications?.filter((app) => app.status === 'hired').length || 0);
    }, 0);
    console.log(`📊 Found ${hiredApplications} hired applications`);
    const totalScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString() } });
    const totalScholarships = totalScholarshipsResult.docs.length;
    const activeScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString(), isActive: true } });
    const activeScholarships = activeScholarshipsResult.docs.length;
    const totalScholarshipApplications = totalScholarshipsResult.docs.reduce((sum, scholarship) => sum + (scholarship.applications?.length || 0), 0);
    const recentJobsListResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString() } });
    const recentJobsList = recentJobsListResult.docs
        .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
    })
        .slice(0, 5)
        .map((job) => ({
        title: job.title,
        location: job.location,
        isActive: job.isActive,
        createdAt: job.createdAt
    }));
    const allApplications = allJobsResult.docs.flatMap((job) => (job.applications || []).map((app) => ({
        ...app,
        jobTitle: job.title,
        jobId: job._id,
        appliedAt: app.appliedAt
    })));
    const recentApplicationsWithUsers = await Promise.all(allApplications
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5)
        .map(async (app) => {
        try {
            const user = await db.get(app.applicant);
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
        }
        catch (error) {
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
    }));
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    });
    const monthlyJobPostings = last6Months.map(monthKey => {
        const jobsInMonth = allJobsResult.docs.filter((job) => {
            if (!job.createdAt)
                return false;
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
    console.log('📊 Chart data generated from database:');
    console.log('  Monthly Job Postings:', monthlyJobPostings);
    console.log('  Application Trends:', applicationTrends);
    const topJobs = allJobsResult.docs
        .map((job) => {
        const applications = job.applications || [];
        const totalApplications = applications.length;
        const statusCounts = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});
        const successfulApplications = (statusCounts.hired || 0) + (statusCounts.shortlisted || 0);
        const successRate = totalApplications > 0 ? (successfulApplications / totalApplications) * 100 : 0;
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
    const applicationStatusDistribution = allApplications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});
    const recentScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString() } });
    const recentScholarships = recentScholarshipsResult.docs
        .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
    })
        .slice(0, 5)
        .map((scholarship) => ({
        title: scholarship.title,
        amount: scholarship.amount,
        isActive: scholarship.isActive,
        deadline: scholarship.deadline,
        createdAt: scholarship.createdAt
    }));
    const allScholarshipApplications = recentScholarshipsResult.docs.flatMap((scholarship) => (scholarship.applications || []).map((app) => ({
        ...app,
        scholarshipTitle: scholarship.title,
        scholarshipId: scholarship._id,
        appliedAt: app.appliedAt
    })));
    const recentScholarshipApplicationsWithUsers = await Promise.all(allScholarshipApplications
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5)
        .map(async (app) => {
        try {
            const user = await db.get(app.applicant);
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
        }
        catch (error) {
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
    }));
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
router.get('/:employerId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const employer = await db.get(req.params['employerId']);
        res.json({
            success: true,
            data: { employer }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Employer not found'
        });
    }
}));
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('companyName').trim().notEmpty().withMessage('Company name is required'),
    (0, express_validator_1.body)('industry').trim().notEmpty().withMessage('Industry is required'),
    (0, express_validator_1.body)('companySize').trim().notEmpty().withMessage('Company size is required'),
    (0, express_validator_1.body)('location').trim().notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('website').optional().isURL().withMessage('Invalid website URL')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const existingResult = await db.find({
        selector: { type: 'employer', user: req.user._id.toString() }
    });
    if (existingResult.docs.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Employer profile already exists'
        });
    }
    const employerData = {
        ...req.body,
        user: req.user._id.toString(),
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
router.put('/profile', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('companyName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('industry').optional().trim().notEmpty(),
    (0, express_validator_1.body)('companySize').optional().trim().notEmpty(),
    (0, express_validator_1.body)('location').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('website').optional().isURL()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const updates = req.body;
    const result = await db.find({
        selector: { type: 'employer', user: req.user._id.toString() }
    });
    const employer = result.docs[0];
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
router.get('/jobs/employer', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive', 'closed']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const selector = { type: 'job', employer: req.user._id.toString() };
    if (status) {
        selector.status = status;
    }
    const result = await db.find({ selector });
    const jobs = result.docs;
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
router.get('/scholarships/employer', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive', 'closed']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const selector = { type: 'scholarship', employer: req.user._id.toString() };
    if (status) {
        selector.status = status;
    }
    const result = await db.find({ selector });
    const scholarships = result.docs;
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
router.get('/jobs/:jobId/applications', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    console.log('DEBUG: Fetching job applications for jobId:', jobId);
    console.log('DEBUG: User ID:', req.user._id);
    console.log('DEBUG: Query params:', { status, page, limit });
    let job;
    try {
        job = await db.get(jobId);
        console.log('DEBUG: Job found:', {
            id: job._id,
            title: job.title,
            employer: job.employer,
            applicationsCount: job.applications ? job.applications.length : 0
        });
    }
    catch (err) {
        console.error('DEBUG: Error fetching job:', err);
        return res.status(404).json({
            success: false,
            message: 'Job not found',
            debug: typeof err === 'object' && err !== null && 'message' in err ? err.message : String(err)
        });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view applications for this job'
        });
    }
    let applications = job.applications || [];
    if (status) {
        applications = applications.filter((app) => app.status === status);
    }
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedApplications = applications.slice(startIndex, endIndex);
    const populatedApplications = await Promise.all(paginatedApplications.map(async (app) => {
        try {
            const user = await db.get(app.applicant);
            return {
                ...app,
                user
            };
        }
        catch (error) {
            console.error('Error fetching user for job application:', app.applicant, error);
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
    }));
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
router.put('/jobs/:jobId/applications/:applicationId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status'),
    (0, express_validator_1.body)('notes').optional().trim()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId, applicationId } = req.params;
    const { status, notes } = req.body;
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update applications for this job'
        });
    }
    const application = job.applications?.find((app) => app._id?.toString() === applicationId);
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
router.get('/scholarships/:scholarshipId/applications', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'reviewed', 'approved', 'rejected']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        return res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
    }
    if (scholarship.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view applications for this scholarship'
        });
    }
    let applications = scholarship.applications || [];
    if (status) {
        applications = applications.filter((app) => app.status === status);
    }
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedApplications = applications.slice(startIndex, endIndex);
    const populatedApplications = await Promise.all(paginatedApplications.map(async (app) => {
        try {
            const user = await db.get(app.applicant);
            return {
                ...app,
                user
            };
        }
        catch (error) {
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
    }));
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
router.put('/scholarships/:scholarshipId/applications/:applicationId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('status').isIn(['pending', 'accepted', 'rejected', 'shortlisted', 'reviewed', 'hired', 'closed']).withMessage('Invalid status'),
    (0, express_validator_1.body)('feedback').optional().trim()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId, applicationId } = req.params;
    const { status, feedback } = req.body;
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        return res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
    }
    if (scholarship.employer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update applications for this scholarship'
        });
    }
    const application = scholarship.applications?.find((app) => app._id?.toString() === applicationId);
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
router.get('/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));
    const totalJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString() } });
    const totalJobs = totalJobsResult.docs.length;
    const activeJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString(), isActive: true } });
    const activeJobs = activeJobsResult.docs.length;
    const newJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString(), createdAt: { $gte: daysAgo } } });
    const newJobs = newJobsResult.docs.length;
    const jobs = await db.find({ selector: { type: 'job', employer: req.user._id.toString() } });
    const totalApplications = jobs.docs.reduce((sum, job) => sum + (job.applications?.length || 0), 0);
    const applicationStatusCounts = jobs.docs.reduce((acc, job) => {
        job.applications?.forEach((app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
        });
        return acc;
    }, {});
    const totalScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString() } });
    const totalScholarships = totalScholarshipsResult.docs.length;
    const activeScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString(), isActive: true } });
    const activeScholarships = activeScholarshipsResult.docs.length;
    const newScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString(), createdAt: { $gte: daysAgo } } });
    const newScholarships = newScholarshipsResult.docs.length;
    const scholarships = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString() } });
    const totalScholarshipApplications = scholarships.docs.reduce((sum, scholarship) => sum + (scholarship.applications?.length || 0), 0);
    const scholarshipApplicationStatusCounts = scholarships.docs.reduce((acc, scholarship) => {
        scholarship.applications?.forEach((app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
        });
        return acc;
    }, {});
    const recentJobsResult = await db.find({ selector: { type: 'job', employer: req.user._id.toString() } });
    const recentJobs = recentJobsResult.docs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((job) => ({ title: job.title, isActive: job.isActive, createdAt: job.createdAt }));
    const recentScholarshipsResult = await db.find({ selector: { type: 'scholarship', employer: req.user._id.toString() } });
    const recentScholarships = recentScholarshipsResult.docs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((scholarship) => ({ title: scholarship.title, isActive: scholarship.isActive, createdAt: scholarship.createdAt }));
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
router.get('/profile', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await db.get(req.user._id);
    res.json({
        success: true,
        data: { user }
    });
}));
router.post('/jobs', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Job title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Job description is required'),
    (0, express_validator_1.body)('requirements').isArray().withMessage('Requirements must be an array'),
    (0, express_validator_1.body)('location').trim().notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
    (0, express_validator_1.body)('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
    (0, express_validator_1.body)('salary.currency').trim().notEmpty().withMessage('Currency is required'),
    (0, express_validator_1.body)('employmentType').trim().notEmpty().withMessage('Employment type is required'),
    (0, express_validator_1.body)('application_deadline').custom(value => {
        if (!value)
            throw new Error('Application deadline is required');
        const date = new Date(value);
        if (isNaN(date.getTime()))
            throw new Error('Application deadline must be a valid date');
        return true;
    }),
    (0, express_validator_1.body)('isActive').isBoolean().withMessage('isActive must be a boolean')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const jobData = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...req.body,
        type: 'job',
        employer: req.user._id.toString(),
        applications: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const job = await db.put(jobData);
    res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: { job }
    });
}));
router.put('/jobs/:jobId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('requirements').optional().isArray(),
    (0, express_validator_1.body)('location').optional().trim().notEmpty(),
    (0, express_validator_1.body)('salary.min').optional().isNumeric(),
    (0, express_validator_1.body)('salary.max').optional().isNumeric(),
    (0, express_validator_1.body)('salary.currency').optional().trim().notEmpty(),
    (0, express_validator_1.body)('employmentType').optional().trim().notEmpty(),
    (0, express_validator_1.body)('application_deadline').optional().custom(value => {
        if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime()))
                throw new Error('Application deadline must be a valid date');
        }
        return true;
    }),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const updates = req.body;
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
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
router.delete('/jobs/:jobId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: 'Job not found'
        });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
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
router.post('/scholarships', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Scholarship title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Scholarship description is required'),
    (0, express_validator_1.body)('amount').isNumeric().withMessage('Amount must be a number'),
    (0, express_validator_1.body)('deadline').isISO8601().withMessage('Deadline must be a valid date'),
    (0, express_validator_1.body)('requirements').optional().trim(),
    (0, express_validator_1.body)('isActive').isBoolean().withMessage('isActive must be a boolean')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const scholarshipData = {
        ...req.body,
        type: 'scholarship',
        employer: req.user._id.toString(),
        applications: [],
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
router.put('/scholarships/:scholarshipId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('amount').optional().isNumeric(),
    (0, express_validator_1.body)('deadline').optional().isISO8601(),
    (0, express_validator_1.body)('requirements').optional().trim(),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const updates = req.body;
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        return res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
    }
    if (scholarship.employer.toString() !== req.user._id.toString()) {
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
router.delete('/scholarships/:scholarshipId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        return res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
    }
    if (scholarship.employer.toString() !== req.user._id.toString()) {
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
exports.default = router;
//# sourceMappingURL=employer.routes.js.map