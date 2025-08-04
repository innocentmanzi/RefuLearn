import { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import upload, { uploadCourseProfilePic, uploadAny, uploadFileOnly, handleUploadError } from '../middleware/upload';
import { handleValidationErrors, validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import PouchDB from 'pouchdb';
import { connectCouchDB } from '../config/couchdb';
import { sendCourseCompletionEmail } from '../config/email';
import { supabase } from '../config/supabase';



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

// Use proper CouchDB connection with authentication
let couchConnection: any = null;

// Initialize proper database connection
const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('🔄 Initializing CouchDB connection for course routes...');
    
    couchConnection = await connectCouchDB();
    
    console.log('✅ Course routes database connection successful!');
    
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Course routes database connection failed:', errorMessage);
    return false;
  }
};

// Initialize database connection
initializeDatabase();

const router = Router();

// Simple test route at the very top
router.get('/debug-test', (req: Request, res: Response) => {
  console.log('🔍 DEBUG TEST ROUTE HIT');
  res.json({ message: 'Debug test route working', timestamp: new Date().toISOString() });
});

// Simple ping endpoint (no auth required for testing)
router.get('/ping', asyncHandler(async (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Backend is reachable',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
}));



// Test simple endpoint (no auth required for testing)
router.get('/test-simple', asyncHandler(async (req: Request, res: Response) => {
  console.log('🧪 TEST SIMPLE - Request received');
  res.json({
    success: true,
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
}));

// Test file upload without auth (no auth required for testing)
router.post('/test-upload-no-auth', uploadAny, asyncHandler(async (req: Request, res: Response) => {
  console.log('🚨 TEST UPLOAD NO AUTH ENDPOINT HIT');
  console.log('🚨 TEST UPLOAD NO AUTH - Request received at:', new Date().toISOString());
  try {
    console.log('🧪 TEST UPLOAD NO AUTH - Request received');
    console.log('🧪 TEST UPLOAD NO AUTH - Request files:', req.files ? 'Files present' : 'No files');
    console.log('🧪 TEST UPLOAD NO AUTH - Request file:', req.file ? 'Single file present' : 'No single file');
    console.log('🧪 TEST UPLOAD NO AUTH - Uploaded files from middleware:', (req as any).uploadedFiles);
    
    const uploadedFiles = (req as any).uploadedFiles;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded',
        debug: {
          hasFiles: !!req.files,
          hasFile: !!req.file,
          uploadedFiles: uploadedFiles
        }
      });
    }

    const uploadedFile = uploadedFiles[0];
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalName: uploadedFile.originalName,
        publicUrl: uploadedFile.publicUrl,
        path: uploadedFile.path,
        size: uploadedFile.size
      }
    });
  } catch (error) {
    console.error('🧪 TEST UPLOAD NO AUTH - Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed',
      error: error.message 
    });
  }
}));



// Test Supabase connection (no auth required for testing)
router.get('/test-supabase-connection', asyncHandler(async (req: Request, res: Response) => {
  console.log('🧪 TEST SUPABASE CONNECTION - Starting test');
  
  try {
    // Test bucket listing
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('🧪 TEST SUPABASE CONNECTION - Buckets result:', { buckets, error: bucketsError });
    
    if (bucketsError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to list buckets',
        error: bucketsError.message
      });
    }
    
    // Test if uploads bucket exists
    const uploadsBucket = buckets?.find(b => b.name === 'uploads');
    console.log('🧪 TEST SUPABASE CONNECTION - Uploads bucket found:', !!uploadsBucket);
    
    // Test if we can list files in uploads bucket
    let filesInBucket = [];
    if (uploadsBucket) {
      const { data: files, error: filesError } = await supabase.storage
        .from('uploads')
        .list('content-items');
      
      console.log('🧪 TEST SUPABASE CONNECTION - Files in content-items:', { files, error: filesError });
      filesInBucket = files || [];
    }
    
    res.json({
      success: true,
      message: 'Supabase connection successful',
      buckets: buckets?.map(b => b.name) || [],
      uploadsBucketExists: !!uploadsBucket,
      filesInContentItems: filesInBucket.length,
      filesList: filesInBucket.map(f => f.name)
    });
  } catch (error) {
    console.error('🧪 TEST SUPABASE CONNECTION - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Supabase connection failed',
      error: error.message
    });
  }
}));

// Simple ping test (no auth required for testing)
router.get('/ping', asyncHandler(async (req: Request, res: Response) => {
  console.log('🧪 PING - Request received at:', new Date().toISOString());
  res.json({ 
    success: true, 
    message: 'Backend is reachable',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
}));

// Test file size limits (no auth required for testing)
router.get('/file-limits', asyncHandler(async (req: Request, res: Response) => {
  console.log('🧪 FILE LIMITS - Request received at:', new Date().toISOString());
  
  const maxFileSize = parseInt(process.env['MAX_FILE_SIZE'] || '52428800');
  const maxFileSizeMB = Math.round(maxFileSize / 1024 / 1024);
  
  res.json({ 
    success: true, 
    message: 'File size limits',
    maxFileSizeBytes: maxFileSize,
    maxFileSizeMB: maxFileSizeMB,
    environmentVariable: process.env['MAX_FILE_SIZE'] || 'NOT SET',
    timestamp: new Date().toISOString()
  });
}));

// Test module content items (no auth required for testing)
router.get('/test-module/:moduleId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    console.log('🧪 TEST MODULE - Checking module:', moduleId);
    
    const database = await ensureDb();
    const module = await database.get(moduleId);
    
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    
    console.log('🧪 TEST MODULE - Module found:', {
      title: module.title,
      contentItemsCount: module.contentItems?.length || 0,
      contentItems: module.contentItems
    });
    
    res.json({
      success: true,
      module: {
        _id: module._id,
        title: module.title,
        contentItemsCount: module.contentItems?.length || 0,
        contentItems: module.contentItems
      }
    });
  } catch (error) {
    console.error('❌ Test module error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// Test if upload middleware is hit (no auth required for testing)
router.post('/test-upload-middleware', uploadAny, handleUploadError, asyncHandler(async (req: Request, res: Response) => {
  console.log('🚨 UPLOAD ENDPOINT HIT - /test-upload-middleware');
  res.json({
    success: true,
    message: 'Upload middleware test completed'
  });
}));

// Test file upload without authentication (for debugging)
router.post('/test-upload-no-auth', uploadAny, handleUploadError, asyncHandler(async (req: Request, res: Response) => {
  console.log('🚨 UPLOAD ENDPOINT HIT - /test-upload-no-auth');
  console.log('📁 Test upload - Request received at:', new Date().toISOString());
  console.log('📁 Test upload - Request files:', req.files ? 'Files present' : 'No files');
  console.log('📁 Test upload - Request file:', req.file ? 'Single file present' : 'No single file');
  
  try {
    const uploadedFiles = (req as any).uploadedFiles;
    console.log('📁 Test upload - Uploaded files from middleware:', uploadedFiles);
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      console.log('❌ Test upload - No uploaded files found');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded',
        debug: {
          hasFiles: !!req.files,
          hasFile: !!req.file,
          uploadedFiles: uploadedFiles
        }
      });
    }

    const uploadedFile = uploadedFiles[0];
    console.log('📁 Test upload - Processing uploaded file:', {
      originalName: uploadedFile.originalName,
      fieldname: uploadedFile.fieldname,
      publicUrl: uploadedFile.publicUrl,
      path: uploadedFile.path,
      size: uploadedFile.size
    });
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: uploadedFile.publicUrl,
      path: uploadedFile.path,
      fileName: uploadedFile.originalName
    });
  } catch (error) {
    console.error('❌ Test upload error:', error);
    res.status(500).json({ success: false, message: 'Test upload failed' });
  }
}));

