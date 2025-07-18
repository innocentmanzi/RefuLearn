import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 2rem;
  background: #f4f6fa;
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};

  &:hover {
    background: ${({ theme, disabled }) => !disabled ? theme.colors.secondary : theme.colors.primary};
  }
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

const RequirementsInput = styled.div`
  margin-bottom: 1rem;
`;

const RequirementTag = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin: 0.25rem;
  display: inline-block;
  font-size: 0.9rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
`;

const EditJob = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    employmentType: 'Full Time',
    requirements: [],
    benefits: '',
    applicationDeadline: '',
    applicationLink: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [newRequirement, setNewRequirement] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let jobData = null;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching job data from API...');
            
            const response = await fetch(`/api/jobs/${jobId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const jobApiData = await response.json();
              jobData = jobApiData.data.job;
              console.log('✅ Job data received');
              
              // Store job data for offline use
              await offlineIntegrationService.storeJobData(jobId, jobData);
            } else {
              throw new Error('Failed to fetch job');
            }

          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            
            // Fall back to offline data if online fails
            jobData = await offlineIntegrationService.getJobData(jobId);
            
            if (!jobData) {
              throw onlineError;
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline job data...');
          jobData = await offlineIntegrationService.getJobData(jobId);
        }

        if (jobData) {
          setFormData({
            title: jobData.title || '',
            description: jobData.description || '',
            company: jobData.company || '',
            location: jobData.location || '',
            salary: {
              min: jobData.salary?.min || '',
              max: jobData.salary?.max || '',
              currency: jobData.salary?.currency || 'USD'
            },
            employmentType: jobData.employmentType || 'Full Time',
            requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
            benefits: jobData.benefits || '',
            applicationDeadline: jobData.applicationDeadline || '',
            applicationLink: jobData.application_link || '',
            contactEmail: jobData.contactEmail || '',
            contactPhone: jobData.contactPhone || ''
          });
        }

      } catch (err) {
        console.error('❌ Error fetching job:', err);
        setError(err.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salaryMin' || name === 'salaryMax') {
      setFormData({
        ...formData,
        salary: {
          ...formData.salary,
          [name.replace('salary', '').toLowerCase()]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      let success = false;

      if (isOnline) {
        try {
          // Try online job update first (preserving existing behavior)
          console.log('🌐 Online mode: Updating job...');
          
          const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            success = true;
            console.log('✅ Online job update successful');
            
            setSuccess('Job updated successfully!');
            
            // Store updated job for offline use
            await offlineIntegrationService.storeJobData(jobId, formData);
            
            // Navigate back after delay
            setTimeout(() => {
              navigate('/employer/jobs');
            }, 1500);
          } else {
            throw new Error('Failed to update job');
          }

        } catch (onlineError) {
          console.warn('⚠️ Online update failed, using offline:', onlineError);
          
          // Fall back to offline job update
          const result = await offlineIntegrationService.updateJobOffline(jobId, formData);
          
          if (result.success) {
            success = true;
            console.log('✅ Offline job update successful');
            
            setSuccess('Job updated offline! Changes will sync when online.');
            
            // Navigate back after delay
            setTimeout(() => {
              navigate('/employer/jobs');
            }, 1500);
          } else {
            throw new Error('Failed to update job offline');
          }
        }
      } else {
        // Offline job update
        console.log('📴 Offline mode: Updating job offline...');
        const result = await offlineIntegrationService.updateJobOffline(jobId, formData);
        
        if (result.success) {
          success = true;
          console.log('✅ Offline job update successful');
          
          setSuccess('Job updated offline! Changes will sync when online.');
          
          // Navigate back after delay
          setTimeout(() => {
            navigate('/employer/jobs');
          }, 1500);
        } else {
          throw new Error('Failed to update job offline');
        }
      }

      if (!success) {
        throw new Error('Failed to update job');
      }

    } catch (err) {
      console.error('❌ Error updating job:', err);
      setError(err.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <Button 
            type="button" 
            onClick={() => navigate('/employer/jobs')}
            style={{ 
              background: '#6c757d', 
              padding: '0.5rem 1rem',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Back
          </Button>
          <Title style={{ margin: 0 }}>Edit Job</Title>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '1.2rem',
          color: '#007bff'
        }}>
          Loading job details...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <Button 
          type="button" 
          onClick={() => navigate('/employer/jobs')}
          style={{ 
            background: '#6c757d', 
            padding: '0.5rem 1rem',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back
        </Button>
        <Title style={{ margin: 0 }}>Edit Job</Title>
      </div>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <Label>Job Title</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Job Title"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Company Name</Label>
            <Input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Company Name"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Location</Label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Minimum Salary</Label>
            <Input
              type="number"
              name="salaryMin"
              value={formData.salary.min}
              onChange={handleInputChange}
              placeholder="Minimum Salary"
            />
          </FormGroup>
          <FormGroup>
            <Label>Maximum Salary</Label>
            <Input
              type="number"
              name="salaryMax"
              value={formData.salary.max}
              onChange={handleInputChange}
              placeholder="Maximum Salary"
            />
          </FormGroup>
          <FormGroup>
            <Label>Currency</Label>
            <Select
              name="currency"
              value={formData.salary.currency}
              onChange={(e) => setFormData({
                ...formData,
                salary: { ...formData.salary, currency: e.target.value }
              })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="KES">KES</option>
              <option value="RWF">RWF</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Job Type</Label>
            <Select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleInputChange}
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Application Deadline</Label>
            <Input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Application Link</Label>
            <Input
              type="url"
              name="applicationLink"
              value={formData.applicationLink}
              onChange={handleInputChange}
              placeholder="https://company.com/apply or email@company.com"
            />
          </FormGroup>
        </FormGrid>
        
        <FormGroup>
          <Label>Job Description</Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Job Description"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Requirements</Label>
          <RequirementsInput>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement}>Add</Button>
            </div>
            <div>
              {formData.requirements.map((req, index) => (
                <RequirementTag key={index}>
                  {req}
                  <RemoveButton onClick={() => removeRequirement(index)}>×</RemoveButton>
                </RequirementTag>
              ))}
            </div>
          </RequirementsInput>
        </FormGroup>

        <Button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Updating Job...' : 'Update Job'}
        </Button>
      </form>
    </Container>
  );
};

export default EditJob; 