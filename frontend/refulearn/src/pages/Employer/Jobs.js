import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';


const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
  max-width: 100vw;
  
  @media (max-width: 900px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.8rem;
  }
`;
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;
const Title = styled.h1`
  color: #007bff;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;
const PostButton = styled.button`
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
  
  &:before {
    content: '✨';
    font-size: 1rem;
  }
`;
const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;
const JobCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(226, 232, 240, 0.8);
  width: 100%;
  min-height: 450px;
  max-height: 480px;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #007bff, #0056b3);
    border-radius: 12px 12px 0 0;
  }
`;
const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover {
            background: #0056b3;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
          &:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
            transform: translateY(-1px);
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover {
            background: #218838;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #007bff;
          color: white;
          &:hover {
            background: #0056b3;
          }
        `;
    }
  }}
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status }) => {
    if (status === 'active') {
      return `
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      `;
    } else {
      return `
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      `;
    }
  }}
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
`;

const MetricIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  
  ${({ type }) => {
    switch (type) {
      case 'location':
        return `background: #007bff; color: white;`;
      case 'type':
        return `background: #6f42c1; color: white;`;
      case 'salary':
        return `background: #28a745; color: white;`;
      case 'applications':
        return `background: #17a2b8; color: white;`;
      default:
        return `background: #f1f5f9; color: #475569;`;
    }
  }}
`;

const CardHeader = styled.div`
  padding: 1rem 1rem 0.5rem 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
`;

const CardBody = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardFooter = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  background: rgba(248, 250, 252, 0.5);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;
const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;
const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;
const FilterButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;
const FilterButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: 2px solid ${({ active }) => active ? '#007bff' : '#dee2e6'};
  background: ${({ active }) => active ? '#007bff' : '#fff'};
  color: ${({ active }) => active ? '#fff' : '#495057'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active }) => active ? '#0056b3' : '#f8f9fa'};
    transform: translateY(-1px);
  }
`;

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: '#007bff',
      color: '#fff',
      padding: '1rem 2rem',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontWeight: 600
    }}>
      {message}
      <button onClick={onClose} style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
    </div>
  );
}

function ErrorToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 24,
      background: '#dc3545',
      color: '#fff',
      padding: '1rem 2rem',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontWeight: 600
    }}>
      {message}
      <button onClick={onClose} style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
    </div>
  );
}

const Jobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const filter = params.get('filter') || 'all';
  const { t } = useTranslation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showDelete, setShowDelete] = useState(null);
  const [toast, setToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🌐 Fetching employer jobs from API...');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch('/api/jobs/employer/jobs?t=' + Date.now(), {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Cache-Control': 'no-cache'
        }
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📋 Response data:', data);

      if (data.success) {
        const jobsData = data.data.jobs || [];
        console.log('✅ Jobs found:', jobsData.length);
        setJobs(jobsData);
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('❌ Jobs fetch error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = job => {
    navigate(`/employer/jobs/${job._id}/edit`);
  };

  const handleDelete = async (jobId) => {
    try {
      console.log('🌐 Deleting job...');
      
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        fetchJobs();
        setSuccessMessage('Job deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('❌ Delete job error:', error);
      setError('Failed to delete job. Please try again.');
      setTimeout(() => setError(''), 4000);
    }
  };
  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ 
          isActive: !currentStatus,
          is_active: !currentStatus 
        })
      });
      if (response.ok) fetchJobs();
      else {
        setErrorToast('Failed to update job status');
        setTimeout(() => setErrorToast(''), 4000);
      }
    } catch (err) {
      setErrorToast('Network error. Please try again.');
      setTimeout(() => setErrorToast(''), 4000);
    }
  };

  const filterJobs = (jobs, filter) => {
    // Handle both isActive and is_active field names
    const isJobActive = (job) => job.isActive || job.is_active;
    
    if (filter === 'active') return jobs.filter(j => isJobActive(j));
    if (filter === 'inactive') return jobs.filter(j => !isJobActive(j));
    if (filter === 'closed') return jobs.filter(j => !isJobActive(j));
    return jobs;
  };

  const filteredJobs = filterJobs(jobs, filter);

  if (loading) {
    return (
      <Container>
        <HeaderRow>
          <Title>Jobs</Title>
          <PostButton onClick={() => navigate('/employer/post-jobs')}>Post New Job</PostButton>
        </HeaderRow>
        <LoadingSpinner>Loading jobs...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderRow>
        <Title>Jobs</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <PostButton onClick={() => navigate('/employer/post-jobs')}>Post New Job</PostButton>
        </div>
      </HeaderRow>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <FilterButtons>
        <FilterButton active={filter === 'all'} onClick={() => navigate('/employer/jobs?filter=all')}>All Jobs</FilterButton>
        <FilterButton active={filter === 'active'} onClick={() => navigate('/employer/jobs?filter=active')}>Active</FilterButton>
        <FilterButton active={filter === 'inactive'} onClick={() => navigate('/employer/jobs?filter=inactive')}>Inactive</FilterButton>
      </FilterButtons>

      {filteredJobs.length === 0 ? (
                    <div style={{ color: '#888', fontSize: '1.1rem', marginTop: 32 }}>No jobs found</div>
      ) : (
        <JobsGrid>
          {filteredJobs.map((job) => (
            <JobCard key={job._id}>
              <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: '0 0 0.25rem 0', 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          fontSize: '1.1rem', 
                          lineHeight: '1.3'
                        }}>
                          {job.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.75rem' }}>
                          <span>📅</span>
                          <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}</span>
                        </div>
                      </div>
                      <StatusBadge status={(job.isActive || job.is_active) ? 'active' : 'inactive'}>
                        {(job.isActive || job.is_active) ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </div>
                  </CardHeader>

                  <CardBody>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                      gap: '0.75rem' 
                    }}>
                      <MetricItem>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#1e293b', 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {job.location || 'Remote'}
                          </div>
                        </div>
                      </MetricItem>

                      <MetricItem>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#1e293b', 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {job.employmentType || job.job_type || 'Full Time'}
                          </div>
                        </div>
                      </MetricItem>

                      <MetricItem>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary</div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#28a745', 
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {job.salary_range || 'Competitive'}
                          </div>
                        </div>
                      </MetricItem>

                      <MetricItem>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applications</div>
                          <div style={{ fontSize: '0.8rem', color: '#007bff', fontWeight: 700 }}>
                            {Array.isArray(job.applications) ? job.applications.length : 0}
                          </div>
                        </div>
                      </MetricItem>

                      <MetricItem>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline</div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: job.application_deadline && new Date(job.application_deadline) < new Date() ? '#dc3545' : '#495057', 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {job.application_deadline 
                              ? new Date(job.application_deadline).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              : 'No deadline'
                            }
                          </div>
                        </div>
                      </MetricItem>
                    </div>

                    {job.description && (
                      <div style={{ 
                        background: 'rgba(248, 250, 252, 0.8)', 
                        border: '1px solid rgba(226, 232, 240, 0.6)', 
                        borderRadius: '8px', 
                        padding: '0.75rem' 
                      }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Description</div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#475569', 
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {job.description}
                        </div>
                      </div>
                    )}
                  </CardBody>

                  <CardFooter>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      flexWrap: 'wrap',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                        <ActionButton 
                          variant="primary"
                          onClick={() => handleEdit(job)}
                          style={{ flex: '1' }}
                        >
                          Edit
                        </ActionButton>
                        
                        {job.isActive ? (
                          <ActionButton 
                            variant="secondary"
                            onClick={() => toggleJobStatus(job._id, true)}
                            style={{ flex: '1' }}
                          >
                            Deactivate
                          </ActionButton>
                        ) : (
                          <ActionButton 
                            variant="success"
                            onClick={() => toggleJobStatus(job._id, false)}
                            style={{ flex: '1' }}
                          >
                            Activate
                          </ActionButton>
                        )}
                      </div>
                      
                      <ActionButton 
                        variant="danger"
                        onClick={() => handleDelete(job._id)}
                        style={{ minWidth: 'auto', padding: '0.5rem' }}
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </CardFooter>
            </JobCard>
          ))}
        </JobsGrid>
      )}

      <Toast message={toast} onClose={() => setToast('')} />
      <ErrorToast message={errorToast} onClose={() => setErrorToast('')} />
    </Container>
  );
};
export default Jobs; 