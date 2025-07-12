import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Description, 
  VideoLibrary, 
  Assignment, 
  Quiz, 
  Forum,
  Schedule,
  CheckCircle,
  PlayCircle,
  Link as LinkIcon,
  ArrowForward,
  AccessTime,
  Star
} from '@mui/icons-material';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ModuleTitle = styled.h1`
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
`;

const ModuleDescription = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ItemsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  background: white;
  
  &:hover {
    border-color: #007BFF;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    transform: translateY(-1px);
  }
`;

const ItemIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => {
    switch(props.type) {
      case 'video': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      case 'content': return 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
      case 'quiz': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      case 'assessment': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'resource': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'discussion': return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.h3`
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ItemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => {
    switch(props.status) {
      case 'completed': return '#dcfce7';
      case 'submitted': return '#dbeafe';
      case 'overdue': return '#fee2e2';
      case 'available': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'completed': return '#166534';
      case 'submitted': return '#1e40af';
      case 'overdue': return '#dc2626';
      case 'available': return '#374151';
      default: return '#374151';
    }
  }};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => {
    switch(props.action) {
      case 'take': return '#007BFF';
      case 'view': return '#10b981';
      case 'resume': return '#f59e0b';
      case 'retake': return '#8b5cf6';
      default: return '#6b7280';
    }
  }};
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

