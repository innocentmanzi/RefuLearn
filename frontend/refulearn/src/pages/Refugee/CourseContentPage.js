import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import allCourses from '../../data/courses';
import styled from 'styled-components';
import db from '../../pouchdb';
import modulesData from './FullCoursePage'; // If modulesData is not exported, copy the relevant structure here

const Container = styled.div`
  padding: 2rem 2.5rem;
  max-width: 900px;
  margin: 0 auto;
`;
const Section = styled.div`
  margin-bottom: 2.5rem;
`;
const ProgressBar = styled.div`
  background: #eee;
  border-radius: 8px;
  height: 14px;
  width: 100%;
  margin-bottom: 12px;
`;
const ProgressFill = styled.div`
  background: #3498db;
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s;
`;

const CourseContentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  let course = location.state;
  if (!course && id) {
    course = allCourses.find(c => String(c.id) === String(id));
  }
  const modules = (typeof modulesData === 'object' && modulesData[course?.title]) || [];

  // Progress and started state
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    // Check PouchDB for started flag
    const checkStarted = async () => {
      try {
        const doc = await db.get(`enrolled_${id}`);
        if (doc.started) {
          setStarted(true);
        } else {
          navigate(`/courses/full/${id}`);
        }
      } catch (err) {
        navigate(`/courses/full/${id}`);
      }
    };
    checkStarted();
    // For demo, set progress to 30% if modules exist
    if (modules.length > 0) setProgress(30);
  }, [id, modules, navigate]);

  if (!course) {
    return <Container>No course data found.</Container>;
  }
  if (!started) {
    return null; // Or a loading spinner
  }

  return (
    <Container>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#3498db', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 24px', cursor: 'pointer' }}>Back</button>
      <Section>
        <h1>{course.title}</h1>
        <div style={{ color: '#555', marginBottom: 0 }}>{course.description}</div>
      </Section>
      <Section id="modules-section">
        <h2>Modules</h2>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {modules.map((mod, idx) => (
            <li key={idx} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 6 }}>{mod.title}</div>
              <div style={{ color: '#555', marginBottom: 8 }}>{mod.content}</div>
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
              {/* Add quizzes and assessments here if available in your data structure */}
            </li>
          ))}
        </ol>
      </Section>
    </Container>
  );
};

export default CourseContentPage; 