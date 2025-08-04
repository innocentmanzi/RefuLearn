import React, { useState, useEffect } from 'react';
import offlineIntegrationService from '../../services/offlineIntegrationService';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [scholarshipDropdownOpen, setScholarshipDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize offline integration service
  useEffect(() => {
    const initializeOfflineService = async () => {
      try {
        console.log('🔧 Initializing offline integration service for Jobs page...');
        await offlineIntegrationService.initialize();
        console.log('✅ Offline integration service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize offline integration service:', error);
      }
    };
    
    initializeOfflineService();
  }, []);

  // Fetch jobs and scholarships on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;

        if (isOnline) {
          try {
            // Fetch jobs
            const jobsResponse = await fetch('/api/jobs', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (jobsResponse.ok) {
              const jobsData = await jobsResponse.json();
              const fetchedJobs = jobsData.data?.jobs || [];
              setJobs(fetchedJobs);
              setFilteredJobs(fetchedJobs);
              
              // Store jobs in offline cache
              await offlineIntegrationService.storeJobs(fetchedJobs);
              
              // Also store in localStorage as backup
              localStorage.setItem('jobs_cache', JSON.stringify(fetchedJobs));
              console.log('💾 Jobs cached for offline use:', fetchedJobs.length);
            }

            // Fetch scholarships
            const scholarshipsResponse = await fetch('/api/scholarships', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (scholarshipsResponse.ok) {
              const scholarshipsData = await scholarshipsResponse.json();
              const fetchedScholarships = scholarshipsData.data?.scholarships || [];
              setScholarships(fetchedScholarships);
              setFilteredScholarships(fetchedScholarships);
              
              // Store scholarships in offline cache
              await offlineIntegrationService.storeScholarships(fetchedScholarships);
              
              // Also store in localStorage as backup
              localStorage.setItem('scholarships_cache', JSON.stringify(fetchedScholarships));
              console.log('💾 Scholarships cached for offline use:', fetchedScholarships.length);
            }

          } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load jobs and scholarships');
          }
        } else {
          // Offline mode - load from offline integration service
          console.log('📱 Offline mode - loading cached data from offline service');
          console.log('🔍 Network status:', navigator.onLine ? 'Online' : 'Offline');
          
          try {
            // Get jobs from offline cache
            const cachedJobs = await offlineIntegrationService.getJobs();
            console.log('📦 Cached jobs found:', cachedJobs.length);
            console.log('📦 Jobs data:', cachedJobs);
            setJobs(cachedJobs);
            setFilteredJobs(cachedJobs);
            
            // Get scholarships from offline cache
            const cachedScholarships = await offlineIntegrationService.getScholarships();
            console.log('📦 Cached scholarships found:', cachedScholarships.length);
            console.log('📦 Scholarships data:', cachedScholarships);
            setScholarships(cachedScholarships);
            setFilteredScholarships(cachedScholarships);
            
            // Check if we have any data
            if (cachedJobs.length === 0 && cachedScholarships.length === 0) {
              console.log('⚠️ No cached data found, checking localStorage fallback...');
              
              // Fallback to localStorage if offline service has no data
              const localStorageJobs = localStorage.getItem('jobs_cache');
              const localStorageScholarships = localStorage.getItem('scholarships_cache');
              
              console.log('🔍 localStorage jobs:', localStorageJobs ? 'Found' : 'Not found');
              console.log('🔍 localStorage scholarships:', localStorageScholarships ? 'Found' : 'Not found');
              
              if (localStorageJobs) {
                const parsedJobs = JSON.parse(localStorageJobs);
                console.log('📦 localStorage jobs parsed:', parsedJobs.length);
                setJobs(parsedJobs);
                setFilteredJobs(parsedJobs);
              }
              if (localStorageScholarships) {
                const parsedScholarships = JSON.parse(localStorageScholarships);
                console.log('📦 localStorage scholarships parsed:', parsedScholarships.length);
                setScholarships(parsedScholarships);
                setFilteredScholarships(parsedScholarships);
              }
            }
            
          } catch (offlineError) {
            console.error('Error loading offline data:', offlineError);
            
            // Fallback to localStorage if offline service fails
            const cachedJobs = localStorage.getItem('jobs_cache');
            const cachedScholarships = localStorage.getItem('scholarships_cache');

            if (cachedJobs) {
              const parsedJobs = JSON.parse(cachedJobs);
              setJobs(parsedJobs);
              setFilteredJobs(parsedJobs);
            }
            if (cachedScholarships) {
              const parsedScholarships = JSON.parse(cachedScholarships);
              setScholarships(parsedScholarships);
              setFilteredScholarships(parsedScholarships);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter jobs and scholarships when search changes
  useEffect(() => {
    // Filter out jobs with passed deadlines
    const filterJobsByDeadline = (jobsList) => {
      return jobsList.filter(job => {
        if (!job.application_deadline) return true; // Keep jobs without deadline
        const deadlineDate = new Date(job.application_deadline);
        const today = new Date();
        const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0; // Only keep jobs with deadline today or in the future
      });
    };

    // Filter out scholarships with passed deadlines
    const filterScholarshipsByDeadline = (scholarshipsList) => {
      return scholarshipsList.filter(scholarship => {
        if (!scholarship.deadline) return true; // Keep scholarships without deadline
        const deadlineDate = new Date(scholarship.deadline);
        const today = new Date();
        const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0; // Only keep scholarships with deadline today or in the future
      });
    };

    if (searchTerm.trim() === '') {
      setFilteredJobs(filterJobsByDeadline(jobs));
      setFilteredScholarships(filterScholarshipsByDeadline(scholarships));
    } else {
      const searchLower = searchTerm.toLowerCase();
      const deadlineFilteredJobs = filterJobsByDeadline(jobs);
      const deadlineFilteredScholarships = filterScholarshipsByDeadline(scholarships);
      
      setFilteredJobs(deadlineFilteredJobs.filter(item => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.company?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower)
      ));
      setFilteredScholarships(deadlineFilteredScholarships.filter(item => 
        item.title?.toLowerCase().includes(searchLower) ||
        item.provider?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower)
      ));
    }
  }, [searchTerm, jobs, scholarships]);

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return { text: t('jobs.deadlinePassed', 'Deadline passed'), urgent: false };
    if (daysDiff === 0) return { text: t('jobs.deadlineToday', 'Deadline today'), urgent: true };
    if (daysDiff === 1) return { text: t('jobs.deadlineTomorrow', 'Deadline tomorrow'), urgent: true };
    if (daysDiff <= 7) return { text: t('jobs.daysLeft', '{{days}} days left', { days: daysDiff }), urgent: true };
    return { text: t('jobs.daysLeft', '{{days}} days left', { days: daysDiff }), urgent: false };
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
          <Title>{t('jobs.opportunities', 'Job & Scholarship Opportunities')}</Title>
          <Subtitle>{t('jobs.findOpportunity', 'Find your next opportunity')}</Subtitle>
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
          <Title>{t('jobs.opportunities', 'Job & Scholarship Opportunities')}</Title>
          <Subtitle>{t('jobs.findOpportunity', 'Find your next opportunity')}</Subtitle>
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
        <Title>{t('jobs.opportunities', 'Job & Scholarship Opportunities')}</Title>
        <Subtitle>{t('jobs.findOpportunity', 'Find your next opportunity')}</Subtitle>
        <SearchBar
          type="text"
          placeholder={t('jobs.searchPlaceholder', 'Search for jobs, scholarships, companies, or locations...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Header>

      {/* Job Listings */}
      <Section>
        <SectionTitle>{t('jobs.jobListings', 'Job Listings')}</SectionTitle>
        <DropdownContainer>
          <DropdownButton
            onClick={() => setJobDropdownOpen(!jobDropdownOpen)}
            isOpen={jobDropdownOpen}
          >
            <span className={selectedJob ? '' : 'placeholder'}>
              {selectedJob ? selectedJob.title : t('jobs.selectJobOpportunity', 'Select a job opportunity...')}
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

        {/* Display all available jobs as cards */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '600' }}>{t('jobs.allAvailableJobs', 'All Available Jobs')}</h3>
          {filteredJobs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredJobs.map((job, idx) => {
                const deadline = formatDeadline(job.application_deadline);
                return (
                  <div key={job._id || idx} style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => handleJobSelect(job)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                  }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#1e293b', margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600' }}>
                        {job.title}
                      </h4>
                      <div style={{ color: '#64748b', margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>
                        🏢 {job.company}
                      </div>
                      <div style={{ color: '#64748b', margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>
                        📍 {job.location}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      backgroundColor: deadline.urgent ? '#fef2f2' : '#f0f9ff',
                      color: deadline.urgent ? '#dc2626' : '#0369a1',
                      border: `1px solid ${deadline.urgent ? '#fecaca' : '#bae6fd'}`
                    }}>
                      {deadline.text}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>No Jobs Available</h4>
              <p>Check back later for new opportunities</p>
            </div>
          )}
        </div>
      </Section>

      {/* Scholarship Opportunities */}
      <Section>
        <SectionTitle>{t('jobs.scholarshipOpportunities', 'Scholarship Opportunities')}</SectionTitle>
        <DropdownContainer>
          <DropdownButton
            onClick={() => setScholarshipDropdownOpen(!scholarshipDropdownOpen)}
            isOpen={scholarshipDropdownOpen}
          >
            <span className={selectedScholarship ? '' : 'placeholder'}>
              {selectedScholarship ? selectedScholarship.title : t('jobs.selectScholarshipOpportunity', 'Select a scholarship opportunity...')}
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

        {/* Display all available scholarships as cards */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '600' }}>{t('jobs.allAvailableScholarships', 'All Available Scholarships')}</h3>
          {filteredScholarships.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredScholarships.map((scholarship, idx) => {
                const deadline = formatDeadline(scholarship.deadline);
                return (
                  <div key={scholarship._id || idx} style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => handleScholarshipSelect(scholarship)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                  }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#1e293b', margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600' }}>
                        {scholarship.title}
                      </h4>
                      <div style={{ color: '#64748b', margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>
                        🏛️ {scholarship.provider}
                      </div>
                      <div style={{ color: '#64748b', margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>
                        📍 {scholarship.location}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      backgroundColor: deadline.urgent ? '#fef2f2' : '#f0fdf4',
                      color: deadline.urgent ? '#dc2626' : '#16a34a',
                      border: `1px solid ${deadline.urgent ? '#fecaca' : '#bbf7d0'}`
                    }}>
                      {deadline.text}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>No Scholarships Available</h4>
              <p>Check back later for new opportunities</p>
            </div>
          )}
        </div>
      </Section>
    </Container>
  );
};

export default Jobs; 