import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowBack, ArrowForward, Description, VideoLibrary, Link, Assignment, Quiz, Forum, CheckCircle, RadioButtonUnchecked, Send, Person, ThumbUp, Reply, MoreVert, Article, AudioFile, AttachFile } from '@mui/icons-material';
import QuizTaker from './QuizTaker';
import { offlineIntegrationService } from '../services/offlineIntegrationService';
import { useTranslation } from 'react-i18next';

// Global API call limiter to prevent infinite loops
window.apiCallLimiter = window.apiCallLimiter || {
  activeCalls: new Set(),
  lastCallTime: {},
  minInterval: 1000, // Minimum 1 second between calls to same endpoint
};

const isApiCallAllowed = (endpoint) => {
  const now = Date.now();
  const lastCall = window.apiCallLimiter.lastCallTime[endpoint] || 0;
  
  if (now - lastCall < window.apiCallLimiter.minInterval) {
    console.log(`🚫 API call blocked to ${endpoint} - too frequent`);
    return false;
  }
  
  if (window.apiCallLimiter.activeCalls.has(endpoint)) {
    console.log(`🚫 API call blocked to ${endpoint} - already in progress`);
    return false;
  }
  
  window.apiCallLimiter.lastCallTime[endpoint] = now;
  window.apiCallLimiter.activeCalls.add(endpoint);
  return true;
};

const releaseApiCall = (endpoint) => {
  window.apiCallLimiter.activeCalls.delete(endpoint);
};

// Add CSS animation for spinner
const SpinnerContainer = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .spinner {
    animation: spin 2s linear infinite;
  }
`;

// Authentication Check Component
const AuthenticationCheck = ({ children }) => {
  const [authValid, setAuthValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        setAuthValid(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Validating authentication token...');
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('✅ Authentication valid');
            setAuthValid(true);
          } else {
            console.log('❌ Authentication invalid - token not recognized');
            setAuthValid(false);
          }
        } else {
          console.log('❌ Authentication failed - server returned', response.status);
          setAuthValid(false);
        }
      } catch (error) {
        console.error('❌ Authentication check failed:', error);
        setAuthValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  if (loading) {
    return (
      <SpinnerContainer style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#007BFF' }}>Checking authentication...</div>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #007BFF', borderRadius: '50%' }}></div>
      </SpinnerContainer>
    );
  }

  if (authValid === false) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Authentication Required</h2>
          <p style={{ color: '#6c757d', marginBottom: '2rem', lineHeight: '1.6' }}>
            Your session has expired or you're not logged in. Please log in again to access course content.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                // Clear old tokens
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                // Redirect to login
                navigate('/login');
              }}
              style={{
                background: '#007BFF',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/courses')}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3rem;
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
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  
  &:hover {
    color: #004494;
    text-decoration: underline;
  }
`;

const CourseInfo = styled.div`
  margin-bottom: 2rem;
`;