function ModuleOverview() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'refugee');
    
    fetchCourseAndModule();
  }, [courseId, moduleId]);

  const fetchCourseAndModule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.course) {
          const courseData = data.data.course;
          setCourse(courseData);
          
          const foundModule = courseData.modules.find(m => m._id === moduleId);
          if (foundModule) {
            setModule(foundModule);
          } else {
            setError('Module not found');
          }
        } else {
          setError('Course not found');
        }
      } else {
        setError('Failed to load course');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item, index) => {
    switch (item.type) {
      case 'content':
        navigate(`/instructor/courses/${courseId}/modules/${moduleId}/content`);
        break;
      case 'video':
        navigate(`/instructor/courses/${courseId}/modules/${moduleId}/video`);
        break;
      case 'quiz':
        navigate(`/instructor/courses/${courseId}/modules/${moduleId}/quiz/${index}`);
        break;
      case 'assessment':
        navigate(`/instructor/courses/${courseId}/modules/${moduleId}/assessment/${index}`);
        break;
      case 'discussion':
        navigate(`/instructor/courses/${courseId}/modules/${moduleId}/discussion/${index}`);
        break;
      case 'resource':
        if (item.url) {
          window.open(item.url, '_blank');
        }
        break;
      default:
        console.log('Unknown item type:', item.type);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'content': return <Description />;
      case 'video': return <VideoLibrary />;
      case 'quiz': return <Quiz />;
      case 'assessment': return <Assignment />;
      case 'discussion': return <Forum />;
      case 'resource': return <LinkIcon />;
      default: return <Description />;
    }
  };

  const getItemStatus = (item) => {
    // This would normally come from user progress data
    // For now, we'll use placeholder logic
    if (item.type === 'quiz' || item.type === 'assessment') {
      return 'available'; // Could be 'completed', 'submitted', 'overdue'
    }
    return 'available';
  };

  const getActionButton = (item, index) => {
    const status = getItemStatus(item);
    
    if (item.type === 'quiz' || item.type === 'assessment') {
      switch (status) {
        case 'completed':
          return (
            <ActionButton action="view" onClick={(e) => {
              e.stopPropagation();
              handleItemClick(item, index);
            }}>
              <CheckCircle style={{ fontSize: '1rem' }} />
              View Results
            </ActionButton>
          );
        case 'submitted':
          return (
            <ActionButton action="view" onClick={(e) => {
              e.stopPropagation();
              handleItemClick(item, index);
            }}>
              View Submission
            </ActionButton>
          );
        default:
          return (
            <ActionButton action="take" onClick={(e) => {
              e.stopPropagation();
              handleItemClick(item, index);
            }}>
              <PlayCircle style={{ fontSize: '1rem' }} />
              {item.type === 'quiz' ? 'Take Quiz' : 'Take Assessment'}
            </ActionButton>
          );
      }
    }
    
    if (item.type === 'video') {
      return (
        <ActionButton action="view" onClick={(e) => {
          e.stopPropagation();
          handleItemClick(item, index);
        }}>
          <PlayCircle style={{ fontSize: '1rem' }} />
          Watch
        </ActionButton>
      );
    }
    
    return (
      <ActionButton action="view" onClick={(e) => {
        e.stopPropagation();
        handleItemClick(item, index);
      }}>
        <ArrowForward style={{ fontSize: '1rem' }} />
        Open
      </ActionButton>
    );
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div>Loading module...</div>
        </div>
      </Container>
    );
  }

  if (error || !course || !module) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
          <div>{error || 'Module not found'}</div>
        </div>
      </Container>
    );
  }

  // Build content items
  const contentItems = [];
  
  if (module.content) {
    contentItems.push({
      type: 'content',
      title: 'Reading Materials',
      description: 'Course content and materials',
      action: 'View'
    });
  }
  
  if (module.videoUrl) {
    contentItems.push({
      type: 'video',
      title: module.videoTitle || 'Video Lecture',
      description: 'Watch the video content',
      duration: '15m 10s', // This would come from actual video data
      action: 'Watch'
    });
  }
  
  // Count assessments and quizzes for proper numbering
  let assessmentCount = 0;
  let quizCount = 0;
  
  if (module.assessments) {
    module.assessments.forEach((assessment, idx) => {
      assessmentCount++;
      contentItems.push({
        type: 'assessment',
        title: assessment.title || `Assessment ${assessmentCount}`,
        description: assessment.description || 'Complete the assessment',
        points: assessment.totalPoints || assessment.points || '20pts',
        dueDate: assessment.dueDate || '12 April', // Default due date for demo
        timeLimit: assessment.timeLimit || 30,
        questions: assessment.questions?.length || 5
      });
    });
  }
  
  if (module.quizzes) {
    module.quizzes.forEach((quiz, idx) => {
      quizCount++;
      contentItems.push({
        type: 'quiz',
        title: `Quiz ${quizCount}${quiz.title ? `: ${quiz.title}` : ''}`,
        description: quiz.description || 'Take the quiz',
        points: quiz.totalPoints || quiz.points || '10pts',
        dueDate: quiz.dueDate || '15 April', // Default due date for demo
        timeLimit: quiz.timeLimit || 15,
        questions: quiz.questions?.length || 3
      });
    });
  }
  
  if (module.discussions) {
    module.discussions.forEach((discussion, idx) => {
      contentItems.push({
        type: 'discussion',
        title: discussion.title || `Discussion ${idx + 1}`,
        description: 'Participate in the discussion',
        action: 'Participate'
      });
    });
  }
  
  if (module.resources) {
    module.resources.forEach((resource, idx) => {
      contentItems.push({
        type: 'resource',
        title: resource.title || `Resource ${idx + 1}`,
        description: resource.description || 'External resource',
        url: resource.url,
        action: 'Open'
      });
    });
  }

  return (
    <Container>
      <Header>
        <ModuleTitle>{module.title}</ModuleTitle>
        <ModuleDescription>
          {module.description || 'Complete all activities in this module to progress through the course.'}
        </ModuleDescription>
      </Header>

      <ContentSection>
        <SectionTitle>
          <Schedule />
          Module Activities ({contentItems.length} items)
        </SectionTitle>
        
        {contentItems.length > 0 ? (
          <ItemsGrid>
            {contentItems.map((item, index) => (
              <ItemCard key={index} onClick={() => handleItemClick(item, index)}>
                <ItemIcon type={item.type}>
                  {getItemIcon(item.type)}
                </ItemIcon>
                
                                 <ItemContent>
                   <ItemTitle>{item.title}</ItemTitle>
                   <ItemMeta>
                     {item.points && (
                       <MetaItem>
                         <Star style={{ fontSize: '1rem' }} />
                         {item.points}
                       </MetaItem>
                     )}
                     {item.dueDate && (
                       <MetaItem>
                         <Schedule style={{ fontSize: '1rem' }} />
                         {item.dueDate}
                       </MetaItem>
                     )}
                     {item.timeLimit && (
                       <MetaItem>
                         <AccessTime style={{ fontSize: '1rem' }} />
                         {item.timeLimit} minutes
                       </MetaItem>
                     )}
                     {item.questions && item.questions > 0 && (
                       <MetaItem>
                         <Quiz style={{ fontSize: '1rem' }} />
                         {item.questions} Question{item.questions !== 1 ? 's' : ''}
                       </MetaItem>
                     )}
                     {item.duration && (
                       <MetaItem>
                         <AccessTime style={{ fontSize: '1rem' }} />
                         {item.duration}
                       </MetaItem>
                     )}
                   </ItemMeta>
                 </ItemContent>
                
                <ItemStatus status={getItemStatus(item)}>
                  {getItemStatus(item) === 'completed' && <CheckCircle style={{ fontSize: '1rem' }} />}
                  {getItemStatus(item) === 'completed' ? 'Completed' : 'Available'}
                </ItemStatus>
                
                {getActionButton(item, index)}
              </ItemCard>
            ))}
          </ItemsGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>📚</EmptyIcon>
            <h3>No content available</h3>
            <p>This module doesn't have any content yet.</p>
          </EmptyState>
        )}
      </ContentSection>
    </Container>
  );
}

export default ModuleOverview; 