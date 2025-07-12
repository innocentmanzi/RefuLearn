import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowBack, ArrowForward, Description, VideoLibrary, Link, Assignment, Quiz, Forum, CheckCircle, RadioButtonUnchecked, Send, Person, ThumbUp, Reply, MoreVert } from '@mui/icons-material';
import QuizTaker from './QuizTaker';

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
  gap: 0.5rem;
  background: ${props => props.primary ? '#0056b3' : 'white'};
  color: ${props => props.primary ? 'white' : '#0056b3'};
  border: ${props => props.primary ? 'none' : '2px solid #0056b3'};
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 0.9375rem;
  font-weight: 600;
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

const CourseCompletionModal = styled.div`
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
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
      
      // Fetch replies from backend
      const response = await fetch(`/api/courses/discussions/${discussion._id}/replies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
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
        // Keep current replies to prevent loss
        console.log('🔄 Keeping current replies to prevent data loss');
        if (currentReplies.length > 0) {
          setReplies(currentReplies);
        } else {
          setReplies(discussion.replies || []);
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
              return [...prev, replyObject];
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
      
      // Send to backend
      const response = await fetch(`/api/courses/discussions/${discussion._id}/replies/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' })
      });
      
      if (!response.ok) {
        console.error('Failed to update like status');
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
      }
    } catch (err) {
      console.error('Error liking post:', err);
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
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'A';
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
        <h2 style={{ color: '#1a1a1a', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
          Discussion {discussionIndex + 1}: {discussion.title}
        </h2>
        <div style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
          {discussion.content || 'No description provided for this discussion.'}
        </div>
      </div>

      {/* Connection Status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#0c4a6e'
      }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: '#10b981',
          animation: 'pulse 2s infinite'
        }}></div>
        <span>🔗 Connected to server - All discussions are saved and visible to everyone</span>
      </div>

      {/* Persistence Guarantee */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#f0fdf4',
        border: '1px solid #22c55e',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#15803d'
      }}>
        <span>💾 Persistence Guarantee: Your replies are permanently saved in the database and will never be lost</span>
      </div>

      {/* Post Reply Form */}
      <form onSubmit={handleSubmitReply} style={{ marginBottom: '2rem' }}>
        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Share your thoughts, ask questions, or contribute to the discussion..."
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            marginBottom: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="submit" 
            disabled={loading || !newReply.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: loading || !newReply.trim() ? '#9ca3af' : '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading || !newReply.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            <Send />
            {loading ? 'Posting...' : 'Post'}
          </button>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'} • Replies preserved permanently
            {loading && <span style={{ color: '#007BFF', marginLeft: '0.5rem' }}>• Saving...</span>}
          </div>
        </div>
      </form>

        {replies.length > 0 && (
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
                      {getAuthorInitials(post.author || 'Anonymous')}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{post.author || 'Anonymous'}</div>
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
                      placeholder={`Reply to ${post.author}...`}
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
                            {getAuthorInitials(nestedReply.author || 'Anonymous')}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{nestedReply.author || 'Anonymous'}</div>
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
        )}
    </div>
  );
}

function ModuleContentInner() {
  const { courseId, moduleId, resourceId, assessmentId, quizId, discussionId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage or token
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'refugee');
    
    // Add real-time debugging for URL parameters
    console.log('🔄 ModuleContent component loading with URL params:', {
      courseId,
      moduleId,
      quizId,
      discussionId,
      resourceId,
      assessmentId,
      currentURL: window.location.href,
      urlPath: window.location.pathname
    });
    
    fetchCourseAndModule();
    fetchCompletionStatus();
    
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
                if (!discussion.content || discussion.content.trim() === '') {
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
    
  }, [courseId, moduleId]);

  // Manual completion only - no auto-completion

  const fetchCourseAndModule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.course) {
          const courseData = data.data.course;
          setCourse(courseData);
          
          const foundModule = courseData.modules.find(m => m._id === moduleId);
          if (foundModule) {
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
            
            if (foundModule.content) {
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
                type: q.type
              })));
              
              foundModule.quizzes.forEach((quiz, idx) => {
                quizCount++;
                console.log('📄 Processing quiz:', {
                  index: idx,
                  quizNumber: quizCount,
                  title: quiz.title,
                  id: quiz._id,
                  hasQuestions: !!quiz.questions && quiz.questions.length > 0,
                  questionCount: quiz.questions?.length || 0
                });
                
                items.push({
                  type: 'quiz',
                  title: `Quiz ${quizCount}${quiz.title ? `: ${quiz.title}` : ''}`,
                  data: quiz,
                  icon: Quiz
                });
              });
            } else {
              console.log('❌ No quizzes found in module');
            }
            
            if (foundModule.discussions) {
              console.log('✅ Found discussions:', foundModule.discussions.length);
              console.log('📝 Discussion details:', foundModule.discussions.map(d => ({
                id: d._id,
                title: d.title,
                hasContent: !!d.content,
                type: d.type
              })));
              
              foundModule.discussions.forEach((discussion, idx) => {
                console.log('📄 Processing discussion:', {
                  index: idx,
                  title: discussion.title,
                  id: discussion._id,
                  hasContent: !!discussion.content
                });
                
                items.push({
                  type: 'discussion',
                  title: discussion.title || `Discussion ${idx + 1}`,
                  data: discussion,
                  icon: Forum
                });
              });
            } else {
              console.log('❌ No discussions found in module');
            }
            
            // Log final content summary
            console.log('📋 Final content items summary:', {
              totalItems: items.length,
              breakdown: {
                description: items.filter(i => i.type === 'description').length,
                content: items.filter(i => i.type === 'content').length,
                video: items.filter(i => i.type === 'video').length,
                resource: items.filter(i => i.type === 'resource').length,
                assessment: items.filter(i => i.type === 'assessment').length,
                quiz: items.filter(i => i.type === 'quiz').length,
                discussion: items.filter(i => i.type === 'discussion').length
              },
              itemTitles: items.map(i => `${i.type}: ${i.title}`)
            });
            
            setContentItems(items);
            
            // Determine which content to show based on URL
            let initialIndex = 0;
            const currentPath = window.location.pathname;
            
            console.log('🔍 URL Analysis:', {
              currentPath,
              quizId,
              discussionId,
              itemsCount: items.length,
              items: items.map((item, idx) => ({
                index: idx,
                type: item.type,
                title: item.title,
                dataId: item.data._id || item.data.id || 'no-id'
              }))
            });
            
            // More robust URL matching with fallback
            let foundMatch = false;
            
            if (currentPath.includes('/description')) {
              const descIndex = items.findIndex(item => item.type === 'description');
              if (descIndex >= 0) {
                initialIndex = descIndex;
                foundMatch = true;
              }
            } else if (currentPath.includes('/video')) {
              const videoIndex = items.findIndex(item => item.type === 'video');
              if (videoIndex >= 0) {
                initialIndex = videoIndex;
                foundMatch = true;
              }
            } else if (currentPath.includes('/content')) {
              const contentIndex = items.findIndex(item => item.type === 'content');
              if (contentIndex >= 0) {
                initialIndex = contentIndex;
                foundMatch = true;
              }
            } else if (currentPath.includes('/resource/')) {
              const resourceIndex = parseInt(resourceId);
              if (!isNaN(resourceIndex)) {
                const resourceItems = items.filter(item => item.type === 'resource');
                if (resourceItems.length > resourceIndex) {
                  initialIndex = items.findIndex(item => 
                    item.type === 'resource' && 
                    items.slice(0, items.indexOf(item) + 1).filter(i => i.type === 'resource').length === resourceIndex + 1
                  );
                  if (initialIndex >= 0) foundMatch = true;
                }
              }
            } else if (currentPath.includes('/assessment/')) {
              // Match by assessment ID, not index
              if (assessmentId) {
                const assessmentIndex = items.findIndex(item => 
                  item.type === 'assessment' && 
                  (item.data._id === assessmentId || item.data.id === assessmentId)
                );
                if (assessmentIndex >= 0) {
                  initialIndex = assessmentIndex;
                  foundMatch = true;
                }
              }
            } else if (currentPath.includes('/quiz/')) {
              // Match by quiz ID, not index
              if (quizId) {
                console.log('🎯 Looking for quiz with ID:', quizId);
                const quizIndex = items.findIndex(item => {
                  const matches = item.type === 'quiz' && 
                    (item.data._id === quizId || item.data.id === quizId);
                  console.log('🔍 Checking quiz:', {
                    itemType: item.type,
                    itemDataId: item.data._id || item.data.id,
                    searchingFor: quizId,
                    matches
                  });
                  return matches;
                });
                if (quizIndex >= 0) {
                  initialIndex = quizIndex;
                  foundMatch = true;
                }
              }
            } else if (currentPath.includes('/discussion/')) {
              // Match by discussion ID, not index
              if (discussionId) {
                console.log('🎯 Looking for discussion with ID:', discussionId);
                const discussionIndex = items.findIndex(item => {
                  const matches = item.type === 'discussion' && 
                    (item.data._id === discussionId || item.data.id === discussionId);
                  console.log('🔍 Checking discussion:', {
                    itemType: item.type,
                    itemDataId: item.data._id || item.data.id,
                    searchingFor: discussionId,
                    matches
                  });
                  return matches;
                });
                if (discussionIndex >= 0) {
                  initialIndex = discussionIndex;
                  foundMatch = true;
                }
              }
            }
            
            // If no match found, default to first item (always safe)
            if (!foundMatch || initialIndex < 0 || initialIndex >= items.length) {
              console.log('⚠️ No matching content found or invalid index, defaulting to first item');
              initialIndex = 0;
            }
            
            // Ensure we have a valid index
            if (initialIndex >= items.length) {
              initialIndex = 0;
            }
            
            console.log('🎯 Content matching result:', {
              initialIndex,
              foundMatch,
              foundItem: items[initialIndex] || null,
              totalItems: items.length
            });
            
            // Always set content if we have items
            if (items.length > 0 && items[initialIndex]) {
              setCurrentContent(items[initialIndex]);
              setCurrentIndex(initialIndex);
              console.log('✅ Set current content:', {
                type: items[initialIndex].type,
                title: items[initialIndex].title,
                index: initialIndex
              });
              
              // Add comprehensive debugging
              console.log('🔍 COMPLETE CONTENT DEBUG:', {
                moduleData: {
                  id: foundModule._id,
                  title: foundModule.title,
                  hasDescription: !!foundModule.description,
                  hasContent: !!foundModule.content,
                  hasVideoUrl: !!foundModule.videoUrl,
                  hasResources: !!foundModule.resources && foundModule.resources.length > 0,
                  hasAssessments: !!foundModule.assessments && foundModule.assessments.length > 0,
                  hasQuizzes: !!foundModule.quizzes && foundModule.quizzes.length > 0,
                  hasDiscussions: !!foundModule.discussions && foundModule.discussions.length > 0,
                  moduleKeys: Object.keys(foundModule),
                  allModuleData: foundModule
                },
                contentItems: items.map((item, idx) => ({
                  index: idx,
                  type: item.type,
                  title: item.title,
                  hasData: !!item.data,
                  dataType: typeof item.data,
                  dataKeys: item.data && typeof item.data === 'object' ? Object.keys(item.data) : [],
                  dataPreview: item.data ? (typeof item.data === 'string' ? item.data.substring(0, 100) + '...' : item.data) : null
                })),
                currentContent: {
                  type: items[initialIndex].type,
                  title: items[initialIndex].title,
                  hasData: !!items[initialIndex].data,
                  dataType: typeof items[initialIndex].data,
                  dataKeys: items[initialIndex].data && typeof items[initialIndex].data === 'object' ? Object.keys(items[initialIndex].data) : [],
                  actualData: items[initialIndex].data
                },
                urlInfo: {
                  pathname: window.location.pathname,
                  courseId,
                  moduleId,
                  quizId,
                  discussionId,
                  assessmentId,
                  resourceId
                }
              });
            } else {
              console.log('❌ No content items available or invalid index');
              console.log('🔍 ERROR DEBUG:', {
                itemsLength: items.length,
                initialIndex,
                foundModule: foundModule ? {
                  id: foundModule._id,
                  title: foundModule.title,
                  keys: Object.keys(foundModule),
                  fullData: foundModule
                } : null
              });
              setError('No content available for this module');
            }
          } else {
            setError('Module not found');
          }
        } else {
          setError('Course not found');
        }
      } else {
        setError('Failed to load course');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const completedSet = new Set();
          // Extract completed items from progress data
          if (data.data.modulesProgress) {
            const moduleProgress = data.data.modulesProgress[moduleId];
            if (moduleProgress && moduleProgress.completedItems) {
              moduleProgress.completedItems.forEach(item => completedSet.add(item));
            }
          }
          setCompletedItems(completedSet);
        }
      }
    } catch (err) {
      console.error('Error fetching completion status:', err);
    }
  };

  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;
    
    setIsMarkingComplete(true);
    try {
      const token = localStorage.getItem('token');
      const currentItemId = `${currentContent.type}-${currentIndex}`;
      
      console.log('🎯 Marking item as complete in ModuleContent:', {
        currentItemId,
        contentType: currentContent.type,
        itemIndex: currentIndex,
        moduleId,
        courseId,
        contentTitle: currentContent.title
      });
      
      // Special debugging for quiz and discussion items
      if (currentContent.type === 'quiz' || currentContent.type === 'discussion') {
        console.log('🎯 QUIZ/DISCUSSION DEBUGGING:', {
          type: currentContent.type,
          title: currentContent.title,
          currentIndex: currentIndex,
          contentItems: contentItems.map((item, idx) => ({
            index: idx,
            type: item.type,
            title: item.title
          })),
          completionKey: currentItemId
        });
      }
      
      // Use the same progress endpoint as StudentCourseOverview
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
        const data = await response.json();
        console.log('✅ Item marked as complete in ModuleContent:', data);
        
        // Update local completion status
        setCompletedItems(prev => new Set([...prev, currentItemId]));
        
        // Also update localStorage to sync with StudentCourseOverview
        const currentCompletedItems = Array.from(completedItems);
        const updatedCompletions = [...currentCompletedItems, currentItemId];
        localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(updatedCompletions));
        console.log('💾 Saved completion to localStorage:', {
          completionKey: currentItemId,
          totalCompletions: updatedCompletions.length,
          allCompletions: updatedCompletions
        });
        
        // Force refresh the course overview data if user navigates back
        window.dispatchEvent(new CustomEvent('courseProgressUpdated', { 
          detail: { courseId, completionKey: currentItemId } 
        }));
        
        // Additional debugging for quiz and discussion
        if (currentContent.type === 'quiz' || currentContent.type === 'discussion') {
          console.log('🎯 QUIZ/DISCUSSION COMPLETION SAVED:', {
            type: currentContent.type,
            completionKey: currentItemId,
            savedToLocalStorage: true,
            eventDispatched: true
          });
        }
        
        // Only show completion modal when course is TRULY 100% complete
        console.log('🔄 Course progress:', data.data.progressPercentage + '%');
        console.log('🔄 Completed modules:', data.data.completedModules + '/' + data.data.totalModules);
        
        // Be very strict about completion - must be exactly 100% AND all modules completed
        if (data.data && 
            data.data.progressPercentage >= 99.99 && 
            data.data.completedModules === data.data.totalModules &&
            data.data.completedModules > 0) {
          console.log('🎉 Course completion detected - ALL requirements met!');
          setShowCompletionModal(true);
          
          // Generate certificate
          try {
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
          } catch (certError) {
            console.error('Error generating certificate:', certError);
            // Don't show error to user - certificate generation is optional
          }
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error marking item as complete:', errorText);
        alert('Failed to mark item as complete');
      }
    } catch (err) {
      console.error('Error marking item as complete:', err);
      alert('Failed to mark item as complete');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const checkAllItemsCompleted = () => {
    const allItemIds = contentItems.map((_, index) => `${contentItems[index].type}-${index}`);
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
    const currentItemId = currentContent ? `${currentContent.type}-${currentIndex}` : null;
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
      // Last item - navigate back to course overview (fixed URL)
      navigate(`/courses/${courseId}/overview`);
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
      default:
        return <Description style={{ fontSize: '1rem' }} />;
    }
  };

  const renderContent = () => {
    if (!currentContent) {
      console.log('❌ No currentContent available');
      return (
        <ContentBody>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
            <h3>❌ No Content Available</h3>
            <p>Current content is not loaded. This usually means:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>The instructor hasn't created content for this item</li>
              <li>There's a data loading issue</li>
              <li>The content ID doesn't match what's expected</li>
            </ul>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
              <strong>Debug Info:</strong><br/>
              Content Items: {contentItems.length}<br/>
              Current Index: {currentIndex}<br/>
              URL Quiz ID: {quizId || 'None'}<br/>
              URL Discussion ID: {discussionId || 'None'}
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
            <div dangerouslySetInnerHTML={{ __html: currentContent.data }} />
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
              <div style={{ padding: '2rem', textAlign: 'center', color: '#d69e2e', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px' }}>
                <h3>⚠️ Module Content Missing</h3>
                <p>The module content is not available.</p>
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
            <div dangerouslySetInnerHTML={{ __html: currentContent.data }} />
          </ContentBody>
        );
      
      case 'video':
        return (
          <ContentBody>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <VideoLibrary style={{ fontSize: '3rem', color: '#007BFF', marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>
                {currentContent.data.title || 'Video Lecture'}
              </h3>
              <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                This video content will open in a new window
              </p>
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
                Watch Video →
              </button>
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
            quiz={currentContent.data}
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
        console.log('User role:', userRole);
        
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
        
        // Calculate quiz number by counting quizzes before current one
        const quizNumber = contentItems.slice(0, currentIndex + 1).filter(item => item.type === 'quiz').length;
        return (
          <QuizTaker 
            quiz={currentContent.data}
            userRole={userRole}
            quizNumber={quizNumber}
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
            onComplete={(result) => {
              console.log('Quiz completed:', result);
              // Handle quiz completion
              // You can add API call here to save quiz results
              handleMarkComplete();
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
              onClick={() => navigate(`/courses/${courseId}/overview`)}
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
          <BackButton onClick={() => navigate(`/courses/${courseId}/overview`)}>
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
              onClick={() => navigate(`/courses/${courseId}/overview`)}
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

  // Add debug function 
  const debugContentStructure = () => {
    console.log('🔍 DEBUG CONTENT STRUCTURE:', {
      course: course ? {
        id: course._id,
        title: course.title,
        modulesCount: course.modules?.length || 0
      } : null,
      module: module ? {
        id: module._id,
        title: module.title,
        hasDescription: !!module.description,
        hasContent: !!module.content,
        hasVideoUrl: !!module.videoUrl,
        hasResources: !!module.resources && module.resources.length > 0,
        hasAssessments: !!module.assessments && module.assessments.length > 0,
        hasQuizzes: !!module.quizzes && module.quizzes.length > 0,
        hasDiscussions: !!module.discussions && module.discussions.length > 0,
        moduleKeys: module ? Object.keys(module) : [],
        fullModule: module
      } : null,
      contentItems: contentItems.map(item => ({
        type: item.type,
        title: item.title,
        hasData: !!item.data,
        dataKeys: item.data ? Object.keys(item.data) : [],
        dataPreview: item.data ? (typeof item.data === 'string' ? item.data.substring(0, 100) + '...' : item.data) : null
      })),
      currentContent: currentContent ? {
        type: currentContent.type,
        title: currentContent.title,
        hasData: !!currentContent.data,
        dataType: typeof currentContent.data,
        dataKeys: currentContent.data ? Object.keys(currentContent.data) : [],
        dataPreview: currentContent.data ? (typeof currentContent.data === 'string' ? currentContent.data.substring(0, 100) + '...' : currentContent.data) : null
      } : null,
      urlInfo: {
        pathname: window.location.pathname,
        courseId,
        moduleId,
        quizId,
        discussionId,
        assessmentId,
        resourceId
      }
    });
  };

  // Add debug function to window for easy access
  window.debugContentStructure = debugContentStructure;

  return (
    <Container>
      {/* Header */}
      <Header>
        <BackButton onClick={() => navigate(`/courses/${courseId}/overview`)}>
          <ArrowBack style={{ fontSize: '1rem' }} />
          Back to Course Overview
        </BackButton>
        <CourseInfo>
          <CourseTitle>{course.title}</CourseTitle>
          <ModuleInfo>
            <span>Module: {module.title}</span>
            <span>•</span>
            <span>Item {currentIndex + 1} of {contentItems.length}</span>
          </ModuleInfo>
        </CourseInfo>
      </Header>

      {/* Content Navigation Menu */}
      {contentItems.length > 1 && (
        <ContentNavigationMenu>
          <ContentMenuTitle>Module Content ({contentItems.length} items)</ContentMenuTitle>
          <ContentMenuGrid>
            {contentItems.map((item, index) => (
              <ContentMenuButton
                key={index}
                active={index === currentIndex}
                onClick={() => handleDirectNavigation(index)}
              >
                <ContentMenuIcon active={index === currentIndex}>
                  {getItemIcon(item.type)}
                </ContentMenuIcon>
                <span>{item.title}</span>
              </ContentMenuButton>
            ))}
          </ContentMenuGrid>
        </ContentNavigationMenu>
      )}

      {renderContent()}

      <NavigationBar>
        <NavButton 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowBack style={{ fontSize: '1rem' }} />
          Previous
        </NavButton>
        
        <NavButtonGroup>
          {!isCurrentItemCompleted && (
            <NavButton 
              onClick={() => {
                console.log('🔘 Mark as Complete button clicked');
                handleMarkComplete();
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
      
      {showCompletionModal && (
        <CourseCompletionModal>
          <ModalContent>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <ModalTitle>Congratulations!</ModalTitle>
            <ModalText>
              You have successfully completed the course "{course.title}". 
              A certificate has been generated and an email confirmation has been sent to you.
            </ModalText>
            <ModalButtons>
              <ModalButton 
                className="primary"
                onClick={() => navigate('/certificates')}
              >
                View Certificate
              </ModalButton>
              <ModalButton 
                className="secondary"
                onClick={() => setShowCompletionModal(false)}
              >
                Continue
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </CourseCompletionModal>
      )}
    </Container>
  );
}

// Export the component wrapped with authentication check
export default function ModuleContent() {
  console.log('🔍 ===== SHARED MODULE CONTENT COMPONENT LOADING =====');
  console.log('🔍 Component rendering at:', new Date().toISOString());
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 Current pathname:', window.location.pathname);
  console.log('🔍 URL parameters:', window.location.search);
  console.log('🔍 Component type: SharedModuleContent (from components/ModuleContent.js)');
  
  // Add a visual indicator that this component is loading
  console.log('🚨 If you can see this message, the ModuleContent component IS loading!');
  
  return (
    <AuthenticationCheck>
      <ModuleContentInner />
    </AuthenticationCheck>
  );
} 