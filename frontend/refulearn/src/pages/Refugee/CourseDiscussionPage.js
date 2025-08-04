import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Forum, Send, ThumbUp, Reply, Person, AccessTime, Assignment } from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
    overflow-x: hidden;
  }
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #007BFF;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f0f9ff;
  }
`;

const Title = styled.h1`
  color: #1f2937;
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 600;
`;

const CourseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const DiscussionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const PostContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007BFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const PostMeta = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 0.25rem 0;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.75rem;
  }
`;

const PostContent = styled.div`
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const PostActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 0.875rem;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  &.active {
    color: #007BFF;
  }
`;

const ReplyContainer = styled.div`
  margin-top: 1rem;
  margin-left: 2rem;
  border-left: 2px solid #e5e7eb;
  padding-left: 1rem;
`;

const ReplyBox = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ReplyForm = styled.form`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 1rem;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  max-height: 300px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 1rem;
  font-family: inherit;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
  overflow-x: hidden;
  max-width: 100%;

  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  @media (max-width: 768px) {
    min-height: 80px;
    max-height: 200px;
    padding: 0.5rem;
    font-size: 0.8rem;
    width: calc(100% - 1rem);
    margin: 0 0.5rem 1rem 0.5rem;
  }
`;

const SubmitButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  box-sizing: border-box;
  max-width: 100%;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    gap: 0.3rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #007BFF;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const CourseDiscussionPage = () => {
  const { courseId, moduleId, discussionId } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [course, setCourse] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likes, setLikes] = useState({});
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if discussion is already completed on page load
    const checkCompletionStatus = async () => {
      try {
        // Find the discussion index in the module first
        let discussionIndex = 0;
        const token = localStorage.getItem('token');
        
        if (moduleId) {
          const moduleResponse = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (moduleResponse.ok) {
            const moduleData = await moduleResponse.json();
            const module = moduleData.data.module;
            if (module && module.discussions) {
              const discussionIndexFound = module.discussions.findIndex(d => d._id === discussionId);
              if (discussionIndexFound !== -1) {
                discussionIndex = discussionIndexFound;
              }
            }
          }
        }
        
        // Calculate the correct item index using the same logic as course overview
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
          
          // 3. Content Items (if exists)
          if (module.contentItems && module.contentItems.length > 0) {
            for (let i = 0; i < module.contentItems.length; i++) {
              if (targetType === 'content-item' && targetIndex === i) return index;
              index++;
            }
          }
          
          // 4. Video (if exists)
          if (module.videoUrl) {
            if (targetType === 'video') return index;
            index++;
          }
          
          // 5. Resources
          if (module.resources && module.resources.length > 0) {
            for (let i = 0; i < module.resources.length; i++) {
              if (targetType === 'resource' && targetIndex === i) return index;
              index++;
            }
          }
          
          // 6. Assessments
          if (module.assessments && module.assessments.length > 0) {
            for (let i = 0; i < module.assessments.length; i++) {
              if (targetType === 'assessment' && targetIndex === i) return index;
              index++;
            }
          }
          
          // 7. Quizzes
          if (module.quizzes && module.quizzes.length > 0) {
            for (let i = 0; i < module.quizzes.length; i++) {
              if (targetType === 'quiz' && targetIndex === i) return index;
              index++;
            }
          }
          
          // 8. Discussions
          if (module.discussions && module.discussions.length > 0) {
            for (let i = 0; i < module.discussions.length; i++) {
              if (targetType === 'discussion' && targetIndex === i) return index;
              index++;
            }
          }
          
          return -1; // Not found
        };

            const getCompletionKey = (module, contentType, itemIndex) => {
      return `${contentType}_${itemIndex}`;
    };

        // Calculate the correct item index for this discussion
        const itemIndex = calculateItemIndex(module, 'discussion', discussionIndex);
        const currentItemId = getCompletionKey(module, 'discussion', itemIndex);
        const currentCompletedItems = JSON.parse(localStorage.getItem(`course_completions_${courseId}`) || '[]');
        const isAlreadyCompleted = currentCompletedItems.includes(currentItemId);
        
        console.log('🔍 Checking completion status on load:', {
          currentItemId,
          currentCompletedItems,
          isAlreadyCompleted,
          discussionIndex,
          calculatedItemIndex: itemIndex
        });
        
        if (isAlreadyCompleted) {
          setIsCompleted(true);
          console.log('✅ Discussion already completed, setting state');
        }
      } catch (error) {
        console.error('❌ Error checking completion status:', error);
      }
    };

    const fetchCourseDiscussion = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let courseData = null;
        let discussionData = null;
        let repliesData = [];

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching course discussion from API...');
            
            // Fetch course data
            const courseResponse = await fetch(`/api/courses/${courseId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (courseResponse.ok) {
              const courseApiData = await courseResponse.json();
              courseData = courseApiData.data.course;
              console.log('✅ Course data received');
              
              // Store course data for offline use
              await offlineIntegrationService.storeCourseData(courseId, courseData);
            } else {
              throw new Error('Failed to fetch course data');
            }

            // Fetch discussion data
            const discussionResponse = await fetch(`/api/courses/${courseId}/discussions/${discussionId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (discussionResponse.ok) {
              const discussionApiData = await discussionResponse.json();
              discussionData = discussionApiData.data.discussion;
              console.log('✅ Course discussion data received');
              
              // Store discussion data for offline use
              await offlineIntegrationService.storeCourseDiscussionData(courseId, discussionId, discussionData);
            } else {
              throw new Error('Failed to fetch discussion');
            }

            // Fetch replies
            const repliesResponse = await fetch(`/api/courses/${courseId}/discussions/${discussionId}/replies`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (repliesResponse.ok) {
              const repliesApiData = await repliesResponse.json();
              repliesData = repliesApiData.data.replies || [];
              console.log('✅ Course discussion replies received:', repliesData.length);
              
              // Store replies for offline use
              await offlineIntegrationService.storeCourseDiscussionReplies(courseId, discussionId, repliesData);
            } else {
              console.log('No replies found for this discussion');
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            
            // Fall back to offline data if online fails
            courseData = await offlineIntegrationService.getCourseData(courseId);
            discussionData = await offlineIntegrationService.getCourseDiscussionData(courseId, discussionId);
            repliesData = await offlineIntegrationService.getCourseDiscussionReplies(courseId, discussionId);
            
            if (!courseData || !discussionData) {
              throw onlineError;
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline course discussion data...');
          courseData = await offlineIntegrationService.getCourseData(courseId);
          discussionData = await offlineIntegrationService.getCourseDiscussionData(courseId, discussionId);
          repliesData = await offlineIntegrationService.getCourseDiscussionReplies(courseId, discussionId);
        }

        setCourse(courseData);
        setDiscussion(discussionData);
        setReplies(repliesData);
        
        // Initialize likes state
        const initialLikes = {};
        if (discussionData) {
          initialLikes[discussionId] = discussionData.likes || 0;
        }
        repliesData.forEach(reply => {
          initialLikes[reply._id] = reply.likes || 0;
        });
        setLikes(initialLikes);

      } catch (err) {
        console.error('❌ Error fetching course discussion:', err);
        setError(err.message || 'Failed to load course discussion');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && discussionId) {
      fetchCourseDiscussion();
      checkCompletionStatus().catch(error => {
        console.error('❌ Error in checkCompletionStatus:', error);
      });
    }
  }, [courseId, discussionId]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      const replyData = {
        courseId,
        discussionId,
        content: replyText,
        createdAt: new Date().toISOString()
      };

      let success = false;

      if (isOnline) {
        try {
          // Try online reply submission first (preserving existing behavior)
          console.log('🌐 Online mode: Submitting course discussion reply...');
          
          const response = await fetch(`/api/courses/${courseId}/discussions/${discussionId}/replies`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(replyData)
          });

          if (response.ok) {
            const newReply = await response.json();
            success = true;
            console.log('✅ Online course discussion reply submission successful');
            
            setReplies(prev => [...prev, newReply.data.reply]);
            setReplyText('');
            
            // Store updated replies for offline use
            await offlineIntegrationService.storeCourseDiscussionReplies(courseId, discussionId, [...replies, newReply.data.reply]);
          } else {
            throw new Error('Failed to submit reply');
          }

        } catch (onlineError) {
          console.warn('⚠️ Online submission failed, using offline:', onlineError);
          
          // Fall back to offline reply submission
          const result = await offlineIntegrationService.submitCourseDiscussionReplyOffline(replyData);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline course discussion reply submission successful');
            
            setReplies(prev => [...prev, result.reply]);
            setReplyText('');
            alert('Reply submitted offline! Will sync when online.');
          } else {
            throw new Error('Failed to submit reply offline');
          }
        }
      } else {
        // Offline reply submission
        console.log('📴 Offline mode: Submitting course discussion reply offline...');
        const result = await offlineIntegrationService.submitCourseDiscussionReplyOffline(replyData);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline course discussion reply submission successful');
          
          setReplies(prev => [...prev, result.reply]);
          setReplyText('');
          alert('Reply submitted offline! Will sync when online.');
        } else {
          throw new Error('Failed to submit reply offline');
        }
      }

      if (!success) {
        throw new Error('Failed to submit reply');
      }

    } catch (err) {
      console.error('❌ Error submitting course discussion reply:', err);
      setError(err.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;
    
    setIsMarkingComplete(true);
    try {
      const token = localStorage.getItem('token');
      
      // Find the discussion index in the module
      let discussionIndex = 0;
      if (moduleId) {
        // Try to get module data to find discussion index
        const moduleResponse = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (moduleResponse.ok) {
          const moduleData = await moduleResponse.json();
          const module = moduleData.data.module;
          if (module && module.discussions) {
            const discussionIndexFound = module.discussions.findIndex(d => d._id === discussionId);
            if (discussionIndexFound !== -1) {
              discussionIndex = discussionIndexFound;
            }
          }
        }
      }
      
      // Calculate the correct item index using the same logic as course overview
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
        
        // 3. Content Items (if exists)
        if (module.contentItems && module.contentItems.length > 0) {
          for (let i = 0; i < module.contentItems.length; i++) {
            if (targetType === 'content-item' && targetIndex === i) return index;
            index++;
          }
        }
        
        // 4. Video (if exists)
        if (module.videoUrl) {
          if (targetType === 'video') return index;
          index++;
        }
        
        // 5. Resources
        if (module.resources && module.resources.length > 0) {
          for (let i = 0; i < module.resources.length; i++) {
            if (targetType === 'resource' && targetIndex === i) return index;
            index++;
          }
        }
        
        // 6. Assessments
        if (module.assessments && module.assessments.length > 0) {
          for (let i = 0; i < module.assessments.length; i++) {
            if (targetType === 'assessment' && targetIndex === i) return index;
            index++;
          }
        }
        
        // 7. Quizzes
        if (module.quizzes && module.quizzes.length > 0) {
          for (let i = 0; i < module.quizzes.length; i++) {
            if (targetType === 'quiz' && targetIndex === i) return index;
            index++;
          }
        }
        
        // 8. Discussions
        if (module.discussions && module.discussions.length > 0) {
          for (let i = 0; i < module.discussions.length; i++) {
            if (targetType === 'discussion' && targetIndex === i) return index;
            index++;
          }
        }
        
        return -1; // Not found
      };

      const getCompletionKey = (module, contentType, itemIndex) => {
        return `${contentType}_${itemIndex}`;
      };

      // Calculate the correct item index for this discussion
      const itemIndex = calculateItemIndex(module, 'discussion', discussionIndex);
      const currentItemId = getCompletionKey(module, 'discussion', itemIndex);
      
      console.log('🎯 Marking discussion as complete:', {
        currentItemId,
        discussionId,
        moduleId,
        courseId,
        discussionIndex,
        calculatedItemIndex: itemIndex,
        moduleStructure: {
          description: !!module.description,
          content: !!module.content,
          contentItems: module.contentItems?.length || 0,
          videoUrl: !!module.videoUrl,
          resources: module.resources?.length || 0,
          assessments: module.assessments?.length || 0,
          quizzes: module.quizzes?.length || 0,
          discussions: module.discussions?.length || 0
        }
      });
      
      // Debug: Log what completion key should be generated
      console.log('🔍 DEBUG: Expected completion key format:', {
        contentType: 'discussion',
        discussionIndex: discussionIndex,
        calculatedItemIndex: itemIndex,
        expectedKey: `discussion-${itemIndex}`,
        actualKey: currentItemId
      });
      
      // Debug: Show the exact module structure for verification
      console.log('🔍 DEBUG: Module structure for index calculation:', {
        moduleId: module._id,
        moduleTitle: module.title,
        hasDescription: !!module.description,
        hasContent: !!module.content,
        contentItemsCount: module.contentItems?.length || 0,
        hasVideo: !!module.videoUrl,
        resourcesCount: module.resources?.length || 0,
        assessmentsCount: module.assessments?.length || 0,
        quizzesCount: module.quizzes?.length || 0,
        discussionsCount: module.discussions?.length || 0,
        discussionIndex: discussionIndex,
        calculatedItemIndex: itemIndex
      });
      
      const requestBody = {
        moduleId: moduleId,
        contentType: 'discussion',
        itemIndex: discussionIndex,
        completionKey: currentItemId,
        completed: true
      };
      
      console.log('🎯 Sending discussion completion request:', {
        url: `/api/courses/${courseId}/progress`,
        method: 'PUT',
        requestBody: requestBody
      });
      
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Discussion marked as complete:', data);
        
        // Update localStorage to sync with other components
        const currentCompletedItems = JSON.parse(localStorage.getItem(`course_completions_${courseId}`) || '[]');
        const updatedCompletions = [...currentCompletedItems, currentItemId];
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(updatedCompletions));
        
        console.log('💾 Saved discussion completion to localStorage:', {
          completionKey: currentItemId,
          totalCompletions: updatedCompletions.length,
          allCompletions: updatedCompletions
        });
        
        // Debug: Log what's actually in localStorage after saving
        console.log('🔍 DEBUG: localStorage after saving:', {
          key: `course_completions_${courseId}`,
          value: localStorage.getItem(`course_completions_${courseId}`)
        });
        
        // Test: Add a global function to check what this discussion page generated
        window.lastDiscussionCompletion = {
          discussionId: discussionId,
          completionKey: currentItemId,
          discussionIndex: discussionIndex,
          calculatedItemIndex: itemIndex,
          timestamp: new Date().toISOString()
        };
        console.log('🔍 TEST: Stored completion data in window.lastDiscussionCompletion');
        
        // Force refresh the course overview data
        window.dispatchEvent(new CustomEvent('courseProgressUpdated', { 
          detail: { courseId, completionKey: currentItemId } 
        }));
        
        // Show success message
        console.log('✅ Discussion completed successfully');
        
        // Set completion state immediately
        setIsCompleted(true);
        setIsMarkingComplete(false);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark discussion as complete');
      }
      
    } catch (error) {
      console.error('❌ Error marking discussion as complete:', error);
      alert('Failed to mark discussion as complete: ' + error.message);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleLike = async (itemId, isReply = false) => {
    try {
      // Validate itemId
      if (!itemId) {
        console.error('❌ handleLike called with undefined itemId:', { itemId, isReply });
        setError('Invalid item ID for like operation');
        return;
      }

      console.log('🔍 handleLike called with:', { itemId, isReply });
      
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online like first (preserving existing behavior)
          console.log('🌐 Online mode: Liking course discussion item...');
          
          const endpoint = isReply ? 
            `/api/courses/${courseId}/discussions/${discussionId}/replies/${itemId}/like` : 
            `/api/courses/${courseId}/discussions/${itemId}/like`;
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            success = true;
            console.log('✅ Online course discussion like successful');
            
            setLikes(prev => ({
              ...prev,
              [itemId]: (prev[itemId] || 0) + 1
            }));
          } else {
            throw new Error('Failed to like item');
          }

        } catch (onlineError) {
          console.warn('⚠️ Online like failed, using offline:', onlineError);
          
          // Fall back to offline like
          const result = await offlineIntegrationService.likeCourseDiscussionItemOffline(courseId, itemId, isReply);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline course discussion like successful');
            
            setLikes(prev => ({
              ...prev,
              [itemId]: (prev[itemId] || 0) + 1
            }));
          } else {
            throw new Error('Failed to like item offline');
          }
        }
      } else {
        // Offline like
        console.log('📴 Offline mode: Liking course discussion item offline...');
        const result = await offlineIntegrationService.likeCourseDiscussionItemOffline(courseId, itemId, isReply);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline course discussion like successful');
          
          setLikes(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
          }));
        } else {
          throw new Error('Failed to like item offline');
        }
      }

    } catch (err) {
      console.error('❌ Error liking course discussion item:', err);
      setError(err.message || 'Failed to like item');
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading course discussion...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!discussion || !course) {
    return (
      <Container>
        <ErrorMessage>Course discussion not found</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/courses/${courseId}/overview`)}>
          <ArrowBack />
          Back to Course Overview
        </BackButton>
        <Title>{discussion.title}</Title>
        <CourseInfo>
          <Assignment />
          <span>{course.title}</span>
        </CourseInfo>
      </Header>

      {/* Discussion Topic - Direct Display */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{
          color: '#1f2937',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1rem',
          borderBottom: '2px solid #007BFF',
          paddingBottom: '0.5rem'
        }}>
          {discussion.title}
        </h2>
        <div style={{
          color: '#374151',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '1rem'
        }}>
          <strong>Discussion Topic:</strong> {discussion.content}
        </div>
      </div>

      {/* Reply Form - Below Discussion Topic */}
      <ReplyForm onSubmit={handleReplySubmit}>
        <TextArea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply..."
          disabled={submitting}
        />
        <SubmitButton type="submit" disabled={submitting || !replyText.trim()}>
          {submitting ? (
            <>Submitting...</>
          ) : (
            <>
              <Send />
              Post Reply
            </>
          )}
        </SubmitButton>
      </ReplyForm>

      {/* Replies - At the Bottom */}
      {replies.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ 
            color: '#1f2937', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '0.5rem'
          }}>
            Replies ({replies.length})
          </h3>
          {replies.map((reply, index) => {
            console.log('🔍 Reply structure:', { 
              reply, 
              index, 
              hasId: !!reply._id
            });
            
            return (
              <ReplyContainer key={reply._id || index}>
                <ReplyBox>
                  <PostHeader>
                    <Avatar>
                      <Person />
                    </Avatar>
                    <PostMeta>
                      <h4>{reply.author?.name || 'Anonymous'}</h4>
                      <p>{new Date(reply.createdAt).toLocaleString()}</p>
                    </PostMeta>
                  </PostHeader>
                  
                  <PostContent>
                    {reply.content}
                  </PostContent>
                  
                  <PostActions>
                    <ActionButton onClick={() => handleLike(reply._id, true)}>
                      <ThumbUp />
                      <span>{likes[reply._id] || 0} Likes</span>
                    </ActionButton>
                  </PostActions>
                </ReplyBox>
              </ReplyContainer>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <button
          onClick={() => navigate(`/courses/${courseId}/modules/${moduleId}`)}
          style={{
            background: 'white',
            color: '#007BFF',
            border: '1px solid #007BFF',
            borderRadius: '6px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#f0f9ff';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'white';
          }}
        >
          ← Previous
        </button>

        <button
          onClick={handleMarkComplete}
          disabled={isMarkingComplete || isCompleted}
          style={{
            background: isMarkingComplete ? '#6c757d' : isCompleted ? '#28a745' : '#28a745',
            color: 'white',
            border: '1px solid #28a745',
            borderRadius: '6px',
            padding: '0.4rem 1rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: (isMarkingComplete || isCompleted) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.2s ease',
            opacity: (isMarkingComplete || isCompleted) ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!isMarkingComplete && !isCompleted) {
              e.target.style.background = '#218838';
            }
          }}
          onMouseOut={(e) => {
            if (!isMarkingComplete && !isCompleted) {
              e.target.style.background = '#28a745';
            }
          }}
        >
          {isMarkingComplete ? '⏳ Marking...' : isCompleted ? '✓ Completed' : '✓ Mark as Complete'}
        </button>

        <button
          onClick={async () => {
            // First mark as complete if not already done
            if (!isCompleted) {
              await handleMarkComplete();
            }
            // Then navigate to course overview to see progress
            navigate(`/courses/${courseId}/overview`);
          }}
          style={{
            background: '#007BFF',
            color: 'white',
            border: '1px solid #007BFF',
            borderRadius: '6px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#0056b3';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#007BFF';
          }}
        >
          Next →
        </button>
      </div>
    </Container>
  );
};

export default CourseDiscussionPage; 