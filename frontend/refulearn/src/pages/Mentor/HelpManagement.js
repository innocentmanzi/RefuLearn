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

  // Sample data - in real app, this would come from PouchDB
  useEffect(() => {
    const sampleTickets = [
      {
        id: 1,
        title: "Career guidance for software development",
        content: "I want to transition into software development. What skills should I focus on first and how can I build a portfolio?",
        author: "Ahmed Hassan",
        email: "ahmed@example.com",
        date: "2024-01-15",
        status: "open",
        priority: "high",
        category: "career",
        tags: ["career", "software", "portfolio"],
        assignedTo: "mentor"
      },
      {
        id: 2,
        title: "Networking advice for job search",
        content: "How can I effectively network in the tech industry? I'm looking for my first job and need advice on building connections.",
        author: "Fatima Al-Zahra",
        email: "fatima@example.com",
        date: "2024-01-14",
        status: "in_progress",
        priority: "medium",
        category: "networking",
        tags: ["networking", "job-search", "connections"],
        assignedTo: "mentor"
      },
      {
        id: 3,
        title: "Interview preparation tips",
        content: "I have an interview next week for a junior developer position. What should I prepare and how should I present myself?",
        author: "Omar Khalil",
        email: "omar@example.com",
        date: "2024-01-13",
        status: "resolved",
        priority: "high",
        category: "interview",
        tags: ["interview", "preparation", "tips"],
        assignedTo: "mentor",
        response: "Here are my top tips: 1) Practice coding problems daily, 2) Prepare your portfolio with 2-3 projects, 3) Research the company thoroughly, 4) Practice your elevator pitch, 5) Prepare questions to ask them. Good luck!",
        resolvedDate: "2024-01-14"
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
        t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));
    
    // In real app, this would send email notification to user
    if (newStatus === 'resolved') {
      console.log('Sending email notification to user about resolved ticket');
    }
  };

  const handleRespond = (ticket) => {
    setSelectedTicket(ticket);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (!responseText.trim()) return;
    
    const updatedTicket = {
      ...selectedTicket,
      status: 'resolved',
      response: responseText,
      resolvedDate: new Date().toISOString().split('T')[0]
    };
    
    setTickets(tickets.map(t => 
      t.id === selectedTicket.id ? updatedTicket : t
    ));
    
    // In real app, this would send email notification to user
    console.log('Sending email notification to user about resolved ticket');
    
    setResponseText('');
    setShowResponseModal(false);
    setSelectedTicket(null);
  };

  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = getStats();

  return (
    <Container>
      <Title>Q&A Management</Title>
      <Subtitle>
        Provide career guidance and mentorship to students seeking advice.
      </Subtitle>

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
          placeholder="Search requests..."
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
            <TicketCard key={ticket.id}>
              <TicketHeader>
                <TicketTitle>{ticket.title}</TicketTitle>
                <StatusBadge status={ticket.status}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </StatusBadge>
              </TicketHeader>
              
              <TicketMeta>
                <span>By {ticket.author}</span>
                <span>• {ticket.date}</span>
                <span>• {ticket.category}</span>
                <span>• Priority: {ticket.priority}</span>
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
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <strong>Your Response:</strong>
                  <p style={{ margin: '0.5rem 0 0 0' }}>{ticket.response}</p>
                  <small style={{ color: '#666' }}>Resolved on {ticket.resolvedDate}</small>
                </div>
              )}
              
              <ActionButtons>
                {ticket.status === 'open' && (
                  <>
                    <Button 
                      variant="warning" 
                      onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                    >
                      Mark In Progress
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => handleRespond(ticket)}
                    >
                      Provide Guidance
                    </Button>
                  </>
                )}
                
                {ticket.status === 'in_progress' && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleRespond(ticket)}
                  >
                    Provide Guidance
                  </Button>
                )}
                
                {ticket.status === 'resolved' && (
                  <Button 
                    variant="secondary" 
                    onClick={() => handleStatusChange(ticket.id, 'closed')}
                  >
                    Close Request
                  </Button>
                )}
              </ActionButtons>
            </TicketCard>
          ))
        ) : (
          <NoTickets>
            <h3>No requests found</h3>
            <p>No mentorship requests match your current filters.</p>
          </NoTickets>
        )}
      </TicketsList>

      {/* Response Modal */}
      {showResponseModal && selectedTicket && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Provide Mentorship</ModalTitle>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>From:</strong> {selectedTicket.author} ({selectedTicket.email})
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Subject:</strong> {selectedTicket.title}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Request:</strong>
              <p style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', margin: '0.5rem 0 0 0' }}>
                {selectedTicket.content}
              </p>
            </div>
            
            <TextArea
              placeholder="Provide your mentorship advice and guidance..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            
            <div>
              <Button 
                variant="success" 
                onClick={handleSubmitResponse}
                disabled={!responseText.trim()}
              >
                Send Guidance & Resolve
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowResponseModal(false)}
              >
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