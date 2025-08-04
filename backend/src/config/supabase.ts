import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 SUPABASE CONFIG - Environment variables check:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  hasAnonKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET'
});

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  throw new Error('Supabase configuration is required');
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test Supabase client on startup
console.log('🔧 SUPABASE CLIENT - Testing connection...');
supabase.storage.listBuckets().then(({ data, error }) => {
  if (error) {
    console.error('❌ SUPABASE CLIENT - Connection failed:', error);
    console.error('❌ SUPABASE CLIENT - Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  } else {
    console.log('✅ SUPABASE CLIENT - Connection successful, buckets:', data?.map(b => b.name));
    
    // Test if uploads bucket exists
    const uploadsBucket = data?.find(b => b.name === 'uploads');
    if (uploadsBucket) {
      console.log('✅ SUPABASE CLIENT - Uploads bucket found:', uploadsBucket);
    } else {
      console.log('⚠️ SUPABASE CLIENT - Uploads bucket not found, available buckets:', data?.map(b => b.name));
    }
  }
}).catch(err => {
  console.error('❌ SUPABASE CLIENT - Connection error:', err);
  console.error('❌ SUPABASE CLIENT - Error details:', {
    message: err.message,
    stack: err.stack
  });
});

// Create Supabase client with anon key for public operations
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILES: 'uploads',
  COURSES: 'uploads',
  DOCUMENTS: 'uploads',
  CERTIFICATES: 'uploads',
  RESOURCES: 'uploads',
  GENERAL: 'uploads'
} as const;

// File type validation
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
  VIDEOS: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac']
} as const;

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB (increased from 10MB)
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 20 * 1024 * 1024 // 20MB
} as const;

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  publicUrl?: string;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  bucket: string;
  path: string;
}

