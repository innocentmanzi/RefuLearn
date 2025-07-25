import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Article, VideoLibrary, AudioFile, AttachFile, Launch } from '@mui/icons-material';
import offlineIntegrationService from '../services/offlineIntegrationService';

const Container = styled.div`
  background: #f4f8fb;
  min-height: 100vh;
  padding: 2rem;
`;

const Header = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
  
  &:hover {
    color: #0056b3;
  }
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ContentIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type }) => 
    type === 'article' ? '#e3f2fd' : 
    type === 'video' ? '#fce4ec' : 
    type === 'audio' ? '#f3e5f5' : 
    '#e8f5e8'
  };
  color: ${({ type }) => 
    type === 'article' ? '#1976d2' : 
    type === 'video' ? '#c2185b' : 
    type === 'audio' ? '#7b1fa2' : 
    '#388e3c'
  };
`;

const ContentInfo = styled.div`
  flex: 1;
`;

const ContentTitle = styled.h1`
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
`;

const ContentMeta = styled.div`
  color: #666;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const UrlDisplay = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  word-break: break-all;
  font-family: monospace;
`;

const UrlLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const UrlLink = styled.a`
  color: #007BFF;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  min-height: 400px;
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const IframeContent = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const ExternalLinkButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  
  &:hover {
    background: #0056b3;
  }
