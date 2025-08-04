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
  Edit,
  Article,
  AudioFile,
  AttachFile
} from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

// Import all the styled components from instructor CourseOverview for consistency
const Container = styled.div`
  background: #ffffff;
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
  position: relative;
  z-index: 10;
  pointer-events: auto;
  
  &:hover {
    color: #0056b3;
    text-decoration: underline;
  }
  
  &:active {
    transform: translateY(1px);
  }
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

const CourseImage = styled.div`
  width: 200px;
  height: 150px;
  background: ${({ image }) => {
    console.log('🎨 CourseImage styled component - image prop:', image);
    return image ? `url(${image}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  background-color: #f8f9fa;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: 2px solid #e0e0e0;
  
  &::before {
    content: ${({ image }) => image ? 'none' : '"📚"'};
    font-size: 2rem;
    opacity: 0.8;
  }
  
  /* Always show the image container */
  min-height: 150px;
  min-width: 200px;
  
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
  transition: width 0.5s ease-out;
  will-change: width;
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
  color: #333333;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  console.log('🏠 STUDENT COURSE OVERVIEW component loading for URL:', window.location.pathname);
  
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
  const [courseCompleted, setCourseCompleted] = useState(false); // Always start as false - only set true when genuinely completed
  const [isMarkingComplete, setIsMarkingComplete] = useState(false); // Prevent rapid clicking
  const [overviewExpanded, setOverviewExpanded] = useState(false); // For See More/Less functionality
  const [imageLoaded, setImageLoaded] = useState(false);


  
  // Debounce utility function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Debounced progress update to prevent rapid changes
  const debouncedProgressUpdate = debounce((newProgress) => {
    setProgress(newProgress);
  }, 300);

  // Ensure all modules start collapsed when component mounts or course changes
  useEffect(() => {
    setExpandedModules(new Set());
    
    // Reset completion state - will be loaded from backend
    setCourseCompleted(false);
    setProgress(0);
    setCompletedItems(new Set());
    
    if (courseId) {
      console.log('🔄 Component mounted for course:', courseId);
      console.log('📊 Completion data will be loaded from backend');
    }
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
      
      // Ensure courseId is a string
      const courseIdString = String(courseId);
      const response = await fetch(`/api/courses/${courseIdString}/progress`, {
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
      console.error('❌ Progress API test failed:', error);
    }
  };

  // Function to debug completion status
  const debugCompletionStatus = () => {
    console.log('🔍 === COMPLETION STATUS DEBUG ===');
    console.log('📊 Current completedItems:', Array.from(completedItems));
    console.log('📊 Current course:', course?.title);
    console.log('📊 Current courseId:', courseId);
    
    // Check for potential migration issues
    const oldFormatKeys = Array.from(completedItems).filter(key => {
      // Look for keys that might be using old sequential format
      const parts = key.split('_');
      if (parts.length === 2) {
        const index = parseInt(parts[1]);
        // If index is high (>10), it might be using old sequential format
        return index > 10;
      }
      return false;
    });
    
    if (oldFormatKeys.length > 0) {
      console.log('⚠️ Potential old format keys found:', oldFormatKeys);
    }
    
    if (course?.modules) {
      course.modules.forEach((module, moduleIndex) => {
        console.log(`📋 Module ${moduleIndex + 1}: ${module.title}`);
        
        // Check description
        if (module.description) {
          const itemIndex = calculateItemIndex(module, 'description');
          const completionKey = getCompletionKey(module, 'description', itemIndex);
          const isCompleted = completedItems.has(completionKey);
          console.log(`  📝 Description: ${isCompleted ? '✅' : '⭕'} (key: ${completionKey})`);
        }
        
        // Check content
        if (module.content && 
            typeof module.content === 'string' &&
            module.content.trim() && 
            module.content !== '[]' && 
            module.content !== 'null' && 
            module.content !== '""' &&
            module.content.length > 10) {
          const itemIndex = calculateItemIndex(module, 'content');
          const completionKey = getCompletionKey(module, 'content', itemIndex);
          const isCompleted = completedItems.has(completionKey);
          console.log(`  📄 Content: ${isCompleted ? '✅' : '⭕'} (key: ${completionKey})`);
        } else if (module.content) {
          console.log(`  🚫 Content: HIDDEN (no meaningful content - length: ${module.content?.length || 0})`);
        }
        
        // Check content items
        if (module.contentItems) {
          let meaningfulItemIndex = 0;
          module.contentItems.forEach((item, idx) => {
            if (hasMeaningfulContent(item)) {
              const contentType = item.type || 'article';
              const actualIndex = getItemIndexForCompletion(module, contentType, meaningfulItemIndex);
              const completionKey = getCompletionKey(module, contentType, actualIndex);
              const isCompleted = completedItems.has(completionKey);
              console.log(`  📄 ${contentType} "${item.title}": ${isCompleted ? '✅' : '⭕'} (key: ${completionKey}, actualIndex: ${actualIndex})`);
              meaningfulItemIndex++;
            } else {
              console.log(`  🚫 ${item.type || 'unknown'} "${item.title}": HIDDEN (no meaningful content)`);
            }
          });
        }
        
        // Check quizzes
        if (module.quizzes) {
          module.quizzes.forEach((quiz, quizIndex) => {
            const itemIndex = calculateItemIndex(module, 'quiz', quizIndex);
            const completionKey = getCompletionKey(module, 'quiz', itemIndex);
            const isCompleted = completedItems.has(completionKey);
            console.log(`  🧪 Quiz ${quizIndex + 1}: ${isCompleted ? '✅' : '⭕'} (key: ${completionKey})`);
          });
        }
        
        // Check discussions
        if (module.discussions) {
          module.discussions.forEach((discussion, discussionIndex) => {
            const itemIndex = calculateItemIndex(module, 'discussion', discussionIndex);
            const completionKey = getCompletionKey(module, 'discussion', itemIndex);
            const isCompleted = completedItems.has(completionKey);
            console.log(`  💬 Discussion ${discussionIndex + 1}: ${isCompleted ? '✅' : '⭕'} (key: ${completionKey})`);
          });
        }
      });
    }
    
    console.log('🔍 === END COMPLETION STATUS DEBUG ===');
  };

  // Function to force refresh completion status
  const forceRefreshCompletionStatus = async () => {
    console.log('🔄 Force refreshing completion status...');
    
    // Clear current state
    setCompletedItems(new Set());
    
    // Clear localStorage
    localStorage.removeItem(`course_completions_${courseId}`);
    
    // Wait a moment then refresh from backend
    setTimeout(async () => {
      await refreshCompletionData();
      
      // Also trigger a re-render
      setTimeout(() => {
        setExpandedModules(prev => new Set([...prev]));
      }, 100);
    }, 100);
  };

  // Function to manually check and fix completion status
  const checkAndFixCompletionStatus = async () => {
    console.log('🔍 Checking and fixing completion status...');
    
    try {
      const token = localStorage.getItem('token');
      if (!token || !courseId) {
        console.log('⚠️ No token or courseId, cannot check completion status');
        return;
      }
      
      // First, get all completion data from localStorage
      const savedCompletions = localStorage.getItem(`course_completions_${courseId}`);
      console.log('📊 Current localStorage completions:', savedCompletions);
      
      // Get completion data from backend
      const response = await fetch(`/api/courses/${String(courseId)}/progress?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const progressData = await response.json();
        console.log('📊 Backend progress data:', progressData);
        
        // Collect all completion keys from backend
        const backendCompletions = new Set();
        if (progressData.data?.allCompletedItems) {
          progressData.data.allCompletedItems.forEach(item => backendCompletions.add(item));
        }
        if (progressData.data?.modulesProgress) {
          Object.values(progressData.data.modulesProgress).forEach(moduleProgress => {
            if (moduleProgress.completedItems) {
              moduleProgress.completedItems.forEach(item => backendCompletions.add(item));
            }
          });
        }
        
        console.log('📊 Backend completions:', Array.from(backendCompletions));
        
        // Update state with backend data
        setCompletedItems(backendCompletions);
        const completionsArray = Array.from(backendCompletions);
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
        
        console.log('✅ Completion status updated:', {
          itemsCount: completionsArray.length,
          items: completionsArray
        });
        
        // Force UI refresh
        setTimeout(() => {
          setExpandedModules(prev => new Set([...prev]));
        }, 100);
        
      } else {
        console.error('❌ Failed to get completion data from backend');
      }
    } catch (error) {
      console.error('❌ Error checking completion status:', error);
    }
  };

  // Function to manually mark an item as complete (for testing)
  const manuallyMarkComplete = async (module, contentType, itemIndex) => {
    console.log('🔧 Manually marking item as complete:', { module: module.title, contentType, itemIndex });
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token available');
        return;
      }
      
      const completionKey = getCompletionKey(module, contentType, itemIndex);
      console.log('🔧 Completion key:', completionKey);
      
      // Update UI immediately
      setCompletedItems(prev => {
        const newSet = new Set([...prev, completionKey]);
        console.log('✅ Updated completedItems:', Array.from(newSet));
        return newSet;
      });
      
      // Send to backend
      const response = await fetch(`/api/courses/${String(courseId)}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moduleId: module._id,
          contentType: contentType,
          itemIndex: itemIndex,
          completionKey: completionKey,
          completed: true
        })
      });
      
      if (response.ok) {
        console.log('✅ Successfully marked as complete on backend');
        
        // Update localStorage
        const newCompletedItems = new Set([...completedItems, completionKey]);
        const completionsArray = Array.from(newCompletedItems);
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
        
        // Force UI refresh
        setTimeout(() => {
          setExpandedModules(prev => new Set([...prev]));
        }, 100);
      } else {
        console.error('❌ Failed to mark as complete on backend');
      }
    } catch (error) {
      console.error('❌ Error manually marking as complete:', error);
    }
  };

  // Function to test all completion keys for a module
  const testAllCompletionKeys = (module) => {
    console.log('🧪 Testing all completion keys for module:', module.title);
    
    const testResults = [];
    
    // Test description (index 0)
    if (module.description) {
      const descKey = getCompletionKey(module, 'description', 0);
      testResults.push({ type: 'description', index: 0, key: descKey });
    }
    
    // Test content (index 1)
    if (module.content && 
        typeof module.content === 'string' &&
        module.content.trim() && 
        module.content !== '[]' && 
        module.content !== 'null' && 
        module.content !== '""' &&
        module.content.length > 10) {
      const contentKey = getCompletionKey(module, 'content', 1);
      testResults.push({ type: 'content', index: 1, key: contentKey });
    }
    
    // Test video (index 2)
    if (module.videoUrl) {
      const videoKey = getCompletionKey(module, 'video', 2);
      testResults.push({ type: 'video', index: 2, key: videoKey });
    }
    
    // Test resources
    if (module.resources) {
      module.resources.forEach((resource, idx) => {
        const key = getCompletionKey(module, 'resource', idx);
        testResults.push({ type: 'resource', index: idx, key: key, title: resource.title });
      });
    }
    
    // Test content items
    if (module.contentItems) {
      let meaningfulIndex = 0;
      module.contentItems.forEach((item, idx) => {
        if (hasMeaningfulContent(item)) {
          const contentType = item.type || 'article';
          const actualIndex = getItemIndexForCompletion(module, contentType, meaningfulIndex);
          const key = getCompletionKey(module, contentType, actualIndex);
          testResults.push({ 
            type: contentType, 
            originalIndex: idx, 
            actualIndex: actualIndex, 
            key: key,
            title: item.title 
          });
          meaningfulIndex++;
        }
      });
    }
    
    // Test quizzes
    if (module.quizzes) {
      module.quizzes.forEach((quiz, idx) => {
        const key = getCompletionKey(module, 'quiz', idx);
        testResults.push({ type: 'quiz', index: idx, key: key, title: quiz.title });
      });
    }
    
    // Test assessments
    if (module.assessments) {
      module.assessments.forEach((assessment, idx) => {
        const key = getCompletionKey(module, 'assessment', idx);
        testResults.push({ type: 'assessment', index: idx, key: key, title: assessment.title });
      });
    }
    
    // Test discussions
    if (module.discussions) {
      module.discussions.forEach((discussion, idx) => {
        const key = getCompletionKey(module, 'discussion', idx);
        testResults.push({ type: 'discussion', index: idx, key: key, title: discussion.title });
      });
    }
    
    console.log('🧪 Completion key test results:', testResults);
    
    // Also test current completion status
    console.log('🧪 Current completedItems:', Array.from(completedItems));
    
    // Check which items are currently completed
    testResults.forEach(item => {
      const isCompleted = completedItems.has(item.key);
      console.log(`🧪 ${item.type} "${item.title || item.key}": ${isCompleted ? '✅' : '⭕'}`);
    });
    
    return testResults;
  };

  // Function to test marking items as complete
  const testMarkComplete = async (module) => {
    console.log('🧪 Testing mark complete functionality for module:', module.title);
    
    const testResults = testAllCompletionKeys(module);
    
    // Test marking the first incomplete item
    for (const item of testResults) {
      const isCompleted = completedItems.has(item.key);
      if (!isCompleted) {
        console.log(`🧪 Testing mark complete for: ${item.type} "${item.title || item.key}"`);
        
        try {
          await handleMarkComplete(module, item.type, item.index);
          console.log(`✅ Successfully marked ${item.type} as complete`);
          
          // Wait a moment then check if it's now completed
          setTimeout(() => {
            const nowCompleted = completedItems.has(item.key);
            console.log(`🧪 After marking: ${item.type} is now ${nowCompleted ? '✅ completed' : '❌ not completed'}`);
          }, 500);
          
          break; // Only test one item
        } catch (error) {
          console.error(`❌ Failed to mark ${item.type} as complete:`, error);
        }
      }
    }
  };

  // Function to refresh completion data from backend
  const refreshCompletionData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !courseId) {
        console.log('⚠️ No token or courseId, cannot refresh completion data');
        return;
      }
      
      console.log('🔄 Refreshing completion data from backend...');
      
      const response = await fetch(`/api/courses/${String(courseId)}/progress?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const progressData = await response.json();
        console.log('✅ Backend progress data:', progressData);
        
        // Update completion items from backend data
        const completedSet = new Set();
        if (progressData.data?.allCompletedItems) {
          progressData.data.allCompletedItems.forEach(item => completedSet.add(item));
          console.log('📊 Added allCompletedItems:', progressData.data.allCompletedItems);
        }
        
        // Also check individual module progress
        if (progressData.data?.modulesProgress) {
          Object.entries(progressData.data.modulesProgress).forEach(([moduleId, moduleProgress]) => {
            console.log(`📊 Module ${moduleId} progress:`, moduleProgress);
            if (moduleProgress.completedItems) {
              moduleProgress.completedItems.forEach(item => completedSet.add(item));
              console.log(`📊 Added module ${moduleId} completedItems:`, moduleProgress.completedItems);
            }
          });
        }
        
        // Update state and localStorage
        setCompletedItems(completedSet);
        const completionsArray = Array.from(completedSet);
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
        
        console.log('✅ Completion data refreshed:', {
          itemsCount: completionsArray.length,
          items: completionsArray,
          completedSet: Array.from(completedSet)
        });
        
        // Force a re-render to update the UI
        setTimeout(() => {
          setExpandedModules(prev => new Set([...prev]));
        }, 100);
        
      } else {
        console.error('❌ Failed to refresh completion data:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error refreshing completion data:', error);
    }
  };

  // Define fetchCourseData function so it can be reused
  const fetchCourseData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;

        let courseData = null;
        let enrollmentStatus = false;
        let progressData = null;
        
        // Check for cached course data first for instant loading
        const cachedCourseData = localStorage.getItem(`course_${courseId}`);
        const cacheTimestamp = localStorage.getItem(`course_${courseId}_timestamp`);
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes cache validity
        
        if (cachedCourseData && cacheValid) {
          try {
            const parsedCourseData = JSON.parse(cachedCourseData);
            if (parsedCourseData && parsedCourseData.modules) {
              console.log('✅ Using cached course data for instant loading (cache age:', Math.round(cacheAge / 1000), 'seconds)');
              courseData = parsedCourseData;
              setCourse(courseData);
              
              // Auto-expand all modules
              if (courseData.modules && courseData.modules.length > 0) {
                const allModuleIds = courseData.modules.map(module => module._id).filter(id => id);
                setExpandedModules(new Set(allModuleIds));
              }
              
              // Load enrollment and progress in background
              Promise.all([
                fetch(`/api/courses/${String(courseId)}/enrollment-status`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json()).catch(() => ({ enrolled: false })),
                fetch(`/api/courses/${String(courseId)}/progress`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json()).catch(() => ({ progress: 0 }))
              ]).then(([enrollmentRes, progressRes]) => {
                if (enrollmentRes.enrolled !== undefined) {
                  setIsEnrolled(enrollmentRes.enrolled);
                }
                if (progressRes.progress !== undefined) {
                  setProgress(progressRes.progress);
                }
              });
              
              setLoading(false);
              return; // Exit early - course loaded from cache
            }
          } catch (e) {
            console.log('Cache parsing failed, continuing with API call');
          }
        } else if (cachedCourseData && !cacheValid) {
          console.log('🔄 Cache expired, fetching fresh data from server');
          // Clear expired cache
          localStorage.removeItem(`course_${courseId}`);
          localStorage.removeItem(`course_${courseId}_timestamp`);
        }

        // Helper function to fetch offline data
        const fetchOfflineData = async () => {
          try {
            const course = await offlineIntegrationService.getStudentCourseOverview(courseId);
            const enrollment = await offlineIntegrationService.getEnrollmentStatus(courseId);
            const progress = await offlineIntegrationService.getCourseProgress(courseId);
            
            console.log('📱 Offline student course overview data loaded:', {
              course: !!course,
              enrollment: enrollment,
              progress: !!progress
            });
            
            return { course, enrollment, progress };
          } catch (error) {
            console.error('❌ Failed to load offline student course overview data:', error);
            return { course: null, enrollment: false, progress: null };
          }
        };

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching course data from API...');

            // Fetch course details with modules
            const courseResponse = await fetch(`/api/courses/${String(courseId)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (courseResponse.ok) {
              const courseApiData = await courseResponse.json();
              console.log('🔍 RAW COURSE API RESPONSE:', JSON.stringify(courseApiData, null, 2));
              
              // Backend returns: { success: true, data: { course: {...} } }
              if (courseApiData.data && courseApiData.data.course) {
                courseData = courseApiData.data.course;
              } else {
                console.error('❌ Course not found in expected location. Response structure:', Object.keys(courseApiData));
                throw new Error('Invalid course data structure');
              }
              console.log('✅ Course data received from backend:', courseData);
              console.log('📚 Course object:', courseData);
              console.log('📖 Course overview:', courseData.overview);
              console.log('🎯 Learning outcomes:', courseData.learningOutcomes);
              console.log('📋 Modules:', courseData.modules);
              console.log('📊 Module count:', courseData.modules?.length || 0);
              
              if (courseData.modules && courseData.modules.length > 0) {
                console.log('📋 Module details:');
                courseData.modules.forEach((module, index) => {
                  console.log(`  Module ${index + 1}: ${module.title}`);
                  console.log(`    Description: ${module.description || 'None'}`);
                  console.log(`    Content: ${module.content ? 'Yes' : 'No'}`);
                  console.log(`    Video: ${module.videoUrl ? 'Yes' : 'No'}`);
                  console.log(`    Assessments: ${module.assessments?.length || 0}`);
                  console.log(`    Quizzes: ${module.quizzes?.length || 0}`);
                  console.log(`    Discussions: ${module.discussions?.length || 0}`);
                  console.log(`    Resources: ${module.resources?.length || 0}`);
                  
                  // Enhanced quiz debugging
                  if (module.quizzes && module.quizzes.length > 0) {
                    console.log(`    📝 Quiz details for module ${index + 1}:`);
                    module.quizzes.forEach((quiz, quizIndex) => {
                      console.log(`      Quiz ${quizIndex + 1}:`);
                      console.log(`        Title: ${quiz.title || 'No title'}`);
                      console.log(`        ID: ${quiz._id || 'NO ID!'}`);
                      console.log(`        Questions: ${quiz.questions?.length || 0}`);
                      console.log(`        Status: ${quiz.status || 'No status'}`);
                      console.log(`        Full quiz object:`, quiz);
                    });
                  } else {
                    console.log(`    📝 No quizzes in module ${index + 1}`);
                  }
                });
              } else {
                console.log('❌ No modules found in course data');
              }
              
              // Store course data for offline use and local caching
              await offlineIntegrationService.storeStudentCourseOverview(courseId, courseData);
              
              // Cache course data for instant loading next time
              try {
                localStorage.setItem(`course_${courseId}`, JSON.stringify(courseData));
                localStorage.setItem(`course_${courseId}_timestamp`, Date.now().toString());
                console.log('💾 Course data cached for instant loading with timestamp');
              } catch (e) {
                console.log('Failed to cache course data:', e);
              }
              
              // Automatically expand ALL modules for better UX (like instructor view)
              if (courseData.modules && courseData.modules.length > 0) {
                const allModuleIds = courseData.modules.map(module => module._id).filter(id => id);
                setExpandedModules(new Set(allModuleIds));
                console.log('📖 Auto-expanded all modules:', allModuleIds);
              }
            } else {
              console.error('❌ Course API failed with status:', courseResponse.status);
              const errorData = await courseResponse.text();
              console.error('❌ Error response:', errorData);
              throw new Error(`Failed to fetch course details: ${courseResponse.status}`);
            }
          } catch (onlineError) {
            console.warn('⚠️ Online course data fetch failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            const offlineData = await fetchOfflineData();
            courseData = offlineData.course;
            enrollmentStatus = offlineData.enrollment;
            progressData = offlineData.progress;
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline course data...');
          const offlineData = await fetchOfflineData();
          courseData = offlineData.course;
          enrollmentStatus = offlineData.enrollment;
          progressData = offlineData.progress;
        }

        // Set course data
        if (courseData) {
          // Validate and fix quiz data before setting course
          if (courseData.modules && courseData.modules.length > 0) {
            console.log('🔍 Validating quiz data in modules...');
            courseData.modules.forEach((module, moduleIndex) => {
              if (module.quizzes && module.quizzes.length > 0) {
                console.log(`🔍 Validating quizzes in module ${moduleIndex + 1}: ${module.title}`);
                module.quizzes.forEach((quiz, quizIndex) => {
                  if (!quiz._id) {
                    console.warn(`⚠️ Quiz ${quizIndex + 1} in module ${moduleIndex + 1} has no ID:`, quiz);
                    // Try to find a quiz with the same title that has an ID
                    const quizWithId = module.quizzes.find(q => q.title === quiz.title && q._id);
                    if (quizWithId) {
                      console.log(`✅ Found quiz with ID for "${quiz.title}":`, quizWithId._id);
                      quiz._id = quizWithId._id;
                    } else {
                      console.error(`❌ Could not find quiz with ID for "${quiz.title}"`);
                    }
                  }
                });
              }
            });
          }
          
          setCourse(courseData);
          
          // Automatically expand ALL modules for better UX
          if (courseData.modules && courseData.modules.length > 0) {
            const allModuleIds = courseData.modules.map(module => module._id).filter(id => id);
            setExpandedModules(new Set(allModuleIds));
            console.log('📖 Auto-expanded all modules:', allModuleIds);
          }
        } else {
          throw new Error('Course data not available offline');
        }

        // Handle enrollment and progress for online mode
        if (isOnline && courseData) {
          try {
            // Check enrollment status - use the original working endpoint
            const enrollmentResponse = await fetch(`/api/courses/enrolled/courses/${String(courseId)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (enrollmentResponse.ok) {
              enrollmentStatus = true;
              console.log('✅ User is enrolled in course:', courseId);
              
              // Store enrollment status for offline use
              await offlineIntegrationService.storeEnrollmentStatus(courseId, true);
              
              // Fetch progress if enrolled (add cache-busting to prevent 304)
              const progressResponse = await fetch(`/api/courses/${String(courseId)}/progress?t=${Date.now()}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                }
              });

              if (progressResponse.ok) {
                const progressApiData = await progressResponse.json();
                progressData = progressApiData.data || progressApiData;
                console.log('🔄 Progress response from backend:', progressData);
                
                // Store progress data for offline use
                await offlineIntegrationService.storeCourseProgress(courseId, progressData);
                
                // Handle different progress data structures
                const progressPercentage = progressData.progressPercentage || progressData.progress || 0;
                const finalProgress = Math.min(progressPercentage, 100);
                setProgress(finalProgress);
                
                // Save progress percentage to localStorage
                localStorage.setItem(`course_progress_${courseId}`, finalProgress.toString());
                
                // Set completed items from progress data
                const completedSet = new Set();
                if (progressData.allCompletedItems) {
                  progressData.allCompletedItems.forEach(item => completedSet.add(item));
                }
                
                // Also check individual module progress
                if (progressData.modulesProgress) {
                  Object.values(progressData.modulesProgress).forEach(moduleProgress => {
                    if (moduleProgress.completedItems) {
                      moduleProgress.completedItems.forEach(item => completedSet.add(item));
                    }
                  });
                }
                
                // Update localStorage with backend data
                const completionsArray = Array.from(completedSet);
                localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
                
                setCompletedItems(completedSet);
                
                // Set course completion based on progress data
                if (progressPercentage >= 100) {
                  setCourseCompleted(true);
                  console.log('🎉 Course completed based on progress data');
                }
                
                console.log('✅ Progress loaded successfully:', {
                  percentage: progressPercentage,
                  completedItems: Array.from(completedSet),
                  enrollmentStatus: true
                });
              }
            }
                      } catch (enrollmentError) {
              console.log('⚠️ Enrollment API failed:', enrollmentError.message);
              // If user can access course overview and see modules, assume they're enrolled
              if (courseData && courseData.modules && courseData.modules.length > 0) {
                enrollmentStatus = true;
                console.log('✅ User assumed enrolled based on course access');
              } else {
                enrollmentStatus = false;
              }
            }
        }

        // Set enrollment status and progress from fetched data
        // If user can access course overview with modules, they should be considered enrolled
        const finalEnrollmentStatus = enrollmentStatus || (courseData && courseData.modules && courseData.modules.length > 0);
        setIsEnrolled(finalEnrollmentStatus);
        console.log('📊 Final enrollment status:', finalEnrollmentStatus);
        
        if (progressData) {
          setProgress(Math.min(progressData.progressPercentage || 0, 100));
          
          // Set completed items from progress data
          const completedSet = new Set();
          if (progressData.allCompletedItems) {
            progressData.allCompletedItems.forEach(item => completedSet.add(item));
          }
          
          // Also check individual module progress
          if (progressData.modulesProgress) {
            Object.values(progressData.modulesProgress).forEach(moduleProgress => {
              if (moduleProgress.completedItems) {
                moduleProgress.completedItems.forEach(item => completedSet.add(item));
              }
            });
          }
          
          // Always update localStorage with backend data
          const completionsArray = Array.from(completedSet);
          localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
          
          setCompletedItems(completedSet);
          
          // REMOVED: Don't auto-set completion based on potentially fake offline data
          // Course completion will only be set when user genuinely completes all items
          console.log('ℹ️ Offline progress loaded but not auto-setting completion (preventing fake completions)');
        }

      } catch (err) {
        console.error('❌ CRITICAL ERROR in fetchCourseData:', err);
        console.error('❌ Error stack:', err.stack);
        setError(`Failed to load course details: ${err.message}`);
        
        // Try to set some fallback state to prevent blank page
        setCourse(null);
        setIsEnrolled(false);
        setProgress(0);
      } finally {
        setLoading(false);
      }
    };

  // Call fetchCourseData when courseId changes - but ONLY when courseId changes
  useEffect(() => {
    if (courseId && courseId !== '') {
      console.log('🏠 USEEFFECT TRIGGERED for courseId:', courseId);
      testBackend(); // Test backend first
      testProgressAPI(); // Test progress API
      fetchCourseData();
      
      // Auto-load progress data after a short delay to ensure course data is loaded
      setTimeout(() => {
        console.log('🔄 Auto-loading progress data...');
        refreshCompletionData(); // Use the local function instead of window.refreshProgressData
      }, 2000);
    }
  }, [courseId]); // ONLY depend on courseId to prevent infinite loops

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
    window.addEventListener('focus', handleProgressUpdate);
    window.addEventListener('courseProgressUpdated', handleProgressUpdate);
    
    // Add navigation event listener to refresh on page load/return
    const handleNavigation = () => {
      console.log('🔄 Navigation detected, refreshing completion status...');
      setTimeout(() => {
        handleProgressUpdate({ detail: { courseId } });
      }, 100);
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleProgressUpdate);
      window.removeEventListener('courseProgressUpdated', handleProgressUpdate);
      window.removeEventListener('popstate', handleNavigation);
    };
    }, [courseId]);
  
  // Refresh completion status when component mounts or course changes
  useEffect(() => {
    if (courseId) {
      console.log('🔄 Component mounted/changed, refreshing completion status...');
      
      // First try to load from localStorage for immediate display
      const savedCompletions = localStorage.getItem(`course_completions_${courseId}`);
      if (savedCompletions) {
        try {
          const completionsArray = JSON.parse(savedCompletions);
          setCompletedItems(new Set(completionsArray));
          console.log('🔄 Loaded completion data from localStorage:', {
            itemsCount: completionsArray.length,
            items: completionsArray
          });
        } catch (error) {
          console.error('❌ Error loading completion data from localStorage:', error);
        }
      }
      
      // Then refresh from backend to ensure we have the latest data
      setTimeout(() => {
        refreshCompletionData();
      }, 500);
    }
  }, [courseId, course]);
  
  // Add localStorage backup for completion tracking
  useEffect(() => {
    // Load completion data from localStorage as backup
    const savedCompletions = localStorage.getItem(`course_completions_${courseId}`);
    if (savedCompletions) {
      try {
        const completionsArray = JSON.parse(savedCompletions);
        setCompletedItems(new Set(completionsArray));
        console.log('📱 Loaded completion data from localStorage:', completionsArray.length, 'items');
        
        // Also load progress percentage from localStorage
        const savedProgress = localStorage.getItem(`course_progress_${courseId}`);
        if (savedProgress) {
          const progressValue = parseFloat(savedProgress);
          setProgress(progressValue);
          console.log('📱 Loaded progress percentage from localStorage:', progressValue);
        }
      } catch (error) {
        console.error('❌ Error loading completion data from localStorage:', error);
      }
    }
  }, [courseId]);
  
  // Add debugging functions to window for testing
  useEffect(() => {
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
    
    window.debugDiscussionCompletion = () => {
      console.log('🔍 DEBUGGING DISCUSSION COMPLETION:');
      console.log('📋 Current completedItems:', Array.from(completedItems));
      console.log('💾 localStorage completions:', localStorage.getItem(`course_completions_${courseId}`));
      
      if (course && course.modules) {
        course.modules.forEach((module, moduleIdx) => {
          console.log(`📚 Module ${moduleIdx}: ${module.title}`);
          console.log(`  📊 Module structure:`, {
            hasDescription: !!module.description,
            hasContent: !!module.content,
            contentItemsCount: module.contentItems?.length || 0,
            hasVideo: !!module.videoUrl,
            resourcesCount: module.resources?.length || 0,
            assessmentsCount: module.assessments?.length || 0,
            quizzesCount: module.quizzes?.length || 0,
            discussionsCount: module.discussions?.length || 0
          });
          
          if (module.discussions) {
            module.discussions.forEach((discussion, discIdx) => {
              const itemIndex = calculateItemIndex(module, 'discussion', discIdx);
              const completionKey = getCompletionKey(module, 'discussion', itemIndex);
              const isCompleted = completedItems.has(completionKey);
              console.log(`  💬 Discussion ${discIdx}: ${discussion.title || discussion._id}`);
              console.log(`    Item Index: ${itemIndex}, Completion Key: ${completionKey}, Completed: ${isCompleted}`);
              console.log(`    Discussion ID: ${discussion._id}`);
            });
          }
        });
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
    
    window.forceRefreshCompletionStatus = async () => {
      console.log('🔄 Force refreshing completion status...');
      try {
        const response = await fetch(`/api/courses/${String(courseId)}/progress?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const progressData = await response.json();
          const data = progressData.data || progressData;
          
          // Update completed items from backend
          const completedSet = new Set();
          if (data.allCompletedItems) {
            data.allCompletedItems.forEach(item => completedSet.add(item));
          }
          
          if (data.modulesProgress) {
            Object.values(data.modulesProgress).forEach(moduleProgress => {
              if (moduleProgress.completedItems) {
                moduleProgress.completedItems.forEach(item => completedSet.add(item));
              }
            });
          }
          
          // Update localStorage
          const completionsArray = Array.from(completedSet);
          localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
          
          setCompletedItems(completedSet);
          
          console.log('✅ Completion status refreshed:', {
            completedItems: Array.from(completedSet),
            totalItems: completionsArray.length
          });
        }
      } catch (error) {
        console.error('❌ Error refreshing completion status:', error);
      }
    };
    
    window.compareCompletionKeys = (discussionId) => {
      console.log('🔍 COMPARING COMPLETION KEYS FOR DISCUSSION:', discussionId);
      
      if (!course || !course.modules) {
        console.log('❌ No course or modules data available');
        return;
      }
      
      // Find the discussion in modules
      let foundDiscussion = null;
      let foundModule = null;
      let foundModuleIndex = -1;
      let foundDiscussionIndex = -1;
      
      course.modules.forEach((module, moduleIdx) => {
        if (module.discussions) {
          module.discussions.forEach((discussion, discIdx) => {
            if (discussion._id === discussionId) {
              foundDiscussion = discussion;
              foundModule = module;
              foundModuleIndex = moduleIdx;
              foundDiscussionIndex = discIdx;
            }
          });
        }
      });
      
      if (!foundDiscussion) {
        console.log('❌ Discussion not found in course modules');
        return;
      }
      
      console.log('✅ Found discussion:', {
        moduleIndex: foundModuleIndex,
        discussionIndex: foundDiscussionIndex,
        discussionTitle: foundDiscussion.title,
        discussionId: foundDiscussion._id
      });
      
      // Calculate what the course overview expects
      const expectedItemIndex = calculateItemIndex(foundModule, 'discussion', foundDiscussionIndex);
      const expectedCompletionKey = getCompletionKey(foundModule, 'discussion', expectedItemIndex);
      
      console.log('📊 Course Overview expects:', {
        itemIndex: expectedItemIndex,
        completionKey: expectedCompletionKey,
        isCompleted: completedItems.has(expectedCompletionKey)
      });
      
      // Check what's in localStorage
      const localStorageCompletions = JSON.parse(localStorage.getItem(`course_completions_${courseId}`) || '[]');
      console.log('💾 localStorage contains:', localStorageCompletions);
      
      // Check if the expected key is in localStorage
      const isInLocalStorage = localStorageCompletions.includes(expectedCompletionKey);
      console.log('🔍 Expected key in localStorage:', isInLocalStorage);
      
      // Show all discussion-related keys in localStorage
      const discussionKeys = localStorageCompletions.filter(key => key.startsWith('discussion-'));
      console.log('💬 All discussion keys in localStorage:', discussionKeys);
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
    
    // Add function to test quiz data
    window.testQuizData = () => {
      console.log('🔍 Testing quiz data...');
      if (course && course.modules) {
        course.modules.forEach((module, moduleIndex) => {
          console.log(`📋 Module ${moduleIndex + 1}: ${module.title}`);
          if (module.quizzes && module.quizzes.length > 0) {
            module.quizzes.forEach((quiz, quizIndex) => {
              console.log(`  Quiz ${quizIndex + 1}: "${quiz.title}" - ID: ${quiz._id || 'MISSING!'}`);
              if (!quiz._id) {
                console.error(`    ❌ Quiz "${quiz.title}" has no ID!`);
                console.error(`    ❌ Quiz object:`, quiz);
              }
            });
          } else {
            console.log(`  No quizzes in module ${moduleIndex + 1}`);
          }
        });
      } else {
        console.log('❌ No course or modules data available');
      }
    };
    
    // Add function to show current completion status
    window.showCompletionStatus = () => {
      console.log('📊 Current completion status:');
      console.log('📋 Completed items:', Array.from(completedItems));
      console.log('📈 Progress percentage:', progress);
      console.log('🎯 Course completed:', courseCompleted);
      
      if (course && course.modules) {
        course.modules.forEach((module, moduleIndex) => {
          console.log(`📋 Module ${moduleIndex + 1}: ${module.title}`);
          
          // Check description
          if (module.description) {
            const descIndex = calculateItemIndex(module, 'description');
            const descKey = getCompletionKey(module, 'description', descIndex);
            const descCompleted = completedItems.has(descKey);
            console.log(`  Description - Completed: ${descCompleted} (Key: ${descKey})`);
          }
          
          // Check content
          if (module.content) {
            const contentIndex = calculateItemIndex(module, 'content');
            const contentKey = getCompletionKey(module, 'content', contentIndex);
            const contentCompleted = completedItems.has(contentKey);
            console.log(`  Content - Completed: ${contentCompleted} (Key: ${contentKey})`);
          }
          
          // Check quizzes
          if (module.quizzes && module.quizzes.length > 0) {
            module.quizzes.forEach((quiz, quizIdx) => {
              const quizItemIndex = calculateItemIndex(module, 'quiz', quizIdx);
              const quizKey = getCompletionKey(module, 'quiz', quizItemIndex);
              const quizCompleted = completedItems.has(quizKey);
              console.log(`  Quiz ${quizIdx + 1}: "${quiz.title}" - Completed: ${quizCompleted} (Key: ${quizKey})`);
            });
          }
          
          // Check discussions
          if (module.discussions && module.discussions.length > 0) {
            module.discussions.forEach((discussion, discussionIdx) => {
              const discussionItemIndex = calculateItemIndex(module, 'discussion', discussionIdx);
              const discussionKey = getCompletionKey(module, 'discussion', discussionItemIndex);
              const discussionCompleted = completedItems.has(discussionKey);
              console.log(`  Discussion ${discussionIdx + 1}: "${discussion.title}" - Completed: ${discussionCompleted} (Key: ${discussionKey})`);
            });
          }
        });
      }
    };
    
    // Add function to debug completion key generation
    window.debugCompletionKeys = () => {
      console.log('🔍 Debugging completion key generation...');
      
      if (course && course.modules) {
        course.modules.forEach((module, moduleIndex) => {
          console.log(`\n📋 Module ${moduleIndex + 1}: ${module.title}`);
          
          let itemIndex = 0;
          
          // Description
          if (module.description) {
            const key = getCompletionKey(module, 'description', itemIndex);
            console.log(`  Item ${itemIndex}: description - Key: "${key}"`);
            itemIndex++;
          }
          
          // Content
          if (module.content) {
            const key = getCompletionKey(module, 'content', itemIndex);
            console.log(`  Item ${itemIndex}: content - Key: "${key}"`);
            itemIndex++;
          }
          
          // Content Items
          if (module.contentItems) {
            module.contentItems.forEach((item, idx) => {
              const contentType = item.type || 'article';
              const key = getCompletionKey(module, contentType, itemIndex);
              console.log(`  Item ${itemIndex}: ${contentType} "${item.title}" - Key: "${key}"`);
              itemIndex++;
            });
          }
          
          // Quizzes
          if (module.quizzes) {
            module.quizzes.forEach((quiz, idx) => {
              const key = getCompletionKey(module, 'quiz', itemIndex);
              console.log(`  Item ${itemIndex}: quiz "${quiz.title}" - Key: "${key}"`);
              itemIndex++;
            });
          }
          
          // Discussions
          if (module.discussions) {
            module.discussions.forEach((discussion, idx) => {
              const key = getCompletionKey(module, 'discussion', itemIndex);
              console.log(`  Item ${itemIndex}: discussion "${discussion.title}" - Key: "${key}"`);
              itemIndex++;
            });
          }
        });
      }
    };
    
    // Add global debug functions
    window.checkCompletionStatus = checkAndFixCompletionStatus;
    window.debugCompletions = debugCompletionStatus;
    
    // Add function to manually mark content items as complete
    window.markContentItemsComplete = async () => {
      if (!course || !course.modules) {
        console.log('❌ No course or modules available');
        return;
      }
      
      console.log('🔧 Manually marking content items as complete...');
      
      for (const module of course.modules) {
        if (module.contentItems && module.contentItems.length > 0) {
          for (let idx = 0; idx < module.contentItems.length; idx++) {
            const item = module.contentItems[idx];
            const contentType = item.type || 'article';
            const completionKey = `${contentType}_${idx}`;
            
            console.log(`🔧 Marking ${contentType} "${item.title}" as complete with key: ${completionKey}`);
            await manuallyMarkComplete(module, contentType, idx);
          }
        }
      }
      
      // Force refresh completion data
      await refreshCompletionData();
      console.log('✅ Content items marked as complete');
    };
    
    // Add function to fix all completion issues
    window.fixAllCompletionIssues = async () => {
      console.log('🔧 Fixing all completion issues...');
      
      // First, clear existing completion data
      window.clearCompletionData();
      
      // Wait a moment for the clear to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then mark all items as complete
      await window.markContentItemsComplete();
      
      console.log('✅ All completion issues fixed');
    };
    
    // Add function to specifically fix tttghghffg items
    window.fixTttghghffgItems = async () => {
      console.log('🔧 Specifically fixing tttghghffg items...');
      
      if (!course || !course.modules) {
        console.log('❌ No course or modules available');
        return;
      }
      
      for (const module of course.modules) {
        if (module.contentItems && module.contentItems.length > 0) {
          for (let idx = 0; idx < module.contentItems.length; idx++) {
            const item = module.contentItems[idx];
            
            // Check if this is a tttghghffg item
            if (item.title && item.title.includes('tttghghffg')) {
              const contentType = item.type || 'article';
              const completionKey = `${contentType}_${idx}`;
              
              console.log(`🔧 Found tttghghffg item: "${item.title}" with key: ${completionKey}`);
              
              // Mark as complete
              await manuallyMarkComplete(module, contentType, idx);
            }
          }
        }
      }
      
      // Force refresh
      await refreshCompletionData();
      
      // Force modal to re-render
      setShowGradesModal(false);
      setTimeout(() => setShowGradesModal(true), 100);
      
      console.log('✅ tttghghffg items fixed');
    };
    
    // Add function to force mark tttghghffg items as complete locally
    window.forceMarkTttghghffgComplete = () => {
      console.log('🔧 Force marking tttghghffg items as complete locally...');
      
      if (!course || !course.modules) {
        console.log('❌ No course or modules available');
        return;
      }
      
      const newCompletedItems = new Set(completedItems);
      
      for (const module of course.modules) {
        if (module.contentItems && module.contentItems.length > 0) {
          for (let idx = 0; idx < module.contentItems.length; idx++) {
            const item = module.contentItems[idx];
            
            // Check if this is a tttghghffg item
            if (item.title && item.title.includes('tttghghffg')) {
              const contentType = item.type || 'article';
              const completionKey = `${contentType}_${idx}`;
              
              console.log(`🔧 Force adding completion key: ${completionKey}`);
              newCompletedItems.add(completionKey);
            }
          }
        }
      }
      
      // Update state
      setCompletedItems(newCompletedItems);
      
      // Update localStorage
      localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(Array.from(newCompletedItems)));
      
      console.log('✅ tttghghffg items force marked as complete');
    };
    
    // Add function to clear completion data
    window.clearCompletionData = () => {
      console.log('🗑️ Clearing completion data...');
      setCompletedItems(new Set());
      localStorage.removeItem(`course_completions_${courseId}`);
      console.log('✅ Completion data cleared');
    };
    
    // Add function to check database completion data
    window.checkDatabaseCompletionData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !courseId) {
          console.log('❌ No token or courseId available');
          return;
        }
        
        const courseIdString = String(courseId);
        const response = await fetch(`/api/courses/${courseIdString}/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Database completion data:', data);
          
          if (data.data && data.data.completedItems) {
            console.log('📊 Completed items in database:', data.data.completedItems);
          }
        }
      } catch (error) {
        console.error('❌ Error checking database completion data:', error);
      }
    };
    
    // Add function to inspect content items
    window.inspectContentItems = () => {
      console.log('🔍 Inspecting content items...');
      
      if (!course || !course.modules) {
        console.log('❌ No course or modules available');
        return;
      }
      
      for (const module of course.modules) {
        console.log(`📋 Module: ${module.title}`);
        
        if (module.contentItems && module.contentItems.length > 0) {
          console.log(`📄 Content items (${module.contentItems.length}):`);
          module.contentItems.forEach((item, idx) => {
            console.log(`  ${idx}: ${item.title} (type: ${item.type || 'article'})`);
          });
        } else {
          console.log('  No content items found');
        }
      }
    };
    window.forceRefreshCompletions = forceRefreshCompletionStatus;
    window.manuallyMarkComplete = manuallyMarkComplete;
    window.testCompletionKeys = testAllCompletionKeys;
    window.testMarkComplete = testMarkComplete;
    
    // Add function to force refresh quiz data
    window.refreshQuizData = async () => {
      console.log('🔄 Force refreshing quiz data...');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/courses/${String(courseId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const refreshedCourse = data.data?.course;
          if (refreshedCourse && refreshedCourse.modules) {
            console.log('✅ Refreshed course data received');
            setCourse(refreshedCourse);
            console.log('🔄 Course data updated, please try clicking the quiz again');
          } else {
            console.error('❌ Invalid refreshed course data');
          }
        } else {
          console.error('❌ Failed to refresh course data');
        }
      } catch (error) {
        console.error('❌ Error refreshing quiz data:', error);
      }
    };
    
    // REMOVED: Auto-refresh progress data function to prevent constant refreshing
    // Progress will only update when user completes items or manually refreshes
    
    // Add function to refresh progress data
    window.refreshProgressData = async () => {
      console.log('🔄 Force refreshing progress data...');
      try {
        const token = localStorage.getItem('token');
        
        // Check enrollment status using the original working endpoint
                  const enrollmentResponse = await fetch(`/api/courses/enrolled/courses/${String(courseId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (enrollmentResponse.ok) {
          console.log('📊 User is enrolled in course');
          
          // Fetch progress data
          const progressResponse = await fetch(`/api/courses/${String(courseId)}/progress?t=${Date.now()}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            console.log('📊 Progress data received:', progressData);
            
            // Update progress state
            setProgress(Math.min(progressData.data?.progressPercentage || 0, 100));
            
            // Update completed items
            const completedSet = new Set();
            if (progressData.data?.allCompletedItems) {
              progressData.data.allCompletedItems.forEach(item => completedSet.add(item));
            }
            
            if (progressData.data?.modulesProgress) {
              Object.values(progressData.data.modulesProgress).forEach(moduleProgress => {
                if (moduleProgress.completedItems) {
                  moduleProgress.completedItems.forEach(item => completedSet.add(item));
                }
              });
            }
            
            setCompletedItems(completedSet);
            console.log('✅ Progress data refreshed successfully');
            console.log('📋 Completed items:', Array.from(completedSet));
          } else {
            console.error('❌ Failed to fetch progress data');
          }
        } else {
          console.log('⚠️ User not enrolled, cannot fetch progress');
        }
      } catch (error) {
        console.error('❌ Error refreshing progress data:', error);
      }
    };
    
    // Auto-refresh progress on page load
    window.autoRefreshProgress = () => {
      console.log('🔄 Auto-refreshing progress on page load...');
      setTimeout(() => {
        window.refreshProgressData();
      }, 1000);
    };
    
    // Force load progress immediately
    window.forceLoadProgress = () => {
      console.log('🔄 Force loading progress immediately...');
      window.refreshProgressData();
    };
    
    // Show progress bar and check status
    window.showProgressBar = () => {
      console.log('📊 Current status:');
      console.log('  - isEnrolled:', isEnrolled);
      console.log('  - progress:', progress);
      console.log('  - completedItems size:', completedItems.size);
      console.log('  - completedItems:', Array.from(completedItems));
      
      // Force show progress bar by setting enrollment to true
      setIsEnrolled(true);
      console.log('✅ Set enrollment to true - progress bar should now show');
    };
    
    // Add function to debug completion key generation
    window.debugCompletionKey = (contentType, itemIndex = 0) => {
      if (course && course.modules && course.modules.length > 0) {
        const module = course.modules[0];
        console.log('🔍 Debug completion key generation:');
        console.log('📋 Module:', module.title);
        console.log('🎯 Content Type:', contentType);
        console.log('🎯 Item Index:', itemIndex);
        
        const calculatedIndex = calculateItemIndex(module, contentType, itemIndex);
        const completionKey = getCompletionKey(module, contentType, calculatedIndex);
        const isCompleted = completedItems.has(completionKey);
        
        console.log('📊 Results:');
        console.log('  - Calculated Index:', calculatedIndex);
        console.log('  - Completion Key:', completionKey);
        console.log('  - Is Completed:', isCompleted);
        console.log('  - All Completed Items:', Array.from(completedItems));
        
        return { calculatedIndex, completionKey, isCompleted };
      } else {
        console.log('❌ No course data available');
        return null;
      }
    };
    
    // Add function to manually mark item as complete for testing
    window.testMarkComplete = (contentType, itemIndex = 0) => {
      if (course && course.modules && course.modules.length > 0) {
        const module = course.modules[0];
        console.log('🧪 Testing mark complete for:', contentType, itemIndex);
        
        // Use the same logic as the UI
        const calculatedIndex = calculateItemIndex(module, contentType, itemIndex);
        const completionKey = getCompletionKey(module, contentType, calculatedIndex);
        
        console.log('📊 Before marking complete:');
        console.log('  - Completion Key:', completionKey);
        console.log('  - Is Completed:', completedItems.has(completionKey));
        
        // Manually add to completed items
        setCompletedItems(prev => {
          const newSet = new Set([...prev, completionKey]);
          console.log('✅ Added to completed items:', completionKey);
          console.log('📋 All completed items:', Array.from(newSet));
          return newSet;
        });
        
        // Update localStorage
        const newCompletedItems = new Set([...completedItems, completionKey]);
        const completionsArray = Array.from(newCompletedItems);
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
        
        console.log('💾 Updated localStorage');
        
        return { completionKey, success: true };
      } else {
        console.log('❌ No course data available');
        return { success: false };
      }
    };
    
    // Add function to test quiz navigation
    window.testQuizNavigation = () => {
      console.log('🧪 Testing quiz navigation...');
      if (course && course.modules && course.modules.length > 0) {
        const module = course.modules[0];
        if (module.quizzes && module.quizzes.length > 0) {
          const quiz = module.quizzes[0];
          console.log('🎯 Testing navigation to quiz:', quiz.title);
          console.log('🎯 Quiz ID:', quiz._id);
          console.log('🎯 Course ID:', courseId);
          console.log('🎯 Module ID:', module._id);
          
          const navigationUrl = `/courses/${courseId}/modules/${module._id}/quiz/${quiz._id}?v=${Date.now()}`;
          console.log('🚀 Navigation URL:', navigationUrl);
          
          // Test the navigation
          window.location.href = navigationUrl;
        } else {
          console.log('❌ No quizzes found in first module');
        }
      } else {
        console.log('❌ No course or modules data available');
      }
    };
    
    // Add function to force hard refresh
    window.forceHardRefresh = () => {
      console.log('🔄 Force hard refresh...');
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      // Force reload without cache
      window.location.reload(true);
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
        
        // Use the correct URL pattern for quiz navigation
        const navigationUrl = `/courses/${courseId}/modules/${module._id}/quiz/${quiz._id}?v=${Date.now()}`;
        console.log('🚀 Navigation URL:', navigationUrl);
        window.location.href = navigationUrl;
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

  // Recalculate progress when completedItems or course data changes - REAL PROGRESS ONLY
  useEffect(() => {
    if (course && course.modules) {
      const calculatedProgress = recalculateProgress();
      if (Math.abs(calculatedProgress - progress) > 1) { // Only update if significant change
        setProgress(calculatedProgress);
        console.log('🔄 Progress recalculated from real completion data:', Math.round(calculatedProgress), '%');
      }
      
      // Only set course as completed if it's genuinely 100% AND verified by real user interaction
      const realCompletion = isCourseCompleted();
      if (realCompletion && Math.round(calculatedProgress) >= 100) {
        console.log('🎉 Course genuinely completed through real user interaction!');
        setCourseCompleted(true);
      } else if (courseCompleted && (!realCompletion || Math.round(calculatedProgress) < 100)) {
        console.log('🚫 Removing false completion - course not actually finished');
        setCourseCompleted(false);
      }
    }
  }, [completedItems, course]);

  // Preload course image immediately for instant display
  useEffect(() => {
    if (course) {
      const imageUrl = getInstantImageUrl(course);
      if (imageUrl) {
        // Start preloading immediately
        const img = new Image();
        img.onload = () => {
          console.log('✅ Course image preloaded successfully:', imageUrl);
          setImageLoaded(true);
        };
        img.onerror = () => {
          console.warn('⚠️ Failed to preload course image:', imageUrl);
          setImageLoaded(true); // Still mark as loaded to show fallback
        };
        img.src = imageUrl;
      }
    }
  }, [course]);

  // Debug function to test image loading
  useEffect(() => {
    if (course) {
      console.log('🔍 Course data for image:', {
        courseId: courseId,
        title: course.title,
        course_profile_picture: course.course_profile_picture,
        course_image: course.image,
        category: course.category,
        finalImageUrl: getCourseImageUrl(course)
      });
    }
  }, [course, courseId]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
              const response = await fetch(`/api/courses/${String(courseId)}/enroll`, {
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

  // Function to get the actual course image URL with fallbacks (same as BrowseCourses)
  const getCourseImageUrl = (course) => {
    const courseImage = course.course_profile_picture || course.image;
    const validatedUrl = validateCourseImageUrl(courseImage);
    
    // Default fallback images based on category (same as BrowseCourses)
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

  // Function to preload images for better performance
  const preloadImage = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Store the loaded image in memory for instant access
        if (img.complete && img.naturalWidth > 0) {
          console.log('✅ Image loaded and cached:', imageUrl);
        }
        resolve(imageUrl);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });
  };

  // Function to get cached image URL or fallback immediately
  const getInstantImageUrl = (course) => {
    if (!course) {
      console.log('⚠️ No course data available for image');
      return null;
    }
    
    const imageUrl = getCourseImageUrl(course);
    console.log('🔍 getInstantImageUrl - course data:', {
      courseId: course._id,
      title: course.title,
      course_profile_picture: course.course_profile_picture,
      course_image: course.image,
      category: course.category,
      finalImageUrl: imageUrl
    });
    
    return imageUrl;
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

  const toggleOverviewExpansion = () => {
    setOverviewExpanded(!overviewExpanded);
  };

  // Helper function to get completion key in ModuleContent format
  const getCompletionKey = (module, contentType, itemIndex) => {
    // ModuleContent uses format: ${contentType}_${index}
    // We need to match this format exactly
    return `${contentType}_${itemIndex}`;
  };

  // Function to get the correct item index for completion tracking
  // This should match exactly how ModuleContent generates completion keys
  const getItemIndexForCompletion = (module, contentType, targetIndex = 0) => {
    // For content items, we need to find the index within the contentItems array
    if (contentType === 'article' || contentType === 'video' || contentType === 'file' || contentType === 'audio') {
      if (module.contentItems) {
        let meaningfulIndex = 0;
        for (let i = 0; i < module.contentItems.length; i++) {
          const item = module.contentItems[i];
          if (hasMeaningfulContent(item)) {
            if (meaningfulIndex === targetIndex) {
              return i; // Return the actual array index
            }
            meaningfulIndex++;
          }
        }
      }
      return targetIndex; // Fallback
    }
    
    // For other content types, use the targetIndex directly
    return targetIndex;
  };

  // Helper function to check if a content item has meaningful content
  const hasMeaningfulContent = (item) => {
    // Check if item has a title
    if (!item.title || item.title.trim() === '') return false;
    
    // Check if item has actual content based on type
    switch (item.type) {
      case 'article':
        return item.content && item.content.trim() !== '' && item.content !== '[]' && item.content !== 'null';
      case 'video':
        return item.url || item.videoUrl || item.fileUrl;
      case 'audio':
        return item.url || item.audioUrl || item.fileUrl;
      case 'file':
        return item.url || item.fileUrl || item.publicUrl || item.fileName;
      default:
        return item.url || item.content || item.fileUrl || item.publicUrl;
    }
  };

  // Helper function to calculate item index within module (matching ModuleContent order exactly)
  const calculateItemIndex = (module, targetType, targetIndex = 0) => {
    let index = 0;
    
    // Order matches ModuleContent component exactly:
    // 1. Description (if exists)
    if (module.description) {
      if (targetType === 'description') return index;
      index++;
    }
    
    // 2. Content (if exists and meaningful)
    if (module.content && 
        typeof module.content === 'string' &&
        module.content.trim() && 
        module.content !== '[]' && 
        module.content !== 'null' && 
        module.content !== '""' &&
        module.content.length > 10) {
      if (targetType === 'content') return index;
      index++;
    }
    
    // 3. Video (if exists)
    if (module.videoUrl) {
      if (targetType === 'video') return index;
      index++;
    }
    
    // 4. Resources (if exists)
    if (module.resources && module.resources.length > 0) {
      for (let i = 0; i < module.resources.length; i++) {
        if (targetType === 'resource' && targetIndex === i) return index;
        index++;
      }
    }
    
    // 5. ContentItems (if exists)
    if (module.contentItems && module.contentItems.length > 0) {
      let meaningfulItemIndex = 0;
      for (let i = 0; i < module.contentItems.length; i++) {
        const item = module.contentItems[i];
        if (hasMeaningfulContent(item)) {
          const contentType = item.type || 'article';
          if (targetType === contentType && targetIndex === meaningfulItemIndex) return index;
          meaningfulItemIndex++;
          index++;
        }
      }
    }
    
    // 6. Assessments (if exists)
    if (module.assessments && module.assessments.length > 0) {
      for (let i = 0; i < module.assessments.length; i++) {
        if (targetType === 'assessment' && targetIndex === i) return index;
        index++;
      }
    }
    
    // 7. Quizzes (if exists)
    if (module.quizzes && module.quizzes.length > 0) {
      for (let i = 0; i < module.quizzes.length; i++) {
        if (targetType === 'quiz' && targetIndex === i) return index;
        index++;
      }
    }
    
    // 8. Discussions (if exists)
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
    
    if (module.content && 
        typeof module.content === 'string' &&
        module.content.trim() && 
        module.content !== '[]' && 
        module.content !== 'null' && 
        module.content !== '""' &&
        module.content.length > 10) {
      totalItems++;
      const itemIndex = calculateItemIndex(module, 'content');
      const completionKey = getCompletionKey(module, 'content', itemIndex);
      if (completedItems.has(completionKey)) completedCount++;
    }
    
    if (module.contentItems) {
      let meaningfulItemIndex = 0;
      module.contentItems.forEach((item, idx) => {
        if (hasMeaningfulContent(item)) {
          totalItems++;
          const contentType = item.type || 'article';
          const itemIndex = calculateItemIndex(module, contentType, meaningfulItemIndex);
          const completionKey = getCompletionKey(module, contentType, itemIndex);
          if (completedItems.has(completionKey)) completedCount++;
          meaningfulItemIndex++;
        }
      });
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

  // Check if course is completed - STRICT VALIDATION
  const isCourseCompleted = () => {
    if (!course?.modules || course.modules.length === 0) {
      console.log('🚫 Course completion check: No modules found');
      return false;
    }
    
    const completionResults = course.modules.map(module => {
      const isCompleted = isModuleCompleted(module);
      console.log(`📋 Module "${module.title}": ${isCompleted ? '✅ Complete' : '❌ Incomplete'}`);
      return isCompleted;
    });
    
    const allCompleted = completionResults.every(result => result === true);
    console.log(`🎯 Course completion check: ${allCompleted ? 'COMPLETED' : 'NOT COMPLETED'} (${completionResults.filter(r => r).length}/${completionResults.length} modules)`);
    
    return allCompleted;
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
      
      if (module.content && 
          typeof module.content === 'string' &&
          module.content.trim() && 
          module.content !== '[]' && 
          module.content !== 'null' && 
          module.content !== '""' &&
          module.content.length > 10) {
        totalItems++;
        const itemIndex = calculateItemIndex(module, 'content');
        const completionKey = getCompletionKey(module, 'content', itemIndex);
        if (completedItems.has(completionKey)) completedItemsCount++;
      }
      
      if (module.contentItems) {
        let meaningfulItemIndex = 0;
        module.contentItems.forEach((item, idx) => {
          if (hasMeaningfulContent(item)) {
            totalItems++;
            const contentType = item.type || 'article';
            const itemIndex = calculateItemIndex(module, contentType, meaningfulItemIndex);
            const completionKey = getCompletionKey(module, contentType, itemIndex);
            if (completedItems.has(completionKey)) completedItemsCount++;
            meaningfulItemIndex++;
          }
        });
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
      console.log('📜 === CERTIFICATE GENERATION DEBUG ===');
      console.log('📜 Generating certificate for:', {
        courseId: courseId,
        courseTitle: course.title
      });
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token for certificate generation:', !!token);
      
      if (!token) {
        console.error('❌ No token available for certificate generation');
        return;
      }
      
      console.log('📡 Making certificate generation API call...');
      const response = await fetch(`/api/certificates/generate`, {
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

      console.log('📡 Certificate generation response status:', response.status);
      const result = await response.json();
      console.log('📡 Certificate generation response body:', result);
      
      if (response.ok && result.success) {
        console.log('✅ Certificate generated successfully:', result);
      } else {
        console.warn('⚠️ Certificate generation failed or already exists:', result);
        // Even if it says certificate already exists, that's fine
        if (result.message && result.message.includes('already exists')) {
          console.log('ℹ️ Certificate already exists for this course - that\'s OK');
        } else {
          console.error('❌ Unexpected certificate generation error:', result);
        }
      }
    } catch (err) {
      console.error('❌ Exception during certificate generation:', err);
      console.error('❌ Error details:', err.message, err.stack);
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
    
    // Navigation to module content
    console.log(`🎯 Navigating to: ${contentType.toUpperCase()} for module: ${module.title}`);
    
    // Navigate to appropriate content based on type - no enrollment check blocking
    // Add return parameter so content pages know where to return
    const returnUrl = `/courses/${courseId}/overview`;
    
    let navigationUrl = '';
    
    switch (contentType) {
      case 'description':
      case 'content':
      case 'video':
        navigationUrl = `/courses/${courseId}/module/${module._id}?return=${encodeURIComponent(returnUrl)}`;
        console.log('📍 Navigating to MODULE CONTENT:', navigationUrl);
        console.log('📍 Full URL will be:', window.location.origin + navigationUrl);
        
        // Use window.location.href for reliable navigation
        window.location.href = navigationUrl;
        break;
      case 'quiz':
        if (contentData && contentData._id) {
          console.log('🎯 QUIZ CLICK: Using correct URL pattern');
          console.log('🎯 Quiz ID:', contentData._id);
          console.log('🎯 Course ID:', courseId);
          console.log('🎯 Item Index:', itemIndex);
          
          // Use the correct URL pattern for quiz navigation with cache busting
          const returnUrl = `/courses/${courseId}/overview`;
          const navigationUrl = `/courses/${courseId}/modules/${module._id}/quiz/${contentData._id}?return=${encodeURIComponent(returnUrl)}&v=${Date.now()}`;
          console.log('🎯 Navigating to quiz:', navigationUrl);
          window.location.href = navigationUrl;
        } else {
          console.error('❌ Quiz navigation failed - no quiz ID:', contentData);
          console.log('🔍 Available contentData:', contentData);
          alert('Unable to navigate to quiz. Missing quiz ID.');
        }
        break;
      case 'assessment':
        if (contentData && contentData._id) {
          navigationUrl = `/courses/${courseId}/assessment/${contentData._id}`;
          console.log('📍 Navigating to ASSESSMENT:', navigationUrl);
          console.log('📍 Assessment data:', contentData);
          
          // Use window.location.href for reliable navigation (same as quiz/description/content)
          window.location.href = navigationUrl;
        } else {
          console.error('❌ Assessment navigation failed - no assessment ID:', contentData);
          console.log('🔍 Available contentData:', contentData);
          alert('Unable to navigate to assessment. Missing assessment ID.');
        }
        break;
      case 'discussion':
        if (contentData && contentData._id) {
          console.log('💬 DISCUSSION CLICK: Using correct URL pattern');
          console.log('💬 Discussion ID:', contentData._id);
          console.log('💬 Course ID:', courseId);
          console.log('💬 Item Index:', itemIndex);
          
          // Use the correct URL pattern for discussion navigation
          const returnUrl = `/courses/${courseId}/overview`;
          const navigationUrl = `/courses/${courseId}/modules/${module._id}/discussion/${contentData._id}?return=${encodeURIComponent(returnUrl)}`;
          console.log('💬 Navigating to discussion:', navigationUrl);
          window.location.href = navigationUrl;
        } else {
          console.error('❌ Discussion navigation failed - no discussion ID:', contentData);
          console.log('🔍 Available contentData:', contentData);
          alert('Unable to navigate to discussion. Missing discussion ID.');
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
    
    console.log('🎯 handleMarkComplete called:', {
      module: module.title,
      contentType,
      itemIndex,
      completionKey,
      isMarkingComplete,
      isEnrolled
    });
    
    // Debug: Check what the calculateItemIndex function returns for this item
    const calculatedIndex = calculateItemIndex(module, contentType, itemIndex);
    console.log('🔍 Debug - calculateItemIndex result:', {
      contentType,
      itemIndex,
      calculatedIndex,
      completionKey,
      isInCompletedItems: completedItems.has(completionKey)
    });
    
    // Prevent rapid clicking
    if (isMarkingComplete) {
      console.log('⚠️ Already marking complete, ignoring click');
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
        console.log('✅ Optimistically updated completedItems:', Array.from(newSet));
        return newSet;
      });
      
      const requestData = {
        moduleId: module._id,
        contentType: contentType,
        itemIndex: itemIndex,
        completionKey: completionKey,
        completed: true
      };
      
      console.log('📡 Sending progress update:', requestData);
      
      // Ensure courseId is a string
      const courseIdString = String(courseId);
      const response = await fetch(`/api/courses/${courseIdString}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('📡 Progress update response status:', response.status);
      
      if (response.ok) {
        const progressData = await response.json();
        console.log('✅ Progress update successful:', progressData);
        
        // Update overall progress from backend
        if (progressData.data?.progressPercentage !== undefined) {
          setProgress(Math.min(progressData.data.progressPercentage, 100));
        }
        
        // Update localStorage for persistence
        setCompletedItems(prev => {
          const newSet = new Set([...prev, completionKey]);
          const completionsArray = Array.from(newSet);
          localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(completionsArray));
          return newSet;
        });
        
        // Immediately refresh completion data from backend to ensure consistency
        setTimeout(() => {
          refreshCompletionData();
        }, 500);
        
        console.log('💾 Updated localStorage with completion:', completionKey);
        
        // Force UI refresh to ensure checkmarks update
        setTimeout(() => {
          setExpandedModules(prev => new Set([...prev]));
          // Also refresh completion data from backend to ensure consistency
          refreshCompletionData();
        }, 100);
        
      } else {
        console.error('❌ Progress update failed:', response.status);
        
        // Revert optimistic update on error
        setCompletedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(completionKey);
          console.log('🔄 Reverted optimistic update for:', completionKey);
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
      console.error('❌ Error in handleMarkComplete:', error);
      
      // Revert optimistic update on error
      setCompletedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(completionKey);
        console.log('🔄 Reverted optimistic update due to error:', completionKey);
        return newSet;
      });
      
      alert('Network error. Please check your connection and try again.');
    } finally {
      // Reset loading state
      setTimeout(() => {
        setIsMarkingComplete(false);
        console.log('🔄 Reset marking complete state');
      }, 1000);
    }
  };

  // Add bypass function for direct navigation
  const forceNavigateToQuiz = (quizId, moduleId = null) => {
    console.log('🚀 FORCE NAVIGATE: Bypassing all middleware for quiz:', quizId);
    
    // Clear any authentication redirects
    sessionStorage.clear();
    localStorage.removeItem('redirectAfterLogin');
    
    // Force authentication state
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    
    console.log('🚀 FORCE NAVIGATE: Auth state check:', {
      hasToken: !!token,
      hasUser: !!user,
      userRole: userRole
    });
    
    // Find the quiz index in the module
    let quizIndex = 0;
    if (moduleId) {
      const module = course.modules?.find(m => m._id === moduleId);
      if (module && module.quizzes) {
        const quizIndexFound = module.quizzes.findIndex(q => q._id === quizId);
        if (quizIndexFound !== -1) {
          quizIndex = quizIndexFound;
        }
      }
    }
    
    // Use the correct URL pattern for quiz navigation
    const navigationUrl = `/courses/${courseId}/modules/${moduleId || course.modules?.[0]?._id}/quiz/${quizId}`;
    
    console.log('🚀 FORCE NAVIGATE: Using correct URL pattern:', navigationUrl);
    console.log('🎯 Quiz ID:', quizId, 'Quiz Index:', quizIndex);
    window.location.replace(navigationUrl);
  };

  const forceNavigateToDiscussion = (discussionId, moduleId = null) => {
    console.log('🚀 FORCE NAVIGATE: Bypassing all middleware for discussion:', discussionId);
    
    // Clear any authentication redirects
    sessionStorage.clear();
    localStorage.removeItem('redirectAfterLogin');
    
    // Find the discussion index in the module
    let discussionIndex = 0;
    if (moduleId) {
      const module = course.modules?.find(m => m._id === moduleId);
      if (module && module.discussions) {
        const discussionIndexFound = module.discussions.findIndex(d => d._id === discussionId);
        if (discussionIndexFound !== -1) {
          discussionIndex = discussionIndexFound;
        }
      }
    }
    
    // Use the correct URL pattern for discussion navigation
    const navigationUrl = `/courses/${courseId}/modules/${moduleId || course.modules?.[0]?._id}/discussion/${discussionId}`;
    
    console.log('🚀 FORCE NAVIGATE: Using correct URL pattern:', navigationUrl);
    console.log('💬 Discussion ID:', discussionId, 'Discussion Index:', discussionIndex);
    window.location.replace(navigationUrl);
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

  // Add function to debug video completion specifically
  window.debugVideoCompletion = () => {
    console.log('🎥 DEBUG VIDEO COMPLETION:');
    console.log('Current course:', course);
    console.log('Current completedItems:', Array.from(completedItems));
    
    if (course && course.modules) {
      course.modules.forEach((module, moduleIndex) => {
        if (module.videoUrl) {
          const itemIndex = calculateItemIndex(module, 'video');
          const completionKey = getCompletionKey(module, 'video', itemIndex);
          const isCompleted = completedItems.has(completionKey);
          
          console.log(`Module ${moduleIndex + 1} Video:`, {
            moduleTitle: module.title,
            videoUrl: module.videoUrl,
            videoTitle: module.videoTitle,
            calculatedItemIndex: itemIndex,
            completionKey: completionKey,
            isCompleted: isCompleted,
            completionKeyExists: completedItems.has(completionKey)
          });
        }
      });
    }
  };

  // Add global function to refresh completion data
  window.refreshCompletionData = refreshCompletionData;
  
  // Add global function to force refresh completion status
  window.forceRefreshCompletionStatus = async () => {
    console.log('🔄 Force refreshing completion status...');
    await refreshCompletionData();
    
    // Force a re-render
    setExpandedModules(prev => new Set([...prev]));
    
    console.log('✅ Force refresh completed');
  };

  // Add debug function to check completion keys for all items
  window.debugCompletionKeys = () => {
    console.log('🔍 DEBUGGING COMPLETION KEYS:');
    if (course && course.modules) {
      course.modules.forEach((module, moduleIndex) => {
        console.log(`\n📋 Module ${moduleIndex + 1}: ${module.title}`);
        
        // Check description
        if (module.description) {
          const descIndex = calculateItemIndex(module, 'description');
          const descKey = getCompletionKey(module, 'description', descIndex);
          console.log(`  📄 Description: index=${descIndex}, key="${descKey}", completed=${completedItems.has(descKey)}`);
        }
        
        // Check content
        if (module.content && module.content.trim() && module.content !== '[]' && module.content !== 'null' && module.content !== '""' && module.content.length > 10) {
          const contentIndex = calculateItemIndex(module, 'content');
          const contentKey = getCompletionKey(module, 'content', contentIndex);
          console.log(`  📝 Content: index=${contentIndex}, key="${contentKey}", completed=${completedItems.has(contentKey)}`);
        }
        
        // Check content items
        if (module.contentItems && module.contentItems.length > 0) {
          module.contentItems.forEach((item, idx) => {
            const contentType = item.type || 'article';
            const contentKey = `${contentType}_${idx}`;
            console.log(`  📄 ${contentType} "${item.title}": arrayIndex=${idx}, key="${contentKey}", completed=${completedItems.has(contentKey)}`);
          });
        }
        
        // Check video
        if (module.videoUrl) {
          const videoIndex = calculateItemIndex(module, 'video');
          const videoKey = getCompletionKey(module, 'video', videoIndex);
          console.log(`  🎬 Video: index=${videoIndex}, key="${videoKey}", completed=${completedItems.has(videoKey)}`);
        }
        
        // Check resources
        if (module.resources && module.resources.length > 0) {
          module.resources.forEach((resource, idx) => {
            const resourceIndex = calculateItemIndex(module, 'resource', idx);
            const resourceKey = getCompletionKey(module, 'resource', resourceIndex);
            console.log(`  📎 Resource ${idx + 1}: index=${resourceIndex}, key="${resourceKey}", completed=${completedItems.has(resourceKey)}`);
          });
        }
        
        // Check quizzes
        if (module.quizzes && module.quizzes.length > 0) {
          module.quizzes.forEach((quiz, idx) => {
            const quizKey = `quiz_${idx}`;
            console.log(`  🎯 Quiz ${idx + 1}: arrayIndex=${idx}, key="${quizKey}", completed=${completedItems.has(quizKey)}`);
          });
        }
        
        // Check discussions
        if (module.discussions && module.discussions.length > 0) {
          module.discussions.forEach((discussion, idx) => {
            const discussionKey = `discussion_${idx}`;
            console.log(`  💬 Discussion ${idx + 1}: arrayIndex=${idx}, key="${discussionKey}", completed=${completedItems.has(discussionKey)}`);
          });
        }
      });
    }
    
    console.log('\n📊 All completed items:', Array.from(completedItems));
  };

  return (
    <Container>
      {/* Add inline CSS for better clickable styling */}
      <style>
        {`
          .content-item-clickable {
            transition: all 0.2s ease !important;
            border-left: 3px solid transparent !important;
          }
          .content-item-clickable:hover {
            background: #f8f9fa !important;
            border-left: 3px solid #007BFF !important;
            transform: translateX(2px) !important;
          }
          .content-item-clickable:active {
            background: #e9ecef !important;
          }
        `}
      </style>


        <BackButton 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔙 Back button clicked!');
          
          // Navigate back to the specific category page based on course category
          if (course?.category) {
            const categoryUrl = `/courses/category/${encodeURIComponent(course.category)}`;
            console.log('🔙 Navigating to category:', categoryUrl);
            window.location.href = categoryUrl;
          } else {
            // Fallback to Engineering category if no course category available
            window.location.href = '/courses/category/Engineering';
          }
        }}
        style={{ 
          backgroundColor: 'transparent',
          border: 'none',
          color: '#007BFF',
          cursor: 'pointer',
          padding: '8px',
          fontSize: '1.1rem',
        fontWeight: 600,
        marginBottom: '1rem'
        }}
      >
        <ArrowBack style={{ marginRight: 6 }} /> Back to Courses
      </BackButton>



      {/* Show course completion banner if completed */}
      {isCourseCompleted() && (
        <CompletionBanner>
          <BannerTitle>🎉 Congratulations!</BannerTitle>
          <BannerText>You have successfully completed this course!</BannerText>
          <ModalButtons>
            <ActionButton primary onClick={() => setShowGradesModal(true)}>
              View Grades & Get Certificate
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
        {/* Course Image - Display same image as course cards */}
        {(() => {
          const imageUrl = getCourseImageUrl(course);
          
          // Add cache-busting parameter to force image reload (same as BrowseCourses)
          const finalImageUrl = `${imageUrl}?t=${Date.now()}`;
          
          console.log('🔍 Rendering course image with URL:', finalImageUrl);
          
          return (
            <div style={{ 
              width: '200px', 
              height: '150px', 
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <img 
                src={finalImageUrl}
                alt={course?.title || 'Course Image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onLoad={() => {
                  console.log('✅ Course image loaded successfully:', finalImageUrl);
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  console.error('❌ Course image failed to load:', finalImageUrl);
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  setImageLoaded(true);
                }}
              />
            </div>
          );
        })()}
        
        <div>
          <CourseTitle>
            {course.title}
            {isEnrolled && (
              <StatusBadge enrolled={isEnrolled}>
                {Math.round(progress)}% Complete
              </StatusBadge>
            )}
          </CourseTitle>

          {/* Progress Bar - Show if enrolled OR if there's progress data */}
          {(isEnrolled || progress > 0 || completedItems.size > 0) && (
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                Your Progress: {Math.round(progress)}%
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
              {overviewExpanded ? course.overview : course.overview?.substring(0, 300) + (course.overview?.length > 300 ? '...' : '')}
            </OverviewDescription>
            {course.overview && course.overview.length > 300 && (
              <SeeMoreButton onClick={toggleOverviewExpansion}>
                {overviewExpanded ? 'See Less' : 'See More'}
              </SeeMoreButton>
            )}
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
            if (module.contentItems && module.contentItems.length > 0) {
              totalItems += module.contentItems.length;
              itemBreakdown.push(`${module.contentItems.length} content item${module.contentItems.length > 1 ? 's' : ''}`);
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
                          className="content-item-clickable"
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
                              // Description is always at index 0 (matching ModuleContent)
                              const completionKey = getCompletionKey(module, 'description', 0);
                              const isCompleted = completedItems.has(completionKey);
                              
                              if (isCompleted) {
                                return <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />;
                              }
                              
                              return (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'description', 0);
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
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'description', 0);
                                    }}
                                    style={{
                                      background: '#007BFF',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Mark as complete"
                                  >
                                    Mark Complete
                                  </button>
                                </>
                              );
                            })()}
                          </ContentItemAction>
                        </ContentItem>
                      )}
                      
                      {/* Content/Lessons - Only show if content is meaningful */}
                      {module.content && 
                       typeof module.content === 'string' &&
                       module.content.trim() && 
                       module.content !== '[]' && 
                       module.content !== 'null' && 
                       module.content !== '""' &&
                       module.content.length > 10 && (
                        <ContentItem 
                          className="content-item-clickable"
                          onClick={(e) => {
                            // Prevent event bubbling and stop any default behavior
                            e.preventDefault();
                            e.stopPropagation();
                            
                            console.log('🎯 MODULE CONTENT CLICK EVENT:', e);
                            console.log('🎯 MODULE CONTENT CLICK:', module.title);
                            console.log('🎯 Module data:', {
                              id: module._id,
                              title: module.title,
                              hasContent: !!module.content
                            });
                            
                            // Handle content click
                            console.log(`🎯 Accessing content for: ${module.title}`);
                            
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
                              // Use calculateItemIndex to get the correct index for content
                              const itemIndex = calculateItemIndex(module, 'content');
                              const completionKey = getCompletionKey(module, 'content', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              
                              if (isCompleted) {
                                return <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />;
                              }
                              
                              return (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'content', itemIndex);
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
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'content', itemIndex);
                                    }}
                                    style={{
                                      background: '#007BFF',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Mark as complete"
                                  >
                                    Mark Complete
                                  </button>
                                </>
                              );
                            })()}
                          </ContentItemAction>
                        </ContentItem>
                      )}

                                            {/* Content Items */}
                      {module.contentItems && module.contentItems
                        .filter(item => hasMeaningfulContent(item))
                        .map((item, idx) => {
                          const contentType = item.type || 'article';
                          // Use the actual array index for completion key (matching ModuleContent)
                          const actualIndex = getItemIndexForCompletion(module, contentType, idx);
                          const completionKey = getCompletionKey(module, contentType, actualIndex);
                          const isCompleted = completedItems.has(completionKey);
                        
                        return (
                          <ContentItem
                            key={`content-item-${idx}`}
                            data-testid="content-item"
                            className="content-item-clickable"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('🎯 CONTENT ITEM CLICK:', item.title);
                              console.log('🎯 Content item type:', item.type);
                              console.log('🎯 Content item URL:', item.url);
                              console.log('🎯 Content item file:', item.fileName);
                              
                              try {
                                // Navigate to internal content viewer for all content items using correct route
                                const returnUrl = `/courses/${courseId}/overview`;
                                const contentUrl = `/courses/${courseId}/content/${module._id}/${item.type}/${item._id || idx}?return=${encodeURIComponent(returnUrl)}`;
                                console.log('🚀 Attempting navigation to:', contentUrl);
                                
                                // Use window.location.href for reliable navigation (same as quizzes/discussions)
                                window.location.href = contentUrl;
                                console.log('✅ Content item navigation command executed successfully');
                              } catch (error) {
                                console.error('❌ Error handling content item click:', error);
                                alert('Navigation failed. Check console for details.');
                              }
                            }}
                            completed={isCompleted}
                          >
                            <ContentItemIcon type={item.type}>
                              {item.type === 'article' && <Description />}
                              {item.type === 'video' && <VideoLibrary />}
                              {item.type === 'audio' && <AudioFile />}
                              {item.type === 'file' && <AttachFile />}
                            </ContentItemIcon>
                            <ContentItemInfo>
                              <ContentItemTitle>{item.title}</ContentItemTitle>
                              <ContentItemMeta>
                                {item.type === 'article' && 'Read • Article'}
                                {item.type === 'video' && 'Watch • Video'}
                                {item.type === 'audio' && 'Listen • Audio'}  
                                {item.type === 'file' && 'View • File'}
                                {item.url && ' • External Link'}
                              </ContentItemMeta>
                            </ContentItemInfo>
                            <ContentItemAction>
                              {(() => {
                                const contentType = item.type || 'article';
                                // Use the actual array index for completion key (matching ModuleContent)
                                const actualIndex = getItemIndexForCompletion(module, contentType, idx);
                                const completionKey = getCompletionKey(module, contentType, actualIndex);
                                const isCompleted = completedItems.has(completionKey);
                                
                                if (isCompleted) {
                                  return <CheckCircle style={{ color: '#28a745', fontSize: '1.5rem' }} />;
                                }
                                
                                return (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkComplete(module, contentType, actualIndex);
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
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkComplete(module, contentType, actualIndex);
                                      }}
                                      style={{
                                        background: '#007BFF',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                      }}
                                      title="Mark as complete"
                                    >
                                      Mark Complete
                                    </button>
                                  </>
                                );
                              })()}
                            </ContentItemAction>
                          </ContentItem>
                        );
                      })}

                      {/* Video Lectures */}
                      {module.videoUrl && (
                        <ContentItem 
                          className="content-item-clickable"
                          onClick={() => handleContentClick(module, 'video')}>
                          <ContentItemIcon type="video">
                            <VideoLibrary />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Video Lecture: {module.videoTitle || 'Lecture Video'}</ContentItemTitle>
                            <ContentItemMeta>Watch • Video Content</ContentItemMeta>
                          </ContentItemInfo>
                          <ContentItemAction>
                            {(() => {
                              // Use calculateItemIndex to get the correct index for video
                              const itemIndex = calculateItemIndex(module, 'video');
                              const completionKey = getCompletionKey(module, 'video', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              return (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                    <>
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
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkComplete(module, 'video', itemIndex);
                                        }}
                                        style={{
                                          background: '#007BFF',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          padding: '0.25rem 0.5rem',
                                          fontSize: '0.75rem',
                                          cursor: 'pointer',
                                          marginLeft: '0.5rem'
                                        }}
                                        title="Mark as complete"
                                      >
                                        Mark Complete
                                      </button>
                                    </>
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
                          className="content-item-clickable"
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
                              // Use calculateItemIndex to get the correct index for resource
                              const itemIndex = calculateItemIndex(module, 'resource', idx);
                              const completionKey = getCompletionKey(module, 'resource', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              return (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isCompleted ? (
                                    <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                                  ) : (
                                    <>
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
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkComplete(module, 'resource', itemIndex);
                                        }}
                                        style={{
                                          background: '#007BFF',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          padding: '0.25rem 0.5rem',
                                          fontSize: '0.75rem',
                                          cursor: 'pointer',
                                          marginLeft: '0.5rem'
                                        }}
                                        title="Mark as complete"
                                      >
                                        Mark Complete
                                      </button>
                                    </>
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
                          className="content-item-clickable"
                          onClick={async (e) => {
                            console.log('🎯 DIRECT Quiz click event:', e);
                            console.log('🎯 DIRECT Quiz click:', quiz.title, 'ID:', quiz._id);
                            console.log('🎯 Full quiz object:', quiz);
                            console.log('🎯 Module object:', module);
                            console.log('🎯 Course ID:', courseId);
                            console.log('🎯 Quiz index:', idx);
                            console.log('🎯 Navigation URL will be:', `/courses/${courseId}/modules/${module._id}/quiz/${quiz._id}`);
                            
                            // Prevent any default behavior
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Enhanced debugging for quiz data
                            console.log('🔍 Quiz data validation:');
                            console.log('  - Quiz object type:', typeof quiz);
                            console.log('  - Quiz keys:', Object.keys(quiz || {}));
                            console.log('  - Quiz _id:', quiz._id);
                            console.log('  - Quiz title:', quiz.title);
                            console.log('  - Quiz questions:', quiz.questions?.length || 0);
                            
                            if (!quiz) {
                              console.error('❌ Quiz object is null or undefined');
                              alert('Quiz data is missing. Please refresh the page and try again.');
                              return;
                            }
                            
                            if (!quiz._id) {
                              console.error('❌ Quiz has no _id:', quiz);
                              console.error('❌ Available quiz properties:', Object.keys(quiz));
                              
                              // Try to find the quiz by title in the module's quiz array
                              if (quiz.title && module.quizzes) {
                                console.log('⚠️ Attempting to find quiz by title:', quiz.title);
                                const foundQuiz = module.quizzes.find(q => q.title === quiz.title && q._id);
                                if (foundQuiz) {
                                  console.log('✅ Found quiz with ID:', foundQuiz._id);
                                  // Use the found quiz instead
                                  quiz._id = foundQuiz._id;
                                } else {
                                  console.log('❌ Could not find quiz with ID by title');
                                  
                                  // Try to fetch the quiz data from the backend
                                  console.log('🔄 Attempting to fetch quiz data from backend...');
                                  try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch(`/api/courses/${String(courseId)}/assessments`, {
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                      }
                                    });
                                    
                                    if (response.ok) {
                                      const data = await response.json();
                                      const assessments = data.data?.assessments || [];
                                      const matchingQuiz = assessments.find(a => 
                                        a.type === 'quiz' && 
                                        a.title === quiz.title && 
                                        a.moduleId === module._id
                                      );
                                      
                                      if (matchingQuiz && matchingQuiz._id) {
                                        console.log('✅ Found quiz in backend:', matchingQuiz._id);
                                        quiz._id = matchingQuiz._id;
                                      } else {
                                        console.error('❌ Quiz not found in backend assessments');
                                        alert(`Quiz "${quiz.title}" is missing its ID. This might be a data loading issue. Please refresh the page and try again.`);
                                        return;
                                      }
                                    } else {
                                      console.error('❌ Failed to fetch assessments from backend');
                                      alert(`Quiz "${quiz.title}" is missing its ID. This might be a data loading issue. Please refresh the page and try again.`);
                                      return;
                                    }
                                  } catch (error) {
                                    console.error('❌ Error fetching quiz data:', error);
                                    alert(`Quiz "${quiz.title}" is missing its ID. This might be a data loading issue. Please refresh the page and try again.`);
                                    return;
                                  }
                                }
                              } else {
                              alert('Quiz ID missing. Please refresh the page and try again.');
                              return;
                              }
                            }
                            
                            try {
                              const returnUrl = `/courses/${courseId}/overview`;
                              // Use the correct URL pattern for quiz navigation with cache busting
                              const navigationUrl = `/courses/${courseId}/modules/${module._id}/quiz/${quiz._id}?return=${encodeURIComponent(returnUrl)}&v=${Date.now()}`;
                              console.log('🚀 Attempting navigation to:', navigationUrl);
                              console.log('🎯 Quiz index:', idx, 'Quiz ID:', quiz._id);
                              window.location.href = navigationUrl;
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
                              // Use calculateItemIndex to get the correct index for quiz
                              const itemIndex = calculateItemIndex(module, 'quiz', idx);
                              const completionKey = getCompletionKey(module, 'quiz', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              
                              return isCompleted ? (
                                <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'quiz', itemIndex);
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
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'quiz', itemIndex);
                                    }}
                                    style={{
                                      background: '#007BFF',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      marginLeft: '0.5rem'
                                    }}
                                    title="Mark as complete"
                                  >
                                    Mark Complete
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      ))}

                      {/* Assessments */}
                      {module.assessments && module.assessments.map((assessment, idx) => (
                        <ContentItem 
                          key={`assessment-${idx}`}
                          className="content-item-clickable"
                          style={{ cursor: 'pointer' }}
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
                              // Use calculateItemIndex to get the correct index for assessment
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
                          className="content-item-clickable"
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
                              window.location.href = navigationUrl;
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
                              // Use calculateItemIndex to get the correct index for discussion
                              const itemIndex = calculateItemIndex(module, 'discussion', idx);
                              const completionKey = getCompletionKey(module, 'discussion', itemIndex);
                              const isCompleted = completedItems.has(completionKey);
                              
                              return isCompleted ? (
                                <CheckCircle style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'discussion', itemIndex);
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
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkComplete(module, 'discussion', itemIndex);
                                    }}
                                    style={{
                                      background: '#007BFF',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      marginLeft: '0.5rem'
                                    }}
                                    title="Mark as complete"
                                  >
                                    Mark Complete
                                  </button>
                                </>
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
                  
                  {/* Only show "Content" if there's actual module.content text, not contentItems */}
                  {module.content && 
                   typeof module.content === 'string' &&
                   module.content.trim() && 
                   module.content !== '[]' && 
                   module.content !== 'null' && 
                   module.content !== '""' &&
                   module.content.length > 10 && (
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
                  
                  {/* Content Items */}
                  {module.contentItems && module.contentItems
                    .filter(item => hasMeaningfulContent(item))
                    .map((item, idx) => {
                      const contentType = item.type || 'article';
                      // Use the same completion key format as ModuleContent: ${contentType}_${arrayIndex}
                      const completionKey = `${contentType}_${idx}`;
                      const isCompleted = completedItems.has(completionKey);
                      
                      // Debug logging for tttghghffg items
                      if (item.title && item.title.includes('tttghghffg')) {
                        console.log('🔍 tttghghffg item debug:', {
                          title: item.title,
                          contentType,
                          idx,
                          completionKey,
                          isCompleted,
                          allCompletedItems: Array.from(completedItems),
                          matchingKeys: Array.from(completedItems).filter(key => key.includes(contentType))
                        });
                      }
                      
                      return (
                        <GradeItem key={`content-item-${idx}`}>
                          <span>📄 {item.title || `${contentType} ${idx + 1}`}</span>
                          <GradeStatus completed={isCompleted}>
                            {isCompleted ? '✅ Completed' : '⭕ Pending'}
                          </GradeStatus>
                        </GradeItem>
                      );
                    })}
                  
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
                <ModalButton className="primary" onClick={async () => {
                  setShowGradesModal(false);
                  
                  try {
                    console.log('🎓 Get Certificate clicked - generating certificate...');
                    await generateCertificate();
                    console.log('✅ Certificate generation completed, navigating to certificates page...');
                    
                    // Wait a moment for the certificate to be saved in database
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    console.log('🚀 Navigating to certificates page...');
                    window.location.href = '/certificates';
                  } catch (error) {
                    console.error('❌ Error getting certificate:', error);
                    alert('Error generating certificate. Please try again.');
                  }
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