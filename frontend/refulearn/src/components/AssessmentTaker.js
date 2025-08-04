import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Timer, CheckCircle, Cancel, ArrowBack } from '@mui/icons-material';
import offlineIntegrationService from '../services/offlineIntegrationService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #f4f8fb;
  min-height: 100vh;
`;

const AssessmentHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Title = styled.h1`
  color: #007BFF;
  margin-bottom: 1rem;
`;

const TimerDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff3cd;
  color: #856404;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const QuestionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const QuestionNumber = styled.div`
  color: #007BFF;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const QuestionText = styled.h3`
  color: #333;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const OptionContainer = styled.div`
  margin-bottom: 1rem;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #007BFF;
    background: #f8f9ff;
  }
  
  ${({ selected }) => selected && `
    border-color: #007BFF;
    background: #f8f9ff;
  `}
`;

const OptionInput = styled.input`
  margin: 0;
`;

const OptionText = styled.span`
  flex: 1;
  color: #333;
`;

const TextAnswerInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  background: ${({ color }) => color || '#007BFF'};
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
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ScoreDisplay = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ScoreCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ percentage }) => 
    percentage >= 80 ? '#4caf50' : 
    percentage >= 60 ? '#ff9800' : '#f44336'
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1rem;
`;

const ResultItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuestionResult = styled.div`
  margin-bottom: 0.5rem;
`;

const AnswerResult = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

