import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowBack, 
  PlayArrow, 
  Assignment, 
  Quiz, 
  Forum, 
  Description, 
  VideoLibrary, 
  Link, 
  CheckCircle, 
  Add,
  RadioButtonUnchecked,
  Edit
} from '@mui/icons-material';

// Import all the styled components from instructor CourseOverview for consistency
const Container = styled.div`
  background: #f4f8fb;
  min-height: 100vh;
  padding: 1rem 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const CourseHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CourseImage = styled.img`
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
`;

const CourseTitle = styled.h1`
  color: #007BFF;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  background: ${({ enrolled }) => enrolled ? '#4CAF50' : '#007BFF'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  background: #e0e6ed;
  border-radius: 10px;
  height: 8px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: #007BFF;
  height: 100%;
  width: ${({ width }) => width}%;
  transition: width 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${({ primary }) => primary ? '#007BFF' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const SectionTitle = styled.h2`
  color: #007BFF;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

// Overview Section Styles
const EnhancedOverviewSection = styled(Section)``;

const OverviewHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const OverviewTitle = styled.h2`
  color: #007BFF;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
`;

const OverviewContent = styled.div``;

const OverviewDescription = styled.p`
  color: #666;
  line-height: 1.7;
  margin: 0 0 1rem 0;
  font-size: 1rem;
`;

const SeeMoreButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Learning Outcomes Section Styles
const LearningOutcomesSection = styled(Section)``;

const LearningOutcomesHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const LearningOutcomesTitle = styled.h2`
  color: #007BFF;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
`;

const OutcomesContent = styled.div``;

const OutcomesGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const OutcomeItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const OutcomeIcon = styled.div`
  color: #4CAF50;
  margin-top: 0.125rem;
  flex-shrink: 0;
`;

const OutcomeText = styled.span`
  color: #333;
  line-height: 1.5;
  font-size: 1rem;
`;

// Modules Section Styles
const ModulesSection = styled(Section)``;

const ModulesSectionHeader = styled.div`
  margin-bottom: 2rem;
`;

const ModulesSectionTitle = styled.h2`
  color: #007BFF;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
`;

const ModulesContent = styled.div``;

const ModuleCard = styled.div`
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  background: #fafbfc;
  border-bottom: ${({ expanded }) => expanded ? '1px solid #e0e6ed' : 'none'};
  
  &:hover {
    background: #f0f4f8;
  }
`;

const ModuleHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ModuleNumber = styled.div`
  background: #6366f1;
  color: white;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const ModuleTitleContainer = styled.div`
  flex: 1;
`;

const ModuleTitle = styled.h3`
  color: #1f2937;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
`;

const ModuleItemCount = styled.span`
  color: #6b7280;
  font-weight: 400;
  font-size: 0.875rem;
  margin-left: 0.5rem;
`;

const ExpandIcon = styled.div`
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;
  transform: ${({ expanded }) => expanded ? 'rotate(45deg)' : 'rotate(0deg)'};
`;

const ModuleDescription = styled.p`
  color: #666;
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ModuleContent = styled.div`
  background: #f8f9fa;
  border-top: 1px solid #e0e6ed;
`;

const ContentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e6ed;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ContentItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type }) => {
    switch (type) {
      case 'content': return '#007BFF';
      case 'video': return '#FF5722';
      case 'resource': return '#FF9800';
      case 'assessment': return '#4CAF50';
      case 'quiz': return '#9C27B0';
      case 'discussion': return '#FF5722';
      case 'description': return '#6c757d';
      default: return '#007BFF';
    }
  }};
  color: white;
  flex-shrink: 0;
`;

const ContentItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContentItemTitle = styled.h4`
  color: #333;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
`;

const ContentItemMeta = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ContentItemAction = styled.div`
  color: #6c757d;
  flex-shrink: 0;
`;

const EnrollmentBanner = styled.div`
  background: linear-gradient(135deg, #007BFF, #0056b3);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
`;

const CompletionBanner = styled.div`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
`;

const BannerTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const BannerText = styled.p`
  margin: 0 0 1rem 0;
  opacity: 0.9;
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`;

const ModalText = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #007BFF;
    color: white;
    border: none;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f3f4f6;
    }
  }
`;

const GradesSection = styled.div`
  margin-top: 1rem;
`;

const GradeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const GradeStatus = styled.span`
  font-weight: 500;
  color: ${({ completed }) => completed ? '#10b981' : '#6b7280'};
`;

const NextModuleBanner = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
`;

