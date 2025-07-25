import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

// Setup PouchDB (same as admin routes)
PouchDB.plugin(PouchDBFind);
const db = new PouchDB('http://Manzi:Clarisse101@localhost:5984/refulearn');

interface NotificationDoc {
  _id: string;
  _rev?: string;
  type: 'notification';
  recipient: string;
  title: string;
  message: string;
  category: 'job_approval' | 'job_rejection' | 'scholarship_approval' | 'scholarship_rejection' | 'course_approval' | 'course_rejection' | 'general';
  relatedItem?: {
    type: 'job' | 'scholarship' | 'course';
    id: string;
    title: string;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Check if notification already exists for the same item and action
const checkDuplicateNotification = async (recipient: string, category: string, relatedItemId: string): Promise<boolean> => {
  try {
    const result = await db.find({
      selector: {
        type: 'notification',
        recipient: recipient,
        category: category,
        'relatedItem.id': relatedItemId
      }
    });
    
    // Check if there's already a notification for this item in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentNotifications = result.docs.filter((doc: any) => 
      new Date(doc.createdAt) > fiveMinutesAgo
    );
    
    return recentNotifications.length > 0;
  } catch (error) {
    console.error('Error checking for duplicate notifications:', error);
    return false; // If check fails, allow creation
  }
};

// Create notification (internal use)
export const createNotification = async (notificationData: Omit<NotificationDoc, '_id' | '_rev' | 'type' | 'createdAt' | 'updatedAt' | 'isRead'>) => {
  // Check for duplicate notification
  const isDuplicate = await checkDuplicateNotification(
    notificationData.recipient,
    notificationData.category,
    notificationData.relatedItem?.id || ''
  );
  
  if (isDuplicate) {
    console.log('⚠️ Duplicate notification detected, skipping creation');
    return null;
  }
  
  // Generate unique ID with timestamp + random suffix to prevent duplicates
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const uniqueId = `${timestamp}-${randomSuffix}`;
  
  const notification: NotificationDoc = {
    _id: uniqueId,
    type: 'notification',
    ...notificationData,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return await db.put(notification);
}; 