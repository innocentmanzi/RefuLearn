import React, { useState } from 'react';
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

// Advanced mock group data
const mockGroups = [
  {
    id: 1,
    name: 'Web Dev Group',
    summary: 'A group for learning web development with peers.',
    purpose: 'Collaborate on web projects, share resources, and help each other grow.',
    openDate: '2025-06-01',
    closeDate: '2025-06-30',
    joined: false,
    participants: 12,
    totalParticipants: 20,
    resources: [
      { type: 'link', label: 'React Docs', url: 'https://reactjs.org/', description: 'Official React documentation.' },
      { type: 'video', label: 'Intro to HTML', url: 'https://www.youtube.com/embed/pQN-pnXPaVg', description: 'Beginner HTML tutorial.' },
      { type: 'file', label: 'CSS Cheat Sheet', url: '#', description: 'Downloadable CSS reference.' },
    ],
    comments: [
      {
        id: 1,
        user: 'Aisha',
        avatar: 'A',
        text: "Welcome to the group! Let's build something awesome.",
        timestamp: '2025-06-01 10:00',
        replies: [
          {
            id: 2,
            user: 'David',
            avatar: 'D',
            text: 'Great to be here! I recommend starting with the React docs.',
            timestamp: '2025-06-01 10:30',
          },
        ],
      },
      {
        id: 3,
        user: 'Sophie',
        avatar: 'S',
        text: 'Does anyone have a good CSS resource?',
        timestamp: '2025-06-02 09:00',
        replies: [],
      },
    ],
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState(mockGroups);
  const group = groups.find(g => g.id === Number(groupId));
  const [joined, setJoined] = useState(group?.joined);
  const [tab, setTab] = useState('discussion');
  const [comments, setComments] = useState(group?.comments || []);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  if (!group) return (
    <Container>
      <BackButton onClick={() => navigate('/peer-learning')}>&larr; Back</BackButton>
      <h2>Group not found.</h2>
      <p>The group you are looking for does not exist or has been removed.</p>
    </Container>
  );

  const percent = Math.round((group.participants / group.totalParticipants) * 100);

  const handleJoin = () => {
    setJoined(true);
    // In a real app, update backend and state
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        user: 'You',
        avatar: 'Y',
        text: commentText,
        timestamp: new Date().toLocaleString(),
        replies: [],
      },
    ]);
    setCommentText('');
  };

  const handleReply = (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setComments(comments.map(c =>
      c.id === commentId
        ? {
            ...c,
            replies: [
              ...c.replies,
              {
                id: Date.now(),
                user: 'You',
                avatar: 'Y',
                text: replyText,
                timestamp: new Date().toLocaleString(),
              },
            ],
          }
        : c
    ));
    setReplyTo(null);
    setReplyText('');
  };

  return (
    <Container>
      {joined && (
        <BackButton onClick={() => navigate('/peer-learning')}>&larr; Back</BackButton>
      )}
      <Title>{group.name}</Title>
      <Section>
        <h2>Purpose</h2>
        <p>{group.purpose}</p>
        <h3>Summary</h3>
        <p>{group.summary}</p>
        <div><b>Opened:</b> {formatDate(group.openDate)} &nbsp; <b>Closes:</b> {formatDate(group.closeDate)}</div>
        <div style={{ margin: '1rem 0' }}>
          <b>Progress:</b> {group.participants}/{group.totalParticipants} learners participated
          <ProgressBarContainer>
            <ProgressBarFill percent={percent} />
          </ProgressBarContainer>
          <span>{percent}%</span>
        </div>
        {!joined && (
          <Button onClick={handleJoin}>Join Group</Button>
        )}
      </Section>
      {joined && (
        <>
          <Tabs>
            <Tab active={tab === 'discussion'} onClick={() => setTab('discussion')}>Discussion</Tab>
            <Tab active={tab === 'resources'} onClick={() => setTab('resources')}>Resources</Tab>
            <Tab active={tab === 'videos'} onClick={() => setTab('videos')}>Videos</Tab>
            <Tab active={tab === 'progress'} onClick={() => setTab('progress')}>Progress</Tab>
          </Tabs>
          {tab === 'discussion' && (
            <CommentSection>
              <h2>Discussion</h2>
              <CommentList>
                {comments.map((c) => (
                  <CommentItem key={c.id}>
                    <CommentHeader>
                      <Avatar>{c.avatar}</Avatar>
                      <b>{c.user}</b>
                      <CommentMeta>{c.timestamp}</CommentMeta>
                      <ReplyButton onClick={() => setReplyTo(c.id)}>Reply</ReplyButton>
                    </CommentHeader>
                    <div>{c.text}</div>
                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <CommentList style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                        {c.replies.map((r) => (
                          <CommentItem key={r.id}>
                            <CommentHeader>
                              <Avatar>{r.avatar}</Avatar>
                              <b>{r.user}</b>
                              <CommentMeta>{r.timestamp}</CommentMeta>
                            </CommentHeader>
                            <div>{r.text}</div>
                          </CommentItem>
                        ))}
                      </CommentList>
                    )}
                    {/* Reply form */}
                    {replyTo === c.id && (
                      <ReplyForm onSubmit={e => handleReply(e, c.id)}>
                        <CommentInput
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                        />
                        <CommentButton type="submit">Reply</CommentButton>
                      </ReplyForm>
                    )}
                  </CommentItem>
                ))}
              </CommentList>
              <form onSubmit={handleComment} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <CommentInput
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                />
                <CommentButton type="submit">Post</CommentButton>
              </form>
            </CommentSection>
          )}
          {tab === 'resources' && (
            <Section>
              <h2>Resources</h2>
              <ResourceList>
                {group.resources.map((res, idx) => (
                  <ResourceItem key={idx}>
                    <div><b>{res.label}</b> <span style={{ color: '#888' }}>({res.type})</span></div>
                    <div style={{ marginBottom: '0.5rem' }}>{res.description}</div>
                    {res.type === 'link' && <a href={res.url} target="_blank" rel="noopener noreferrer">🔗 Open Link</a>}
                    {res.type === 'file' && <span>📄 Download (coming soon)</span>}
                  </ResourceItem>
                ))}
              </ResourceList>
            </Section>
          )}
          {tab === 'videos' && (
            <Section>
              <h2>Videos</h2>
              {group.resources.filter(r => r.type === 'video').map((video, idx) => (
                <VideoFrame key={idx} src={video.url} allowFullScreen title={video.label} />
              ))}
            </Section>
          )}
          {tab === 'progress' && (
            <Section>
              <h2>Group Progress</h2>
              <div style={{ marginBottom: '1rem' }}>
                <b>Participants:</b> {group.participants}/{group.totalParticipants}
              </div>
              <ProgressBarContainer>
                <ProgressBarFill percent={percent} />
              </ProgressBarContainer>
              <span>{percent}% learners have participated</span>
            </Section>
          )}
        </>
      )}
    </Container>
  );
};

export default GroupDetails; 