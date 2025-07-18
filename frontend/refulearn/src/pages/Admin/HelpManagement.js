import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import offlineIntegrationService from '../../services/offlineIntegrationService';

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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      
      const isOnline = navigator.onLine;
      let ticketsData = [];

      if (isOnline) {
        try {
          // Try online API calls first (preserving existing behavior)
          console.log('🌐 Online mode: Fetching admin help tickets from API...');
          
          let url = '/api/help/all-tickets';
          const params = [];
          if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
          if (priorityFilter !== 'all') params.push(`priority=${priorityFilter}`);
          if (params.length > 0) url += '?' + params.join('&');
          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          const data = await res.json();
          if (data.success) {
            ticketsData = data.data.tickets || [];
            
            // Store tickets data for offline use
            await offlineIntegrationService.storeAdminHelpTickets(ticketsData);
            console.log('✅ Admin help tickets stored for offline use');
          } else {
            throw new Error(data.message || 'Failed to fetch tickets.');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
          
          // Fall back to offline data if online fails
          ticketsData = await offlineIntegrationService.getAdminHelpTickets();
          
          if (ticketsData.length === 0) {
            throw onlineError;
          }
        }
      } else {
        // Offline mode: use offline services
        console.log('📴 Offline mode: Using offline admin help tickets data...');
        ticketsData = await offlineIntegrationService.getAdminHelpTickets();
      }

      try {
        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
      } catch (err) {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    const filtered = tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const refreshTickets = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/help/all-tickets';
      const params = [];
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
      if (priorityFilter !== 'all') params.push(`priority=${priorityFilter}`);
      if (params.length > 0) url += '?' + params.join('&');
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.data.tickets || []);
        setFilteredTickets(data.data.tickets || []);
      } else {
        setError(data.message || 'Failed to fetch tickets.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/help/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        await refreshTickets();
      } else {
        setError(data.message || 'Failed to update ticket.');
      }
    } catch (err) {
      setError('Network error.');
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
      const res = await fetch(`/api/help/tickets/${selectedTicket._id || selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'resolved', response: responseText, resolvedDate: new Date().toISOString() })
      });
      const data = await res.json();
      if (data.success) {
        setShowResponseModal(false);
        setResponseText('');
        setSelectedTicket(null);
        await refreshTickets();
      } else {
        setError(data.message || 'Failed to submit response.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = getStats();

  const handleStatCardClick = (status) => {
    setSelectedStatusFilter(status);
    setStatusFilter(status);
  };

  return (
    <Container>
      <Title>Q&A Management</Title>
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
          <option value="in-progress">In Progress</option>
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
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{color:'red'}}>{error}</div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket._id || ticket.id}>
              <TicketHeader>
                <TicketTitle>{ticket.title}</TicketTitle>
                <StatusBadge status={ticket.status}>
                  {ticket.status ? ticket.status.replace('_', ' ').toUpperCase() : ''}
                </StatusBadge>
              </TicketHeader>
              <TicketMeta>
                <span>By {ticket.user || ticket.author || ''}</span>
                <span>• {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}</span>
                <span>• {ticket.category}</span>
                <span>• Priority: {ticket.priority}</span>
              </TicketMeta>
              <TicketContent>
                {ticket.description}
              </TicketContent>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div style={{marginBottom:'0.5rem'}}>
                  <strong>Attachments:</strong>
                  <ul>
                    {ticket.attachments.map((file, idx) => (
                      <li key={idx}><a href={file} target="_blank" rel="noopener noreferrer">Attachment {idx+1}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              <TicketTags>
                {ticket.tags && ticket.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </TicketTags>
              {ticket.response && (
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <strong>Your Response:</strong>
                  <p style={{ margin: '0.5rem 0 0 0' }}>{ticket.response}</p>
                  <small style={{ color: '#666' }}>Resolved on {ticket.resolvedDate ? new Date(ticket.resolvedDate).toLocaleDateString() : ''}</small>
                </div>
              )}
              <ActionButtons>
                {ticket.status === 'open' && (
                  <>
                    <Button 
                      variant="warning" 
                      onClick={() => handleStatusChange(ticket._id || ticket.id, 'in-progress')}
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
                {ticket.status === 'in-progress' && (
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
                    onClick={() => handleStatusChange(ticket._id || ticket.id, 'closed')}
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