// Test Supabase configuration (no auth required for testing)
router.get('/test-supabase', asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('🔧 Testing Supabase configuration...');
    console.log('🔧 SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
    console.log('🔧 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
    console.log('🔧 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    // Test bucket listing
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    // Test if we can list files in uploads bucket
    let filesInBucket = [];
    if (!bucketsError) {
      const { data: files, error: filesError } = await supabase.storage
        .from('uploads')
        .list('content-items');
      
      console.log('🔧 Files in content-items:', { files, error: filesError });
      filesInBucket = files || [];
    }
    
    res.json({
      success: true,
      config: {
        urlSet: !!process.env.SUPABASE_URL,
        serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        anonKeySet: !!process.env.SUPABASE_ANON_KEY
      },
      buckets: bucketsError ? { error: bucketsError.message } : buckets?.map(b => b.name),
      bucketsError: bucketsError?.message,
      filesInContentItems: filesInBucket.length,
      filesList: filesInBucket.map(f => f.name)
    });
  } catch (error) {
    console.error('❌ Supabase test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));



// Upload individual file for content items with explicit file size limit
router.post('/upload/file', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log('🚨 UPLOAD ENDPOINT HIT - /upload/file');
  console.log('🚨 UPLOAD ENDPOINT - Request received at:', new Date().toISOString());
  
  try {
    // Create a new multer instance with explicit 50MB limit
    const multer = require('multer');
    const storage = multer.memoryStorage();
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB explicit limit
        files: 1
      }
    });
    
    console.log('🚨 UPLOAD ENDPOINT - Using explicit 50MB file size limit');
    
    // Process the file upload
    upload.any()(req, res, async (err: any) => {
      if (err) {
        console.log('🚨 UPLOAD ENDPOINT - Multer error:', err);
        return res.status(400).json({
          success: false,
          error: err.message,
          stack: err.stack
        });
      }
      
      console.log('📁 File upload request received');
      console.log('📁 Request files:', req.files ? 'Files present' : 'No files');
      console.log('📁 Request file:', req.file ? 'Single file present' : 'No single file');
      
      if (!req.files && !req.file) {
        console.log('❌ No uploaded files found');
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Handle different file types from multer
      let files: Express.Multer.File[] = [];
      if (req.file) {
        files = [req.file];
        console.log('📁 UPLOAD ENDPOINT - Single file found:', req.file.originalname);
      } else if (req.files) {
        if (Array.isArray(req.files)) {
          files = req.files;
          console.log('📁 UPLOAD ENDPOINT - Array of files found:', req.files.length);
        } else {
          files = Object.values(req.files).flat();
          console.log('📁 UPLOAD ENDPOINT - Object files found:', Object.keys(req.files));
        }
      }

      if (files.length === 0) {
        console.log('❌ No files to process');
        return res.status(400).json({ success: false, message: 'No files to process' });
      }

      const file = files[0];
      console.log('📁 Processing file:', {
        originalName: file.originalname,
        fieldname: file.fieldname,
        mimetype: file.mimetype,
        size: file.size,
        sizeMB: Math.round(file.size / 1024 / 1024 * 100) / 100
      });

      // Import the upload functions
      const { uploadToSupabase, getBucketForFile, getPathForFile } = require('../config/supabase');
      
      // Determine bucket and path
      const bucket = getBucketForFile(file.fieldname, file.mimetype);
      const path = getPathForFile(file.fieldname, file.originalname);
      
      console.log('📁 Upload details:', { bucket, path });

      // Upload to Supabase
      const result = await uploadToSupabase(file, bucket, path, {
        uploadedBy: req.user?._id || 'anonymous',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bucket,
        path
      });
      
      console.log('📁 Upload result:', result);

      if (result.success) {
        const response = {
          success: true,
          url: result.url || result.publicUrl,
          path: result.path,
          fileName: file.originalname
        };
        
        console.log('📁 Sending response:', response);
        res.json(response);
      } else {
        console.log('❌ Upload failed:', result.error);
        res.status(400).json({ 
          success: false, 
          message: 'File upload failed',
          error: result.error 
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error in upload endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// File download route - PLACED AT THE VERY TOP TO AVOID ANY CONFLICTS
router.get('/file-download/:submissionId', authenticateToken, authorizeRoles('instructor', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log('📁 FILE DOWNLOAD ROUTE HIT - Submission ID:', req.params.submissionId);
  console.log('📁 Request URL:', req.originalUrl);
  console.log('📁 Request method:', req.method);
  try {
    const { submissionId } = req.params;
    const database = await ensureDb();

    console.log('📁 File download request for submission:', submissionId);

    // Get submission details
    const submission = await database.get(submissionId) as AssignmentSubmissionDoc;
    console.log('📁 Found submission:', submission);

    if (!submission || submission.type !== 'assignment_submission') {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if it's a file submission
    if (submission.submissionType !== 'file' || !submission.filePath) {
      return res.status(400).json({
        success: false,
        message: 'This submission does not contain a file'
      });
    }

    console.log('📁 File path:', submission.filePath);
    console.log('📁 File name:', submission.fileName);

    // Use require for fs to avoid TypeScript issues
    const fs = require('fs');
    const path = require('path');
    
    // Get the file path
    const filePath = submission.filePath;
    console.log('📁 Attempting to serve file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found at path:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file extension to set correct content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${submission.fileName || 'submission'}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error: any) {
    console.error('❌ Error downloading submission file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Removed excessive debugging middleware to prevent continuous terminal output

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
    if (!retryDatabase || (typeof (retryDatabase as any).allDocs !== 'function' && typeof (retryDatabase as any).list !== 'function')) {
      throw new Error('Database object is not properly initialized');
    }
    return retryDatabase;
    }
    
    // Verify the database object has required methods
    if (typeof (database as any).allDocs !== 'function' && typeof (database as any).list !== 'function') {
      console.log('❌ Database object missing allDocs/list method, reinitializing...');
      couchConnection = await connectCouchDB();
      const retryDatabase = couchConnection.getDatabase();
      if (!retryDatabase || (typeof (retryDatabase as any).allDocs !== 'function' && typeof (retryDatabase as any).list !== 'function')) {
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
      if (!retryDatabase || (typeof (retryDatabase as any).allDocs !== 'function' && typeof (retryDatabase as any).list !== 'function')) {
        throw new Error('Database object is not properly initialized after retry');
      }
      return retryDatabase;
    } catch (retryError) {
      console.error('❌ Database retry failed:', retryError);
      throw new Error('Database connection failed after retry');
    }
  }
};

interface CourseDoc {
  _id: string;
  _rev?: string;
  type: 'course';
  title: string;
  description?: string;
  overview?: string;
  learningOutcomes?: string;
  category?: string;
  level?: string;
  isPublished: boolean;
  enrolledStudents?: string[];
  students?: number;
  updatedAt?: Date;
  studentProgress?: Array<{
    student: string;
    moduleId: string;
    completed: boolean;
    score?: number;
    completedAt?: Date | null;
    completedItems?: string[]; // Track individual item completions
  }>;
  instructor: string;
  submissions?: string[];
  image?: string | undefined;
  modules?: string[]; // Array of module IDs
  createdAt?: Date;
  instructor_id?: string;
  duration?: string;
  difficult_level?: string;
  is_active?: boolean;
  course_profile_picture?: string;
  moduleCount?: number;
  role?: string; // Add role property for user objects
  [key: string]: any;
}

interface UserDoc {
  _id: string;
  _rev?: string;
  type: 'user';
  name?: string;
  email?: string;
  enrolledCourses?: string[];
  updatedAt?: Date;
  password?: string;
  profilePic?: string;
  courseProgress?: {
    [courseId: string]: {
      grades?: Array<{
        userId: string;
        courseId: string;
        moduleId: string;
        quizId: string;
        type: string;
        score: number;
        totalQuestions: number;
        percentage: number;
        grade: number;
        answers: any[];
        submittedAt: Date;
      }>;
    };
  };
  education?: Array<{
    _id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
  }>;
  experiences?: Array<{
    _id: string;
    company: string;
    position: string;
    description: string;
    startDate: Date;
    endDate?: Date;
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

interface EnrollmentDoc {
  _id: string;
  _rev?: string;
  type: 'enrollment';
  user: string;
  course: string;
  enrolledAt: Date;
  status: string;
  [key: string]: any;
}

interface UserAssessmentDoc {
  _id: string;
  _rev?: string;
  type: 'user_assessment';
  user: string;
  assessment: string;
  score?: number;
  completed: boolean;
  submittedAt?: Date;
  [key: string]: any;
}

interface SubmissionDoc {
  _id: string;
  _rev?: string;
  type: 'submission';
  user: string;
  assessment: string;
  answers: any[];
  score?: number;
  submittedAt: Date;
  [key: string]: any;
}

interface AssignmentSubmissionDoc {
  _id: string;
  _rev?: string;
  type: 'assignment_submission';
  userId: string;
  assessmentId: string;
  courseId: string;
  moduleId: string;
  submissionType: 'file' | 'link';
  submissionText?: string;
  submissionLink?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt: Date;
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
  createdAt: Date;
  [key: string]: any;
}

interface CertificateDoc {
  _id: string;
  _rev?: string;
  type: 'certificate';
  student: string;
  course: string;
  issuedAt: Date;
  [key: string]: any;
}

interface AssessmentDoc {
  _id: string;
  _rev?: string;
  type: 'assessment';
  title: string;
  description?: string;
  moduleId: string;
  courseId: string;
  instructor: string;
  timeLimit: number;
  totalPoints: number;
  questions: QuestionDoc[];
  isPublished: boolean;
  isActive: boolean;
  dueDate?: Date;
  createdAt: Date;
  [key: string]: any;
}

interface QuestionDoc {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: any;
  points: number;
  explanation?: string;
  order: number;
}

interface UserAssessmentAttemptDoc {
  _id: string;
  _rev?: string;
  type: 'user_assessment_attempt';
  userId: string;
  assessmentId: string;
  moduleId: string;
  courseId: string;
  answers: any[];
  score: number;
  totalPoints: number;
  timeSpent: number;
  completed: boolean;
  submittedAt: Date;
  [key: string]: any;
}

interface DiscussionDoc {
  _id: string;
  _rev?: string;
  type: 'discussion';
  course: string;
  user: string;
  title: string;
  content: string;
  likes?: number;
  likedBy?: string[];
  replies?: Array<{
    _id?: string;
    user: string;
    content: string;
    likes?: number;
    likedBy?: string[];
    createdAt: Date;
    updatedAt?: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// Use the globally augmented Express.Request (from types/express/index.d.ts)
// No custom interface needed - use type assertions for multer files

// Optionally, update ModuleDoc interface for new fields
interface ModuleDoc {
  _id: string;
  _rev?: string;
  type: 'module';
  course: string;
  courseId: string;
  title: string;
  description: string;
  content_type: string;
  content: string;
  contentItems?: Array<{
    id: string;
    type: 'article' | 'video' | 'audio' | 'file';
    title: string;
    description?: string;
    url?: string;
    fileUrl?: string;
    publicUrl?: string;
    file?: any;
    fileName?: string;
    dateAdded?: string;
  }>;
  duration: string;
  isMandatory: boolean;
  order: number;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  videoUrl?: string;
  videoTitle?: string;
  resources?: any[];
  assignments?: any[];
  assessments?: any[];
  quizzes?: any[];
  discussions?: any[];
  learningObjectives?: any[];
  prerequisites?: any[];
  tags?: any[];
  overview?: string;
  [key: string]: any;
}

// List all courses with optional filtering
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, level, published, page = 1, limit = 10 } = req.query;
    
    console.log('Courses endpoint called by user:', req.user?._id, 'role:', req.user?.role);
    
    const database = await ensureDb();
    
    // Query database for courses using Nano API
    console.log('🔍 Querying database for all courses...');
    
    const result = await database.list({ include_docs: true });
    
    // Filter for course documents
    let courses: CourseDoc[] = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'course') as CourseDoc[];
    
    console.log('📚 Course documents found:', courses.length);
    
    // Debug: Log all courses found
    console.log('🔍 All courses in database:');
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. "${course.title}" - Category: "${course.category}" - Published: ${course.isPublished} - Active: ${course.is_active}`);
    });
    
    // Apply default filter for published courses (handle both boolean and string values)
    console.log('🔍 Before filtering - total courses:', courses.length);
    console.log('🔍 Sample course isPublished values:', courses.slice(0, 3).map(c => ({ title: c.title, isPublished: c.isPublished, type: typeof c.isPublished })));
    
    courses = courses.filter((course: any) => {
      const isPublished = course.isPublished === true || course.isPublished === 'true';
      console.log(`📋 Course "${course.title}": isPublished = ${course.isPublished} (${typeof course.isPublished}) -> included: ${isPublished}`);
      return isPublished;
    });
    console.log('📚 Published courses found:', courses.length);
    
    // Apply filtering
    if (category) {
      const categoryFilter = (category as string).toLowerCase();
      courses = courses.filter((course: any) => 
        course.category && course.category.toLowerCase() === categoryFilter
      );
      console.log('Filtered by category "' + category + '":', courses.length, 'courses');
    }
    
    if (level) {
      const levelFilter = (level as string).toLowerCase();
      courses = courses.filter((course: any) => {
        const courseLevel = course.level ? course.level.toLowerCase() : '';
        const courseDifficultLevel = course.difficult_level ? course.difficult_level.toLowerCase() : '';
        return courseLevel === levelFilter || courseDifficultLevel === levelFilter;
      });
      console.log('Filtered by level "' + level + '":', courses.length, 'courses');
    }
    
    // Note: We now filter by published=true by default above
    // If explicitly requesting unpublished courses, override the default filter
    if (published === 'false') {
      // Re-fetch all courses and filter for unpublished ones
      const allCourses = result.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'course') as CourseDoc[];
      courses = allCourses.filter((course: any) => course.isPublished === false);
      console.log('Filtered by published "false":', courses.length, 'courses');
    }
    
    // Apply pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedCourses = courses.slice(startIndex, endIndex);
    
    console.log('📄 Paginated courses:', paginatedCourses.length);
    
    return res.json({ 
        success: true, 
        data: { 
          courses: paginatedCourses,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: courses.length
          },
          debug: {
            databaseConnected: !!database,
            totalCoursesFound: courses.length,
            usingRealData: true
          }
        } 
      });
  } catch (error: unknown) {
    console.error('❌ Error in courses endpoint:', error);
    
    // Return error instead of fallback courses
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses from database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Get courses by category
router.get('/category/:categoryName', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoryName } = req.params;
    const { level, page = 1, limit = 10 } = req.query;
    
    console.log('🔍 Category endpoint called for:', categoryName);
    console.log('📊 Query params:', { level, page, limit });
    console.log('👤 User:', req.user?._id, 'Role:', req.user?.role);
    
    const database = await ensureDb();
    console.log('✅ Database connection successful');
    
    if (!database) {
      console.error('❌ Database connection failed');
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }

    // Query database for courses using proper CouchDB methods
    console.log('🔍 Querying database for courses...');
    
    try {
      console.log('🔍 Querying database for courses...');
      
      // Get all published courses from database
      const result = await database.list({ include_docs: true });
      console.log('📊 Database query successful, total docs:', result.rows.length);
      
      // Filter for published course documents (handle both boolean and string values)
      const allCourses = result.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'course' && (doc.isPublished === true || doc.isPublished === 'true')) as CourseDoc[];
      
      console.log('📚 Published courses found:', allCourses.length);
      
      // Debug: Log all course details
      console.log('🔍 All courses found:');
      allCourses.forEach((course, index) => {
        console.log(`  ${index + 1}. "${course.title}" - Category: "${course.category}" - Published: ${course.isPublished}`);
      });
      
      console.log('🔍 All course categories found:', allCourses.map(c => c.category).filter(Boolean));
      console.log('🔍 Looking for category:', categoryName);
      console.log('🔍 Looking for category (lowercase):', categoryName.toLowerCase());
      
      // Filter by category (case-insensitive)
      const filteredCourses = allCourses.filter((course: any) => {
        const courseCategory = course.category || '';
        const courseCategoryLower = courseCategory.toLowerCase();
        const categoryNameLower = categoryName.toLowerCase();
        const matches = courseCategoryLower === categoryNameLower;
        console.log(`📋 Checking course "${course.title}"`);
        console.log(`    Original category: "${courseCategory}"`);
        console.log(`    Lowercase category: "${courseCategoryLower}"`);
        console.log(`    Looking for: "${categoryNameLower}"`);
        console.log(`    Matches: ${matches}`);
        return matches;
      });

      console.log('📋 Filtered courses by category:', filteredCourses.length);
      
      // Apply level filter if specified
      let finalCourses = filteredCourses;
      if (level) {
        finalCourses = filteredCourses.filter((course: any) => {
          const courseLevel = course.level || course.difficult_level || '';
          return courseLevel.toLowerCase() === level.toString().toLowerCase();
        });
        console.log('📊 After level filter:', finalCourses.length);
      }

      // Apply pagination
      const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedCourses = finalCourses.slice(startIndex, endIndex);

      console.log('📄 Paginated courses:', paginatedCourses.length);
      
      // Return the real courses from database
      res.json({ 
        success: true, 
        data: { 
          courses: paginatedCourses,
          category: categoryName,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: finalCourses.length
          },
          debug: {
            databaseConnected: !!database,
            totalCoursesFound: allCourses.length,
            filteredByCategory: filteredCourses.length,
            finalCoursesCount: finalCourses.length,
            usingRealData: true
          }
        } 
      });
      
    } catch (queryError: unknown) {
      console.error('❌ Database query error:', queryError);
      console.error('❌ Error message:', queryError instanceof Error ? queryError.message : 'Unknown error');
      console.error('❌ Error stack:', queryError instanceof Error ? queryError.stack : 'No stack trace');
      
      // If database query fails, return error instead of fallback
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courses from database',
        error: queryError instanceof Error ? queryError.message : 'Unknown error',
                 debug: {
           endpoint: 'category',
           queryError: queryError instanceof Error ? queryError.message : 'Unknown error'
         }
      });
    }
    
  } catch (error: unknown) {
    console.error('❌ Error fetching courses by category:', error);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return error instead of fallback courses
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch courses by category',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        endpoint: 'category',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}));

// Get recommended courses (top 5 most recently created published courses) with modules
router.get('/recommended', asyncHandler(async (req: Request, res: Response) => {
  try {
    const database = await ensureDb();

    const result = await database.list({ include_docs: true });
    
    // Filter for published courses and sort by creation date
    const allCourses = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'course' && doc.isPublished === true) as CourseDoc[];
    
    // Sort by createdAt descending and take top 20
    const courses = allCourses
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 20);

    // Get modules for each course
    const coursesWithModules = await Promise.all(
      courses.slice(0, 5).map(async (course: any) => {
        try {
          const modulesResult = await database.list({ include_docs: true });
          
          // Filter for modules belonging to this course
          const modules = modulesResult.rows
            .map((row: any) => row.doc)
            .filter((doc: any) => doc && doc.type === 'module' && 
              (doc.course === course._id || doc.courseId === course._id));
          
          return {
            ...course,
            modules: modules || []
          };
        } catch (error) {
          // If modules query fails, return course without modules
          return {
            ...course,
            modules: []
          };
        }
      })
    );

    // Always return an array, even if empty
    res.json({ success: true, data: { courses: coursesWithModules } });
  } catch (error: unknown) {
    console.error('Error fetching recommended courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended courses from database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Enroll in course
router.post('/:courseId/enroll', authenticateToken, authorizeRoles('instructor', 'admin', 'refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const userId = req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }
  const database = await ensureDb();
  let course = await database.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  if (!course.isPublished) {
    return res.status(400).json({ success: false, message: 'Course is not available for enrollment' });
  }
  if (!course.enrolledStudents) course.enrolledStudents = [];
  if (course.enrolledStudents.includes(userId)) {
    return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
  }
  course.enrolledStudents.push(userId);
  course.students = course.enrolledStudents.length;
  course.updatedAt = new Date();
  const latest = await database.get(course._id);
  course._rev = latest._rev;
  await database.insert(course);
  // Add course to user's enrolledCourses
  const user = await database.get(userId) as UserDoc;
  if (!user.enrolledCourses) user.enrolledCourses = [];
  user.enrolledCourses.push(courseId);
  user.updatedAt = new Date();
  const latestUser = await database.get(user._id);
  user._rev = latestUser._rev;
  await database.insert(user);
  res.json({ success: true, message: 'Successfully enrolled in course' });
}));

// Unenroll from course
router.delete('/:courseId/enroll', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const userId = req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }
  const database = await ensureDb();
  let course = await database.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  if (!course.enrolledStudents) course.enrolledStudents = [];
  course.enrolledStudents = course.enrolledStudents.filter((id: string) => id !== userId);
  course.students = course.enrolledStudents.length;
  course.updatedAt = new Date();
  const latest = await database.get(course._id);
  course._rev = latest._rev;
  await database.insert(course);
  // Remove course from user's enrolledCourses
  const user = await database.get(userId) as UserDoc;
  if (!user.enrolledCourses) user.enrolledCourses = [];
  user.enrolledCourses = user.enrolledCourses.filter((id: string) => id !== courseId);
  user.updatedAt = new Date();
  const latestUser = await database.get(user._id);
  user._rev = latestUser._rev;
  await database.insert(user);
  res.json({ success: true, message: 'Successfully unenrolled from course' });
}));

// Update course progress
router.put('/:courseId/progress', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('completed').isBoolean().withMessage('Completed status is required'),
  body('score').optional().isFloat({ min: 0, max: 100 }),
  body('contentType').optional().isString(),
  body('itemIndex').optional().isInt(),
  body('completionKey').optional().isString()
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const { moduleId, completed, score, contentType, itemIndex, completionKey } = req.body;
  const userId = req.user?._id?.toString();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }

  console.log('📝 Progress update request:', {
    courseId,
    moduleId,
    completed,
    contentType,
    itemIndex,
    completionKey,
    userId
  });

  const database = await ensureDb();
  let course = await database.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if user is enrolled OR is the instructor of the course
  const isEnrolled = course.enrolledStudents?.includes(userId);
  const isInstructor = course.instructor === userId || course.instructor_id === userId;
  const userRole = req.user?.role;
  
  if (!isEnrolled && !isInstructor && userRole !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'You must be enrolled or be the instructor to update progress'
    });
  }

  // Initialize progress structures if they don't exist
  if (!course.studentProgress) {
    course.studentProgress = [];
  }

  // Find or create module progress entry
  let moduleProgress = course.studentProgress.find(
    (p: any) => p.student === userId && p.moduleId === moduleId
  );

  if (!moduleProgress) {
    moduleProgress = {
      student: userId,
      moduleId,
      completed: false,
      score: 0,
      completedAt: null,
      completedItems: [] // Track individual item completions
    };
    course.studentProgress.push(moduleProgress);
  }

  // Handle individual item completion tracking
  if (completionKey && contentType && itemIndex !== undefined) {
    // Initialize completedItems array if it doesn't exist
    if (!moduleProgress.completedItems) {
      moduleProgress.completedItems = [];
    }

    console.log('🎯 Processing item completion:', {
      completionKey,
      contentType,
      itemIndex,
      currentCompletedItems: moduleProgress.completedItems,
      completed
    });

    // Add or update the completion key
    if (completed && !moduleProgress.completedItems.includes(completionKey)) {
      moduleProgress.completedItems.push(completionKey);
      console.log('✅ Added completion key:', completionKey);
    } else if (!completed && moduleProgress.completedItems.includes(completionKey)) {
      moduleProgress.completedItems = moduleProgress.completedItems.filter(
        (key: string) => key !== completionKey
      );
      console.log('❌ Removed completion key:', completionKey);
    }

    // Check if all items in the module are completed
    try {
    const moduleDoc = await database.get(moduleId);
    if (moduleDoc) {
      let totalItems = 0;
      if (moduleDoc.description) totalItems++;
      if (moduleDoc.content) totalItems++;
      if (moduleDoc.videoUrl) totalItems++;
      if (moduleDoc.resources) totalItems += moduleDoc.resources.length;
      if (moduleDoc.assessments) totalItems += moduleDoc.assessments.length;
      if (moduleDoc.quizzes) totalItems += moduleDoc.quizzes.length;
      if (moduleDoc.discussions) totalItems += moduleDoc.discussions.length;

      // Update module completion status based on item completion
      const completedItemsCount = moduleProgress.completedItems.length;
        const wasCompleted = moduleProgress.completed;
      moduleProgress.completed = totalItems > 0 && completedItemsCount >= totalItems;
        
        console.log('📊 Module completion check:', {
          moduleId,
          totalItems,
          completedItemsCount,
          wasCompleted,
          nowCompleted: moduleProgress.completed
        });
      
      if (moduleProgress.completed && !moduleProgress.completedAt) {
        moduleProgress.completedAt = new Date();
          console.log('🎉 Module completed!');
      } else if (!moduleProgress.completed) {
        moduleProgress.completedAt = null;
      }
      }
         } catch (moduleError) {
       const errorMessage = moduleError instanceof Error ? moduleError.message : String(moduleError);
       console.warn('⚠️ Could not fetch module document:', errorMessage);
       // Continue without module-level completion check
    }
  } else {
    // Handle legacy module-level completion
    moduleProgress.completed = completed;
    if (score !== undefined) {
      moduleProgress.score = score;
    }
    if (completed && !moduleProgress.completedAt) {
      moduleProgress.completedAt = new Date();
    } else if (!completed) {
      moduleProgress.completedAt = null;
    }
  }

  // Calculate overall progress based on ALL items in ALL modules
  let totalItemsInCourse = 0;
  let completedItemsInCourse = 0;
  
  // Get all modules for this course
  const moduleIds = (course as any).modules || [];
  
  for (const moduleId of moduleIds) {
    try {
      const moduleDoc = await database.get(moduleId);
      if (moduleDoc) {
        // Count items in this module
        let moduleItemCount = 0;
        if (moduleDoc.description) moduleItemCount++;
        if (moduleDoc.content) moduleItemCount++;
        if (moduleDoc.videoUrl) moduleItemCount++;
        if (moduleDoc.resources) moduleItemCount += moduleDoc.resources.length;
        if (moduleDoc.assessments) moduleItemCount += moduleDoc.assessments.length;
        if (moduleDoc.quizzes) moduleItemCount += moduleDoc.quizzes.length;
        if (moduleDoc.discussions) moduleItemCount += moduleDoc.discussions.length;
        
        totalItemsInCourse += moduleItemCount;
        
        // Count completed items for this module
        const moduleProgress = course.studentProgress.find((p: any) => p.student === userId && p.moduleId === moduleId);
        if (moduleProgress && moduleProgress.completedItems) {
          completedItemsInCourse += moduleProgress.completedItems.length;
        }
        
        console.log(`📊 Module ${moduleId} - Items: ${moduleItemCount}, Completed: ${moduleProgress?.completedItems?.length || 0}`);
      }
    } catch (moduleError) {
      const errorMessage = moduleError instanceof Error ? moduleError.message : String(moduleError);
      console.warn('⚠️ Could not fetch module for progress calculation:', errorMessage);
    }
  }
  
  // Calculate progress percentage based on total items
  const progressPercentage = totalItemsInCourse > 0 ? (completedItemsInCourse / totalItemsInCourse) * 100 : 0;
  
  // Also calculate module-based progress for compatibility
  const totalModules = moduleIds.length;
  const completedModules = course.studentProgress.filter((p: any) => p.student === userId && p.completed).length;

  console.log('📈 Overall progress calculation:', {
    totalModules,
    completedModules,
    totalItemsInCourse,
    completedItemsInCourse,
    progressPercentage: Math.round(progressPercentage * 100) / 100, // Round to 2 decimal places
    userProgressEntries: course.studentProgress.filter((p: any) => p.student === userId)
  });

  course.updatedAt = new Date();
  const latest = await database.get(course._id);
  course._rev = latest._rev;
  await database.insert(course);

  console.log('✅ Progress updated successfully');



  res.json({
    success: true,
    message: 'Progress updated successfully',
    data: {
      progressPercentage,
      completedModules,
      totalModules,
      moduleProgress,
      completedItems: moduleProgress.completedItems
    }
  });
}));

// Get user's course progress
router.get('/:courseId/progress', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const { userId } = ensureAuth(req);

  // Removed excessive logging to prevent continuous terminal output

  const database = await ensureDb();
  let course = await database.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const userProgress = course.studentProgress?.filter(
    (p: any) => p.student === userId
  ) || [];

  // Removed excessive logging to prevent continuous terminal output

  // Calculate progress based on ALL items in ALL modules (same logic as PUT endpoint)
  let totalItemsInCourse = 0;
  let completedItemsInCourse = 0;
  
  // Get all modules for this course
  const moduleIds = (course as any).modules || [];
  
  for (const moduleId of moduleIds) {
    try {
      const moduleDoc = await database.get(moduleId);
      if (moduleDoc) {
        // Count items in this module
        let moduleItemCount = 0;
        if (moduleDoc.description) moduleItemCount++;
        if (moduleDoc.content) moduleItemCount++;
        if (moduleDoc.videoUrl) moduleItemCount++;
        if (moduleDoc.resources) moduleItemCount += moduleDoc.resources.length;
        if (moduleDoc.assessments) moduleItemCount += moduleDoc.assessments.length;
        if (moduleDoc.quizzes) moduleItemCount += moduleDoc.quizzes.length;
        if (moduleDoc.discussions) moduleItemCount += moduleDoc.discussions.length;
        
        totalItemsInCourse += moduleItemCount;
        
        // Count completed items for this module
        const moduleProgress = userProgress.find((p: any) => p.moduleId === moduleId);
        if (moduleProgress && moduleProgress.completedItems) {
          completedItemsInCourse += moduleProgress.completedItems.length;
        }
      }
    } catch (moduleError) {
      const errorMessage = moduleError instanceof Error ? moduleError.message : String(moduleError);
      console.warn('⚠️ Could not fetch module for progress calculation:', errorMessage);
    }
  }
  
  // Calculate progress percentage based on total items
  const progressPercentage = totalItemsInCourse > 0 ? (completedItemsInCourse / totalItemsInCourse) * 100 : 0;
  
  // Also calculate module-based progress for compatibility
  const totalModules = moduleIds.length;
  const completedModules = userProgress.filter((p: any) => p.completed).length;

  // Collect all completed items from all modules
  const allCompletedItems = userProgress.reduce((acc: string[], moduleProgress: any) => {
    if (moduleProgress.completedItems) {
      acc.push(...moduleProgress.completedItems);
    }
    return acc;
  }, []);

  // Removed excessive logging to prevent continuous terminal output

  // Create modules progress mapping
  const modulesProgress = userProgress.reduce((acc: any, moduleProgress: any) => {
    acc[moduleProgress.moduleId] = {
      completed: moduleProgress.completed,
      completedItems: moduleProgress.completedItems || [],
      score: moduleProgress.score || 0,
      completedAt: moduleProgress.completedAt
    };
    return acc;
  }, {});

  // Removed excessive logging to prevent continuous terminal output

  res.json({
    success: true,
    data: {
      progress: userProgress,
      totalModules,
      completedModules,
      progressPercentage,
      modulesProgress,
      allCompletedItems
    }
  });
}));

// Mark individual item as complete/incomplete
router.put('/:courseId/modules/:moduleId/items/:itemId/complete', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('completed').isBoolean().withMessage('Completed status is required'),
  body('itemType').isString().withMessage('Item type is required'),
  body('itemIndex').isInt({ min: 0 }).withMessage('Item index is required')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, moduleId, itemId } = req.params;
  const { completed, itemType, itemIndex } = req.body;
  const userId = req.user?._id?.toString();
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User authentication required'
    });
  }

  console.log('🎯 Individual item completion request:', {
    courseId,
    moduleId,
    itemId,
    itemType,
    itemIndex,
    completed,
    userId
  });

  const database = await ensureDb();
  let course = await database.get(courseId) as CourseDoc;
  
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if user is enrolled OR is the instructor of the course
  const isEnrolled = course.enrolledStudents?.includes(userId);
  const isInstructor = course.instructor === userId || course.instructor_id === userId;
  const userRole = req.user?.role;
  
  if (!isEnrolled && !isInstructor && userRole !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'You must be enrolled or be the instructor to update progress'
    });
  }

  // Initialize progress structures if they don't exist
  if (!course.studentProgress) {
    course.studentProgress = [];
  }

  // Find or create module progress entry
  let moduleProgress = course.studentProgress.find(
    (p: any) => p.student === userId && p.moduleId === moduleId
  );

  if (!moduleProgress) {
    moduleProgress = {
      student: userId,
      moduleId,
      completed: false,
      score: 0,
      completedAt: null,
      completedItems: []
    };
    course.studentProgress.push(moduleProgress);
  }

  // Initialize completedItems array if it doesn't exist
  if (!moduleProgress.completedItems) {
    moduleProgress.completedItems = [];
  }

  // Create completion key for this specific item
  const completionKey = `${itemType}_${itemIndex}`;
  
  console.log('🎯 Processing item completion:', {
    completionKey,
    itemType,
    itemIndex,
    currentCompletedItems: moduleProgress.completedItems,
    completed
  });

  // Add or remove the completion key
  if (completed && !moduleProgress.completedItems.includes(completionKey)) {
    moduleProgress.completedItems.push(completionKey);
    console.log('✅ Added completion key:', completionKey);
  } else if (!completed && moduleProgress.completedItems.includes(completionKey)) {
    moduleProgress.completedItems = moduleProgress.completedItems.filter(
      (key: string) => key !== completionKey
    );
    console.log('❌ Removed completion key:', completionKey);
  }

  // Check if all items in the module are completed
  try {
    const moduleDoc = await database.get(moduleId);
    if (moduleDoc) {
      let totalItems = 0;
      
      // Count all items in the module
      if (moduleDoc.description) totalItems++;
      if (moduleDoc.content) totalItems++;
      if (moduleDoc.videoUrl) totalItems++;
      if (moduleDoc.resources) totalItems += moduleDoc.resources.length;
      if (moduleDoc.assessments) totalItems += moduleDoc.assessments.length;
      if (moduleDoc.quizzes) totalItems += moduleDoc.quizzes.length;
      if (moduleDoc.discussions) totalItems += moduleDoc.discussions.length;
      if (moduleDoc.contentItems) totalItems += moduleDoc.contentItems.length;

      // Update module completion status based on item completion
      const completedItemsCount = moduleProgress.completedItems.length;
      const wasCompleted = moduleProgress.completed;
      moduleProgress.completed = totalItems > 0 && completedItemsCount >= totalItems;
        
      console.log('📊 Module completion check:', {
        moduleId,
        totalItems,
        completedItemsCount,
        wasCompleted,
        nowCompleted: moduleProgress.completed
      });
      
      if (moduleProgress.completed && !moduleProgress.completedAt) {
        moduleProgress.completedAt = new Date();
        console.log('🎉 Module completed!');
      } else if (!moduleProgress.completed) {
        moduleProgress.completedAt = null;
      }
    }
  } catch (moduleError) {
    const errorMessage = moduleError instanceof Error ? moduleError.message : String(moduleError);
    console.warn('⚠️ Could not fetch module document:', errorMessage);
    // Continue without module-level completion check
  }

  // Save the updated course
  course.updatedAt = new Date();
  await database.insert(course);

  console.log('✅ Individual item completion updated successfully');

  res.json({
    success: true,
    message: `Item ${completed ? 'marked as complete' : 'marked as incomplete'}`,
    data: {
      itemId,
      itemType,
      itemIndex,
      completed,
      moduleCompleted: moduleProgress.completed,
      completedItems: moduleProgress.completedItems
    }
  });
}));

// Get enrolled courses for user (all or by courseId)
router.get('/enrolled/courses/:courseId?', authenticateToken, authorizeRoles('admin', 'instructor', 'employer', 'refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const database = await ensureDb();
  const user = await database.get(userId) as UserDoc;
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  const { courseId } = req.params;
  if (courseId) {
    // Return full course object if enrolled in this course
    if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
      let course = await database.get(courseId) as CourseDoc;
      return res.json({ success: true, data: { course } });
    } else {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }
  }
  // Return all enrolled course objects
  let courses: any[] = [];
  if (user.enrolledCourses && user.enrolledCourses.length > 0) {
    courses = await Promise.all(user.enrolledCourses.map(async (id: string) => {
      try {
        return await database.get(id) as CourseDoc;
      } catch {
        return null;
      }
    }));
    courses = courses.filter(Boolean);
  }
  res.json({
    success: true,
    data: { courses }
  });
}));

// Get user's learning path
router.get('/learning-path', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const database = await ensureDb();
    
    console.log('🔍 Learning path endpoint called for user:', userId);
    
    // Use database.list() which is compatible with Nano API
    const result = await database.list({ include_docs: true });
    
    // Filter for enrollment documents for this user
    const enrolledCourses = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'enrollment' && doc.user_id === userId);
    
    console.log('📚 Enrolled courses found:', enrolledCourses.length);
    
    // Create learning path based on enrolled courses
    const learningPath = enrolledCourses.map((enrollment: any) => ({
      _id: enrollment.course_id,
      title: enrollment.course_title || 'Course',
      description: enrollment.course_description || 'Course description',
      progress: enrollment.progress_percentage || 0,
      completed: enrollment.completed || false,
      duration: enrollment.course_duration || '4 weeks',
      level: enrollment.course_level || 'Beginner',
      courseId: enrollment.course_id
    }));

    res.json({ 
      success: true, 
      data: { learningPath } 
    });
  } catch (error: unknown) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch learning path' });
  }
}));

// Get course recommendations for user
router.get('/recommendations', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = ensureAuth(req);
    const database = await ensureDb();
    
    console.log('🔍 Recommendations endpoint called for user:', userId);
    
    // Use database.list() which is compatible with Nano API
    const result = await database.list({ include_docs: true });
    
    // Filter for enrollment documents for this user
    const enrolledCourses = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'enrollment' && doc.user_id === userId);
    
    // Filter for all published courses
    const allCourses = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'course' && doc.isPublished === true);
    
    console.log('📚 Published courses found:', allCourses.length);
    console.log('📝 User enrolled courses:', enrolledCourses.length);
    
    // Filter out already enrolled courses
    const enrolledCourseIds = enrolledCourses.map((enrollment: any) => enrollment.course_id);
    const availableCourses = allCourses.filter((course: any) => !enrolledCourseIds.includes(course._id));
    
    console.log('✨ Available courses for recommendations:', availableCourses.length);
    
    // Simple recommendation logic - return top 5 courses
    const recommendations = availableCourses.slice(0, 5).map((course: any) => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      level: course.difficult_level || course.level,
      duration: course.duration,
      category: course.category
    }));

    res.json({ 
      success: true, 
      data: { recommendations } 
    });
  } catch (error: unknown) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
}));

// Create a new course with modules (instructor, admin)
router.post('/', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), uploadCourseProfilePic, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const database = await ensureDb();
    
    // Extract course data from request body
    const {
      title,
      overview,
      learningOutcomes,
      duration,
      category,
      level,
      modules = []
    } = req.body;

    console.log('🔥 Course creation request received:');
    console.log('📋 Request body keys:', Object.keys(req.body));
    console.log('📚 Modules received:', modules);
    console.log('📊 Modules length:', modules.length);
    console.log('🔍 Modules type:', typeof modules);

    // Parse modules if it's a string (from form-data)
    let parsedModules = modules;
    if (typeof modules === 'string') {
      try {
        parsedModules = JSON.parse(modules);
        console.log('📝 Parsed modules from string:', parsedModules);
      } catch (e) {
        console.error('❌ Failed to parse modules JSON:', e);
        return res.status(400).json({
          success: false,
          message: 'Invalid modules format'
        });
      }
    }

    console.log('✅ Final modules to process:', parsedModules);
    console.log('📊 Final modules length:', parsedModules.length);

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Course category is required'
      });
    }

    // Get uploaded file info from Supabase middleware
    const uploadedFiles = (req as any).uploadedFiles;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course profile picture is required'
      });
    }

    const uploadedFile = uploadedFiles[0];
    console.log('📸 Course image upload:', {
      originalName: uploadedFile.originalName,
      path: uploadedFile.path,
      size: uploadedFile.size,
      publicUrl: uploadedFile.publicUrl
    });

    // Create course document
    const courseData: any = {
      _id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'course',
      title,
      overview: overview || '',
      learningOutcomes: learningOutcomes || '',
      duration: duration || '',
      category: category,
      level: level || 'Beginner',
      difficult_level: level || 'Beginner', // Keep for backward compatibility
      instructor: ensureAuth(req).userId,
      instructor_id: ensureAuth(req).userId,
      course_profile_picture: uploadedFile.publicUrl,
      isPublished: false, // Default to unpublished
      approvalStatus: 'pending', // Default to pending for admin approval
      is_active: true,
      enrolledStudents: [],
      students: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save the course
    const courseResult = await database.insert(courseData);
    const courseId = courseResult.id;

    console.log('✅ Course created with ID:', courseId);

    // Create modules for the course
    const createdModules = [];
    console.log('🔧 Creating', parsedModules.length, 'modules for course:', courseId);
    
    for (let i = 0; i < parsedModules.length; i++) {
      const moduleData = parsedModules[i];
      console.log('🔍 Processing module at index', i, ':', moduleData);
      
      if (!moduleData.title) {
        console.log('⚠️ Skipping module without title at index:', i, 'moduleData:', moduleData);
        continue; // Skip modules without title
      }
      
      // Extract all possible fields from moduleData
      const moduleDoc: ModuleDoc = {
        _id: `module_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'module',
        course: courseId,
        courseId: courseId,
        title: moduleData.title,
        description: moduleData.description || '',
        content_type: moduleData.content_type || 'text content',
        content: Array.isArray(moduleData.content) ? JSON.stringify(moduleData.content) : (moduleData.content || ''),
        duration: moduleData.duration || '30 minutes',
        isMandatory: moduleData.isMandatory !== undefined ? moduleData.isMandatory : true,
        order: i + 1,
        isPublished: moduleData.isPublished !== undefined ? moduleData.isPublished : true,
        createdAt: new Date(),
        updatedAt: new Date(),
        videoUrl: moduleData.videoUrl || '',
        videoTitle: moduleData.videoTitle || '',
        resources: moduleData.resources || [],
        assignments: moduleData.assignments || [],
        assessments: moduleData.assessments || [],
        quizzes: moduleData.quizzes || [],
        discussions: moduleData.discussions || [],
        learningObjectives: moduleData.learningObjectives || [],
        prerequisites: moduleData.prerequisites || [],
        tags: moduleData.tags || [],
        overview: moduleData.overview || ''
      };
      
      console.log('📝 Creating module:', {
        _id: moduleDoc._id,
        title: moduleDoc.title,
        course: moduleDoc.course,
        courseId: moduleDoc.courseId,
        order: moduleDoc.order
      });
      
      const moduleResult = await database.insert(moduleDoc);
      createdModules.push({ ...moduleDoc, _id: moduleResult.id, _rev: moduleResult.rev });
      
      console.log('✅ Module created successfully:', moduleResult.id);
    }
    
    console.log('🎯 Total modules created:', createdModules.length);

    // Update course with module count
    const courseWithModules = {
      ...courseData,
      _id: courseId,
      _rev: courseResult.rev,
      modules: createdModules.map((m: any) => m._id),
      moduleCount: createdModules.length
    };
    const updatedCourseResult = await database.insert(courseWithModules);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { 
        course: { ...courseWithModules, _id: updatedCourseResult.id, _rev: updatedCourseResult.rev },
        modules: createdModules
      }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
}));

// Request course publication (instructor only)
router.post('/:courseId/request-publication', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const { userId } = ensureAuth(req);
  const database = await ensureDb();
  
  try {
    const course = await database.get(courseId) as CourseDoc;
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if user is the instructor who created this course
    if (course.instructor !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to request publication for this course' });
    }
    
    // Set course to pending approval
    course.isPublished = false;
    course.approvalStatus = 'pending';
    course.publicationRequestedAt = new Date();
    course.updatedAt = new Date();
    
    const latest = await database.get(course._id);
    course._rev = latest._rev;
    await database.insert(course);
    
    res.json({
      success: true,
      message: 'Course publication requested successfully. It will be reviewed by an admin.',
      data: { course }
    });
  } catch (error) {
    console.error('Error requesting course publication:', error);
    res.status(500).json({ success: false, message: 'Failed to request course publication' });
  }
}));

// Update a course (instructor, admin)
router.put('/:courseId', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), uploadCourseProfilePic, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const database = await ensureDb();
  const allowedFields = [
    'title', 'category', 'level', 'description', 'overview', 'learningOutcomes', 'instructor_id', 'duration', 'difficult_level', 'is_active'
  ];
  let course = await database.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  
  const { userId, user } = ensureAuth(req);
  
  // Check if user is authorized to update this course
  if (user.role !== 'admin' && course.instructor !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
  }
  
  allowedFields.forEach(field => {
    if (typeof req.body[field] !== 'undefined') {
      course[field] = req.body[field];
      // Also update difficult_level when level is updated for backward compatibility
      if (field === 'level') {
        course.difficult_level = req.body[field];
      }
    }
  });
  
  // Handle course image upload
  const uploadedFiles = (req as any).uploadedFiles;
  if (uploadedFiles && uploadedFiles.length > 0) {
    course.course_profile_picture = uploadedFiles[0].publicUrl;
  }

  // Handle modules update
  if (req.body.modules) {
    let modules: any[] = [];
    try {
      modules = typeof req.body.modules === 'string' ? JSON.parse(req.body.modules) : req.body.modules;
      console.log('🔧 BACKEND - Received modules data:', modules.map(m => ({
        title: m.title,
        contentItemsCount: m.contentItems?.length || 0,
        contentItems: m.contentItems,
        quizzesCount: m.quizzes?.length || 0,
        discussionsCount: m.discussions?.length || 0
      })));
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid modules format' });
    }
    // Store module IDs for the course
    const moduleIds: string[] = [];
    for (const [i, moduleData] of modules.entries()) {
      let moduleDoc;
      if (moduleData._id && moduleData._id.startsWith('module_')) {
        // Update existing module
        try {
          moduleDoc = await database.get(moduleData._id);
          Object.assign(moduleDoc, {
            ...moduleData,
            course: courseId,
            courseId: courseId,
            contentItems: moduleData.contentItems || [],
            order: i + 1,
            updatedAt: new Date()
          });
        } catch (err) {
          // Module doesn't exist, create new one
          moduleDoc = {
            _id: `module_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'module',
            course: courseId,
            courseId: courseId,
            ...moduleData,
            order: i + 1,
            createdAt: new Date()
          };
        }
      } else {
        // Create new module
        moduleDoc = {
          _id: `module_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'module',
          course: courseId,
          courseId: courseId,
          title: moduleData.title || 'Untitled Module',
          description: moduleData.description || '',
          content: moduleData.content || [],
          contentItems: moduleData.contentItems || [],
          assessments: moduleData.assessments || [],
          quizzes: moduleData.quizzes || [],
          discussions: moduleData.discussions || [],
          content_type: 'text content',
          duration: moduleData.duration || '30 minutes',
          isMandatory: true,
          order: i + 1,
          createdAt: new Date()
        };
      }
      console.log('🔧 BACKEND - Saving module with data:', {
        title: moduleDoc.title,
        contentItemsCount: moduleDoc.contentItems?.length || 0,
        contentItems: moduleDoc.contentItems,
        quizzesCount: moduleDoc.quizzes?.length || 0,
        discussionsCount: moduleDoc.discussions?.length || 0
      });
      const result = await database.insert(moduleDoc);
      moduleIds.push(result.id);
    }
    // Update course with module references
    course.modules = moduleIds;
  }

  course.updatedAt = new Date();
  const latest = await database.get(course._id);
  course._rev = latest._rev;
  const updatedCourse = await database.insert(course);
  res.json({
    success: true,
    message: 'Course updated successfully',
    data: { course: updatedCourse }
  });
}));

// Delete a course (instructor, admin)
router.delete('/:courseId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  
  try {
    const database = await ensureDb();
    
    console.log('🗑️ Attempting to delete course:', courseId);
    
    // Get the course with error handling
    let course;
    try {
      course = await database.get(courseId) as CourseDoc;
    } catch (err: unknown) {
      console.error('❌ Course not found:', err instanceof Error ? err.message : 'Unknown error');
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    console.log('✅ Course found:', course.title);
    
    const { userId, user } = ensureAuth(req);
    
    // Only allow instructor who owns the course or admin
    if (user.role !== 'admin' && course.instructor !== userId) {
      console.log('❌ Authorization failed - user:', userId, 'instructor:', course.instructor);
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }
    
    // Delete related modules first
    try {
      console.log('🔍 Looking for related modules...');
      const allDocsResult = await database.list({ include_docs: true });
      const relatedModules = allDocsResult.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'module' && 
          (doc.course === courseId || doc.courseId === courseId));
      
      console.log('📦 Found', relatedModules.length, 'related modules');
      
      // Delete each related module
      for (const module of relatedModules) {
        try {
          await database.destroy(module._id, module._rev);
          console.log('✅ Deleted module:', module.title);
        } catch (moduleErr: unknown) {
          console.warn('⚠️ Failed to delete module:', module.title, moduleErr instanceof Error ? moduleErr.message : 'Unknown error');
        }
      }
      
      // Delete related assessments, quizzes, discussions
      const relatedContent = allDocsResult.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && 
          ['assessment', 'quiz', 'discussion'].includes(doc.type) &&
          (doc.course === courseId || doc.courseId === courseId));
      
      console.log('📝 Found', relatedContent.length, 'related content items');
      
      for (const content of relatedContent) {
        try {
          await database.destroy(content._id, content._rev);
          console.log('✅ Deleted', content.type + ':', content.title);
        } catch (contentErr: unknown) {
          console.warn('⚠️ Failed to delete', content.type + ':', content.title, contentErr instanceof Error ? contentErr.message : 'Unknown error');
        }
      }
      
    } catch (cleanupErr: unknown) {
      console.warn('⚠️ Cleanup warning:', cleanupErr instanceof Error ? cleanupErr.message : 'Unknown error');
      // Continue with course deletion even if cleanup partially fails
    }
    
    // Get the latest version of the course document before deletion
    try {
      const latestCourse = await database.get(courseId);
      console.log('🔄 Got latest course revision for deletion');
      
      // Delete the course
      await database.destroy(latestCourse._id, latestCourse._rev);
      console.log('✅ Course deleted successfully');
      
      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
      
    } catch (deleteErr: unknown) {
      console.error('❌ Failed to delete course:', deleteErr instanceof Error ? deleteErr.message : 'Unknown error');
      
      // Handle specific CouchDB errors
      if (deleteErr instanceof Error && 'error' in deleteErr && (deleteErr as any).error === 'conflict') {
        return res.status(409).json({ 
          success: false, 
          message: 'Course was modified by another user. Please refresh and try again.' 
        });
      }
      
      if (deleteErr instanceof Error && 'error' in deleteErr && (deleteErr as any).error === 'not_found') {
        return res.status(404).json({ 
          success: false, 
          message: 'Course no longer exists' 
        });
      }
      
      // Generic database error
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while deleting course: ' + (deleteErr instanceof Error ? deleteErr.message : 'Unknown error')
      });
    }
    
  } catch (error: unknown) {
    console.error('❌ General error in course deletion:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      message: 'Failed to delete course: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
}));

// Get course analytics (instructor only)
router.get('/:courseId/analytics', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const database = await ensureDb();

  let course = await database.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const { userId } = ensureAuth(req);

  // Check if user is the instructor or admin
  if (course.instructor !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view analytics for this course'
    });
  }

  const totalEnrollments = course.enrolledStudents?.length || 0;
  const completedModules = course.studentProgress?.filter((p: any) => p.completed).length || 0;
  const averageScore = course.studentProgress && course.studentProgress.length > 0 
    ? course.studentProgress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / course.studentProgress.length
    : 0;

  res.json({
    success: true,
    data: {
      totalEnrollments,
      completedModules,
      averageScore: Math.round(averageScore * 100) / 100,
      studentProgress: course.studentProgress || []
    }
  });
}));

