import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import PouchDBIdb from 'pouchdb-adapter-idb';
import PouchDBHttp from 'pouchdb-adapter-http';

// Register PouchDB plugins
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBIdb);
PouchDB.plugin(PouchDBHttp);

// Configuration
const DATABASES = {
  USERS: 'refulearn-users',
  COURSES: 'refulearn-courses',
  PROGRESS: 'refulearn-progress',
  JOBS: 'refulearn-jobs',
  CERTIFICATES: 'refulearn-certificates',
  SETTINGS: 'refulearn-settings'
};

const SYNC_STATUSES = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  COMPLETE: 'complete',
  ERROR: 'error',
  PAUSED: 'paused'
};

const CONFLICT_STRATEGIES = {
  SERVER_WINS: 'server-wins',
  CLIENT_WINS: 'client-wins',
  MERGE: 'merge',
  PROMPT_USER: 'prompt-user'
};

class OfflineDataManager {
  constructor() {
    this.isInitialized = false;
    this.databases = {};
    this.syncHandlers = {};
    this.syncStatus = SYNC_STATUSES.IDLE;
    this.eventListeners = new Map();
    this.conflictQueue = [];
    this.isOnline = navigator.onLine;
    this.lastSyncTime = null;
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0
    };
    
    // Bind methods
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    
    // Setup online/offline listeners
    this.setupNetworkListeners();
    
