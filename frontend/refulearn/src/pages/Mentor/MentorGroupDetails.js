import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;
const BackButton = styled.button`
  background: #eee;
  color: #333;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  &:hover { background: #ddd; }
`;
const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;
const Meta = styled.div`
  color: #666;
  margin-bottom: 1.5rem;
`;
const Section = styled.div`
  margin-bottom: 2rem;
`;
const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;
const MemberList = styled.ul`
  list-style: none;
  padding: 0;
`;
const MemberItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;
const MemberAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  margin-right: 0.75rem;
`;
const MemberInfo = styled.div`
  flex: 1;
`;
const MemberName = styled.div`
  font-weight: 500;
  color: #333;
`;
const MemberRole = styled.div`
  font-size: 0.9rem;
  color: #666;
`;
const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
`;
const ActivityItem = styled.li`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;
const ProgressFill = styled.div`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  transition: width 0.3s ease;
`;
const ProgressText = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: right;
`;

const mockGroups = [
  {
    id: 1,
    name: 'JavaScript Fundamentals',
    topic: 'Programming',
    status: 'active',
    members: [
      { id: 1, name: 'Alice Johnson', role: 'Leader' },
      { id: 2, name: 'Bob Smith', role: 'Member' },
      { id: 3, name: 'Carlos Lee', role: 'Member' }
    ],
    schedule: 'Every Monday, 2:00 PM',
    maxMembers: 5,
    description: 'Peer group for learning JavaScript basics.',
    activities: [
      { id: 1, title: 'JS Basics Quiz', progress: 100 },
      { id: 2, title: 'DOM Manipulation Workshop', progress: 80 }
    ]
  },
  {
    id: 2,
    name: 'Data Structures & Algorithms',
    topic: 'Computer Science',
    status: 'upcoming',
    members: [
      { id: 4, name: 'Dina Patel', role: 'Leader' },
      { id: 5, name: 'Fatima Noor', role: 'Member' }
    ],
    schedule: 'Every Wednesday, 4:00 PM',
    maxMembers: 6,
    description: 'Group for practicing DSA problems.',
    activities: [
      { id: 3, title: 'Array Challenges', progress: 0 }
    ]
  }
];

export default function MentorGroupDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  // Use group from navigation state if available, otherwise fallback
  const group = location.state?.group || mockGroups[0];

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>&larr; Back</BackButton>
      <Title>{group.name}</Title>
      <Meta>{group.topic} &bull; {group.schedule} &bull; {group.status.charAt(0).toUpperCase() + group.status.slice(1)}</Meta>
      <Section>
        <SectionTitle>Description</SectionTitle>
        <div>{group.description}</div>
      </Section>
      <Section>
        <SectionTitle>Members</SectionTitle>
        <MemberList>
          {group.members.map(member => (
            <MemberItem key={member.id}>
              <MemberAvatar>{member.name.split(' ').map(n => n[0]).join('')}</MemberAvatar>
              <MemberInfo>
                <MemberName>{member.name}</MemberName>
                <MemberRole>{member.role}</MemberRole>
              </MemberInfo>
            </MemberItem>
          ))}
        </MemberList>
      </Section>
      <Section>
        <SectionTitle>Activities & Progress</SectionTitle>
        <ActivityList>
          {group.activities && group.activities.length > 0 ? (
            group.activities.map(activity => (
              <ActivityItem key={activity.id}>
                <div style={{ fontWeight: 500 }}>{activity.title}</div>
                <ProgressBar>
                  <ProgressFill progress={activity.progress} />
                </ProgressBar>
                <ProgressText>{activity.progress}% Complete</ProgressText>
              </ActivityItem>
            ))
          ) : (
            <div>No activities assigned to this group yet.</div>
          )}
        </ActivityList>
      </Section>
    </Container>
  );
} 