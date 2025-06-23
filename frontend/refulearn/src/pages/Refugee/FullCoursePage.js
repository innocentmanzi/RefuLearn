import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import db from '../../pouchdb';
import styled from 'styled-components';
import allCourses from '../../data/courses';

const getProgressId = (courseId, userId = 'currentUser') => `progress_${userId}_${courseId}`;

// Realistic resources and videos for each course
const courseResources = {
  'Basic English Communication': [
    { name: 'English Grammar PDF', link: 'https://www.ef.com/wwen/english-resources/english-grammar/' },
    { name: 'BBC Learning English', link: 'https://www.bbc.co.uk/learningenglish/' }
  ],
  'Digital Skills Fundamentals': [
    { name: 'Digital Literacy Guide', link: 'https://www.digitalliteracy.gov/' },
    { name: 'Google Digital Garage', link: 'https://learndigital.withgoogle.com/digitalgarage' }
  ],
  'Job Search Strategies': [
    { name: 'UNHCR Job Search Tips', link: 'https://www.unhcr.org/job-search-tips.html' },
    { name: 'Indeed Career Guide', link: 'https://www.indeed.com/career-advice' }
  ],
  'Professional Networking': [
    { name: 'LinkedIn Networking Tips', link: 'https://www.linkedin.com/pulse/10-tips-effective-networking-linkedin-editors/' },
    { name: 'Networking for Refugees', link: 'https://www.refugeeworksguide.org/networking' }
  ],
  'Advanced Programming': [
    { name: 'FreeCodeCamp Advanced JS', link: 'https://www.freecodecamp.org/news/javascript-projects-for-beginners/' },
    { name: 'MDN Web Docs', link: 'https://developer.mozilla.org/en-US/' }
  ],
  'Leadership Skills': [
    { name: 'MindTools Leadership', link: 'https://www.mindtools.com/pages/main/newMN_LDR.htm' },
    { name: 'UNHCR Leadership Training', link: 'https://www.unhcr.org/leadership-training.html' }
  ]
};

const courseVideos = {
  'Basic English Communication': [
    { title: 'English Conversation Practice', url: 'https://www.youtube.com/embed/WRy1pEc7Q4Y' },
    { title: 'Learn English in 30 Minutes', url: 'https://www.youtube.com/embed/eIho2S0ZahI' }
  ],
  'Digital Skills Fundamentals': [
    { title: 'Digital Literacy Skills', url: 'https://www.youtube.com/embed/8O8R6Fzj3zY' },
    { title: 'Computer Basics', url: 'https://www.youtube.com/embed/1zR7Qqk0q6w' }
  ],
  'Job Search Strategies': [
    { title: 'How to Find a Job', url: 'https://www.youtube.com/embed/9QbZV7vU5bA' },
    { title: 'Resume Writing Tips', url: 'https://www.youtube.com/embed/8uQqQyNd5vU' }
  ],
  'Professional Networking': [
    { title: 'Networking for Success', url: 'https://www.youtube.com/embed/6a6wPzFghpE' },
    { title: 'How to Network Effectively', url: 'https://www.youtube.com/embed/3Q8nIHD1b6Q' }
  ],
  'Advanced Programming': [
    { title: 'Advanced JavaScript', url: 'https://www.youtube.com/embed/PoRJizFvM7s' },
    { title: 'React Advanced Patterns', url: 'https://www.youtube.com/embed/IL82CzlaCys' }
  ],
  'Leadership Skills': [
    { title: 'Leadership Skills Overview', url: 'https://www.youtube.com/embed/5MgBikgcWnY' },
    { title: 'Effective Communication', url: 'https://www.youtube.com/embed/HAnw168huqA' }
  ]
};

const modulesData = {
  'Basic English Communication': [
    {
      title: 'Introduction',
      content: 'Welcome to the course! This module introduces the main topics.',
      resources: [
        { name: 'English Grammar PDF', link: 'https://www.ef.com/wwen/english-resources/english-grammar/' }
      ],
      video: { title: 'Learn English in 30 Minutes', url: 'https://www.youtube.com/embed/eIho2S0ZahI' }
    },
    {
      title: 'Core Concepts',
      content: 'Learn the essential concepts for this course.',
      resources: [
        { name: 'BBC Learning English', link: 'https://www.bbc.co.uk/learningenglish/' }
      ],
      video: { title: 'English Conversation for Beginners', url: 'https://www.youtube.com/embed/1Bix44C1EzY' }
    },
    {
      title: 'Practical Application',
      content: 'Apply what you have learned in real-world scenarios.',
      resources: [],
      video: { title: 'English Speaking Practice', url: 'https://www.youtube.com/embed/8zQdK3y1QdA' }
    },
    {
      title: 'Assessment',
      content: 'Test your knowledge with a final assessment.',
      resources: [],
      video: null
    }
  ],
  // Add similar module arrays for other courses...
};

