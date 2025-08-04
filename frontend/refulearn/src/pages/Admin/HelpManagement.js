import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: #333;
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
  color: ${({ color }) => color || '#007bff'};
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
  color: #007bff;
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
  background: #007bff20;
  color: #007bff;
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
  background: ${({ variant }) => {
    switch(variant) {
      case 'primary': return '#007bff';
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      case 'secondary': return '#6c757d';
      default: return '#007bff';
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
    background: ${({ variant }) => {
      switch(variant) {
        case 'primary': return '#0056b3';
        case 'success': return '#229954';
        case 'warning': return '#e67e22';
        case 'secondary': return '#5a6268';
        default: return '#0056b3';
      }
    }};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
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
  color: #007bff;
  margin-bottom: 1.5rem;
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

const NoTickets = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const HelpManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('🎫 Fetching help tickets from admin API...');
        
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/help-tickets?_t=' + Date.now(), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Help tickets received from admin API:', data);
          console.log('🔍 Sample ticket data:', data.data?.[0]);
          setTickets(data.data || []);
          setFilteredTickets(data.data || []);
        } else {
          console.error('❌ Help tickets API error:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          throw new Error('Failed to fetch help tickets');
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load help tickets');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  useEffect(() => {
    const filtered = tickets.filter(ticket => {
      const matchesSearch = (ticket.subject || ticket.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle both in-progress and in_progress status formats
      const matchesStatus = statusFilter === 'all' || 
        ticket.status === statusFilter || 
        (statusFilter === 'in-progress' && ticket.status === 'in_progress') ||
        (statusFilter === 'in_progress' && ticket.status === 'in-progress');
      
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const refreshTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/help-tickets?_t=' + Date.now(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data || []);
        setFilteredTickets(data.data || []);
      } else {
        throw new Error('Failed to fetch help tickets');
      }
    } catch (err) {
      setError('Failed to load help tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    setActionLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/help/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`Ticket marked as ${newStatus} successfully!`);
          await refreshTickets();
        } else {
          throw new Error(data.message || `Failed to update ticket status`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update ticket status`);
      }
    } catch (err) {
      console.error(`Error updating ticket:`, err);
      alert(err.message || `Failed to update ticket status`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespond = (ticket) => {
    setSelectedTicket(ticket);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/help/tickets/${selectedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'resolved', 
          response: responseText, 
          resolvedDate: new Date().toISOString() 
        })
      });
      
      if (response.ok) {
        setShowResponseModal(false);
        setResponseText('');
        setSelectedTicket(null);
        await refreshTickets();
        alert('Response submitted successfully!');
      } else {
        throw new Error('Failed to submit response');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('Failed to submit response');
    } finally {
      setActionLoading(false);
    }
  };

  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open' || !t.status).length;
    const inProgress = tickets.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = getStats();

  const handleStatCardClick = (status) => {
    setStatusFilter(status === 'all' ? 'all' : status);
  };

  if (loading) {
    return (
      <Container>
        <Title>Help Management</Title>
        <p>Loading tickets...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Help Management</Title>
        <p style={{ color: 'red' }}>{error}</p>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Help Management</Title>
      <Subtitle>
        Handle technical support requests and platform issues from users.
      </Subtitle>

      <StatsGrid>
        <StatCard onClick={() => handleStatCardClick('all')}>
          <StatNumber color="#3498db">{stats.total}</StatNumber>
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
      </StatsGrid>

      <FilterBar>
        <SearchInput
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </FilterSelect>
        <FilterSelect
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </FilterSelect>
      </FilterBar>

      <TicketsList>
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket._id}>
              <TicketHeader>
                <TicketTitle>{ticket.subject || ticket.title || 'Help Request'}</TicketTitle>
                <StatusBadge status={ticket.status || 'open'}>
                  {(ticket.status || 'open').replace('_', ' ').toUpperCase()}
                </StatusBadge>
              </TicketHeader>
              <TicketMeta>
                <span>By {ticket.user?.firstName || 'Unknown'} {ticket.user?.lastName || 'User'}</span>
                <span>• {new Date(ticket.createdAt || ticket.created).toLocaleDateString()}</span>
                <span>• {ticket.category || 'general'}</span>
                <span>• Priority: {ticket.priority || 'medium'}</span>
              </TicketMeta>
              <TicketContent>
                {ticket.description || ticket.content || 'No description provided'}
              </TicketContent>
              {ticket.tags && ticket.tags.length > 0 && (
                <TicketTags>
                  {ticket.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </TicketTags>
              )}
              {ticket.response && (
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <strong>Your Response:</strong>
                  <p style={{ margin: '0.5rem 0 0 0' }}>{ticket.response}</p>
                  <small style={{ color: '#666' }}>Resolved on {ticket.resolvedDate ? new Date(ticket.resolvedDate).toLocaleDateString() : ''}</small>
                </div>
              )}
              <ActionButtons>
                {(ticket.status === 'open' || !ticket.status) && (
                  <>
                    <Button 
                      variant="warning" 
                      onClick={() => handleStatusChange(ticket._id, 'in-progress')}
                      disabled={actionLoading}
                    >
                      Mark In Progress
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => handleRespond(ticket)}
                      disabled={actionLoading}
                    >
                      Respond
                    </Button>
                  </>
                )}
                {ticket.status === 'in_progress' && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleRespond(ticket)}
                    disabled={actionLoading}
                  >
                    Respond
                  </Button>
                )}
                {ticket.status === 'resolved' && (
                  <Button 
                    variant="secondary" 
                    onClick={() => handleStatusChange(ticket._id, 'closed')}
                    disabled={actionLoading}
                  >
                    Close Ticket
                  </Button>
                )}
              </ActionButtons>
            </TicketCard>
          ))
        ) : (
          <NoTickets>
            <h3>No tickets found</h3>
            <p>No help tickets match your current filters.</p>
          </NoTickets>
        )}
      </TicketsList>

      {/* Response Modal */}
      {showResponseModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Respond to Ticket</ModalTitle>
            <TextArea
              placeholder="Type your response here..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <div>
              <Button onClick={handleSubmitResponse} disabled={actionLoading}>
                {actionLoading ? 'Submitting...' : 'Submit Response'}
              </Button>
              <Button variant="secondary" onClick={() => setShowResponseModal(false)}>
                Cancel
              </Button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default HelpManagement; 