`;

const Description = styled.div`
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const FileInfo = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const ContentItemViewer = ({ returnUrl }) => {
  const { courseId, moduleId, contentType, contentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug logging for route matching
  console.log('🎯 ContentItemViewer component loaded!');
  console.log('🎯 URL:', window.location.pathname);
  console.log('🎯 Params:', { courseId, moduleId, contentType, contentId });
  console.log('🎯 Location state:', location.state);
  const [contentItem, setContentItem] = useState(null);
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation and progress tracking state
  const [allContentItems, setAllContentItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // Get item index from URL params
  const itemIndex = contentId;
  
  // Try to get content item from navigation state
  const stateContentItem = location.state?.contentItem;
  
  // Helper functions for navigation and progress tracking
  const getCompletionKey = (module, contentType, itemIndex) => {
    // Use the same format as StudentCourseOverview: ${contentType}-${itemIndex}
    return `${contentType}-${itemIndex}`;
  };
  
  // Helper function to get the correct completion key for the current item
  const getCurrentCompletionKey = () => {
    // Use 'content-item' for file content items to match StudentCourseOverview
    const contentTypeForCompletion = contentType === 'file' ? 'content-item' : contentType === 'article' ? 'content-item' : contentType;
    const indexForCompletion = contentType === 'file' && contentItem && contentItem.originalIndex !== undefined 
      ? contentItem.originalIndex 
      : currentItemIndex;
    const key = getCompletionKey(module, contentTypeForCompletion, indexForCompletion);
    
    console.log('🔑 Completion key generated:', {
      contentType,
      contentTypeForCompletion,
      currentItemIndex,
      originalIndex: contentItem?.originalIndex,
      indexForCompletion,
      key,
      isCompleted: completedItems.has(key)
    });
    
    return key;
  };
  
  const calculateItemIndex = (module, targetType, targetIndex = 0) => {
    let index = 0;
    
    // Add description if exists
    if (module.description) {
      if (targetType === 'description') return index;
      index++;
    }
    
    // Add content if exists
    if (module.content) {
      if (targetType === 'content') return index;
      index++;
    }
    
    // Add video if exists
    if (module.videoUrl) {
      if (targetType === 'video') return index;
      index++;
    }
    
    // Add content items
    if (module.contentItems) {
      for (let i = 0; i < module.contentItems.length; i++) {
        if (targetType === module.contentItems[i].type && targetIndex === i) return index;
        index++;
      }
    }
    
    // Add quizzes
    if (module.quizzes) {
      for (let i = 0; i < module.quizzes.length; i++) {
        if (targetType === 'quiz' && targetIndex === i) return index;
        index++;
      }
    }
    
    // Add assessments
    if (module.assessments) {
      for (let i = 0; i < module.assessments.length; i++) {
        if (targetType === 'assessment' && targetIndex === i) return index;
        index++;
      }
    }
    
    // Add discussions
    if (module.discussions) {
      for (let i = 0; i < module.discussions.length; i++) {
        if (targetType === 'discussion' && targetIndex === i) return index;
        index++;
      }
    }
    
    return -1;
  };
  
  // Function to fetch completion status from backend
  const fetchCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !courseId) return;
      
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.completedItems) {
          const backendCompletedItems = new Set(data.data.completedItems);
          setCompletedItems(backendCompletedItems);
          
          // Update localStorage with backend data
          localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(Array.from(backendCompletedItems)));
          
          console.log('✅ Completion status loaded from backend:', backendCompletedItems);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch completion status from backend:', error);
    }
  };

  const handleMarkComplete = async () => {
    console.log('🎯 handleMarkComplete called:', {
      hasModule: !!module,
      hasContentItem: !!contentItem,
      isEnrolled: isEnrolled,
      courseId,
      moduleId
    });
    
    if (!module || !contentItem) {
      alert('Missing module or content item data. Please refresh the page and try again.');
      return;
    }
    
    if (!isEnrolled) {
      alert('Please enroll in the course first to track progress.');
      return;
    }
    
    if (isMarkingComplete) return;
    
    setIsMarkingComplete(true);
    
    // First, check if backend is accessible
    try {
      const testResponse = await fetch('/api/courses/debug-test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!testResponse.ok) {
        throw new Error(`Backend test failed: ${testResponse.status}`);
      }
      
      console.log('✅ Backend connectivity test passed');
    } catch (backendError) {
      console.error('❌ Backend connectivity test failed:', backendError);
      setIsMarkingComplete(false);
      alert('Cannot connect to backend server. Please ensure the backend is running on port 5001 and try again.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to track progress');
        return;
      }
      
      const completionKey = getCurrentCompletionKey();
      
      const requestData = {
        moduleId: module._id,
        contentType: contentType,
        itemIndex: parseInt(itemIndex) || 0,
        completionKey: completionKey,
        completed: true
      };
      
      console.log('📝 Marking item as complete:', {
        moduleId: module._id,
        contentType: contentType,
        itemIndex: parseInt(itemIndex) || 0,
        completionKey: completionKey,
        requestData: requestData
      });
      
      // Optimistically update UI
      setCompletedItems(prev => new Set([...prev, completionKey]));
      
      console.log('📝 Sending progress update request:', requestData);
      
      console.log('🌐 Sending request to:', `/api/courses/${courseId}/progress`);
      console.log('🌐 Request method: PUT');
      console.log('🌐 Request headers:', {
        'Authorization': `Bearer ${token ? '***' : 'MISSING'}`,
        'Content-Type': 'application/json'
      });
      console.log('🌐 Request body:', requestData);
      
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response ok:', response.ok);
      
      if (response.ok) {
        // Success - update localStorage with new completion status
        const newCompletedItems = new Set([...completedItems, completionKey]);
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(Array.from(newCompletedItems)));
        
        console.log('✅ Progress saved to backend successfully');
        
        // Force a refresh of completion status to ensure sync
        setTimeout(() => {
          fetchCompletionStatus();
        }, 500);
      } else {
        // Revert optimistic update on error
        setCompletedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(completionKey);
          return newSet;
        });
        
        // Get error details
        let errorMessage = 'Failed to save progress';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Backend error response:', errorData);
        } catch (e) {
          console.error('❌ Failed to parse error response:', e);
        }
        
        console.error('❌ Progress update failed:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage
        });
        
        if (response.status === 429) {
          alert('Too many requests. Please wait a moment and try again.');
        } else {
          alert(`Failed to save progress: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error in handleMarkComplete:', error);
      
      // Revert optimistic update on error
      const completionKey = getCurrentCompletionKey();
      setCompletedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(completionKey);
        return newSet;
      });
      
      // Provide more specific error information
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 5001.';
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Server connection failed. Please check your internet connection and try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setTimeout(() => setIsMarkingComplete(false), 1000);
    }
  };
  
  const navigateToItem = (direction) => {
    if (!allContentItems.length) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentItemIndex > 0 ? currentItemIndex - 1 : allContentItems.length - 1;
    } else {
      newIndex = currentItemIndex < allContentItems.length - 1 ? currentItemIndex + 1 : 0;
    }
    
    const targetItem = allContentItems[newIndex];
    if (!targetItem) return;
    
    // Use the originalIndex for the URL, not the newIndex
    const targetUrl = `/courses/${courseId}/content/${moduleId}/${targetItem.type}/${targetItem.originalIndex || 0}`;
    console.log('🔄 Navigating to:', targetUrl, 'Target item:', targetItem);
    window.location.href = targetUrl;
  };
  
  // If we have content item in state, use it immediately
  useEffect(() => {
    console.log('🔍 ContentItemViewer - Checking for state content item:', {
      hasStateContentItem: !!stateContentItem,
      stateContentItem: stateContentItem,
      locationState: location.state,
      courseId,
      moduleId,
      contentType,
      contentId,
      itemIndex
    });
    
    if (stateContentItem) {
      console.log('✅ Using content item from navigation state:', stateContentItem);
      setContentItem(stateContentItem);
      setCourse(location.state?.course);
      setModule(location.state?.module);
      setLoading(false);
    } else {
      console.log('⚠️ No state content item available - will fetch from API');
    }
  }, [stateContentItem, location.state]);

  // Fetch completion status when component mounts or courseId changes
  useEffect(() => {
    if (courseId && isEnrolled) {
      fetchCompletionStatus();
    }
  }, [courseId, isEnrolled]);

  // Fetch content item data if not provided via state
  useEffect(() => {
    const fetchContentItemData = async () => {
      console.log('🔍 fetchContentItemData called - stateContentItem:', !!stateContentItem);
      
      if (stateContentItem) {
        // Data already available from state
        console.log('✅ Using state content item, skipping fetch');
        setLoading(false);
        return;
      }
      
      // Check enrollment status
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🔍 Checking enrollment status for course:', courseId);
          const enrollmentResponse = await fetch(`/api/courses/enrolled/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('🔍 Enrollment response status:', enrollmentResponse.status);
          
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            console.log('✅ Enrollment check successful:', enrollmentData);
            setIsEnrolled(true);
            
            // Fetch real completion status from backend
            await fetchCompletionStatus();
          } else {
            console.warn('⚠️ User not enrolled in course:', courseId);
            setIsEnrolled(false);
          }
        }
      } catch (error) {
        console.warn('Failed to check enrollment status:', error);
        setIsEnrolled(false);
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let courseData = null;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching content item data from API...');
            
            const courseResponse = await fetch(`/api/courses/${courseId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (courseResponse.ok) {
              const courseApiData = await courseResponse.json();
              courseData = courseApiData.data.course;
              console.log('✅ Course data received for content item');
              
              // Store course data for offline use
              await offlineIntegrationService.storeCourseData(courseId, courseData);
            } else {
              throw new Error('Failed to load course data');
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            
            // Fall back to offline data if online fails
            courseData = await offlineIntegrationService.getCourseData(courseId);
            
            if (!courseData) {
              throw onlineError;
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline content item data...');
          courseData = await offlineIntegrationService.getCourseData(courseId);
        }

        if (courseData) {
          setCourse(courseData);
          
          // Find the specific module and content item
          const targetModule = courseData.modules?.find(m => m._id === moduleId);
          if (targetModule) {
            setModule(targetModule);
            
            // Build all content items array for navigation
            const items = [];
            
            // Add description if exists
            if (targetModule.description) {
              items.push({ type: 'description', title: 'Module Description', ...targetModule });
            }
            
            // Add content if exists
            if (targetModule.content) {
              items.push({ type: 'content', title: 'Module Content', ...targetModule });
            }
            
            // Add video if exists
            if (targetModule.videoUrl) {
              items.push({ type: 'video', title: targetModule.videoTitle || 'Video Lecture', ...targetModule });
            }
            
            // Add content items
            if (targetModule.contentItems) {
              targetModule.contentItems.forEach((item, idx) => {
                items.push({ ...item, originalIndex: idx });
              });
            }
            
            // Add quizzes
            if (targetModule.quizzes) {
              targetModule.quizzes.forEach((quiz, idx) => {
                items.push({ type: 'quiz', title: quiz.title, originalIndex: idx, ...quiz });
              });
            }
            
            // Add assessments
            if (targetModule.assessments) {
              targetModule.assessments.forEach((assessment, idx) => {
                items.push({ type: 'assessment', title: assessment.title, originalIndex: idx, ...assessment });
              });
            }
            
            // Add discussions
            if (targetModule.discussions) {
              targetModule.discussions.forEach((discussion, idx) => {
                items.push({ type: 'discussion', title: discussion.title, originalIndex: idx, ...discussion });
              });
            }
            
            setAllContentItems(items);
            console.log('📋 All content items built:', items.length, 'items');
            
            // Find current item index
            const currentIndex = items.findIndex(item => 
              item.type === contentType && item.originalIndex === parseInt(itemIndex)
            );
            
            if (currentIndex !== -1) {
              setCurrentItemIndex(currentIndex);
              console.log('📍 Current item index:', currentIndex);
            }
            
            console.log('🔍 Debug - Module content items:', targetModule.contentItems);
            console.log('🔍 Debug - Looking for item index:', itemIndex);
            console.log('🔍 Debug - Available content items:', targetModule.contentItems?.length || 0);
            
            // Check if the itemIndex is within bounds
            const availableItems = targetModule.contentItems?.length || 0;
            const requestedIndex = parseInt(itemIndex);
            
            if (requestedIndex >= availableItems) {
              console.error('❌ Item index out of bounds:', requestedIndex, 'Available:', availableItems);
              setError(`Item index ${requestedIndex} is out of bounds. Available items: ${availableItems}. Redirecting to first item...`);
              
              // Redirect to the first available item
              setTimeout(() => {
                const redirectUrl = `/courses/${courseId}/content/${moduleId}/${contentType}/0`;
                console.log('🔄 Redirecting to first item:', redirectUrl);
                window.location.href = redirectUrl;
              }, 2000);
              return;
            }
            
            const targetContentItem = targetModule.contentItems?.[requestedIndex];
            console.log('🔍 Debug - Found content item:', targetContentItem);
            
            if (targetContentItem) {
              setContentItem(targetContentItem);
              console.log('✅ Content item set successfully:', targetContentItem);
              
              // Store content item for offline use
              await offlineIntegrationService.storeContentItem(courseId, moduleId, itemIndex, targetContentItem);
            } else {
              console.error('❌ Content item not found at index:', itemIndex);
              console.error('❌ Available content items:', targetModule.contentItems);
              setError(`Content item not found at index ${itemIndex}. Available items: ${targetModule.contentItems?.length || 0}`);
            }
          } else {
            setError('Module not found');
          }
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('❌ Error fetching content item data:', err);
        setError(`Failed to load content: ${err.message}`);
        setError(err.message || 'Failed to load content item');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId && itemIndex !== undefined) {
      fetchContentItemData();
    }
  }, [courseId, moduleId, itemIndex, stateContentItem]);

  const handleBack = () => {
    if (returnUrl) {
      navigate(returnUrl);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowBack style={{ marginRight: 6 }} /> Back
          </BackButton>
          <ContentTitle>Loading content...</ContentTitle>
        </Header>
      </Container>
    );
  }

  if (error || !contentItem) {
    return (
          <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowBack style={{ marginRight: 6 }} /> Back
        </BackButton>
        <ContentTitle>{error || 'Content not found'}</ContentTitle>
          {error && (
            <div style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginTop: '1rem',
              color: '#856404'
            }}>
              <strong>Debug Information:</strong>
              <br />
              Course ID: {courseId}
              <br />
              Module ID: {moduleId}
              <br />
              Content Type: {contentType}
              <br />
              Content ID: {contentId}
              <br />
              Item Index: {itemIndex}
              <br />
              Has State Content: {stateContentItem ? 'Yes' : 'No'}
              <br />
              <br />
              <strong>Navigation Help:</strong>
              <br />
              • If you see "out of bounds" error, the system will automatically redirect you to the first available item
              <br />
              • Use the Previous/Next buttons to navigate between available content items
              <br />
              • If you're still having issues, try refreshing the page or going back to the course overview
            </div>
          )}
        </Header>
      </Container>
    );
  }

  const renderContentIcon = () => {
    switch (contentItem.type) {
      case 'article':
        return <Article style={{ fontSize: '2rem' }} />;
      case 'video':
        return <VideoLibrary style={{ fontSize: '2rem' }} />;
      case 'audio':
        return <AudioFile style={{ fontSize: '2rem' }} />;
      case 'file':
        return <AttachFile style={{ fontSize: '2rem' }} />;
      default:
        return <Article style={{ fontSize: '2rem' }} />;
    }
  };

  // Function to convert YouTube URL to embeddable format
  const getEmbeddableUrl = (url) => {
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle shortened YouTube URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // For other URLs, return as is
    return url;
  };

  const renderContent = () => {
    // For URLs (videos, other content types)
    if (contentItem.url) {
      const isYouTube = contentItem.url.includes('youtube.com') || contentItem.url.includes('youtu.be');
      
      // For videos, show the embedded player
      const embeddableUrl = getEmbeddableUrl(contentItem.url);
      return (
        <div>
          <ExternalLinkButton onClick={() => window.open(contentItem.url, '_blank')}>
            <Launch />
            Open in New Tab
          </ExternalLinkButton>
          
          <IframeContainer>
            <IframeContent 
              src={embeddableUrl}
              title={contentItem.title}
              allowFullScreen
              onError={(e) => {
                console.error('Iframe failed to load:', e);
              }}
            />
          </IframeContainer>
        </div>
      );
    }

    // For uploaded files
    if (contentItem.fileName) {
      // Construct the file URL based on the file path
      const getFileUrl = () => {
        if (contentItem.filePath) {
          // Convert Windows backslashes to forward slashes
          const normalizedPath = contentItem.filePath.replace(/\\/g, '/');
          
          if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
            return normalizedPath;
          } else if (normalizedPath.startsWith('/uploads/')) {
            // Use backend URL for static files
            return `http://localhost:5001${normalizedPath}`;
          } else if (normalizedPath.startsWith('uploads/')) {
            return `http://localhost:5001/${normalizedPath}`;
          } else {
            return `http://localhost:5001/uploads/${normalizedPath}`;
          }
        }
        
        // Fallback: try to construct URL from fileName in multiple directories
        if (contentItem.fileName) {
          // Try different upload directories where files might be stored
          const possiblePaths = [
            `http://localhost:5001/uploads/documents/${contentItem.fileName}`,
            `http://localhost:5001/uploads/general/${contentItem.fileName}`,
            `http://localhost:5001/uploads/courses/${contentItem.fileName}`,
            `http://localhost:5001/uploads/profiles/${contentItem.fileName}`,
            `http://localhost:5001/uploads/resources/${contentItem.fileName}`
          ];
          
          // For now, return the documents path - if file doesn't exist, user will see error with available test files
          return possiblePaths[0];
        }
        
        return null;
      };

      const fileUrl = getFileUrl();
      
      return (
        <div style={{ 
          background: 'linear-gradient(135deg, #007BFF 0%, #0056b3 50%, #000000 100%)',
          padding: '3rem 2rem',
          borderRadius: '25px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,123,255,0.3)',
          border: '2px solid rgba(255,255,255,0.1)'
        }}>
          {/* Animated Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            animation: 'pulse 4s ease-in-out infinite'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle at 70% 70%, rgba(0,123,255,0.2) 0%, transparent 50%)',
            animation: 'pulse 6s ease-in-out infinite reverse'
          }} />

          {/* Floating Geometric Shapes */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '30px',
            height: '30px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            animation: 'float 5s ease-in-out infinite',
            backdropFilter: 'blur(5px)'
          }} />
          
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: '20px',
            height: '20px',
            background: 'rgba(0,123,255,0.3)',
            borderRadius: '50%',
            animation: 'float 7s ease-in-out infinite reverse'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: '15px',
            height: '15px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            animation: 'float 4s ease-in-out infinite'
          }} />
          
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ 
              marginBottom: '2rem', 
              fontSize: '3rem', 
              fontWeight: '800',
              textShadow: '0 4px 8px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #ffffff, #e6f3ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {contentItem.title || 'File Content'}
            </h2>

            {/* Description Section */}
            {contentItem.description && (
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '2.5rem', 
                borderRadius: '20px', 
                marginBottom: '2.5rem',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <p style={{ 
                  color: 'white', 
                  lineHeight: '1.8', 
                  margin: 0,
                  fontSize: '1.2rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontWeight: '500'
                }}>
                  {contentItem.description}
                </p>
              </div>
            )}

            {/* Action Section */}
            <div style={{ textAlign: 'center' }}>
                    {fileUrl ? (
                <button
                  onClick={() => {
              window.open(fileUrl, '_blank', 'noopener,noreferrer');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    padding: '1.5rem 4rem',
                    borderRadius: '50px',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  onMouseOver={e => {
                    e.target.style.background = 'rgba(255,255,255,0.25)';
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                    e.target.style.border = '2px solid rgba(255,255,255,0.5)';
                  }}
                  onMouseOut={e => {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                    e.target.style.border = '2px solid rgba(255,255,255,0.3)';
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>📄</span>
                  Explore Content
                </button>
          ) : (
            <div style={{
                  padding: '2rem', 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '20px', 
                  color: 'white',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <strong style={{ fontSize: '1.2rem' }}>⚠️ File Unavailable</strong><br/>
                  <span style={{ fontSize: '1rem', opacity: '0.9' }}>The file URL is missing. Please contact your instructor.</span>
            </div>
          )}
            </div>
          </div>

          <style>
            {`
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-15px) rotate(180deg); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.1); }
              }
            `}
          </style>
        </div>
      );
    }

    return (
      <div>
        <p>No content available for this item.</p>
      </div>
    );
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowBack style={{ marginRight: 6 }} /> Back to {course?.title || 'Course'}
        </BackButton>
      </Header>

        <ContentArea>
          {renderContent()}
        </ContentArea>
      
      {/* Navigation and Progress Tracking */}
      {isEnrolled && (
        <div style={{
          background: 'white',
          border: '1px solid #e0e6ed',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Previous/Next Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => navigateToItem('prev')}
                disabled={allContentItems.length <= 1}
                style={{
                  background: 'white',
                  color: allContentItems.length > 1 ? '#007BFF' : '#6c757d',
                  border: '1px solid #007BFF',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: allContentItems.length > 1 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (allContentItems.length > 1) {
                    e.target.style.background = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (allContentItems.length > 1) {
                    e.target.style.background = 'white';
                  }
                }}
              >
                ← Previous
              </button>
              
              <button
                onClick={() => navigateToItem('next')}
                disabled={allContentItems.length <= 1}
                style={{
                  background: allContentItems.length > 1 ? '#007BFF' : 'white',
                  color: allContentItems.length > 1 ? 'white' : '#6c757d',
                  border: '1px solid #007BFF',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: allContentItems.length > 1 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (allContentItems.length > 1) {
                    e.target.style.background = '#0056b3';
                    e.target.style.borderColor = '#0056b3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (allContentItems.length > 1) {
                    e.target.style.background = '#007BFF';
                    e.target.style.borderColor = '#007BFF';
                  }
                }}
              >
                Next →
              </button>
            </div>
            
            {/* Progress Info */}
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#666',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              background: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              {allContentItems.length > 0 && (
                <span>
                  Item {currentItemIndex + 1} of {allContentItems.length}
                </span>
              )}
            </div>
            
            {/* Mark as Complete */}
            <button
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
              style={{
                background: completedItems.has(getCurrentCompletionKey()) ? '#28a745' : 'white',
                color: completedItems.has(getCurrentCompletionKey()) ? 'white' : '#007BFF',
                border: `1px solid ${completedItems.has(getCurrentCompletionKey()) ? '#28a745' : '#007BFF'}`,
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: isMarkingComplete ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                opacity: isMarkingComplete ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isMarkingComplete && !completedItems.has(getCurrentCompletionKey())) {
                  e.target.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMarkingComplete && !completedItems.has(getCurrentCompletionKey())) {
                  e.target.style.background = 'white';
                }
              }}
            >
              {isMarkingComplete ? (
                'Saving...'
              ) : completedItems.has(getCurrentCompletionKey()) ? (
                <>
                  ✓ Completed
                </>
              ) : (
                <>
                  ✓ Mark as Complete
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ContentItemViewer; 