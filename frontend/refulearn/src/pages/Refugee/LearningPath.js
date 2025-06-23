import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
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

const Section = styled.div`
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
  }
`;

const allCourses = [
  {
    id: 1,
    title: 'Basic English Communication',
    description: 'Learn essential English communication skills for daily life and work.'
  },
  {
    id: 2,
    title: 'Digital Skills Fundamentals',
    description: 'Master basic computer skills and digital literacy for the modern workplace.'
  },
  {
    id: 3,
    title: 'Job Search Strategies',
    description: 'Learn effective job search techniques and resume building skills.'
  },
  {
    id: 4,
    title: 'Professional Networking',
    description: 'Build your professional network and learn effective networking strategies.'
  }
];

const LearningPath = () => {
  const navigate = useNavigate();
  const [pathItems, setPathItems] = useState(allCourses.map(c => ({ ...c, progress: 0, completed: false })));
  const [stats, setStats] = useState({ overallProgress: 0, completedCourses: 0, totalCourses: allCourses.length, nextMilestone: '' });
  const [activeIdx, setActiveIdx] = useState(0);
  const itemRefs = useRef([]);
  const [showCertificates, setShowCertificates] = useState(false);

  // Fetch progress from PouchDB
  useEffect(() => {
    Promise.all(
      allCourses.map(async (course) => {
        try {
          const doc = await db.get(`progress_currentUser_${course.id}`);
          let progress = 0;
          if (doc.completedModules && Array.isArray(doc.completedModules)) {
            // Assume 50% for modules, 25% for videos, 25% for quiz
            progress += (doc.completedModules.length / 4) * 50;
          }
          if (doc.watchedVideos && Array.isArray(doc.watchedVideos)) {
            progress += (doc.watchedVideos.length / 2) * 25;
          }
          if (doc.quizCompleted) progress += 25;
          progress = Math.round(progress);
          return { ...course, progress, completed: progress === 100 };
        } catch {
          return { ...course, progress: 0, completed: false };
        }
      })
    ).then(items => {
      setPathItems(items);
      const completedCourses = items.filter(i => i.completed).length;
      const overallProgress = Math.round(items.reduce((acc, i) => acc + i.progress, 0) / items.length);
      const nextMilestone = items.find(i => !i.completed)?.title ? `Complete ${items.find(i => !i.completed).title}` : 'All courses completed!';
      setStats({ overallProgress, completedCourses, totalCourses: items.length, nextMilestone });
    });
  }, []);

  // Scroll/active timeline logic
  useEffect(() => {
    const handleScroll = () => {
      const offsets = itemRefs.current.map(ref => ref?.getBoundingClientRect().top || 0);
      const idx = offsets.findIndex(offset => offset > 80);
      setActiveIdx(idx === -1 ? itemRefs.current.length - 1 : Math.max(0, idx - 1));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCircleClick = idx => {
    itemRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveIdx(idx);
  };

  const completedCourses = pathItems.filter(i => i.completed);

  return (
    <ContentWrapper>
      <Container>
        <Title>Your Learning Path</Title>
        <PathContainer>
          <Timeline>
            {pathItems.map((item, index) => (
              <TimelineItem
                key={item.id}
                completed={item.completed}
                style={{ zIndex: activeIdx === index ? 2 : 1 }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.5rem',
                    top: '0.5rem',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '50%',
                    background: activeIdx === index ? '#3498db' : (item.completed ? '#27ae60' : '#ddd'),
                    border: '2px solid white',
                    cursor: 'pointer',
                    boxShadow: activeIdx === index ? '0 0 0 4px #eaf6fb' : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => handleCircleClick(index)}
                />
                <TimelineContent ref={el => (itemRefs.current[index] = el)}>
                  <TimelineTitle>{item.title}</TimelineTitle>
                  <TimelineDescription>{item.description}</TimelineDescription>
                  <ProgressBar>
                    <Progress value={item.progress} />
                  </ProgressBar>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {item.progress}% Complete
                  </div>
                  {item.progress < 100 && (
                    <ActionButton onClick={() => navigate(`/courses/full/${item.id}`, { state: item })}>
                      Continue Learning
                    </ActionButton>
                  )}
                  {item.progress === 100 && (
                    <div style={{ color: '#27ae60', fontWeight: 600, marginTop: 8 }}>Certificate Earned!</div>
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
            <Card
              style={{ cursor: completedCourses.length > 0 ? 'pointer' : 'default', opacity: completedCourses.length > 0 ? 1 : 0.7 }}
              onClick={() => completedCourses.length > 0 && setShowCertificates(true)}
              tabIndex={0}
              aria-label="View earned certificates"
            >
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
        {showCertificates && (
          <ModalOverlay>
            <ModalContent>
              <CloseButton onClick={() => setShowCertificates(false)}>&times;</CloseButton>
              <h2>Certificates Earned</h2>
              {completedCourses.length === 0 ? (
                <div>No certificates earned yet.</div>
              ) : (
                <ul style={{ paddingLeft: 0, listStyle: 'none', marginTop: 24 }}>
                  {completedCourses.map(course => (
                    <li key={course.id} style={{ marginBottom: 16, fontWeight: 500, color: '#3498db' }}>
                      {course.title}
                    </li>
                  ))}
                </ul>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default LearningPath; 