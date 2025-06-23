import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
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
  const { course, quiz } = location.state || {};
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!course || !quiz) {
    return <div style={{ padding: 32 }}>Quiz not found.</div>;
  }

  const handleChange = (qIdx, oIdx) => {
    setAnswers({ ...answers, [qIdx]: oIdx });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Mark quiz as completed in PouchDB
    db.get(getProgressId(course.id)).then(doc => {
      db.put({ ...doc, quizCompleted: true });
    }).catch(() => {
      db.put({ _id: getProgressId(course.id), quizCompleted: true, courseId: course.id });
    });
    // Save quiz result for analytics
    const score = quiz.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0);
    const total = quiz.length;
    const timestamp = new Date().toISOString();
    db.put({
      _id: getQuizResultId(course.id),
      userId: 'currentUser',
      courseId: course.id,
      courseTitle: course.title,
      answers,
      score,
      total,
      timestamp
    });
  };

  const correctCount = quiz.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0);

  return (
    <Container>
      <h1 style={{ marginBottom: 24 }}>{course.title} - Quiz</h1>
      {!submitted ? (
        <>
          {quiz.map((q, qIdx) => (
            <Section key={qIdx} style={{ marginBottom: 28 }}>
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
            Submit Quiz
          </button>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
            You scored {correctCount} out of {quiz.length}!
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