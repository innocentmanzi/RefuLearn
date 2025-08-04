import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import {
  ArrowBack,
  Schedule,
  Category,
  People,
  PlayArrow,
  Edit,
  Assessment,
  Publish,
  VisibilityOff,
  Delete,
  Add,
  Assignment,
  Quiz,
  Forum,
  Description,
  VideoLibrary,
  AudioFile,
  AttachFile,
  Article,
  Link,
  ExpandMore,
  ExpandLess,
  CheckCircle
} from '@mui/icons-material';


const Container = styled.div`
  padding: 1rem;
  background: #f4f8fb;
  min-height: 100vh;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const CourseHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const CourseHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }
`;

const CourseTitle = styled.h1`
  color: #007BFF;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ published }) => (published === true ? '#e6f9ec' : '#fbeaea')};
  color: ${({ published }) => (published === true ? '#1bbf4c' : '#d32f2f')};
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CourseImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid #e0e0e0;
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

const CourseInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InfoIcon = styled.div`
  background: #007BFF;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
`;

const InfoValue = styled.div`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${({ color }) => color || '#007BFF'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const SectionTitle = styled.h2`
  color: #007BFF;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

// Enhanced Course Overview Section
const EnhancedOverviewSection = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const OverviewHeader = styled.div`
  padding: 2rem 2rem 0 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
`;

const OverviewTitle = styled.h2`
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const OverviewContent = styled.div`
  padding: 0 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
`;

const OverviewDescription = styled.div`
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const SeeMoreButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 1rem;
  font-size: 1rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Enhanced Learning Outcomes Section
const LearningOutcomesSection = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const LearningOutcomesHeader = styled.div`
  padding: 2rem 2rem 0 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
`;

const LearningOutcomesTitle = styled.h2`
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const OutcomesContent = styled.div`
  padding: 0 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
`;

const OutcomesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem 2rem;
  }
`;

const OutcomeItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0;
`;

const OutcomeIcon = styled.div`
  background: #10b981;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const OutcomeText = styled.p`
  color: #4b5563;
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

// Enhanced Modules Section
const ModulesSection = styled.div`
  background: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const ModulesSectionHeader = styled.div`
  padding: 2rem 2rem 0 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }
`;

const ModulesSectionTitle = styled.h2`
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ModulesContent = styled.div`
  padding: 0 2rem 2rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
`;

const ModuleCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: white;
  border-bottom: ${({ expanded }) => expanded ? '1px solid #e5e7eb' : 'none'};
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
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
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
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
  
  &:hover {
    color: #374151;
  }
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
      case 'edit': return '#6c757d';
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
  
  &:hover {
    color: #333;
  }
`;

const DescriptionText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const QuickActionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  &:hover {
    border-color: #007BFF;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
  }
`;

const QuickActionIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const QuickActionContent = styled.div`
  flex: 1;
`;

