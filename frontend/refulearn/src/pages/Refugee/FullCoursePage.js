import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import db from '../../pouchdb';
import ContentWrapper from '../../components/ContentWrapper';
import allCourses from '../../data/courses';
import { courseModules } from '../../data/courseContent';
import { FaLock, FaCheckCircle } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem 2.5rem 2rem 2.5rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem 0;
  &:hover { text-decoration: underline; }
`;

const CourseHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const CourseImage = styled.div`
  height: 300px;
  background: ${({ image }) => `url(${image}) center/cover`};
  border-radius: 12px;
  position: relative;
  @media (max-width: 768px) { height: 200px; }
`;

const CourseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CourseTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  @media (max-width: 768px) { font-size: 2rem; }
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
`;

const CourseMeta = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MetaLabel = styled.span`
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
`;

const MetaValue = styled.span`
  color: #333;
  font-size: 1rem;
  font-weight: 600;
`;

const LevelBadge = styled.span`
  background: ${({ level }) => 
    level === 'Beginner' ? '#4CAF50' :
    level === 'Intermediate' ? '#FFC107' :
    '#F44336'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  align-self: flex-start;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const Overview = styled.div`
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  p { color: #555; line-height: 1.7; margin: 0; white-space: pre-line; }
`;

const ObjectivesTwoCol = styled.div`
  display: flex;
  gap: 2rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ObjectivesCol = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const ObjectiveItem = styled.li`
  display: flex;
  align-items: center;
  font-size: 1.08rem;
  color: #222;
  margin-bottom: 0.5rem;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
`;

const CurriculumSection = styled.div`
  margin-bottom: 2rem;
`;

const CurriculumList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CurriculumItem = styled.li`
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e1e5e9;
  transition: box-shadow 0.2s;
  box-shadow: none;
`;

const ModuleTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModuleContent = styled.div`
  margin-top: 1rem;
  color: #444;
`;

const VideoWrapper = styled.div`
  margin: 1rem 0;
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 8px;
  iframe {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;
  }
`;

const ResourceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
`;

const ResourceItem = styled.li`
  margin-bottom: 0.5rem;
  a { color: #3498db; text-decoration: underline; }
`;

const QuizSection = styled.div`
  margin-top: 1.5rem;
  background: #f4f8fb;
  border-radius: 8px;
  padding: 1rem 1.5rem;
`;

const QuizQuestion = styled.div`
  margin-bottom: 1rem;
  font-weight: 500;
`;

const QuizOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const QuizOption = styled.button`
  background: #fff;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 0.7rem 1rem;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s, border 0.2s;
  &:hover { background: #eaf6fb; border-color: #3498db; }
  &.correct { background: #d4edda; border-color: #28a745; color: #155724; }
  &.incorrect { background: #f8d7da; border-color: #dc3545; color: #721c24; }
`;

const QuizExplanation = styled.div`
  margin-top: 0.5rem;
  color: #888;
  font-size: 0.95rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const EnrollButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.secondary}; transform: translateY(-2px); }
`;

const InstructorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0 1rem 0;
`;

const InstructorAvatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
`;

const InstructorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const InstructorName = styled.div`
  font-weight: 600;
  color: #333;
`;

const InstructorRole = styled.div`
  color: #888;
  font-size: 0.95rem;
`;

const Rating = styled.div`
  color: #f1c40f;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.2rem;
`;

const LockedOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  border-radius: 8px;
`;

const ModuleSummaryTitle = styled.div`
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
`;

const ModuleSummaryList = styled.ul`
  list-style: none;
  padding: 0 0 0 1.2rem;
  margin: 0 0 1rem 0;
`;

const ModuleSummaryItem = styled.li`
  color: #444;
  margin-bottom: 0.3rem;
  font-size: 1rem;
`;

const WeekLabel = styled.span`
  display: inline-block;
  background: #eaf6fb;
  color: #3498db;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.2rem 0.9rem;
  font-size: 0.98rem;
  margin-right: 1rem;
`;

const ResourceLink = styled.a`
  color: #3498db;
  text-decoration: underline;
  margin-right: 1rem;
  &:hover { text-decoration: underline; color: #217dbb; }
`;

const VideoLink = styled.a`
  color: #16a085;
  text-decoration: underline;
  margin-right: 1rem;
  &:hover { text-decoration: underline; color: #117864; }
`;

const StartButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #219150; }
`;

const CompletedMark = styled.span`
  color: #27ae60;
  font-weight: bold;
  margin-left: auto;
  margin-right: 0;
  display: flex;
  align-items: center;
  font-size: 1.3rem;
`;

const SubItemTick = styled.span`
  color: #27ae60;
  font-weight: bold;
  margin-left: 8px;
  font-size: 1.1rem;
  vertical-align: middle;
`;

const FullCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [enrolled, setEnrolled] = useState(false);
  const [course, setCourse] = useState(null);
  const [completedModules, setCompletedModules] = useState([0, 1]); // For demo, first two modules completed
  const [completedSubItems, setCompletedSubItems] = useState({}); // { [moduleIdx]: { resources: [idx], videos: [idx], quizzes: [idx], assignments: [idx] } }
  const [expandedModule, setExpandedModule] = useState(null);
  const prevCourseId = useRef(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});

  useEffect(() => {
    // Get course from location state or find by ID
    if (location.state) {
      setCourse(location.state);
    } else {
      const foundCourse = allCourses.find(c => c.id === parseInt(id));
      setCourse(foundCourse);
    }
    // Check if user is enrolled
    db.get(`enrolled_${id}`).then(doc => {
      setEnrolled(true);
    }).catch(() => {
      setEnrolled(false);
    });
  }, [id, location.state]);

  useEffect(() => {
    if (!course) return;
    const modules = courseModules[course.title] || [];
    if (!modules.length) return;
    modules.forEach((mod, idx) => {
      const sub = completedSubItems[idx] || { resources: [], videos: [], quizzes: [], assignments: [] };
      const allResourcesDone = mod.resources ? mod.resources.length > 0 && mod.resources.every((_, i) => sub.resources.includes(i)) : true;
      const allVideosDone = mod.video ? sub.videos.includes(0) : true;
      const allQuizzesDone = mod.quiz ? mod.quiz.length > 0 && mod.quiz.every((_, i) => sub.quizzes.includes(i)) : true;
      const allAssignmentsDone = mod.assignments ? mod.assignments.length > 0 && mod.assignments.every((_, i) => sub.assignments.includes(i)) : true;
      const moduleDone = allResourcesDone && allVideosDone && allQuizzesDone && allAssignmentsDone;
      if (moduleDone && !completedModules.includes(idx)) {
        setCompletedModules(prev => [...prev, idx]);
      }
    });
    // eslint-disable-next-line
  }, [completedSubItems, course]);

  // Restore expandedModule from localStorage per course, only when course changes
  useEffect(() => {
    if (course && course.id !== prevCourseId.current) {
      const expandedKey = `expandedModule_${course.id}`;
      const saved = localStorage.getItem(expandedKey);
      setExpandedModule(saved !== null ? Number(saved) : null);
      prevCourseId.current = course.id;
    }
  }, [course]);

  // Persist expandedModule to localStorage per course
  useEffect(() => {
    if (course) {
      const expandedKey = `expandedModule_${course.id}`;
      if (expandedModule === null) {
        localStorage.removeItem(expandedKey);
      } else {
        localStorage.setItem(expandedKey, expandedModule);
      }
    }
  }, [expandedModule, course]);

  if (!course) {
    return (
      <ContentWrapper>
        <Container>Loading...</Container>
      </ContentWrapper>
    );
  }

  const modules = courseModules[course.title] || [];

  const handleEnroll = async () => {
    try {
      await db.put({
        _id: `enrolled_${course.id}`,
        courseId: course.id,
        enrolledAt: new Date().toISOString(),
        progress: 0
      });
      setEnrolled(true);
      // Optionally, scroll to curriculum after enrolling
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const handleExpandModule = (idx) => {
    setExpandedModule(expandedModule === idx ? null : idx);
  };

  const handleQuizAnswer = (moduleIdx, qIdx, selectedIdx) => {
    setQuizAnswers(prev => ({ ...prev, [`${moduleIdx}_${qIdx}`]: selectedIdx }));
    const module = courseModules[course.title][moduleIdx];
    const question = module.quiz[qIdx];
    setQuizResults(prev => ({
      ...prev,
      [`${moduleIdx}_${qIdx}`]: selectedIdx === question.answer
    }));
  };

  // Instructor mock data (can be dynamic)
  const instructor = {
    name: 'Jacqueline Miller',
    role: 'Founder Eduport company',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.5
  };

  return (
    <ContentWrapper>
      <Container>
        <BackButton onClick={() => navigate('/courses')}>
          ← Back to Courses
        </BackButton>

        <CourseHeader>
          <CourseImage image={course.image} />
          <CourseInfo>
            <CourseTitle>{course.title}</CourseTitle>
            <CourseDescription>{course.description}</CourseDescription>
            <LevelBadge level={course.level}>{course.level}</LevelBadge>
            <CourseMeta>
              <MetaItem>
                <MetaLabel>Duration</MetaLabel>
                <MetaValue>{course.duration}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Students</MetaLabel>
                <MetaValue>{course.students}+ enrolled</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Category</MetaLabel>
                <MetaValue>{course.category}</MetaValue>
              </MetaItem>
            </CourseMeta>
            <ActionButtons>
              {enrolled ? null : (
                <EnrollButton onClick={handleEnroll}>
                  Enroll Now
                </EnrollButton>
              )}
            </ActionButtons>
          </CourseInfo>
        </CourseHeader>

        {/* Instructor Section */}
        <InstructorSection>
          <InstructorAvatar src={instructor.avatar} alt={instructor.name} />
          <InstructorInfo>
            <InstructorName>By {instructor.name}</InstructorName>
            <InstructorRole>{instructor.role}</InstructorRole>
            <Rating>★ {instructor.rating}/5.0</Rating>
          </InstructorInfo>
        </InstructorSection>

        <Section>
          <SectionTitle>Course Overview</SectionTitle>
          <Overview>
            <p>{course.overview}</p>
          </Overview>
        </Section>

        <Section>
          <SectionTitle>Modules</SectionTitle>
          <CurriculumSection>
            <CurriculumList>
              {modules.map((mod, idx) => {
                let label = '';
                if (mod.weeks) {
                  if (mod.weeks.length === 1) {
                    label = `Week ${mod.weeks[0]}. `;
                  } else {
                    label = `Weeks ${mod.weeks[0]}-${mod.weeks[mod.weeks.length-1]}. `;
                  }
                } else {
                  label = `Week ${idx + 1}. `;
                }
                const isCompleted = completedModules.includes(idx);
                const isExpanded = expandedModule === idx;
                // Sub-item completion logic
                const sub = completedSubItems[idx] || { resources: [], videos: [], quizzes: [], assignments: [] };
                const allResourcesDone = mod.resources ? mod.resources.length > 0 && mod.resources.every((_, i) => sub.resources.includes(i)) : true;
                const allVideosDone = mod.video ? sub.videos.includes(0) : true;
                const allQuizzesDone = mod.quiz ? mod.quiz.length > 0 && mod.quiz.every((_, i) => sub.quizzes.includes(i)) : true;
                const allAssignmentsDone = mod.assignments ? mod.assignments.length > 0 && mod.assignments.every((_, i) => sub.assignments.includes(i)) : true;
                const moduleDone = allResourcesDone && allVideosDone && allQuizzesDone && allAssignmentsDone;
                return (
                  <CurriculumItem
                    key={mod.id || idx}
                    style={{ background: moduleDone ? '#f6fff6' : undefined, fontWeight: moduleDone ? 'bold' : undefined, position: 'relative' }}
                    onClick={() => setExpandedModule(isExpanded ? null : idx)}
                  >
                    <div style={{ flex: 1 }}>
                      <span>{label}{mod.title || mod}</span>
                      {isExpanded && (
                        <div style={{ marginTop: 12 }}>
                          <div>{mod.content}</div>
                          {mod.video && (
                            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center' }}>
                              <a
                                href={mod.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3498db', textDecoration: 'underline', fontWeight: 600 }}
                                onClick={e => {
                                  e.preventDefault();
                                  setCompletedSubItems(prev => ({
                                    ...prev,
                                    [idx]: {
                                      ...prev[idx],
                                      videos: prev[idx]?.videos?.includes(0) ? prev[idx].videos : [...(prev[idx]?.videos || []), 0],
                                      resources: prev[idx]?.resources || [],
                                      quizzes: prev[idx]?.quizzes || [],
                                      assignments: prev[idx]?.assignments || []
                                    }
                                  }));
                                  window.open(mod.video, '_blank', 'noopener');
                                }}
                              >
                                Watch Video
                              </a>
                              {sub.videos.includes(0) && <SubItemTick>✔️</SubItemTick>}
                            </div>
                          )}
                          {mod.resources && mod.resources.length > 0 && (
                            <ResourceList>
                              {mod.resources.map((res, i) => (
                                <ResourceItem key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                  <a
                                    href={res.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => {
                                      e.preventDefault();
                                      setCompletedSubItems(prev => ({
                                        ...prev,
                                        [idx]: {
                                          ...prev[idx],
                                          resources: prev[idx]?.resources?.includes(i) ? prev[idx].resources : [...(prev[idx]?.resources || []), i],
                                          videos: prev[idx]?.videos || [],
                                          quizzes: prev[idx]?.quizzes || [],
                                          assignments: prev[idx]?.assignments || []
                                        }
                                      }));
                                      window.open(res.link, '_blank', 'noopener');
                                    }}
                                  >
                                    {res.name}
                                  </a>
                                  {sub.resources.includes(i) && <SubItemTick>✔️</SubItemTick>}
                                </ResourceItem>
                              ))}
                            </ResourceList>
                          )}
                          {mod.quiz && mod.quiz.length > 0 && (
                            <QuizSection>
                              {mod.quiz.map((q, qIdx) => {
                                const userAnswer = quizAnswers[`${idx}_${qIdx}`];
                                const isAnswered = typeof userAnswer !== 'undefined';
                                const isCorrect = quizResults[`${idx}_${qIdx}`];
                                return (
                                  <div key={qIdx} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                      <QuizQuestion>{q.question}</QuizQuestion>
                                      <QuizOptions>
                                        {q.options.map((opt, oIdx) => (
                                          <QuizOption
                                            key={oIdx}
                                            className={
                                              isAnswered
                                                ? userAnswer === oIdx
                                                  ? isCorrect
                                                    ? 'correct'
                                                    : 'incorrect'
                                                  : ''
                                                : ''
                                            }
                                            onClick={() => {
                                              handleQuizAnswer(idx, qIdx, oIdx);
                                              setCompletedSubItems(prev => ({
                                                ...prev,
                                                [idx]: {
                                                  ...prev[idx],
                                                  quizzes: prev[idx]?.quizzes?.includes(qIdx) ? prev[idx].quizzes : [...(prev[idx]?.quizzes || []), qIdx],
                                                  resources: prev[idx]?.resources || [],
                                                  videos: prev[idx]?.videos || [],
                                                  assignments: prev[idx]?.assignments || []
                                                }
                                              }));
                                            }}
                                            disabled={isAnswered}
                                          >
                                            {opt}
                                          </QuizOption>
                                        ))}
                                      </QuizOptions>
                                      {isAnswered && (
                                        <QuizExplanation>
                                          {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
                                        </QuizExplanation>
                                      )}
                                    </div>
                                    {sub.quizzes.includes(qIdx) && <SubItemTick>✔️</SubItemTick>}
                                  </div>
                                );
                              })}
                            </QuizSection>
                          )}
                          {mod.assignments && mod.assignments.length > 0 && (
                            <ResourceList>
                              {mod.assignments.map((a, i) => (
                                <ResourceItem key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                  <a
                                    href={a.link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => {
                                      e.preventDefault();
                                      setCompletedSubItems(prev => ({
                                        ...prev,
                                        [idx]: {
                                          ...prev[idx],
                                          assignments: prev[idx]?.assignments?.includes(i) ? prev[idx].assignments : [...(prev[idx]?.assignments || []), i],
                                          resources: prev[idx]?.resources || [],
                                          videos: prev[idx]?.videos || [],
                                          quizzes: prev[idx]?.quizzes || []
                                        }
                                      }));
                                      if (a.link) window.open(a.link, '_blank', 'noopener');
                                    }}
                                  >
                                    {a.title}
                                  </a>
                                  {sub.assignments && sub.assignments.includes(i) && <SubItemTick>✔️</SubItemTick>}
                                </ResourceItem>
                              ))}
                            </ResourceList>
                          )}
                        </div>
                      )}
                    </div>
                    {moduleDone && <CompletedMark style={{ position: 'absolute', top: 16, right: 24 }}>✔️</CompletedMark>}
                  </CurriculumItem>
                );
              })}
            </CurriculumList>
          </CurriculumSection>
        </Section>

        {!enrolled && (
          <div style={{ margin: '2.5rem 0 1.5rem 0', textAlign: 'center' }}>
            <EnrollButton onClick={handleEnroll}>
              Enroll Now
            </EnrollButton>
          </div>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default FullCoursePage; 