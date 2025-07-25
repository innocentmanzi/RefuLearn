import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

const router = express.Router();

// Setup PouchDB
PouchDB.plugin(PouchDBFind);
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

interface AuthenticatedRequest extends Request {
  user?: { _id: string; role?: string; [key: string]: any; };
  query?: any;
  params?: any;
  body?: any;
}

const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user?._id) throw new Error('User authentication required');
  return { userId: req.user._id.toString(), user: req.user as NonNullable<AuthenticatedRequest['user']> };
};

interface CertificateDoc {
  _id: string;
  _rev: string;
  type: 'certificate';
  user: string;
  course: string;
  courseTitle: string;
  completionDate: Date;
  grade?: number;
  certificateNumber: string;
  isVerified: boolean;
  issuedBy: string;
  issuedAt: Date;
  expiresAt?: Date;
  [key: string]: any;
}

interface UserDoc {
  _id: string;
  _rev?: string;
  type: 'user';
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
  [key: string]: any;
}



// Get user's certificates
router.get('/user', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { userId } = ensureAuth(req);
    
    console.log('📜 Certificates endpoint called for user:', userId);
    
    // Fetch real certificates from CouchDB
    let certificates: any[] = [];
    
    try {
      console.log('🔍 Fetching real certificates from CouchDB...');
      const result = await db.find({ 
        selector: { 
        type: 'certificate',
          user: userId 
        }
      });
      
      certificates = result.docs;
      console.log(`📜 Found ${certificates.length} real certificates in database for user ${userId}`);
      
      // Log certificate details for debugging
      certificates.forEach((cert, index) => {
        console.log(`Certificate ${index + 1}:`, {
          id: cert._id,
          courseTitle: cert.courseTitle,
          courseId: cert.course,
          issuedAt: cert.issuedAt,
          certificateNumber: cert.certificateNumber
        });
      });
      
    } catch (dbError) {
      console.error('❌ Error fetching certificates from CouchDB:', dbError);
      console.log('⚠️ Returning empty certificates list due to database error');
      certificates = [];
    }

    // Pagination
    const total = certificates.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const pagedCertificates = certificates.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    console.log(`📊 Returning ${certificates.length} real certificates from database`);

    res.json({
      success: true,
      data: {
        certificates: pagedCertificates,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalCertificates: total
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error in certificates endpoint:', error);
    
    // Return empty certificates list on any error
    res.json({
      success: true,
      data: {
        certificates: [],
        pagination: {
          currentPage: Number(req.query.page || 1),
          totalPages: 0,
          totalCertificates: 0
        }
      }
    });
  }
}));

// Get certificate by ID
router.get('/:certificateId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const certificate = await db.get(req.params['certificateId']) as CertificateDoc;
    res.json({
      success: true,
      data: { certificate }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }
}));

// Verify certificate
router.get('/verify/:certificateNumber', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { certificateNumber } = req.params;
  
  const result = await db.find({ 
    selector: { 
      type: 'certificate', 
      certificateNumber: certificateNumber 
    }
  });

  if (result.docs.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  const certificate = result.docs[0] as CertificateDoc;
  
  if (!certificate.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'Certificate is not verified'
    });
  }

  // Get user details
  const user = await db.get(certificate.user) as UserDoc;

  res.json({
    success: true,
    data: {
      certificate: {
        certificateNumber: certificate.certificateNumber,
        courseTitle: certificate.courseTitle,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        isVerified: certificate.isVerified
      },
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    }
  });
}));

