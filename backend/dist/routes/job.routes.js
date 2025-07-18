"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ensureAuth = (req) => {
    if (!req.user?._id) {
        throw new Error('User authentication required');
    }
    return {
        userId: req.user._id.toString(),
        user: req.user
    };
};
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const upload_1 = require("../middleware/upload");
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
const dbUrl = 'http://Manzi:Clarisse101@localhost:5984/refulearn';
console.log('Job routes connecting to database with hardcoded credentials');
const db = new pouchdb_1.default(dbUrl);
router.get('/', [
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('location').optional().trim(),
    (0, express_validator_1.query)('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { category, location, type, search, page = 1, limit = 10 } = req.query;
    const selector = { type: 'job', is_active: true };
    if (category) {
        selector.category = category;
    }
    if (type) {
        selector.job_type = type;
    }
    const result = await db.find({ selector });
    let jobs = result.docs;
    if (location) {
        const loc = location.toLowerCase();
        jobs = jobs.filter((job) => job.location?.toLowerCase().includes(loc));
    }
    if (search) {
        const s = search.toLowerCase();
        jobs = jobs.filter((job) => job.title?.toLowerCase().includes(s) ||
            job.description?.toLowerCase().includes(s) ||
            job.company?.toLowerCase().includes(s));
    }
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
router.get('/:jobId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const job = await db.get(req.params['jobId']);
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
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: req.t('job.not_found')
        });
    }
}));
router.post('/:jobId/apply', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user', 'employer', 'admin'), upload_1.uploadAny, [
    (0, express_validator_1.body)('expectedSalary').optional().isFloat({ min: 0 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const { expectedSalary } = req.body;
    const files = req.files;
    const { userId } = ensureAuth(req);
    if (!files || files.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Cover letter and resume files are required'
        });
    }
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
    const job = await db.get(jobId);
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
    if (!job.applications)
        job.applications = [];
    const alreadyApplied = job.applications.some((app) => app.applicant === userId);
    if (alreadyApplied) {
        return res.status(400).json({
            success: false,
            message: 'You have already applied for this job'
        });
    }
    const newApplication = {
        _id: Date.now().toString(),
        applicant: userId,
        coverLetter: coverLetterFile.path,
        resume: resumeFile.path,
        status: 'pending',
        appliedAt: new Date()
    };
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
}), upload_1.handleUploadError);
router.delete('/:jobId/apply', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('refugee', 'user', 'employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const { userId } = ensureAuth(req);
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: req.t('job.not_found')
        });
    }
    if (!job.applications)
        job.applications = [];
    job.applications = job.applications.filter((app) => app.applicant !== userId);
    job.updatedAt = new Date();
    const latest = await db.get(job._id);
    job._rev = latest._rev;
    await db.put(job);
    res.json({
        success: true,
        message: 'Application withdrawn successfully'
    });
}));
router.get('/debug/applications', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = ensureAuth(req);
    const result = await db.find({ selector: { type: 'job' } });
    const jobs = result.docs;
    const debugInfo = jobs.map((job) => ({
        _id: job._id,
        title: job.title,
        hasApplications: !!job.applications,
        applicationsCount: job.applications ? job.applications.length : 0,
        applications: job.applications || [],
        myApplications: job.applications ? job.applications.filter((app) => app.applicant === userId) : []
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
router.get('/applications/user', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await db.find({ selector: { type: 'job' } });
    const jobs = result.docs;
    const jobsWithApplications = jobs.filter((job) => {
        return job.applications && job.applications.length > 0;
    });
    const allApplications = jobsWithApplications.flatMap((job) => {
        return job.applications.map((app) => ({
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
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Job title is required'),
    (0, express_validator_1.body)('company').trim().notEmpty().withMessage('Company name is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Job description is required'),
    (0, express_validator_1.body)('location').trim().notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('job_type').isIn(['Full Time', 'Part Time', 'Contract', 'Internship']).withMessage('Invalid job type'),
    (0, express_validator_1.body)('required_skills').isArray().withMessage('Required skills must be an array'),
    (0, express_validator_1.body)('salary_range').trim().notEmpty().withMessage('Salary range is required'),
    (0, express_validator_1.body)('application_deadline').isISO8601().withMessage('Application deadline must be a valid date'),
    (0, express_validator_1.body)('application_link').optional().trim(),
    (0, express_validator_1.body)('is_active').isBoolean().withMessage('is_active must be a boolean'),
    (0, express_validator_1.body)('remote_work').isBoolean().withMessage('remote_work must be a boolean'),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('Received job creation request:', JSON.stringify(req.body, null, 2));
    const { userId } = ensureAuth(req);
    const { title, company, description, location, job_type, required_skills, salary_range, application_deadline, application_link, is_active, remote_work } = req.body;
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
        is_active: is_active !== undefined ? is_active : true,
        remote_work: remote_work !== undefined ? remote_work : false,
        employer: userId,
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
router.put('/:jobId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), [
    (0, express_validator_1.body)('title').optional().trim(),
    (0, express_validator_1.body)('company').optional().trim(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('location').optional().trim(),
    (0, express_validator_1.body)('job_type').optional().isIn(['Full Time', 'Part Time', 'Contract', 'Internship']),
    (0, express_validator_1.body)('required_skills').optional().isArray(),
    (0, express_validator_1.body)('salary_range').optional().trim(),
    (0, express_validator_1.body)('application_deadline').optional().isISO8601(),
    (0, express_validator_1.body)('application_link').optional().trim(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
    (0, express_validator_1.body)('remote_work').optional().isBoolean(),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    console.log('🔧 Updating job:', jobId);
    console.log('📋 Update data received:', JSON.stringify(req.body, null, 2));
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: req.t('job.not_found')
        });
    }
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
router.delete('/:jobId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({ success: false, message: req.t('job.not_found') });
    }
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
router.get('/employer/jobs', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('🔍 Employer jobs endpoint called');
    const { page = 1, limit = 10 } = req.query;
    let selector = { type: 'job' };
    const { userId, user } = ensureAuth(req);
    console.log('👤 User:', { id: userId, role: user.role });
    if (user.role !== 'admin') {
        selector.employer = userId;
    }
    console.log('🔍 Selector:', selector);
    const result = await db.find({ selector });
    console.log('📊 Total jobs found:', result.docs.length);
    const allJobsResult = await db.find({ selector: { type: 'job' } });
    console.log('🔍 All jobs in database:', allJobsResult.docs.length);
    allJobsResult.docs.forEach((job, index) => {
        console.log(`  Job ${index + 1}:`, {
            id: job._id,
            title: job.title,
            employer: job.employer,
            employerType: typeof job.employer,
            matches: job.employer === userId
        });
    });
    const jobs = result.docs;
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
router.post('/fix-my-jobs', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = ensureAuth(req);
    const allJobs = await db.find({ selector: { type: 'job' } });
    const jobsToFix = allJobs.docs.filter((job) => job.type === 'job' && (!job.employer || job.employer === 'undefined' || job.employer === undefined));
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
            const job = await db.get(jobDoc._id);
            job.employer = userId;
            job.updatedAt = new Date();
            await db.put(job);
            results.push({
                jobId: job._id,
                status: 'updated',
                title: job.title,
                assignedTo: userId
            });
        }
        catch (error) {
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
router.get('/debug/all-jobs', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
    const result = await db.find({ selector: { type: 'job' } });
    const jobsInfo = result.docs.map((job) => ({
        _id: job._id,
        title: job.title,
        employer: job.employer,
        employerType: typeof job.employer,
        hasEmployer: job.hasOwnProperty('employer'),
        currentUserId: userId,
        currentUserIdString: userId,
        matches: job.employer === userId
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
router.get('/:jobId/applications', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: req.t('job.not_found')
        });
    }
    res.json({
        success: true,
        data: { applications: job.applications || [] }
    });
}));
router.put('/:jobId/applications/:applicationId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), [
    (0, express_validator_1.body)('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired', 'closed']).withMessage('Invalid status'),
    (0, express_validator_1.body)('notes').optional().trim()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId, applicationId } = req.params;
    const { status, notes } = req.body;
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: req.t('job.not_found')
        });
    }
    if (!job.applications)
        job.applications = [];
    const application = job.applications.find((app) => app._id === applicationId);
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
router.get('/:jobId/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { jobId } = req.params;
    const job = await db.get(jobId);
    if (!job) {
        return res.status(404).json({
            success: false,
            message: req.t('job.not_found')
        });
    }
    const applications = job.applications || [];
    const totalApplications = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
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
router.post('/admin/fix-employer-field', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin', 'employer'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { employerId, jobIds } = req.body;
    const { userId, user } = ensureAuth(req);
    if (!employerId || !jobIds || !Array.isArray(jobIds)) {
        return res.status(400).json({
            success: false,
            message: 'employerId and jobIds array are required'
        });
    }
    if (user.role === 'employer' && employerId !== userId) {
        return res.status(403).json({
            success: false,
            message: 'Employers can only assign jobs to themselves'
        });
    }
    const results = [];
    for (const jobId of jobIds) {
        try {
            const job = await db.get(jobId);
            if (job && job.type === 'job') {
                if (!job.employer) {
                    job.employer = employerId;
                    job.updatedAt = new Date();
                    const latest = await db.get(job._id);
                    job._rev = latest._rev;
                    await db.put(job);
                    results.push({ jobId, status: 'updated', title: job.title });
                }
                else {
                    results.push({ jobId, status: 'already-has-employer', employer: job.employer, title: job.title });
                }
            }
        }
        catch (error) {
            results.push({ jobId, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    res.json({
        success: true,
        message: 'Employer field fix operation completed',
        data: { results }
    });
}));
router.post('/fix-my-jobs', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = ensureAuth(req);
    const allJobs = await db.find({ selector: { type: 'job' } });
    const jobsToFix = allJobs.docs.filter((job) => job.type === 'job' && (!job.employer || job.employer === 'undefined' || job.employer === undefined));
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
            const job = await db.get(jobDoc._id);
            job.employer = userId;
            job.updatedAt = new Date();
            await db.put(job);
            results.push({
                jobId: job._id,
                status: 'updated',
                title: job.title,
                assignedTo: userId
            });
        }
        catch (error) {
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
exports.default = router;
//# sourceMappingURL=job.routes.js.map