const StudentCourseOverview = () => {
  console.log('🏠 ===== STUDENT COURSE OVERVIEW COMPONENT LOADING =====');
  console.log('🏠 Component rendering at:', new Date().toISOString());
  console.log('🏠 Current URL:', window.location.href);
  console.log('🏠 Current pathname:', window.location.pathname);
  console.log('🏠 This should ONLY render on /courses/:courseId/overview URLs!');
  console.log('🏠 If you see this during module content navigation, there is a routing problem!');
  
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false); // Prevent rapid clicking

  // Debounce utility function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Ensure all modules start collapsed when component mounts or course changes
  useEffect(() => {
    setExpandedModules(new Set());
  }, [courseId]);

  // Test backend connectivity
  const testBackend = async () => {
    try {
      const response = await fetch('/api/courses/db-health');
      const data = await response.json();
      console.log('🔧 Backend health check:', data);
    } catch (error) {
      console.error('❌ Backend not responding:', error);
    }
  };

  // Test progress API
  const testProgressAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, skipping progress API test');
        return;
      }
      
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Progress API working:', data);
      } else {
        console.error('❌ Progress API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Progress API failed:', error);
    }
  };

  // Define fetchCourseData function so it can be reused
  const fetchCourseData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch course details with modules
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          console.log('🎓 Course data received from backend:', courseData);
          console.log('📚 Course object:', courseData.data.course);
          console.log('📖 Course overview:', courseData.data.course.overview);
          console.log('🎯 Learning outcomes:', courseData.data.course.learningOutcomes);
          console.log('📋 Modules:', courseData.data.course.modules);
          console.log('📊 Module count:', courseData.data.course.modules?.length || 0);
          
          if (courseData.data.course.modules && courseData.data.course.modules.length > 0) {
            console.log('📋 Module details:');
            courseData.data.course.modules.forEach((module, index) => {
              console.log(`  Module ${index + 1}: ${module.title}`);
              console.log(`    Description: ${module.description || 'None'}`);
              console.log(`    Content: ${module.content ? 'Yes' : 'No'}`);
              console.log(`    Video: ${module.videoUrl ? 'Yes' : 'No'}`);
              console.log(`    Assessments: ${module.assessments?.length || 0}`);
              console.log(`    Quizzes: ${module.quizzes?.length || 0}`);
              console.log(`    Discussions: ${module.discussions?.length || 0}`);
              console.log(`    Resources: ${module.resources?.length || 0}`);
            });
          } else {
            console.log('❌ No modules found in course data');
          }
          
          setCourse(courseData.data.course);
        } else {
          throw new Error('Failed to fetch course details');
        }

        // Check enrollment status
        try {
          const enrollmentResponse = await fetch(`/api/courses/enrolled/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (enrollmentResponse.ok) {
            setIsEnrolled(true);
            
            // Fetch progress if enrolled (add cache-busting to prevent 304)
            const progressResponse = await fetch(`/api/courses/${courseId}/progress?t=${Date.now()}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              console.log('🔄 Progress response from backend:', progressData);
              setProgress(Math.min(progressData.data.progressPercentage || 0, 100));
              
              // Set completed items from progress data - ALWAYS use backend as source of truth
              const completedSet = new Set();
              if (progressData.data.allCompletedItems) {
                progressData.data.allCompletedItems.forEach(item => completedSet.add(item));
              }
              
              // Also check individual module progress
              if (progressData.data.modulesProgress) {
                Object.values(progressData.data.modulesProgress).forEach(moduleProgress => {
                  if (moduleProgress.completedItems) {
                    moduleProgress.completedItems.forEach(item => completedSet.add(item));
                  }
                });
              }
              
              // Always update localStorage with backend data
              const completionsArray = Array.from(completedSet);
              localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
              
              setCompletedItems(completedSet);
              
              // Check if course is completed (must be exactly 100%)
              if (Math.round(progressData.data.progressPercentage) >= 100) {
                setCourseCompleted(true);
              }
            }
          }
        } catch (enrollmentError) {
          // User not enrolled, continue with course display
          setIsEnrolled(false);
        }

      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

  // Call fetchCourseData when courseId changes
  useEffect(() => {
    if (courseId) {
      testBackend(); // Test backend first
      testProgressAPI(); // Test progress API
      fetchCourseData();
    }
  }, [courseId]);

  // Refresh data when user returns to the page (for navigation back from module content)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && courseId) {
        console.log('🔄 Page became visible, loading completion data from localStorage only...');
        
        // Load completion data from localStorage as immediate sync (NO BACKEND REFRESH)
        const savedCompletions = localStorage.getItem(`course_completions_${courseId}`);
        if (savedCompletions) {
          try {
            const completionsArray = JSON.parse(savedCompletions);
            setCompletedItems(new Set(completionsArray));
            console.log('🔄 Refreshed completion data from localStorage:', completionsArray.length, 'items');
          } catch (error) {
            console.error('❌ Error loading completion data from localStorage:', error);
          }
        }
        
        // NO AUTOMATIC BACKEND REFRESH - Remove the fetchCourseData() call
        // User can manually refresh if needed
      }
    };

    // REMOVE FOCUS EVENT LISTENER - No auto-refresh on window focus
    // const handleFocus = () => {
    //   handleVisibilityChange();
    // };

    // Listen for completion updates from ModuleContent
    const handleProgressUpdate = (event) => {
      console.log('🔄 Received progress update event:', event.detail);
      const savedCompletions = localStorage.getItem(`course_completions_${courseId}`);
      if (savedCompletions) {
        try {
          const completionsArray = JSON.parse(savedCompletions);
          const newCompletedItems = new Set(completionsArray);
          setCompletedItems(newCompletedItems);
          console.log('🔄 Updated completion data from event:', {
            itemsCount: completionsArray.length,
            items: completionsArray,
            completedItemsSet: Array.from(newCompletedItems)
          });
          
          // Force a re-render by updating expanded modules
          setTimeout(() => {
            setExpandedModules(prev => new Set([...prev]));
          }, 100);
          
        } catch (error) {
          console.error('❌ Error loading completion data from localStorage:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // REMOVED: window.addEventListener('focus', handleFocus); // No auto-refresh on focus
    window.addEventListener('courseProgressUpdated', handleProgressUpdate);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // REMOVED: window.removeEventListener('focus', handleFocus); // No auto-refresh on focus
      window.removeEventListener('courseProgressUpdated', handleProgressUpdate);
    };
  }, [courseId]);

  // Add localStorage backup for completion tracking
  useEffect(() => {
    // Load completion data from localStorage as backup
    const savedCompletions = localStorage.getItem(`course_completions_${courseId}`);
    if (savedCompletions) {
      try {
        const completionsArray = JSON.parse(savedCompletions);
        setCompletedItems(new Set(completionsArray));
        console.log('📱 Loaded completion data from localStorage:', completionsArray.length, 'items');
      } catch (error) {
        console.error('❌ Error loading completion data from localStorage:', error);
      }
    }
    
    // Add debugging functions to window for testing
    window.debugCompletionData = () => {
      console.log('🔍 Current completion data:', {
        completedItems: Array.from(completedItems),
        localStorage: localStorage.getItem(`course_completions_${courseId}`)
      });
    };
    
    window.testQuizCompletion = (moduleIndex = 0, quizIndex = 0) => {
      if (course && course.modules && course.modules[moduleIndex]) {
        const module = course.modules[moduleIndex];
        const itemIndex = calculateItemIndex(module, 'quiz', quizIndex);
        const completionKey = getCompletionKey(module, 'quiz', itemIndex);
        console.log('🔍 Quiz completion test:', {
          moduleTitle: module.title,
          quizIndex: quizIndex,
          itemIndex: itemIndex,
          completionKey: completionKey,
          isCompleted: completedItems.has(completionKey)
        });
        return completionKey;
      }
    };
    
    window.testDiscussionCompletion = (moduleIndex = 0, discussionIndex = 0) => {
      if (course && course.modules && course.modules[moduleIndex]) {
        const module = course.modules[moduleIndex];
        const itemIndex = calculateItemIndex(module, 'discussion', discussionIndex);
        const completionKey = getCompletionKey(module, 'discussion', itemIndex);
        console.log('🔍 Discussion completion test:', {
          moduleTitle: module.title,
          discussionIndex: discussionIndex,
          itemIndex: itemIndex,
          completionKey: completionKey,
          isCompleted: completedItems.has(completionKey)
        });
        return completionKey;
      }
    };
    
    // Add function to test navigation
    window.testNavigation = () => {
      if (course && course.modules && course.modules.length > 0) {
        const module = course.modules[0];
        console.log('🔍 Navigation test - Module structure:', {
          moduleTitle: module.title,
          moduleId: module._id,
          quizzes: module.quizzes?.map(q => ({ 
            title: q.title, 
            id: q._id, 
            hasId: !!q._id 
          })) || 'No quizzes',
          discussions: module.discussions?.map(d => ({ 
            title: d.title, 
            id: d._id, 
            hasId: !!d._id 
          })) || 'No discussions'
        });
      }
    };
    
    // Add function to test click events
    window.testClicks = () => {
      console.log('🔍 Testing click events...');
      
      // Find all ContentItem elements that should be clickable
      const contentItems = document.querySelectorAll('[data-testid="content-item"]');
      console.log('🔍 Found content items:', contentItems.length);
      
      if (contentItems.length === 0) {
        console.log('❌ No content items found with data-testid');
        // Try to find them by other means
        const allItems = document.querySelectorAll('div[style*="cursor: pointer"]');
        console.log('🔍 Found items with cursor pointer:', allItems.length);
        
        allItems.forEach((item, index) => {
          const title = item.querySelector('h4');
          if (title) {
            console.log(`  Item ${index}: ${title.textContent}`);
            
            // Add temporary click handler to test
            item.addEventListener('click', (e) => {
              console.log('🎯 TEST CLICK detected on:', title.textContent);
              e.preventDefault();
              e.stopPropagation();
            });
          }
        });
      }
      
      return {
        contentItemsCount: contentItems.length,
        message: 'Click test handlers added. Try clicking quiz/discussion items now.'
      };
    };
    
    // Add function to force navigate to quiz (for testing)
    window.forceNavigateToQuiz = () => {
      if (course && course.modules && course.modules[0] && course.modules[0].quizzes && course.modules[0].quizzes[0]) {
        const module = course.modules[0];
        const quiz = module.quizzes[0];
        console.log('🚀 Force navigating to quiz:', quiz.title);
        handleContentClick(module, 'quiz', quiz);
      } else {
        console.log('❌ No quiz found to navigate to');
      }
    };
    
  }, [courseId, course, completedItems]);

  // Save completion data to localStorage whenever it changes
  useEffect(() => {
    if (completedItems.size > 0 && courseId) {
      const completionsArray = Array.from(completedItems);
      localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
      console.log('💾 Saved completion data to localStorage:', completionsArray.length, 'items');
      
      // Also trigger a visual refresh to ensure UI is updated
      setTimeout(() => {
        // Force a re-render by updating a dummy state
        setExpandedModules(prev => new Set(prev));
      }, 100);
    }
  }, [completedItems, courseId]);

  // Recalculate progress when completedItems or course data changes
  useEffect(() => {
    if (course && course.modules && completedItems.size > 0) {
      const calculatedProgress = recalculateProgress();
      if (Math.abs(calculatedProgress - progress) > 1) { // Only update if significant change
        setProgress(calculatedProgress);
        console.log('🔄 Progress recalculated from completion data:', Math.round(calculatedProgress), '%');
      }
    }
  }, [completedItems, course]);



  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsEnrolled(true);
        alert('Successfully enrolled in course!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        if (errorData.message === 'Already enrolled in this course') {
          // User is already enrolled, just update the state
          setIsEnrolled(true);
          // Don't show error, just proceed
        } else {
          alert(errorData.message || 'Failed to enroll in course');
        }
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  const toggleModule = (moduleId) => {
    console.log('🔄 Toggle module called:', {
      moduleId,
      currentlyExpanded: expandedModules.has(moduleId),
      allExpandedModules: Array.from(expandedModules)
    });
    
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
      console.log('📉 Collapsing module:', moduleId);
    } else {
      newExpanded.add(moduleId);
      console.log('📈 Expanding module:', moduleId);
    }
    setExpandedModules(newExpanded);
    
    console.log('🔄 Updated expanded modules:', Array.from(newExpanded));
  };

  // Helper function to get completion key in ModuleContent format
  const getCompletionKey = (module, contentType, itemIndex) => {
    // ModuleContent uses format: ${contentType}-${index}
    return `${contentType}-${itemIndex}`;
  };

  // Helper function to calculate item index within module (matching ModuleContent order)
  const calculateItemIndex = (module, targetType, targetIndex = 0) => {
    let index = 0;
    
    // Order matches ModuleContent component:
    // 1. Description (if exists)
    if (module.description) {
      if (targetType === 'description') return index;
      index++;
    }
    
    // 2. Content (if exists)
    if (module.content) {
      if (targetType === 'content') return index;
      index++;
    }
    
    // 3. Video (if exists)
    if (module.videoUrl) {
      if (targetType === 'video') return index;
      index++;
    }
    
    // 4. Resources
    if (module.resources && module.resources.length > 0) {
      for (let i = 0; i < module.resources.length; i++) {
        if (targetType === 'resource' && targetIndex === i) return index;
        index++;
      }
    }
    
    // 5. Assessments
    if (module.assessments && module.assessments.length > 0) {
      for (let i = 0; i < module.assessments.length; i++) {
        if (targetType === 'assessment' && targetIndex === i) return index;
        index++;
      }
    }
    
    // 6. Quizzes
    if (module.quizzes && module.quizzes.length > 0) {
      for (let i = 0; i < module.quizzes.length; i++) {
        if (targetType === 'quiz' && targetIndex === i) return index;
        index++;
      }
    }
    
    // 7. Discussions
    if (module.discussions && module.discussions.length > 0) {
      for (let i = 0; i < module.discussions.length; i++) {
        if (targetType === 'discussion' && targetIndex === i) return index;
        index++;
      }
    }
    
    return -1; // Not found
  };

  // Check if a module is completed
  const isModuleCompleted = (module) => {
    if (!module) return false;
    
    let totalItems = 0;
    let completedCount = 0;
    
    // Count all items and check completion
    if (module.description) {
      totalItems++;
      const itemIndex = calculateItemIndex(module, 'description');
      const completionKey = getCompletionKey(module, 'description', itemIndex);
      if (completedItems.has(completionKey)) completedCount++;
    }
    
    if (module.content) {
      totalItems++;
      const itemIndex = calculateItemIndex(module, 'content');
      const completionKey = getCompletionKey(module, 'content', itemIndex);
      if (completedItems.has(completionKey)) completedCount++;
    }
    
    if (module.videoUrl) {
      totalItems++;
      const itemIndex = calculateItemIndex(module, 'video');
      const completionKey = getCompletionKey(module, 'video', itemIndex);
      if (completedItems.has(completionKey)) completedCount++;
    }
    
    if (module.resources) {
      module.resources.forEach((_, idx) => {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'resource', idx);
        const completionKey = getCompletionKey(module, 'resource', itemIndex);
        if (completedItems.has(completionKey)) completedCount++;
      });
    }
    
    if (module.assessments) {
      module.assessments.forEach((_, idx) => {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'assessment', idx);
        const completionKey = getCompletionKey(module, 'assessment', itemIndex);
        if (completedItems.has(completionKey)) completedCount++;
      });
    }
    
    if (module.quizzes) {
      module.quizzes.forEach((_, idx) => {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'quiz', idx);
        const completionKey = getCompletionKey(module, 'quiz', itemIndex);
        if (completedItems.has(completionKey)) completedCount++;
      });
    }
    
    if (module.discussions) {
      module.discussions.forEach((_, idx) => {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'discussion', idx);
        const completionKey = getCompletionKey(module, 'discussion', itemIndex);
        if (completedItems.has(completionKey)) completedCount++;
      });
    }
    
    return totalItems > 0 && completedCount === totalItems;
  };

  // Check if course is completed
  const isCourseCompleted = () => {
    if (!course?.modules || course.modules.length === 0) return false;
    return course.modules.every(module => isModuleCompleted(module));
  };

  // Get next incomplete module
  const getNextIncompleteModule = () => {
    if (!course?.modules) return null;
    return course.modules.find(module => !isModuleCompleted(module));
  };

  // Recalculate progress based on actual completion data (item-level, not module-level)
  const recalculateProgress = () => {
    if (!course?.modules || course.modules.length === 0) return 0;
    
    let totalItems = 0;
    let completedItemsCount = 0;
    
    // Count all items across all modules
    course.modules.forEach(module => {
      if (module.description) {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'description');
        const completionKey = getCompletionKey(module, 'description', itemIndex);
        if (completedItems.has(completionKey)) completedItemsCount++;
      }
      
      if (module.content) {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'content');
        const completionKey = getCompletionKey(module, 'content', itemIndex);
        if (completedItems.has(completionKey)) completedItemsCount++;
      }
      
      if (module.videoUrl) {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'video');
        const completionKey = getCompletionKey(module, 'video', itemIndex);
        if (completedItems.has(completionKey)) completedItemsCount++;
      }
      
      if (module.resources) {
        module.resources.forEach((_, idx) => {
          totalItems++;
          const itemIndex = calculateItemIndex(module, 'resource', idx);
          const completionKey = getCompletionKey(module, 'resource', itemIndex);
          if (completedItems.has(completionKey)) completedItemsCount++;
        });
      }
      
      if (module.assessments) {
        module.assessments.forEach((_, idx) => {
          totalItems++;
          const itemIndex = calculateItemIndex(module, 'assessment', idx);
          const completionKey = getCompletionKey(module, 'assessment', itemIndex);
          if (completedItems.has(completionKey)) completedItemsCount++;
        });
      }
      
      if (module.quizzes) {
        module.quizzes.forEach((_, idx) => {
          totalItems++;
          const itemIndex = calculateItemIndex(module, 'quiz', idx);
          const completionKey = getCompletionKey(module, 'quiz', itemIndex);
          if (completedItems.has(completionKey)) completedItemsCount++;
        });
      }
      
      if (module.discussions) {
        module.discussions.forEach((_, idx) => {
          totalItems++;
          const itemIndex = calculateItemIndex(module, 'discussion', idx);
          const completionKey = getCompletionKey(module, 'discussion', itemIndex);
          if (completedItems.has(completionKey)) completedItemsCount++;
        });
      }
    });
    
    const calculatedProgress = totalItems > 0 ? (completedItemsCount / totalItems) * 100 : 0;
    
    console.log('📊 Progress recalculation (item-based):', {
      totalItems,
      completedItemsCount,
      calculatedProgress: Math.round(calculatedProgress * 100) / 100
    });
    
    return Math.min(calculatedProgress, 100);
  };

  // Generate certificate when course is completed
  const generateCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/certificates/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: courseId,
          courseTitle: course.title
        })
      });
    } catch (err) {
      console.error('Error generating certificate:', err);
    }
  };

  const handleContentClick = (module, contentType, contentData, itemIndex) => {
    console.log('🚀 handleContentClick called with:', {
      module: module.title,
      contentType,
      moduleId: module._id,
      courseId,
      contentData: contentData,
      hasContentId: contentData?._id ? true : false,
      contentId: contentData?._id
    });
    
    // Navigate to appropriate content based on type - no enrollment check blocking
    // Add return parameter so content pages know where to return
    const returnUrl = `/courses/${courseId}/overview`;
    
    let navigationUrl = '';
    
    switch (contentType) {
      case 'description':
        navigationUrl = `/courses/${courseId}/modules/${module._id}/description?return=${encodeURIComponent(returnUrl)}`;
        console.log('📍 Navigating to MODULE DESCRIPTION:', navigationUrl);
        navigate(navigationUrl);
        break;
      case 'content':
        navigationUrl = `/courses/${courseId}/modules/${module._id}/content?return=${encodeURIComponent(returnUrl)}`;
        console.log('📍 Navigating to MODULE CONTENT:', navigationUrl);
        navigate(navigationUrl);
        break;
      case 'video':
        navigationUrl = `/courses/${courseId}/modules/${module._id}/video?return=${encodeURIComponent(returnUrl)}`;
        console.log('📍 Navigating to MODULE VIDEO:', navigationUrl);
        navigate(navigationUrl);
        break;
      case 'quiz':
        if (contentData && contentData._id) {
          navigationUrl = `/courses/${courseId}/modules/${module._id}/quiz/${contentData._id}?return=${encodeURIComponent(returnUrl)}`;
          console.log('📍 Navigating to QUIZ:', navigationUrl);
          navigate(navigationUrl);
        } else {
          console.error('❌ Quiz navigation failed - no quiz ID:', contentData);
          alert('Unable to navigate to quiz. Please try refreshing the page.');
        }
        break;
      case 'assessment':
        if (contentData && contentData._id) {
          navigationUrl = `/courses/${courseId}/modules/${module._id}/assessment/${contentData._id}?return=${encodeURIComponent(returnUrl)}`;
          console.log('📍 Navigating to ASSESSMENT:', navigationUrl);
          navigate(navigationUrl);
        } else {
          console.error('❌ Assessment navigation failed - no assessment ID:', contentData);
          alert('Unable to navigate to assessment. Please try refreshing the page.');
        }
        break;
      case 'discussion':
        if (contentData && contentData._id) {
          navigationUrl = `/courses/${courseId}/modules/${module._id}/discussion/${contentData._id}?return=${encodeURIComponent(returnUrl)}`;
          console.log('📍 Navigating to DISCUSSION:', navigationUrl);
          navigate(navigationUrl);
        } else {
          console.error('❌ Discussion navigation failed - no discussion ID:', contentData);
          alert('Unable to navigate to discussion. Please try refreshing the page.');
        }
        break;
      default:
        console.log('❌ Unknown content type:', contentType);
        alert('Unknown content type: ' + contentType);
        return;
    }
    
    console.log('✅ Navigation command executed for:', contentType);
  };

  // Add function to mark item as complete
  const handleMarkComplete = async (module, contentType, itemIndex) => {
    const completionKey = getCompletionKey(module, contentType, itemIndex);
    
    // Prevent rapid clicking
    if (isMarkingComplete) {
      return;
    }
    
    // Check if user is enrolled
    if (!isEnrolled) {
      alert('Please enroll in the course first to track progress.');
      return;
    }
    
    // Set loading state
    setIsMarkingComplete(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to track progress');
        return;
      }
      
      // Optimistically update UI IMMEDIATELY
      setCompletedItems(prev => {
        const newSet = new Set([...prev, completionKey]);
        return newSet;
      });
      
      const requestData = {
        moduleId: module._id,
        contentType: contentType,
        itemIndex: itemIndex,
        completionKey: completionKey,
        completed: true
      };
      
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const progressData = await response.json();
        
        // Update overall progress from backend
        if (progressData.data?.progressPercentage !== undefined) {
          setProgress(Math.min(progressData.data.progressPercentage, 100));
        }
        
        // Update localStorage for persistence
        const newCompletedItems = new Set([...completedItems, completionKey]);
        const completionsArray = Array.from(newCompletedItems);
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
        
        // NO AUTO REFRESH - Let user manually refresh if needed
        // setTimeout(() => {
        //   fetchCourseData();
        // }, 100);
        
      } else {
        // Revert optimistic update on error
        setCompletedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(completionKey);
          return newSet;
        });
        
        // Handle specific error cases
        if (response.status === 429) {
          alert('Too many requests. Please wait a moment and try again.');
        } else {
          alert(`Failed to save progress. Please try again.`);
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setCompletedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(completionKey);
        return newSet;
      });
      
      alert('Network error. Please check your connection and try again.');
    } finally {
      // Reset loading state
      setTimeout(() => {
        setIsMarkingComplete(false);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading course...</div>
        </div>
      </Container>
    );
  }

  if (error || !course) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error || 'Course not found'}</div>
          <button onClick={() => navigate('/courses')}>Back to Courses</button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/courses')}>
        <ArrowBack style={{ marginRight: 6 }} /> Back to Courses
      </BackButton>

      {/* Show enrollment banner if not enrolled - but don't block content access */}
      {!isEnrolled && (
        <EnrollmentBanner>
          <BannerTitle>🎓 Ready to start learning?</BannerTitle>
          <BannerText>Enroll in this course to track your progress and earn certificates</BannerText>
          <ActionButton primary onClick={handleEnroll}>
            Enroll Now - It's Free!
          </ActionButton>
        </EnrollmentBanner>
      )}

      {/* Show course completion banner if completed */}
      {isCourseCompleted() && (
        <CompletionBanner>
          <BannerTitle>🎉 Congratulations!</BannerTitle>
          <BannerText>You have successfully completed this course!</BannerText>
          <ModalButtons>
            <ActionButton primary onClick={() => navigate('/certificates')}>
              View Certificate
            </ActionButton>
            <ActionButton primary onClick={() => setShowGradesModal(true)}>
              View Grades
            </ActionButton>
          </ModalButtons>
        </CompletionBanner>
      )}

      {/* Show next module banner if there are incomplete modules */}
      {/* REMOVED: Continue Learning banner as requested by user
      {!isCourseCompleted() && (() => {
        const nextModule = getNextIncompleteModule();
        if (nextModule) {
          const moduleIndex = course.modules.findIndex(m => m._id === nextModule._id);
          return (
            <NextModuleBanner>
              <BannerTitle>📚 Continue Learning</BannerTitle>
              <BannerText>Your next module: Module {moduleIndex + 1}: {nextModule.title}</BannerText>
              <ActionButton primary onClick={() => {
                setExpandedModules(new Set([nextModule._id]));
                document.getElementById(`module-${nextModule._id}`)?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Go to Next Module
              </ActionButton>
            </NextModuleBanner>
          );
        }
        return null;
      })()} */}

      <CourseHeader>
        {course.course_profile_picture && (
          <CourseImage 
            src={`/${course.course_profile_picture.replace(/^uploads\//, '')}`} 
            alt={course.title}
          />
        )}
        
        <div>
          <CourseTitle>
            {course.title}
            <StatusBadge enrolled={isEnrolled}>
              {isEnrolled ? `${Math.round(progress)}% Complete` : 'Not Enrolled'}
            </StatusBadge>
          </CourseTitle>

          {isEnrolled && (
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                Your Progress
              </div>
              <ProgressBar>
                <ProgressFill width={progress} />
              </ProgressBar>
            </div>
          )}

          <div style={{ color: '#666', fontSize: '1rem', lineHeight: 1.6 }}>
            <div><strong>Duration:</strong> {course.duration || 'Self-paced'}</div>
            <div><strong>Level:</strong> {course.level || 'Beginner'}</div>
            <div><strong>Category:</strong> {course.category}</div>
            <div><strong>Students:</strong> {course.enrolledStudents?.length || 0} enrolled</div>
          </div>

          {/* View Grades Button - always available */}
          <div style={{ marginTop: '1rem' }}>
            <ActionButton onClick={() => setShowGradesModal(true)}>
              📊 View Grades & Progress
            </ActionButton>
            
            {/* Debug button for testing what data is actually being received */}
            <ActionButton 
              onClick={() => {
                console.log('🔍 REAL DATA ANALYSIS - What we received from backend:');
                console.log('📊 Full Course Object:', course);
                console.log('📚 Modules Count:', course.modules?.length || 0);
                
                if (course.modules && course.modules.length > 0) {
                  course.modules.forEach((module, idx) => {
                    console.log(`📖 Module ${idx + 1}:`, {
                      id: module._id,
                      title: module.title,
                      type: module.type,
                      quizzes: module.quizzes?.length || 0,
                      discussions: module.discussions?.length || 0,
                      assessments: module.assessments?.length || 0,
                      hasContent: !!module.content,
                      hasDescription: !!module.description
                    });
                    
                    if (module.quizzes && module.quizzes.length > 0) {
                      console.log(`  🧠 Module ${idx + 1} Quizzes:`, module.quizzes.map(q => ({
                        id: q._id,
                        title: q.title,
                        questions: q.questions?.length || 0,
                        instructorId: q.instructorId,
                        courseId: q.courseId
                      })));
                    }
                    
                    if (module.discussions && module.discussions.length > 0) {
                      console.log(`  💬 Module ${idx + 1} Discussions:`, module.discussions.map(d => ({
                        id: d._id,
                        title: d.title,
                        hasContent: !!d.content,
                        instructorId: d.instructorId,
                        courseId: d.courseId
                      })));
                    }
                  });
                  
                  // Test navigation to first available content
                  const firstModule = course.modules[0];
                  if (firstModule.discussions && firstModule.discussions.length > 0) {
                    const firstDiscussion = firstModule.discussions[0];
                    console.log('🎯 Testing navigation to discussion:', firstDiscussion.title);
                    navigate(`/courses/${courseId}/modules/${firstModule._id}/discussion/${firstDiscussion._id}`);
                  } else if (firstModule.quizzes && firstModule.quizzes.length > 0) {
                    const firstQuiz = firstModule.quizzes[0];
                    console.log('🎯 Testing navigation to quiz:', firstQuiz.title);
                    navigate(`/courses/${courseId}/modules/${firstModule._id}/quiz/${firstQuiz._id}`);
                  } else {
                    alert('✅ Real data confirmed, but no instructor-created quizzes/discussions found in first module');
                  }
                } else {
                  alert('❌ No modules found in course data');
                }
              }}
              style={{ marginLeft: '1rem' }}
            >
              🔍 Analyze Real Data
            </ActionButton>
            
            {/* Test Click Handler Button */}
            <ActionButton 
              onClick={() => {
                console.log('🔧 TESTING CLICK HANDLERS...');
                console.log('🔧 Course ID:', courseId);
                console.log('🔧 Navigate function:', typeof navigate);
                
                // Test direct navigation
                try {
                  const testUrl = `/courses/${courseId}/overview`;
                  console.log('🔧 Testing direct navigation to:', testUrl);
                  navigate(testUrl);
                  console.log('✅ Direct navigation test successful');
                } catch (error) {
                  console.error('❌ Direct navigation test failed:', error);
                  alert('Navigation test failed. Check console for details.');
                }
              }}
              style={{ marginLeft: '1rem', backgroundColor: '#28a745' }}
            >
              🔧 Test Navigation
            </ActionButton>
            
            {/* Module Access Test Button */}
            <ActionButton 
              onClick={() => {
                console.log('🧪 MODULE ACCESS TEST STARTING...');
                console.log('🧪 Available modules:', course.modules?.length || 0);
                
                if (course.modules && course.modules.length > 0) {
                  const firstModule = course.modules[0];
                  console.log('🧪 Testing with first module:', {
                    id: firstModule._id,
                    title: firstModule.title,
                    hasDescription: !!firstModule.description,
                    hasContent: !!firstModule.content,
                    hasDiscussions: firstModule.discussions?.length || 0,
                    hasQuizzes: firstModule.quizzes?.length || 0
                  });
                  
                  // Test multiple navigation paths
                  const testPaths = [];
                  
                  if (firstModule.description) {
                    testPaths.push({
                      name: 'Module Description',
                      url: `/courses/${courseId}/modules/${firstModule._id}/description`,
                      type: 'description'
                    });
                  }
                  
                  if (firstModule.content) {
                    testPaths.push({
                      name: 'Module Content', 
                      url: `/courses/${courseId}/modules/${firstModule._id}/content`,
                      type: 'content'
                    });
                  }
                  
                  if (firstModule.discussions && firstModule.discussions.length > 0) {
                    testPaths.push({
                      name: 'Discussion: ' + firstModule.discussions[0].title,
                      url: `/courses/${courseId}/modules/${firstModule._id}/discussion/${firstModule.discussions[0]._id}`,
                      type: 'discussion'
                    });
                  }
                  
                  if (firstModule.quizzes && firstModule.quizzes.length > 0) {
                    testPaths.push({
                      name: 'Quiz: ' + firstModule.quizzes[0].title,
                      url: `/courses/${courseId}/modules/${firstModule._id}/quiz/${firstModule.quizzes[0]._id}`,
                      type: 'quiz'
                    });
                  }
                  
                  console.log('🧪 Available test paths:', testPaths);
                  
                  if (testPaths.length > 0) {
                    const selectedPath = testPaths[0]; // Test the first available path
                    console.log('🧪 Testing navigation to:', selectedPath);
                    
                    try {
                      navigate(selectedPath.url);
                      console.log('✅ Module access test navigation successful to:', selectedPath.name);
                    } catch (error) {
                      console.error('❌ Module access test failed:', error);
                      alert('Module navigation test failed: ' + error.message);
                    }
                  } else {
                    alert('❌ No content available to test in the first module');
                  }
                } else {
                  alert('❌ No modules found to test');
                }
              }}
              style={{ marginLeft: '1rem', backgroundColor: '#dc3545' }}
            >
              🧪 Test Module Access
            </ActionButton>
          </div>

        </div>
      </CourseHeader>

      {course.overview && (
        <EnhancedOverviewSection>
          <OverviewHeader>
            <OverviewTitle>Course Overview</OverviewTitle>
          </OverviewHeader>
          <OverviewContent>
            <OverviewDescription>
              {course.overview}
            </OverviewDescription>
            <SeeMoreButton>See More</SeeMoreButton>
          </OverviewContent>
        </EnhancedOverviewSection>
      )}

      {course.learningOutcomes && (
        <LearningOutcomesSection>
          <LearningOutcomesHeader>
            <LearningOutcomesTitle>Learning Outcomes</LearningOutcomesTitle>
          </LearningOutcomesHeader>
          <OutcomesContent>
            <OutcomesGrid>
              {course.learningOutcomes.split('\n').filter(outcome => outcome.trim()).map((outcome, index) => (
                <OutcomeItem key={index}>
                  <OutcomeIcon>
                    <CheckCircle style={{ fontSize: '0.75rem' }} />
                  </OutcomeIcon>
                  <OutcomeText>{outcome.trim()}</OutcomeText>
                </OutcomeItem>
              ))}
            </OutcomesGrid>
          </OutcomesContent>
        </LearningOutcomesSection>
      )}

      {course.modules && course.modules.length > 0 && (
        <ModulesSection>
          <ModulesSectionHeader>
            <ModulesSectionTitle>Course Modules</ModulesSectionTitle>

          </ModulesSectionHeader>
          <ModulesContent>
            {course.modules.map((module, index) => {
              const isExpanded = expandedModules.has(module._id);
              
              // Count total items in module
              let totalItems = 0;
              let itemBreakdown = [];
              
              if (module.description) {
                totalItems++;
                itemBreakdown.push('1 description');
              }
              if (module.content) {
                totalItems++;
                itemBreakdown.push('1 content');
              }
              if (module.videoUrl) {
                totalItems++;
                itemBreakdown.push('1 video');
              }
              if (module.resources && module.resources.length > 0) {
                totalItems += module.resources.length;
                itemBreakdown.push(`${module.resources.length} resource${module.resources.length !== 1 ? 's' : ''}`);
              }
              if (module.assessments && module.assessments.length > 0) {
                totalItems += module.assessments.length;
                itemBreakdown.push(`${module.assessments.length} assessment${module.assessments.length !== 1 ? 's' : ''}`);
              }
              if (module.quizzes && module.quizzes.length > 0) {
                totalItems += module.quizzes.length;
                itemBreakdown.push(`${module.quizzes.length} quiz${module.quizzes.length !== 1 ? 'zes' : ''}`);
              }
              if (module.discussions && module.discussions.length > 0) {
                totalItems += module.discussions.length;
                itemBreakdown.push(`${module.discussions.length} discussion${module.discussions.length !== 1 ? 's' : ''}`);
              }

              return (
                <ModuleCard key={module._id} id={`module-${module._id}`}>
                  <ModuleHeader 
                    expanded={isExpanded}
                    onClick={() => toggleModule(module._id)}
                  >
                    <ModuleHeaderContent>
                      <ModuleNumber>{index + 1}</ModuleNumber>
                      <ModuleTitleContainer>
                        <ModuleTitle>
                          Module {index + 1}: {module.title}
                          <ModuleItemCount>
                            ({totalItems} item{totalItems !== 1 ? 's' : ''})
                          </ModuleItemCount>
                        </ModuleTitle>
                      </ModuleTitleContainer>
                    </ModuleHeaderContent>
                    <ExpandIcon expanded={isExpanded}>
                      <Add />
                    </ExpandIcon>
                  </ModuleHeader>

                  {isExpanded && (
                    <ModuleContent>
                      {/* Module Description as clickable item */}
                      {module.description && (
                        <ContentItem 
                          onClick={(e) => {
                            console.log('🎯 MODULE DESCRIPTION CLICK EVENT:', e);
                            console.log('🎯 MODULE DESCRIPTION CLICK:', module.title);
                            console.log('🎯 Module data:', {
                              id: module._id,
                              title: module.title,
                              hasDescription: !!module.description
                            });
                            
                            // Add visual feedback (with null check)
                            if (e.currentTarget && e.currentTarget.style) {
                              e.currentTarget.style.backgroundColor = '#e3f2fd';
                              setTimeout(() => {
                                if (e.currentTarget && e.currentTarget.style) {
                                  e.currentTarget.style.backgroundColor = '';
                                }
                              }, 200);
                            }
                            
                            try {
                              console.log('🚀 Calling handleContentClick for description...');
                              handleContentClick(module, 'description');
                              console.log('✅ handleContentClick completed for description');
                            } catch (error) {
                              console.error('❌ Error in handleContentClick:', error);
                              alert('Error navigating to module description. Check console for details.');
                            }
                          }}
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                        >
                          <ContentItemIcon type="description">
                            <Description />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Module Description</ContentItemTitle>
                            <ContentItemMeta>Read • Module Overview</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                            {(() => {
                              const itemIndex = calculateItemIndex(module, 'description');
                              const completionKey = getCompletionKey(module, 'description', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              
                              return (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                    <div style={{ 
                                      width: '1.5rem', 
                                      height: '1.5rem', 
                                      border: '2px solid #e5e7eb', 
                                      borderRadius: '50%' 
                                    }} />
                                  )}
                                </div>
                              );
                            })()}
                          </ContentItemAction>
                        </ContentItem>
                      )}
                      
                      {/* Content/Lessons */}
                      {module.content && (
                        <ContentItem 
                          onClick={(e) => {
                            console.log('🎯 MODULE CONTENT CLICK EVENT:', e);
                            console.log('🎯 MODULE CONTENT CLICK:', module.title);
                            console.log('🎯 Module data:', {
                              id: module._id,
                              title: module.title,
                              hasContent: !!module.content
                            });
                            
                            // Add visual feedback (with null check)
                            if (e.currentTarget && e.currentTarget.style) {
                              e.currentTarget.style.backgroundColor = '#e3f2fd';
                              setTimeout(() => {
                                if (e.currentTarget && e.currentTarget.style) {
                                  e.currentTarget.style.backgroundColor = '';
                                }
                              }, 200);
                            }
                            
                            try {
                              console.log('🚀 Calling handleContentClick for content...');
                              handleContentClick(module, 'content');
                              console.log('✅ handleContentClick completed for content');
                            } catch (error) {
                              console.error('❌ Error in handleContentClick:', error);
                              alert('Error navigating to module content. Check console for details.');
                            }
                          }}
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                        >
                          <ContentItemIcon type="content">
                            <Description />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Content</ContentItemTitle>
                            <ContentItemMeta>Read • Learning Materials</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                            {(() => {
                              const itemIndex = calculateItemIndex(module, 'content');
                              const completionKey = getCompletionKey(module, 'content', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              
                              return (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                    <div style={{ 
                                      width: '1.5rem', 
                                      height: '1.5rem', 
                                      border: '2px solid #e5e7eb', 
                                      borderRadius: '50%' 
                                    }} />
                                  )}
                                </div>
                              );
                            })()}
                          </ContentItemAction>
                        </ContentItem>
                      )}

                      {/* Video Lectures */}
                      {module.videoUrl && (
                        <ContentItem onClick={() => handleContentClick(module, 'video')}>
                          <ContentItemIcon type="video">
                            <VideoLibrary />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Video Lecture: {module.videoTitle || 'Lecture Video'}</ContentItemTitle>
                            <ContentItemMeta>Watch • Video Content</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                            {(() => {
                              const itemIndex = calculateItemIndex(module, 'video');
                              const completionKey = getCompletionKey(module, 'video', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              return (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkComplete(module, 'video', itemIndex);
                                      }}
                                      data-completion-key={completionKey}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Mark as complete"
                                    >
                                      <RadioButtonUnchecked style={{ fontSize: '1.5rem', color: '#6c757d' }} />
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </ContentItemAction>
                        </ContentItem>
                      )}

                      {/* Resources */}
                      {module.resources && module.resources.map((resource, idx) => (
                        <ContentItem 
                          key={`resource-${idx}`}
                          onClick={() => {
                            if (resource.url) {
                              window.open(resource.url, '_blank');
                            }
                          }}
                        >
                          <ContentItemIcon type="resource">
                            <Link />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Resource: {resource.title || `Resource ${idx + 1}`}</ContentItemTitle>
                            <ContentItemMeta>View • External Resource</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                            {(() => {
                              const itemIndex = calculateItemIndex(module, 'resource', idx);
                              const completionKey = getCompletionKey(module, 'resource', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              return (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkComplete(module, 'resource', itemIndex);
                                      }}
                                      data-completion-key={completionKey}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Mark as complete"
                                    >
                                      <RadioButtonUnchecked style={{ fontSize: '1.5rem', color: '#6c757d' }} />
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </ContentItemAction>
                        </ContentItem>
                      ))}

                      {/* Quizzes */}
                      {module.quizzes && module.quizzes.map((quiz, idx) => (
                        <div
                          key={`quiz-${idx}`}
                          data-testid="quiz-item"
                          onClick={(e) => {
                            console.log('🎯 DIRECT Quiz click event:', e);
                            console.log('🎯 DIRECT Quiz click:', quiz.title, 'ID:', quiz._id);
                            console.log('🎯 Full quiz object:', quiz);
                            console.log('🎯 Navigation URL will be:', `/courses/${courseId}/modules/${module._id}/quiz/${quiz._id}`);
                            
                            // Prevent any default behavior
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (!quiz._id) {
                              console.error('❌ Quiz has no _id:', quiz);
                              alert('Quiz ID missing. Please refresh the page and try again.');
                              return;
                            }
                            
                            try {
                              const returnUrl = `/courses/${courseId}/overview`;
                              const navigationUrl = `/courses/${courseId}/modules/${module._id}/quiz/${quiz._id}?return=${encodeURIComponent(returnUrl)}`;
                              console.log('🚀 Attempting navigation to:', navigationUrl);
                              navigate(navigationUrl);
                              console.log('✅ Navigate command executed successfully');
                            } catch (error) {
                              console.error('❌ Navigation error:', error);
                              alert('Navigation failed. Check console for details.');
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid #e0e6ed',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e9ecef';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#9C27B0',
                            color: 'white',
                            flexShrink: 0
                          }}>
                            <Quiz />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                              color: '#333',
                              margin: '0 0 0.25rem 0',
                              fontSize: '1rem',
                              fontWeight: 600,
                              lineHeight: 1.3
                            }}>
                              Quiz {idx + 1}: {quiz.title}
                            </h4>
                            <div style={{
                              color: '#6c757d',
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }}>
                              {quiz.questions?.length || 0}pts • Take Quiz
                            </div>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            gap: '0.5rem', 
                            alignItems: 'center',
                            color: '#6c757d',
                            flexShrink: 0
                          }}>
                            {(() => {
                              const itemIndex = calculateItemIndex(module, 'quiz', idx);
                              const completionKey = getCompletionKey(module, 'quiz', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              
                              return isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                <div style={{ 
                                  width: '1.5rem', 
                                  height: '1.5rem', 
                                  border: '2px solid #e5e7eb', 
                                  borderRadius: '50%' 
                                }} />
                              );
                            })()}
                          </div>
                        </div>
                      ))}

                      {/* Assessments */}
                      {module.assessments && module.assessments.map((assessment, idx) => (
                        <ContentItem 
                          key={`assessment-${idx}`}
                          onClick={() => handleContentClick(module, 'assessment', assessment)}
                        >
                          <ContentItemIcon type="assessment">
                            <Assignment />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Assessment {idx + 1}: {assessment.title}</ContentItemTitle>
                            <ContentItemMeta>{assessment.totalPoints || 0}pts • Take Assessment</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                            {(() => {
                              const itemIndex = calculateItemIndex(module, 'assessment', idx);
                              const completionKey = getCompletionKey(module, 'assessment', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              return (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkComplete(module, 'assessment', itemIndex);
                                      }}
                                      data-completion-key={completionKey}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Mark as complete"
                                    >
                                      <RadioButtonUnchecked style={{ fontSize: '1.5rem', color: '#6c757d' }} />
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </ContentItemAction>
                        </ContentItem>
                      ))}

                      {/* Discussions */}
                      {module.discussions && module.discussions.map((discussion, idx) => (
                        <div
                          key={`discussion-${idx}`}
                          data-testid="discussion-item"
                          onClick={(e) => {
                            console.log('🎯 DIRECT Discussion click event:', e);
                            console.log('🎯 DIRECT Discussion click:', discussion.title, 'ID:', discussion._id);
                            console.log('🎯 Full discussion object:', discussion);
                            console.log('🎯 Navigation URL will be:', `/courses/${courseId}/modules/${module._id}/discussion/${discussion._id}`);
                            
                            // Prevent any default behavior
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (!discussion._id) {
                              console.error('❌ Discussion has no _id:', discussion);
                              alert('Discussion ID missing. Please refresh the page and try again.');
                              return;
                            }
                            
                            try {
                              const returnUrl = `/courses/${courseId}/overview`;
                              const navigationUrl = `/courses/${courseId}/modules/${module._id}/discussion/${discussion._id}?return=${encodeURIComponent(returnUrl)}`;
                              console.log('🚀 Attempting navigation to:', navigationUrl);
                              navigate(navigationUrl);
                              console.log('✅ Navigate command executed successfully');
                            } catch (error) {
                              console.error('❌ Navigation error:', error);
                              alert('Navigation failed. Check console for details.');
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid #e0e6ed',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e9ecef';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#FF5722',
                            color: 'white',
                            flexShrink: 0
                          }}>
                            <Forum />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                              color: '#333',
                              margin: '0 0 0.25rem 0',
                              fontSize: '1rem',
                              fontWeight: 600,
                              lineHeight: 1.3
                            }}>
                              Discussion {idx + 1}: {discussion.title}
                            </h4>
                            <div style={{
                              color: '#6c757d',
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }}>
                              Participate • Forum Discussion
                            </div>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            gap: '0.5rem', 
                            alignItems: 'center',
                            color: '#6c757d',
                            flexShrink: 0
                          }}>
                            {(() => {
                              const itemIndex = calculateItemIndex(module, 'discussion', idx);
                              const completionKey = getCompletionKey(module, 'discussion', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              
                              return isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                <div style={{ 
                                  width: '1.5rem', 
                                  height: '1.5rem', 
                                  border: '2px solid #e5e7eb', 
                                  borderRadius: '50%' 
                                }} />
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </ModuleContent>
                  )}
                </ModuleCard>
              );
            })}
          </ModulesContent>
        </ModulesSection>
      )}

      {/* Grades Modal */}
      {showGradesModal && (
        <ModalOverlay onClick={() => setShowGradesModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>📊 Course Grades & Progress</ModalTitle>
            <ModalText>Your detailed progress for "{course.title}"</ModalText>
            
            <GradesSection>
              {course.modules.map((module, index) => (
                <div key={module._id} style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
                    Module {index + 1}: {module.title}
                    <span style={{ 
                      marginLeft: '1rem', 
                      fontSize: '0.9rem', 
                      color: isModuleCompleted(module) ? '#10b981' : '#6b7280',
                      fontWeight: '500' 
                    }}>
                      {isModuleCompleted(module) ? '✅ Completed' : '⭕ In Progress'}
                    </span>
                  </h4>
                  
                  {/* Module items */}
                  {module.description && (
                    <GradeItem>
                      <span>📄 Module Description</span>
                      <GradeStatus completed={(() => {
                        const itemIndex = calculateItemIndex(module, 'description');
                        const completionKey = getCompletionKey(module, 'description', itemIndex);
                        return completedItems.has(completionKey);
                      })()}>
                        {(() => {
                          const itemIndex = calculateItemIndex(module, 'description');
                          const completionKey = getCompletionKey(module, 'description', itemIndex);
                          return completedItems.has(completionKey) ? '✅ Completed' : '⭕ Pending';
                        })()}
                      </GradeStatus>
                    </GradeItem>
                  )}
                  
                  {module.content && (
                    <GradeItem>
                      <span>📝 Content</span>
                      <GradeStatus completed={(() => {
                        const itemIndex = calculateItemIndex(module, 'content');
                        const completionKey = getCompletionKey(module, 'content', itemIndex);
                        return completedItems.has(completionKey);
                      })()}>
                        {(() => {
                          const itemIndex = calculateItemIndex(module, 'content');
                          const completionKey = getCompletionKey(module, 'content', itemIndex);
                          return completedItems.has(completionKey) ? '✅ Completed' : '⭕ Pending';
                        })()}
                      </GradeStatus>
                    </GradeItem>
                  )}
                  
                  {module.videoUrl && (
                    <GradeItem>
                      <span>🎬 Video Lecture</span>
                      <GradeStatus completed={(() => {
                        const itemIndex = calculateItemIndex(module, 'video');
                        const completionKey = getCompletionKey(module, 'video', itemIndex);
                        return completedItems.has(completionKey);
                      })()}>
                        {(() => {
                          const itemIndex = calculateItemIndex(module, 'video');
                          const completionKey = getCompletionKey(module, 'video', itemIndex);
                          return completedItems.has(completionKey) ? '✅ Completed' : '⭕ Pending';
                        })()}
                      </GradeStatus>
                    </GradeItem>
                  )}
                  
                  {module.quizzes && module.quizzes.map((quiz, idx) => (
                    <GradeItem key={`quiz-${idx}`}>
                      <span>🎯 Quiz {idx + 1}: {quiz.title}</span>
                      <GradeStatus completed={(() => {
                        const itemIndex = calculateItemIndex(module, 'quiz', idx);
                        const completionKey = getCompletionKey(module, 'quiz', itemIndex);
                        return completedItems.has(completionKey);
                      })()}>
                        {(() => {
                          const itemIndex = calculateItemIndex(module, 'quiz', idx);
                          const completionKey = getCompletionKey(module, 'quiz', itemIndex);
                          return completedItems.has(completionKey) ? '✅ Completed' : '⭕ Pending';
                        })()}
                      </GradeStatus>
                    </GradeItem>
                  ))}
                  
                  {module.assessments && module.assessments.map((assessment, idx) => (
                    <GradeItem key={`assessment-${idx}`}>
                      <span>📋 Assessment {idx + 1}: {assessment.title}</span>
                      <GradeStatus completed={(() => {
                        const itemIndex = calculateItemIndex(module, 'assessment', idx);
                        const completionKey = getCompletionKey(module, 'assessment', itemIndex);
                        return completedItems.has(completionKey);
                      })()}>
                        {(() => {
                          const itemIndex = calculateItemIndex(module, 'assessment', idx);
                          const completionKey = getCompletionKey(module, 'assessment', itemIndex);
                          return completedItems.has(completionKey) ? '✅ Completed' : '⭕ Pending';
                        })()}
                      </GradeStatus>
                    </GradeItem>
                  ))}
                  
                  {module.discussions && module.discussions.map((discussion, idx) => (
                    <GradeItem key={`discussion-${idx}`}>
                      <span>💬 Discussion {idx + 1}: {discussion.title}</span>
                      <GradeStatus completed={(() => {
                        const itemIndex = calculateItemIndex(module, 'discussion', idx);
                        const completionKey = getCompletionKey(module, 'discussion', itemIndex);
                        return completedItems.has(completionKey);
                      })()}>
                        {(() => {
                          const itemIndex = calculateItemIndex(module, 'discussion', idx);
                          const completionKey = getCompletionKey(module, 'discussion', itemIndex);
                          return completedItems.has(completionKey) ? '✅ Completed' : '⭕ Pending';
                        })()}
                      </GradeStatus>
                    </GradeItem>
                  ))}
                </div>
              ))}
            </GradesSection>
            
            <ModalButtons>
              <ModalButton className="secondary" onClick={() => setShowGradesModal(false)}>
                Close
              </ModalButton>
              {isCourseCompleted() && (
                <ModalButton className="primary" onClick={() => {
                  setShowGradesModal(false);
                  generateCertificate();
                  navigate('/certificates');
                }}>
                  Get Certificate
                </ModalButton>
              )}
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default StudentCourseOverview; 