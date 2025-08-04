import express, { Request, Response } from 'express';

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
  params: any;
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
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadProfilePic } from '../middleware/upload';
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
  password?: string;
  role?: string;
  profilePic?: string;
  updatedAt?: Date;
  education?: Array<{
    _id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }>;
  experiences?: Array<{
    _id: string;
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    skills?: string[];
  }>;
  certificates?: Array<{
    _id: string;
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
  }>;
  [key: string]: any;
}

// Get user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    const user = await db.get(userId) as UserDoc;
    
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
  } catch (error: any) {
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
    
    // On database connection issues, return fallback user data
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

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().trim(),
  body('country').optional().trim(),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('summary').optional().trim().isLength({ max: 1000 }),
  body('languages').optional().isArray(),
  body('skills').optional().isArray(),
  body('interests').optional().isArray(),
  body('social.linkedin').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
  }),
  body('social.twitter').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
  }),
  body('social.instagram').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
  }),
  body('social.facebook').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
  }),
  body('social.github').optional().custom((value) => {
    if (!value || value.trim() === '') return true;
    return /^https?:\/\/.+/.test(value) || /^[a-zA-Z0-9._-]+$/.test(value);
  })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    
    const updates = req.body;
    delete updates.email;
    delete updates.password;
    delete updates.role;
    
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    const user = await db.get(userId) as UserDoc;
    
    Object.assign(user, updates);
    user.updatedAt = new Date();
    
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    
    const saveResult = await db.put(user);
    
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userWithoutPassword }
    });
  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
}));

// Upload profile picture
router.post('/profile-picture', authenticateToken, uploadProfilePic, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  
  try {
    console.log('Profile picture upload request for user:', userId);
    
    // Get uploaded file info from Supabase middleware
    const uploadedFiles = (req as any).uploadedFiles;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.error('No uploaded files found in request');
      return res.status(400).json({
        success: false,
        message: 'Please upload a profile picture'
      });
    }
    
    const uploadedFile = uploadedFiles[0];
    console.log('Uploaded file info:', {
      originalName: uploadedFile.originalName,
      path: uploadedFile.path,
      publicUrl: uploadedFile.publicUrl,
      bucket: uploadedFile.bucket
    });
    
    // Check database connection
    if (!db) {
      console.error('Database not available for profile picture update');
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    // Get current user data
    const user = await db.get(userId) as UserDoc;
    console.log('Current user data before update:', {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      currentProfilePic: user.profilePic
    });
    
    // Update user profile with Supabase URL
    user.profilePic = uploadedFile.publicUrl; // Use Supabase public URL
    user.updatedAt = new Date();
    
    console.log('Updated user data:', {
      _id: user._id,
      newProfilePic: user.profilePic,
      updatedAt: user.updatedAt
    });
    
    // Get latest revision and save
    const latest = await db.get(user._id);
    user._rev = latest._rev;
    
    const saveResult = await db.put(user);
    console.log('User data saved successfully:', saveResult);
    
    // Verify the save by fetching the user again
    const savedUser = await db.get(userId) as UserDoc;
    console.log('Verified saved user data:', {
      _id: savedUser._id,
      profilePic: savedUser.profilePic,
      updatedAt: savedUser.updatedAt
    });
    
    const { password, ...userWithoutPassword } = savedUser;
    
    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { 
        user: userWithoutPassword,
        fileInfo: {
          url: uploadedFile.publicUrl,
          path: uploadedFile.path,
          bucket: uploadedFile.bucket
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error uploading profile picture:', error);
    console.error('❌ Error details:', {
      message: error.message,
      error: error.error,
      status: error.status,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile picture'
    });
  }
}));

// Add education
router.post('/education', authenticateToken, [
  body('institution').trim().notEmpty().withMessage('Institution is required'),
  body('degree').trim().notEmpty().withMessage('Degree is required'),
  body('field').trim().notEmpty().withMessage('Field is required'),
  body('startDate').isISO8601().withMessage('Start date is required'),
  body('endDate').optional().isISO8601(),
  body('description').optional().trim().isLength({ max: 500 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.education) user.education = [];
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

// Update education
router.put('/education/:educationId', authenticateToken, [
  body('institution').optional().trim().notEmpty(),
  body('degree').optional().trim().notEmpty(),
  body('field').optional().trim().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('description').optional().trim().isLength({ max: 500 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { educationId } = req.params;
  const updates = req.body;
  
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.education) user.education = [];
  
  const edu = user.education.find((e: any) => e._id === educationId);
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

// Delete education
router.delete('/education/:educationId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { educationId } = req.params;
  
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.education) user.education = [];
  user.education = user.education.filter((e: any) => e._id !== educationId);
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

// Add experience
router.post('/experience', authenticateToken, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('startDate').isISO8601().withMessage('Start date is required'),
  body('endDate').optional().isISO8601(),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('skills').optional().isArray()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.experiences) user.experiences = [];
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

// Update experience
router.put('/experience/:experienceId', authenticateToken, [
  body('title').optional().trim().notEmpty(),
  body('company').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('description').optional().trim().notEmpty(),
  body('skills').optional().isArray()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { experienceId } = req.params;
  const updates = req.body;
  
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.experiences) user.experiences = [];
  
  const exp = user.experiences.find((e: any) => e._id === experienceId);
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

// Delete experience
router.delete('/experience/:experienceId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { experienceId } = req.params;
  
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.experiences) user.experiences = [];
  user.experiences = user.experiences.filter((e: any) => e._id !== experienceId);
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

// Add certificate
router.post('/certificate', authenticateToken, [
  body('name').trim().notEmpty().withMessage('Certificate name is required'),
  body('issuer').trim().notEmpty().withMessage('Issuer is required'),
  body('issueDate').isISO8601().withMessage('Issue date is required'),
  body('expiryDate').optional().isISO8601()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.certificates) user.certificates = [];
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

// Delete certificate
router.delete('/certificate/:certificateId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { certificateId } = req.params;
  
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
  if (!user.certificates) user.certificates = [];
  user.certificates = user.certificates.filter((c: any) => c._id !== certificateId);
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

// Get user by ID (admin only)
router.get('/:userId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const user = await db.get(userId) as UserDoc;
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

// Update user (admin only)
router.put('/:userId', authenticateToken, authorizeRoles('admin'), [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'instructor', 'employer', 'refugee'])
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
  await db.put(user);
  const { password, ...userWithoutPassword } = user;
  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: userWithoutPassword }
  });
}));

// Track user activity (call this whenever user does something on platform)
router.post('/track-activity', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const { activity_type, course_id, details } = req.body;
    
    // Update user's last activity
    const user = await db.get(userId) as UserDoc;
    if (user) {
      user.lastActivity = new Date();
      user.lastLogin = new Date(); // Update last login time
      
      // Add activity log if it doesn't exist
      if (!user.activityLog) {
        user.activityLog = [];
      }
      
      // Add activity to log
      user.activityLog.push({
        type: activity_type || 'platform_usage',
        timestamp: new Date(),
        courseId: course_id || null,
        details: details || 'User activity tracked'
      });
      
      // Keep only last 100 activities to prevent bloat
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
  } catch (error: any) {
    console.error('Error tracking user activity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track activity'
    });
  }
}));

export default router; 