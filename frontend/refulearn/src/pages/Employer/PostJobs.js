import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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

const PostJobs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [jobDetails, setJobDetails] = useState({
    title: '',
    location: '',
    description: '',
    requirements: [],
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    employmentType: 'Full Time',
    applicationDeadline: '',
    applicationLink: '',
    isActive: true
  });
  const [newRequirement, setNewRequirement] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salaryMin' || name === 'salaryMax') {
      setJobDetails({
        ...jobDetails,
        salary: {
          ...jobDetails.salary,
          [name.replace('salary', '').toLowerCase()]: value
        }
      });
    } else {
      setJobDetails({ ...jobDetails, [name]: value });
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !jobDetails.requirements.includes(newRequirement.trim())) {
      setJobDetails({
        ...jobDetails,
        requirements: [...jobDetails.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setJobDetails({
      ...jobDetails,
      requirements: jobDetails.requirements.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!jobDetails.title || !jobDetails.location || !jobDetails.description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        console.log('🌐 Online mode: Posting job...');
        
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            ...jobDetails,
            salary: jobDetails.salary.min && jobDetails.salary.max ? jobDetails.salary : null
          })
        });

        const data = await response.json();

        if (data.success) {
          setSuccessMessage('Job posted successfully!');
          setJobDetails({
            title: '',
            location: '',
            description: '',
            requirements: [],
            salary: {
              min: '',
              max: '',
              currency: 'USD'
            },
            employmentType: 'Full Time',
            applicationDeadline: '',
            applicationLink: '',
            isActive: true
          });
          
          setTimeout(() => {
            navigate('/employer/jobs');
          }, 2000);
        } else {
          throw new Error(data.message || 'Failed to post job');
        }
      } catch (onlineError) {
        console.warn('⚠️ Online job posting failed, queuing for offline sync:', onlineError);
        
        // Queue action for offline sync
        await offlineIntegrationService.queueEmployerJobAction({
          action: 'create',
          data: {
            ...jobDetails,
            salary: jobDetails.salary.min && jobDetails.salary.max ? jobDetails.salary : null
          }
        });
        
        setSuccessMessage('Job posting queued for sync when online');
        setTimeout(() => {
          navigate('/employer/jobs');
        }, 2000);
      }
    } else {
      // Offline mode: queue action for sync
      console.log('📴 Offline mode: Queuing job posting for sync...');
      
      await offlineIntegrationService.queueEmployerJobAction({
        action: 'create',
        data: {
          ...jobDetails,
          salary: jobDetails.salary.min && jobDetails.salary.max ? jobDetails.salary : null
        }
      });
      
      setSuccessMessage('Job posting queued for sync when online');
      setTimeout(() => {
        navigate('/employer/jobs');
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <Title>Post New Job</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <Label>{t('jobTitle')}</Label>
            <Input
              type="text"
              name="title"
              value={jobDetails.title}
              onChange={handleInputChange}
              placeholder="Job Title"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>{t('location')}</Label>
            <Input
              type="text"
              name="location"
              value={jobDetails.location}
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
              value={jobDetails.salary.min}
              onChange={handleInputChange}
              placeholder="Minimum Salary"
            />
          </FormGroup>
          <FormGroup>
            <Label>Maximum Salary</Label>
            <Input
              type="number"
              name="salaryMax"
              value={jobDetails.salary.max}
              onChange={handleInputChange}
              placeholder="Maximum Salary"
            />
          </FormGroup>
          <FormGroup>
            <Label>Currency</Label>
            <Select
              name="currency"
              value={jobDetails.salary.currency}
              onChange={(e) => setJobDetails({
                ...jobDetails,
                salary: { ...jobDetails.salary, currency: e.target.value }
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
            <Label>{t('jobType')}</Label>
            <Select
              name="employmentType"
              value={jobDetails.employmentType}
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
              value={jobDetails.applicationDeadline}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Application Link</Label>
            <Input
              type="url"
              name="applicationLink"
              value={jobDetails.applicationLink}
              onChange={handleInputChange}
              placeholder="https://company.com/apply or email@company.com"
            />
          </FormGroup>
        </FormGrid>
        
        <FormGroup>
          <Label>{t('jobDescription')}</Label>
          <TextArea
            name="description"
            value={jobDetails.description}
            onChange={handleInputChange}
            placeholder="Job Description"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>{t('requirements')}</Label>
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
              {jobDetails.requirements.map((req, index) => (
                <RequirementTag key={index}>
                  {req}
                  <RemoveButton onClick={() => removeRequirement(index)}>×</RemoveButton>
                </RequirementTag>
              ))}
            </div>
          </RequirementsInput>
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Posting Job...' : 'Post Job'}
        </Button>
      </form>
    </Container>
  );
};

export default PostJobs; 