import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';


// Use proper authenticated request type
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  body: any;
}

// Helper function to ensure user authentication
const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user?._id) {
    throw new Error('User authentication required');
  }
  return {
    userId: req.user._id.toString(),
    user: req.user as NonNullable<AuthenticatedRequest['user']>
  };
};
import { body } from 'express-validator';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticateToken, authorizeSelfOrAdmin, authorizeRoles, blacklistedAccessTokens } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { sendOTPEmail } from '../config/email';
import { uploadProfilePic } from '../middleware/upload';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { getRedisClient } from '../config/redis';
import { connectCouchDB } from '../config/couchdb';

// Fallback translation function
const t = (msg: string) => msg;

const router = express.Router();

PouchDB.plugin(PouchDBFind);

// Use proper CouchDB connection with authentication
let couchConnection: any = null;

// Initialize proper database connection
const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing CouchDB connection for auth routes...');
    
    couchConnection = await connectCouchDB();
    
    console.log('✅ Auth routes database connection successful!');
    
    return true;
  } catch (error: any) {
    console.error('❌ Auth routes database connection failed:', error.message);
    return false;
  }
};

// Initialize database connection
initializeDatabase();

// Helper function to ensure database is available with retry logic
const ensureDb = async (retries = 3): Promise<any> => {
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
      
      // Test the connection with a simple operation
      await database.info();
      
      return database;
    } catch (error: any) {
      console.log(`❌ Database connection attempt ${attempt} failed:`, error.message);
      
      // Reset connection on failure
      couchConnection = null;
      
      if (attempt === retries) {
        throw new Error(`Database connection failed after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Database connection failed');
};

interface UserDoc {
  _id: string;
  _rev?: string;
  type: 'user';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  isEmailVerified?: boolean;
  otp?: string;
  otpExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  profilePic?: string;
  bio?: string;
  phone_number?: string;
  dob?: string;
  language_preference?: string;
  gender?: string;
  education_level?: string;
  camp?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  lastLogin?: Date;
  [key: string]: any;
}

// Register validation
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper to get next user ID (auto-increment) with retry logic
async function getNextUserId(database: any): Promise<number> {
  const COUNTER_ID = 'user_id_counter';
  let retries = 5;
  while (retries > 0) {
    try {
      let counterDoc: any;
      try {
        counterDoc = await database.get(COUNTER_ID);
        counterDoc.value += 1;
      } catch (err) {
        // If not found, create it
        counterDoc = { _id: COUNTER_ID, value: 1 };
      }
      await database.insert(counterDoc);
      return counterDoc.value;
    } catch (err: any) {
      if (err.statusCode === 409) {
        // Conflict, retry
        retries--;
        continue;
      }
      throw err;
    }
  }
  throw new Error('Failed to get next user ID after several retries');
}

// Register route
router.post('/register', validate(registerValidation), asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const database = await ensureDb();

  // Check if user already exists using the byEmail view
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
  } catch (error: any) {
    console.log('Error checking existing user:', error.message);
    // If view doesn't exist, continue - user doesn't exist
  }

  // Hash the password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Log OTP to terminal for development/testing
  console.log(`OTP for ${email}: ${otp}`);

  // Only save user, send email after response
  const userId = await getNextUserId(database);
  const userDoc: any = {
    _id: userId.toString(),
    firstName,
    lastName,
    email,
    password: hashedPassword, // Store hashed password
    isEmailVerified: false,
    otp,
    otpExpires,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'user',
    userId, // integer id for client use
    role: ['refugee', 'instructor', 'employer'].includes(req.body.role) ? req.body.role : 'refugee'
  };
  await database.insert(userDoc);

  // Prepare user response (exclude password, otp, otpExpires)
  const userResponse = {
    id: userId,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    email: userDoc.email,
    isEmailVerified: userDoc.isEmailVerified,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
    role: userDoc.role
    // add other non-sensitive fields as needed
  };

  res.status(201).json({
    message: 'One time password verification code sent to your email.',
    user: userResponse
  });

  // Send OTP email asynchronously (after response)
  sendOTPEmail(email, otp).catch((err) => {
    console.log('Failed to send OTP email (async):', err);
  });
}));

// OTP verification
router.post('/verify-otp', [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 })
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const database = await ensureDb();
  let user: any = null;
  try {
    const userResult = await database.view('users', 'byEmail', { 
      key: email,
      include_docs: true 
    });
    user = userResult.rows[0]?.doc;
  } catch (error: any) {
    console.log('Error searching for user:', error.message);
  }
  if (!user) {
    res.status(400).json({ message: t('auth:user_not_found') });
    return;
  }
  if ((user as any).isEmailVerified) {
    res.status(400).json({ message: t('auth:already_verified') });
    return;
  }
  if ((user as any).otp !== otp || !(user as any).otpExpires || new Date((user as any).otpExpires) < new Date()) {
    res.status(400).json({ message: t('auth:invalid_otp') });
    return;
  }
  (user as any).isEmailVerified = true;
  (user as any).otp = null;
  (user as any).otpExpires = null;
  (user as any).updatedAt = new Date();
  // Fetch latest _rev for update
  const latest = await database.get(user._id);
  user._rev = latest._rev;
  await database.insert(user);
  res.json({ message: 'Verification email is successful.' });
}));

// Example: In-memory refresh token store (replace with your actual logic)
const refreshTokens = new Set();

function generateTokens(user: any) {
  const secret = String(process.env['JWT_SECRET'] || 'fallback-secret');
  const accessToken = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '7d' });
  refreshTokens.add(refreshToken);
  return { accessToken, refreshToken };
}

// Updated login route
router.post('/login', validate(loginValidation), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt for email:', email);
  console.log('🔐 Password provided:', password ? '[REDACTED]' : 'NO PASSWORD');
  
  let database;
  try {
    database = await ensureDb();
    console.log('✅ Database connection established for login');
  } catch (dbError: any) {
    console.error('❌ Database connection failed during login:', dbError.message);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection error. Please try again later.' 
    });
    return;
  }
  
  let user: any = null;
  
  // Try using view first, fall back to direct search if auth fails
  try {
    const userResult = await database.view('users', 'byEmail', { 
      key: email,
      include_docs: true 
    });
    
    console.log('🔍 View search result:', { 
      found: userResult.rows.length, 
      emails: userResult.rows.map((row: any) => row.doc?.email) 
    });
    
    user = userResult.rows[0]?.doc;
  } catch (error: any) {
    console.log('⚠️ View search failed, trying direct search:', error.message);
    
    // Fallback: Direct document search when views fail due to auth
    try {
      const allDocsResult = await database.list({ include_docs: true });
      const users = allDocsResult.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'user' && doc.email === email);
      
      user = users[0];
      console.log('🔍 Direct search result:', { found: users.length, email: user?.email });
    } catch (directError: any) {
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
  
  // Compare password using bcrypt or plain text (for backward compatibility)
  let isPasswordValid = false;
  
  // First try bcrypt comparison (for new hashed passwords)
  try {
    isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Bcrypt comparison result:', isPasswordValid);
  } catch (bcryptError) {
    console.log('⚠️ Bcrypt comparison failed, trying plain text:', bcryptError.message);
  }
  
  // If bcrypt fails, try plain text comparison (for old passwords)
  if (!isPasswordValid) {
    isPasswordValid = password === user.password;
    console.log('🔐 Plain text comparison result:', isPasswordValid);
    
    // If plain text works, hash the password for future use
    if (isPasswordValid) {
      console.log('🔄 Updating plain text password to hashed version...');
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;
        user.updatedAt = new Date();
        
        const latest = await database.get(user._id);
        user._rev = latest._rev;
        await database.insert(user);
        console.log('✅ Password successfully hashed and updated');
      } catch (hashError: any) {
        console.log('⚠️ Could not hash password:', hashError.message);
        // Continue with login even if hashing fails
      }
    }
  }
  
  if (!isPasswordValid) {
    console.log('❌ Password mismatch for user:', user.email);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }
  
  console.log('✅ Login successful for user:', user.email);
  // Update lastLogin timestamp
  user.lastLogin = new Date();
  try {
    const latest = await database.get(user._id);
    user._rev = latest._rev;
    await database.insert(user);
  } catch (updateError: any) {
    console.log('⚠️ Could not update lastLogin:', updateError.message);
    // Don't fail login just because we couldn't update lastLogin
  }
  
  const userResponse = {
    _id: user._id, // Include _id for frontend compatibility
    id: parseInt(user._id, 10),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role
    // add other non-sensitive fields as needed
  };
  // Generate tokens
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

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
  const { password, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
}));

// Logout route (invalidate refresh token)
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }
  if (refreshTokens.has(refresh_token)) {
    refreshTokens.delete(refresh_token);
    return res.json({ success: true, message: 'Logged out successfully' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid refresh token' });
  }
}));

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], validate([body('email')]), asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const database = await ensureDb();
  let user: UserDoc | null = null;
  try {
    const userResult = await database.view('users', 'byEmail', { 
      key: email,
      include_docs: true 
    });
    user = userResult.rows[0]?.doc as UserDoc;
  } catch (error: any) {
    console.log('Error searching for user:', error.message);
  }
  if (!user) {
    // Don't reveal if email exists or not
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.updatedAt = new Date();

  const latest = await database.get(user._id);
  user._rev = latest._rev;
  await database.insert(user);

  // TODO: Send email with reset link
  // For now, just return the token (in production, send via email)
  res.json({
    success: true,
    message: 'Password reset email sent',
    data: {
      resetToken: process.env['NODE_ENV'] === 'development' ? resetToken : undefined
    }
  });
}));

// Reset password
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], validate([body('password')]), asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const database = await ensureDb();

  // Hash the token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token as string)
    .digest('hex');

  // For reset password, we need to search all users since there's no view for resetPasswordToken
  // This is a temporary solution - ideally we'd create a view for this
  let user: UserDoc | null = null;
  try {
    const allUsers = await database.list({ include_docs: true });
    const users = allUsers.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'user' && doc.resetPasswordToken === resetPasswordToken);
    
    // Filter by expiration manually
    const validUsers = users.filter((doc: any) => 
      doc.resetPasswordExpires && new Date(doc.resetPasswordExpires) > new Date()
    );
    user = validUsers[0] as UserDoc;
  } catch (error: any) {
    console.log('Error searching for user by reset token:', error.message);
  }

  if (!user) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
    return;
  }

  // Hash the new password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Set new hashed password
  user.password = hashedPassword;
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

// Change password (old, new, confirm)
router.post('/change-password', authenticateToken, [
  body('old_password').notEmpty().withMessage('Old password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('confirm_new_password').custom((value, { req }) => value === req.body.new_password).withMessage('Passwords do not match')
], validate([body('old_password'), body('new_password'), body('confirm_new_password')]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { old_password, new_password } = req.body;
  const { userId } = ensureAuth(req);
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  // Compare old password using bcrypt
  const isOldPasswordValid = await bcrypt.compare(old_password, user.password);
  if (!isOldPasswordValid) {
    res.status(400).json({ success: false, message: 'Old password is incorrect' });
    return;
  }
  
  // Hash the new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);
  
  user.password = hashedNewPassword;
  user.updatedAt = new Date();
  const latest = await database.get(user._id);
  user._rev = latest._rev;
  await database.insert(user);
  res.json({ success: true, message: 'Password changed successfully' });
}));

// Get user settings
router.get('/settings', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Default settings structure
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

// Update user settings
router.put('/settings', authenticateToken, [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('language').optional().isIn(['en', 'fr', 'rw', 'sw']).withMessage('Invalid language'),
  body('timezone').optional().isString().withMessage('Invalid timezone'),
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
  body('privacy').optional().isObject().withMessage('Privacy must be an object')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { email, language, timezone, notifications, privacy } = req.body;

  // Update basic settings
  if (email !== undefined) user.email = email;
  if (language !== undefined) user.language_preference = language;
  if (timezone !== undefined) user.timezone = timezone;

  // Update notifications
  if (notifications) {
    user.notifications = {
      ...user.notifications,
      ...notifications
    };
  }

  // Update privacy
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

  // Return updated settings
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

// Profile update (PATCH, multipart/form-data)
router.patch('/profile', authenticateToken, uploadProfilePic, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Allow updating all user fields except sensitive ones
  const forbiddenFields = ['_id', '_rev', 'type', 'password', 'createdAt', 'userId', 'email', 'isEmailVerified', 'otp', 'otpExpires', 'resetPasswordToken', 'resetPasswordExpires'];
  Object.keys(req.body).forEach(field => {
    if (!forbiddenFields.includes(field)) {
      user[field] = req.body[field];
    }
  });

  // Handle profile picture upload
  const uploadedFiles = (req as any).uploadedFiles;
  if (uploadedFiles && uploadedFiles.length > 0) {
    user.profilePic = uploadedFiles[0].publicUrl;
  }

  user.updatedAt = new Date();
  const latest = await database.get(user._id);
  user._rev = latest._rev;
  await database.insert(user);
  const { password, ...userWithoutPassword } = user;
  res.json({ success: true, message: 'Profile updated successfully', data: userWithoutPassword });
}));

// --- ADMIN USER MANAGEMENT ENDPOINTS ---

// List all users (admin only)
router.get('/users', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  let users: any[] = [];
  try {
    // Get all users - use list instead of allDocs for Nano
    const allUsers = await database.list({ include_docs: true });
    users = allUsers.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'user')
      .map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
  } catch (error: any) {
    console.log('Error listing users:', error.message);
  }
  res.json({ success: true, data: { users } });
}));

// Get user by ID (admin only)
router.get('/users/:userId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const user = await database.get(req.params.userId) as UserDoc;
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json({ success: true, data: { user: userWithoutPassword } });
}));

// Update user (admin only)
router.put('/users/:userId', authenticateToken, authorizeRoles('admin'), [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'instructor', 'employer', 'refugee']).withMessage('Invalid role')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updates = req.body;
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
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

// Delete user (admin only)
router.delete('/users/:userId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const latest = await database.get(user._id);
  user._rev = latest._rev;
  await database.remove(user as any);
  res.json({ success: true, message: 'User deleted successfully' });
}));

// Admin-only endpoint to change user role
router.put('/users/:userId/role', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  const allowedRoles = ['refugee', 'instructor', 'employer', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
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

// Refresh token endpoint
router.post('/refresh-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], validate([]), asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }
  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
  try {
    const secret = String(process.env['JWT_SECRET'] || 'fallback-secret');
    const decoded = jwt.verify(refreshToken, secret) as any;
          // Optionally, you can remove the old refresh token and issue a new one
      refreshTokens.delete(refreshToken);
      const database = await ensureDb();
      const user = await database.get(decoded.userId) as UserDoc;
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
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}));

export default router; 