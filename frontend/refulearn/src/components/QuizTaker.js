import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Quiz, 
  CheckCircle, 
  RadioButtonUnchecked, 
  CheckBox, 
  CheckBoxOutlineBlank,
  AccessTime,
  Assignment,
  Send
} from '@mui/icons-material';

const QuizContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const QuizHeader = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const QuizTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
`;

const QuizHeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuizInfo = styled.div`
  flex: 1;
`;

const QuizNumber = styled.div`
  background: #007BFF;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const QuizDescription = styled.div`
  color: #6b7280;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
`;

const QuizStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const QuizMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  font-size: 0.9375rem;
  opacity: 0.9;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuizBody = styled.div`
  padding: 2rem;
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const QuestionNumber = styled.div`
  background: #007BFF;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const QuestionText = styled.h3`
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.6;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 2px solid ${props => props.selected ? '#007BFF' : '#e5e7eb'};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    border-color: ${props => props.disabled ? '#e5e7eb' : '#007BFF'};
    background: ${props => props.disabled ? 'white' : '#f8faff'};
  }
`;

const OptionText = styled.span`
  flex: 1;
  color: #374151;
  font-size: 0.9375rem;
`;

const TextAnswerInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9375rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const QuizActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

const ProgressInfo = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.primary ? '#007BFF' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#6b7280'};
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#0056b3' : '#f3f4f6'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const ScoreDisplay = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const ScoreText = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ScoreLabel = styled.div`
  font-size: 1.125rem;
  opacity: 0.9;
`;

const EditModeContainer = styled.div`
  padding: 2rem;
  background: #fff7ed;
  border: 2px solid #fb923c;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const EditModeText = styled.div`
  color: #ea580c;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const EditButton = styled.button`
  background: #ea580c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
