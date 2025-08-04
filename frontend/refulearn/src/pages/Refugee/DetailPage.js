import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import offlineIntegrationService from '../../services/offlineIntegrationService';

const Container = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  background: #2563eb;
  padding: 1.5rem;
  color: white;
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  
  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const ContentSection = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: ${({ color }) => color || '#e9ecef'};
  color: ${({ $textcolor }) => $textcolor || '#333'};
  border-radius: 15px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #e9ecef;
  
  @media (max-width: 600px) {
    padding: 0.75rem;
  }
`;

const SectionTitle = styled.h3`
  color: #1f2937;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 3px;
    height: 16px;
    background: #2563eb;
    border-radius: 2px;
  }
`;

const SectionContent = styled.div`
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const SkillItem = styled.div`
  background: #2563eb;
  color: white;
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &::before {
    content: '✓';
    font-weight: bold;
    font-size: 0.7rem;
  }
`;

const ApplicationSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid #e9ecef;
  text-align: center;
  
  &::before {
    content: '';
    display: block;
    width: 60px;
    height: 2px;
    background: #2563eb;
    margin: 0 auto 1rem;
    border-radius: 1px;
  }
`;

const ApplicationTitle = styled.h3`
  color: #1f2937;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ApplicationButton = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Modal = styled.div`
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
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    display: block;
    width: 40px;
    height: 2px;
    background: #2563eb;
    margin: 0 auto 1rem;
    border-radius: 1px;
  }
`;

const ModalTitle = styled.h2`
  color: #1f2937;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: center;
