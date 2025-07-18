import React, { useState, useEffect } from 'react';
import offlineIntegrationService from '../../services/offlineIntegrationService';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 1rem;
  font-size: 2.5rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Section = styled.div`
  margin-bottom: 3rem;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #007bff;
  display: inline-block;
`;

const DropdownContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  
  /* Remove any default button styling */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  
  /* Ensure no background images or gradients */
  background-image: none;
  background-color: transparent;
  
  /* Remove any default shadows */
  box-shadow: none;
  
  &:hover {
    border-color: #007bff;
    background-color: transparent;
  }
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    background-color: transparent;
  }
  
  &:active {
    background-color: transparent;
  }
  
  /* Remove any pseudo-elements that might create rectangles */
  &::before,
  &::after {
    display: none;
  }
  
  .placeholder {
    color: #999;
    background: transparent;
  }
  
  .arrow {
    font-size: 1.2rem;
    transition: transform 0.2s ease;
    color: #666;
    ${({ isOpen }) => isOpen && 'transform: rotate(180deg);'}
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  
  ${({ isOpen }) => !isOpen && 'display: none;'}
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #0056b3;
  }
`;

const DropdownOption = styled.div`
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .title {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .meta {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  
  .deadline {
    color: ${({ urgent }) => urgent ? '#dc3545' : '#28a745'};
    font-size: 0.85rem;
    font-weight: 500;
  }
`;

const SelectedItemDisplay = styled.div`
  background: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  
  .title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    color: #666;
    
    .icon {
      margin-right: 0.5rem;
      font-size: 1rem;
    }
  }
  
  .deadline-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    margin: 1rem 0;
    
    ${({ urgent }) => urgent ? `
      background: #fff5f5;
      color: #dc3545;
      border: 1px solid #fecaca;
    ` : `
      background: #f0f9ff;
      color: #0369a1;
      border: 1px solid #bae6fd;
    `}
  }
  
  .action-button {
    width: 100%;
    padding: 0.75rem;
    background: ${({ variant }) => variant === 'scholarship' ? '#6f42c1' : '#007bff'};
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
    
    &:hover {
      background: ${({ variant }) => variant === 'scholarship' ? '#5a3a9a' : '#0056b3'};
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Jobs = () => {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [scholarshipDropdownOpen, setScholarshipDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;

        let jobsData = [];
        let scholarshipsData = [];

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching jobs and scholarships from API...');
            
            // Fetch jobs
            const jobsResponse = await fetch('/api/jobs', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (jobsResponse.ok) {
              const jobsApiData = await jobsResponse.json();
              console.log('✅ Jobs API Response:', jobsApiData);
              // Backend returns: { success: true, data: { jobs: [...], pagination: {...} } }
              jobsData = jobsApiData.data?.jobs || [];
              console.log('✅ Jobs data received:', jobsData.length);
              
              // Store jobs for offline use
              try {
                await offlineIntegrationService.storeJobs(jobsData);
              } catch (storeError) {
                console.warn('⚠️ Failed to store jobs offline:', storeError);
              }
            } else {
              console.error('❌ Jobs API failed:', jobsResponse.status);
            }

            // Fetch scholarships
            const scholarshipsResponse = await fetch('/api/scholarships', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (scholarshipsResponse.ok) {
              const scholarshipsApiData = await scholarshipsResponse.json();
              console.log('✅ Scholarships API Response:', scholarshipsApiData);
              // Backend returns: { success: true, data: { scholarships: [...], pagination: {...} } }
              scholarshipsData = scholarshipsApiData.data?.scholarships || [];
              console.log('✅ Scholarships data received:', scholarshipsData.length);
              
              // Store scholarships for offline use
              try {
                await offlineIntegrationService.storeScholarships(scholarshipsData);
              } catch (storeError) {
                console.warn('⚠️ Failed to store scholarships offline:', storeError);
              }
            } else {
              console.error('❌ Scholarships API failed:', scholarshipsResponse.status);
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            const offlineData = await fetchOfflineData();
            jobsData = offlineData.jobs;
            scholarshipsData = offlineData.scholarships;
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline data...');
          const offlineData = await fetchOfflineData();
          jobsData = offlineData.jobs;
          scholarshipsData = offlineData.scholarships;
        }

        // Update state with fetched data
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setScholarships(scholarshipsData);
        setFilteredScholarships(scholarshipsData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to fetch offline data
    const fetchOfflineData = async () => {
      try {
        let jobs = [];
        let scholarships = [];
        
        // Try to get jobs with error handling
        try {
          jobs = await offlineIntegrationService.getJobs() || [];
        } catch (jobsError) {
          console.warn('⚠️ Failed to get offline jobs:', jobsError);
          jobs = [];
        }
        
        // Try to get scholarships with error handling
        try {
          scholarships = await offlineIntegrationService.getScholarships() || [];
        } catch (scholarshipsError) {
          console.warn('⚠️ Failed to get offline scholarships:', scholarshipsError);
          scholarships = [];
        }
        
        console.log('📱 Offline data loaded:', {
          jobs: jobs.length,
          scholarships: scholarships.length
        });
        
        return { jobs, scholarships };
      } catch (error) {
        console.error('❌ Failed to load offline data:', error);
        return { jobs: [], scholarships: [] };
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredJobs(jobs);
      setFilteredScholarships(scholarships);
    } else {
      const searchTerm = search.toLowerCase();
      setFilteredJobs(jobs.filter(item => 
        item.title?.toLowerCase().includes(searchTerm) ||
        item.company?.toLowerCase().includes(searchTerm) ||
        item.location?.toLowerCase().includes(searchTerm)
      ));
      setFilteredScholarships(scholarships.filter(item => 
        item.title?.toLowerCase().includes(searchTerm) ||
        item.provider?.toLowerCase().includes(searchTerm) ||
        item.location?.toLowerCase().includes(searchTerm)
      ));
    }
  }, [search, jobs, scholarships]);

  const formatDeadline = (deadline) => {
    if (!deadline) return { text: 'No deadline', urgent: false };
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return { text: 'Expired', urgent: true };
    if (daysDiff === 0) return { text: 'Today', urgent: true };
    if (daysDiff === 1) return { text: '1 day left', urgent: true };
    if (daysDiff <= 7) return { text: `${daysDiff} days left`, urgent: true };
    return { text: `${daysDiff} days left`, urgent: false };
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setJobDropdownOpen(false);
  };

  const handleScholarshipSelect = (scholarship) => {
    setSelectedScholarship(scholarship);
    setScholarshipDropdownOpen(false);
  };

  const handleViewMore = (item, type) => {
    if (type === 'job') {
      navigate(`/jobs/${item._id}`, { state: { ...item, type } });
    } else if (type === 'scholarship') {
      navigate(`/scholarships/${item._id}`, { state: { ...item, type } });
    }
  };

  // Handle job application offline
  const handleJobApplication = async (jobId, applicationData) => {
    try {
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        try {
          // Try online application first (preserving existing behavior)
          console.log('🌐 Online job application for job:', jobId);
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(applicationData)
          });

          if (response.ok) {
            console.log('✅ Online job application successful');
            return { success: true, message: 'Application submitted successfully!' };
          } else {
            throw new Error('Online application failed');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online application failed, using offline:', onlineError);
          // Fall back to offline application
          try {
            await offlineIntegrationService.storeJobApplication(jobId, applicationData);
            console.log('✅ Offline job application successful');
            return { success: true, message: 'Application saved offline and will be submitted when online!' };
          } catch (offlineError) {
            console.error('❌ Offline job application also failed:', offlineError);
            return { success: false, message: 'Failed to submit application offline' };
          }
        }
      } else {
        // Offline application
        console.log('📴 Offline job application for job:', jobId);
        try {
          await offlineIntegrationService.storeJobApplication(jobId, applicationData);
          console.log('✅ Offline job application successful');
          return { success: true, message: 'Application saved offline and will be submitted when online!' };
        } catch (offlineError) {
          console.error('❌ Offline job application failed:', offlineError);
          return { success: false, message: 'Failed to submit application offline' };
        }
      }
    } catch (error) {
      console.error('❌ Job application failed:', error);
      return { success: false, message: 'Failed to submit application' };
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Job & Scholarship Opportunities</Title>
          <Subtitle>Find your next opportunity</Subtitle>
        </Header>
        <LoadingState>
          <div className="spinner" />
          <p>Loading opportunities...</p>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Job & Scholarship Opportunities</Title>
          <Subtitle>Find your next opportunity</Subtitle>
        </Header>
        <EmptyState>
          <div className="icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Job & Scholarship Opportunities</Title>
        <Subtitle>Find your next opportunity</Subtitle>
        <SearchBar
          type="text"
          placeholder="Search for jobs, scholarships, companies, or locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Header>

      {/* Job Listings */}
      <Section>
        <SectionTitle>Job Listings</SectionTitle>
        <DropdownContainer>
          <DropdownButton
            onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
            isOpen={jobDropdownOpen}
          >
            <span className={selectedJob ? '' : 'placeholder'}>
              {selectedJob ? selectedJob.title : 'Select a job opportunity...'}
            </span>
            <span className="arrow">▼</span>
          </DropdownButton>
          
          <DropdownMenu isOpen={jobDropdownOpen}>
            {filteredJobs.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                No job opportunities found
              </div>
            ) : (
              filteredJobs.map((job, idx) => {
                const deadline = formatDeadline(job.application_deadline);
                return (
                  <DropdownOption
                    key={job._id || idx}
                    onClick={() => handleJobSelect(job)}
                    urgent={deadline.urgent}
                  >
                    <div className="title">{job.title}</div>
                    <div className="meta">🏢 {job.company} • 📍 {job.location}</div>
                    <div className="deadline">{deadline.text}</div>
                  </DropdownOption>
                );
              })
            )}
          </DropdownMenu>
        </DropdownContainer>

        {selectedJob && (
          <SelectedItemDisplay urgent={formatDeadline(selectedJob.application_deadline).urgent}>
            <div className="title">{selectedJob.title}</div>
            <div className="info-row">
              <span className="icon">🏢</span>
              <span><strong>Company:</strong> {selectedJob.company}</span>
            </div>
            <div className="info-row">
              <span className="icon">📍</span>
              <span><strong>Location:</strong> {selectedJob.location}</span>
            </div>
            {selectedJob.application_deadline && (
              <div className="info-row">
                <span className="icon">📅</span>
                <span><strong>Deadline:</strong> {new Date(selectedJob.application_deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="deadline-badge">
              {formatDeadline(selectedJob.application_deadline).text}
            </div>
            <button 
              className="action-button"
              onClick={() => handleViewMore(selectedJob, 'job')}
            >
              View Details & Apply
            </button>
          </SelectedItemDisplay>
        )}
      </Section>

      {/* Scholarship Opportunities */}
      <Section>
        <SectionTitle>Scholarship Opportunities</SectionTitle>
        <DropdownContainer>
          <DropdownButton
            onClick={() => setScholarshipDropdownOpen(!scholarshipDropdownOpen)}
            isOpen={scholarshipDropdownOpen}
          >
            <span className={selectedScholarship ? '' : 'placeholder'}>
              {selectedScholarship ? selectedScholarship.title : 'Select a scholarship opportunity...'}
            </span>
            <span className="arrow">▼</span>
          </DropdownButton>
          
          <DropdownMenu isOpen={scholarshipDropdownOpen}>
            {filteredScholarships.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                No scholarship opportunities found
              </div>
            ) : (
              filteredScholarships.map((scholarship, idx) => {
                const deadline = formatDeadline(scholarship.deadline);
                return (
                  <DropdownOption
                    key={scholarship._id || idx}
                    onClick={() => handleScholarshipSelect(scholarship)}
                    urgent={deadline.urgent}
                  >
                    <div className="title">{scholarship.title}</div>
                    <div className="meta">🏛️ {scholarship.provider} • 📍 {scholarship.location}</div>
                    <div className="deadline">{deadline.text}</div>
                  </DropdownOption>
                );
              })
            )}
          </DropdownMenu>
        </DropdownContainer>

        {selectedScholarship && (
          <SelectedItemDisplay 
            urgent={formatDeadline(selectedScholarship.deadline).urgent}
            variant="scholarship"
          >
            <div className="title">{selectedScholarship.title}</div>
            <div className="info-row">
              <span className="icon">🏛️</span>
              <span><strong>Provider:</strong> {selectedScholarship.provider}</span>
            </div>
            <div className="info-row">
              <span className="icon">📍</span>
              <span><strong>Location:</strong> {selectedScholarship.location}</span>
            </div>
            {selectedScholarship.deadline && (
              <div className="info-row">
                <span className="icon">📅</span>
                <span><strong>Deadline:</strong> {new Date(selectedScholarship.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="deadline-badge">
              {formatDeadline(selectedScholarship.deadline).text}
            </div>
            <button 
              className="action-button"
              onClick={() => handleViewMore(selectedScholarship, 'scholarship')}
            >
              View Details & Apply
            </button>
          </SelectedItemDisplay>
        )}
      </Section>
    </Container>
  );
};

export default Jobs; 