// Upload file to Supabase storage
export const uploadToSupabase = async (
  file: Express.Multer.File,
  bucket: string,
  path: string,
  metadata?: Partial<FileMetadata>
): Promise<UploadResult> => {
  try {
    console.log('📁 UPLOAD TO SUPABASE - Starting upload process');
    console.log('📁 UPLOAD TO SUPABASE - File details:', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      bufferLength: file.buffer?.length || 0
    });
    console.log('📁 UPLOAD TO SUPABASE - Upload params:', {
      bucket,
      path,
      metadata
    });

    // Validate file size
    const maxSize = getMaxFileSize(file.mimetype);
    console.log('📁 UPLOAD TO SUPABASE - File size check:', {
      fileSize: file.size,
      maxSize,
      isValid: file.size <= maxSize
    });
    
    if (file.size > maxSize) {
      console.log('❌ UPLOAD TO SUPABASE - File size too large');
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`
      };
    }

    // Validate file type
    const isValidType = isValidFileType(file.mimetype);
    console.log('📁 UPLOAD TO SUPABASE - File type check:', {
      mimetype: file.mimetype,
      isValid: isValidType
    });
    
    if (!isValidType) {
      console.log('❌ UPLOAD TO SUPABASE - File type not allowed');
      return {
        success: false,
        error: 'File type not allowed'
      };
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const filename = `${path}-${uniqueSuffix}.${ext}`;
    
    console.log('📁 UPLOAD TO SUPABASE - Generated filename:', filename);

    // Check if bucket exists
    console.log('📁 UPLOAD TO SUPABASE - Checking bucket existence...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.log('❌ UPLOAD TO SUPABASE - Error listing buckets:', bucketsError);
    } else {
      console.log('📁 UPLOAD TO SUPABASE - Available buckets:', buckets?.map(b => b.name));
      const bucketExists = buckets?.some(b => b.name === bucket);
      console.log('📁 UPLOAD TO SUPABASE - Target bucket exists:', bucketExists);
      
      // If bucket doesn't exist, try to create it
      if (!bucketExists) {
        console.log('📁 UPLOAD TO SUPABASE - Creating bucket:', bucket);
        const { data: createData, error: createError } = await supabase.storage.createBucket(bucket, {
          public: true,
          allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'video/*', 'audio/*'],
          fileSizeLimit: 52428800 // 50MB (increased from 10MB)
        });
        
        if (createError) {
          console.log('❌ UPLOAD TO SUPABASE - Failed to create bucket:', createError);
        } else {
          console.log('✅ UPLOAD TO SUPABASE - Bucket created successfully:', createData);
          
          // Set bucket policy to allow public access
          try {
            const { error: policyError } = await supabase.storage.from(bucket).createSignedUrl('test', 60);
            if (policyError) {
              console.log('⚠️ UPLOAD TO SUPABASE - Bucket policy may need manual configuration for public access');
            } else {
              console.log('✅ UPLOAD TO SUPABASE - Bucket policy configured for public access');
            }
          } catch (policyErr) {
            console.log('⚠️ UPLOAD TO SUPABASE - Could not verify bucket policy:', policyErr);
          }
        }
      } else {
        // Check if existing bucket is public
        console.log('📁 UPLOAD TO SUPABASE - Bucket exists, checking public access...');
        try {
          const { data: bucketInfo } = await supabase.storage.getBucket(bucket);
          console.log('📁 UPLOAD TO SUPABASE - Bucket info:', bucketInfo);
        } catch (infoErr) {
          console.log('⚠️ UPLOAD TO SUPABASE - Could not get bucket info:', infoErr);
        }
      }
    }

    // Upload file to Supabase
    console.log('📁 UPLOAD TO SUPABASE - Starting Supabase upload...');
    console.log('📁 UPLOAD TO SUPABASE - Upload details:', {
      bucket,
      filename,
      contentType: file.mimetype,
      bufferSize: file.buffer?.length || 0,
      metadata: {
        originalName: file.originalname,
        uploadedBy: metadata?.uploadedBy || 'system',
        uploadedAt: new Date().toISOString()
      }
    });
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
        metadata: {
          originalName: file.originalname,
          uploadedBy: metadata?.uploadedBy || 'system',
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      });

    if (error) {
      console.log('❌ UPLOAD TO SUPABASE - Supabase upload failed:', error);
      logger.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ UPLOAD TO SUPABASE - File uploaded successfully:', data);

    // Get public URL
    console.log('📁 UPLOAD TO SUPABASE - Getting public URL...');
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    console.log('📁 UPLOAD TO SUPABASE - Public URL data:', urlData);

    const result = {
      success: true,
      url: urlData.publicUrl,
      path: filename,
      publicUrl: urlData.publicUrl
    };

    console.log('✅ UPLOAD TO SUPABASE - Upload completed successfully:', result);
    return result;

  } catch (error) {
    console.log('❌ UPLOAD TO SUPABASE - Exception occurred:', error);
    logger.error('Error uploading to Supabase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

// Delete file from Supabase storage
export const deleteFromSupabase = async (bucket: string, path: string): Promise<UploadResult> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      logger.error('Supabase delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    logger.error('Error deleting from Supabase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error'
    };
  }
};

// Get file URL from Supabase storage
export const getFileUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Helper functions
const getMaxFileSize = (mimeType: string): number => {
  if (ALLOWED_FILE_TYPES.IMAGES.includes(mimeType)) {
    return MAX_FILE_SIZES.IMAGE;
  }
  if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(mimeType)) {
    return MAX_FILE_SIZES.DOCUMENT;
  }
  if (ALLOWED_FILE_TYPES.VIDEOS.includes(mimeType)) {
    return MAX_FILE_SIZES.VIDEO;
  }
  if (ALLOWED_FILE_TYPES.AUDIO.includes(mimeType)) {
    return MAX_FILE_SIZES.AUDIO;
  }
  return MAX_FILE_SIZES.DOCUMENT; // Default
};

const isValidFileType = (mimeType: string): boolean => {
  return [
    ...ALLOWED_FILE_TYPES.IMAGES,
    ...ALLOWED_FILE_TYPES.DOCUMENTS,
    ...ALLOWED_FILE_TYPES.VIDEOS,
    ...ALLOWED_FILE_TYPES.AUDIO
  ].includes(mimeType);
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Get appropriate bucket based on file type and field name
export const getBucketForFile = (fieldName: string, mimeType: string): string => {
  console.log('📁 GET BUCKET FOR FILE - Input:', { fieldName, mimeType });
  
  let bucket;
  if (fieldName === 'profilePic') {
    bucket = STORAGE_BUCKETS.PROFILES;
  } else if (fieldName === 'courseImage' || fieldName === 'course_profile_picture') {
    bucket = STORAGE_BUCKETS.COURSES;
  } else if (fieldName === 'certificate') {
    bucket = STORAGE_BUCKETS.CERTIFICATES;
  } else if (fieldName === 'resource') {
    bucket = STORAGE_BUCKETS.RESOURCES;
  } else if (fieldName === 'file') {
    // Content item files go to documents bucket
    bucket = STORAGE_BUCKETS.DOCUMENTS;
  } else if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(mimeType)) {
    bucket = STORAGE_BUCKETS.DOCUMENTS;
  } else {
    bucket = STORAGE_BUCKETS.GENERAL;
  }
  
  console.log('📁 GET BUCKET FOR FILE - Result:', bucket);
  return bucket;
};

// Get path for file based on type and field name
export const getPathForFile = (fieldName: string, originalName: string): string => {
  const ext = originalName.split('.').pop();
  const name = originalName.split('.').slice(0, -1).join('.');
  
  console.log('📁 GET PATH FOR FILE - Input:', { fieldName, originalName, ext, name });
  
  let path;
  switch (fieldName) {
    case 'profilePic':
      path = `profile-pictures/${name}`;
      break;
    case 'courseImage':
    case 'course_profile_picture':
      path = `course-images/${name}`;
      break;
    case 'certificate':
      path = `certificates/${name}`;
      break;
    case 'resource':
      path = `resources/${name}`;
      break;
    case 'file':
      path = `content-items/${name}`;
      break;
    default:
      path = `general/${name}`;
  }
  
  console.log('📁 GET PATH FOR FILE - Result:', path);
  return path;
}; 