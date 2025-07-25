// Preloader utility for instant page loading
class Preloader {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  // Preload data for a specific page
  async preloadPageData(pageType) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      switch (pageType) {
        case 'dashboard':
          await this.preloadDashboardData();
          break;
        case 'courses':
          await this.preloadCoursesData();
          break;
        case 'certificates':
          await this.preloadCertificatesData();
          break;
        case 'jobs':
          await this.preloadJobsData();
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn(`Preload failed for ${pageType}:`, error);
    }
  }

  // Preload dashboard data
  async preloadDashboardData() {
    const cacheKey = 'dashboard_preload';
    const cacheTime = localStorage.getItem('dashboard_preload_time');
    const now = Date.now();

    // Check if we have recent preloaded data (2 minutes)
    if (cacheTime && (now - parseInt(cacheTime)) < 2 * 60 * 1000) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Preload courses, jobs, scholarships in parallel
      const [coursesRes, jobsRes, scholarshipsRes] = await Promise.allSettled([
        fetch('/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/scholarships', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const preloadData = {
        courses: coursesRes.status === 'fulfilled' ? await coursesRes.value.json() : null,
        jobs: jobsRes.status === 'fulfilled' ? await jobsRes.value.json() : null,
        scholarships: scholarshipsRes.status === 'fulfilled' ? await scholarshipsRes.value.json() : null,
        timestamp: now
      };

      localStorage.setItem('dashboard_preload', JSON.stringify(preloadData));
      localStorage.setItem('dashboard_preload_time', now.toString());
      
      console.log('✅ Dashboard data preloaded');
    } catch (error) {
      console.warn('❌ Dashboard preload failed:', error);
    }
  }

  // Preload courses data
  async preloadCoursesData() {
    const cacheKey = 'courses_preload';
    const cacheTime = localStorage.getItem('courses_preload_time');
    const now = Date.now();

    if (cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const [coursesRes, categoriesRes, enrolledRes] = await Promise.allSettled([
        fetch('/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/courses/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/courses/enrolled/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const preloadData = {
        courses: coursesRes.status === 'fulfilled' ? await coursesRes.value.json() : null,
        categories: categoriesRes.status === 'fulfilled' ? await categoriesRes.value.json() : null,
        enrolled: enrolledRes.status === 'fulfilled' ? await enrolledRes.value.json() : null,
        timestamp: now
      };

      localStorage.setItem('courses_preload', JSON.stringify(preloadData));
      localStorage.setItem('courses_preload_time', now.toString());
      
      console.log('✅ Courses data preloaded');
    } catch (error) {
      console.warn('❌ Courses preload failed:', error);
    }
  }

  // Preload certificates data
  async preloadCertificatesData() {
    const cacheTime = localStorage.getItem('certificates_preload_time');
    const now = Date.now();

    if (cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Preload enrolled courses and certificates
      const [enrolledRes, certificatesRes] = await Promise.allSettled([
        fetch('/api/courses/enrolled/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/certificates', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const preloadData = {
        enrolled: enrolledRes.status === 'fulfilled' ? await enrolledRes.value.json() : null,
        certificates: certificatesRes.status === 'fulfilled' ? await certificatesRes.value.json() : null,
        timestamp: now
      };

      localStorage.setItem('certificates_preload', JSON.stringify(preloadData));
      localStorage.setItem('certificates_preload_time', now.toString());
      
      console.log('✅ Certificates data preloaded');
    } catch (error) {
      console.warn('❌ Certificates preload failed:', error);
    }
  }

  // Preload jobs data
  async preloadJobsData() {
    const cacheTime = localStorage.getItem('jobs_preload_time');
    const now = Date.now();

    if (cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const [jobsRes, scholarshipsRes] = await Promise.allSettled([
        fetch('/api/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/scholarships', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const preloadData = {
        jobs: jobsRes.status === 'fulfilled' ? await jobsRes.value.json() : null,
        scholarships: scholarshipsRes.status === 'fulfilled' ? await scholarshipsRes.value.json() : null,
        timestamp: now
      };

      localStorage.setItem('jobs_preload', JSON.stringify(preloadData));
      localStorage.setItem('jobs_preload_time', now.toString());
      
      console.log('✅ Jobs data preloaded');
    } catch (error) {
      console.warn('❌ Jobs preload failed:', error);
    }
  }

  // Start preloading when user hovers over navigation items
  startPreloading() {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    
    // Preload all main pages data
    this.preloadPageData('dashboard');
    this.preloadPageData('courses');
    this.preloadPageData('certificates');
    this.preloadPageData('jobs');
    
    setTimeout(() => {
      this.isPreloading = false;
    }, 1000);
  }

  // Get preloaded data
  getPreloadedData(pageType) {
    const preloadData = localStorage.getItem(`${pageType}_preload`);
    if (preloadData) {
      return JSON.parse(preloadData);
    }
    return null;
  }
}

// Create singleton instance
const preloader = new Preloader();

export default preloader; 