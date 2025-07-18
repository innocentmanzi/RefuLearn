import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Assessment, AccessTime, CheckCircle, Cancel, Grade } from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

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

const AssessmentInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  background: ${({ color }) => color || '#007BFF'};
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoContent = styled.div`
  h4 {
    margin: 0 0 0.25rem 0;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 600;
  }
  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const ResultCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ScoreDisplay = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: ${({ passed }) => passed ? '#d4edda' : '#f8d7da'};
  border-radius: 12px;
  border: 1px solid ${({ passed }) => passed ? '#c3e6cb' : '#f5c6cb'};
  margin-bottom: 2rem;
  
  h2 {
    margin: 0 0 0.5rem 0;
    color: ${({ passed }) => passed ? '#155724' : '#721c24'};
    font-size: 2rem;
  }
  
  p {
    margin: 0;
    color: ${({ passed }) => passed ? '#155724' : '#721c24'};
    font-weight: 600;
  }
`;

const QuestionReview = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.span`
  background: #007BFF;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const QuestionText = styled.h3`
  color: #374151;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
  flex: 1;
  margin-left: 1rem;
`;

const AnswerStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ correct }) => correct ? '#28a745' : '#dc3545'};
  font-weight: 600;
  font-size: 0.875rem;
`;

const AnswerSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  
  .answer-item {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    
    &.correct {
      background: #d4edda;
      color: #155724;
    }
    
    &.incorrect {
      background: #f8d7da;
      color: #721c24;
    }
    
    &.selected {
      font-weight: 600;
    }
  }
`;

const ActionButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  margin-top: 2rem;

  &:hover {
    background: #0056b3;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #007BFF;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const AssessmentDetailPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessmentDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let assessmentData = null;
        let submissionData = null;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching assessment detail from API...');
            
            // Fetch assessment data
            const assessmentResponse = await fetch(`/api/assessments/${assessmentId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (assessmentResponse.ok) {
              const assessmentApiData = await assessmentResponse.json();
              assessmentData = assessmentApiData.data.assessment;
              console.log('✅ Assessment detail received');
              
              // Store assessment data for offline use
              await offlineIntegrationService.storeAssessmentData(assessmentId, assessmentData);
            } else {
              throw new Error('Failed to fetch assessment detail');
            }

            // Fetch submission data
            const submissionResponse = await fetch(`/api/assessments/${assessmentId}/submission`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (submissionResponse.ok) {
              const submissionApiData = await submissionResponse.json();
              submissionData = submissionApiData.data.submission;
              console.log('✅ Assessment submission received');
              
              // Store submission data for offline use
              await offlineIntegrationService.storeAssessmentSubmission(assessmentId, submissionData);
            } else {
              console.log('No submission found for this assessment');
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            
            // Fall back to offline data if online fails
            assessmentData = await offlineIntegrationService.getAssessmentData(assessmentId);
            submissionData = await offlineIntegrationService.getAssessmentSubmission(assessmentId);
            
            if (!assessmentData) {
              throw onlineError;
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline assessment detail data...');
          assessmentData = await offlineIntegrationService.getAssessmentData(assessmentId);
          submissionData = await offlineIntegrationService.getAssessmentSubmission(assessmentId);
        }

        setAssessment(assessmentData);
        setSubmission(submissionData);

      } catch (err) {
        console.error('❌ Error fetching assessment detail:', err);
        setError(err.message || 'Failed to load assessment detail');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessmentDetail();
    }
  }, [assessmentId]);

  const calculateScore = () => {
    if (!submission || !assessment) return 0;
    
    const totalQuestions = assessment.questions?.length || 0;
    const correctAnswers = assessment.questions?.filter(question => 
      submission.answers[question._id] === question.correctAnswer
    ).length || 0;
    
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const isPassed = () => {
    const score = calculateScore();
    const passingScore = assessment?.passingScore || 70;
    return score >= passingScore;
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading assessment details...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!assessment) {
    return (
      <Container>
        <ErrorMessage>Assessment not found</ErrorMessage>
      </Container>
    );
  }

  const score = calculateScore();
  const passed = isPassed();

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowBack />
          Back
        </BackButton>
        <Title>{assessment.title}</Title>
        <AssessmentInfo>
          <InfoCard>
            <IconWrapper>
              <Assessment />
            </IconWrapper>
            <InfoContent>
              <h4>Questions</h4>
              <p>{assessment.questions?.length || 0} questions</p>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <IconWrapper>
              <AccessTime />
            </IconWrapper>
            <InfoContent>
              <h4>Duration</h4>
              <p>{assessment.duration || 'No time limit'}</p>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <IconWrapper color={passed ? '#28a745' : '#dc3545'}>
              <Grade />
            </IconWrapper>
            <InfoContent>
              <h4>Passing Score</h4>
              <p>{assessment.passingScore || 70}%</p>
            </InfoContent>
          </InfoCard>
        </AssessmentInfo>
      </Header>

      {submission && (
        <ResultCard>
          <ResultHeader>
            <h2>Your Results</h2>
            <AnswerStatus correct={passed}>
              {passed ? <CheckCircle /> : <Cancel />}
              {passed ? 'Passed' : 'Failed'}
            </AnswerStatus>
          </ResultHeader>
          
          <ScoreDisplay passed={passed}>
            <h2>{score}%</h2>
            <p>Your Score</p>
          </ScoreDisplay>
          
          <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
          <p><strong>Correct Answers:</strong> {assessment.questions?.filter(q => 
            submission.answers[q._id] === q.correctAnswer
          ).length || 0} out of {assessment.questions?.length || 0}</p>
        </ResultCard>
      )}

      {/* Question Review */}
      {submission && assessment.questions?.map((question, index) => {
        const userAnswer = submission.answers[question._id];
        const correctAnswer = question.correctAnswer;
        const isCorrect = userAnswer === correctAnswer;
        
        return (
          <QuestionReview key={question._id || index}>
            <QuestionHeader>
              <QuestionNumber>{index + 1}</QuestionNumber>
              <QuestionText>{question.question}</QuestionText>
              <AnswerStatus correct={isCorrect}>
                {isCorrect ? <CheckCircle /> : <Cancel />}
                {isCorrect ? 'Correct' : 'Incorrect'}
              </AnswerStatus>
            </QuestionHeader>
            
            <AnswerSection>
              {question.options?.map((option, optionIndex) => {
                const isSelected = userAnswer === option;
                const isCorrectOption = correctAnswer === option;
                
                return (
                  <div
                    key={optionIndex}
                    className={`answer-item ${isCorrectOption ? 'correct' : ''} ${isSelected && !isCorrectOption ? 'incorrect' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    {isSelected && '→ '}
                    {isCorrectOption && '✓ '}
                    {option}
                  </div>
                );
              })}
            </AnswerSection>
          </QuestionReview>
        );
      })}

      {!submission && (
        <ActionButton onClick={() => navigate(`/courses/${assessment.courseId}/assessment/${assessmentId}`)}>
          <Assessment />
          Take Assessment
        </ActionButton>
      )}
    </Container>
  );
};

export default AssessmentDetailPage; 