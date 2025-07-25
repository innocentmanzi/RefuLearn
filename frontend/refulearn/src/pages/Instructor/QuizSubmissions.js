import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, AccessTime, Person, Grade, CheckCircle, Cancel } from '@mui/icons-material';


const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #007BFF;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f0f9ff;
  }
`;

const Title = styled.h1`
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 600;
`;

const QuizInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
`;

const InfoCard = styled.div`
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const InfoValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #007BFF;
  margin-bottom: 0.25rem;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const SubmissionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SubmissionCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 2rem;
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StudentEmail = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

const ScoreSection = styled.div`
  text-align: right;
`;

const ScoreBadge = styled.div`
  background: ${props => {
    if (props.score >= 80) return '#d4edda';
    if (props.score >= 60) return '#fff3cd';
    return '#f8d7da';
  }};
  color: ${props => {
    if (props.score >= 80) return '#155724';
    if (props.score >= 60) return '#856404';
    return '#721c24';
  }};
  border: 1px solid ${props => {
    if (props.score >= 80) return '#c3e6cb';
    if (props.score >= 60) return '#ffeaa7';
    return '#f5c6cb';
  }};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
`;

const SubmissionDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
`;

const StatusIcon = styled.div`
  color: ${props => {
    if (props.status === 'completed') return '#10b981';
    if (props.status === 'expired') return '#f59e0b';
    return '#6b7280';
  }};
  display: flex;
  align-items: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const EmptyState = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`;

const QuizSubmissions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useUser();
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizSubmissions = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔄 Fetching quiz submissions...');
        
        // Fetch quiz data
        const quizResponse = await fetch(`/api/instructor/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (quizResponse.ok) {
          const quizApiData = await quizResponse.json();
          const quizData = quizApiData.data.quiz;
          console.log('✅ Quiz data received');
          setQuiz(quizData);
        } else {
          throw new Error('Failed to fetch quiz data');
        }

        // Fetch quiz submissions
        const submissionsResponse = await fetch(`/api/instructor/quizzes/${quizId}/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (submissionsResponse.ok) {
          const submissionsApiData = await submissionsResponse.json();
          const submissionsData = submissionsApiData.data.submissions || [];
          console.log('✅ Quiz submissions data received:', submissionsData.length);
          setSubmissions(submissionsData);
        } else {
          throw new Error('Failed to fetch quiz submissions');
        }

      } catch (err) {
        console.error('❌ Error fetching quiz submissions:', err);
        setError(err.message || 'Failed to load quiz submissions');
      } finally {
        setLoading(false);
      }
    };

    if (quizId && token) {
      fetchQuizSubmissions();
    }
  }, [quizId, token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeSpent = (timeSpentMinutes) => {
    if (timeSpentMinutes < 1) {
      return '< 1 min';
    }
    return `${timeSpentMinutes} min`;
  };

  const getStatusText = (status, isExpired) => {
    if (isExpired) return 'Time Expired';
    if (status === 'completed') return 'Completed';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status, isExpired) => {
    if (isExpired) return <Cancel />;
    if (status === 'completed') return <CheckCircle />;
    return <AccessTime />;
  };

  const calculateAverageTime = () => {
    if (submissions.length === 0) return 0;
    const totalTime = submissions.reduce((sum, sub) => sum + sub.timeSpentMinutes, 0);
    return Math.round((totalTime / submissions.length) * 100) / 100;
  };

  const calculateAverageScore = () => {
    if (submissions.length === 0) return 0;
    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
    return Math.round((totalScore / submissions.length) * 100) / 100;
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <div>Loading quiz submissions...</div>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <h3>Error Loading Submissions</h3>
          <p>{error}</p>
          <button onClick={() => {
            const fetchQuizSubmissions = async () => {
              try {
                setLoading(true);
                setError('');
                
                let quizData = null;
                let submissionsData = [];

                console.log('🔄 Fetching quiz submissions...');
                
                // Fetch quiz data
                const quizResponse = await fetch(`/api/instructor/quizzes/${quizId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (quizResponse.ok) {
                  const quizApiData = await quizResponse.json();
                  quizData = quizApiData.data.quiz;
                  console.log('✅ Quiz data received');
                } else {
                  throw new Error('Failed to fetch quiz data');
                }

                // Fetch quiz submissions
                const submissionsResponse = await fetch(`/api/instructor/quizzes/${quizId}/submissions`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (submissionsResponse.ok) {
                  const submissionsApiData = await submissionsResponse.json();
                  submissionsData = submissionsApiData.data.submissions || [];
                  console.log('✅ Quiz submissions data received:', submissionsData.length);
                } else {
                  throw new Error('Failed to fetch quiz submissions');
                }

                setQuiz(quizData);
                setSubmissions(submissionsData);

              } catch (err) {
                console.error('❌ Error fetching quiz submissions:', err);
                setError(err.message || 'Failed to load quiz submissions');
              } finally {
                setLoading(false);
              }
            };
            fetchQuizSubmissions();
          }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Try Again
          </button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowBack />
          Back to Quizzes
        </BackButton>
        
        <Title>Quiz Submissions: {quiz?.title}</Title>
        
        <QuizInfo>
          <InfoCard>
            <InfoValue>{submissions.length}</InfoValue>
            <InfoLabel>Total Submissions</InfoLabel>
          </InfoCard>
          <InfoCard>
            <InfoValue>{calculateAverageScore()}%</InfoValue>
            <InfoLabel>Average Score</InfoLabel>
          </InfoCard>
          <InfoCard>
            <InfoValue>{formatTimeSpent(calculateAverageTime())}</InfoValue>
            <InfoLabel>Average Time</InfoLabel>
          </InfoCard>
        </QuizInfo>
      </Header>

      {submissions.length === 0 ? (
        <EmptyState>
          <h3>No Submissions Yet</h3>
          <p>Students haven't submitted this quiz yet. Check back later!</p>
        </EmptyState>
      ) : (
        <SubmissionsList>
          {submissions.map((submission) => (
            <SubmissionCard key={submission.sessionId}>
              <SubmissionHeader>
                <StudentInfo>
                  <StudentName>
                    <Person />
                    {submission.student.firstName} {submission.student.lastName}
                  </StudentName>
                  <StudentEmail>{submission.student.email}</StudentEmail>
                </StudentInfo>
                
                <ScoreSection>
                  <ScoreBadge score={submission.score}>
                    {submission.score}%
                  </ScoreBadge>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {submission.score >= 70 ? 'PASSED' : 'FAILED'}
                  </div>
                </ScoreSection>
              </SubmissionHeader>

              <SubmissionDetails>
                <DetailItem>
                  <AccessTime />
                  <strong>Time Spent:</strong> {formatTimeSpent(submission.timeSpentMinutes)}
                </DetailItem>
                
                <DetailItem>
                  <StatusIcon status={submission.status}>
                    {getStatusIcon(submission.status, submission.isExpired)}
                  </StatusIcon>
                  <strong>Status:</strong> {getStatusText(submission.status, submission.isExpired)}
                </DetailItem>
                
                <DetailItem>
                  <Grade />
                  <strong>Submitted:</strong> {formatDate(submission.submittedAt)}
                </DetailItem>
                
                <DetailItem>
                  <CheckCircle />
                  <strong>Started:</strong> {formatDate(submission.startTime)}
                </DetailItem>
              </SubmissionDetails>
            </SubmissionCard>
          ))}
        </SubmissionsList>
      )}
    </Container>
  );
};

export default QuizSubmissions; 