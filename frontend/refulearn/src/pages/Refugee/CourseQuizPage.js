import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

// Styled components matching the instructor quiz design
const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme?.colors?.white || 'white'};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const QuizContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const QuizHeader = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const QuizTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
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

const QuestionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1565c0;
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
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007BFF;
    background: #f8faff;
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
`;

const QuizActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

const SubmitButton = styled.button`
  background: ${props => props.disabled ? '#6c757d' : '#27ae60'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #219a52;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
  }
`;

const ProgressInfo = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResultsContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ScoreDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const ReturnButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
`;

const getProgressId = (courseId, userId = 'currentUser') => `progress_${userId}_${courseId}`;

const getQuizResultId = (courseId, userId = 'currentUser') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  return `quizresult_${userId}_${courseId}_${timestamp}`;
};

// Browser console test functions - can be called directly from browser console
window.testQuizAPI = async function() {
  const token = localStorage.getItem('token');
  const assessmentId = window.location.pathname.split('/').pop();
  const courseId = window.location.pathname.split('/')[3];
  
  console.log('🧪 Testing Quiz API from Browser Console');
  console.log('Assessment ID:', assessmentId);
  console.log('Course ID:', courseId);
  console.log('Token:', token ? 'Present' : 'Missing');
  
  console.log('\n=== TESTING INSTRUCTOR ENDPOINT (same as instructor page) ===');
  try {
    const instructorResponse = await fetch('/api/instructor/quizzes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Instructor endpoint status:', instructorResponse.status);
    const instructorData = await instructorResponse.json();
    console.log('All instructor quizzes:', instructorData);
    
    if (instructorData.data?.quizzes) {
      const targetQuiz = instructorData.data.quizzes.find(q => q._id === assessmentId);
      if (targetQuiz) {
        console.log('🎯 FOUND TARGET QUIZ:', targetQuiz);
        console.log('Quiz questions:', targetQuiz.questions);
        targetQuiz.questions?.forEach((q, i) => {
          console.log(`Q${i+1}:`, {
            text: q.question,
            type: q.type,
            options: q.options,
            optionCount: q.options?.length || 0,
            correctAnswer: q.correctAnswer
          });
        });
        return targetQuiz;
      } else {
        console.log('❌ Quiz not found in instructor data');
      }
    }
  } catch (error) {
    console.error('Error with instructor endpoint:', error);
  }
  
  return null;
};

// Test function to see current quiz state
window.checkCurrentQuiz = function() {
  console.log('🔍 Current quiz state in component:');
  const quizData = window.currentQuizData; // We'll set this in the component
  if (quizData) {
    console.log('Title:', quizData.title);
    console.log('Questions:', quizData.questions?.length);
    quizData.questions?.forEach((q, i) => {
      console.log(`Q${i+1}: "${q.question}" (${q.type}) - Options: ${q.options?.length || 0}`);
    });
  } else {
    console.log('No quiz data loaded yet');
  }
};

// Test rendering for a specific question
window.testQuestionRendering = function(questionIndex = 0) {
  const quizData = window.currentQuizData;
  if (quizData?.questions?.[questionIndex]) {
    const q = quizData.questions[questionIndex];
    console.log(`🔍 Testing rendering for Question ${questionIndex + 1}:`, {
      text: q.question,
      type: q.type,
      options: q.options,
      shouldShowMultipleChoice: q.type === 'multiple_choice' && q.options?.length > 0,
      shouldShowTrueFalse: q.type === 'true_false',
      shouldShowShortAnswer: q.type === 'short_answer' || (!q.type || !['multiple_choice', 'true_false'].includes(q.type))
    });
  } else {
    console.log('Question not found or no quiz data');
  }
};

// Add helpful console message
console.log('🔧 RefuLearn Quiz Debug Tools Available:');
console.log('- Run testQuizAPI() in console to test API endpoints');
console.log('- Check browser network tab for API calls');
console.log('- Look for debug messages starting with 🔍, 🎯, 🔧');

// Simplified validation - just check if question exists and has basic structure
const validateQuizQuestion = (question) => {
  console.log(`🔍 Validating question: "${question?.question}"`);
  
  if (!question || !question.question) {
    console.log(`🚫 No question or question text`);
    return false;
  }
  
  const questionText = question.question.trim();
  
  // Very basic validation - just check if it's not empty
  if (questionText.length === 0) {
    console.log(`🚫 Empty question`);
    return false;
  }
  
  console.log(`✅ Valid question: "${question.question}"`);
  return true;
};

