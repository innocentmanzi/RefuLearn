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
  word-break: break-word;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 1rem;
    font-size: 0.97rem;
  }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const TicketHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
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
  flex-wrap: wrap;
  gap: 0.5rem;
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

const ResponseSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ResponseTitle = styled.strong`
  color: ${({ theme }) => theme.colors.primary};
`;

const ResponseDate = styled.small`
  color: #666;
`;

const ResponseContent = styled.p`
  margin: 0;
  line-height: 1.6;
`;

const NoTickets = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const NewTicketButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 2rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const HelpTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '/api/help/tickets';
        const params = [];
        if (statusFilter !== 'all') params.push(`status=${statusFilter}`);
        if (assignedToFilter !== 'all') params.push(`assignedTo=${assignedToFilter}`);
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
    fetchTickets();
  }, [statusFilter, assignedToFilter]);

  useEffect(() => {
    let filtered = tickets;
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredTickets(filtered);
  }, [tickets, searchTerm]);

  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = getStats();

  const handleNewTicket = () => {
    // Navigate to Help page to create new ticket
    window.location.href = '/help';
  };

  const handleStatCardClick = (status) => {
    setStatusFilter(status);
  };

  return (
    <Container>
      <Title>My Requests</Title>
      <Subtitle>
        Track the status of your help requests and view responses from instructors and support staff.
      </Subtitle>

      <NewTicketButton onClick={handleNewTicket}>
        + Submit New Request
      </NewTicketButton>

      <StatsGrid>
        <StatCard onClick={() => handleStatCardClick('all')}>
          <StatNumber color="#3498db">{stats.total}</StatNumber>
          <StatLabel>Total Requests</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('open')}>
          <StatNumber color="#e74c3c">{stats.open}</StatNumber>
          <StatLabel>Open</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('in_progress')}>
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
          placeholder="Search your tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </FilterSelect>
        <FilterSelect
          value={assignedToFilter}
          onChange={(e) => setAssignedToFilter(e.target.value)}
        >
          <option value="all">All Assignees</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
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
                <span>Submitted: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}</span>
                <span>• Assigned to: {ticket.assignedTo || ticket.assigned_to || ticket.assignedToRole || ''}</span>
                <span>• Priority: {ticket.priority}</span>
                {ticket.course && <span>• Course: {ticket.course}</span>}
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
                <ResponseSection>
                  <ResponseHeader>
                    <ResponseTitle>Response from {ticket.resolvedBy || ticket.assignedTo}</ResponseTitle>
                    <ResponseDate>Resolved on {ticket.resolvedDate}</ResponseDate>
                  </ResponseHeader>
                  <ResponseContent>{ticket.response}</ResponseContent>
                </ResponseSection>
              )}
            </TicketCard>
          ))
        ) : (
          <NoTickets>
            <h3>No tickets found</h3>
            <p>No help tickets match your current filters.</p>
          </NoTickets>
        )}
      </TicketsList>
    </Container>
  );
};

export default HelpTickets; 