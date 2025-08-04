import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../contexts/UserContext';
import offlineIntegrationService from '../services/offlineIntegrationService';

const JobPortalContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 1rem 0;
`;

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const JobCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const JobTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const JobCompany = styled.div`
  color: #007bff;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const JobLocation = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const JobDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const JobDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const JobDetail = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const JobTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const JobTag = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
`;

const JobActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.applied {
    background: #ffc107;
    color: #000;
    cursor: not-allowed;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.applied {
    background: #d4edda;
    color: #155724;
  }
  
  &.saved {
    background: #d1ecf1;
    color: #0c5460;
  }
  
  &.offline {
    background: #fff3cd;
    color: #856404;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ApplicationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
`;

const FormField = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const OfflineJobPortal = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [processingJobs, setProcessingJobs] = useState(new Set());
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: '',
    additionalInfo: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, locationFilter, typeFilter, activeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await offlineIntegrationService.getOfflineJobs(user?.id);
      setJobs(jobsData || []);
    } catch (error) {
      console.error('❌ Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter out jobs with passed deadlines
    filtered = filtered.filter(job => {
      if (!job.deadline) return true; // Keep jobs without deadline
      const deadlineDate = new Date(job.deadline);
      const today = new Date();
      const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0; // Only keep jobs with deadline today or in the future
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(job =>
        job.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'applied':
        filtered = filtered.filter(job => job.applied);
        break;
      case 'saved':
        filtered = filtered.filter(job => job.saved);
        break;
      case 'offline':
        filtered = filtered.filter(job => job.isOfflineCreated);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredJobs(filtered);
  };

  const handleApplyJob = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;

    try {
      setProcessingJobs(prev => new Set(prev).add(selectedJob.id));
      
      await offlineIntegrationService.applyJob(selectedJob.id);
      
      // Update job in state
      setJobs(prev => prev.map(job => 
        job.id === selectedJob.id 
          ? { ...job, applied: true, appliedAt: Date.now() }
          : job
      ));
      
      setShowApplicationModal(false);
      setApplicationData({
        coverLetter: '',
        resume: '',
        additionalInfo: ''
      });
      
      console.log('✅ Applied to job successfully');
    } catch (error) {
      console.error('❌ Failed to apply to job:', error);
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedJob.id);
        return newSet;
      });
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      setProcessingJobs(prev => new Set(prev).add(jobId));
      
      await offlineIntegrationService.saveJob(jobId);
      
      // Update job in state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, saved: true, savedAt: Date.now() }
          : job
      ));
      
      console.log('✅ Job saved successfully');
    } catch (error) {
      console.error('❌ Failed to save job:', error);
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleViewJob = (jobId) => {
    window.open(`/job/${jobId}`, '_blank');
  };

  const getJobStatus = (job) => {
    if (job.applied) return 'applied';
    if (job.saved) return 'saved';
    if (job.isOfflineCreated) return 'offline';
    return null;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'saved': return 'Saved';
      case 'offline': return 'Offline';
      default: return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <JobPortalContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          Loading jobs...
        </div>
      </JobPortalContainer>
    );
  }

  return (
    <>
      <JobPortalContainer>
        <h2>Job Portal</h2>
        
        <SearchBar
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSection>
          <FilterSelect
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="remote">Remote</option>
            <option value="kigali">Kigali</option>
            <option value="nairobi">Nairobi</option>
            <option value="kampala">Kampala</option>
          </FilterSelect>
          
          <FilterSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </FilterSelect>
          
          <FilterButtons>
            <FilterButton
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            >
              All Jobs
            </FilterButton>
            <FilterButton
              active={activeFilter === 'applied'}
              onClick={() => setActiveFilter('applied')}
            >
              Applied
            </FilterButton>
            <FilterButton
              active={activeFilter === 'saved'}
              onClick={() => setActiveFilter('saved')}
            >
              Saved
            </FilterButton>
            <FilterButton
              active={activeFilter === 'offline'}
              onClick={() => setActiveFilter('offline')}
            >
              Offline
            </FilterButton>
          </FilterButtons>
        </FilterSection>

        {filteredJobs.length === 0 ? (
          <EmptyState>
            <p>No jobs found matching your criteria.</p>
          </EmptyState>
        ) : (
          <JobGrid>
            {filteredJobs.map((job) => {
              const status = getJobStatus(job);
              const isProcessing = processingJobs.has(job.id);
              
              return (
                <JobCard key={job.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <JobTitle>{job.title || 'Untitled Job'}</JobTitle>
                      <JobCompany>{job.company || 'Unknown Company'}</JobCompany>
                      <JobLocation>{job.location || 'Location not specified'}</JobLocation>
                    </div>
                    {status && (
                      <StatusBadge className={status}>
                        {getStatusText(status)}
                      </StatusBadge>
                    )}
                  </div>
                  
                  <JobDescription>
                    {job.description || 'No description available'}
                  </JobDescription>
                  
                  <JobDetails>
                    <JobDetail>
                      <DetailLabel>Type</DetailLabel>
                      <DetailValue>{job.type || 'Not specified'}</DetailValue>
                    </JobDetail>
                    <JobDetail>
                      <DetailLabel>Posted</DetailLabel>
                      <DetailValue>{formatDate(job.postedAt)}</DetailValue>
                    </JobDetail>
                    <JobDetail>
                      <DetailLabel>Deadline</DetailLabel>
                      <DetailValue>{formatDate(job.deadline)}</DetailValue>
                    </JobDetail>
                    <JobDetail>
                      <DetailLabel>Salary</DetailLabel>
                      <DetailValue>{job.salary || 'Not specified'}</DetailValue>
                    </JobDetail>
                  </JobDetails>
                  
                  {job.skills && job.skills.length > 0 && (
                    <JobTags>
                      {job.skills.map((skill, index) => (
                        <JobTag key={index}>{skill}</JobTag>
                      ))}
                    </JobTags>
                  )}
                  
                  <JobActions>
                    {!job.applied ? (
                      <ActionButton
                        className="primary"
                        onClick={() => handleApplyJob(job)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <LoadingSpinner /> : ''}
                        Apply
                      </ActionButton>
                    ) : (
                      <ActionButton className="applied" disabled>
                        Applied
                      </ActionButton>
                    )}
                    
                    {!job.saved && (
                      <ActionButton
                        className="secondary"
                        onClick={() => handleSaveJob(job.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <LoadingSpinner /> : ''}
                        Save
                      </ActionButton>
                    )}
                    
                    <ActionButton
                      className="success"
                      onClick={() => handleViewJob(job.id)}
                    >
                      View Details
                    </ActionButton>
                  </JobActions>
                </JobCard>
              );
            })}
          </JobGrid>
        )}
      </JobPortalContainer>

      {showApplicationModal && (
        <ApplicationModal>
          <ModalContent>
            <ModalHeader>
              <h3>Apply for {selectedJob?.title}</h3>
              <CloseButton onClick={() => setShowApplicationModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <FormField>
              <Label>Cover Letter</Label>
              <TextArea
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  coverLetter: e.target.value
                })}
                placeholder="Write your cover letter..."
              />
            </FormField>
            
            <FormField>
              <Label>Resume/CV</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  resume: e.target.files[0]
                })}
              />
            </FormField>
            
            <FormField>
              <Label>Additional Information</Label>
              <TextArea
                value={applicationData.additionalInfo}
                onChange={(e) => setApplicationData({
                  ...applicationData,
                  additionalInfo: e.target.value
                })}
                placeholder="Any additional information..."
              />
            </FormField>
            
            <JobActions>
              <ActionButton
                className="secondary"
                onClick={() => setShowApplicationModal(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                className="primary"
                onClick={handleSubmitApplication}
              >
                Submit Application
              </ActionButton>
            </JobActions>
          </ModalContent>
        </ApplicationModal>
      )}
    </>
  );
};

export default OfflineJobPortal; 