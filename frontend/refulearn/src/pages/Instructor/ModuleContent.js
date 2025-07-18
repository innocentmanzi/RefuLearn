import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowBack, ArrowForward, Description, VideoLibrary, Link, Assignment, Quiz, Forum, CheckCircle, RadioButtonUnchecked, Send, ThumbUp, Reply, MoreVert } from '@mui/icons-material';
import QuizTaker from '../../components/QuizTaker';
import offlineIntegrationService from '../../services/offlineIntegrationService';

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

  useEffect(() => {
    if (discussion && discussion._id) {
      fetchReplies();
      
      // Set up periodic refresh to get new replies from other users
      const refreshInterval = setInterval(() => {
        fetchReplies();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(refreshInterval);
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
      
      console.log('Fetching replies for discussion:', discussion._id);
      
      // Store current replies as backup
      const currentReplies = replies;
      
      // Fetch replies from backend
      const response = await fetch(`/api/courses/discussions/${discussion._id}/replies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch replies response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched replies data:', data);
        
        // Handle different response formats
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
        
        console.log('Setting replies:', repliesData);
        
        // Only update if we got valid data, otherwise keep current replies
        if (repliesData && repliesData.length >= 0) {
          setReplies(repliesData);
        } else {
          console.log('No valid replies data, keeping current replies');
          setReplies(currentReplies);
        }
      } else {
        console.error('Failed to fetch replies, status:', response.status);
        // Try to get error details
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        // Keep current replies instead of clearing them
        console.log('Keeping current replies due to fetch error');
        setReplies(currentReplies.length > 0 ? currentReplies : (discussion.replies || []));
      }
    } catch (err) {
      console.error('Error fetching replies:', err);
      // Keep current replies instead of clearing them
      console.log('Keeping current replies due to network error');
      setReplies(replies.length > 0 ? replies : (discussion.replies || []));
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

      console.log('Submitting reply to discussion:', discussion._id);
      console.log('Reply content:', newReply.trim());
      console.log('User:', user);
      console.log('User name:', user.name);
      console.log('User fullName:', user.fullName);
      console.log('User firstName:', user.firstName);
      console.log('User lastName:', user.lastName);

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

      console.log('Response status:', response.status);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Response data:', data);
          
          // Always create a reply object and add it to the list
          // Since backend returns 200, we know the reply was saved successfully
          const replyObject = {
            _id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
            content: newReply.trim(),
            author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: []
          };
          
          console.log('Adding reply object:', replyObject);
          setReplies(prev => [...prev, replyObject]);
          setNewReply('');
          console.log('Reply submitted successfully!');
          
          // Also try to refresh replies from server after a short delay
          setTimeout(() => {
            fetchReplies();
          }, 500);
          
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
            replies: []
          };
          
          setReplies(prev => [...prev, replyObject]);
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
    try {
      const token = localStorage.getItem('token');
      const isLiked = likedPosts.has(postId);
      
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
      
      // Update replies with like count
      setReplies(prev => prev.map(reply => 
        reply._id === postId 
          ? { ...reply, likes: (reply.likes || 0) + (isLiked ? -1 : 1) }
          : reply
      ));
      
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
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleReplyToPost = async (postId) => {
    if (!replyText.trim()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('Replying to post:', postId);
      console.log('Reply text:', replyText.trim());

      // First, try to add the nested reply as a regular reply to the discussion
      // This is more reliable than the nested reply endpoint
      const response = await fetch(`/api/courses/discussions/${discussion._id}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `@${replies.find(r => r._id === postId)?.author || 'User'}: ${replyText.trim()}`,
          author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          parentReplyId: postId // Include parent reference for context
        })
      });

      console.log('Nested reply response status:', response.status);

      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Nested reply response data:', data);
          
          // Create the reply object for immediate UI update
          const replyObject = {
            _id: Date.now().toString() + '_nested_' + Math.random().toString(36).substr(2, 9),
            content: `@${replies.find(r => r._id === postId)?.author || 'User'}: ${replyText.trim()}`,
            author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: [],
            parentReplyId: postId
          };

          // Add as a regular reply (not nested) to avoid complexity
          setReplies(prev => [...prev, replyObject]);
          
          setReplyText('');
          setReplyingTo(null);
          console.log('Nested reply added successfully as regular reply');
          
          // Refresh replies from server after a short delay
          setTimeout(() => {
            fetchReplies();
          }, 1000);
          
        } catch (parseError) {
          console.error('Error parsing nested reply response:', parseError);
          // Still add the reply to UI since we got 200
          const replyObject = {
            _id: Date.now().toString() + '_nested_' + Math.random().toString(36).substr(2, 9),
            content: `@${replies.find(r => r._id === postId)?.author || 'User'}: ${replyText.trim()}`,
            author: user.name || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: [],
            parentReplyId: postId
          };

          setReplies(prev => [...prev, replyObject]);
          setReplyText('');
          setReplyingTo(null);
          console.log('Nested reply added successfully (fallback)');
        }
      } else {
        console.error('Failed to submit nested reply, status:', response.status);
        // Don't show alert, just close the reply form
        setReplyText('');
        setReplyingTo(null);
        console.log('Nested reply failed, form closed');
      }
    } catch (err) {
      console.error('Error replying to post:', err);
      // Don't show alert, just close the reply form to prevent errors
      setReplyText('');
      setReplyingTo(null);
      console.log('Nested reply error, form closed');
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
                    onClick={() => setReplyingTo(post._id)}
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

export default function ModuleContent() {
  const { courseId, moduleId, resourceId, assessmentId, quizId, discussionId, itemId } = useParams();
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
    
    fetchCourseAndModule();
    fetchCompletionStatus();
  }, [courseId, moduleId]);

  // Build content items when module data is loaded
  useEffect(() => {
    if (module && module.title !== 'Module Loading...') {
      console.log('🔧 Building content items from module:', module);
      const items = [];
      
      // Add module content
      if (module.content) {
        items.push({
          type: 'content',
          title: 'Content',
          data: module.content
        });
      }
      
      // Add video content
      if (module.videoUrl) {
        items.push({
          type: 'video',
          title: module.videoTitle || 'Video Lecture',
          data: {
            url: module.videoUrl,
            title: module.videoTitle
          }
        });
      }
      
      // Add content items
      if (module.contentItems && Array.isArray(module.contentItems)) {
        module.contentItems.forEach((item, index) => {
          items.push({
            type: 'content-item',
            title: item.title || `Content Item ${index + 1}`,
            data: item
          });
        });
      }
      
      // Add assessments
      if (module.assessments && Array.isArray(module.assessments)) {
        module.assessments.forEach((assessment, index) => {
          items.push({
            type: 'assessment',
            title: assessment.title || `Assignment ${index + 1}`,
            data: assessment
          });
        });
      }
      
      // Add quizzes
      if (module.quizzes && Array.isArray(module.quizzes)) {
        module.quizzes.forEach((quiz, index) => {
          items.push({
            type: 'quiz',
            title: quiz.title || `Quiz ${index + 1}`,
            data: quiz
          });
        });
      }
      
      // Add discussions
      if (module.discussions && Array.isArray(module.discussions)) {
        module.discussions.forEach((discussion, index) => {
          items.push({
            type: 'discussion',
            title: discussion.title || `Discussion ${index + 1}`,
            data: discussion
          });
        });
      }
      
      // Add resources
      if (module.resources && Array.isArray(module.resources)) {
        module.resources.forEach((resource, index) => {
          items.push({
            type: 'resource',
            title: resource.title || `Resource ${index + 1}`,
            data: resource
          });
        });
      }
      
      console.log('📝 Built content items:', items);
      setContentItems(items);
      
      // Set current content based on URL parameters
      let targetIndex = 0;
      
      if (itemId !== undefined) {
        // For content-item routes like /content-item/0
        const index = parseInt(itemId, 10);
        if (index >= 0 && index < items.length) {
          targetIndex = index;
        }
      } else if (assessmentId !== undefined) {
        // Find assessment by ID or index
        const index = items.findIndex(item => 
          item.type === 'assessment' && 
          (item.data._id === assessmentId || items.indexOf(item) === parseInt(assessmentId, 10))
        );
        if (index >= 0) targetIndex = index;
      } else if (quizId !== undefined) {
        // Find quiz by ID or index
        const index = items.findIndex(item => 
          item.type === 'quiz' && 
          (item.data._id === quizId || items.indexOf(item) === parseInt(quizId, 10))
        );
        if (index >= 0) targetIndex = index;
      } else if (discussionId !== undefined) {
        // Find discussion by ID or index
        const index = items.findIndex(item => 
          item.type === 'discussion' && 
          (item.data._id === discussionId || items.indexOf(item) === parseInt(discussionId, 10))
        );
        if (index >= 0) targetIndex = index;
      } else if (resourceId !== undefined) {
        // Find resource by ID or index
        const index = items.findIndex(item => 
          item.type === 'resource' && 
          (item.data._id === resourceId || items.indexOf(item) === parseInt(resourceId, 10))
        );
        if (index >= 0) targetIndex = index;
      } else if (window.location.pathname.includes('/content')) {
        // For basic content route
        const index = items.findIndex(item => item.type === 'content');
        if (index >= 0) targetIndex = index;
      } else if (window.location.pathname.includes('/video')) {
        // For video route
        const index = items.findIndex(item => item.type === 'video');
        if (index >= 0) targetIndex = index;
      }
      
      setCurrentIndex(targetIndex);
      if (items[targetIndex]) {
        setCurrentContent(items[targetIndex]);
      }
    }
  }, [module]);

  const fetchCourseAndModule = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      console.log('🔍 ModuleContent: Fetching data for courseId:', courseId, 'moduleId:', moduleId);
      
      let moduleData = null;
      let courseData = null;

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching module content from API...');
          
          // Fetch module content
          const moduleResponse = await fetch(`/api/courses/modules/${moduleId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (moduleResponse.ok) {
            const moduleApiData = await moduleResponse.json();
            console.log('📦 Module API response:', moduleApiData);
            
            if (moduleApiData.success && moduleApiData.data && moduleApiData.data.module) {
              moduleData = moduleApiData.data.module;
              console.log('✅ Module content received:', moduleData);
              
              // Store module data for offline use
              await offlineIntegrationService.storeModuleContent(moduleId, moduleData);
            } else {
              console.error('❌ Invalid module data structure:', moduleApiData);
              throw new Error('Invalid module data received from API');
            }
          } else {
            const errorText = await moduleResponse.text();
            console.error('❌ Module API Error:', moduleResponse.status, errorText);
            throw new Error(`Failed to fetch module content: ${moduleResponse.status}`);
          }

          // Fetch course data
          const courseResponse = await fetch(`/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (courseResponse.ok) {
            const courseApiData = await courseResponse.json();
            console.log('📦 Course API response:', courseApiData);
            
            if (courseApiData.success && courseApiData.data && courseApiData.data.course) {
              courseData = courseApiData.data.course;
              console.log('✅ Course data received:', courseData);
              
              // Store course data for offline use
              await offlineIntegrationService.storeCourseData(courseId, courseData);
            } else {
              console.error('❌ Invalid course data structure:', courseApiData);
              throw new Error('Invalid course data received from API');
            }
          } else {
            const errorText = await courseResponse.text();
            console.error('❌ Course API Error:', courseResponse.status, errorText);
            throw new Error(`Failed to fetch course data: ${courseResponse.status}`);
          }

        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          
          try {
            // Fall back to offline data if online fails
            moduleData = await offlineIntegrationService.getModuleContent(moduleId);
            courseData = await offlineIntegrationService.getCourseData(courseId);
            
            console.log('📴 Offline module data:', moduleData);
            console.log('📴 Offline course data:', courseData);
            
            if (!moduleData || !courseData) {
              console.error('❌ No offline data available');
              throw new Error('No module or course data available offline');
            }
          } catch (offlineError) {
            console.error('❌ Offline data also failed:', offlineError);
            throw new Error('Failed to load module data both online and offline');
          }
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline module content data...');
        moduleData = await offlineIntegrationService.getModuleContent(moduleId);
        courseData = await offlineIntegrationService.getCourseData(courseId);
      }

      // Validate and set the data
      if (moduleData && courseData) {
        console.log('✅ Setting module and course data');
        setModule(moduleData);
        setCourse(courseData);
      } else {
        console.error('❌ Missing data - moduleData:', !!moduleData, 'courseData:', !!courseData);
        throw new Error('Module or course data is missing');
      }
    } catch (err) {
      console.error('❌ Error fetching module content:', err);
      setError(err.message || 'Failed to load module content');
      
      // Set minimal fallback data to prevent undefined errors
      if (!module) {
        setModule({
          title: 'Module Loading...',
          content: 'Content is being loaded...',
          contentItems: [],
          assessments: [],
          quizzes: [],
          discussions: [],
          resources: []
        });
      }
      if (!course) {
        setCourse({
          title: 'Course Loading...'
        });
      }
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
      
      // Mark current item as complete
      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: currentItemId,
          itemType: currentContent.type,
          itemTitle: currentContent.title
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local completion status
        setCompletedItems(prev => new Set([...prev, currentItemId]));
        
        // Check if course is completed
        if (data.data && data.data.courseCompleted) {
          setShowCompletionModal(true);
          
          // Send completion email
          await fetch(`/api/courses/${courseId}/send-completion-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Generate certificate
          await fetch(`/api/certificates/generate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              courseId: courseId,
              courseName: course.title
            })
          });
        }
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

  const getContentDuration = () => {
    switch (currentContent?.type) {
      case 'video': return currentContent.data.duration || '10 min';
      case 'content': return '5 min';
      case 'quiz': return '10 min';
      case 'assessment': return '20 min';
      case 'resource': return '3 min';
      case 'discussion': return '15 min';
      default: return '5 min';
    }
  };

  const getContentTypeLabel = () => {
    switch (currentContent?.type) {
      case 'video': return 'Video';
      case 'content': return 'Reading';
      case 'quiz': return 'Quiz';
      case 'assessment': return 'Assignment';
      case 'resource': return 'Resource';
      case 'discussion': return 'Discussion';
      default: return 'Content';
    }
  };

  const renderContent = () => {
    if (!currentContent) return null;

    switch (currentContent.type) {
      case 'content':
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
        const calculateTimeRemaining = (dueDate) => {
          if (!dueDate) return null;
          
          const now = new Date();
          const due = new Date(dueDate);
          const timeDiff = due.getTime() - now.getTime();
          
          if (timeDiff <= 0) {
            return { text: 'Overdue', color: '#dc2626', isOverdue: true };
          }
          
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            return { text: `${days} day${days > 1 ? 's' : ''} remaining`, color: '#059669' };
          } else if (hours > 0) {
            return { text: `${hours} hour${hours > 1 ? 's' : ''} remaining`, color: hours > 12 ? '#059669' : '#d97706' };
          } else {
            return { text: `${minutes} minute${minutes > 1 ? 's' : ''} remaining`, color: '#dc2626' };
          }
        };

        const timeRemaining = calculateTimeRemaining(currentContent.data.dueDate);

        return (
          <ContentBody>
            <p><strong>{currentContent.title}</strong></p>
            {currentContent.data.description && (
              <p>{currentContent.data.description}</p>
            )}
            
            {currentContent.data.totalPoints && (
              <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>
                <strong>Points:</strong> {currentContent.data.totalPoints}
              </p>
            )}
            
            {currentContent.data.dueDate && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#374151' }}>
                  <strong>Due Date:</strong> {new Date(currentContent.data.dueDate).toLocaleDateString()} at {new Date(currentContent.data.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {timeRemaining && (
                  <p style={{ 
                    margin: '0', 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    color: timeRemaining.color 
                  }}>
                    {timeRemaining.text}
                  </p>
                )}
              </div>
            )}
          </ContentBody>
        );
      
      case 'quiz':
        console.log('Quiz data being passed to QuizTaker:', currentContent.data);
        console.log('User role:', userRole);
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
        // Calculate discussion index by counting discussions before current one
        const discussionIndex = contentItems.slice(0, currentIndex).filter(item => item.type === 'discussion').length;
        return <DiscussionComponent discussion={currentContent.data} courseId={courseId} moduleId={moduleId} discussionIndex={discussionIndex} />;
      
      default:
        return <ContentBody>Content type not supported</ContentBody>;
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

  if (error) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(`/instructor/courses/${courseId}/overview`)}>
            <ArrowBack />
            Back to Course Overview
          </BackButton>
        </Header>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <h3>Error Loading Module Content</h3>
          <p>{error}</p>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
            Please check the browser console for more details, or try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#007BFF',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginTop: '1rem',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </Container>
    );
  }

  if (!course || !module) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(`/instructor/courses/${courseId}/overview`)}>
            <ArrowBack />
            Back to Course Overview
          </BackButton>
        </Header>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Content not found or still loading...</div>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
            If this persists, please check the browser console for errors.
          </p>
        </div>
      </Container>
    );
  }

  const completedCount = Array.from(completedItems).filter(id => 
    contentItems.some((_, idx) => `${contentItems[idx].type}-${idx}` === id)
  ).length;
  const progress = contentItems.length > 0 ? (completedCount / contentItems.length) * 100 : 0;
  const currentItemId = currentContent ? `${currentContent.type}-${currentIndex}` : null;
  const isCurrentItemCompleted = currentItemId ? completedItems.has(currentItemId) : false;

  const handleMarkCompleteAndNext = async () => {
    if (!isCurrentItemCompleted) {
      await handleMarkComplete();
    }
    if (currentIndex < contentItems.length - 1) {
      handleNext();
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(`/instructor/courses/${courseId}/overview`)}>
          <ArrowBack />
          Back to Course Overview
        </BackButton>
        
        <CourseInfo>
          <CourseTitle>{course?.title || 'Course'}</CourseTitle>
          <ModuleInfo>
            Module: {module?.title || 'Module'} • {getContentTypeLabel()} • {getContentDuration()}
          </ModuleInfo>
        </CourseInfo>
        
        <ContentHeader>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>
              {currentContent?.title || 'Content'}
            </h2>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {currentIndex + 1} of {contentItems.length}
            </div>
          </div>
          
          {contentItems.length > 0 && (
            <div style={{ 
              background: '#f3f4f6', 
              borderRadius: '8px', 
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              Progress: {Math.round((currentIndex / contentItems.length) * 100)}%
            </div>
          )}
        </ContentHeader>
      </Header>

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
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
            >
              {isMarkingComplete ? 'Marking...' : 'Mark as Complete'}
            </NavButton>
          )}
          
          <NavButton 
            primary
            onClick={handleMarkCompleteAndNext}
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