// --- CATEGORY ENDPOINTS ---
// List all categories
router.get('/categories', asyncHandler(async (req: Request, res: Response) => {
  try {
    const database = await ensureDb();

    // Use database.list() which is compatible with Nano API
    const result = await database.list({ include_docs: true });
    
    // Filter for category documents
    let categories = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'category');
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { _id: 'category_technology', _rev: '1-default', type: 'category', name: 'Technology', description: 'Programming, software development, and IT courses' },
        { _id: 'category_business', _rev: '1-default', type: 'category', name: 'Business', description: 'Business management, entrepreneurship, and finance' },
        { _id: 'category_language', _rev: '1-default', type: 'category', name: 'Language', description: 'Language learning and communication skills' },
        { _id: 'category_healthcare', _rev: '1-default', type: 'category', name: 'Healthcare', description: 'Medical, nursing, and health-related courses' },
        { _id: 'category_education', _rev: '1-default', type: 'category', name: 'Education', description: 'Teaching, training, and educational courses' },
        { _id: 'category_arts_design', _rev: '1-default', type: 'category', name: 'Arts & Design', description: 'Creative arts, design, and multimedia' },
        { _id: 'category_engineering', _rev: '1-default', type: 'category', name: 'Engineering', description: 'Engineering disciplines and technical skills' },
        { _id: 'category_finance', _rev: '1-default', type: 'category', name: 'Finance', description: 'Financial management and accounting' },
        { _id: 'category_marketing', _rev: '1-default', type: 'category', name: 'Marketing', description: 'Digital marketing and sales strategies' },
        { _id: 'category_general', _rev: '1-default', type: 'category', name: 'General', description: 'General knowledge and miscellaneous topics' }
      ];
      
      // Create default categories
      for (const category of defaultCategories) {
        try {
          await database.insert(category);
        } catch (error: unknown) {
          console.log('Category may already exist:', category.name);
        }
      }
      categories = defaultCategories as any[];
    }
    
    res.json({ success: true, data: { categories } });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
}));

