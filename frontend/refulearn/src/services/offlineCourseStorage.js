import offlineDataManager from './offlineDataManager';

class OfflineCourseStorage {
  constructor() {
    this.isInitialized = false;
    this.downloadQueue = [];
    this.downloadInProgress = false;
    this.downloadStats = {
      totalFiles: 0,
      downloadedFiles: 0,
      failedFiles: 0,
      totalSize: 0,
      downloadedSize: 0
    };
    this.eventListeners = new Map();
    this.offlineContent = new Map();
    this.maxCacheSize = 500 * 1024 * 1024; // 500MB default limit
    this.currentCacheSize = 0;
    
    console.log('📚 OfflineCourseStorage initialized');
  }

  // Initialize the offline course storage
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing OfflineCourseStorage...');
      
      // Initialize IndexedDB for large content storage
      await this.initializeContentDatabase();
      
      // Load existing offline content metadata
      await this.loadOfflineContentMetadata();
      
      // Calculate current cache size
      await this.calculateCacheSize();
      
      // Clean up expired content
      await this.cleanupExpiredContent();
      
      this.isInitialized = true;
      console.log('✅ OfflineCourseStorage initialization complete');
      
      this.emit('initialized');
    } catch (error) {
      console.error('❌ OfflineCourseStorage initialization failed:', error);
      throw error;
    }
  }

  // Initialize IndexedDB for content storage
  async initializeContentDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RefuLearnOfflineContent', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('courses')) {
          const coursesStore = db.createObjectStore('courses', { keyPath: 'id' });
          coursesStore.createIndex('courseId', 'courseId', { unique: false });
          coursesStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('modules')) {
          const modulesStore = db.createObjectStore('modules', { keyPath: 'id' });
          modulesStore.createIndex('courseId', 'courseId', { unique: false });
          modulesStore.createIndex('moduleId', 'moduleId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('content')) {
          const contentStore = db.createObjectStore('content', { keyPath: 'id' });
          contentStore.createIndex('courseId', 'courseId', { unique: false });
          contentStore.createIndex('moduleId', 'moduleId', { unique: false });
          contentStore.createIndex('contentType', 'contentType', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('attachments')) {
          const attachmentsStore = db.createObjectStore('attachments', { keyPath: 'id' });
          attachmentsStore.createIndex('courseId', 'courseId', { unique: false });
          attachmentsStore.createIndex('moduleId', 'moduleId', { unique: false });
          attachmentsStore.createIndex('fileType', 'fileType', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.contentDB = event.target.result;
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // Load offline content metadata
  async loadOfflineContentMetadata() {
    try {
      const storedMetadata = localStorage.getItem('offlineContentMetadata');
      if (storedMetadata) {
        const metadata = JSON.parse(storedMetadata);
        this.offlineContent = new Map(Object.entries(metadata || {}));
        console.log(`📊 Loaded metadata for ${this.offlineContent.size} offline items`);
      }
    } catch (error) {
      console.error('Failed to load offline content metadata:', error);
    }
  }

  // Calculate current cache size
  async calculateCacheSize() {
    try {
      if (!this.contentDB) return;
      
      let totalSize = 0;
      const stores = ['courses', 'modules', 'content', 'attachments'];
      
      for (const storeName of stores) {
        const transaction = this.contentDB.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        const items = await new Promise((resolve) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve([]);
        });
        
        items.forEach(item => {
          if (item.size) {
            totalSize += item.size;
          } else if (item.data && item.data.length) {
            totalSize += item.data.length;
          }
        });
      }
      
      this.currentCacheSize = totalSize;
      console.log(`💾 Current cache size: ${this.formatSize(totalSize)}`);
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
    }
  }

  // Clean up expired content
  async cleanupExpiredContent() {
    try {
      const now = Date.now();
      const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days
      
      for (const [contentId, metadata] of this.offlineContent) {
        if (now - metadata.downloadedAt > expirationTime) {
          await this.removeOfflineContent(contentId);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired content:', error);
    }
  }

  // Download course for offline access
  async downloadCourse(courseId, options = {}) {
    try {
      console.log(`📥 Starting download for course: ${courseId}`);
      
      const {
        includeVideos = false,
        includeDocuments = true,
        includeImages = true,
        includeQuizzes = true,
        includeDiscussions = true,
        quality = 'medium' // low, medium, high
      } = options;
      
      // Get course data
      const courseData = await this.fetchCourseData(courseId);
      if (!courseData) {
        throw new Error('Course not found');
      }
      
      // Calculate download requirements
      const downloadPlan = await this.createDownloadPlan(courseData, options);
      
      // Check available space
      if (downloadPlan.totalSize > this.getRemainingSpace()) {
        throw new Error('Insufficient storage space');
      }
      
      // Start download process
      this.downloadInProgress = true;
      this.downloadStats = {
        totalFiles: downloadPlan.files.length,
        downloadedFiles: 0,
        failedFiles: 0,
        totalSize: downloadPlan.totalSize,
        downloadedSize: 0
      };
      
      this.emit('downloadStarted', { courseId, plan: downloadPlan });
      
      // Download course metadata
      await this.storeCourseMetadata(courseData);
      
      // Download modules
      for (const module of courseData.modules) {
        await this.downloadModule(courseId, module, options);
      }
      
      // Download course-level content
      await this.downloadCourseContent(courseData, options);
      
      // Mark course as available offline
      await this.markCourseOffline(courseId, {
        downloadedAt: Date.now(),
        options,
        size: downloadPlan.totalSize,
        version: courseData.version || 1
      });
      
      this.downloadInProgress = false;
      console.log(`✅ Course ${courseId} downloaded successfully`);
      
      this.emit('downloadCompleted', { courseId, stats: this.downloadStats });
      
      return {
        success: true,
        courseId,
        stats: this.downloadStats
      };
      
    } catch (error) {
      this.downloadInProgress = false;
      console.error(`❌ Failed to download course ${courseId}:`, error);
      
      this.emit('downloadFailed', { courseId, error: error.message });
      throw error;
    }
  }

  // Fetch course data from API
  async fetchCourseData(courseId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.course;
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      return null;
    }
  }

  // Create download plan
  async createDownloadPlan(courseData, options) {
    const files = [];
    let totalSize = 0;
    
    // Course image
    if (courseData.course_profile_picture) {
      files.push({
        type: 'image',
        url: courseData.course_profile_picture,
        path: `courses/${courseData._id}/profile.jpg`,
        estimatedSize: 50 * 1024 // 50KB estimate
      });
    }
    
    // Module content
    for (const module of courseData.modules || []) {
      // Module content files
      if (module.content && options.includeDocuments) {
        files.push({
          type: 'content',
          content: module.content,
          path: `courses/${courseData._id}/modules/${module._id}/content.html`,
          estimatedSize: module.content.length * 2 // HTML + styling
        });
      }
      
      // Module resources
      if (module.resources) {
        for (const resource of module.resources) {
          if (resource.type === 'document' && options.includeDocuments) {
            files.push({
              type: 'document',
              url: resource.url,
              path: `courses/${courseData._id}/modules/${module._id}/resources/${resource.filename}`,
              estimatedSize: resource.size || 100 * 1024 // 100KB estimate
            });
          } else if (resource.type === 'video' && options.includeVideos) {
            files.push({
              type: 'video',
              url: resource.url,
              path: `courses/${courseData._id}/modules/${module._id}/videos/${resource.filename}`,
              estimatedSize: resource.size || 10 * 1024 * 1024 // 10MB estimate
            });
          } else if (resource.type === 'image' && options.includeImages) {
            files.push({
              type: 'image',
              url: resource.url,
              path: `courses/${courseData._id}/modules/${module._id}/images/${resource.filename}`,
              estimatedSize: resource.size || 200 * 1024 // 200KB estimate
            });
          }
        }
      }
      
      // Quiz content
      if (module.quizzes && options.includeQuizzes) {
        for (const quiz of module.quizzes) {
          files.push({
            type: 'quiz',
            content: quiz,
            path: `courses/${courseData._id}/modules/${module._id}/quizzes/${quiz._id}.json`,
            estimatedSize: JSON.stringify(quiz).length
          });
        }
      }
      
      // Discussion content
      if (module.discussions && options.includeDiscussions) {
        for (const discussion of module.discussions) {
          files.push({
            type: 'discussion',
            content: discussion,
            path: `courses/${courseData._id}/modules/${module._id}/discussions/${discussion._id}.json`,
            estimatedSize: JSON.stringify(discussion).length
          });
        }
      }
    }
    
    // Calculate total size
    totalSize = files.reduce((sum, file) => sum + file.estimatedSize, 0);
    
    return { files, totalSize };
  }

  // Store course metadata
  async storeCourseMetadata(courseData) {
    try {
      const transaction = this.contentDB.transaction(['courses'], 'readwrite');
      const store = transaction.objectStore('courses');
      
      const offlineCourse = {
        id: courseData._id,
        courseId: courseData._id,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        overview: courseData.overview,
        learningOutcomes: courseData.learningOutcomes,
        instructor: courseData.instructor,
        modules: courseData.modules?.map(m => ({
          _id: m._id,
          title: m.title,
          description: m.description,
          order: m.order
        })) || [],
        downloadedAt: Date.now(),
        size: JSON.stringify(courseData).length
      };
      
      await store.put(offlineCourse);
      console.log(`📚 Stored metadata for course: ${courseData.title}`);
    } catch (error) {
      console.error('Failed to store course metadata:', error);
    }
  }

  // Download module content
  async downloadModule(courseId, module, options) {
    try {
      const transaction = this.contentDB.transaction(['modules'], 'readwrite');
      const store = transaction.objectStore('modules');
      
      const offlineModule = {
        id: `${courseId}_${module._id}`,
        courseId,
        moduleId: module._id,
        title: module.title,
        description: module.description,
        content: module.content,
        videoUrl: module.videoUrl,
        resources: module.resources || [],
        quizzes: module.quizzes || [],
        discussions: module.discussions || [],
        assessments: module.assessments || [],
        downloadedAt: Date.now(),
        size: JSON.stringify(module).length
      };
      
      await store.put(offlineModule);
      
      // Download module attachments
      if (module.resources && module.resources.length > 0) {
        for (const resource of module.resources) {
          await this.downloadAttachment(courseId, module._id, resource, options);
        }
      }
      
      console.log(`📖 Downloaded module: ${module.title}`);
      
      this.downloadStats.downloadedFiles++;
      this.emit('downloadProgress', {
        courseId,
        progress: (this.downloadStats.downloadedFiles / this.downloadStats.totalFiles) * 100
      });
      
    } catch (error) {
      console.error(`Failed to download module ${module._id}:`, error);
      this.downloadStats.failedFiles++;
    }
  }

  // Download course-level content
  async downloadCourseContent(courseData, options) {
    try {
      // Download course profile picture
      if (courseData.course_profile_picture && options.includeImages) {
        await this.downloadImage(courseData._id, courseData.course_profile_picture, 'profile.jpg');
      }
      
      // Download any course-level attachments
      if (courseData.attachments) {
        for (const attachment of courseData.attachments) {
          await this.downloadAttachment(courseData._id, null, attachment, options);
        }
      }
      
    } catch (error) {
      console.error('Failed to download course content:', error);
    }
  }

  // Download attachment/resource
  async downloadAttachment(courseId, moduleId, resource, options) {
    try {
      // Skip if resource type is not included in options
      if (resource.type === 'video' && !options.includeVideos) return;
      if (resource.type === 'document' && !options.includeDocuments) return;
      if (resource.type === 'image' && !options.includeImages) return;
      
      const response = await fetch(resource.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      const transaction = this.contentDB.transaction(['attachments'], 'readwrite');
      const store = transaction.objectStore('attachments');
      
      const attachment = {
        id: `${courseId}_${moduleId || 'course'}_${resource.filename}`,
        courseId,
        moduleId: moduleId || null,
        filename: resource.filename,
        fileType: resource.type,
        mimeType: blob.type,
        size: arrayBuffer.byteLength,
        data: arrayBuffer,
        originalUrl: resource.url,
        downloadedAt: Date.now()
      };
      
      await store.put(attachment);
      
      this.downloadStats.downloadedSize += arrayBuffer.byteLength;
      this.currentCacheSize += arrayBuffer.byteLength;
      
      console.log(`📎 Downloaded attachment: ${resource.filename}`);
      
    } catch (error) {
      console.error(`Failed to download attachment ${resource.filename}:`, error);
      this.downloadStats.failedFiles++;
    }
  }

  // Download image
  async downloadImage(courseId, imageUrl, filename) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      const transaction = this.contentDB.transaction(['attachments'], 'readwrite');
      const store = transaction.objectStore('attachments');
      
      const image = {
        id: `${courseId}_image_${filename}`,
        courseId,
        moduleId: null,
        filename,
        fileType: 'image',
        mimeType: blob.type,
        size: arrayBuffer.byteLength,
        data: arrayBuffer,
        originalUrl: imageUrl,
        downloadedAt: Date.now()
      };
      
      await store.put(image);
      
      this.downloadStats.downloadedSize += arrayBuffer.byteLength;
      this.currentCacheSize += arrayBuffer.byteLength;
      
      console.log(`🖼️ Downloaded image: ${filename}`);
      
    } catch (error) {
      console.error(`Failed to download image ${filename}:`, error);
      this.downloadStats.failedFiles++;
    }
  }

  // Mark course as available offline
  async markCourseOffline(courseId, metadata) {
    this.offlineContent.set(courseId, metadata);
    
    // Save to localStorage
    const metadataObj = Object.fromEntries(this.offlineContent);
    localStorage.setItem('offlineContentMetadata', JSON.stringify(metadataObj));
    
    console.log(`✅ Course ${courseId} marked as offline`);
  }

  // Get offline course data
  async getOfflineCourse(courseId) {
    try {
      if (!this.isOfflineAvailable(courseId)) {
        return null;
      }
      
      const transaction = this.contentDB.transaction(['courses'], 'readonly');
      const store = transaction.objectStore('courses');
      const request = store.get(courseId);
      
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Failed to get offline course:', error);
      return null;
    }
  }

  // Get offline module data
  async getOfflineModule(courseId, moduleId) {
    try {
      const transaction = this.contentDB.transaction(['modules'], 'readonly');
      const store = transaction.objectStore('modules');
      const request = store.get(`${courseId}_${moduleId}`);
      
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Failed to get offline module:', error);
      return null;
    }
  }

  // Get offline attachment
  async getOfflineAttachment(courseId, moduleId, filename) {
    try {
      const transaction = this.contentDB.transaction(['attachments'], 'readonly');
      const store = transaction.objectStore('attachments');
      const request = store.get(`${courseId}_${moduleId || 'course'}_${filename}`);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Convert ArrayBuffer back to Blob
            const blob = new Blob([result.data], { type: result.mimeType });
            resolve({
              ...result,
              blob,
              url: URL.createObjectURL(blob)
            });
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Failed to get offline attachment:', error);
      return null;
    }
  }

  // Remove offline content
  async removeOfflineContent(courseId) {
    try {
      console.log(`🗑️ Removing offline content for course: ${courseId}`);
      
      const stores = ['courses', 'modules', 'content', 'attachments'];
      
      for (const storeName of stores) {
        const transaction = this.contentDB.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        if (storeName === 'courses') {
          await store.delete(courseId);
        } else {
          // Get all items for this course
          const index = store.index('courseId');
          const request = index.getAll(courseId);
          
          const items = await new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
          });
          
          // Delete each item
          for (const item of items) {
            await store.delete(item.id);
          }
        }
      }
      
      // Update metadata
      this.offlineContent.delete(courseId);
      const metadataObj = Object.fromEntries(this.offlineContent);
      localStorage.setItem('offlineContentMetadata', JSON.stringify(metadataObj));
      
      // Recalculate cache size
      await this.calculateCacheSize();
      
      console.log(`✅ Removed offline content for course: ${courseId}`);
      this.emit('contentRemoved', { courseId });
      
    } catch (error) {
      console.error('Failed to remove offline content:', error);
    }
  }

  // Check if course is available offline
  isOfflineAvailable(courseId) {
    return this.offlineContent.has(courseId);
  }

  // Get list of offline courses
  getOfflineCourses() {
    return Array.from(this.offlineContent.keys());
  }

  // Get offline content metadata
  getOfflineContentMetadata(courseId) {
    return this.offlineContent.get(courseId) || null;
  }

  // Get storage statistics
  getStorageStats() {
    return {
      totalCourses: this.offlineContent.size,
      currentCacheSize: this.currentCacheSize,
      maxCacheSize: this.maxCacheSize,
      remainingSpace: this.getRemainingSpace(),
      usage: (this.currentCacheSize / this.maxCacheSize) * 100
    };
  }

  // Get remaining storage space
  getRemainingSpace() {
    return Math.max(0, this.maxCacheSize - this.currentCacheSize);
  }

  // Set cache size limit
  setCacheLimit(sizeInBytes) {
    this.maxCacheSize = sizeInBytes;
    console.log(`📊 Cache limit set to: ${this.formatSize(sizeInBytes)}`);
  }

  // Format size for display
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Clear all offline content
  async clearAllOfflineContent() {
    try {
      const courseIds = Array.from(this.offlineContent.keys());
      
      for (const courseId of courseIds) {
        await this.removeOfflineContent(courseId);
      }
      
      console.log('🧹 All offline content cleared');
      this.emit('allContentCleared');
    } catch (error) {
      console.error('Failed to clear all offline content:', error);
    }
  }

  // Get download progress
  getDownloadProgress() {
    if (!this.downloadInProgress) {
      return null;
    }
    
    return {
      inProgress: this.downloadInProgress,
      stats: this.downloadStats,
      progress: (this.downloadStats.downloadedFiles / this.downloadStats.totalFiles) * 100
    };
  }

  // Cancel current download
  cancelDownload() {
    // Implementation would depend on how downloads are managed
    // For now, just mark as not in progress
    this.downloadInProgress = false;
    this.emit('downloadCancelled');
  }

  // Cleanup resources
  destroy() {
    if (this.contentDB) {
      this.contentDB.close();
    }
    this.eventListeners.clear();
    console.log('🧹 OfflineCourseStorage destroyed');
  }
}

// Create singleton instance
const offlineCourseStorage = new OfflineCourseStorage();

export default offlineCourseStorage; 