const CourseTitle = styled.h1`
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ModuleInfo = styled.div`
  color: #6b7280;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ContentCard = styled.div`
  background: white;
  padding: 0;
  margin-bottom: 2rem;
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ContentIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${props => {
    switch(props.type) {
      case 'video': return '#dc2626';
      case 'content': return '#0ea5e9';
      case 'reading': return '#0ea5e9';
      case 'quiz': return '#8b5cf6';
      case 'assessment': return '#f59e0b';
      case 'resource': return '#10b981';
      case 'discussion': return '#6366f1';
      default: return '#6b7280';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ContentInfo = styled.div`
  flex: 1;
`;

const ContentTitle = styled.h2`
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
`;

const ContentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9375rem;
`;

const ContentType = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContentBody = styled.div`
  color: #333;
  line-height: 1.8;
  font-size: 1.05rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  
  h1, h2, h3, h4, h5, h6 {
    color: #1a1a1a;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
    line-height: 1.4;
  }
  
  h1 { 
    font-size: 2rem; 
    margin-top: 0;
  }
  h2 { 
    font-size: 1.625rem; 
    color: #2c3e50;
  }
  h3 { 
    font-size: 1.375rem; 
    color: #34495e;
  }
  h4 { 
    font-size: 1.125rem; 
    color: #34495e;
  }
  
  p {
    margin-bottom: 1.25rem;
    text-align: justify;
  }
  
  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 2rem;
    
    li {
      margin-bottom: 0.75rem;
      line-height: 1.8;
    }
  }
  
  blockquote {
    border-left: 4px solid #007BFF;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    background: #f8f9fa;
    font-style: italic;
    color: #555;
    border-radius: 0 4px 4px 0;
  }
  
  code {
    background: #f4f4f4;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9rem;
    color: #d63384;
  }
  
  pre {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 1.5rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5rem 0;
    font-size: 0.9rem;
    line-height: 1.5;
    
    code {
      background: none;
      color: inherit;
      padding: 0;
    }
  }
  
  a {
    color: #007BFF;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease;
    
    &:hover {
      border-bottom-color: #007BFF;
    }
  }
  
  img {
    max-width: 100%;
    height: auto;
    margin: 1.5rem 0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
  }
  
  .highlight {
    background: #fff3cd;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
  }
  
  .note {
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 0 4px 4px 0;
    
    p {
      margin-bottom: 0.5rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .warning {
    background: #fff3e0;
    border-left: 4px solid #ff9800;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 0 4px 4px 0;
  }
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid #e5e7eb;
`;

const NavButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: ${props => props.primary ? '#0056b3' : 'white'};
  color: ${props => props.primary ? 'white' : '#0056b3'};
  border: ${props => props.primary ? 'none' : '1px solid #0056b3'};
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#004494' : '#f0f7ff'};
    transform: translateY(-1px);
  }
`;

const ContentNavigationMenu = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
`;

const ContentMenuTitle = styled.h3`
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
`;

const ContentMenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const ContentMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.active ? '#007BFF' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#007BFF' : '#d1d5db'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f3f4f6'};
    border-color: ${props => props.active ? '#0056b3' : '#9ca3af'};
  }
`;

const ContentMenuIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? 'rgba(255,255,255,0.2)' : '#e5e7eb'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const CompletionSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 1.75rem 2rem;
  border-radius: 12px;
  margin-top: 3rem;
  border: 1px solid #e5e7eb;
`;

const CompletionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.completed ? '#10b981' : '#6b7280'};
  font-weight: 500;
  font-size: 0.9375rem;
`;

const MarkCompleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.completed ? '#10b981' : '#007BFF'};
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.completed ? '#059669' : '#0056b3'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

// Removed modal-related styled components

// Discussion Component with Reply System
const DiscussionContainer = styled.div`
  background: white;
`;

const DiscussionHeader = styled.div`
  margin-bottom: 2rem;
`;

const DiscussionTitle = styled.h3`
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const DiscussionContent = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #333;
`;

const RepliesSection = styled.div`
  margin-top: 2rem;
`;

const RepliesTitle = styled.h4`
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReplyForm = styled.form`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9375rem;
  resize: vertical;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ReplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #007BFF;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PostItem = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
`;

const PostAuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
`;

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9375rem;
`;

const PostTime = styled.div`
  color: #6b7280;
  font-size: 0.8125rem;
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const PostContent = styled.div`
  padding: 1rem 1.25rem;
  color: #333;
  line-height: 1.6;
  font-size: 0.9375rem;
`;

const PostFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
`;

const EngagementButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const EngagementButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.active ? '#007BFF' : '#6b7280'};
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#e3f2fd' : '#f3f4f6'};
    color: ${props => props.active ? '#0056b3' : '#374151'};
  }
`;

const LikeCount = styled.span`
  font-size: 0.8125rem;
  color: #6b7280;
`;

const NestedReplies = styled.div`
  margin-left: 2rem;
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #e5e7eb;
`;

const NestedReplyForm = styled.form`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const NestedReplyTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ReplyActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const ActionReplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.secondary ? 'transparent' : '#007BFF'};
  color: ${props => props.secondary ? '#6b7280' : 'white'};
  border: ${props => props.secondary ? '1px solid #d1d5db' : 'none'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.secondary ? '#f3f4f6' : '#0056b3'};
  }
  
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
`;

function DiscussionComponent({ discussion, courseId, moduleId, discussionIndex }) {
  console.log('DiscussionComponent received:', { discussion, courseId, moduleId, discussionIndex });
  console.log('🔍 DISCUSSION DEBUG - Content type:', typeof discussion?.content);
  console.log('🔍 DISCUSSION DEBUG - Content value:', discussion?.content);
  console.log('🔍 DISCUSSION DEBUG - Full discussion object:', discussion);
  
  // Hooks must be called at the top level
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [userInteracting, setUserInteracting] = useState(false);

  useEffect(() => {
    if (discussion && discussion._id) {
      // Initial load - get all existing replies
      console.log('🚀 Initial load of discussion:', discussion._id);
      fetchReplies();
      loadUserLikedPosts();
      
      // DISABLED: Auto-refresh to prevent replies from disappearing
      // We'll only fetch replies manually when needed
      console.log('🔒 Auto-refresh DISABLED to prevent reply loss');
      
      return () => {
        console.log('🛑 Cleanup function called');
      };
    }
  }, [discussion?._id]);
  
  // Early return with simple HTML if component has issues - AFTER hooks
  if (!discussion) {
    return (
      <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Discussion Loading...</h3>
        <p>No discussion data available</p>
      </div>
    );
  }

  const loadUserLikedPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id || user.id;
      
      if (!userId) {
        console.log('⚠️ No user ID available for loading liked posts');
        return;
      }
      
      console.log('🔍 Loading user liked posts for discussion:', discussion._id);
      
      // Get the discussion with full reply data to check likedBy arrays
      const response = await fetch(`/api/courses/${courseId}/discussions/${discussion._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.discussion && data.data.discussion.replies) {
          const likedPostIds = data.data.discussion.replies
            .filter(reply => reply.likedBy && reply.likedBy.includes(userId))
            .map(reply => reply._id);
          
          setLikedPosts(new Set(likedPostIds));
          console.log('✅ Loaded liked posts:', likedPostIds);
        }
      }
    } catch (error) {
      console.log('⚠️ Error loading liked posts:', error.message);
    }
  };

  const fetchReplies = async () => {
    if (!discussion || !discussion._id) {
      console.log('No discussion ID available for fetching replies');
      setLoadingReplies(false);
      return;
    }

    try {
      setLoadingReplies(true);
      const token = localStorage.getItem('token');
      
      console.log('🔄 Fetching replies for discussion:', discussion._id);
      
      // Backup current replies to prevent loss
      const currentReplies = [...replies];
      
      // Try multiple endpoints to get replies
      let response;
      let repliesData = [];
      
      // Try course-specific endpoint first
      try {
        response = await fetch(`/api/courses/${courseId}/discussions/${discussion._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.discussion && data.data.discussion.replies) {
            repliesData = data.data.discussion.replies;
            console.log('✅ Got replies from course-specific endpoint:', repliesData.length);
          }
        }
      } catch (error) {
        console.log('⚠️ Course-specific endpoint failed, trying general endpoint...');
      }
      
      // Fallback to general endpoint if needed
      if (repliesData.length === 0) {
        try {
          response = await fetch(`/api/courses/discussions/${discussion._id}/replies`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('❌ Both endpoints failed:', error);
        }
      }
      
      console.log('📡 Fetch replies response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📥 Fetched replies data:', data);
        
        // Handle different response formats robustly
        let repliesData = [];
        if (data.success && data.data) {
          if (data.data.replies) {
            repliesData = data.data.replies;
          } else if (data.data.discussion && data.data.discussion.replies) {
            repliesData = data.data.discussion.replies;
          } else if (Array.isArray(data.data)) {
            repliesData = data.data;
          }
        } else if (Array.isArray(data)) {
          repliesData = data;
        } else if (data.replies) {
          repliesData = data.replies;
        }
        
        // Ensure each reply has required fields
        repliesData = repliesData.map(reply => ({
          _id: reply._id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: reply.content || '',
          author: reply.author || 'Anonymous',
          createdAt: reply.createdAt || new Date().toISOString(),
          likes: reply.likes || 0,
          likedBy: reply.likedBy || [],
          replies: reply.replies || []
        }));
        
        console.log('✅ Setting replies:', repliesData.length, 'replies found');
        
        // Save to localStorage as backup
        saveRepliesToStorage(repliesData);
        
        // SIMPLE APPROACH: Only set replies on first load, never overwrite after that
        setReplies(prevReplies => {
          // If this is the first load (no previous replies), load all from server
          if (prevReplies.length === 0) {
            console.log('📥 First load: Setting all', repliesData.length, 'replies from server');
            return repliesData;
          } else {
            // NEVER overwrite existing replies to prevent loss
            console.log('🔒 Preserving existing', prevReplies.length, 'replies - no overwrite');
            return prevReplies;
          }
        });
        
        // Log connection success
        if (repliesData.length > 0) {
          console.log('🔗 Backend-Frontend connection working! Replies persisted successfully.');
          console.log('💾 All replies are saved in database and visible to everyone.');
        }
      } else {
        console.error('❌ Failed to fetch replies, status:', response.status);
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        
        // Try localStorage backup
        console.log('🔄 Trying localStorage backup...');
        const backupReplies = loadRepliesFromStorage();
        if (backupReplies.length > 0) {
          setReplies(backupReplies);
          console.log('✅ Loaded replies from localStorage backup');
        } else {
          // Keep current replies to prevent loss
          console.log('🔄 Keeping current replies to prevent data loss');
          if (currentReplies.length > 0) {
            setReplies(currentReplies);
          } else {
            setReplies(discussion.replies || []);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error fetching replies:', err);
      // Keep current replies to prevent loss
      console.log('🔄 Network error - keeping current replies');
      if (replies.length > 0) {
        setReplies(replies);
      } else {
        setReplies(discussion.replies || []);
      }
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || loading) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('💬 Submitting reply to discussion:', discussion._id);
      console.log('📝 Reply content:', newReply.trim());
      console.log('👤 User object from localStorage:', JSON.stringify(user, null, 2));
      console.log('👤 User.name:', user.name);
      console.log('👤 User.fullName:', user.fullName);
      console.log('👤 User.firstName:', user.firstName);
      console.log('👤 User.lastName:', user.lastName);

      // Submit reply to backend
      const response = await fetch(`/api/courses/discussions/${discussion._id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newReply.trim(),
          author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous'
        })
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('📥 Response data:', data);
          
          // Use the reply from backend if available, otherwise create one
          let replyObject;
          if (data.success && data.data && data.data.reply) {
            replyObject = {
              ...data.data.reply,
              // Ensure all required fields are present
              likes: data.data.reply.likes || 0,
              likedBy: data.data.reply.likedBy || [],
              replies: data.data.reply.replies || []
            };
          } else {
            // Fallback: create reply object locally
            replyObject = {
              _id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
              content: newReply.trim(),
              author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
              createdAt: new Date().toISOString(),
              likes: 0,
              likedBy: [],
              replies: []
            };
          }
          
          console.log('✅ Adding reply object:', replyObject);
          setReplies(prev => {
            // Ensure no duplicates and add the new reply
            const existingIds = new Set(prev.map(r => r._id));
            if (!existingIds.has(replyObject._id)) {
              console.log('🆕 Adding new reply to UI:', replyObject._id);
              const newReplies = [...prev, replyObject];
              
              // Save to localStorage as backup
              saveRepliesToStorage(newReplies);
              
              return newReplies;
            } else {
              console.log('🔄 Reply already exists, keeping current state');
              return prev;
            }
          });
          setNewReply('');
          console.log('🎉 Reply submitted successfully and saved to database!');
          console.log('💾 This reply is now visible to all students and instructors.');
          console.log('🔗 Backend confirmed persistence:', data.data?.persistent ? 'YES' : 'ASSUMED');
          
          // Show success message to user
          if (data.data?.persistent) {
            console.log('✅ Database persistence confirmed - reply will never be lost!');
          }
          
          // DON'T auto-refresh immediately - let the reply stay visible
          // The 10-second auto-refresh will handle getting updates from other users
          console.log('🔒 Reply locked in UI - will not be removed by auto-refresh');
          
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          // Even if parsing fails, if we got 200, the reply was saved
          // So add it to the UI anyway
          const replyObject = {
            _id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
            content: newReply.trim(),
            author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: []
          };
          
          setReplies(prev => {
            const existingIds = new Set(prev.map(r => r._id));
            if (!existingIds.has(replyObject._id)) {
              return [...prev, replyObject];
            }
            return prev;
          });
          setNewReply('');
          console.log('Reply submitted successfully (despite parse error)!');
        }
      } else {
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to submit reply');
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          throw new Error('Failed to submit reply');
        }
      }

    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem('token');
    const isLiked = likedPosts.has(postId);
    
    console.log('👍 LIKE ACTION - Post ID:', postId, 'Currently liked:', isLiked);
    console.log('👍 LIKE ACTION - Course ID:', courseId, 'Discussion ID:', discussion._id);
    
    try {
      
      // Optimistic update
      if (isLiked) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLikedPosts(prev => new Set([...prev, postId]));
      }
      
      // Update replies with like count - SAFE UPDATE
      setReplies(prev => {
        console.log('🔄 Updating like count for post:', postId);
        const updatedReplies = prev.map(reply => 
          reply._id === postId 
            ? { ...reply, likes: (reply.likes || 0) + (isLiked ? -1 : 1) }
            : reply
        );
        console.log('✅ Like count updated successfully');
        return updatedReplies;
      });
      
      // Send to backend - try both endpoint patterns
      let response;
      try {
        // Try the course-specific endpoint first
        response = await fetch(`/api/courses/${courseId}/discussions/${discussion._id}/replies/${postId}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' })
        });
        
        if (!response.ok) {
          // Fallback to the general endpoint
          console.log('🔄 Trying fallback like endpoint...');
          response = await fetch(`/api/courses/discussions/${discussion._id}/replies/${postId}/like`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' })
          });
        }
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to update like status:', response.status, errorText);
        // Revert optimistic update on error
        if (isLiked) {
          setLikedPosts(prev => new Set([...prev, postId]));
        } else {
          setLikedPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        }
        
        // Also revert the like count in replies
        setReplies(prev => {
          console.log('🔄 Reverting like count for post:', postId);
          return prev.map(reply => 
            reply._id === postId 
              ? { ...reply, likes: (reply.likes || 0) + (isLiked ? 1 : -1) }
              : reply
          );
        });
      } else {
        console.log('✅ Like status updated successfully');
        const responseData = await response.json();
        console.log('✅ Like response data:', responseData);
      }
    } catch (err) {
      console.error('❌ Error liking post:', err);
      // Revert optimistic updates on error to prevent state corruption
      if (isLiked) {
        setLikedPosts(prev => new Set([...prev, postId]));
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
      
      // Revert like count
      setReplies(prev => {
        console.log('🔄 Reverting like count due to error for post:', postId);
        return prev.map(reply => 
          reply._id === postId 
            ? { ...reply, likes: (reply.likes || 0) + (isLiked ? 1 : -1) }
            : reply
        );
      });
    } finally {
      // Like operation complete
      console.log('👍 Like operation completed');
    }
  };

  // Debug function for like functionality
  window.debugLikeFunctionality = () => {
    console.log('🔍 DEBUG LIKE FUNCTIONALITY:');
    console.log('📋 Current replies:', replies);
    console.log('👍 Liked posts:', Array.from(likedPosts));
    console.log('👤 Current user:', JSON.parse(localStorage.getItem('user') || '{}'));
    console.log('🔗 Discussion ID:', discussion._id);
    console.log('🔗 Course ID:', courseId);
  };



  // Test like functionality
  window.testLikeFunctionality = async (postId) => {
    console.log('🧪 Testing like functionality for post:', postId);
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('🔍 Test data:', {
      token: token ? 'Present' : 'Missing',
      userId: user._id || user.id,
      courseId,
      discussionId: discussion._id,
      postId
    });
    
    // Test the API endpoint directly
    try {
      const response = await fetch(`/api/courses/${courseId}/discussions/${discussion._id}/replies/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'like' })
      });
      
      console.log('🧪 Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🧪 Test response data:', data);
        console.log('✅ Like API is working!');
      } else {
        const errorText = await response.text();
        console.log('❌ Like API failed:', errorText);
      }
    } catch (error) {
      console.log('❌ Like API error:', error.message);
    }
  };



  // Function to save replies to localStorage as backup
  const saveRepliesToStorage = (repliesToSave) => {
    try {
      const storageKey = `discussion_replies_${discussion._id}`;
      localStorage.setItem(storageKey, JSON.stringify(repliesToSave));
      console.log('💾 Saved replies to localStorage:', repliesToSave.length);
    } catch (error) {
      console.log('⚠️ Could not save replies to localStorage:', error.message);
    }
  };

  // Function to load replies from localStorage as backup
  const loadRepliesFromStorage = () => {
    try {
      const storageKey = `discussion_replies_${discussion._id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📂 Loaded replies from localStorage:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.log('⚠️ Could not load replies from localStorage:', error.message);
    }
    return [];
  };

  const handleReplyToPost = async (postId) => {
    if (!replyText.trim()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Use regular reply endpoint instead of nested to avoid errors
      const response = await fetch(`/api/courses/discussions/${discussion._id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `@${replies.find(r => r._id === postId)?.author || 'User'}: ${replyText.trim()}`,
          author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          parentReplyId: postId
        })
      });

      if (response.ok) {
        try {
          const data = await response.json();
          
          // Create reply object for immediate UI update
          const replyObject = {
            _id: Date.now().toString() + '_nested_' + Math.random().toString(36).substr(2, 9),
            content: `@${replies.find(r => r._id === postId)?.author || 'User'}: ${replyText.trim()}`,
            author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: [],
            parentReplyId: postId
          };

          // Add as regular reply to avoid nested complexity
          setReplies(prev => {
            const existingIds = new Set(prev.map(r => r._id));
            if (!existingIds.has(replyObject._id)) {
              return [...prev, replyObject];
            }
            return prev;
          });
          setReplyText('');
          setReplyingTo(null);
          
          // DON'T refresh immediately - let the reply stay visible
          console.log('🔒 Nested reply locked in UI - will not be removed by auto-refresh');
          
        } catch (parseError) {
          console.error('Parse error, but reply likely saved:', parseError);
          setReplyText('');
          setReplyingTo(null);
        }
      } else {
        console.error('Failed to submit nested reply');
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (err) {
      console.error('Error replying to post:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getAuthorInitials = (name) => {
    // Handle different types of name input
    if (!name) return 'A';
    
    // If name is an object, try to extract the name property
    if (typeof name === 'object') {
      if (name.name) {
        name = name.name;
      } else if (name.fullName) {
        name = name.fullName;
      } else if (name.firstName && name.lastName) {
        name = `${name.firstName} ${name.lastName}`;
      } else {
        return 'A';
      }
    }
    
    // Ensure name is a string
    if (typeof name !== 'string') {
      return 'A';
    }
    
    // Clean the name and get initials
    const cleanName = name.trim();
    if (!cleanName) return 'A';
    
    return cleanName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAuthorName = (author) => {
    // Handle different types of author input
    if (!author) return 'Anonymous';
    
    // If author is a string, return it
    if (typeof author === 'string') {
      return author.trim() || 'Anonymous';
    }
    
    // If author is an object, try to extract the name
    if (typeof author === 'object') {
      if (author.name) {
        return author.name;
      } else if (author.fullName) {
        return author.fullName;
      } else if (author.firstName && author.lastName) {
        return `${author.firstName} ${author.lastName}`;
      } else if (author.email) {
        return author.email.split('@')[0]; // Use email username as fallback
      }
    }
    
    return 'Anonymous';
  };

  // Fallback if styled components are not working
  if (!discussion || !discussion.title) {
    return (
      <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Discussion Loading...</h3>
        <p>Discussion data: {JSON.stringify(discussion)}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      {/* Back Button */}
      <button 
        onClick={() => window.history.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: 'none',
          color: '#0056b3',
          padding: '0.5rem 0',
          cursor: 'pointer',
          fontSize: '0.9375rem',
          fontWeight: '500',
          marginBottom: '2rem'
        }}
      >
        <ArrowBack style={{ fontSize: '1rem' }} />
        Back
      </button>

      {/* Discussion Title and Description */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', fontWeight: '600' }}>
            Discussion {discussionIndex + 1}: {discussion.title}
          </h2>
        </div>
        <div style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
          {(() => {
            let content = discussion.content;
            
            console.log('🔍 DISCUSSION CONTENT DEBUG:', {
              originalContent: content,
              contentType: typeof content,
              isString: typeof content === 'string',
              startsWithBrace: typeof content === 'string' && content.startsWith('{'),
              endsWithBrace: typeof content === 'string' && content.endsWith('}'),
              discussionObject: discussion
            });
            
            // Handle case where content might be a JSON string
            if (typeof content === 'string' && content.startsWith('{') && content.endsWith('}')) {
              try {
                const parsed = JSON.parse(content);
                console.log('✅ Successfully parsed JSON content:', parsed);
                content = parsed.content || parsed.title || content;
              } catch (e) {
                console.warn('❌ Failed to parse discussion content as JSON:', e);
                console.warn('❌ Content that failed to parse:', content);
              }
            }
            
            // If content is still empty, try to get it from other fields
            if (!content || content.trim() === '') {
              console.log('🔍 Content is empty, checking other fields...');
              if (discussion.description) {
                content = discussion.description;
                console.log('✅ Using discussion.description:', content);
              } else if (discussion.text) {
                content = discussion.text;
                console.log('✅ Using discussion.text:', content);
              } else if (discussion.body) {
                content = discussion.body;
                console.log('✅ Using discussion.body:', content);
              } else {
                console.log('❌ No content found in any field');
              }
            }
            
            console.log('🔍 FINAL CONTENT TO DISPLAY:', content);
            return content || 'No description provided for this discussion.';
          })()}
        </div>
      </div>

      {/* Replies Section */}
      {replies.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#1a1a1a', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Replies ({replies.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {replies.map((post) => (

              <div key={post._id} style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {(() => {
                        console.log('🔍 Author data for initials:', {
                          author: post.author,
                          authorType: typeof post.author,
                          isObject: typeof post.author === 'object',
                          authorKeys: typeof post.author === 'object' ? Object.keys(post.author) : null
                        });
                        return getAuthorInitials(post.author || 'Anonymous');
                      })()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{getAuthorName(post.author)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{formatDate(post.createdAt)}</div>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                    <MoreVert />
                  </button>
                </div>
                
                <div style={{ color: '#374151', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {post.content}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => handleLikePost(post._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: likedPosts.has(post._id) ? '#dbeafe' : 'transparent',
                      color: likedPosts.has(post._id) ? '#3b82f6' : '#6b7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ThumbUp style={{ fontSize: '1rem' }} />
                    Like
                    {post.likes > 0 && <span>({post.likes})</span>}
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('🔄 Opening reply form for post:', post._id);
                      setReplyingTo(post._id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Reply style={{ fontSize: '1rem' }} />
                    Reply
                  </button>
                </div>
                
                {/* Reply Form */}
                {replyingTo === post._id && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleReplyToPost(post._id);
                    }}
                    style={{ 
                      marginTop: '1rem', 
                      padding: '1rem', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '6px', 
                      border: '1px solid #e5e7eb' 
                    }}
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${getAuthorName(post.author)}...`}
                      disabled={loading}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          console.log('🔄 Closing reply form for post:', post._id);
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading || !replyText.trim()}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: loading || !replyText.trim() ? '#9ca3af' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          cursor: loading || !replyText.trim() ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loading ? 'Posting...' : 'Post Reply'}
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Nested Replies */}
                {post.replies && post.replies.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid #e5e7eb' }}>
                    {post.replies.map((nestedReply) => (
                      <div key={nestedReply._id} style={{ 
                        marginBottom: '0.75rem', 
                        padding: '1rem', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '6px', 
                        border: '1px solid #e5e7eb' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {(() => {
                              console.log('🔍 Nested reply author data for initials:', {
                                author: nestedReply.author,
                                authorType: typeof nestedReply.author,
                                isObject: typeof nestedReply.author === 'object',
                                authorKeys: typeof nestedReply.author === 'object' ? Object.keys(nestedReply.author) : null
                              });
                              return getAuthorInitials(nestedReply.author || 'Anonymous');
                            })()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{getAuthorName(nestedReply.author)}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{formatDate(nestedReply.createdAt)}</div>
                          </div>
                        </div>
                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#374151' }}>
                          {nestedReply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        )}

      {/* Main Reply Input Form */}
      <div style={{ 
        marginTop: '2rem', 
        padding: window.innerWidth <= 768 ? '1rem' : '1.5rem', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <h3 style={{ 
          color: '#1a1a1a', 
          fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem' 
        }}>
          Add Your Reply
        </h3>
        <form onSubmit={handleSubmitReply}>
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Share your thoughts on this discussion..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: window.innerWidth <= 768 ? '100px' : '120px',
              padding: window.innerWidth <= 768 ? '0.75rem' : '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
              marginBottom: '1rem',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              maxWidth: '100%',
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
              overflowX: 'hidden'
            }}
          />
          <div style={{ 
            display: 'flex', 
            gap: window.innerWidth <= 768 ? '0.5rem' : '1rem', 
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <button 
              type="submit" 
              disabled={loading || !newReply.trim()}
              style={{
                padding: window.innerWidth <= 768 ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                backgroundColor: loading || !newReply.trim() ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                fontWeight: '600',
                cursor: loading || !newReply.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                minWidth: window.innerWidth <= 768 ? 'auto' : '120px'
              }}
            >
              {loading ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} // Closing brace for DiscussionComponent

function ModuleContentInner() {
  // Add render counter to detect infinite re-renders
  if (!window.moduleContentRenderCount) {
    window.moduleContentRenderCount = 0;
  }
  window.moduleContentRenderCount++;
  console.log(`🔄 ModuleContent render #${window.moduleContentRenderCount}`);
  
  const { courseId, moduleId, resourceId, assessmentId, quizId, discussionId } = useParams();
  const navigate = useNavigate();
  
  // Check if this is a content-only route and redirect if no actual content
  useEffect(() => {
    const checkForContent = async () => {
      // Only check for content routes (not video, quiz, assessment, etc.)
      if (window.location.pathname.includes('/content') && !window.location.pathname.includes('/content-item')) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const moduleData = data.data?.module;
            
            // Check if there's actual content
            const hasContent = moduleData?.content && 
              typeof moduleData.content === 'string' &&
              moduleData.content.trim() && 
              moduleData.content !== '[]' && 
              moduleData.content !== 'null' &&
              moduleData.content !== '""';
            
            if (!hasContent) {
              console.log('⚠️ No actual content found, redirecting to course overview');
              navigate(`/instructor/courses/${courseId}/overview`);
              return;
            }
          }
        } catch (error) {
          console.error('❌ Error checking module content:', error);
          // Redirect on error to be safe
          navigate(`/instructor/courses/${courseId}/overview`);
          return;
        }
      }
    };
    
    checkForContent();
  }, [courseId, moduleId, navigate]);
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedItems, setCompletedItems] = useState(new Set());
  // Removed showCompletionModal state - no more pop-ups
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [quizSubmissionData, setQuizSubmissionData] = useState({});

  // Initialize offline integration service
  useEffect(() => {
    const initializeOfflineService = async () => {
      try {
        console.log('🔧 Initializing offline integration service for ModuleContent...');
        await offlineIntegrationService.initialize();
        console.log('✅ Offline integration service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize offline integration service:', error);
      }
    };
    
    initializeOfflineService();
  }, []);

  // Helper function to get the correct course overview path based on user role
  const getCourseOverviewPath = () => {
    if (userRole === 'instructor') {
      return `/instructor/courses/${courseId}/overview`;
    } else {
      return `/courses/${courseId}/overview`;
    }
  };

  useEffect(() => {
    console.log('🔄 ModuleContent useEffect triggered - checking for infinite loop');
    
    // Get user role from localStorage or token with better debugging
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const detectedRole = user.role || 'refugee';
    
    console.log('🔍 USER ROLE DEBUG:', {
      userStr,
      user,
      detectedRole,
      willSetUserRole: detectedRole
    });
    
    setUserRole(detectedRole);
    
    // Add real-time debugging for URL parameters
    console.log('🔄 ModuleContent component loading with URL params:', {
      courseId,
      moduleId,
      quizId,
      discussionId,
      resourceId,
      assessmentId,
      userRole: detectedRole,
      currentURL: window.location.href,
      urlPath: window.location.pathname
    });
    
    // Add a flag to prevent multiple simultaneous calls
    if (window.moduleContentLoading) {
      console.log('⚠️ ModuleContent already loading, skipping...');
      return;
    }
    
    window.moduleContentLoading = true;
    
    fetchCourseAndModule();
    
    // Call fetchCompletionStatus after a short delay to ensure courseId and moduleId are available
    setTimeout(() => {
      console.log('⏰ Delayed fetchCompletionStatus call');
      fetchCompletionStatus();
    }, 1000);
    
    // Add debugging function to window for manual testing
    window.debugModuleContent = () => {
      console.log('🔍 Module Content Debug Info:', {
        courseId,
        moduleId,
        quizId,
        discussionId,
        course: course ? 'Loaded' : 'Not loaded',
        module: module ? 'Loaded' : 'Not loaded',
        contentItems: contentItems.length,
        currentContent: currentContent ? currentContent.type : 'None',
        currentIndex,
        loading,
        error
      });
      
      if (module) {
        console.log('📚 Module Details:', {
          title: module.title,
          hasQuizzes: module.quizzes ? true : false,
          quizzesCount: module.quizzes?.length || 0,
          hasDiscussions: module.discussions ? true : false,
          discussionsCount: module.discussions?.length || 0,
          quizzes: module.quizzes || [],
          discussions: module.discussions || []
        });
      }
      
      if (contentItems.length > 0) {
        console.log('📋 Content Items:', contentItems.map((item, idx) => ({
          index: idx,
          type: item.type,
          title: item.title,
          hasData: !!item.data,
          dataType: typeof item.data
        })));
      }
      
      return {
        status: 'Debug info logged to console',
        hasContent: contentItems.length > 0,
        currentContentType: currentContent?.type || 'none'
      };
    };
    
    // Add function to manually test completion status
    window.testCompletionStatus = async () => {
      console.log('🧪 Manual completion status test');
      await fetchCompletionStatus();
    };
    
    // Add enhanced function to test backend data directly
    window.testBackendData = async () => {
      const token = localStorage.getItem('token');
      try {
        console.log('🔍 Testing backend data for course:', courseId);
        
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const course = data.data.course;
          const module = course.modules.find(m => m._id === moduleId);
          
          console.log('📊 Backend Data Test Results:');
          console.log('Course Title:', course.title);
          console.log('Total Modules:', course.modules.length);
          console.log('Module Found:', module ? 'Yes' : 'No');
          
          if (module) {
            console.log('Module Title:', module.title);
            console.log('Module Content Summary:', {
              description: !!module.description,
              content: !!module.content,
              video: !!module.videoUrl,
              resources: module.resources?.length || 0,
              assessments: module.assessments?.length || 0,
              quizzes: module.quizzes?.length || 0,
              discussions: module.discussions?.length || 0
            });
            
            if (module.quizzes && module.quizzes.length > 0) {
              console.log('📝 Quiz Details:');
              module.quizzes.forEach((quiz, idx) => {
                console.log(`  Quiz ${idx + 1}:`, {
                  id: quiz._id,
                  title: quiz.title,
                  type: quiz.type,
                  hasQuestions: quiz.questions ? true : false,
                  questionCount: quiz.questions?.length || 0,
                  instructorId: quiz.instructorId,
                  courseId: quiz.courseId,
                  sampleQuestion: quiz.questions?.[0]?.question || 'No questions'
                });
              });
            }
            
            if (module.discussions && module.discussions.length > 0) {
              console.log('💬 Discussion Details:');
              module.discussions.forEach((discussion, idx) => {
                console.log(`  Discussion ${idx + 1}:`, {
                  id: discussion._id,
                  title: discussion.title,
                  type: discussion.type,
                  hasContent: !!discussion.content,
                  contentPreview: discussion.content ? discussion.content.substring(0, 100) + '...' : 'No content',
                  instructorId: discussion.instructorId,
                  courseId: discussion.courseId,
                  hasReplies: discussion.replies ? true : false,
                  replyCount: discussion.replies?.length || 0
                });
              });
            }
            
            // Test content accessibility
            const testResults = {
              canAccessQuizzes: module.quizzes?.length > 0 && module.quizzes.every(q => q._id && q.title),
              canAccessDiscussions: module.discussions?.length > 0 && module.discussions.every(d => d._id && d.title),
              contentIssues: []
            };
            
            if (module.quizzes?.length > 0) {
              module.quizzes.forEach((quiz, idx) => {
                if (!quiz.questions || quiz.questions.length === 0) {
                  testResults.contentIssues.push(`Quiz ${idx + 1} (${quiz.title}) has no questions`);
                }
              });
            }
            
            if (module.discussions?.length > 0) {
              module.discussions.forEach((discussion, idx) => {
                if (!discussion.content || typeof discussion.content !== 'string' || discussion.content.trim() === '') {
                  testResults.contentIssues.push(`Discussion ${idx + 1} (${discussion.title}) has no content`);
                }
              });
            }
            
            console.log('🔬 Content Accessibility Test:', testResults);
            
            return {
              success: true,
              hasQuizzes: module.quizzes?.length > 0,
              hasDiscussions: module.discussions?.length > 0,
              contentAccessible: testResults.canAccessQuizzes || testResults.canAccessDiscussions,
              issues: testResults.contentIssues,
              message: 'Check console for detailed results'
            };
          } else {
            console.error('Module not found in course data');
            return { success: false, error: 'Module not found' };
          }
        } else {
          console.error('Failed to fetch backend data:', response.status);
          return { success: false, error: 'Failed to fetch data' };
        }
      } catch (error) {
        console.error('Error testing backend data:', error);
        return { success: false, error: error.message };
      }
    };
    
    // Add debug function to test quiz data
    const debugQuizData = () => {
      console.log('🔍 DEBUG QUIZ DATA:');
      console.log('Course:', course);
      console.log('Module:', module);
      console.log('Content Items:', contentItems);
      console.log('Current Content:', currentContent);
      console.log('Current Index:', currentIndex);
      
      if (module && module.quizzes) {
        console.log('📚 Module Quizzes:', module.quizzes);
        module.quizzes.forEach((quiz, index) => {
          console.log(`Quiz ${index + 1}:`, {
            id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            hasQuestions: !!quiz.questions,
            questionCount: quiz.questions?.length || 0,
            instructorId: quiz.instructorId,
            courseId: quiz.courseId,
            sampleQuestion: quiz.questions?.[0]?.question || 'No questions'
          });
        });
      }
      
      // Test API call to get quiz data
      const testQuizAPI = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:', data);
            
            if (data.success && data.data && data.data.course) {
              const courseData = data.data.course;
              const moduleData = courseData.modules?.find(m => m._id === moduleId);
              console.log('📚 Module from API:', moduleData);
              
              if (moduleData && moduleData.quizzes) {
                console.log('🎯 Quizzes from API:', moduleData.quizzes);
              }
            }
          } else {
            console.error('❌ API Error:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('❌ API Call Error:', error);
        }
      };
      
      testQuizAPI();
    };

    // Add debug functions to window for easy access
    window.debugQuizData = debugQuizData;
    // Debug functions will be assigned later when they're defined
    // window.debugInstructorQuizAccess = debugInstructorQuizAccess; // Removed to prevent initialization error
    
    // Cleanup function to reset the loading flag and clear any pending API calls
    return () => {
      window.moduleContentLoading = false;
      // Clear any pending API calls for this component
      releaseApiCall(`/api/courses/${courseId}`);
      releaseApiCall(`/api/courses/${courseId}/progress`);
      console.log('🧹 ModuleContent useEffect cleanup - reset loading flag and cleared API calls');
    };
  }, [courseId, moduleId, quizId, discussionId, resourceId, assessmentId]);

  // Update currentContent when contentItems or currentIndex changes
  useEffect(() => {
    if (contentItems.length > 0 && currentIndex >= 0 && currentIndex < contentItems.length) {
      setCurrentContent(contentItems[currentIndex]);
      console.log('🔄 Updated current content:', {
        index: currentIndex,
        type: contentItems[currentIndex].type,
        title: contentItems[currentIndex].title
      });
    }
  }, [contentItems, currentIndex]);

  // Refresh completion status when current content changes
  useEffect(() => {
    if (currentContent && courseId) {
      console.log('🔄 Current content changed, refreshing completion status');
      fetchCompletionStatus();
    }
  }, [currentContent, currentIndex, courseId]);

  // Handle content navigation (for quiz completion screen)
  const handleContentNavigation = (targetIndex) => {
    if (targetIndex >= 0 && targetIndex < contentItems.length) {
      setCurrentIndex(targetIndex);
      setCurrentContent(contentItems[targetIndex]);
      console.log('🔄 Navigated to content item:', targetIndex, contentItems[targetIndex].type, contentItems[targetIndex].title);
    }
  };

  // Manual completion only - no auto-completion

  const fetchCourseAndModule = async () => {
    const endpoint = `/api/courses/${courseId}`;
    
    // Use global API call limiter
    if (!isApiCallAllowed(endpoint)) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let courseData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('�� Online mode: Fetching course and module data from API...');
          
          const response = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.course) {
              courseData = data.data.course;
              console.log('✅ Course and module data received');
              
              // Store course data for offline use
              await offlineIntegrationService.storeCourseData(courseId, courseData);
            } else {
              throw new Error('Invalid course data received');
            }
          } else {
            throw new Error('Failed to fetch course data');
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
        console.log('📴 Offline mode: Using offline course and module data...');
        console.log('🔍 Course ID for offline lookup:', courseId);
        courseData = await offlineIntegrationService.getCourseData(courseId);
        console.log('🔍 Offline course data result:', courseData ? 'Found' : 'Not found');
        
        if (!courseData) {
          // Try to fetch from Service Worker cache without authentication
          try {
            console.log('🔍 Trying to fetch course data from Service Worker cache...');
            const response = await fetch(`/api/courses/${courseId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data && data.data.course) {
                courseData = data.data.course;
                console.log('✅ Course data retrieved from Service Worker cache');
                // Store for future offline access
                await offlineIntegrationService.storeCourseData(courseId, courseData);
              }
            }
          } catch (swError) {
            console.warn('⚠️ Service Worker cache fetch failed:', swError);
          }
          
          if (!courseData) {
            setError('This course is not available offline. Please visit this course while online at least once to cache it for offline access. You can visit the Dashboard or Browse Courses page while online to automatically cache all courses.');
            setLoading(false);
            return;
          }
        }
      }

      if (courseData) {
        setCourse(courseData);
        
        // First try to get the module from course data
        let foundModule = courseData.modules.find(m => m._id === moduleId);
        
        // If module found and we're online, try to fetch populated data from module endpoint
        if (foundModule && isOnline && token) {
          try {
            console.log('🔍 Fetching populated module data for:', moduleId);
            const moduleResponse = await fetch(`/api/courses/modules/${moduleId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (moduleResponse.ok) {
              const moduleData = await moduleResponse.json();
              if (moduleData.success && moduleData.data && moduleData.data.module) {
                console.log('✅ Populated module data received:', {
                  title: moduleData.data.module.title,
                  quizzesCount: moduleData.data.module.quizzes?.length || 0,
                  discussionsCount: moduleData.data.module.discussions?.length || 0
                });
                foundModule = moduleData.data.module;
              } else {
                console.warn('⚠️ Module endpoint returned invalid data, using course data');
              }
            } else {
              console.warn('⚠️ Module endpoint failed, using course data');
            }
          } catch (moduleError) {
            console.warn('⚠️ Error fetching populated module data:', moduleError);
          }
          
          setModule(foundModule);
          
          // Build content items array
          const items = [];
          
          // Add description first (like in StudentCourseOverview)
          if (foundModule.description) {
            items.push({
              type: 'description',
              title: 'Module Description',
              data: foundModule.description,
              icon: Description
            });
          }
          

          
          if (foundModule.content && 
              typeof foundModule.content === 'string' &&
              foundModule.content.trim() && 
              foundModule.content !== '[]' && 
              foundModule.content !== 'null' && 
              foundModule.content !== '""' &&
              foundModule.content.length > 10) {
            items.push({
              type: 'content',
              title: 'Content',
              data: foundModule.content,
              icon: Description
            });
          }
          
          if (foundModule.videoUrl) {
            items.push({
              type: 'video',
              title: foundModule.videoTitle || 'Video Lecture',
              data: { url: foundModule.videoUrl, title: foundModule.videoTitle },
              icon: VideoLibrary
            });
          }
          
          if (foundModule.resources) {
            foundModule.resources.forEach((resource, idx) => {
              items.push({
                type: 'resource',
                title: resource.title || `Resource ${idx + 1}`,
                data: resource,
                icon: Link
              });
            });
          }
          
          // Process contentItems (articles, files, etc.)
          if (foundModule.contentItems && Array.isArray(foundModule.contentItems)) {
            console.log('📄 Processing contentItems:', foundModule.contentItems.length);
            foundModule.contentItems.forEach((contentItem, idx) => {
              console.log('📄 Content item:', {
                index: idx,
                type: contentItem.type,
                title: contentItem.title,
                url: contentItem.url,
                fileUrl: contentItem.fileUrl,
                publicUrl: contentItem.publicUrl,
                fileName: contentItem.fileName,
                description: contentItem.description,
                fullData: contentItem
              });
              
              items.push({
                type: contentItem.type || 'article',
                title: contentItem.title || `Content ${idx + 1}`,
                data: contentItem,
                icon: contentItem.type === 'article' ? Article : 
                      contentItem.type === 'video' ? VideoLibrary :
                      contentItem.type === 'audio' ? AudioFile :
                      contentItem.type === 'file' ? AttachFile : Article
              });
            });
          } else {
            console.log('📄 No contentItems found in module');
          }
          
          // Count assessments and quizzes for proper numbering
          let assessmentCount = 0;
          let quizCount = 0;
          
          if (foundModule.assessments) {
            foundModule.assessments.forEach((assessment, idx) => {
              assessmentCount++;
              items.push({
                type: 'assessment',
                title: assessment.title || `Assessment ${assessmentCount}`,
                data: assessment,
                icon: Assignment
              });
            });
          }
          
          if (foundModule.quizzes) {
            console.log('✅ Found quizzes:', foundModule.quizzes.length);
            console.log('🧠 Quiz details:', foundModule.quizzes.map(q => ({
              id: q._id,
              title: q.title,
              hasQuestions: !!q.questions && q.questions.length > 0,
              questionCount: q.questions?.length || 0,
              type: q.type,
              isString: typeof q === 'string',
              isObject: typeof q === 'object',
              fullData: q
            })));
            
            // Also check if quizzes might be stored in a different property
            console.log('🔍 Checking for alternative quiz storage...');
            console.log('Module keys:', Object.keys(foundModule));
            console.log('Module quiz property type:', typeof foundModule.quizzes);
            console.log('Module quiz property value:', foundModule.quizzes);
            
            // Check if quizzes array is empty or undefined
            if (foundModule.quizzes.length === 0) {
              console.warn('⚠️ Module has empty quizzes array');
            }
            
            // Check if quizzes are just IDs or full objects
            const hasFullQuizData = foundModule.quizzes.some(q => q.questions && q.questions.length > 0);
            console.log('🔍 Quiz data analysis:', {
              totalQuizzes: foundModule.quizzes.length,
              hasFullQuizData,
              quizTypes: foundModule.quizzes.map(q => typeof q),
              firstQuiz: foundModule.quizzes[0]
            });
            
            // Fetch full quiz data for each quiz
            for (let idx = 0; idx < foundModule.quizzes.length; idx++) {
              const quizRef = foundModule.quizzes[idx];
              quizCount++;
              
              try {
                // If quizRef is just an ID, fetch the full quiz data
                let fullQuizData = quizRef;
                
                if (typeof quizRef === 'string' || (quizRef && !quizRef.questions)) {
                  console.log('🔄 Fetching full quiz data for:', quizRef._id || quizRef);
                  
                  // Use different endpoint based on user role
                  const endpoint = userRole === 'instructor' || userRole === 'admin' 
                    ? `/api/instructor/quizzes/${quizRef._id || quizRef}`
                    : `/api/instructor/quizzes/${quizRef._id || quizRef}/student`;
                  
                  const quizResponse = await fetch(endpoint, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  
                  if (quizResponse.ok) {
                    const quizData = await quizResponse.json();
                    if (quizData.success && quizData.data) {
                      fullQuizData = quizData.data.quiz || quizData.data;
                      console.log('✅ Fetched full quiz data:', fullQuizData.title);
                    } else {
                      console.warn('⚠️ Quiz API response not successful:', quizData);
                      fullQuizData = quizRef; // Fall back to original data
                    }
                  } else {
                    console.warn('⚠️ Failed to fetch quiz data:', quizResponse.status);
                    fullQuizData = quizRef; // Fall back to original data
                  }
                }
                
              console.log('📄 Processing quiz:', {
                index: idx,
                quizNumber: quizCount,
                  title: fullQuizData.title,
                  id: fullQuizData._id,
                  hasQuestions: !!fullQuizData.questions && fullQuizData.questions.length > 0,
                  questionCount: fullQuizData.questions?.length || 0,
                  dueDate: fullQuizData.dueDate,
                  hasDueDate: !!fullQuizData.dueDate,
                  allFields: Object.keys(fullQuizData)
              });
              
              // Debug: Log the actual quiz data being passed
              console.log('🔍 FULL QUIZ DATA BEING PASSED TO QUIZTAKER:', {
                quizId: fullQuizData._id,
                title: fullQuizData.title,
                questions: fullQuizData.questions?.map((q, qIdx) => ({
                  question: q.question,
                  type: q.type,
                  correctAnswer: q.correctAnswer,
                  options: q.options
                })) || []
              });
              
              items.push({
                type: 'quiz',
                  title: fullQuizData.title || `Quiz ${quizCount}`,
                  data: fullQuizData,
                icon: Quiz
              });
                
              } catch (quizError) {
                console.error('❌ Error fetching quiz data:', quizError);
                console.error('🔍 Quiz error details:', {
                  quizRef: quizRef,
                  quizId: quizRef._id || quizRef,
                  errorMessage: quizError.message,
                  errorStack: quizError.stack
                });
                // Add quiz with available data
                items.push({
                  type: 'quiz',
                  title: quizRef.title || `Quiz ${quizCount}`,
                  data: quizRef,
                  icon: Quiz
                });
              }
            }
          } else {
            console.warn('⚠️ Module has no quizzes property or quizzes is null/undefined');
            console.log('🔍 Module properties:', Object.keys(foundModule));
            
            // Check if quizzes might be stored as a JSON string
            if (foundModule.quizData) {
              console.log('🔍 Found quizData property, attempting to parse...');
              try {
                const parsedQuizzes = typeof foundModule.quizData === 'string' 
                  ? JSON.parse(foundModule.quizData) 
                  : foundModule.quizData;
                
                if (Array.isArray(parsedQuizzes) && parsedQuizzes.length > 0) {
                  console.log('✅ Found quizzes in quizData property:', parsedQuizzes.length);
                  
                  // Process the parsed quizzes
                  for (let idx = 0; idx < parsedQuizzes.length; idx++) {
                    const quizRef = parsedQuizzes[idx];
                    quizCount++;
                    
                    try {
                      let fullQuizData = quizRef;
                      
                      if (typeof quizRef === 'string' || (quizRef && !quizRef.questions)) {
                        console.log('🔄 Fetching full quiz data for:', quizRef._id || quizRef);
                        
                        const endpoint = userRole === 'instructor' || userRole === 'admin' 
                          ? `/api/instructor/quizzes/${quizRef._id || quizRef}`
                          : `/api/instructor/quizzes/${quizRef._id || quizRef}/student`;
                        
                        const quizResponse = await fetch(endpoint, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        
                        if (quizResponse.ok) {
                          const quizData = await quizResponse.json();
                          if (quizData.success && quizData.data) {
                            fullQuizData = quizData.data.quiz || quizData.data;
                            console.log('✅ Fetched full quiz data:', fullQuizData.title);
                          } else {
                            fullQuizData = quizRef;
                          }
                        } else {
                          fullQuizData = quizRef;
                        }
                      }
                      
                      items.push({
                        type: 'quiz',
                        title: fullQuizData.title || `Quiz ${quizCount}`,
                        data: fullQuizData,
                        icon: Quiz
                      });
                      
                    } catch (quizError) {
                      console.error('❌ Error processing quiz from quizData:', quizError);
                      items.push({
                        type: 'quiz',
                        title: quizRef.title || `Quiz ${quizCount}`,
                        data: quizRef,
                        icon: Quiz
                      });
                    }
                  }
                }
              } catch (parseError) {
                console.error('❌ Error parsing quizData:', parseError);
              }
            }
          }
          
          if (foundModule.discussions) {
            console.log('🔍 DISCUSSIONS DEBUG - Found discussions:', foundModule.discussions.length);
            console.log('🔍 DISCUSSIONS DEBUG - Discussion details:', foundModule.discussions.map(d => ({
              _id: d._id,
              title: d.title,
              content: d.content,
              moduleId: d.moduleId
            })));
            
            foundModule.discussions.forEach((discussion, idx) => {
              console.log('🔍 DISCUSSIONS DEBUG - Adding discussion to items:', {
                index: idx,
                title: discussion.title,
                content: discussion.content,
                type: typeof discussion.content
              });
              
              items.push({
                type: 'discussion',
                title: discussion.title || `Discussion ${idx + 1}`,
                data: discussion,
                icon: Forum
              });
            });
          } else {
            console.log('🔍 DISCUSSIONS DEBUG - No discussions found in module');
          }
          
          console.log('🔍 CONTENT ITEMS DEBUG - Final items array:', items.map(item => ({
            type: item.type,
            title: item.title,
            hasData: !!item.data,
            dataKeys: item.data ? Object.keys(item.data) : []
          })));
          
          setContentItems(items);
          
          // Determine initial content based on URL parameters
          let initialIndex = 0;
          let initialContent = items[0];
          
          // Check URL for specific content navigation
          const pathParts = window.location.pathname.split('/');
          const quizIndex = pathParts.findIndex(part => part === 'quiz');
          const discussionIndex = pathParts.findIndex(part => part === 'discussion');
          const assessmentIndex = pathParts.findIndex(part => part === 'assessment');
          const resourceIndex = pathParts.findIndex(part => part === 'resource');
          const contentIndex = pathParts.findIndex(part => part === 'content');
          
          console.log('🔍 URL PARSING DEBUG:', {
            fullPath: window.location.pathname,
            pathParts,
            quizIndex,
            discussionIndex,
            assessmentIndex,
            resourceIndex,
            contentIndex,
            isInstructorRoute: pathParts.includes('instructor'),
            userRole,
            quizIndexValue: quizIndex !== -1 && quizIndex + 1 < pathParts.length ? pathParts[quizIndex + 1] : 'N/A',
            availableQuizItems: items.filter(item => item.type === 'quiz').length
          });
          
          console.log('🔍 URL Analysis for initial content:', {
            pathParts,
            quizIndex,
            discussionIndex,
            assessmentIndex,
            resourceIndex,
            contentIndex,
            totalItems: items.length,
            currentPath: window.location.pathname
          });
          
          // If URL ends with /content, show the actual content (not quiz)
          if (contentIndex !== -1 && contentIndex === pathParts.length - 1) {
            console.log('🎯 URL ends with /content - looking for actual content');
            
            // Find first content item (description or content type)
            const firstContentIndex = items.findIndex(item => item.type === 'content' || item.type === 'description');
            if (firstContentIndex !== -1) {
              initialIndex = firstContentIndex;
              initialContent = items[firstContentIndex];
              console.log('✅ Found content at index', firstContentIndex, 'for /content URL:', items[firstContentIndex].type);
            } else {
              // If no content, find first video
              const firstVideoIndex = items.findIndex(item => item.type === 'video');
              if (firstVideoIndex !== -1) {
                initialIndex = firstVideoIndex;
                initialContent = items[firstVideoIndex];
                console.log('✅ Found video content at index', firstVideoIndex, 'for /content URL');
              } else {
                // If no video, find first resource
                const firstResourceIndex = items.findIndex(item => item.type === 'resource');
                if (firstResourceIndex !== -1) {
                  initialIndex = firstResourceIndex;
                  initialContent = items[firstResourceIndex];
                  console.log('✅ Found resource content at index', firstResourceIndex, 'for /content URL');
                } else {
                  // Fall back to first item
                  console.log('⚠️ No content found, falling back to first item');
                }
              }
            }
          }
          
          if (quizIndex !== -1 && quizIndex + 1 < pathParts.length) {
            const quizIdentifier = pathParts[quizIndex + 1];
            console.log('🎯 Quiz identifier from URL:', quizIdentifier);
            console.log('👨‍🏫 Instructor quiz access check:', {
              userRole,
              isInstructorRoute: pathParts.includes('instructor'),
              quizIdentifier,
              pathParts
            });
            
            // Try to find quiz by ID first, then by index
            const quizItems = items.filter(item => item.type === 'quiz');
            console.log('📝 Available quiz items:', quizItems.length);
            
            // First, try to find by quiz ID
            let foundQuizIndex = -1;
            for (let i = 0; i < items.length; i++) {
              if (items[i].type === 'quiz' && items[i].data && items[i].data._id === quizIdentifier) {
                foundQuizIndex = i;
                console.log('✅ Found quiz by ID:', quizIdentifier, 'at position', i);
                break;
              }
            }
            
            // If not found by ID, try by index (for backward compatibility)
            if (foundQuizIndex === -1) {
              const quizIndexValue = parseInt(quizIdentifier);
              if (!isNaN(quizIndexValue)) {
                console.log('🔍 Trying to find quiz by index:', quizIndexValue);
                let quizCount = 0;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type === 'quiz') {
                    if (quizCount === quizIndexValue) {
                      foundQuizIndex = i;
                      console.log('✅ Found quiz at index', quizIndexValue, 'in content items at position', i);
                      break;
                    }
                    quizCount++;
                  }
                }
              }
            }
            
            if (foundQuizIndex !== -1) {
              initialIndex = foundQuizIndex;
              initialContent = items[foundQuizIndex];
              console.log('👨‍🏫 Instructor will see quiz:', {
                title: items[foundQuizIndex].title,
                hasQuestions: !!items[foundQuizIndex].data?.questions,
                questionCount: items[foundQuizIndex].data?.questions?.length || 0
              });
            } else {
              console.log('❌ Quiz not found with identifier:', quizIdentifier);
            }
          }
          
          if (discussionIndex !== -1 && discussionIndex + 1 < pathParts.length) {
            const discussionIndexValue = parseInt(pathParts[discussionIndex + 1]);
            console.log('💬 Discussion index from URL:', discussionIndexValue);
            
            if (!isNaN(discussionIndexValue)) {
              // Find discussion by index
              const discussionItems = items.filter(item => item.type === 'discussion');
              console.log('💬 Available discussion items:', discussionItems.length);
              
              if (discussionIndexValue >= 0 && discussionIndexValue < discussionItems.length) {
                // Find the discussion at the specified index
                let discussionCount = 0;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type === 'discussion') {
                    if (discussionCount === discussionIndexValue) {
                      initialIndex = i;
                      initialContent = items[i];
                      console.log('✅ Found discussion at index', discussionIndexValue, 'in content items at position', i);
                      console.log('💬 Discussion content:', {
                        title: items[i].title,
                        hasContent: !!items[i].data?.content,
                        contentLength: items[i].data?.content?.length || 0
                      });
                      break;
                    }
                    discussionCount++;
                  }
                }
              } else {
                console.log('❌ Discussion index out of range:', discussionIndexValue, 'available discussions:', discussionItems.length);
              }
            }
          }
          
          if (items.length > 0) {
            console.log('🔍 CONTENT SELECTION DEBUG:', {
              totalItems: items.length,
              availableTypes: items.map(item => item.type),
              quizItems: items.filter(item => item.type === 'quiz').map(item => ({ title: item.title, index: items.indexOf(item) })),
              discussionItems: items.filter(item => item.type === 'discussion').map(item => ({ title: item.title, index: items.indexOf(item) })),
              initialIndex: initialIndex,
              initialContentType: initialContent?.type,
              initialContentTitle: initialContent?.title,
              urlHasQuiz: quizIndex !== -1,
              urlHasDiscussion: discussionIndex !== -1,
              quizIndexValue: quizIndex !== -1 && quizIndex + 1 < pathParts.length ? pathParts[quizIndex + 1] : 'N/A',
              discussionIndexValue: discussionIndex !== -1 && discussionIndex + 1 < pathParts.length ? pathParts[discussionIndex + 1] : 'N/A'
            });
            
            setCurrentIndex(initialIndex);
            setCurrentContent(initialContent);
            console.log('✅ Set initial content based on URL:', initialContent.type, initialContent.title, 'at index:', initialIndex);
            
            // Special check for instructor quiz access
            if (userRole === 'instructor' && quizIndex !== -1 && initialContent.type !== 'quiz') {
              console.log('⚠️ Instructor accessed quiz URL but got:', initialContent.type);
              console.log('🔍 Available content types:', items.map(item => item.type));
              console.log('🔍 Quiz items:', items.filter(item => item.type === 'quiz').map(item => item.title));
            }
          } else {
            console.log('⚠️ No content items available');
            setCurrentIndex(0);
            setCurrentContent(null);
          }
        } else {
          setError('Module not found in course');
        }
      } else {
        setError('Course not found');
      }
    } catch (error) {
      console.error('❌ Error fetching course and module:', error);
      setError(error.message || 'Failed to load course content');
    } finally {
      setLoading(false);
      // Release the API call
      releaseApiCall(endpoint);
      console.log('✅ fetchCourseAndModule completed, released API call');
    }
  };

  const fetchQuizSubmissionData = async (quizId) => {
    if (!quizId) return null;
    
    try {
      const token = localStorage.getItem('token');
      let foundSubmission = null;
      
      // Try multiple methods to find submission data
      const methods = [
        // Method 1: Quiz sessions
        async () => {
          try {
            const response = await fetch(`/api/quiz-sessions/${quizId}/completion-status`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.isCompleted) {
                return {
                  score: data.data.score,
                  timeSpent: data.data.timeSpent,
                  submittedAt: data.data.completedAt,
                  answers: data.data.answers
                };
              }
            }
          } catch (error) {
            console.log('Session check failed:', error.message);
          }
          return null;
        },
        
        // Method 2: User quiz sessions
        async () => {
          try {
            const response = await fetch(`/api/quiz-sessions/user/${quizId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.sessions) {
                const completedSession = data.data.sessions.find(s => s.status === 'completed');
                if (completedSession) {
                  return {
                    score: completedSession.score,
                    timeSpent: completedSession.timeSpent,
                    submittedAt: completedSession.submittedAt,
                    answers: completedSession.answers
                  };
                }
              }
            }
          } catch (error) {
            console.log('User sessions check failed:', error.message);
          }
          return null;
        },
        
        // Method 3: Course submissions
        async () => {
          try {
            const response = await fetch(`/api/courses/${courseId}/submissions?assessmentId=${quizId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.submissions?.length > 0) {
                const submission = data.data.submissions[0];
                return {
                  score: submission.score,
                  timeSpent: submission.timeSpent,
                  submittedAt: submission.submittedAt,
                  answers: submission.answers
                };
              }
            }
          } catch (error) {
            console.log('Course submissions check failed:', error.message);
          }
          return null;
        }
      ];
      
      // Try each method until we find submission data
      for (const method of methods) {
        foundSubmission = await method();
        if (foundSubmission) {
          console.log('✅ Found quiz submission data for', quizId, ':', foundSubmission);
          break;
        }
      }
      
      return foundSubmission;
    } catch (error) {
      console.error('❌ Error fetching quiz submission data:', error);
      return null;
    }
  };

  const fetchCompletionStatus = async () => {
    console.log('🚀 fetchCompletionStatus called with:', { courseId, moduleId });
    
    if (!courseId || !moduleId) {
      console.log('❌ Missing courseId or moduleId:', { courseId, moduleId });
      return;
    }
    
    const endpoint = `/api/courses/${courseId}/progress`;
    const isOnline = navigator.onLine;
    
    console.log('🌐 Network status for progress fetch:', isOnline ? 'online' : 'offline');
    
    // Use global API call limiter
    if (!isApiCallAllowed(endpoint)) {
      console.log('🚫 API call blocked by limiter');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (isOnline && token) {
        // Online mode - try to fetch from API
        console.log('🔍 Making API call to:', `/api/courses/${courseId}/progress`);
        console.log('🔍 Token available:', !!token);
        
        const response = await fetch(`/api/courses/${courseId}/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📊 API response status:', response.status, response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Progress API response:', data);
          
          if (data.success && data.data) {
            const completedSet = new Set();
            // Extract completed items from progress data
            if (data.data.modulesProgress) {
              const moduleProgress = data.data.modulesProgress[moduleId];
              console.log('📊 Module progress for current module:', {
                moduleId,
                moduleProgress,
                allModulesProgress: data.data.modulesProgress
              });
              
              if (moduleProgress && moduleProgress.completedItems) {
                moduleProgress.completedItems.forEach(item => completedSet.add(item));
                console.log('✅ Extracted completed items:', Array.from(completedSet));
              }
            }
            setCompletedItems(completedSet);
            console.log('🔄 Updated completedItems state:', Array.from(completedSet));
            
            // Store progress data for offline use
            await offlineIntegrationService.storeCourseProgress(courseId, data.data);
          }
        }
      } else {
        // Offline mode - load from cache
        console.log('📱 Offline mode: Loading progress from cache');
        
        try {
          const cachedProgress = await offlineIntegrationService.getCourseProgress(courseId);
          if (cachedProgress && cachedProgress.modulesProgress) {
            const moduleProgress = cachedProgress.modulesProgress[moduleId];
            const completedSet = new Set();
            
            if (moduleProgress && moduleProgress.completedItems) {
              moduleProgress.completedItems.forEach(item => completedSet.add(item));
              console.log('📱 Loaded completed items from cache:', Array.from(completedSet));
            }
            
            setCompletedItems(completedSet);
            console.log('🔄 Updated completedItems state from cache:', Array.from(completedSet));
          } else {
            console.log('📱 No cached progress found, trying localStorage fallback...');
            
            // Try localStorage fallback for progress
            try {
              const localStorageProgress = localStorage.getItem(`course_progress_${courseId}`);
              if (localStorageProgress) {
                const parsedProgress = JSON.parse(localStorageProgress);
                if (parsedProgress.modulesProgress && parsedProgress.modulesProgress[moduleId]) {
                  const moduleProgress = parsedProgress.modulesProgress[moduleId];
                  const completedSet = new Set();
                  
                  if (moduleProgress.completedItems) {
                    moduleProgress.completedItems.forEach(item => completedSet.add(item));
                    console.log('📱 Loaded completed items from localStorage:', Array.from(completedSet));
                  }
                  
                  setCompletedItems(completedSet);
                  console.log('🔄 Updated completedItems state from localStorage:', Array.from(completedSet));
                } else {
                  console.log('📱 No module progress in localStorage, using empty set');
                  setCompletedItems(new Set());
                }
              } else {
                console.log('📱 No cached progress found, using empty set');
                setCompletedItems(new Set());
              }
            } catch (localStorageError) {
              console.warn('⚠️ Error accessing localStorage progress:', localStorageError);
              setCompletedItems(new Set());
            }
          }
        } catch (cacheError) {
          console.error('❌ Error loading cached progress:', cacheError);
          setCompletedItems(new Set());
        }
      }
    } catch (err) {
      console.error('❌ Error fetching completion status:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        courseId,
        moduleId
      });
      
      // Fallback to empty set on error
      setCompletedItems(new Set());
    } finally {
      // Release the API call
      releaseApiCall(endpoint);
      console.log('✅ fetchCompletionStatus completed, released API call');
    }
  };

  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;
    
    setIsMarkingComplete(true);
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      const currentItemId = `${currentContent.type}_${currentIndex}`;
      
      console.log('🎯 Marking item as complete:', { currentItemId, isOnline });
      
      let completionSuccess = false;
      
      if (isOnline && token) {
        try {
          const response = await fetch(`/api/courses/${courseId}/progress`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              moduleId: moduleId,
              contentType: currentContent.type,
              itemIndex: currentIndex,
              completionKey: currentItemId,
              completed: true
            })
          });

          if (response.ok) {
            completionSuccess = true;
            console.log('✅ Item marked as complete on server');
          }
        } catch (error) {
          console.warn('⚠️ Online update failed, using offline mode');
        }
      }
      
      // Always update locally
      setCompletedItems(prev => new Set([...prev, currentItemId]));
      
      // Store in offline cache
      try {
        await offlineIntegrationService.storeCourseProgress(courseId, {
          modulesProgress: {
            [moduleId]: {
              completedItems: Array.from(new Set([...completedItems, currentItemId]))
            }
          }
        });
      } catch (error) {
        console.warn('⚠️ Failed to save to offline cache');
      }
      
      // Update localStorage
      const updatedCompletions = [...Array.from(completedItems), currentItemId];
      localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(updatedCompletions));
      
      console.log(completionSuccess ? '✅ Item marked as complete' : '📱 Item marked as complete offline');
      
    } catch (err) {
      console.error('Error marking item as complete:', err);
      alert('Failed to mark item as complete');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const checkAllItemsCompleted = () => {
    const allItemIds = contentItems.map((_, index) => `${contentItems[index].type}_${index}`);
    return allItemIds.every(id => completedItems.has(id));
  };

  const handleNext = () => {
    if (currentIndex < contentItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentContent(contentItems[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentContent(contentItems[prevIndex]);
    }
  };

  const handleMarkCompleteAndNext = async () => {
    const currentItemId = currentContent ? `${currentContent.type}_${currentIndex}` : null;
    const isCurrentItemCompleted = currentItemId ? completedItems.has(currentItemId) : false;
    
    console.log('🔄 handleMarkCompleteAndNext called:', {
      currentItemId,
      isCurrentItemCompleted,
      currentIndex,
      totalItems: contentItems.length,
      isLastItem: currentIndex === contentItems.length - 1
    });
    
    // Mark current item as complete if not already
    if (!isCurrentItemCompleted) {
      await handleMarkComplete();
    }
    
    // Navigate to next item or finish module
    if (currentIndex === contentItems.length - 1) {
      console.log('🏁 Last item reached, navigating back to course overview');
      // Last item - navigate back to course overview to see progress and next module
      let returnUrl;
      if (userRole === 'instructor' || userRole === 'admin') {
        returnUrl = localStorage.getItem('courseOverviewReturnUrl') || `/instructor/courses/${courseId}/overview`;
      } else {
        returnUrl = localStorage.getItem('courseOverviewReturnUrl') || `/courses/${courseId}/overview`;
      }
      navigate(returnUrl);
    } else {
      console.log('➡️ Moving to next item');
      handleNext();
    }
  };

  const handleDirectNavigation = (targetIndex) => {
    console.log('🎯 Direct navigation to item:', targetIndex);
    if (targetIndex >= 0 && targetIndex < contentItems.length) {
      setCurrentIndex(targetIndex);
      setCurrentContent(contentItems[targetIndex]);
      
      // Update URL without page reload
      const targetItem = contentItems[targetIndex];
      let newUrl = `/courses/${courseId}/modules/${moduleId}`;
      
      switch (targetItem.type) {
        case 'description':
          newUrl += '/description';
          break;
        case 'content':
          newUrl += '/content';
          break;
        case 'video':
          newUrl += '/video';
          break;
        case 'quiz':
          newUrl += `/quiz/${targetItem.data._id}`;
          break;
        case 'assessment':
          newUrl += `/assessment/${targetItem.data._id}`;
          break;
        case 'discussion':
          newUrl += `/discussion/${targetItem.data._id}`;
          break;
        case 'resource':
          const resourceIndex = contentItems.slice(0, targetIndex).filter(item => item.type === 'resource').length;
          newUrl += `/resource/${resourceIndex}`;
          break;
        default:
          newUrl += '/content';
      }
      
      // Update URL without triggering page reload
      window.history.pushState({}, '', newUrl);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'description':
        return <Description style={{ fontSize: '1rem' }} />;
      case 'content':
        return <Description style={{ fontSize: '1rem' }} />;
      case 'video':
        return <VideoLibrary style={{ fontSize: '1rem' }} />;
      case 'quiz':
        return <Quiz style={{ fontSize: '1rem' }} />;
      case 'assessment':
        return <Assignment style={{ fontSize: '1rem' }} />;
      case 'discussion':
        return <Forum style={{ fontSize: '1rem' }} />;
      case 'resource':
        return <Link style={{ fontSize: '1rem' }} />;
      case 'article':
        return <Article style={{ fontSize: '1rem' }} />;
      case 'file':
        return <AttachFile style={{ fontSize: '1rem' }} />;
      case 'audio':
        return <AudioFile style={{ fontSize: '1rem' }} />;
      default:
        return <Description style={{ fontSize: '1rem' }} />;
    }
  };

  const renderContent = () => {
    if (!currentContent) {
      console.log('❌ No currentContent available');
      console.log('🔍 Debug info:', {
        contentItems: contentItems.length,
        currentIndex,
        urlParams: { quizId, discussionId, assessmentId, resourceId },
        currentPath: window.location.pathname
      });
      
      return (
        <ContentBody>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
            <h3>❌ No Content Available</h3>
            <p>Current content is not loaded. This usually means:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>The content ID from the URL doesn't match any content in the module</li>
              <li>The instructor hasn't created content for this item</li>
              <li>There's a data loading issue</li>
            </ul>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
              <strong>Debug Info:</strong><br/>
              Content Items: {contentItems.length}<br/>
              Current Index: {currentIndex}<br/>
              URL Assessment ID: {assessmentId || 'None'}<br/>
              URL Quiz ID: {quizId || 'None'}<br/>
              URL Discussion ID: {discussionId || 'None'}<br/>
              Current Path: {window.location.pathname}<br/>
              Available Content Types: {contentItems.map(item => item.type).join(', ')}<br/>
              Available Assessment IDs: {contentItems.filter(item => item.type === 'assessment').map(item => item.data._id || item.data.id).join(', ') || 'None'}<br/>
              Available Quiz IDs: {contentItems.filter(item => item.type === 'quiz').map(item => item.data._id || item.data.id).join(', ') || 'None'}<br/>
              Available Discussion IDs: {contentItems.filter(item => item.type === 'discussion').map(item => item.data._id || item.data.id).join(', ') || 'None'}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  console.log('🔍 FULL DEBUG INFO:');
                  console.log('Content Items:', contentItems);
                  console.log('Current Content:', currentContent);
                  console.log('Module:', module);
                  console.log('Course:', course);
                  console.log('URL Params:', { assessmentId, quizId, discussionId, resourceId });
                }}
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Debug Full Data
              </button>
              <button 
                onClick={() => navigate(getCourseOverviewPath())}
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: '#007BFF', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  marginLeft: '0.5rem'
                }}
              >
                Back to Course Overview
              </button>
            </div>
          </div>
        </ContentBody>
      );
    }

    console.log('🎨 Rendering content:', {
      type: currentContent.type,
      title: currentContent.title,
      hasData: !!currentContent.data,
      dataContent: currentContent.data
    });

    switch (currentContent.type) {
      case 'description':
        console.log('📖 DESCRIPTION DEBUG:', {
          hasData: !!currentContent.data,
          dataType: typeof currentContent.data,
          dataLength: currentContent.data?.length || 0,
          fullData: currentContent.data,
          currentContent: currentContent
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#d69e2e', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px' }}>
                <h3>⚠️ Module Description Missing</h3>
                <p>The module description content is not available.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
                  <strong>Debug Info:</strong><br/>
                  Current Content Type: {currentContent.type}<br/>
                  Current Content Title: {currentContent.title || 'No title'}<br/>
                  Has Data: {!!currentContent.data ? 'Yes' : 'No'}<br/>
                  Data Type: {typeof currentContent.data}<br/>
                  Data Content: {JSON.stringify(currentContent.data) || 'Empty'}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => {
                      console.log('🔍 FULL CONTENT DEBUG:', currentContent);
                      console.log('🔍 MODULE DEBUG:', module);
                      console.log('🔍 COURSE DEBUG:', course);
                    }}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Debug Module Content
                  </button>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        return (
          <ContentBody>
            <div style={{
              background: '#FFFFFF',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              lineHeight: '1.6',
              fontSize: '1rem',
              color: '#374151'
            }}>
              <h2 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem',
                borderBottom: '2px solid #3b82f6',
                paddingBottom: '0.5rem'
              }}>
                Module Description
              </h2>
              <div 
                dangerouslySetInnerHTML={{ __html: currentContent.data }}
                style={{
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#4b5563'
                }}
              />
            </div>
          </ContentBody>
        );
        
      case 'content':
        console.log('📝 CONTENT DEBUG:', {
          hasData: !!currentContent.data,
          dataType: typeof currentContent.data,
          dataLength: currentContent.data?.length || 0,
          fullData: currentContent.data,
          currentContent: currentContent
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ 
                background: '#FFFFFF',
                padding: '2rem 1.5rem',
                borderRadius: '15px',
                color: '#333333',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 style={{ 
                    marginBottom: '1.5rem', 
                    fontSize: '2rem', 
                    fontWeight: '700',
                    color: '#d69e2e'
                  }}>
                    📝 No Content Created
                  </h2>
                  
                  <div style={{ 
                    background: '#fffbeb', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    marginBottom: '1.5rem',
                    border: '1px solid #f6e05e',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ 
                      color: '#d69e2e', 
                      lineHeight: '1.6', 
                      fontSize: '1rem',
                      fontWeight: '500',
                      margin: '0 0 1rem 0'
                    }}>
                      This content item has not been created yet.
                    </p>
                    <p style={{ 
                      color: '#666666', 
                      lineHeight: '1.6', 
                      fontSize: '0.9rem',
                      fontWeight: '400',
                      margin: 0
                    }}>
                      To add content, go to the course builder and edit this module.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(getCourseOverviewPath())}
                    style={{ 
                      background: '#007BFF',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '20px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
                    }}
                    onMouseOver={e => {
                      e.target.style.background = '#0056b3';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={e => {
                      e.target.style.background = '#007BFF';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    ← Back to Course Overview
                  </button>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        return (
          <ContentBody>
            <div style={{ 
              background: '#FFFFFF',
              padding: '2rem 1.5rem',
              borderRadius: '15px',
              color: '#333333',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}>
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ 
                  marginBottom: '1.5rem', 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  color: '#333333'
                }}>
                  {currentContent.title || 'Content'}
                </h2>

                {/* Content Section */}
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  marginBottom: '1.5rem',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  textAlign: 'left'
                }}>
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentContent.data }}
                    style={{
                      color: '#000000',
                      lineHeight: '1.6',
                      fontSize: '1rem',
                      fontWeight: '400'
                    }}
                  />
                </div>
              </div>
            </div>
          </ContentBody>
        );
      
      case 'video':
        console.log('🎥 VIDEO CONTENT DEBUG:', {
          hasData: !!currentContent.data,
          dataKeys: currentContent.data ? Object.keys(currentContent.data) : [],
          videoTitle: currentContent.data?.title,
          hasUrl: !!currentContent.data?.url,
          hasFileUrl: !!currentContent.data?.fileUrl,
          hasPublicUrl: !!currentContent.data?.publicUrl,
          fullData: currentContent.data
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                <h3>❌ Video Data Missing</h3>
                <p>The video content is not available.</p>
              </div>
            </ContentBody>
          );
        }

        // Helper function to get embeddable URL for YouTube/Vimeo
        const getEmbeddableUrl = (url) => {
          if (!url) return '';
          
          // YouTube
          if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
          }
          
          // YouTube short format
          if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
          }
          
          // Vimeo
          if (url.includes('vimeo.com/')) {
            const videoId = url.split('vimeo.com/')[1]?.split('/')[0];
            return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
          }
          
          return url;
        };
        
        return (
          <ContentBody>
            <div style={{ 
              background: '#FFFFFF',
              padding: '2rem 1.5rem',
              borderRadius: '15px',
              color: '#333333',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
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
                  marginBottom: '1.5rem', 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  color: '#333333'
                }}>
                  {currentContent.data.title || 'Video Content'}
                </h2>

                {/* Description Section */}
                {currentContent.data.description && (
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    marginBottom: '1.5rem',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ 
                      color: '#000000', 
                      lineHeight: '1.6', 
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      {currentContent.data.description}
                    </p>
                  </div>
                )}

                {/* Video Link Section - Only show for instructors */}
                {userRole === 'instructor' && currentContent.data.url && (
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    padding: '2rem', 
                    borderRadius: '20px', 
                    marginBottom: '2rem',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ 
                      color: 'white', 
                      fontSize: '1.5rem', 
                      marginBottom: '1rem',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Video Link (Instructor View)
                    </h3>
                    <a 
                      href={currentContent.data.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#87CEEB',
                        textDecoration: 'underline',
                        fontSize: '1.1rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {currentContent.data.url}
                    </a>
                  </div>
                )}

                {/* Video Player Section */}
                {(currentContent.data.url || currentContent.data.fileUrl || currentContent.data.publicUrl) ? (
                  <div style={{ textAlign: 'center' }}>
                    {/* Video Player */}
                    <div style={{ 
                      marginBottom: '2rem',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
                    }}>
                      {currentContent.data.url && (
                        <iframe
                          src={getEmbeddableUrl(currentContent.data.url)}
                          title={currentContent.data.title || 'Video'}
                          width="100%"
                          height="400"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: '15px' }}
                        />
                      )}
                      {(currentContent.data.fileUrl || currentContent.data.publicUrl) && (
                        <video
                          controls
                          width="100%"
                          height="400"
                          style={{ borderRadius: '15px' }}
                        >
                          <source src={currentContent.data.fileUrl || currentContent.data.publicUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>

                    {/* Watch Button - Only for file uploads */}
                    {(currentContent.data.fileUrl || currentContent.data.publicUrl) && (
              <button
                        onClick={async () => {
                          let videoUrl = currentContent.data.fileUrl || currentContent.data.publicUrl;
                          
                          // Convert localhost URLs to Supabase URLs if needed
                          if (videoUrl && videoUrl.includes('localhost:5001/uploads/')) {
                            console.log('🎥 Converting localhost URL to Supabase URL:', videoUrl);
                            try {
                              const response = await fetch(`/api/convert-file-url?url=${encodeURIComponent(videoUrl)}`);
                              const data = await response.json();
                              if (data.success) {
                                videoUrl = data.supabaseUrl;
                                console.log('🎥 Converted to Supabase URL:', videoUrl);
                              }
                            } catch (error) {
                              console.error('🎥 Error converting URL:', error);
                            }
                          }
                          
                          console.log('🎥 Opening video URL:', videoUrl);
                          window.open(videoUrl, '_blank');
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
                        <span style={{ fontSize: '1.8rem' }}>🎥</span>
                        Watch Video
              </button>
                    )}
                  </div>
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
                    <strong style={{ fontSize: '1.2rem' }}>⚠️ Video Unavailable</strong><br/>
                    <span style={{ fontSize: '1rem', opacity: '0.9' }}>The video URL is missing. Please contact your instructor.</span>
                  </div>
                )}
              </div>
            </div>
          </ContentBody>
        );
      
      case 'resource':
        return (
          <ContentBody>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <Link style={{ fontSize: '3rem', color: '#007BFF', marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>
                {currentContent.data.title || 'Resource'}
              </h3>
              {currentContent.data.description && (
                <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                  {currentContent.data.description}
                </p>
              )}
              <button
                onClick={() => window.open(currentContent.data.url, '_blank')}
                style={{
                  background: '#007BFF',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.target.style.background = '#0056b3'}
                onMouseOut={e => e.target.style.background = '#007BFF'}
              >
                Open Resource →
              </button>
            </div>
          </ContentBody>
        );
      
      case 'assessment':
        console.log('🎯 Rendering assessment with data:', currentContent.data);
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                <h3>❌ Assessment Data Missing</h3>
                <p>The instructor hasn't created assessment questions yet.</p>
              </div>
            </ContentBody>
          );
        }
        return (
          <QuizTaker 
            quiz={{
              ...currentContent.data,
              courseId: courseId,
              moduleId: moduleId
            }}
            userRole={userRole}
            onEdit={() => {
              // Navigate to assessment edit page for instructors
              if (userRole === 'instructor') {
                const assessmentIndex = contentItems.slice(0, currentIndex).filter(item => item.type === 'assessment').length;
                navigate(`/instructor/courses/${courseId}/modules/${moduleId}/assessment/${assessmentIndex}/edit`);
              }
            }}
            onComplete={(result) => {
              console.log('Assessment completed:', result);
              // Handle assessment completion
              // You can add API call here to save assessment results
              handleMarkComplete();
            }}
          />
        );
      
      case 'quiz':
        console.log('🎯 Rendering quiz with data:', currentContent.data);
        console.log('Quiz data being passed to QuizTaker:', currentContent.data);
        console.log('🔍 QUIZ RENDER DEBUG - User role being passed to QuizTaker:', userRole);
        console.log('🗓️ DUE DATE DEBUG:', {
          rawDueDate: currentContent.data?.dueDate,
          dueDateType: typeof currentContent.data?.dueDate,
          hasDueDate: !!currentContent.data?.dueDate,
          allQuizFields: Object.keys(currentContent.data || {})
        });
        console.log('⏰ TIME LIMIT DEBUG:', {
          rawDuration: currentContent.data?.duration,
          durationType: typeof currentContent.data?.duration,
          hasDuration: !!currentContent.data?.duration,
          timeLimit: currentContent.data?.timeLimit,
          hasTimeLimit: !!currentContent.data?.timeLimit
        });
        
        // CRITICAL DEBUG: Check if userRole is correct for quiz interaction
        if (userRole !== 'refugee') {
          console.warn('⚠️ WARNING: userRole is not "refugee":', userRole, '- Quiz may not show interactive elements!');
        } else {
          console.log('✅ userRole is "refugee" - Interactive elements should be visible');
        }
        
        // Enhanced debugging for quiz content
        console.log('🧠 QUIZ CONTENT DEBUG:', {
          hasData: !!currentContent.data,
          dataKeys: currentContent.data ? Object.keys(currentContent.data) : [],
          quizTitle: currentContent.data?.title,
          hasQuestions: !!currentContent.data?.questions,
          questionCount: currentContent.data?.questions?.length || 0,
          quizId: currentContent.data?._id,
          fullData: currentContent.data
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                <h3>❌ Quiz Data Missing</h3>
                <p>The instructor hasn't created quiz questions yet.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
                  <strong>What you can do:</strong><br/>
                  • Contact the instructor to add quiz questions<br/>
                  • Check back later when content is available<br/>
                  • Try other content items in this module
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => window.debugQuizData && window.debugQuizData()}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    Debug Quiz Data
                  </button>
                  <button 
                    onClick={() => window.testBackendData && window.testBackendData()}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#007BFF', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Test Backend Data
                  </button>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        if (!currentContent.data.questions || currentContent.data.questions.length === 0) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#d69e2e', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px' }}>
                <h3>⚠️ Quiz Has No Questions</h3>
                <p>The quiz "{currentContent.data.title || 'Untitled Quiz'}" exists but has no questions.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
                  <strong>Quiz Info:</strong><br/>
                  Title: {currentContent.data.title || 'Untitled'}<br/>
                  Description: {currentContent.data.description || 'No description'}<br/>
                  Questions: {currentContent.data.questions?.length || 0}<br/>
                  ID: {currentContent.data._id}<br/>
                  Instructor: {currentContent.data.instructorId || 'Unknown'}<br/>
                  Course: {currentContent.data.courseId || 'Unknown'}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => window.debugQuizData && window.debugQuizData()}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    Debug Quiz Data
                  </button>
                  <button 
                    onClick={() => window.testBackendData && window.testBackendData()}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#007BFF', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Test Backend Data
                  </button>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        // Calculate quiz number by counting quizzes before current one
        const quizNumber = contentItems.slice(0, currentIndex + 1).filter(item => item.type === 'quiz').length;
        
        // Check if quiz is already completed
        const currentItemId = `quiz-${currentIndex}`;
        const isQuizCompleted = completedItems.has(currentItemId);
        
        console.log('🎯 QUIZ COMPLETION CHECK:', {
          quizTitle: currentContent.data.title,
          currentItemId: currentItemId,
          isQuizCompleted: isQuizCompleted,
          userRole: userRole,
          completedItemsArray: Array.from(completedItems),
          willShowCompletionScreen: isQuizCompleted && userRole === 'refugee'
        });
        
        // Always show the quiz interface - QuizTaker will handle completion display
        return (
          <QuizTaker 
            quiz={{
              ...currentContent.data,
              courseId: courseId,
              moduleId: moduleId
            }}
            userRole={userRole}
            quizNumber={quizNumber}
            // Pass submission data if available
            initialSubmissionData={currentContent.data?.submissionData}
            onEdit={() => {
              // Navigate to quiz management page for instructors
              if (userRole === 'instructor') {
                const currentUrl = window.location.href; // Use full URL instead of just pathname
                console.log('🔍 Edit button clicked - Full URL:', currentUrl);
                console.log('🔍 Quiz ID:', currentContent.data._id);
                console.log('🔍 Course ID:', courseId);
                console.log('🔍 Course Name:', course.title);
                
                // Store return URL in sessionStorage for persistence
                sessionStorage.setItem('quizEditReturnUrl', currentUrl);
                console.log('🔍 Stored return URL in sessionStorage:', currentUrl);
                
                const navigationState = {
                  courseId, 
                  courseName: course.title,
                  editQuizId: currentContent.data._id,
                  returnUrl: currentUrl
                };
                
                console.log('🔍 Navigating to /instructor/quizzes with state:', navigationState);
                
                navigate('/instructor/quizzes', {
                  state: navigationState
                });
              }
            }}
            onSubmissionFound={(submissionData) => {
              // Store existing submission data for display
              if (currentContent && currentContent.data) {
                currentContent.data.submissionData = submissionData;
              }
            }}
            onComplete={(result) => {
              console.log('Quiz completed:', result);
              
              // Store quiz completion data for display
              if (currentContent && currentContent.data) {
                currentContent.data.submissionData = {
                  score: result.score,
                  timeSpent: result.timeSpent,
                  submittedAt: new Date().toISOString(),
                  answers: result.answers,
                  totalQuestions: result.totalQuestions
                };
              }
              
              // Handle quiz completion and automatically mark as complete
              handleMarkComplete();
              
              // Force refresh completion data to ensure UI updates
              setTimeout(() => {
                fetchCompletionStatus();
              }, 1000);
              
              // Show success message
              alert(`🎉 Quiz completed! Score: ${result.score}%`);
            }}
          />
        );
      
      case 'discussion':
        // Enhanced debugging for discussion content  
        console.log('💬 DISCUSSION CONTENT DEBUG:', {
          hasData: !!currentContent.data,
          dataKeys: currentContent.data ? Object.keys(currentContent.data) : [],
          discussionTitle: currentContent.data?.title,
          hasContent: !!currentContent.data?.content,
          contentLength: currentContent.data?.content?.length || 0,
          discussionId: currentContent.data?._id,
          fullData: currentContent.data
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                <h3>❌ Discussion Data Missing</h3>
                <p>The instructor hasn't created discussion content yet.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
                  <strong>What you can do:</strong><br/>
                  • Contact the instructor to add discussion content<br/>
                  • Check back later when content is available<br/>
                  • Try other content items in this module
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => window.testBackendData && window.testBackendData()}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Test Backend Data
                  </button>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        if (!currentContent.data.title && !currentContent.data.content) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#d69e2e', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px' }}>
                <h3>⚠️ Discussion Has No Content</h3>
                <p>The discussion exists but has no title or content.</p>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
                  <strong>Discussion Info:</strong><br/>
                  Title: {currentContent.data.title || 'No title'}<br/>
                  Content: {currentContent.data.content || 'No content'}<br/>
                  ID: {currentContent.data._id || 'No ID'}<br/>
                  Instructor: {currentContent.data.instructorId || 'Unknown'}<br/>
                  Course: {currentContent.data.courseId || 'Unknown'}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => window.testBackendData && window.testBackendData()}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Test Backend Data
                  </button>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        // Calculate discussion index by counting discussions before current one
        const discussionIndex = contentItems.slice(0, currentIndex).filter(item => item.type === 'discussion').length;
        return <DiscussionComponent discussion={currentContent.data} courseId={courseId} moduleId={moduleId} discussionIndex={discussionIndex} />;
      
      case 'article':
        console.log('📄 ARTICLE CONTENT DEBUG:', {
          hasData: !!currentContent.data,
          dataKeys: currentContent.data ? Object.keys(currentContent.data) : [],
          articleTitle: currentContent.data?.title,
          hasContent: !!currentContent.data?.content,
          hasUrl: !!currentContent.data?.url,
          contentLength: currentContent.data?.content?.length || 0,
          fullData: currentContent.data
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                <h3>❌ Article Data Missing</h3>
                <p>The article content is not available.</p>
              </div>
            </ContentBody>
          );
        }
        
        // If it's an external URL, show a link to open it
        if (currentContent.data.url) {
          return (
            <ContentBody>
              <div style={{ 
                background: '#FFFFFF',
                padding: '2rem 1.5rem',
                borderRadius: '15px',
                color: '#333333',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 style={{ 
                    marginBottom: '1.5rem', 
                    fontSize: '2rem', 
                    fontWeight: '700',
                    color: '#333333'
                  }}>
                  {currentContent.data.title || 'Article'}
                </h2>

                  {/* Description Section */}
                {currentContent.data.description && (
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      marginBottom: '1.5rem',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}>
                      <p style={{ 
                        color: '#000000', 
                        lineHeight: '1.6', 
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}>
                    {currentContent.data.description}
                  </p>
                    </div>
                )}

                  {/* Action Section */}
                  <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => window.open(currentContent.data.url, '_blank')}
                  style={{
                        background: '#007BFF',
                    color: '#FFFFFF',
                        border: '2px solid #007BFF',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        fontWeight: '600',
                    cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }}
                      onMouseOver={e => {
                        e.target.style.background = '#0056b3';
                        e.target.style.transform = 'translateY(-2px) scale(1.02)';
                        e.target.style.boxShadow = '0 6px 15px rgba(0,123,255,0.4)';
                        e.target.style.border = '2px solid #0056b3';
                      }}
                      onMouseOut={e => {
                        e.target.style.background = '#007BFF';
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                        e.target.style.border = '2px solid #007BFF';
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>📰</span>
                      Read Article
                </button>
                  </div>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        // If it has content, display it directly
        if (currentContent.data.content) {
          return (
            <ContentBody>
              <div style={{ 
                background: '#FFFFFF',
                padding: '2rem 1.5rem',
                borderRadius: '15px',
                color: '#333333',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 style={{ 
                    marginBottom: '1.5rem', 
                    fontSize: '2rem', 
                    fontWeight: '700',
                    color: '#333333'
                  }}>
                    {currentContent.data.title || 'Article'}
                  </h2>
                  
                  {/* Content Section */}
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    marginBottom: '1.5rem',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    textAlign: 'left'
                  }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: currentContent.data.content }}
                      style={{
                        color: '#000000',
                        lineHeight: '1.6',
                        fontSize: '1rem',
                        fontWeight: '400'
                      }}
                    />
                  </div>
                </div>
              </div>
            </ContentBody>
          );
        }
        
        // Fallback
        return (
          <ContentBody>
            <div style={{ padding: '2rem', textAlign: 'center', color: '#d69e2e', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px' }}>
              <h3>⚠️ Article Content Unavailable</h3>
              <p>This article has no content or URL to display.</p>
            </div>
          </ContentBody>
        );
      
      case 'file':
        console.log('📁 FILE CONTENT DEBUG:', {
          hasData: !!currentContent.data,
          dataKeys: currentContent.data ? Object.keys(currentContent.data) : [],
          fileName: currentContent.data?.fileName,
          hasUrl: !!currentContent.data?.url,
          hasFileUrl: !!currentContent.data?.fileUrl,
          hasPublicUrl: !!currentContent.data?.publicUrl,
          url: currentContent.data?.url,
          fileUrl: currentContent.data?.fileUrl,
          publicUrl: currentContent.data?.publicUrl,
          type: currentContent.type,
          title: currentContent.title,
          fullData: currentContent.data
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                <h3>❌ File Data Missing</h3>
                <p>The file content is not available.</p>
              </div>
            </ContentBody>
          );
        }
        
        return (
          <ContentBody>
            <div style={{ 
              background: '#FFFFFF',
              padding: '2rem 1.5rem',
              borderRadius: '15px',
              color: '#333333',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}>
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ 
                  marginBottom: '1.5rem', 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  color: '#333333'
                }}>
                  {currentContent.data.title || 'File Content'}
                </h2>

                {/* Description Section */}
              {currentContent.data.description && (
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    marginBottom: '1.5rem',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ 
                      color: '#000000', 
                      lineHeight: '1.6', 
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                  {currentContent.data.description}
                </p>
                  </div>
              )}

                {/* Action Section */}
                <div style={{ textAlign: 'center' }}>
                  {(currentContent.data.url || currentContent.data.fileUrl || currentContent.data.publicUrl) ? (
                <button
                      onClick={async () => {
                        let fileUrl = currentContent.data.fileUrl || currentContent.data.publicUrl || currentContent.data.url;
                        
                        // Convert localhost URLs to Supabase URLs if needed
                        if (fileUrl && fileUrl.includes('localhost:5001/uploads/')) {
                          console.log('📁 Converting localhost URL to Supabase URL:', fileUrl);
                          try {
                            const response = await fetch(`/api/convert-file-url?url=${encodeURIComponent(fileUrl)}`);
                            const data = await response.json();
                            if (data.success) {
                              fileUrl = data.supabaseUrl;
                              console.log('📁 Converted to Supabase URL:', fileUrl);
                            }
                          } catch (error) {
                            console.error('📁 Error converting URL:', error);
                          }
                        }
                        
                        console.log('📁 Opening file URL:', fileUrl);
                        window.open(fileUrl, '_blank');
                      }}
                  style={{
                        background: '#007BFF',
                    color: 'white',
                        border: '1px solid #007BFF',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                    cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }}
                      onMouseOver={e => {
                        e.target.style.background = '#0056b3';
                        e.target.style.transform = 'translateY(-1px) scale(1.01)';
                        e.target.style.boxShadow = '0 6px 15px rgba(0,123,255,0.4)';
                        e.target.style.border = '1px solid #0056b3';
                      }}
                      onMouseOut={e => {
                        e.target.style.background = '#007BFF';
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                        e.target.style.border = '1px solid #007BFF';
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>📄</span>
                      Explore Content
                </button>
                  ) : (
                    <div style={{ 
                      padding: '2rem', 
                      background: '#f8f9fa', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '20px', 
                      color: '#333333',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                      <strong style={{ fontSize: '1.2rem' }}>⚠️ Content Unavailable</strong><br/>
                      <span style={{ fontSize: '1rem', opacity: '0.9' }}>The file URL is missing. Please contact your instructor.</span>
                    </div>
              )}
            </div>
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
          </ContentBody>
        );
      
      case 'audio':
        console.log('🎵 AUDIO CONTENT DEBUG:', {
          hasData: !!currentContent.data,
          dataKeys: currentContent.data ? Object.keys(currentContent.data) : [],
          audioTitle: currentContent.data?.title,
          hasUrl: !!currentContent.data?.url,
          fullData: currentContent.data
        });
        
        if (!currentContent.data) {
          return (
            <ContentBody>
              <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                <h3>❌ Audio Data Missing</h3>
                <p>The audio content is not available.</p>
              </div>
            </ContentBody>
          );
        }
        
        return (
          <ContentBody>
            <div style={{ 
              background: '#FFFFFF',
              padding: '2rem 1.5rem',
              borderRadius: '15px',
              color: '#333333',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}>
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ 
                  marginBottom: '1.5rem', 
                  fontSize: '2rem', 
                  fontWeight: '700',
                  textShadow: '0 4px 8px rgba(0,0,0,0.5)',
                  background: 'linear-gradient(45deg, #ffffff, #e6f3ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                {currentContent.data.title || 'Audio Content'}
                </h2>

                {/* Description Section */}
              {currentContent.data.description && (
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
                  {currentContent.data.description}
                </p>
                  </div>
              )}

                {/* Action Section */}
                <div style={{ textAlign: 'center' }}>
                  {(currentContent.data.url || currentContent.data.fileUrl || currentContent.data.publicUrl) ? (
                <button
                      onClick={async () => {
                        let audioUrl = currentContent.data.fileUrl || currentContent.data.publicUrl || currentContent.data.url;
                        
                        // Convert localhost URLs to Supabase URLs if needed
                        if (audioUrl && audioUrl.includes('localhost:5001/uploads/')) {
                          console.log('🎵 Converting localhost URL to Supabase URL:', audioUrl);
                          try {
                            const response = await fetch(`/api/convert-file-url?url=${encodeURIComponent(audioUrl)}`);
                            const data = await response.json();
                            if (data.success) {
                              audioUrl = data.supabaseUrl;
                              console.log('🎵 Converted to Supabase URL:', audioUrl);
                            }
                          } catch (error) {
                            console.error('🎵 Error converting URL:', error);
                          }
                        }
                        
                        console.log('🎵 Opening audio URL:', audioUrl);
                        window.open(audioUrl, '_blank');
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
                      <span style={{ fontSize: '1.8rem' }}>🎵</span>
                      Listen Audio
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
                      <strong style={{ fontSize: '1.2rem' }}>⚠️ Audio Unavailable</strong><br/>
                      <span style={{ fontSize: '1rem', opacity: '0.9' }}>The audio URL is missing. Please contact your instructor.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ContentBody>
        );
      
      default:
        console.log('❌ Unknown content type:', currentContent.type);
        return (
          <ContentBody>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
              <h3>❌ Unknown Content Type</h3>
              <p>Content type "{currentContent.type}" is not supported.</p>
            </div>
          </ContentBody>
        );
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading content...</div>
        </div>
      </Container>
    );
  }

  if (error || !course || !module) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error || 'Content not found'}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
            <h4>Debug Information:</h4>
            <p><strong>Error:</strong> {error}</p>
            <p><strong>Course loaded:</strong> {course ? 'Yes' : 'No'}</p>
            <p><strong>Module loaded:</strong> {module ? 'Yes' : 'No'}</p>
            <p><strong>Course ID:</strong> {courseId}</p>
            <p><strong>Module ID:</strong> {moduleId}</p>
            <p><strong>Quiz ID:</strong> {quizId}</p>
            <p><strong>Discussion ID:</strong> {discussionId}</p>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => navigate(getCourseOverviewPath())}
              style={{ padding: '0.5rem 1rem', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Back to Course Overview
            </button>
          </div>
        </div>
      </Container>
    );
  }

  // Handle case where content items are empty
  if (contentItems.length === 0) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(getCourseOverviewPath())}>
            <ArrowBack style={{ fontSize: '1rem' }} />
            Back to Course Overview
          </BackButton>
          <CourseInfo>
            <CourseTitle>{course.title}</CourseTitle>
            <ModuleInfo>
              <span>Module: {module.title}</span>
            </ModuleInfo>
          </CourseInfo>
        </Header>

        <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#1a1a1a', marginBottom: '1rem' }}>No Content Available</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            This module doesn't have any content items yet. The instructor may not have added content to this module.
          </p>
          <div style={{ marginBottom: '1.5rem' }}>
            <button 
              onClick={() => window.testBackendData && window.testBackendData()}
              style={{ 
                padding: '0.5rem 1rem', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Test Backend Data
            </button>
            <button 
              onClick={() => navigate(getCourseOverviewPath())}
              style={{ padding: '0.75rem 1.5rem', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Back to Course Overview
            </button>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', background: '#e5e7eb', padding: '1rem', borderRadius: '4px' }}>
            <p><strong>Debug Info:</strong></p>
            <p>Course ID: {courseId}</p>
            <p>Module ID: {moduleId}</p>
            <p>Module has content: {module.content ? 'Yes' : 'No'}</p>
            <p>Module has description: {module.description ? 'Yes' : 'No'}</p>
            <p>Module has video: {module.videoUrl ? 'Yes' : 'No'}</p>
            <p>Module has resources: {module.resources?.length || 0}</p>
            <p>Module has assessments: {module.assessments?.length || 0}</p>
            <p>Module has quizzes: {module.quizzes?.length || 0}</p>
            <p>Module has discussions: {module.discussions?.length || 0}</p>
          </div>
        </div>
      </Container>
    );
  }

  const progress = contentItems.length > 0 ? ((currentIndex + 1) / contentItems.length) * 100 : 0;
  const currentItemId = currentContent ? `${currentContent.type}-${currentIndex}` : null;
  const isCurrentItemCompleted = currentItemId ? completedItems.has(currentItemId) : false;

  // Debug logging
  console.log('📊 ModuleContent render state:', {
    currentContent: currentContent ? {
      type: currentContent.type,
      title: currentContent.title,
      index: currentIndex
    } : null,
    currentItemId,
    isCurrentItemCompleted,
    completedItems: Array.from(completedItems),
    contentItems: contentItems.map((item, idx) => ({
      index: idx,
      type: item.type,
      title: item.title
    }))
  });

  // Additional debugging for completion key matching
  if (currentItemId && completedItems.size > 0) {
    console.log('🔍 Completion key matching debug:', {
      currentItemId,
      completedItemsArray: Array.from(completedItems),
      hasMatch: completedItems.has(currentItemId),
      exactMatches: Array.from(completedItems).filter(item => item === currentItemId),
      partialMatches: Array.from(completedItems).filter(item => item.includes(currentContent.type))
    });
  }

  // Debug function for content loading
  window.debugContentLoading = () => {
    console.log('🔍 DEBUG CONTENT LOADING:');
    console.log('📋 Content items:', contentItems);
    console.log('📋 Current content:', currentContent);
    console.log('📋 Current index:', currentIndex);
    console.log('📋 Module:', module);
    console.log('📋 Course:', course);
    console.log('📋 URL params:', { quizId, discussionId, assessmentId, resourceId });
    console.log('📋 Available discussions:', contentItems.filter(item => item.type === 'discussion'));
  };

  // Add instructor-specific debug function
  const debugInstructorQuizAccess = () => {
    console.log('👨‍🏫 INSTRUCTOR QUIZ ACCESS DEBUG:');
    console.log('Current URL:', window.location.href);
    console.log('User Role:', userRole);
    console.log('Is Instructor:', userRole === 'instructor');
    
    // Check if we're on the correct instructor route
    const isInstructorRoute = window.location.pathname.includes('/instructor/');
    console.log('Is Instructor Route:', isInstructorRoute);
    
    // Check current content
    console.log('Current Content Type:', currentContent?.type);
    console.log('Current Content Data:', currentContent?.data);
    
    // Check content items
    console.log('🔍 CONTENT ITEMS ANALYSIS:');
    console.log('Total content items:', contentItems.length);
    contentItems.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        type: item.type,
        title: item.title,
        hasData: !!item.data,
        dataKeys: item.data ? Object.keys(item.data) : []
      });
    });
    
    // Check quiz items specifically
    const quizItems = contentItems.filter(item => item.type === 'quiz');
    console.log('📝 QUIZ ITEMS FOUND:', quizItems.length);
    quizItems.forEach((quiz, index) => {
      console.log(`Quiz ${index}:`, {
        title: quiz.title,
        hasQuestions: !!quiz.data?.questions,
        questionCount: quiz.data?.questions?.length || 0,
        quizId: quiz.data?._id
      });
    });
    
    // Test API endpoints
    const testQuizAPI = async () => {
      console.log('🧪 TESTING QUIZ API ENDPOINTS...');
      const token = localStorage.getItem('token');
      
      try {
        // Test instructor quiz endpoint
        const response = await fetch('/api/instructor/quizzes/test-quiz-id', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🔍 Instructor quiz API test response:', response.status, response.statusText);
        
        // Test student quiz endpoint
        const studentResponse = await fetch('/api/instructor/quizzes/test-quiz-id/student', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('🔍 Student quiz API test response:', studentResponse.status, studentResponse.statusText);
        
      } catch (error) {
        console.error('❌ Quiz API test error:', error);
      }
    };
    
    testQuizAPI();
    
    // Check if quiz data is available
    if (currentContent?.type === 'quiz' && currentContent?.data) {
      console.log('✅ Quiz data found for instructor view');
      console.log('Quiz Title:', currentContent.data.title);
      console.log('Question Count:', currentContent.data.questions?.length || 0);
      
      // Show each question with its correct answer
      currentContent.data.questions?.forEach((question, index) => {
        console.log(`Question ${index + 1}:`, {
          type: question.type,
          question: question.question,
          correctAnswer: question.correctAnswer,
          options: question.options,
          explanation: question.explanation
        });
      });
    } else {
      console.log('❌ No quiz data available for instructor view');
    }
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <BackButton onClick={() => navigate(getCourseOverviewPath())}>
          <ArrowBack style={{ fontSize: '1rem' }} />
          Back to Course Overview
        </BackButton>
        <CourseInfo>
          <CourseTitle>{course.title}</CourseTitle>
        </CourseInfo>

      </Header>



      {renderContent()}

        {/* Debug Button - Only show in development */}




      <NavigationBar>
        <NavButton 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowBack style={{ fontSize: '1rem' }} />
          Previous
        </NavButton>
        
        <div style={{ 
          fontSize: '1rem', 
          color: '#6b7280', 
          fontWeight: '500',
          textAlign: 'center',
          flex: 1
        }}>
          Item {currentIndex + 1} of {contentItems.length}
        </div>
        
        <NavButtonGroup>
          {/* Debug completion status */}
          {(() => {
            console.log('🔍 Button rendering debug:', {
              isCurrentItemCompleted,
              userRole,
              currentItemId: currentContent ? `${currentContent.type}-${currentIndex}` : null,
              completedItems: Array.from(completedItems),
              shouldShowButton: !isCurrentItemCompleted && userRole !== 'instructor' && userRole !== 'admin'
            });
            return null;
          })()}
          
          {/* Only show Mark as Complete button for students/refugees, not instructors */}
          {(() => {
            const currentItemId = currentContent ? `${currentContent.type}-${currentIndex}` : null;
            const isCompleted = currentItemId ? completedItems.has(currentItemId) : false;
            const shouldShow = !isCompleted && userRole !== 'instructor' && userRole !== 'admin';
            
            console.log('🔍 Real-time button condition check:', {
              currentItemId,
              isCompleted,
              userRole,
              shouldShow,
              completedItems: Array.from(completedItems)
            });
            
            return shouldShow;
          })() && (
            <NavButton 
              onClick={async () => {
                console.log('🔘 Mark as Complete button clicked');
                console.log('🔍 Pre-click state:', {
                  currentItemId: currentContent ? `${currentContent.type}-${currentIndex}` : null,
                  completedItems: Array.from(completedItems),
                  isMarkingComplete
                });
                await handleMarkComplete();
                console.log('🔍 Post-click state:', {
                  completedItems: Array.from(completedItems),
                  isMarkingComplete
                });
              }}
              disabled={isMarkingComplete}
            >
              {isMarkingComplete ? 'Marking...' : 'Mark as Complete'}
            </NavButton>
          )}
          
          <NavButton 
            primary
            onClick={() => {
              console.log('➡️ Next/Finish button clicked');
              handleMarkCompleteAndNext();
            }}
            disabled={isMarkingComplete}
          >
            {currentIndex === contentItems.length - 1 ? 'Finish Module' : 'Next'}
            <ArrowForward style={{ fontSize: '1rem' }} />
          </NavButton>
        </NavButtonGroup>
      </NavigationBar>
      
      {/* Removed Congratulations pop-up modal */}
    </Container>
  );
} // End of ModuleContentInner function

// Export the component directly without authentication check (handled by App.js)
export default function SharedModuleContent() {
  console.log('🎉 ===== SHARED MODULE CONTENT COMPONENT LOADING - NAMING CONFLICT FIXED =====');
  console.log('🎉 Component rendering at:', new Date().toISOString());
  console.log('🎉 Current URL:', window.location.href);
  console.log('🎉 Current pathname:', window.location.pathname);
  console.log('🎉 URL parameters:', window.location.search);
  console.log('🎉 Component type: SharedModuleContent (from components/ModuleContent.js)');
  console.log('🎉 SUCCESS: SharedModuleContent component is now loading correctly!');
  console.log('🎉 NAMING CONFLICT FIX APPLIED - No more conflicts with Instructor ModuleContent!');
  
  return (
    <div>
      <ModuleContentInner />
    </div>
  );
} 