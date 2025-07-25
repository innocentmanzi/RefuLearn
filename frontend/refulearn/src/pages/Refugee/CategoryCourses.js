import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import ContentWrapper from '../../components/ContentWrapper';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem 2rem 2rem 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CategoryHeader = styled.div`
  text-align: left;
  margin-bottom: 3rem;
  padding: 0;
`;

const CategoryTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CategoryDescription = styled.p`
  color: #666;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  text-align: left;
  max-width: none;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CourseCount = styled.div`
  color: #888;
  font-size: 1rem;
  margin-top: 1rem;
  text-align: left;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const FilterButton = styled.button`
  background: ${({ active, theme }) => active ? theme.colors.primary : '#f5f5f5'};
  color: ${({ active }) => active ? 'white' : '#333'};
  border: none;
  border-radius: 25px;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: translateY(-2px);
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0;
  width: 100%;
  justify-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 320px;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }
`;

const CourseImage = styled.div`
  height: 160px;
  background: ${({ image }) => `url(${image}) center/cover`};
  position: relative;
  background-color: #f8f9fa;
`;

const CourseLevel = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ level }) => 
    level === 'Beginner' ? '#4CAF50' :
    level === 'Intermediate' ? '#FFC107' :
    '#F44336'
  };
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const CourseContent = styled.div`
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 180px;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const CourseMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EnrollButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: auto;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyStateTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const EmptyStateText = styled.p`
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const BrowseAllButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;
const SectionTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.primary || '#3498db'};
`;
const ModuleList = styled.ul`
  padding-left: 1.2rem;
  margin-bottom: 1rem;
`;
const ModuleItem = styled.li`
  margin-bottom: 0.5rem;
