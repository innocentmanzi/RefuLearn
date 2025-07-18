// Offline Data Cache Service - Automatically caches real API responses
class OfflineDataCache {
  constructor() {
    this.isInitialized = false;
    this.cache = new Map();
    this.dbName = 'RefuLearnDataCache';
    this.db = null;
    this.syncQueue = [];
    
    console.log('🗄️ OfflineDataCache initialized');
  }

  // Initialize IndexedDB for caching
  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('jobs')) {
          db.createObjectStore('jobs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('certificates')) {
          db.createObjectStore('certificates', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('scholarships')) {
          db.createObjectStore('scholarships', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('courseData')) {
          db.createObjectStore('courseData', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('apiCache')) {
          const apiStore = db.createObjectStore('apiCache', { keyPath: 'url' });
          apiStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isInitialized = true;
        console.log('✅ OfflineDataCache initialized');
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // Store data in IndexedDB
  async storeData(storeName, data) {
    if (!this.isInitialized) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      if (Array.isArray(data)) {
        data.forEach(item => store.put(item));
      } else {
        store.put(data);
      }
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get data from IndexedDB
  async getData(storeName, id = null) {
    if (!this.isInitialized) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = id ? store.get(id) : store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Cache API response
  async cacheApiResponse(url, data, method = 'GET') {
    try {
      const cacheEntry = {
        url,
        method,
        data,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      await this.storeData('apiCache', cacheEntry);
      console.log(`📦 Cached API response: ${method} ${url}`);
    } catch (error) {
      console.error('Failed to cache API response:', error);
    }
  }

  // Get cached API response
  async getCachedApiResponse(url, method = 'GET') {
    try {
      const cached = await this.getData('apiCache', url);
      
      if (cached && cached.expires > Date.now()) {
        console.log(`📦 Serving cached response: ${method} ${url}`);
        return cached.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached API response:', error);
      return null;
    }
  }

  // Store user data when login successful
  async storeUserData(userData, password = null) {
    try {
      console.log('💾 storeUserData called with:', userData.email);
      console.log('🔧 Cache initialized:', this.isInitialized);
      
      if (!this.isInitialized) {
        console.log('⚠️ Initializing cache...');
        await this.initialize();
      }
      
      console.log('📊 Storing user in IndexedDB...');
      await this.storeData('users', { id: userData._id || userData.id, ...userData });
      console.log('✅ User stored in IndexedDB');
      
      // Store login credentials for offline access
      if (userData.email) {
        console.log('💾 Storing credentials in localStorage...');
        localStorage.setItem('lastUserEmail', userData.email);
        localStorage.setItem('lastUserData', JSON.stringify(userData));
        console.log('✅ Email and userData stored');
        
        // Store password for offline verification (in real app, you'd hash this)
        if (password) {
          localStorage.setItem('lastUserPassword', password);
          console.log('✅ Password cached for offline access');
        } else {
          console.log('⚠️ No password provided to cache');
        }
      } else {
        console.log('⚠️ No email in userData');
      }
      
      console.log('✅ User data cached for offline access');
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
      throw error; // Re-throw to see the error in the calling function
    }
  }

  // Get cached user data
  async getCachedUserData(userId) {
    try {
      return await this.getData('users', userId);
    } catch (error) {
      console.error('Failed to get cached user data:', error);
      return null;
    }
  }

  // Verify offline login credentials
  async verifyOfflineCredentials(email, password) {
    try {
      console.log('🔍 Checking offline credentials for:', email);
      
      // Check localStorage for cached credentials
      const lastUserEmail = localStorage.getItem('lastUserEmail');
      const lastUserData = localStorage.getItem('lastUserData');
      const storedPassword = localStorage.getItem('lastUserPassword');
      
      console.log('📱 Cached email:', lastUserEmail);
      console.log('📱 Has cached user data:', !!lastUserData);
      console.log('📱 Has cached password:', !!storedPassword);
      
      if (lastUserEmail === email && lastUserData) {
        const userData = JSON.parse(lastUserData);
        
        // If we have a stored password, verify it matches
        if (storedPassword && storedPassword === password) {
          console.log('✅ Offline credentials verified with stored password');
          return {
            success: true,
            user: userData
          };
        }
        // If no stored password but email matches, allow login (fallback)
        else if (!storedPassword) {
          console.log('✅ Offline credentials verified (no password check)');
          return {
            success: true,
            user: userData
          };
        }
        else {
          console.log('❌ Password mismatch');
          return { success: false, message: 'Invalid password' };
        }
      }
      
      console.log('❌ No matching cached credentials found');
      return { success: false, message: 'No cached credentials found for this email. Please login online first.' };
    } catch (error) {
      console.error('Failed to verify offline credentials:', error);
      return { success: false, message: 'Credential verification failed' };
    }
  }

  // Add to sync queue for when back online
  async addToSyncQueue(action, data) {
    try {
      const syncItem = {
        action,
        data,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      await this.storeData('syncQueue', syncItem);
      console.log('📝 Added to sync queue:', action);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  // Process sync queue when online
  async processSyncQueue() {
    if (!navigator.onLine) return;
    
    try {
      const queue = await this.getData('syncQueue');
      console.log(`🔄 Processing ${queue.length} items in sync queue...`);
      
      for (const item of queue) {
        try {
          await this.processSyncItem(item);
          // Remove from queue after successful sync
          await this.removeSyncItem(item.id);
        } catch (error) {
          console.error('Failed to process sync item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to process sync queue:', error);
    }
  }

  // Process individual sync item
  async processSyncItem(item) {
    const { action, data } = item;
    
    switch (action) {
      case 'updateProfile':
        await fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        break;
      case 'saveCourseProgress':
        await fetch(`/api/courses/${data.courseId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.progress)
        });
        break;
      default:
        console.warn('Unknown sync action:', action);
    }
  }

  // Remove item from sync queue
  async removeSyncItem(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all cached data
  async clearCache() {
    try {
      const stores = ['users', 'courses', 'progress', 'jobs', 'certificates', 'apiCache', 'syncQueue'];
      
      for (const storeName of stores) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.clear();
      }
      
      localStorage.removeItem('lastUserEmail');
      localStorage.removeItem('lastUserData');
      
      console.log('🧹 All cached data cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Check if data is available offline
  async isDataAvailableOffline(dataType, id = null) {
    try {
      const data = await this.getData(dataType, id);
      return data !== null && data !== undefined;
    } catch (error) {
      return false;
    }
  }

  // Add item to sync queue for when going online
  async addToSyncQueue(item) {
    try {
      if (!this.isInitialized) await this.initialize();
      
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      await store.add({
        ...item,
        id: Date.now() + Math.random() // Simple unique ID
      });
      
      console.log('✅ Item added to sync queue:', item);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to add item to sync queue:', error);
      return { success: false, error: error.message };
    }
  }

  // Process sync queue when going online
  async processSyncQueue() {
    try {
      if (!this.isInitialized) await this.initialize();
      
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const items = await store.getAll();
      
      console.log('🔄 Processing sync queue:', items.length, 'items');
      
      for (const item of items) {
        try {
          // Process different types of sync items
          if (item.type === 'enrollment') {
            await this.syncEnrollment(item);
          }
          // Add other sync types as needed
          
          // Remove processed item
          await store.delete(item.id);
        } catch (syncError) {
          console.error('❌ Failed to sync item:', item, syncError);
        }
      }
      
      console.log('✅ Sync queue processed');
    } catch (error) {
      console.error('❌ Failed to process sync queue:', error);
    }
  }

  // Sync enrollment item
  async syncEnrollment(item) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${item.courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Enrollment synced:', item.courseId);
      } else {
        throw new Error('Enrollment sync failed');
      }
    } catch (error) {
      console.error('❌ Enrollment sync failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const offlineDataCache = new OfflineDataCache();

export default offlineDataCache; 