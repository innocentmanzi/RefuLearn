import multer from 'multer';
import { Request } from 'express';
import { 
  uploadToSupabase, 
  getBucketForFile, 
  getPathForFile,
  STORAGE_BUCKETS 
} from '../config/supabase';

// Interface for uploaded file information
interface UploadedFile {
  originalName: string;
  fieldname: string;
  mimetype: string;
  size: number;
  url?: string;
  path: string;
  publicUrl: string;
  bucket: string;
}

// Configure multer to use memory storage (we'll upload to Supabase)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|txt|rtf/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm/;
  const allowedAudioTypes = /mp3|wav|ogg|aac/;
  
  const extname = file.originalname.toLowerCase().split('.').pop();
  const mimetype = file.mimetype;
  
  // Check file type based on field name
  if (file.fieldname === 'profilePic' || file.fieldname === 'courseImage' || file.fieldname === 'course_profile_picture') {
    if (allowedImageTypes.test(extname || '') && mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures and course images'));
    }
  } else if (file.fieldname === 'resume' || file.fieldname === 'coverLetter' || 
             file.fieldname === 'cvDocument' || file.fieldname === 'degreeDocument' || 
             file.fieldname === 'financialApproval' || file.fieldname === 'additionalDocuments') {
    if (allowedDocumentTypes.test(extname || '') || mimetype === 'application/pdf' || mimetype.includes('document')) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed for documents'));
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.test(extname || '') && mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  } else if (file.fieldname === 'audio') {
    if (allowedAudioTypes.test(extname || '') && mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  } else {
    // For general files, allow common types
    if (allowedImageTypes.test(extname || '') || allowedDocumentTypes.test(extname || '') || 
        allowedVideoTypes.test(extname || '') || allowedAudioTypes.test(extname || '')) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'), // 10MB default
    files: 10 // Maximum 10 files
  }
});

// Middleware to upload files to Supabase after multer processing
export const uploadToSupabaseMiddleware = async (req: Request, res: any, next: any) => {
  try {
    if (!req.files && !req.file) {
      return next();
    }

    // Handle different file types from multer
    let files: Express.Multer.File[] = [];
    if (req.file) {
      files = [req.file];
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        files = req.files;
      } else {
        // Handle case where req.files is an object with field names
        files = Object.values(req.files).flat();
      }
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      if (!file) continue;

      // Determine bucket and path
      const bucket = getBucketForFile(file.fieldname, file.mimetype);
      const path = getPathForFile(file.fieldname, file.originalname);

      // Upload to Supabase
      const result = await uploadToSupabase(file, bucket, path, {
        uploadedBy: (req as any).user?._id || 'anonymous',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bucket,
        path
      });

      if (result.success) {
        uploadedFiles.push({
          originalName: file.originalname,
          fieldname: file.fieldname,
          mimetype: file.mimetype,
          size: file.size,
          url: result.url || '',
          path: result.path || '',
          publicUrl: result.publicUrl || '',
          bucket
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Failed to upload ${file.originalname}: ${result.error}`
        });
      }
    }

    // Attach uploaded files to request
    (req as any).uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    console.error('Error in Supabase upload middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
};

// Specific upload configurations
export const uploadProfilePic = [upload.single('profilePic'), uploadToSupabaseMiddleware];
export const uploadCourseImage = [upload.single('courseImage'), uploadToSupabaseMiddleware];
export const uploadCourseProfilePic = [upload.single('course_profile_picture'), uploadToSupabaseMiddleware];
export const uploadResume = [upload.single('resume'), uploadToSupabaseMiddleware];
export const uploadCoverLetter = [upload.single('coverLetter'), uploadToSupabaseMiddleware];
export const uploadCertificate = [upload.single('certificate'), uploadToSupabaseMiddleware];
export const uploadResource = [upload.single('resource'), uploadToSupabaseMiddleware];
export const uploadVideo = [upload.single('video'), uploadToSupabaseMiddleware];
export const uploadAudio = [upload.single('audio'), uploadToSupabaseMiddleware];
export const uploadMultiple = [upload.array('files', 10), uploadToSupabaseMiddleware];
export const uploadAny = [upload.any(), uploadToSupabaseMiddleware];

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

export default upload; 