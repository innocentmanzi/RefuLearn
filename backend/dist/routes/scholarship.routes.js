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
const upload_1 = require("../middleware/upload");
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
const db = new pouchdb_1.default('http://Manzi:Clarisse101@localhost:5984/refulearn');
const ensureAuth = (req) => {
    if (!req.user?._id)
        throw new Error('User authentication required');
    return { userId: req.user._id.toString(), user: req.user };
};
router.get('/', [
    (0, express_validator_1.query)('deadline').optional().isISO8601(),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { deadline, search, page = 1, limit = 10 } = req.query;
    const selector = { type: 'scholarship', isActive: true };
    if (deadline) {
        selector.deadline = { $gte: new Date(deadline) };
    }
    const result = await db.find({ selector });
    let scholarships = result.docs;
    if (search) {
        const s = search.toLowerCase();
        scholarships = scholarships.filter((scholarship) => scholarship.title?.toLowerCase().includes(s) ||
            scholarship.description?.toLowerCase().includes(s) ||
            scholarship.provider?.toLowerCase().includes(s) ||
            scholarship.location?.toLowerCase().includes(s));
    }
    scholarships = scholarships.map((scholarship) => ({
        ...scholarship,
        daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));
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
router.get('/:scholarshipId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const scholarship = await db.get(req.params['scholarshipId']);
        const scholarshipWithDays = {
            ...scholarship,
            daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        };
        res.json({
            success: true,
            data: { scholarship: scholarshipWithDays }
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
    }
}));
router.post('/:scholarshipId/apply', auth_1.authenticateToken, upload_1.uploadAny, upload_1.handleUploadError, [
    (0, express_validator_1.body)('essayReason').trim().notEmpty().withMessage('Essay explaining why you are applying is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const { essayReason } = req.body;
    const { userId } = ensureAuth(req);
    const files = req.files;
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
    const scholarship = await db.get(scholarshipId);
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
    const alreadyApplied = scholarship.applications.some((app) => app.applicant === userId);
    if (alreadyApplied) {
        return res.status(400).json({
            success: false,
            message: 'You have already applied for this scholarship'
        });
    }
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
router.get('/debug/user-applications', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
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
        scholarshipsWithApplications: scholarships.filter((s) => s.applications && s.applications.length > 0).length,
        allApplications: scholarships.map((s) => ({
            scholarshipId: s._id,
            scholarshipTitle: s.title,
            applications: s.applications || []
        })).filter(s => s.applications.length > 0)
    };
    res.json(debug);
}));
router.get('/applications/user', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const { userId, user } = ensureAuth(req);
    const result = await db.find({
        selector: {
            type: 'scholarship'
        }
    });
    const scholarships = result.docs;
    const applications = scholarships
        .filter((scholarship) => scholarship.applications &&
        scholarship.applications.length > 0)
        .flatMap((scholarship) => {
        return scholarship.applications.map((application) => ({
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
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('provider').trim().notEmpty().withMessage('Provider is required'),
    (0, express_validator_1.body)('location').trim().notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('benefits').trim().notEmpty().withMessage('Benefits are required'),
    (0, express_validator_1.body)('link').trim().notEmpty().withMessage('Application link is required'),
    (0, express_validator_1.body)('requirements').optional().isArray().withMessage('Requirements must be an array'),
    (0, express_validator_1.body)('deadline').isISO8601().withMessage('Valid deadline is required'),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
    const scholarship = {
        ...req.body,
        _id: Date.now().toString(),
        type: 'scholarship',
        employer: userId,
        applications: [],
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
router.put('/:scholarshipId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('provider').optional().trim().notEmpty(),
    (0, express_validator_1.body)('location').optional().trim().notEmpty(),
    (0, express_validator_1.body)('benefits').optional().trim().notEmpty(),
    (0, express_validator_1.body)('link').optional().trim().notEmpty(),
    (0, express_validator_1.body)('requirements').optional().isArray(),
    (0, express_validator_1.body)('deadline').optional().isISO8601(),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const updates = req.body;
    const { userId, user } = ensureAuth(req);
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
        return;
    }
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
router.delete('/:scholarshipId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const { userId, user } = ensureAuth(req);
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
        return;
    }
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
router.get('/employer/scholarships', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const { userId, user } = ensureAuth(req);
    const skip = (Number(page) - 1) * Number(limit);
    const query = { type: 'scholarship', employer: userId };
    if (status) {
        query.isActive = status === 'active';
    }
    const result = await db.find({ selector: query });
    let scholarships = result.docs;
    scholarships = scholarships.map((scholarship) => ({
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
router.get('/:scholarshipId/applications', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const { userId, user } = ensureAuth(req);
    const skip = (Number(page) - 1) * Number(limit);
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
        return;
    }
    if (scholarship.employer !== userId && user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'You can only view applications for your own scholarships'
        });
        return;
    }
    let applications = scholarship.applications || [];
    if (status) {
        applications = applications.filter((app) => app.status === status);
    }
    const paginatedApplications = applications.slice(skip, skip + Number(limit));
    const enrichedApplications = await Promise.all(paginatedApplications.map(async (app) => {
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
        catch (err) {
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
router.put('/:scholarshipId/applications/:applicationId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), [
    (0, express_validator_1.body)('status').isIn(['pending', 'accepted', 'rejected', 'shortlisted', 'reviewed', 'hired', 'closed']).withMessage('Invalid status'),
    (0, express_validator_1.body)('feedback').optional().trim()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId, applicationId } = req.params;
    const { status, feedback } = req.body;
    const { userId, user } = ensureAuth(req);
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
        return;
    }
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
    const application = scholarship.applications.find((app) => app._id === applicationId);
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
router.get('/:scholarshipId/analytics', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('employer', 'admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const { userId, user } = ensureAuth(req);
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        res.status(404).json({
            success: false,
            message: 'Scholarship not found'
        });
        return;
    }
    if (scholarship.employer !== userId && user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'You can only view analytics for your own scholarships'
        });
        return;
    }
    const applications = scholarship.applications || [];
    const totalApplications = applications.length;
    const pendingApplications = applications.filter((app) => app.status === 'pending').length;
    const acceptedApplications = applications.filter((app) => app.status === 'accepted').length;
    const rejectedApplications = applications.filter((app) => app.status === 'rejected').length;
    const shortlistedApplications = applications.filter((app) => app.status === 'shortlisted').length;
    const statusCounts = applications.reduce((acc, app) => {
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
router.post('/admin', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('provider').trim().notEmpty().withMessage('Provider is required'),
    (0, express_validator_1.body)('location').trim().notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('benefits').trim().notEmpty().withMessage('Benefits are required'),
    (0, express_validator_1.body)('link').trim().notEmpty().withMessage('Application link is required'),
    (0, express_validator_1.body)('employer').notEmpty().withMessage('Valid employer ID is required'),
    (0, express_validator_1.body)('deadline').optional().isISO8601(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
    const scholarship = {
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
router.get('/admin/all', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
    const result = await db.find({ selector: { type: 'scholarship' } });
    const scholarships = result.docs;
    const populatedScholarships = await Promise.all(scholarships.map(async (scholarship) => {
        try {
            const employer = await db.get(scholarship.employer);
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
        }
        catch (err) {
            return {
                ...scholarship,
                daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            };
        }
    }));
    res.json({ success: true, data: { scholarships: populatedScholarships } });
}));
router.get('/admin/:scholarshipId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, user } = ensureAuth(req);
    const scholarship = await db.get(req.params.scholarshipId);
    if (!scholarship) {
        return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }
    try {
        const employer = await db.get(scholarship.employer);
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
    }
    catch (err) {
        const scholarshipWithDays = {
            ...scholarship,
            daysRemaining: Math.ceil((new Date(scholarship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        };
        res.json({ success: true, data: { scholarship: scholarshipWithDays } });
    }
}));
router.put('/admin/:scholarshipId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('provider').optional().trim().notEmpty(),
    (0, express_validator_1.body)('location').optional().trim().notEmpty(),
    (0, express_validator_1.body)('benefits').optional().trim().notEmpty(),
    (0, express_validator_1.body)('link').optional().trim().notEmpty(),
    (0, express_validator_1.body)('deadline').optional().isISO8601(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const updates = req.body;
    const { userId, user } = ensureAuth(req);
    const scholarship = await db.get(scholarshipId);
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
router.delete('/admin/:scholarshipId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { scholarshipId } = req.params;
    const { userId, user } = ensureAuth(req);
    const scholarship = await db.get(scholarshipId);
    if (!scholarship) {
        return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }
    const latest = await db.get(scholarship._id);
    await db.remove(latest);
    res.json({ success: true, message: 'Scholarship deleted successfully' });
}));
exports.default = router;
//# sourceMappingURL=scholarship.routes.js.map