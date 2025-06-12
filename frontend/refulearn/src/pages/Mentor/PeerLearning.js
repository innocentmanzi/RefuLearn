import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CreateButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
`;

const Tab = styled.button`
  background: ${({ active }) => active ? '#007bff' : 'transparent'};
  color: ${({ active }) => active ? 'white' : '#666'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ active }) => active ? '#0056b3' : '#f8f9fa'};
  }
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const GroupCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const GroupInfo = styled.div`
  flex: 1;
`;

const GroupName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 0.25rem 0;
`;

const GroupMeta = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
`;

const GroupStatus = styled.span`
  background: ${({ status }) => 
    status === 'active' ? '#28a745' :
    status === 'completed' ? '#6c757d' :
    status === 'upcoming' ? '#007bff' : '#ffc107'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const MemberList = styled.div`
  margin: 1rem 0;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
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

const ActionButton = styled.button`
  background: ${({ variant }) => 
    variant === 'delete' ? '#dc3545' : 
    variant === 'edit' ? '#6c757d' : 
    '#28a745'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Modal = styled.div`
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
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const ScheduleSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ActivityCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ActivityTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const ActivityStatus = styled.span`
  background: ${({ status }) => 
    status === 'completed' ? '#28a745' : 
    status === 'in-progress' ? '#ffc107' : 
    '#6c757d'}20;
  color: ${({ status }) => 
    status === 'completed' ? '#28a745' : 
    status === 'in-progress' ? '#ffc107' : 
    '#6c757d'};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const ProgressSection = styled.div`
  background: #f0f7ff;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
  &:hover {
    background: #e6f0ff;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProgressTitle = styled.h4`
  margin: 0;
  color: #555;
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

const PeerProgressList = styled.div`
  margin-top: 1rem;
`;

const PeerProgressItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PeerName = styled.span`
  font-weight: 500;
`;

const PeerStatus = styled.span`
  font-size: 0.9rem;
  color: ${({ status }) => 
    status === 'completed' ? '#28a745' : 
    status === 'in-progress' ? '#ffc107' : 
    '#6c757d'};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const ActivityDetailsModal = styled(Modal)`
  // Inherits from Modal
`;

const ActivityDetailsContent = styled(ModalContent)`
  max-width: 800px;
`;

const ActivityDetails = styled.div`
  margin-top: 1rem;
`;

const ActivitySection = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  
  i {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 1rem;
  }
`;

const PeerLearning = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    maxMembers: 5,
    schedule: {
      day: '',
      time: '',
      frequency: 'weekly'
    }
  });

  // Sample groups data
  const groups = [
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
      maxMembers: 5
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
      maxMembers: 6
    },
    {
      id: 3,
      name: 'Web Development Bootcamp',
      topic: 'Web Development',
      status: 'completed',
      members: [
        { id: 6, name: 'Samuel Kim', role: 'Leader' },
        { id: 7, name: 'Lina Zhang', role: 'Member' },
        { id: 8, name: 'Mohammed Ali', role: 'Member' }
      ],
      schedule: 'Completed',
      maxMembers: 8
    }
  ];

  // Sample activities data
  const activities = [
    {
      id: 1,
      title: 'JavaScript Fundamentals Review',
      description: 'Group review session covering basic JavaScript concepts',
      status: 'in-progress',
      progress: 65,
      currentActivities: [
        {
          peer: 'Bob Smith',
          activity: 'Review array methods',
          startedAt: '2025-06-12'
        },
        {
          peer: 'Carlos Lee',
          activity: 'Practice DOM manipulation',
          startedAt: '2025-06-13'
        }
      ],
      incompleteProgress: [
        {
          peer: 'Bob Smith',
          activity: 'Review array methods',
          startedAt: '2025-06-12',
          progress: 40
        },
        {
          peer: 'Carlos Lee',
          activity: 'Practice DOM manipulation',
          startedAt: '2025-06-13',
          progress: 25
        }
      ]
    },
    {
      id: 2,
      title: 'React Hooks Workshop',
      description: 'Hands-on workshop on React Hooks and their applications',
      status: 'not-started',
      progress: 0,
      currentActivities: [],
      incompleteProgress: []
    }
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActivityClick = (activity) => {
    console.log('Activity clicked:', activity);
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const handleProgressClick = (activity) => {
    console.log('Progress clicked:', activity);
    setSelectedActivity(activity);
    setShowProgressModal(true);
  };

  const handleCreateGroup = () => {
    // Here you would typically make an API call to create the group
    console.log('Creating group:', newGroup);
    setShowCreateModal(false);
    setNewGroup({
      name: '',
      description: '',
      maxMembers: 5,
      schedule: {
        day: '',
        time: '',
        frequency: 'weekly'
      }
    });
  };

  return (
    <Container>
      <Title>Peer Learning Management</Title>
      
      <Header>
        <SearchBar
          placeholder="Search groups or activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CreateButton onClick={() => setShowCreateModal(true)}>
          Create Group
        </CreateButton>
      </Header>

      <Tabs>
        <Tab 
          active={activeTab === 'groups'} 
          onClick={() => setActiveTab('groups')}
        >
          Learning Groups
        </Tab>
        <Tab 
          active={activeTab === 'activities'} 
          onClick={() => setActiveTab('activities')}
        >
          Activities
        </Tab>
        <Tab 
          active={activeTab === 'progress'} 
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </Tab>
      </Tabs>
      
      <GroupGrid>
        {filteredGroups.map(group => (
          <GroupCard key={group.id}>
            <GroupHeader>
              <GroupInfo>
                <GroupName>{group.name}</GroupName>
                <GroupMeta>{group.topic} • {group.schedule}</GroupMeta>
              </GroupInfo>
              <GroupStatus status={group.status}>
                {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
              </GroupStatus>
            </GroupHeader>
            
            <MemberList>
              {group.members.map(member => (
                <MemberItem key={member.id}>
                  <MemberAvatar>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </MemberAvatar>
                  <MemberInfo>
                    <MemberName>{member.name}</MemberName>
                    <MemberRole>{member.role}</MemberRole>
                  </MemberInfo>
                </MemberItem>
              ))}
            </MemberList>
            
            <div style={{ marginTop: '1rem' }}>
              <ActionButton>View Details</ActionButton>
              <ActionButton variant="edit">Edit</ActionButton>
              <ActionButton variant="delete">Delete</ActionButton>
            </div>
          </GroupCard>
        ))}
      </GroupGrid>

      <SectionTitle>Group Activities</SectionTitle>
      <ActivitySection>
        {activities.map(activity => (
          <ActivityCard key={activity.id} onClick={() => handleActivityClick(activity)}>
            <ActivityHeader>
              <ActivityTitle>{activity.title}</ActivityTitle>
              <ActivityStatus status={activity.status}>
                {activity.status === 'completed' ? 'Completed' : 
                 activity.status === 'in-progress' ? 'In Progress' : 
                 'Not Started'}
              </ActivityStatus>
            </ActivityHeader>
            
            <p>{activity.description}</p>
            
            <ProgressSection onClick={(e) => {
              e.stopPropagation();
              handleProgressClick(activity);
            }}>
              <ProgressHeader>
                <ProgressTitle>Overall Progress</ProgressTitle>
                <ProgressText>{activity.progress}% Complete</ProgressText>
              </ProgressHeader>
              <ProgressBar>
                <ProgressFill progress={activity.progress} />
              </ProgressBar>
            </ProgressSection>
          </ActivityCard>
        ))}
      </ActivitySection>

      {/* Activity Details Modal - Shows current activities */}
      {showActivityModal && selectedActivity && (
        <Modal>
          <ModalContent>
            <h2>Current Activities - {selectedActivity.title}</h2>
            
            {selectedActivity.currentActivities.length > 0 ? (
              <div>
                {selectedActivity.currentActivities.map((item, index) => (
                  <div key={index} style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <h3>{item.peer}</h3>
                    <p><strong>Currently Working On:</strong> {item.activity}</p>
                    <p><strong>Started:</strong> {item.startedAt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>
                <i className="fas fa-tasks"></i>
                <h3>No Active Activities</h3>
                <p>No peers are currently working on this activity.</p>
              </EmptyState>
            )}

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={() => setShowActivityModal(false)}>Close</Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Progress Details Modal - Shows incomplete progress */}
      {showProgressModal && selectedActivity && (
        <Modal>
          <ModalContent>
            <h2>Incomplete Progress - {selectedActivity.title}</h2>
            
            {selectedActivity.incompleteProgress.length > 0 ? (
              <div>
                {selectedActivity.incompleteProgress.map((item, index) => (
                  <div key={index} style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <h3>{item.peer}</h3>
                    <p><strong>Activity:</strong> {item.activity}</p>
                    <p><strong>Started:</strong> {item.startedAt}</p>
                    <p><strong>Progress:</strong> {item.progress}%</p>
                    <ProgressBar>
                      <ProgressFill progress={item.progress} />
                    </ProgressBar>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>
                <i className="fas fa-check-circle"></i>
                <h3>No Incomplete Progress</h3>
                <p>All started activities have been completed.</p>
              </EmptyState>
            )}

            <div style={{ marginTop: '1rem' }}>
              <Button onClick={() => setShowProgressModal(false)}>Close</Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <Modal>
          <ModalContent>
            <h2>Create New Group</h2>
            <FormGroup>
              <Label>Group Name</Label>
              <Input
                type="text"
                name="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                placeholder="Enter group name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                name="description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                placeholder="Enter group description"
              />
            </FormGroup>
            <FormGroup>
              <Label>Maximum Members</Label>
              <Input
                type="number"
                name="maxMembers"
                value={newGroup.maxMembers}
                onChange={(e) => setNewGroup({...newGroup, maxMembers: parseInt(e.target.value)})}
                min="2"
                max="10"
              />
            </FormGroup>
            <FormGroup>
              <Label>Schedule</Label>
              <Select
                name="day"
                value={newGroup.schedule.day}
                onChange={(e) => setNewGroup({
                  ...newGroup,
                  schedule: {...newGroup.schedule, day: e.target.value}
                })}
              >
                <option value="">Select day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Time</Label>
              <Input
                type="time"
                name="time"
                value={newGroup.schedule.time}
                onChange={(e) => setNewGroup({
                  ...newGroup,
                  schedule: {...newGroup.schedule, time: e.target.value}
                })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Frequency</Label>
              <Select
                name="frequency"
                value={newGroup.schedule.frequency}
                onChange={(e) => setNewGroup({
                  ...newGroup,
                  schedule: {...newGroup.schedule, frequency: e.target.value}
                })}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </FormGroup>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button onClick={() => setShowCreateModal(false)} style={{ background: '#6c757d' }}>Cancel</Button>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PeerLearning; 