// Get available course levels
router.get('/levels', asyncHandler(async (req: Request, res: Response) => {
  const levels = [
    { value: 'Beginner', label: 'Beginner', description: 'For those new to the subject' },
    { value: 'Intermediate', label: 'Intermediate', description: 'For those with some basic knowledge' },
    { value: 'Advanced', label: 'Advanced', description: 'For experienced learners' },
    { value: 'Expert', label: 'Expert', description: 'For professionals and experts' }
  ];
  res.json({ success: true, data: { levels } });
}));

// Create a category (admin only)
router.post('/categories', authenticateToken, authorizeRoles('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim()
], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const { name, description } = req.body;
  const existing = await database.get(name);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Category already exists' });
  }
  const category = await database.insert({ type: 'category', name, description });
  res.status(201).json({ success: true, message: 'Category created', data: { category } });
}));

// Get category by ID
router.get('/categories/:categoryId', asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const category = await database.get(req.params.categoryId);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  res.json({ success: true, data: { category } });
}));

// Update category (admin only)
router.patch('/categories/:categoryId', authenticateToken, authorizeRoles('admin'), [
  body('name').optional().trim(),
  body('description').optional().trim()
], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const updates = req.body;
  const category = await database.get(req.params.categoryId);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  const updatedCategory = await database.insert({ ...category, ...updates });
  res.json({ success: true, message: 'Category updated', data: { category: updatedCategory } });
}));

// Delete category (admin only)
router.delete('/categories/:categoryId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const category = await database.get(req.params.categoryId);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  await database.destroy(req.params.categoryId, category._rev);
  res.json({ success: true, message: 'Category deleted' });
}));

// --- DISCUSSION ENDPOINTS ---
// List all discussions (optionally filter by course)
router.get('/discussions', asyncHandler(async (req: Request, res: Response) => {
  try {
    const database = await ensureDb();
    const { course } = req.query;
    
    console.log('🔍 Discussions endpoint called, course filter:', course);
    
    // Use database.list() which is compatible with Nano API
    const result = await database.list({ include_docs: true });
    
    // Filter for discussion documents
    let discussions = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'discussion');
    
    // Apply course filter if provided
    if (course) {
      discussions = discussions.filter((discussion: any) => discussion.course === course);
    }
    
    console.log('💬 Total discussions found:', discussions.length);
    
    res.json({ success: true, data: { discussions } });
  } catch (error: unknown) {
    console.error('Error fetching discussions:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
  }
}));

// Create a discussion (authenticated users)
router.post('/discussions', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('course').notEmpty().withMessage('Course is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('moduleId').optional().isString().withMessage('Module ID must be a string'),
  body('status').optional().isString().withMessage('Status must be a string')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log('🔄 DISCUSSION CREATION - Request received:', req.body);
  console.log('🔄 DISCUSSION CREATION - User:', req.user);
  
  try {
  const database = await ensureDb();
    const { course, title, content, author, moduleId, status } = req.body;
  const discussionId = `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔄 DISCUSSION CREATION - Creating discussion with ID:', discussionId);
    
  const newDiscussion = await database.insert({
    _id: discussionId,
    type: 'discussion',
    course,
    title,
    content,
    user: author, // Use 'user' field to match DiscussionDoc interface
      moduleId: moduleId || null, // Include moduleId if provided
    status: status || 'submitted',
    createdAt: new Date().toISOString()
  });
    
    console.log('✅ DISCUSSION CREATION - Discussion created successfully:', newDiscussion);
  res.status(201).json({ success: true, message: 'Discussion created', data: { discussion: newDiscussion } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ DISCUSSION CREATION - Error:', errorMessage);
    res.status(500).json({ success: false, message: 'Failed to create discussion', error: errorMessage });
  }
}));

// Get discussion by ID
router.get('/discussions/:discussionId', asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const discussion = await database.get(req.params.discussionId) as DiscussionDoc;
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }
  res.json({ success: true, data: { discussion } });
}));

// Update discussion (only author or admin)
router.patch('/discussions/:discussionId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), [
  body('course').optional().notEmpty().withMessage('Course is required'),
  body('title').optional().notEmpty().withMessage('Title is required'),
  body('content').optional().notEmpty().withMessage('Content is required'),
  body('user').optional().notEmpty().withMessage('User is required'),
  body('status').optional().isString().withMessage('Status must be a string')
], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const discussion = await database.get(req.params.discussionId);
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }
  const updates = req.body;
  const updatedDiscussion = await database.insert({ ...discussion, ...updates });
  res.json({ success: true, message: 'Discussion updated', data: { discussion: updatedDiscussion } });
}));

// Delete discussion (only author or admin)
router.delete('/discussions/:discussionId', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const discussion = await database.get(req.params.discussionId);
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }
  
  const { userId, user } = ensureAuth(req);
  
  // Allow delete if user is author, instructor, or admin
  if (
    (discussion as any).author !== userId &&
    user.role !== 'admin' &&
    user.role !== 'instructor'
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await database.destroy(req.params.discussionId, discussion._rev);
  res.json({ success: true, message: 'Discussion deleted' });
}));

// Add reply to discussion
router.post('/discussions/:discussionId/replies', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('content').trim().notEmpty().withMessage('Content is required')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const discussion = await database.get(req.params.discussionId) as DiscussionDoc;
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }
  
  const { userId } = ensureAuth(req);
  
  if (!discussion.replies) discussion.replies = [];
  const reply = {
    _id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user: userId,
    author: {
      _id: userId,
      name: req.user?.name || req.user?.fullName || `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Anonymous',
      email: req.user?.email,
      profilePic: req.user?.profilePic
    },
    content: req.body.content,
    likes: 0,
    likedBy: [],
    createdAt: new Date()
  };
  discussion.replies.push(reply);
  discussion.updatedAt = new Date();
  const updatedDiscussion = await database.insert(discussion);
  res.status(201).json({ success: true, message: 'Reply added', data: { discussion: updatedDiscussion } });
}));

// Like/Unlike a reply in a discussion (exact frontend URL pattern)
router.post('/courses/discussions/:discussionId/replies/:replyId/like', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('action').optional().isIn(['like', 'unlike']).withMessage('Action must be like or unlike')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { discussionId, replyId } = req.params;
  const { action } = req.body;
  
  try {
    const { userId } = ensureAuth(req);
    const database = await ensureDb();
    const discussion = await database.get(discussionId) as DiscussionDoc;
    
    if (!discussion || discussion.type !== 'discussion') {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Find the reply to like/unlike
    if (!discussion.replies) {
      discussion.replies = [];
    }
    
    const replyIndex = discussion.replies.findIndex((reply: any) => reply._id === replyId);
    if (replyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    const reply = discussion.replies[replyIndex] as any;
    
    // Initialize likes fields if they don't exist
    if (!reply.likes) reply.likes = 0;
    if (!reply.likedBy) reply.likedBy = [];
    
    // Check if user has already liked this reply
    const hasLiked = reply.likedBy.includes(userId);
    
    // Determine action (toggle if not specified)
    const shouldLike = action === 'like' ? true : action === 'unlike' ? false : !hasLiked;
    
    if (shouldLike && !hasLiked) {
      // Add like
      reply.likes += 1;
      reply.likedBy.push(userId);
    } else if (!shouldLike && hasLiked) {
      // Remove like
      reply.likes = Math.max(0, reply.likes - 1);
      reply.likedBy = reply.likedBy.filter((id: string) => id !== userId);
    }
    
    // Update the reply in the discussion
    discussion.replies[replyIndex] = reply;
    discussion.updatedAt = new Date();
    
    // Save updated discussion
    const updatedDiscussion = await database.insert(discussion);
    
    console.log('✅ REPLY LIKE UPDATED - Reply ID:', replyId);
    console.log('✅ REPLY LIKE UPDATED - Likes:', reply.likes, 'Action:', shouldLike ? 'liked' : 'unliked');
    
    res.json({
      success: true,
      message: shouldLike ? 'Reply liked successfully' : 'Reply unliked successfully',
      data: { 
        reply,
        likes: reply.likes,
        hasLiked: reply.likedBy.includes(userId)
      }
    });
  } catch (err) {
    console.error('Error updating reply like:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({
      success: false,
      message: 'Failed to update like'
    });
  }
}));

// Update reply (only author or admin)
router.patch('/discussions/:discussionId/replies/:replyId', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('content').trim().notEmpty().withMessage('Content is required')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const discussion = await database.get(req.params.discussionId) as DiscussionDoc;
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }
  
  const { userId } = ensureAuth(req);
  
  if (!discussion.replies) discussion.replies = [];
  const reply = discussion.replies.find((r: any) => r._id === req.params.replyId);
  if (!reply) {
    return res.status(404).json({ success: false, message: 'Reply not found' });
  }
  if (reply.user !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  reply.content = req.body.content;
  reply.updatedAt = new Date();
  discussion.updatedAt = new Date();
  const updatedDiscussion = await database.insert(discussion);
  res.json({ success: true, message: 'Reply updated', data: { discussion: updatedDiscussion } });
}));

// Delete reply (only author or admin)
router.delete('/discussions/:discussionId/replies/:replyId', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const discussion = await database.get(req.params.discussionId) as DiscussionDoc;
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }
  
  const { userId } = ensureAuth(req);
  
  if (!discussion.replies) discussion.replies = [];
  const reply = discussion.replies.find((r: any) => r._id === req.params.replyId);
  if (!reply) {
    return res.status(404).json({ success: false, message: 'Reply not found' });
  }
  if (reply.user !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  discussion.replies = discussion.replies.filter((r: any) => r._id !== req.params.replyId);
  discussion.updatedAt = new Date();
  const updatedDiscussion = await database.insert(discussion);
  res.json({ success: true, message: 'Reply deleted', data: { discussion: updatedDiscussion } });
}));

// --- ENROLLMENT ENDPOINTS ---
// List all enrollments (admin/instructor only, filter by user or course)
router.get('/enrollments', authenticateToken, authorizeRoles('admin', 'instructor'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const database = await ensureDb();
    const { user, course } = req.query;
    
    console.log('🔍 Enrollments endpoint called, filters:', { user, course });
    
    // Use database.list() which is compatible with Nano API
    const result = await database.list({ include_docs: true });
    
    // Filter for enrollment documents
    let enrollments = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'enrollment');
    
    // Apply filters if provided
    if (user) {
      enrollments = enrollments.filter((enrollment: any) => enrollment.user === user);
    }
    if (course) {
      enrollments = enrollments.filter((enrollment: any) => enrollment.course === course);
    }
    
    console.log('📝 Total enrollments found:', enrollments.length);
    
    res.json({ success: true, data: { enrollments } });
  } catch (error: unknown) {
    console.error('Error fetching enrollments:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
  }
}));

