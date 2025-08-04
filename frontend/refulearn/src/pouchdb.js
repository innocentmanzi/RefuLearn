import PouchDB from 'pouchdb';
import PouchDBHttp from 'pouchdb-adapter-http';
import PouchDBIdb from 'pouchdb-adapter-idb';
import offlineDataManager from './services/offlineDataManager';

// Register adapters
PouchDB.plugin(PouchDBHttp);
PouchDB.plugin(PouchDBIdb);

// Configuration
const COUCHDB_URL = process.env.REACT_APP_COUCHDB_URL || 'http://localhost:5984';
const COUCHDB_DATABASE = process.env.REACT_APP_COUCHDB_DATABASE || 'refulearn';
const COUCHDB_USERNAME = process.env.REACT_APP_COUCHDB_USERNAME || 'Manzi';
const COUCHDB_PASSWORD = process.env.REACT_APP_COUCHDB_PASSWORD || 'Clarisse101';

// Legacy database instances for backward compatibility
const localDB = new PouchDB('refulearn-local', { adapter: 'idb' });
const remoteDB = new PouchDB(`${COUCHDB_URL}/${COUCHDB_DATABASE}`, {
  auth: {
    username: COUCHDB_USERNAME,
    password: COUCHDB_PASSWORD
  }
});

// Legacy sync function - maintained for backward compatibility
const syncDatabases = () => {
  return localDB.sync(remoteDB, {
    live: true,
    retry: true,
    continuous: true,
    filter: (doc) => {
      // Only sync documents that have a type field
      return doc.type !== undefined;
    }
  });
};

// Initialize sync
let syncHandler = null;

// Enhanced sync initialization with offline data manager integration
const initializeSync = async () => {
  try {
    // Initialize the new offline data manager
    await offlineDataManager.initialize();
    
    // Setup event listeners for sync status updates
    offlineDataManager.on('syncStart', () => {
      console.log('📡 Advanced sync started');
    });
    
    offlineDataManager.on('syncComplete', (data) => {
      console.log('✅ Advanced sync completed:', data);
    });
    
    offlineDataManager.on('syncError', (data) => {
      console.error('❌ Advanced sync error:', data);
    });
    
    offlineDataManager.on('online', () => {
      console.log('🌐 Advanced offline manager detected online status');
    });
    
    offlineDataManager.on('offline', () => {
      console.log('📴 Advanced offline manager detected offline status');
    });
    
    // Legacy sync for backward compatibility
    if (syncHandler) {
      syncHandler.cancel();
    }
    
    syncHandler = syncDatabases();
    
    syncHandler
      .on('change', (change) => {
        console.log('Sync change:', change);
      })
      .on('paused', () => {
        console.log('Sync paused');
      })
      .on('active', () => {
        console.log('Sync active');
      })
      .on('error', (err) => {
        console.error('Sync error:', err);
      });
      
  } catch (error) {
    console.error('Failed to initialize enhanced sync:', error);
    
    // Fallback to legacy sync only
    if (syncHandler) {
      syncHandler.cancel();
    }
    
    syncHandler = syncDatabases();
    
    syncHandler
      .on('change', (change) => {
        console.log('Sync change:', change);
      })
      .on('paused', () => {
        console.log('Sync paused');
      })
      .on('active', () => {
        console.log('Sync active');
      })
      .on('error', (err) => {
        console.error('Sync error:', err);
      });
  }
};

