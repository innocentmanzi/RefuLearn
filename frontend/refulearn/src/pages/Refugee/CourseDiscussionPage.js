import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, Forum, Send, ThumbUp, Reply, Person, AccessTime, Assignment } from '@mui/icons-material';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
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
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 1rem;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
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

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
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
  const { courseId, discussionId } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [course, setCourse] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likes, setLikes] = useState({});

  useEffect(() => {
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

      <DiscussionInfo>
        <Forum />
        <span>Course Discussion</span>
        <AccessTime />
        <span>Posted {new Date(discussion.createdAt).toLocaleDateString()}</span>
      </DiscussionInfo>

      <PostContainer>
        <PostHeader>
          <Avatar>
            <Person />
          </Avatar>
          <PostMeta>
            <h4>{discussion.author?.name || 'Anonymous'}</h4>
            <p>{new Date(discussion.createdAt).toLocaleString()}</p>
          </PostMeta>
        </PostHeader>
        
        <PostContent>
          {discussion.content}
        </PostContent>
        
        <PostActions>
          <ActionButton onClick={() => handleLike(discussionId, false)}>
            <ThumbUp />
            <span>{likes[discussionId] || 0} Likes</span>
          </ActionButton>
          <ActionButton>
            <Reply />
            <span>{replies.length} Replies</span>
          </ActionButton>
        </PostActions>
      </PostContainer>

      {/* Replies */}
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

      {/* Reply Form */}
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
    </Container>
  );
};

export default CourseDiscussionPage; 