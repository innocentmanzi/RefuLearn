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
`;

const Form = styled.form`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  @media (max-width: 600px) {
    padding: 1rem;
    max-width: 98vw;
  }
`;

const Input = styled.input`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  min-height: 80px;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  &:hover {
    background: ${({ theme, disabled }) => !disabled ? theme.colors.secondary : theme.colors.primary};
  }
`;

const BackButton = styled.button`
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  &:hover {
    background: #5a6268;
  }
`;

const SuccessMsg = styled.div`
  color: #27ae60;
  font-weight: 600;
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
`;

const ErrorMsg = styled.div`
  color: #721c24;
  font-weight: 600;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;

const EditScholarship = () => {
  const { scholarshipId } = useParams();
  const [form, setForm] = useState({
    title: '',
    description: '',
    provider: '',
    location: '',
    benefits: '',
    link: '',
    requirements: '',
    deadline: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [loadingScholarship, setLoadingScholarship] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchScholarship();
  }, [scholarshipId]);

  const fetchScholarship = async () => {
    try {
      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const scholarship = data.data.scholarship;
        setForm({
          title: scholarship.title || '',
          description: scholarship.description || '',
          provider: scholarship.provider || '',
          location: scholarship.location || '',
          benefits: scholarship.benefits || '',
          link: scholarship.link || '',
          requirements: Array.isArray(scholarship.requirements) 
            ? scholarship.requirements.join(', ') 
            : scholarship.requirements || '',
          deadline: scholarship.deadline 
            ? new Date(scholarship.deadline).toISOString().split('T')[0] 
            : '',
          isActive: scholarship.isActive
        });
      } else {
        setError(data.message || 'Failed to fetch scholarship');
      }
    } catch (err) {
      console.error('Scholarship fetch error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoadingScholarship(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...form,
          requirements: form.requirements 
            ? form.requirements.split(',').map(req => req.trim()) 
            : [],
          deadline: new Date(form.deadline).toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/employer/scholarships');
        }, 2000);
      } else {
        setError(data.message || 'Failed to update scholarship');
      }
    } catch (err) {
      console.error('Scholarship update error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingScholarship) {
    return (
      <Container>
        <LoadingSpinner>Loading scholarship...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Edit Scholarship</Title>
      
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {success && <SuccessMsg>Scholarship updated successfully!</SuccessMsg>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Scholarship Title *</Label>
          <Input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="Enter scholarship title" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Description *</Label>
          <TextArea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Describe the scholarship opportunity" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Provider *</Label>
          <Input 
            name="provider" 
            value={form.provider} 
            onChange={handleChange} 
            placeholder="Enter scholarship provider/organization" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Location *</Label>
          <Input 
            name="location" 
            value={form.location} 
            onChange={handleChange} 
            placeholder="Enter scholarship location" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Benefits *</Label>
          <TextArea 
            name="benefits" 
            value={form.benefits} 
            onChange={handleChange} 
            placeholder="List the benefits (e.g., full tuition, monthly stipend, etc.)" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Application Link *</Label>
          <Input 
            name="link" 
            type="url"
            value={form.link} 
            onChange={handleChange} 
            placeholder="Enter application link (https://...)" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Requirements</Label>
          <TextArea 
            name="requirements" 
            value={form.requirements} 
            onChange={handleChange} 
            placeholder="List requirements separated by commas (e.g., Bachelor's degree, GPA 3.0+, etc.)" 
          />
        </FormGroup>

        <FormGroup>
          <Label>Application Deadline *</Label>
          <Input 
            name="deadline" 
            type="date" 
            value={form.deadline} 
            onChange={handleChange} 
            required 
          />
        </FormGroup>

        <ButtonRow>
          <BackButton type="button" onClick={() => navigate('/employer/scholarships')}>
            Back to Scholarships
          </BackButton>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating Scholarship...' : 'Update Scholarship'}
          </Button>
        </ButtonRow>
      </Form>
    </Container>
  );
};

export default EditScholarship; 