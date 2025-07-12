import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ContentWrapper from '../../components/ContentWrapper';

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

        // Fetch all courses
        const coursesResponse = await fetch('/api/courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          console.log('✅ Courses API Response:', coursesData);
          console.log('📊 Courses received:', coursesData.data.courses?.length || 0);
          console.log('📋 Course details:', coursesData.data.courses);
          setCourses(coursesData.data.courses || []);
        } else {
          console.error('❌ Courses API failed:', coursesResponse.status);
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/courses/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('✅ Categories API Response:', categoriesData);
          console.log('📊 Categories received:', categoriesData.data.categories?.length || 0);
          console.log('📋 Category details:', categoriesData.data.categories);
          setCategories(categoriesData.data.categories || []);
        } else {
          console.error('❌ Categories API failed:', categoriesResponse.status);
        }

        // Fetch enrolled courses
        const enrolledResponse = await fetch('/api/courses/enrolled/courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (enrolledResponse.ok) {
          const enrolledData = await enrolledResponse.json();
          setEnrolled(enrolledData.data.courses?.map(course => course._id) || []);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load courses and categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        
        const response = await fetch(`/api/courses?search=${encodeURIComponent(search)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data.courses || []);
        }
      } catch (err) {
        console.error('Error searching courses:', err);
      } finally {
        setSearchLoading(false);
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
        alert(errorData.message || 'Failed to enroll in course');
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

  // Debug: Log category counts calculation in detail
  console.log('🔢 Category counts calculation:');
  console.log('📚 Total courses received from API:', courses.length);
  console.log('📂 Total categories from API:', categories.length);
  
  console.log('📋 All courses received from /api/courses:');
  courses.forEach((course, index) => {
    console.log(`  ${index + 1}. "${course.title}"`);
    console.log(`      Category: "${course.category}"`);
    console.log(`      Published: ${course.isPublished}`);
    console.log(`      ID: ${course._id}`);
  });
  
  console.log('📋 All category names from /api/courses/categories:');
  categories.forEach((cat, index) => {
    console.log(`  ${index + 1}. "${cat.name}" - Description: "${cat.description}"`);
  });
  
  console.log('🔍 Category count calculations (exact matching):');
  categoriesWithCounts.forEach(cat => {
    const matchingCourses = courses.filter(course => {
      const matches = course.category === cat.name;
      console.log(`    "${course.title}" category "${course.category}" === "${cat.name}"? ${matches}`);
      return matches;
    });
    console.log(`📁 ${cat.name}: ${cat.count} courses`);
    console.log(`    Matching courses:`, matchingCourses.map(c => c.title));
  });
  
  console.log('🎯 Final categories with counts > 0:');
  const nonEmptyCategories = categoriesWithCounts.filter(cat => cat.count > 0);
  nonEmptyCategories.forEach(cat => {
    console.log(`  ✅ ${cat.name}: ${cat.count} courses`);
  });

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
