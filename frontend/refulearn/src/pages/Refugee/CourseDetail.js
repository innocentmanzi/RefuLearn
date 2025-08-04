import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, PlayArrow, Assignment, Quiz, Forum } from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem;
  background: #f4f8fb;
  min-height: 100vh;
`;

const CourseHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const CourseTitle = styled.h1`
  color: #007BFF;
  margin-bottom: 1rem;
`;

const CourseImage = styled.img`
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const CourseInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
`;

const InfoLabel = styled.div`
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  color: #333;
  font-size: 1.1rem;
`;

const ModulesSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ModuleCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid #007BFF;
`;

const ModuleTitle = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
`;

const ModuleDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
`;

const ModuleItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ItemBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
`;

const EnrollButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  // Force isCompleted to always be false for debugging
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Override setIsCompleted to always set to false
  const originalSetIsCompleted = setIsCompleted;
  setIsCompleted = (value) => {
    console.log('🚫 CourseDetail: Blocked setIsCompleted call with:', value);
    console.log('🚫 CourseDetail: Forcing isCompleted to false');
    originalSetIsCompleted(false);
  };
  const [overviewExpanded, setOverviewExpanded] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let courseData = null;
      let modulesData = [];

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching course detail from API...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            courseData = data.data.course;
            console.log('✅ Course data received:', courseData);
            console.log('Course image path:', courseData.course_profile_picture);
            
            // Fetch modules data
            if (courseData.modules && courseData.modules.length > 0) {
              console.log('🔍 Fetching modules data for course...');
              const modulesResponse = await fetch(`/api/courses/modules?course=${courseId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (modulesResponse.ok) {
                const modulesApiData = await modulesResponse.json();
                modulesData = modulesApiData.data.modules || [];
                console.log('✅ Modules data received:', modulesData.length, 'modules');
                
                // Store modules data for offline use (using data cache directly)
                try {
                  await offlineIntegrationService.dataCache.storeData(`modules_${courseId}`, modulesData);
                } catch (cacheError) {
                  console.warn('⚠️ Could not store modules data in cache:', cacheError);
                }
              } else {
                console.warn('⚠️ Failed to fetch modules, using course module IDs');
                // Fallback: use module IDs from course data
                modulesData = courseData.modules.map((moduleId, index) => ({
                  _id: moduleId,
                  title: `Module ${index + 1}`,
                  description: 'Module description not available',
                  content: [],
                  assessments: [],
                  quizzes: [],
                  discussions: []
                }));
              }
            }
            
            // Store course data for offline use
            await offlineIntegrationService.storeCourseData(courseId, courseData);
          } else {
            throw new Error('Failed to load course');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          // Fall back to offline data if online fails
          courseData = await offlineIntegrationService.getCourseData(courseId);
          try {
            modulesData = await offlineIntegrationService.dataCache.getData(`modules_${courseId}`) || [];
          } catch (cacheError) {
            console.warn('⚠️ Could not get modules data from cache:', cacheError);
            modulesData = [];
          }
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline course detail data...');
        courseData = await offlineIntegrationService.getCourseData(courseId);
        try {
          modulesData = await offlineIntegrationService.dataCache.getData(`modules_${courseId}`) || [];
        } catch (cacheError) {
          console.warn('⚠️ Could not get modules data from cache:', cacheError);
          modulesData = [];
        }
      }

      if (courseData) {
        // Merge modules data with course data
        courseData.modules = modulesData;
        setCourse(courseData);
        
        // Check enrollment status
        const enrolled = await checkEnrollmentStatus();
        
        // Check completion status if enrolled
        if (enrolled) {
          await checkCompletionStatus();
        }
      } else {
        setError('Course not available offline');
      }
    } catch (err) {
      console.error('❌ Error fetching course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        try {
          const response = await fetch(`/api/courses/enrolled/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            setIsEnrolled(true);
            console.log('✅ User is enrolled in this course');
            return true;
          } else {
            setIsEnrolled(false);
            console.log('❌ User is not enrolled in this course');
            return false;
          }
        } catch (error) {
          console.warn('⚠️ Could not check enrollment status online:', error);
          // Fall back to offline check
          const enrolledCourses = await offlineIntegrationService.getEnrolledCourses();
          const enrolled = enrolledCourses.includes(courseId);
          setIsEnrolled(enrolled);
          return enrolled;
        }
      } else {
        // Offline mode: check from cached data
        const enrolledCourses = await offlineIntegrationService.getEnrolledCourses();
        const enrolled = enrolledCourses.includes(courseId);
        setIsEnrolled(enrolled);
        return enrolled;
      }
    } catch (error) {
      console.error('❌ Error checking enrollment status:', error);
      setIsEnrolled(false);
      return false;
    }
  };

  const checkCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      if (isOnline) {
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
            const completed = progressPercentage >= 100; // Changed from 95 to 100
            setIsCompleted(completed);
            console.log(`✅ Course completion status: ${progressPercentage}% - ${completed ? 'Completed' : 'In Progress'}`);
          } else {
            setIsCompleted(false);
            console.log('❌ Could not fetch course progress');
          }
        } catch (error) {
          console.warn('⚠️ Could not check completion status online:', error);
          setIsCompleted(false);
        }
      } else {
        // Offline mode: check from cached data
        const cachedCompleted = localStorage.getItem('refugee_completed_cache');
        if (cachedCompleted) {
          const completedCourses = JSON.parse(cachedCompleted);
          setIsCompleted(completedCourses.includes(courseId));
        } else {
          setIsCompleted(false);
        }
      }
    } catch (error) {
      console.error('❌ Error checking completion status:', error);
      setIsCompleted(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online enrollment first (preserving existing behavior)
          console.log('🌐 Online mode: Enrolling in course...');
          
          const response = await fetch(`/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            success = true;
            console.log('✅ Online enrollment successful');
            alert('Successfully enrolled in course!');
            setIsEnrolled(true);
            // Check completion status after enrollment
            await checkCompletionStatus();
            // Refresh course data to update enrollment status
            fetchCourse();
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to enroll in course');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online enrollment failed, using offline:', onlineError);
          // Fall back to offline enrollment
          const result = await offlineIntegrationService.enrollInCourseOffline(courseId);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline enrollment successful');
            alert('Successfully enrolled in course offline! Will sync when online.');
          } else {
            throw new Error('Failed to enroll in course offline');
          }
        }
      } else {
        // Offline enrollment
        console.log('📴 Offline mode: Enrolling in course offline...');
        const result = await offlineIntegrationService.enrollInCourseOffline(courseId);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline enrollment successful');
          alert('Successfully enrolled in course offline! Will sync when online.');
        } else {
          throw new Error('Failed to enroll in course offline');
        }
      }

      if (!success) {
        alert('Failed to enroll in course');
      }
    } catch (err) {
      console.error('❌ Error enrolling in course:', err);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  // Function to validate and fix course image URLs
  const validateCourseImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path, try to construct the full URL
    if (imageUrl.startsWith('/')) {
      // This might be a local path, try to construct the full URL
      const baseUrl = window.location.origin;
      return `${baseUrl}${imageUrl}`;
    }
    
    // If it's a Supabase URL without protocol, add https
    if (imageUrl.includes('supabase.co') && !imageUrl.startsWith('http')) {
      return `https://${imageUrl}`;
    }
    
    return imageUrl;
  };

  // Function to get a reliable course image URL with fallbacks
  const getCourseImageUrl = (course) => {
    const courseImage = course.course_profile_picture || course.image;
    const validatedUrl = validateCourseImageUrl(courseImage);
    
    // Default fallback images based on category
    const fallbackImages = {
      'Business': 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Technology': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'default': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    };
    
    const fallbackImage = fallbackImages[course.category] || fallbackImages.default;
    
    return validatedUrl || fallbackImage;
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading course...</div>
        </div>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error || 'Course not found'}</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <ArrowBack style={{ marginRight: 6 }} /> Back to Dashboard
      </BackButton>

      <CourseHeader>
        {(() => {
          // Get reliable course image URL with fallbacks
          const imageUrl = getCourseImageUrl(course);
          
          // Add cache-busting parameter to force image reload
          const finalImageUrl = `${imageUrl}?t=${Date.now()}`;
          
          console.log('🎨 CourseDetail image data:', {
            courseId: courseId,
            courseTitle: course.title,
            course_profile_picture: course.course_profile_picture,
            course_image: course.image,
            finalImage: finalImageUrl
          });
          
          return (
            <CourseImage 
              src={finalImageUrl}
              alt={course.title}
              onError={(e) => {
                console.error('❌ CourseDetail image failed to load:', finalImageUrl);
                e.target.style.display = 'none';
              }}
            />
          );
        })()}
        <CourseTitle>{course.title}</CourseTitle>
        {isCompleted && (
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            ✅ Course Completed
          </div>
        )}
        
        <CourseInfo>
          <InfoItem>
            <InfoLabel>Duration</InfoLabel>
            <InfoValue>{course.duration || 'Self-paced'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Level</InfoLabel>
            <InfoValue>{course.level || 'Beginner'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Category</InfoLabel>
            <InfoValue>{course.category || 'General'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Students Enrolled</InfoLabel>
            <InfoValue>{course.enrolledStudents?.length || 0}</InfoValue>
          </InfoItem>
        </CourseInfo>

        {course.overview && (
          <div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Course Overview</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              {overviewExpanded 
                ? course.overview 
                : course.overview.length > 200 
                  ? `${course.overview.substring(0, 200)}...` 
                  : course.overview
              }
            </p>
            {course.overview.length > 200 && (
              <button 
                onClick={() => setOverviewExpanded(!overviewExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007BFF',
                  cursor: 'pointer',
                  padding: '0',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {overviewExpanded ? 'See Less' : 'See More'}
              </button>
            )}
          </div>
        )}

        {course.learningOutcomes && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Learning Outcomes</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>{course.learningOutcomes}</p>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {isEnrolled ? (
            <>
              <button 
                onClick={() => navigate(`/courses/${courseId}/overview`)}
                style={{
                  background: isCompleted ? '#10b981' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {isCompleted ? '✅ Review Course' : 'Continue Learning'}
              </button>
              <button 
                onClick={() => navigate(`/courses/${courseId}/overview`)}
                style={{
                  background: '#007BFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                View Course Overview
              </button>
            </>
          ) : (
            <>
              <EnrollButton onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </EnrollButton>
              <button 
                onClick={() => navigate(`/courses/${courseId}/overview`)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                View Course Overview
              </button>
            </>
          )}
        </div>
      </CourseHeader>

      {course.modules && course.modules.length > 0 && (
        <ModulesSection>
          <h2 style={{ color: '#007BFF', marginBottom: '1.5rem' }}>Course Modules</h2>
          {course.modules.map((module, index) => {
            // Skip modules with placeholder titles
            if (module.title === 'Module 1' && module.description === 'Module description not available') {
              return null;
            }
            
            return (
              <ModuleCard key={module._id || index}>
                <ModuleTitle>
                  {module.title && module.title !== `Module ${index + 1}` 
                    ? `Module ${index + 1}: ${module.title}` 
                    : `Module ${index + 1}: ${module.title || 'Untitled Module'}`
                  }
                </ModuleTitle>
                {module.description && module.description !== 'Module description not available' && (
                  <ModuleDescription>{module.description}</ModuleDescription>
                )}
                <ModuleItems>
                  {module.content && Array.isArray(module.content) && module.content.length > 0 && (
                    <ItemBadge>
                      <PlayArrow fontSize="small" />
                      {module.content.length} Content{module.content.length !== 1 ? 's' : ''}
                    </ItemBadge>
                  )}
                  {module.assessments && Array.isArray(module.assessments) && module.assessments.length > 0 && (
                    <ItemBadge>
                      <Assignment fontSize="small" />
                      {module.assessments.length} Assessment{module.assessments.length !== 1 ? 's' : ''}
                    </ItemBadge>
                  )}
                  {module.quizzes && Array.isArray(module.quizzes) && module.quizzes.length > 0 && (
                    <ItemBadge>
                      <Quiz fontSize="small" />
                      {module.quizzes.length} Quiz{module.quizzes.length !== 1 ? 'zes' : ''}
                    </ItemBadge>
                  )}
                  {module.discussions && Array.isArray(module.discussions) && module.discussions.length > 0 && (
                    <ItemBadge>
                      <Forum fontSize="small" />
                      {module.discussions.length} Discussion{module.discussions.length !== 1 ? 's' : ''}
                    </ItemBadge>
                  )}
                  {module.resources && Array.isArray(module.resources) && module.resources.length > 0 && (
                    <ItemBadge>
                      <Assignment fontSize="small" />
                      {module.resources.length} Resource{module.resources.length !== 1 ? 's' : ''}
                    </ItemBadge>
                  )}
                </ModuleItems>
              </ModuleCard>
            );
          })}
        </ModulesSection>
      )}
    </Container>
  );
} 