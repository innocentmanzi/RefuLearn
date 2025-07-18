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
import offlineIntegrationService from '../../services/offlineIntegrationService';

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

const CourseQuizPageFixed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, quizId, moduleId } = useParams();
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
        const isOnline = navigator.onLine;

        console.log('🔍 CourseQuizPage Debug:', {
          courseId,
          quizId,
          moduleId,
          hasLocationState: !!location.state,
          hasCourseData: !!courseData
        });

        let assessment = null;

        if (isOnline) {
          try {
            // Method A: Try student-specific quiz endpoint
            console.log('🔍 Method A: Trying student quiz access...');
            const studentQuizResponse = await fetch(`/api/student/quizzes/${quizId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (studentQuizResponse.ok) {
              const studentQuizData = await studentQuizResponse.json();
              console.log('📚 Student quiz data:', studentQuizData);
              
              if (studentQuizData.success !== false && (studentQuizData.data || studentQuizData.questions)) {
                assessment = studentQuizData.data || studentQuizData;
                console.log('✅ Assessment found via student endpoint:', assessment);
              }
            }

            // Method B: If student endpoint failed, try direct quiz access
            if (!assessment) {
              console.log('🔍 Method B: Trying direct quiz access...');
              const directQuizResponse = await fetch(`/api/quizzes/${quizId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (directQuizResponse.ok) {
                const quizData = await directQuizResponse.json();
                console.log('📚 Direct quiz data:', quizData);
                
                if (quizData.success !== false && (quizData.data || quizData.questions)) {
                  assessment = quizData.data || quizData;
                  console.log('✅ Assessment found via direct quiz endpoint:', assessment);
                }
              }
            }

            // Method C: Try course-based quiz access
            if (!assessment && courseId) {
              console.log('🔍 Method C: Trying course-based quiz access...');
              const courseQuizResponse = await fetch(`/api/courses/${courseId}/student/quiz/${quizId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (courseQuizResponse.ok) {
                const courseQuizData = await courseQuizResponse.json();
                console.log('📚 Course-based quiz data:', courseQuizData);
                
                if (courseQuizData.success !== false && (courseQuizData.data || courseQuizData.questions)) {
                  assessment = courseQuizData.data || courseQuizData;
                  console.log('✅ Assessment found via course-based endpoint:', assessment);
                }
              }
            }
          } catch (onlineError) {
            console.log('⚠️ Online quiz fetch failed:', onlineError.message);
          }
        }

        if (assessment) {
          console.log('✅ Assessment data loaded successfully');
          setAssessment(assessment);
        } else {
          console.error('❌ Failed to fetch assessment data from all methods');
          setError('Quiz not found or access denied. Please check if the quiz is published and you have access.');
        }

      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && quizId) {
      fetchAssessmentData();
    } else {
      setLoading(false);
    }
  }, [courseId, quizId, courseData, assessment]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Loading quiz data...</h2>
          <p>Course ID: {courseId}</p>
          <p>Quiz ID: {quizId}</p>
          <p>Module ID: {moduleId}</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <h2>Error Loading Quiz</h2>
          <p>{error}</p>
          <button onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </Container>
    );
  }

  if (!assessment) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>No Quiz Data Available</h2>
          <p>The quiz could not be loaded.</p>
          <button onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ padding: '2rem' }}>
        <h1>📝 {assessment.title || 'Quiz'}</h1>
        <p><strong>Course ID:</strong> {courseId}</p>
        <p><strong>Quiz ID:</strong> {quizId}</p>
        <p><strong>Module ID:</strong> {moduleId}</p>
        
        {assessment.description && (
          <div>
            <h3>Description:</h3>
            <p>{assessment.description}</p>
          </div>
        )}

        {assessment.questions && assessment.questions.length > 0 && (
          <div>
            <h3>Questions ({assessment.questions.length}):</h3>
            {assessment.questions.map((question, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                margin: '1rem 0',
                borderRadius: '8px'
              }}>
                <h4>Question {index + 1}:</h4>
                <p>{question.question}</p>
                <p><em>Type: {question.type}</em></p>
                {question.options && (
                  <ul>
                    {question.options.map((option, optIndex) => (
                      <li key={optIndex}>{option}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            style={{
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Course
          </button>
        </div>
      </div>
    </Container>
  );
};

export default CourseQuizPageFixed; 