import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
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

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    setFetching(true);
    try {
      console.log('Fetching job details for ID:', jobId);
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      console.log('Job data received:', data.data?.job);

      if (data.success && data.data && data.data.job) {
        const job = data.data.job;
        console.log('Job fields check:', {
          company: job.company,
          application_link: job.application_link,
          title: job.title,
          description: job.description
        });
        // Parse salary from salary_range if salary object doesn't exist
        let salaryData = { min: '', max: '', currency: 'USD' };
        
        if (job.salary && typeof job.salary === 'object' && job.salary.min && job.salary.max) {
          // Use existing salary object
          salaryData = {
            min: job.salary.min,
            max: job.salary.max,
            currency: job.salary.currency || 'USD'
          };
        } else if (job.salary_range) {
          // Parse from salary_range string like "$20 - $30"
          const salaryMatch = job.salary_range.match(/\$?(\d+)\s*-\s*\$?(\d+)/);
          if (salaryMatch) {
            salaryData = {
              min: salaryMatch[1],
              max: salaryMatch[2],
              currency: 'USD'
            };
          }
        }

        setJobDetails({
          title: job.title || '',
          company: job.company || '',
          location: job.location || '',
          description: job.description || '',
          requirements: job.required_skills || job.requirements || [],
          salary: salaryData,
          employmentType: job.employmentType || job.job_type || 'Full Time',
          applicationDeadline: job.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : '',
          applicationLink: job.application_link || '',
          isActive: job.is_active !== undefined ? job.is_active : true
        });
        setError(''); // Clear any previous errors
      } else {
        setError(data.message || 'Failed to fetch job details');
      }
    } catch (err) {
      console.error('Fetch job error:', err);
      setError('Network error. Please try again.');
    } finally {
      setFetching(false);
    }
  };

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

    // Ensure date is in proper format
    const deadline = jobDetails.applicationDeadline ? new Date(jobDetails.applicationDeadline).toISOString() : null;
    
    const jobToSend = {
      title: jobDetails.title.trim(),
      company: jobDetails.company.trim(),
      description: jobDetails.description.trim(),
      location: jobDetails.location.trim(),
      job_type: jobDetails.employmentType,
      required_skills: Array.isArray(jobDetails.requirements) ? jobDetails.requirements : [],
      salary_range: (jobDetails.salary.min && jobDetails.salary.max) 
        ? `$${jobDetails.salary.min.toString().trim()} - $${jobDetails.salary.max.toString().trim()}` 
        : 'Competitive',
      application_deadline: deadline,
      application_link: jobDetails.applicationLink || '',
      is_active: Boolean(jobDetails.isActive),
      remote_work: Boolean(false)
    };

    try {
      console.log('Updating job with data:', jobToSend);
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(jobToSend)
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Job updated successfully!');
        setTimeout(() => {
          navigate('/employer/jobs');
        }, 2000);
      } else {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          setError(`Validation failed: ${errorMessages}`);
        } else {
          setError(data.message || 'Failed to update job');
        }
      }
    } catch (err) {
      console.error('Job update error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <Label>Job Title</Label>
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
            <Label>Company Name</Label>
            <Input
              type="text"
              name="company"
              value={jobDetails.company}
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
            <Label>Job Type</Label>
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
          <Label>Job Description</Label>
          <TextArea
            name="description"
            value={jobDetails.description}
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
              {jobDetails.requirements.map((req, index) => (
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