import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import preloader from '../../utils/preloader';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 4rem;
  margin: 2rem 0;
  width: calc(100% - 4rem);
  box-sizing: border-box;
  margin-left: 2rem;
  margin-right: 2rem;
  
  /* Large screens: 3 cards in a row */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 2rem auto;
    gap: 5rem;
    width: calc(100% - 6rem);
    margin-left: 3rem;
    margin-right: 3rem;
  }
  
  /* Medium screens: 2 cards in a row */
  @media (max-width: 1199px) and (min-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 4rem;
    width: calc(100% - 5rem);
    margin-left: 2.5rem;
    margin-right: 2.5rem;
  }
  
  /* Small screens: 1 card per row */
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    margin: 1.5rem auto;
    max-width: 500px;
    width: calc(100% - 4rem);
    margin-left: 2rem;
    margin-right: 2rem;
  }
  
  /* Mobile screens: 1 card per row with reduced spacing */
  @media (max-width: 600px) {
    gap: 2.5rem;
    margin: 1rem auto;
    width: calc(100% - 3rem);
    margin-left: 1.5rem;
    margin-right: 1.5rem;
    max-width: 100%;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  color: #333;
  border: 1px solid #e9ecef;
  cursor: pointer;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 900px) {
    padding: 1.75rem;
    min-height: 200px;
  }
  
  @media (max-width: 600px) {
    padding: 1.5rem;
    min-height: 180px;
  }
`;

const Title = styled.h1`
  color: #007BFF;
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const SubTitle = styled.h2`
  color: #007BFF;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Stat = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const QuickAction = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 2rem;
  transition: all 0.2s ease;
  font-weight: 600;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
`;

const DashboardContainer = styled.div`
  background: #fff;
  min-height: 100vh;
  padding: 2rem 3rem;
  margin: 0;
  
  @media (max-width: 900px) {
    padding: 1.5rem 2.5rem;
  }
  
  @media (max-width: 600px) {
    padding: 1rem 2rem;
  }
`;

const ScholarshipsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  width: calc(100% - 4rem);
  margin-left: 2rem;
  margin-right: 2rem;
  
  @media (min-width: 1200px) {
    width: calc(100% - 6rem);
    margin-left: 3rem;
    margin-right: 3rem;
  }
  
  @media (max-width: 1199px) and (min-width: 900px) {
    width: calc(100% - 5rem);
    margin-left: 2.5rem;
    margin-right: 2.5rem;
  }
  
  @media (max-width: 900px) {
    width: calc(100% - 4rem);
    margin-left: 2rem;
    margin-right: 2rem;
  }
  
  @media (max-width: 600px) {
    width: calc(100% - 3rem);
    margin-left: 1.5rem;
    margin-right: 1.5rem;
  }
`;

const ScholarshipsCardWrapper = styled.div`
  width: 100%;
  max-width: calc((100% - 10rem) / 3);
  
  @media (max-width: 1199px) and (min-width: 900px) {
    max-width: calc((100% - 8rem) / 2);
  }
  
  @media (max-width: 900px) {
    max-width: 100%;
  }
`;

const ProgressCard = Card;

const OverviewText = styled.span`
  display: inline-block;
  min-height: 1.5rem;
  color: #666;
  font-size: 1.1rem;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  width: calc(100% - 4rem);
  max-width: 100%;
  overflow-wrap: break-word;
  color: #333;
  border: 1px solid #e9ecef;
  margin: 2rem 2rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  
  @media (max-width: 900px) {
    width: calc(100% - 5rem);
    margin: 1.5rem 2.5rem;
    padding: 1.25rem;
  }
  
  @media (max-width: 600px) {
    width: calc(100% - 4rem);
    margin: 1rem 2rem;
    padding: 1rem;
  }
`;

const CourseCardTitle = styled.h2`
  color: #007BFF;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const CourseList = styled.div`
  margin-top: 1rem;
