import React, { useState } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';

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
  margin-bottom: 2rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const MenteeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const MenteeCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const MenteeHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1rem;
`;

const MenteeInfo = styled.div`
  flex: 1;
`;

const MenteeName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 0.25rem 0;
`;

const MenteeEmail = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  width: ${({ value }) => value}%;
  transition: width 0.3s ease;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.secondary}20;
  color: ${({ theme }) => theme.colors.secondary};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const ProgressChart = styled.div`
  margin-top: 1rem;
  height: 200px;
  min-width: 0;
`;

const GoalList = styled.div`
  margin-top: 1.5rem;
  min-width: 0;
`;

const GoalItem = styled.div`
  background: ${({ completed }) => completed ? '#e8f5e9' : '#fff3e0'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GoalInfo = styled.div`
  flex: 1;
`;

const GoalTitle = styled.h4`
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const GoalDescription = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
`;

const GoalStatus = styled.span`
  background: ${({ completed }) => completed ? '#28a745' : '#ff9800'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const AddGoalButton = styled.button`
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
  margin-top: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
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
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: right;
  font-size: 0.9rem;
  color: #666;
`;

const SkillsList = styled.div`
  margin-top: 1rem;
`;

const SkillTag = styled.span`
  background: ${({ theme }) => theme.colors.secondary}20;
  color: ${({ theme }) => theme.colors.secondary};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const GoalStatusModal = styled(ModalContent)`
  max-width: 400px;
  min-width: 250px;
`;

const MenteeProfiles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium'
  });
  const [showGoalStatusModal, setShowGoalStatusModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Sample mentees data with enhanced information
  const mentees = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      progress: 75,
      skills: ['JavaScript', 'React', 'Node.js'],
      stats: {
        sessionsCompleted: 12,
        goalsAchieved: 8,
        hoursSpent: 24
      },
      goals: [
        {
          id: 1,
          title: 'Complete React Fundamentals',
          description: 'Master core React concepts and build a small project',
          deadline: '2025-07-01',
          completed: true
        },
        {
          id: 2,
          title: 'Learn Redux',
          description: 'Understand state management with Redux',
          deadline: '2025-07-15',
          completed: false
        }
      ],
      progressData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Progress',
            data: [20, 35, 45, 55, 65, 75],
            borderColor: '#007bff',
            tension: 0.4
          }
        ]
      }
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      progress: 60,
      skills: ['Python', 'Data Analysis', 'Machine Learning'],
      stats: {
        sessionsCompleted: 8,
        goalsAchieved: 5,
        hoursSpent: 16
      },
      goals: [
        {
          id: 1,
          title: 'Complete Python Basics',
          description: 'Master Python fundamentals and data structures',
          deadline: '2025-06-30',
          completed: true
        },
        {
          id: 2,
          title: 'Data Analysis Project',
          description: 'Build a data analysis project using pandas and numpy',
          deadline: '2025-07-20',
          completed: false
        }
      ],
      progressData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Progress',
            data: [10, 25, 35, 45, 55, 60],
            borderColor: '#28a745',
            tension: 0.4
          }
        ]
      }
    }
  ];

  const filteredMentees = mentees.filter(mentee =>
    mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.description) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        completed: false
      };
      setSelectedMentee({
        ...selectedMentee,
        goals: [...selectedMentee.goals, goal]
      });
      setNewGoal({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium'
      });
      setShowAddGoalModal(false);
    }
  };

  const handleGoalToggle = (goalId) => {
    setSelectedMentee({
      ...selectedMentee,
      goals: selectedMentee.goals.map(goal =>
        goal.id === goalId
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    });
  };

  // Mock: Find all mentees with the selected goal (by title)
  const getGoalStatusData = (goalTitle) => {
    const completed = [];
    const inProgress = [];
    mentees.forEach(mentee => {
      const goal = mentee.goals.find(g => g.title === goalTitle);
      if (goal) {
        if (goal.completed) {
          completed.push({ name: mentee.name, progress: mentee.progress });
        } else {
          inProgress.push({ name: mentee.name, progress: mentee.progress });
        }
      }
    });
    return { completed, inProgress };
  };

  return (
    <Container>
      <Title>Mentee Profiles</Title>
      
      <Header>
        <SearchBar
          placeholder="Search mentees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Header>

      <MenteeGrid>
        {filteredMentees.map(mentee => (
          <MenteeCard key={mentee.id} onClick={() => setSelectedMentee(mentee)}>
            <MenteeHeader>
              <Avatar>
                {mentee.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <MenteeInfo>
                <MenteeName>{mentee.name}</MenteeName>
                <MenteeEmail>{mentee.email}</MenteeEmail>
              </MenteeInfo>
            </MenteeHeader>
            
            <ProgressBar>
              <ProgressFill progress={mentee.progress} />
            </ProgressBar>
            <ProgressText>{mentee.progress}% Complete</ProgressText>
            
            <SkillsList>
              {mentee.skills.map((skill, idx) => (
                <SkillTag key={idx}>{skill}</SkillTag>
              ))}
            </SkillsList>
            
            <StatsGrid>
              <StatItem>
                <StatValue>{mentee.stats.sessionsCompleted}</StatValue>
                <StatLabel>Sessions</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{mentee.stats.goalsAchieved}</StatValue>
                <StatLabel>Goals</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{mentee.stats.hoursSpent}</StatValue>
                <StatLabel>Hours</StatLabel>
              </StatItem>
            </StatsGrid>
          </MenteeCard>
        ))}
      </MenteeGrid>

      {selectedMentee && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>{selectedMentee.name}</h2>
              <CloseButton onClick={() => setSelectedMentee(null)}>×</CloseButton>
            </ModalHeader>

            <ProgressChart>
              <Line
                data={selectedMentee.progressData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }}
              />
            </ProgressChart>

            <GoalList>
              <h3>Learning Goals</h3>
              {selectedMentee.goals.map(goal => (
                <GoalItem
                  key={goal.id}
                  completed={goal.completed}
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowGoalStatusModal(true);
                  }}
                >
                  <GoalInfo>
                    <GoalTitle>{goal.title}</GoalTitle>
                    <GoalDescription>{goal.description}</GoalDescription>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                      Deadline: {goal.deadline}
                    </div>
                  </GoalInfo>
                  <GoalStatus completed={goal.completed}>
                    {goal.completed ? 'Completed' : 'In Progress'}
                  </GoalStatus>
                </GoalItem>
              ))}
              <AddGoalButton onClick={() => setShowAddGoalModal(true)}>
                Add New Goal
              </AddGoalButton>
            </GoalList>
          </ModalContent>
        </Modal>
      )}

      {showAddGoalModal && (
        <Modal>
          <ModalContent>
            <h3>Add New Goal</h3>
            <FormGroup>
              <Label>Goal Title</Label>
              <Input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="Enter goal title"
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                placeholder="Enter goal description"
              />
            </FormGroup>
            <FormGroup>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              />
            </FormGroup>
            <FormGroup>
              <Label>Priority</Label>
              <Select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormGroup>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleAddGoal}>Save Goal</Button>
              <Button 
                onClick={() => setShowAddGoalModal(false)}
                style={{ background: '#666' }}
              >
                Cancel
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {showGoalStatusModal && selectedGoal && (
        <Modal>
          <GoalStatusModal>
            <ModalHeader>
              <h3>Goal: {selectedGoal.title}</h3>
              <CloseButton onClick={() => setShowGoalStatusModal(false)}>×</CloseButton>
            </ModalHeader>
            {(() => {
              const { completed, inProgress } = getGoalStatusData(selectedGoal.title);
              // Helper to get mentee by name for avatar
              const getMenteeByName = (name) => mentees.find(m => m.name === name);
              return (
                <>
                  <div style={{ marginBottom: 12 }}><b>Completed:</b></div>
                  {completed.length === 0 ? <div style={{ color: '#888', marginBottom: 8 }}>None</div> : (
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
                      {completed.map((m, idx) => {
                        const mentee = getMenteeByName(m.name);
                        return (
                          <li key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar style={{ width: 32, height: 32, fontSize: '1rem', marginRight: 0 }}>
                              {mentee ? mentee.name.split(' ').map(n => n[0]).join('') : '?'}
                            </Avatar>
                            <span>{m.name}</span> <span style={{ color: '#28a745', fontSize: '0.9em' }}>({m.progress}%)</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div style={{ marginBottom: 12 }}><b>In Progress:</b></div>
                  {inProgress.length === 0 ? <div style={{ color: '#888' }}>None</div> : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {inProgress.map((m, idx) => {
                        const mentee = getMenteeByName(m.name);
                        return (
                          <li key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar style={{ width: 32, height: 32, fontSize: '1rem', marginRight: 0 }}>
                              {mentee ? mentee.name.split(' ').map(n => n[0]).join('') : '?'}
                            </Avatar>
                            <span>{m.name}</span> <span style={{ color: '#ff9800', fontSize: '0.9em' }}>({m.progress}%)</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              );
            })()}
          </GoalStatusModal>
        </Modal>
      )}
    </Container>
  );
};

export default MenteeProfiles; 