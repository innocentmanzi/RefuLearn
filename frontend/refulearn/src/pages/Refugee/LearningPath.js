import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const PathContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const Timeline = styled.div`
  flex: 2;
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
  flex: 1;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
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

const LearningPath = () => {
  const navigate = useNavigate();
  const [pathItems] = useState([
    {
      id: 1,
      title: 'Basic English Communication',
      description: 'Learn essential English communication skills for daily life and work.',
      progress: 100,
      completed: true
    },
    {
      id: 2,
      title: 'Digital Skills Fundamentals',
      description: 'Master basic computer skills and digital literacy for the modern workplace.',
      progress: 60,
      completed: false
    },
    {
      id: 3,
      title: 'Job Search Strategies',
      description: 'Learn effective job search techniques and resume building skills.',
      progress: 0,
      completed: false
    },
    {
      id: 4,
      title: 'Professional Networking',
      description: 'Build your professional network and learn effective networking strategies.',
      progress: 0,
      completed: false
    }
  ]);

  const [stats] = useState({
    overallProgress: 40,
    completedCourses: 1,
    totalCourses: 4,
    nextMilestone: 'Complete Digital Skills Fundamentals'
  });

  return (
    <Container>
      <Title>Your Learning Path</Title>
      
      <PathContainer>
        <Timeline>
          {pathItems.map((item, index) => (
            <TimelineItem key={item.id} completed={item.completed}>
              <TimelineContent>
                <TimelineTitle>{item.title}</TimelineTitle>
                <TimelineDescription>{item.description}</TimelineDescription>
                <ProgressBar>
                  <Progress value={item.progress} />
                </ProgressBar>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  {item.progress}% Complete
                </div>
                {item.progress < 100 && (
                  <ActionButton onClick={() => navigate(`/courses/${item.id}`)}>
                    Continue Learning
                  </ActionButton>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        <Sidebar>
          <Card>
            <CardTitle>Overall Progress</CardTitle>
            <Stat>{stats.overallProgress}%</Stat>
            <ProgressBar>
              <Progress value={stats.overallProgress} />
            </ProgressBar>
          </Card>

          <Card>
            <CardTitle>Course Completion</CardTitle>
            <Stat>{stats.completedCourses}/{stats.totalCourses}</Stat>
            <StatLabel>Courses Completed</StatLabel>
          </Card>

          <Card>
            <CardTitle>Next Milestone</CardTitle>
            <p style={{ color: '#666', margin: '0 0 1rem 0' }}>{stats.nextMilestone}</p>
            <ActionButton onClick={() => navigate('/courses')}>
              View All Courses
            </ActionButton>
          </Card>
        </Sidebar>
      </PathContainer>
    </Container>
  );
};

export default LearningPath; 