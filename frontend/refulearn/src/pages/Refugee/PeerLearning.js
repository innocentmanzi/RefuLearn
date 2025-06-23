import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import db from '../../pouchdb';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  background: ${({ active, theme }) => (active ? theme.colors.primary : '#fff')};
  color: ${({ active, theme }) => (active ? '#fff' : theme.colors.primary)};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
`;

const GroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const GroupCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  width: 100%;
  max-width: 100vw;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.98rem;
  }
`;

const GroupName = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const GroupDescription = styled.div`
  color: #555;
  font-size: 1rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const JoinButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const ViewButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
`;

// Placeholder data
const groups = [
  { id: 1, name: 'Web Dev Group', description: 'Learn web development with peers.', joined: false },
  { id: 2, name: 'Data Science Circle', description: 'Explore data science projects.', joined: true },
  { id: 3, name: 'UI/UX Enthusiasts', description: 'Discuss design and user experience.', joined: false },
];

const activities = [
  { id: 1, title: 'React Basics', status: 'assigned' },
  { id: 2, title: 'Python Data Analysis', status: 'in-progress' },
  { id: 3, title: 'UI/UX Challenge', status: 'completed' },
];

const PeerLearning = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('groups');
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [sessionDetails, setSessionDetails] = useState({ title: '', date: '', time: '', message: '' });

  // Filtering logic
  const joinedGroups = groups.filter(g => g.joined);
  const notJoinedGroups = groups.filter(g => !g.joined);
  const assignedActivities = activities.filter(a => a.status === 'assigned');
  const inProgressActivities = activities.filter(a => a.status === 'in-progress');
  const completedActivities = activities.filter(a => a.status === 'completed');

  // Handlers
  const handleJoinGroup = (groupId) => {
    navigate(`/peer-learning/group/${groupId}`);
  };

  const handleViewDetails = (groupId) => {
    navigate(`/peer-learning/group/${groupId}`);
  };

  const handleBookSession = async () => {
    if (!sessionDetails.title || !sessionDetails.date || !sessionDetails.time) {
      alert('Please fill in all required fields.');
      return;
    }

    const newSession = {
      _id: `session_refugee_${new Date().toISOString()}`,
      ...sessionDetails,
      status: 'pending',
      bookedBy: 'currentUser', // Replace with actual user ID
      mentor: 'defaultMentor' // Replace with mentor selection logic if needed
    };

    try {
      await db.put(newSession);
      alert('Session booked successfully!');
      setBookingModalOpen(false);
      setSessionDetails({ title: '', date: '', time: '', message: '' });
    } catch (err) {
      console.error('Error booking session:', err);
      alert('Failed to book session. Please try again.');
    }
  };

  return (
    <Container>
      <Header>
        <Title>Peer Learning & Mentorship</Title>
      </Header>
      <Tabs>
        <Tab active={tab === 'groups'} onClick={() => setTab('groups')}>Learning Groups</Tab>
        <Tab active={tab === 'activities'} onClick={() => setTab('activities')}>Activities</Tab>
        <Tab onClick={() => setBookingModalOpen(true)}>Book a Session</Tab>
      </Tabs>

      {isBookingModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h2>Book a Mentorship Session</h2>
            <Input
              type="text"
              placeholder="Session Title"
              value={sessionDetails.title}
              onChange={(e) => setSessionDetails({ ...sessionDetails, title: e.target.value })}
            />
            <Input
              type="date"
              value={sessionDetails.date}
              onChange={(e) => setSessionDetails({ ...sessionDetails, date: e.target.value })}
            />
            <Input
              type="time"
              value={sessionDetails.time}
              onChange={(e) => setSessionDetails({ ...sessionDetails, time: e.target.value })}
            />
            <Textarea
              placeholder="What would you like to discuss?"
              value={sessionDetails.message}
              onChange={(e) => setSessionDetails({ ...sessionDetails, message: e.target.value })}
            />
            <ActionRow>
              <JoinButton onClick={handleBookSession}>Confirm Booking</JoinButton>
              <ViewButton onClick={() => setBookingModalOpen(false)}>Cancel</ViewButton>
            </ActionRow>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Learning Groups Tab */}
      {tab === 'groups' && (
        <>
          {groups.length === 0 && <p>No groups available.</p>}
          <GroupsGrid>
            {groups.map(group => (
              <GroupCard key={group.id} onClick={() => handleViewDetails(group.id)}>
                <GroupName>{group.name}</GroupName>
                <GroupDescription>{group.description}</GroupDescription>
                <ActionRow>
                  <ViewButton>View Details</ViewButton>
                </ActionRow>
              </GroupCard>
            ))}
          </GroupsGrid>
        </>
      )}

      {/* Activities Tab */}
      {tab === 'activities' && (
        <>
          {assignedActivities.length === 0 && <p>No activities assigned.</p>}
          <GroupsGrid>
            {assignedActivities.map(activity => (
              <GroupCard key={activity.id} onClick={() => handleViewDetails(activity.id)}>
                <GroupName>{activity.title}</GroupName>
                <ActionRow>
                  <ViewButton>View Details</ViewButton>
                </ActionRow>
              </GroupCard>
            ))}
          </GroupsGrid>
        </>
      )}
    </Container>
  );
};

export default PeerLearning;