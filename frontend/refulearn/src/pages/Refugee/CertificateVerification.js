import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import ContentWrapper from '../../components/ContentWrapper';
import { FaCheckCircle, FaTimesCircle, FaSearch, FaFileAlt } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const VerificationForm = styled.div`
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const VerifyButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ResultCard = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 2rem;
  border-left: 4px solid ${props => props.valid ? '#28a745' : '#dc3545'};
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const ValidIcon = styled(FaCheckCircle)`
  color: #28a745;
  margin-right: 0.5rem;
  font-size: 1.5rem;
`;

const InvalidIcon = styled(FaTimesCircle)`
  color: #dc3545;
  margin-right: 0.5rem;
  font-size: 1.5rem;
`;

const CertificateInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #333;
`;

const InfoValue = styled.span`
  color: #666;
`;

const CertificateVerification = () => {
  const { t } = useTranslation();
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async () => {
    if (!certificateNumber.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/certificates/verify/${certificateNumber.trim()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationResult({
          valid: true,
          certificate: data.data.certificate,
          user: data.data.user
        });
      } else {
        setVerificationResult({
          valid: false,
          message: data.message || 'Certificate not found or invalid'
        });
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentWrapper>
      <Container>
        <Header>
          <Title>🔍 Certificate Verification</Title>
          <Subtitle>Verify the authenticity of RefuLearn certificates</Subtitle>
        </Header>

        <VerificationForm>
          <InputGroup>
            <Label htmlFor="certificateNumber">
              <FaFileAlt style={{ marginRight: '0.5rem' }} />
              Certificate Number
            </Label>
            <Input
              id="certificateNumber"
              type="text"
              placeholder="Enter certificate number (e.g., CERT-1234567890-ABC123DEF)"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerification()}
            />
          </InputGroup>

          {error && (
            <div style={{ color: '#dc3545', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <VerifyButton onClick={handleVerification} disabled={loading}>
            {loading ? (
              'Verifying...'
            ) : (
              <>
                <FaSearch style={{ marginRight: '0.5rem' }} />
                Verify Certificate
              </>
            )}
          </VerifyButton>
        </VerificationForm>

        {verificationResult && (
          <ResultCard valid={verificationResult.valid}>
            <ResultHeader>
              {verificationResult.valid ? (
                <>
                  <ValidIcon />
                  Certificate Verified ✓
                </>
              ) : (
                <>
                  <InvalidIcon />
                  Certificate Invalid ✗
                </>
              )}
            </ResultHeader>

            {verificationResult.valid ? (
              <CertificateInfo>
                <InfoRow>
                  <InfoLabel>Student Name:</InfoLabel>
                  <InfoValue>{verificationResult.user.firstName} {verificationResult.user.lastName}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Course Title:</InfoLabel>
                  <InfoValue>{verificationResult.certificate.courseTitle}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Certificate Number:</InfoLabel>
                  <InfoValue>{verificationResult.certificate.certificateNumber}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Issue Date:</InfoLabel>
                  <InfoValue>{new Date(verificationResult.certificate.issuedAt).toLocaleDateString()}</InfoValue>
                </InfoRow>
                {verificationResult.certificate.grade && (
                  <InfoRow>
                    <InfoLabel>Grade:</InfoLabel>
                    <InfoValue>{verificationResult.certificate.grade}%</InfoValue>
                  </InfoRow>
                )}
                <InfoRow>
                  <InfoLabel>Status:</InfoLabel>
                  <InfoValue style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ✓ Verified and Authentic
                  </InfoValue>
                </InfoRow>
              </CertificateInfo>
            ) : (
              <div style={{ color: '#dc3545', textAlign: 'center' }}>
                <p>{verificationResult.message}</p>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                  This certificate number was not found in our database or may be invalid.
                </p>
              </div>
            )}
          </ResultCard>
        )}
      </Container>
    </ContentWrapper>
  );
};

export default CertificateVerification; 