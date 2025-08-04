import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../../contexts/UserContext';


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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ color, theme }) => color || theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
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

const TicketsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TicketCard = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const TicketTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-size: 1.2rem;
`;

const StatusBadge = styled.span`
  background: ${({ status }) => {
    switch(status) {
      case 'open': return '#e74c3c';
      case 'in_progress': return '#f39c12';
      case 'resolved': return '#27ae60';
      case 'closed': return '#95a5a6';
      default: return '#95a5a6';
    }
  }};
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const TicketMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const TicketContent = styled.p`
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const TicketTags = styled.div`
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background: ${({ variant, theme }) => {
    switch(variant) {
      case 'primary': return theme.colors.primary;
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      case 'secondary': return '#6c757d';
      default: return theme.colors.primary;
    }
  }};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ variant, theme }) => {
      switch(variant) {
        case 'primary': return theme.colors.secondary;
        case 'success': return '#229954';
        case 'warning': return '#e67e22';
        case 'secondary': return '#5a6268';
        default: return theme.colors.secondary;
      }
    }};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const HelpManagement = () => {
  const { token } = useUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');

  // Fetch help tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching instructor help tickets...');

      const response = await fetch('/api/instructor/help-tickets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Help tickets data received');
        setTickets(data.data.tickets || []);
      } else {
        throw new Error('Failed to fetch help tickets');
      }
    } catch (err) {
      console.error('❌ Help tickets fetch failed:', err);
      setError('Failed to load help tickets');
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      console.log('🔄 Updating ticket status...');
      
      const response = await fetch(`/api/instructor/help-tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }

      setSuccess('Ticket status updated successfully');
      fetchTickets();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update ticket status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Add response to ticket
  const addResponse = async (ticketId, responseText) => {
    try {
      const response = await fetch(`/api/instructor/help-tickets/${ticketId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: responseText,
          isInternal: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add response');
      }

      setSuccess('Response added successfully');
      setShowResponseModal(false);
      setSelectedTicket(null);
      setResponse('');
      fetchTickets();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add response');
      setTimeout(() => setError(''), 3000);
    }
  };

  useEffect(() => {
    // Always fetch tickets, regardless of token status
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicketStatus(ticketId, newStatus);
  };

  const handleRespond = (ticket) => {
    setSelectedTicket(ticket);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      setError('Response cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }

    await addResponse(selectedTicket._id, response);
  };

  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed').length;

    return { total, open, inProgress, resolved, closed };
  };

  const handleStatCardClick = (status) => {
    setFilterStatus(status === 'all' ? '' : status);
  };

  const filteredTickets = tickets.filter(ticket => {
    // Apply status filter
    if (filterStatus && ticket.status !== filterStatus) {
      return false;
    }
    
    // Apply priority filter
    if (filterPriority && ticket.priority !== filterPriority) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        ticket.title?.toLowerCase().includes(searchLower) ||
        ticket.description?.toLowerCase().includes(searchLower) ||
        ticket.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Debug logging
  console.log('All tickets:', tickets);
  console.log('Filter status:', filterStatus);
  console.log('Filter priority:', filterPriority);
  console.log('Search term:', searchTerm);
  console.log('Filtered tickets:', filteredTickets);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading help tickets...</LoadingSpinner>
      </Container>
    );
  }

  // Only show "No help tickets found" if there are truly no tickets assigned to instructor
  if (!loading && tickets.length === 0) {
    return (
      <Container>
        <Title>Help Management</Title>
        <Subtitle>Manage and respond to student help requests</Subtitle>
        <div style={{ textAlign: 'center', color: '#888', margin: '2rem 0' }}>
          No help tickets assigned to you.
        </div>
      </Container>
    );
  }

  const stats = getStats();

  return (
    <Container>
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Title>Help Management</Title>
      <Subtitle>Manage and respond to student help requests</Subtitle>

      <StatsGrid>
        <StatCard onClick={() => handleStatCardClick('all')}>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Total Tickets</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('open')}>
          <StatNumber color="#e74c3c">{stats.open}</StatNumber>
          <StatLabel>Open</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('in-progress')}>
          <StatNumber color="#f39c12">{stats.inProgress}</StatNumber>
          <StatLabel>In Progress</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('resolved')}>
          <StatNumber color="#27ae60">{stats.resolved}</StatNumber>
          <StatLabel>Resolved</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('closed')}>
          <StatNumber color="#95a5a6">{stats.closed}</StatNumber>
          <StatLabel>Closed</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterBar>
        <FilterSelect 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </FilterSelect>

        <FilterSelect 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </FilterSelect>

        <SearchInput
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {(filterStatus || filterPriority || searchTerm) && (
          <Button 
            variant="secondary" 
            onClick={() => {
              setFilterStatus('');
              setFilterPriority('');
              setSearchTerm('');
            }}
            style={{ whiteSpace: 'nowrap' }}
          >
            Clear Filters
          </Button>
        )}
      </FilterBar>

      <TicketsList>
        {filteredTickets.map((ticket) => (
          <TicketCard key={ticket._id}>
            <TicketHeader>
              <TicketTitle>{ticket.title}</TicketTitle>
              <StatusBadge status={ticket.status}>
                {ticket.status?.replace('-', ' ') || 'Unknown'}
              </StatusBadge>
            </TicketHeader>

            <TicketMeta>
              <span>Category: {ticket.category || 'N/A'}</span>
              <span>Priority: {ticket.priority || 'N/A'}</span>
              <span>Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}</span>
              <span>Author: {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : 'N/A'}</span>
            </TicketMeta>

            <TicketContent>{ticket.description}</TicketContent>

            <TicketTags>
              {ticket.category && <Tag>{ticket.category}</Tag>}
              {ticket.priority && <Tag>{ticket.priority}</Tag>}
            </TicketTags>

            <ActionButtons>
              {ticket.status === 'open' && (
                <Button 
                  variant="warning" 
                  onClick={() => handleStatusChange(ticket._id, 'in-progress')}
                >
                  Start Working
                </Button>
              )}
              
              {ticket.status === 'in-progress' && (
                <>
                  <Button 
                    variant="success" 
                    onClick={() => handleStatusChange(ticket._id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleStatusChange(ticket._id, 'closed')}
                  >
                    Close
                  </Button>
                </>
              )}
              
              {ticket.status === 'resolved' && (
                <Button 
                  variant="secondary" 
                  onClick={() => handleStatusChange(ticket._id, 'closed')}
                >
                  Close
                </Button>
              )}
              
              <Button 
                variant="primary" 
                onClick={() => handleRespond(ticket)}
              >
                Respond
              </Button>
            </ActionButtons>
          </TicketCard>
        ))}
      </TicketsList>

      {filteredTickets.length === 0 && !loading && tickets.length > 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No tickets match your current filters. You have {tickets.length} total ticket{tickets.length !== 1 ? 's' : ''} assigned to you.
        </div>
      )}

      {showResponseModal && selectedTicket && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Respond to Ticket</ModalTitle>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Ticket:</strong> {selectedTicket.title}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Description:</strong> {selectedTicket.description}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Category:</strong> {selectedTicket.category || 'N/A'} | 
              <strong> Priority:</strong> {selectedTicket.priority || 'N/A'}
            </div>

            <Label>Your Response:</Label>
            <TextArea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response to the student..."
            />

            <ModalActions>
              <Button 
                variant="primary" 
                onClick={handleSubmitResponse}
                disabled={!response.trim()}
              >
                Send Response
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedTicket(null);
                  setResponse('');
                }}
              >
                Cancel
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default HelpManagement; 