`;

const Button = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1d4ed8;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4b5563;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
  font-size: 0.9rem;
`;

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { type, id } = useParams();
  
  const [data, setData] = useState(location.state);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    resumeFile: null,
    coverLetterFile: null
  });

  useEffect(() => {
    console.log('DetailPage initialized with:', {
      type,
      id,
      locationState: location.state,
      hasData: !!location.state
    });
  }, [type, id, location.state]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (location.state) {
        console.log('Using location state data:', location.state);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const isOnline = navigator.onLine;
        
        let itemData = null;

        if (isOnline) {
          try {
            // Try online API calls first (preserving existing behavior)
            console.log('🌐 Online mode: Fetching detail data from API...');
            
            let endpoint = '';
            if (type === 'job') {
              endpoint = `/api/jobs/${id}`;
            } else if (type === 'scholarship') {
              endpoint = `/api/scholarships/${id}`;
            }

            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const responseData = await response.json();
              console.log('✅ API Response:', responseData);
              
              if (type === 'job') {
                itemData = responseData.data.job || responseData.data;
                // Store job details for offline use
                await offlineIntegrationService.storeJobDetails(id, itemData);
              } else if (type === 'scholarship') {
                itemData = responseData.data.scholarship || responseData.data;
                // Store scholarship details for offline use
                await offlineIntegrationService.storeScholarshipDetails(id, itemData);
              } else {
                itemData = responseData.data;
              }
              
              console.log('✅ Processed item data:', itemData);
            } else {
              const errorText = await response.text();
              console.error('❌ API Error:', response.status, errorText);
              throw new Error(`Failed to load details: ${response.status}`);
            }
          } catch (onlineError) {
            console.warn('⚠️ Online API failed, falling back to offline data:', onlineError);
            // Fall back to offline data if online fails
            if (type === 'job') {
              itemData = await offlineIntegrationService.getJobDetails(id);
            } else if (type === 'scholarship') {
              itemData = await offlineIntegrationService.getScholarshipDetails(id);
            }
          }
        } else {
          // Offline mode: use offline services
          console.log('📴 Offline mode: Using offline detail data...');
          if (type === 'job') {
            itemData = await offlineIntegrationService.getJobDetails(id);
          } else if (type === 'scholarship') {
            itemData = await offlineIntegrationService.getScholarshipDetails(id);
          }
        }

        if (itemData) {
          setData(itemData);
        } else {
          setError('Details not available offline');
        }
      } catch (err) {
        console.error('❌ Error fetching details:', err);
        setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    if (type && id && !location.state) {
      fetchDetails();
    }
  }, [type, id, location.state]);

  const handleApply = async () => {
    if (type === 'job') {
      setShowApplicationModal(true);
      return;
    }
    
    try {
      setApplying(true);
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online application first (preserving existing behavior)
          console.log('🌐 Online mode: Submitting scholarship application...');
          
          const endpoint = `/api/scholarships/${id}/apply`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            success = true;
            console.log('✅ Online scholarship application successful');
            alert('Application submitted successfully!');
            navigate(-1);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit application');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online application failed, using offline:', onlineError);
          // Fall back to offline application
          const result = await offlineIntegrationService.submitScholarshipApplicationOffline(id, {
            applicationDate: new Date().toISOString(),
            status: 'pending'
          });
          
          if (result.success) {
            success = true;
            console.log('✅ Offline scholarship application successful');
            alert('Application submitted offline! Will sync when online.');
            navigate(-1);
          } else {
            throw new Error('Failed to submit application offline');
          }
        }
      } else {
        // Offline application
        console.log('📴 Offline mode: Submitting scholarship application offline...');
        const result = await offlineIntegrationService.submitScholarshipApplicationOffline(id, {
          applicationDate: new Date().toISOString(),
          status: 'pending'
        });
        
        if (result.success) {
          success = true;
          console.log('✅ Offline scholarship application successful');
          alert('Application submitted offline! Will sync when online.');
          navigate(-1);
        } else {
          throw new Error('Failed to submit application offline');
        }
      }

      if (!success) {
        alert('Failed to submit application');
      }
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleJobApplication = async (e) => {
    e.preventDefault();
    
    if (!applicationData.resumeFile || !applicationData.coverLetterFile) {
      alert('Please upload both resume and cover letter files');
      return;
    }

    try {
      setApplying(true);
      const token = localStorage.getItem('token');
      const isOnline = navigator.onLine;
      
      let success = false;

      if (isOnline) {
        try {
          // Try online application first (preserving existing behavior)
          console.log('🌐 Online mode: Submitting job application...');
          
          const formData = new FormData();
          formData.append('coverLetter', applicationData.coverLetterFile);
          formData.append('resume', applicationData.resumeFile);
          if (applicationData.expectedSalary) {
            formData.append('expectedSalary', applicationData.expectedSalary);
          }

          const response = await fetch(`/api/jobs/${id}/apply`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            success = true;
            console.log('✅ Online job application successful');
            alert('Job application submitted successfully!');
            setShowApplicationModal(false);
            navigate(-1);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit application');
          }
        } catch (onlineError) {
          console.warn('⚠️ Online job application failed, using offline:', onlineError);
          // Fall back to offline application
          const result = await offlineIntegrationService.submitJobApplicationOffline(id, {
            coverLetter: applicationData.coverLetter,
            expectedSalary: applicationData.expectedSalary,
            resumeFileName: applicationData.resumeFile?.name,
            coverLetterFileName: applicationData.coverLetterFile?.name,
            applicationDate: new Date().toISOString(),
            status: 'pending'
          });
          
          if (result.success) {
            success = true;
            console.log('✅ Offline job application successful');
            alert('Job application submitted offline! Will sync when online.');
            setShowApplicationModal(false);
            navigate(-1);
          } else {
            throw new Error('Failed to submit application offline');
          }
        }
      } else {
        // Offline application
        console.log('📴 Offline mode: Submitting job application offline...');
        const result = await offlineIntegrationService.submitJobApplicationOffline(id, {
          coverLetter: applicationData.coverLetter,
          expectedSalary: applicationData.expectedSalary,
          resumeFileName: applicationData.resumeFile?.name,
          coverLetterFileName: applicationData.coverLetterFile?.name,
          applicationDate: new Date().toISOString(),
          status: 'pending'
        });
        
        if (result.success) {
          success = true;
          console.log('✅ Offline job application successful');
          alert('Job application submitted offline! Will sync when online.');
          setShowApplicationModal(false);
          navigate(-1);
        } else {
          throw new Error('Failed to submit application offline');
        }
      }

      if (!success) {
        alert('Failed to submit application');
      }
    } catch (error) {
      console.error('❌ Error submitting job application:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return '';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'Expired';
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return '1 day left';
    return `${daysDiff} days left`;
  };

  const formatSalaryOrAmount = (value) => {
    if (typeof value === 'object' && value.min && value.max) {
      return `${value.currency} ${value.min} - ${value.max}`;
    }
    return value;
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <div style={{ fontSize: '1rem' }}>Loading details...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <div style={{ fontSize: '1rem' }}>No data found</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      <Title>{data.title}</Title>
          <CompanyInfo>
            {data.company && <InfoItem>🏢 {data.company}</InfoItem>}
            {data.provider && <InfoItem>🏫 {data.provider}</InfoItem>}
            {data.job_type && <InfoItem>💼 {data.job_type}</InfoItem>}
            <InfoItem>📍 {data.location}</InfoItem>
          </CompanyInfo>
        </Header>

        <ContentSection>
          <BadgeContainer>
        {(data.application_deadline || data.deadline) && (
              <Badge color="#fff3cd" $textcolor="#856404">
                ⏰ {getDaysRemaining(data.application_deadline || data.deadline)}
          </Badge>
        )}
            {(data.salary_range || data.salary) && (
              <Badge color="#d1ecf1" $textcolor="#0c5460">
                💰 {data.salary_range || formatSalaryOrAmount(data.salary)}
          </Badge>
        )}
        {data.amount && (
              <Badge color="#d1ecf1" $textcolor="#0c5460">
                💰 {formatSalaryOrAmount(data.amount)}
              </Badge>
            )}
            {data.remote_work && (
              <Badge color="#e2e3e5" $textcolor="#383d41">
                🌐 Remote Work
          </Badge>
        )}
        {(data.application_deadline || data.deadline) && (
              <Badge color="#cce5ff" $textcolor="#004085">
                📅 {new Date(data.application_deadline || data.deadline).toLocaleDateString()}
              </Badge>
        )}
          </BadgeContainer>

      <Section>
            <SectionTitle>Description</SectionTitle>
            <SectionContent>{data.description}</SectionContent>
      </Section>

          {(data.required_skills || data.requirements) && (
        <Section>
              <SectionTitle>
                {data.required_skills ? 'Required Skills' : 'Requirements'}
              </SectionTitle>
              <SkillsList>
                {Array.isArray(data.required_skills) 
                  ? data.required_skills.map((skill, index) => (
                      <SkillItem key={index}>{skill}</SkillItem>
                    ))
                  : Array.isArray(data.requirements) 
              ? data.requirements.map((req, index) => (
                      <SkillItem key={index}>{req}</SkillItem>
                ))
                  : <SectionContent>{data.required_skills || data.requirements}</SectionContent>
            }
              </SkillsList>
        </Section>
      )}

      {data.benefits && (
        <Section>
              <SectionTitle>Benefits</SectionTitle>
              <SectionContent>
            {Array.isArray(data.benefits) 
              ? data.benefits.map((benefit, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem' }}>
                    • {benefit}
                  </div>
                ))
              : data.benefits
            }
              </SectionContent>
            </Section>
          )}

          {data.offer && (
            <Section>
              <SectionTitle>What We Offer</SectionTitle>
              <SectionContent>{data.offer}</SectionContent>
        </Section>
      )}

          <ApplicationSection>
            <ApplicationTitle>Ready to apply?</ApplicationTitle>
            {(data.application_link || data.link) && 
             (data.application_link || data.link).trim() && 
             (data.application_link || data.link) !== 'https://company.com/apply or email@company.com' ? (
              <a 
                href={data.application_link || data.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <ApplicationButton>
                  Click here to apply
                </ApplicationButton>
        </a>
      ) : (
              <ApplicationButton onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Click here to apply'}
              </ApplicationButton>
            )}
          </ApplicationSection>
        </ContentSection>
      </ContentWrapper>

      {showApplicationModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Apply for {data.title}</ModalTitle>
            <form onSubmit={handleJobApplication}>
              <FormGroup>
                <Label>Cover Letter (PDF/DOC) *</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setApplicationData({
                    ...applicationData,
                    coverLetterFile: e.target.files[0]
                  })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Resume/CV (PDF/DOC) *</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setApplicationData({
                    ...applicationData,
                    resumeFile: e.target.files[0]
                  })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Expected Salary (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Enter expected salary"
                  value={applicationData.expectedSalary}
                  onChange={(e) => setApplicationData({
                    ...applicationData,
                    expectedSalary: e.target.value
                  })}
                />
              </FormGroup>
              
              <ButtonGroup>
                <Button type="submit" disabled={applying}>
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
                <CancelButton type="button" onClick={() => setShowApplicationModal(false)}>
                  Cancel
                </CancelButton>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default DetailPage; 