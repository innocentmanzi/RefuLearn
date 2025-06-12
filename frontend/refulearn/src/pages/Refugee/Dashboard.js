import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
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

const WelcomeMessage = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  min-height: 2rem;
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

const RefugeeDashboard = () => {
  const navigate = useNavigate();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [userName] = useState('Innocent');
  const [welcomeText, setWelcomeText] = useState('');
  const [overviewText, setOverviewText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isTypingOverview, setIsTypingOverview] = useState(false);

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

  const [stats] = useState({
    completedCourses: 3,
    totalCourses: 10,
    certificates: 2,
    assessmentsCompleted: 5,
    learningPathProgress: 35,
    peerLearningSessions: 4,
    jobApplications: 2
  });

  const [recommendedCourses] = useState([
    { id: 1, title: 'Basic English Communication', progress: 60 },
    { id: 2, title: 'Digital Skills Fundamentals', progress: 30 },
    { id: 3, title: 'Job Search Strategies', progress: 0 }
  ]);

  return (
    <Container>
      <Title>
        <WelcomeText>
          {welcomeText}
          {isTyping && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
        </WelcomeText>
      </Title>

      <WelcomeMessage>
        <OverviewText>
          {overviewText}
          {isTypingOverview && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
        </OverviewText>
      </WelcomeMessage>
      
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

        <ProgressCard onClick={() => navigate('/assessments')}>
          <SubTitle>Assessments</SubTitle>
          <Stat>{stats.assessmentsCompleted}</Stat>
          <StatLabel>Completed Assessments</StatLabel>
          <QuickAction>Take Assessment</QuickAction>
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

      <Card style={{ marginTop: '2rem' }}>
        <SubTitle>Recommended Courses</SubTitle>
        <CourseList>
          {recommendedCourses.map(course => (
            <CourseItem key={course.id} onClick={() => navigate(`/courses/${course.id}`)}>
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
    </Container>
  );
};

export default RefugeeDashboard; 