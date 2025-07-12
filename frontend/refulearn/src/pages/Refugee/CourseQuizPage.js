import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const getProgressId = (courseId, userId = 'currentUser') => `progress_${userId}_${courseId}`;

const getQuizResultId = (courseId, userId = 'currentUser') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  return `quizresult_${userId}_${courseId}_${timestamp}`;
};

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
  }
`;

const CourseQuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, assessmentId } = useParams();
  const { course, quiz } = location.state || {};
  const [assessment, setAssessment] = useState(quiz);
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

        // Fetch assessment data if not provided
        if (!assessment && assessmentId) {
          const assessmentResponse = await fetch(`/api/assessments/${assessmentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (assessmentResponse.ok) {
            const assessmentData = await assessmentResponse.json();
            setAssessment(assessmentData.data.assessment);
          }
        }

      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    if ((!courseData || !assessment) && (courseId || assessmentId)) {
      fetchAssessmentData();
    } else {
      setLoading(false);
    }
  }, [courseId, assessmentId, courseData, assessment]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading assessment...</div>
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

  if (!courseData || !assessment) {
    return <div style={{ padding: 32 }}>Assessment not found.</div>;
  }

  const handleChange = (qIdx, oIdx) => {
    setAnswers({ ...answers, [qIdx]: oIdx });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assessments/${assessment._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionIndex, answerIndex]) => ({
            questionId: assessment.questions[parseInt(questionIndex)]._id,
            answer: answerIndex
          })),
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

  const correctCount = assessment.questions.reduce((acc, q, idx) => {
    const userAnswer = answers[idx];
    const correctAnswer = q.correctAnswer;
    return acc + (userAnswer === correctAnswer ? 1 : 0);
  }, 0);

  return (
    <Container>
      <h1 style={{ marginBottom: 24 }}>{courseData.title} - Assessment</h1>
      {!submitted ? (
        <>
          {assessment.questions.map((q, qIdx) => (
            <Section key={q._id || qIdx} style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>{q.question}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`quiz-${qIdx}`}
                      checked={answers[qIdx] === oIdx}
                      onChange={() => handleChange(qIdx, oIdx)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </Section>
          ))}
          <button
            onClick={handleSubmit}
            style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer', marginTop: 12 }}
          >
            Submit Assessment
          </button>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
            You scored {correctCount} out of {assessment.questions.length}!
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer', marginTop: 12 }}
          >
            Return to Course
          </button>
        </>
      )}
    </Container>
  );
};

export default CourseQuizPage; 