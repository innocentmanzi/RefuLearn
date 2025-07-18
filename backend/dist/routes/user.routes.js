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
const upload_1 = __importDefault(require("../middleware/upload"));
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
const db = new pouchdb_1.default('http://Manzi:Clarisse101@localhost:5984/refulearn');
router.get('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { userId, user: authUser } = ensureAuth(req);
        console.log('📥 Profile GET request for user:', userId);
        console.log('🔍 Database connection status:', !!db);
        if (!db) {
            console.error('❌ Database not available for profile GET - returning fallback data');
            console.log('⚠️ This is why saved profile data is not loading!');
            const fallbackUser = {
                _id: userId,
                firstName: authUser.firstName || 'User',
                lastName: authUser.lastName || '',
                email: authUser.email || '',
                role: authUser.role || 'refugee',
                profilePic: '',
                education: [],
                experiences: [],
                certificates: []
            };
            console.log('📤 Returning fallback user data:', JSON.stringify(fallbackUser, null, 2));
            return res.json({
                success: true,
                data: { user: fallbackUser }
            });
        }
        console.log('✅ Database available, fetching real user data...');
        const user = await db.get(userId);
        const { password, ...userWithoutPassword } = user;
        console.log('✅ Real profile data fetched for user:', user.firstName);
        console.log('📤 Returning real user data:', JSON.stringify(userWithoutPassword, null, 2));
        res.json({
            success: true,
            data: { user: userWithoutPassword }
        });
    }
    catch (error) {
        console.error('❌ Error fetching user profile:', error);
        console.error('❌ Error details:', {
            message: error.message,
            error: error.error,
            status: error.status,
            stack: error.stack
        });
        if (error.error === 'not_found') {
            console.error('❌ User not found in database - this is the problem!');
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }
        console.error('❌ Database error occurred, returning fallback user data');
        console.error('⚠️ This is why your saved profile data is not showing up!');
        const { userId, user: authUser } = ensureAuth(req);
        const fallbackUser = {
            _id: userId,
            firstName: authUser.firstName || 'User',
            lastName: authUser.lastName || '',
            email: authUser.email || '',
            role: authUser.role || 'refugee',
            profilePic: '',
            education: [],
            experiences: [],
            certificates: []
        };
        console.log('📤 Returning fallback data due to error:', JSON.stringify(fallbackUser, null, 2));
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
    (0, express_validator_1.body)('social.linkedin').optional().custom((value) => {
        if (!value || value.trim() === '')
            return true;
        return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
    }),
    (0, express_validator_1.body)('social.twitter').optional().custom((value) => {
        if (!value || value.trim() === '')
            return true;
        return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
    }),
    (0, express_validator_1.body)('social.instagram').optional().custom((value) => {
        if (!value || value.trim() === '')
            return true;
        return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
    }),
    (0, express_validator_1.body)('social.facebook').optional().custom((value) => {
        if (!value || value.trim() === '')
            return true;
        return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
    }),
    (0, express_validator_1.body)('social.github').optional().custom((value) => {
        if (!value || value.trim() === '')
            return true;
        return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
    })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { userId } = ensureAuth(req);
        console.log('🔄 Profile update request for user:', userId);
        console.log('📝 Update data received:', JSON.stringify(req.body, null, 2));
        const updates = req.body;
        delete updates.email;
        delete updates.password;
        delete updates.role;
        console.log('📝 Processed updates:', JSON.stringify(updates, null, 2));
        if (!db) {
            console.error('❌ Database not available for profile update');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }
        const user = await db.get(userId);
        console.log('👤 Current user data:', JSON.stringify({ ...user, password: '[HIDDEN]' }, null, 2));
        Object.assign(user, updates);
        user.updatedAt = new Date();
        console.log('🔄 Updated user data before save:', JSON.stringify({ ...user, password: '[HIDDEN]' }, null, 2));
        const latest = await db.get(user._id);
        user._rev = latest._rev;
        const saveResult = await db.put(user);
        console.log('✅ User data saved successfully:', saveResult);
        const { password, ...userWithoutPassword } = user;
        console.log('📤 Sending response:', JSON.stringify(userWithoutPassword, null, 2));
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userWithoutPassword }
        });
    }
    catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
}));
router.post('/profile-picture', auth_1.authenticateToken, upload_1.default.single('profilePic'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            message: 'Please upload a profile picture'
        });
        return;
    }
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
    const { userId } = ensureAuth(req);
    const user = await db.get(userId);
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
        const { userId } = ensureAuth(req);
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