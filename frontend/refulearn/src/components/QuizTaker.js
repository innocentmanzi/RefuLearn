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
  }, [quiz]);

  const handleAnswerChange = (questionIndex, answer) => {
    if (submitted) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = async () => {
    if (loading || submitted) return;
    
    setLoading(true);
    try {
      // Calculate score
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
      options: question.options
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
              question.type === 'multiple_choice' ? 
                `Option ${(question.correctAnswer || 0) + 1}` :
              question.type === 'true_false' ?
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
        
        {question.type === 'multiple_choice' && (
          <OptionsContainer>
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
        
        {question.type === 'true_false' && (
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
                willHighlightFalse: !correctAnswerIsTrue
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
        
        {question.type === 'short_answer' && (
          <>
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
        <QuizBody>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <h3>Quiz Data Issue</h3>
            {!quiz && <p>No quiz data provided</p>}
            {quiz && !quiz.questions && <p>Quiz has no questions property</p>}
            {quiz && quiz.questions && quiz.questions.length === 0 && <p>Quiz has no questions</p>}
            {quiz && (
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', textAlign: 'left' }}>
                <strong>Debug Info:</strong>
                <pre style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '4px' }}>
                  {JSON.stringify(quiz, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </QuizBody>
      </QuizContainer>
    );
  }

  return (
    <QuizContainer>
      <QuizHeader>
        <QuizHeaderTop>
          <QuizInfo>
            <QuizTitle>Quiz {quizNumber}: {quiz.title || 'Untitled Quiz'}</QuizTitle>
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
            <StatValue>{quiz.totalPoints || (quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0)) || 0}</StatValue>
            <StatLabel>Total Points</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{quiz.timeLimit || 30}</StatValue>
            <StatLabel>Time Limit (min)</StatLabel>
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

export default QuizTaker; 