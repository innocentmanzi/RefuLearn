import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
import ContentWrapper from '../../components/ContentWrapper';
import PageContainer from '../../components/PageContainer';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    margin-top: 1.2rem;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }
  @media (max-width: 600px) {
    gap: 1rem;
    margin-top: 1rem;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;

  @media (max-width: 900px) {
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const SubTitle = styled.h2`
  color: #555;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin: 1rem 0;
`;

const Progress = styled.div`
  width: ${props => props.$value}%;
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const Stat = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const QuickAction = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ProgressCard = styled(Card)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: white;

  ${SubTitle}, ${StatLabel} {
    color: rgba(255, 255, 255, 0.9);
  }

  ${QuickAction} {
    background: rgba(255, 255, 255, 0.2);
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const WelcomeText = styled.span`
  display: inline-block;
  min-height: 2.5rem;
`;

const OverviewText = styled.span`
  display: inline-block;
  min-height: 1.5rem;
  color: #666;
  font-size: 1.1rem;
`;

const CourseList = styled.div`
  margin-top: 1rem;
`;

const CourseItem = styled.div`
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

const defaultRecommendedCourses = [
  { _id: 'course_1', id: 1, title: 'Basic English Communication', progress: 60 },
  { _id: 'course_2', id: 2, title: 'Digital Skills Fundamentals', progress: 30 },
  { _id: 'course_3', id: 3, title: 'Job Search Strategies', progress: 0 }
];

const RecommendedCourses = ({ courses, onCourseClick }) => (
  <Card style={{ marginTop: '2rem' }}>
    <SubTitle>Recommended Courses</SubTitle>
    <CourseList>
      {courses.map(course => (
        <CourseItem key={course.id} onClick={() => onCourseClick(course)}>
          <div>
            <div style={{ fontWeight: 'bold' }}>{course.title}</div>
            <ProgressBar style={{ margin: '0.5rem 0' }}>
              <Progress $value={course.progress} />
            </ProgressBar>
          </div>
          <div>{course.progress}%</div>
        </CourseItem>
      ))}
    </CourseList>
  </Card>
);

const RefugeeDashboard = () => {
  const navigate = useNavigate();
  const [isFirstLogin] = useState(false);
  const [userName] = useState('Innocent');
  const [welcomeText, setWelcomeText] = useState('');
  const [overviewText, setOverviewText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isTypingOverview, setIsTypingOverview] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  // Responsive: handle sidebar logout and redirect
  const handleLogout = () => {
    // Clear user data (customize as needed)
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const welcomeMessage = isFirstLogin 
    ? `Welcome ${userName}!`
    : `Welcome back ${userName}!`;

  const overviewMessage = "explore our cutting-edge features designed to revolutionize your skills, finding jobs, peer with mentor, and apply your knowledge";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= welcomeMessage.length) {
        setWelcomeText(welcomeMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        setIsTypingOverview(true);
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [welcomeMessage]);

  useEffect(() => {
    if (!isTypingOverview) return;

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= overviewMessage.length) {
        setOverviewText(overviewMessage.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingOverview(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [isTypingOverview]);

  useEffect(() => {
    db.allDocs({ include_docs: true, startkey: 'course_', endkey: 'course_\ufff0' })
      .then(result => {
        if (result.rows.length === 0) {
          // Initialize with defaults
          defaultRecommendedCourses.forEach(course => db.put(course));
          setRecommendedCourses(defaultRecommendedCourses);
        } else {
          setRecommendedCourses(result.rows.map(row => row.doc));
        }
      });
  }, []);

  const [stats] = useState({
    completedCourses: 3,
    totalCourses: 10,
    certificates: 2,
    assessmentsCompleted: 5,
    learningPathProgress: 35,
    peerLearningSessions: 4,
    jobApplications: 2
  });

  const handleCourseClick = (course) => {
    navigate(`/courses/${course.id}`, { state: course });
  };

  return (
    <ContentWrapper>
      <PageContainer>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Title>
            <span>
              {welcomeText}
              {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
            </span>
          </Title>
          <OverviewText>
            {overviewText}
            {isTypingOverview && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
          </OverviewText>
        </div>
        <DashboardGrid>
          <ProgressCard onClick={() => navigate('/learning-path')}>
            <SubTitle>Learning Path Progress</SubTitle>
            <Stat>{stats.learningPathProgress}%</Stat>
            <ProgressBar>
              <Progress $value={stats.learningPathProgress} />
            </ProgressBar>
            <StatLabel>Continue your learning journey</StatLabel>
          </ProgressCard>

          <ProgressCard onClick={() => navigate('/courses')}>
            <SubTitle>Course Progress</SubTitle>
            <Stat>{stats.completedCourses}/{stats.totalCourses}</Stat>
            <StatLabel>Courses Completed</StatLabel>
            <QuickAction>Browse Courses</QuickAction>
          </ProgressCard>

          <ProgressCard onClick={() => navigate('/certificates')}>
            <SubTitle>Certificates</SubTitle>
            <Stat>{stats.certificates}</Stat>
            <StatLabel>Certificates Earned</StatLabel>
            <QuickAction>View Certificates</QuickAction>
          </ProgressCard>

          <ProgressCard onClick={() => navigate('/peer-learning')}>
            <SubTitle>Peer Learning</SubTitle>
            <Stat>{stats.peerLearningSessions}</Stat>
            <StatLabel>Learning Sessions</StatLabel>
            <QuickAction>Join Session</QuickAction>
          </ProgressCard>

          <ProgressCard onClick={() => navigate('/jobs')}>
            <SubTitle>Job Applications</SubTitle>
            <Stat>{stats.jobApplications}</Stat>
            <StatLabel>Applications Submitted</StatLabel>
            <QuickAction>Browse Jobs</QuickAction>
          </ProgressCard>
        </DashboardGrid>
        <RecommendedCourses courses={recommendedCourses} onCourseClick={handleCourseClick} />
      </PageContainer>
    </ContentWrapper>
  );
};

export default RefugeeDashboard; 