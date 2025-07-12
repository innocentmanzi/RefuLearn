import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const Container = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(0, 123, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 123, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
    pointer-events: none;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;



const Title = styled.h1`
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-weight: 800;
  font-size: 2rem;
  background: linear-gradient(135deg, #007bff, #0056b3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
`;

const SelectionSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const SectionTitle = styled.h2`
  color: #007bff;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  text-align: center;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${({ active }) => active ? '#007bff' : '#e9ecef'};
  background: ${({ active }) => active ? '#007bff' : 'white'};
  color: ${({ active }) => active ? 'white' : '#6c757d'};
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    border-color: #007bff;
    color: ${({ active }) => active ? 'white' : '#007bff'};
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

const SimpleSelect = styled.select`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ApplicantsSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterSelect = styled.select`
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ApplicantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ApplicantRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007bff;
    background: #ffffff;
    box-shadow: 0 4px 16px rgba(0,123,255,0.1);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
`;

const ApplicantName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #343a40;
`;

const ApplicantPosition = styled.div`
  color: #6c757d;
  font-size: 1rem;
`;

const ViewButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  justify-self: end;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    justify-self: center;
    width: 100%;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  position: relative;
  color: #64748b;
  
  .icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #64748b;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background: linear-gradient(135deg, #007bff, #0056b3);
      border-radius: 50%;
      z-index: -1;
      opacity: 0.1;
    }
    
    @media (max-width: 768px) {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }
  }
  
  h3 {
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-size: 1.3rem;
    font-weight: 600;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
  
  p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    color: #64748b;
    max-width: 350px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
      max-width: 300px;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.5rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #007bff;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #f5c6cb;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #c3e6cb;
  text-align: center;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f8f9fa;
    color: #343a40;
  }
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status }) => {
    switch (status) {
      case 'pending':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      case 'reviewed':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      case 'shortlisted':
        return 'background: #cce5ff; color: #004085; border: 1px solid #99d1ff;';
      case 'rejected':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'hired':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      default:
        return 'background: #e9ecef; color: #495057; border: 1px solid #dee2e6;';
    }
  }}
`;

const ActionButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
      transform: translateY(-1px);
    }
  }