const QuickActionTitle = styled.h3`
  color: #007BFF;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const QuickActionDescription = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;



export default function CourseOverview() {
  console.log('🎬 CourseOverview component rendering...', new Date().toISOString());
  
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false); // Start as false, will be set to true when fetch starts
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  const { token, refreshToken, logout } = useUser();
  
  console.log('🔍 Debug - Component state:', {
    courseId,
    loading,
    processing,
    error: error ? 'Has error' : 'No error',
    course: course ? 'Has course' : 'No course'
  });

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.log('🔍 Debug - Error decoding token:', error);
      return true;
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered with courseId:', courseId);
    if (courseId) {
      console.log('✅ courseId exists, calling fetchCourse...');
      fetchCourse();
      // Force image refresh when component mounts or courseId changes
      setImageRefreshKey(prev => prev + 1);
    } else {
      console.log('❌ courseId is missing');
    }
  }, [courseId]); // Only depend on courseId, not fetchCourse

  // Add focus event listener to refresh data when returning from edit page
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing course data...');
      if (courseId) {
        fetchCourse();
        setImageRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [courseId]);

  const fetchCourse = async () => {
    console.log('🚀 fetchCourse called with courseId:', courseId);
    
    // Prevent multiple simultaneous requests
    if (processing) {
      console.log('🔍 Debug - Request already in progress, skipping...');
      return;
    }
    
    setLoading(true);
    setError(null);
    setProcessing(true);
    
    try {
      let token = localStorage.getItem('token');
      console.log('🔍 Debug - Token exists:', !!token);
      console.log('🔍 Debug - Token length:', token ? token.length : 0);
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('🔍 Debug - Token is expired, attempting refresh...');
        const newToken = await refreshToken();
        if (!newToken) {
          setError('Authentication expired. Please log in again.');
          return;
        }
        // Use the new token
        token = newToken;
      }

      console.log('🌐 Making API call to:', `/api/courses/${courseId}`);
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Debug - Response status:', response.status);
      console.log('🔍 Debug - Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 Debug - Error response:', errorText);
        if (response.status === 401) {
          console.log('🔄 Token expired, attempting refresh...');
          const newToken = await refreshToken();
          if (newToken) {
            console.log('✅ Token refreshed successfully. Retrying request...');
            const retryResponse = await fetch(`/api/courses/${courseId}`, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              }
            });
            if (retryResponse.ok) {
              const result = await retryResponse.json();
              console.log('✅ Course data processed successfully after refresh');
              if (result.success && result.data && result.data.course) {
                // Use the same processing logic as the main flow
                const courseData = result.data.course;
                setCourse(courseData);
                return; // Exit early after successful retry
              } else {
                throw new Error('Invalid course data received after refresh');
              }
            } else {
              throw new Error('Failed to refresh token or retry request');
            }
          } else {
            throw new Error('Failed to refresh token');
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('🔍 Debug - Response data:', result);
      
      if (result.success && result.data && result.data.course) {
        const courseData = result.data.course;
        
        // Process course data to ensure all properties are safe
        const processedModules = await Promise.all((courseData.modules || []).map(async (module, index) => {
          if (!module) {
            console.warn(`⚠️ Module at index ${index} is null or undefined, skipping`);
            return null;
          }
          
          const safeModule = {
            _id: module._id || `module-${index}`,
            title: module.title || `Module ${index + 1}`,
            contentItems: Array.isArray(module.contentItems) ? module.contentItems : [],
            resources: Array.isArray(module.resources) ? module.resources : [],
            assessments: Array.isArray(module.assessments) ? module.assessments : [],
            quizzes: Array.isArray(module.quizzes) ? module.quizzes : [],
            discussions: Array.isArray(module.discussions) ? module.discussions : [],
            videoUrl: module.videoUrl || null,
            videoTitle: module.videoTitle || '',
            content: module.content || null,
            ...module
          };
          
          // Ensure contentItems is always an array
          if (!Array.isArray(safeModule.contentItems)) {
            safeModule.contentItems = [];
          }
          
          // Remove duplicate discussions by title
          if (safeModule.discussions && safeModule.discussions.length > 0) {
            const seenTitles = new Set();
            safeModule.discussions = safeModule.discussions.filter(discussion => {
              if (seenTitles.has(discussion.title)) {
                return false;
              }
              seenTitles.add(discussion.title);
              return true;
            });
            console.log(`✓ Cleaned up ${safeModule.discussions.length} duplicate discussions in module: ${safeModule.title}`);
          }
          
          // Fetch full quiz data for each quiz ID
          if (safeModule.quizzes && safeModule.quizzes.length > 0) {
            console.log(`🔍 Fetching full quiz data for ${safeModule.quizzes.length} quizzes in module: ${safeModule.title}`);
            console.log(`🔍 Quiz items:`, safeModule.quizzes);
            const fullQuizzes = [];
            
            for (const quizItem of safeModule.quizzes) {
              // Handle both string IDs and quiz objects
              let quizId;
              if (typeof quizItem === 'string') {
                quizId = quizItem;
              } else if (quizItem && typeof quizItem === 'object') {
                // If it's already a full quiz object, use it directly
                if (quizItem.title && quizItem.questions) {
                  console.log(`✅ Using existing quiz object: ${quizItem.title}`);
                  fullQuizzes.push(quizItem);
                  continue;
                }
                // If it has an ID, use that
                quizId = quizItem._id || quizItem.id;
              } else {
                console.warn(`⚠️ Invalid quiz item:`, quizItem);
                continue;
              }
              
              if (!quizId) {
                console.warn(`⚠️ No valid quiz ID found for item:`, quizItem);
                continue;
              }
              
              try {
                const quizResponse = await fetch(`/api/instructor/quizzes/${quizId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (quizResponse.ok) {
                  const quizData = await quizResponse.json();
                  if (quizData.success && quizData.data && quizData.data.quiz) {
                    fullQuizzes.push(quizData.data.quiz);
                    console.log(`✅ Fetched quiz: ${quizData.data.quiz.title} with ${quizData.data.quiz.questions?.length || 0} questions`);
                  } else {
                    console.warn(`⚠️ Quiz data not found for ID: ${quizId}`);
                    // Keep the ID as fallback
                    fullQuizzes.push({ _id: quizId, title: `Quiz ${fullQuizzes.length + 1}` });
                  }
                } else {
                  console.warn(`⚠️ Failed to fetch quiz ${quizId}: ${quizResponse.status}`);
                  // Keep the ID as fallback
                  fullQuizzes.push({ _id: quizId, title: `Quiz ${fullQuizzes.length + 1}` });
                }
              } catch (quizError) {
                console.error(`❌ Error fetching quiz ${quizId}:`, quizError);
                // Keep the ID as fallback
                fullQuizzes.push({ _id: quizId, title: `Quiz ${fullQuizzes.length + 1}` });
              }
            }
            
            safeModule.quizzes = fullQuizzes;
            console.log(`✅ Populated ${fullQuizzes.length} quizzes with full data for module: ${safeModule.title}`);
          }

          // Fetch full discussion data for each discussion ID
          if (safeModule.discussions && safeModule.discussions.length > 0) {
            console.log(`🔍 Fetching full discussion data for ${safeModule.discussions.length} discussions in module: ${safeModule.title}`);
            console.log(`🔍 Discussion items:`, safeModule.discussions);
            const fullDiscussions = [];
            
            for (const discussionItem of safeModule.discussions) {
              // Handle both string IDs and discussion objects
              let discussionId;
              if (typeof discussionItem === 'string') {
                discussionId = discussionItem;
              } else if (discussionItem && typeof discussionItem === 'object') {
                // If it's already a full discussion object, use it directly
                if (discussionItem.title && discussionItem.content) {
                  console.log(`✅ Using existing discussion object: ${discussionItem.title}`);
                  fullDiscussions.push(discussionItem);
                  continue;
                }
                // If it has an ID, use that
                discussionId = discussionItem._id || discussionItem.id;
              } else {
                console.warn(`⚠️ Invalid discussion item:`, discussionItem);
                continue;
              }
              
              if (!discussionId) {
                console.warn(`⚠️ No valid discussion ID found for item:`, discussionItem);
                continue;
              }
              
              try {
                const discussionResponse = await fetch(`/api/courses/discussions/${discussionId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (discussionResponse.ok) {
                  const discussionData = await discussionResponse.json();
                  if (discussionData.success && discussionData.data && discussionData.data.discussion) {
                    fullDiscussions.push(discussionData.data.discussion);
                    console.log(`✅ Fetched discussion: ${discussionData.data.discussion.title}`);
                  } else {
                    console.warn(`⚠️ Discussion data not found for ID: ${discussionId}`);
                    // Keep the ID as fallback
                    fullDiscussions.push({ _id: discussionId, title: `Discussion ${fullDiscussions.length + 1}` });
                  }
                } else {
                  console.warn(`⚠️ Failed to fetch discussion ${discussionId}: ${discussionResponse.status}`);
                  // Keep the ID as fallback
                  fullDiscussions.push({ _id: discussionId, title: `Discussion ${fullDiscussions.length + 1}` });
                }
              } catch (discussionError) {
                console.error(`❌ Error fetching discussion ${discussionId}:`, discussionError);
                // Keep the ID as fallback
                fullDiscussions.push({ _id: discussionId, title: `Discussion ${fullDiscussions.length + 1}` });
              }
            }
            
            safeModule.discussions = fullDiscussions;
            console.log(`✅ Populated ${fullDiscussions.length} discussions with full data for module: ${safeModule.title}`);
            console.log(`🔍 Final discussions for module ${safeModule.title}:`, fullDiscussions.map(d => ({ _id: d._id, title: d.title })));
          }

          // Fetch full assessment data for each assessment ID
          if (safeModule.assessments && safeModule.assessments.length > 0) {
            console.log(`🔍 Fetching full assessment data for ${safeModule.assessments.length} assessments in module: ${safeModule.title}`);
            console.log(`🔍 Assessment items:`, safeModule.assessments);
            const fullAssessments = [];
            
            for (const assessmentItem of safeModule.assessments) {
              // Handle both string IDs and assessment objects
              let assessmentId;
              if (typeof assessmentItem === 'string') {
                assessmentId = assessmentItem;
              } else if (assessmentItem && typeof assessmentItem === 'object') {
                // If it's already a full assessment object, use it directly
                if (assessmentItem.title && assessmentItem.questions) {
                  console.log(`✅ Using existing assessment object: ${assessmentItem.title}`);
                  fullAssessments.push(assessmentItem);
                  continue;
                }
                // If it has an ID, use that
                assessmentId = assessmentItem._id || assessmentItem.id;
              } else {
                console.warn(`⚠️ Invalid assessment item:`, assessmentItem);
                continue;
              }
              
              if (!assessmentId) {
                console.warn(`⚠️ No valid assessment ID found for item:`, assessmentItem);
                continue;
              }
              
              try {
                const assessmentResponse = await fetch(`/api/courses/modules/${safeModule._id}/assessments/${assessmentId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (assessmentResponse.ok) {
                  const assessmentData = await assessmentResponse.json();
                  if (assessmentData.success && assessmentData.data && assessmentData.data.assessment) {
                    fullAssessments.push(assessmentData.data.assessment);
                    console.log(`✅ Fetched assessment: ${assessmentData.data.assessment.title} with ${assessmentData.data.assessment.questions?.length || 0} questions`);
                  } else {
                    console.warn(`⚠️ Assessment data not found for ID: ${assessmentId}`);
                    // Keep the ID as fallback
                    fullAssessments.push({ _id: assessmentId, title: `Assessment ${fullAssessments.length + 1}` });
                  }
                } else {
                  console.warn(`⚠️ Failed to fetch assessment ${assessmentId}: ${assessmentResponse.status}`);
                  // Keep the ID as fallback
                  fullAssessments.push({ _id: assessmentId, title: `Assessment ${fullAssessments.length + 1}` });
                }
              } catch (assessmentError) {
                console.error(`❌ Error fetching assessment ${assessmentId}:`, assessmentError);
                // Keep the ID as fallback
                fullAssessments.push({ _id: assessmentId, title: `Assessment ${fullAssessments.length + 1}` });
              }
            }
            
            safeModule.assessments = fullAssessments;
            console.log(`✅ Populated ${fullAssessments.length} assessments with full data for module: ${safeModule.title}`);
          }
          
          return safeModule;
        }));
        
        const processedCourse = {
          ...courseData,
          modules: processedModules.filter(module => module !== null),
          enrolledStudents: Array.isArray(courseData.enrolledStudents) ? courseData.enrolledStudents : []
        };
        
        console.log('🔍 COURSE IMAGE DEBUG - Raw course data:', {
          title: courseData.title,
          hasImage: !!courseData.course_profile_picture,
          imagePath: courseData.course_profile_picture,
          courseId: courseData._id
        });
        
        console.log('🔍 COURSE DATA DEBUG - Processed course modules:', processedCourse.modules?.map(m => ({
          _id: m._id,
          title: m.title,
          discussionsCount: m.discussions?.length || 0,
          discussions: m.discussions?.map(d => ({ _id: d._id, title: d.title, content: d.content })),
          quizzesCount: m.quizzes?.length || 0,
          quizzes: m.quizzes?.map(q => ({ _id: q._id, title: q.title }))
        })));
        
        setCourse(processedCourse);
        console.log('✅ Course data processed successfully');
      } else {
        setError('Invalid course data received');
      }
    } catch (err) {
      console.error('❌ Error fetching course:', err);
      setError(err.message || 'Failed to fetch course');
    } finally {
      console.log('🏁 fetchCourse finally block - setting loading and processing to false');
      setLoading(false);
      setProcessing(false);
    }
  };

  const toggleModuleExpansion = (moduleId) => {
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

  const toggleOverviewExpansion = () => {
    setOverviewExpanded(prev => !prev);
  };

  const handleTogglePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (course.isPublished) {
        // If already published, allow unpublishing
        console.log('🔄 Unpublishing course...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            isPublished: false
            })
          });

          if (response.ok) {
          console.log('✅ Course unpublished successfully');
          setCourse(prev => ({ ...prev, isPublished: false }));
          alert('Course unpublished successfully!');
          } else {
          throw new Error('Failed to unpublish course');
        }
      } else {
        // If not published, request publication from admin
        console.log('🔄 Requesting course publication...');
        
        const response = await fetch(`/api/courses/${courseId}/request-publication`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('✅ Course publication requested successfully');
          setCourse(prev => ({ ...prev, approvalStatus: 'pending' }));
          alert('Course publication requested successfully! It will be reviewed by an admin.');
        } else {
          throw new Error('Failed to request course publication');
        }
      }
    } catch (err) {
      console.error('❌ Error updating course:', err);
      alert('Failed to update course status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('🔄 Deleting course...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            console.log('✅ Course deleted successfully');
            alert('Course deleted successfully!');
            navigate('/instructor/courses');
          } else {
            throw new Error('Failed to delete course');
      }
    } catch (err) {
      console.error('❌ Error deleting course:', err);
      alert('Failed to delete course');
    }
  };

  const handleEditModule = (moduleIndex) => {
    const moduleToEdit = course.modules[moduleIndex];
    if (moduleToEdit) {
      navigate(`/instructor/courses/create/module`, {
        state: {
          module: moduleToEdit,
          courseData: {
            ...course,
            courseId,
            modules: course.modules
          }
        }
      });
    }
  };

  if (loading || processing || !course) {
    console.log('🔄 Rendering loading state:', { loading, processing, hasCourse: !!course, error });
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading course...</div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
            Loading: {loading ? 'Yes' : 'No'} | Processing: {processing ? 'Yes' : 'No'} | Has Course: {course ? 'Yes' : 'No'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
            Course ID: {courseId || 'Not found'}
          </div>
          {error && <div style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</div>}
          {!loading && !processing && !course && !error && (
            <div style={{ color: 'orange', marginTop: '1rem' }}>
              No course data and no loading state. Click to retry:
              <button 
                onClick={() => {
                  console.log('🔄 Manual retry clicked');
                  fetchCourse();
                }}
                style={{
                  background: '#007BFF',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '1rem'
                }}
              >
                Retry Load
              </button>
            </div>
          )}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div style={{ marginBottom: '1rem' }}>{error}</div>
          {(error.includes('401') || error.includes('Authentication') || error.includes('token')) ? (
            <div>
              <p style={{ marginBottom: '1rem' }}>Authentication issue detected. Please try logging out and back in.</p>
              <button 
                onClick={logout}
                style={{
                  background: '#007BFF',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout and Return to Login
              </button>
            </div>
          ) : null}
        </div>
      </Container>
    );
  }

  // Ensure course has default values for all properties
  const safeCourse = {
    title: course?.title || 'Untitled Course',
    isPublished: course?.isPublished || false,
    duration: course?.duration || 'Self-paced',
    category: course?.category || 'General',
    enrolledStudents: Array.isArray(course?.enrolledStudents) ? course.enrolledStudents : [],
    modules: Array.isArray(course?.modules) ? course.modules : [],
    overview: course?.overview || '',
    learningOutcomes: course?.learningOutcomes || '',
    course_profile_picture: course?.course_profile_picture || '',
    ...course
  };

  // Additional safety check - ensure all modules are properly structured
  if (!Array.isArray(safeCourse.modules)) {
    console.error('Modules is not an array:', safeCourse.modules);
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>Invalid course data structure</div>
        </div>
      </Container>
    );
  }

  // Final safety check - ensure all required properties exist
  if (!safeCourse.title || !safeCourse._id) {
    console.error('Missing required course properties:', safeCourse);
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>Course data is incomplete</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/instructor/courses')}>
        <ArrowBack style={{ marginRight: 6 }} /> Back to Manage Courses
      </BackButton>

      <CourseHeader>
        <CourseHeaderContent>
          {(() => {
            console.log('🔍 COURSE IMAGE DEBUG:', {
              hasImage: !!safeCourse.course_profile_picture,
              imagePath: safeCourse.course_profile_picture,
              processedPath: safeCourse.course_profile_picture 
                ? `/${safeCourse.course_profile_picture.replace(/^uploads\//, '')}` 
                : '/logo512.png'
            });
            return (
            <CourseImage 
                  src={(() => {
                    console.log('🖼️ Processing course image for:', safeCourse.title, 'Profile picture:', safeCourse.course_profile_picture);
                    
                    if (!safeCourse.course_profile_picture) {
                      console.log('🖼️ No profile picture, using default:', '/logo512.png');
                      return '/logo512.png';
                    }
                    
                    // Convert Windows backslashes to forward slashes
                    const normalizedPath = safeCourse.course_profile_picture.replace(/\\/g, '/');
                    console.log('🖼️ Normalized path:', normalizedPath);
                    
                    // Handle different image path formats
                    let imageUrl;
                    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
                      console.log('🖼️ Using direct URL:', normalizedPath);
                      imageUrl = normalizedPath;
                    } else if (normalizedPath.startsWith('/uploads/')) {
                      console.log('🖼️ Using uploads path:', normalizedPath);
                      imageUrl = normalizedPath;
                    } else if (normalizedPath.startsWith('uploads/')) {
                      console.log('🖼️ Using uploads path with slash:', `/${normalizedPath}`);
                      imageUrl = `/${normalizedPath}`;
                    } else if (normalizedPath.includes('supabase.co') || normalizedPath.includes('storage.googleapis.com')) {
                      console.log('🖼️ Using cloud storage URL:', normalizedPath);
                      imageUrl = normalizedPath;
                    } else {
                      console.log('🖼️ Using default uploads path:', `/uploads/${normalizedPath}`);
                      imageUrl = `/uploads/${normalizedPath}`;
                    }
                    
                    // Add cache-busting parameter to force image refresh
                    const cacheBuster = `?t=${Date.now()}&k=${imageRefreshKey}`;
                    const finalUrl = imageUrl.includes('?') ? `${imageUrl}&${cacheBuster.substring(1)}` : `${imageUrl}${cacheBuster}`;
                    console.log('🖼️ Final image URL with cache buster:', finalUrl);
                    
                    return finalUrl;
                  })()}
              alt={safeCourse.title}
              onError={(e) => {
                // Only log the error if it's not already the fallback image
                if (e.target.src !== '/logo512.png') {
                  console.warn('⚠️ Course image failed to load, using fallback:', e.target.src);
                }
                e.target.src = '/logo512.png';
              }}
            />
            );
          })()}
          
          <CourseTitle>
            {safeCourse.title}
            <StatusBadge published={safeCourse.isPublished}>
              {safeCourse.isPublished ? 'Published' : 
               safeCourse.approvalStatus === 'pending' ? 'Pending Approval' : 'Unpublished'}
            </StatusBadge>
          </CourseTitle>
        </CourseHeaderContent>
        
        <CourseInfo>
          <InfoCard>
            <InfoIcon>
              <Schedule />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Duration</InfoLabel>
              <InfoValue>{safeCourse.duration}</InfoValue>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>
              <Category />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Category</InfoLabel>
              <InfoValue>{safeCourse.category}</InfoValue>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>
              <People />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Students Enrolled</InfoLabel>
              <InfoValue>{safeCourse.enrolledStudents.length}</InfoValue>
            </InfoContent>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>
              <PlayArrow />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Modules</InfoLabel>
              <InfoValue>{safeCourse.modules.length}</InfoValue>
            </InfoContent>
          </InfoCard>
        </CourseInfo>

        <ActionButtons>
          <ActionButton onClick={() => navigate(`/instructor/courses/${courseId}/edit`)} color="#007BFF">
            <Edit /> Edit Course
          </ActionButton>
          <ActionButton onClick={handleTogglePublish} color={safeCourse.isPublished ? "#6c757d" : "#007BFF"}>
            {safeCourse.isPublished ? <VisibilityOff /> : <Publish />}
            {safeCourse.isPublished ? 'Unpublish' : 'Request Publication'}
          </ActionButton>
          <ActionButton onClick={handleDelete} color="#000000">
            <Delete /> Delete Course
          </ActionButton>
        </ActionButtons>
      </CourseHeader>

      {safeCourse.overview && (
        <EnhancedOverviewSection>
          <OverviewHeader>
            <OverviewTitle>Course Overview</OverviewTitle>
          </OverviewHeader>
          <OverviewContent>
            <OverviewDescription>
              {overviewExpanded 
                ? safeCourse.overview 
                : safeCourse.overview.length > 200 
                  ? `${safeCourse.overview.substring(0, 200)}...` 
                  : safeCourse.overview
              }
            </OverviewDescription>
            {safeCourse.overview.length > 200 && (
              <SeeMoreButton onClick={toggleOverviewExpansion}>
                {overviewExpanded ? 'See Less' : 'See More'}
              </SeeMoreButton>
            )}
          </OverviewContent>
        </EnhancedOverviewSection>
      )}

      {safeCourse.learningOutcomes && (
        <LearningOutcomesSection>
          <LearningOutcomesHeader>
            <LearningOutcomesTitle>Learning Outcomes</LearningOutcomesTitle>
          </LearningOutcomesHeader>
          <OutcomesContent>
            <OutcomesGrid>
            {safeCourse.learningOutcomes.split('\n').filter(outcome => outcome.trim()).map((outcome, index) => (
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

      {safeCourse.modules && safeCourse.modules.length > 0 && (
        <ModulesSection>
          <ModulesSectionHeader>
            <ModulesSectionTitle>Course Modules</ModulesSectionTitle>
          </ModulesSectionHeader>
          <ModulesContent>
          {safeCourse.modules.filter(module => module !== null).map((module, index) => {
            try {
              console.log(`🔍 Processing module ${index}:`, module);
              
              // Ensure module has all required properties with safe defaults
              const safeModule = {
                _id: module._id || `module-${index}`,
                title: module.title || `Module ${index + 1}`,
                contentItems: Array.isArray(module.contentItems) ? module.contentItems : [],
                resources: Array.isArray(module.resources) ? module.resources : [],
                assessments: Array.isArray(module.assessments) ? module.assessments : [],
                quizzes: Array.isArray(module.quizzes) ? module.quizzes : [],
                discussions: Array.isArray(module.discussions) ? module.discussions : [],
                videoUrl: module.videoUrl || null,
                videoTitle: module.videoTitle || '',
                content: module.content || null,
                description: module.description || '',
                ...module
              };
              
              // Ensure contentItems is always an array
              if (!Array.isArray(safeModule.contentItems)) {
                safeModule.contentItems = [];
              }
              
              const isExpanded = expandedModules.has(safeModule._id);
              
              // Count total items in module with breakdown
              let totalItems = 0;
              let itemBreakdown = [];
              
              if (safeModule.content) {
                totalItems++;
                itemBreakdown.push('1 content');
              }
              
              if (safeModule.videoUrl) {
                totalItems++;
                itemBreakdown.push('1 video');
              }
              
              if (safeModule.contentItems && safeModule.contentItems.length > 0) {
                totalItems += safeModule.contentItems.length;
                itemBreakdown.push(`${safeModule.contentItems.length} content item${safeModule.contentItems.length > 1 ? 's' : ''}`);
              }
              
              if (safeModule.resources && safeModule.resources.length > 0) {
                totalItems += safeModule.resources.length;
                itemBreakdown.push(`${safeModule.resources.length} resource${safeModule.resources.length > 1 ? 's' : ''}`);
              }
              
              if (safeModule.assessments && safeModule.assessments.length > 0) {
                totalItems += safeModule.assessments.length;
                itemBreakdown.push(`${safeModule.assessments.length} assessment${safeModule.assessments.length > 1 ? 's' : ''}`);
              }
              
              if (safeModule.quizzes && safeModule.quizzes.length > 0) {
                totalItems += safeModule.quizzes.length;
                itemBreakdown.push(`${safeModule.quizzes.length} quiz${safeModule.quizzes.length > 1 ? 'zes' : ''}`);
              }
              
              if (safeModule.discussions && safeModule.discussions.length > 0) {
                // Remove duplicate discussions by title
                const uniqueDiscussions = [];
                const seenTitles = new Set();
                
                safeModule.discussions.forEach(discussion => {
                  if (!seenTitles.has(discussion.title)) {
                    seenTitles.add(discussion.title);
                    uniqueDiscussions.push(discussion);
                  }
                });
                
                totalItems += uniqueDiscussions.length;
                itemBreakdown.push(`${uniqueDiscussions.length} discussion${uniqueDiscussions.length > 1 ? 's' : ''}`);
              }
              
              return (
                <ModuleCard key={safeModule._id}>
                  <ModuleHeader 
                    expanded={isExpanded}
                    onClick={() => toggleModuleExpansion(safeModule._id)}
                  >
                    <ModuleHeaderContent>
                      <ModuleNumber>{index + 1}</ModuleNumber>
                      <ModuleTitleContainer>
                        <ModuleTitle>
                          Module {index + 1}: {safeModule.title}
                          <ModuleItemCount>({totalItems} items)</ModuleItemCount>
                        </ModuleTitle>
                      </ModuleTitleContainer>
                    </ModuleHeaderContent>
                    <ExpandIcon expanded={isExpanded}>
                      <Add />
                    </ExpandIcon>
                  </ModuleHeader>
                  
                                    {isExpanded && (
                    <ModuleContent>
                      {/* Module Description - Show as first item */}
                      {safeModule.description && typeof safeModule.description === 'string' && safeModule.description.trim() && (
                        <ContentItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/description`, {
                            state: { 
                              description: safeModule.description,
                              module: safeModule,
                              course: safeCourse,
                              returnUrl: `/instructor/courses/${courseId}/overview`
                            }
                          });
                        }}>
                          <ContentItemIcon type="description">
                            <Description />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Module Description</ContentItemTitle>
                            <ContentItemMeta>Read • Module Overview</ContentItemMeta>
                          </ContentItemInfo>
                        </ContentItem>
                      )}

                      {/* Step 1: Content/Lessons - Only show if there's actual content */}
                      {safeModule.content && 
                       typeof safeModule.content === 'string' &&
                       safeModule.content.trim() && 
                       safeModule.content !== '[]' && 
                       safeModule.content !== 'null' && 
                       safeModule.content !== '""' &&
                       safeModule.content.length > 10 && (
                        <ContentItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/content`);
                        }}>
                          <ContentItemIcon type="content">
                            <Description />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Content</ContentItemTitle>
                            <ContentItemMeta>View • Reading Materials</ContentItemMeta>
                          </ContentItemInfo>
                        </ContentItem>
                      )}

                      {safeModule.videoUrl && (
                        <ContentItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/video`);
                        }}>
                          <ContentItemIcon type="video">
                            <VideoLibrary />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Video Lecture: {safeModule.videoTitle || 'Lecture Video'}</ContentItemTitle>
                            <ContentItemMeta>Watch • Video Content</ContentItemMeta>
                          </ContentItemInfo>
                        </ContentItem>
                      )}

                      {/* Content Items */}
                      {safeModule.contentItems && safeModule.contentItems.map((item, idx) => (
                        <ContentItem 
                          key={`content-item-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to internal content viewer for all content items
                            navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/content-item/${idx}`, {
                              state: { 
                                contentItem: item,
                                module: safeModule,
                                course: safeCourse,
                                returnUrl: `/instructor/courses/${courseId}/overview`
                              }
                            });
                          }}
                        >
                          <ContentItemIcon type={item.type}>
                            {item.type === 'article' && <Article />}
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
                              {item.fileName && ` • ${item.fileName}`}
                            </ContentItemMeta>
                          </ContentItemInfo>
                        </ContentItem>
                      ))}

                      {safeModule.resources && safeModule.resources.map((resource, idx) => (
                        <ContentItem 
                          key={`resource-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open external resource in new tab if it's a URL
                            if (resource.url) {
                              window.open(resource.url, '_blank');
                            } else {
                              navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/resource/${idx}`);
                            }
                          }}
                        >
                          <ContentItemIcon type="resource">
                            <Link />
                          </ContentItemIcon>
                          <ContentItemInfo>
                            <ContentItemTitle>Resource: {resource.title || `Resource ${idx + 1}`}</ContentItemTitle>
                            <ContentItemMeta>View • {resource.type || 'Resource'}</ContentItemMeta>
                          </ContentItemInfo>
                        </ContentItem>
                      ))}

                      {/* Step 2: Assignments/Assessments - Show after content */}
                      {safeModule.assessments && safeModule.assessments.length > 0 && safeModule.assessments.map((assessment, idx) => (
                        <ContentItem 
                          key={`assessment-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/assessment/${idx}`);
                          }}
                        >
                            <ContentItemIcon type="assessment">
                            <Assignment />
                            </ContentItemIcon>
                            <ContentItemInfo>
                            <ContentItemTitle>Assignment {idx + 1}{assessment.title ? `: ${assessment.title}` : ''}</ContentItemTitle>
                              <ContentItemMeta>
                              {assessment.totalPoints || '20'}pts • Submit Assignment
                              </ContentItemMeta>
                            </ContentItemInfo>
                          </ContentItem>
                      ))}

                      {/* Step 3: Quizzes - Show after assignments */}
                      {safeModule.quizzes && safeModule.quizzes.length > 0 && safeModule.quizzes.map((quiz, idx) => {
                        // Debug quiz data
                        console.log(`🔍 Quiz ${idx + 1} data:`, {
                          title: quiz.title,
                          totalPoints: quiz.totalPoints,
                          hasQuestions: !!quiz.questions,
                          questionsLength: quiz.questions?.length || 0,
                          questions: quiz.questions?.map(q => ({ points: q.points, type: q.type })) || [],
                          calculatedPoints: quiz.totalPoints || (quiz.questions && quiz.questions.length > 0 ? quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0) : 0)
                        });
                        
                        return (
                        <ContentItem 
                          key={`quiz-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Use the actual quiz ID instead of index
                            const quizId = quiz._id || quiz.id || idx;
                            navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/quiz/${quizId}`);
                          }}
                        >
                            <ContentItemIcon type="quiz">
                            <Quiz />
                            </ContentItemIcon>
                            <ContentItemInfo>
                            <ContentItemTitle>Quiz {idx + 1}{quiz.title ? `: ${quiz.title}` : ''}</ContentItemTitle>
                              <ContentItemMeta>
                              {quiz.totalPoints || (quiz.questions && quiz.questions.length > 0 ? quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0) : 0)}pts • Take Quiz
                              </ContentItemMeta>
                            </ContentItemInfo>
                          </ContentItem>
                        );
                      })}

                      {/* Step 4: Discussions - Show last (optional) with deduplication */}
                      {(() => {
                        console.log('🔍 COURSE OVERVIEW - Module discussions:', {
                          moduleTitle: safeModule.title,
                          moduleId: safeModule._id,
                          hasDiscussions: !!safeModule.discussions,
                          discussionsLength: safeModule.discussions?.length || 0,
                          discussions: safeModule.discussions,
                          discussionsType: typeof safeModule.discussions,
                          isArray: Array.isArray(safeModule.discussions)
                        });
                        
                        if (!safeModule.discussions || safeModule.discussions.length === 0) {
                          console.log('🔍 COURSE OVERVIEW - No discussions found for module:', safeModule.title);
                          return null;
                        }
                        
                        // Remove duplicate discussions by title
                        const uniqueDiscussions = [];
                        const seenTitles = new Set();
                        
                        safeModule.discussions.forEach(discussion => {
                          if (!seenTitles.has(discussion.title)) {
                            seenTitles.add(discussion.title);
                            uniqueDiscussions.push(discussion);
                          }
                        });
                        
                        console.log('🔍 COURSE OVERVIEW - Unique discussions to render:', uniqueDiscussions.length);
                        
                        return uniqueDiscussions.map((discussion, idx) => (
                          <ContentItem 
                            key={`discussion-${discussion._id || idx}`}
                            onClick={(e) => {
                            e.stopPropagation();
                              // Use the actual discussion ID instead of index
                              const discussionId = discussion._id || discussion.id || idx;
                              navigate(`/instructor/courses/${courseId}/modules/${safeModule._id}/discussion/${discussionId}`);
                            }}
                          >
                            <ContentItemIcon type="discussion">
                              <Forum />
                            </ContentItemIcon>
                            <ContentItemInfo>
                              <ContentItemTitle>Discussion {idx + 1}: {discussion.title || `Discussion ${idx + 1}`}</ContentItemTitle>
                              <ContentItemMeta>Participate • Forum Discussion</ContentItemMeta>
                            </ContentItemInfo>
                          </ContentItem>
                        ));
                      })()}

                      {/* Edit Module Item */}
                      <ContentItem onClick={(e) => {
                        e.stopPropagation();
                        handleEditModule(index);
                      }}>
                        <ContentItemIcon type="edit">
                          <Edit />
                        </ContentItemIcon>
                        <ContentItemInfo>
                          <ContentItemTitle>Edit Module</ContentItemTitle>
                          <ContentItemMeta>Modify module content and settings</ContentItemMeta>
                        </ContentItemInfo>
                        <ContentItemAction>
                          <ArrowBack style={{ transform: 'rotate(180deg)' }} />
                        </ContentItemAction>
                      </ContentItem>
                    </ModuleContent>
                  )}
                </ModuleCard>
              );
            } catch (error) {
              console.error(`Error processing module ${index}:`, error);
              console.error(`Module data that caused error:`, module);
              console.error(`Error stack:`, error.stack);
              return (
                <ModuleCard key={`error-module-${index}`}>
                  <ModuleHeader>
                    <ModuleHeaderContent>
                      <ModuleNumber>{index + 1}</ModuleNumber>
                      <ModuleTitleContainer>
                        <ModuleTitle>Module {index + 1}: Error Loading Module</ModuleTitle>
                      </ModuleTitleContainer>
                    </ModuleHeaderContent>
                  </ModuleHeader>
                </ModuleCard>
              );
            }
          })}
          </ModulesContent>
        </ModulesSection>
      )}
    </Container>
  );
} 