// Enhanced database operations with offline support
const db = {
  // Get document by ID - with offline fallback
  async get(id) {
    try {
      // Try offline data manager first
      if (offlineDataManager.isInitialized) {
        const userId = offlineDataManager.getCurrentUserId();
        
        // Route to appropriate method based on document type
        if (id.startsWith('user_')) {
          return await offlineDataManager.getUserProfile(id);
        } else if (id.startsWith('progress_')) {
          const courseId = id.split('_')[2];
          return await offlineDataManager.getCourseProgress(courseId, userId);
        }
      }
      
      // Fallback to legacy method
      return await localDB.get(id);
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Put document - with offline queue support
  async put(doc) {
    try {
      // Try offline data manager first
      if (offlineDataManager.isInitialized) {
        const userId = offlineDataManager.getCurrentUserId();
        
        // Route to appropriate method based on document type
        if (doc.type === 'user') {
          return await offlineDataManager.saveUserProfile(doc);
        } else if (doc.type === 'progress') {
          return await offlineDataManager.saveCourseProgress(doc.courseId, doc, userId);
        } else if (doc.type === 'enrollment') {
          return await offlineDataManager.saveCourseEnrollment(doc.courseId, userId);
        }
      }
      
      // Fallback to legacy method
      return await localDB.put(doc);
    } catch (error) {
      console.error('Error putting document:', error);
      throw error;
    }
  },

  // Post document - with offline queue support  
  async post(doc) {
    try {
      // Generate ID if not provided
      if (!doc._id) {
        doc._id = `${doc.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      return await this.put(doc);
    } catch (error) {
      console.error('Error posting document:', error);
      throw error;
    }
  },

  // Remove document - with offline queue support
  async remove(docOrId, rev) {
    try {
      // Fallback to legacy method for now
      return await localDB.remove(docOrId, rev);
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  },

  // Find documents - with offline cache support
  async find(selector) {
    try {
      // Try offline data manager first
      if (offlineDataManager.isInitialized && selector.selector) {
        const userId = offlineDataManager.getCurrentUserId();
        
        // Route to appropriate method based on selector
        if (selector.selector.type === 'user') {
          const profile = await offlineDataManager.getUserProfile(selector.selector._id || userId);
          return { docs: profile ? [profile] : [] };
        } else if (selector.selector.type === 'enrollment') {
          const courses = await offlineDataManager.getEnrolledCourses(userId);
          return { docs: courses };
        } else if (selector.selector.type === 'progress') {
          const progress = await offlineDataManager.getCourseProgress(selector.selector.courseId, userId);
          return { docs: progress ? [progress] : [] };
        } else if (selector.selector.type === 'job') {
          const jobs = await offlineDataManager.getJobs(selector.selector);
          return { docs: jobs };
        } else if (selector.selector.type === 'certificate') {
          const certificates = await offlineDataManager.getCertificates(userId);
          return { docs: certificates };
        }
      }
      
      // Fallback to legacy method
      return await localDB.find(selector);
    } catch (error) {
      console.error('Error finding documents:', error);
      throw error;
    }
  },

  // All docs - with offline cache support
  async allDocs(options = {}) {
    try {
      return await localDB.allDocs(options);
    } catch (error) {
      console.error('Error getting all documents:', error);
      throw error;
    }
  },

  // Bulk docs - with offline queue support
  async bulkDocs(docs, options = {}) {
    try {
      // Process each document through the appropriate offline method
      if (offlineDataManager.isInitialized) {
        const results = [];
        
        for (const doc of docs) {
          try {
            const result = await this.put(doc);
            results.push(result);
          } catch (error) {
            results.push({ error: error.message, id: doc._id });
          }
        }
        
        return results;
      }
      
      // Fallback to legacy method
      return await localDB.bulkDocs(docs, options);
    } catch (error) {
      console.error('Error with bulk docs:', error);
      throw error;
    }
  },

  // Create index - enhanced with offline support
  async createIndex(indexDef) {
    try {
      return await localDB.createIndex(indexDef);
    } catch (error) {
      console.error('Error creating index:', error);
      throw error;
    }
  },

  // Get attachment - with offline cache support
  async getAttachment(docId, attachmentId, options = {}) {
    try {
      return await localDB.getAttachment(docId, attachmentId, options);
    } catch (error) {
      console.error('Error getting attachment:', error);
      throw error;
    }
  },

  // Put attachment - with offline queue support
  async putAttachment(docId, attachmentId, attachment, type, rev) {
    try {
      return await localDB.putAttachment(docId, attachmentId, attachment, type, rev);
    } catch (error) {
      console.error('Error putting attachment:', error);
      throw error;
    }
  },

  // Enhanced methods for offline support
  
  // Check if online
  async isOnline() {
    try {
      if (offlineDataManager.isInitialized) {
        return offlineDataManager.getSyncStatus().isOnline;
      }
      
      // Fallback method
      await remoteDB.info();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get sync status
  getSyncStatus() {
    if (offlineDataManager.isInitialized) {
      return offlineDataManager.getSyncStatus();
    }
    
    return {
      status: 'legacy',
      isOnline: navigator.onLine,
      lastSync: null,
      stats: { totalSyncs: 0, successfulSyncs: 0, failedSyncs: 0 },
      conflictQueue: 0
    };
  },

  // Force sync
  forceSync() {
    if (offlineDataManager.isInitialized) {
      offlineDataManager.forceSync();
    } else if (syncHandler) {
      // Legacy sync restart
      syncHandler.cancel();
      syncHandler = syncDatabases();
    }
  },

  // Get offline data manager instance
  getOfflineManager() {
    return offlineDataManager;
  },

  // Get local database - for backward compatibility
  getLocalDB() {
    return localDB;
  },

  // Get remote database - for backward compatibility  
  getRemoteDB() {
    return remoteDB;
  },

  // Clear all offline data
  async clearOfflineData() {
    try {
      if (offlineDataManager.isInitialized) {
        await offlineDataManager.clearAllData();
      }
      
      // Clear legacy database
      await localDB.destroy();
      
      console.log('✅ All offline data cleared');
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
    }
  },

  // Enhanced progress tracking
  async saveProgress(courseId, progressData) {
    try {
      if (offlineDataManager.isInitialized) {
        const userId = offlineDataManager.getCurrentUserId();
        return await offlineDataManager.saveCourseProgress(courseId, progressData, userId);
      }
      
      // Fallback to legacy method
      const progressDoc = {
        _id: `progress_${courseId}_${Date.now()}`,
        type: 'progress',
        courseId,
        ...progressData,
        timestamp: Date.now()
      };
      
      return await localDB.put(progressDoc);
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  },

  // Enhanced course enrollment
  async enrollInCourse(courseId) {
    try {
      if (offlineDataManager.isInitialized) {
        const userId = offlineDataManager.getCurrentUserId();
        return await offlineDataManager.saveCourseEnrollment(courseId, userId);
      }
      
      // Fallback to legacy method
      const enrollmentDoc = {
        _id: `enrollment_${courseId}_${Date.now()}`,
        type: 'enrollment',
        courseId,
        enrolledAt: Date.now(),
        isActive: true
      };
      
      return await localDB.put(enrollmentDoc);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  // Get user's enrolled courses
  async getEnrolledCourses() {
    try {
      if (offlineDataManager.isInitialized) {
        const userId = offlineDataManager.getCurrentUserId();
        return await offlineDataManager.getEnrolledCourses(userId);
      }
      
      // Fallback to legacy method
      const result = await localDB.find({
        selector: { type: 'enrollment', isActive: true }
      });
      
      return result.docs;
    } catch (error) {
      console.error('Error getting enrolled courses:', error);
      return [];
    }
  },

  // Get user's progress for a course
  async getCourseProgress(courseId) {
    try {
      if (offlineDataManager.isInitialized) {
        const userId = offlineDataManager.getCurrentUserId();
        return await offlineDataManager.getCourseProgress(courseId, userId);
      }
      
      // Fallback to legacy method
      const result = await localDB.find({
        selector: { type: 'progress', courseId },
        sort: [{ timestamp: 'desc' }],
        limit: 1
      });
      
      return result.docs[0] || null;
    } catch (error) {
      console.error('Error getting course progress:', error);
      return null;
    }
  }
};

// Initialize sync when module is loaded
if (typeof window !== 'undefined') {
  // Only initialize sync in browser environment
  initializeSync();
}

export default db; 