`;

const StatusSelect = styled.select`
  padding: 0.6rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  margin-top: 1rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ViewApplicants = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jobId = params.get('jobId');

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('jobs');
  const [loadingItems, setLoadingItems] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchJobsAndScholarships();
    
    // Set up periodic refresh every 30 seconds to get live data
    const interval = setInterval(() => {
      fetchJobsAndScholarships();
      if (selectedItem) {
        fetchApplicants();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedItem) {
      fetchApplicants();
    } else {
      setApplicants([]);
    }
  }, [selectedItem, statusFilter]);

  // Refresh data when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchJobsAndScholarships();
        if (selectedItem) {
          fetchApplicants();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [selectedItem]);

  const fetchJobsAndScholarships = async () => {
    setLoadingItems(true);
    try {
      // Fetch jobs from correct endpoint
      const jobsRes = await fetch('/api/employer/jobs/employer', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const jobsData = await jobsRes.json();
      if (jobsData.success) {
        setJobs(jobsData.data.jobs || []);
        console.log('Jobs fetched:', jobsData.data.jobs);
      } else {
        console.error('Failed to fetch jobs:', jobsData.message);
        setError(`Failed to fetch jobs: ${jobsData.message}`);
      }

      // Fetch scholarships from correct endpoint  
      const scholarshipsRes = await fetch('/api/scholarships/employer/scholarships', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const scholarshipsData = await scholarshipsRes.json();
      if (scholarshipsData.success) {
        setScholarships(scholarshipsData.data.scholarships || []);
        console.log('Scholarships fetched:', scholarshipsData.data.scholarships);
      } else {
        console.error('Failed to fetch scholarships:', scholarshipsData.message);
        setError(`Failed to fetch scholarships: ${scholarshipsData.message}`);
      }
      
    } catch (err) {
      console.error('Network error:', err);
      setError('Failed to load jobs and scholarships: ' + err.message);
    } finally {
      setLoadingItems(false);
      setLastUpdated(new Date());
    }
  };

  const fetchApplicants = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (selectedType === 'jobs') {
        url = `/api/employer/jobs/${selectedItem._id}/applications`;
      } else {
        url = `/api/employer/scholarships/${selectedItem._id}/applications`;
      }
      
      if (statusFilter) url += `?status=${statusFilter}`;
      
      console.log('Fetching applicants from:', url);
      console.log('Selected item:', selectedItem);
      console.log('Auth token exists:', !!localStorage.getItem('token'));
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Applicants response:', data);
      
      if (data.success) {
        const applications = data.data.applications || [];
        setApplicants(applications);
        console.log('Applicants fetched:', applications);
        if (applications.length === 0) {
          console.log('No applications found for this item');
        }
      } else {
        console.error('Failed to fetch applicants:', data.message);
        // Clear applicants on error
        setApplicants([]);
        setError(data.message || 'Failed to fetch applicants');
      }
    } catch (err) {
      console.error('Network error fetching applicants:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      let url = '';
      if (selectedType === 'jobs') {
        url = `/api/employer/jobs/${selectedItem._id}/applications/${applicationId}`;
      } else {
        url = `/api/employer/scholarships/${selectedItem._id}/applications/${applicationId}`;
      }
      
      console.log('Updating application status:', { url, applicationId, newStatus });
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      console.log('Status update response:', data);

      if (data.success) {
        setApplicants(applicants.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
        setSuccessMessage(`Application status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Update the selected applicant if it's the one being updated
        if (selectedApplicant && selectedApplicant._id === applicationId) {
          setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        }
      } else {
        console.error('Failed to update status:', data.message);
        setError(data.message || 'Failed to update application status');
      }
    } catch (err) {
      console.error('Network error updating status:', err);
      setError('Network error. Please try again.');
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = searchTerm === '' || 
      applicant.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const currentItems = selectedType === 'jobs' ? jobs : scholarships;

  if (loadingItems) {
    return (
      <Container>
        <Header>
          <Title>View Applicants</Title>
          <Subtitle>Manage applications for your jobs and scholarships</Subtitle>
        </Header>
        <LoadingSpinner>Loading your jobs and scholarships...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>View Applicants</Title>
        <Subtitle>Manage applications for your jobs and scholarships</Subtitle>
        {lastUpdated && (
          <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <SelectionSection>
        <SectionTitle>Select Position or Scholarship</SectionTitle>
        
        <TabContainer>
                     <Tab 
             active={selectedType === 'jobs'} 
             onClick={() => {
               setSelectedType('jobs');
               setSelectedItem(null);
               setApplicants([]);
               setError('');
               setStatusFilter('');
             }}
           >
             🏢 Job Positions ({jobs.length})
           </Tab>
           <Tab 
             active={selectedType === 'scholarships'} 
             onClick={() => {
               setSelectedType('scholarships');
               setSelectedItem(null);
               setApplicants([]);
               setError('');
               setStatusFilter('');
             }}
           >
             🎓 Scholarships ({scholarships.length})
           </Tab>
        </TabContainer>

        {currentItems.length === 0 ? (
          <EmptyState>
            <div className="icon">👥</div>
            <h3>No {selectedType === 'jobs' ? 'job positions' : 'scholarships'} found</h3>
            <p>Create some {selectedType === 'jobs' ? 'job postings' : 'scholarships'} to start receiving applications</p>
          </EmptyState>
                  ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SimpleSelect 
                value={selectedItem?._id || ''} 
                onChange={(e) => {
                  const item = currentItems.find(item => item._id === e.target.value);
                  setSelectedItem(item);
                  setError('');
                  setStatusFilter('');
                }}
              >
                <option value="">Select a {selectedType === 'jobs' ? 'job position' : 'scholarship'}</option>
                {currentItems.map(item => (
                  <option key={item._id} value={item._id}>{item.title}</option>
                ))}
              </SimpleSelect>
            </div>
          )}
      </SelectionSection>

      {selectedItem && (
        <ApplicantsSection>
          <SectionTitle>
            Applications for "{selectedItem.title}"
          </SectionTitle>

          <FiltersContainer>
            <SearchInput
              type="text"
              placeholder="Search applicants by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
                         <FilterSelect
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="">All Statuses</option>
               <option value="pending">Pending</option>
               <option value="reviewed">Reviewed</option>
               <option value="shortlisted">Shortlisted</option>
               <option value="rejected">Rejected</option>
               {selectedType === 'jobs' ? (
                 <option value="hired">Hired</option>
               ) : (
                 <>
                   <option value="accepted">Accepted</option>
                   <option value="closed">Closed</option>
                 </>
               )}
             </FilterSelect>
          </FiltersContainer>

          {loading ? (
            <LoadingSpinner>Loading applicants...</LoadingSpinner>
          ) : filteredApplicants.length === 0 ? (
            <EmptyState>
              <div className="icon">👥</div>
              <h3>No applicants found</h3>
              <p>No one has applied for this {selectedType === 'jobs' ? 'position' : 'scholarship'} yet.</p>
            </EmptyState>
          ) : (
            <ApplicantsList>
              {filteredApplicants.map((applicant) => (
                <ApplicantRow key={applicant._id}>
                  <ApplicantName>👤 {applicant.user?.firstName} {applicant.user?.lastName}</ApplicantName>
                  <ApplicantPosition>📧 {applicant.user?.email}</ApplicantPosition>
                  <ViewButton 
                    className="primary"
                    onClick={() => setSelectedApplicant(applicant)}
                  >
                    View Details
                  </ViewButton>
                </ApplicantRow>
              ))}
            </ApplicantsList>
          )}
        </ApplicantsSection>
      )}

      {selectedApplicant && (
        <Modal onClick={() => setSelectedApplicant(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>👤 {selectedApplicant.user?.firstName} {selectedApplicant.user?.lastName}</h2>
              <CloseButton onClick={() => setSelectedApplicant(null)}>×</CloseButton>
            </ModalHeader>
            
                         <div style={{ display: 'grid', gap: '1.5rem' }}>
               <div>
                 <h4>📧 Contact Information</h4>
                 <p><strong>Email:</strong> {selectedApplicant.user?.email}</p>
                 <p><strong>Applied:</strong> {new Date(selectedApplicant.appliedAt).toLocaleString()}</p>
                 <p><strong>Current Status:</strong> <StatusBadge status={selectedApplicant.status}>{selectedApplicant.status}</StatusBadge></p>
                 
                 <div style={{ marginTop: '1rem' }}>
                   <h4>Update Application Status:</h4>
                   <StatusSelect
                     value={selectedApplicant.status}
                     onChange={(e) => updateApplicationStatus(selectedApplicant._id, e.target.value)}
                   >
                     {selectedType === 'jobs' ? (
                       <>
                         <option value="pending">Pending</option>
                         <option value="reviewed">Reviewed</option>
                         <option value="shortlisted">Shortlisted</option>
                         <option value="rejected">Rejected</option>
                         <option value="hired">Hired</option>
                       </>
                     ) : (
                       <>
                         <option value="pending">Pending</option>
                         <option value="reviewed">Reviewed</option>
                         <option value="shortlisted">Shortlisted</option>
                         <option value="accepted">Accepted</option>
                         <option value="rejected">Rejected</option>
                         <option value="closed">Closed</option>
                       </>
                     )}
                   </StatusSelect>
                 </div>
               </div>
              
              {selectedApplicant.coverLetter && (
                <div>
                  <h4>📝 Cover Letter</h4>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', lineHeight: '1.6' }}>
                    {selectedApplicant.coverLetter}
                  </div>
                </div>
              )}
              
              {selectedApplicant.resume && (
                <div>
                  <h4>📄 Resume/CV</h4>
                  <ActionButton 
                    className="primary"
                    onClick={() => window.open(selectedApplicant.resume, '_blank')}
                  >
                    📥 Download Resume
                  </ActionButton>
                </div>
              )}

              {selectedType === 'scholarships' && (
                <>
                  {selectedApplicant.essayReason && (
                    <div>
                      <h4>✍️ Application Essay</h4>
                      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', lineHeight: '1.6' }}>
                        {selectedApplicant.essayReason}
                      </div>
                    </div>
                  )}
                  
                  {selectedApplicant.documents && selectedApplicant.documents.length > 0 && (
                    <div>
                      <h4>📎 Supporting Documents</h4>
                      {selectedApplicant.documents.map((doc, index) => (
                        <ActionButton 
                          key={index}
                          className="secondary"
                          onClick={() => window.open(doc, '_blank')}
                          style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                        >
                          📥 Document {index + 1}
                        </ActionButton>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ViewApplicants; 