    console.log('🔧 OfflineDataManager initialized');
  }

  // Initialize the offline data manager
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing OfflineDataManager...');
      
      // Initialize local databases
      await this.initializeDatabases();
      
      // Setup sync handlers
      await this.setupSyncHandlers();
      
      // Create indexes for efficient querying
      await this.createIndexes();
      
      // Load cached data to memory
      await this.loadCachedData();
      
      // Start initial sync if online
      if (this.isOnline) {
        this.startSync();
      }
      
      this.isInitialized = true;
      console.log('✅ OfflineDataManager initialization complete');
      
      this.emit('initialized');
    } catch (error) {
      console.error('❌ OfflineDataManager initialization failed:', error);
      throw error;
    }
  }

  // Initialize all databases
  async initializeDatabases() {
    for (const [key, dbName] of Object.entries(DATABASES)) {
      try {
        this.databases[key] = new PouchDB(dbName, {
          adapter: 'idb',
          auto_compaction: true,
          revs_limit: 10
        });
        
        console.log(`📁 Database initialized: ${dbName}`);
      } catch (error) {
        console.error(`❌ Failed to initialize database ${dbName}:`, error);
      }
    }
  }

  // Setup sync handlers for each database
  async setupSyncHandlers() {
    const remoteConfig = this.getRemoteConfig();
    
    for (const [key, localDB] of Object.entries(this.databases)) {
      try {
        const remoteDB = new PouchDB(`${remoteConfig.url}/${DATABASES[key]}`, {
          auth: remoteConfig.auth,
          adapter: 'http'
        });
        
        this.syncHandlers[key] = {
          local: localDB,
          remote: remoteDB,
          sync: null,
          lastSync: null,
          conflictStrategy: CONFLICT_STRATEGIES.MERGE
        };
        
        console.log(`🔄 Sync handler setup for: ${key}`);
      } catch (error) {
        console.warn(`⚠️ Failed to setup sync for ${key}:`, error);
      }
    }
  }

  // Create indexes for efficient querying
  async createIndexes() {
    try {
      // Users index
      await this.databases.USERS.createIndex({
        index: {
          fields: ['type', 'email', 'role', 'isActive']
        }
      });

      // Courses index
      await this.databases.COURSES.createIndex({
        index: {
          fields: ['type', 'category', 'isPublished', 'createdAt']
        }
      });

      // Progress index
      await this.databases.PROGRESS.createIndex({
        index: {
          fields: ['type', 'userId', 'courseId', 'lastUpdated']
        }
      });

      // Jobs index
      await this.databases.JOBS.createIndex({
        index: {
          fields: ['type', 'category', 'isActive', 'applicationDeadline']
        }
      });

      console.log('📊 Database indexes created successfully');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
    }
  }

  // Load cached data into memory for quick access
  async loadCachedData() {
    try {
      // Load user profile
      const userProfile = await this.getUserProfile();
      if (userProfile) {
        localStorage.setItem('cachedUserProfile', JSON.stringify(userProfile));
      }

      // Load enrolled courses
      const enrolledCourses = await this.getEnrolledCourses();
      if (enrolledCourses) {
        localStorage.setItem('cachedEnrolledCourses', JSON.stringify(enrolledCourses));
      }

      console.log('💾 Cached data loaded to memory');
    } catch (error) {
      console.error('❌ Failed to load cached data:', error);
    }
  }

  // Setup network event listeners
  setupNetworkListeners() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  // Handle online event
  handleOnline() {
    console.log('🌐 Connection restored - starting sync');
    this.isOnline = true;
    this.emit('online');
    this.startSync();
  }

  // Handle offline event
  handleOffline() {
    console.log('📴 Connection lost - entering offline mode');
    this.isOnline = false;
    this.emit('offline');
    this.pauseSync();
  }

  // Start synchronization
  startSync() {
    if (!this.isOnline || this.syncStatus === SYNC_STATUSES.SYNCING) return;

    this.syncStatus = SYNC_STATUSES.SYNCING;
    this.emit('syncStart');

    console.log('🔄 Starting data synchronization...');
    
    // Sync each database
    Object.keys(this.syncHandlers).forEach(key => {
      this.syncDatabase(key);
    });
  }

  // Sync individual database
  async syncDatabase(dbKey) {
    const handler = this.syncHandlers[dbKey];
    if (!handler || !handler.remote) return;

    try {
      console.log(`🔄 Syncing ${dbKey}...`);
      
      // Cancel existing sync if running
      if (handler.sync) {
        handler.sync.cancel();
      }

      handler.sync = handler.local.sync(handler.remote, {
        live: true,
        retry: true,
        continuous: false,
        filter: (doc) => this.syncFilter(doc, dbKey),
        conflicts: true // Enable conflict detection
      });

      // Handle sync events
      handler.sync.on('change', (info) => {
        console.log(`📊 Sync change in ${dbKey}:`, info);
        this.handleSyncChange(dbKey, info);
      });

      handler.sync.on('complete', (info) => {
        console.log(`✅ Sync complete for ${dbKey}:`, info);
        this.handleSyncComplete(dbKey, info);
      });

      handler.sync.on('error', (error) => {
        console.error(`❌ Sync error in ${dbKey}:`, error);
        this.handleSyncError(dbKey, error);
      });

      handler.sync.on('paused', (error) => {
        if (error) {
          console.warn(`⏸️ Sync paused for ${dbKey}:`, error);
        }
      });

      handler.sync.on('active', () => {
        console.log(`🔄 Sync active for ${dbKey}`);
      });

      handler.sync.on('denied', (error) => {
        console.error(`🚫 Sync denied for ${dbKey}:`, error);
      });

    } catch (error) {
      console.error(`❌ Failed to start sync for ${dbKey}:`, error);
      this.handleSyncError(dbKey, error);
    }
  }

  // Sync filter to control what gets synced
  syncFilter(doc, dbKey) {
    // Filter logic based on database type
    switch (dbKey) {
      case 'USERS':
        return doc.type === 'user' && doc.isActive !== false;
      case 'COURSES':
        return doc.type === 'course' && doc.isPublished === true;
      case 'PROGRESS':
        return doc.type === 'progress';
      case 'JOBS':
        return doc.type === 'job' && doc.isActive !== false;
      case 'CERTIFICATES':
        return doc.type === 'certificate';
      default:
        return true;
    }
  }

  // Handle sync change event
  handleSyncChange(dbKey, info) {
    if (info.change && info.change.docs) {
      info.change.docs.forEach(doc => {
        if (doc._conflicts) {
          this.handleConflict(dbKey, doc);
        }
      });
    }
    
    this.emit('syncChange', { dbKey, info });
  }

  // Handle sync complete event
  handleSyncComplete(dbKey, info) {
    const handler = this.syncHandlers[dbKey];
    if (handler) {
      handler.lastSync = Date.now();
    }
    
    this.lastSyncTime = Date.now();
    this.syncStats.totalSyncs++;
    this.syncStats.successfulSyncs++;
    
    this.emit('syncComplete', { dbKey, info });
    
    // Check if all databases are synced
    this.checkAllSyncsComplete();
  }

  // Handle sync error
  handleSyncError(dbKey, error) {
    this.syncStats.failedSyncs++;
    this.emit('syncError', { dbKey, error });
    
    // Retry logic
    setTimeout(() => {
      if (this.isOnline) {
        console.log(`🔄 Retrying sync for ${dbKey}...`);
        this.syncDatabase(dbKey);
      }
    }, 30000); // Retry after 30 seconds
  }

  // Check if all syncs are complete
  checkAllSyncsComplete() {
    const allComplete = Object.values(this.syncHandlers).every(handler => 
      handler.lastSync && (Date.now() - handler.lastSync) < 60000 // Within last minute
    );
    
    if (allComplete) {
      this.syncStatus = SYNC_STATUSES.COMPLETE;
      this.emit('allSyncsComplete');
      console.log('✅ All database syncs completed');
    }
  }

  // Handle conflicts
  async handleConflict(dbKey, doc) {
    console.log(`⚠️ Conflict detected in ${dbKey}:`, doc._id);
    
    const handler = this.syncHandlers[dbKey];
    const strategy = handler.conflictStrategy;
    
    try {
      switch (strategy) {
        case CONFLICT_STRATEGIES.SERVER_WINS:
          await this.resolveConflictServerWins(dbKey, doc);
          break;
        case CONFLICT_STRATEGIES.CLIENT_WINS:
          await this.resolveConflictClientWins(dbKey, doc);
          break;
        case CONFLICT_STRATEGIES.MERGE:
          await this.resolveConflictMerge(dbKey, doc);
          break;
        case CONFLICT_STRATEGIES.PROMPT_USER:
          this.queueConflictForUser(dbKey, doc);
          break;
        default:
          await this.resolveConflictMerge(dbKey, doc);
      }
      
      this.syncStats.conflictsResolved++;
    } catch (error) {
      console.error('❌ Failed to resolve conflict:', error);
    }
  }

  // Resolve conflict - server wins
  async resolveConflictServerWins(dbKey, doc) {
    const db = this.databases[dbKey];
    const conflicts = doc._conflicts || [];
    
    for (const conflictRev of conflicts) {
      await db.remove(doc._id, conflictRev);
    }
    
    console.log(`✅ Conflict resolved (server wins) for ${doc._id}`);
  }

  // Resolve conflict - client wins
  async resolveConflictClientWins(dbKey, doc) {
    const db = this.databases[dbKey];
    const conflicts = doc._conflicts || [];
    
    // Keep current version, remove conflicting ones
    for (const conflictRev of conflicts) {
      try {
        const conflictDoc = await db.get(doc._id, { rev: conflictRev });
        await db.remove(conflictDoc);
      } catch (error) {
        console.warn('Failed to remove conflict:', error);
      }
    }
    
    console.log(`✅ Conflict resolved (client wins) for ${doc._id}`);
  }

  // Resolve conflict - merge data
  async resolveConflictMerge(dbKey, doc) {
    const db = this.databases[dbKey];
    const conflicts = doc._conflicts || [];
    
    let mergedDoc = { ...doc };
    
    // Get all conflicting versions
    for (const conflictRev of conflicts) {
      try {
        const conflictDoc = await db.get(doc._id, { rev: conflictRev });
        mergedDoc = this.mergeDocuments(mergedDoc, conflictDoc);
      } catch (error) {
        console.warn('Failed to get conflict document:', error);
      }
    }
    
    // Save merged document
    delete mergedDoc._conflicts;
    await db.put(mergedDoc);
    
    // Remove conflicting versions
    for (const conflictRev of conflicts) {
      try {
        await db.remove(doc._id, conflictRev);
      } catch (error) {
        console.warn('Failed to remove conflict:', error);
      }
    }
    
    console.log(`✅ Conflict resolved (merged) for ${doc._id}`);
  }

  // Merge two documents
  mergeDocuments(doc1, doc2) {
    const merged = { ...doc1 };
    
    // Merge strategy based on document type
    if (doc1.type === 'progress') {
      // For progress, use the latest timestamp
      if (doc2.lastUpdated > doc1.lastUpdated) {
        merged.progress = doc2.progress;
        merged.lastUpdated = doc2.lastUpdated;
      }
    } else if (doc1.type === 'user') {
      // For users, merge profile data
      merged.profile = { ...doc1.profile, ...doc2.profile };
      merged.lastModified = Math.max(doc1.lastModified || 0, doc2.lastModified || 0);
    }
    
    return merged;
  }

  // Queue conflict for user resolution
  queueConflictForUser(dbKey, doc) {
    this.conflictQueue.push({
      dbKey,
      doc,
      timestamp: Date.now()
    });
    
    this.emit('conflictQueued', { dbKey, doc });
  }

  // Pause synchronization
  pauseSync() {
    this.syncStatus = SYNC_STATUSES.PAUSED;
    
    Object.values(this.syncHandlers).forEach(handler => {
      if (handler.sync) {
        handler.sync.cancel();
      }
    });
    
    this.emit('syncPaused');
  }

  // Resume synchronization
  resumeSync() {
    if (this.isOnline) {
      this.startSync();
    }
  }

  // Event emitter functionality
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Data access methods
  
  // Get user profile
  async getUserProfile(userId) {
    try {
      const db = this.databases.USERS;
      const result = await db.find({
        selector: {
          type: 'user',
          _id: userId || this.getCurrentUserId()
        },
        limit: 1
      });
      
      return result.docs[0] || null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Save user profile
  async saveUserProfile(profile) {
    try {
      const db = this.databases.USERS;
      profile.type = 'user';
      profile.lastModified = Date.now();
      
      const result = await db.put(profile);
      console.log('✅ User profile saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to save user profile:', error);
      throw error;
    }
  }

  // Get enrolled courses
  async getEnrolledCourses(userId) {
    try {
      const db = this.databases.COURSES;
      const result = await db.find({
        selector: {
          type: 'enrollment',
          userId: userId || this.getCurrentUserId()
        }
      });
      
      return result.docs || [];
    } catch (error) {
      console.error('Failed to get enrolled courses:', error);
      return [];
    }
  }

  // Save course enrollment
  async saveCourseEnrollment(courseId, userId) {
    try {
      const db = this.databases.COURSES;
      const enrollment = {
        _id: `enrollment_${userId || this.getCurrentUserId()}_${courseId}`,
        type: 'enrollment',
        userId: userId || this.getCurrentUserId(),
        courseId,
        enrolledAt: Date.now(),
        isActive: true
      };
      
      const result = await db.put(enrollment);
      console.log('✅ Course enrollment saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to save course enrollment:', error);
      throw error;
    }
  }

  // Get course progress
  async getCourseProgress(courseId, userId) {
    try {
      const db = this.databases.PROGRESS;
      const result = await db.find({
        selector: {
          type: 'progress',
          userId: userId || this.getCurrentUserId(),
          courseId
        },
        limit: 1
      });
      
      return result.docs[0] || null;
    } catch (error) {
      console.error('Failed to get course progress:', error);
      return null;
    }
  }

  // Save course progress
  async saveCourseProgress(courseId, progressData, userId) {
    try {
      const db = this.databases.PROGRESS;
      const docId = `progress_${userId || this.getCurrentUserId()}_${courseId}`;
      
      let progressDoc;
      try {
        progressDoc = await db.get(docId);
      } catch (error) {
        progressDoc = {
          _id: docId,
          type: 'progress',
          userId: userId || this.getCurrentUserId(),
          courseId,
          createdAt: Date.now()
        };
      }
      
      // Update progress data
      progressDoc = {
        ...progressDoc,
        ...progressData,
        lastUpdated: Date.now()
      };
      
      const result = await db.put(progressDoc);
      console.log('✅ Course progress saved:', result);
      
      // Update localStorage cache
      this.updateProgressCache(courseId, progressData);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save course progress:', error);
      throw error;
    }
  }

  // Update progress cache in localStorage
  updateProgressCache(courseId, progressData) {
    try {
      const cached = JSON.parse(localStorage.getItem('courseProgress') || '{}');
      cached[courseId] = {
        ...cached[courseId],
        ...progressData,
        lastUpdated: Date.now()
      };
      localStorage.setItem('courseProgress', JSON.stringify(cached));
    } catch (error) {
      console.error('Failed to update progress cache:', error);
    }
  }

  // Get jobs
  async getJobs(filters = {}) {
    try {
      const db = this.databases.JOBS;
      const selector = {
        type: 'job',
        isActive: true,
        ...filters
      };
      
      const result = await db.find({
        selector,
        sort: [{ createdAt: 'desc' }]
      });
      
      return result.docs || [];
    } catch (error) {
      console.error('Failed to get jobs:', error);
      return [];
    }
  }

  // Get certificates
  async getCertificates(userId) {
    try {
      const db = this.databases.CERTIFICATES;
      const result = await db.find({
        selector: {
          type: 'certificate',
          userId: userId || this.getCurrentUserId()
        },
        sort: [{ issuedAt: 'desc' }]
      });
      
      return result.docs || [];
    } catch (error) {
      console.error('Failed to get certificates:', error);
      return [];
    }
  }

  // Get current user ID
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user._id || user.id;
    } catch (error) {
      return null;
    }
  }

  // Get remote configuration
  getRemoteConfig() {
    return {
      url: process.env.REACT_APP_COUCHDB_URL || 'http://localhost:5984',
      auth: {
        username: process.env.REACT_APP_COUCHDB_USERNAME || 'admin',
        password: process.env.REACT_APP_COUCHDB_PASSWORD || 'password'
      }
    };
  }

  // Get sync status
  getSyncStatus() {
    return {
      status: this.syncStatus,
      isOnline: this.isOnline,
      lastSync: this.lastSyncTime,
      stats: this.syncStats,
      conflictQueue: this.conflictQueue.length
    };
  }

  // Force sync
  forceSync() {
    if (this.isOnline) {
      this.startSync();
    }
  }

  // Clear all data (for logout)
  async clearAllData() {
    try {
      for (const db of Object.values(this.databases)) {
        await db.destroy();
      }
      
      // Clear localStorage
      localStorage.removeItem('cachedUserProfile');
      localStorage.removeItem('cachedEnrolledCourses');
      localStorage.removeItem('courseProgress');
      
      console.log('✅ All offline data cleared');
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
    }
  }

  // Cleanup resources
  destroy() {
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    // Cancel all syncs
    Object.values(this.syncHandlers).forEach(handler => {
      if (handler.sync) {
        handler.sync.cancel();
      }
    });
    
    // Clear event listeners
    this.eventListeners.clear();
    
    console.log('🧹 OfflineDataManager destroyed');
  }
}

// Create singleton instance
const offlineDataManager = new OfflineDataManager();

export default offlineDataManager; 