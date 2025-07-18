import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowBack, Edit, Publish, Delete, PlayArrow, Assignment, Quiz, Forum, 
  People, Schedule, Category, VisibilityOff, ExpandMore, ExpandLess, 
  VideoLibrary, Description, Link, CheckCircle, RadioButtonUnchecked, Add,
  MenuBook, School, Star, TrendingUp, LightbulbOutlined, Psychology, Assessment,
  Article, AudioFile, AttachFile
} from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 1rem;
  background: #f4f8fb;
  min-height: 100vh;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const CourseHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const CourseTitle = styled.h1`
  color: #007BFF;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ published }) => (published ? '#e6f9ec' : '#fbeaea')};
  color: ${({ published }) => (published ? '#1bbf4c' : '#d32f2f')};
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CourseImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const CourseInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InfoIcon = styled.div`
  background: #007BFF;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
`;

const InfoValue = styled.div`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${({ color }) => color || '#007BFF'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const SectionTitle = styled.h2`
  color: #007BFF;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

// Enhanced Course Overview Section
const EnhancedOverviewSection = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const OverviewHeader = styled.div`
  padding: 2rem 2rem 0 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
`;

const OverviewTitle = styled.h2`
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const OverviewContent = styled.div`
  padding: 0 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
`;

const OverviewDescription = styled.div`
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const SeeMoreButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 1rem;
  font-size: 1rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Enhanced Learning Outcomes Section
const LearningOutcomesSection = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const LearningOutcomesHeader = styled.div`
  padding: 2rem 2rem 0 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
`;

const LearningOutcomesTitle = styled.h2`
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const OutcomesContent = styled.div`
  padding: 0 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
`;

const OutcomesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem 2rem;
  }
`;

const OutcomeItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0;
`;

const OutcomeIcon = styled.div`
  background: #10b981;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const OutcomeText = styled.p`
  color: #4b5563;
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

// Enhanced Modules Section
const ModulesSection = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const ModulesSectionHeader = styled.div`
  padding: 2rem 2rem 0 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
`;

const ModulesSectionTitle = styled.h2`
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ModulesContent = styled.div`
  padding: 0 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
`;

const ModuleCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: white;
  border-bottom: ${({ expanded }) => expanded ? '1px solid #e5e7eb' : 'none'};
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ModuleHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ModuleNumber = styled.div`
  background: #6366f1;
  color: white;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const ModuleTitleContainer = styled.div`
  flex: 1;
`;

const ModuleTitle = styled.h3`
  color: #1f2937;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ModuleItemCount = styled.span`
  color: #6b7280;
  font-weight: 400;
  font-size: 0.875rem;
  margin-left: 0.5rem;
`;

const ExpandIcon = styled.div`
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;
  transform: ${({ expanded }) => expanded ? 'rotate(45deg)' : 'rotate(0deg)'};
  
  &:hover {
    color: #374151;
  }
`;

const ModuleDescription = styled.p`
  color: #666;
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ModuleContent = styled.div`
  background: #f8f9fa;
  border-top: 1px solid #e0e6ed;
`;

const ContentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e6ed;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ContentItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type }) => {
    switch (type) {
      case 'content': return '#007BFF';
      case 'video': return '#FF5722';
      case 'resource': return '#FF9800';
      case 'assessment': return '#4CAF50';
      case 'quiz': return '#9C27B0';
      case 'discussion': return '#FF5722';
      case 'edit': return '#6c757d';
      default: return '#007BFF';
    }
  }};
  color: white;
  flex-shrink: 0;
`;

const ContentItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContentItemTitle = styled.h4`
  color: #333;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
`;

const ContentItemMeta = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ContentItemAction = styled.div`
  color: #6c757d;
  flex-shrink: 0;
  
  &:hover {
    color: #333;
  }
`;

const DescriptionText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const QuickActionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  &:hover {
    border-color: #007BFF;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
  }
`;

const QuickActionIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const QuickActionContent = styled.div`
  flex: 1;
`;