export default function AssessmentTaker({ assessmentId, onClose }) {
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && assessment && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, assessment]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let assessmentData = null;

      if (isOnline) {
        try {
          // Try online assessment fetch first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching assessment...');
          
          const response = await fetch(`/api/courses/assessments/${assessmentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            assessmentData = data.data.assessment;
            console.log('✅ Online assessment fetch successful');
            
            // Store assessment for offline use
            await offlineIntegrationService.storeAssessment(assessmentId, assessmentData);
            
            setAssessment(assessmentData);
            setTimeLeft(assessmentData.timeLimit * 60); // Convert minutes to seconds
          } else {
            throw new Error('Failed to fetch assessment online');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online assessment fetch failed, using offline:', onlineError);
          // Fall back to offline assessment
          assessmentData = await offlineIntegrationService.getAssessment(assessmentId);
          
          if (assessmentData) {
            console.log('✅ Offline assessment fetch successful');
            setAssessment(assessmentData);
            setTimeLeft(assessmentData.timeLimit * 60);
          } else {
            throw new Error('Assessment not available offline');
          }
        }
      } else {
        // Offline assessment fetch
        console.log('📴 Offline mode: Fetching assessment offline...');
        assessmentData = await offlineIntegrationService.getAssessment(assessmentId);
        
        if (assessmentData) {
          console.log('✅ Offline assessment fetch successful');
          setAssessment(assessmentData);
          setTimeLeft(assessmentData.timeLimit * 60);
        } else {
          throw new Error('Assessment not available offline');
        }
      }

      if (!assessmentData) {
        alert('Failed to load assessment');
      }

    } catch (err) {
      console.error('❌ Error fetching assessment:', err);
      alert('Failed to load assessment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const answersArray = assessment.questions.map((_, index) => answers[index] || '');
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let success = false;

      const submissionData = {
        answers: answersArray,
        timeSpent,
        submittedAt: new Date().toISOString()
      };

      if (isOnline) {
        try {
          // Try online submission first (preserving existing behavior)
          console.log('🌐 Online mode: Submitting assessment...');
          
          const response = await fetch(`/api/courses/assessments/${assessmentId}/submit`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(submissionData)
          });

          if (response.ok) {
            const data = await response.json();
            success = true;
            console.log('✅ Online assessment submission successful');
            
            setResults(data.data);
            setIsSubmitted(true);
          } else {
            throw new Error('Failed to submit assessment online');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online assessment submission failed, using offline:', onlineError);
          // Fall back to offline submission
          const result = await offlineIntegrationService.submitAssessmentOffline(assessmentId, submissionData);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline assessment submission successful');
            
            setResults(result.data || { score: 0, totalQuestions: assessment.questions.length, message: 'Assessment submitted offline' });
            setIsSubmitted(true);
            alert('Assessment submitted offline! Results will be available when online.');
          } else {
            throw new Error('Failed to submit assessment offline');
          }
        }
      } else {
        // Offline submission
        console.log('📴 Offline mode: Submitting assessment offline...');
        const result = await offlineIntegrationService.submitAssessmentOffline(assessmentId, submissionData);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline assessment submission successful');
          
          setResults(result.data || { score: 0, totalQuestions: assessment.questions.length, message: 'Assessment submitted offline' });
          setIsSubmitted(true);
          alert('Assessment submitted offline! Results will be available when online.');
        } else {
          throw new Error('Failed to submit assessment offline');
        }
      }

      if (!success) {
        throw new Error('Failed to submit assessment');
      }

    } catch (err) {
      console.error('❌ Assessment submission error:', err);
      alert('Failed to submit assessment: ' + err.message);
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
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading assessment...
        </div>
      </Container>
    );
  }

  if (!assessment) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          Assessment not found
        </div>
      </Container>
    );
  }

  if (isSubmitted && results) {
    const percentage = Math.round((results.score / results.totalPoints) * 100);
    
    return (
      <Container>
        <ResultsContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <Title>Assessment Results</Title>
            <Button onClick={onClose} color="#6c757d">
              <ArrowBack /> Back to Course
            </Button>
          </div>
          
          <ScoreDisplay>
            <ScoreCircle percentage={percentage}>
              {percentage}%
            </ScoreCircle>
            <h2>Your Score: {results.score} / {results.totalPoints}</h2>
            <p>Time Spent: {formatTime(results.timeSpent)}</p>
          </ScoreDisplay>

          <h3 style={{ color: '#007BFF', marginBottom: '1rem' }}>Question Review</h3>
          {results.results.map((result, index) => (
            <ResultItem key={index}>
              <QuestionResult>
                <strong>Q{index + 1}: {assessment.questions[index].question}</strong>
              </QuestionResult>
              <AnswerResult>
                {result.isCorrect ? (
                  <CheckCircle style={{ color: '#4caf50' }} />
                ) : (
                  <Cancel style={{ color: '#f44336' }} />
                )}
                <span>
                  Your answer: <strong>{result.userAnswer}</strong>
                  {!result.isCorrect && (
                    <span> | Correct answer: <strong>{result.correctAnswer}</strong></span>
                  )}
                </span>
              </AnswerResult>
              {result.explanation && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <strong>Explanation:</strong> {result.explanation}
                </div>
              )}
            </ResultItem>
          ))}
        </ResultsContainer>
      </Container>
    );
  }

  const currentQ = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <Container>
      <AssessmentHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title>{assessment.title}</Title>
          <Button onClick={onClose} color="#6c757d">
            <ArrowBack /> Exit
          </Button>
        </div>
        
        <TimerDisplay>
          <Timer />
          Time Remaining: {formatTime(timeLeft)}
        </TimerDisplay>
        
        <div style={{ background: '#e9ecef', borderRadius: '8px', height: '8px', marginBottom: '1rem' }}>
          <div style={{ 
            background: '#007BFF', 
            height: '100%', 
            borderRadius: '8px', 
            width: `${progress}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Question {currentQuestion + 1} of {assessment.questions.length}
        </div>
      </AssessmentHeader>

      <QuestionCard>
        <QuestionNumber>Question {currentQuestion + 1}</QuestionNumber>
        <QuestionText>{currentQ.question}</QuestionText>

        {currentQ.type === 'multiple_choice' && (
          <div>
            {currentQ.options.map((option, index) => (
              <OptionContainer key={index}>
                <OptionLabel selected={answers[currentQuestion] === index}>
                  <OptionInput
                    type="radio"
                    name={`question_${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerChange(currentQuestion, index)}
                  />
                  <OptionText>{option}</OptionText>
                </OptionLabel>
              </OptionContainer>
            ))}
          </div>
        )}

        {currentQ.type === 'short_answer' && (
          <TextAnswerInput
            value={answers[currentQuestion] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
            placeholder="Type your answer here..."
          />
        )}

        {currentQ.type === 'true_false' && (
          <div>
            <OptionContainer>
              <OptionLabel selected={answers[currentQuestion] === 'true'}>
                <OptionInput
                  type="radio"
                  name={`question_${currentQuestion}`}
                  value="true"
                  checked={answers[currentQuestion] === 'true'}
                  onChange={() => handleAnswerChange(currentQuestion, 'true')}
                />
                <OptionText>True</OptionText>
              </OptionLabel>
            </OptionContainer>
            <OptionContainer>
              <OptionLabel selected={answers[currentQuestion] === 'false'}>
                <OptionInput
                  type="radio"
                  name={`question_${currentQuestion}`}
                  value="false"
                  checked={answers[currentQuestion] === 'false'}
                  onChange={() => handleAnswerChange(currentQuestion, 'false')}
                />
                <OptionText>False</OptionText>
              </OptionLabel>
            </OptionContainer>
          </div>
        )}

        <NavigationButtons>
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            color="#6c757d"
          >
            Previous
          </Button>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {currentQuestion === assessment.questions.length - 1 ? (
              <Button onClick={handleSubmit} color="#28a745">
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(Math.min(assessment.questions.length - 1, currentQuestion + 1))}
              >
                Next
              </Button>
            )}
          </div>
        </NavigationButtons>
      </QuestionCard>
    </Container>
  );
} 