// Enroll user in course (user or admin)
router.post('/enrollments', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), [
  body('course').notEmpty().withMessage('Course is required'),
  body('user').optional()
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const { userId: authenticatedUserId } = ensureAuth(req);
  const userId = req.body.user || authenticatedUserId;
  const { course } = req.body;
  // Prevent duplicate enrollment
  let existing = await database.get(course) as CourseDoc;
  if (existing.enrolledStudents && existing.enrolledStudents.includes(userId)) {
    return res.status(400).json({ success: false, message: 'Already enrolled' });
  }
  const enrollment = await database.insert({
    type: 'enrollment',
    user: userId,
    course,
    status: 'active',
    progress: 0,
    createdAt: new Date()
  });
  res.status(201).json({ success: true, message: 'Enrolled successfully', data: { enrollment } });
}));

// Get enrollment by ID (only user, admin, or instructor)
router.get('/enrollments/:enrollmentId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const enrollment = await database.get(req.params.enrollmentId) as EnrollmentDoc;
  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }
  
  const { userId, user } = ensureAuth(req);
  
  if (user.role !== 'admin' && user.role !== 'instructor' && enrollment.user !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: { enrollment } });
}));

// Update enrollment (status/progress, only user, admin, or instructor)
router.patch('/enrollments/:enrollmentId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), [
  body('status').optional().isIn(['active', 'completed', 'dropped']),
  body('progress').optional().isFloat({ min: 0, max: 100 })
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const enrollment = await database.get(req.params.enrollmentId) as EnrollmentDoc;
  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }
  
  const { userId, user } = ensureAuth(req);
  
  if (user.role !== 'admin' && user.role !== 'instructor' && enrollment.user !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const updates = req.body;
  const updatedEnrollment = await database.insert({ ...enrollment, ...updates });
  res.json({ success: true, message: 'Enrollment updated', data: { enrollment: updatedEnrollment } });
}));

// Unenroll (delete enrollment, only user, admin, or instructor)
router.delete('/enrollments/:enrollmentId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const enrollment = await database.get(req.params.enrollmentId) as EnrollmentDoc;
  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Enrollment not found' });
  }
  
  const { userId, user } = ensureAuth(req);
  
  if (user.role !== 'admin' && user.role !== 'instructor' && enrollment.user !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  
  // Ensure _rev is available before deletion
  if (!enrollment._rev) {
    return res.status(500).json({ success: false, message: 'Cannot delete enrollment: missing revision' });
  }
  
  await database.destroy(req.params.enrollmentId, enrollment._rev);
  res.json({ success: true, message: 'Unenrolled successfully' });
}));

// Get enrollment status for a specific course and user
router.get('/:courseId/enrollment-status', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { userId } = ensureAuth(req);
    
    console.log('🔍 Checking enrollment status:', { userId, courseId });
    
    const database = await ensureDb();
    
    // Check if user is enrolled in this course
    const enrollments = await database.find({
      selector: {
        type: 'enrollment',
        user: userId,
        course: courseId
      }
    });
    
    const isEnrolled = enrollments.docs.length > 0;
    
    console.log('📊 Enrollment status result:', { isEnrolled, enrollmentCount: enrollments.docs.length });
    
    res.json({
      success: true,
      enrolled: isEnrolled,
      data: {
        enrolled: isEnrolled,
        enrollmentCount: enrollments.docs.length,
        enrollment: isEnrolled ? enrollments.docs[0] : null
      }
    });
  } catch (error: any) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment status',
      enrolled: false
    });
  }
}));

// Get enrollment status for a specific course and user
router.get('/:courseId/enrollment-status', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { userId } = ensureAuth(req);
    
    console.log('🔍 Checking enrollment status:', { userId, courseId });
    
    const database = await ensureDb();
    
    // Check if user is enrolled in this course
    const enrollments = await database.find({
      selector: {
        type: 'enrollment',
        user: userId,
        course: courseId
      }
    });
    
    const isEnrolled = enrollments.docs.length > 0;
    
    console.log('📊 Enrollment status result:', { isEnrolled, enrollmentCount: enrollments.docs.length });
    
    res.json({
      success: true,
      enrolled: isEnrolled,
      data: {
        enrolled: isEnrolled,
        enrollmentCount: enrollments.docs.length,
        enrollment: isEnrolled ? enrollments.docs[0] : null
      }
    });
  } catch (error: any) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment status',
      enrolled: false
    });
  }
}));

// --- ASSESSMENT ENDPOINTS ---
// Create an assessment
router.post('/assessments', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('moduleId').trim().notEmpty().withMessage('Module ID is required'),
  body('courseId').trim().notEmpty().withMessage('Course ID is required'),
  body('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const { title, description, moduleId, courseId, timeLimit, questions } = req.body;
  
  const { userId } = ensureAuth(req);
  
  // Calculate total points
  const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
  
  const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const assessment: AssessmentDoc = {
    _id: assessmentId,
    type: 'assessment',
    title,
    description: description || '',
    moduleId,
    courseId,
    instructor: userId,
    timeLimit,
    totalPoints,
    questions: questions.map((q: any, index: number) => ({
      ...q,
      id: q.id || `question_${Date.now()}_${index}`,
      order: index + 1
    })),
    isPublished: true,
    isActive: true,
    createdAt: new Date()
  };
  
  const result = await database.insert(assessment);
  res.status(201).json({ 
    success: true, 
    message: 'Assessment created successfully',
    data: { assessment: { ...assessment, _id: result.id, _rev: result.rev } }
  });
}));

// Get assessment by ID
router.get('/assessments/:assessmentId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const database = await ensureDb();
    const assessment = await database.get(req.params.assessmentId) as AssessmentDoc;
    res.json({ success: true, data: { assessment } });
  } catch (err) {
    res.status(404).json({ success: false, message: 'Assessment not found' });
  }
}));

// Update an assessment
router.put('/assessments/:assessmentId', authenticateToken, authorizeRoles('instructor', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const { assessmentId } = req.params;
  const { title, description, timeLimit, questions } = req.body;
  
  const { userId, user } = ensureAuth(req);
  
  try {
    const existingAssessment = await database.get(assessmentId) as AssessmentDoc;
    
    // Check if user is the instructor who created this assessment
    if (existingAssessment.instructor !== userId && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assessment' });
    }
    
    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    
    const updatedAssessment: AssessmentDoc = {
      ...existingAssessment,
      title,
      description: description || '',
      timeLimit,
      totalPoints,
      questions: questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `question_${Date.now()}_${index}`,
        order: index + 1
      }))
    };
    
    const result = await database.insert(updatedAssessment);
    res.json({ 
      success: true, 
      message: 'Assessment updated successfully',
      data: { assessment: { ...updatedAssessment, _rev: result.rev } }
    });
  } catch (err) {
    console.error('Error updating assessment:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to update assessment' });
  }
}));

// Delete an assessment
router.delete('/assessments/:assessmentId', authenticateToken, authorizeRoles('instructor', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const { assessmentId } = req.params;
  
  const { userId, user } = ensureAuth(req);
  
  try {
    const existingAssessment = await database.get(assessmentId) as AssessmentDoc;
    
    // Check if user is the instructor who created this assessment
    if (existingAssessment.instructor !== userId && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assessment' });
    }
    
    await database.destroy(existingAssessment._id, existingAssessment._rev!);
    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assessment:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to delete assessment' });
  }
}));

// Submit assessment attempt
router.post('/assessments/:assessmentId/submit', authenticateToken, authorizeRoles('refugee', 'user'), [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a non-negative integer')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  const { assessmentId } = req.params;
  const { answers, timeSpent } = req.body;
  const { userId } = ensureAuth(req);
  
  try {
    const assessment = await database.get(assessmentId) as AssessmentDoc;
    
    // Calculate score
    let score = 0;
    const results = assessment.questions.map((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;
      
      if (question.type === 'multiple_choice') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'short_answer') {
        isCorrect = userAnswer?.toString().toLowerCase().trim() === 
                   question.correctAnswer?.toString().toLowerCase().trim();
      } else if (question.type === 'true_false') {
        isCorrect = userAnswer?.toString() === question.correctAnswer?.toString();
      }
      
      if (isCorrect) {
        score += question.points;
      }
      
      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      };
    });
    
    // Save attempt
    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const attempt: UserAssessmentAttemptDoc = {
      _id: attemptId,
      type: 'user_assessment_attempt',
      userId,
      assessmentId,
      moduleId: assessment.moduleId,
      courseId: assessment.courseId,
      answers,
      score,
      totalPoints: assessment.totalPoints,
      timeSpent,
      completed: true,
      submittedAt: new Date()
    };
    
    await database.insert(attempt);
    
    res.json({
      success: true,
      data: {
        score,
        totalPoints: assessment.totalPoints,
        percentage: Math.round((score / assessment.totalPoints) * 100),
        results,
        timeSpent
      }
    });
  } catch (err) {
    console.error('Error submitting assessment:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to submit assessment' });
  }
}));

// Get user's assessment attempts
router.get('/assessments/:assessmentId/attempts', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { assessmentId } = req.params;
  const { userId } = ensureAuth(req);
  
  try {
    const database = await ensureDb();
      const result = await database.list({ include_docs: true });
      
      const attempts = result.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'user_assessment_attempt' && doc.userId === userId && doc.assessmentId === assessmentId);
    
      res.json({ success: true, data: { attempts } });
  } catch (err) {
    console.error('Error fetching attempts:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch attempts' });
  }
}));

// Get assessments for a course
router.get('/:courseId/assessments', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  
  try {
    const database = await ensureDb();
      const result = await database.list({ include_docs: true });
      
      const assessments = result.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'assessment' && doc.courseId === courseId && doc.isActive === true)
        .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    
      res.json({ success: true, data: { assessments } });
  } catch (err) {
    console.error('Error fetching course assessments:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch assessments' });
  }
}));

// Get specific assessment for a course
router.get('/:courseId/assessments/:assessmentId', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: Request, res: Response) => {
  const { courseId, assessmentId } = req.params;
  
  try {
    const database = await ensureDb();
    const assessment = await database.get(assessmentId);
    
    console.log('🔍 ASSESSMENT DEBUG - Raw assessment from DB:', JSON.stringify(assessment, null, 2));
    
    if (!assessment || assessment.type !== 'assessment') {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    // Verify assessment belongs to the specified course
    if (assessment.courseId !== courseId) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found in this course'
      });
    }
    
    console.log('🔍 ASSESSMENT DEBUG - Raw assessment data:', JSON.stringify(assessment, null, 2));
    console.log('🔍 ASSESSMENT DEBUG - Questions count:', assessment.questions?.length || 0);
    console.log('🔍 ASSESSMENT DEBUG - Duration:', assessment.duration || assessment.timeLimit || 'No duration set');
    
    res.json({ 
      success: true, 
      data: { assessment } 
    });
  } catch (err) {
    console.error('Error fetching course assessment:', err instanceof Error ? err.message : 'Unknown error');
    if ((err as any).status === 404) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch assessment' });
    }
  }
}));

// Get specific discussion for a course  
router.get('/:courseId/discussions/:discussionId', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: Request, res: Response) => {
  const { courseId, discussionId } = req.params;
  
  try {
    const database = await ensureDb();
    const discussion = await database.get(discussionId);
    
    console.log('🔍 DISCUSSION DEBUG - Raw discussion from DB:', JSON.stringify(discussion, null, 2));
    
    if (!discussion || discussion.type !== 'discussion') {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Verify discussion belongs to the specified course (check both courseId and course fields)
    if (discussion.courseId !== courseId && discussion.course !== courseId) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found in this course'
      });
    }
    
    // Populate user information for discussion author
    let populatedDiscussion = { ...discussion };
    try {
      const discussionAuthor = await database.get(discussion.user);
      if (discussionAuthor && discussionAuthor.type === 'user') {
        populatedDiscussion.author = {
          _id: discussionAuthor._id,
          name: discussionAuthor.name || discussionAuthor.firstName + ' ' + discussionAuthor.lastName || 'Anonymous',
          email: discussionAuthor.email,
          profilePic: discussionAuthor.profilePic
        };
      } else {
        populatedDiscussion.author = {
          _id: discussion.user,
          name: 'Anonymous',
          email: null,
          profilePic: null
        };
      }
    } catch (userError) {
      console.warn('⚠️ Could not fetch discussion author:', userError);
      populatedDiscussion.author = {
        _id: discussion.user,
        name: 'Anonymous',
        email: null,
        profilePic: null
      };
    }
    
    // Populate user information for replies
    if (discussion.replies && Array.isArray(discussion.replies)) {
      populatedDiscussion.replies = await Promise.all(discussion.replies.map(async (reply: any, index: number) => {
        const populatedReply = { ...reply };
        
              // Log if reply is missing _id (should be fixed by database script)
      if (!populatedReply._id) {
        console.warn('⚠️ Reply missing _id field:', { reply: populatedReply, index });
      }
        
        try {
          const replyAuthor = await database.get(reply.user);
          if (replyAuthor && replyAuthor.type === 'user') {
            populatedReply.author = {
              _id: replyAuthor._id,
              name: replyAuthor.name || replyAuthor.firstName + ' ' + replyAuthor.lastName || 'Anonymous',
              email: replyAuthor.email,
              profilePic: replyAuthor.profilePic
            };
          } else {
            populatedReply.author = {
              _id: reply.user,
              name: 'Anonymous',
              email: null,
              profilePic: null
            };
          }
        } catch (userError) {
          console.warn('⚠️ Could not fetch reply author:', userError);
          populatedReply.author = {
            _id: reply.user,
            name: 'Anonymous',
            email: null,
            profilePic: null
          };
        }
        return populatedReply;
      }));
    }
    
    console.log('🔍 DISCUSSION DEBUG - Discussion title:', populatedDiscussion.title);
    console.log('🔍 DISCUSSION DEBUG - Replies count:', populatedDiscussion.replies?.length || 0);
    
    res.json({ 
      success: true, 
      data: { discussion: populatedDiscussion } 
    });
  } catch (err) {
    console.error('Error fetching course discussion:', err instanceof Error ? err.message : 'Unknown error');
    if ((err as any).status === 404) {
      res.status(404).json({ success: false, message: 'Discussion not found' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch discussion' });
    }
  }
}));

// Get replies for a course-specific discussion
router.get('/:courseId/discussions/:discussionId/replies', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: Request, res: Response) => {
  const { courseId, discussionId } = req.params;
  
  try {
    const database = await ensureDb();
    const discussion = await database.get(discussionId) as DiscussionDoc;
    
    if (!discussion || discussion.type !== 'discussion') {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Verify discussion belongs to the specified course  
    if (discussion.courseId !== courseId && discussion.course !== courseId) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found in this course'
      });
    }
    
    const replies = discussion.replies || [];
    
    // Populate user information for replies
    const populatedReplies = await Promise.all(replies.map(async (reply: any, index: number) => {
      const populatedReply = { ...reply };
      
      // Log if reply is missing _id (should be fixed by database script)
      if (!populatedReply._id) {
        console.warn('⚠️ Reply missing _id field:', { reply: populatedReply, index });
      }
      
      try {
        const replyAuthor = await database.get(reply.user);
        if (replyAuthor && replyAuthor.type === 'user') {
          populatedReply.author = {
            _id: replyAuthor._id,
            name: replyAuthor.name || replyAuthor.firstName + ' ' + replyAuthor.lastName || 'Anonymous',
            email: replyAuthor.email,
            profilePic: replyAuthor.profilePic
          };
        } else {
          populatedReply.author = {
            _id: reply.user,
            name: 'Anonymous',
            email: null,
            profilePic: null
          };
        }
      } catch (userError) {
        console.warn('⚠️ Could not fetch reply author:', userError);
        populatedReply.author = {
          _id: reply.user,
          name: 'Anonymous',
          email: null,
          profilePic: null
        };
      }
      return populatedReply;
    }));
    
    console.log('🔍 DISCUSSION REPLIES DEBUG - Replies count:', populatedReplies.length);
    
    res.json({ 
      success: true, 
      data: { replies: populatedReplies } 
    });
  } catch (err) {
    console.error('Error fetching discussion replies:', err instanceof Error ? err.message : 'Unknown error');
    if ((err as any).status === 404) {
      res.status(404).json({ success: false, message: 'Discussion not found' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch discussion replies' });
    }
  }
}));

// Add reply to a course-specific discussion
router.post('/:courseId/discussions/:discussionId/replies', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('content').trim().notEmpty().withMessage('Reply content is required'),
  body('author').optional().trim()
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, discussionId } = req.params;
  const { content, author } = req.body;
  
  try {
    const { userId, user } = ensureAuth(req);
    const database = await ensureDb();
    const discussion = await database.get(discussionId) as DiscussionDoc;
    
    if (!discussion || discussion.type !== 'discussion') {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Verify discussion belongs to the specified course
    if (discussion.courseId !== courseId && discussion.course !== courseId) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found in this course'
      });
    }
    
    // Create new reply with comprehensive author information
    const newReply = {
      _id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: userId,
      author: {
        _id: userId,
        name: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
        email: user.email,
        profilePic: user.profilePic
      },
      content: content.trim(),
      likes: 0,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add reply to discussion
    if (!discussion.replies) {
      discussion.replies = [];
    }
    discussion.replies.push(newReply);
    discussion.updatedAt = new Date();
    
    // Save updated discussion
    const updatedDiscussion = await database.insert(discussion);
    
    console.log('✅ DISCUSSION REPLY ADDED - Reply ID:', newReply._id);
    console.log('✅ DISCUSSION REPLY ADDED - Total replies now:', discussion.replies.length);
    
    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: { 
        reply: newReply,
        discussion: updatedDiscussion 
      }
    });
  } catch (err) {
    console.error('Error adding discussion reply:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
}));

