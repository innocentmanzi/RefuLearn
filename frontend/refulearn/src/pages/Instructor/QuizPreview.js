import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowBack, Edit, Visibility } from '@mui/icons-material';


const Container = styled.div`
  padding: 2rem;
  background: #f4f8fb;
  min-height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Title = styled.h1`
  color: #007BFF;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background: ${({ variant }) => variant === 'primary' ? '#007BFF' : variant === 'secondary' ? '#6c757d' : '#28a745'};
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
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
`;

const InstructorQuizPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, moduleId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState('instructor'); // 'instructor' or 'student'

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        console.log('🔄 Fetching quiz data...');
        
        const response = await fetch(`/api/instructor/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const quizApiData = await response.json();
          const quizData = quizApiData.data.quiz;
          console.log('✅ Quiz data received for preview');
          setQuiz(quizData);
        } else {
          throw new Error('Failed to fetch quiz data');
        }

      } catch (err) {
        console.error('❌ Error fetching quiz:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleAnswerChange = (qIdx, answer) => {
    setAnswers({ ...answers, [qIdx]: answer });
  };

  const clearAllAnswers = () => {
    setAnswers({});
  };

  const handleEditQuiz = () => {
    // Navigate to quiz editor with return URL
    const returnUrl = `/instructor/courses/${courseId}/modules/${moduleId}/quiz/${quizId}`;
    sessionStorage.setItem('quizEditReturnUrl', returnUrl);
    
    navigate('/instructor/quizzes', {
      state: {
        editQuizId: quiz._id,
        returnUrl: returnUrl,
        courseId: courseId,
        courseName: course?.title
      }
    });
  };

  const calculateScore = () => {
    if (!quiz?.questions) return { correct: 0, total: 0 };
    
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswer = q.correctAnswer;
      
      let isCorrect = false;
      if (q.type === 'multiple-choice' || q.type === 'multiple_choice') {
        isCorrect = userAnswer === correctAnswer;
      } else if (q.type === 'true-false' || q.type === 'true_false') {
        isCorrect = userAnswer === correctAnswer.toString();
      } else if (q.type === 'short-answer' || q.type === 'short_answer') {
        isCorrect = userAnswer?.toString().toLowerCase().trim() === correctAnswer?.toString().toLowerCase().trim();
      }
      
      if (isCorrect) correct++;
    });
    
    return { correct, total: quiz.questions.length };
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading quiz...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error}</div>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/instructor/courses/${courseId}/overview`)}
            style={{ marginTop: '1rem' }}
          >
            <ArrowBack /> Back to Course
          </Button>
        </div>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Quiz not found</div>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/instructor/courses/${courseId}/overview`)}
            style={{ marginTop: '1rem' }}
          >
            <ArrowBack /> Back to Course
          </Button>
        </div>
      </Container>
    );
  }

  const score = calculateScore();

  return (
    <Container>
      <Header>
        <div>
          <Title>Quiz {quizId}: {quiz.title}</Title>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            {quiz.questions?.length || 0} questions • {quiz.totalPoints || 0} points • {quiz.timeLimit || 30} minutes
          </div>
        </div>
        <ActionButtons>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/instructor/courses/${courseId}/overview`)}
          >
            <ArrowBack /> Back to Course
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEditQuiz}
            title="Edit quiz questions and correct answers"
          >
            <Edit /> Edit Quiz
          </Button>
        </ActionButtons>
      </Header>

      {previewMode === 'instructor' && (
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ color: '#007BFF', margin: 0 }}>Instructor Overview</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                Review correct answers below. Click "Edit Quiz" to modify questions or answers.
              </p>
            </div>
            {Object.keys(answers).length > 0 && (
              <Button 
                variant="secondary" 
                onClick={clearAllAnswers}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                Clear All Answers
              </Button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <strong>Questions:</strong> {quiz.questions?.length || 0}
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <strong>Total Points:</strong> {quiz.totalPoints || 0}
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <strong>Time Limit:</strong> {quiz.timeLimit || 30} minutes
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <strong>Preview Score:</strong> {score.correct}/{score.total} ({Math.round((score.correct/score.total)*100) || 0}%)
            </div>
          </div>
        </Section>
      )}

      {quiz.description && (
        <Section>
          <h3 style={{ color: '#007BFF', marginBottom: '1rem' }}>
            {previewMode === 'instructor' ? 'Quiz Description' : 'Instructions'}
          </h3>
          <p style={{ lineHeight: 1.6, color: '#333' }}>{quiz.description}</p>
        </Section>
      )}

      <h2 style={{ color: '#007BFF', marginBottom: '1.5rem', textAlign: 'center' }}>
        {previewMode === 'instructor' ? 'Questions & Correct Answers' : 'Quiz Questions'}
      </h2>
      
      {previewMode === 'instructor' && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          padding: '1.5rem',
          background: '#d4edda',
          borderRadius: '8px',
          border: '2px solid #28a745'
        }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            color: '#155724', 
            margin: '0 0 0.5rem 0',
            fontWeight: 'bold'
          }}>
            🎯 INSTRUCTOR VIEW - CORRECT ANSWERS DISPLAYED
          </h3>
          <p style={{ 
            fontSize: '1rem', 
            color: '#155724', 
            margin: 0,
            fontWeight: '500'
          }}>
            Each question below shows the <strong>correct answer</strong> in a <strong style={{ color: '#155724' }}>green box</strong> for your review.
          </p>
        </div>
      )}

      {quiz.questions && quiz.questions.map((q, qIdx) => {
        // Debug logging for instructor
        if (previewMode === 'instructor') {
          console.log(`Question ${qIdx + 1} data:`, {
            type: q.type,
            correctAnswer: q.correctAnswer,
            correctAnswerType: typeof q.correctAnswer,
            options: q.options,
            hasOptions: !!q.options
          });
        }
        
        return (
          <Section key={q._id || qIdx} style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, fontSize: '1.1rem' }}>
              Question {qIdx + 1}: {q.question}
            </div>
            
            {/* Prominent Correct Answer Display for Instructor */}
            {previewMode === 'instructor' && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem',
                background: '#d4edda',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#155724',
                border: '2px solid #28a745',
                textAlign: 'center'
              }}>
                <strong>🎯 CORRECT ANSWER:</strong> {
                  q.type === 'multiple-choice' || q.type === 'multiple_choice' ? 
                    (q.options && q.options[q.correctAnswer] ? q.options[q.correctAnswer] :
                     (q.correctAnswer && typeof q.correctAnswer === 'string') ? q.correctAnswer :
                     'No correct answer set') :
                  q.type === 'true-false' || q.type === 'true_false' ?
                    (q.correctAnswer === 0 || q.correctAnswer === true || q.correctAnswer === 'true' ? 'True' : 'False') :
                    (q.correctAnswer || 'No correct answer set')
                }
              </div>
            )}
          
          {previewMode === 'instructor' && (
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#666', 
              marginBottom: '1rem',
              padding: '0.5rem',
              background: '#e3f2fd',
              borderRadius: '4px'
            }}>
              <strong>Type:</strong> {q.type} | <strong>Points:</strong> {q.points || 1} | <strong>Correct Answer:</strong> {
                q.type === 'multiple-choice' || q.type === 'multiple_choice' ? 
                  (q.options && q.options[q.correctAnswer] ? q.options[q.correctAnswer] : 
                   (q.correctAnswer && typeof q.correctAnswer === 'string' ? q.correctAnswer : 'No correct answer set')) :
                  (q.correctAnswer || 'No correct answer set')
              }
            </div>
          )}
          
          {/* Multiple Choice Questions */}
          {(q.type === 'multiple-choice' || q.type === 'multiple_choice') && q.options && (
            <div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#666', 
                marginBottom: '0.5rem',
                fontStyle: 'italic'
              }}>
                Select the best answer:
              </div>
              
              {/* Show Correct Answer Prominently for Instructor */}
              {previewMode === 'instructor' && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.75rem',
                  background: '#e8f5e8',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: '#155724',
                  border: '2px solid #28a745'
                }}>
                  <strong>✓ Correct Answer:</strong> {
                    q.options && q.options[q.correctAnswer] ? q.options[q.correctAnswer] :
                    (q.correctAnswer && typeof q.correctAnswer === 'string') ? q.correctAnswer :
                    'No correct answer set'
                  }
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    cursor: 'pointer',
                    padding: '0.75rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    background: answers[qIdx] === oIdx ? '#f8f9ff' : 'white',
                    borderColor: answers[qIdx] === oIdx ? '#007BFF' : 
                                previewMode === 'instructor' && (oIdx === q.correctAnswer || q.correctAnswer === opt) ? '#28a745' : '#e9ecef'
                  }}>
                    <input
                      type="radio"
                      name={`quiz-${qIdx}`}
                      checked={answers[qIdx] === oIdx}
                      onChange={() => handleAnswerChange(qIdx, oIdx)}
                      style={{ margin: 0 }}
                      disabled={previewMode === 'instructor'}
                    />
                    <span style={{ flex: 1 }}>{opt}</span>
                    {previewMode === 'instructor' && (oIdx === q.correctAnswer || q.correctAnswer === opt) && (
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Correct</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* True/False Questions */}
          {(q.type === 'true-false' || q.type === 'true_false') && (
            <div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#666', 
                marginBottom: '0.5rem',
                fontStyle: 'italic'
              }}>
                Select True or False:
              </div>
              
              {/* Show Correct Answer Prominently for Instructor */}
              {previewMode === 'instructor' && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.75rem',
                  background: '#e8f5e8',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: '#155724',
                  border: '2px solid #28a745'
                }}>
                  <strong>✓ Correct Answer:</strong> {q.correctAnswer === 0 || q.correctAnswer === true || q.correctAnswer === 'true' ? 'True' : 'False'}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['true', 'false'].map((option) => (
                  <label key={option} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    cursor: 'pointer',
                    padding: '0.75rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    background: answers[qIdx] === option ? '#f8f9ff' : 'white',
                    borderColor: answers[qIdx] === option ? '#007BFF' : 
                                previewMode === 'instructor' && 
                                ((option === 'true' && q.correctAnswer === 0) || (option === 'false' && q.correctAnswer === 1)) ? '#28a745' : '#e9ecef'
                  }}>
                    <input
                      type="radio"
                      name={`quiz-${qIdx}`}
                      checked={answers[qIdx] === option}
                      onChange={() => handleAnswerChange(qIdx, option)}
                      style={{ margin: 0 }}
                      disabled={previewMode === 'instructor'}
                    />
                    <span style={{ flex: 1, textTransform: 'capitalize' }}>{option}</span>
                    {previewMode === 'instructor' && 
                     ((option === 'true' && q.correctAnswer === 0) || (option === 'false' && q.correctAnswer === 1)) && (
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Correct</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Short Answer Questions */}
          {(q.type === 'short-answer' || q.type === 'short_answer') && (
            <div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#666', 
                marginBottom: '0.5rem',
                fontStyle: 'italic'
              }}>
                Type your answer in the text box below:
              </div>
              
              {/* Show Correct Answer Prominently for Instructor */}
              {previewMode === 'instructor' && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.75rem',
                  background: '#e8f5e8',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: '#155724',
                  border: '2px solid #28a745'
                }}>
                  <strong>✓ Correct Answer:</strong> {q.correctAnswer || 'No correct answer set'}
                </div>
              )}
              
              <textarea
                value={answers[qIdx] || ''}
                onChange={(e) => handleAnswerChange(qIdx, e.target.value)}
                placeholder="Type your answer here..."
                disabled={previewMode === 'instructor'}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  border: answers[qIdx] && answers[qIdx].trim() ? '2px solid #007BFF' : '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  background: answers[qIdx] && answers[qIdx].trim() ? '#f8f9ff' : 
                            previewMode === 'instructor' ? '#f8f9fa' : 'white'
                }}
              />
            </div>
          )}
          
          {q.explanation && previewMode === 'instructor' && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem',
              background: '#fff3cd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </Section>
        );
      })}

      {previewMode === 'student' && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Questions answered: {Object.keys(answers).length} / {quiz.questions?.length || 0}
          </div>
          <Button
            style={{ 
              background: Object.keys(answers).length === (quiz.questions?.length || 0) ? '#27ae60' : '#6c757d',
              cursor: Object.keys(answers).length === (quiz.questions?.length || 0) ? 'pointer' : 'not-allowed',
            }}
            onClick={() => alert('This is a preview - quiz not actually submitted')}
          >
            Submit Quiz ({Object.keys(answers).length}/{quiz.questions?.length || 0} answered) - PREVIEW ONLY
          </Button>
        </div>
      )}
    </Container>
  );
};

export default InstructorQuizPreview; 