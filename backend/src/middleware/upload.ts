import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directory exists
const uploadDir = process.env['UPLOAD_PATH'] || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = uploadDir;
    
    // Create subdirectories based on file type
    if (file.fieldname === 'profilePic') {
      uploadPath = path.join(uploadDir, 'profiles');
    } else if (file.fieldname === 'courseImage' || file.fieldname === 'course_profile_picture') {
      uploadPath = path.join(uploadDir, 'courses');
    } else if (file.fieldname === 'resume' || file.fieldname === 'coverLetter' || 
               file.fieldname === 'cvDocument' || file.fieldname === 'degreeDocument' || 
               file.fieldname === 'financialApproval' || file.fieldname === 'additionalDocuments') {
      uploadPath = path.join(uploadDir, 'documents');
    } else if (file.fieldname === 'certificate') {
      uploadPath = path.join(uploadDir, 'certificates');
    } else if (file.fieldname === 'resource') {
      uploadPath = path.join(uploadDir, 'resources');
    } else {
      uploadPath = path.join(uploadDir, 'general');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocumentTypes = /pdf|doc|docx|txt|rtf/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm/;
  const allowedAudioTypes = /mp3|wav|ogg|aac/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  // Check file type based on field name
  if (file.fieldname === 'profilePic' || file.fieldname === 'courseImage' || file.fieldname === 'course_profile_picture') {
    if (allowedImageTypes.test(extname) && mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures and course images'));
    }
  } else if (file.fieldname === 'resume' || file.fieldname === 'coverLetter' || file.fieldname === 'certificate' || 
             file.fieldname === 'cvDocument' || file.fieldname === 'degreeDocument' || 
             file.fieldname === 'financialApproval' || file.fieldname === 'additionalDocuments') {
    if (allowedDocumentTypes.test(extname) || mimetype === 'application/pdf' || mimetype.includes('document')) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (PDF, DOC, DOCX, TXT) are allowed for documents'));
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.test(extname) && mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  } else if (file.fieldname === 'audio') {
    if (allowedAudioTypes.test(extname) && mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  } else {
    // For general files, allow common types
    if (allowedImageTypes.test(extname) || allowedDocumentTypes.test(extname) || 
        allowedVideoTypes.test(extname) || allowedAudioTypes.test(extname)) {
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

// Specific upload configurations
export const uploadProfilePic = upload.single('profilePic');
export const uploadCourseImage = upload.single('courseImage');
export const uploadResume = upload.single('resume');
export const uploadCoverLetter = upload.single('coverLetter');
export const uploadCertificate = upload.single('certificate');
export const uploadResource = upload.single('resource');
export const uploadVideo = upload.single('video');
export const uploadAudio = upload.single('audio');
export const uploadMultiple = upload.array('files', 10);
export const uploadAny = upload.any();

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