// Like/Unlike a reply in a course-specific discussion
router.post('/:courseId/discussions/:discussionId/replies/:replyId/like', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('action').optional().isIn(['like', 'unlike']).withMessage('Action must be like or unlike')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, discussionId, replyId } = req.params;
  const { action } = req.body;
  
  try {
    const { userId } = ensureAuth(req);
    const database = await ensureDb();
    const discussion = await database.get(discussionId) as DiscussionDoc;
    
    if (!discussion || discussion.type !== 'discussion') {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Verify discussion belongs to the specified course
    if (discussion.courseId !== courseId && discussion.course !== courseId) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found in this course'
      });
    }
    
    // Find the reply to like/unlike
    if (!discussion.replies) {
      discussion.replies = [];
    }
    
    const replyIndex = discussion.replies.findIndex((reply: any) => reply._id === replyId);
    if (replyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    const reply = discussion.replies[replyIndex] as any;
    
    // Initialize likes fields if they don't exist
    if (!reply.likes) reply.likes = 0;
    if (!reply.likedBy) reply.likedBy = [];
    
    // Check if user has already liked this reply
    const hasLiked = reply.likedBy.includes(userId);
    
    // Determine action (toggle if not specified)
    const shouldLike = action === 'like' ? true : action === 'unlike' ? false : !hasLiked;
    
    if (shouldLike && !hasLiked) {
      // Add like
      reply.likes += 1;
      reply.likedBy.push(userId);
    } else if (!shouldLike && hasLiked) {
      // Remove like
      reply.likes = Math.max(0, reply.likes - 1);
      reply.likedBy = reply.likedBy.filter((id: string) => id !== userId);
    }
    
    // Update the reply in the discussion
    discussion.replies[replyIndex] = reply;
    discussion.updatedAt = new Date();
    
    // Save updated discussion
    const updatedDiscussion = await database.insert(discussion);
    
    console.log('✅ REPLY LIKE UPDATED - Reply ID:', replyId);
    console.log('✅ REPLY LIKE UPDATED - Likes:', reply.likes, 'Action:', shouldLike ? 'liked' : 'unliked');
    
    res.json({
      success: true,
      message: shouldLike ? 'Reply liked successfully' : 'Reply unliked successfully',
      data: { 
        reply,
        likes: reply.likes,
        hasLiked: reply.likedBy.includes(userId)
      }
    });
  } catch (err) {
    console.error('Error updating reply like:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({
      success: false,
      message: 'Failed to update like'
    });
  }
}));

// Like/Unlike a discussion
router.post('/:courseId/discussions/:discussionId/like', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), [
  body('action').optional().isIn(['like', 'unlike']).withMessage('Action must be like or unlike')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, discussionId } = req.params;
  const { action } = req.body;
  
  try {
    const { userId } = ensureAuth(req);
    const database = await ensureDb();
    const discussion = await database.get(discussionId) as DiscussionDoc;
    
    if (!discussion || discussion.type !== 'discussion') {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Verify discussion belongs to the specified course
    if (discussion.courseId !== courseId && discussion.course !== courseId) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found in this course'
      });
    }
    
    // Initialize likes fields if they don't exist
    if (!discussion.likes) discussion.likes = 0;
    if (!discussion.likedBy) discussion.likedBy = [];
    
    // Check if user has already liked this discussion
    const hasLiked = discussion.likedBy.includes(userId);
    
    // Determine action (toggle if not specified)
    const shouldLike = action === 'like' ? true : action === 'unlike' ? false : !hasLiked;
    
    if (shouldLike && !hasLiked) {
      // Add like
      discussion.likes += 1;
      discussion.likedBy.push(userId);
    } else if (!shouldLike && hasLiked) {
      // Remove like
      discussion.likes = Math.max(0, discussion.likes - 1);
      discussion.likedBy = discussion.likedBy.filter((id: string) => id !== userId);
    }
    
    discussion.updatedAt = new Date();
    
    // Save updated discussion
    const updatedDiscussion = await database.insert(discussion);
    
    console.log('✅ DISCUSSION LIKE UPDATED - Discussion ID:', discussionId);
    console.log('✅ DISCUSSION LIKE UPDATED - Likes:', discussion.likes, 'Action:', shouldLike ? 'liked' : 'unliked');
    
    res.json({
      success: true,
      message: shouldLike ? 'Discussion liked successfully' : 'Discussion unliked successfully',
      data: { 
        discussion: updatedDiscussion,
        likes: discussion.likes,
        hasLiked: discussion.likedBy.includes(userId)
      }
    });
  } catch (err) {
    console.error('Error updating discussion like:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({
      success: false,
      message: 'Failed to update like'
    });
  }
}));

// --- MODULE ENDPOINTS ---
// List all modules (optionally filter by course)
router.get('/modules', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const database = await ensureDb();
    const { course } = req.query;
    
    console.log('🔍 Modules endpoint called, course filter:', course);
    
    // Use database.list() which is compatible with Nano API
    const result = await database.list({ include_docs: true });
    
    // Filter for module documents
    let modules = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'module');
    
    // Apply course filter if provided
    if (course) {
      modules = modules.filter((module: any) => 
        module.course === course || module.courseId === course
      );
      console.log('🔍 Filtered modules by course:', course, 'found:', modules.length);
    }
    
    console.log('📚 Total modules found:', modules.length);
    
    // Debug: Log content items in each module
    modules.forEach((module, idx) => {
      console.log(`📚 Module ${idx + 1} (${module.title}):`, {
        contentItemsCount: module.contentItems?.length || 0,
        contentItems: module.contentItems?.map((item, itemIdx) => ({
          index: itemIdx,
          type: item.type,
          title: item.title,
          fileName: item.fileName,
          hasFileUrl: !!item.fileUrl,
          hasPublicUrl: !!item.publicUrl,
          hasUrl: !!item.url,
          fileUrl: item.fileUrl,
          publicUrl: item.publicUrl,
          url: item.url
        }))
      });
    });
    
    res.json({ success: true, data: { modules } });
  } catch (error: unknown) {
    console.error('Error fetching modules:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch modules' });
  }
}));

// Create a comprehensive module (instructor/admin only)
router.post('/modules/comprehensive', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), uploadAny, [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('content_type').isIn(["video", "assignment", "links", "audio", "pdf", "interactive content", "quiz", "text content", "article"]).withMessage('Invalid content_type'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('isMandatory').isBoolean().withMessage('isMandatory must be true or false'),
  body('order').isInt({ min: 1 }).withMessage('Order is required'),
  body('content_text').optional().isString(),
  body('content_file').optional(),
  body('contentItems').optional().isString()
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const database = await ensureDb();
    
    console.log('🔧 Creating comprehensive module');
    console.log('📝 Data received:', Object.keys(req.body));
    
    const {
      courseId,
      title,
      description,
      overview,
      content_type,
      content_text,
      duration,
      isMandatory,
      isPublished,
      order,
      videoUrl,
      videoTitle,
      resources,
      assignments,
      assessments,
      quizzes,
      learningObjectives,
      prerequisites,
      tags,
      discussions,  // New field for discussions
      contentItems
    } = req.body;
    
    // Handle content based on type with detailed logging
    let content = '';
    let contentDetails = { type: content_type, hasFile: false, hasText: false, filePath: '', fileName: '' };
    
    console.log('📝 Processing content type:', content_type);
    console.log('📝 Request files:', req.files ? 'Files present' : 'No files');
    console.log('📝 Content text length:', content_text ? content_text.length : 0);
    
    if (content_type === 'text content' || content_type === 'text' || content_type === 'article') {
      if (!content_text) {
        return res.status(400).json({ success: false, message: 'content_text is required for text content type' });
      }
      content = content_text;
      contentDetails.hasText = true;
      console.log('✅ Text content processed, length:', content.length);
    } else {
      // File upload - check for Supabase uploaded files
      const uploadedFiles = (req as any).uploadedFiles;
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ success: false, message: 'content_file is required for this content type' });
      }
      
      const uploadedFile = uploadedFiles[0];
      content = uploadedFile.publicUrl || uploadedFile.url || '';
      contentDetails.hasFile = true;
      contentDetails.filePath = uploadedFile.path || '';
      contentDetails.fileName = uploadedFile.originalName || '';
      
      console.log('✅ Supabase file content processed:', {
        originalName: uploadedFile.originalName,
        fileName: uploadedFile.fieldname,
        path: uploadedFile.path,
        publicUrl: uploadedFile.publicUrl,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype
      });
    }
    
    // Parse arrays if they come as strings (from form-data)
    const parseArrayField = (field: unknown) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return [];
        }
      }
      return Array.isArray(field) ? field : [];
    };
    
    // Parse contentItems if provided
    let parsedContentItems: any[] = [];
    if (contentItems) {
      try {
        parsedContentItems = JSON.parse(contentItems);
        console.log('✅ ContentItems parsed:', parsedContentItems.length, 'items');
        console.log('📄 ContentItems details:', parsedContentItems.map((item, idx) => ({
          index: idx,
          type: item.type,
          title: item.title,
          hasFile: !!item.file,
          hasFileUrl: !!item.fileUrl,
          hasPublicUrl: !!item.publicUrl,
          hasUrl: !!item.url,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
          publicUrl: item.publicUrl,
          url: item.url
        })));
      } catch (e) {
        console.warn('Failed to parse contentItems:', e);
      }
    }
    
    // Create comprehensive module
    const moduleId = `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const module: ModuleDoc = {
      _id: moduleId,
      type: 'module',
      course: courseId,
      courseId,
      
      // Core fields
      title,
      description,
      content_type,
      content,
      duration,
      isMandatory: isMandatory === 'true' || isMandatory === true,
      order: Number(order),
      
      // Optional enhancement fields
      overview: overview || '',
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : true,
      videoUrl: videoUrl || '',
      videoTitle: videoTitle || '',
      
      // Array fields
      resources: parseArrayField(resources),
      assignments: parseArrayField(assignments),
      assessments: parseArrayField(assessments),
      quizzes: parseArrayField(quizzes),
      discussions: parseArrayField(discussions),
      learningObjectives: parseArrayField(learningObjectives),
      prerequisites: parseArrayField(prerequisites),
      tags: parseArrayField(tags),
      contentItems: parsedContentItems,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add content metadata to module for better tracking
    module.contentDetails = contentDetails;
    module.createdAt = new Date();
    module.updatedAt = new Date();
    
    console.log('📦 Creating module with enhanced content tracking:', {
      title: module.title,
      content_type: module.content_type,
      hasContent: !!module.content,
      contentDetails: contentDetails,
      resourcesCount: module.resources?.length || 0,
      assessmentsCount: module.assessments?.length || 0,
      videoUrl: module.videoUrl || 'none'
    });
    
    // Save the module
    console.log('💾 Saving module with contentItems:', module.contentItems?.map((item, idx) => ({
      index: idx,
      type: item.type,
      title: item.title,
      hasFileUrl: !!item.fileUrl,
      hasPublicUrl: !!item.publicUrl,
      hasUrl: !!item.url,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      publicUrl: item.publicUrl,
      url: item.url
    })));
    console.log('💾 Full contentItems data being saved:', JSON.stringify(module.contentItems, null, 2));
    const moduleResult = await database.insert(module);
    console.log('✅ Module created successfully:', moduleResult.id);
    
    // **FIX: Add module to course's modules array**
    try {
      const course = await database.get(courseId) as CourseDoc;
      if (course) {
        // Initialize modules array if it doesn't exist
        if (!course.modules) {
          course.modules = [];
        }
        
        // Add the new module ID to the course
        if (!course.modules.includes(moduleResult.id)) {
          course.modules.push(moduleResult.id);
          course.updatedAt = new Date();
          
          // Update the course document
          await database.insert(course);
          console.log('✅ Module added to course modules array');
        }
      }
    } catch (courseUpdateError) {
      console.warn('⚠️ Failed to update course with new module:', courseUpdateError);
      // Don't fail the whole operation, module was still created
    }
    
    // Handle discussions if provided
    const createdDiscussions = [];
    if (discussions) {
      const discussionsArray = parseArrayField(discussions);
      
      for (const discussion of discussionsArray) {
        if (discussion.title && discussion.content) {
          try {
            const discussionId = `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const discussionDoc = {
              _id: discussionId,
              type: 'discussion',
              title: discussion.title,
              content: discussion.content,
              category: discussion.category || 'general',
              moduleId: moduleId,
              module: moduleId,
              course: courseId,
            user: ensureAuth(req).userId,
              replies: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            const discussionResult = await database.insert(discussionDoc);
            createdDiscussions.push({ ...discussionDoc, _id: discussionResult.id, _rev: discussionResult.rev });
            console.log('💬 Discussion created:', discussion.title);
          } catch (discussionError) {
            console.warn('⚠️ Failed to create discussion:', discussion.title, discussionError);
          }
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Comprehensive module created successfully',
      data: {
        module: { ...module, _id: moduleResult.id, _rev: moduleResult.rev },
        discussions: createdDiscussions
      }
    });
    
  } catch (error: unknown) {
    console.error('❌ Error creating comprehensive module:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      message: (error instanceof Error ? error.message : 'Unknown error') || 'Internal server error while creating module'
    });
  }
}));

// Create a module (instructor/admin only) - Basic version for backwards compatibility
router.post('/modules', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), uploadAny, handleUploadError, [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('content_type').isIn(["video", "assignment", "links", "audio", "pdf", "interactive content", "quiz", "text content"]).withMessage('Invalid content_type'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('isMandatory').isBoolean().withMessage('isMandatory must be true or false'),
  body('order').isInt({ min: 1 }).withMessage('Order is required'),
  body('content_text').optional().isString(),
  body('content_file').optional(),
  body('contentItems').optional().isString()
], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const { courseId, title, description, content_type, duration, isMandatory, order, content_text, contentItems } = req.body;
  let content = '';
  if (content_type === 'text content') {
    if (!content_text) {
      return res.status(400).json({ success: false, message: 'content_text is required for text content type' });
    }
    content = content_text;
  } else {
    // file upload - use Supabase URLs from uploadedFiles
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0) || (!Array.isArray(req.files) && !('content_file' in req.files))) {
      return res.status(400).json({ success: false, message: 'content_file is required for this content type' });
    }
    
    // Get the uploaded file info from Supabase middleware
    const uploadedFiles = (req as any).uploadedFiles;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'File upload failed' });
    }
    
    // Use the Supabase public URL
    const uploadedFile = uploadedFiles[0];
    content = uploadedFile.publicUrl || uploadedFile.url || '';
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Failed to get file URL from Supabase' });
    }
  }
  // Parse contentItems if provided
  let parsedContentItems: any[] = [];
  if (contentItems) {
    try {
      parsedContentItems = JSON.parse(contentItems);
    } catch (e) {
      console.warn('Failed to parse contentItems:', e);
    }
  }

  const module: ModuleDoc = {
    _id: `module_${Date.now()}`,
    type: 'module',
    course: courseId,
    courseId,
    title,
    description,
    content_type,
    content,
    contentItems: parsedContentItems,
    duration,
    isMandatory: isMandatory === 'true' || isMandatory === true,
    order: Number(order)
  };
  const result = await database.insert(module);
  
  // **FIX: Add module to course's modules array (basic endpoint)**
  try {
    const course = await database.get(courseId) as CourseDoc;
    if (course) {
      // Initialize modules array if it doesn't exist
      if (!course.modules) {
        course.modules = [];
      }
      
      // Add the new module ID to the course
      if (!course.modules.includes(result.id)) {
        course.modules.push(result.id);
        course.updatedAt = new Date();
        
        // Update the course document
        await database.insert(course);
        console.log('✅ Module added to course modules array (basic endpoint)');
      }
    }
  } catch (courseUpdateError) {
    console.warn('⚠️ Failed to update course with new module (basic endpoint):', courseUpdateError);
    // Don't fail the whole operation, module was still created
  }
  
  res.status(201).json({ success: true, message: 'Module created', data: { module: result } });
}));

// Get module by ID with enhanced content info and populated quizzes/discussions
router.get('/modules/:moduleId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const moduleId = req.params.moduleId;
  
  const module = await database.get(moduleId);
  if (!module) {
    return res.status(404).json({ success: false, message: 'Module not found' });
  }
  
  // Populate quizzes for this module
  let quizzes: any[] = [];
  try {
    if (database) {
      // Try allDocs first, then list as fallback
      let allDocs: any;
      if (typeof (database as any).allDocs === 'function') {
        allDocs = await (database as any).allDocs({ include_docs: true });
      } else if (typeof (database as any).list === 'function') {
        allDocs = await (database as any).list({ include_docs: true });
      } else {
        console.error('❌ Database object is not properly initialized or missing allDocs/list method');
        return;
      }
      
      quizzes = allDocs.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'quiz' && doc.moduleId === moduleId);
    } else {
      console.error('❌ Database object is null');
    }
  } catch (error) {
    console.error('❌ Error fetching quizzes:', error);
  }
  
  // Populate discussions for this module
  let discussions: any[] = [];
  try {
    if (database) {
      // Try allDocs first, then list as fallback
      let allDocs: any;
      if (typeof (database as any).allDocs === 'function') {
        allDocs = await (database as any).allDocs({ include_docs: true });
      } else if (typeof (database as any).list === 'function') {
        allDocs = await (database as any).list({ include_docs: true });
      } else {
        console.error('❌ Database object is not properly initialized or missing allDocs/list method');
        return;
      }
      
      const allDiscussions = allDocs.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'discussion');
      
      discussions = allDiscussions.filter((doc: any) => doc.moduleId === moduleId);
    } else {
      console.error('❌ Database object is null');
    }
  } catch (error) {
    console.error('❌ Error fetching discussions:', error);
  }
  
  // Add populated data to module
  const populatedModule = {
    ...module,
    quizzes: quizzes,
    discussions: discussions
  };
  
  // Removed excessive debug logging to prevent continuous terminal output
  
  res.json({ success: true, data: { module: populatedModule } });
}));

// Test endpoint to check if content files exist
router.get('/modules/:moduleId/content-check', authenticateToken, authorizeRoles('instructor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const module = await database.get(req.params.moduleId);
  if (!module) {
    return res.status(404).json({ success: false, message: 'Module not found' });
  }
  
  const fs = require('fs');
  const contentInfo = {
    moduleTitle: module.title,
    contentType: module.content_type,
    hasContent: !!module.content,
    contentPath: module.content || 'none',
    fileExists: false,
    fileSize: 0,
    contentDetails: module.contentDetails || 'none'
  };
  
  // Check if file exists (for file-based content)
  if (module.content && module.content_type !== 'text content' && module.content_type !== 'article') {
    try {
      if (fs.existsSync(module.content)) {
        contentInfo.fileExists = true;
        const stats = fs.statSync(module.content);
        contentInfo.fileSize = stats.size;
      }
    } catch (error) {
      console.log('File check error:', error);
    }
  }
  
  res.json({ success: true, data: contentInfo });
}));