const sectionStyle = {
  marginBottom: 32,
  paddingBottom: 24,
  borderBottom: '1px solid #eee'
};

// Sample quiz questions per course
const courseQuizzes = {
  'Basic English Communication': [
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
  'Digital Skills Fundamentals': [
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
  'Job Search Strategies': [
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
  'Professional Networking': [
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
  ],
  'Advanced Programming': [
    {
      question: 'Which of these is a JavaScript framework?',
      options: ['React', 'Photoshop', 'Excel', 'Word'],
      answer: 0
    },
    {
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Advanced Program Integration', 'Applied Programming Internet', 'None'],
      answer: 0
    },
    {
      question: 'Which is used for version control?',
      options: ['Git', 'Paint', 'PowerPoint', 'Zoom'],
      answer: 0
    }
  ],
  'Leadership Skills': [
    {
      question: 'A good leader should be...',
      options: ['Authoritative', 'Inspiring', 'Unapproachable', 'Indecisive'],
      answer: 1
    },
    {
      question: 'What is important for team success?',
      options: ['Clear communication', 'Ignoring feedback', 'Micromanaging', 'Blaming others'],
      answer: 0
    },
    {
      question: 'Which is a leadership style?',
      options: ['Democratic', 'Chaotic', 'Lazy', 'Silent'],
      answer: 0
    }
  ]
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

const FullCoursePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  let course = location.state;

  if (!course && id) {
    course = allCourses.find(c => String(c.id) === String(id));
  }

  const [completedModules, setCompletedModules] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [openModule, setOpenModule] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState({});

  useEffect(() => {
    if (!course) return;
    db.get(getProgressId(course.id)).then(doc => {
      setCompletedModules(doc.completedModules || []);
      setWatchedVideos(doc.watchedVideos || []);
      setQuizCompleted(doc.quizCompleted || false);
      setLoading(false);
    }).catch(() => {
      setCompletedModules([]);
      setWatchedVideos([]);
      setQuizCompleted(false);
      setLoading(false);
    });
    // Fetch quiz history for this course
    db.allDocs({ include_docs: true, startkey: `quizresult_currentUser_${course.id}_`, endkey: `quizresult_currentUser_${course.id}_\ufff0` })
      .then(result => {
        setQuizHistory(result.rows.map(row => row.doc).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      });
  }, [course]);

  // Mark module as completed when scrolled into view
  const handleModuleInView = idx => {
    if (!completedModules.includes(idx)) {
      const updated = [...completedModules, idx];
      setCompletedModules(updated);
      db.put({
        _id: getProgressId(course.id),
        completedModules: updated,
        watchedVideos,
        quizCompleted,
        courseId: course.id
      }).catch(err => {
        if (err.status === 409) {
          db.get(getProgressId(course.id)).then(doc => {
            db.put({ ...doc, completedModules: updated });
          });
        }
      });
    }
  };

  // Mark video as watched
  const handleMarkWatched = idx => {
    if (!watchedVideos.includes(idx)) {
      const updated = [...watchedVideos, idx];
      setWatchedVideos(updated);
      db.put({
        _id: getProgressId(course.id),
        completedModules,
        watchedVideos: updated,
        quizCompleted,
        courseId: course.id
      }).catch(err => {
        if (err.status === 409) {
          db.get(getProgressId(course.id)).then(doc => {
            db.put({ ...doc, watchedVideos: updated });
          });
        }
      });
    }
  };

  // Mark quiz as completed
  const handleQuizComplete = () => {
    setQuizCompleted(true);
    db.put({
      _id: getProgressId(course.id),
      completedModules,
      watchedVideos,
      quizCompleted: true,
      courseId: course.id
    }).catch(err => {
      if (err.status === 409) {
        db.get(getProgressId(course.id)).then(doc => {
          db.put({ ...doc, quizCompleted: true });
        });
      }
    });
  };

  // Progress calculation
  const modulesCount = modulesData[course.title]?.length || 0;
  const videosCount = (courseVideos[course.title] || []).length;
  const moduleProgress = modulesCount ? (completedModules.length / modulesCount) * 50 : 0;
  const videoProgress = videosCount ? (watchedVideos.length / videosCount) * 25 : 0;
  const quizProgress = quizCompleted ? 25 : 0;
  const progress = Math.round(moduleProgress + videoProgress + quizProgress);

  // Comments
  const handleAddComment = () => {
    if (commentInput.trim()) {
      setComments([...comments, commentInput.trim()]);
      setCommentInput('');
    }
  };

  // Export quiz history as CSV
  const handleExportCSV = () => {
    if (!quizHistory.length) return;
    const header = ['Attempt', 'Date', 'Score', 'Total', 'Question', 'Your Answer', 'Correct Answer'];
    let rows = [header.join(',')];
    quizHistory.forEach((attempt, idx) => {
      const attemptNum = quizHistory.length - idx;
      const date = new Date(attempt.timestamp).toLocaleString();
      const score = attempt.score;
      const total = attempt.total;
      const quiz = courseQuizzes[course.title] || [];
      quiz.forEach((q, qIdx) => {
        const userAns = typeof attempt.answers[qIdx] !== 'undefined' ? q.options[attempt.answers[qIdx]] : '';
        const correctAns = q.options[q.answer];
        rows.push([attemptNum, date, score, total, q.question.replace(/,/g, ' '), userAns.replace(/,/g, ' '), correctAns.replace(/,/g, ' ')].join(','));
      });
    });
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/\s+/g, '_')}_quiz_history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!course) {
    return <div style={{ padding: 32 }}>No course details found.</div>;
  }

  const resources = courseResources[course.title] || [];
  const videos = courseVideos[course.title] || [];
  const quiz = courseQuizzes[course.title] || [];
  const modules = modulesData[course.title] || [];

  return (
    <Container>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#3498db', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 24px', cursor: 'pointer' }}>Back</button>
      {/* Course Overview */}
      <Section>
        <img src={course.image} alt={course.title} style={{ width: '100%', borderRadius: 12, marginBottom: 20, maxHeight: 260, objectFit: 'cover' }} />
        <h1 style={{ margin: '0 0 8px 0' }}>{course.title}</h1>
        <div style={{ color: '#888', marginBottom: 8, fontWeight: 500 }}>
          <span style={{ marginRight: 16 }}>Level: <b>{course.level}</b></span>
          <span style={{ marginRight: 16 }}>Duration: <b>{course.duration}</b></span>
          <span>{course.students}+ students</span>
        </div>
        {course.description && <div style={{ color: '#555', marginBottom: 0 }}>{course.description}</div>}
      </Section>
      {/* Progress */}
      <Section>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Progress: {progress}%</div>
        <div style={{ background: '#eee', borderRadius: 8, height: 12, width: '100%', marginBottom: 8 }}>
          <div style={{ width: `${progress}%`, background: '#3498db', height: '100%', borderRadius: 8, transition: 'width 0.3s' }} />
        </div>
      </Section>
      {/* Modules */}
      <Section>
        <h2 style={{ marginBottom: 16 }}>Modules</h2>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {modules.map((mod, idx) => (
            <li key={idx} style={{ marginBottom: 18 }}>
              <div
                style={{ cursor: 'pointer', color: completedModules.includes(idx) ? '#27ae60' : '#333', fontWeight: completedModules.includes(idx) ? 600 : 400 }}
                onClick={() => setOpenModule(openModule === idx ? null : idx)}
                onMouseEnter={() => handleModuleInView(idx)}
              >
                {mod.title}
              </div>
              {openModule === idx && (
                <div style={{ marginLeft: 12, color: '#555', marginTop: 8 }}>
                  <div style={{ marginBottom: 8 }}>{mod.content}</div>
                  {mod.resources && mod.resources.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <b>Resources:</b>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        {mod.resources.map((res, rIdx) => (
                          <li key={rIdx} style={{ marginBottom: 6 }}>
                            <a href={res.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'underline' }}>{res.name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {mod.video && (
                    <div style={{ marginBottom: 8 }}>
                      <b>{mod.video.title}</b>
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, marginBottom: 8 }}>
                        <iframe
                          src={mod.video.url}
                          title={mod.video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>
      {/* Resources */}
      <Section>
        <h2 style={{ marginBottom: 16 }}>Resources</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {resources.map((res, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              <a href={res.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'underline' }}>{res.name}</a>
            </li>
          ))}
        </ul>
        
        {/* Q&A Forum for this course */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>📚 Course Q&A Forum</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#555', lineHeight: 1.6 }}>
            Have questions about this course? Ask your instructor and fellow students for help. 
            This is a great place to clarify concepts, share insights, and learn from others.
          </p>
          
          {/* Sample Q&A for this course */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#2c3e50', fontSize: '1rem' }}>Recent Questions</h4>
            <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, color: '#3498db', fontSize: '0.9rem' }}>How do I practice the concepts from Module 2?</h5>
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>2 hours ago</span>
              </div>
              <p style={{ margin: '0 0 6px 0', color: '#555', fontSize: '0.85rem' }}>
                I'm having trouble understanding the practical application. Can someone help me with exercises?
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#6c757d' }}>
                <span>👤 by Ahmed H.</span>
                <span>💬 3 answers</span>
                <span>👍 5 votes</span>
              </div>
            </div>
            
            <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, color: '#3498db', fontSize: '0.9rem' }}>Is there additional material for advanced learners?</h5>
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>1 day ago</span>
              </div>
              <p style={{ margin: '0 0 6px 0', color: '#555', fontSize: '0.85rem' }}>
                I found the course very helpful but would like to explore more advanced topics.
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#6c757d' }}>
                <span>👤 by Maria R.</span>
                <span>💬 1 answer</span>
                <span>👍 2 votes</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/qa-forum', { state: { courseFilter: course.title } })}
              style={{ 
                background: '#3498db', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '0.6rem 1rem', 
                cursor: 'pointer', 
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              📝 Ask a Question
            </button>
            <button
              onClick={() => navigate('/qa-forum')}
              style={{ 
                background: '#27ae60', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '0.6rem 1rem', 
                cursor: 'pointer', 
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              🔍 View All Questions
            </button>
          </div>
        </div>
      </Section>
      {/* Videos */}
      <Section>
        <h2 style={{ marginBottom: 16 }}>Videos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {videos.map((vid, idx) => (
            <div key={idx}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>{vid.title}</div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, marginBottom: 8 }}>
                <iframe
                  src={vid.url}
                  title={vid.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 }}
                />
              </div>
              <button
                onClick={() => handleMarkWatched(idx)}
                disabled={watchedVideos.includes(idx)}
                style={{ background: watchedVideos.includes(idx) ? '#27ae60' : '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: watchedVideos.includes(idx) ? 'default' : 'pointer' }}
              >
                {watchedVideos.includes(idx) ? 'Watched' : 'Mark as Watched'}
              </button>
            </div>
          ))}
        </div>
      </Section>
      {/* Quiz */}
      {quiz.length > 0 && (
        <Section>
          <h2 style={{ marginBottom: 16 }}>Quiz</h2>
          <button
            onClick={() => navigate(`/courses/quiz/${course.id}`, { state: { course, quiz } })}
            style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer', marginBottom: 12 }}
            disabled={quizCompleted}
          >
            {quizCompleted ? 'Quiz Completed' : 'Start Quiz'}
          </button>
        </Section>
      )}
      {/* Comments */}
      <Section>
        <h2 style={{ marginBottom: 16 }}>Comments</h2>
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            placeholder="Leave a comment..."
            style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid #ccc', padding: 8, fontSize: 16 }}
          />
          <button
            onClick={handleAddComment}
            style={{ marginTop: 8, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 16 }}
          >
            Add Comment
          </button>
        </div>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {comments.map((c, idx) => (
            <li key={idx} style={{ marginBottom: 12, background: '#f7f7f7', borderRadius: 8, padding: 12 }}>
              {c}
            </li>
          ))}
        </ul>
      </Section>
      {/* Quiz History */}
      {quizHistory.length > 0 && (
        <Section>
          <h2 style={{ marginBottom: 12 }}>Quiz History</h2>
          <button onClick={handleExportCSV} style={{ marginBottom: 16, background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 16 }}>Export Results</button>
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {quizHistory.map((attempt, idx) => {
              const attemptNum = quizHistory.length - idx;
              const quiz = courseQuizzes[course.title] || [];
              return (
                <li key={attempt._id} style={{ marginBottom: 10, background: '#f7f7f7', borderRadius: 8, padding: 10 }}>
                  <span style={{ fontWeight: 500 }}>Attempt {attemptNum}:</span> &nbsp;
                  <span>Date: {new Date(attempt.timestamp).toLocaleString()}</span> &nbsp;|&nbsp;
                  <span>Score: {attempt.score} / {attempt.total}</span>
                  <button
                    onClick={() => setDetailsOpen({ ...detailsOpen, [attempt._id]: !detailsOpen[attempt._id] })}
                    style={{ marginLeft: 16, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 14 }}
                  >
                    {detailsOpen[attempt._id] ? 'Hide Details' : 'View Details'}
                  </button>
                  {detailsOpen[attempt._id] && (
                    <ul style={{ marginTop: 10, paddingLeft: 20 }}>
                      {quiz.map((q, qIdx) => {
                        const userAnsIdx = attempt.answers[qIdx];
                        const userAns = typeof userAnsIdx !== 'undefined' ? q.options[userAnsIdx] : '(No answer)';
                        const correctAns = q.options[q.answer];
                        const isCorrect = userAnsIdx === q.answer;
                        return (
                          <li key={qIdx} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 500 }}>{q.question}</div>
                            <div style={{ marginLeft: 8 }}>
                              Your answer: <span style={{ color: isCorrect ? 'green' : 'red', fontWeight: 600 }}>{userAns}</span>
                              {!isCorrect && (
                                <span> &nbsp;|&nbsp; Correct: <span style={{ color: 'green', fontWeight: 600 }}>{correctAns}</span></span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </Container>
  );
};

export default FullCoursePage; 