const QuickActionTitle = styled.h3`
  color: #007BFF;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const QuickActionDescription = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;



export default function CourseOverview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState(new Set());

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      console.log('Fetching course with ID:', courseId);
      
      let courseData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching course overview from API...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);

          if (response.ok) {
            const data = await response.json();
            console.log('Course data received:', data);
            console.log('Course modules:', data.data?.course?.modules);
            
            if (data.success && data.data && data.data.course) {
              courseData = data.data.course;
              console.log('✅ Course overview data received from API');
              
              // Store course data for offline use
              await offlineIntegrationService.storeCourseData(courseId, courseData);
            } else {
              throw new Error('Invalid course data received');
            }
          } else {
            const errorText = await response.text();
            console.error('Failed response:', response.status, errorText);
            throw new Error(`Failed to load course: ${response.status} ${errorText}`);
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          // Fall back to offline data if online fails
          courseData = await offlineIntegrationService.getCourseData(courseId);
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline course overview data...');
        courseData = await offlineIntegrationService.getCourseData(courseId);
      }

      if (courseData) {
          
          // Ensure modules is an array
          if (courseData.modules && Array.isArray(courseData.modules)) {
            console.log('Found', courseData.modules.length, 'modules for course');
            courseData.modules.forEach((module, index) => {
              console.log(`Module ${index + 1}: ${module.title}`);
              console.log('  - contentItems:', module.contentItems ? module.contentItems.length : 'undefined', module.contentItems);
              console.log('  - content:', module.content ? 'Yes' : 'No');
              console.log('  - assessments:', module.assessments ? module.assessments.length : 0);
            });
            
            // Clean up duplicate discussions in each module
            courseData.modules = courseData.modules.map(module => {
              if (module.discussions && module.discussions.length > 0) {
                const originalCount = module.discussions.length;
                
                // Remove duplicates by title
                const uniqueDiscussions = [];
                const seenTitles = new Set();
                
                module.discussions.forEach(discussion => {
                  if (!seenTitles.has(discussion.title)) {
                    seenTitles.add(discussion.title);
                    uniqueDiscussions.push(discussion);
                  }
                });
                
                if (originalCount !== uniqueDiscussions.length) {
                  console.log(`🧹 Cleaned up ${originalCount - uniqueDiscussions.length} duplicate discussions in module: ${module.title}`);
                }
                
                return {
                  ...module,
                  discussions: uniqueDiscussions
                };
              }
              return module;
            });
          } else {
            console.log('No modules array found, setting empty array');
            courseData.modules = [];
          }
          
          setCourse(courseData);
        } else {
          console.error('No course data available');
          setError(isOnline ? 'Invalid course data received' : 'Course not available offline');
        }
      } catch (err) {
        console.error('❌ Error fetching course:', err);
        setError(`Network error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleTogglePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      const newPublishStatus = !course.isPublished;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online course update first (preserving existing behavior)
          console.log('🌐 Online mode: Updating course publish status...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              isPublished: newPublishStatus
            })
          });

          if (response.ok) {
            success = true;
            console.log('✅ Course publish status updated successfully');
            setCourse(prev => ({ ...prev, isPublished: newPublishStatus }));
            alert(`Course ${newPublishStatus ? 'published' : 'unpublished'} successfully!`);
          } else {
            throw new Error('Failed to update course status');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online course update failed, using offline:', onlineError);
          // Fall back to offline course update
          const offlineResult = await offlineIntegrationService.storeCourseUpdate(courseId, {
            isPublished: newPublishStatus
          });
          
          if (offlineResult.success) {
            success = true;
            console.log('✅ Course publish status update queued for offline sync');
            setCourse(prev => ({ ...prev, isPublished: newPublishStatus }));
            alert(`Course ${newPublishStatus ? 'published' : 'unpublished'} offline! Will sync when online.`);
          } else {
            throw new Error('Failed to update course status offline');
          }
        }
      } else {
        // Offline course update
        console.log('📴 Offline mode: Updating course publish status offline...');
        const offlineResult = await offlineIntegrationService.storeCourseUpdate(courseId, {
          isPublished: newPublishStatus
        });
        
        if (offlineResult.success) {
          success = true;
          console.log('✅ Course publish status update queued for offline sync');
          setCourse(prev => ({ ...prev, isPublished: newPublishStatus }));
          alert(`Course ${newPublishStatus ? 'published' : 'unpublished'} offline! Will sync when online.`);
        } else {
          throw new Error('Failed to update course status offline');
        }
      }

      if (!success) {
        alert('Failed to update course status');
      }
    } catch (err) {
      console.error('❌ Error updating course:', err);
      alert('Failed to update course status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online course deletion first (preserving existing behavior)
          console.log('🌐 Online mode: Deleting course...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            success = true;
            console.log('✅ Course deleted successfully');
            alert('Course deleted successfully!');
            navigate('/instructor/courses');
          } else {
            throw new Error('Failed to delete course');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online course deletion failed, using offline:', onlineError);
          // Fall back to offline course deletion
          const offlineResult = await offlineIntegrationService.storeCourseDelete(courseId);
          
          if (offlineResult.success) {
            success = true;
            console.log('✅ Course deletion queued for offline sync');
            alert('Course deleted offline! Will sync when online.');
            navigate('/instructor/courses');
          } else {
            throw new Error('Failed to delete course offline');
          }
        }
      } else {
        // Offline course deletion
        console.log('📴 Offline mode: Deleting course offline...');
        const offlineResult = await offlineIntegrationService.storeCourseDelete(courseId);
        
        if (offlineResult.success) {
          success = true;
          console.log('✅ Course deletion queued for offline sync');
          alert('Course deleted offline! Will sync when online.');
          navigate('/instructor/courses');
        } else {
          throw new Error('Failed to delete course offline');
        }
      }

      if (!success) {
        alert('Failed to delete course');
      }
    } catch (err) {
      console.error('❌ Error deleting course:', err);
      alert('Failed to delete course');
    }
  };

  const handleEditModule = (moduleIndex) => {
    const moduleToEdit = course.modules[moduleIndex];
    if (moduleToEdit) {
      navigate(`/instructor/courses/create/module`, {
        state: {
          module: moduleToEdit,
          courseData: {
            ...course,
            courseId,
            modules: course.modules
          }
        }
      });
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
      <BackButton onClick={() => navigate('/instructor/courses')}>
        <ArrowBack style={{ marginRight: 6 }} /> Back to Manage Courses
      </BackButton>

      <CourseHeader>
        {course.course_profile_picture && (
          <CourseImage 
            src={`/${course.course_profile_picture.replace(/^uploads\//, '')}`} 
            alt={course.title}
          />
        )}
        
        <CourseTitle>
          {course.title}
          <StatusBadge published={course.isPublished}>
            {course.isPublished ? 'Published' : 'Unpublished'}
          </StatusBadge>
        </CourseTitle>
        
        <CourseInfo>
          <InfoCard>
            <InfoIcon>
              <Schedule />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Duration</InfoLabel>
              <InfoValue>{course.duration || 'Self-paced'}</InfoValue>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>
              <Category />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Category</InfoLabel>
              <InfoValue>{course.category || 'General'}</InfoValue>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>
              <People />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Students Enrolled</InfoLabel>
              <InfoValue>{course.enrolledStudents?.length || 0}</InfoValue>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>
              <PlayArrow />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Modules</InfoLabel>
              <InfoValue>{course.modules?.length || 0}</InfoValue>
            </InfoContent>
          </InfoCard>
        </CourseInfo>

        <ActionButtons>
          <ActionButton onClick={() => navigate(`/instructor/courses/${courseId}/edit`)} color="#007BFF">
            <Edit /> Edit Course
          </ActionButton>
          <ActionButton onClick={() => navigate(`/instructor/courses/${courseId}/grades`)} color="#10b981">
            <Assessment /> View Grades
          </ActionButton>
          <ActionButton onClick={handleTogglePublish} color={course.isPublished ? "#6c757d" : "#007BFF"}>
            {course.isPublished ? <VisibilityOff /> : <Publish />}
            {course.isPublished ? 'Unpublish' : 'Publish'}
          </ActionButton>
          <ActionButton onClick={handleDelete} color="#000000">
            <Delete /> Delete Course
          </ActionButton>
        </ActionButtons>
      </CourseHeader>

      {/* Quick Add Content Section */}
      <Section style={{ marginTop: '1.5rem' }}>
        <SectionTitle style={{ marginBottom: '1.5rem', color: '#007BFF' }}>
          <Add style={{ marginRight: '0.5rem' }} />
          Quick Add Content
        </SectionTitle>
        
        <QuickActionsGrid>
          <QuickActionCard 
            onClick={() => navigate(`/instructor/courses/create/module`, {
              state: {
                courseData: {
                  ...course,
                  courseId,
                  modules: course.modules || []
                }
              }
            })}
          >
            <QuickActionIcon style={{ backgroundColor: '#007BFF' }}>
              <PlayArrow style={{ color: 'white', fontSize: '1.5rem' }} />
            </QuickActionIcon>
            <QuickActionContent>
              <QuickActionTitle>Add Module</QuickActionTitle>
              <QuickActionDescription>Create new learning modules with content and activities</QuickActionDescription>
            </QuickActionContent>
          </QuickActionCard>

          <QuickActionCard 
            onClick={() => navigate('/instructor/assessments', { state: { courseId, courseName: course.title } })}
          >
            <QuickActionIcon style={{ backgroundColor: '#007BFF' }}>
              <Assignment style={{ color: 'white', fontSize: '1.5rem' }} />
            </QuickActionIcon>
            <QuickActionContent>
              <QuickActionTitle>Add Assessment</QuickActionTitle>
              <QuickActionDescription>Create comprehensive assessments to evaluate student learning</QuickActionDescription>
            </QuickActionContent>
          </QuickActionCard>

          <QuickActionCard 
            onClick={() => navigate('/instructor/quizzes', { 
              state: { courseId, courseName: course.title } 
            })}
          >
            <QuickActionIcon style={{ backgroundColor: '#007BFF' }}>
              <Quiz style={{ color: 'white', fontSize: '1.5rem' }} />
            </QuickActionIcon>
            <QuickActionContent>
              <QuickActionTitle>Add Quiz</QuickActionTitle>
              <QuickActionDescription>Create quick quizzes for knowledge checks and practice</QuickActionDescription>
            </QuickActionContent>
          </QuickActionCard>

          <QuickActionCard 
            onClick={() => navigate('/instructor/discussions', { 
              state: { courseId, courseName: course.title } 
            })}
          >
            <QuickActionIcon style={{ backgroundColor: '#6c757d' }}>
              <Forum style={{ color: 'white', fontSize: '1.5rem' }} />
            </QuickActionIcon>
            <QuickActionContent>
              <QuickActionTitle>Add Discussion</QuickActionTitle>
              <QuickActionDescription>Start discussions to encourage student interaction</QuickActionDescription>
            </QuickActionContent>
          </QuickActionCard>

          <QuickActionCard 
            onClick={() => navigate('/instructor/groups', { 
              state: { courseId, courseName: course.title } 
            })}
          >
            <QuickActionIcon style={{ backgroundColor: '#000000' }}>
              <People style={{ color: 'white', fontSize: '1.5rem' }} />
            </QuickActionIcon>
            <QuickActionContent>
              <QuickActionTitle>Add Group</QuickActionTitle>
              <QuickActionDescription>Create study groups for collaborative learning</QuickActionDescription>
            </QuickActionContent>
          </QuickActionCard>
        </QuickActionsGrid>
      </Section>

      {course.overview && (
        <EnhancedOverviewSection>
          <OverviewHeader>
            <OverviewTitle>Course Overview</OverviewTitle>
          </OverviewHeader>
          <OverviewContent>
            <OverviewDescription>
              {course.overview}
            </OverviewDescription>
            <SeeMoreButton>See More</SeeMoreButton>
          </OverviewContent>
        </EnhancedOverviewSection>
      )}

      {course.learningOutcomes && (
        <LearningOutcomesSection>
          <LearningOutcomesHeader>
            <LearningOutcomesTitle>Learning Outcomes</LearningOutcomesTitle>
          </LearningOutcomesHeader>
          <OutcomesContent>
            <OutcomesGrid>
            {course.learningOutcomes.split('\n').filter(outcome => outcome.trim()).map((outcome, index) => (
              <OutcomeItem key={index}>
                  <OutcomeIcon>
                    <CheckCircle style={{ fontSize: '0.75rem' }} />
                  </OutcomeIcon>
                <OutcomeText>{outcome.trim()}</OutcomeText>
              </OutcomeItem>
            ))}
            </OutcomesGrid>
          </OutcomesContent>
        </LearningOutcomesSection>
      )}

      {course.modules && course.modules.length > 0 && (
        <ModulesSection>
          <ModulesSectionHeader>
            <ModulesSectionTitle>Course Modules</ModulesSectionTitle>
          </ModulesSectionHeader>
          <ModulesContent>
          {course.modules.map((module, index) => {
            const isExpanded = expandedModules.has(module._id);
            
            // Count total items in module with breakdown
            let totalItems = 0;
            let itemBreakdown = [];
            
            if (module.content) {
              totalItems++;
              itemBreakdown.push('1 content');
            }
            if (module.videoUrl) {
              totalItems++;
              itemBreakdown.push('1 video');
            }
            if (module.contentItems && module.contentItems.length > 0) {
              totalItems += module.contentItems.length;
              itemBreakdown.push(`${module.contentItems.length} content item${module.contentItems.length > 1 ? 's' : ''}`);
            }
            if (module.resources && module.resources.length > 0) {
              totalItems += module.resources.length;
              itemBreakdown.push(`${module.resources.length} resource${module.resources.length > 1 ? 's' : ''}`);
            }
            if (module.assessments && module.assessments.length > 0) {
              totalItems += module.assessments.length;
              itemBreakdown.push(`${module.assessments.length} assessment${module.assessments.length > 1 ? 's' : ''}`);
            }
            if (module.quizzes && module.quizzes.length > 0) {
              totalItems += module.quizzes.length;
              itemBreakdown.push(`${module.quizzes.length} quiz${module.quizzes.length > 1 ? 'zes' : ''}`);
            }
            if (module.discussions && module.discussions.length > 0) {
              // Count unique discussions only
              const uniqueDiscussions = [];
              const seenTitles = new Set();
              module.discussions.forEach(discussion => {
                if (!seenTitles.has(discussion.title)) {
                  seenTitles.add(discussion.title);
                  uniqueDiscussions.push(discussion);
                }
              });
              
              if (uniqueDiscussions.length > 0) {
                totalItems += uniqueDiscussions.length;
                itemBreakdown.push(`${uniqueDiscussions.length} discussion${uniqueDiscussions.length > 1 ? 's' : ''}`);
              }
            }
            
            return (
              <ModuleCard key={module._id || index}>
                <ModuleHeader 
                  expanded={isExpanded}
                  onClick={() => toggleModuleExpansion(module._id)}
                >
                    <ModuleHeaderContent>
                      <ModuleNumber>{index + 1}</ModuleNumber>
                      <ModuleTitleContainer>
                  <ModuleTitle>
                          Module {index + 1}: {module.title}
                          <ModuleItemCount>({totalItems} items)</ModuleItemCount>
                  </ModuleTitle>
                      </ModuleTitleContainer>
                    </ModuleHeaderContent>
                  <ExpandIcon expanded={isExpanded}>
                      <Add />
                  </ExpandIcon>
                </ModuleHeader>

                {isExpanded && (
                  <ModuleContent>
                    {/* Step 1: Content/Lessons - Always show first */}
                    {module.content && (
                        <ContentItem onClick={(e) => {
                          e.stopPropagation();
                        navigate(`/instructor/courses/${courseId}/modules/${module._id}/content`);
                        }}>
                          <ContentItemIcon type="content">
                          <Description />
                          </ContentItemIcon>
                          <ContentItemInfo>
                          <ContentItemTitle>Content</ContentItemTitle>
                          <ContentItemMeta>View • Reading Materials</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                          <RadioButtonUnchecked />
                          </ContentItemAction>
                        </ContentItem>
                    )}

                    {module.videoUrl && (
                        <ContentItem onClick={(e) => {
                          e.stopPropagation();
                        navigate(`/instructor/courses/${courseId}/modules/${module._id}/video`);
                        }}>
                          <ContentItemIcon type="video">
                          <VideoLibrary />
                          </ContentItemIcon>
                          <ContentItemInfo>
                          <ContentItemTitle>Video Lecture: {module.videoTitle || 'Lecture Video'}</ContentItemTitle>
                          <ContentItemMeta>Watch • Video Content</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                          <RadioButtonUnchecked />
                          </ContentItemAction>
                        </ContentItem>
                    )}

                    {/* Content Items */}
                    {module.contentItems && module.contentItems.map((item, idx) => (
                      <ContentItem 
                        key={`content-item-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to internal content viewer for all content items
                          navigate(`/instructor/courses/${courseId}/modules/${module._id}/content-item/${idx}`, {
                            state: { 
                              contentItem: item,
                              module: module,
                              course: course,
                              returnUrl: `/instructor/courses/${courseId}/overview`
                            }
                          });
                        }}
                      >
                          <ContentItemIcon type={item.type}>
                          {item.type === 'article' && <Article />}
                          {item.type === 'video' && <VideoLibrary />}
                          {item.type === 'audio' && <AudioFile />}
                          {item.type === 'file' && <AttachFile />}
                          </ContentItemIcon>
                          <ContentItemInfo>
                          <ContentItemTitle>{item.title}</ContentItemTitle>
                          <ContentItemMeta>
                            {item.type === 'article' && 'Read • Article'}
                            {item.type === 'video' && 'Watch • Video'}
                            {item.type === 'audio' && 'Listen • Audio'}
                            {item.type === 'file' && 'View • File'}
                            {item.url && ' • External Link'}
                            {item.fileName && ` • ${item.fileName}`}
                          </ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                          <RadioButtonUnchecked />
                          </ContentItemAction>
                        </ContentItem>
                    ))}

                    {module.resources && module.resources.map((resource, idx) => (
                      <ContentItem 
                        key={`resource-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open external resource in new tab if it's a URL
                          if (resource.url) {
                            window.open(resource.url, '_blank');
                          } else {
                            navigate(`/instructor/courses/${courseId}/modules/${module._id}/resource/${idx}`);
                          }
                        }}
                      >
                          <ContentItemIcon type="resource">
                          <Link />
                          </ContentItemIcon>
                          <ContentItemInfo>
                          <ContentItemTitle>Resource: {resource.title || `Resource ${idx + 1}`}</ContentItemTitle>
                          <ContentItemMeta>View • {resource.type || 'Resource'}</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                          <RadioButtonUnchecked />
                          </ContentItemAction>
                        </ContentItem>
                    ))}

                    {/* Step 2: Assignments/Assessments - Show after content */}
                    {module.assessments && module.assessments.map((assessment, idx) => (
                      <ContentItem 
                        key={`assessment-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/instructor/courses/${courseId}/modules/${module._id}/assessment/${idx}`);
                        }}
                      >
                          <ContentItemIcon type="assessment">
                          <Assignment />
                          </ContentItemIcon>
                          <ContentItemInfo>
                          <ContentItemTitle>Assignment {idx + 1}{assessment.title ? `: ${assessment.title}` : ''}</ContentItemTitle>
                            <ContentItemMeta>
                            {assessment.totalPoints || '20'}pts • Submit Assignment
                            </ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                          <RadioButtonUnchecked />
                          </ContentItemAction>
                        </ContentItem>
                    ))}

                    {/* Step 3: Quizzes - Show after assignments */}
                    {module.quizzes && module.quizzes.map((quiz, idx) => (
                      <ContentItem 
                        key={`quiz-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/instructor/courses/${courseId}/modules/${module._id}/quiz/${idx}`);
                        }}
                      >
                          <ContentItemIcon type="quiz">
                          <Quiz />
                          </ContentItemIcon>
                          <ContentItemInfo>
                          <ContentItemTitle>Quiz {idx + 1}{quiz.title ? `: ${quiz.title}` : ''}</ContentItemTitle>
                            <ContentItemMeta>
                            {quiz.totalPoints || '10'}pts • Take Quiz
                            </ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                          <RadioButtonUnchecked />
                          </ContentItemAction>
                        </ContentItem>
                    ))}

                    {/* Step 4: Discussions - Show last (optional) with deduplication */}
                    {module.discussions && (() => {
                      // Remove duplicate discussions by title
                      const uniqueDiscussions = [];
                      const seenTitles = new Set();
                      
                      module.discussions.forEach(discussion => {
                        if (!seenTitles.has(discussion.title)) {
                          seenTitles.add(discussion.title);
                          uniqueDiscussions.push(discussion);
                        }
                      });
                      
                      return uniqueDiscussions.map((discussion, idx) => (
                        <ContentItem 
                          key={`discussion-${discussion._id || idx}`}
                          onClick={(e) => {
                          e.stopPropagation();
                            navigate(`/instructor/courses/${courseId}/modules/${module._id}/discussion/${idx}`);
                          }}
                        >
                          <ContentItemIcon type="discussion">
                            <Forum />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Discussion {idx + 1}: {discussion.title || `Discussion ${idx + 1}`}</ContentItemTitle>
                            <ContentItemMeta>Participate • Forum Discussion</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                            <RadioButtonUnchecked />
                          </ContentItemAction>
                        </ContentItem>
                      ));
                    })()}

                    {/* Edit Module Item */}
                    <ContentItem onClick={(e) => {
                      e.stopPropagation();
                      handleEditModule(index);
                    }}>
                      <ContentItemIcon type="edit">
                        <Edit />
                      </ContentItemIcon>
                      <ContentItemInfo>
                        <ContentItemTitle>Edit Module</ContentItemTitle>
                        <ContentItemMeta>Modify module content and settings</ContentItemMeta>
                      </ContentItemInfo>
                      <ContentItemAction>
                        <ArrowBack style={{ transform: 'rotate(180deg)' }} />
                      </ContentItemAction>
                    </ContentItem>
                  </ModuleContent>
                )}
              </ModuleCard>
            );
          })}
          </ModulesContent>
        </ModulesSection>
      )}


    </Container>
  );
} 