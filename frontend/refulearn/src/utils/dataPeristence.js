// Data Persistence Utility for Refugee Components
// Prevents data loss by caching and smart state management

export const DataPersistence = {
  // Cache data to localStorage
  cache: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`📦 Cached ${key}:`, data?.length || 'object');
    } catch (error) {
      console.warn(`⚠️ Failed to cache ${key}:`, error);
    }
  },

  // Get cached data from localStorage
  getCached: (key) => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn(`⚠️ Failed to get cached ${key}:`, error);
      return null;
    }
  },

  // Smart state update - only update if new data is better or state is empty
  smartUpdate: (currentData, newData, setState, cacheKey) => {
    if (newData && newData.length > 0) {
      // We have new data - always update
      setState(newData);
      DataPersistence.cache(cacheKey, newData);
      console.log(`✅ Updated ${cacheKey} with fresh data:`, newData.length);
    } else if (currentData.length === 0) {
      // No current data and no new data - try to load from cache
      const cached = DataPersistence.getCached(cacheKey);
      if (cached && cached.length > 0) {
        setState(cached);
        console.log(`📦 Restored ${cacheKey} from cache:`, cached.length);
      }
    } else {
      // Keep existing data when API fails
      console.log(`🔄 Keeping existing ${cacheKey} data:`, currentData.length);
    }
  },

  // Auto-retry failed API calls
  retryFetch: async (fetchFunction, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 API attempt ${attempt}/${maxRetries}`);
        const result = await fetchFunction();
        console.log(`✅ API succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ API attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error(`❌ All ${maxRetries} API attempts failed`);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  },

  // Initialize state with cached data
  initializeState: (cacheKey, defaultValue = []) => {
    try {
      const cached = localStorage.getItem(cacheKey);
      const data = cached ? JSON.parse(cached) : defaultValue;
      console.log(`🚀 Initialized ${cacheKey} with:`, data?.length || 'default');
      return data;
    } catch (error) {
      console.warn(`⚠️ Failed to initialize ${cacheKey}:`, error);
      return defaultValue;
    }
  }
};

// Refugee-specific cache keys
export const CACHE_KEYS = {
  DASHBOARD_COURSES: 'refugee_dashboard_courses',
  DASHBOARD_JOBS: 'refugee_dashboard_jobs',
  DASHBOARD_SCHOLARSHIPS: 'refugee_dashboard_scholarships',
  DASHBOARD_STATS: 'refugee_dashboard_stats',
  BROWSE_COURSES: 'refugee_courses_cache',
  BROWSE_CATEGORIES: 'refugee_categories_cache',
  BROWSE_ENROLLED: 'refugee_enrolled_cache',
  JOBS_LIST: 'refugee_jobs_cache',
  SCHOLARSHIPS_LIST: 'refugee_scholarships_cache'
}; 