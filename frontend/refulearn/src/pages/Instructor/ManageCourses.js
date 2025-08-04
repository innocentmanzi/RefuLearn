import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import { theme } from '../../theme';
import { useNavigate } from 'react-router-dom';


const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Th = styled.th`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 0.8rem;
  text-align: left;
`;

const Td = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
`;

const ActionButton = styled.button`
  background: ${({ color, theme }) => color || theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  min-width: 350px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  position: relative;
`;

const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
  z-index: 2;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const CoursesGrid = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

const CourseCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CourseInfo = styled.div`
  flex: 1;
`;

const CourseTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const CourseDescription = styled.p`
  margin: 0;
  color: #555;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const PageBackground = styled.div`
  background: #f4f8fb;
  min-height: 100vh;
  width: 100%;
`;

const TableCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 2rem 1.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const StickyTh = styled.th`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 0.8rem;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const HoverTr = styled.tr`
  transition: background 0.15s;
  &:hover {
    background: #f0f6ff;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  background: ${({ published }) => (published ? '#e6f9ec' : '#fbeaea')};
  color: ${({ published }) => (published ? '#1bbf4c' : '#d32f2f')};
`;

const StudentsBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #e3e8f0;
  color: #1976d2;
  font-weight: 600;
`;

const ProActionButton = styled.button`
  background: ${({ color, theme }) => color || theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 0.3rem 0.8rem;
  margin-right: 0;
  margin-bottom: 0;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: background 0.2s, box-shadow 0.2s;
  position: relative;
  z-index: 3;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
`;

const ProAddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.8rem 2.2rem;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  margin-left: auto;
  display: block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  }
`;

const CoursesCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.8rem;
  }
`;

const CourseCardItem = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
`;

const CourseCardImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
`;

const CourseCardContent = styled.div`
  padding: 1rem;
`;

const CourseCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
  gap: 0.5rem;
`;

const CourseCardTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
  line-height: 1.3;
`;

const CourseCardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.8rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetaLabel = styled.span`
  font-weight: 500;
  color: #666;
  font-size: 0.8rem;
`;

const MetaValue = styled.span`
  color: #333;
  font-size: 0.8rem;
`;

const CourseCardDescription = styled.p`
  color: #666;
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 1rem;
  margin-top: 0;
`;

const CourseCardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-start;
  position: relative;
  z-index: 2;
`;

const ManageCourses = () => {
  console.log('ManageCourses component mounted');
  const { token, user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    difficult_level: 'Beginner',
    overview: '',
    isPublished: false
  });
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCourseAnalytics, setSelectedCourseAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  const navigate = useNavigate();

  // Fetch courses
  const fetchCourses = async () => {
    console.log('🎯 Fetching instructor courses...');
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/instructor/courses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Courses data received:', data);
        console.log('📚 Courses array:', data.data?.courses);
        console.log('🖼️ Course profile pictures:', data.data?.courses?.map(c => ({
          title: c.title,
          course_profile_picture: c.course_profile_picture,
          hasImage: !!c.course_profile_picture
        })));
        setCourses(data.data?.courses || []);
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (err) {
      console.error('❌ Courses fetch failed:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };


  // Fetch course analytics
  const fetchCourseAnalytics = async (courseId) => {
    try {
      setAnalyticsLoading(true);
      console.log('🔄 Fetching course analytics...');
      
      const response = await fetch(`/api/instructor/courses/${courseId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course analytics');
      }

      const data = await response.json();
      const analyticsData = data.data;
      console.log('✅ Course analytics data received:', analyticsData);
      
      setSelectedCourseAnalytics(analyticsData || {});
    } catch (err) {
      setError(err.message || 'Failed to load course analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // View course analytics
  const viewCourseAnalytics = (course) => {
    setSelectedCourseAnalytics(null);
    setShowAnalyticsModal(true);
    fetchCourseAnalytics(course._id);
  };

  // Create course
  const createCourse = async (courseData) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...courseData,
          instructor: user._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      setSuccess('Course created successfully');
      fetchCourses();
      closeModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create course');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Update course
  const updateCourse = async (courseId, courseData) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...courseData,
          instructor: user._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      setSuccess('Course updated successfully');
      fetchCourses();
      closeModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update course');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      setSuccess('Course deleted successfully');
      fetchCourses();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete course');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Toggle course publish status
  const togglePublishStatus = async (courseId, currentStatus) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update course status');
      }

      setSuccess(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchCourses();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update course status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Restore missing functions
  const openCourseBuilder = (mode, course = null) => {
    if (mode === 'edit' && course) {
      setEditingCourse(course);
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'Beginner',
        duration: course.duration || '',
        difficult_level: course.difficult_level || 'Beginner',
        overview: course.overview || '',
        isPublished: course.isPublished || false
      });
    } else {
      setEditingCourse(null);
      setCourseData({
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        duration: '',
        difficult_level: 'Beginner',
        overview: '',
        isPublished: false
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setCourseData({
      title: '',
      description: '',
      category: '',
      level: 'Beginner',
      duration: '',
      difficult_level: 'Beginner',
      overview: '',
      isPublished: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    if (!courseData.title || !courseData.description) {
      setError('Title and description are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (editingCourse) {
      updateCourse(editingCourse._id, courseData);
    } else {
      createCourse(courseData);
    }
  };

  const handleDelete = (id) => {
    deleteCourse(id);
  };

  const handleCourseClick = (course) => {
    navigate(`/instructor/courses/${course._id}/overview`);
  };

  useEffect(() => {
    try {
      // Always fetch courses, regardless of token status
      fetchCourses();
      // Force image refresh when component mounts
      setImageRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error in useEffect for fetchCourses:', err);
    }
  }, []);

  // Add focus event listener to refresh data when returning from edit page
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing courses data...');
      fetchCourses();
      setImageRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading courses...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{error}</div>
      </Container>
    );
  }

  if (!loading && courses.length === 0) {
    return (
      <Container>
        <Title>Manage Courses</Title>
        <div style={{ textAlign: 'center', color: '#888', margin: '2rem 0' }}>
          No courses found. Click "Create New Course" to add one.
        </div>
      </Container>
    );
  }

  console.log('Rendering ManageCourses with courses:', courses);
  console.log('Course profile pictures:', courses.map(c => ({
    title: c.title,
    course_profile_picture: c.course_profile_picture,
    hasImage: !!c.course_profile_picture
  })));

  return (
    <PageBackground>
      <Container>
        <HeaderContainer>
          <Title>Manage Courses</Title>
          <ProAddButton onClick={() => navigate('/instructor/courses/create')}>
            Create New Course
          </ProAddButton>
        </HeaderContainer>
        <CoursesCardsContainer>
          {courses.map(course => (
            <CourseCardItem key={course._id} onClick={() => handleCourseClick(course)}>
                <CourseCardImage 
                  src={(() => {
                    console.log('🖼️ Processing course image for:', course.title, 'Profile picture:', course.course_profile_picture);
                    
                    if (course.course_profile_picture) {
                      // Convert Windows backslashes to forward slashes
                      const normalizedPath = course.course_profile_picture.replace(/\\/g, '/');
                      console.log('🖼️ Normalized path:', normalizedPath);
                      
                      let imageUrl;
                      if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
                        console.log('🖼️ Using direct URL:', normalizedPath);
                        imageUrl = normalizedPath;
                      } else if (normalizedPath.startsWith('/uploads/')) {
                        console.log('🖼️ Using uploads path:', normalizedPath);
                        imageUrl = normalizedPath;
                      } else if (normalizedPath.startsWith('uploads/')) {
                        console.log('🖼️ Using uploads path with slash:', `/${normalizedPath}`);
                        imageUrl = `/${normalizedPath}`;
                      } else if (normalizedPath.includes('supabase.co') || normalizedPath.includes('storage.googleapis.com')) {
                        console.log('🖼️ Using cloud storage URL:', normalizedPath);
                        imageUrl = normalizedPath;
                      } else {
                        console.log('🖼️ Using default uploads path:', `/uploads/${normalizedPath}`);
                        imageUrl = `/uploads/${normalizedPath}`;
                      }
                      
                      // Add cache-busting parameter to force image refresh
                      const cacheBuster = `?t=${Date.now()}&k=${imageRefreshKey}`;
                      const finalUrl = imageUrl.includes('?') ? `${imageUrl}&${cacheBuster.substring(1)}` : `${imageUrl}${cacheBuster}`;
                      console.log('🖼️ Final image URL with cache buster:', finalUrl);
                      
                      return finalUrl;
                    }
                    console.log('🖼️ No profile picture, using default:', '/logo512.png');
                    return '/logo512.png';
                  })()} 
                  alt={course.title}
                  onError={(e) => {
                    // Only log the error if it's not already the fallback image
                    if (e.target.src !== '/logo512.png') {
                      console.warn('⚠️ Course image failed to load, using fallback:', e.target.src);
                    }
                    e.target.src = '/logo512.png';
                  }}
                />
              <CourseCardContent>
                <CourseCardHeader>
                  <CourseCardTitle>{course.title}</CourseCardTitle>
                  <StatusBadge published={course.isPublished}>
                    {course.isPublished ? 'Published' : 'Unpublished'}
                  </StatusBadge>
                </CourseCardHeader>
                
                <CourseCardMeta>
                  <MetaItem>
                    <MetaLabel>Category:</MetaLabel>
                    <MetaValue>{course.category || 'General'}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Level:</MetaLabel>
                    <MetaValue>{course.level || 'Beginner'}</MetaValue>
                  </MetaItem>
                  <MetaItem>
                    <MetaLabel>Students:</MetaLabel>
                    <StudentsBadge>{course.enrolledStudents?.length || 0}</StudentsBadge>
                  </MetaItem>
                </CourseCardMeta>

                {course.overview && (
                  <CourseCardDescription>
                    {course.overview.length > 80 ? `${course.overview.substring(0, 80)}...` : course.overview}
                  </CourseCardDescription>
                )}

                <CourseCardActions>
                  <ProActionButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/instructor/courses/${course._id}/edit`);
                    }} 
                    color="#1976d2"
                  >
                    Edit
                  </ProActionButton>
                  <ProActionButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePublishStatus(course._id, course.isPublished);
                    }} 
                    color={course.isPublished ? "#ff9800" : "#4caf50"}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </ProActionButton>
                  <ProActionButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(course._id);
                    }} 
                    color="#d32f2f"
                  >
                    Delete
                  </ProActionButton>
                </CourseCardActions>
              </CourseCardContent>
            </CourseCardItem>
          ))}
        </CoursesCardsContainer>
        {/* Modal for create/edit course */}
        {showModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</ModalTitle>
              <Label>Title *</Label>
              <Input
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                placeholder="Enter course title"
              />
              <Label>Description *</Label>
              <TextArea
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows="3"
              />
              <Label>Overview</Label>
              <TextArea
                name="overview"
                value={courseData.overview}
                onChange={handleInputChange}
                placeholder="Enter course overview"
                rows="3"
              />
              <Label>Category</Label>
              <Input
                name="category"
                value={courseData.category}
                onChange={handleInputChange}
                placeholder="Enter course category"
              />
              <Label>Level</Label>
              <Select name="level" value={courseData.level} onChange={handleInputChange}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </Select>
              <Label>Duration</Label>
              <Input
                name="duration"
                value={courseData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 4 weeks, 8 hours"
              />
              <Label>Difficulty Level</Label>
              <Select name="difficult_level" value={courseData.difficult_level} onChange={handleInputChange}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </Select>
              <div style={{ marginTop: '1rem' }}>
                <Label>
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={courseData.isPublished}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Publish course immediately
                </Label>
              </div>
              <StickyFooter>
                <ProActionButton onClick={handleSave} color="#1976d2">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </ProActionButton>
                <ProActionButton color="#6c757d" onClick={closeModal}>
                  Cancel
                </ProActionButton>
              </StickyFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </PageBackground>
  );
};

export default ManageCourses; 