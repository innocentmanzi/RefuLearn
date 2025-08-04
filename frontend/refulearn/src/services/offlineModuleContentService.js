import offlineIntegrationService from './offlineIntegrationService';

class OfflineModuleContentService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔧 Initializing OfflineModuleContentService...');
      await offlineIntegrationService.initialize();
      this.isInitialized = true;
      console.log('✅ OfflineModuleContentService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize OfflineModuleContentService:', error);
    }
  }

  // Get course data with offline fallback
  async getCourseData(courseId) {
    try {
      await this.initialize();
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        // Try online first
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch(`/api/courses/${courseId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data && data.data.course) {
                // Store for offline use
                await offlineIntegrationService.storeCourseData(courseId, data.data.course);
                return data.data.course;
              }
            }
          } catch (onlineError) {
            console.warn('⚠️ Online course fetch failed, using offline data:', onlineError);
          }
        }
      }
      
      // Fallback to offline data
      const cachedCourse = await offlineIntegrationService.getCourseData(courseId);
      return cachedCourse;
    } catch (error) {
      console.error('❌ Error getting course data:', error);
      return null;
    }
  }

  // Get course progress with offline fallback
  async getCourseProgress(courseId, moduleId) {
    try {
      await this.initialize();
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch(`/api/courses/${courseId}/progress`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                // Store for offline use
                await offlineIntegrationService.storeCourseProgress(courseId, data.data);
                return data.data;
              }
            }
          } catch (onlineError) {
            console.warn('⚠️ Online progress fetch failed, using offline data:', onlineError);
          }
        }
      }
      
      // Fallback to offline data
      const cachedProgress = await offlineIntegrationService.getCourseProgress(courseId);
      return cachedProgress;
    } catch (error) {
      console.error('❌ Error getting course progress:', error);
      return null;
    }
  }

  // Mark item as complete with offline support
  async markItemComplete(courseId, moduleId, contentType, itemIndex) {
    try {
      await this.initialize();
      const isOnline = navigator.onLine;
      const token = localStorage.getItem('token');
      const currentItemId = `${contentType}-${itemIndex}`;
      
      let serverSuccess = false;
      
      if (isOnline && token) {
        try {
          const requestBody = {
            moduleId: moduleId,
            contentType: contentType,
            itemIndex: itemIndex,
            completionKey: currentItemId,
            completed: true
          };
          
          const response = await fetch(`/api/courses/${courseId}/progress`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if (response.ok) {
            serverSuccess = true;
            console.log('✅ Item marked as complete on server');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online completion update failed:', onlineError);
        }
      }
      
      // Always update offline cache
      try {
        const currentProgress = await this.getCourseProgress(courseId, moduleId) || {};
        const modulesProgress = currentProgress.modulesProgress || {};
        const moduleProgress = modulesProgress[moduleId] || {};
        const completedItems = moduleProgress.completedItems || [];
        
        if (!completedItems.includes(currentItemId)) {
          completedItems.push(currentItemId);
        }
        
        const updatedProgress = {
          ...currentProgress,
          modulesProgress: {
            ...modulesProgress,
            [moduleId]: {
              ...moduleProgress,
              completedItems: completedItems
            }
          }
        };
        
        await offlineIntegrationService.storeCourseProgress(courseId, updatedProgress);
        console.log('💾 Item marked as complete in offline cache');
        
        return { success: true, serverSuccess, offlineSuccess: true };
      } catch (cacheError) {
        console.error('❌ Failed to update offline cache:', cacheError);
        return { success: serverSuccess, serverSuccess, offlineSuccess: false };
      }
    } catch (error) {
      console.error('❌ Error marking item complete:', error);
      return { success: false, serverSuccess: false, offlineSuccess: false };
    }
  }

  // Get completed items for a module
  async getCompletedItems(courseId, moduleId) {
    try {
      await this.initialize();
      const progress = await this.getCourseProgress(courseId, moduleId);
      
      if (progress && progress.modulesProgress && progress.modulesProgress[moduleId]) {
        return progress.modulesProgress[moduleId].completedItems || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error getting completed items:', error);
      return [];
    }
  }

  // Check if a specific item is completed
  async isItemCompleted(courseId, moduleId, contentType, itemIndex) {
    try {
      const completedItems = await this.getCompletedItems(courseId, moduleId);
      const itemId = `${contentType}-${itemIndex}`;
      return completedItems.includes(itemId);
    } catch (error) {
      console.error('❌ Error checking item completion:', error);
      return false;
    }
  }
}

const offlineModuleContentService = new OfflineModuleContentService();
export default offlineModuleContentService; 