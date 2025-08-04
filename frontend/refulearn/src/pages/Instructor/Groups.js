import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Add, Edit, Delete, Group, People, PersonAdd } from '@mui/icons-material';
import { useUser } from '../../contexts/UserContext';


const Container = styled.div`
  padding: 2rem;
  background: #f4f8fb;
  min-height: 100vh;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #007BFF;
  margin: 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const AddButton = styled.button`
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const GroupCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const GroupTitle = styled.h3`
  color: #007BFF;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const GroupDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const GroupMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ status }) => 
    status === 'active' ? '#e6f9ec' : '#f8f9fa'};
  color: ${({ status }) => 
    status === 'active' ? '#1bbf4c' : '#6c757d'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ variant }) => 
    variant === 'edit' ? '#007BFF' : 
    variant === 'delete' ? '#000000' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
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
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: #007BFF;
  margin: 0 0 1.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  width: auto;
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const Groups = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useUser();
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: '',
    maxMembers: 10,
    isPrivate: false,
    allowSelfJoin: true
  });

  // Get course context from navigation state
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName;

  useEffect(() => {
    if (token) {
      fetchGroups();
      fetchCourses();
    }
  }, [token]);

  useEffect(() => {
    if (courseId) {
      setFormData(prev => ({ ...prev, courseId }));
    }
  }, [courseId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching instructor groups...');
      
      const response = await fetch('/api/instructor/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      const groupsData = data.data?.groups || [];
      console.log('✅ Groups data received');
      setGroups(groupsData);
    } catch (err) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/instructor/courses/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data.data?.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.courseId) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      console.log('🔄 Saving group...');
      
      const url = editingGroup 
        ? `/api/instructor/groups/${editingGroup._id}`
        : '/api/instructor/groups';
      
      const method = editingGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save group');
      }

      setSuccess(editingGroup ? 'Group updated successfully' : 'Group created successfully');
      fetchGroups();
      closeModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save group');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) {
      return;
    }

    try {
      console.log('🔄 Deleting group...');
      
      const response = await fetch(`/api/instructor/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete group');
      }

      setSuccess('Group deleted successfully');
      fetchGroups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete group');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openAddModal = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      courseId: courseId || '',
      maxMembers: 10,
      isPrivate: false,
      allowSelfJoin: true
    });
    setShowModal(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      courseId: group.courseId || group.course,
      maxMembers: group.maxMembers || 10,
      isPrivate: group.isPrivate || false,
      allowSelfJoin: group.allowSelfJoin !== false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      courseId: courseId || '',
      maxMembers: 10,
      isPrivate: false,
      allowSelfJoin: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading groups...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <ArrowBack style={{ marginRight: 6 }} /> Back
      </BackButton>

      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <HeaderContainer>
        <Title>Manage Groups</Title>
        <AddButton onClick={openAddModal}>
          <Add /> Create New Group
        </AddButton>
      </HeaderContainer>

      {groups.length === 0 ? (
        <EmptyState>
          <Group style={{ fontSize: '4rem', color: '#007BFF', marginBottom: '1rem' }} />
          <h3>No Groups Yet</h3>
          <p>Create your first group to facilitate collaborative learning and peer interaction.</p>
          <AddButton onClick={openAddModal}>
            <Add /> Create Your First Group
          </AddButton>
        </EmptyState>
      ) : (
        <GroupGrid>
          {groups.map((group) => (
            <GroupCard key={group._id}>
              <GroupTitle>{group.name}</GroupTitle>
              <GroupDescription>{group.description}</GroupDescription>
              
              <GroupMeta>
                <span>Course: {group.courseName || 'Unknown'}</span>
                <StatusBadge status={group.status || 'active'}>
                  {group.status || 'Active'}
                </StatusBadge>
              </GroupMeta>

              <GroupMeta>
                <span>Members: {group.members?.length || 0}/{group.maxMembers || 10}</span>
                <span>{group.isPrivate ? 'Private' : 'Public'}</span>
              </GroupMeta>

              <GroupMeta>
                <span>Self Join: {group.allowSelfJoin ? 'Yes' : 'No'}</span>
                <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
              </GroupMeta>

              <ActionButtons>
                <ActionButton variant="edit" onClick={() => openEditModal(group)}>
                  <Edit fontSize="small" /> Edit
                </ActionButton>
                <ActionButton variant="delete" onClick={() => deleteGroup(group._id)}>
                  <Delete fontSize="small" /> Delete
                </ActionButton>
              </ActionButtons>
            </GroupCard>
          ))}
        </GroupGrid>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>
              {editingGroup ? 'Edit Group' : 'Create New Group'}
            </ModalTitle>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Course *</Label>
                <Select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Group Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter group description (optional)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Maximum Members</Label>
                <Input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  min="2"
                  max="50"
                />
              </FormGroup>

              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                />
                <Label>Private Group (invitation only)</Label>
              </CheckboxGroup>

              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  name="allowSelfJoin"
                  checked={formData.allowSelfJoin}
                  onChange={handleInputChange}
                />
                <Label>Allow students to join themselves</Label>
              </CheckboxGroup>

              <ModalActions>
                <ActionButton type="submit" variant="edit">
                  <PersonAdd fontSize="small" />
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </ActionButton>
                <ActionButton type="button" onClick={closeModal}>
                  Cancel
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Groups; 