// Add validation for the entire quiz
const validateQuiz = (quiz) => {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return { valid: false, error: 'Quiz has no questions' };
  }
  
  return { valid: true };
};

const CourseQuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, assessmentId } = useParams();
  const { course, quiz } = location.state || {};
  const [assessment, setAssessment] = useState(null);
  const [courseData, setCourseData] = useState(course);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch course data if not provided
        if (!courseData && courseId) {
          const courseResponse = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            setCourseData(courseData.data.course);
          }
        }

        // Fetch quiz/assessment data directly from the assessment endpoint
        if (assessmentId) {
          console.log('🔍 Starting direct assessment fetch for ID:', assessmentId);
          console.log('🔍 Course ID:', courseId);
          
          // TEST: Let's check what endpoints are actually available
          console.log('🧪 TESTING API ENDPOINTS:');
          console.log('Token:', token ? 'Present' : 'Missing');
          
          // Fetch course data for context
          if (!courseData && courseId) {
            console.log('🔍 Fetching course data for context...');
            const courseResponse = await fetch(`/api/courses/${courseId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (courseResponse.ok) {
              const courseResult = await courseResponse.json();
              setCourseData(courseResult.data.course);
              console.log('✅ Course context loaded');
            }
          }
          
          // Method 1: Try the instructor quiz endpoint (same data source as instructor interface)
          console.log('🔍 Method 1: Using instructor quiz endpoint for complete data');
          let assessment = null;
          
          try {
            const instructorQuizzesResponse = await fetch('/api/instructor/quizzes?' + new URLSearchParams({
              '_cache_bust': Date.now().toString()
            }), {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            });

            if (instructorQuizzesResponse.ok) {
              const quizzesData = await instructorQuizzesResponse.json();
              console.log('📚 All quizzes from instructor endpoint:', quizzesData);
              
              // DEBUG: Show all available quizzes and their questions
              const allQuizzes = quizzesData.data?.quizzes || [];
              console.log('🔍 ALL AVAILABLE QUIZZES IN DATABASE:');
              allQuizzes.forEach((quiz, idx) => {
                console.log(`Quiz ${idx + 1}:`);
                console.log(`  ID: ${quiz._id}`);
                console.log(`  Title: ${quiz.title}`);
                console.log(`  Course: ${quiz.courseId}`);
                console.log(`  Questions: ${quiz.questions?.length || 0}`);
                if (quiz.questions?.length > 0) {
                  quiz.questions.forEach((q, qIdx) => {
                    console.log(`    Q${qIdx + 1}: "${q.question}" (${q.type})`);
                  });
                }
                console.log('');
              });
              
              // Find the specific quiz by ID
              assessment = allQuizzes.find(quiz => quiz._id === assessmentId);
              
              if (assessment) {
                console.log('✅ Method 1 Success - Found quiz in instructor data');
                console.log('🎯 Quiz found:', {
                  title: assessment.title,
                  description: assessment.description,
                  type: assessment.type,
                  questions: assessment.questions?.length,
                  hasQuestions: !!assessment.questions
                });
              } else {
                console.log('❌ Quiz not found in instructor quizzes');
              }
            } else {
              console.log('❌ Method 1 Failed - Status:', instructorQuizzesResponse.status);
            }
          } catch (error) {
            console.log('❌ Method 1 Error:', error);
          }
          
          // Method 2: Try getting single quiz by ID (if instructor endpoint has this feature)
          if (!assessment) {
            try {
              console.log('🔍 Method 2: Direct quiz by ID');
              const singleQuizResponse = await fetch(`/api/instructor/quizzes/${assessmentId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (singleQuizResponse.ok) {
                const quizResult = await singleQuizResponse.json();
                assessment = quizResult.data?.quiz || quizResult.data;
                console.log('✅ Method 2 Success - Direct quiz endpoint worked');
              } else {
                console.log('❌ Method 2 Failed - Status:', singleQuizResponse.status);
              }
            } catch (error) {
              console.log('❌ Method 2 Error:', error);
            }
          }
          
          // Method 3: Fallback to course modules (original approach)
          if (!assessment && courseData) {
            console.log('🔍 Method 3: Fallback to course modules');
            courseData.modules?.forEach((module, moduleIndex) => {
              if (module.quizzes) {
                module.quizzes.forEach((quiz, quizIndex) => {
                  if (quiz._id === assessmentId) {
                    assessment = quiz;
                    console.log('✅ Method 3 Success - Found in course modules');
                  }
                });
              }
              if (module.assessments) {
                module.assessments.forEach((assess, assessIndex) => {
                  if (assess._id === assessmentId) {
                    assessment = assess;
                    console.log('✅ Method 3 Success - Found in course modules');
                  }
                });
              }
            });
          }
          
          if (assessment) {
            console.log('✅ Assessment data loaded successfully');
            console.log('🔍 FINAL ASSESSMENT DATA:', assessment);
            
            // DETAILED DEBUG: Show exactly what's in the database
            console.log('🔍 DETAILED BACKEND DATA ANALYSIS:');
            console.log('Assessment Title:', assessment.title);
            console.log('Assessment Description:', assessment.description);
            console.log('Assessment Type:', assessment.type);
            console.log('Total Questions:', assessment.questions?.length);
            console.log('Due Date:', assessment.dueDate);
            console.log('Time Limit:', assessment.timeLimit);
            console.log('Total Points:', assessment.totalPoints);
            
            // CRITICAL: Validate and enhance question data for proper rendering
            if (assessment.questions && assessment.questions.length > 0) {
              console.log('🔧 ENHANCING QUESTION DATA FOR REFUGEE DISPLAY:');
              
              // Ensure questions have proper structure for interactive elements
              assessment.questions = assessment.questions.map((q, idx) => {
                console.log(`🔍 Processing Question ${idx + 1}:`, {
                  original: q.question,
                  originalType: q.type,
                  originalOptions: q.options,
                  hasOptions: Array.isArray(q.options),
                  optionCount: q.options ? q.options.length : 0
                });
                
                // Ensure question has proper type
                let questionType = q.type;
                
                // Auto-detect type based on data if missing or unclear
                if (!questionType || questionType === 'undefined' || questionType === '') {
                  if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                    questionType = 'multiple_choice';
                    console.log(`🔧 Auto-detected multiple_choice for Q${idx + 1}`);
                  } else if (q.correctAnswer === 'true' || q.correctAnswer === 'false' || q.correctAnswer === true || q.correctAnswer === false) {
                    questionType = 'true_false';
                    console.log(`🔧 Auto-detected true_false for Q${idx + 1}`);
                  } else {
                    questionType = 'short_answer';
                    console.log(`🔧 Auto-detected short_answer for Q${idx + 1}`);
                  }
                }
                
                // Ensure consistent type naming
                const typeMapping = {
                  'multiple-choice': 'multiple_choice',
                  'true-false': 'true_false',
                  'short-answer': 'short_answer'
                };
                
                if (typeMapping[questionType]) {
                  questionType = typeMapping[questionType];
                }
                
                const enhancedQuestion = {
                  ...q,
                  type: questionType,
                  question: q.question || `Question ${idx + 1}`,
                  points: q.points || 1,
                  options: q.options || [],
                  correctAnswer: q.correctAnswer,
                  _id: q._id || q.id || `question_${idx}`
                };
                
                console.log(`✅ Enhanced Question ${idx + 1}:`, {
                  text: enhancedQuestion.question,
                  finalType: enhancedQuestion.type,
                  optionsCount: enhancedQuestion.options?.length || 0,
                  isMultipleChoice: enhancedQuestion.type === 'multiple_choice',
                  isTrueFalse: enhancedQuestion.type === 'true_false',
                  isShortAnswer: enhancedQuestion.type === 'short_answer'
                });
                
                return enhancedQuestion;
              });
              
              console.log('🎯 FINAL ENHANCED QUESTIONS FOR REFUGEE VIEW:');
              assessment.questions.forEach((q, idx) => {
                console.log(`Question ${idx + 1}: "${q.question}" (Type: ${q.type}, Options: ${q.options?.length || 0})`);
              });
            }
            
            // Store quiz data globally for debugging
            window.currentQuizData = assessment;
            
            setAssessment(assessment);
          } else {
            console.error('❌ Failed to fetch assessment data from all methods');
            setError('Failed to load assessment data - quiz may not exist or access denied');
          }
        }

      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    // Always fetch fresh data from backend
    if (courseId && assessmentId) {
      fetchAssessmentData();
    } else {
      setLoading(false);
    }
  }, [courseId, assessmentId, courseData, assessment]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading quiz data...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error}</div>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Container>
    );
  }

  if (!assessment || !courseData) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No quiz data available. Please try refreshing the page.
        </div>
      </Container>
    );
  }

  // DEBUG: Show assessment questions to verify what we're working with
  console.log('🔍 Current assessment questions:', assessment?.questions);
  
  // DEBUG: Log each question individually with validation results
  console.log('🔍 DETAILED QUESTION VALIDATION:');
  assessment?.questions?.forEach((q, idx) => {
    console.log(`Question ${idx + 1}: "${q.question}"`);
    console.log(`  - Lowercase: "${q.question?.toLowerCase()?.trim()}"`);
    console.log(`  - Validation result: ${validateQuizQuestion(q) ? '✅ VALID' : '❌ INVALID'}`);
  });





  const handleChange = (qIdx, answer) => {
    console.log(`🔄 Answer updated - Question ${qIdx + 1}: "${answer}"`);
    const newAnswers = { ...answers, [qIdx]: answer };
    console.log(`📊 Total answers now:`, Object.keys(newAnswers).length);
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Validate that all questions are answered
    const validQuestions = assessment.questions.filter((q, idx) => validateQuizQuestion(q));
    const unansweredQuestions = [];
    validQuestions.forEach((q, idx) => {
      const originalIndex = assessment.questions.indexOf(q);
      if (answers[originalIndex] === undefined || answers[originalIndex] === '' || answers[originalIndex] === null) {
        unansweredQuestions.push(originalIndex + 1);
      }
    });
    
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assessments/${assessment._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionIndex, answer]) => {
            const question = assessment.questions[parseInt(questionIndex)];
            return {
              questionId: question._id || question.id,
              answer: answer,
              questionType: question.type
            };
          }),
          timeSpent: 0 // You can track actual time spent if needed
        })
      });

      if (response.ok) {
        setSubmitted(true);
        // Update course progress
        const progressResponse = await fetch(`/api/courses/${courseData._id}/progress`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assessmentCompleted: true
          })
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit assessment');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      alert('Failed to submit assessment');
    }
  };

  const calculateScore = () => {
    if (!assessment || !assessment.questions) return 0;
    
    return assessment.questions.reduce((acc, q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswer = q.correctAnswer;
      
      let isCorrect = false;
      if (q.type === 'multiple-choice' || q.type === 'multiple_choice') {
        // For multiple choice, compare answer index with correct answer index
        isCorrect = userAnswer === correctAnswer;
      } else if (q.type === 'true-false' || q.type === 'true_false') {
        // For true/false, map string answers to numbers: true=0, false=1
        const userAnswerNum = userAnswer === 'true' ? 0 : 1;
        isCorrect = userAnswerNum === correctAnswer;
      } else if (q.type === 'short-answer' || q.type === 'short_answer') {
        // For short answer, compare trimmed lowercase strings
        isCorrect = userAnswer?.toString().toLowerCase().trim() === correctAnswer?.toString().toLowerCase().trim();
      }
      
      return acc + (isCorrect ? 1 : 0);
    }, 0);
  };

  const getQuizNumber = () => {
    if (!assessment || !courseData) return '1';
    
    // Find which quiz number this is within the module
    let quizNumber = 1;
    
    courseData.modules?.forEach(module => {
      if (module.quizzes) {
        module.quizzes.forEach((quiz, index) => {
          if (quiz._id === assessment._id) {
            quizNumber = index + 1; // Quiz numbers start from 1
          }
        });
      }
    });
    
    return quizNumber.toString();
  };

  const isQuiz = assessment?.type === 'quiz' || window.location.pathname.includes('/quiz/');
  const itemType = isQuiz ? 'Quiz' : 'Assessment';
  const itemNumber = getQuizNumber();

  // Debug logging
  console.log('Title Debug Info:', {
    assessmentType: assessment?.type,
    urlPath: window.location.pathname,
    isQuiz,
    itemType,
    itemNumber,
    assessmentTitle: assessment?.title
  });

  // Question rendering logic is now inline in the main return statement

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading quiz data...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error}</div>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Container>
    );
  }

  if (!assessment || !courseData) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No quiz data available. Please try refreshing the page.
        </div>
      </Container>
    );
  }

  // Debug: Log assessment data
  console.log('🔍 Assessment data for validation:', {
    assessment: assessment,
    questions: assessment?.questions,
    questionCount: assessment?.questions?.length
  });

  // Force validation check for each question individually
  if (assessment?.questions) {
    console.log('🔍 FORCING INDIVIDUAL QUESTION VALIDATION:');
    assessment.questions.forEach((q, idx) => {
      const isValid = validateQuizQuestion(q);
      console.log(`Question ${idx + 1}: "${q.question}" -> ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    });
  }





  return (
    <Container>
      {/* Quiz Header */}
      {assessment && (
        <QuizHeader>
          <QuizHeaderTop>
            <QuizInfo>
              <QuizTitle>
                {courseData ? `${courseData.title} - ` : ''}
                {assessment.type === 'quiz' ? 'Quiz' : 'Assessment'}: {assessment.title}
              </QuizTitle>
              {assessment.description && (
                <QuizDescription>{assessment.description}</QuizDescription>
              )}
            </QuizInfo>
          </QuizHeaderTop>
          
          <QuizStats>
            <StatItem>
              <StatValue>{assessment.questions?.length || 0}</StatValue>
              <StatLabel>Questions</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{assessment.totalPoints || 0}</StatValue>
              <StatLabel>Total Points</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                {assessment.dueDate ? (
                  new Date(assessment.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric'
                  })
                ) : assessment.due_date ? (
                  new Date(assessment.due_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric'
                  })
                ) : (
                  <span style={{ color: '#666', fontStyle: 'italic' }}>No Due Date Set</span>
                )}
              </StatValue>
              <StatLabel>Due Date</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{Object.keys(answers).length}</StatValue>
              <StatLabel>Answered</StatLabel>
            </StatItem>
          </QuizStats>
        </QuizHeader>
      )}

      {/* Quiz Body */}
      {!submitted ? (
        <QuizContainer>
          <QuizBody>
            {/* RENDER QUESTIONS WITH GUARANTEED INTERACTIVE ELEMENTS */}
            {assessment && assessment.questions && assessment.questions.length > 0 ? (
              assessment.questions.map((question, index) => {
                console.log(`🔥 RENDERING Question ${index + 1}:`, question);
                const userAnswer = answers[index];
                
                // Force refresh of component by using key with timestamp
                const componentKey = `question_${index}_${Date.now()}`;
                
                return (
                  <div key={componentKey} style={{
                    border: '4px solid #007BFF',
                    margin: '30px 0',
                    padding: '30px',
                    borderRadius: '15px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}>
                    {/* Question Number */}
                    <div style={{
                      backgroundColor: '#007BFF',
                      color: 'white',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '24px',
                      marginBottom: '25px',
                      border: '3px solid #0056b3'
                    }}>
                      {index + 1}
                    </div>
                    
                    {/* Question Text */}
                    <h2 style={{
                      color: '#333',
                      marginBottom: '25px',
                      fontSize: '22px',
                      fontWeight: 'bold',
                      lineHeight: '1.4'
                    }}>
                      {question.question || `Question ${index + 1}`}
                    </h2>
                    
                    {/* Question Type Info */}
                    <div style={{
                      backgroundColor: '#e3f2fd',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '25px',
                      fontSize: '16px',
                      color: '#1565c0',
                      fontWeight: 'bold',
                      border: '2px solid #bbdefb'
                    }}>
                      <strong>Type:</strong> {question.type || 'text'} | <strong>Points:</strong> {question.points || 1}
                    </div>

                    {/* FORCE RENDER ALL QUESTION TYPES - GUARANTEED TO WORK */}
                    
                    {/* Multiple Choice - Check for both type variations and options */}
                    {((question.type === 'multiple-choice' || question.type === 'multiple_choice') && 
                      question.options && Array.isArray(question.options) && question.options.length > 0) ? (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ 
                          color: '#007BFF', 
                          marginBottom: '20px',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          📋 Select the correct answer:
                        </h3>
                        {question.options.map((option, optIndex) => (
                          <div
                            key={`option_${optIndex}`}
                            onClick={() => {
                              console.log(`Clicked option ${optIndex} for question ${index + 1}`);
                              handleChange(index, optIndex);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '20px',
                              margin: '15px 0',
                              backgroundColor: userAnswer === optIndex ? '#007BFF' : '#ffffff',
                              color: userAnswer === optIndex ? 'white' : '#333',
                              border: '4px solid #007BFF',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              transition: 'all 0.3s ease',
                              boxShadow: userAnswer === optIndex ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={(e) => {
                              if (userAnswer !== optIndex) {
                                e.target.style.backgroundColor = '#f8f9ff';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (userAnswer !== optIndex) {
                                e.target.style.backgroundColor = '#ffffff';
                              }
                            }}
                          >
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: userAnswer === optIndex ? 'white' : '#007BFF',
                              color: userAnswer === optIndex ? '#007BFF' : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '20px',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            <span style={{ flex: 1 }}>{option}</span>
                          </div>
                        ))}
                      </div>
                    ) : (question.type === 'true-false' || question.type === 'true_false') ? (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ 
                          color: '#007BFF', 
                          marginBottom: '20px',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          ✅ Select True or False:
                        </h3>
                        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              console.log(`Clicked TRUE for question ${index + 1}`);
                              handleChange(index, 'true');
                            }}
                            style={{
                              padding: '25px 50px',
                              backgroundColor: userAnswer === 'true' ? '#28a745' : '#ffffff',
                              color: userAnswer === 'true' ? 'white' : '#28a745',
                              border: '4px solid #28a745',
                              borderRadius: '12px',
                              fontSize: '20px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: userAnswer === 'true' ? '0 4px 12px rgba(40,167,69,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                              minWidth: '150px'
                            }}
                          >
                            ✓ TRUE
                          </button>
                          <button
                            onClick={() => {
                              console.log(`Clicked FALSE for question ${index + 1}`);
                              handleChange(index, 'false');
                            }}
                            style={{
                              padding: '25px 50px',
                              backgroundColor: userAnswer === 'false' ? '#dc3545' : '#ffffff',
                              color: userAnswer === 'false' ? 'white' : '#dc3545',
                              border: '4px solid #dc3545',
                              borderRadius: '12px',
                              fontSize: '20px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: userAnswer === 'false' ? '0 4px 12px rgba(220,53,69,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                              minWidth: '150px'
                            }}
                          >
                            ✗ FALSE
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ 
                          color: '#007BFF', 
                          marginBottom: '20px',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          ✏️ Type your answer:
                        </h3>
                        <textarea
                          value={answers[index] || ''}
                          onChange={(e) => {
                            console.log(`Text input changed for question ${index + 1}:`, e.target.value);
                            handleChange(index, e.target.value);
                          }}
                          placeholder={`Enter your answer for question ${index + 1}...`}
                          style={{
                            width: '100%',
                            minHeight: '150px',
                            padding: '20px',
                            border: '4px solid #007BFF',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontFamily: 'Arial, sans-serif',
                            resize: 'vertical',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            lineHeight: '1.5'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: 'red',
                border: '3px solid red',
                borderRadius: '10px',
                margin: '20px 0',
                backgroundColor: '#ffe6e6'
              }}>
                <h2>❌ No questions available</h2>
                <p>The quiz may not have been created properly or there may be a connection issue.</p>
              </div>
            )}
          </QuizBody>
          
          <QuizActions>
            <ProgressInfo>
              <Assignment />
              <span>Progress: {Object.keys(answers).length} / {assessment?.questions?.length || 0} questions answered</span>
            </ProgressInfo>
            
            <SubmitButton
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== (assessment?.questions?.length || 0)}
            >
              <Send />
              Submit Quiz
            </SubmitButton>
          </QuizActions>
        </QuizContainer>
      ) : (
        <QuizContainer>
          <ResultsContainer>
            <ScoreDisplay>
              Quiz Completed!
            </ScoreDisplay>
            <div style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#666' }}>
              Your Score: {calculateScore()} out of {assessment?.questions?.length || 0}
            </div>
            <ReturnButton onClick={() => navigate(-1)}>
              Return to Course
            </ReturnButton>
          </ResultsContainer>
        </QuizContainer>
      )}
    </Container>
  );
};

export default CourseQuizPage; 