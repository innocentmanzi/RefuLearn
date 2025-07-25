import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


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

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('🔄 jobDetails.requirements changed:', jobDetails.requirements);
  }, [jobDetails.requirements]);

  useEffect(() => {
    console.log('🔄 newRequirement changed:', newRequirement);
  }, [newRequirement]);

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
    try {
      console.log('🔧 Add requirement called');
      console.log('🔧 newRequirement value:', newRequirement);
      console.log('🔧 newRequirement type:', typeof newRequirement);
      
      // Simple validation
      if (!newRequirement || !newRequirement.trim()) {
        alert('Please enter a requirement!');
        return;
      }
      
      const trimmed = newRequirement.trim();
      console.log('🔧 Trimmed requirement:', trimmed);
      
      // Create new requirements array
      const currentRequirements = jobDetails.requirements || [];
      const updatedRequirements = [...currentRequirements, trimmed];
      
      console.log('🔧 Current requirements:', currentRequirements);
      console.log('🔧 Updated requirements:', updatedRequirements);
      
      // Update state
      setJobDetails(prevState => {
        const newState = {
          ...prevState,
          requirements: updatedRequirements
        };
        console.log('🔧 New state:', newState);
        return newState;
      });
      
      // Clear input
      setNewRequirement('');
      
      console.log('🔧 Requirement added successfully');
      alert(`Added requirement: "${trimmed}"`);
      
    } catch (error) {
      console.error('❌ Error in addRequirement:', error);
      alert('Error adding requirement: ' + error.message);
    }
  };

  const removeRequirement = (index) => {
    console.log('🗑️ Removing requirement at index:', index);
    setJobDetails(prev => {
      const newRequirements = prev.requirements.filter((_, i) => i !== index);
      console.log('🗑️ New requirements after removal:', newRequirements);
      return {
        ...prev,
        requirements: newRequirements
      };
    });
    console.log('✅ Requirement removed successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!jobDetails.title || !jobDetails.company || !jobDetails.location || !jobDetails.description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      console.log('🌐 Posting job...');
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          title: jobDetails.title,
          company: jobDetails.company, // Use the actual company field
          description: jobDetails.description,
          location: jobDetails.location,
          job_type: jobDetails.employmentType, // Map employmentType to job_type
          required_skills: jobDetails.requirements || [], // Map requirements to required_skills
          salary_range: jobDetails.salary.min && jobDetails.salary.max 
            ? `${jobDetails.salary.min} - ${jobDetails.salary.max} ${jobDetails.salary.currency}`
            : 'Competitive', // Map salary to salary_range
          application_deadline: jobDetails.applicationDeadline, // Map applicationDeadline to application_deadline
          application_link: jobDetails.applicationLink || '', // Map applicationLink to application_link
          is_active: false, // Backend will set this to false for pending approval
          remote_work: false // Default to false
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Job posted successfully!');
        setJobDetails({
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
        
        setTimeout(() => {
          navigate('/employer/jobs');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('❌ Job posting error:', error);
      setError('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <Label>Company</Label>
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
      </form>

      {/* Simple Requirements section */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '2px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#007bff' }}>Requirements ({jobDetails.requirements.length} added)</h3>
        
        {/* Input and Add button */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            placeholder="Add a requirement"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                console.log('⌨️ Enter key pressed');
                if (newRequirement && newRequirement.trim()) {
                  const trimmed = newRequirement.trim();
                  setJobDetails(prev => ({
                    ...prev,
                    requirements: [...(prev.requirements || []), trimmed]
                  }));
                  setNewRequirement('');
                  alert(`Added requirement: "${trimmed}"`);
                }
              }
            }}
          />
          <button 
            type="button" 
            onClick={() => {
              console.log('🔘 SIMPLE Add button clicked!');
              console.log('🔘 Current newRequirement:', newRequirement);
              
              if (newRequirement && newRequirement.trim()) {
                const trimmed = newRequirement.trim();
                console.log('🔧 Adding requirement:', trimmed);
                
                setJobDetails(prev => {
                  const newState = {
                    ...prev,
                    requirements: [...(prev.requirements || []), trimmed]
                  };
                  console.log('🔧 New state:', newState);
                  return newState;
                });
                
                setNewRequirement('');
                console.log('🔧 Requirement added successfully');
                alert(`Added requirement: "${trimmed}"`);
              } else {
                alert('Please enter a requirement!');
              }
            }}
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Add
          </button>
        </div>
        
        {/* Requirements list */}
        <div style={{ marginBottom: '1rem' }}>
          {jobDetails.requirements.length === 0 ? (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No requirements added yet. Add your first requirement above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {jobDetails.requirements.map((req, index) => (
                <span 
                  key={index}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {req}
                  <button 
                    onClick={() => {
                      console.log('🗑️ Removing requirement at index:', index);
                      setJobDetails(prev => ({
                        ...prev,
                        requirements: prev.requirements.filter((_, i) => i !== index)
                      }));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      padding: '0',
                      margin: '0'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Debug info */}
        <div style={{ padding: '0.5rem', backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '0.8rem' }}>
          <strong>Debug Info:</strong><br/>
          Current input: "{newRequirement}"<br/>
          Requirements count: {jobDetails.requirements.length}<br/>
          Requirements: [{jobDetails.requirements.join(', ')}]<br/>
          <button 
            onClick={() => {
              console.log('🔍 Current state:', { newRequirement, jobDetails });
              alert('Check console for current state');
            }}
            style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
          >
            Log State
          </button>
          <button 
            onClick={() => {
              console.log('🧪 Test button clicked!');
              alert('Test button works!');
            }}
            style={{ marginTop: '0.5rem', marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Test Click
          </button>
        </div>
      </div>

      <Button type="submit" disabled={loading} onClick={handleSubmit}>
        {loading ? 'Posting Job...' : 'Post Job'}
      </Button>
    </Container>
  );
};

export default PostJobs; 