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
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider: '',
    location: '',
    benefits: '',
    link: '',
    requirements: '',
    deadline: '',
    amount: '',
    eligibility: '',
    applicationProcess: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        
        console.log('🌐 Fetching scholarship data from API...');
        
        const response = await fetch(`/api/employer/scholarships/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const responseText = await response.text();
          console.log('📄 Raw response:', responseText);
          
          try {
            const scholarshipApiData = JSON.parse(responseText);
            console.log('🔍 Full API response:', scholarshipApiData);
            const scholarshipData = scholarshipApiData.data?.scholarship || scholarshipApiData.data || scholarshipApiData;
            console.log('✅ Scholarship data received:', scholarshipData);
            
            if (scholarshipData) {
              const mappedFormData = {
                title: scholarshipData.title || '',
                description: scholarshipData.description || '',
                provider: scholarshipData.provider || '',
                location: scholarshipData.location || '',
                benefits: scholarshipData.benefits || '',
                link: scholarshipData.link || scholarshipData.application_link || '',
                requirements: scholarshipData.requirements || '',
                deadline: (scholarshipData.deadline || scholarshipData.application_deadline || '').split('T')[0],
                amount: scholarshipData.amount || '',
                eligibility: scholarshipData.eligibility || '',
                applicationProcess: scholarshipData.applicationProcess || scholarshipData.application_process || '',
                contactEmail: scholarshipData.contactEmail || scholarshipData.contact_email || '',
                contactPhone: scholarshipData.contactPhone || scholarshipData.contact_phone || ''
              };
              console.log('📝 Setting form data:', mappedFormData);
              setFormData(mappedFormData);
            }
          } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            console.error('📄 Response was:', responseText);
            throw new Error('Invalid JSON response from server');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

      } catch (err) {
        console.error('❌ Error fetching scholarship:', err);
        setError(err.message || 'Failed to load scholarship');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchScholarship();
    }
  }, [id]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      console.log('🌐 Updating scholarship...');
      
      // Remove amount field from submission since it's not needed
      const { amount, ...submissionData } = formData;
      
      const response = await fetch(`/api/employer/scholarships/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      console.log('📡 Update response status:', response.status);

      if (response.ok) {
        const updateResponseText = await response.text();
        console.log('📄 Update response:', updateResponseText);
        
        let updateResult;
        try {
          updateResult = JSON.parse(updateResponseText);
          console.log('✅ Update result:', updateResult);
        } catch (parseError) {
          console.log('⚠️ Non-JSON response, but status OK');
          updateResult = { success: true };
        }

        console.log('✅ Scholarship update successful');
        setSuccess('Scholarship updated successfully!');
        
        // Navigate back after delay
        setTimeout(() => {
          navigate('/employer/scholarships');
        }, 1500);
      } else {
        const errorResponseText = await response.text();
        console.error('❌ Update API Error:', response.status, errorResponseText);
        throw new Error(`Failed to update scholarship: ${response.status} - ${errorResponseText}`);
      }

    } catch (err) {
      console.error('❌ Error updating scholarship:', err);
      setError(err.message || 'Failed to update scholarship');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      {success && <SuccessMsg>{success}</SuccessMsg>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Scholarship Title *</Label>
          <Input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Enter scholarship title" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Description *</Label>
          <TextArea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Describe the scholarship opportunity" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Provider *</Label>
          <Input 
            name="provider" 
            value={formData.provider} 
            onChange={handleChange} 
            placeholder="Enter scholarship provider/organization" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Location *</Label>
          <Input 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            placeholder="Enter scholarship location" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Benefits *</Label>
          <TextArea 
            name="benefits" 
            value={formData.benefits} 
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
            value={formData.link} 
            onChange={handleChange} 
            placeholder="Enter application link (https://...)" 
            required 
          />
        </FormGroup>

        <FormGroup>
          <Label>Requirements</Label>
          <TextArea 
            name="requirements" 
            value={formData.requirements} 
            onChange={handleChange} 
            placeholder="List requirements separated by commas (e.g., Bachelor's degree, GPA 3.0+, etc.)" 
          />
        </FormGroup>

        <FormGroup>
          <Label>Application Deadline *</Label>
          <Input 
            name="deadline" 
            type="date" 
            value={formData.deadline} 
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