`;
const ActionRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const CategoryCourses = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  
  // Use categoryName as category for consistency
  const category = categoryName;
  
  // Initialize with cached data to prevent empty states  
  const [courses, setCourses] = useState(() => {
    try {
      const cached = localStorage.getItem(`refugee_category_${categoryName}_courses`);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    try {
      const cached = localStorage.getItem('refugee_enrolled_cache');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [completedCourses, setCompletedCourses] = useState(() => {
    try {
      const cached = localStorage.getItem('refugee_completed_cache');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add error boundary to catch toLowerCase errors
  const safeToLowerCase = (str) => {
    try {
      return (str || '').toString().toLowerCase();
    } catch (err) {
      console.error('Error in safeToLowerCase:', err, 'Input:', str);
      return '';
    }
  };

  useEffect(() => {
    console.log('🔧 useEffect triggered, category:', category);
    
    // Load cached data IMMEDIATELY to prevent empty states
    const loadCachedData = () => {
      try {
        const cachedCourses = localStorage.getItem(`refugee_category_${category}_courses`);
        const cachedEnrolled = localStorage.getItem('refugee_enrolled_cache');
        
        if (cachedCourses) {
          const coursesData = JSON.parse(cachedCourses);
          setCourses(coursesData);
          console.log('📦 IMMEDIATELY loaded cached category courses:', coursesData.length);
        }
        
        if (cachedEnrolled) {
          const enrolledData = JSON.parse(cachedEnrolled);
          setEnrolledCourses(enrolledData);
          console.log('📦 IMMEDIATELY loaded cached enrolled courses:', enrolledData.length);
        }
        
        const cachedCompleted = localStorage.getItem('refugee_completed_cache');
        if (cachedCompleted) {
          const completedData = JSON.parse(cachedCompleted);
          setCompletedCourses(completedData);
          console.log('📦 IMMEDIATELY loaded cached completed courses:', completedData.length);
        }
        

      } catch (error) {
        console.warn('⚠️ Error loading cached category data:', error);
      }
    };
    
    // Load cached data FIRST
    loadCachedData();
    
    const fetchData = async () => {
      console.log('🔍 Starting to fetch data for category:', category);
      
      // Helper function to fetch offline data - DEFINED FIRST TO AVOID INITIALIZATION ERROR
      const fetchOfflineData = async () => {
        try {
          const courses = await offlineIntegrationService.getCategoryCourses(category) || [];
          const enrolled = await offlineIntegrationService.getEnrolledCourses() || [];
          
          console.log('📱 Offline data loaded for category:', category, {
            courses: courses.length,
            enrolled: enrolled.length
          });
          
          return { courses, enrolled };
        } catch (error) {
          console.error('❌ Failed to load offline data:', error);
          return { courses: [], enrolled: [] };
        }
      };
      
      if (!category) {
        console.error('❌ No category provided');
        setError('No category specified');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        console.log('🔑 Token exists:', !!token);
        console.log('🌐 Network status:', isOnline ? 'online' : 'offline');
        
        if (!token) {
          console.error('❌ No authentication token found');
          setError('Authentication required');
          setLoading(false);
          return;
        }

        let coursesData = [];
        let enrolledData = [];

        if (isOnline) {
          try {
            // SIMPLIFIED APPROACH: Always use the general courses endpoint with client-side filtering
            // This is more reliable than the category-specific endpoint
            console.log('🌐 Online mode: Fetching ALL courses and filtering by category...');
            console.log('🔍 Target category:', category);
            
            // Fetch ALL courses first
            const allCoursesUrl = '/api/courses';
            console.log('🌐 Making API call to:', allCoursesUrl);
            
            const response = await fetch(allCoursesUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ All courses data received:', data);
              console.log('✅ Total courses found:', data.data?.courses?.length || 0);
              
              if (data.success && data.data?.courses) {
                // Filter courses by category CLIENT-SIDE (more reliable)
                const allCourses = data.data.courses;
                console.log('📚 All courses:', allCourses.length);
                console.log('🔍 All course categories:', allCourses.map(c => `"${c.title}" -> "${c.category}"`));
                
                // Filter by category (case-insensitive)
                coursesData = allCourses.filter(course => {
                  if (!course.category) return false;
                  const matches = course.category.toLowerCase() === category.toLowerCase();
                  console.log(`🔍 "${course.title}" category="${course.category}" target="${category}" matches=${matches}`);
                  return matches;
                });
                
                console.log('✅ Filtered courses for category:', coursesData.length);
                
                // Store category courses for offline use
                await offlineIntegrationService.storeCategoryCourses(category, coursesData);
                
                // Fetch enrolled courses
                try {
                  const enrolledResponse = await fetch('/api/courses/enrolled/courses', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (enrolledResponse.ok) {
                    const enrolledApiData = await enrolledResponse.json();
                    console.log('✅ Enrolled courses data:', enrolledApiData);
                    enrolledData = enrolledApiData.data.courses?.map(course => course._id) || [];
                    await offlineIntegrationService.storeEnrolledCourses(enrolledData);
                  } else {
                    console.error('❌ Failed to fetch enrolled courses');
                    enrolledData = [];
                  }
                } catch (enrolledError) {
                  console.error('❌ Error fetching enrolled courses:', enrolledError);
                  enrolledData = [];
                }
                
                console.log('📚 Final courses for category:', coursesData.length);
              } else {
                console.error('❌ Invalid response structure:', data);
                throw new Error('Invalid response from server');
              }
            } else {
              console.error('❌ API Response not ok:', response.status, response.statusText);
              throw new Error(`Failed to fetch courses: HTTP ${response.status}`);
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            const offlineData = await fetchOfflineData();
            coursesData = offlineData.courses;
            enrolledData = offlineData.enrolled;
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline data...');
          const offlineData = await fetchOfflineData();
          coursesData = offlineData.courses;
          enrolledData = offlineData.enrolled;
          
          // Load completed courses from cache for offline mode
          const cachedCompleted = localStorage.getItem('refugee_completed_cache');
          if (cachedCompleted) {
            const completedData = JSON.parse(cachedCompleted);
            setCompletedCourses(completedData);
          }
          

        }

        // Update state with fetched data (only if we got new data or have no existing data)
        if (coursesData.length > 0 || courses.length === 0) {
          setCourses(coursesData);
          // Cache category courses
          try {
            localStorage.setItem(`refugee_category_${category}_courses`, JSON.stringify(coursesData));
          } catch (e) { console.warn('Failed to cache category courses:', e); }
        }
        
        if (enrolledData.length > 0 || enrolledCourses.length === 0) {
          setEnrolledCourses(enrolledData);
          // Cache enrolled courses
          try {
            localStorage.setItem('refugee_enrolled_cache', JSON.stringify(enrolledData));
          } catch (e) { console.warn('Failed to cache enrolled courses:', e); }
        }

        // Fetch completion status for enrolled courses
        if (enrolledData.length > 0) {
          try {
            const completionPromises = enrolledData.map(async (courseId) => {
              try {
                const response = await fetch(`/api/courses/${courseId}/progress`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (response.ok) {
                  const data = await response.json();
                  const progressPercentage = data.data?.progressPercentage || 0;
                  const isCompleted = progressPercentage >= 95;
                  return { courseId, isCompleted, progressPercentage };
                }
                return { courseId, isCompleted: false, progressPercentage: 0 };
              } catch (error) {
                console.warn(`⚠️ Could not fetch progress for course ${courseId}:`, error);
                return { courseId, isCompleted: false, progressPercentage: 0 };
              }
            });
            
            const completionResults = await Promise.all(completionPromises);
            const newCompletedCourses = completionResults.filter(result => result.isCompleted).map(result => result.courseId);
            
            console.log('🔄 Updated completion status:', {
              totalEnrolled: enrolledData.length,
              completed: newCompletedCourses.length,
              completionResults: completionResults
            });
            
            setCompletedCourses(newCompletedCourses);
            localStorage.setItem('refugee_completed_cache', JSON.stringify(newCompletedCourses));
            
          } catch (error) {
            console.error('❌ Error fetching completion status:', error);
          }
        }


        
        // Debug final results
        console.log('🎯 Final results for category:', category);
        console.log('📚 Courses found:', coursesData.length);
        console.log('📝 Enrolled courses:', enrolledData.length);
        console.log('📋 Enrolled courses list:', enrolledData);
        console.log('🔍 First course ID:', coursesData[0]?._id);
        console.log('🔍 Is first course enrolled?:', enrolledData.includes(coursesData[0]?._id));
        console.log('📋 Course details:', coursesData.map(c => ({
          title: c.title,
          category: c.category,
          published: c.isPublished,
          id: c._id
        })));
        
        if (coursesData.length === 0) {
          console.log('⚠️ No courses found! This could be because:');
          console.log('   1. No courses exist in this category');
          console.log('   2. Courses exist but are not published');
          console.log('   3. Category name mismatch');
          console.log('   4. Authentication/API error');
        }

      } catch (err) {
        console.error('❌ General error:', err);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error stack:', err.stack);
        // Don't clear existing data on error - keep what we have
        console.log('🔄 Keeping existing category courses data due to API error');
        setError('Failed to refresh courses. Showing cached data.');
      } finally {
        setLoading(false);
      }


    };

    if (category) {
      console.log('🚀 Calling fetchData for category:', category);
      fetchData();
    } else {
      console.error('❌ No category in useEffect dependency');
      setLoading(false);
    }
  }, [category]);

  const handleViewCourse = (course) => {
    // Navigate to course overview page for all courses (enrolled, completed, or not enrolled)
    navigate(`/courses/${course._id}/overview`, { state: course });
  };

  const handleEnroll = async (course) => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let enrollmentSuccess = false;

      if (isOnline) {
        try {
          // Try online enrollment first (preserving existing behavior)
          console.log('🌐 Online enrollment for course:', course.title);
          const response = await fetch(`/api/courses/${course._id}/enroll`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            enrollmentSuccess = true;
            console.log('✅ Online enrollment successful');
          } else {
            const errorData = await response.json();
            console.error('❌ Online enrollment failed:', errorData.message);
            
            // If already enrolled, update the state to reflect this
            if (errorData.message && errorData.message.includes('Already enrolled')) {
              console.log('✅ User is already enrolled, updating state');
              setEnrolledCourses(prev => {
                if (!prev.includes(course._id)) {
                  return [...prev, course._id];
                }
                return prev;
              });
              alert('You are already enrolled in this course!');
              return; // Don't throw error, just return
            }
            
            throw new Error(errorData.message || 'Failed to enroll in course');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online enrollment failed, trying offline:', onlineError);
          // Fall back to offline enrollment
          await offlineIntegrationService.enrollInCourse(course._id);
          enrollmentSuccess = true;
          console.log('✅ Offline enrollment successful');
        }
      } else {
        // Offline enrollment
        console.log('📴 Offline enrollment for course:', course.title);
        await offlineIntegrationService.enrollInCourse(course._id);
        enrollmentSuccess = true;
        console.log('✅ Offline enrollment successful');
      }

      if (enrollmentSuccess) {
        // Add course ID to enrolled courses array
        setEnrolledCourses(prev => [...prev, course._id]);
        alert('Successfully enrolled in course!');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  const handleStartCourse = (course) => {
    navigate(`/courses/${course._id}/overview`);
  };

  const isEnrolled = (courseId) => {
    if (!courseId || !enrolledCourses) return false;
    // enrolledCourses is now an array of course IDs, not course objects
    return enrolledCourses.includes(courseId);
  };

  const isCompleted = (courseId) => {
    if (!courseId || !completedCourses) return false;
    return completedCourses.includes(courseId);
  };



  const filteredCourses = (() => {
    try {
      return (courses || []).filter(course => {
        if (!course) return false;
        
        const courseTitle = course.title || '';
        const courseDescription = course.description || '';
        const searchTermLower = safeToLowerCase(searchTerm);
        
        const matchesSearch = safeToLowerCase(courseTitle).includes(searchTermLower) ||
                             safeToLowerCase(courseDescription).includes(searchTermLower);
        
        if (activeFilter === 'all') return matchesSearch;
        if (activeFilter === 'enrolled') return matchesSearch && isEnrolled(course._id);
        if (activeFilter === 'not-enrolled') return matchesSearch && !isEnrolled(course._id);
        if (activeFilter === 'completed') return matchesSearch && isCompleted(course._id);

        
        return matchesSearch;
      });
    } catch (err) {
      console.error('Error in filteredCourses:', err);
      return [];
    }
  })();

  // Handle no category case
  if (!category) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            <div>No category specified</div>
            <button onClick={() => navigate('/courses')}>Back to Courses</button>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  if (loading) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading courses...</div>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <Container>
          <BackButton onClick={() => navigate('/courses')}>
            ← Back to Courses
          </BackButton>
          
          <CategoryHeader>
            <CategoryTitle>{category} Courses</CategoryTitle>
            <CategoryDescription>
              We're having trouble loading courses for this category right now.
            </CategoryDescription>
          </CategoryHeader>
          
          <div style={{ textAlign: 'center', padding: '2rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <div style={{ color: '#856404', marginBottom: '1rem' }}>⚠️ {error}</div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Retry
              </button>
              <button 
                onClick={() => navigate('/courses')}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Browse All Courses
              </button>
            </div>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Container>
        <BackButton onClick={() => navigate('/courses')}>
          ← Back to Courses
        </BackButton>

        <CategoryHeader>
          <CategoryTitle>{category} Courses</CategoryTitle>
          <CategoryDescription>
            Explore our comprehensive collection of {safeToLowerCase(category)} courses designed to help you master new skills and advance your career.
          </CategoryDescription>
          <CourseCount>{filteredCourses.length} courses available</CourseCount>
        </CategoryHeader>

        <FilterSection>
          <FilterButton
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            All Courses
          </FilterButton>
          <FilterButton
            active={activeFilter === 'enrolled'}
            onClick={() => setActiveFilter('enrolled')}
          >
            Enrolled
          </FilterButton>
          <FilterButton
            active={activeFilter === 'not-enrolled'}
            onClick={() => setActiveFilter('not-enrolled')}
          >
            Not Enrolled
          </FilterButton>
          <FilterButton
            active={activeFilter === 'completed'}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </FilterButton>

        </FilterSection>

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '300px',
              maxWidth: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        {filteredCourses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem', 
            background: '#f8f9fa', 
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>No courses found in {category}</h3>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
              {courses.length === 0 
                ? `We don't have any courses in the ${category} category yet. Check back later or explore other categories!`
                : `No courses match your current filters. Try adjusting your search terms or filters.`
              }
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/courses')}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Browse All Courses
              </button>
            </div>
          </div>
        ) : (
          <CourseGrid>
            {filteredCourses.map((course) => (
              <CourseCard key={course._id || Math.random()} onClick={() => handleViewCourse(course)}>
                <CourseImage image={course.course_profile_picture || course.image || null} />
                <CourseLevel level={course.level || course.difficult_level || 'Beginner'}>
                  {course.level || course.difficult_level || 'Beginner'}
                </CourseLevel>
                <CourseContent>
                  <CourseTitle>{course.title || 'Course Title'}</CourseTitle>
                  <CourseDescription>
                    {course.description || course.overview || `Learn ${course.category || 'new skills'} in this comprehensive course designed for ${course.level || 'beginner'} level students.`}
                  </CourseDescription>
                  <CourseMeta>
                    <MetaItem>
                      <span>⏱ {course.duration || 'Self-paced'}</span>
                    </MetaItem>
                    <MetaItem>
                      <span>👥 {course.students || 0} students</span>
                    </MetaItem>
                  </CourseMeta>
                  {isEnrolled(course._id) ? (
                    isCompleted(course._id) ? (
                      <EnrollButton 
                        style={{ background: '#10b981' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCourse(course);
                        }}
                      >
                        ✅ Course Completed
                      </EnrollButton>
                    ) : (
                    <EnrollButton onClick={(e) => {
                      e.stopPropagation();
                      handleStartCourse(course);
                    }}>
                      Continue Learning
                    </EnrollButton>
                    )
                  ) : (
                    <EnrollButton onClick={(e) => {
                      e.stopPropagation();
                      handleEnroll(course);
                    }}>
                      Enroll Now
                    </EnrollButton>
                  )}
                </CourseContent>
              </CourseCard>
            ))}
          </CourseGrid>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default CategoryCourses; 