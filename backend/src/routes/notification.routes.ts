import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { createNotification } from '../services/notificationService';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

const router = express.Router();

// Setup PouchDB
PouchDB.plugin(PouchDBFind);

// Use working hardcoded credentials for CouchDB connection
const dbUrl = 'http://Manzi:Clarisse101@localhost:5984/refulearn';
console.log('Notification routes connecting to database with hardcoded credentials');

const db = new PouchDB(dbUrl);

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

const ensureAuth = (req: AuthenticatedRequest): { userId: string; user: NonNullable<AuthenticatedRequest['user']> } => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return { userId: req.user._id, user: req.user };
};

interface NotificationDoc {
  _id: string;
  _rev: string;
  type: 'notification';
  recipient: string;
  title: string;
  message: string;
  category: 'job_approval' | 'job_rejection' | 'scholarship_approval' | 'scholarship_rejection' | 'general';
  relatedItem?: {
    type: 'job' | 'scholarship';
    id: string;
    title: string;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}



// Get user notifications
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['job_approval', 'job_rejection', 'scholarship_approval', 'scholarship_rejection', 'general']),
  query('unread').optional().isBoolean()
], validate([]), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { page = 1, limit = 10, category, unread } = req.query;
  
  let selector: any = { type: 'notification', recipient: userId };
  
  if (category) {
    selector.category = category;
  }
  
  if (unread === 'true') {
    selector.isRead = false;
  }
  
  const result = await db.find({ selector });
  const notifications = result.docs;
  
  // Sort by createdAt (newest first)
  notifications.sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  // Pagination
  const total = notifications.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const pagedNotifications = notifications.slice((pageNum - 1) * limitNum, pageNum * limitNum);
  
  res.json({
    success: true,
    data: {
      notifications: pagedNotifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalNotifications: total,
        unreadCount: notifications.filter((n: any) => !n.isRead).length
      }
    }
  });
}));

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { notificationId } = req.params;
  
  console.log('🔔 Marking notification as read:', { userId, notificationId });
  
  try {
    const notification = await db.get(notificationId) as NotificationDoc;
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
  
  if (notification.recipient !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this notification'
    });
  }
  
  notification.isRead = true;
  notification.updatedAt = new Date();
  
    await db.put(notification);
    
    console.log('✅ Notification marked as read successfully');
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  
  console.log('🔔 Marking all notifications as read for user:', userId);
  
  try {
    const result = await db.find({ 
      selector: { 
        type: 'notification', 
        recipient: userId, 
        isRead: false 
      } 
    });
    
    const unreadNotifications = result.docs;
    console.log(`📊 Found ${unreadNotifications.length} unread notifications`);
    
    for (const notification of unreadNotifications) {
      notification.isRead = true;
      notification.updatedAt = new Date();
      await db.put(notification);
    }
    
    console.log('✅ All notifications marked as read successfully');
    
    res.json({
      success: true,
      message: `Marked ${unreadNotifications.length} notifications as read`,
      data: { updatedCount: unreadNotifications.length }
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Delete notification
router.delete('/:notificationId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  const { notificationId } = req.params;
  
  console.log('🗑️ Deleting notification:', { userId, notificationId });
  
  try {
    const notification = await db.get(notificationId) as NotificationDoc;
    if (!notification) {
      console.log('❌ Notification not found:', notificationId);
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    console.log('📋 Found notification:', {
      id: notification._id,
      recipient: notification.recipient,
      hasRev: !!notification._rev,
      title: notification.title
    });
    
    if (notification.recipient !== userId) {
      console.log('❌ Unauthorized delete attempt:', { userId, notificationRecipient: notification.recipient });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }
    
    if (!notification._rev) {
      console.log('❌ Notification missing _rev field:', notificationId);
      return res.status(500).json({
        success: false,
        message: 'Notification data is corrupted'
      });
    }
    
    await db.remove(notification);
    
    console.log('✅ Notification deleted successfully:', notificationId);
    
    const responseData = {
      success: true,
      message: 'Notification deleted successfully'
    };
    
    console.log('📤 Sending response:', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Get unread count
router.get('/unread-count', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = ensureAuth(req);
  
  const result = await db.find({ 
    selector: { 
      type: 'notification', 
      recipient: userId, 
      isRead: false 
    } 
  });
  
  res.json({
    success: true,
    data: { unreadCount: result.docs.length }
  });
}));

export default router; 