// Generate certificate (for completed courses)
router.post('/generate', authenticateToken, [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('courseTitle').notEmpty().withMessage('Course title is required'),
  body('grade').optional().isFloat({ min: 0, max: 100 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, courseTitle, grade } = req.body;
  const { userId } = ensureAuth(req);

  console.log('🎓 === CERTIFICATE GENERATION DEBUG ===');
  console.log('🎓 Request data:', { courseId, courseTitle, grade, userId });
  console.log('🎓 User ID:', userId);
  console.log('🎓 Course ID:', courseId);
  console.log('🎓 Course Title:', courseTitle);

  try {
  // Check if certificate already exists
    console.log('🔍 Checking for existing certificate...');
  const existingResult = await db.find({ 
    selector: { 
      type: 'certificate', 
      user: userId, 
      course: courseId 
    }
  });

    console.log('🔍 Existing certificates found:', existingResult.docs.length);

  if (existingResult.docs.length > 0) {
      console.log('⚠️ Certificate already exists for this course');
    return res.status(400).json({
      success: false,
      message: 'Certificate already exists for this course'
    });
  }

  // Generate certificate number
  const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('🎓 Generated certificate number:', certificateNumber);

  const certificateData: any = {
    _id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'certificate',
    user: userId,
    course: courseId,
    courseTitle,
    completionDate: new Date(),
    grade: grade || null,
    certificateNumber,
    isVerified: true,
    issuedBy: 'RefuLearn Platform',
    issuedAt: new Date()
  };

    console.log('🎓 Certificate data to save:', certificateData);

  const certificate = await db.put(certificateData);
    console.log('✅ Certificate saved to database:', certificate);

    console.log('🎓 === CERTIFICATE GENERATION SUCCESS ===');
  res.status(201).json({
    success: true,
    message: 'Certificate generated successfully',
    data: { certificate }
  });
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Update certificate (instructor only)
router.put('/:certificateId', authenticateToken, authorizeRoles('instructor'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('grade').optional().isFloat({ min: 0, max: 100 }),
  body('expiryDate').optional().isISO8601(),
  body('status').optional().isIn(['active', 'revoked', 'expired'])
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { certificateId } = req.params;
  const updates = req.body;

  const certificate = await db.get(certificateId) as CertificateDoc;
  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  const { userId } = ensureAuth(req);
  
  // Check if user is the instructor
  if (certificate.issuedBy !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this certificate'
    });
  }

  const updatedCertificate = { ...certificate, ...updates };
  await db.put(updatedCertificate);

  res.json({
    success: true,
    message: 'Certificate updated successfully',
    data: { certificate: updatedCertificate }
  });
}));

// Revoke certificate (instructor only)
router.put('/:certificateId/revoke', authenticateToken, authorizeRoles('instructor'), [
  body('reason').optional().trim()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { certificateId } = req.params;
  const { reason } = req.body;

  const certificate = await db.get(certificateId) as CertificateDoc;
  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found'
    });
  }

  const { userId } = ensureAuth(req);
  
  // Check if user is the instructor
  if (certificate.issuedBy !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to revoke this certificate'
    });
  }

  const updatedCertificate = {
    ...certificate,
    status: 'revoked',
    revokedAt: new Date(),
    revocationReason: reason || ''
  };

  await db.put(updatedCertificate);

  res.json({
    success: true,
    message: 'Certificate revoked successfully',
    data: { certificate: updatedCertificate }
  });
}));

// Get instructor's issued certificates
router.get('/instructor/issued', authenticateToken, authorizeRoles('instructor'), [
  query('courseId').optional().isMongoId(),
  query('status').optional().isIn(['active', 'revoked', 'expired']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, status, page = 1, limit = 10 } = req.query;
  
  const { userId } = ensureAuth(req);
  const query: any = { issuedBy: userId };
  
  if (courseId) {
    query.course = courseId;
  }
  
  if (status) {
    query.status = status;
  }

  const result = await db.find({ selector: query });
  const certificates = result.docs;

  const total = certificates.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedCertificates = certificates.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      certificates: pagedCertificates,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCertificates: total
      }
    }
  });
}));

// Get certificate analytics (instructor only)
router.get('/instructor/analytics', authenticateToken, authorizeRoles('instructor'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  const { userId } = ensureAuth(req);

  // Certificate statistics
  const totalCertificates = await db.find({ selector: { issuedBy: userId } }).then(result => result.docs.length);
  const activeCertificates = await db.find({ selector: { issuedBy: userId, status: 'active' } }).then(result => result.docs.length);
  const revokedCertificates = await db.find({ selector: { issuedBy: userId, status: 'revoked' } }).then(result => result.docs.length);
  const newCertificates = await db.find({ selector: { issuedBy: userId, issuedAt: { $gte: daysAgo } } }).then(result => result.docs.length);

  // Certificates by course
  const certificatesByCourse = await db.find({ selector: { issuedBy: userId } }).then(result => {
    const byCourse = result.docs.reduce((acc: any, doc: any) => {
      acc[doc.course] = (acc[doc.course] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(byCourse).map(([course, count]) => ({ courseTitle: course, count }));
  });

  // Average grade
  const certificatesWithGrades = await db.find({ selector: { issuedBy: userId, grade: { $exists: true, $ne: null } } }).then(result => result.docs);
  const totalGrade = certificatesWithGrades.reduce((sum: number, doc: any) => sum + (doc.grade || 0), 0);
  const averageGrade = certificatesWithGrades.length > 0 ? totalGrade / certificatesWithGrades.length : 0;

  // Recent certificates
  const recentCertificates = await db.find({ selector: { issuedBy: userId }, sort: [{ issuedAt: 'desc' }], limit: 10 }).then(result => result.docs.map((doc: any) => ({
    title: doc.courseTitle,
    course: doc.course,
    issuedAt: doc.issuedAt,
    status: doc.status
  })));

  res.json({
    success: true,
    data: {
      overview: {
        total: totalCertificates,
        active: activeCertificates,
        revoked: revokedCertificates,
        new: newCertificates
      },
      byCourse: await certificatesByCourse,
      averageGrade: Math.round(averageGrade * 100) / 100,
      recentCertificates
    }
  });
}));

// Get all certificates (admin only)
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), [
  query('status').optional().isIn(['active', 'revoked', 'expired']),
  query('instructor').optional().isMongoId(),
  query('course').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, instructor, course, page = 1, limit = 10 } = req.query;
  
  const query: any = {};
  
  if (status) {
    query.status = status;
  }
  
  if (instructor) {
    query.issuedBy = instructor;
  }
  
  if (course) {
    query.course = course;
  }

  const result = await db.find({ selector: query });
  const certificates = result.docs;

  const total = certificates.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedCertificates = certificates.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      certificates: pagedCertificates,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCertificates: total
      }
    }
  });
}));

