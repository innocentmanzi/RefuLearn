/**
 * Cache Manager - Handles browser and service worker cache clearing
 */

class CacheManager {
  /**
   * Clear all browser caches
   */
  static async clearAllCaches() {
    console.log('🧹 Starting cache clearing process...');
    
    try {
      // 1. Clear localStorage
      console.log('🧹 Clearing localStorage...');
      localStorage.clear();
      
      // 2. Clear sessionStorage
      console.log('🧹 Clearing sessionStorage...');
      sessionStorage.clear();
      
      // 3. Clear IndexedDB (for PouchDB and offline data)
      console.log('🧹 Clearing IndexedDB...');
      await this.clearIndexedDB();
      
      // 4. Clear Service Worker caches
      console.log('🧹 Clearing Service Worker caches...');
      await this.clearServiceWorkerCaches();
      
      // 5. Unregister service worker
      console.log('🧹 Unregistering Service Worker...');
      await this.unregisterServiceWorker();
      
      console.log('✅ All caches cleared successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      return false;
    }
  }

  /**
   * Clear IndexedDB databases
   */
  static async clearIndexedDB() {
    if (!window.indexedDB) {
      console.log('⚠️ IndexedDB not supported');
      return;
    }

    try {
      // Get all database names (this is a bit tricky since there's no standard way)
      const databases = [
        'refulearn_courses',
        'refulearn_progress', 
        'refulearn_assessments',
        'refulearn_offline_data',
        '_pouch_refulearn_courses',
        '_pouch_refulearn_progress',
        '_pouch_refulearn_assessments'
      ];

      for (const dbName of databases) {
        try {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          await new Promise((resolve, reject) => {
            deleteReq.onsuccess = () => {
              console.log(`✅ Deleted IndexedDB: ${dbName}`);
              resolve();
            };
            deleteReq.onerror = () => reject(deleteReq.error);
            deleteReq.onblocked = () => {
              console.warn(`⚠️ IndexedDB deletion blocked: ${dbName}`);
              resolve(); // Continue anyway
            };
          });
        } catch (error) {
          console.warn(`⚠️ Could not delete IndexedDB ${dbName}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error clearing IndexedDB:', error);
    }
  }

  /**
   * Clear Service Worker caches
   */
  static async clearServiceWorkerCaches() {
    if (!('caches' in window)) {
      console.log('⚠️ Cache API not supported');
      return;
    }

    try {
      const cacheNames = await caches.keys();
      console.log('🔍 Found caches:', cacheNames);

      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const success = await caches.delete(cacheName);
          if (success) {
            console.log(`✅ Deleted cache: ${cacheName}`);
          } else {
            console.warn(`⚠️ Failed to delete cache: ${cacheName}`);
          }
        })
      );
    } catch (error) {
      console.error('❌ Error clearing Service Worker caches:', error);
    }
  }

  /**
   * Unregister Service Worker
   */
  static async unregisterServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️ Service Worker not supported');
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      await Promise.all(
        registrations.map(async (registration) => {
          const success = await registration.unregister();
          if (success) {
            console.log('✅ Service Worker unregistered');
          } else {
            console.warn('⚠️ Failed to unregister Service Worker');
          }
        })
      );
    } catch (error) {
      console.error('❌ Error unregistering Service Worker:', error);
    }
  }

  /**
   * Force refresh the page after clearing caches
   */
  static forceRefresh() {
    console.log('🔄 Force refreshing page...');
    // Use location.reload(true) to bypass cache
    window.location.reload(true);
  }

  /**
   * Clear caches and refresh
   */
  static async clearAndRefresh() {
    await this.clearAllCaches();
    setTimeout(() => {
      this.forceRefresh();
    }, 1000); // Give a moment for cache clearing to complete
  }

  /**
   * Clear only localStorage data for fresh start
   */
  static clearUserData() {
    console.log('🧹 Clearing user data...');
    
    // Clear specific localStorage keys
    const keysToRemove = [
      'token',
      'user',
      'userRole',
      'courseOverviewReturnUrl'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
    });

    // Clear course completion data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('course_completions_')) {
        localStorage.removeItem(key);
        console.log(`✅ Removed: ${key}`);
      }
    });

    console.log('✅ User data cleared');
  }

  /**
   * Show cache status in console
   */
  static async showCacheStatus() {
    console.log('📊 Cache Status Report:');
    
    // Check localStorage
    console.log('📱 localStorage items:', Object.keys(localStorage).length);
    
    // Check sessionStorage
    console.log('📱 sessionStorage items:', Object.keys(sessionStorage).length);
    
    // Check caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('💾 Service Worker caches:', cacheNames.length, cacheNames);
    }
    
    // Check service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('⚙️ Service Worker registrations:', registrations.length);
    }
  }
}

// Add to window for easy access in console
window.clearAllCaches = () => CacheManager.clearAndRefresh();
window.clearUserData = () => CacheManager.clearUserData();
window.showCacheStatus = () => CacheManager.showCacheStatus();

export default CacheManager; 