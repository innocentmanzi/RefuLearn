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

  // Sample data - in real app, this would come from PouchDB
  useEffect(() => {
    const sampleTickets = [
      {
        id: 1,
        title: "Need help understanding JavaScript functions",
        content: "I'm struggling with how functions work in JavaScript. Can you explain the concept of scope and closures? I'm taking the Basic English Communication course.",
        date: "2024-01-15",
        status: "open",
        priority: "medium",
        category: "programming",
        course: "Basic English Communication",
        tags: ["javascript", "functions", "beginner"],
        assignedTo: "instructor"
      },
      {
        id: 2,
        title: "Career guidance for software development",
        content: "I want to transition into software development. What skills should I focus on first and how can I build a portfolio?",
        date: "2024-01-14",
        status: "in_progress",
        priority: "high",
        category: "career",
        tags: ["career", "software", "portfolio"],
        assignedTo: "mentor"
      },
      {
        id: 3,
        title: "Platform login issues",
        content: "I can't log into my account. The page keeps showing an error message. I've tried resetting my password but it's not working.",
        date: "2024-01-13",
        status: "resolved",
        priority: "high",
        category: "technical",
        tags: ["login", "password", "error"],
        assignedTo: "admin",
        response: "I've reset your password and sent you a new login link. Please check your email and try logging in again. If you still have issues, please let me know.",
        resolvedDate: "2024-01-14",
        resolvedBy: "Admin Support"
      },
      {
        id: 4,
        title: "Request for additional practice exercises",
        content: "I found the course very helpful but would like more practice exercises for Module 2. Can you provide additional materials?",
        date: "2024-01-12",
        status: "resolved",
        priority: "low",
        category: "content",
        course: "Job Search Strategies",
        tags: ["exercises", "practice", "materials"],
        assignedTo: "instructor",
        response: "I've added 10 new practice exercises to Module 2. You can find them in the Resources section. These include real-world scenarios and case studies.",
        resolvedDate: "2024-01-13",
        resolvedBy: "Course Instructor"
      }
    ];
    
    setTickets(sampleTickets);
    setFilteredTickets(sampleTickets);
  }, []);

  useEffect(() => {
    let filtered = tickets;
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (assignedToFilter !== 'all') {
      filtered = filtered.filter(t => t.assignedTo === assignedToFilter);
    }
    
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, assignedToFilter]);

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

  return (
    <Container>
      <Title>My Help Tickets</Title>
      <Subtitle>
        Track the status of your help requests and view responses from instructors, mentors, and support staff.
      </Subtitle>

      <NewTicketButton onClick={handleNewTicket}>
        + Submit New Help Request
      </NewTicketButton>

      <StatsGrid>
        <StatCard>
          <StatNumber color="#3498db">{stats.total}</StatNumber>
          <StatLabel>Total Requests</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#e74c3c">{stats.open}</StatNumber>
          <StatLabel>Open</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#f39c12">{stats.inProgress}</StatNumber>
          <StatLabel>In Progress</StatLabel>
        </StatCard>
        <StatCard>
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
          <option value="instructor">Instructor</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </FilterSelect>
      </FilterBar>

      <TicketsList>
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket.id}>
              <TicketHeader>
                <TicketTitle>{ticket.title}</TicketTitle>
                <StatusBadge status={ticket.status}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </StatusBadge>
              </TicketHeader>
              
              <TicketMeta>
                <span>Submitted: {ticket.date}</span>
                <span>• Assigned to: {ticket.assignedTo}</span>
                <span>• Priority: {ticket.priority}</span>
                {ticket.course && <span>• Course: {ticket.course}</span>}
              </TicketMeta>
              
              <TicketContent>
                {ticket.content}
              </TicketContent>
              
              <TicketTags>
                {ticket.tags.map(tag => (
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