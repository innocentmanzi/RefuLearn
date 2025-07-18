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
        const isOnline = navigator.onLine;
        
        let scholarshipData = null;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching scholarship data from API...');
            
            const response = await fetch(`/api/employer/scholarships/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            if (response.ok) {
              const responseText = await response.text();
              console.log('📄 Raw response:', responseText);
              
              try {
                const scholarshipApiData = JSON.parse(responseText);
                console.log('🔍 Full API response:', scholarshipApiData);
                scholarshipData = scholarshipApiData.data?.scholarship || scholarshipApiData.data || scholarshipApiData;
                console.log('✅ Scholarship data received:', scholarshipData);
                
                // Store scholarship for offline use
                await offlineIntegrationService.storeScholarshipData(id, scholarshipData);
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

          } catch (onlineError) {
            console.warn('⚠️ Primary API failed, trying alternative endpoint:', onlineError);
            
            // Try alternative API endpoint
            try {
              console.log('🔄 Trying alternative API endpoint...');
              const altResponse = await fetch(`/api/scholarships/${id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                }
              });

              if (altResponse.ok) {
                const altResponseText = await altResponse.text();
                console.log('📄 Alternative API raw response:', altResponseText);
                
                try {
                  const altScholarshipApiData = JSON.parse(altResponseText);
                  console.log('🔍 Alternative API response:', altScholarshipApiData);
                  scholarshipData = altScholarshipApiData.data?.scholarship || altScholarshipApiData.data || altScholarshipApiData;
                  console.log('✅ Scholarship data from alternative API:', scholarshipData);
                  
                  // Store scholarship for offline use
                  await offlineIntegrationService.storeScholarshipData(id, scholarshipData);
                } catch (altParseError) {
                  throw new Error('Alternative API also returned invalid JSON');
                }
              } else {
                throw new Error(`Alternative API returned ${altResponse.status}`);
              }
              
            } catch (altError) {
              console.warn('⚠️ Alternative API also failed, falling back to offline data:', altError);
              
              // Fall back to offline data if both APIs fail
              scholarshipData = await offlineIntegrationService.getScholarshipData(id);
              
              if (!scholarshipData) {
                throw onlineError;
              }
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline scholarship data...');
          scholarshipData = await offlineIntegrationService.getScholarshipData(id);
        }

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
      const isOnline = navigator.onLine;
      let success = false;

      if (isOnline) {
        try {
          // Try online scholarship update first (preserving existing behavior)
          console.log('🌐 Online mode: Updating scholarship...');
          
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

            success = true;
            console.log('✅ Online scholarship update successful');
            
            setSuccess('Scholarship updated successfully!');
            
            // Store updated scholarship for offline use
            await offlineIntegrationService.storeScholarshipData(id, submissionData);
            
            // Navigate back after delay
            setTimeout(() => {
              navigate('/employer/scholarships');
            }, 1500);
          } else {
            const errorResponseText = await response.text();
            console.error('❌ Update API Error:', response.status, errorResponseText);
            throw new Error(`Failed to update scholarship: ${response.status} - ${errorResponseText}`);
          }

        } catch (onlineError) {
          console.warn('⚠️ Online update failed, using offline:', onlineError);
          
          try {
            // Fall back to offline scholarship update
            const { amount: _, ...offlineSubmissionData } = formData;
            const result = await offlineIntegrationService.updateScholarshipOffline(id, offlineSubmissionData);
            console.log('📴 Offline update result:', result);
            
            if (result && result.success) {
              success = true;
              console.log('✅ Offline scholarship update successful');
              
              setSuccess('Scholarship updated offline! Changes will sync when online.');
              
              // Navigate back after delay
              setTimeout(() => {
                navigate('/employer/scholarships');
              }, 1500);
            } else {
              throw new Error('Failed to update scholarship offline');
            }
          } catch (offlineError) {
            console.error('❌ Offline update also failed:', offlineError);
            throw new Error('Both online and offline updates failed');
          }
        }
      } else {
        // Offline scholarship update
        console.log('📴 Offline mode: Updating scholarship offline...');
        const { amount: _, ...offlineOnlySubmissionData } = formData;
        const result = await offlineIntegrationService.updateScholarshipOffline(id, offlineOnlySubmissionData);
        console.log('📴 Offline-only update result:', result);
        
        if (result && result.success) {
          success = true;
          console.log('✅ Offline scholarship update successful');
          
          setSuccess('Scholarship updated offline! Changes will sync when online.');
          
          // Navigate back after delay
          setTimeout(() => {
            navigate('/employer/scholarships');
          }, 1500);
        } else {
          throw new Error('Failed to update scholarship offline');
        }
      }

      if (!success) {
        throw new Error('Failed to update scholarship');
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