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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  width: 100%;
  justify-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }
`;

const CourseImage = styled.div`
  height: 200px;
  background: ${({ image }) => `url(${image}) center/cover`};
  position: relative;
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
  padding: 1.5rem;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.3;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
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
  padding: 0.8rem 1.5rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 1rem;
  
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
  
  // All useState hooks must be called first, before any conditional logic
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching category courses from API...');
            
            // Fetch courses from the category endpoint
            const apiUrl = `/api/courses/category/${encodeURIComponent(category)}`;
            console.log('🌐 Making API call to:', apiUrl);
            console.log('🔍 Category parameter:', category);
            console.log('🔍 Encoded category:', encodeURIComponent(category));
            
            const response = await fetch(apiUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('📊 Response status:', response.status);
            console.log('📊 Response headers:', response.headers);
            console.log('📊 Response ok:', response.ok);
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ Data received:', data);
              console.log('✅ Success:', data.success);
              console.log('✅ Courses array:', data.data?.courses);
              console.log('✅ Courses length:', data.data?.courses?.length || 0);
              console.log('✅ Debug info from API:', data.data?.debug);
              
              if (data.success && data.data?.courses) {
                coursesData = data.data.courses;
                
                // Store category courses for offline use
                await offlineIntegrationService.storeCategoryCourses(category, coursesData);
                
                // Fetch enrolled courses properly from the backend
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
                    // Set enrolled courses as array of course IDs
                    enrolledData = enrolledApiData.data.courses?.map(course => course._id) || [];
                    
                    // Store enrolled courses for offline use
                    await offlineIntegrationService.storeEnrolledCourses(enrolledData);
                  } else {
                    console.error('❌ Failed to fetch enrolled courses');
                    enrolledData = [];
                  }
                } catch (enrolledError) {
                  console.error('❌ Error fetching enrolled courses:', enrolledError);
                  enrolledData = [];
                }
                
                console.log('📚 Courses set:', coursesData.length);
              } else if (data.success && data.data?.courses?.length === 0) {
                // API succeeded but no courses found for this category
                console.log('⚠️ No courses found for category:', category);
                console.log('🔄 Trying to fetch all courses and filter client-side...');
                
                // Fallback: Get all courses and filter client-side
                const allCoursesResponse = await fetch('/api/courses', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (allCoursesResponse.ok) {
                  const allCoursesData = await allCoursesResponse.json();
                  if (allCoursesData.success && allCoursesData.data?.courses) {
                    // Filter courses by category client-side (case-insensitive)
                    coursesData = allCoursesData.data.courses.filter(course => 
                      course.category && course.category.toLowerCase() === category.toLowerCase()
                    );
                    console.log('📚 Client-side filtered courses:', coursesData.length);
                    
                    // Store for offline use
                    await offlineIntegrationService.storeCategoryCourses(category, coursesData);
                  }
                }
                
                // Still get enrolled courses
                try {
                  const enrolledResponse = await fetch('/api/courses/enrolled/courses', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (enrolledResponse.ok) {
                    const enrolledApiData = await enrolledResponse.json();
                    enrolledData = enrolledApiData.data.courses?.map(course => course._id) || [];
                    await offlineIntegrationService.storeEnrolledCourses(enrolledData);
                  }
                } catch (enrolledError) {
                  console.error('❌ Error fetching enrolled courses:', enrolledError);
                  enrolledData = [];
                }
              } else {
                console.error('❌ Invalid response structure:', data);
                throw new Error('Invalid response from server');
              }
            } else {
              console.error('❌ Response not ok:', response.status);
              const errorText = await response.text();
              console.error('❌ Error response:', errorText);
              console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
              
              // Parse error response to understand what went wrong
              let errorMessage = 'Unknown error';
              let isAuthError = false;
              let isNotFoundError = false;
              
              if (response.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
                isAuthError = true;
              } else if (response.status === 403) {
                errorMessage = 'Access denied. Insufficient permissions.';
                isAuthError = true;
              } else if (response.status === 404) {
                errorMessage = 'Category endpoint not found.';
                isNotFoundError = true;
              } else {
                try {
                  const errorData = JSON.parse(errorText);
                  console.error('❌ Parsed error data:', errorData);
                  errorMessage = errorData.message || errorData.error || `HTTP ${response.status} error`;
                } catch (parseError) {
                  console.error('❌ Failed to parse error response:', parseError);
                  errorMessage = `HTTP ${response.status}: ${response.statusText || 'Server error'}`;
                }
              }
              
              console.error('❌ Final error message:', errorMessage);
              
              // If it's an auth error, redirect to login
              if (isAuthError) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
              }
              
              // Try fallback: get all courses and filter client-side
              console.log('🔄 API failed, trying fallback: fetch all courses and filter...');
              
              try {
                const allCoursesResponse = await fetch('/api/courses', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (allCoursesResponse.ok) {
                  const allCoursesData = await allCoursesResponse.json();
                  if (allCoursesData.success && allCoursesData.data?.courses) {
                    console.log('📚 All courses from fallback API:', allCoursesData.data.courses.length);
                    console.log('📋 All course categories:', allCoursesData.data.courses.map(c => `"${c.title}" -> "${c.category}"`));
                    
                    // Filter courses by category client-side (case-insensitive)
                    coursesData = allCoursesData.data.courses.filter(course => {
                      if (!course.category) return false;
                      const matches = course.category.toLowerCase() === category.toLowerCase();
                      console.log(`🔍 "${course.title}" category="${course.category}" matches="${matches}" published="${course.isPublished}"`);
                      return matches;
                    });
                    console.log('📚 Fallback: Client-side filtered courses:', coursesData.length);
                    
                    // Store for offline use
                    await offlineIntegrationService.storeCategoryCourses(category, coursesData);
                    
                    // Get enrolled courses
                    try {
                      const enrolledResponse = await fetch('/api/courses/enrolled/courses', {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      });

                      if (enrolledResponse.ok) {
                        const enrolledApiData = await enrolledResponse.json();
                        enrolledData = enrolledApiData.data.courses?.map(course => course._id) || [];
                        await offlineIntegrationService.storeEnrolledCourses(enrolledData);
                      }
                    } catch (enrolledError) {
                      console.error('❌ Error fetching enrolled courses:', enrolledError);
                      enrolledData = [];
                    }
                  } else {
                    throw new Error('Failed to fetch all courses as fallback');
                  }
                } else {
                  throw new Error(`Fallback API also failed: HTTP ${allCoursesResponse.status}`);
                }
              } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                
                // Set detailed error message for user
                throw new Error(`${errorMessage}. Fallback also failed: ${fallbackError.message}`);
              }
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
        }

        // Update state with fetched data
        setCourses(coursesData);
        setEnrolledCourses(enrolledData);
        
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
        setError('Failed to load courses. Please try again.');
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
    navigate(`/courses/${course._id}`, { state: course });
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
        </FilterSection>

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
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
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              {courses.length > 0 && (
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchTerm('');
                  }}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <CourseGrid>
            {filteredCourses.map((course) => (
              <CourseCard key={course._id || Math.random()} onClick={() => handleViewCourse(course)}>
                <CourseImage image={(() => {
                  if (course.course_profile_picture) {
                    // Convert Windows backslashes to forward slashes
                    const normalizedPath = course.course_profile_picture.replace(/\\/g, '/');
                    
                    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
                      return normalizedPath;
                    } else if (normalizedPath.startsWith('/uploads/')) {
                      return normalizedPath;
                    } else if (normalizedPath.startsWith('uploads/')) {
                      return `/${normalizedPath}`;
                    } else {
                      return `/uploads/${normalizedPath}`;
                    }
                  }
                  return course.image || null; // Return null instead of hardcoded fallback
                })()} />
                <CourseLevel level={course.level || course.difficult_level || 'Beginner'}>
                  {course.level || course.difficult_level || 'Beginner'}
                </CourseLevel>
                <CourseContent>
                  <CourseTitle>{course.title || 'Course Title'}</CourseTitle>
                  <CourseDescription>{course.description || 'No description available'}</CourseDescription>
                  <CourseMeta>
                    <MetaItem>
                      <span>⏱ {course.duration || 'Self-paced'}</span>
                    </MetaItem>
                    <MetaItem>
                      <span>👥 {course.students || 0} students</span>
                    </MetaItem>
                  </CourseMeta>
                  {isEnrolled(course._id) ? (
                    <EnrollButton onClick={(e) => {
                      e.stopPropagation();
                      handleStartCourse(course);
                    }}>
                      Continue Learning
                    </EnrollButton>
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