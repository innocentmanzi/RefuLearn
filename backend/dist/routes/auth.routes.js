"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const email_1 = require("../config/email");
const multer_1 = __importDefault(require("multer"));
const pouchdb_1 = __importDefault(require("pouchdb"));
const pouchdb_find_1 = __importDefault(require("pouchdb-find"));
const couchdb_1 = require("../config/couchdb");
const t = (msg) => msg;
const router = express_1.default.Router();
pouchdb_1.default.plugin(pouchdb_find_1.default);
let couchConnection = null;
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing CouchDB connection for auth routes...');
        couchConnection = await (0, couchdb_1.connectCouchDB)();
        console.log('✅ Auth routes database connection successful!');
        return true;
    }
    catch (error) {
        console.error('❌ Auth routes database connection failed:', error.message);
        return false;
    }
};
initializeDatabase();
const ensureDb = async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (!couchConnection) {
                console.log(`⚠️ Database not available, reinitializing... (attempt ${attempt}/${retries})`);
                const connectionSuccess = await initializeDatabase();
                if (!connectionSuccess || !couchConnection) {
                    throw new Error('Database connection failed');
                }
            }
            const database = couchConnection.getDatabase();
            await database.info();
            return database;
        }
        catch (error) {
            console.log(`❌ Database connection attempt ${attempt} failed:`, error.message);
            couchConnection = null;
            if (attempt === retries) {
                throw new Error(`Database connection failed after ${retries} attempts: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    throw new Error('Database connection failed');
};
const registerValidation = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    (0, express_validator_1.body)('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match')
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
async function getNextUserId(database) {
    const COUNTER_ID = 'user_id_counter';
    let retries = 5;
    while (retries > 0) {
        try {
            let counterDoc;
            try {
                counterDoc = await database.get(COUNTER_ID);
                counterDoc.value += 1;
            }
            catch (err) {
                counterDoc = { _id: COUNTER_ID, value: 1 };
            }
            await database.insert(counterDoc);
            return counterDoc.value;
        }
        catch (err) {
            if (err.statusCode === 409) {
                retries--;
                continue;
            }
            throw err;
        }
    }
    throw new Error('Failed to get next user ID after several retries');
}
router.post('/register', (0, validation_1.validate)(registerValidation), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const database = await ensureDb();
    try {
        const existingUser = await database.view('users', 'byEmail', {
            key: email,
            include_docs: true
        });
        if (existingUser.rows.length > 0) {
            console.log('User already exists:', email);
            res.status(400).json({ message: t('auth:user_exists') });
            return;
        }
    }
    catch (error) {
        console.log('Error checking existing user:', error.message);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    console.log(`OTP for ${email}: ${otp}`);
    const userId = await getNextUserId(database);
    const userDoc = {
        _id: userId.toString(),
        firstName,
        lastName,
        email,
        password,
        isEmailVerified: false,
        otp,
        otpExpires,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'user',
        userId,
        role: ['refugee', 'instructor', 'employer'].includes(req.body.role) ? req.body.role : 'refugee'
    };
    await database.insert(userDoc);
    const userResponse = {
        id: userId,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        email: userDoc.email,
        isEmailVerified: userDoc.isEmailVerified,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
        role: userDoc.role
    };
    res.status(201).json({
        message: 'One time password verification code sent to your email.',
        user: userResponse
    });
    (0, email_1.sendOTPEmail)(email, otp).catch((err) => {
        console.log('Failed to send OTP email (async):', err);
    });
}));
router.post('/verify-otp', [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('otp').isLength({ min: 6, max: 6 })
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp } = req.body;
    const database = await ensureDb();
    let user = null;
    try {
        const userResult = await database.view('users', 'byEmail', {
            key: email,
            include_docs: true
        });
        user = userResult.rows[0]?.doc;
    }
    catch (error) {
        console.log('Error searching for user:', error.message);
    }
    if (!user) {
        res.status(400).json({ message: t('auth:user_not_found') });
        return;
    }
    if (user.isEmailVerified) {
        res.status(400).json({ message: t('auth:already_verified') });
        return;
    }
    if (user.otp !== otp || !user.otpExpires || new Date(user.otpExpires) < new Date()) {
        res.status(400).json({ message: t('auth:invalid_otp') });
        return;
    }
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    res.json({ message: 'Verification email is successful.' });
}));
const refreshTokens = new Set();
function generateTokens(user) {
    const secret = String(process.env['JWT_SECRET'] || 'fallback-secret');
    const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '24h' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '7d' });
    refreshTokens.add(refreshToken);
    return { accessToken, refreshToken };
}
router.post('/login', (0, validation_1.validate)(loginValidation), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for email:', email);
    console.log('🔐 Password provided:', password ? '[REDACTED]' : 'NO PASSWORD');
    let database;
    try {
        database = await ensureDb();
        console.log('✅ Database connection established for login');
    }
    catch (dbError) {
        console.error('❌ Database connection failed during login:', dbError.message);
        res.status(500).json({
            success: false,
            message: 'Database connection error. Please try again later.'
        });
        return;
    }
    let user = null;
    try {
        const userResult = await database.view('users', 'byEmail', {
            key: email,
            include_docs: true
        });
        console.log('🔍 View search result:', {
            found: userResult.rows.length,
            emails: userResult.rows.map((row) => row.doc?.email)
        });
        user = userResult.rows[0]?.doc;
    }
    catch (error) {
        console.log('⚠️ View search failed, trying direct search:', error.message);
        try {
            const allDocsResult = await database.list({ include_docs: true });
            const users = allDocsResult.rows
                .map((row) => row.doc)
                .filter((doc) => doc && doc.type === 'user' && doc.email === email);
            user = users[0];
            console.log('🔍 Direct search result:', { found: users.length, email: user?.email });
        }
        catch (directError) {
            console.log('❌ Direct search also failed:', directError.message);
        }
    }
    if (!user) {
        console.log('❌ No user found with email:', email);
        res.status(401).json({ success: false, message: t('auth:invalid_credentials') });
        return;
    }
    console.log('👤 User found:', {
        _id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        hasPassword: !!user.password,
        passwordLength: user.password?.length
    });
    if (!user.isEmailVerified) {
        console.log('❌ Email not verified for user:', user.email);
        res.status(403).json({ success: false, message: t('auth:verify_first') });
        return;
    }
    console.log('🔑 Password check - provided:', password, 'stored:', user.password);
    if (user.password !== password) {
        console.log('❌ Password mismatch for user:', user.email);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
    }
    console.log('✅ Login successful for user:', user.email);
    user.lastLogin = new Date();
    try {
        const latest = await database.get(user._id);
        user._rev = latest._rev;
        await database.insert(user);
    }
    catch (updateError) {
        console.log('⚠️ Could not update lastLogin:', updateError.message);
    }
    const userResponse = {
        _id: user._id,
        id: parseInt(user._id, 10),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role
    };
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: userResponse,
            accessToken,
            refreshToken
        }
    });
}));
router.get('/me', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const user = await database.get(req.user._id);
    const { password, ...userWithoutPassword } = user;
    res.json({
        success: true,
        data: { user: userWithoutPassword }
    });
}));
router.post('/logout', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    if (refreshTokens.has(refresh_token)) {
        refreshTokens.delete(refresh_token);
        return res.json({ success: true, message: 'Logged out successfully' });
    }
    else {
        return res.status(400).json({ success: false, message: 'Invalid refresh token' });
    }
}));
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], (0, validation_1.validate)([(0, express_validator_1.body)('email')]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const database = await ensureDb();
    let user = null;
    try {
        const userResult = await database.view('users', 'byEmail', {
            key: email,
            include_docs: true
        });
        user = userResult.rows[0]?.doc;
    }
    catch (error) {
        console.log('Error searching for user:', error.message);
    }
    if (!user) {
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
        return;
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    res.json({
        success: true,
        message: 'Password reset email sent',
        data: {
            resetToken: process.env['NODE_ENV'] === 'development' ? resetToken : undefined
        }
    });
}));
router.post('/reset-password/:token', [
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], (0, validation_1.validate)([(0, express_validator_1.body)('password')]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const database = await ensureDb();
    const resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(token)
        .digest('hex');
    let user = null;
    try {
        const allUsers = await database.list({ include_docs: true });
        const users = allUsers.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'user' && doc.resetPasswordToken === resetPasswordToken);
        const validUsers = users.filter((doc) => doc.resetPasswordExpires && new Date(doc.resetPasswordExpires) > new Date());
        user = validUsers[0];
    }
    catch (error) {
        console.log('Error searching for user by reset token:', error.message);
    }
    if (!user) {
        res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
        return;
    }
    user.password = password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    res.json({
        success: true,
        message: 'Password reset successful'
    });
}));
router.post('/change-password', auth_1.authenticateToken, [
    (0, express_validator_1.body)('old_password').notEmpty().withMessage('Old password is required'),
    (0, express_validator_1.body)('new_password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (0, express_validator_1.body)('confirm_new_password').custom((value, { req }) => value === req.body.new_password).withMessage('Passwords do not match')
], (0, validation_1.validate)([(0, express_validator_1.body)('old_password'), (0, express_validator_1.body)('new_password'), (0, express_validator_1.body)('confirm_new_password')]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { old_password, new_password } = req.body;
    const database = await ensureDb();
    const user = await database.get(req.user._id);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    if (user.password !== old_password) {
        res.status(400).json({ success: false, message: 'Old password is incorrect' });
        return;
    }
    user.password = new_password;
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    res.json({ success: true, message: 'Password changed successfully' });
}));
router.get('/settings', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const user = await database.get(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const settings = {
        email: user.email,
        language: user.language_preference || 'en',
        timezone: user.timezone || 'UTC+2',
        notifications: {
            email: user.notifications?.email ?? true,
            push: user.notifications?.push ?? false,
            sms: user.notifications?.sms ?? false,
            courseUpdates: user.notifications?.courseUpdates ?? true,
            newMessages: user.notifications?.newMessages ?? true,
            jobAlerts: user.notifications?.jobAlerts ?? false,
            newsletter: user.notifications?.newsletter ?? true
        },
        privacy: {
            profileVisibility: user.privacy?.profileVisibility || 'public',
            showEmail: user.privacy?.showEmail ?? false,
            showPhone: user.privacy?.showPhone ?? false,
            allowMessages: user.privacy?.allowMessages ?? true
        }
    };
    res.json({ success: true, data: { settings } });
}));
router.put('/settings', auth_1.authenticateToken, [
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.body)('language').optional().isIn(['en', 'fr', 'ar', 'sw']).withMessage('Invalid language'),
    (0, express_validator_1.body)('timezone').optional().isString().withMessage('Invalid timezone'),
    (0, express_validator_1.body)('notifications').optional().isObject().withMessage('Notifications must be an object'),
    (0, express_validator_1.body)('privacy').optional().isObject().withMessage('Privacy must be an object')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const user = await database.get(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { email, language, timezone, notifications, privacy } = req.body;
    if (email !== undefined)
        user.email = email;
    if (language !== undefined)
        user.language_preference = language;
    if (timezone !== undefined)
        user.timezone = timezone;
    if (notifications) {
        user.notifications = {
            ...user.notifications,
            ...notifications
        };
    }
    if (privacy) {
        user.privacy = {
            ...user.privacy,
            ...privacy
        };
    }
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    const updatedSettings = {
        email: user.email,
        language: user.language_preference || 'en',
        timezone: user.timezone || 'UTC+2',
        notifications: {
            email: user.notifications?.email ?? true,
            push: user.notifications?.push ?? false,
            sms: user.notifications?.sms ?? false,
            courseUpdates: user.notifications?.courseUpdates ?? true,
            newMessages: user.notifications?.newMessages ?? true,
            jobAlerts: user.notifications?.jobAlerts ?? false,
            newsletter: user.notifications?.newsletter ?? true
        },
        privacy: {
            profileVisibility: user.privacy?.profileVisibility || 'public',
            showEmail: user.privacy?.showEmail ?? false,
            showPhone: user.privacy?.showPhone ?? false,
            allowMessages: user.privacy?.allowMessages ?? true
        }
    };
    res.json({
        success: true,
        message: 'Settings updated successfully',
        data: { settings: updatedSettings }
    });
}));
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.patch('/profile', auth_1.authenticateToken, upload.single('profile_picture'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const user = await database.get(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const forbiddenFields = ['_id', '_rev', 'type', 'password', 'createdAt', 'userId', 'email', 'isEmailVerified', 'otp', 'otpExpires', 'resetPasswordToken', 'resetPasswordExpires'];
    Object.keys(req.body).forEach(field => {
        if (!forbiddenFields.includes(field)) {
            user[field] = req.body[field];
        }
    });
    if (req.file) {
        user.profilePic = req.file.path;
    }
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, message: 'Profile updated successfully', data: userWithoutPassword });
}));
router.get('/users', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    let users = [];
    try {
        const allUsers = await database.list({ include_docs: true });
        users = allUsers.rows
            .map((row) => row.doc)
            .filter((doc) => doc && doc.type === 'user')
            .map((user) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    catch (error) {
        console.log('Error listing users:', error.message);
    }
    res.json({ success: true, data: { users } });
}));
router.get('/users/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const database = await ensureDb();
    const user = await database.get(req.params.userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, data: { user: userWithoutPassword } });
}));
router.put('/users/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), [
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('role').optional().isIn(['admin', 'instructor', 'employer', 'refugee']).withMessage('Invalid role')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;
    const database = await ensureDb();
    const user = await database.get(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    Object.assign(user, updates);
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, message: 'User updated successfully', data: { user: userWithoutPassword } });
}));
router.delete('/users/:userId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const database = await ensureDb();
    const user = await database.get(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.remove(user);
    res.json({ success: true, message: 'User deleted successfully' });
}));
router.put('/users/:userId/role', auth_1.authenticateToken, (0, auth_1.authorizeRoles)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const allowedRoles = ['refugee', 'instructor', 'employer', 'admin'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const database = await ensureDb();
    const user = await database.get(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.role = role;
    user.updatedAt = new Date();
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
    res.json({ success: true, message: 'User role updated', data: { userId, role } });
}));
router.post('/refresh-token', [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required')
], (0, validation_1.validate)([]), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    if (!refreshTokens.has(refreshToken)) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
    try {
        const secret = String(process.env['JWT_SECRET'] || 'fallback-secret');
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
        refreshTokens.delete(refreshToken);
        const database = await ensureDb();
        const user = await database.get(decoded.userId);
        if (!user || user.type !== 'user' || user.isActive === false) {
            return res.status(403).json({ success: false, message: 'User not found or inactive' });
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
        return res.json({
            success: true,
            message: 'Token refreshed',
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map