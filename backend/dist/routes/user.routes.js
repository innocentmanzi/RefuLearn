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
const upload_1 = __importDefault(require("../middleware/upload"));
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
const db = new pouchdb_1.default('http://Manzi:Clarisse101@localhost:5984/refulearn');
router.get('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        console.log('Profile endpoint called for user:', req.user?._id);
        if (!db) {
            console.warn('Database not available for profile, returning fallback user data');
            const fallbackUser = {
                _id: req.user._id,
                firstName: req.user.firstName || 'User',
                lastName: req.user.lastName || '',
                email: req.user.email || '',
                role: req.user.role || 'refugee',
                profilePic: '',
                education: [],
                experiences: [],
                certificates: []
            };
            return res.json({
                success: true,
                data: { user: fallbackUser }
            });
        }
        const user = await db.get(req.user._id.toString());
        const { password, ...userWithoutPassword } = user;
        console.log('Profile fetched successfully for user:', user.firstName);
        res.json({
            success: true,
            data: { user: userWithoutPassword }
        });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.error === 'not_found') {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }
        console.warn('Database error, returning fallback user data');
        const fallbackUser = {
            _id: req.user._id,
            firstName: req.user.firstName || 'User',
            lastName: req.user.lastName || '',
            email: req.user.email || '',
            role: req.user.role || 'refugee',
            profilePic: '',
            education: [],
            experiences: [],
            certificates: []
        };
        res.json({
            success: true,
            data: { user: fallbackUser }
        });
    }
}));
router.put('/profile', auth_1.authenticateToken, [
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('country').optional().trim(),
    (0, express_validator_1.body)('city').optional().trim(),
    (0, express_validator_1.body)('address').optional().trim(),
    (0, express_validator_1.body)('summary').optional().trim().isLength({ max: 1000 }),
    (0, express_validator_1.body)('languages').optional().isArray(),
    (0, express_validator_1.body)('skills').optional().isArray(),
    (0, express_validator_1.body)('interests').optional().isArray(),
    (0, express_validator_1.body)('social.linkedin').optional().isURL(),
    (0, express_validator_1.body)('social.twitter').optional().isURL(),
    (0, express_validator_1.body)('social.instagram').optional().isURL(),
    (0, express_validator_1.body)('social.facebook').optional().isURL(),
    (0, express_validator_1.body)('social.github').optional().isURL()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const updates = req.body;
    delete updates.email;
    delete updates.password;
    delete updates.role;
    const user = await db.get(req.user._id.toString());
    Object.assign(user, updates);
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: userWithoutPassword }
    });
}));
router.post('/profile-picture', auth_1.authenticateToken, upload_1.default.single('profilePic'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            message: 'Please upload a profile picture'
        });
        return;
    }
    const user = await db.get(req.user._id.toString());
    user.profilePic = req.file.path;
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { user: userWithoutPassword }
    });
}));
router.post('/education', auth_1.authenticateToken, [
    (0, express_validator_1.body)('institution').trim().notEmpty().withMessage('Institution is required'),
    (0, express_validator_1.body)('degree').trim().notEmpty().withMessage('Degree is required'),
    (0, express_validator_1.body)('field').trim().notEmpty().withMessage('Field is required'),
    (0, express_validator_1.body)('startDate').isISO8601().withMessage('Start date is required'),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await db.get(req.user._id.toString());
    if (!user.education)
        user.education = [];
    user.education.push({ ...req.body, _id: Date.now().toString() });
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Education added successfully',
        data: { user: userWithoutPassword }
    });
}));
router.put('/education/:educationId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('institution').optional().trim().notEmpty(),
    (0, express_validator_1.body)('degree').optional().trim().notEmpty(),
    (0, express_validator_1.body)('field').optional().trim().notEmpty(),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { educationId } = req.params;
    const updates = req.body;
    const user = await db.get(req.user._id.toString());
    if (!user.education)
        user.education = [];
    const edu = user.education.find((e) => e._id === educationId);
    if (!edu) {
        res.status(404).json({
            success: false,
            message: 'Education record not found'
        });
        return;
    }
    Object.assign(edu, updates);
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Education updated successfully',
        data: { user: userWithoutPassword }
    });
}));
router.delete('/education/:educationId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { educationId } = req.params;
    const user = await db.get(req.user._id.toString());
    if (!user.education)
        user.education = [];
    user.education = user.education.filter((e) => e._id !== educationId);
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Education deleted successfully',
        data: { user: userWithoutPassword }
    });
}));
router.post('/experience', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('company').trim().notEmpty().withMessage('Company is required'),
    (0, express_validator_1.body)('location').trim().notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('startDate').isISO8601().withMessage('Start date is required'),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('skills').optional().isArray()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await db.get(req.user._id.toString());
    if (!user.experiences)
        user.experiences = [];
    user.experiences.push({ ...req.body, _id: Date.now().toString() });
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Experience added successfully',
        data: { user: userWithoutPassword }
    });
}));
router.put('/experience/:experienceId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('company').optional().trim().notEmpty(),
    (0, express_validator_1.body)('location').optional().trim().notEmpty(),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('skills').optional().isArray()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { experienceId } = req.params;
    const updates = req.body;
    const user = await db.get(req.user._id.toString());
    if (!user.experiences)
        user.experiences = [];
    const exp = user.experiences.find((e) => e._id === experienceId);
    if (!exp) {
        res.status(404).json({
            success: false,
            message: 'Experience record not found'
        });
        return;
    }
    Object.assign(exp, updates);
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Experience updated successfully',
        data: { user: userWithoutPassword }
    });
}));
router.delete('/experience/:experienceId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { experienceId } = req.params;
    const user = await db.get(req.user._id.toString());
    if (!user.experiences)
        user.experiences = [];
    user.experiences = user.experiences.filter((e) => e._id !== experienceId);
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Experience deleted successfully',
        data: { user: userWithoutPassword }
    });
}));
router.post('/certificate', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Certificate name is required'),
    (0, express_validator_1.body)('issuer').trim().notEmpty().withMessage('Issuer is required'),
    (0, express_validator_1.body)('issueDate').isISO8601().withMessage('Issue date is required'),
    (0, express_validator_1.body)('expiryDate').optional().isISO8601()
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await db.get(req.user._id.toString());
    if (!user.certificates)
        user.certificates = [];
    user.certificates.push({ ...req.body, _id: Date.now().toString() });
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Certificate added successfully',
        data: { user: userWithoutPassword }
    });
}));
router.delete('/certificate/:certificateId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { certificateId } = req.params;
    const user = await db.get(req.user._id.toString());
    if (!user.certificates)
        user.certificates = [];
    user.certificates = user.certificates.filter((c) => c._id !== certificateId);
    user.updatedAt = new Date();
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Certificate deleted successfully',
        data: { user: userWithoutPassword }
    });
}));
router.get('/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await db.get(req.params.userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        data: { user: userWithoutPassword }
    });
}));
router.put('/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('role').optional().isIn(['admin', 'instructor', 'employer', 'refugee'])
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
    await db.put(user);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: userWithoutPassword }
    });
}));
router.post('/track-activity', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { activity_type, course_id, details } = req.body;
        const user = await db.get(userId);
        if (user) {
            user.lastActivity = new Date();
            user.lastLogin = new Date();
            if (!user.activityLog) {
                user.activityLog = [];
            }
            user.activityLog.push({
                type: activity_type || 'platform_usage',
                timestamp: new Date(),
                courseId: course_id || null,
                details: details || 'User activity tracked'
            });
            if (user.activityLog.length > 100) {
                user.activityLog = user.activityLog.slice(-100);
            }
            user.updatedAt = new Date();
            const latest = await db.get(user._id);
            user._rev = latest._rev;
            await db.put(user);
        }
        res.json({
            success: true,
            message: 'Activity tracked successfully'
        });
    }
    catch (error) {
        console.error('Error tracking user activity:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to track activity'
        });
    }
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map