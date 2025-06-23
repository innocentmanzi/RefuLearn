import React, { useState } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

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
  background: ${({ $variant }) => 
    $variant === 'delete' ? '#dc3545' : 
    $variant === 'edit' ? '#6c757d' : 
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
  width: ${({ $progress }) => $progress}%;
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

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
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

const GroupActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActivityActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ProgressChartContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
`;

// Add filter buttons for group status
const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;
const FilterButton = styled.button`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : '#f0f0f0'};
  color: ${({ $active, theme }) => $active ? '#fff' : '#333'};
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  &:hover { background: ${({ theme }) => theme.colors.secondary}; color: #fff; }
`;

const PeerLearning = () => {
  console.log('Mentor PeerLearning.js loaded!');
  const [activeTab, setActiveTab] = useState('groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [groups, setGroups] = useState([
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
      description: 'Peer group for learning JavaScript basics.'
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
      description: 'Group for practicing DSA problems.'
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
      maxMembers: 8,
      description: 'Bootcamp for full-stack web development.'
    }
  ]);
  const [currentGroup, setCurrentGroup] = useState({
    id: null,
    name: '',
    description: '',
    topic: '',
    schedule: '',
    maxMembers: 5,
    members: [],
    status: 'active',
    activities: [],
    discussionTopics: []
  });
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityModalMode, setActivityModalMode] = useState('create');
  const [currentActivity, setCurrentActivity] = useState({
    id: null,
    title: '',
    description: '',
    groupId: '',
    status: 'not-started',
    progress: 0,
    dueDate: '',
    type: 'activity' // 'activity' or 'discussion'
  });
  const [groupFilter, setGroupFilter] = useState('all');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const navigate = useNavigate();

  // Helper to get the selected group
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Handlers
  const openCreateModal = () => {
    setModalMode('create');
    setCurrentGroup({ 
      id: null, 
      name: '', 
      description: '', 
      topic: '', 
      schedule: '', 
      maxMembers: 5, 
      members: [], 
      status: 'active',
      activities: [],
      discussionTopics: []
    });
    setShowGroupModal(true);
  };
  const openEditModal = (group) => {
    setModalMode('edit');
    setCurrentGroup({
      ...group,
      activities: group.activities || [],
      discussionTopics: group.discussionTopics || []
    });
    setShowGroupModal(true);
  };
  const closeGroupModal = () => {
    setShowGroupModal(false);
  };
  const handleGroupChange = (e) => {
    setCurrentGroup({ ...currentGroup, [e.target.name]: e.target.value });
  };
  const handleAddActivity = () => {
    const newActivity = {
      id: Date.now(),
      title: '',
      description: '',
      type: 'activity',
      status: 'not-started',
      progress: 0,
      dueDate: ''
    };
    setCurrentGroup({
      ...currentGroup,
      activities: [...currentGroup.activities, newActivity]
    });
  };
  const handleAddDiscussionTopic = () => {
    const newTopic = {
      id: Date.now(),
      title: '',
      description: '',
      type: 'discussion',
      status: 'not-started',
      progress: 0,
      dueDate: ''
    };
    setCurrentGroup({
      ...currentGroup,
      discussionTopics: [...currentGroup.discussionTopics, newTopic]
    });
  };
  const handleActivityChange = (index, field, value, type = 'activities') => {
    const updatedItems = [...currentGroup[type]];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCurrentGroup({
      ...currentGroup,
      [type]: updatedItems
    });
  };
  const handleRemoveActivity = (index, type = 'activities') => {
    const updatedItems = currentGroup[type].filter((_, i) => i !== index);
    setCurrentGroup({
      ...currentGroup,
      [type]: updatedItems
    });
  };
  const handleSaveGroup = () => {
    if (modalMode === 'create') {
      setGroups([...groups, { 
        ...currentGroup, 
        id: Date.now(), 
        members: [],
        activities: currentGroup.activities || [],
        discussionTopics: currentGroup.discussionTopics || []
      }]);
    } else {
      setGroups(groups.map(g => g.id === currentGroup.id ? {
        ...currentGroup,
        activities: currentGroup.activities || [],
        discussionTopics: currentGroup.discussionTopics || []
      } : g));
    }
    setShowGroupModal(false);
  };
  const handleDeleteGroup = (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  // Activity handlers (per group)
  const openCreateActivityModal = (groupId) => {
    setSelectedGroupId(groupId);
    setActivityModalMode('create');
    setCurrentActivity({ id: null, title: '', description: '', status: 'not-started', progress: 0, dueDate: '', type: 'activity' });
    setShowActivityModal(true);
  };
  const openEditActivityModal = (groupId, activity) => {
    setSelectedGroupId(groupId);
    setActivityModalMode('edit');
    setCurrentActivity(activity);
    setShowActivityModal(true);
  };
  const closeActivityModal = () => {
    setShowActivityModal(false);
  };
  const handleSaveActivity = () => {
    setGroups(groups.map(g => {
      if (g.id !== selectedGroupId) return g;
      const activities = g.activities || [];
      if (activityModalMode === 'create') {
        return { ...g, activities: [...activities, { ...currentActivity, id: Date.now() }] };
      } else {
        return { ...g, activities: activities.map(a => a.id === currentActivity.id ? currentActivity : a) };
      }
    }));
    setShowActivityModal(false);
  };
  const handleDeleteActivity = (groupId, activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setGroups(groups.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, activities: (g.activities || []).filter(a => a.id !== activityId) };
      }));
    }
  };

  // Filtered groups
  const filteredGroups = groups.filter(g => {
    if (groupFilter === 'all') return true;
    if (groupFilter === 'progress') return g.status === 'active' || g.status === 'upcoming';
    if (groupFilter === 'completed') return g.status === 'completed';
    return true;
  }).filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Progress chart data
  const groupProgressData = {
    labels: groups.map(g => g.name),
    datasets: [
      {
        label: 'Group Progress (%)',
        data: groups.map(g => {
          const groupActivities = g.activities || [];
          if (groupActivities.length === 0) return 0;
          return Math.round(groupActivities.reduce((sum, a) => sum + a.progress, 0) / groupActivities.length);
        }),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        tension: 0.4
      }
    ]
  };

  return (
    <Container>
      <TopHeader>
        <Title>Peer Learning & Mentorship</Title>
        <CreateButton onClick={openCreateModal}>+ Create Group</CreateButton>
      </TopHeader>
      {/* Only show filter bar in Groups tab */}
      {activeTab === 'groups' && (
        <FilterBar>
          <FilterButton $active={groupFilter === 'all'} onClick={() => setGroupFilter('all')}>All</FilterButton>
          <FilterButton $active={groupFilter === 'progress'} onClick={() => setGroupFilter('progress')}>In Progress</FilterButton>
          <FilterButton $active={groupFilter === 'completed'} onClick={() => setGroupFilter('completed')}>Completed</FilterButton>
        </FilterBar>
      )}
      <Header>
        <SearchBar
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Header>
      <Tabs>
        <Tab active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>Groups</Tab>
        <Tab active={activeTab === 'activities'} onClick={() => setActiveTab('activities')}>Activities</Tab>
        <Tab active={activeTab === 'progress'} onClick={() => setActiveTab('progress')}>Progress</Tab>
      </Tabs>
      {/* Groups Tab */}
      {activeTab === 'groups' && (
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
              <div style={{ color: '#666', marginBottom: 8 }}>{group.description}</div>
              
              {/* Activities and Discussion Topics Summary */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem', 
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                    Activities ({group.activities?.length || 0})
                  </div>
                  {group.activities && group.activities.length > 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {group.activities.filter(a => a.status === 'completed').length} completed
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#ccc' }}>No activities</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                    Discussion Topics ({group.discussionTopics?.length || 0})
                  </div>
                  {group.discussionTopics && group.discussionTopics.length > 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {group.discussionTopics.filter(t => t.status === 'completed').length} completed
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#ccc' }}>No topics</div>
                  )}
                </div>
              </div>

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
              <GroupActions>
                <ActionButton onClick={() => navigate(`/peer-learning/group/${group.id}`, { state: { group } })}>View Details</ActionButton>
                <ActionButton $variant="edit" onClick={() => openEditModal(group)}>Edit</ActionButton>
                <ActionButton $variant="delete" onClick={() => handleDeleteGroup(group.id)}>Delete</ActionButton>
              </GroupActions>
            </GroupCard>
          ))}
        </GroupGrid>
      )}
      {/* Group Modal */}
      {showGroupModal && (
        <Modal>
          <ModalContent style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <h3>{modalMode === 'create' ? 'Create Group' : 'Edit Group'}</h3>
            
            {/* Basic Group Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#007bff', marginBottom: '1rem' }}>Basic Information</h4>
              <FormGroup>
                <Label>Group Name</Label>
                <Input
                  name="name"
                  value={currentGroup.name}
                  onChange={handleGroupChange}
                  placeholder="Enter group name"
                />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={currentGroup.description}
                  onChange={handleGroupChange}
                  placeholder="Enter group description"
                />
              </FormGroup>
              <FormGroup>
                <Label>Topic</Label>
                <Input
                  name="topic"
                  value={currentGroup.topic}
                  onChange={handleGroupChange}
                  placeholder="Enter topic"
                />
              </FormGroup>
              <FormGroup>
                <Label>Schedule</Label>
                <Input
                  name="schedule"
                  value={currentGroup.schedule}
                  onChange={handleGroupChange}
                  placeholder="e.g. Every Monday, 2:00 PM"
                />
              </FormGroup>
              <FormGroup>
                <Label>Max Members</Label>
                <Input
                  name="maxMembers"
                  type="number"
                  min={2}
                  max={50}
                  value={currentGroup.maxMembers}
                  onChange={handleGroupChange}
                />
              </FormGroup>
            </div>

            {/* Group Activities Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#007bff', margin: 0 }}>Group Activities</h4>
                <Button 
                  onClick={handleAddActivity}
                  style={{ background: '#28a745', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  + Add Activity
                </Button>
              </div>
              {currentGroup.activities && currentGroup.activities.length > 0 ? (
                currentGroup.activities.map((activity, index) => (
                  <div key={activity.id} style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    background: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h5 style={{ margin: 0, color: '#333' }}>Activity {index + 1}</h5>
                      <Button 
                        onClick={() => handleRemoveActivity(index, 'activities')}
                        style={{ background: '#dc3545', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                      >
                        Remove
                      </Button>
                    </div>
                    <FormGroup>
                      <Label>Activity Title</Label>
                      <Input
                        value={activity.title}
                        onChange={(e) => handleActivityChange(index, 'title', e.target.value, 'activities')}
                        placeholder="Enter activity title"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <TextArea
                        value={activity.description}
                        onChange={(e) => handleActivityChange(index, 'description', e.target.value, 'activities')}
                        placeholder="Enter activity description"
                        style={{ minHeight: '80px' }}
                      />
                    </FormGroup>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <FormGroup>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={activity.dueDate}
                          onChange={(e) => handleActivityChange(index, 'dueDate', e.target.value, 'activities')}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Status</Label>
                        <Select
                          value={activity.status}
                          onChange={(e) => handleActivityChange(index, 'status', e.target.value, 'activities')}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </FormGroup>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#666', 
                  border: '2px dashed #ddd', 
                  borderRadius: '8px' 
                }}>
                  No activities added yet. Click "Add Activity" to get started.
                </div>
              )}
            </div>

            {/* Discussion Topics Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#007bff', margin: 0 }}>Discussion Topics</h4>
                <Button 
                  onClick={handleAddDiscussionTopic}
                  style={{ background: '#17a2b8', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  + Add Topic
                </Button>
              </div>
              {currentGroup.discussionTopics && currentGroup.discussionTopics.length > 0 ? (
                currentGroup.discussionTopics.map((topic, index) => (
                  <div key={topic.id} style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    background: '#f0f8ff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h5 style={{ margin: 0, color: '#333' }}>Discussion Topic {index + 1}</h5>
                      <Button 
                        onClick={() => handleRemoveActivity(index, 'discussionTopics')}
                        style={{ background: '#dc3545', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                      >
                        Remove
                      </Button>
                    </div>
                    <FormGroup>
                      <Label>Topic Title</Label>
                      <Input
                        value={topic.title}
                        onChange={(e) => handleActivityChange(index, 'title', e.target.value, 'discussionTopics')}
                        placeholder="Enter discussion topic title"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <TextArea
                        value={topic.description}
                        onChange={(e) => handleActivityChange(index, 'description', e.target.value, 'discussionTopics')}
                        placeholder="Enter discussion topic description"
                        style={{ minHeight: '80px' }}
                      />
                    </FormGroup>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <FormGroup>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={topic.dueDate}
                          onChange={(e) => handleActivityChange(index, 'dueDate', e.target.value, 'discussionTopics')}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Status</Label>
                        <Select
                          value={topic.status}
                          onChange={(e) => handleActivityChange(index, 'status', e.target.value, 'discussionTopics')}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </FormGroup>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#666', 
                  border: '2px dashed #ddd', 
                  borderRadius: '8px' 
                }}>
                  No discussion topics added yet. Click "Add Topic" to get started.
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <Button onClick={handleSaveGroup}>{modalMode === 'create' ? 'Create Group' : 'Save Changes'}</Button>
              <Button onClick={closeGroupModal} style={{ background: '#666' }}>Cancel</Button>
            </div>
          </ModalContent>
        </Modal>
      )}
      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Select
              value={selectedGroupId || ''}
              onChange={e => setSelectedGroupId(Number(e.target.value))}
              style={{ minWidth: 200, marginRight: 16 }}
            >
              <option value="">Select group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </Select>
            {selectedGroupId && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <CreateButton onClick={() => openCreateActivityModal(selectedGroupId)}>+ Create Activity</CreateButton>
              </div>
            )}
          </div>
          {selectedGroup ? (
            <>
              {/* Activities Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#007bff', margin: 0 }}>Group Activities</h3>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {selectedGroup.activities?.length || 0} activities
                  </span>
                </div>
                {selectedGroup.activities && selectedGroup.activities.length > 0 ? (
                  <GroupGrid>
                    {selectedGroup.activities.map(activity => (
                      <ActivityCard key={activity.id}>
                        <ActivityHeader>
                          <ActivityTitle>{activity.title}</ActivityTitle>
                          <ActivityStatus status={activity.status}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </ActivityStatus>
                        </ActivityHeader>
                        <div style={{ color: '#666', marginBottom: 8 }}>{activity.description}</div>
                        <div style={{ fontSize: '0.95rem', color: '#888', marginBottom: 8 }}>
                          Due: {activity.dueDate}
                        </div>
                        <ProgressBar>
                          <ProgressFill $progress={activity.progress} />
                        </ProgressBar>
                        <ProgressText>{activity.progress}% Complete</ProgressText>
                        <ActivityActions>
                          <ActionButton $variant="edit" onClick={() => openEditActivityModal(selectedGroupId, activity)}>Edit</ActionButton>
                          <ActionButton $variant="delete" onClick={() => handleDeleteActivity(selectedGroupId, activity.id)}>Delete</ActionButton>
                        </ActivityActions>
                      </ActivityCard>
                    ))}
                  </GroupGrid>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#666', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    No activities created yet. Create activities in the group settings.
                  </div>
                )}
              </div>

              {/* Discussion Topics Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#17a2b8', margin: 0 }}>Discussion Topics</h3>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {selectedGroup.discussionTopics?.length || 0} topics
                  </span>
                </div>
                {selectedGroup.discussionTopics && selectedGroup.discussionTopics.length > 0 ? (
                  <GroupGrid>
                    {selectedGroup.discussionTopics.map(topic => (
                      <ActivityCard key={topic.id} style={{ borderLeft: '4px solid #17a2b8' }}>
                        <ActivityHeader>
                          <ActivityTitle style={{ color: '#17a2b8' }}>{topic.title}</ActivityTitle>
                          <ActivityStatus status={topic.status}>
                            {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                          </ActivityStatus>
                        </ActivityHeader>
                        <div style={{ color: '#666', marginBottom: 8 }}>{topic.description}</div>
                        <div style={{ fontSize: '0.95rem', color: '#888', marginBottom: 8 }}>
                          Due: {topic.dueDate}
                        </div>
                        <ProgressBar>
                          <ProgressFill $progress={topic.progress} />
                        </ProgressBar>
                        <ProgressText>{topic.progress}% Complete</ProgressText>
                        <ActivityActions>
                          <ActionButton $variant="edit" onClick={() => openEditActivityModal(selectedGroupId, topic)}>Edit</ActionButton>
                          <ActionButton $variant="delete" onClick={() => handleDeleteActivity(selectedGroupId, topic.id)}>Delete</ActionButton>
                        </ActivityActions>
                      </ActivityCard>
                    ))}
                  </GroupGrid>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#666', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px',
                    background: '#f0f8ff'
                  }}>
                    No discussion topics created yet. Create topics in the group settings.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ color: '#888', marginTop: 32 }}>Select a group to manage activities and discussion topics.</div>
          )}
          {/* Activity Modal */}
          {showActivityModal && (
            <Modal>
              <ModalContent>
                <h3>{activityModalMode === 'create' ? 'Create Activity' : 'Edit Activity'}</h3>
                <FormGroup>
                  <Label>Title</Label>
                  <Input
                    name="title"
                    value={currentActivity.title}
                    onChange={(e) => handleActivityChange(null, 'title', e.target.value)}
                    placeholder="Enter activity title"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    name="description"
                    value={currentActivity.description}
                    onChange={(e) => handleActivityChange(null, 'description', e.target.value)}
                    placeholder="Enter activity description"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Due Date</Label>
                  <Input
                    name="dueDate"
                    type="date"
                    value={currentActivity.dueDate}
                    onChange={(e) => handleActivityChange(null, 'dueDate', e.target.value)}
                  />
                </FormGroup>
                <div style={{ marginTop: '1rem' }}>
                  <Button onClick={handleSaveActivity}>{activityModalMode === 'create' ? 'Create' : 'Save'}</Button>
                  <Button onClick={closeActivityModal} style={{ background: '#666' }}>Cancel</Button>
                </div>
              </ModalContent>
            </Modal>
          )}
        </>
      )}
      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <>
          <ProgressChartContainer>
            <h3>Group Progress Overview</h3>
            <Line data={groupProgressData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, max: 100 } }
            }} />
          </ProgressChartContainer>
          <GroupGrid>
            {groups.map(group => {
              const groupActivities = group.activities || [];
              const avgProgress = groupActivities.length === 0 ? 0 : Math.round(groupActivities.reduce((sum, a) => sum + a.progress, 0) / groupActivities.length);
              return (
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
                  <div style={{ color: '#666', marginBottom: 8 }}>{group.description}</div>
                  <div style={{ margin: '1rem 0' }}>
                    <ProgressBar>
                      <ProgressFill $progress={avgProgress} />
                    </ProgressBar>
                    <ProgressText>{avgProgress}% Average Progress</ProgressText>
                  </div>
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
                </GroupCard>
              );
            })}
          </GroupGrid>
        </>
      )}
    </Container>
  );
};

export default PeerLearning; 