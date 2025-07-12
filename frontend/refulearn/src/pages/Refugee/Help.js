import React, { useState, useEffect } from 'react';
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

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const HelpHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const AskHelpButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const SearchInput = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 200px;
  }
`;

const FilterSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
`;

const HelpRequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HelpCard = styled.div`
  background: #fff;
  border: 1px solid #eee;
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

const HelpCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const HelpTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-size: 1.2rem;
`;

const HelpMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const HelpContent = styled.p`
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const HelpTags = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
`;

const HelpStats = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
`;

const Button = styled.button`
  background: ${({ theme, variant }) => variant === 'secondary' ? '#6c757d' : theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme, variant }) => variant === 'secondary' ? '#5a6268' : theme.colors.secondary};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const AnswersSection = styled.div`
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
`;

const AnswerCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const AnswerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AnswerAuthor = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const AnswerDate = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const AnswerContent = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const VoteButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const VoteButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #f0f0f0;
  }
  
  &.voted {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const NoHelpRequests = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const HelpTypeBadge = styled.span`
  background: ${({ type }) => {
    switch(type) {
      case 'instructor': return '#3498db';
      case 'mentor': return '#27ae60';
      case 'admin': return '#e74c3c';
      case 'students': return '#f39c12';
      default: return '#95a5a6';
    }
  }};
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const Help = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAskModal, setShowAskModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [newHelp, setNewHelp] = useState({
    title: '',
    description: '',
    assignedTo: '',
    category: '',
    priority: 'medium',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch help requests from backend (optional: for listing)
  useEffect(() => {
    // Optionally fetch tickets for display here
  }, []);

  useEffect(() => {
    let filtered = helpRequests;
    
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(h => h.helpType === filterType);
    }
    
    setFilteredRequests(filtered);
  }, [helpRequests, searchTerm, filterType]);

  const handleAskHelp = () => {
    setShowAskModal(true);
  };

  const handleFileChange = (e) => {
    setNewHelp({ ...newHelp, attachments: Array.from(e.target.files) });
  };

  const handleSubmitHelp = async () => {
    setError('');
    setSuccess('');
    if (!newHelp.title || !newHelp.description || !newHelp.assignedTo || !newHelp.category || !newHelp.priority) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', newHelp.title);
    formData.append('description', newHelp.description);
    formData.append('assignedTo', newHelp.assignedTo);
    formData.append('category', newHelp.category);
    formData.append('priority', newHelp.priority);
    if (newHelp.attachments && newHelp.attachments.length > 0) {
      newHelp.attachments.forEach(file => formData.append('attachments', file));
    }
    try {
      const res = await fetch('/api/help/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Help ticket submitted successfully!');
        setShowAskModal(false);
        setNewHelp({ title: '', description: '', assignedTo: '', category: '', priority: 'medium', attachments: [] });
      } else {
        setError(data.message || 'Failed to submit help ticket.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpClick = (help) => {
    setSelectedHelp(help);
    setShowHelpModal(true);
  };

  const handleVote = (helpId, answerId = null) => {
    // In real app, this would update PouchDB
    console.log('Vote registered:', { helpId, answerId });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#e74c3c';
      case 'in-progress': return '#f39c12';
      case 'resolved': return '#27ae60';
      case 'closed': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  return (
    <Container>
      <Title>Help Center</Title>
      <Subtitle>
        Get help from instructors, administrators, or fellow students
      </Subtitle>

      <HelpHeader>
        <AskHelpButton onClick={handleAskHelp}>
          + Ask for Help
        </AskHelpButton>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <SearchInput
            placeholder="Search help requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Help Types</option>
            <option value="instructor">Instructor Help</option>
            <option value="admin">Admin Help</option>
            <option value="students">Student Help</option>
          </FilterSelect>
        </div>
      </HelpHeader>

      <HelpRequestsList>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(help => (
            <HelpCard key={help.id} onClick={() => handleHelpClick(help)}>
              <HelpCardHeader>
                <HelpTitle>{help.title}</HelpTitle>
                <HelpTypeBadge type={help.helpType}>
                  {help.helpType.charAt(0).toUpperCase() + help.helpType.slice(1)}
                </HelpTypeBadge>
              </HelpCardHeader>
              
              <HelpMeta>
                <span>By {help.author}</span>
                <span>• {help.date}</span>
                <span>• {help.category}</span>
              </HelpMeta>
              
              <HelpContent>
                {help.content.length > 150 
                  ? `${help.content.substring(0, 150)}...` 
                  : help.content
                }
              </HelpContent>
              
              <HelpTags>
                {help.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </HelpTags>
              
              <HelpStats>
                <Stat>
                  <span>👁️</span>
                  <span>{help.views} views</span>
                </Stat>
                <Stat>
                  <span>💬</span>
                  <span>{help.answers.length} answers</span>
                </Stat>
                <Stat>
                  <span>👍</span>
                  <span>{help.votes} votes</span>
                </Stat>
              </HelpStats>
            </HelpCard>
          ))
        ) : (
          <NoHelpRequests>
            <h3>No help requests found</h3>
            <p>Be the first to ask for help or try adjusting your search filters.</p>
          </NoHelpRequests>
        )}
      </HelpRequestsList>

      {/* Ask Help Modal */}
      {showAskModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Ask for Help</ModalTitle>
            {error && <div style={{color:'red',marginBottom:'1rem'}}>{error}</div>}
            {success && <div style={{color:'green',marginBottom:'1rem'}}>{success}</div>}
            <Input
              placeholder="Help request title"
              value={newHelp.title}
              onChange={(e) => setNewHelp({...newHelp, title: e.target.value})}
            />
            <TextArea
              placeholder="Describe your problem or question in detail..."
              value={newHelp.description}
              onChange={(e) => setNewHelp({...newHelp, description: e.target.value})}
            />
            <FilterSelect
              value={newHelp.assignedTo}
              onChange={(e) => setNewHelp({...newHelp, assignedTo: e.target.value})}
            >
              <option value="">Who should help you?</option>
              <option value="instructor">Instructor (Course-specific questions)</option>
              <option value="admin">Admin (Technical issues, platform problems)</option>
              <option value="employer">Employer (Job-related support)</option>
            </FilterSelect>
            <FilterSelect
              value={newHelp.category}
              onChange={(e) => setNewHelp({...newHelp, category: e.target.value})}
            >
              <option value="">Select Category</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="course">Course</option>
              <option value="payment">Payment</option>
              <option value="general">General</option>
            </FilterSelect>
            <FilterSelect
              value={newHelp.priority}
              onChange={(e) => setNewHelp({...newHelp, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </FilterSelect>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{marginBottom:'1rem'}}
            />
            <div>
              <Button onClick={handleSubmitHelp} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Help Request'}
              </Button>
              <Button variant="secondary" onClick={() => setShowAskModal(false)}>
                Cancel
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Help Detail Modal */}
      {showHelpModal && selectedHelp && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{selectedHelp.title}</ModalTitle>
            <HelpMeta>
              <span>By {selectedHelp.author}</span>
              <span>• {selectedHelp.date}</span>
              <span>• {selectedHelp.category}</span>
              <HelpTypeBadge type={selectedHelp.helpType}>
                {selectedHelp.helpType.charAt(0).toUpperCase() + selectedHelp.helpType.slice(1)}
              </HelpTypeBadge>
            </HelpMeta>
            <HelpContent>{selectedHelp.content}</HelpContent>
            <HelpTags>
              {selectedHelp.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </HelpTags>
            {/* Show all messages (including staff responses) */}
            <AnswersSection>
              <h3>Messages ({selectedHelp.messages?.length || 0})</h3>
              {selectedHelp.messages && selectedHelp.messages.length > 0 ? (
                selectedHelp.messages.map((msg, idx) => (
                  <AnswerCard key={idx}>
                    <AnswerHeader>
                      <AnswerAuthor>{msg.sender}</AnswerAuthor>
                      <AnswerDate>{new Date(msg.createdAt).toLocaleString()}</AnswerDate>
                    </AnswerHeader>
                    <AnswerContent>{msg.message}</AnswerContent>
                  </AnswerCard>
                ))
              ) : (
                <p>No messages yet. Be the first to reply!</p>
              )}
            </AnswersSection>
            <div>
              <Button variant="secondary" onClick={() => setShowHelpModal(false)}>
                Close
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Help; 