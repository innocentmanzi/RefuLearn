import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AssessmentTaker from '../../components/AssessmentTaker';
import { Quiz, Assignment } from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem 2.5rem;
  max-width: 900px;
  margin: 0 auto;
`;
const Section = styled.div`
  margin-bottom: 2.5rem;
`;

const AssessmentCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }
`;

const AssessmentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const AssessmentTitle = styled.h4`
  margin: 0;
  color: #007bff;
`;

const AssessmentInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const CourseContentPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(location.state);
  const [modules, setModules] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        console.log('🚀 CourseContentPage: Starting to fetch course data for ID:', id);
        console.log('📊 Location state course:', course);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        console.log('🔑 Token exists:', !!token);
        console.log('🌐 Network status:', isOnline ? 'online' : 'offline');

        let courseData = course;
        let modulesData = [];
        let assessmentsData = [];
        let progressData = 0;
        let enrollmentData = false;
        let startedData = false;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching course data from API...');
            
            // Fetch course details if not provided in location state
            if (!courseData && id) {
              console.log('🔍 Fetching course details for ID:', id);
              const courseResponse = await fetch(`/api/courses/${id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (courseResponse.ok) {
                const courseApiData = await courseResponse.json();
                console.log('✅ Course data received:', courseApiData.data.course);
                courseData = courseApiData.data.course;
                
                // Store course data for offline use
                await offlineIntegrationService.storeCourseData(id, courseData);
              } else {
                const courseError = await courseResponse.text();
                console.error('❌ Failed to fetch course details:', {
                  status: courseResponse.status,
                  error: courseError
                });
                throw new Error(`Failed to load course details: ${courseResponse.status} - ${courseError}`);
              }
            }

        // Fetch course modules using courseId path parameter instead of query parameter
        console.log('🧩 Fetching modules for course ID:', id);
        const modulesResponse = await fetch(`/api/courses/${id}/modules`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (modulesResponse.ok) {
          const modulesData = await modulesResponse.json();
          console.log('✅ Modules data received:', modulesData.data.modules);
          setModules(modulesData.data.modules || []);
        } else {
          const modulesError = await modulesResponse.text();
          console.log('⚠️ Modules fetch failed:', {
            status: modulesResponse.status,
            error: modulesError
          });
          setModules([]); // Set empty array instead of leaving undefined
        }

        // Fetch course assessments
        console.log('📝 Fetching assessments for course ID:', id);
        const assessmentsResponse = await fetch(`/api/courses/${id}/assessments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (assessmentsResponse.ok) {
          const assessmentsData = await assessmentsResponse.json();
          console.log('✅ Assessments data received:', assessmentsData.data.assessments);
          setAssessments(assessmentsData.data.assessments || []);
        } else {
          const assessmentsError = await assessmentsResponse.text();
          console.log('⚠️ Assessments fetch failed:', {
            status: assessmentsResponse.status,
            error: assessmentsError
          });
          setAssessments([]); // Set empty array instead of leaving undefined
        }

        // Check if user is enrolled first
        console.log('🔍 Checking enrollment for course ID:', id);
        const enrollmentResponse = await fetch(`/api/courses/enrolled/courses/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📊 Enrollment response status:', enrollmentResponse.status);
        
        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json();
          console.log('✅ Enrollment check passed:', enrollmentData);
          setIsEnrolled(true);
          
          // User is enrolled, try to fetch progress
          console.log('📈 Fetching user progress...');
          const progressResponse = await fetch(`/api/courses/${id}/progress`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📊 Progress response status:', progressResponse.status);
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            console.log('✅ Progress data received:', progressData);
            setProgress(progressData.data.progressPercentage || 0);
            setStarted(true);
          } else {
            const progressError = await progressResponse.text();
            console.log('⚠️ Progress fetch failed:', {
              status: progressResponse.status,
              error: progressError
            });
            // No progress found, but user is enrolled - start with 0% progress
            console.log('⚠️ Starting with 0% progress');
            setProgress(0);
            setStarted(true);
          }
        } else {
          const enrollmentError = await enrollmentResponse.text();
          console.log('❌ Enrollment check failed:', {
            status: enrollmentResponse.status,
            error: enrollmentError
          });
          
          // User not enrolled, but still allow access to show course content
          // They can still view modules and assessments but won't track progress
          console.log('⚠️ User not enrolled, allowing view-only access');
          setIsEnrolled(false);
          setProgress(0);
          setStarted(true);
        }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            const offlineData = await fetchOfflineData();
            courseData = offlineData.course || courseData;
            modulesData = offlineData.modules;
            assessmentsData = offlineData.assessments;
            progressData = offlineData.progress;
            enrollmentData = offlineData.enrollment;
            startedData = offlineData.started;
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline data...');
          const offlineData = await fetchOfflineData();
          courseData = offlineData.course || courseData;
          modulesData = offlineData.modules;
          assessmentsData = offlineData.assessments;
          progressData = offlineData.progress;
          enrollmentData = offlineData.enrollment;
          startedData = offlineData.started;
        }

        // Update state with fetched data
        setCourse(courseData);
        setModules(modulesData);
        setAssessments(assessmentsData);
        setProgress(progressData);
        setIsEnrolled(enrollmentData);
        setStarted(startedData);

      } catch (err) {
        console.error('❌ Error fetching course data:', err);
        console.error('❌ Error details:', {
          message: err.message,
          stack: err.stack,
          courseId: id
        });
        setError(`Failed to load course content: ${err.message || 'Unknown error'}`);
      } finally {
        console.log('✅ Course data fetching completed (success or failure)');
        setLoading(false);
      }
    };

    // Helper function to fetch offline data
    const fetchOfflineData = async () => {
      try {
        const course = await offlineIntegrationService.getCourseData(id);
        const modules = await offlineIntegrationService.getModulesData(id) || [];
        const assessments = await offlineIntegrationService.getAssessmentsData(id) || [];
        const progress = await offlineIntegrationService.getProgressData(id) || 0;
        const enrollment = await offlineIntegrationService.getEnrollmentData(id) || false;
        const started = true; // Allow started state in offline mode
        
        console.log('📱 Offline data loaded for course:', id, {
          course: !!course,
          modules: modules.length,
          assessments: assessments.length,
          progress: progress,
          enrollment: enrollment,
          started: started
        });
        
        return { course, modules, assessments, progress, enrollment, started };
      } catch (error) {
        console.error('❌ Failed to load offline data:', error);
        return { course: null, modules: [], assessments: [], progress: 0, enrollment: false, started: true };
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id, course, navigate]);

  const handleModuleComplete = async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let updateSuccess = false;

      if (isOnline) {
        try {
          // Try online update first (preserving existing behavior)
          console.log('🌐 Online progress update for module:', moduleId);
          const response = await fetch(`/api/courses/${id}/progress`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              moduleId,
              completed: true
            })
          });

          if (response.ok) {
            updateSuccess = true;
            console.log('✅ Online progress update successful');
          } else {
            throw new Error('Online progress update failed');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online progress update failed, using offline:', onlineError);
          // Fall back to offline update
          await offlineIntegrationService.updateModuleProgress(id, moduleId, true);
          updateSuccess = true;
          console.log('✅ Offline progress update successful');
        }
      } else {
        // Offline progress update
        console.log('📴 Offline progress update for module:', moduleId);
        await offlineIntegrationService.updateModuleProgress(id, moduleId, true);
        updateSuccess = true;
        console.log('✅ Offline progress update successful');
      }

      if (updateSuccess) {
        // Update local progress
        const completedModules = modules.filter(m => m.completed).length + 1;
        const newProgress = (completedModules / modules.length) * 100;
        setProgress(newProgress);
        
        // Update modules state to mark as completed
        setModules(prev => prev.map(m => 
          m._id === moduleId ? { ...m, completed: true } : m
        ));

        // Store updated progress for offline use
        await offlineIntegrationService.storeProgressData(id, newProgress);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleTakeAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setShowAssessment(true);
  };

  const handleCloseAssessment = () => {
    setShowAssessment(false);
    setSelectedAssessment(null);
  };

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsEnrolled(true);
        alert('Successfully enrolled in course!');
        // Refresh the page to reload with enrollment status
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading course content...</div>
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

  if (!course) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Course Content</h2>
          <p>Loading course information...</p>
          <button onClick={() => navigate(-1)} style={{ 
            background: '#007BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '0.5rem 1rem',
            cursor: 'pointer' 
          }}>
            Back to Courses
          </button>
        </div>
      </Container>
    );
  }

  if (!started) {
    return null; // Or a loading spinner
  }

  if (showAssessment && selectedAssessment) {
    return (
      <AssessmentTaker
        assessmentId={selectedAssessment._id}
        onClose={handleCloseAssessment}
      />
    );
  }

  return (
    <Container>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, background: '#3498db', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 24px', cursor: 'pointer' }}>Back</button>
      
      {/* Enrollment Banner */}
      {!isEnrolled && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>📚 Enroll to Track Your Progress</h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
            You're viewing this course content as a preview. Enroll to track your progress, complete modules, and earn certificates!
          </p>
          <button 
            onClick={handleEnroll}
            style={{ 
              background: 'white', 
              color: '#667eea', 
              border: 'none', 
              borderRadius: '25px', 
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Enroll Now - It's Free!
          </button>
        </div>
      )}
      
      <Section>
        <h1>{course.title}</h1>
        <div style={{ color: '#555', marginBottom: 0 }}>{course.description}</div>
        <div style={{ marginTop: '1rem', color: '#666' }}>
          Progress: {Math.round(progress)}% {!isEnrolled && '(Preview Mode)'}
        </div>
      </Section>
      <Section id="modules-section">
        <h2>Modules</h2>
        {modules.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            color: '#666'
          }}>
            <h3>Course Content Coming Soon</h3>
            <p>The instructor is preparing the course modules. Please check back later!</p>
          </div>
        ) : (
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {modules.map((mod, idx) => (
            <li key={mod._id || idx} style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 6 }}>
                {mod.title}
                {mod.completed && <span style={{ color: '#27ae60', marginLeft: '0.5rem' }}>✓</span>}
              </div>
              <div style={{ color: '#555', marginBottom: 8 }}>{mod.description}</div>
              {mod.content && (
                <div style={{ marginBottom: 8 }}>
                  <div dangerouslySetInnerHTML={{ __html: mod.content }} />
                </div>
              )}
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
              {!mod.completed && (
                <button
                  onClick={() => handleModuleComplete(mod._id)}
                  style={{
                    background: '#27ae60',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  Mark as Complete
                </button>
              )}
            </li>
                      ))}
          </ol>
        )}
      </Section>
      
      {assessments.length > 0 && (
        <Section>
          <h2>Assessments & Quizzes</h2>
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment._id} onClick={() => handleTakeAssessment(assessment)}>
              <AssessmentHeader>
                {assessment.title.toLowerCase().includes('quiz') ? <Quiz /> : <Assignment />}
                <AssessmentTitle>{assessment.title}</AssessmentTitle>
              </AssessmentHeader>
              {assessment.description && (
                <div style={{ marginBottom: '0.5rem', color: '#555' }}>
                  {assessment.description}
                </div>
              )}
              <AssessmentInfo>
                {assessment.questions?.length || 0} questions • 
                {assessment.totalPoints || 0} points • 
                {assessment.timeLimit || 30} minutes
              </AssessmentInfo>
            </AssessmentCard>
          ))}
        </Section>
      )}
    </Container>
  );
};

export default CourseContentPage; 