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

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let courseData = null;

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
            
            // Store course data for offline use
            await offlineIntegrationService.storeCourseData(courseId, courseData);
          } else {
            throw new Error('Failed to load course');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          // Fall back to offline data if online fails
          courseData = await offlineIntegrationService.getCourseData(courseId);
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline course detail data...');
        courseData = await offlineIntegrationService.getCourseData(courseId);
      }

      if (courseData) {
        setCourse(courseData);
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
        {(course.course_profile_picture || course.image) && (
          <CourseImage 
            src={course.course_profile_picture?.startsWith('/') ? course.course_profile_picture : 
                 course.course_profile_picture?.startsWith('uploads/') ? `/${course.course_profile_picture}` : 
                 `/uploads/${course.course_profile_picture}` || 
                 course.image || '/default-course-image.jpg'} 
            alt={course.title}
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
        )}
        <CourseTitle>{course.title}</CourseTitle>
        
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
            <p style={{ color: '#666', lineHeight: 1.6 }}>{course.overview}</p>
          </div>
        )}

        {course.learningOutcomes && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Learning Outcomes</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>{course.learningOutcomes}</p>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
        </div>
      </CourseHeader>

      {course.modules && course.modules.length > 0 && (
        <ModulesSection>
          <h2 style={{ color: '#007BFF', marginBottom: '1.5rem' }}>Course Modules</h2>
          {course.modules.map((module, index) => (
            <ModuleCard key={module._id || index}>
              <ModuleTitle>Module {index + 1}: {module.title}</ModuleTitle>
              {module.description && (
                <ModuleDescription>{module.description}</ModuleDescription>
              )}
              <ModuleItems>
                {module.content && module.content.length > 0 && (
                  <ItemBadge>
                    <PlayArrow fontSize="small" />
                    {module.content.length} Content{module.content.length !== 1 ? 's' : ''}
                  </ItemBadge>
                )}
                {module.assessments && module.assessments.length > 0 && (
                  <ItemBadge>
                    <Assignment fontSize="small" />
                    {module.assessments.length} Assessment{module.assessments.length !== 1 ? 's' : ''}
                  </ItemBadge>
                )}
                {module.quizzes && module.quizzes.length > 0 && (
                  <ItemBadge>
                    <Quiz fontSize="small" />
                    {module.quizzes.length} Quiz{module.quizzes.length !== 1 ? 'zes' : ''}
                  </ItemBadge>
                )}
                {module.discussions && module.discussions.length > 0 && (
                  <ItemBadge>
                    <Forum fontSize="small" />
                    {module.discussions.length} Discussion{module.discussions.length !== 1 ? 's' : ''}
                  </ItemBadge>
                )}
              </ModuleItems>
            </ModuleCard>
          ))}
        </ModulesSection>
      )}
    </Container>
  );
} 