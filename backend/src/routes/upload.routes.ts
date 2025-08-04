import express from 'express';
import multer from 'multer';
import { uploadToSupabaseMiddleware, handleUploadError } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configure multer for general file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (increased from 10MB)
    files: 1
  }
});

// General file upload endpoint for content items
router.post('/', 
  authenticateToken,
  upload.single('file'), // Accept file with field name 'file'
  uploadToSupabaseMiddleware,
  async (req: any, res: any) => {
    try {
      console.log('📁 UPLOAD ROUTE - Received upload request');
      console.log('📁 Files:', req.files);
      console.log('📁 File:', req.file);
      
      if (!req.files && !req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get the uploaded file(s)
      const files = req.files || (req.file ? [req.file] : []);
      
      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files found in request'
        });
      }

      // Process the first file (for content items, we typically upload one file at a time)
      const file = files[0];
      
      console.log('📁 Processing file:', {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname
      });

      // The uploadToSupabaseMiddleware should have already processed the file
      // and added the URL to req.uploadedFiles
      const uploadedFiles = req.uploadedFiles || [];
      
      if (uploadedFiles.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'File upload failed - no uploaded files found'
        });
      }

      const uploadedFile = uploadedFiles[0];
      
      console.log('📁 Upload successful:', uploadedFile);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          originalName: uploadedFile.originalName,
          fileName: uploadedFile.originalName,
          fileUrl: uploadedFile.url,
          publicUrl: uploadedFile.publicUrl,
          path: uploadedFile.path,
          bucket: uploadedFile.bucket,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype
        }
      });

    } catch (error) {
      console.error('📁 Upload route error:', error);
      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: error.message
      });
    }
  },
  handleUploadError
);

// Test route to verify upload endpoint is working
router.get('/test', (req: any, res: any) => {
  res.json({
    success: true,
    message: 'Upload endpoint is working',
    timestamp: new Date().toISOString()
  });
});

export default router; 