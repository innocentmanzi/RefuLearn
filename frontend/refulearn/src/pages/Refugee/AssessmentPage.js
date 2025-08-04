import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, AccessTime, Assignment, CheckCircle, Send } from '@mui/icons-material';
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
  background: #007BFF;
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

const QuestionContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
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

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AnswerOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e9ecef;
  }

  input[type="radio"] {
    margin: 0;
  }
`;

const SubmitButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
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

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
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

const AssessmentPage = () => {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let assessmentData = null;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching assessment from API...');
            
            const response = await fetch(`/api/courses/${courseId}/assessments/${assessmentId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const assessmentApiData = await response.json();
              assessmentData = assessmentApiData.data.assessment;
              console.log('✅ Assessment data received');
              
              // Store assessment data for offline use
              await offlineIntegrationService.storeAssessmentData(assessmentId, assessmentData);
            } else {
              throw new Error('Failed to fetch assessment');
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            
            // Fall back to offline data if online fails
            assessmentData = await offlineIntegrationService.getAssessmentData(assessmentId);
            
            if (!assessmentData) {
              throw onlineError;
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline assessment data...');
          assessmentData = await offlineIntegrationService.getAssessmentData(assessmentId);
        }

        setAssessment(assessmentData);
        
        // Set up timer if assessment has duration
        if (assessmentData.duration) {
          const duration = parseInt(assessmentData.duration) * 60; // Convert to seconds
          setTimeRemaining(duration);
        }

      } catch (err) {
        console.error('❌ Error fetching assessment:', err);
        setError(err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && assessmentId) {
      fetchAssessment();
    }
  }, [courseId, assessmentId]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      const submissionData = {
        assessmentId,
        courseId,
        answers,
        submittedAt: new Date().toISOString()
      };

      let success = false;

      if (isOnline) {
        try {
          // Try online submission first (preserving existing behavior)
          console.log('🌐 Online mode: Submitting assessment...');
          
          const response = await fetch(`/api/courses/${courseId}/assessments/${assessmentId}/submit`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(submissionData)
          });

          if (response.ok) {
            success = true;
            console.log('✅ Online assessment submission successful');
            
            alert('Assessment submitted successfully!');
            navigate(`/courses/${courseId}`);
          } else {
            throw new Error('Failed to submit assessment');
          }

        } catch (onlineError) {
          console.warn('⚠️ Online submission failed, using offline:', onlineError);
          
          // Fall back to offline submission
          const result = await offlineIntegrationService.submitAssessmentOffline(assessmentId, submissionData);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline assessment submission successful');
            
            alert('Assessment submitted offline! Will sync when online.');
            navigate(`/courses/${courseId}`);
          } else {
            throw new Error('Failed to submit assessment offline');
          }
        }
      } else {
        // Offline assessment submission
        console.log('📴 Offline mode: Submitting assessment offline...');
        const result = await offlineIntegrationService.submitAssessmentOffline(assessmentId, submissionData);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline assessment submission successful');
          
          alert('Assessment submitted offline! Will sync when online.');
          navigate(`/courses/${courseId}`);
        } else {
          throw new Error('Failed to submit assessment offline');
        }
      }

      if (!success) {
        throw new Error('Failed to submit assessment');
      }

    } catch (err) {
      console.error('❌ Error submitting assessment:', err);
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading assessment...</LoadingSpinner>
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

  // Show loading while fetching data
  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading Assessment...</h2>
          <p>Please wait while we load the assessment.</p>
        </div>
      </Container>
    );
  }

  // Show error if assessment failed to load
  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
          <h2>❌ Error Loading Assessment</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate(`/courses/${courseId}/overview`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back to Course
          </button>
        </div>
      </Container>
    );
  }

  // Show message if no assessment data
  if (!assessment) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>❌ Assessment Not Found</h2>
          <p>The assessment you're looking for could not be found.</p>
          <button 
            onClick={() => navigate(`/courses/${courseId}/overview`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back to Course
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/courses/${courseId}/overview`)}>
          <ArrowBack />
          Back to Course
        </BackButton>
        <Title>{assessment.title}</Title>
        <AssessmentInfo>
          <InfoCard>
            <IconWrapper>
              <Assignment />
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
          
          {timeRemaining !== null && (
            <InfoCard>
              <IconWrapper>
                <AccessTime />
              </IconWrapper>
              <InfoContent>
                <h4>Time Remaining</h4>
                <p style={{ color: timeRemaining < 300 ? '#dc3545' : '#6b7280' }}>
                  {formatTime(timeRemaining)}
                </p>
              </InfoContent>
            </InfoCard>
          )}
        </AssessmentInfo>
      </Header>

      {assessment.questions?.map((question, index) => (
        <QuestionContainer key={question._id || index}>
          <QuestionHeader>
            <QuestionNumber>{index + 1}</QuestionNumber>
            <QuestionText>{question.question}</QuestionText>
          </QuestionHeader>
          
          <AnswerOptions>
            {question.options?.map((option, optionIndex) => (
              <AnswerOption key={optionIndex}>
                <input
                  type="radio"
                  name={`question-${question._id || index}`}
                  value={option}
                  onChange={(e) => handleAnswerChange(question._id || index, e.target.value)}
                  checked={answers[question._id || index] === option}
                />
                <span>{option}</span>
              </AnswerOption>
            ))}
          </AnswerOptions>
        </QuestionContainer>
      ))}

      <SubmitButton 
        onClick={handleSubmit} 
        disabled={submitting || Object.keys(answers).length === 0}
      >
        {submitting ? (
          <>Submitting...</>
        ) : (
          <>
            <Send />
            Submit Assessment
          </>
        )}
      </SubmitButton>
    </Container>
  );
};

export default AssessmentPage; 