import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../../pouchdb';
import styled from 'styled-components';

const QUIZ_DURATION_MINUTES = 10;

// Quiz data for each assessment (id matches assessmentsData in Assessments.js)
const assessmentQuizzes = {
  1: [
    {
      question: 'Which of the following is a greeting in English?',
      options: ['Bonjour', 'Hello', 'Ciao', 'Hola'],
      answer: 1
    },
    {
      question: 'What is the past tense of "go"?',
      options: ['Goed', 'Went', 'Go', 'Gone'],
      answer: 1
    },
    {
      question: 'Which word is a noun?',
      options: ['Run', 'Beautiful', 'Happiness', 'Quickly'],
      answer: 2
    }
  ],
  2: [
    {
      question: 'What does "URL" stand for?',
      options: ['Uniform Resource Locator', 'Universal Reference Link', 'User Resource List', 'Unified Routing Logic'],
      answer: 0
    },
    {
      question: 'Which device is used to input text?',
      options: ['Monitor', 'Keyboard', 'Speaker', 'Printer'],
      answer: 1
    },
    {
      question: 'Which of these is a web browser?',
      options: ['Windows', 'Chrome', 'Excel', 'Word'],
      answer: 1
    }
  ],
  3: [
    {
      question: 'What is a CV also known as?',
      options: ['Cover Letter', 'Resume', 'Reference', 'Portfolio'],
      answer: 1
    },
    {
      question: 'Which is important for a job interview?',
      options: ['Arriving late', 'Dressing appropriately', 'Not preparing', 'Interrupting'],
      answer: 1
    },
    {
      question: 'Where can you search for jobs online?',
      options: ['Indeed', 'Netflix', 'Spotify', 'YouTube'],
      answer: 0
    }
  ],
  4: [
    {
      question: 'Which platform is best for professional networking?',
      options: ['Instagram', 'LinkedIn', 'Snapchat', 'Reddit'],
      answer: 1
    },
    {
      question: 'What should you do at a networking event?',
      options: ['Stay silent', 'Introduce yourself', 'Ignore others', 'Leave early'],
      answer: 1
    },
    {
      question: 'What is a business card used for?',
      options: ['Playing games', 'Sharing contact info', 'Drawing', 'Cooking'],
      answer: 1
    }
  ]
};

const getQuizResultId = (assessmentId, userId = 'currentUser') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  return `assessmentresult_${userId}_${assessmentId}_${timestamp}`;
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

const AssessmentQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const assessmentId = parseInt(id, 10);
  const quiz = assessmentQuizzes[assessmentId] || [];
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_MINUTES * 60); // seconds
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 && !finished) {
      setFinished(true);
    }
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (qIdx, oIdx) => {
    setAnswers({ ...answers, [qIdx]: oIdx });
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this quiz? Your progress will not be saved.')) {
      navigate('/assessments');
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setFinished(true);
    // Save result to PouchDB, including time left
    const score = quiz.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0);
    const total = quiz.length;
    const timestamp = new Date().toISOString();
    db.put({
      _id: getQuizResultId(assessmentId),
      userId: 'currentUser',
      assessmentId,
      answers,
      score,
      total,
      timestamp,
      timeLeft // save seconds left
    });
  };

  const correctCount = quiz.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0);

  return (
    <Container>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#3498db', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 24px', cursor: 'pointer' }}>Back</button>
      <h1>Assessment #{id} - Quiz</h1>
      <div style={{ margin: '16px 0', fontWeight: 600, color: finished ? '#e74c3c' : '#3498db' }}>
        Time Left: {formatTime(timeLeft)}
      </div>
      {finished ? (
        <div style={{ color: '#e74c3c', fontWeight: 600, marginTop: 24 }}>
          {submitted ? (
            <>
              <div style={{ color: '#222', marginBottom: 16 }}>
                Quiz submitted!<br />You scored {correctCount} out of {quiz.length}.
              </div>
              <button onClick={() => navigate('/assessments')} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer', marginTop: 12 }}>
                Return to Assessments
              </button>
            </>
          ) : (
            <>
              Time is up! Your quiz has ended.<br />
              <button onClick={handleSubmit} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer', marginTop: 12 }}>
                Submit Quiz
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginTop: 24, color: '#555' }}>
            {quiz.length === 0 ? (
              <div>No quiz available for this assessment.</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                {quiz.map((q, qIdx) => (
                  <div key={qIdx} style={{ marginBottom: 28 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>{q.question}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt, oIdx) => (
                        <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`quiz-${qIdx}`}
                            checked={answers[qIdx] === oIdx}
                            onChange={() => handleChange(qIdx, oIdx)}
                            disabled={finished}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                  <button type="button" onClick={handleCancel} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer' }}>
                    Submit Quiz
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default AssessmentQuizPage; 