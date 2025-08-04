import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, CheckCircle, Cancel, Assessment, Quiz } from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #0056b3;
  padding: 0;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: 1rem;
  
  &:hover {
    color: #004494;
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
`;

const OverallGradeCard = styled.div`
  background: linear-gradient(135deg, #0056b3 0%, #007bff 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const OverallGrade = styled.div`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const GradeLabel = styled.div`
  font-size: 1.25rem;
  opacity: 0.9;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.passed ? '#10b981' : '#ef4444'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-top: 1rem;
`;

const ModulesSection = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
`;

const ModuleCard = styled.div`
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ModuleHeader = styled.div`
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ModuleInfo = styled.div`
  flex: 1;
`;

const ModuleTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
  font-size: 1.125rem;
`;

const ModuleGrade = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => {
    if (props.grade >= 90) return '#10b981';
    if (props.grade >= 80) return '#f59e0b';
    if (props.grade >= 70) return '#ef4444';
    return '#6b7280';
  }};
`;

const AssessmentsList = styled.div`
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  padding: 0;
`;

const AssessmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AssessmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AssessmentIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.type === 'quiz' ? '#9C27B0' : '#FF9800'};
  color: white;
`;

const AssessmentDetails = styled.div``;

const AssessmentName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
`;

const AssessmentMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const AssessmentGrade = styled.div`
  font-weight: bold;
  color: ${props => {
    if (props.grade >= 90) return '#10b981';
    if (props.grade >= 80) return '#f59e0b';
    if (props.grade >= 70) return '#ef4444';
    return '#6b7280';
  }};
`;

export default function MyGrades() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [grades, setGrades] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState(new Set());

  useEffect(() => {
    fetchGrades();
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let courseData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching course data for grades...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            courseData = data.data.course;
            console.log('✅ Course data received for grades:', courseData);
            
            // Store course data for offline use
            await offlineIntegrationService.storeCourseData(courseId, courseData);
          } else {
            throw new Error('Failed to fetch course');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          // Fall back to offline data if online fails
          courseData = await offlineIntegrationService.getCourseData(courseId);
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline course data for grades...');
        courseData = await offlineIntegrationService.getCourseData(courseId);
      }

      if (courseData) {
        setCourse(courseData);
      }
    } catch (error) {
      console.error('❌ Error fetching course:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let gradesData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching grades from API...');
          
          const response = await fetch(`/api/courses/${courseId}/grades`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            gradesData = data.data;
            console.log('✅ Grades data received:', gradesData);
            
            // Store grades data for offline use
            await offlineIntegrationService.storeGradesData(courseId, gradesData);
          } else {
            throw new Error('Failed to fetch grades');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          // Fall back to offline data if online fails
          gradesData = await offlineIntegrationService.getGradesData(courseId);
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline grades data...');
        gradesData = await offlineIntegrationService.getGradesData(courseId);
      }

      if (gradesData) {
        setGrades(gradesData);
      }
    } catch (error) {
      console.error('❌ Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading grades...
        </div>
      </Container>
    );
  }

  const overallGrade = grades?.overallGrade || 0;
  const passed = overallGrade >= 70;

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/course/${courseId}`)}>
          <ArrowBack style={{ fontSize: '1rem' }} />
          Back to Course
        </BackButton>
        <Title>My Grades</Title>
      </Header>

      <OverallGradeCard>
        <OverallGrade>{overallGrade}%</OverallGrade>
        <GradeLabel>Overall Course Grade</GradeLabel>
        <StatusBadge passed={passed}>
          {passed ? <CheckCircle style={{ fontSize: '1rem' }} /> : <Cancel style={{ fontSize: '1rem' }} />}
          {passed ? 'Passed' : 'Not Passed'}
        </StatusBadge>
      </OverallGradeCard>

      <ModulesSection>
        <SectionHeader>Module Grades</SectionHeader>
        
        {course?.modules?.map((module, index) => {
          const moduleGrades = grades?.moduleGrades?.[module._id];
          const moduleAverage = moduleGrades?.average || 0;
          const isExpanded = expandedModules.has(module._id);
          
          return (
            <ModuleCard key={module._id}>
              <ModuleHeader onClick={() => toggleModule(module._id)}>
                <ModuleInfo>
                  <ModuleTitle>Module {index + 1}: {module.title}</ModuleTitle>
                </ModuleInfo>
                <ModuleGrade grade={moduleAverage}>
                  {moduleAverage}%
                </ModuleGrade>
              </ModuleHeader>
              
              {isExpanded && moduleGrades?.grades && (
                <AssessmentsList>
                  {moduleGrades.grades.map((grade, idx) => (
                    <AssessmentItem key={idx}>
                      <AssessmentInfo>
                        <AssessmentIcon type={grade.type}>
                          {grade.type === 'quiz' ? <Quiz style={{ fontSize: '1rem' }} /> : <Assessment style={{ fontSize: '1rem' }} />}
                        </AssessmentIcon>
                        <AssessmentDetails>
                          <AssessmentName>
                            {grade.type === 'quiz' ? 'Quiz' : 'Assignment'}
                          </AssessmentName>
                          <AssessmentMeta>
                            {grade.score}/{grade.totalQuestions} correct • {grade.percentage.toFixed(1)}%
                          </AssessmentMeta>
                        </AssessmentDetails>
                      </AssessmentInfo>
                      <AssessmentGrade grade={grade.grade}>
                        {grade.grade}%
                      </AssessmentGrade>
                    </AssessmentItem>
                  ))}
                </AssessmentsList>
              )}
            </ModuleCard>
          );
        })}
        
        {!course?.modules?.length && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No modules available yet.
          </div>
        )}
      </ModulesSection>
    </Container>
  );
} 