import offlineDataCache from './offlineDataCache';

class OfflineIntegrationService {
  constructor() {
    this.isInitialized = false;
    this.dataCache = offlineDataCache;
    this.eventListeners = new Map();
    this.interceptedFetch = null;
    
    console.log('🔧 OfflineIntegrationService initialized');
    this.setupFetchInterception();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing OfflineIntegrationService...');
      
      // Initialize data cache
      await this.dataCache.initialize();
      
      // Setup online/offline event listeners
      this.setupNetworkListeners();
      
      this.isInitialized = true;
      console.log('✅ OfflineIntegrationService initialization complete');
      
      return { success: true };
    } catch (error) {
      console.error('❌ OfflineIntegrationService initialization failed:', error);
      throw error;
    }
  }

  // Setup fetch interception to cache API responses automatically
  setupFetchInterception() {
    if (this.interceptedFetch) return;
    
    const originalFetch = window.fetch;
    this.interceptedFetch = originalFetch;
    
    window.fetch = async (url, options = {}) => {
      const method = options.method || 'GET';
      
      // If offline, try to serve from cache
      if (!navigator.onLine) {
        const cachedResponse = await this.dataCache.getCachedApiResponse(url, method);
        if (cachedResponse) {
          return {
            ok: true,
            status: 200,
            json: async () => cachedResponse,
            text: async () => JSON.stringify(cachedResponse)
          };
        }
      }
      
      try {
        // Make the actual request
        const response = await originalFetch(url, options);
        
        // Handle 401 authentication errors by trying cached data
        if (response.status === 401) {
          console.warn('🔐 Authentication failed (401) for:', url);
          const cachedResponse = await this.dataCache.getCachedApiResponse(url, method);
          if (cachedResponse) {
            console.log('📦 Serving cached response for authentication failure');
            return {
              ok: true,
              status: 200,
              json: async () => cachedResponse,
              text: async () => JSON.stringify(cachedResponse)
            };
          }
          // If no cached data, return the 401 response as-is
          return response;
        }
        
        // Cache successful responses for offline use
        if (response.ok && method === 'GET' && navigator.onLine) {
          try {
            const responseClone = response.clone();
            const data = await responseClone.json();
            await this.dataCache.cacheApiResponse(url, data, method);
            
            // Store specific data types
            if (url.includes('/api/courses/') && url.match(/\/api\/courses\/[^\/]+$/) && data.data && data.data.course) {
              // Individual course API call: /api/courses/{courseId}
              const courseId = url.split('/').pop();
              await this.storeCourseData(courseId, data.data.course);
            } else if (url.includes('/api/courses') && Array.isArray(data.data)) {
              // General courses API call: /api/courses
              await this.dataCache.storeData('courses', data.data);
            } else if (url.includes('/api/users/profile')) {
              await this.dataCache.storeUserData(data.data);
            } else if (url.includes('/api/jobs') && Array.isArray(data.data)) {
              await this.dataCache.storeData('jobs', data.data);
            } else if (url.includes('/api/courses/enrolled/courses') && data.data && data.data.courses) {
              // Enrolled courses API call
              const enrolledIds = data.data.courses.map(course => course._id || course.id);
              await this.storeEnrolledCourses(enrolledIds);
            }
          } catch (cacheError) {
            console.warn('Failed to cache response:', cacheError);
          }
        }
        
        return response;
      } catch (error) {
        console.error('🚨 Fetch error:', error.message, 'for URL:', url);
        
        // If online request fails, try cache as fallback
        const cachedResponse = await this.dataCache.getCachedApiResponse(url, method);
        if (cachedResponse) {
          console.log('📦 Serving cached response due to error:', error.message);
          return {
            ok: true,
            status: 200,
            json: async () => cachedResponse,
            text: async () => JSON.stringify(cachedResponse)
          };
        }
        
        throw error;
      }
    };
  }

  // Setup network event listeners
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online - processing sync queue');
      this.dataCache.processSyncQueue();
      this.emit('online');
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Gone offline - enabling cache mode');
      this.emit('offline');
    });
  }

  // Authentication methods using cached data
  async login(credentials) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      console.log('🔐 Attempting offline login with cached credentials...');
      const result = await this.dataCache.verifyOfflineCredentials(credentials.email, credentials.password);
      
      if (result.success) {
        console.log('✅ Offline login successful');
        this.emit('userLoggedIn', result.user);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Offline login failed:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Store user credentials when online login succeeds
  async storeUserCredentials(email, password) {
    try {
      console.log('💾 Storing credentials for offline access:', email);
      console.log('🔧 Service initialized:', this.isInitialized);
      
      if (!this.isInitialized) {
        console.log('⚠️ Service not initialized, initializing now...');
        await this.initialize();
      }
      
      localStorage.setItem('lastUserEmail', email);
      console.log('✅ Email stored in localStorage');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to store credentials:', error);
      return { success: false, error: error.message };
    }
  }

  async storeOnlineAuthData(userData, password = null) {
    try {
      console.log('💾 Storing online auth data:', userData.email);
      console.log('🔧 Service initialized:', this.isInitialized);
      console.log('🔧 DataCache available:', !!this.dataCache);
      
      if (!this.isInitialized) {
        console.log('⚠️ Service not initialized, initializing now...');
        await this.initialize();
      }
      
      await this.dataCache.storeUserData(userData, password);
      console.log('✅ Online auth data stored for offline use');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to store online auth data:', error);
      return { success: false, error: error.message };
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

  // ======== ESSENTIAL DATA RETRIEVAL METHODS ========
  
  // Get cached courses
  async getCourses() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Try to get from cache first
      const cachedCourses = await this.dataCache.getData('courses');
      if (cachedCourses && Array.isArray(cachedCourses)) {
        console.log('📱 Retrieved courses from cache:', cachedCourses.length);
        return cachedCourses;
      }
      
      // Try to get from cached API response
      const cachedResponse = await this.dataCache.getCachedApiResponse('/api/courses');
      if (cachedResponse && cachedResponse.data) {
        console.log('📱 Retrieved courses from API cache:', cachedResponse.data.length);
        return cachedResponse.data;
      }
      
      console.log('📱 No cached courses found');
      return [];
    } catch (error) {
      console.error('❌ Failed to get cached courses:', error);
      return [];
    }
  }

  // Store courses for offline access
  async storeCourses(courses) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (Array.isArray(courses)) {
        await this.dataCache.storeData('courses', courses);
        console.log('✅ Courses stored for offline access:', courses.length);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to store courses:', error);
      return { success: false, error: error.message };
    }
  }

  // Store category courses for offline access
  async storeCategoryCourses(category, courses) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (Array.isArray(courses)) {
        // Store courses under a category-specific key
        const categoryKey = `category_${category}_courses`;
        await this.dataCache.storeData(categoryKey, courses);
        console.log(`✅ Category courses stored for offline access: ${category} (${courses.length} courses)`);
        
        // Also store in general courses cache
        await this.dataCache.storeData('courses', courses);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to store category courses for ${category}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get cached courses for a specific category
  async getCategoryCourses(category) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Try category-specific cache first
      const categoryKey = `category_${category}_courses`;
      const cachedCategoryCourses = await this.dataCache.getData(categoryKey);
      if (cachedCategoryCourses && Array.isArray(cachedCategoryCourses)) {
        console.log(`📱 Retrieved category courses from cache: ${category} (${cachedCategoryCourses.length})`);
        return cachedCategoryCourses;
      }
      
      // Fall back to general courses cache and filter
      const allCourses = await this.getCourses();
      const categoryCourses = allCourses.filter(course => 
        course.category === category || 
        course.category?.toLowerCase() === category.toLowerCase()
      );
      
      if (categoryCourses.length > 0) {
        console.log(`📱 Filtered category courses from general cache: ${category} (${categoryCourses.length})`);
        return categoryCourses;
      }
      
      // Try cached API response for this category
      const cachedResponse = await this.dataCache.getCachedApiResponse(`/api/courses/category/${category}`);
      if (cachedResponse && cachedResponse.data && cachedResponse.data.courses) {
        console.log(`📱 Retrieved category courses from API cache: ${category} (${cachedResponse.data.courses.length})`);
        return cachedResponse.data.courses;
      }
      
      console.log(`📱 No cached courses found for category: ${category}`);
      return [];
    } catch (error) {
      console.error(`❌ Failed to get cached courses for category ${category}:`, error);
      return [];
    }
  }

  // Get cached enrolled courses
  async getEnrolledCourses() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Try localStorage first
      const localEnrolled = localStorage.getItem('enrolledCourses');
      if (localEnrolled) {
        const enrolledCourses = JSON.parse(localEnrolled);
        console.log('📱 Retrieved enrolled courses from localStorage:', enrolledCourses.length);
        return enrolledCourses;
      }
      
      // Try cached API response
      const cachedResponse = await this.dataCache.getCachedApiResponse('/api/courses/enrolled/courses');
      if (cachedResponse && cachedResponse.data && cachedResponse.data.courses) {
        const enrolledIds = cachedResponse.data.courses.map(course => course._id || course.id);
        console.log('📱 Retrieved enrolled courses from API cache:', enrolledIds.length);
        return enrolledIds;
      }
      
      console.log('📱 No cached enrolled courses found');
      return [];
    } catch (error) {
      console.error('❌ Failed to get cached enrolled courses:', error);
      return [];
    }
  }

  // Store enrolled courses
  async storeEnrolledCourses(enrolledCourses) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (Array.isArray(enrolledCourses)) {
        // Store in localStorage for quick access
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
        console.log('✅ Enrolled courses stored for offline access:', enrolledCourses.length);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to store enrolled courses:', error);
      return { success: false, error: error.message };
    }
  }

  // Enroll in course (offline)
  async enrollInCourse(courseId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Get current enrolled courses
      let enrolledCourses = await this.getEnrolledCourses();
      
      // Check if already enrolled
      if (enrolledCourses.includes(courseId)) {
        console.log('📱 User already enrolled in course:', courseId);
        return { success: true, message: 'Already enrolled' };
      }
      
      // Add to enrolled courses
      enrolledCourses.push(courseId);
      await this.storeEnrolledCourses(enrolledCourses);
      
      // Add to sync queue for when online
      await this.dataCache.addToSyncQueue({
        type: 'enrollment',
        courseId: courseId,
        action: 'enroll',
        timestamp: Date.now()
      });
      
      console.log('✅ Enrolled in course offline:', courseId);
      return { success: true, message: 'Enrolled successfully offline' };
    } catch (error) {
      console.error('❌ Failed to enroll in course offline:', error);
      return { success: false, error: error.message };
    }
  }

  // Get specific course data for course details/overview
  async getCourseData(courseId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Try cached API response for this specific course
      const cachedResponse = await this.dataCache.getCachedApiResponse(`/api/courses/${courseId}`);
      if (cachedResponse && cachedResponse.data && cachedResponse.data.course) {
        console.log('📱 Retrieved course data from API cache:', courseId);
        return cachedResponse.data.course;
      }
      
      // Fall back to searching in general courses cache
      const allCourses = await this.getCourses();
      const courseData = allCourses.find(course => course._id === courseId || course.id === courseId);
      
      if (courseData) {
        console.log('📱 Found course data in general cache:', courseId);
        return courseData;
      }
      
      console.log('📱 No cached course data found for:', courseId);
      return null;
    } catch (error) {
      console.error('❌ Failed to get cached course data:', error);
      return null;
    }
  }

  // Store course data for offline access
  async storeCourseData(courseId, courseData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (courseData) {
        // Store in a course-specific cache for quick access
        const courseKey = `course_${courseId}`;
        await this.dataCache.storeData(courseKey, courseData);
        console.log('✅ Course data stored for offline access:', courseId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to store course data:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  isOnline() {
    return navigator.onLine;
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated() {
    try {
      return localStorage.getItem('isAuthenticated') === 'true';
    } catch (error) {
      return false;
    }
  }
  
  // Jobs and scholarships methods
  async getJobs() {
    try {
      return await this.dataCache.get('jobs') || [];
    } catch (error) {
      console.error('❌ Failed to get jobs from cache:', error);
      return [];
    }
  }

  async storeJobs(jobs) {
    try {
      await this.dataCache.set('jobs', jobs);
      console.log('✅ Jobs stored in cache:', jobs.length);
    } catch (error) {
      console.error('❌ Failed to store jobs in cache:', error);
    }
  }

  async getScholarships() {
    try {
      return await this.dataCache.get('scholarships') || [];
    } catch (error) {
      console.error('❌ Failed to get scholarships from cache:', error);
      return [];
    }
  }

  async storeScholarships(scholarships) {
    try {
      await this.dataCache.set('scholarships', scholarships);
      console.log('✅ Scholarships stored in cache:', scholarships.length);
    } catch (error) {
      console.error('❌ Failed to store scholarships in cache:', error);
    }
  }

  async getCategories() {
    try {
      return await this.dataCache.get('categories') || [];
    } catch (error) {
      console.error('❌ Failed to get categories from cache:', error);
      return [];
    }
  }

  async storeCategories(categories) {
    try {
      await this.dataCache.set('categories', categories);
      console.log('✅ Categories stored in cache:', categories.length);
    } catch (error) {
      console.error('❌ Failed to store categories in cache:', error);
    }
  }

  async storeSearchResults(searchTerm, results) {
    try {
      const searchCache = await this.dataCache.get('searchResults') || {};
      searchCache[searchTerm] = {
        results,
        timestamp: new Date().toISOString()
      };
      await this.dataCache.set('searchResults', searchCache);
      console.log('✅ Search results stored in cache for:', searchTerm);
    } catch (error) {
      console.error('❌ Failed to store search results in cache:', error);
    }
  }

  // Student course overview methods
  async getStudentCourseOverview(courseId) {
    try {
      return await this.dataCache.get(`studentCourseOverview_${courseId}`) || null;
    } catch (error) {
      console.error('❌ Failed to get student course overview from cache:', error);
      return null;
    }
  }

  async storeStudentCourseOverview(courseId, courseData) {
    try {
      await this.dataCache.set(`studentCourseOverview_${courseId}`, courseData);
      console.log('✅ Student course overview stored in cache for:', courseId);
    } catch (error) {
      console.error('❌ Failed to store student course overview in cache:', error);
    }
  }

  async getEnrollmentStatus(courseId) {
    try {
      return await this.dataCache.get(`enrollmentStatus_${courseId}`) || false;
    } catch (error) {
      console.error('❌ Failed to get enrollment status from cache:', error);
      return false;
    }
  }

  async storeEnrollmentStatus(courseId, status) {
    try {
      await this.dataCache.set(`enrollmentStatus_${courseId}`, status);
      console.log('✅ Enrollment status stored in cache for:', courseId, ':', status);
    } catch (error) {
      console.error('❌ Failed to store enrollment status in cache:', error);
    }
  }

  async getCourseProgress(courseId) {
    try {
      return await this.dataCache.get(`courseProgress_${courseId}`) || null;
    } catch (error) {
      console.error('❌ Failed to get course progress from cache:', error);
      return null;
    }
  }

  async storeCourseProgress(courseId, progressData) {
    try {
      await this.dataCache.set(`courseProgress_${courseId}`, progressData);
      console.log('✅ Course progress stored in cache for:', courseId);
    } catch (error) {
      console.error('❌ Failed to store course progress in cache:', error);
    }
  }

  async storeJobApplication(jobId, applicationData) {
    try {
      // Add to sync queue for later submission
      await this.addToSyncQueue('job_application', {
        jobId,
        applicationData,
        timestamp: new Date().toISOString()
      });
      console.log('✅ Job application queued for sync:', jobId);
    } catch (error) {
      console.error('❌ Failed to store job application:', error);
      throw error;
    }
  }

  async addToSyncQueue(type, data) {
    try {
      const syncQueue = await this.dataCache.get('syncQueue') || [];
      syncQueue.push({
        id: Date.now() + Math.random(),
        type,
        data,
        createdAt: new Date().toISOString()
      });
      await this.dataCache.set('syncQueue', syncQueue);
      console.log('✅ Added to sync queue:', type);
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
      throw error;
    }
  }

  async processSyncQueue() {
    try {
      const syncQueue = await this.dataCache.get('syncQueue') || [];
      console.log('🔄 Processing sync queue:', syncQueue.length, 'items');
      
      if (!navigator.onLine || syncQueue.length === 0) {
        return;
      }

      // Process each item in the queue
      for (const item of syncQueue) {
        try {
          await this.processSyncItem(item);
          // Remove processed item from queue
          const updatedQueue = syncQueue.filter(queueItem => queueItem.id !== item.id);
          await this.dataCache.set('syncQueue', updatedQueue);
        } catch (error) {
          console.error('❌ Failed to process sync item:', item, error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to process sync queue:', error);
    }
  }

  async processSyncItem(item) {
    const token = localStorage.getItem('token');
    
    switch (item.type) {
      case 'job_application':
        const { jobId, applicationData } = item.data;
        const response = await fetch(`/api/jobs/${jobId}/apply`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(applicationData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to sync job application: ${response.status}`);
        }
        break;
        
      default:
        console.warn('Unknown sync item type:', item.type);
    }
  }
}

// Create singleton instance
const offlineIntegrationService = new OfflineIntegrationService();

// Initialize on module load
offlineIntegrationService.initialize().catch(error => {
  console.error('Failed to initialize OfflineIntegrationService:', error);
});

export { offlineIntegrationService };
export default offlineIntegrationService; 
