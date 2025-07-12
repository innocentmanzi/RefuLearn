import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ContentWrapper from '../../components/ContentWrapper';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const PathContainer = styled.div`
  display: flex;
  gap: 2rem;
  width: 100%;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Timeline = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0.2;
  }
  @media (max-width: 900px) {
    width: 100%;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: -2.5rem;
    top: 0.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: ${({ completed, theme }) => completed ? theme.colors.primary : '#ddd'};
    border: 2px solid white;
  }
`;

const TimelineContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const TimelineTitle = styled.h3`
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const TimelineDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  margin: 0.5rem 0;
`;

const Progress = styled.div`
  width: ${props => props.value}%;
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const Sidebar = styled.div`
  width: 340px;
  min-width: 240px;
  @media (max-width: 900px) {
    width: 100%;
    min-width: 0;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
  }
`;

const CardTitle = styled.h3`
  color: #333;
  margin: 0 0 1rem 0;
`;

const Stat = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ActionButton = styled.button`
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
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  cursor: pointer;
`;

const LearningPath = () => {
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch user's learning path
        const pathResponse = await fetch('/api/courses/learning-path', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (pathResponse.ok) {
          const pathData = await pathResponse.json();
          setLearningPath(pathData.data.learningPath || []);
        }

        // Fetch user stats
        const statsResponse = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setUserStats(statsData.data.user || {});
        }

        // Fetch course recommendations
        const recommendationsResponse = await fetch('/api/courses/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          setRecommendations(recommendationsData.data.recommendations || []);
        }

      } catch (err) {
        console.error('Error fetching learning path:', err);
        setError('Failed to load learning path');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPath();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          // Load more content if needed
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handlePathClick = (path) => {
    setSelectedPath(path);
    setShowModal(true);
  };

  const handleStartPath = (path) => {
    if (path.courseId) {
      navigate(`/course/${path.courseId}`);
    }
    setShowModal(false);
  };

  const handleEnrollCourse = async (courseId) => {
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
        alert('Successfully enrolled in course!');
        // Refresh learning path
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading your learning path...</div>
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
      <Container ref={containerRef}>
        <Title>Your Learning Path</Title>

        <PathContainer>
          <Timeline>
            {learningPath.map((path, index) => (
              <TimelineItem key={path._id || index} completed={path.completed}>
                <TimelineContent onClick={() => handlePathClick(path)}>
                  <TimelineTitle>{path.title}</TimelineTitle>
                  <TimelineDescription>{path.description}</TimelineDescription>
                  <ProgressBar>
                    <Progress value={path.progress || 0} />
                  </ProgressBar>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    {path.progress || 0}% Complete
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>

          <Sidebar>
            <Card>
              <CardTitle>Your Progress</CardTitle>
              <Stat>{userStats.completedCourses || 0}</Stat>
              <StatLabel>Courses Completed</StatLabel>
              <Stat>{userStats.totalHours || 0}</Stat>
              <StatLabel>Hours Learned</StatLabel>
              <Stat>{userStats.certificates || 0}</Stat>
              <StatLabel>Certificates Earned</StatLabel>
            </Card>

            <Card>
              <CardTitle>Recommended Courses</CardTitle>
              {recommendations.slice(0, 3).map((course) => (
                <div key={course._id} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{course.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>{course.description}</div>
                  <ActionButton onClick={() => handleEnrollCourse(course._id)}>
                    Enroll
                  </ActionButton>
                </div>
              ))}
            </Card>

            <Card>
              <CardTitle>Quick Actions</CardTitle>
              <ActionButton onClick={() => navigate('/courses')}>
                Browse All Courses
              </ActionButton>
              <ActionButton onClick={() => navigate('/certificates')}>
                View Certificates
              </ActionButton>
              <ActionButton onClick={() => navigate('/profile')}>
                Update Profile
              </ActionButton>
            </Card>
          </Sidebar>
        </PathContainer>

        {showModal && selectedPath && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
              <h2>{selectedPath.title}</h2>
              <p>{selectedPath.description}</p>
              <div style={{ margin: '1rem 0' }}>
                <strong>Progress:</strong> {selectedPath.progress || 0}%
              </div>
              <div style={{ margin: '1rem 0' }}>
                <strong>Duration:</strong> {selectedPath.duration}
              </div>
              <div style={{ margin: '1rem 0' }}>
                <strong>Level:</strong> {selectedPath.level}
              </div>
              <ActionButton onClick={() => handleStartPath(selectedPath)}>
                {selectedPath.completed ? 'Review Course' : 'Start Course'}
              </ActionButton>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default LearningPath; 