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
  console.log('📁 FILE FILTER - Processing file:', {
    originalname: file.originalname,
    fieldname: file.fieldname,
    mimetype: file.mimetype,
    size: file.size,
    sizeMB: Math.round(file.size / 1024 / 1024 * 100) / 100,
    url: req.url,
    method: req.method
  });
  
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
  } else if (file.fieldname === 'file') {
    // Allow files for content items
    console.log('📁 FILE FILTER - Processing content item file:', {
      extname,
      mimetype,
      isImage: allowedImageTypes.test(extname || ''),
      isDocument: allowedDocumentTypes.test(extname || ''),
      isVideo: allowedVideoTypes.test(extname || ''),
      isAudio: allowedAudioTypes.test(extname || '')
    });
    
    if (allowedImageTypes.test(extname || '') || allowedDocumentTypes.test(extname || '') || 
        allowedVideoTypes.test(extname || '') || allowedAudioTypes.test(extname || '')) {
      console.log('📁 FILE FILTER - File accepted for content item');
      cb(null, true);
    } else {
      console.log('📁 FILE FILTER - File rejected for content item');
      cb(new Error('File type not allowed for content items'));
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
const maxFileSize = parseInt(process.env['MAX_FILE_SIZE'] || '52428800'); // 50MB default (increased from 10MB)
console.log('📁 MULTER CONFIG - Environment MAX_FILE_SIZE:', process.env['MAX_FILE_SIZE'] || 'NOT SET');
console.log('📁 MULTER CONFIG - File size limit:', maxFileSize, 'bytes (', Math.round(maxFileSize / 1024 / 1024), 'MB)');

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 10 // Maximum 10 files
  }
});

console.log('📁 MULTER CONFIG - uploadFile configuration created with limit:', parseInt(process.env['MAX_FILE_SIZE'] || '52428800'), 'bytes');

// Middleware to upload files to Supabase after multer processing
export const uploadToSupabaseMiddleware = async (req: Request, res: any, next: any) => {
  try {
    console.log('📁 UPLOAD MIDDLEWARE - Starting upload process');
    console.log('📁 UPLOAD MIDDLEWARE - Request files:', req.files ? 'Files present' : 'No files');
    console.log('📁 UPLOAD MIDDLEWARE - Request file:', req.file ? 'Single file present' : 'No single file');
    console.log('📁 UPLOAD MIDDLEWARE - Request body keys:', Object.keys(req.body || {}));
    console.log('📁 UPLOAD MIDDLEWARE - Request headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    console.log('📁 UPLOAD MIDDLEWARE - Request URL:', req.url);
    console.log('📁 UPLOAD MIDDLEWARE - Request method:', req.method);
    
    if (!req.files && !req.file) {
      console.log('📁 UPLOAD MIDDLEWARE - No files found, skipping');
      return next();
    }

    // Handle different file types from multer
    let files: Express.Multer.File[] = [];
    if (req.file) {
      files = [req.file];
      console.log('📁 UPLOAD MIDDLEWARE - Single file found:', req.file.originalname);
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        files = req.files;
        console.log('📁 UPLOAD MIDDLEWARE - Array of files found:', req.files.length);
      } else {
        // Handle case where req.files is an object with field names
        files = Object.values(req.files).flat();
        console.log('📁 UPLOAD MIDDLEWARE - Object files found:', Object.keys(req.files));
      }
    }

    const uploadedFiles: UploadedFile[] = [];

    console.log('📁 UPLOAD MIDDLEWARE - Processing files:', files.length);
    console.log('📁 UPLOAD MIDDLEWARE - Files details:', files.map(f => ({
      originalName: f.originalname,
      fieldname: f.fieldname,
      mimetype: f.mimetype,
      size: f.size,
      bufferLength: f.buffer?.length || 0
    })));
    
    for (const file of files) {
      if (!file) continue;
      
      console.log('📁 UPLOAD MIDDLEWARE - Processing file:', {
        originalName: file.originalname,
        fieldname: file.fieldname,
        mimetype: file.mimetype,
        size: file.size,
        sizeMB: Math.round(file.size / 1024 / 1024 * 100) / 100
      });

      // Determine bucket and path
      const bucket = getBucketForFile(file.fieldname, file.mimetype);
      const path = getPathForFile(file.fieldname, file.originalname);
      
      console.log('📁 UPLOAD MIDDLEWARE - Bucket and path:', { bucket, path });

      // Upload to Supabase
      console.log('📁 UPLOAD MIDDLEWARE - About to call uploadToSupabase with:', {
        originalName: file.originalname,
        fieldname: file.fieldname,
        bucket,
        path,
        size: file.size
      });
      
      console.log('📁 UPLOAD MIDDLEWARE - About to call uploadToSupabase with:', {
        originalName: file.originalname,
        fieldname: file.fieldname,
        bucket,
        path,
        size: file.size,
        sizeMB: Math.round(file.size / 1024 / 1024 * 100) / 100
      });
      
      const result = await uploadToSupabase(file, bucket, path, {
        uploadedBy: (req as any).user?._id || 'anonymous',
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bucket,
        path
      });
      
      console.log('📁 UPLOAD MIDDLEWARE - uploadToSupabase result:', result);
      console.log('📁 UPLOAD MIDDLEWARE - Result success:', result.success);
      console.log('📁 UPLOAD MIDDLEWARE - Result URL:', result.url);
      console.log('📁 UPLOAD MIDDLEWARE - Result publicUrl:', result.publicUrl);
      console.log('📁 UPLOAD MIDDLEWARE - Result error:', result.error);

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
    console.error('❌ Error in Supabase upload middleware:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
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
// Create a specific upload configuration for file uploads with explicit limits
const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env['MAX_FILE_SIZE'] || '52428800'), // 50MB
    files: 10
  }
});

export const uploadAny = [upload.any(), uploadToSupabaseMiddleware];
export const uploadFileOnly = [uploadFile.any(), uploadToSupabaseMiddleware];

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const maxSizeMB = Math.round(parseInt(process.env['MAX_FILE_SIZE'] || '52428800') / 1024 / 1024);
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${maxSizeMB}MB`
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