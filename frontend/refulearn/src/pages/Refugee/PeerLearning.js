import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import offlineIntegrationService from '../../services/offlineIntegrationService';

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

const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.5rem;
  margin-top: 0.5rem;
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

const PeerLearning = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('groups');
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [sessionDetails, setSessionDetails] = useState({ title: '', date: '', time: '', message: '' });
  const [groups, setGroups] = useState([]);
  const [assignedActivities, setAssignedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch peer learning groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let groupsData = [];
        let activitiesData = [];

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching peer learning data from API...');
            
            // Fetch peer learning groups
            const groupsResponse = await fetch('/api/peer-learning/groups', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (groupsResponse.ok) {
              const groupsApiData = await groupsResponse.json();
              groupsData = groupsApiData.data.groups || [];
              console.log('✅ Peer learning groups data received:', groupsData.length);
              
              // Store groups for offline use
              await offlineIntegrationService.storePeerLearningGroups(groupsData);
            } else {
              console.error('❌ Peer learning groups API failed:', groupsResponse.status);
            }

            // Fetch user activities (if available)
            // This would depend on your backend structure
            activitiesData = [];

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            const offlineData = await fetchOfflineData();
            groupsData = offlineData.groups;
            activitiesData = offlineData.activities;
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline data...');
          const offlineData = await fetchOfflineData();
          groupsData = offlineData.groups;
          activitiesData = offlineData.activities;
        }

        // Update state with fetched data
        setGroups(groupsData);
        setAssignedActivities(activitiesData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load peer learning data');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to fetch offline data
    const fetchOfflineData = async () => {
      try {
        const groups = await offlineIntegrationService.getPeerLearningGroups() || [];
        const activities = await offlineIntegrationService.getPeerLearningActivities() || [];
        
        console.log('📱 Offline peer learning data loaded:', {
          groups: groups.length,
          activities: activities.length
        });
        
        return { groups, activities };
      } catch (error) {
        console.error('❌ Failed to load offline peer learning data:', error);
        return { groups: [], activities: [] };
      }
    };

    fetchData();
  }, []);

  // Filtering logic
  const filteredAssignedActivities = assignedActivities.filter(a => a.status === 'assigned');

  // Handlers
  const handleViewDetails = (groupId) => {
    navigate(`/peer-learning/group/${groupId}`);
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let joinSuccess = false;

      if (isOnline) {
        try {
          // Try online group join first (preserving existing behavior)
          console.log('🌐 Online group join for group:', groupId);
          const response = await fetch(`/api/peer-learning/groups/${groupId}/join`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            joinSuccess = true;
            console.log('✅ Online group join successful');
            alert('Successfully joined the group!');
            
            // Refresh groups data with offline support
            try {
              const groupsResponse = await fetch('/api/peer-learning/groups', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (groupsResponse.ok) {
                const groupsData = await groupsResponse.json();
                setGroups(groupsData.data.groups || []);
                console.log('✅ Groups data refreshed after join');
              } else {
                console.warn('⚠️ Failed to refresh groups data, using cached data');
              }
            } catch (refreshError) {
              console.warn('⚠️ Failed to refresh groups data:', refreshError);
              // Continue with cached data, user already successfully joined
            }
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to join group');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online group join failed, using offline:', onlineError);
          // Fall back to offline join
          await offlineIntegrationService.joinPeerLearningGroup(groupId);
          joinSuccess = true;
          console.log('✅ Offline group join successful');
          alert('Successfully joined the group offline! Will sync when online.');
        }
      } else {
        // Offline group join
        console.log('📴 Offline group join for group:', groupId);
        await offlineIntegrationService.joinPeerLearningGroup(groupId);
        joinSuccess = true;
        console.log('✅ Offline group join successful');
        alert('Successfully joined the group offline! Will sync when online.');
      }

      if (joinSuccess && !isOnline) {
        // Update local state to reflect the change in offline mode
        setGroups(prevGroups => prevGroups.map(group => 
          group._id === groupId 
            ? { ...group, currentMembers: [...(group.currentMembers || []), localStorage.getItem('userId')] }
            : group
        ));
      }
    } catch (err) {
      console.error('Error joining group:', err);
      alert('Failed to join group');
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading peer learning data...</div>
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

  return (
    <Container>
      <Header>
        <Title>Peer Learning</Title>
      </Header>
      <Tabs>
        <Tab active={tab === 'groups'} onClick={() => setTab('groups')}>Learning Groups</Tab>
        <Tab active={tab === 'activities'} onClick={() => setTab('activities')}>Activities</Tab>
      </Tabs>

      {/* Learning Groups Tab */}
      {tab === 'groups' && (
        <>
          {groups.length === 0 ? (
            <p>No groups available.</p>
          ) : (
            <GroupsGrid>
              {groups.map(group => (
                <GroupCard key={group._id} onClick={() => handleViewDetails(group._id)}>
                  <GroupName>{group.name}</GroupName>
                  <GroupDescription>{group.description}</GroupDescription>
                  <ActionRow>
                    {group.currentMembers?.includes(localStorage.getItem('userId')) ? (
                      <ViewButton>View Details</ViewButton>
                    ) : (
                      <JoinButton onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group._id);
                      }}>
                        Join Group
                      </JoinButton>
                    )}
                  </ActionRow>
                </GroupCard>
              ))}
            </GroupsGrid>
          )}
        </>
      )}

      {/* Activities Tab */}
      {tab === 'activities' && (
        <>
          {filteredAssignedActivities.length === 0 && <p>No activities assigned.</p>}
          <GroupsGrid>
            {filteredAssignedActivities.map(activity => (
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