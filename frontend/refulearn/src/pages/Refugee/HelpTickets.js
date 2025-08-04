import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium',
    assignedTo: 'admin'
  });

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      try {
        const isOnline = navigator.onLine;
        let ticketsData = [];

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching help tickets from API...');
            
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
              ticketsData = data.data.tickets || [];
              console.log('✅ Help tickets data received:', ticketsData.length);
              
              // Store tickets for offline use
              await offlineIntegrationService.storeHelpTickets(ticketsData);
            } else {
              console.warn('⚠️ API returned error:', data.message);
              // Don't throw error, just fall back to offline data
              throw new Error(data.message || 'API authentication failed');
            }
          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            try {
              ticketsData = await offlineIntegrationService.getHelpTickets() || [];
            } catch (offlineError) {
              console.warn('⚠️ Offline data also not available:', offlineError);
              ticketsData = []; // Set empty array as fallback
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline help tickets data...');
          try {
            ticketsData = await offlineIntegrationService.getHelpTickets() || [];
          } catch (offlineError) {
            console.warn('⚠️ Offline data not available:', offlineError);
            ticketsData = []; // Set empty array as fallback
          }
        }

        // Ensure ticketsData is always an array
        if (!Array.isArray(ticketsData)) {
          ticketsData = [];
        }

        // Debug: If no tickets found, check if we should populate some sample data
        if (ticketsData.length === 0) {
          console.log('🔍 No tickets found in database');
          
          // Try to get tickets from localStorage as backup (only real user data)
          try {
            const storedTickets = localStorage.getItem('userHelpTickets');
            if (storedTickets) {
              const parsedTickets = JSON.parse(storedTickets);
              if (Array.isArray(parsedTickets) && parsedTickets.length > 0) {
                // Only use tickets that belong to the current user
                const userTickets = parsedTickets.filter(ticket => 
                  ticket.user && ticket.user !== 'string_string' && ticket._id && !ticket._id.startsWith('sample_')
                );
                if (userTickets.length > 0) {
                  ticketsData = userTickets;
                  console.log('✅ Found real user tickets in localStorage:', ticketsData.length);
                }
              }
            }
          } catch (localStorageError) {
            console.warn('⚠️ Could not load from localStorage:', localStorageError);
          }
          
          // If still no tickets, that's fine - user just doesn't have any tickets yet
          if (ticketsData.length === 0) {
            console.log('ℹ️ User has no help tickets yet');
          }
        }

        // Apply filters to the data
        let filteredData = ticketsData;
        if (statusFilter !== 'all') {
          filteredData = filteredData.filter(ticket => ticket.status === statusFilter);
        }
        if (assignedToFilter !== 'all') {
          filteredData = filteredData.filter(ticket => 
            ticket.assignedTo === assignedToFilter || 
            ticket.assigned_to === assignedToFilter ||
            ticket.assignedToRole === assignedToFilter
          );
        }

        setTickets(filteredData);
        setFilteredTickets(filteredData);
        
        // Clear any previous errors if successful
        setError('');
        
        console.log(`ℹ️ Help tickets loaded: ${filteredData.length} tickets`);
        
      } catch (err) {
        console.error('❌ Error fetching help tickets:', err);
        
        // Set empty data without error - this is normal if user has no tickets yet
        setTickets([]);
        setFilteredTickets([]);
        setError(''); // Don't show error for authentication issues or empty data
        
        console.log('ℹ️ No help tickets available (may be due to authentication or empty data)');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [statusFilter, assignedToFilter]);

  useEffect(() => {
    // Add safety check to prevent undefined errors
    if (!tickets || !Array.isArray(tickets)) {
      setFilteredTickets([]);
      return;
    }
    
    let filtered = tickets;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    setFilteredTickets(filtered);
  }, [tickets, searchTerm]);

  const getStats = () => {
    // Add null checking to prevent undefined errors
    if (!tickets || !Array.isArray(tickets)) {
      return { total: 0, open: 0, inProgress: 0, resolved: 0 };
    }
    
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  };

  const stats = getStats();

  const handleNewTicket = () => {
    setShowNewTicketModal(true);
  };

  const handleSubmitNewTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      alert('Please fill in title and description');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/help/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });

      const result = await response.json();
      
      if (result.success) {
        // Success - close modal and refresh tickets
        setShowNewTicketModal(false);
        setNewTicket({
          title: '',
          description: '',
          category: 'technical',
          priority: 'medium',
          assignedTo: 'admin'
        });
        
        // Mark that user has created tickets
        localStorage.setItem('hasCreatedTickets', 'true');
        
        // Store the new ticket in localStorage
        const existingTickets = JSON.parse(localStorage.getItem('userHelpTickets') || '[]');
        existingTickets.push({
          ...newTicket,
          _id: `ticket_${Date.now()}`,
          status: 'open',
          createdAt: new Date().toISOString(),
          user: 'string_string',
          messages: []
        });
        localStorage.setItem('userHelpTickets', JSON.stringify(existingTickets));
        
        // Refresh the tickets list
        window.location.reload();
      } else {
        // Try offline submission
        const offlineResult = await offlineIntegrationService.submitHelpTicketOffline(newTicket);
        if (offlineResult.success) {
          setShowNewTicketModal(false);
          
          // Mark that user has created tickets
          localStorage.setItem('hasCreatedTickets', 'true');
          
          // Store the new ticket in localStorage
          const existingTickets = JSON.parse(localStorage.getItem('userHelpTickets') || '[]');
          existingTickets.push({
            ...newTicket,
            _id: `ticket_${Date.now()}`,
            status: 'open',
            createdAt: new Date().toISOString(),
            user: 'string_string',
            messages: []
          });
          localStorage.setItem('userHelpTickets', JSON.stringify(existingTickets));
          
          alert('Ticket submitted offline! Will sync when online.');
          window.location.reload();
        } else {
          alert('Failed to submit ticket: ' + (result.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      // Try offline submission as fallback
      try {
        const offlineResult = await offlineIntegrationService.submitHelpTicketOffline(newTicket);
        if (offlineResult.success) {
          setShowNewTicketModal(false);
          
          // Mark that user has created tickets
          localStorage.setItem('hasCreatedTickets', 'true');
          
          // Store the new ticket in localStorage
          const existingTickets = JSON.parse(localStorage.getItem('userHelpTickets') || '[]');
          existingTickets.push({
            ...newTicket,
            _id: `ticket_${Date.now()}`,
            status: 'open',
            createdAt: new Date().toISOString(),
            user: 'string_string',
            messages: []
          });
          localStorage.setItem('userHelpTickets', JSON.stringify(existingTickets));
          
          alert('Ticket submitted offline! Will sync when online.');
          window.location.reload();
        } else {
          alert('Failed to submit ticket. Please try again.');
        }
      } catch (offlineError) {
        alert('Failed to submit ticket. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatCardClick = (status) => {
    setStatusFilter(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#e74c3c'; // Red for Open
      case 'in_progress': return '#f39c12'; // Orange for In Progress
      case 'resolved': return '#27ae60'; // Green for Resolved
      case 'closed': return '#95a5a6'; // Gray for Closed
      default: return '#95a5a6'; // Default for other statuses
    }
  };

  return (
    <Container>
      <Title>{t('help.title', 'My Requests')}</Title>
      <Subtitle>
        {t('help.subtitle', 'Track the status of your help requests and view responses from instructors and support staff.')}
      </Subtitle>

      <button onClick={handleNewTicket} style={{ 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          padding: '0.8rem 1.5rem', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontSize: '1rem',
          marginBottom: '2rem'
        }}>
          + {t('help.submitNewRequest', 'Submit New Request')}
        </button>

      <StatsGrid>
        <StatCard onClick={() => handleStatCardClick('total')}>
          <StatNumber color="#007bff">{stats.total}</StatNumber>
          <StatLabel>{t('help.totalRequests', 'Total Requests')}</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('open')}>
          <StatNumber color="#e74c3c">{stats.open}</StatNumber>
          <StatLabel>{t('help.open', 'Open')}</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('in_progress')}>
          <StatNumber color="#f39c12">{stats.inProgress}</StatNumber>
          <StatLabel>{t('help.inProgress', 'In Progress')}</StatLabel>
        </StatCard>
        <StatCard onClick={() => handleStatCardClick('resolved')}>
          <StatNumber color="#27ae60">{stats.resolved}</StatNumber>
          <StatLabel>{t('help.resolved', 'Resolved')}</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterBar>
        <SearchInput
          type="text"
          placeholder={t('help.searchTickets', 'Search your tickets...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">{t('help.allStatus', 'All Status')}</option>
            <option value="open">{t('help.open', 'Open')}</option>
            <option value="in_progress">{t('help.inProgress', 'In Progress')}</option>
            <option value="resolved">{t('help.resolved', 'Resolved')}</option>
          </FilterSelect>
          <FilterSelect value={assignedToFilter} onChange={(e) => setAssignedToFilter(e.target.value)}>
            <option value="all">{t('help.allAssignees', 'All Assignees')}</option>
            <option value="instructor">{t('help.instructor', 'Instructor')}</option>
            <option value="admin">{t('help.admin', 'Admin')}</option>
          </FilterSelect>
      </FilterBar>

      <TicketsList>
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>{t('help.loadingTickets', 'Loading tickets...')}</h3>
          </div>
        )}
        {error ? (
          <NoTickets>
            <h3>Error</h3>
            <p>{error}</p>
          </NoTickets>
        ) : filteredTickets && filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket._id || ticket.id}>
              <TicketHeader>
                <TicketTitle>{ticket.title}</TicketTitle>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: getStatusColor(ticket.status),
                  display: 'inline-block',
                  marginBottom: '1rem'
                }}>
                  {t(`help.${ticket.status}`, ticket.status.toUpperCase())}
                </div>
              </TicketHeader>
              <TicketMeta>
                <span>{t('help.submitted', 'Submitted')}: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}</span>
                <span>• {t('help.assignedTo', 'Assigned to')}: {ticket.assignedTo || ticket.assigned_to || ticket.assignedToRole || ''}</span>
                <span>• {t('help.priority', 'Priority')}: {t(`help.${ticket.priority}`, ticket.priority)}</span>
                {ticket.course && <span>• {t('help.course', 'Course')}: {ticket.course}</span>}
              </TicketMeta>
              <TicketContent>
                {ticket.description}
              </TicketContent>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>{t('help.attachments', 'Attachments')}:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {ticket.attachments.map((file, idx) => (
                      <li key={idx}>
                        <a href={file} target="_blank" rel="noopener noreferrer">
                          {t('help.attachment', 'Attachment')} {idx+1}
                        </a>
                      </li>
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
                    <ResponseTitle>{t('help.responseFrom', 'Response from')} {ticket.resolvedBy || ticket.assignedTo}</ResponseTitle>
                    <ResponseDate>{t('help.resolvedOn', 'Resolved on')} {ticket.resolvedDate}</ResponseDate>
                  </ResponseHeader>
                  <ResponseContent>{ticket.response}</ResponseContent>
                </ResponseSection>
              )}
            </TicketCard>
          ))
        ) : (
          !loading && filteredTickets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>{t('help.noTicketsYet', 'You haven\'t submitted any help requests yet. Click "Submit New Request" to get help from instructors and support staff.')}</p>
            </div>
          )
        )}
      </TicketsList>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, color: '#1e88e5' }}>{t('help.submitNewHelpRequest', 'Submit New Help Request')}</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t('help.title', 'Title')}*
              </label>
              <input
                type="text"
                value={newTicket.title}
                onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                placeholder={t('help.briefDescription', 'Brief description of your issue')}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t('help.description', 'Description')}*
              </label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder={t('help.detailedDescription', 'Detailed description of your issue or question')}
                rows={4}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t('help.category', 'Category')}
              </label>
              <select
                value={newTicket.category}
                onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              >
                <option value="technical">{t('help.technicalIssue', 'Technical Issue')}</option>
                <option value="course">{t('help.courseIssue', 'Course Issue')}</option>
                <option value="account">{t('help.accountIssue', 'Account Issue')}</option>
                <option value="general">{t('help.generalInquiry', 'General Inquiry')}</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t('help.priority', 'Priority')}
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              >
                <option value="low">{t('help.low', 'Low')}</option>
                <option value="medium">{t('help.medium', 'Medium')}</option>
                <option value="high">{t('help.high', 'High')}</option>
                <option value="urgent">{t('help.urgent', 'Urgent')}</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t('help.assignTo', 'Assign To')}
              </label>
              <select
                value={newTicket.assignedTo}
                onChange={(e) => setNewTicket({...newTicket, assignedTo: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
              >
                <option value="instructor">{t('help.instructor', 'Instructor')}</option>
                <option value="admin">{t('help.adminSupport', 'Admin Support')}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNewTicketModal(false)}
                style={{ 
                  padding: '0.8rem 1.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  background: 'white', 
                  cursor: 'pointer',
                  marginRight: '1rem'
                }}
              >
                {t('help.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmitNewTicket}
                disabled={loading || !newTicket.title || !newTicket.description}
                style={{ 
                  padding: '0.8rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '8px', 
                  background: '#007bff', 
                  color: 'white', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? t('help.submitting', 'Submitting...') : t('help.submitRequest', 'Submit Request')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default HelpTickets; 