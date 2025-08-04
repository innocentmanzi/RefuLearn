import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Add, Edit, Delete, Forum, Send, Reply } from '@mui/icons-material';
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

const DiscussionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const DiscussionCard = styled.div`
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

const DiscussionTitle = styled.h3`
  color: #007BFF;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const DiscussionContent = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DiscussionMeta = styled.div`
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
  min-height: 120px;
  
  &:focus {
    outline: none;
    border-color: #007BFF;
  }
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

const Discussions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useUser();
  const [discussions, setDiscussions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    moduleId: ''
  });

  // Get course context from navigation state
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName;

  useEffect(() => {
    if (token) {
      fetchDiscussions();
      if (courseId) {
        fetchModules();
      }
    }
  }, [token, courseId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching instructor discussions...');
      
      const response = await fetch('/api/instructor/discussions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discussions');
      }

      const data = await response.json();
      const discussionsData = data.data?.discussions || [];
      console.log('✅ Discussions data received');
      setDiscussions(discussionsData);
    } catch (err) {
      setError(err.message || 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }

      const data = await response.json();
      setModules(data.data?.modules || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.moduleId) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      console.log('🔄 Saving discussion...');
      
      const url = editingDiscussion 
        ? `/api/instructor/discussions/${editingDiscussion._id}`
        : '/api/instructor/discussions';
      
      const method = editingDiscussion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          courseId: courseId // Add courseId to the request
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save discussion');
      }

      setSuccess(editingDiscussion ? 'Discussion updated successfully' : 'Discussion created successfully');
      fetchDiscussions();
      closeModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save discussion');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) {
      return;
    }

    try {
      const response = await fetch(`/api/instructor/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete discussion');
      }

      setSuccess('Discussion deleted successfully');
      fetchDiscussions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete discussion');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openAddModal = () => {
    setEditingDiscussion(null);
    setFormData({
      title: '',
      content: '',
      moduleId: ''
    });
    setShowModal(true);
  };

  const openEditModal = (discussion) => {
    setEditingDiscussion(discussion);
    setFormData({
      title: discussion.title,
      content: discussion.content,
      moduleId: discussion.moduleId || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDiscussion(null);
    setFormData({
      title: '',
      content: '',
      moduleId: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading discussions...</LoadingSpinner>
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
        <Title>
          Manage Discussions
          {courseName && (
            <span style={{ fontSize: '1rem', color: '#6c757d', fontWeight: 'normal', marginLeft: '1rem' }}>
              for {courseName}
            </span>
          )}
        </Title>
        <AddButton onClick={openAddModal}>
          <Add /> Create New Discussion
        </AddButton>
      </HeaderContainer>

      {discussions.length === 0 ? (
        <EmptyState>
          <Forum style={{ fontSize: '4rem', color: '#007BFF', marginBottom: '1rem' }} />
          <h3>No Discussions Yet</h3>
          <p>Create your first discussion to encourage student interaction and engagement.</p>
          <AddButton onClick={openAddModal}>
            <Add /> Create Your First Discussion
          </AddButton>
        </EmptyState>
      ) : (
        <DiscussionGrid>
          {discussions.map((discussion) => (
            <DiscussionCard key={discussion._id}>
              <DiscussionTitle>{discussion.title}</DiscussionTitle>
              <DiscussionContent>{discussion.content}</DiscussionContent>
              
              <DiscussionMeta>
                <span>Course: {courseName || 'Current Course'}</span>
                <StatusBadge status={discussion.status || 'active'}>
                  {discussion.status || 'Active'}
                </StatusBadge>
              </DiscussionMeta>

              <DiscussionMeta>
                <span>Module: {discussion.moduleTitle || 'Unknown Module'}</span>
                <span>Replies: {discussion.replies?.length || 0}</span>
              </DiscussionMeta>

              <ActionButtons>
                <ActionButton variant="edit" onClick={() => openEditModal(discussion)}>
                  <Edit fontSize="small" /> Edit
                </ActionButton>
                <ActionButton variant="delete" onClick={() => deleteDiscussion(discussion._id)}>
                  <Delete fontSize="small" /> Delete
                </ActionButton>
              </ActionButtons>
            </DiscussionCard>
          ))}
        </DiscussionGrid>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>
              {editingDiscussion ? 'Edit Discussion' : 'Create New Discussion'}
            </ModalTitle>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Course</Label>
                <Input
                  type="text"
                  value={courseName || 'Current Course'}
                  disabled
                  style={{ background: '#f8f9fa', color: '#6c757d' }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Module *</Label>
                <Select
                  name="moduleId"
                  value={formData.moduleId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a module</option>
                  {modules.map((module, index) => (
                    <option key={module._id} value={module._id}>
                      Module {index + 1}: {module.title}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Discussion Title *</Label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter discussion title"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Discussion Content *</Label>
                <TextArea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter discussion content or question"
                  required
                />
              </FormGroup>

              <ModalActions>
                <ActionButton type="submit" variant="edit">
                  <Send fontSize="small" />
                  {editingDiscussion ? 'Update Discussion' : 'Create Discussion'}
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

export default Discussions; 