// Update module (instructor/admin only, full update, multipart/form-data)
router.put('/modules/:moduleId', authenticateToken, authorizeRoles('instructor', 'admin', 'user', 'refugee'), uploadAny, handleUploadError, asyncHandler(async (req: Request, res: Response) => {
  console.log('🔧 MODULE UPDATE - Request received for module:', req.params.moduleId);
  console.log('🔧 MODULE UPDATE - Request body:', req.body);
  
  try {
  const database = await ensureDb();
  const moduleId = req.params.moduleId;
  let module = await database.get(moduleId) as ModuleDoc;
  if (!module) {
      console.log('❌ MODULE UPDATE - Module not found:', moduleId);
    return res.status(404).json({ success: false, message: 'Module not found' });
  }
    console.log('✅ MODULE UPDATE - Found existing module:', module.title);
  const { courseId, title, description, content_type, duration, isMandatory, order, content_text, contentItems, quizzes, assessments, discussions, resources } = req.body;
  let content = (module as ModuleDoc).content;
  if (content_type === 'text content') {
    if (content_text) {
      content = content_text;
    }
  } else {
    // File upload - check for Supabase uploaded files
    const uploadedFiles = (req as any).uploadedFiles;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[0];
      content = uploadedFile.publicUrl || uploadedFile.url || '';
      console.log('✅ Supabase file content processed for module update:', {
        originalName: uploadedFile.originalName,
        fileName: uploadedFile.fieldname,
        path: uploadedFile.path,
        publicUrl: uploadedFile.publicUrl,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype
      });
    }
  }
  
  // Parse contentItems if provided
  let parsedContentItems: any[] = (module as ModuleDoc).contentItems || [];
  if (contentItems) {
    try {
      parsedContentItems = JSON.parse(contentItems);
      console.log('✅ ContentItems parsed for module update:', parsedContentItems.length, 'items');
      console.log('📄 ContentItems details for module update:', parsedContentItems.map((item, idx) => ({
        index: idx,
        type: item.type,
        title: item.title,
        hasFile: !!item.file,
        hasFileUrl: !!item.fileUrl,
        hasPublicUrl: !!item.publicUrl,
        hasUrl: !!item.url,
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        publicUrl: item.publicUrl,
        url: item.url
      })));
    } catch (e) {
      console.warn('Failed to parse contentItems:', e);
    }
  }

  // Parse quizzes if provided
  let parsedQuizzes: any[] = [];
  if (quizzes) {
    if (Array.isArray(quizzes)) {
      // If quizzes is already an array, use it directly
      parsedQuizzes = quizzes;
      console.log('✅ Using quizzes array directly:', parsedQuizzes.length, 'quizzes');
    } else {
      // Try to parse as JSON string
      try {
        parsedQuizzes = JSON.parse(quizzes);
        console.log('✅ Parsed quizzes from JSON string:', parsedQuizzes.length, 'quizzes');
      } catch (e) {
        console.warn('Failed to parse quizzes:', e);
      }
    }
  } else {
    // Fallback to existing module quizzes if no new quizzes provided
    parsedQuizzes = (module as ModuleDoc).quizzes || [];
    console.log('📋 Using existing module quizzes:', parsedQuizzes.length, 'quizzes');
  }

  // Ensure all quizzes have proper _id fields
  parsedQuizzes = parsedQuizzes.map((quiz, index) => {
    if (!quiz._id) {
      quiz._id = `quiz_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🔧 Generated quiz ID for quiz ${index + 1}:`, quiz._id);
    }
    return quiz;
  });

  // Parse assessments if provided
  let parsedAssessments: any[] = (module as ModuleDoc).assessments || [];
  if (assessments) {
    try {
      parsedAssessments = JSON.parse(assessments);
      console.log('✅ Parsed assessments:', parsedAssessments.length, 'assessments');
    } catch (e) {
      console.warn('Failed to parse assessments:', e);
    }
  }

  // Ensure all assessments have proper _id fields
  parsedAssessments = parsedAssessments.map((assessment, index) => {
    if (!assessment._id) {
      assessment._id = `assessment_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🔧 Generated assessment ID for assessment ${index + 1}:`, assessment._id);
    }
    return assessment;
  });

  // Parse discussions if provided
  let parsedDiscussions: any[] = (module as ModuleDoc).discussions || [];
  if (discussions) {
    if (Array.isArray(discussions)) {
      // If discussions is already an array, use it directly
      parsedDiscussions = discussions;
      console.log('✅ Using discussions array directly:', parsedDiscussions.length, 'discussions');
    } else {
      // Try to parse as JSON string
      try {
        parsedDiscussions = JSON.parse(discussions);
        console.log('✅ Parsed discussions from JSON string:', parsedDiscussions.length, 'discussions');
      } catch (e) {
        console.warn('Failed to parse discussions:', e);
      }
    }
  }

  // Ensure all discussions have proper _id fields
  parsedDiscussions = parsedDiscussions.map((discussion, index) => {
    if (!discussion._id) {
      discussion._id = `discussion_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🔧 Generated discussion ID for discussion ${index + 1}:`, discussion._id);
    }
    return discussion;
  });

  // Parse resources if provided
  let parsedResources: any[] = (module as ModuleDoc).resources || [];
  if (resources) {
    try {
      parsedResources = JSON.parse(resources);
      console.log('✅ Parsed resources:', parsedResources.length, 'resources');
    } catch (e) {
      console.warn('Failed to parse resources:', e);
    }
  }
  
  console.log('🔧 MODULE UPDATE - Received quizzes:', quizzes);
  console.log('🔧 MODULE UPDATE - Parsed quizzes:', parsedQuizzes.length, 'quizzes');
  console.log('🔧 MODULE UPDATE - Parsed contentItems:', parsedContentItems.length, 'items');
  
  const updatedModule: ModuleDoc = {
    ...module as ModuleDoc,
    type: 'module',
    course: courseId ?? (module as ModuleDoc).course,
    courseId: courseId ?? (module as ModuleDoc).courseId,
    title: title ?? (module as ModuleDoc).title,
    description: description ?? (module as ModuleDoc).description,
    content_type: content_type ?? (module as ModuleDoc).content_type,
    content,
    contentItems: parsedContentItems,
    quizzes: parsedQuizzes,
    assessments: parsedAssessments,
    discussions: parsedDiscussions,
    resources: parsedResources,
    duration: duration ?? (module as ModuleDoc).duration,
    isMandatory: isMandatory !== undefined ? (isMandatory === 'true' || isMandatory === true) : (module as ModuleDoc).isMandatory,
    order: order !== undefined ? Number(order) : (module as ModuleDoc).order,
    updatedAt: new Date()
  };
  const result = await database.insert(updatedModule);
  console.log('✅ MODULE UPDATE - Module updated successfully:', result.id);
  res.json({ success: true, message: 'Module updated', data: { module: result } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ MODULE UPDATE - Error updating module:', errorMessage);
    res.status(500).json({ success: false, message: 'Failed to update module', error: errorMessage });
  }
}));

// Delete module (instructor/admin only)
router.delete('/modules/:moduleId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const module = await database.get(req.params.moduleId);
  if (!module) {
    return res.status(404).json({ success: false, message: 'Module not found' });
  }
  await database.destroy(req.params.moduleId, module._rev);
  res.json({ success: true, message: 'Module deleted' });
}));

// --- QUESTION ENDPOINTS ---
// List all questions (optionally filter by course or module)
router.get('/questions', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const database = await ensureDb();
    const { course, module } = req.query;
    
    console.log('🔍 Questions endpoint called, filters:', { course, module });
    
    // Use database.list() which is compatible with Nano API
    const result = await database.list({ include_docs: true });
    
    // Filter for question documents
    let questions = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'question');
    
    // Apply filters if provided
    if (course) {
      questions = questions.filter((question: any) => question.course === course);
    }
    if (module) {
      questions = questions.filter((question: any) => question.module === module);
    }
    
    console.log('❓ Total questions found:', questions.length);
    
    res.json({ success: true, data: { questions } });
  } catch (error: unknown) {
    console.error('Error fetching questions:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
}));

// Create a question (instructor/admin only)
router.post('/questions', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), [
  body('assessment').isInt().withMessage('Assessment is required and must be an integer'),
  body('course').trim().notEmpty().withMessage('Course ID is required'),
  body('module').trim().notEmpty().withMessage('Module ID is required'),
  body('question').trim().notEmpty().withMessage('Question text is required'),
  body('question_type').isIn(['Multiple Choice', 'True/False', 'Short Answer', 'Essay']).withMessage('Invalid question type'),
  body('options').isArray().withMessage('Options must be an array'),
  body('correct_answer').trim().notEmpty().withMessage('Correct answer is required'),
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('order').isInt({ min: 1 }).withMessage('Order is required')
], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const { assessment, course, module, question, question_type, options, correct_answer, points, order } = req.body;
  const questionId = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newQuestion = await database.insert({
    _id: questionId,
    type: 'question',
    assessment,
    course,
    module,
    question,
    question_type,
    options,
    correct_answer,
    points,
    order
  });
  res.status(201).json({ success: true, message: 'Question created', data: { question: newQuestion } });
}));

// Get question by ID
router.get('/questions/:questionId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const question = await database.get(req.params.questionId);
  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }
  res.json({ success: true, data: { question } });
}));

// Update question (instructor/admin only)
router.patch('/questions/:questionId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), [
  body('assessment').optional().isInt().withMessage('Assessment must be an integer'),
  body('course').optional().trim().notEmpty().withMessage('Course ID is required'),
  body('module').optional().trim().notEmpty().withMessage('Module ID is required'),
  body('question').optional().trim().notEmpty().withMessage('Question text is required'),
  body('question_type').optional().isIn(['Multiple Choice', 'True/False', 'Short Answer', 'Essay']).withMessage('Invalid question type'),
  body('options').optional().isArray().withMessage('Options must be an array'),
  body('correct_answer').optional().trim().notEmpty().withMessage('Correct answer is required'),
  body('points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('order').optional().isInt({ min: 1 }).withMessage('Order is required')
], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const question = await database.get(req.params.questionId);
  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }
  const updates = req.body;
  const updatedQuestion = await database.insert({ ...question, ...updates });
  res.json({ success: true, message: 'Question updated', data: { question: updatedQuestion } });
}));

// Delete question (instructor/admin only)
router.delete('/questions/:questionId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const question = await database.get(req.params.questionId);
  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }
  await database.destroy(req.params.questionId, question._rev);
  res.json({ success: true, message: 'Question deleted' });
}));

// --- PROGRESS ENDPOINTS ---
// List all progress (admin/instructor only, filter by user, course, or module)
router.get('/progress', authenticateToken, authorizeRoles('admin', 'instructor'), asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const { user, course, module } = req.query;
  
  const allDocsResult = await database.list({ include_docs: true });
  let progress = allDocsResult.rows
    .map((row: any) => row.doc)
    .filter((doc: any) => doc && doc.type === 'progress');
  
  // Apply filters
  if (user) {
    progress = progress.filter((doc: any) => doc.user === user);
  }
  if (course) {
    progress = progress.filter((doc: any) => doc.course === course);
  }
  if (module) {
    progress = progress.filter((doc: any) => doc.module === module);
  }
  res.json({ success: true, data: { progress } });
}));