`;

function QuizTaker({ quiz, userRole, onEdit, onComplete, quizNumber = 1 }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  
  // Timer states
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // CRITICAL DEBUG: Check what userRole QuizTaker receives
  console.log('🔍 QUIZTAKER RECEIVED PROPS:', {
    userRole,
    userRoleType: typeof userRole,
    isRefugee: userRole === 'refugee',
    quizTitle: quiz?.title,
    hasQuestions: !!quiz?.questions,
    questionCount: quiz?.questions?.length
  });

  // Check for existing submissions
  const checkSubmissionStatus = async () => {
    if (!quiz?._id) {
      console.log('❌ No quiz ID available for submission check');
      setCheckingSubmission(false);
      return;
    }
    
    console.log('🔍 Checking submission status for:', {
      assessmentId: quiz._id,
      courseId: quiz.courseId,
      moduleId: quiz.moduleId
    });
    
    try {
      const token = localStorage.getItem('token');
      const url = `/api/courses/${quiz.courseId}/submissions?assessmentId=${quiz._id}`;
      console.log('🔍 Submission check URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📋 Submission check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Submission check data:', data);
        
        if (data.success && data.data.submissions && data.data.submissions.length > 0) {
          console.log('✅ Found existing submission:', data.data.submissions[0]);
          setAlreadySubmitted(true);
          setSubmissionData(data.data.submissions[0]); // Get the first submission
        } else {
          console.log('📋 No submissions found for this assessment');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error checking submission status:', error);
    } finally {
      setCheckingSubmission(false);
    }
  };

  // Check for existing quiz session
  const checkQuizSession = async () => {
    if (!quiz?._id || userRole !== 'refugee') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/quiz-sessions/${quiz._id}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.hasActiveSession) {
          console.log('✅ Found existing quiz session:', data.data);
          setSessionId(data.data.sessionId);
          setQuizStarted(true);
          setTimeRemaining(data.data.timeRemaining);
          setTimerActive(data.data.timeRemaining > 0);
          // Restore previous answers
          if (data.data.answers) {
            setAnswers(data.data.answers);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking quiz session:', error);
    }
  };

  // Debug logging for quiz data
  useEffect(() => {
    console.log('🔍 QuizTaker received quiz data:', quiz);
    console.log('🔍 Quiz questions:', quiz?.questions);
    if (quiz?.questions) {
      quiz.questions.forEach((q, index) => {
        console.log(`🔍 Question ${index + 1}:`, {
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        });
      });
    }
    
    // Check for existing quiz session first
    checkQuizSession();
    
    // Check submission status when component loads
    console.log('🔄 useEffect triggered, calling checkSubmissionStatus');
    checkSubmissionStatus();
  }, [quiz]);

  // Timer effect - starts countdown when quiz is started
  useEffect(() => {
    let timer;
    
    if (timerActive && timeRemaining > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! Auto-submit the quiz
            console.log('⏰ Time is up! Auto-submitting quiz...');
            setTimerActive(false);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeRemaining, submitted]);

  // Start quiz function
  const startQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quiz-sessions/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId: quiz._id,
          courseId: quiz.courseId,
          moduleId: quiz.moduleId,
          duration: parseInt(quiz.duration) || 30
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🚀 Quiz session started:', data.data);
        
        setSessionId(data.data.sessionId);
        setQuizStarted(true);
        setTimeRemaining(data.data.timeRemaining);
        setTimerActive(true);
        
        console.log('🚀 Quiz started! Timer:', quiz?.duration, 'minutes');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to start quiz session:', errorData);
        alert('Failed to start quiz: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error starting quiz session:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Save answers to backend
  const saveAnswersToSession = async (newAnswers) => {
    if (!sessionId) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/quiz-sessions/${sessionId}/answers`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: newAnswers })
      });
    } catch (error) {
      console.error('❌ Error saving answers:', error);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    if (submitted) return;
    
    const newAnswers = {
      ...answers,
      [questionIndex]: answer
    };
    
    setAnswers(newAnswers);
    
    // Save to backend session
    saveAnswersToSession(newAnswers);
  };

  const handleSubmit = async () => {
    if (loading || submitted) return;
    
    setLoading(true);
    try {
      if (sessionId) {
        // Submit via quiz session endpoint
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/quiz-sessions/${sessionId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ answers })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Quiz submitted successfully:', data.data);
          
          setScore(data.data.score || 0);
          setSubmitted(true);
          setTimerActive(false);
          
          // Call completion callback
          if (onComplete) {
            onComplete({
              score: data.data.score || 0,
              answers: data.data.answers,
              totalQuestions: quiz.questions.length,
              timeSpent: data.data.timeSpent
            });
          }
        } else {
          const errorData = await response.json();
          console.error('❌ Failed to submit quiz:', errorData);
          alert('Failed to submit quiz: ' + (errorData.message || 'Unknown error'));
        }
      } else {
        // Fallback to local calculation (for instructors or if no session)
        let correctAnswers = 0;
        quiz.questions.forEach((question, index) => {
          const userAnswer = answers[index];
          const correctAnswer = question.correctAnswer;
          
          if (question.type === 'multiple_choice') {
            if (userAnswer === correctAnswer) {
              correctAnswers++;
            }
          } else if (question.type === 'true_false') {
            // Handle different formats of true/false answers
            const normalizedUserAnswer = userAnswer === true || userAnswer === 'true' || userAnswer === 1 || userAnswer === '1';
            const normalizedCorrectAnswer = correctAnswer === true || correctAnswer === 'true' || correctAnswer === 1 || correctAnswer === '1';
            
            if (normalizedUserAnswer === normalizedCorrectAnswer) {
              correctAnswers++;
            }
          } else if (question.type === 'short_answer') {
            // For short answers, we'll mark as correct for now
            // In a real app, this would need manual grading or better matching
            if (userAnswer && userAnswer.trim().length > 0) {
              correctAnswers++;
            }
          }
        });
        
        const calculatedScore = Math.round((correctAnswers / quiz.questions.length) * 100);
        setScore(calculatedScore);
        setSubmitted(true);
        
        // Call completion callback
        if (onComplete) {
          onComplete({
            score: calculatedScore,
            answers: answers,
            totalQuestions: quiz.questions.length,
            correctAnswers: correctAnswers
          });
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const renderQuestion = (question, index) => {
    const userAnswer = answers[index];
    
    // Debug logging for each question
    console.log(`🔍 Rendering question ${index + 1}:`, {
      type: question.type,
      question: question.question,
      correctAnswer: question.correctAnswer,
      correctAnswerType: typeof question.correctAnswer,
      hasOptions: question.options ? true : false,
      optionsLength: question.options ? question.options.length : 0,
      options: question.options,
      userRole: userRole,
      shouldShowInteractive: userRole === 'refugee'
    });
    
    // CRITICAL: Check exact type matching (support both dash and underscore formats)
    const isMultipleChoice = question.type === 'multiple_choice' || question.type === 'multiple-choice';
    const isTrueFalse = question.type === 'true_false' || question.type === 'true-false';
    const isShortAnswer = question.type === 'short_answer' || question.type === 'short-answer';
    
    console.log(`🔍 TYPE MATCHING Q${index + 1}:`, {
      rawType: question.type,
      isMultipleChoice,
      isTrueFalse, 
      isShortAnswer,
      typeOfType: typeof question.type,
      allPossibleTypes: ['multiple_choice', 'true_false', 'short_answer', 'multiple-choice', 'true-false', 'short-answer']
    });
    
    // Special debug for true/false questions
    if (question.type === 'true_false') {
      console.log(`🔍 TRUE/FALSE DEBUG for Q${index + 1}:`, {
        rawCorrectAnswer: question.correctAnswer,
        type: typeof question.correctAnswer,
        isTrue: question.correctAnswer === true,
        isStringTrue: question.correctAnswer === 'true',
        isNumber1: question.correctAnswer === 1,
        isString1: question.correctAnswer === '1',
        evaluatesToTrue: (question.correctAnswer === true || question.correctAnswer === 'true' || question.correctAnswer === 1 || question.correctAnswer === '1')
      });
    }
    
    return (
      <QuestionContainer key={index}>
        <QuestionNumber>{index + 1}</QuestionNumber>
        <QuestionText>{question.question || 'No question text available'}</QuestionText>
        
        {/* Display question type for instructor */}
        {userRole === 'instructor' && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.5rem', 
            background: '#e3f2fd', 
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: '#1565c0'
          }}>
            <strong>Type:</strong> {question.type} | 
            <strong> Points:</strong> {question.points || 1} | 
            <strong> Correct Answer:</strong> {
              isMultipleChoice ? 
                `Option ${(question.correctAnswer || 0) + 1}` :
              isTrueFalse ?
                (() => {
                  const correctAnswerIsTrue = question.correctAnswer === true || 
                                            question.correctAnswer === 'true' || 
                                            question.correctAnswer === 1 || 
                                            question.correctAnswer === '1';
                  console.log(`🔍 ANSWER DISPLAY DEBUG: correctAnswer=${question.correctAnswer}, type=${typeof question.correctAnswer}, correctAnswerIsTrue=${correctAnswerIsTrue}`);
                  return correctAnswerIsTrue ? 'True' : 'False';
                })() :
                question.correctAnswer?.toString() || 'Not set'
            }
            {question.explanation && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}
        
        {isMultipleChoice && (
          <OptionsContainer>
            {(() => {
              console.log(`🔍 MULTIPLE CHOICE Q${index + 1} - Rendering options, userRole: ${userRole}, isRefugee: ${userRole === 'refugee'}`);
              return null;
            })()}
            {question.options && question.options.length > 0 ? (
              question.options.map((option, optIndex) => (
                <OptionItem
                  key={optIndex}
                  selected={userRole === 'refugee' ? userAnswer === optIndex : false}
                  disabled={submitted || userRole === 'instructor'}
                  onClick={() => userRole === 'refugee' && handleAnswerChange(index, optIndex)}
                  style={{
                    backgroundColor: userRole === 'instructor' && question.correctAnswer === optIndex ? '#e8f5e8' : undefined,
                    borderColor: userRole === 'instructor' && question.correctAnswer === optIndex ? '#4caf50' : undefined
                  }}
                >
                  {userRole === 'refugee' ? (
                    userAnswer === optIndex ? 
                      <CheckCircle style={{ color: '#007BFF' }} /> : 
                      <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                  ) : (
                    question.correctAnswer === optIndex ?
                      <CheckCircle style={{ color: '#4caf50' }} /> :
                      <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                  )}
                  <OptionText>{option || `Option ${optIndex + 1} (empty)`}</OptionText>
                </OptionItem>
              ))
            ) : (
              <div style={{ 
                padding: '1rem', 
                background: '#fff3cd', 
                borderRadius: '4px',
                color: '#856404',
                border: '1px solid #ffeaa7'
              }}>
                No options available for this multiple choice question
              </div>
            )}
          </OptionsContainer>
        )}
        
        {isTrueFalse && (
          <OptionsContainer>
            {(() => {
              // Determine the correct answer more explicitly
              const correctAnswerIsTrue = question.correctAnswer === true || 
                                        question.correctAnswer === 'true' || 
                                        question.correctAnswer === 1 || 
                                        question.correctAnswer === '1';
              
              console.log('🔍 TRUE/FALSE RENDERING:', {
                question: question.question,
                rawCorrectAnswer: question.correctAnswer,
                correctAnswerIsTrue,
                willHighlightTrue: correctAnswerIsTrue,
                willHighlightFalse: !correctAnswerIsTrue,
                userRole: userRole,
                shouldShowInteractive: userRole === 'refugee'
              });
              
              return (
                <>
                  <OptionItem
                    selected={userRole === 'refugee' ? userAnswer === true : false}
                    disabled={submitted || userRole === 'instructor'}
                    onClick={() => userRole === 'refugee' && handleAnswerChange(index, true)}
                    style={{
                      backgroundColor: userRole === 'instructor' && correctAnswerIsTrue ? '#e8f5e8' : undefined,
                      borderColor: userRole === 'instructor' && correctAnswerIsTrue ? '#4caf50' : undefined
                    }}
                  >
                    {userRole === 'refugee' ? (
                      userAnswer === true ? 
                        <CheckCircle style={{ color: '#007BFF' }} /> : 
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    ) : (
                      correctAnswerIsTrue ?
                        <CheckCircle style={{ color: '#4caf50' }} /> :
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    )}
                    <OptionText>True</OptionText>
                  </OptionItem>
                  <OptionItem
                    selected={userRole === 'refugee' ? userAnswer === false : false}
                    disabled={submitted || userRole === 'instructor'}
                    onClick={() => userRole === 'refugee' && handleAnswerChange(index, false)}
                    style={{
                      backgroundColor: userRole === 'instructor' && !correctAnswerIsTrue ? '#e8f5e8' : undefined,
                      borderColor: userRole === 'instructor' && !correctAnswerIsTrue ? '#4caf50' : undefined
                    }}
                  >
                    {userRole === 'refugee' ? (
                      userAnswer === false ? 
                        <CheckCircle style={{ color: '#007BFF' }} /> : 
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    ) : (
                      !correctAnswerIsTrue ?
                        <CheckCircle style={{ color: '#4caf50' }} /> :
                        <RadioButtonUnchecked style={{ color: '#9ca3af' }} />
                    )}
                    <OptionText>False</OptionText>
                  </OptionItem>
                </>
              );
            })()}
          </OptionsContainer>
        )}
        
        {isShortAnswer && (
          <>
            {(() => {
              console.log(`🔍 SHORT ANSWER Q${index + 1} - Rendering text input, userRole: ${userRole}, isRefugee: ${userRole === 'refugee'}`);
              return null;
            })()}
            <TextAnswerInput
              value={userRole === 'refugee' ? (userAnswer || '') : ''}
              onChange={(e) => userRole === 'refugee' && handleAnswerChange(index, e.target.value)}
              placeholder={userRole === 'refugee' ? "Type your answer here..." : "Student will type answer here"}
              disabled={submitted || userRole === 'instructor'}
              readOnly={userRole === 'instructor'}
            />
            {userRole === 'instructor' && question.correctAnswer && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem', 
                background: '#e8f5e8', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: '#2e7d32'
              }}>
                <strong>Sample Answer:</strong> {question.correctAnswer}
              </div>
            )}
          </>
        )}
      </QuestionContainer>
    );
  };

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <QuizContainer>
        <QuizHeader>
          <QuizHeaderTop>
            <QuizInfo>
              <QuizTitle>Assessment 1: {quiz?.title || 'Untitled Assessment'}</QuizTitle>
              {quiz?.totalPoints && (
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '1rem', 
                  fontWeight: 'bold',
                  marginTop: '0.5rem'
                }}>
                  {quiz.totalPoints} Points
                </div>
              )}
              {quiz?.description && (
                <QuizDescription>{quiz.description}</QuizDescription>
              )}
            </QuizInfo>
          </QuizHeaderTop>
        </QuizHeader>
        
        <QuizBody>
          {checkingSubmission ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
                Checking Submission Status...
              </h3>
              <p style={{ color: '#6b7280' }}>
                Please wait while we check if you've already submitted this assignment.
              </p>
            </div>
          ) : alreadySubmitted ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                background: '#d4edda',
                color: '#155724',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #c3e6cb',
                marginBottom: '1rem'
              }}>
                <h3 style={{ color: '#155724', marginBottom: '0.5rem' }}>
                  ✅ Assignment Already Submitted
                </h3>
                <p style={{ color: '#155724', margin: 0 }}>
                  You have already submitted this assignment on {new Date(submissionData?.submittedAt).toLocaleDateString()}
                </p>
              </div>
              {submissionData && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>
                    Submission Details:
                  </h4>
                  <p style={{ color: '#6b7280', margin: '0.25rem 0' }}>
                    <strong>Type:</strong> {submissionData.submissionType === 'file' ? 'File Upload' : 'Link Submission'}
                  </p>
                  <p style={{ color: '#6b7280', margin: '0.25rem 0' }}>
                    <strong>Submitted:</strong> {new Date(submissionData.submittedAt).toLocaleString()}
                  </p>
                  <p style={{ color: '#6b7280', margin: '0.25rem 0' }}>
                    <strong>Status:</strong> {submissionData.status || 'Submitted'}
                  </p>
                  {submissionData.grade && (
                    <p style={{ color: '#6b7280', margin: '0.25rem 0' }}>
                      <strong>Grade:</strong> {submissionData.grade}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : !showSubmissionForm ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>
                Ready to Submit Your Assignment?
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                When you're ready to submit your work for this assessment, click the button below to choose your submission method.
              </p>
              <button
                onClick={() => setShowSubmissionForm(true)}
                style={{
                  background: '#007BFF',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                Submit Assignment
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => setShowSubmissionForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007BFF',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ← Back to Assessment
                </button>
              </div>
              <AssignmentSubmissionForm 
                assessmentId={quiz?._id}
                courseId={quiz?.courseId}
                moduleId={quiz?.moduleId}
                assessmentTitle={quiz?.title}
                onSubmissionSuccess={(submissionData) => {
                  setAlreadySubmitted(true);
                  setSubmissionData(submissionData);
                  setShowSubmissionForm(false);
                }}
              />
            </div>
          )}
        </QuizBody>
      </QuizContainer>
    );
  }

  return (
    <QuizContainer>
      <QuizHeader>
        <QuizHeaderTop>
          <QuizInfo>
            <QuizTitle>Assessment {quizNumber}: {quiz.title || 'Untitled Assessment'}</QuizTitle>
            {quiz.totalPoints && (
              <div style={{ 
                color: '#6b7280', 
                fontSize: '1rem', 
                fontWeight: 'bold',
                marginTop: '0.5rem'
              }}>
                {quiz.totalPoints} Points
              </div>
            )}
            {quiz.description && (
              <QuizDescription>{quiz.description}</QuizDescription>
            )}
          </QuizInfo>
        </QuizHeaderTop>
        
        <QuizStats>
          <StatItem>
            <StatValue>{quiz.questions?.length || 0}</StatValue>
            <StatLabel>Questions</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {quiz.duration ? 
                `${quiz.duration} min` : 
                'No Time Limit'
              }
            </StatValue>
            <StatLabel>Time Limit</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {quiz.dueDate ? 
                new Date(quiz.dueDate).toLocaleDateString() : 
                'No Due Date'
              }
            </StatValue>
            <StatLabel>Due Date</StatLabel>
          </StatItem>
          {/* Active Timer Display */}
          {timerActive && timeRemaining !== null && (
            <StatItem>
              <StatValue style={{ 
                color: timeRemaining < 300 ? '#dc3545' : '#007BFF',
                fontWeight: 'bold' 
              }}>
                {formatTime(timeRemaining)}
              </StatValue>
              <StatLabel>Time Remaining</StatLabel>
            </StatItem>
          )}
        </QuizStats>
      </QuizHeader>



      {submitted ? (
        <ResultsContainer>
          <ScoreDisplay>
            <ScoreText>{score}%</ScoreText>
            <ScoreLabel>Final Score</ScoreLabel>
          </ScoreDisplay>
          <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
            You answered {Object.keys(answers).length} out of {quiz.questions.length} questions
          </div>
          <div style={{ color: '#6b7280' }}>
            {score >= 70 ? '🎉 Great job! You passed the quiz.' : '📚 Consider reviewing the material and trying again.'}
          </div>
        </ResultsContainer>
      ) : !quizStarted && userRole === 'refugee' ? (
        /* Start Quiz Screen for Refugees */
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '3rem 2rem',
          margin: '1rem 0',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#1f2937', 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem' 
            }}>
              Ready to Start the Quiz?
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              lineHeight: '1.6',
              marginBottom: '1.5rem' 
            }}>
              Once you click "Start Quiz", the timer will begin and you'll have{' '}
              <strong>{quiz.duration || 'unlimited'} {quiz.duration ? 'minutes' : 'time'}</strong> to complete all questions.
            </p>
            <div style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Quiz Information:</h4>
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                <div>📝 {quiz.questions?.length || 0} questions</div>
                <div>⏰ {quiz.duration ? `${quiz.duration} minutes` : 'No time limit'}</div>
                <div>📅 Due: {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'No due date'}</div>
              </div>
            </div>
          </div>
          <button
            onClick={startQuiz}
            style={{
              background: '#007BFF',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#0056b3'}
            onMouseOut={(e) => e.target.style.background = '#007BFF'}
          >
            🚀 Start Quiz
          </button>
        </div>
      ) : (
        <>
          <QuizBody>
            {quiz.questions.map((question, index) => renderQuestion(question, index))}
          </QuizBody>

          <QuizActions>
            <ProgressInfo>
              {userRole === 'refugee' && 
                `${getAnsweredCount()} of ${quiz.questions.length} questions answered`
              }
            </ProgressInfo>
            {userRole === 'instructor' ? (
              <ActionButton onClick={onEdit}>
                Edit Quiz
              </ActionButton>
            ) : (
              <ActionButton
                primary
                onClick={handleSubmit}
                disabled={loading || getAnsweredCount() === 0}
              >
                <Send />
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </ActionButton>
            )}
          </QuizActions>
        </>
      )}
    </QuizContainer>
  );
}

