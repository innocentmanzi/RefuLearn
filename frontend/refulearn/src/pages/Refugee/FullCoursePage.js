// import React, { useState, useEffect, useRef } from 'react';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ContentWrapper from '../../components/ContentWrapper';
import ModuleItemProgress from '../../components/ModuleItemProgress';
import offlineIntegrationService from '../../services/offlineIntegrationService';

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
  background: ${({ image }) => image ? `url(${image}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  border: 2px dashed ${({ image }) => image ? 'transparent' : 'rgba(255,255,255,0.3)'};
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

// const ObjectivesTwoCol = styled.div`
//   display: flex;
//   gap: 2rem;
//   @media (max-width: 700px) {
//     flex-direction: column;
//     gap: 0.5rem;
//   }
// `;

// const ObjectivesCol = styled.ul`
//   list-style: none;
//   padding: 0;
//   margin: 0;
//   flex: 1;
// `;

// const ObjectiveItem = styled.li`
//   display: flex;
//   align-items: center;
//   font-size: 1.08rem;
//   color: #222;
//   margin-bottom: 0.5rem;
//   font-weight: 500;
//   background: none;
//   border: none;
//   padding: 0;
// `;

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

// const ModuleTitle = styled.div`
//   font-size: 1.1rem;
//   font-weight: 600;
//   color: #333;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// `;

// const ModuleContent = styled.div`
//   margin-top: 1rem;
//   color: #444;
// `;

// const VideoWrapper = styled.div`
//   margin: 1rem 0;
//   position: relative;
//   padding-bottom: 56.25%;
//   height: 0;
//   overflow: hidden;
//   border-radius: 8px;
//   iframe {
//     position: absolute;
//     top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;
//   }
// `;

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

// const QuizExplanation = styled.div`
//   margin-top: 0.5rem;
//   color: #888;
//   font-size: 0.95rem;
// `;

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

// const LockedOverlay = styled.div`
//   position: absolute;
//   top: 0; left: 0; right: 0; bottom: 0;
//   background: rgba(255,255,255,0.85);
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   z-index: 2;
//   border-radius: 8px;
// `;

// const ModuleSummaryTitle = styled.div`
//   font-weight: 600;
//   color: #222;
//   margin-bottom: 0.5rem;
//   margin-top: 1rem;
// `;

// const ModuleSummaryList = styled.ul`
//   list-style: none;
//   padding: 0 0 0 1.2rem;
//   margin: 0 0 1rem 0;
// `;

// const CompletedMark = styled.span`
//   color: #27ae60;
//   font-weight: bold;
//   margin-left: auto;
//   margin-right: 0;
//   display: flex;
//   align-items: center;
//   font-size: 1.3rem;
// `;

// const SubItemTick = styled.span`
//   color: #27ae60;
//   font-weight: bold;
//   margin-left: 8px;
//   font-size: 1.1rem;
//   vertical-align: middle;
// `;

const FullCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [enrolled, setEnrolled] = useState(false);
  const [course, setCourse] = useState(location.state);
  const [modules, setModules] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [completedSubItems, setCompletedSubItems] = useState({});
  const [expandedModule, setExpandedModule] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;

        let courseData = course;
        let modulesData = [];
        let enrollmentStatus = false;
        let progressData = null;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching full course data from API...');

            // Fetch course details if not provided in location state
            if (!courseData && id) {
              const courseResponse = await fetch(`/api/courses/${id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (courseResponse.ok) {
                const courseApiData = await courseResponse.json();
                courseData = courseApiData.data.course;
                console.log('✅ Course data received:', courseData);
                console.log('🎨 Course image fields:', {
                  course_profile_picture: courseData.course_profile_picture,
                  image: courseData.image,
                  hasImage: !!(courseData.course_profile_picture || courseData.image),
                  courseId: id,
                  title: courseData.title
                });
                
                // Check if course has any image data
                if (!courseData.course_profile_picture && !courseData.image) {
                  console.warn('⚠️ Course has no image data:', {
                    courseId: id,
                    title: courseData.title,
                    allFields: Object.keys(courseData)
                  });
                }
                
                // Store course data for offline use
                await offlineIntegrationService.storeCourseData(id, courseData);
              }
            }

            // Fetch course modules
            const modulesResponse = await fetch(`/api/courses/modules?courseId=${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (modulesResponse.ok) {
              const modulesApiData = await modulesResponse.json();
              modulesData = modulesApiData.data.modules || [];
              console.log('✅ Modules data received:', modulesData.length);
              
              // Store modules data for offline use
              await offlineIntegrationService.storeModulesData(id, modulesData);
            }

            // Check if user is enrolled
            const enrollmentResponse = await fetch(`/api/courses/enrolled/courses/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (enrollmentResponse.ok) {
              enrollmentStatus = true;
              
              // Store enrollment status for offline use
              await offlineIntegrationService.storeEnrollmentData(id, { enrolled: true });
              
              // Fetch progress data
              const progressResponse = await fetch(`/api/courses/${id}/progress`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (progressResponse.ok) {
                const progressApiData = await progressResponse.json();
                progressData = progressApiData.data;
                console.log('✅ Progress data received:', progressData);
                
                // Store progress data for offline use
                await offlineIntegrationService.storeProgressData(id, progressData);
              }
            } else {
              enrollmentStatus = false;
              await offlineIntegrationService.storeEnrollmentData(id, { enrolled: false });
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            const offlineData = await fetchOfflineData();
            courseData = offlineData.course || courseData;
            modulesData = offlineData.modules;
            enrollmentStatus = offlineData.enrollment;
            progressData = offlineData.progress;
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline full course data...');
          const offlineData = await fetchOfflineData();
          courseData = offlineData.course || courseData;
          modulesData = offlineData.modules;
          enrollmentStatus = offlineData.enrollment;
          progressData = offlineData.progress;
        }

        // Helper function to fetch offline data
        const fetchOfflineData = async () => {
          try {
            const course = await offlineIntegrationService.getCourseData(id);
            const modules = await offlineIntegrationService.getModulesData(id);
            const enrollmentData = await offlineIntegrationService.getEnrollmentData(id);
            const progress = await offlineIntegrationService.getProgressData(id);
            
            console.log('📱 Offline full course data loaded:', {
              course: !!course,
              modules: modules.length,
              enrollment: enrollmentData?.enrolled,
              progress: !!progress
            });
            
            return { 
              course, 
              modules: modules || [], 
              enrollment: enrollmentData?.enrolled || false, 
              progress 
            };
          } catch (error) {
            console.error('❌ Failed to load offline full course data:', error);
            return { course: null, modules: [], enrollment: false, progress: null };
          }
        };

        // Update state with fetched data
        if (courseData) {
          setCourse(courseData);
        }
        setModules(modulesData);
        setEnrolled(enrollmentStatus);
        
        if (progressData) {
          const completed = progressData.completedModules || [];
          setCompletedModules(completed);
        }

      } catch (err) {
        console.error('❌ Error fetching course data:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id, course]);

  useEffect(() => {
    if (!course) return;
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
  }, [completedSubItems, course, modules, completedModules]);

  // Restore expandedModule from localStorage per course, only when course changes
  useEffect(() => {
    if (course) {
      const expandedKey = `expandedModule_${course._id}`;
      const saved = localStorage.getItem(expandedKey);
      setExpandedModule(saved !== null ? Number(saved) : null);
    }
  }, [course]);

  // Persist expandedModule to localStorage per course
  useEffect(() => {
    if (course) {
      const expandedKey = `expandedModule_${course._id}`;
      if (expandedModule === null) {
        localStorage.removeItem(expandedKey);
      } else {
        localStorage.setItem(expandedKey, expandedModule);
      }
    }
  }, [expandedModule, course]);

  const handleProgressUpdate = (updatedProgress) => {
    // Update the user progress state with the new data
    setUserProgress(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(p => p.moduleId === updatedProgress.moduleId);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], ...updatedProgress };
      } else {
        updated.push(updatedProgress);
      }
      
      return updated;
    });
  };

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online enrollment first (preserving existing behavior)
          console.log('🌐 Online mode: Enrolling in course...');
          
          const response = await fetch(`/api/courses/${id}/enroll`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            success = true;
            console.log('✅ Online enrollment successful');
            setEnrolled(true);
            alert('Successfully enrolled in course!');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to enroll in course');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online enrollment failed, using offline:', onlineError);
          // Fall back to offline enrollment
          const result = await offlineIntegrationService.enrollInCourseOffline(id);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline enrollment successful');
            setEnrolled(true);
            alert('Successfully enrolled in course offline! Will sync when online.');
          } else {
            throw new Error('Failed to enroll in course offline');
          }
        }
      } else {
        // Offline enrollment
        console.log('📴 Offline mode: Enrolling in course offline...');
        const result = await offlineIntegrationService.enrollInCourseOffline(id);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline enrollment successful');
          setEnrolled(true);
          alert('Successfully enrolled in course offline! Will sync when online.');
        } else {
          throw new Error('Failed to enroll in course offline');
        }
      }

      if (!success) {
        alert('Failed to enroll in course');
      }
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  // Function to validate and fix course image URLs
  const validateCourseImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path, try to construct the full URL
    if (imageUrl.startsWith('/')) {
      // This might be a local path, try to construct the full URL
      const baseUrl = window.location.origin;
      return `${baseUrl}${imageUrl}`;
    }
    
    // If it's a Supabase URL without protocol, add https
    if (imageUrl.includes('supabase.co') && !imageUrl.startsWith('http')) {
      return `https://${imageUrl}`;
    }
    
    return imageUrl;
  };

  // Function to get a reliable course image URL with fallbacks
  const getCourseImageUrl = (course) => {
    const courseImage = course.course_profile_picture || course.image;
    const validatedUrl = validateCourseImageUrl(courseImage);
    
    // Default fallback images based on category
    const fallbackImages = {
      'Business': 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Technology': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'Arts': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'default': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    };
    
    const fallbackImage = fallbackImages[course.category] || fallbackImages.default;
    
    return validatedUrl || fallbackImage;
  };

  if (loading) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading course...</div>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            <div>{error}</div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  if (!course) {
    return (
      <ContentWrapper>
        <Container>Loading...</Container>
      </ContentWrapper>
    );
  }

  // Instructor mock data (can be dynamic)
  const instructor = {
    name: course.instructor || 'Jacqueline Miller',
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
          {(() => {
            // Get reliable course image URL with fallbacks
            const imageUrl = getCourseImageUrl(course);
            
            // Add cache-busting parameter to force image reload
            const finalImageUrl = `${imageUrl}?t=${Date.now()}`;
            
            console.log('🎨 Course image data:', {
              courseId: id,
              courseTitle: course.title,
              course_profile_picture: course.course_profile_picture,
              course_image: course.image,
              finalImage: finalImageUrl
            });
            
            return (
              <CourseImage 
                image={finalImageUrl}
                onError={(e) => {
                  console.error('❌ Course image failed to load:', finalImageUrl);
                  e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }}
              >
                {!course.course_profile_picture && !course.image && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                    <div>Course Image</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                      {course.title || 'Course'}
                    </div>
                  </div>
                )}
              </CourseImage>
            );
          })()}
          <CourseInfo>
            <CourseTitle>{course.title}</CourseTitle>
            <CourseDescription>{course.description}</CourseDescription>
            <LevelBadge level={course.level || course.difficult_level}>{course.level || course.difficult_level}</LevelBadge>
            <CourseMeta>
              <MetaItem>
                <MetaLabel>Duration</MetaLabel>
                <MetaValue>{course.duration}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Students</MetaLabel>
                <MetaValue>{course.students || 0}+ enrolled</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Category</MetaLabel>
                <MetaValue>{course.category}</MetaValue>
              </MetaItem>
            </CourseMeta>
            <ActionButtons>
              {enrolled ? (
                <EnrollButton onClick={() => navigate(`/courses/content/${id}`)}>
                  Continue Learning
                </EnrollButton>
              ) : (
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
            <p>{course.overview || course.description}</p>
          </Overview>
        </Section>

        <Section>
          <SectionTitle>Course Modules</SectionTitle>
          <div style={{ margin: 0 }}>
            {modules.map((module, idx) => (
              <ModuleItemProgress
                key={module._id || idx}
                module={module}
                courseId={id}
                userProgress={userProgress}
                onProgressUpdate={handleProgressUpdate}
                isEnrolled={enrolled}
              />
            ))}
          </div>
        </Section>
      </Container>
    </ContentWrapper>
  );
};

export default FullCoursePage; 