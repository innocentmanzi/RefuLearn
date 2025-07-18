import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import QuizTaker from '../../components/QuizTaker';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';

const Container = styled.div`
  padding: 2rem;
  background: white;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e6ed;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
  }
`;

const QuizInfo = styled.div`
  flex: 1;
  margin-left: 2rem;
`;

const QuizTitle = styled.h1`
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const QuizMeta = styled.div`
  display: flex;
  gap: 2rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e0e6ed;
  margin-top: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${props => props.primary ? '#007bff' : '#ddd'};
  background: ${props => props.primary ? '#007bff' : 'white'};
  color: ${props => props.primary ? 'white' : '#666'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#0056b3' : '#f8f9fa'};
    border-color: ${props => props.primary ? '#0056b3' : '#007bff'};
    color: ${props => props.primary ? 'white' : '#007bff'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NavButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const CompletionBanner = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
`;

const StudentQuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId, quizId, moduleId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadQuizAndCourse = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        console.log('🎯 StudentQuizPage - Loading quiz and course:', {
          courseId,
          quizId,
          moduleId
        });

        // Get course data which includes quiz data in modules
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Course data loaded:', data);
          
          if (data && data.data && data.data.course) {
            const courseData = data.data.course;
            setCourse(courseData);
            
            console.log('🔍 Searching for quiz in course modules...');
            
            // Find the quiz in course modules
            let foundQuiz = null;
            let foundModule = null;
            if (courseData.modules) {
              for (const module of courseData.modules) {
                if (module.quizzes) {
                  foundQuiz = module.quizzes.find(q => q._id === quizId);
                  if (foundQuiz) {
                    foundModule = module;
                    console.log('✅ Quiz found in module:', module.title);
                    
                    // Add necessary properties for QuizTaker component
                    foundQuiz = {
                      ...foundQuiz,
                      courseId: courseId,
                      moduleId: moduleId,
                      // Ensure duration is a number for timer
                      duration: parseInt(foundQuiz.duration) || 30,
                      // Ensure type is set correctly
                      type: foundQuiz.type || 'quiz'
                    };
                    break;
                  }
                }
              }
            }
            
            if (foundQuiz && foundModule) {
              // Enhanced debugging for quiz data structure
              console.log('🔍 DETAILED Quiz Data Analysis:', {
                quizId: foundQuiz._id,
                title: foundQuiz.title,
                description: foundQuiz.description,
                type: foundQuiz.type,
                hasQuestions: !!foundQuiz.questions,
                questionCount: foundQuiz.questions?.length || 0,
                questions: foundQuiz.questions,
                duration: foundQuiz.duration,
                totalPoints: foundQuiz.totalPoints,
                dueDate: foundQuiz.dueDate,
                dueDateType: typeof foundQuiz.dueDate,
                dueDateValid: foundQuiz.dueDate ? !isNaN(new Date(foundQuiz.dueDate).getTime()) : false,
                rawDueDateValue: foundQuiz.dueDate,
                fullQuizObject: foundQuiz
              });

              // If quiz doesn't have a due date, set a default one (7 days from now)
              if (!foundQuiz.dueDate) {
                const defaultDueDate = new Date();
                defaultDueDate.setDate(defaultDueDate.getDate() + 7);
                foundQuiz.dueDate = defaultDueDate.toISOString();
                console.log('⚠️ Quiz had no due date, setting default:', foundQuiz.dueDate);
              }

              // Ensure we have questions
              if (!foundQuiz.questions || foundQuiz.questions.length === 0) {
                console.error('❌ Quiz has no questions!', foundQuiz);
                setError(`Quiz "${foundQuiz.title}" has no questions. Please contact the instructor.`);
                setLoading(false);
                return;
              }

              // Validate question structure
              console.log('🔍 Question Structure Analysis:', 
                foundQuiz.questions.map((q, idx) => ({
                  index: idx,
                  hasQuestion: !!q.question,
                  hasType: !!q.type,
                  type: q.type,
                  hasOptions: !!q.options,
                  optionCount: q.options?.length || 0,
                  hasCorrectAnswer: !!q.correctAnswer,
                  points: q.points,
                  questionText: q.question?.substring(0, 50) + '...'
                }))
              );

              setQuiz(foundQuiz);
              setModule(foundModule);
              console.log('✅ Quiz data validated and set for QuizTaker');
              
              // Build content items for navigation
              buildContentItems(foundModule);
              
              // Check completion status
              await checkCompletionStatus();
            } else {
              setError(`Quiz not found in course. Quiz ID: ${quizId}`);
              console.log('❌ Quiz not found in any module');
            }
          } else {
            setError('Invalid course data structure');
          }
        } else {
          const errorText = await response.text();
          setError(`Failed to load course (${response.status}): ${errorText}`);
          console.error('❌ Course fetch failed:', response.status, errorText);
        }

      } catch (err) {
        console.error('Quiz loading error:', err);
        setError('Network error loading quiz: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && quizId) {
      loadQuizAndCourse();
    } else {
      setError('Missing course or quiz ID');
      setLoading(false);
    }
  }, [courseId, quizId, moduleId]);

  const buildContentItems = (moduleData) => {
    const items = [];
    
    // Add content items in order (same as ModuleContent.js)
    if (moduleData.description) {
      items.push({ type: 'description', title: 'Module Description' });
    }
    
    if (moduleData.content) {
      items.push({ type: 'content', title: 'Content' });
    }
    
    if (moduleData.videoUrl) {
      items.push({ type: 'video', title: moduleData.videoTitle || 'Video Lecture' });
    }
    
    if (moduleData.resources) {
      moduleData.resources.forEach((resource, idx) => {
        items.push({ 
          type: 'resource', 
          title: resource.title || `Resource ${idx + 1}`,
          data: resource 
        });
      });
    }
    
    if (moduleData.assessments) {
      moduleData.assessments.forEach((assessment, idx) => {
        items.push({ 
          type: 'assessment', 
          title: assessment.title || `Assessment ${idx + 1}`,
          data: assessment 
        });
      });
    }
    
    if (moduleData.quizzes) {
      moduleData.quizzes.forEach((quiz, idx) => {
        items.push({ 
          type: 'quiz', 
          title: quiz.title || `Quiz ${idx + 1}`,
          data: quiz 
        });
      });
    }
    
    if (moduleData.discussions) {
      moduleData.discussions.forEach((discussion, idx) => {
        items.push({ 
          type: 'discussion', 
          title: discussion.title || `Discussion ${idx + 1}`,
          data: discussion 
        });
      });
    }
    
    setContentItems(items);
    
    // Find current quiz index
    const quizIndex = items.findIndex(item => 
      item.type === 'quiz' && item.data._id === quizId
    );
    if (quizIndex >= 0) {
      setCurrentIndex(quizIndex);
    }
    
    console.log('📝 Built content items:', items);
    console.log('🎯 Current quiz index:', quizIndex);
  };

  const checkCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check both quiz sessions and course progress for completion
      console.log('🔍 Checking completion status for quiz:', quizId);
      
      // Method 1: Check quiz sessions for real completion data
      let isCompleted = false;
      let completionData = null;
      
      // Get current user info for debugging
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('🔍 Current user for quiz completion check:', {
        userId: currentUser.id || currentUser._id,
        userObj: currentUser,
        quizId: quizId
      });
      
      try {
        const sessionResponse = await fetch(`/api/quiz-sessions/${quizId}/completion-status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 Completion status response status:', sessionResponse.status);
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          console.log('✅ Quiz session completion checked:', sessionData);
          
          if (sessionData.success && sessionData.data && sessionData.data.isCompleted) {
            isCompleted = true;
            completionData = {
              isCompleted: true,
              completedAt: sessionData.data.completedAt,
              score: sessionData.data.score, // Real score from quiz session
              timeSpent: sessionData.data.timeSpent, // Real time spent
              sessionId: sessionData.data.sessionId,
              method: 'completion_status'
            };
            console.log('✅ Found real completion data via completion-status endpoint:', completionData);
          } else {
            console.log('ℹ️ Quiz not completed according to completion-status endpoint');
          }
        } else {
          const errorText = await sessionResponse.text();
          console.log('⚠️ Completion status endpoint failed:', sessionResponse.status, errorText);
        }
      } catch (sessionErr) {
        console.log('ℹ️ Quiz session check failed:', sessionErr.message);
      }
      
      // The enhanced completion-status endpoint should now find the data
      // If it still doesn't work, let's add one more detailed debugging attempt
      if (!isCompleted) {
        console.log('⚠️ Enhanced completion-status endpoint did not find completion data');
        console.log('🔄 Will fall back to course progress method');
      }
      
      // Method 2: Check course progress if not found in sessions
      if (!isCompleted) {
        try {
          const progressResponse = await fetch(`/api/courses/${courseId}/progress`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            console.log('✅ Course progress checked:', progressData);
            
            // Check if this quiz is marked as completed in course progress
            if (progressData.data && progressData.data.allCompletedItems) {
              // Calculate the completion key for this quiz
              let itemIndex = 0;
              if (module?.description) itemIndex++;
              if (module?.content) itemIndex++;
              if (module?.videoUrl) itemIndex++;
              if (module?.resources) itemIndex += module.resources.length;
              if (module?.assessments) itemIndex += module.assessments.length;
              
              // Find quiz index within quizzes
              if (module?.quizzes) {
                const quizIndex = module.quizzes.findIndex(q => q._id === quizId);
                if (quizIndex >= 0) {
                  itemIndex += quizIndex;
                  const completionKey = `quiz-${itemIndex}`;
                  
                  console.log('🔍 Checking for completion key:', completionKey);
                  console.log('🔍 All completed items:', progressData.data.allCompletedItems);
                  
                                     if (progressData.data.allCompletedItems.includes(completionKey)) {
                     isCompleted = true;
                     // Try to get real score from module progress data
                     let realScore = 'N/A';
                     let realTime = 'N/A';
                     
                     // Look for module progress data with scores
                     if (progressData.data.progress) {
                       const moduleProgress = progressData.data.progress.find(p => p.moduleId === moduleId);
                       if (moduleProgress && moduleProgress.score) {
                         realScore = moduleProgress.score;
                       }
                     }
                     
                     completionData = {
                       isCompleted: true,
                       completedAt: new Date(),
                       score: realScore, // Try to get real score or show 'N/A'
                       timeSpent: realTime, // Show 'N/A' for time if not available
                       method: 'progress'
                     };
                     console.log('✅ Found completion via course progress with score:', realScore);
                   }
                }
              }
            }
          }
        } catch (progressErr) {
          console.log('ℹ️ Course progress check failed:', progressErr.message);
        }
      }
      
             // Update state if completed
       if (isCompleted && completionData) {
         setIsCompleted(true);
         setCompletionData(completionData);
         console.log('✅ Quiz completion confirmed:', completionData);
         console.log('🔍 Final completion data details:', {
           score: completionData.score,
           scoreType: typeof completionData.score,
           timeSpent: completionData.timeSpent,
           timeSpentType: typeof completionData.timeSpent,
           completedAt: completionData.completedAt,
           method: completionData.method
         });
       } else {
         console.log('ℹ️ Quiz not completed yet');
       }
      
    } catch (err) {
      console.error('Error checking completion status:', err);
    }
  };

  const handleQuizComplete = async (result) => {
    console.log('🎉 Quiz completed:', result);
    
    try {
      // Create quiz session record for proper completion tracking
      const token = localStorage.getItem('token');
      
      try {
        const sessionResponse = await fetch(`/api/courses/${courseId}/quiz/${quizId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            answers: result.answers || {},
            timeSpent: result.timeSpent || 0
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          console.log('✅ Quiz session created with real data:', sessionData);
          
          // Update completion data with real values from the session
          if (sessionData.data) {
            setCompletionData({
              isCompleted: true,
              completedAt: sessionData.data.submittedAt,
              score: sessionData.data.score, // Real score from backend
              timeSpent: sessionData.data.timeSpent, // Real time from backend
              sessionId: sessionData.data.sessionId,
              method: 'fresh_session'
            });
          }
        } else {
          const errorText = await sessionResponse.text();
          console.log('⚠️ Quiz session creation failed:', errorText);
        }
      } catch (sessionErr) {
        console.log('⚠️ Quiz session creation error:', sessionErr.message);
      }
      
      // Update progress (this is the main completion tracking)
      await updateProgress();
      
      // Update completion status (this might be overridden above if session creation was successful)
      if (!isCompleted) {
        setIsCompleted(true);
        if (!completionData || completionData.method !== 'fresh_session') {
          setCompletionData({
            isCompleted: true,
            completedAt: new Date(),
            score: result.score,
            timeSpent: result.timeSpent,
            method: 'fallback'
          });
        }
      }
      
      console.log('✅ Quiz completion processed successfully');
    } catch (err) {
      console.error('Error processing quiz completion:', err);
    }
  };

  const handleMarkComplete = async () => {
    try {
      // Mark as complete even if quiz wasn't submitted via QuizTaker
      await updateProgress();
      
      // Update completion status
      setIsCompleted(true);
      setCompletionData({
        isCompleted: true,
        completedAt: new Date(),
        score: 'Manual', // Indicate this was manually marked
        timeSpent: 'N/A',
        method: 'manual'
      });
      
      console.log('✅ Quiz manually marked as complete');
    } catch (err) {
      console.error('Error marking quiz as complete:', err);
    }
  };

  const updateProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Calculate completion key (same logic as other components)
      let itemIndex = 0;
      if (module.description) itemIndex++;
      if (module.content) itemIndex++;
      if (module.videoUrl) itemIndex++;
      if (module.resources) itemIndex += module.resources.length;
      if (module.assessments) itemIndex += module.assessments.length;
      
      // Find quiz index within quizzes
      const quizIndex = module.quizzes.findIndex(q => q._id === quizId);
      itemIndex += quizIndex;
      
      const completionKey = `quiz-${itemIndex}`;
      
      console.log('📊 Updating progress:', {
        moduleId,
        completionKey,
        itemIndex,
        quizIndex
      });

      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moduleId: moduleId,
          contentType: 'quiz',
          itemIndex: itemIndex,
          completionKey: completionKey,
          completed: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Progress updated successfully:', data);
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('courseProgressUpdated', { 
          detail: { courseId, completionKey } 
        }));
      } else {
        console.error('❌ Failed to update progress');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevItem = contentItems[currentIndex - 1];
      navigateToContent(prevItem, currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < contentItems.length - 1) {
      const nextItem = contentItems[currentIndex + 1];
      navigateToContent(nextItem, currentIndex + 1);
    }
  };

  const navigateToContent = (item, index) => {
    let navigationUrl = `/courses/${courseId}/modules/${moduleId}`;
    
    switch (item.type) {
      case 'description':
      case 'content':
      case 'video':
        navigationUrl = `/courses/${courseId}/module/${moduleId}`;
        break;
      case 'quiz':
        navigationUrl = `/courses/${courseId}/modules/${moduleId}/quiz/${item.data._id}`;
        break;
      case 'assessment':
        navigationUrl = `/courses/${courseId}/modules/${moduleId}/assessment/${item.data._id}`;
        break;
      case 'discussion':
        navigationUrl = `/courses/${courseId}/modules/${moduleId}/discussion/${item.data._id}`;
        break;
      case 'resource':
        const resourceIndex = contentItems.slice(0, index).filter(i => i.type === 'resource').length;
        navigationUrl = `/courses/${courseId}/modules/${moduleId}/resource/${resourceIndex}`;
        break;
      default:
        navigationUrl = `/courses/${courseId}/module/${moduleId}`;
    }
    
    console.log('🚀 Navigating to:', navigationUrl);
    navigate(navigationUrl);
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    if (typeof score === 'string') return score;
    if (typeof score === 'number') return `${Math.round(score)}%`;
    return 'N/A';
  };

  const formatTimeSpent = (timeSpent) => {
    if (!timeSpent || timeSpent === 'N/A') return 'N/A';
    if (typeof timeSpent === 'string') return timeSpent;
    
    // Convert seconds to readable format
    const totalSeconds = parseInt(timeSpent);
    if (isNaN(totalSeconds)) return 'N/A';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDueDate = (dueDate) => {
    console.log('🔍 formatDueDate called with:', {
      dueDate,
      type: typeof dueDate,
      isNull: dueDate === null,
      isUndefined: dueDate === undefined,
      isEmpty: dueDate === ''
    });
    
    if (!dueDate || dueDate === null || dueDate === undefined) {
      return 'No Due Date Set';
    }
    
    const date = new Date(dueDate);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Invalid due date:', dueDate);
      return 'Invalid Due Date';
    }
    
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('📅 Due date calculation:', {
      originalDate: dueDate,
      parsedDate: date.toISOString(),
      now: now.toISOString(),
      diffTime,
      diffDays
    });
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due ${date.toLocaleDateString()}`;
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>🔄 Loading Quiz...</h2>
          <p>Course: {courseId}</p>
          <p>Quiz: {quizId}</p>
          <p>Module: {moduleId}</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'red' }}>❌ Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate(`/courses/${courseId}/overview`)}
            style={{
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            ← Back to Course
          </button>
        </div>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>📝 No Quiz Data</h2>
          <p>The quiz could not be loaded.</p>
          <button 
            onClick={() => navigate(`/courses/${courseId}/overview`)}
            style={{
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Course
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/courses/${courseId}/overview`)}>
          <ArrowBack style={{ fontSize: '1rem' }} />
          Back to Course Overview
        </BackButton>
        <QuizInfo>
          <QuizTitle>{quiz.title || 'Untitled Quiz'}</QuizTitle>
          <QuizMeta>
            <MetaItem>📝 {quiz.questions?.length || 0} Questions</MetaItem>
            <MetaItem>⏰ {quiz.duration ? `${quiz.duration} minutes` : 'No time limit'}</MetaItem>
            <MetaItem>📅 {formatDueDate(quiz.dueDate)}</MetaItem>
            {quiz.totalPoints && <MetaItem>⭐ {quiz.totalPoints} Points</MetaItem>}
          </QuizMeta>
        </QuizInfo>
      </Header>

      {isCompleted && (
        <CompletionBanner>
          <CheckCircle style={{ fontSize: '1.5rem' }} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Quiz Completed!
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Score: {completionData?.score || 0}% • 
              Completed: {completionData?.completedAt ? new Date(completionData.completedAt).toLocaleDateString() : 'Recently'}
            </div>
          </div>
        </CompletionBanner>
      )}

      {isCompleted ? (
        <div style={{
          background: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#28a745', marginBottom: '1rem' }}>
            Quiz Already Completed!
          </h2>
          <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            You have successfully completed this quiz.
          </p>
          
          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>Results Summary:</h4>
                         <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                   {formatScore(completionData?.score)}
                 </div>
                 <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Score</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#17a2b8' }}>
                   {quiz.questions?.length || 0}
                 </div>
                 <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Questions</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6f42c1' }}>
                   {formatTimeSpent(completionData?.timeSpent)}
                 </div>
                 <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Time Spent</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fd7e14' }}>
                   {completionData?.completedAt ? new Date(completionData.completedAt).toLocaleDateString() : 'Recently'}
                 </div>
                 <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>Completed</div>
               </div>
             </div>
          </div>
          
          <p style={{ color: '#6c757d', fontSize: '0.875rem' }}>
            Your quiz completion has been saved. You can continue to the next content item.
          </p>
        </div>
      ) : (
        <QuizTaker 
          quiz={quiz}
          userRole="refugee"
          onComplete={handleQuizComplete}
          onEdit={() => {
            console.log('Edit function called (not available for refugees)');
          }}
        />
      )}

      <NavigationBar>
        <NavButton 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowBack style={{ fontSize: '1rem' }} />
          Previous
        </NavButton>
        
        <NavButtonGroup>
          {!isCompleted && (
            <NavButton 
              onClick={handleMarkComplete}
            >
              ✅ Mark as Complete
            </NavButton>
          )}
          
          {isCompleted && (
            <NavButton 
              style={{ 
                background: '#28a745', 
                borderColor: '#28a745',
                cursor: 'default' 
              }}
              disabled
            >
              ✅ Completed
            </NavButton>
          )}
          
          <NavButton 
            primary
            onClick={handleNext}
            disabled={currentIndex >= contentItems.length - 1}
          >
            Next
            <ArrowForward style={{ fontSize: '1rem' }} />
          </NavButton>
        </NavButtonGroup>
      </NavigationBar>
    </Container>
  );
};

export default StudentQuizPage; 