// Assignment Submission Form Component
function AssignmentSubmissionForm({ assessmentId, courseId, moduleId, assessmentTitle, onSubmissionSuccess }) {
  const [submissionType, setSubmissionType] = useState('file'); // 'file' or 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (loading) return;

    // Validation
    if (submissionType === 'file' && !selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    if (submissionType === 'link' && !submissionLink.trim()) {
      alert('Please enter a submission link');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('assessmentId', assessmentId);
      formData.append('courseId', courseId);
      formData.append('moduleId', moduleId);
      formData.append('submissionType', submissionType);
      formData.append('submissionText', submissionText);
      
      if (submissionType === 'file' && selectedFile) {
        formData.append('submissionFile', selectedFile);
      } else if (submissionType === 'link') {
        formData.append('submissionLink', submissionLink);
      }

      const response = await fetch('/api/courses/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const responseData = await response.json();
        setSubmitted(true);
        alert('Assignment submitted successfully!');
        
        // Call the success callback with submission data
        if (onSubmissionSuccess) {
          onSubmissionSuccess({
            submissionType,
            submittedAt: new Date(),
            status: 'Submitted',
            ...responseData.data
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit assignment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: '#f0f9ff',
        borderRadius: '12px',
        border: '1px solid #0ea5e9'
      }}>
        <CheckCircle style={{ fontSize: '4rem', color: '#0ea5e9', marginBottom: '1rem' }} />
        <h3 style={{ color: '#0c4a6e', marginBottom: '1rem' }}>Assignment Submitted!</h3>
        <p style={{ color: '#075985', marginBottom: '0' }}>
          Your assignment has been submitted successfully. Your instructor will review it and provide feedback.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#f9fafb',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem' }}>
          Submit Your Assignment
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
          Choose how you'd like to submit your work for this assignment
        </p>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Submission Type Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Submission Type
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="submissionType"
                value="file"
                checked={submissionType === 'file'}
                onChange={(e) => setSubmissionType(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              📎 Upload File
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="submissionType"
                value="link"
                checked={submissionType === 'link'}
                onChange={(e) => setSubmissionType(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              🔗 Submit Link
            </label>
          </div>
        </div>

        {/* File Upload */}
        {submissionType === 'file' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Upload Assignment File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                cursor: 'pointer'
              }}
            />
            {selectedFile && (
              <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Link Submission */}
        {submissionType === 'link' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Assignment Link
            </label>
            <input
              type="url"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              placeholder="https://example.com/your-assignment"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
        )}

        {/* Additional Text */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Additional Comments (Optional)
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Add any additional comments about your submission..."
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#007BFF',
            color: 'white',
            border: 'none',
            padding: '0.875rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          <Send />
          {loading ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </div>
  );
}

export default QuizTaker; 