// Get certificate analytics (admin only)
router.get('/admin/analytics', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(period));

  // Overall statistics
  const totalCertificates = await db.find({ selector: {} }).then(result => result.docs.length);
  const activeCertificates = await db.find({ selector: { status: 'active' } }).then(result => result.docs.length);
  const revokedCertificates = await db.find({ selector: { status: 'revoked' } }).then(result => result.docs.length);
  const newCertificates = await db.find({ selector: { issuedAt: { $gte: daysAgo } } }).then(result => result.docs.length);

  // Certificates by status
  const certificatesByStatus = await db.find({ selector: { type: 'certificate' } }).then(result => {
    const byStatus = result.docs.reduce((acc: any, doc: any) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(byStatus).map(([status, count]) => ({ status, count }));
  });

  // Certificates by instructor
  const certificatesByInstructor = await db.find({ selector: { type: 'certificate' } }).then(result => {
    const byInstructor = result.docs.reduce((acc: any, doc: any) => {
      acc[doc.issuedBy] = (acc[doc.issuedBy] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(byInstructor).map(([instructor, count]) => ({
      instructorName: instructor,
      count
    }));
  });

  // Average grade across all certificates
  const certificatesWithGrades = await db.find({ selector: { grade: { $exists: true, $ne: null } } }).then(result => result.docs);
  const totalGrade = certificatesWithGrades.reduce((sum: number, doc: any) => sum + (doc.grade || 0), 0);
  const averageGrade = certificatesWithGrades.length > 0 ? totalGrade / certificatesWithGrades.length : 0;

  // Recent certificates
  const recentCertificates = await db.find({ selector: {}, sort: [{ issuedAt: 'desc' }], limit: 10 }).then(result => result.docs.map((doc: any) => ({
    title: doc.courseTitle,
    course: doc.course,
    issuedAt: doc.issuedAt,
    status: doc.status
  })));

  res.json({
    success: true,
    data: {
      overview: {
        total: totalCertificates,
        active: activeCertificates,
        revoked: revokedCertificates,
        new: newCertificates
      },
      byStatus: await certificatesByStatus,
      byInstructor: await certificatesByInstructor,
      averageGrade: Math.round(averageGrade * 100) / 100,
      recentCertificates
    }
  });
}));

// Admin: Create certificate
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('course').notEmpty().withMessage('Valid course ID is required'),
  body('user').notEmpty().withMessage('Valid user ID is required'),
  body('title').trim().notEmpty().withMessage('Certificate title is required'),
  body('description').optional().trim(),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date'),
  body('grade').optional().isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100')
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const certificateData: any = {
    ...req.body,
    _id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'certificate',
    issuedBy: userId,
    issuedAt: new Date(),
    status: 'active'
  };
  const certificate = await db.put(certificateData);
  res.status(201).json({ success: true, message: 'Certificate created successfully', data: { certificate } });
}));

// Admin: Get all certificates
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await db.find({ selector: {} });
  const certificates = result.docs;
  res.json({ success: true, data: { certificates } });
}));

// Admin: Get certificate by ID
router.get('/admin/:certificateId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const certificate = await db.get(req.params.certificateId) as CertificateDoc;
  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }
  res.json({ success: true, data: { certificate } });
}));

// Admin: Update certificate
router.put('/admin/:certificateId', authenticateToken, authorizeRoles('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('grade').optional().isFloat({ min: 0, max: 100 }),
  body('expiryDate').optional().isISO8601(),
  body('status').optional().isIn(['active', 'revoked', 'expired'])
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { certificateId } = req.params;
  const updates = req.body;
  const certificate = await db.get(certificateId) as CertificateDoc;
  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }
  const updatedCertificate = { ...certificate, ...updates };
  await db.put(updatedCertificate);
  res.json({ success: true, message: 'Certificate updated successfully', data: { certificate: updatedCertificate } });
}));

// Admin: Delete certificate
router.delete('/admin/:certificateId', authenticateToken, authorizeRoles('admin'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { certificateId } = req.params;
  const certificate = await db.get(certificateId) as CertificateDoc;
  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found' });
  }
  const latest = await db.get(certificate._id);
  certificate._rev = latest._rev;
  await db.remove(certificate as any);
  res.json({ success: true, message: 'Certificate deleted successfully' });
}));

export default router; 