import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ContentWrapper from '../../components/ContentWrapper';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem 2.5rem 2rem 2.5rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const HeroSection = styled.div`
  text-align: left;
  margin-bottom: 1rem;
  padding: 2rem 0 1rem 0;
`;

const MainTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: 0;
  margin-right: 0;
  line-height: 1.6;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 4rem 1rem 1.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const CategoriesSection = styled.div`
  margin-bottom: 3rem;
`;

const CategoriesTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: left;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
`;

const CategoryCard = styled.div`
  background: ${({ bgColor }) => bgColor || 'white'};
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255,255,255,0.3);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
`;

const CategoryIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: white;
`;

const CategoryName = styled.h3`
  color: white;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const CourseCount = styled.p`
  color: rgba(255,255,255,0.9);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  cursor: pointer;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 0.5rem;
    font-size: 0.98rem;
  }
  &:hover {
    transform: translateY(-4px);
  }
`;

const CourseImage = styled.div`
  height: 160px;
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
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const CourseContent = styled.div`
  padding: 1.5rem;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
`;

const EnrollButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  width: 100%;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const BrowseCourses = () => {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState([]);
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Define professional colors for categories
  const getCategoryColor = (index) => {
    const colors = [
      { bg: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', icon: '#2c3e50' }, // Professional dark blue
      { bg: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', icon: '#3498db' }, // Professional blue
      { bg: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', icon: '#27ae60' }, // Professional green
      { bg: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)', icon: '#8e44ad' }, // Professional purple
      { bg: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)', icon: '#e67e22' }, // Professional orange
      { bg: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)', icon: '#16a085' }, // Professional teal
      { bg: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)', icon: '#7f8c8d' }, // Professional gray
      { bg: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)', icon: '#c0392b' }, // Professional red
      { bg: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)', icon: '#d35400' }, // Professional brown-orange
    ];
    return colors[index % colors.length];
  };

  // Fetch courses and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
              const isOnline = navigator.onLine;
      console.log('🔍 Network status - isOnline:', isOnline);
      console.log('🔍 Token available:', !!token);

      let coursesData = [];
      let categoriesData = [];
      let enrolledData = [];

              if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching data from API...');
            console.log('🔍 About to fetch courses from /api/courses');
            
            // Fetch all courses
            try {
              const coursesResponse = await fetch('/api/courses', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('🔍 Courses fetch completed. Status:', coursesResponse.status);

              if (coursesResponse.ok) {
              const coursesApiData = await coursesResponse.json();
              console.log('✅ Courses API Response:', coursesApiData);
              console.log('🔍 RAW RESPONSE STRING:', JSON.stringify(coursesApiData, null, 2));
              console.log('🔍 API Response Keys:', Object.keys(coursesApiData));
              
              // Log raw API response for debugging
              console.log('📋 Raw API Response structure:', {
                type: typeof coursesApiData,
                keys: Object.keys(coursesApiData),
                hasData: !!coursesApiData.data,
                dataType: typeof coursesApiData.data,
                dataKeys: coursesApiData.data ? Object.keys(coursesApiData.data) : 'none'
              });
              
              // EXTRACT COURSES - Based on actual backend API structure
              let extractedCourses = [];
              
              // Backend returns: { success: true, data: { courses: [...], pagination: {...} } }
              if (coursesApiData.data && coursesApiData.data.courses && Array.isArray(coursesApiData.data.courses)) {
                extractedCourses = coursesApiData.data.courses;
                console.log('✅ Found courses in: coursesApiData.data.courses');
              } else {
                console.log('❌ Courses not found in expected location. Response structure:', Object.keys(coursesApiData));
              }
              
              coursesData = extractedCourses;
              console.log('🎯 Final courses data length:', coursesData.length);
              

              
              // Store courses for offline use
              await offlineIntegrationService.storeCourses(coursesData);
                          } else {
                console.error('❌ Courses API failed:', coursesResponse.status);
                throw new Error('Courses API failed');
              }
            } catch (coursesFetchError) {
              console.error('❌ Error fetching courses:', coursesFetchError);
              throw coursesFetchError;
            }

            // Fetch categories
            console.log('🔍 About to fetch categories from /api/courses/categories');
            try {
              const categoriesResponse = await fetch('/api/courses/categories', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('🔍 Categories fetch completed. Status:', categoriesResponse.status);

              if (categoriesResponse.ok) {
              const categoriesApiData = await categoriesResponse.json();
              console.log('✅ Categories API Response:', categoriesApiData);
              console.log('🔍 RAW CATEGORIES RESPONSE STRING:', JSON.stringify(categoriesApiData, null, 2));
              console.log('🔍 Categories API Response Keys:', Object.keys(categoriesApiData));
              
              // Log raw API response for debugging
              console.log('📂 Raw Categories API Response structure:', {
                type: typeof categoriesApiData,
                keys: Object.keys(categoriesApiData),
                hasData: !!categoriesApiData.data,
                dataType: typeof categoriesApiData.data,
                dataKeys: categoriesApiData.data ? Object.keys(categoriesApiData.data) : 'none'
              });
              
              // EXTRACT CATEGORIES - Based on actual backend API structure  
              let extractedCategories = [];
              
              // Backend returns: { success: true, data: { categories: [...] } }
              if (categoriesApiData.data && categoriesApiData.data.categories && Array.isArray(categoriesApiData.data.categories)) {
                extractedCategories = categoriesApiData.data.categories;
                console.log('✅ Found categories in: categoriesApiData.data.categories');
              } else {
                console.log('❌ Categories not found in expected location. Response structure:', Object.keys(categoriesApiData));
                console.log('❌ Data keys:', categoriesApiData.data ? Object.keys(categoriesApiData.data) : 'No data object');
              }
              
              categoriesData = extractedCategories;
              console.log('🎯 Final categories data length:', categoriesData.length);
              

              
              // Store categories for offline use
              await offlineIntegrationService.storeCategories(categoriesData);
                          } else {
                console.error('❌ Categories API failed:', categoriesResponse.status);
                throw new Error('Categories API failed');
              }
            } catch (categoriesFetchError) {
              console.error('❌ Error fetching categories:', categoriesFetchError);
              throw categoriesFetchError;
            }

            // Fetch enrolled courses
            console.log('🔍 About to fetch enrolled courses');
            try {
            const enrolledResponse = await fetch('/api/courses/enrolled/courses', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (enrolledResponse.ok) {
              const enrolledApiData = await enrolledResponse.json();
              // Backend returns: { success: true, data: { courses: [...] } }
              const enrolledCourses = enrolledApiData.data?.courses || [];
              enrolledData = enrolledCourses.map(course => course._id);
              
              // Store enrolled courses for offline use
              await offlineIntegrationService.storeEnrolledCourses(enrolledData);
            }

          } catch (enrolledFetchError) {
            console.error('❌ Error fetching enrolled courses:', enrolledFetchError);
            // Don't throw here as enrolled courses is optional
          }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            const offlineData = await fetchOfflineData();
            coursesData = offlineData.courses;
            categoriesData = offlineData.categories;
            enrolledData = offlineData.enrolled;
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline data...');
          const offlineData = await fetchOfflineData();
          coursesData = offlineData.courses;
          categoriesData = offlineData.categories;
          enrolledData = offlineData.enrolled;
        }

        // Update state with fetched data
        console.log('🔍 DEBUG: About to set state with:', {
          coursesData: coursesData,
          coursesLength: coursesData?.length,
          categoriesData: categoriesData,
          categoriesLength: categoriesData?.length,
          enrolledData: enrolledData,
          firstCourse: coursesData?.[0]?.title,
          firstCategory: categoriesData?.[0]?.name
        });
        
        setCourses(coursesData || []);
        setCategories(categoriesData || []);
        setEnrolled(enrolledData || []);
        
        console.log('🎯 State has been set! Will check updated state in next useEffect...');

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load courses and categories');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to fetch offline data
    const fetchOfflineData = async () => {
      try {
        const courses = await offlineIntegrationService.getCourses() || [];
        const categories = await offlineIntegrationService.getCategories() || [];
        const enrolled = await offlineIntegrationService.getEnrolledCourses() || [];
        
        console.log('📱 Offline data loaded:', {
          courses: courses.length,
          categories: categories.length,
          enrolled: enrolled.length
        });
        
        return { courses, categories, enrolled };
      } catch (error) {
        console.error('❌ Failed to load offline data:', error);
        return { courses: [], categories: [], enrolled: [] };
      }
    };

    fetchData();
  }, []);

  // Debug log when state changes
  useEffect(() => {
    console.log('🔍 DEBUG: State updated:', {
      coursesCount: courses.length,
      categoriesCount: categories.length,
      enrolledCount: enrolled.length,
      firstCourse: courses[0]?.title,
      firstCategory: categories[0]?.name
    });
  }, [courses, categories, enrolled]);

  // Search courses when search term changes
  useEffect(() => {
    const searchCourses = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let searchResults = [];

        if (isOnline) {
          try {
            // Try online search first (preserving existing behavior)
            console.log('🌐 Online search for:', search);
            const response = await fetch(`/api/courses?search=${encodeURIComponent(search)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              // Backend returns: { success: true, data: { courses: [...] } }
              searchResults = data.data?.courses || [];
              
              // Store search results for offline use
              try {
                await offlineIntegrationService.storeSearchResults(search, searchResults);
              } catch (storeError) {
                console.warn('⚠️ Failed to store search results offline:', storeError);
              }
            } else {
              console.error('Search failed:', response.status);
              // Fall back to offline search
              searchResults = await performOfflineSearch(search);
            }
          } catch (error) {
            console.error('Online search error:', error);
            // Fall back to offline search
            searchResults = await performOfflineSearch(search);
          }
        } else {
          // Offline search
          console.log('📴 Offline search for:', search);
          searchResults = await performOfflineSearch(search);
        }

        setSearchResults(searchResults);
      } catch (err) {
        console.error('Error searching courses:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    // Helper function for offline search
    const performOfflineSearch = async (searchTerm) => {
      try {
        const offlineCourses = await offlineIntegrationService.getCourses() || [];
        const searchLower = searchTerm.toLowerCase();
        
        return offlineCourses.filter(course => 
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower) ||
          course.category?.toLowerCase().includes(searchLower)
        );
      } catch (error) {
        console.error('❌ Offline search failed:', error);
        return [];
      }
    };

    const timeoutId = setTimeout(searchCourses, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEnrolled(prev => [...prev, courseId]);
        alert('Successfully enrolled in course!');
      } else {
        const errorData = await response.json();
        // Check if user is already enrolled
        if (errorData.message && errorData.message.includes('Already enrolled')) {
          // Update local state to reflect enrollment status
          setEnrolled(prev => [...prev, courseId]);
          alert('You are already enrolled in this course!');
        } else {
          alert(errorData.message || 'Failed to enroll in course');
        }
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in course');
    }
  };

  // Calculate course counts for each category
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: courses.filter(course => course.category === category.name).length
  }));

  // Debug: Log summary of data and counts
  console.log('🔢 Data Summary:', {
    totalCourses: courses.length,
    totalCategories: categories.length,
    firstCourse: courses[0]?.title || 'None',
    firstCategory: categories[0]?.name || 'None',
    categoriesWithCourses: categoriesWithCounts.filter(cat => cat.count > 0).length
  });
  
  if (courses.length > 0 && categories.length > 0) {
    console.log('📊 Category Counts:', categoriesWithCounts.map(cat => `${cat.name}: ${cat.count}`));
  }

  // Find matching category if no course matches
  const matchingCategory = categories.find(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handler for viewing more details about a course
  const handleViewMore = (course) => {
    navigate(`/courses/${course._id}/overview`, { state: course });
  };

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
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            <div>{error}</div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Container>
        <HeroSection>
          <MainTitle>What do you want to learn?</MainTitle>
          <Subtitle>Grow your skills with the most reliable online courses and certifications</Subtitle>
          <SearchContainer>
            <SearchInput
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for courses, skills, or topics..."
            />
          </SearchContainer>
        </HeroSection>



        {search.trim() ? (
          <>
            {searchLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div>Searching courses...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <CourseGrid>
                {searchResults.map(course => (
                  <CourseCard key={course._id}>
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
                    })()}>
                      <CourseLevel level={course.level || course.difficult_level}>{course.level || course.difficult_level}</CourseLevel>
                    </CourseImage>
                    <CourseContent>
                      <CourseTitle>{course.title}</CourseTitle>
                      <CourseDescription>{course.description}</CourseDescription>
                      <CourseMeta>
                        <span>{course.duration}</span>
                        <span>{course.students || 0}+ students</span>
                      </CourseMeta>
                      <div style={{ margin: '0.5rem 0', color: '#888', fontSize: '0.95rem' }}>
                        Category: <b>{course.category}</b>
                      </div>
                      {enrolled.includes(course._id) ? (
                        <EnrollButton style={{ background: '#27ae60' }} onClick={() => handleViewMore(course)}>
                          Continue Learning
                        </EnrollButton>
                      ) : (
                        <EnrollButton onClick={() => handleEnroll(course._id)}>
                          Enroll Now
                        </EnrollButton>
                      )}
                    </CourseContent>
                  </CourseCard>
                ))}
              </CourseGrid>
            ) : matchingCategory ? (
              <div style={{ margin: '2rem 0', color: '#666', fontSize: '1.1rem' }}>
                No course found, but you can explore the <b>{matchingCategory.name}</b> category.
                <br />
                <button
                  style={{
                    marginTop: '1rem',
                    background: '#3498db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                  onClick={() => navigate(`/courses/category/${encodeURIComponent(matchingCategory.name)}`)}
                >
                  Go to {matchingCategory.name}
                </button>
              </div>
            ) : (
              <div style={{ margin: '2rem 0', color: '#666', fontSize: '1.1rem' }}>
                No courses or categories found matching your search.
              </div>
            )}
          </>
        ) : (
          <CategoriesSection>
            <CategoriesTitle>Choose Categories</CategoriesTitle>
            <CategoriesGrid>
              {categoriesWithCounts
                .filter(category => category.count > 0) // Only show categories with courses
                .map((category, index) => {
                const categoryColors = getCategoryColor(index);
                return (
                  <CategoryCard 
                    key={index} 
                    onClick={() => navigate(`/courses/category/${encodeURIComponent(category.name)}`)}
                    bgColor={categoryColors.bg}
                  >
                    <CategoryIcon color={categoryColors.icon}>
                      {category.icon}
                    </CategoryIcon>
                    <CategoryName>{category.name}</CategoryName>
                    <CourseCount>{category.count} courses</CourseCount>
                  </CategoryCard>
                );
              })}
            </CategoriesGrid>
            {categoriesWithCounts.filter(cat => cat.count > 0).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No courses available yet. Check back later!</p>
              </div>
            )}
          </CategoriesSection>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default BrowseCourses;
