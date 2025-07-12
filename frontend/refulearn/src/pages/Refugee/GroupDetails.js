import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;
const Section = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;
const ProgressBarContainer = styled.div`
  background: #e0e0e0;
  border-radius: 8px;
  height: 16px;
  width: 100%;
  margin: 0.5rem 0;
`;
const ProgressBarFill = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  height: 100%;
  border-radius: 8px;
  width: ${({ percent }) => percent}%;
  transition: width 0.3s;
`;
const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;
const Tab = styled.button`
  background: ${({ active, theme }) => (active ? theme.colors.primary : '#fff')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.colors.primary)};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
`;
const ResourceList = styled.ul`
  list-style: none;
  padding: 0;
`;
const ResourceItem = styled.li`
  margin-bottom: 1.25rem;
`;
const VideoFrame = styled.iframe`
  width: 100%;
  height: 320px;
  border: none;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;
const CommentSection = styled.div``;
const CommentList = styled.ul`
  list-style: none;
  padding: 0;
`;
const CommentItem = styled.li`
  background: #f4f6fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;
const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;
const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #b3c6ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
`;
const CommentMeta = styled.div`
  font-size: 0.85rem;
  color: #888;
`;
const ReplyButton = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 1rem;
`;
const ReplyForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;
const CommentInput = styled.textarea`
  flex: 1;
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 0.75rem;
  font-size: 1rem;
`;
const CommentButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
`;
const BackButton = styled.button`
  background: #eee;
  color: #333;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  margin-right: 1rem;
`;

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [comment, setComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/peer-learning/groups/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const groupData = await response.json();
          setGroup(groupData.data.group);
        } else {
          setError('Failed to load group details');
        }
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('Failed to load group details');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const handleJoin = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/peer-learning/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setGroup(prev => ({ ...prev, joined: true, participants: prev.participants + 1 }));
        alert('Successfully joined the group!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/peer-learning/groups/${groupId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });

      if (response.ok) {
        const commentData = await response.json();
        setGroup(prev => ({
          ...prev,
          comments: [...prev.comments, commentData.data.comment]
        }));
        setComment('');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/peer-learning/groups/${groupId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: replyText })
      });

      if (response.ok) {
        const replyData = await response.json();
        setGroup(prev => ({
          ...prev,
          comments: prev.comments.map(c => 
            c._id === commentId 
              ? { ...c, replies: [...c.replies, replyData.data.reply] }
              : c
          )
        }));
        setReplyText('');
        setReplyingTo(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading group details...</div>
        </div>
      </Container>
      );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <div>{error}</div>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Container>
    );
  }

  if (!group) {
    return <Container>Group not found.</Container>;
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/peer-learning')}>← Back to Groups</BackButton>
      
      <Title>{group.name}</Title>
      
      <Tabs>
        <Tab 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Tab>
        <Tab 
          active={activeTab === 'resources'} 
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </Tab>
        <Tab 
          active={activeTab === 'discussion'} 
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </Tab>
      </Tabs>

      {activeTab === 'overview' && (
        <Section>
          <h3>About this Group</h3>
          <p>{group.summary}</p>
          <p><strong>Purpose:</strong> {group.purpose}</p>
          <p><strong>Open Date:</strong> {new Date(group.openDate).toLocaleDateString()}</p>
          <p><strong>Close Date:</strong> {new Date(group.closeDate).toLocaleDateString()}</p>
          <p><strong>Participants:</strong> {group.participants}/{group.totalParticipants}</p>
          
          <ProgressBarContainer>
            <ProgressBarFill percent={(group.participants / group.totalParticipants) * 100} />
          </ProgressBarContainer>
          
          {!group.joined && (
            <Button onClick={handleJoin} disabled={submitting}>
              {submitting ? 'Joining...' : 'Join Group'}
            </Button>
          )}
        </Section>
      )}

      {activeTab === 'resources' && (
        <Section>
          <h3>Learning Resources</h3>
          <ResourceList>
            {group.resources.map((resource, index) => (
              <ResourceItem key={index}>
                <strong>{resource.label}</strong>
                <p>{resource.description}</p>
                {resource.type === 'video' ? (
                  <VideoFrame 
                    src={resource.url} 
                    title={resource.label}
                    allowFullScreen
                  />
                ) : (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Button>View Resource</Button>
                  </a>
                )}
              </ResourceItem>
            ))}
          </ResourceList>
        </Section>
      )}

      {activeTab === 'discussion' && (
        <Section>
          <h3>Group Discussion</h3>
          <CommentSection>
            <form onSubmit={handleComment}>
              <CommentInput
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                disabled={submitting}
              />
              <CommentButton type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </CommentButton>
            </form>
            
            <CommentList>
              {group.comments.map((comment) => (
                <CommentItem key={comment._id}>
                  <CommentHeader>
                    <Avatar>{comment.user.charAt(0).toUpperCase()}</Avatar>
                    <div>
                      <strong>{comment.user}</strong>
                      <CommentMeta>{comment.timestamp}</CommentMeta>
                    </div>
                  </CommentHeader>
                  <p>{comment.text}</p>
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                      {comment.replies.map((reply) => (
                        <CommentItem key={reply._id} style={{ marginBottom: '0.5rem' }}>
                          <CommentHeader>
                            <Avatar style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}>
                              {reply.user.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <strong>{reply.user}</strong>
                              <CommentMeta>{reply.timestamp}</CommentMeta>
                            </div>
                          </CommentHeader>
                          <p>{reply.text}</p>
                        </CommentItem>
                      ))}
                    </div>
                  )}
                  
                  <ReplyButton onClick={() => setReplyingTo(comment._id)}>
                    Reply
                  </ReplyButton>
                  
                  {replyingTo === comment._id && (
                    <ReplyForm onSubmit={(e) => handleReply(e, comment._id)}>
                      <CommentInput
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        disabled={submitting}
                      />
                      <CommentButton type="submit" disabled={submitting}>
                        {submitting ? 'Posting...' : 'Reply'}
                      </CommentButton>
                    </ReplyForm>
                  )}
                </CommentItem>
              ))}
            </CommentList>
          </CommentSection>
        </Section>
      )}
    </Container>
  );
};

export default GroupDetails; 