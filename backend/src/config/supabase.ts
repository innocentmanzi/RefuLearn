import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
  DOCUMENT: 10 * 1024 * 1024, // 10MB
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
    // Validate file size
    const maxSize = getMaxFileSize(file.mimetype);
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`
      };
    }

    // Validate file type
    if (!isValidFileType(file.mimetype)) {
      return {
        success: false,
        error: 'File type not allowed'
      };
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const filename = `${path}/${uniqueSuffix}.${ext}`;

    // Upload file to Supabase
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
      logger.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filename,
      publicUrl: urlData.publicUrl
    };

  } catch (error) {
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
  if (fieldName === 'profilePic') {
    return STORAGE_BUCKETS.PROFILES;
  }
  if (fieldName === 'courseImage' || fieldName === 'course_profile_picture') {
    return STORAGE_BUCKETS.COURSES;
  }
  if (fieldName === 'certificate') {
    return STORAGE_BUCKETS.CERTIFICATES;
  }
  if (fieldName === 'resource') {
    return STORAGE_BUCKETS.RESOURCES;
  }
  if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(mimeType)) {
    return STORAGE_BUCKETS.DOCUMENTS;
  }
  return STORAGE_BUCKETS.GENERAL;
};

// Get path for file based on type and field name
export const getPathForFile = (fieldName: string, originalName: string): string => {
  const timestamp = Date.now();
  const ext = originalName.split('.').pop();
  const name = originalName.split('.').slice(0, -1).join('.');
  
  switch (fieldName) {
    case 'profilePic':
      return `profile-pictures/${name}-${timestamp}.${ext}`;
    case 'courseImage':
    case 'course_profile_picture':
      return `course-images/${name}-${timestamp}.${ext}`;
    case 'certificate':
      return `certificates/${name}-${timestamp}.${ext}`;
    case 'resource':
      return `resources/${name}-${timestamp}.${ext}`;
    default:
      return `general/${name}-${timestamp}.${ext}`;
  }
}; 