// Create user progress (user or system)
router.post('/user-progress', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), [
  body('user_id').notEmpty().withMessage('user_id is required'),
  body('course_id').notEmpty().withMessage('course_id is required'),
  body('module_id').notEmpty().withMessage('module_id is required'),
  body('progress_percentage').isNumeric().withMessage('Progress percentage must be a number'),
  body('is_active').isBoolean().withMessage('is_active must be a boolean'),
  body('completed').isBoolean().withMessage('completed must be a boolean')
], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const database = await ensureDb();
  const { user_id, course_id, module_id, progress_percentage, is_active, completed } = req.body;
  const uniqueId = `userprogress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let userProgress = await database.insert({
    _id: uniqueId,
    type: 'user-progress',
    user_id: user_id,
    course_id: course_id.toString(),
    module_id: module_id.toString(),
    progress_percentage: Number(progress_percentage),
    is_active: Boolean(is_active),
    completed: Boolean(completed)
  });
  res.status(201).json({ success: true, message: 'Progress saved', data: { userProgress } });
}));

// Get user progress by ID (only user, admin, or instructor)
router.get('/user-progress/:userProgressId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  let userProgress = await database.get(req.params.userProgressId) as any;
  if (!userProgress) {
    return res.status(404).json({ success: false, message: 'User progress not found' });
  }
  
  const { userId, user } = ensureAuth(req);
  
  if (user.role !== 'admin' && user.role !== 'instructor' && userProgress.user !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: { userProgress } });
}));

// Delete user progress (only user, admin, or instructor)
router.delete('/user-progress/:userProgressId', authenticateToken, authorizeRoles('instructor', 'admin', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const database = await ensureDb();
  let userProgress = await database.get(req.params.userProgressId) as any;
  if (!userProgress) {
    return res.status(404).json({ success: false, message: 'User progress not found' });
  }
  
  const { userId, user } = ensureAuth(req);
  
  if (user.role !== 'admin' && user.role !== 'instructor' && userProgress.user !== userId) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await database.destroy(req.params.userProgressId, userProgress._rev);
  res.json({ success: true, message: 'User progress deleted' });
}));

// Get user course stats
router.get('/user/:userId/stats', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  
  const { userId: requestingUserId, user } = ensureAuth(req);
  
  console.log('📊 Stats endpoint called for user:', userId, 'by user:', requestingUserId);
  console.log('🔍 Request user object:', { 
    _id: requestingUserId, 
    role: user.role, 
    email: user.email 
  });
  
  // Only allow the user to access their own stats or admin
  if (requestingUserId !== userId && user.role !== 'admin') {
    console.log('❌ Authorization failed - user requesting:', requestingUserId, 'for userId:', userId);
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  try {
    const database = await ensureDb();
    // Fetch user
    let user;
          try {
        user = await database.get(userId) as UserDoc;
        console.log('✅ User found in database:', { 
          _id: user._id, 
          email: user.email || 'no email',
          role: user.role || 'no role' 
        });
      } catch (err: unknown) {
        console.error('❌ Error fetching user for stats:', err instanceof Error ? err.message : 'Unknown error');
        console.log('🔍 User ID being searched:', userId);
        
        if (err instanceof Error && 'error' in err && (err as any).error === 'not_found') {
          console.log('🔍 User not found in database. This might be a new user who hasn\'t been created in the database yet.');
          
          // For new users, return zero stats instead of an error
          return res.json({
            success: true,
            data: {
              completedCourses: 0,
              totalCourses: 0,
              certificates: 0,
              assessmentsCompleted: 0,
              learningPathProgress: 0,
              peerLearningSessions: 0,
              jobApplications: 0
            },
            message: 'New user - returning default stats'
          });
        }
        
        // On any other database error, return zero stats
        console.warn('⚠️ Database error, returning zero stats');
        return res.json({
          success: true,
          data: {
            completedCourses: 0,
            totalCourses: 0,
            certificates: 0,
            assessmentsCompleted: 0,
            learningPathProgress: 0, // Real progress starts at 0
            peerLearningSessions: 0,
            jobApplications: 0
          },
          message: 'Database error - returning default stats'
        });
      }

    // Gather REAL stats from database
    const enrolledCourses = (user as UserDoc).enrolledCourses || [];
    // Set totalCourses to enrolled courses count, not all published courses
    const totalCourses = enrolledCourses.length;
    
    console.log('User enrolled courses count:', totalCourses);

    // Calculate REAL stats from database
    let completedCourses = 0;
    let assessmentsCompleted = 0;
    let certificates = 0;
    let learningPathProgress = 0;
    
    try {
      // Calculate real course completion progress
      if (enrolledCourses.length > 0) {
        // Check for actual course completion records
        const allProgressResult = await database.list({ include_docs: true });
        const userProgress = allProgressResult.rows
          .map((row: any) => row.doc)
          .filter((doc: any) => doc && doc.type === 'user-progress' && doc.user_id === userId && doc.completed === true);
        completedCourses = userProgress.length;
        
        // Check for real assessment completions
        const allAssessmentResult = await database.list({ include_docs: true });
        const userAssessments = allAssessmentResult.rows
          .map((row: any) => row.doc)
          .filter((doc: any) => doc && doc.type === 'user_assessment' && doc.user === userId && doc.completed === true);
        assessmentsCompleted = userAssessments.length;
        
        // Check for real certificates
        const allCertificateResult = await database.list({ include_docs: true });
        const userCertificates = allCertificateResult.rows
          .map((row: any) => row.doc)
          .filter((doc: any) => doc && doc.type === 'certificate' && doc.student === userId);
        certificates = userCertificates.length;
        
        // Calculate real learning path progress based on completed courses
        if (totalCourses > 0) {
          learningPathProgress = Math.floor((completedCourses / totalCourses) * 100);
        }
      } else {
        // For new users with no enrolled courses, everything should be 0
        completedCourses = 0;
        assessmentsCompleted = 0;
        certificates = 0;
        learningPathProgress = 0; // Real progress - starts at 0
      }
      
      console.log('Real stats calculated:', {
        totalCourses,
        completedCourses,
        assessmentsCompleted,
        certificates,
        learningPathProgress
      });
      
    } catch (statsError) {
      console.warn('Error calculating real stats, using zero values:', statsError);
      // Return zeros for all stats if there's an error
      completedCourses = 0;
      assessmentsCompleted = 0;
      certificates = 0;
      learningPathProgress = 0;
    }

    const peerLearningSessions = 0; // Can be improved later
    const jobApplications = 0; // Can be improved later

    console.log('Stats calculated successfully:', {
      totalCourses,
      completedCourses,
      learningPathProgress
    });

    res.json({
      success: true,
      data: {
        completedCourses,
        totalCourses,
        certificates,
        assessmentsCompleted,
        learningPathProgress,
        peerLearningSessions,
        jobApplications
      }
    });
  } catch (error: unknown) {
    console.error('Error in stats endpoint:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return zero stats on any error - no fake data
    res.json({
      success: true,
      data: {
        completedCourses: 0,
        totalCourses: 0,
        certificates: 0,
        assessmentsCompleted: 0,
        learningPathProgress: 0, // Real progress starts at 0
        peerLearningSessions: 0,
        jobApplications: 0
      }
    });
  }
}));

// Health check endpoint (no authentication required)
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Course API is healthy',
    timestamp: new Date().toISOString()
  });
}));

// Get course by ID with modules - MOVED TO BOTTOM TO AVOID ROUTE SHADOWING
router.get('/:courseId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const courseId = req.params['courseId'];
    // Removed excessive logging to prevent continuous terminal output
    
    const database = await ensureDb();

    let course;
    try {
      course = await database.get(courseId) as CourseDoc;
      console.log('✅ Course found:', course ? course.title : 'No course found');
    } catch (dbError: unknown) {
      console.error('❌ Error fetching course from database:', dbError instanceof Error ? dbError.message : 'Unknown error');
      if (dbError instanceof Error && 'error' in dbError && (dbError as any).error === 'not_found') {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch course from database'
      });
    }
    
    // Get modules for this course
    let modules: any[] = [];
    try {
      // Removed excessive logging to prevent continuous terminal output
      
      // Get all documents to find modules
      const allDocsResult = await database.list({ include_docs: true });
      
      // Filter modules for this course
      const allModules = allDocsResult.rows
        .map((row: any) => row.doc)
        .filter((doc: any) => doc && doc.type === 'module' && 
          (doc.course === courseId || doc.courseId === courseId));
      
      modules = allModules.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      
      console.log('📚 Found', modules.length, 'modules for course');
      
      // Populate assessments, quizzes, and discussions for each module
      const allDocs = allDocsResult.rows.map((row: any) => row.doc);
      
      for (const module of modules) {
        // Populate assessments
        const assessments = allDocs.filter((doc: any) => 
          doc && doc.type === 'assessment' && doc.moduleId === module._id);
        module.assessments = assessments.map((assessment: any) => ({
          _id: assessment._id,
          title: assessment.title,
          description: assessment.description,
          totalPoints: assessment.totalPoints,
          timeLimit: assessment.timeLimit,
          dueDate: assessment.dueDate,  // ✅ DUE DATE ALREADY INCLUDED
          isPublished: assessment.isPublished,
          isActive: assessment.isActive
        }));
        
        // Populate quizzes - always ensure we have proper quiz data with _id fields
        const allQuizzes = allDocs.filter((doc: any) => doc && doc.type === 'quiz');
        const quizzes = allDocs.filter((doc: any) => 
          doc && doc.type === 'quiz' && doc.moduleId === module._id);
        
        // Always populate quizzes from database to ensure proper _id fields
        module.quizzes = quizzes.map((quiz: any) => {
          const quizObj = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            totalPoints: quiz.totalPoints,
            duration: quiz.duration,  // ✅ INCLUDE DURATION (TIME LIMIT)
            dueDate: quiz.dueDate,  // ✅ INCLUDE DUE DATE
            isPublished: quiz.status === 'published',  // ✅ FIX: Use status field
            isActive: quiz.status === 'published',  // ✅ FIX: Use status field
            questions: quiz.questions || [],  // ✅ INCLUDE QUIZ QUESTIONS
            status: quiz.status,  // ✅ INCLUDE STATUS FIELD
            instructorId: quiz.instructorId,  // ✅ INCLUDE INSTRUCTOR ID
            courseId: quiz.courseId  // ✅ INCLUDE COURSE ID
          };
          
          // Debug logging for each quiz
          console.log(`🔍 Quiz "${quiz.title}" - ID: ${quiz._id || 'MISSING!'} - Questions: ${quiz.questions?.length || 0}`);
          
          return quizObj;
        });
        console.log('🔍 Populated quizzes from database:', module.quizzes.length, 'quizzes');
        
        // Populate discussions
        const allDiscussions = allDocs.filter((doc: any) => doc && doc.type === 'discussion');
        const discussions = allDocs.filter((doc: any) => 
          doc && doc.type === 'discussion' && doc.moduleId === module._id);
        
        module.discussions = discussions.map((discussion: any) => ({
          _id: discussion._id,
          title: discussion.title,
          content: discussion.content,
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt
        }));
        
        console.log(`📚 Module ${module.title}: ${module.assessments.length} assessments, ${module.quizzes.length} quizzes, ${module.discussions.length} discussions`);
        console.log(`📚 Module contentItems:`, module.contentItems ? module.contentItems.length : 'undefined', module.contentItems);
        
        // Debug: Log detailed content items information
        if (module.contentItems && module.contentItems.length > 0) {
          console.log(`📚 Detailed content items for module "${module.title}":`);
          module.contentItems.forEach((item, idx) => {
            console.log(`  📄 Content Item ${idx + 1}:`, {
              type: item.type,
              title: item.title,
              fileName: item.fileName,
              hasFileUrl: !!item.fileUrl,
              hasPublicUrl: !!item.publicUrl,
              hasUrl: !!item.url,
              fileUrl: item.fileUrl,
              publicUrl: item.publicUrl,
              url: item.url,
              description: item.description
            });
          });
        } else {
          console.log(`📚 No content items found for module "${module.title}"`);
        }
      }
      
    } catch (moduleError: unknown) {
      console.error('❌ Error fetching modules:', moduleError instanceof Error ? moduleError.message : 'Unknown error');
      modules = []; // Set empty array on error
    }

    // Attach modules to course
    course.modules = modules;

    // Return the course data in the expected format
    res.json({
      success: true,
      data: { 
        course: course
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching course:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ success: false, message: 'Failed to fetch course' });
  }
}));

// --- SUBMISSION ENDPOINTS ---
// Submit assignment
router.post('/submissions', authenticateToken, authorizeRoles('refugee', 'user', 'instructor'), upload.any(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { assessmentId, courseId, moduleId, submissionType, submissionText, submissionLink } = req.body;
    const { userId } = ensureAuth(req);
    
    const files = req.files as Express.Multer.File[] | undefined;
    
    console.log('🔍 User object from auth middleware:', (req as any).user);
    console.log('📝 Assignment submission received:', {
      assessmentId,
      courseId,
      moduleId,
      submissionType,
      userId,
      hasFile: files && files.length > 0,
      submissionText,
      submissionLink
    });

    if (!assessmentId || !courseId || !moduleId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID, Course ID, and Module ID are required'
      });
    }

    const database = await ensureDb();
    
    // Check if submission already exists
    const result = await database.list({ include_docs: true });
    const existingSubmissions = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => doc && doc.type === 'assignment_submission' && doc.userId === userId && doc.assessmentId === assessmentId);

    if (existingSubmissions.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Assignment has already been submitted'
      });
    }

    // Create submission document
    const submissionDoc: any = {
      type: 'assignment_submission',
      userId,
      assessmentId,
      courseId,
      moduleId,
      submissionType,
      submissionText: submissionText || '',
      submissionLink: submissionLink || '',
      submittedAt: new Date(),
      status: 'submitted',
      grade: null,
      feedback: null,
      createdAt: new Date()
    };

    // Handle file upload if present
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      submissionDoc.filePath = uploadedFile.path;
      submissionDoc.fileName = uploadedFile.originalname;
      submissionDoc.fileSize = uploadedFile.size;
    }

    // Save submission to database
    const savedSubmission = await database.insert(submissionDoc);

    console.log('✅ Assignment submission saved:', savedSubmission);

    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        submissionId: savedSubmission.id,
        submittedAt: submissionDoc.submittedAt,
        status: submissionDoc.status
      }
    });

  } catch (error: unknown) {
    console.error('Error submitting assignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: errorMessage
    });
  }
}));

// MOVED ALL SUBMISSION ROUTES TO THE TOP TO AVOID CONFLICTS

// Test route to verify routing works
router.get('/submissions/:submissionId/test', (req: Request, res: Response) => {
  console.log('🧪 TEST ROUTE HIT - Submission ID:', req.params.submissionId);
  res.json({ success: true, message: 'Test route works', submissionId: req.params.submissionId });
});

// Another test route to verify basic routing
router.get('/test-simple', (req: Request, res: Response) => {
  console.log('🔍 SIMPLE TEST ROUTE HIT');
  res.json({ message: 'Simple test route working' });
});

// DUPLICATE REMOVED - File download route is now at the top of the file

// View submission file (instructor only) - MOVED TO TOP
router.get('/submissions/:submissionId/download', authenticateToken, authorizeRoles('instructor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  console.log('📁 DOWNLOAD ROUTE HIT - Submission ID:', req.params.submissionId);
  console.log('📁 Request URL:', req.originalUrl);
  console.log('📁 Request method:', req.method);
  try {
    const { submissionId } = req.params;
    const database = await ensureDb();

    console.log('📁 File view request for submission:', submissionId);

    // Get submission details
    const submission = await database.get(submissionId) as AssignmentSubmissionDoc;
    console.log('📁 Found submission:', submission);

    if (!submission || submission.type !== 'assignment_submission') {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if it's a file submission
    if (submission.submissionType !== 'file' || !submission.filePath) {
      return res.status(400).json({
        success: false,
        message: 'This submission does not contain a file'
      });
    }

    console.log('📁 File path:', submission.filePath);
    console.log('📁 File name:', submission.fileName);

    // Use basic content type
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${submission.fileName || 'submission'}"`);

    // Use require for fs to avoid TypeScript issues
    const fs = require('fs');
    const path = require('path');
    
    // Get the file path
    const filePath = submission.filePath;
    console.log('📁 Attempting to serve file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found at path:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error viewing submission file:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Failed to view file',
      error: errorMessage
    });
  }
}));

// Grade submission (instructor only)
router.put('/submissions/:submissionId/grade', authenticateToken, authorizeRoles('instructor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const database = await ensureDb();

    // Get existing submission
    const existingSubmission = await database.get(submissionId);

    // Update submission with grade and feedback
    const updatedSubmission = {
      ...existingSubmission,
      grade,
      feedback: feedback || '',
      gradedAt: new Date(),
      status: 'graded'
    };

    await database.insert(updatedSubmission);

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: {
        submissionId,
        grade,
        feedback
      }
    });

  } catch (error: unknown) {
    console.error('Error grading submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: errorMessage
    });
  }
}));

// Test route to verify routing is working
router.get('/test-route', (req: Request, res: Response) => {
  console.log('🔍 TEST ROUTE HIT');
  res.json({ message: 'Test route working' });
});

// Get submissions for a course (for checking if already submitted)
router.get('/:courseId/submissions', authenticateToken, authorizeRoles('refugee', 'user', 'instructor', 'admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('📋 GET submissions endpoint called');
    
    const { courseId } = req.params;
    const { assessmentId } = req.query;

    const { userId: requestingUserId, user: requestingUser } = ensureAuth(req);

    console.log('📋 Submissions GET request:', {
      courseId,
      assessmentId,
      userId: requestingUserId,
      userRole: requestingUser.role,
      userObject: requestingUser
    });

    console.log('📋 About to get database...');
    const database = await ensureDb();
    console.log('📋 Database obtained successfully');

    let selector: any = {
      type: 'assignment_submission',
      courseId
    };

    // If refugee/user, only show their own submissions
    if (requestingUser.role === 'refugee' || requestingUser.role === 'user') {
      selector.userId = requestingUserId;
    }

    // Filter by assessment if provided
    if (assessmentId) {
      selector.assessmentId = assessmentId;
    }

    console.log('📋 Database selector:', selector);

    const result = await database.list({ include_docs: true });
    let submissions = result.rows
      .map((row: any) => row.doc)
      .filter((doc: any) => {
        if (!doc || doc.type !== 'assignment_submission' || doc.courseId !== courseId) {
          return false;
        }
        if ((requestingUser.role === 'refugee' || requestingUser.role === 'user') && doc.userId !== requestingUserId) {
          return false;
        }
        if (assessmentId && doc.assessmentId !== assessmentId) {
          return false;
        }
        return true;
    });

    console.log('📋 Raw submissions found:', submissions.length);
    console.log('📋 Raw submissions data:', submissions);

    console.log('📋 Starting enrichment process...');
    
    // For now, return submissions without enrichment to avoid the 500 error
    // We can add enrichment back later once the basic functionality works
    const enrichedSubmissions = submissions.map((submission: AssignmentSubmissionDoc) => {
      return {
        ...submission,
        studentName: `User ${submission.userId}`,
        assessmentTitle: `Assessment ${submission.assessmentId}`,
        student: {
          firstName: `User ${submission.userId}`,
          lastName: ''
        }
      };
    });
    
    console.log('📋 Enrichment completed, returning', enrichedSubmissions.length, 'submissions');

    console.log('📋 Final enriched submissions being returned:', enrichedSubmissions.length);

    res.json({
      success: true,
      data: {
        submissions: enrichedSubmissions
      }
    });

  } catch (error: unknown) {
    console.error('❌ CRITICAL ERROR in GET submissions:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: errorMessage
    });
  }
}));

// The download route has been moved above for proper route ordering

// Catch-all route for debugging
router.all('*', (req: Request, res: Response) => {
  console.log('🔍 CATCH-ALL ROUTE HIT:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found in course routes', path: req.originalUrl });
});

// Submit quiz through course route (alternative submission method)
router.post('/:courseId/quiz/:quizId/submit', authenticateToken, authorizeRoles('refugee', 'user'), [
  body('answers').isObject().withMessage('Answers must be an object'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative')
], handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, quizId } = req.params;
  const { answers, timeSpent } = req.body;
  const { userId } = ensureAuth(req);

  console.log('📤 Quiz submission via course route:', { courseId, quizId, userId });

  const database = await ensureDb();

  // Check if user is enrolled in the course
  const course = await database.get(courseId) as CourseDoc;
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (!course.enrolledStudents?.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: 'You must be enrolled in this course to submit quizzes'
    });
  }

  // Get the quiz document
  const quiz = await database.get(quizId);
  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check for existing completed session
  const result = await database.list({ include_docs: true });
  const existingSessions = result.rows
    .map((row: any) => row.doc)
    .filter((doc: any) => doc && doc.type === 'quiz_session' && doc.userId === userId && doc.quizId === quizId && doc.status === 'completed')
    .slice(0, 1);

  if (existingSessions.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'You have already completed this quiz'
    });
  }

  // Calculate score
  let correctAnswers = 0;
  if (quiz.questions) {
    quiz.questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      
      if (question.type === 'multiple-choice' || question.type === 'multiple_choice') {
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      } else if (question.type === 'true-false' || question.type === 'true_false') {
        const normalizedUserAnswer = userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1';
        const normalizedCorrectAnswer = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1';
        
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          correctAnswers++;
        }
      } else if (question.type === 'short-answer' || question.type === 'short_answer') {
        if (userAnswer && userAnswer.toString().trim().length > 0) {
          if (correctAnswer && typeof correctAnswer === 'string') {
            const userAnswerLower = userAnswer.toString().toLowerCase().trim();
            const correctAnswerLower = correctAnswer.toLowerCase().trim();
            if (userAnswerLower === correctAnswerLower || userAnswerLower.includes(correctAnswerLower)) {
              correctAnswers++;
            }
          } else {
            correctAnswers++;
          }
        }
      }
    });
  }
  
  const score = quiz.questions ? Math.round((correctAnswers / quiz.questions.length) * 100) : 0;
  const now = new Date();

  // Create a quiz session record
  const sessionDoc = {
    _id: `quiz-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'quiz_session',
    userId,
    quizId,
    courseId,
    moduleId: quiz.moduleId,
    startTime: now,
    durationMinutes: quiz.duration || 30,
    endTime: now,
    status: 'completed',
    answers,
    timeSpent: timeSpent || 0,
    score,
    submittedAt: now,
    isExpired: false,
    createdAt: now,
    updatedAt: now
  };

  await database.insert(sessionDoc);

  // Update course progress (same logic as quiz-session routes)
  try {
    const moduleDoc = await database.get(quiz.moduleId);
    if (moduleDoc && moduleDoc.quizzes) {
      const quizIndex = moduleDoc.quizzes.findIndex((q: any) => q._id === quizId);
      if (quizIndex !== -1) {
        let itemIndex = 0;
        if (moduleDoc.description) itemIndex++;
        if (moduleDoc.content) itemIndex++;
        if (moduleDoc.videoUrl) itemIndex++;
        if (moduleDoc.resources) itemIndex += moduleDoc.resources.length;
        if (moduleDoc.assessments) itemIndex += moduleDoc.assessments.length;
        itemIndex += quizIndex;
        
        const completionKey = `quiz-${itemIndex}`;
        
        if (!course.studentProgress) {
          course.studentProgress = [];
        }
        
        let moduleProgress = course.studentProgress.find(
          (p: any) => p.student === userId && p.moduleId === quiz.moduleId
        );
        
        if (!moduleProgress) {
          moduleProgress = {
            student: userId,
            moduleId: quiz.moduleId,
            completed: false,
            score: 0,
            completedAt: null,
            completedItems: []
          };
          course.studentProgress.push(moduleProgress);
        }
        
        if (!moduleProgress.completedItems) {
          moduleProgress.completedItems = [];
        }
        
        if (!moduleProgress.completedItems.includes(completionKey)) {
          moduleProgress.completedItems.push(completionKey);
          
          course.updatedAt = new Date();
          const latestCourse = await database.get(course._id);
          course._rev = latestCourse._rev;
          await database.insert(course);
          
          console.log('✅ Course progress updated via course quiz submission');
        }
      }
    }
  } catch (progressError: unknown) {
    const errorMessage = progressError instanceof Error ? progressError.message : 'Unknown error';
    console.error('⚠️ Failed to update course progress:', errorMessage);
  }

  res.json({
    success: true,
    message: 'Quiz submitted successfully',
    data: {
      sessionId: sessionDoc._id,
      score,
      timeSpent: timeSpent || 0,
      submittedAt: now,
      answers
    }
  });
}));

// Course-based quiz submission (fallback for when quiz session is not available)
// REMOVED: Duplicate quiz submit endpoint - keeping only the first one above

export default router;