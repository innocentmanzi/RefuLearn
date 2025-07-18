import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';
import offlineIntegrationService from '../services/offlineIntegrationService';

const PeerLearningContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 1rem 0;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: ${props => props.active ? '#007bff' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    color: #007bff;
  }
`;

const DiscussionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const DiscussionCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const DiscussionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const DiscussionContent = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const DiscussionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #999;
`;

const DiscussionAuthor = styled.span`
  font-weight: 500;
  color: #007bff;
`;

const DiscussionDate = styled.span`
  color: #666;
`;

const DiscussionStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #666;
`;

const DiscussionActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.joined {
    background: #d4edda;
    color: #155724;
  }
  
  &.offline {
    background: #fff3cd;
    color: #856404;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const CreateButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  margin-bottom: 1rem;
  
  &:hover {
    background: #0056b3;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const FormField = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ReplySection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const ReplyItem = styled.div`
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0.5rem;
`;

const ReplyAuthor = styled.div`
  font-weight: 500;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const ReplyContent = styled.div`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ReplyDate = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.5rem;
`;

const OfflinePeerLearning = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [replyForm, setReplyForm] = useState({
    content: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [discussions, groups, searchTerm, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load discussions and groups from offline storage
      const [discussionsData, groupsData] = await Promise.all([
        loadDiscussions(),
        loadGroups()
      ]);
      
      setDiscussions(discussionsData || []);
      setGroups(groupsData || []);
    } catch (error) {
      console.error('❌ Failed to load peer learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussions = async () => {
    try {
      // Load discussions from offline storage
      const discussionsData = await offlineIntegrationService.getOfflineData('peer_learning', user?.id);
      return discussionsData?.discussions || [];
    } catch (error) {
      console.error('❌ Failed to load discussions:', error);
      return [];
    }
  };

  const loadGroups = async () => {
    try {
      // Load groups from offline storage
      const groupsData = await offlineIntegrationService.getOfflineData('peer_learning', user?.id);
      return groupsData?.groups || [];
    } catch (error) {
      console.error('❌ Failed to load groups:', error);
      return [];
    }
  };

  const filterItems = () => {
    const items = activeTab === 'discussions' ? discussions : groups;
    
    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }
    
    const filtered = items.filter(item =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredItems(filtered);
  };

  const handleCreateDiscussion = async () => {
    try {
      setProcessing(prev => new Set(prev).add('create'));
      
      const discussionData = {
        ...createForm,
        authorId: user?.id,
        authorName: `${user?.firstName} ${user?.lastName}`,
        createdAt: Date.now()
      };
      
      const newDiscussion = await offlineIntegrationService.createDiscussion(discussionData);
      
      setDiscussions(prev => [newDiscussion, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        content: '',
        category: 'general'
      });
      
      console.log('✅ Discussion created successfully');
    } catch (error) {
      console.error('❌ Failed to create discussion:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete('create');
        return newSet;
      });
    }
  };

  const handleReplyToDiscussion = async () => {
    if (!selectedDiscussion) return;
    
    try {
      setProcessing(prev => new Set(prev).add('reply'));
      
      const replyData = {
        ...replyForm,
        authorId: user?.id,
        authorName: `${user?.firstName} ${user?.lastName}`,
        createdAt: Date.now()
      };
      
      const newReply = await offlineIntegrationService.replyToDiscussion(selectedDiscussion.id, replyData);
      
      // Update discussion with new reply
      setDiscussions(prev => prev.map(discussion =>
        discussion.id === selectedDiscussion.id
          ? {
              ...discussion,
              replies: [...(discussion.replies || []), newReply],
              replyCount: (discussion.replyCount || 0) + 1
            }
          : discussion
      ));
      
      setShowReplyModal(false);
      setReplyForm({ content: '' });
      
      console.log('✅ Reply posted successfully');
    } catch (error) {
      console.error('❌ Failed to reply to discussion:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete('reply');
        return newSet;
      });
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setProcessing(prev => new Set(prev).add(groupId));
      
      await offlineIntegrationService.joinPeerGroup(groupId);
      
      // Update group in state
      setGroups(prev => prev.map(group =>
        group.id === groupId
          ? { ...group, joined: true, joinedAt: Date.now() }
          : group
      ));
      
      console.log('✅ Joined group successfully');
    } catch (error) {
      console.error('❌ Failed to join group:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleViewDiscussion = (discussion) => {
    setSelectedDiscussion(discussion);
    setShowReplyModal(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  };

  const getItemStatus = (item) => {
    if (item.joined) return 'joined';
    if (item.isOfflineCreated) return 'offline';
    return null;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'joined': return 'Joined';
      case 'offline': return 'Offline';
      default: return '';
    }
  };

  if (loading) {
    return (
      <PeerLearningContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          Loading peer learning content...
        </div>
      </PeerLearningContainer>
    );
  }

  return (
    <>
      <PeerLearningContainer>
        <h2>Peer Learning</h2>
        
        <TabContainer>
          <Tab
            active={activeTab === 'discussions'}
            onClick={() => setActiveTab('discussions')}
          >
            Discussions
          </Tab>
          <Tab
            active={activeTab === 'groups'}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </Tab>
        </TabContainer>
        
        <SearchBar
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {activeTab === 'discussions' && (
          <CreateButton onClick={() => setShowCreateModal(true)}>
            Create Discussion
          </CreateButton>
        )}

        {filteredItems.length === 0 ? (
          <EmptyState>
            <p>No {activeTab} found. {activeTab === 'discussions' ? 'Create your first discussion!' : 'Join a group to get started!'}</p>
          </EmptyState>
        ) : (
          <DiscussionGrid>
            {filteredItems.map((item) => {
              const status = getItemStatus(item);
              const isProcessing = processing.has(item.id);
              
              return (
                <DiscussionCard key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <DiscussionTitle>{item.title || 'Untitled'}</DiscussionTitle>
                    {status && (
                      <StatusBadge className={status}>
                        {getStatusText(status)}
                      </StatusBadge>
                    )}
                  </div>
                  
                  <DiscussionContent>
                    {item.content || item.description || 'No content available'}
                  </DiscussionContent>
                  
                  <DiscussionMeta>
                    <DiscussionAuthor>
                      {item.authorName || 'Unknown Author'}
                    </DiscussionAuthor>
                    <DiscussionDate>
                      {formatDate(item.createdAt)}
                    </DiscussionDate>
                  </DiscussionMeta>
                  
                  {activeTab === 'discussions' && (
                    <DiscussionStats>
                      <StatItem>
                        <span>💬</span>
                        <span>{item.replyCount || 0} replies</span>
                      </StatItem>
                      <StatItem>
                        <span>👀</span>
                        <span>{item.viewCount || 0} views</span>
                      </StatItem>
                    </DiscussionStats>
                  )}
                  
                  <DiscussionActions>
                    {activeTab === 'discussions' ? (
                      <>
                        <ActionButton
                          className="primary"
                          onClick={() => handleViewDiscussion(item)}
                        >
                          View & Reply
                        </ActionButton>
                        <ActionButton
                          className="secondary"
                          onClick={() => window.open(`/discussion/${item.id}`, '_blank')}
                        >
                          Open
                        </ActionButton>
                      </>
                    ) : (
                      <>
                        {!item.joined ? (
                          <ActionButton
                            className="primary"
                            onClick={() => handleJoinGroup(item.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <LoadingSpinner /> : ''}
                            Join Group
                          </ActionButton>
                        ) : (
                          <ActionButton
                            className="success"
                            onClick={() => window.open(`/group/${item.id}`, '_blank')}
                          >
                            View Group
                          </ActionButton>
                        )}
                      </>
                    )}
                  </DiscussionActions>
                </DiscussionCard>
              );
            })}
          </DiscussionGrid>
        )}
      </PeerLearningContainer>

      {/* Create Discussion Modal */}
      {showCreateModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>Create New Discussion</h3>
              <CloseButton onClick={() => setShowCreateModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <FormField>
              <Label>Title</Label>
              <Input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  title: e.target.value
                })}
                placeholder="Enter discussion title..."
              />
            </FormField>
            
            <FormField>
              <Label>Content</Label>
              <TextArea
                value={createForm.content}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  content: e.target.value
                })}
                placeholder="Write your discussion content..."
              />
            </FormField>
            
            <FormField>
              <Label>Category</Label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({
                  ...createForm,
                  category: e.target.value
                })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="career">Career</option>
                <option value="study">Study Group</option>
              </select>
            </FormField>
            
            <DiscussionActions>
              <ActionButton
                className="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                className="primary"
                onClick={handleCreateDiscussion}
                disabled={processing.has('create')}
              >
                {processing.has('create') ? <LoadingSpinner /> : ''}
                Create Discussion
              </ActionButton>
            </DiscussionActions>
          </ModalContent>
        </Modal>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedDiscussion && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{selectedDiscussion.title}</h3>
              <CloseButton onClick={() => setShowReplyModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <DiscussionContent>{selectedDiscussion.content}</DiscussionContent>
              <DiscussionMeta>
                <DiscussionAuthor>{selectedDiscussion.authorName}</DiscussionAuthor>
                <DiscussionDate>{formatDate(selectedDiscussion.createdAt)}</DiscussionDate>
              </DiscussionMeta>
            </div>
            
            {selectedDiscussion.replies && selectedDiscussion.replies.length > 0 && (
              <ReplySection>
                <h4>Replies</h4>
                {selectedDiscussion.replies.map((reply, index) => (
                  <ReplyItem key={index}>
                    <ReplyAuthor>{reply.authorName}</ReplyAuthor>
                    <ReplyContent>{reply.content}</ReplyContent>
                    <ReplyDate>{formatDate(reply.createdAt)}</ReplyDate>
                  </ReplyItem>
                ))}
              </ReplySection>
            )}
            
            <FormField>
              <Label>Your Reply</Label>
              <TextArea
                value={replyForm.content}
                onChange={(e) => setReplyForm({
                  ...replyForm,
                  content: e.target.value
                })}
                placeholder="Write your reply..."
              />
            </FormField>
            
            <DiscussionActions>
              <ActionButton
                className="secondary"
                onClick={() => setShowReplyModal(false)}
              >
                Close
              </ActionButton>
              <ActionButton
                className="primary"
                onClick={handleReplyToDiscussion}
                disabled={processing.has('reply')}
              >
                {processing.has('reply') ? <LoadingSpinner /> : ''}
                Post Reply
              </ActionButton>
            </DiscussionActions>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default OfflinePeerLearning; 