`;

const CourseItemStyled = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const AvailableCourses = ({ courses, onCourseClick, t }) => {
  // Filter to show only published courses
  const publishedCourses = courses.filter(course => course.isPublished === true || course.isPublished === 'true');
  
  return (
    <CourseCard>
      <CourseCardTitle>{t('dashboard.availableCourses', 'Available Courses')} ({publishedCourses.length})</CourseCardTitle>
      <CourseList>
        {publishedCourses.map(course => (
          <CourseItemStyled key={course._id} onClick={() => onCourseClick(course)}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{course.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                {course.category} • {course.level || t('dashboard.beginner', 'Beginner')} • {course.duration || t('dashboard.selfPaced', 'Self-paced')}
              </div>
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#28a745',
              fontWeight: '600',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              background: '#d4edda',
              border: '1px solid #c3e6cb'
            }}>
              {t('dashboard.available', 'Available')}
            </div>
          </CourseItemStyled>
        ))}
      </CourseList>
    </CourseCard>
  );
};

const RefugeeDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [isFirstLogin] = useState(false);
  const [userName, setUserName] = useState('');
  const [welcomeText, setWelcomeText] = useState('');
  const [overviewText, setOverviewText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isTypingOverview, setIsTypingOverview] = useState(false);
  const [error, setError] = useState(null);

  // Debug user context
  console.log('Dashboard user context:', user);
  
  // Check if user has refugee role
  if (user && user.role !== 'refugee') {
    console.log('User role is not refugee:', user.role);
  }

  // Fetch dashboard data with caching
  const fetchDashboardData = async () => {
    try {
      setIsDataFetching(true);
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
              // Check for preloaded data first (fastest)
        const preloadedData = preloader.getPreloadedData('dashboard');
        if (preloadedData && preloadedData.timestamp) {
          const now = Date.now();
          if ((now - preloadedData.timestamp) < 2 * 60 * 1000) {
            console.log('🚀 Using preloaded dashboard data');
            if (preloadedData.courses) setCourses(preloadedData.courses.data?.courses || []);
            if (preloadedData.jobs) setJobs(preloadedData.jobs.data?.jobs || []);
            if (preloadedData.scholarships) setScholarships(preloadedData.scholarships.data?.scholarships || []);
            
            const calculatedStats = {
              availableCourses: (preloadedData.courses?.data?.courses || []).length,
              certificates: 0, // Will be calculated separately
              jobApplications: (preloadedData.jobs?.data?.jobs || []).length,
              scholarships: (preloadedData.scholarships?.data?.scholarships || []).length
            };
            setStats(calculatedStats);
            setLoading(false);
            setIsDataFetching(false);
            return;
          }
        }
        
        // Check if we have recent cached data (less than 5 minutes old)
        const cachedData = localStorage.getItem('dashboard_cache');
        const cacheTime = localStorage.getItem('dashboard_cache_time');
        const now = Date.now();
        
        if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
          console.log('📱 Using cached dashboard data for courses, jobs, scholarships');
          const parsedData = JSON.parse(cachedData);
          setCourses(parsedData.courses || []);
          setJobs(parsedData.jobs || []);
          setScholarships(parsedData.scholarships || []);
          
          // Always fetch fresh certificates data (not from cache)
          let fetchedCertificates = [];
          try {
            const certificatesResponse = await fetch('/api/certificates/user?limit=100', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (certificatesResponse.ok) {
              const certificatesData = await certificatesResponse.json();
              fetchedCertificates = certificatesData.data?.certificates || [];
              console.log('🏆 Dashboard fetched certificates:', {
                count: fetchedCertificates.length,
                certificates: fetchedCertificates.map(c => ({
                  id: c._id,
                  courseTitle: c.courseTitle,
                  certificateNumber: c.certificateNumber
                }))
              });
            }
          } catch (error) {
            console.warn('Failed to fetch certificates:', error);
          }
          
          // Calculate stats with fresh certificates data
          const calculatedStats = {
            availableCourses: (parsedData.courses || []).length,
            certificates: fetchedCertificates.length,
            jobApplications: (parsedData.jobs || []).length,
            scholarships: (parsedData.scholarships || []).length
          };
          setStats(calculatedStats);
          setLoading(false);
          setIsDataFetching(false);
          return;
        }

      if (isOnline) {
        try {
          let fetchedCourses = [];
          let fetchedJobs = [];
          let fetchedScholarships = [];

          // Fetch courses
          const coursesResponse = await fetch('/api/courses', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            fetchedCourses = coursesData.data?.courses || [];
            setCourses(fetchedCourses);
          }

          // Fetch jobs
          const jobsResponse = await fetch('/api/jobs', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            fetchedJobs = jobsData.data?.jobs || [];
            setJobs(fetchedJobs);
          }

          // Fetch scholarships
          const scholarshipsResponse = await fetch('/api/scholarships', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (scholarshipsResponse.ok) {
            const scholarshipsData = await scholarshipsResponse.json();
            fetchedScholarships = scholarshipsData.data?.scholarships || [];
            setScholarships(fetchedScholarships);
          }

          // Fetch certificates for the current user
          let fetchedCertificates = [];
          try {
            const certificatesResponse = await fetch('/api/certificates/user?limit=100', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (certificatesResponse.ok) {
              const certificatesData = await certificatesResponse.json();
              fetchedCertificates = certificatesData.data?.certificates || [];
              console.log('🏆 Dashboard fetched certificates:', {
                count: fetchedCertificates.length,
                certificates: fetchedCertificates.map(c => ({
                  id: c._id,
                  courseTitle: c.courseTitle,
                  certificateNumber: c.certificateNumber
                }))
              });
            }
          } catch (error) {
            console.warn('Failed to fetch certificates:', error);
          }

          // Fetch job applications for the current user
          let fetchedJobApplications = [];
          try {
            const applicationsResponse = await fetch('/api/jobs/applications/user', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (applicationsResponse.ok) {
              const applicationsData = await applicationsResponse.json();
              fetchedJobApplications = applicationsData.data?.applications || [];
            }
          } catch (error) {
            console.warn('Failed to fetch job applications:', error);
          }

          // Calculate stats from fetched data
          const calculatedStats = {
            availableCourses: fetchedCourses.length,
            certificates: fetchedCertificates.length,
            jobApplications: fetchedJobs.length, // Show total available jobs instead of user applications
            scholarships: fetchedScholarships.length
          };
          setStats(calculatedStats);
          
          // Cache the data for 5 minutes
          const cacheData = {
            courses: fetchedCourses,
            jobs: fetchedJobs,
            scholarships: fetchedScholarships,
            stats: calculatedStats
          };
          localStorage.setItem('dashboard_cache', JSON.stringify(cacheData));
          localStorage.setItem('dashboard_cache_time', Date.now().toString());
          
          // Store in offline integration service for better offline access
          try {
            await offlineIntegrationService.storeCourses(fetchedCourses);
            await offlineIntegrationService.storeJobs(fetchedJobs);
            await offlineIntegrationService.storeScholarships(fetchedScholarships);
            
            // Pre-cache individual course data for offline access
            console.log('🔄 Pre-caching individual course data for offline access...');
            
            for (const course of fetchedCourses) {
              try {
                // Fetch full course data including modules, content, etc.
                const courseDetailResponse = await fetch(`/api/courses/${course._id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (courseDetailResponse.ok) {
                  const courseDetailData = await courseDetailResponse.json();
                  if (courseDetailData.success && courseDetailData.data && courseDetailData.data.course) {
                    await offlineIntegrationService.storeCourseData(course._id, courseDetailData.data.course);
                    console.log(`✅ Pre-cached course: ${course.title}`);
                  }
                }
              } catch (courseError) {
                console.warn(`⚠️ Failed to pre-cache course ${course._id}:`, courseError);
              }
            }
            
            console.log(`✅ Pre-cached ${fetchedCourses.length} courses for offline access`);
          } catch (offlineError) {
            console.warn('⚠️ Failed to store data in offline service:', offlineError);
          }

        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setError('Failed to load dashboard data');
        }
      } else {
        // Offline mode - load from offline integration service first, then localStorage fallback
        console.log('📱 Offline mode - loading cached dashboard data from offline service');
        
        try {
          // Try offline integration service first
          const cachedCourses = await offlineIntegrationService.getCourses();
          const cachedJobs = await offlineIntegrationService.getJobs();
          const cachedScholarships = await offlineIntegrationService.getScholarships();
          
          if (cachedCourses && cachedCourses.length > 0) {
            setCourses(cachedCourses);
            console.log('📦 Loaded courses from offline service:', cachedCourses.length);
          }
          
          if (cachedJobs && cachedJobs.length > 0) {
            setJobs(cachedJobs);
            console.log('📦 Loaded jobs from offline service:', cachedJobs.length);
          }
          
          if (cachedScholarships && cachedScholarships.length > 0) {
            setScholarships(cachedScholarships);
            console.log('📦 Loaded scholarships from offline service:', cachedScholarships.length);
          }
          
          // Calculate stats from offline data
          const calculatedStats = {
            availableCourses: (cachedCourses || []).length,
            certificates: 0, // Will be calculated separately
            jobApplications: (cachedJobs || []).length,
            scholarships: (cachedScholarships || []).length
          };
          setStats(calculatedStats);
          
          // Check if we got data from offline service
          if ((!cachedCourses || cachedCourses.length === 0) && 
              (!cachedJobs || cachedJobs.length === 0) && 
              (!cachedScholarships || cachedScholarships.length === 0)) {
            console.log('⚠️ No data from offline service, trying localStorage fallback...');
            
            // Fallback to localStorage
            const localStorageCourses = localStorage.getItem('courses_cache');
            const localStorageJobs = localStorage.getItem('jobs_cache');
            const localStorageScholarships = localStorage.getItem('scholarships_cache');
            const localStorageStats = localStorage.getItem('user_stats_cache');

            if (localStorageCourses) {
              setCourses(JSON.parse(localStorageCourses));
            }
            if (localStorageJobs) {
              setJobs(JSON.parse(localStorageJobs));
            }
            if (localStorageScholarships) {
              setScholarships(JSON.parse(localStorageScholarships));
            }
            if (localStorageStats) {
              setStats(JSON.parse(localStorageStats));
            }
          }
          
        } catch (offlineError) {
          console.error('❌ Error loading from offline service:', offlineError);
          
          // Fallback to localStorage if offline service fails
          const cachedCourses = localStorage.getItem('courses_cache');
          const cachedJobs = localStorage.getItem('jobs_cache');
          const cachedScholarships = localStorage.getItem('scholarships_cache');
          const cachedStats = localStorage.getItem('user_stats_cache');

          if (cachedCourses) {
            setCourses(JSON.parse(cachedCourses));
          }
          if (cachedJobs) {
            setJobs(JSON.parse(cachedJobs));
          }
          if (cachedScholarships) {
            setScholarships(JSON.parse(cachedScholarships));
          }
          if (cachedStats) {
            setStats(JSON.parse(cachedStats));
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
      setIsDataFetching(false);
    }
  };

  // Fetch data on component mount
  // Initialize offline integration service
  useEffect(() => {
    const initializeOfflineService = async () => {
      try {
        console.log('🔧 Initializing offline integration service for Dashboard...');
        await offlineIntegrationService.initialize();
        console.log('✅ Offline integration service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize offline integration service:', error);
      }
    };
    
    initializeOfflineService();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Periodic refresh every 10 minutes (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDataFetching && navigator.onLine) {
        fetchDashboardData();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [isDataFetching]);

  const welcomeMessage = isFirstLogin 
    ? t('dashboard.welcome', { userName })
    : t('dashboard.welcomeBack', { userName });

  const overviewMessage = t('dashboard.overview');

  // Simplified welcome message without typing animation for better performance
  useEffect(() => {
    setWelcomeText(welcomeMessage);
    setOverviewText(overviewMessage);
    setIsTyping(false);
    setIsTypingOverview(false);
  }, [welcomeMessage, overviewMessage]);

  const handleCourseClick = (course) => {
    // Navigate to the course overview page for better user experience
    navigate(`/courses/${course._id}/overview`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <div>Error: {error}</div>
      </div>
    );
  }
  
  return (
    <DashboardContainer>
      {/* Welcome Message */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <Title style={{ color: '#007BFF', fontSize: '2rem', marginBottom: '0.5rem' }}>{welcomeText}</Title>
        <OverviewText style={{ color: '#333' }}>{overviewText}</OverviewText>
        

      </div>
      <ul style={{ color: '#1976d2', display: 'none' }}>
        {courses.map(course => (
          <li key={course._id}>{course.title} - Progress: {course.progress || 0}%</li>
        ))}
      </ul>
      {/* First row: 3 main cards */}
      <DashboardGrid>
                          <ProgressCard onClick={() => navigate('/courses')}>
                    <SubTitle>{t('dashboard.availableCourses', 'Available Courses')}</SubTitle>
                    <Stat>{stats.availableCourses || 0}</Stat>
                    <StatLabel>{t('dashboard.coursesAvailable', 'Courses Available')}</StatLabel>
                    <QuickAction>{t('dashboard.browseCourses', 'Browse Courses')}</QuickAction>
                  </ProgressCard>
                  <ProgressCard onClick={() => navigate('/certificates')}>
                    <SubTitle>{t('certificates.title', 'Certificates')}</SubTitle>
                    <Stat>{stats.certificates || 0}</Stat>
                    <StatLabel>{t('dashboard.certificatesEarned', 'Certificates Earned')}</StatLabel>
                    <QuickAction>{t('dashboard.viewCertificates', 'View Certificates')}</QuickAction>
                  </ProgressCard>
                  <ProgressCard onClick={() => navigate('/jobs')}>
                    <SubTitle>{t('dashboard.jobApplications', 'Job Applications')}</SubTitle>
                    <Stat>{stats.jobApplications || 0}</Stat>
                    <StatLabel>{t('dashboard.jobsAvailable', 'Jobs Available')}</StatLabel>
                    <QuickAction>{t('dashboard.browseJobs', 'Browse Jobs')}</QuickAction>
                  </ProgressCard>
      </DashboardGrid>
      
      {/* Second row: Scholarships card with same size as first row cards */}
      <ScholarshipsContainer>
        <ScholarshipsCardWrapper>
                              <ProgressCard onClick={() => navigate('/scholarships')}>
                      <SubTitle>{t('scholarships', 'Scholarships')}</SubTitle>
                      <Stat>{stats.scholarships || 0}</Stat>
                      <StatLabel>{t('dashboard.scholarshipsAvailable', 'Scholarships Available')}</StatLabel>
                      <QuickAction>{t('dashboard.browseScholarships', 'Browse Scholarships')}</QuickAction>
                    </ProgressCard>
        </ScholarshipsCardWrapper>
      </ScholarshipsContainer>
      <AvailableCourses courses={courses} onCourseClick={handleCourseClick} t={t} />

      {/* Recent Job Opportunities */}
      {(() => {
        // Filter out jobs with passed deadlines
        const activeJobs = jobs.filter(job => {
          if (!job.application_deadline) return true; // Keep jobs without deadline
          const deadlineDate = new Date(job.application_deadline);
          const today = new Date();
          const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0; // Only keep jobs with deadline today or in the future
        });

        return activeJobs.length > 0 && (
          <CourseCard>
            <CourseCardTitle>{t('dashboard.recentJobOpportunities', 'Recent Job Opportunities')}</CourseCardTitle>
            <CourseList>
              {activeJobs.map(job => (
                <CourseItemStyled key={job._id} onClick={() => navigate('/jobs')}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{job.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                      {job.company} • {job.location} • {job.type}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#007BFF',
                    fontWeight: '600',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: '#e3f2fd',
                    border: '1px solid #bbdefb'
                  }}>
                    {t('dashboard.applyNow', 'Apply Now')}
                  </div>
                </CourseItemStyled>
              ))}
            </CourseList>
          </CourseCard>
        );
      })()}

      {/* Recent Scholarships */}
      {(() => {
        // Filter out scholarships with passed deadlines
        const activeScholarships = scholarships.filter(scholarship => {
          if (!scholarship.deadline) return true; // Keep scholarships without deadline
          const deadlineDate = new Date(scholarship.deadline);
          const today = new Date();
          const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0; // Only keep scholarships with deadline today or in the future
        });

        return activeScholarships.length > 0 && (
          <CourseCard>
            <CourseCardTitle>{t('dashboard.recentScholarshipOpportunities', 'Recent Scholarship Opportunities')}</CourseCardTitle>
            <CourseList>
              {activeScholarships.map(scholarship => (
                <CourseItemStyled key={scholarship._id} onClick={() => navigate('/scholarships')}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>{scholarship.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                      {scholarship.provider} • {t('dashboard.deadline', 'Deadline')}: {new Date(scholarship.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#28a745',
                    fontWeight: '600',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: '#d4edda',
                    border: '1px solid #c3e6cb'
                  }}>
                    {t('dashboard.apply', 'Apply')}
                  </div>
                </CourseItemStyled>
              ))}
            </CourseList>
          </CourseCard>
        );
      })()}
    </DashboardContainer>
  );
};

export default RefugeeDashboard; 